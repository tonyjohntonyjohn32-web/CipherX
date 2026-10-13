import os
import re
import uuid
import aiofiles
from pathlib import Path
from typing import Optional, Literal
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Response, status, Query
from fastapi.responses import FileResponse, StreamingResponse

from app.config import (
    UPLOAD_DIR,
    OUTPUT_DIR,
    MAX_UPLOAD_SIZE,
    ALLOWED_EXTENSIONS,
    DEVICE,
    MODEL_NAME,
)
from app.schemas.job import JobResponse, BackendHealth
from app.services.job_manager import job_manager
from app.services.separation_service import separation_engine
from app.services.export_service import convert_wav_to_mp3, create_stems_zip

router = APIRouter(prefix="/api")

@router.get("/health", response_model=BackendHealth)
async def get_health():
    """Return backend health and AI engine status."""
    return BackendHealth(
        status="ok",
        device=DEVICE,
        model_ready=separation_engine.is_ready,
        active_jobs=job_manager.get_active_jobs_count(),
        version="1.0.0",
    )

@router.post("/separations", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_separation(file: UploadFile = File(...)):
    """Accept an uploaded track, validate it, and start neural separation."""
    filename = file.filename or "track.wav"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Save uploaded file safely with unique ID
    unique_name = f"{uuid.uuid4()}{ext}"
    saved_path = UPLOAD_DIR / unique_name

    total_bytes = 0
    try:
        async with aiofiles.open(saved_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_SIZE:
                    saved_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.",
                    )
                await f.write(chunk)
    except Exception as e:
        saved_path.unlink(missing_ok=True)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}",
        )

    if total_bytes == 0:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # Create and schedule job
    job = job_manager.create_job(filename, total_bytes, saved_path)
    return job.to_response()

@router.get("/separations/{job_id}", response_model=JobResponse)
async def get_separation_job(job_id: str):
    """Get job status, progress, and separated stem metadata."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Separation job not found.",
        )
    return job.to_response()

@router.get("/separations/{job_id}/preview/{stem}")
async def preview_stem(job_id: str, stem: str, request: Request):
    """
    Stream isolated audio stem (vocals or instrumental) with HTTP Range support.
    Enables seeking and playback in HTML5 audio and WaveSurfer.
    """
    if stem not in ["vocals", "instrumental"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stem must be 'vocals' or 'instrumental'.",
        )

    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    audio_path = job.output_dir / f"{stem}.wav"
    if not audio_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Separated audio stem is not yet ready or does not exist.",
        )

    file_size = audio_path.stat().st_size
    range_header = request.headers.get("Range")

    if not range_header:
        return FileResponse(
            path=str(audio_path),
            media_type="audio/wav",
            headers={"Accept-Ranges": "bytes", "Content-Length": str(file_size)},
        )

    # Parse Range Header: bytes=start-end
    match = re.search(r"bytes=(\d+)-(\d*)", range_header)
    if not match:
        return FileResponse(path=str(audio_path), media_type="audio/wav")

    start = int(match.group(1))
    end = int(match.group(2)) if match.group(2) else file_size - 1
    end = min(end, file_size - 1)
    chunk_size = (end - start) + 1

    async def range_stream():
        async with aiofiles.open(audio_path, "rb") as f:
            await f.seek(start)
            bytes_left = chunk_size
            while bytes_left > 0:
                read_size = min(bytes_left, 64 * 1024)
                data = await f.read(read_size)
                if not data:
                    break
                bytes_left -= len(data)
                yield data

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        "Content-Type": "audio/wav",
    }

    return StreamingResponse(range_stream(), status_code=206, headers=headers)

@router.get("/separations/{job_id}/download/{stem}")
async def download_stem(
    job_id: str, 
    stem: str, 
    format: str = Query("wav", pattern="^(wav|mp3)$"),
    bitrate: str = Query("320k", pattern="^(128k|192k|320k)$")
):
    """Download lossless WAV or converted MP3 stem."""
    if stem not in ["vocals", "instrumental"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid stem name.")

    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    wav_path = job.output_dir / f"{stem}.wav"
    if not wav_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stem file not found.")

    clean_basename = Path(job.filename).stem
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', clean_basename)

    if format == "wav":
        download_filename = f"{safe_name}_{stem}.wav"
        return FileResponse(
            path=str(wav_path),
            media_type="audio/wav",
            filename=download_filename,
        )
    elif format == "mp3":
        mp3_path = job.output_dir / f"{stem}_{bitrate}.mp3"
        success = convert_wav_to_mp3(wav_path, mp3_path, bitrate=bitrate)
        if not success or not mp3_path.exists():
            # Fallback to WAV if MP3 conversion fails
            return FileResponse(
                path=str(wav_path),
                media_type="audio/wav",
                filename=f"{safe_name}_{stem}.wav",
            )

        download_filename = f"{safe_name}_{stem}_{bitrate}.mp3"
        return FileResponse(
            path=str(mp3_path),
            media_type="audio/mpeg",
            filename=download_filename,
        )

@router.get("/separations/{job_id}/download-all")
async def download_all_zip(job_id: str):
    """Download ZIP package containing vocals and instrumental stems."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    zip_path = job.output_dir / "CipherX_Stems.zip"
    if not zip_path.exists() or zip_path.stat().st_size == 0:
        vocals_path = job.output_dir / "vocals.wav"
        inst_path = job.output_dir / "instrumental.wav"
        if not vocals_path.exists() or not inst_path.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stems not yet ready.")
        create_stems_zip(vocals_path, inst_path, zip_path)

    clean_basename = Path(job.filename).stem
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', clean_basename)
    download_filename = f"{safe_name}_CipherX_Stems.zip"

    return FileResponse(
        path=str(zip_path),
        media_type="application/zip",
        filename=download_filename,
    )

@router.delete("/separations/{job_id}")
async def cancel_separation_job(job_id: str):
    """Cancel job and safely clean up associated files."""
    success = job_manager.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    return {"status": "cancelled", "job_id": job_id}
