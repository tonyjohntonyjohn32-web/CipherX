import io
import pytest
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def create_dummy_wav(duration_sec=1.0, sample_rate=44100) -> bytes:
    """Generate in-memory stereo sine wave WAV."""
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
    # 440 Hz left, 880 Hz right
    audio = np.stack([np.sin(2 * np.pi * 440 * t), np.sin(2 * np.pi * 880 * t)], axis=-1)
    buf = io.BytesIO()
    sf.write(buf, audio, sample_rate, format="WAV")
    buf.seek(0)
    return buf.read()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "device" in data
    assert "active_jobs" in data

def test_upload_invalid_extension():
    files = {"file": ("malicious.exe", b"MZDummyBinary", "application/octet-stream")}
    response = client.post("/api/separations", files=files)
    assert response.status_code == 400
    assert "Unsupported format" in response.json()["detail"]

def test_upload_empty_file():
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/api/separations", files=files)
    assert response.status_code == 400

def test_upload_valid_audio():
    wav_bytes = create_dummy_wav(duration_sec=0.5)
    files = {"file": ("test_track.wav", wav_bytes, "audio/wav")}
    response = client.post("/api/separations", files=files)
    assert response.status_code == 201
    data = response.json()
    assert "job_id" in data
    assert data["filename"] == "test_track.wav"
    assert data["status"] in ["queued", "preparing", "loading_model", "separating", "completed"]

    # Verify retrieval
    job_id = data["job_id"]
    get_res = client.get(f"/api/separations/{job_id}")
    assert get_res.status_code == 200
    assert get_res.json()["job_id"] == job_id

def test_cancel_job():
    wav_bytes = create_dummy_wav(duration_sec=0.5)
    files = {"file": ("to_cancel.wav", wav_bytes, "audio/wav")}
    res = client.post("/api/separations", files=files)
    job_id = res.json()["job_id"]

    cancel_res = client.delete(f"/api/separations/{job_id}")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"
