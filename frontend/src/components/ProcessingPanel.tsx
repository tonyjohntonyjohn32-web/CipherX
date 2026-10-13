import React from 'react';
import { 
  FileAudio, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Loader2, 
  Layers
} from 'lucide-react';
import type { JobStatus, SeparationJob } from '../types';

interface ProcessingPanelProps {
  job: SeparationJob;
  onCancel: () => void;
  isCancelling: boolean;
}

const STAGES: { key: JobStatus; label: string; desc: string }[] = [
  { key: 'queued', label: 'Upload Complete', desc: 'Audio received and queued for processing' },
  { key: 'preparing', label: 'Preparing Audio', desc: 'Resampling, normalization & channel alignment' },
  { key: 'loading_model', label: 'Loading AI Model', desc: 'Initializing neural weights on processing device' },
  { key: 'separating', label: 'Separating Sources', desc: 'Neural network isolating vocal and instrumental waves' },
  { key: 'finalizing', label: 'Finalizing Audio', desc: 'Writing lossless WAV stems and encoding metadata' },
];

export const ProcessingPanel: React.FC<ProcessingPanelProps> = ({
  job,
  onCancel,
  isCancelling,
}) => {
  const getStageIndex = (status: JobStatus): number => {
    switch (status) {
      case 'queued': return 0;
      case 'preparing': return 1;
      case 'loading_model': return 2;
      case 'separating': return 3;
      case 'finalizing': return 4;
      case 'completed': return 5;
      default: return 0;
    }
  };

  const currentStageIndex = getStageIndex(job.status);

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 my-8">
      <div className="rounded-3xl p-6 sm:p-8 bg-[#08081a]/90 border border-purple-800/50 shadow-[0_0_40px_rgba(168,85,247,0.25)]">
        {/* Header: Track metadata & Status badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-purple-900/40 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <FileAudio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-white text-base sm:text-lg break-all">
                {job.filename}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Duration: {formatDuration(job.duration)}</span>
                <span>•</span>
                <span className="text-purple-300 font-semibold uppercase">{job.status}</span>
              </div>
            </div>
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/50 transition-all self-end sm:self-auto cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isCancelling ? 'Cancelling...' : 'Cancel Separation'}</span>
          </button>
        </div>

        {/* Animated Cyber Waveform */}
        <div className="my-8 text-center">
          <div className="flex items-center justify-center space-x-1 sm:space-x-1.5 h-14 max-w-sm mx-auto">
            {Array.from({ length: 24 }).map((_, i) => {
              const delays = [0.1, 0.4, 0.2, 0.7, 0.3, 0.8, 0.5, 0.9];
              const delay = delays[i % delays.length];
              return (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-fuchsia-400 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                  style={{
                    height: `${25 + (Math.sin(i * 0.8) + 1) * 35}%`,
                    animationDuration: `${0.8 + (i % 4) * 0.3}s`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="font-orbitron text-sm font-semibold text-purple-200 tracking-wide">
              {job.stage_message || 'Neural separation in progress...'}
            </span>
          </div>

          {/* Measurable progress bar if available, else animated indeterminate glow bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="w-full h-2 rounded-full bg-[#04040d] border border-purple-900/40 overflow-hidden relative">
              {typeof job.progress === 'number' && job.progress > 0 ? (
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.7)]"
                  style={{ width: `${Math.min(100, Math.max(0, job.progress))}%` }}
                />
              ) : (
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full animate-[pulse_1.5s_infinite] shadow-[0_0_15px_rgba(168,85,247,0.8)] mx-auto" />
              )}
            </div>
            {typeof job.progress === 'number' && job.progress > 0 && (
              <span className="text-[11px] font-mono text-purple-400 mt-1 block">
                {Math.round(job.progress)}%
              </span>
            )}
          </div>
        </div>

        {/* Processing Stages Stepper */}
        <div className="mt-8 pt-6 border-t border-purple-900/30">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            Pipeline Stages
          </h4>

          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div
                  key={stage.key}
                  className={`flex items-start space-x-3 p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-purple-950/40 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : isPast
                      ? 'opacity-60 bg-transparent'
                      : 'opacity-30 bg-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold tracking-wide ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-purple-400 animate-pulse">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
