import os
import zipfile
import subprocess
from pathlib import Path
from typing import Optional

def convert_wav_to_mp3(wav_path: Path, mp3_path: Path, bitrate: str = "320k") -> bool:
    """Convert a WAV audio file to MP3 at a target bitrate."""
    if mp3_path.exists() and mp3_path.stat().st_size > 0:
        return True

    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", str(wav_path),
            "-codec:a", "libmp3lame",
            "-b:a", bitrate,
            str(mp3_path)
        ]
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
            timeout=60
        )
        return mp3_path.exists() and mp3_path.stat().st_size > 0
    except Exception as e:
        print(f"Error converting {wav_path} to MP3: {e}")
        return False

def create_stems_zip(vocals_path: Path, instrumental_path: Path, zip_output_path: Path) -> bool:
    """Create a ZIP archive containing vocals.wav and instrumental.wav."""
    if zip_output_path.exists() and zip_output_path.stat().st_size > 0:
        return True

    try:
        with zipfile.ZipFile(zip_output_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
            if vocals_path.exists():
                zip_file.write(vocals_path, arcname="vocals.wav")
            if instrumental_path.exists():
                zip_file.write(instrumental_path, arcname="instrumental.wav")
        return True
    except Exception as e:
        print(f"Error creating ZIP archive: {e}")
        return False
