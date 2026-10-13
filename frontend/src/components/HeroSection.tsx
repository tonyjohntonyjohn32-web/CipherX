import React from 'react';
import { Upload, Sparkles, AudioWaveform } from 'lucide-react';

interface HeroSectionProps {
  onUploadClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onUploadClick }) => {
  return (
    <div className="relative pt-8 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-purple-700/10 blur-[110px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-cyan-600/10 blur-[90px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-pink-600/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Cyberpunk Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-mono tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span>Deep Neural Source Separation</span>
      </div>

      {/* Headline */}
      <h1 className="font-orbitron text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
        Separate the Sound.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300 neon-glow-violet">
          Keep the Soul.
        </span>
      </h1>

      {/* Supporting text */}
      <p className="mt-5 text-base sm:text-lg text-slate-300/80 max-w-2xl mx-auto font-normal leading-relaxed">
        Upload your track. Let AI isolate the vocals and instrumental.
      </p>

      {/* Animated Futuristic Waveform Visualizer (CSS / SVG) */}
      <div className="my-8 flex items-center justify-center space-x-1 sm:space-x-1.5 h-16 max-w-lg mx-auto px-4 py-2 rounded-2xl bg-[#070716]/60 border border-purple-900/30">
        {[
          { color: 'bg-cyan-400', height: 'h-4', delay: '0.1s' },
          { color: 'bg-cyan-400', height: 'h-8', delay: '0.4s' },
          { color: 'bg-sky-400', height: 'h-6', delay: '0.2s' },
          { color: 'bg-purple-400', height: 'h-11', delay: '0.6s' },
          { color: 'bg-purple-400', height: 'h-14', delay: '0.3s' },
          { color: 'bg-purple-500', height: 'h-10', delay: '0.8s' },
          { color: 'bg-fuchsia-400', height: 'h-12', delay: '0.5s' },
          { color: 'bg-fuchsia-400', height: 'h-7', delay: '0.2s' },
          { color: 'bg-pink-400', height: 'h-13', delay: '0.7s' },
          { color: 'bg-pink-400', height: 'h-9', delay: '0.3s' },
          { color: 'bg-purple-400', height: 'h-11', delay: '0.9s' },
          { color: 'bg-indigo-400', height: 'h-8', delay: '0.4s' },
          { color: 'bg-sky-400', height: 'h-5', delay: '0.1s' },
        ].map((bar, i) => (
          <div
            key={i}
            className={`w-1.5 sm:w-2 rounded-full ${bar.color} opacity-80 shadow-[0_0_8px_currentColor] animate-pulse`}
            style={{
              height: bar.height === 'h-14' ? '3.5rem' : bar.height === 'h-12' ? '3rem' : bar.height === 'h-10' ? '2.5rem' : bar.height === 'h-8' ? '2rem' : '1.2rem',
              animationDuration: `${1.2 + (i % 5) * 0.25}s`,
              animationDelay: bar.delay,
            }}
          />
        ))}
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onUploadClick}
          className="group relative inline-flex items-center space-x-3 px-8 py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] cursor-pointer"
        >
          <Upload className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
          <span>Upload Your Song</span>
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur group-hover:opacity-40 transition-opacity" />
        </button>
      </div>

      {/* Supported Formats & Processing Disclaimer */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400 font-mono">
        <span className="flex items-center">
          <AudioWaveform className="w-3.5 h-3.5 mr-1 text-purple-400" />
          MP3, WAV, FLAC, M4A, AAC, OGG (Max 100MB)
        </span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="text-slate-400/80">
          Neural model processes in ~1–3 min
        </span>
      </div>
    </div>
  );
};
