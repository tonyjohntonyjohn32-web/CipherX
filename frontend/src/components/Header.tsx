import React from 'react';
import { Cpu, Sliders, Music2, History, Disc3 } from 'lucide-react';
import type { BackendHealth } from '../types';

interface HeaderProps {
  currentTab: 'studio' | 'history' | 'settings';
  onSelectTab: (tab: 'studio' | 'history' | 'settings') => void;
  health: BackendHealth | null;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  health,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-900/30 bg-[#03030A]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Wordmark & Logo */}
        <div 
          onClick={() => onSelectTab('studio')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-950/80 border border-purple-500/30 flex items-center justify-center overflow-hidden group-hover:border-purple-400/60 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all">
            <Disc3 className="w-5 h-5 text-purple-400 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-orbitron text-2xl font-black tracking-wider text-white">
                CIPHER<span className="text-purple-400 group-hover:neon-glow-violet transition-all">X</span>
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-orbitron font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/30 rounded">
                AI STUDIO
              </span>
            </div>
            <span className="text-[10px] text-purple-300/60 tracking-wider font-mono">
              NEURAL STEM ISOLATOR
            </span>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#090919] p-1.5 rounded-xl border border-purple-900/40">
          <button
            onClick={() => onSelectTab('studio')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'studio'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
            }`}
          >
            <Music2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'history'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-purple-900/60 text-purple-300 rounded-full border border-purple-500/30">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'settings'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Settings</span>
          </button>
        </nav>

        {/* AI Engine Real Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-[#080816] border border-purple-900/50 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              {health?.status === 'ok' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                </>
              )}
            </span>

            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 flex items-center space-x-1">
                <span>AI Engine</span>
                <span className="text-purple-400 font-mono text-[9px]">
                  {health ? (health.device === 'cuda' ? 'GPU' : 'CPU') : '...'}
                </span>
              </span>
            </div>

            <div className="hidden sm:flex items-center text-slate-500 text-[10px] font-mono border-l border-purple-900/50 pl-2">
              <Cpu className="w-3 h-3 mr-1 text-purple-400/70" />
              <span>{health?.status === 'ok' ? 'ONLINE' : 'CONNECTING'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
