import React from 'react';
import { 
  Music, 
  History, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  Sliders, 
  X, 
  Play
} from 'lucide-react';
import type { SeparationJob } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'studio' | 'history' | 'settings';
  onSelectTab: (tab: 'studio' | 'history' | 'settings') => void;
  jobs: SeparationJob[];
  onSelectJob: (job: SeparationJob) => void;
  onClearHistory: () => void;
  activeJobId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  jobs,
  onSelectJob,
  onClearHistory,
  activeJobId,
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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 bg-[#04040e]/95 border-r border-purple-900/40 p-5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-5 border-b border-purple-900/40">
          <div className="flex items-center space-x-2">
            <span className="font-orbitron font-bold text-lg text-white">
              Cipher<span className="text-purple-400">X</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
              PANEL
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Quick Links */}
        <div className="py-4 space-y-1.5 border-b border-purple-900/30">
          <button
            onClick={() => {
              onSelectTab('studio');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'studio'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
            }`}
          >
            <Music className="w-4 h-4 text-purple-400" />
            <span>Upload & Separate</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('history');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'history'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
            }`}
          >
            <div className="flex items-center space-x-3">
              <History className="w-4 h-4 text-purple-400" />
              <span>History</span>
            </div>
            {jobs.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-900/60 text-purple-300 rounded-full">
                {jobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('settings');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'settings'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* History List Section */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Recent Jobs
            </span>

            {jobs.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[10px] font-mono text-rose-400/80 hover:text-rose-300 flex items-center space-x-1 hover:underline cursor-pointer"
                title="Clear job history"
              >
                <Trash2 className="w-3 h-3 mr-0.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-[#03030a]/60 border border-purple-950/40">
              <History className="w-8 h-8 text-purple-600/40 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No separations yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Uploaded tracks and separated stems will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((j) => {
                const isActive = j.job_id === activeJobId;
                const isCompleted = j.status === 'completed';
                const isProcessing = ['queued', 'preparing', 'loading_model', 'separating', 'finalizing'].includes(j.status);
                const isFailed = j.status === 'failed';
                const isCancelled = j.status === 'cancelled';

                return (
                  <div
                    key={j.job_id}
                    onClick={() => {
                      onSelectJob(j);
                      onSelectTab('studio');
                      onClose();
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-950/50 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-[#060614]/80 border-purple-950/40 hover:border-purple-800/60 hover:bg-[#0c0c22]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs text-white truncate font-mono">
                          {j.filename}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          <span>{formatTime(j.duration)}</span>
                          <span>•</span>
                          <span>{formatDate(j.created_at)}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCompleted && (
                          <span className="inline-flex items-center text-emerald-400" title="Completed">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center text-purple-400 animate-spin" title="Processing">
                            <Loader2 className="w-4 h-4" />
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center text-rose-400" title="Failed">
                            <AlertCircle className="w-4 h-4" />
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-[9px] font-mono text-slate-500 px-1 py-0.5 rounded bg-slate-900 border border-slate-800">
                            CANC
                          </span>
                        )}
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="mt-2.5 pt-2 border-t border-purple-900/30 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-purple-400 hover:text-purple-300 flex items-center">
                          <Play className="w-2.5 h-2.5 mr-1 fill-current" />
                          Open Stems
                        </span>
                        {j.results?.zip_url && (
                          <a
                            href={j.results.zip_url}
                            download="CipherX_Stems.zip"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-white flex items-center"
                          >
                            <Download className="w-2.5 h-2.5 mr-1" />
                            ZIP
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-purple-900/30 text-[10px] text-slate-500 font-mono text-center">
          <span>CipherX Engine v1.0 • Neural Demucs</span>
        </div>
      </aside>
    </>
  );
};
