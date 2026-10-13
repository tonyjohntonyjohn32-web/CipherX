import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  RefreshCw, 
  FileAudio, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface UploadZoneProps {
  onStartSeparation: (file: File) => void;
  isSubmitting: boolean;
}

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'];
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export const UploadZone: React.FC<UploadZoneProps> = ({ onStartSeparation, isSubmitting }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up object URL when file changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported format "${ext}". Supported: MP3, WAV, FLAC, M4A, AAC, OGG`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 100 MB.`);
      return;
    }

    // Revoke previous URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setAudioUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);

    // Load duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration) && isFinite(tempAudio.duration)) {
        setAudioDuration(tempAudio.duration);
      }
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioDuration(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = volume || 0.8;
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden audio element for preview */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {!selectedFile ? (
        /* Drag and Drop Upload Panel */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-3xl p-8 sm:p-14 text-center transition-all duration-300 border-2 border-dashed ${
            dragOver
              ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_35px_rgba(168,85,247,0.35)] scale-[1.01]'
              : 'border-purple-800/40 hover:border-purple-500/70 bg-[#070716]/80 hover:bg-[#0c0c22]/90 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'
          }`}
        >
          {/* Subtle Cyber Grid in Upload Box */}
          <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none rounded-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Glowing Upload Icon Container */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-900/50 to-indigo-950/80 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.25)] group-hover:scale-105 group-hover:border-purple-400/80 transition-all">
              <Upload className="w-9 h-9 text-purple-400 group-hover:neon-glow-violet transition-all" />
            </div>

            <h3 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide mb-2">
              Drop your audio here
            </h3>
            <p className="text-sm sm:text-base text-purple-300/80 font-medium mb-4">
              or <span className="text-purple-400 underline underline-offset-4 font-semibold group-hover:text-purple-300">browse files</span> from your computer
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs text-slate-400 font-mono">
              <span>MP3 • WAV • FLAC • M4A • AAC • OGG</span>
              <span className="text-purple-500">|</span>
              <span>Max 100 MB</span>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card & Preview Audio Player */
        <div className="rounded-3xl p-6 sm:p-8 bg-[#09091c]/90 border border-purple-800/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                <FileAudio className="w-7 h-7 text-purple-400" />
              </div>

              <div>
                <h4 className="font-medium text-base sm:text-lg text-white font-mono break-all line-clamp-1">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-1">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{audioDuration > 0 ? formatTime(audioDuration) : 'Calculating...'}</span>
                </div>
              </div>
            </div>

            {/* Actions: Replace / Remove */}
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3 text-purple-400" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3 text-rose-400" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Compact Audio Preview Player */}
          <div className="mt-6 p-4 rounded-2xl bg-[#060614]/80 border border-purple-900/40 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all shrink-0 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Timeline seek bar */}
            <div className="flex-1 w-full flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>

              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />

              <span className="text-xs font-mono text-slate-400 w-10">
                {formatTime(audioDuration)}
              </span>
            </div>

            {/* Volume control */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Action Button: Separate Vocals & Music */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => onStartSeparation(selectedFile)}
              disabled={isSubmitting}
              className="group relative inline-flex items-center space-x-3 px-10 py-4 rounded-2xl font-orbitron font-bold text-base tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-purple-200 group-hover:rotate-12 transition-transform" />
              <span>Separate Vocals & Music</span>
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 opacity-30 blur group-hover:opacity-60 transition-opacity" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
