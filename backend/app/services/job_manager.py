import os
import shutil
import time
import uuid
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

from app.config import (
    UPLOAD_DIR,
    OUTPUT_DIR,
    MAX_CONCURRENT_JOBS,
    RETENTION_PERIOD_SECONDS,
)
from app.schemas.job import JobResponse, SeparationResults
from app.services.audio_preprocessing import validate_audio_file, get_audio_duration
from app.services.separation_service import separation_engine
from app.services.export_service import create_stems_zip

class JobItem:
    def __init__(self, job_id: str, filename: str, filesize: int, input_path: Path):
        self.job_id = job_id
        self.filename = filename
        self.filesize = filesize
        self.input_path = input_path
        self.output_dir = OUTPUT_DIR / job_id
        self.duration: Optional[float] = None
        self.status = "queued"
        self.stage_message = "Audio received and queued for processing"
        self.progress: Optional[float] = None
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.completed_at: Optional[str] = None
        self.error: Optional[str] = None
        self.results: Optional[SeparationResults] = None
        self.cancelled = False

    def to_response(self) -> JobResponse:
        return JobResponse(
            job_id=self.job_id,
            filename=self.filename,
            filesize=self.filesize,
            duration=self.duration,
            status=self.status,
            stage_message=self.stage_message,
            progress=self.progress,
            created_at=self.created_at,
            completed_at=self.completed_at,
            error=self.error,
            results=self.results,
        )

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, JobItem] = {}
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_JOBS)

    def create_job(self, filename: str, filesize: int, file_path: Path) -> JobItem:
        job_id = str(uuid.uuid4())
        job = JobItem(job_id, filename, filesize, file_path)
        self.jobs[job_id] = job
        # Spawn async processing worker
        asyncio.create_task(self._process_job_worker(job))
        return job

    def get_job(self, job_id: str) -> Optional[JobItem]:
        return self.jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self.jobs.get(job_id)
        if not job:
            return False
        job.cancelled = True
        if job.status not in ["completed", "failed"]:
            job.status = "cancelled"
            job.stage_message = "Separation cancelled by user"
            # Cleanup output dir if partially created
            try:
                if job.output_dir.exists():
                    shutil.rmtree(job.output_dir, ignore_errors=True)
            except Exception:
                pass
        return True

    def get_active_jobs_count(self) -> int:
        return sum(
            1 for j in self.jobs.values() 
            if j.status in ["queued", "preparing", "loading_model", "separating", "finalizing"]
        )

    async def _process_job_worker(self, job: JobItem):
        async with self.semaphore:
            if job.cancelled:
                return

            try:
                # Stage 1: Preparing Audio
                job.status = "preparing"
                job.stage_message = "Validating and preparing audio file..."
                job.progress = 5.0

                # Validate audio file
                is_valid, err = validate_audio_file(job.input_path, job.filename)
                if not is_valid:
                    raise ValueError(err or "Audio validation failed")

                # Detect audio duration
                job.duration = get_audio_duration(job.input_path)

                if job.cancelled:
                    job.status = "cancelled"
                    return

                # Stage 2: Loading AI Model
                job.status = "loading_model"
                job.stage_message = "Loading Demucs neural weights into memory..."
                job.progress = 12.0

                # Stage 3: Separating Sources (run in threadpool so asyncio event loop stays non-blocking)
                job.status = "separating"
                job.stage_message = "Neural network separating vocal and music sources..."

                def on_progress(pct: float, msg: str):
                    job.progress = pct
                    job.stage_message = msg

                loop = asyncio.get_running_loop()
                vocals_path, inst_path, dur = await loop.run_in_executor(
                    None,
                    lambda: separation_engine.separate(
                        audio_path=job.input_path,
                        output_dir=job.output_dir,
                        on_progress=on_progress,
                        is_cancelled=lambda: job.cancelled,
                    )
                )

                if job.cancelled:
                    job.status = "cancelled"
                    return

                # Stage 4: Finalizing Audio
                job.status = "finalizing"
                job.stage_message = "Packaging lossless stems and archive..."
                job.progress = 95.0

                if dur > 0:
                    job.duration = dur

                # Pre-build ZIP package
                zip_path = job.output_dir / "CipherX_Stems.zip"
                create_stems_zip(vocals_path, inst_path, zip_path)

                # Stage 5: Completed
                job.status = "completed"
                job.stage_message = "Separation complete!"
                job.progress = 100.0
                job.completed_at = datetime.now(timezone.utc).isoformat()
                job.results = SeparationResults(
                    vocals_url=f"/api/separations/{job.job_id}/preview/vocals",
                    instrumental_url=f"/api/separations/{job.job_id}/preview/instrumental",
                    vocals_filename="vocals.wav",
                    instrumental_filename="instrumental.wav",
                    zip_url=f"/api/separations/{job.job_id}/download-all",
                    duration=job.duration or 0.0,
                )

            except Exception as e:
                if job.cancelled:
                    job.status = "cancelled"
                    job.stage_message = "Cancelled by user"
                else:
                    job.status = "failed"
                    job.error = str(e)
                    job.stage_message = f"Separation failed: {str(e)}"
                    print(f"[CipherX Error] Job {job.job_id} failed: {e}")

    async def cleanup_loop(self):
        """Periodic background cleanup of expired jobs beyond retention period."""
        while True:
            try:
                await asyncio.sleep(600)  # Check every 10 minutes
                now = time.time()
                for job_id, job in list(self.jobs.items()):
                    if job.status in ["completed", "failed", "cancelled"]:
                        # Check age
                        created_ts = datetime.fromisoformat(job.created_at.replace("Z", "")).timestamp()
                        if now - created_ts > RETENTION_PERIOD_SECONDS:
                            # Prune storage
                            if job.input_path.exists():
                                job.input_path.unlink(missing_ok=True)
                            if job.output_dir.exists():
                                shutil.rmtree(job.output_dir, ignore_errors=True)
                            del self.jobs[job_id]
            except Exception as ex:
                print(f"[CipherX Cleanup Error] {ex}")

job_manager = JobManager()
