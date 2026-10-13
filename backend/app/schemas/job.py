from typing import Optional, Literal
from pydantic import BaseModel

JobStatus = Literal[
    'queued',
    'preparing',
    'loading_model',
    'separating',
    'finalizing',
    'completed',
    'failed',
    'cancelled'
]

class SeparationResults(BaseModel):
    vocals_url: str
    instrumental_url: str
    vocals_filename: str
    instrumental_filename: str
    zip_url: str
    duration: float

class JobResponse(BaseModel):
    job_id: str
    filename: str
    filesize: int
    duration: Optional[float] = None
    status: JobStatus
    stage_message: str
    progress: Optional[float] = None
    created_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None
    results: Optional[SeparationResults] = None

class BackendHealth(BaseModel):
    status: str
    device: str
    model_ready: bool
    active_jobs: int
    version: str
