import React, { useState } from 'react';
import { LogEntry } from '../types';
import { X, Copy, Check, FileJson, FileText } from 'lucide-react';

interface Props {
  entry: LogEntry | null;
  onClose: () => void;
}

const LogDetailsModal: React.FC<Props> = ({ entry, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
             <div className={`w-2.5 h-2.5 rounded-full ${entry.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : entry.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
             <h2 className="text-xl font-bold text-white">Scan Details</h2>
             <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {new Date(entry.timestamp).toLocaleTimeString()}
             </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-6 h-full">
            
            {/* Left Column: Image */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
               <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video md:aspect-auto md:h-64 relative group">
                 <img src={entry.thumbnail} alt="Captured frame" className="w-full h-full object-contain" />
                 <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
               </div>
               
               <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                   <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-800 pb-2">
                       <span>Status</span>
                       <span className={`uppercase font-bold ${entry.status === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>{entry.status}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-slate-500">
                       <span>ID</span>
                       <span className="font-mono text-slate-600">{entry.id.slice(-6)}</span>
                   </div>
               </div>

               {entry.json && (
                 <button 
                    onClick={handleDownloadJson}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 hover:text-indigo-400 border border-slate-700 text-slate-300 py-3 rounded-lg text-sm font-medium transition-all"
                 >
                   <FileJson className="w-4 h-4" />
                   Download JSON
                 </button>
               )}
            </div>

            {/* Right Column: Text Content */}
            <div className="w-full md:w-2/3 flex flex-col gap-4 min-h-0">
              
              {/* Extracted Text Section */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[300px] shadow-inner">
                <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                   <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Extracted Text
                   </span>
                   <button 
                      onClick={handleCopy}
                      className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                   >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy Text"}
                   </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                   <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-sm">
                      {entry.text}
                   </pre>
                </div>
              </div>

              {/* JSON Snippet (if exists) */}
              {entry.json && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shrink-0">
                   <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <FileJson className="w-3.5 h-3.5" /> Raw JSON Preview
                      </span>
                   </div>
                   <pre className="p-4 text-[10px] font-mono text-slate-500 overflow-x-auto custom-scrollbar max-h-32">
                      {JSON.stringify(entry.json, null, 2)}
                   </pre>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;