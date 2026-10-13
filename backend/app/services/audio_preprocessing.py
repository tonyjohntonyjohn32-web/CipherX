import os
import subprocess
import soundfile as sf
from pathlib import Path
from typing import Tuple, Optional
from app.config import ALLOWED_EXTENSIONS

# Common magic headers
MAGIC_HEADERS = {
    b"RIFF": ".wav",
    b"ID3": ".mp3",
    b"\xff\xfb": ".mp3",
    b"\xff\xf3": ".mp3",
    b"\xff\xf2": ".mp3",
    b"OggS": ".ogg",
    b"fLaC": ".flac",
    b"ftyp": ".m4a",
}

def validate_audio_file(file_path: Path, original_filename: str) -> Tuple[bool, Optional[str]]:
    """Validate file extension and basic file integrity."""
    ext = Path(original_filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"

    if not file_path.exists() or file_path.stat().st_size == 0:
        return False, "File is empty or could not be found."

    # Validate header signature
    try:
        with open(file_path, "rb") as f:
            header = f.read(32)
        if len(header) < 4:
            return False, "File is corrupted or too short."
    except Exception as e:
        return False, f"Failed to inspect file header: {str(e)}"

    return True, None

def get_audio_duration(file_path: Path) -> float:
    """Extract audio duration in seconds using soundfile with ffprobe fallback."""
    try:
        info = sf.info(str(file_path))
        return float(info.duration)
    except Exception:
        # Fallback to ffprobe
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(file_path),
            ]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True,
                timeout=10,
            )
            return float(result.stdout.strip())
        except Exception:
            return 0.0
