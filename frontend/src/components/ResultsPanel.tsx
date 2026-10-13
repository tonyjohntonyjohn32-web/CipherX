import React, { useState } from 'react';
import type { SeparationJob } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { MasterMixer } from './MasterMixer';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ResultsPanelProps {
  job: SeparationJob;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ job }) => {
  const [isMasterPlaying, setIsMasterPlaying] = useState<boolean>(false);
  const [sharedCurrentTime, setSharedCurrentTime] = useState<number>(0);
  const [instVolume, setInstVolume] = useState<number>(0.85);
  const [vocalVolume, setVocalVolume] = useState<number>(0.85);
  const [externalSeek, setExternalSeek] = useState<number | null>(null);

  if (!job.results) return null;

  const handleToggleMasterPlay = () => {
    setIsMasterPlaying(!isMasterPlaying);
  };

  const handleRestartMaster = () => {
    setSharedCurrentTime(0);
    setExternalSeek(0);
    // Reset seek flag after microtask
    setTimeout(() => setExternalSeek(null), 50);
  };

  const handleSeek = (time: number) => {
    setSharedCurrentTime(time);
    setExternalSeek(time);
    setTimeout(() => setExternalSeek(null), 50);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 my-8">
      {/* Separation Success Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-purple-900/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
              Separation Complete
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Track: <span className="text-purple-300 font-semibold">{job.filename}</span>
            </p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Lossless 32-bit Float</span>
        </div>
      </div>

      {/* Master Playback Mixer */}
      <MasterMixer
        isPlaying={isMasterPlaying}
        onTogglePlay={handleToggleMasterPlay}
        onRestart={handleRestartMaster}
        currentTime={sharedCurrentTime}
        duration={job.results.duration || 0}
        onSeek={handleSeek}
        instVolume={instVolume}
        onInstVolumeChange={setInstVolume}
        vocalVolume={vocalVolume}
        onVocalVolumeChange={setVocalVolume}
        zipUrl={job.results.zip_url}
      />

      {/* Two Polished Result Cards Side-by-Side (Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A — Instrumental */}
        <AudioPlayer
          type="instrumental"
          audioUrl={job.results.instrumental_url}
          filename={job.results.instrumental_filename}
          jobId={job.job_id}
          onTimeUpdate={(t) => setSharedCurrentTime(t)}
          externalPlaying={isMasterPlaying}
          externalSeekTime={externalSeek}
          externalVolume={instVolume}
        />

        {/* Card B — Isolated Vocals */}
        <AudioPlayer
          type="vocals"
          audioUrl={job.results.vocals_url}
          filename={job.results.vocals_filename}
          jobId={job.job_id}
          onTimeUpdate={(t) => setSharedCurrentTime(t)}
          externalPlaying={isMasterPlaying}
          externalSeekTime={externalSeek}
          externalVolume={vocalVolume}
        />
      </div>
    </div>
  );
};
