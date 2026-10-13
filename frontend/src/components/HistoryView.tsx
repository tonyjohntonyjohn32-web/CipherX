import React from 'react';
import { History, Trash2, Clock, AlertCircle, Loader2, Download, Play, Music } from 'lucide-react';
import type { SeparationJob } from '../types';

interface HistoryViewProps {
  jobs: SeparationJob[];
  onSelectJob: (job: SeparationJob) => void;
  onClearHistory: () => void;
  onNewSeparation: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  jobs,
  onSelectJob,
  onClearHistory,
  onNewSeparation,
}) => {
  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 my-8">
      <div className="rounded-3xl p-6 sm:p-8 bg-[#070718]/90 border border-purple-800/40 shadow-[0_0_35px_rgba(168,85,247,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-purple-900/40 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
                Separation History
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                View, replay, and download all previous AI stem separation sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {jobs.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear History</span>
              </button>
            )}

            <button
              onClick={onNewSeparation}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-orbitron font-bold uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
            >
              <Music className="w-3.5 h-3.5 text-purple-200" />
              <span>New Separation</span>
            </button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <History className="w-8 h-8" />
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-1">
              No History Found
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              You haven't separated any songs yet. Upload your first audio track to get started!
            </p>
            <button
              onClick={onNewSeparation}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <Music className="w-4 h-4 text-purple-200" />
              <span>Upload Track</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {jobs.map((job) => {
              const isCompleted = job.status === 'completed';
              const isProcessing = ['queued', 'preparing', 'loading_model', 'separating', 'finalizing'].includes(job.status);
              const isFailed = job.status === 'failed';

              return (
                <div
                  key={job.job_id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#050510] border border-purple-950/60 hover:border-purple-800/60 hover:bg-[#08081c] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
                      <Music className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="font-medium text-white text-sm sm:text-base font-mono">
                        {job.filename}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" />
                          {formatTime(job.duration)}
                        </span>
                        <span>•</span>
                        <span>{formatDate(job.created_at)}</span>
                        <span>•</span>
                        <span className={`uppercase font-semibold ${isCompleted ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-purple-400'}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    {isCompleted && (
                      <>
                        <button
                          onClick={() => onSelectJob(job)}
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-orbitron font-semibold uppercase tracking-wider text-purple-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 transition-all cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                          <span>Open Stems</span>
                        </button>

                        {job.results?.zip_url && (
                          <a
                            href={job.results.zip_url}
                            download="CipherX_Stems.zip"
                            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-orbitron font-semibold uppercase tracking-wider text-slate-200 bg-[#090919] hover:bg-[#11112b] border border-purple-900/50 transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-400" />
                            <span>ZIP</span>
                          </a>
                        )}
                      </>
                    )}

                    {isProcessing && (
                      <button
                        onClick={() => onSelectJob(job)}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-orbitron font-semibold uppercase tracking-wider text-purple-300 bg-purple-950/40 border border-purple-700/50 animate-pulse cursor-pointer"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>View Progress</span>
                      </button>
                    )}

                    {isFailed && (
                      <span className="text-xs text-rose-400 flex items-center font-mono">
                        <AlertCircle className="w-4 h-4 mr-1 text-rose-500" />
                        {job.error || 'Failed'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
