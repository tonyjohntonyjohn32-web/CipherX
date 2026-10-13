# CipherX — Next-Generation AI Music Separation Studio

![CipherX](frontend/public/favicon.svg)

**CipherX** is a complete, production-grade, AI-powered music separation web application. It uses pretrained deep neural source-separation models (**Demucs**) to decompose mixed audio tracks into two independent, studio-quality audio stems:

1. **Instrumental** — The full musical accompaniment with vocals completely removed.
2. **Isolated Vocals** — The isolated vocal performance stripped of all musical accompaniment.

Built with a futuristic, cyberpunk-inspired dark aesthetic featuring electric violet, neon purple, and deep indigo accents, CipherX provides real-time neural inference, interactive waveforms, synchronized master playback mixing, lossless WAV downloads, MP3 exports, and multi-track ZIP packages.

---

## Key Features

- **Cinematic Neon Intro**: Fullscreen 2.2-second centered neon-violet intro animation on launch/refresh, transitioning smoothly into the workspace. Respects `prefers-reduced-motion`.
- **True AI Neural Engine**: Employs Demucs (`htdemucs` hybrid transformer architecture) for genuine source separation. Never uses frequency filters or volume hacks.
- **Independent Waveform Players**: Powered by WaveSurfer.js with real-time audio visualization, scrub/seek, volume faders, and format selection.
- **Master Playback Mixer**: Synchronized play/pause, dual stem balance faders, and locked timeline navigation across both stems.
- **Export Formats**:
  - Uncompressed 32-bit float Lossless WAV stems.
  - High-efficiency MP3 exports with selectable bitrates (128 kbps, 192 kbps, 320 kbps).
  - One-click ZIP package containing both stems.
- **Real-Time Job Pipeline**: Polled status tracking across 5 pipeline stages: `Upload Complete` &rarr; `Preparing Audio` &rarr; `Loading AI Model` &rarr; `Separating Sources` &rarr; `Finalizing Audio`.
- **Privacy & Auto-Retention**: Sandboxed temporary storage with automatic 2-hour pruning.
- **No Instructional Clutter**: Streamlined workflow with zero "How It Works" filler cards or steps.
- **Footer Signature**: Clean `@fzlash` signature at the absolute bottom of the landing page.

---

## Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite 8
  - Tailwind CSS v4
  - WaveSurfer.js 8
  - Lucide React Icons
- **Backend**:
  - Python 3.12
  - FastAPI + Uvicorn
  - PyTorch (CPU fallback with automatic CUDA GPU acceleration)
  - Demucs 4.1 (`htdemucs`)
  - SoundFile & FFmpeg
- **Testing**:
  - Pytest + HTTPX

---

## Project Structure

```
CipherX/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CipherXIntro.tsx      # Cinematic neon intro animation
│   │   │   ├── Header.tsx            # Navigation and live AI engine status
│   │   │   ├── HeroSection.tsx       # Animated waveform visualizer & headline
│   │   │   ├── UploadZone.tsx        # Drag & drop audio workspace & preview player
│   │   │   ├── ProcessingPanel.tsx   # Realtime progress stepper & waveform
│   │   │   ├── AudioPlayer.tsx       # Individual stem player with WaveSurfer
│   │   │   ├── MasterMixer.tsx       # Synchronized dual-stem balance mixer
│   │   │   ├── ResultsPanel.tsx      # Side-by-side stem dashboard
│   │   │   ├── HistoryView.tsx       # Past separation sessions & re-download
│   │   │   ├── SettingsView.tsx      # Studio & hardware engine settings
│   │   │   └── Sidebar.tsx           # Collapsible mobile drawer & quick history
│   │   ├── services/
│   │   │   └── api.ts                # REST API client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript models
│   │   ├── App.tsx                   # Main application state and @fzlash footer
│   │   ├── index.css                 # Cyberpunk neon styles & glassmorphism
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entrypoint & static mounting
│   │   ├── config.py                 # Paths, hardware detection, FFmpeg setup
│   │   ├── api/
│   │   │   └── routes.py             # REST endpoints (separations, previews, downloads)
│   │   ├── schemas/
│   │   │   └── job.py                # Pydantic schemas
│   │   ├── services/
│   │   │   ├── audio_preprocessing.py # Validation, headers, durations
│   │   │   ├── separation_service.py # Demucs neural separation engine
│   │   │   ├── job_manager.py        # Async task queue & auto-retention
│   │   │   └── export_service.py     # MP3 conversion & ZIP archive bundling
│   ├── storage/
│   │   ├── uploads/                  # Temporary uploaded tracks
│   │   └── outputs/                  # Separated vocal & instrumental stems
│   ├── requirements.txt
│   └── .env.example
├── tests/
│   ├── test_api.py                   # API routes and upload validation tests
│   └── test_separation.py            # Neural Demucs separation & export tests
├── README.md
└── .gitignore
```

