import React, { useState } from 'react';
import { OCRResult } from '../types';
import { Copy, Download, ArrowLeft, Check, FileJson, FileText } from 'lucide-react';

interface Props {
  result: OCRResult;
  onBack: () => void;
}

const ResultView: React.FC<Props> = ({ result, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.mergedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'json') => {
    const element = document.createElement("a");
    const content = format === 'json' 
      ? JSON.stringify(result.jsonOutput, null, 2) 
      : result.mergedText;
    const file = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `gemini-ocr-scan-${Date.now()}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-[clamp(0.75rem,2vw,1rem)] flex items-center justify-between shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">New Scan</span>
        </button>
        <h2 className="font-bold text-[clamp(1rem,3vw,1.25rem)] text-white">Extraction Results</h2>
        <div className="w-[clamp(4rem,10vw,5rem)]"></div> {/* Spacer for center alignment */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-[clamp(1rem,3vw,2rem)] space-y-[clamp(1rem,3vw,1.5rem)]">
        
        {/* Main Text Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="bg-slate-950/50 px-[clamp(1rem,2vw,1.5rem)] py-3 border-b border-slate-700 flex justify-between items-center">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Merged Output</span>
            <div className="flex gap-2">
               <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="p-[clamp(1rem,3vw,1.5rem)]">
            <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-300 text-[clamp(0.8rem,1.5vw,1rem)]">
              {result.mergedText}
            </pre>
          </div>
        </div>

        {/* JSON Preview (Collapsed/Smaller) */}
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Raw JSON Response</h3>
          <pre className="text-xs text-slate-600 overflow-x-auto font-mono custom-scrollbar">
            {JSON.stringify(result.jsonOutput, null, 2).substring(0, 300)}...
          </pre>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-800 p-[clamp(0.75rem,2vw,1rem)] border-t border-slate-700 grid grid-cols-2 gap-[clamp(0.5rem,2vw,1rem)] shrink-0">
        <button 
          onClick={() => handleDownload('txt')}
          className="flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-[clamp(0.75rem,1.5vh,1rem)] rounded-lg font-medium transition-colors text-sm"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden xs:inline">Download .TXT</span>
          <span className="xs:hidden">.TXT</span>
        </button>
        <button 
          onClick={() => handleDownload('json')}
          className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-[clamp(0.75rem,1.5vh,1rem)] rounded-lg font-medium transition-colors text-sm"
        >
          <FileJson className="w-4 h-4" />
          <span className="hidden xs:inline">Download .JSON</span>
          <span className="xs:hidden">.JSON</span>
        </button>
      </div>
    </div>
  );
};

export default ResultView;