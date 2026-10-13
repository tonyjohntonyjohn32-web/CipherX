import os
import sys
import glob
from pathlib import Path

# Ensure FFmpeg is available in PATH (especially for Windows WinGet installations)
def setup_ffmpeg_path():
    # If ffmpeg is already in PATH, return
    path_dirs = os.environ.get("PATH", "").split(os.pathsep)
    for p in path_dirs:
        if os.path.isfile(os.path.join(p, "ffmpeg.exe")):
            return
    
    # Check common WinGet install locations
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if local_app_data:
        winget_pattern = os.path.join(
            local_app_data, "Microsoft", "WinGet", "Packages", "*ffmpeg*", "**", "bin"
        )
        matches = glob.glob(winget_pattern, recursive=True)
        for m in matches:
            if os.path.isfile(os.path.join(m, "ffmpeg.exe")):
                os.environ["PATH"] = m + os.pathsep + os.environ.get("PATH", "")
                return

setup_ffmpeg_path()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
OUTPUT_DIR = STORAGE_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Configuration settings
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100 MB
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg"}

# Retention policy (seconds)
RETENTION_PERIOD_SECONDS = 7200  # 2 hours

# AI Separation model
MODEL_NAME = os.environ.get("CIPHERX_MODEL", "htdemucs")

# Hardware acceleration detection
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Concurrency limit (1 at a time for CPU to maintain responsiveness)
MAX_CONCURRENT_JOBS = 1 if DEVICE == "cpu" else 2
