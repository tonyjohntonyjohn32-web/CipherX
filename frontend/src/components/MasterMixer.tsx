import React from 'react';
import { 
  Play, 
  Pause, 
  SlidersHorizontal, 
  Archive, 
  Volume2, 
  RotateCcw
} from 'lucide-react';

interface MasterMixerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  instVolume: number;
  onInstVolumeChange: (vol: number) => void;
  vocalVolume: number;
  onVocalVolumeChange: (vol: number) => void;
  zipUrl: string;
}

export const MasterMixer: React.FC<MasterMixerProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  currentTime,
  duration,
  onSeek,
  instVolume,
  onInstVolumeChange,
  vocalVolume,
  onVocalVolumeChange,
  zipUrl,
}) => {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-[#070718]/95 border border-purple-800/40 shadow-[0_0_35px_rgba(168,85,247,0.2)] mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-purple-900/40 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-white text-base tracking-wide flex items-center space-x-2">
              <span>Master Playback Mixer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30">
                LOCKED SYNC
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized timeline across isolated vocal and instrumental stems
            </p>
          </div>
        </div>

        {/* Download All ZIP */}
        <a
          href={zipUrl}
          download="CipherX_Stems.zip"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] self-start md:self-auto"
        >
          <Archive className="w-4 h-4 text-purple-200" />
          <span>Download All (ZIP)</span>
        </a>
      </div>

      {/* Main Playback Bar & Sync Timeline */}
      <div className="my-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
            title={isPlaying ? 'Pause Both' : 'Play Both'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onRestart}
            className="w-10 h-10 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-slate-300 flex items-center justify-center border border-purple-800/40 transition-colors cursor-pointer"
            title="Restart playback"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        {/* Global Timeline */}
        <div className="flex-1 w-full flex items-center space-x-3">
          <span className="text-xs font-mono text-purple-300 w-12 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-[#04040d] rounded-lg appearance-none cursor-pointer accent-purple-500 border border-purple-900/40"
          />

          <span className="text-xs font-mono text-slate-400 w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Realtime Stem Balance Faders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-purple-900/30">
        {/* Instrumental Fader */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#060918]/80 border border-cyan-900/40">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-orbitron font-semibold text-cyan-200 uppercase">
                Instrumental Level
              </div>
              <div className="text-[10px] font-mono text-cyan-400/80">
                {Math.round(instVolume * 100)}%
              </div>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={instVolume}
            onChange={(e) => onInstVolumeChange(parseFloat(e.target.value))}
            className="w-32 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-cyan-400"
          />
        </div>

        {/* Vocals Fader */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#140618]/80 border border-pink-900/40">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-4 h-4 text-pink-400" />
            <div>
              <div className="text-xs font-orbitron font-semibold text-pink-200 uppercase">
                Vocals Level
              </div>
              <div className="text-[10px] font-mono text-pink-400/80">
                {Math.round(vocalVolume * 100)}%
              </div>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={vocalVolume}
            onChange={(e) => onVocalVolumeChange(parseFloat(e.target.value))}
            className="w-32 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-pink-400"
          />
        </div>
      </div>
    </div>
  );
};
