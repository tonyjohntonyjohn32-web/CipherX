import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Music, 
  Mic, 
  FileDown
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  type: 'instrumental' | 'vocals';
  audioUrl: string;
  filename?: string;
  jobId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: (seekTime: number) => void;
  // External sync controls from MasterMixer
  externalPlaying?: boolean;
  externalSeekTime?: number | null;
  externalVolume?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  type,
  audioUrl,
  filename: _filename,
  jobId,
  onTimeUpdate,
  onSeek,
  externalPlaying,
  externalSeekTime,
  externalVolume,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [selectedBitrate, setSelectedBitrate] = useState<'320k' | '192k' | '128k'>('320k');
  const [isDownloadingMp3, setIsDownloadingMp3] = useState<boolean>(false);

  const isInstrumental = type === 'instrumental';
  const accentColor = isInstrumental ? '#38BDF8' : '#EC4899';
  const progressColor = isInstrumental ? '#0284C7' : '#BE185D';
  const waveColor = isInstrumental ? '#1E293B' : '#271B38';

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      cursorColor: '#A855F7',
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      height: 64,
      normalize: true,
      url: audioUrl,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsReady(true);
      setDuration(ws.getDuration());
      ws.setVolume(volume);
    });

    ws.on('audioprocess', () => {
      const time = ws.getCurrentTime();
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    ws.on('seeking', () => {
      const time = ws.getCurrentTime();
      setCurrentTime(time);
      onSeek?.(time);
    });

    ws.on('finish', () => {
      setIsPlaying(false);
    });

    return () => {
      ws.destroy();
    };
  }, [audioUrl, accentColor, waveColor]);

  // Sync external play / pause state
  useEffect(() => {
    if (externalPlaying !== undefined && wavesurferRef.current && isReady) {
      if (externalPlaying && !wavesurferRef.current.isPlaying()) {
        wavesurferRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else if (!externalPlaying && wavesurferRef.current.isPlaying()) {
        wavesurferRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [externalPlaying, isReady]);

  // Sync external seek time
  useEffect(() => {
    if (
      externalSeekTime !== undefined && 
      externalSeekTime !== null && 
      wavesurferRef.current && 
      isReady
    ) {
      const d = wavesurferRef.current.getDuration();
      if (d > 0) {
        wavesurferRef.current.setTime(externalSeekTime);
        setCurrentTime(externalSeekTime);
      }
    }
  }, [externalSeekTime, isReady]);

  // Sync external volume
  useEffect(() => {
    if (externalVolume !== undefined && wavesurferRef.current && isReady) {
      setVolume(externalVolume);
      wavesurferRef.current.setVolume(externalVolume);
    }
  }, [externalVolume, isReady]);

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    if (isPlaying) {
      wavesurferRef.current.pause();
      setIsPlaying(false);
    } else {
      wavesurferRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(val);
    }
  };

  const toggleMute = () => {
    if (!wavesurferRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      wavesurferRef.current.setVolume(volume || 0.85);
    } else {
      setIsMuted(true);
      wavesurferRef.current.setVolume(0);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDownloadMp3 = async () => {
    setIsDownloadingMp3(true);
    try {
      const url = `/api/separations/${jobId}/download/${type}?format=mp3&bitrate=${selectedBitrate}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${selectedBitrate}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setIsDownloadingMp3(false), 1000);
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
        isInstrumental
          ? 'bg-[#06091a]/90 border-cyan-800/40 hover:border-cyan-500/60 shadow-[0_0_25px_rgba(56,189,248,0.15)]'
          : 'bg-[#12071a]/90 border-pink-800/40 hover:border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.15)]'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              isInstrumental
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'bg-pink-950/60 border-pink-500/40 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
            }`}
          >
            {isInstrumental ? <Music className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-orbitron font-bold text-lg text-white">
                {isInstrumental ? 'Instrumental' : 'Isolated Vocals'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${
                  isInstrumental
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30'
                    : 'bg-pink-950/80 text-pink-300 border-pink-500/30'
                }`}
              >
                {isInstrumental ? 'Music Stem' : 'Vocal Stem'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isInstrumental
                ? 'Music without the main vocal stem.'
                : 'Vocal performance separated from the accompaniment.'}
            </p>
          </div>
        </div>
      </div>

      {/* Waveform Visualization Container */}
      <div className="my-6 p-3 rounded-2xl bg-[#04040d]/90 border border-purple-950/60">
        <div ref={containerRef} className="w-full cursor-pointer" />
      </div>

      {/* Playback Controls & Time */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <button
            onClick={togglePlay}
            disabled={!isReady}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all shadow-md cursor-pointer disabled:opacity-50 ${
              isInstrumental
                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'bg-pink-600 hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="w-10 text-slate-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2
                className={`w-4 h-4 ${isInstrumental ? 'text-cyan-400' : 'text-pink-400'}`}
              />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={`w-24 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 ${
              isInstrumental ? 'accent-cyan-400' : 'accent-pink-400'
            }`}
          />
        </div>
      </div>

      {/* Downloads Section */}
      <div className="mt-6 pt-4 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3">
        {/* Lossless WAV Download */}
        <a
          href={`/api/separations/${jobId}/download/${type}?format=wav`}
          download={`${type}.wav`}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold uppercase tracking-wider text-white transition-all shadow-md ${
            isInstrumental
              ? 'bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]'
              : 'bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download WAV (Lossless)</span>
        </a>

        {/* MP3 Export with Bitrate Selector */}
        <div className="flex items-center space-x-1.5">
          <select
            value={selectedBitrate}
            onChange={(e) => setSelectedBitrate(e.target.value as any)}
            className="px-2 py-1.5 text-xs font-mono bg-[#090919] border border-purple-900/60 rounded-lg text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="320k">320 kbps</option>
            <option value="192k">192 kbps</option>
            <option value="128k">128 kbps</option>
          </select>

          <button
            onClick={handleDownloadMp3}
            disabled={isDownloadingMp3}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-400" />
            <span>{isDownloadingMp3 ? 'Exporting...' : 'MP3'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
