import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { AVAILABLE_MODELS, PROMPT_PRESETS } from '../constants';
import { Settings, Key, Cpu, X, Check, Layers, Timer, Terminal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, config, onSave }) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [maxFrames, setMaxFrames] = useState(config.maxFrames);
  const [captureInterval, setCaptureInterval] = useState(config.captureInterval || 500);
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKey(config.apiKey);
    setModel(config.model);
    setMaxFrames(config.maxFrames);
    setCaptureInterval(config.captureInterval || 500);
    setSystemPrompt(config.systemPrompt);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate max frames
    let frames = Math.floor(maxFrames);
    if (frames < 1) frames = 1;
    if (frames > 20) frames = 20;
    
    onSave({ apiKey, model, maxFrames: frames, captureInterval, systemPrompt });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full w-[clamp(300px,90vw,480px)] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Agent Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-[clamp(1rem,3vw,1.5rem)] space-y-[clamp(1rem,2vh,1.5rem)] overflow-y-auto custom-scrollbar">
          
          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Key className="w-4 h-4" /> Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-xs text-slate-500 hover:text-indigo-400"
              >
                {showKey ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Model Selection
            </label>
            <div className="relative">
              <input
                list="model-options"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Select or type model..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
              <datalist id="model-options">
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Prompt Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Agent System Prompt
            </label>
            <div className="relative">
              <input
                list="prompt-presets"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Select a preset or type your custom instruction..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
              <datalist id="prompt-presets">
                {PROMPT_PRESETS.map((p, i) => (
                    <option key={i} value={p.value}>{p.label}</option>
                ))}
              </datalist>
            </div>
            <p className="text-[10px] text-slate-500">
                Choose a preset for Code, Text-Only, or JSON, or write your own instructions.
            </p>
          </div>

          {/* Other Configs */}
          <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Batch Size (Frames)
                </label>
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxFrames}
                    onChange={(e) => setMaxFrames(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Capture Speed
                    </div>
                    <span className="text-indigo-400 font-mono text-xs">{(captureInterval / 1000).toFixed(1)}s</span>
                </label>
                <div className="relative pt-2">
                    <input 
                        type="range" 
                        min="100" 
                        max="2000" 
                        step="100" 
                        value={captureInterval} 
                        onChange={(e) => setCaptureInterval(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={handleSave}
            disabled={!apiKey}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-all transform active:scale-95 text-sm"
          >
            <Check className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;