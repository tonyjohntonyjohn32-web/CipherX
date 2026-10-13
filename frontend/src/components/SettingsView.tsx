import React from 'react';
import { Sliders, HardDrive, ShieldCheck, Server } from 'lucide-react';
import type { BackendHealth } from '../types';

interface SettingsViewProps {
  health: BackendHealth | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ health }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-8">
      <div className="rounded-3xl p-6 sm:p-8 bg-[#070718]/90 border border-purple-800/40 shadow-[0_0_35px_rgba(168,85,247,0.2)]">
        <div className="flex items-center space-x-3.5 pb-6 border-b border-purple-900/40">
          <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
              Studio Configuration
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage separation engine models, audio retention, and hardware performance.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* AI Model & Engine Info */}
          <div className="p-5 rounded-2xl bg-[#050510] border border-purple-950/60">
            <div className="flex items-center space-x-2 text-sm font-orbitron font-semibold text-purple-300 mb-3">
              <Server className="w-4 h-4 text-purple-400" />
              <span>AI Neural Separation Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <span className="text-slate-500 block mb-1">Architecture</span>
                <span className="text-slate-200 font-semibold">Demucs (htdemucs)</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <span className="text-slate-500 block mb-1">Hardware Device</span>
                <span className="text-purple-300 font-semibold uppercase">
                  {health ? (health.device === 'cuda' ? 'NVIDIA GPU (CUDA)' : 'CPU Multi-Core') : 'Detecting...'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <span className="text-slate-500 block mb-1">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                  {health?.status === 'ok' ? 'Ready & Online' : 'Connecting'}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & File Retention */}
          <div className="p-5 rounded-2xl bg-[#050510] border border-purple-950/60">
            <div className="flex items-center space-x-2 text-sm font-orbitron font-semibold text-purple-300 mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Security & Auto-Retention Policy</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Uploaded audio files and extracted stems are stored in temporary randomized sandboxes.
              Completed jobs are retained for a 2-hour window to allow preview and stem downloads,
              after which they are automatically pruned. Audio is never permanently saved or shared.
            </p>
          </div>

          {/* Audio Output Preferences */}
          <div className="p-5 rounded-2xl bg-[#050510] border border-purple-950/60">
            <div className="flex items-center space-x-2 text-sm font-orbitron font-semibold text-purple-300 mb-3">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Stem Output Formats</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <div>
                  <span className="font-semibold block text-slate-200">Default Master Export</span>
                  <span className="text-slate-500 text-[11px]">Uncompressed 32-bit floating point WAV format (Lossless)</span>
                </div>
                <span className="text-purple-400 font-mono text-xs">WAV 44.1kHz</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <div>
                  <span className="font-semibold block text-slate-200">Compressed MP3 Export</span>
                  <span className="text-slate-500 text-[11px]">CBR encoding with selectable bitrates (128 / 192 / 320 kbps)</span>
                </div>
                <span className="text-purple-400 font-mono text-xs">MP3 LAME</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
