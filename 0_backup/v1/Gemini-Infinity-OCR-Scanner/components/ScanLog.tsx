import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Copy, Check, FileJson, AlertCircle, Loader2, Maximize2 } from 'lucide-react';

interface Props {
  entry: LogEntry;
  onClick: (entry: LogEntry) => void;
}

const ScanLog: React.FC<Props> = ({ entry, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    navigator.clipboard.writeText(entry.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (!entry.json) return;
    const blob = new Blob([JSON.stringify(entry.json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-${entry.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      onClick={() => onClick(entry)}
      className={`relative group cursor-pointer rounded-xl border ${entry.status === 'pending' ? 'border-indigo-500/30 bg-indigo-500/5 cursor-wait' : entry.status === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700 bg-slate-800 hover:bg-slate-750 hover:border-slate-600'} overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-4 active:scale-[0.99]`}
    >
      {/* Hover Indication */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 pointer-events-none">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      <div className="flex p-3 gap-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10 relative">
          <img src={entry.thumbnail} className="w-full h-full object-cover" alt="Scan thumb" />
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-slate-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex gap-1 pr-4">
                    {entry.status === 'success' && (
                        <>
                        <button onClick={handleDownloadJson} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition-colors" title="Download JSON">
                            <FileJson className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleCopy} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors" title="Copy Text">
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        </>
                    )}
                </div>
            </div>

            {entry.status === 'pending' && (
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium h-full py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting text...
                </div>
            )}

            {entry.status === 'error' && (
                <div className="flex items-start gap-2 text-red-400 text-xs mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{entry.text}</span>
                </div>
            )}

            {entry.status === 'success' && (
                <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-4 font-sans leading-relaxed group-hover:text-slate-200 transition-colors">
                    {entry.text}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScanLog;