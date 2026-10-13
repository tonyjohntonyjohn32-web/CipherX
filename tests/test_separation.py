import sys
import shutil
import tempfile
import numpy as np
import soundfile as sf
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.separation_service import separation_engine
from app.services.export_service import create_stems_zip, convert_wav_to_mp3

def test_demucs_neural_separation_and_export():
    """Verify genuine AI source separation and export pipeline."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        input_audio_path = tmp_path / "synthetic_song.wav"
        output_dir = tmp_path / "separated_output"

        # Create a 1.5-second test audio containing harmonic frequencies
        sr = 44100
        duration = 1.5
        t = np.linspace(0, duration, int(sr * duration), endpoint=False)
        # Mix of "vocals" frequency (1000 Hz) and "instruments" frequency (220 Hz)
        audio = 0.5 * np.sin(2 * np.pi * 220 * t) + 0.5 * np.sin(2 * np.pi * 1000 * t)
        stereo_audio = np.stack([audio, audio], axis=-1)
        sf.write(input_audio_path, stereo_audio, sr, format="WAV")

        # Track progress events
        progress_events = []
        def on_progress(pct, msg):
            progress_events.append((pct, msg))

        # Run real neural separation
        vocals_path, inst_path, detected_dur = separation_engine.separate(
            audio_path=input_audio_path,
            output_dir=output_dir,
            on_progress=on_progress,
        )

        # Assert output stems exist and are non-empty
        assert vocals_path.exists(), "vocals.wav was not generated"
        assert inst_path.exists(), "instrumental.wav was not generated"
        assert vocals_path.stat().st_size > 1000, "vocals.wav is empty"
        assert inst_path.stat().st_size > 1000, "instrumental.wav is empty"
        assert detected_dur > 1.0, f"Detected duration unexpected: {detected_dur}"
        assert len(progress_events) > 0, "No progress callbacks fired"

        # Verify ZIP export
        zip_path = output_dir / "test_stems.zip"
        zip_ok = create_stems_zip(vocals_path, inst_path, zip_path)
        assert zip_ok is True
        assert zip_path.exists() and zip_path.stat().st_size > 2000

        # Verify MP3 conversion
        mp3_path = output_dir / "vocals_320k.mp3"
        mp3_ok = convert_wav_to_mp3(vocals_path, mp3_path, bitrate="320k")
        assert mp3_ok is True
        assert mp3_path.exists() and mp3_path.stat().st_size > 500
