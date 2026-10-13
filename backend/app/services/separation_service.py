import os
import threading
import torch
import soundfile as sf
from pathlib import Path
from typing import Tuple, Callable, Optional, Dict
from app.config import MODEL_NAME, DEVICE

class SeparationService:
    def __init__(self):
        self._separator = None
        self._lock = threading.Lock()
        self.device = DEVICE
        self.model_name = MODEL_NAME
        self.is_ready = False

    def get_separator(self, progress_callback: Optional[Callable[[Dict], None]] = None):
        """Lazy load and cache the Demucs Separator singleton."""
        import demucs.api

        with self._lock:
            if self._separator is None:
                print(f"[CipherX AI Engine] Initializing Demucs Separator on {self.device.upper()}...")
                self._separator = demucs.api.Separator(
                    model=self.model_name,
                    device=self.device,
                    shifts=1,
                    overlap=0.25,
                    split=True,
                )
                self.is_ready = True
                print(f"[CipherX AI Engine] Pretrained model loaded successfully! Samplerate: {self._separator.samplerate}Hz")
            
            # Attach current job callback if provided
            if progress_callback:
                self._separator._callback = progress_callback
            else:
                self._separator._callback = None

            return self._separator

    def separate(
        self,
        audio_path: Path,
        output_dir: Path,
        on_progress: Optional[Callable[[float, str], None]] = None,
        is_cancelled: Optional[Callable[[], bool]] = None
    ) -> Tuple[Path, Path, float]:
        """
        Execute genuine Demucs neural source separation.
        Returns: (vocals_path, instrumental_path, duration_seconds)
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        vocals_path = output_dir / "vocals.wav"
        instrumental_path = output_dir / "instrumental.wav"

        if is_cancelled and is_cancelled():
            raise RuntimeError("Separation cancelled by user before starting.")

        if on_progress:
            on_progress(5.0, "Loading AI neural weights into memory...")

        def demucs_callback(progress_dict: Dict):
            if is_cancelled and is_cancelled():
                raise RuntimeError("Separation cancelled by user.")
            if on_progress and isinstance(progress_dict, dict):
                # Demucs callback contains step and total or progress
                step = progress_dict.get("step", 0)
                total = progress_dict.get("total", 100)
                if total > 0:
                    pct = 15.0 + (float(step) / float(total)) * 75.0
                    on_progress(min(90.0, pct), f"Neural network separating stems ({int(pct)}%)...")

        separator = self.get_separator(progress_callback=demucs_callback)

        if is_cancelled and is_cancelled():
            raise RuntimeError("Separation cancelled by user.")

        if on_progress:
            on_progress(15.0, "Separating vocal and music sources...")

        # Run actual neural source separation
        origin, separated = separator.separate_audio_file(audio_path)

        if is_cancelled and is_cancelled():
            raise RuntimeError("Separation cancelled by user.")

        if on_progress:
            on_progress(90.0, "Finalizing lossless audio stems...")

        # Extract vocal stem
        if "vocals" not in separated:
            raise RuntimeError("Vocal stem could not be identified by the neural model.")

        vocals_tensor = separated["vocals"]

        # Genuine neural instrumental: sum all accompaniment stems (drums + bass + other)
        # Never fake separation
        other_stems = [tensor for stem_name, tensor in separated.items() if stem_name != "vocals"]
        if not other_stems:
            raise RuntimeError("Accompaniment stems could not be extracted.")
        
        instrumental_tensor = torch.sum(torch.stack(other_stems), dim=0)

        # Save output WAV files
        import demucs.api
        demucs.api.save_audio(
            vocals_tensor, 
            vocals_path, 
            samplerate=separator.samplerate,
            bits_per_sample=16
        )
        demucs.api.save_audio(
            instrumental_tensor, 
            instrumental_path, 
            samplerate=separator.samplerate,
            bits_per_sample=16
        )

        # Calculate exact duration from output
        duration = 0.0
        try:
            info = sf.info(str(vocals_path))
            duration = float(info.duration)
        except Exception:
            pass

        if on_progress:
            on_progress(100.0, "Separation complete!")

        return vocals_path, instrumental_path, duration

# Singleton instance
separation_engine = SeparationService()
