import React, { useState, useEffect, useRef } from 'react';
import { CipherXIntro } from './components/CipherXIntro';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { UploadZone } from './components/UploadZone';
import { ProcessingPanel } from './components/ProcessingPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { apiService } from './services/api';
import type { BackendHealth, SeparationJob } from './types';
import { ArrowLeft, RefreshCw, AlertTriangle, Menu } from 'lucide-react';

const STORAGE_KEY = 'cipherx_jobs_history';

export const App: React.FC = () => {
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<'studio' | 'history' | 'settings'>('studio');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<BackendHealth | null>(null);

  const [jobsHistory, setJobsHistory] = useState<SeparationJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeJob, setActiveJob] = useState<SeparationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobsHistory));
    } catch (e) {
      console.error('Failed to save jobs history to localStorage', e);
    }
  }, [jobsHistory]);

  // Periodic health check
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await apiService.getHealth();
        setHealth(data);
      } catch {
        setHealth(null);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll active job while running
  useEffect(() => {
    if (!activeJob) return;

    const isRunning = [
      'queued', 
      'preparing', 
      'loading_model', 
      'separating', 
      'finalizing'
    ].includes(activeJob.status);

    if (!isRunning) return;

    const timer = setInterval(async () => {
      try {
        const updated = await apiService.getJob(activeJob.job_id);
        setActiveJob(updated);

        // Update in history list
        setJobsHistory((prev) =>
          prev.map((j) => (j.job_id === updated.job_id ? updated : j))
        );
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [activeJob?.job_id, activeJob?.status]);

  const handleStartSeparation = async (file: File) => {
    setIsSubmitting(true);
    try {
      const newJob = await apiService.startSeparation(file);
      setActiveJob(newJob);

      // Add to history if not exists
      setJobsHistory((prev) => [newJob, ...prev.filter((j) => j.job_id !== newJob.job_id)]);
      setCurrentTab('studio');
    } catch (error: any) {
      alert(`Separation failed to start: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelJob = async () => {
    if (!activeJob) return;
    setIsCancelling(true);
    try {
      await apiService.cancelJob(activeJob.job_id);
      const updatedJob = { ...activeJob, status: 'cancelled' as const, stage_message: 'Job cancelled by user' };
      setActiveJob(updatedJob);
      setJobsHistory((prev) =>
        prev.map((j) => (j.job_id === activeJob.job_id ? updatedJob : j))
      );
    } catch (err: any) {
      alert(`Failed to cancel job: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSelectJob = (job: SeparationJob) => {
    setActiveJob(job);
    setCurrentTab('studio');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your separation history?')) {
      setJobsHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#03030A] text-slate-100 flex flex-col relative selection:bg-purple-600 selection:text-white">
      {/* 2. Mandatory Fullscreen Cinematic Neon Intro */}
      {!introCompleted && (
        <CipherXIntro onComplete={() => setIntroCompleted(true)} />
      )}

      {/* Main Application (fades in smoothly with subtle upward entrance) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-700 ${
          introCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {/* Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          health={health}
          historyCount={jobsHistory.length}
        />

        {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden px-4 pt-3 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-mono text-slate-300"
          >
            <Menu className="w-4 h-4 text-purple-400" />
            <span>Studio Menu</span>
          </button>
        </div>

        {/* Sidebar Component */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          jobs={jobsHistory}
          onSelectJob={handleSelectJob}
          onClearHistory={handleClearHistory}
          activeJobId={activeJob?.job_id}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'studio' && (
            <>
              {/* If no active job or active job is completed/failed/cancelled, show Hero + Upload or Results */}
              {!activeJob && (
                <>
                  <HeroSection onUploadClick={scrollToUpload} />
                  <div ref={uploadSectionRef}>
                    <UploadZone
                      onStartSeparation={handleStartSeparation}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Active job in-progress */}
              {activeJob && ['queued', 'preparing', 'loading_model', 'separating', 'finalizing'].includes(activeJob.status) && (
                <ProcessingPanel
                  job={activeJob}
                  onCancel={handleCancelJob}
                  isCancelling={isCancelling}
                />
              )}

              {/* Active job completed: Results View */}
              {activeJob && activeJob.status === 'completed' && activeJob.results && (
                <div>
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4 flex justify-between items-center">
                    <button
                      onClick={() => setActiveJob(null)}
                      className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-mono text-purple-300 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Separate Another Track</span>
                    </button>
                  </div>
                  <ResultsPanel job={activeJob} />
                </div>
              )}

              {/* Active job failed or cancelled */}
              {activeJob && (activeJob.status === 'failed' || activeJob.status === 'cancelled') && (
                <div className="max-w-3xl mx-auto my-12 p-8 rounded-3xl bg-[#090818]/90 border border-purple-900/50 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="font-orbitron font-bold text-xl text-white mb-2">
                    {activeJob.status === 'cancelled' ? 'Separation Cancelled' : 'Separation Failed'}
                  </h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 font-mono">
                    {activeJob.error || activeJob.stage_message || 'An error occurred during source separation.'}
                  </p>
                  <button
                    onClick={() => setActiveJob(null)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-purple-200" />
                    <span>Try Another Track</span>
                  </button>
                </div>
              )}
            </>
          )}

          {currentTab === 'history' && (
            <HistoryView
              jobs={jobsHistory}
              onSelectJob={handleSelectJob}
              onClearHistory={handleClearHistory}
              onNewSeparation={() => {
                setActiveJob(null);
                setCurrentTab('studio');
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView health={health} />
          )}
        </main>

        {/* 14. FOOTER — @fzlash
            Requirements:
            - Absolute bottom of the landing page
            - Exact text: @fzlash
            - Small, clean, modern font
            - Centered horizontally
            - Muted violet or soft gray
            - Very subtle neon glow on hover
            - Final visible text element at the bottom of the webpage
            - NO additional text after @fzlash
        */}
        <footer className="w-full py-8 text-center mt-auto border-t border-purple-950/20 select-none">
          <span className="font-mono text-xs sm:text-sm text-purple-400/60 hover:text-purple-300 hover:neon-glow-violet transition-all duration-300 tracking-wider">
            @fzlash
          </span>
        </footer>
      </div>
    </div>
  );
};

export default App;
