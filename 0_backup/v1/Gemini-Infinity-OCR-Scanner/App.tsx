import React, { useState, useEffect } from 'react';
import { Scan, Settings as SettingsIcon } from 'lucide-react';
import { AppState, AppConfig } from './types';
import { DEFAULT_MODEL, DEFAULT_MAX_FRAMES, DEFAULT_CAPTURE_INTERVAL_MS, DEFAULT_SYSTEM_PROMPT } from './constants';
import SettingsModal from './components/SettingsModal';
import ScanningView from './components/ScanningView';

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [config, setConfig] = useState<AppConfig>({
    apiKey: localStorage.getItem('gemini_api_key') || '',
    model: localStorage.getItem('gemini_model') || DEFAULT_MODEL,
    maxFrames: parseInt(localStorage.getItem('gemini_max_frames') || String(DEFAULT_MAX_FRAMES), 10),
    captureInterval: parseInt(localStorage.getItem('gemini_capture_interval') || String(DEFAULT_CAPTURE_INTERVAL_MS), 10),
    systemPrompt: localStorage.getItem('gemini_system_prompt') || DEFAULT_SYSTEM_PROMPT,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check Config on Mount
  useEffect(() => {
    if (!config.apiKey) {
      setIsSettingsOpen(true);
    }
  }, [config.apiKey]);

  // Handlers
  const handleSaveSettings = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('gemini_api_key', newConfig.apiKey);
    localStorage.setItem('gemini_model', newConfig.model);
    localStorage.setItem('gemini_max_frames', String(newConfig.maxFrames));
    localStorage.setItem('gemini_capture_interval', String(newConfig.captureInterval));
    localStorage.setItem('gemini_system_prompt', newConfig.systemPrompt);
  };

  const handleStartScan = () => {
    if (!config.apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setAppState(AppState.ACTIVE);
  };

  const handleStopScan = () => {
    setAppState(AppState.STOPPED);
  };

  const handleResumeScan = () => {
    setAppState(AppState.ACTIVE);
  };

  const handleBackToHome = () => {
    setAppState(AppState.IDLE);
  };

  // Render Logic
  const renderContent = () => {
    switch (appState) {
      case AppState.ACTIVE:
      case AppState.STOPPED:
        return (
          <ScanningView 
            apiKey={config.apiKey}
            model={config.model}
            maxFrames={config.maxFrames}
            captureInterval={config.captureInterval}
            systemPrompt={config.systemPrompt}
            onStop={handleStopScan}
            onResume={handleResumeScan}
            onHome={handleBackToHome}
            active={appState === AppState.ACTIVE}
          />
        );

      case AppState.IDLE:
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-[clamp(1.5rem,5vw,3rem)] space-y-[clamp(2rem,6vh,4rem)]">
            <div className="space-y-[clamp(1rem,2vh,1.5rem)]">
              <div className="inline-flex items-center justify-center w-[clamp(4rem,10vw,5rem)] h-[clamp(4rem,10vw,5rem)] rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-[clamp(0.5rem,1vh,1rem)]">
                <Scan className="w-[clamp(2rem,5vw,2.5rem)] h-[clamp(2rem,5vw,2.5rem)] text-indigo-400" />
              </div>
              <h1 className="text-[clamp(2rem,6vw,3.75rem)] font-bold text-white tracking-tight leading-tight">
                Gemini <span className="text-indigo-400">Infinity</span> Scanner
              </h1>
              <p className="text-[clamp(0.9rem,2vw,1.125rem)] text-slate-400 max-w-[clamp(20rem,80vw,32rem)] mx-auto leading-relaxed">
                Continuous agentic OCR. Auto-captures sharpest frames, extracts text, and loops indefinitely.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[clamp(280px,80vw,360px)]">
              <button
                onClick={handleStartScan}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-[clamp(0.875rem,2vh,1.125rem)] rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-[clamp(0.95rem,2vw,1.1rem)]"
              >
                <Scan className="w-[clamp(1.1rem,2.5vw,1.35rem)] h-[clamp(1.1rem,2.5vw,1.35rem)]" />
                Start Infinity Scan
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-[clamp(0.75rem,2vh,1rem)] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-[clamp(0.9rem,2vw,1rem)]"
              >
                <SettingsIcon className="w-[clamp(1rem,2.5vw,1.1rem)] h-[clamp(1rem,2.5vw,1.1rem)]" />
                Configure Agent
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-950 h-[100dvh] w-full flex flex-col overflow-hidden">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config}
        onSave={handleSaveSettings}
      />
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {renderContent()}
      </main>
      {appState === AppState.IDLE && (
        <footer className="py-4 text-center text-slate-600 text-[clamp(0.65rem,1.5vw,0.75rem)] fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-sm">
          Powered by Google Gemini 2.5 • Client-side Infinity Loop
        </footer>
      )}
    </div>
  );
};

export default App;