---

## Windows 10/11 Setup Guide

### 1. Prerequisites
- **Python 3.12** (installed via python.org or Microsoft Store)
- **Node.js 18+** (Node v20 or v24 recommended)
- **FFmpeg** (installed via winget or added to system PATH)

To install FFmpeg via Windows Package Manager:
```powershell
winget install Gyan.FFmpeg
```

---

### 2. Backend Installation

Open PowerShell in the `CipherX/backend` directory:

```powershell
cd backend

# Create Python virtual environment using Python 3.12
py -3.12 -m venv .venv

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Install PyTorch CPU wheels (fast and lightweight)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies (FastAPI, Demucs, SoundFile, etc.)
pip install -r requirements.txt
```

*(Optional GPU Acceleration)*: If you have an NVIDIA RTX/GTX GPU with CUDA:
```powershell
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

### 3. Frontend Installation

Open another terminal in `CipherX/frontend`:

```powershell
cd frontend
npm install
```

---

### 4. Running the Application

#### Option A: Unified Full-Stack Server (Recommended)
Build the frontend once and let FastAPI serve everything on port 8000:

1. Build frontend:
   ```powershell
   cd frontend
   npm run build
   ```
2. Start backend:
   ```powershell
   cd backend
   .\.venv\Scripts\Activate.ps1
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
3. Open your browser:
   **http://localhost:8000**

#### Option B: Development Mode (Hot-Reload)
Run backend and frontend independently:

1. Start backend:
   ```powershell
   cd backend
   .\.venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --port 8000
   ```
2. Start frontend dev server:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Open your browser:
   **http://localhost:3000**

---

## Running the Automated Test Suite

Verify all API endpoints and neural separation functionality:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest ..\tests -v
```

All 6 automated tests verify:
- Backend health and GPU/CPU detection
- File extension and size security validation
- Empty upload error handling
- Job queuing and status polling
- User cancellation handling
- Real Demucs neural network stem separation (`vocals.wav` and `instrumental.wav`)
- Lossless ZIP bundle generation
- High-bitrate MP3 conversion via FFmpeg

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and AI device readiness status |
| `POST` | `/api/separations` | Upload song (`multipart/form-data`) and start separation |
| `GET` | `/api/separations/{job_id}` | Check job progress, stage, and stem metadata |
| `GET` | `/api/separations/{job_id}/preview/{stem}` | Stream `vocals` or `instrumental` stem with HTTP 206 Range seeking |
| `GET` | `/api/separations/{job_id}/download/{stem}` | Download stem as WAV or MP3 (`?format=wav\|mp3&bitrate=320k`) |
| `GET` | `/api/separations/{job_id}/download-all` | Download complete ZIP bundle with both stems |
| `DELETE` | `/api/separations/{job_id}` | Cancel job and clean up files |

---

## Security & Storage Policy

- All incoming audio files are strictly validated against supported extensions and binary signatures.
- Files are saved with cryptographically random UUIDs to eliminate path traversal vulnerabilities.
- User files are retained only in temporary sandboxes for 2 hours to allow playback and export, after which a background routine automatically purges them.
- User audio content is never permanently stored, logged, or distributed.

---

## Author Signature

`@fzlash`
