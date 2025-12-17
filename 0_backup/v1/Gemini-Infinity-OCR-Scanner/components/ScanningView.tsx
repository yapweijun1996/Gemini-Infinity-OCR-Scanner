import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, StopCircle, Zap, Activity, Play, Home } from 'lucide-react';
import { ScannedFrame, LogEntry } from '../types';
import { calculateSharpness, resizeImage } from '../services/imageProcessing';
import { performOCR } from '../services/geminiService';
import { SHARPNESS_THRESHOLD } from '../constants';
import ScanLog from './ScanLog';
import LogDetailsModal from './LogDetailsModal';

interface Props {
  apiKey: string;
  model: string;
  maxFrames: number;
  captureInterval: number;
  systemPrompt: string; // Added prop
  onStop: () => void;
  onResume: () => void;
  onHome: () => void;
  active: boolean;
}

const ScanningView: React.FC<Props> = ({ apiKey, model, maxFrames, captureInterval, systemPrompt, onStop, onResume, onHome, active }) => {
  // Refs & State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [frames, setFrames] = useState<ScannedFrame[]>([]);
  const [currentSharpness, setCurrentSharpness] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const lastCaptureTime = useRef<number>(0);
  
  // Focus logic refs
  const lowSharpnessStartRef = useRef<number>(0);
  const lastFocusAttemptRef = useRef<number>(0);

  // --- Infinity Loop Logic ---
  
  useEffect(() => {
    // Only process batch if active and thresholds met
    if (active && frames.length >= maxFrames && !isProcessing) {
      processBatch();
    }
  }, [frames, isProcessing, maxFrames, active]);

  const processBatch = async () => {
    setIsProcessing(true);
    
    // Create pending log entry
    const tempId = Date.now().toString();
    const newLog: LogEntry = {
      id: tempId,
      timestamp: Date.now(),
      thumbnail: frames[0]?.dataUrl || '',
      text: "Analyzing frames...",
      status: "pending"
    };

    setLogs(prev => [newLog, ...prev]);

    try {
      // Pass systemPrompt to performOCR
      const result = await performOCR(apiKey, model, frames, systemPrompt);
      
      setLogs(prev => prev.map(log => 
        log.id === tempId ? { 
          ...log, 
          text: result.mergedText, 
          status: 'success',
          json: result.jsonOutput 
        } : log
      ));
    } catch (error: any) {
      setLogs(prev => prev.map(log => 
        log.id === tempId ? { 
          ...log, 
          text: `Error: ${error.message || 'Unknown error'}`, 
          status: 'error' 
        } : log
      ));
    } finally {
      setFrames([]);
      setIsProcessing(false);
      lastCaptureTime.current = Date.now();
    }
  };

  // --- Camera & Vision Logic ---

  const triggerRefocus = async (mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    if (!track || !track.getCapabilities) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (!capabilities.focusMode) return;

      const modes = capabilities.focusMode;
      
      // Attempt to toggle focus mode to trigger re-focus
      if (modes.includes('continuous')) {
        const tempMode = modes.includes('auto') ? 'auto' : (modes.includes('manual') ? 'manual' : null);
        
        if (tempMode) {
          await track.applyConstraints({ advanced: [{ focusMode: tempMode }] } as any);
          
          // Re-engage continuous focus after short delay
          setTimeout(async () => {
            try {
              await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] } as any);
            } catch(e) {
              console.warn("Failed to restore continuous focus", e);
            }
          }, 500);
        } else {
            // Just re-apply continuous if no other mode to toggle
             await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] } as any);
        }
      }
    } catch (e) {
      console.error("Focus adjustment failed", e);
    }
  };

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            // @ts-ignore
            advanced: [{ focusMode: 'continuous' }]
          }
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
      }
    };

    const stopCamera = () => {
       if (currentStream) currentStream.getTracks().forEach(track => track.stop());
       // Also clean up state stream if different
       if (stream) stream.getTracks().forEach(track => track.stop()); 
       
       setStream(null);
       if (videoRef.current) {
         videoRef.current.srcObject = null;
       }
       // Reset frames when stopping to avoid stale state on resume
       setFrames([]);
       setCurrentSharpness(0);
    };

    if (active) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [active]); 

  const captureFrame = async (video: HTMLVideoElement, score: number) => {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = await resizeImage(captureCanvas.toDataURL('image/jpeg'), 1024);
      
      const newFrame: ScannedFrame = {
        id: Math.random().toString(36).substr(2, 9),
        dataUrl,
        sharpness: score,
        timestamp: Date.now()
      };

      setFrames(prev => {
        const list = [...prev, newFrame].sort((a, b) => b.sharpness - a.sharpness);
        return list.slice(0, maxFrames);
      });
      
      lastCaptureTime.current = Date.now();
    }
  };

  const loop = useCallback(async () => {
    if (!active || !videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    if (video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(loop);
      return;
    }

    const canvas = canvasRef.current;
    const w = 320; 
    const h = (video.videoHeight / video.videoWidth) * w;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, w, h);
      const score = calculateSharpness(ctx, w, h);
      setCurrentSharpness(score);

      const now = Date.now();

      // --- Auto-Focus Logic ---
      if (score < SHARPNESS_THRESHOLD) {
        if (lowSharpnessStartRef.current === 0) {
          lowSharpnessStartRef.current = now;
        } else if (now - lowSharpnessStartRef.current > 2000) { // 2s of consistent blur
           if (now - lastFocusAttemptRef.current > 5000) { // 5s cooldown
             if (stream) triggerRefocus(stream);
             lastFocusAttemptRef.current = now;
             lowSharpnessStartRef.current = 0; // Reset timer
           }
        }
      } else {
        lowSharpnessStartRef.current = 0;
      }
      // ------------------------

      if (
        score > SHARPNESS_THRESHOLD && 
        (now - lastCaptureTime.current > captureInterval) &&
        frames.length < maxFrames
      ) {
        await captureFrame(video, score);
      }
    }

    animationFrameRef.current = requestAnimationFrame(loop);
  }, [isProcessing, frames.length, maxFrames, active, captureInterval, stream]);

  useEffect(() => {
    if (active) {
      animationFrameRef.current = requestAnimationFrame(loop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [loop, active]);

  // --- Render ---

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-950">
      <LogDetailsModal 
        entry={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
      
      {/* LEFT/TOP: Camera Feed */}
      <div className="relative w-full md:w-1/2 h-[45vh] md:h-full bg-black border-b md:border-b-0 md:border-r border-slate-800 flex items-center justify-center overflow-hidden">
        
        {/* Active Camera View */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-500 ${active ? 'opacity-90' : 'opacity-0'}`} 
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Stopped State Overlay */}
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
             <StopCircle className="w-16 h-16 text-slate-500 mb-4 opacity-50" />
             <h3 className="text-white font-bold text-xl mb-6">Scanning Paused</h3>
             <div className="flex gap-4">
               <button 
                 onClick={onHome} 
                 className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
               >
                 <Home className="w-5 h-5" />
                 Back to Home
               </button>
               <button 
                 onClick={onResume} 
                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
               >
                 <Play className="w-5 h-5" />
                 Resume Scan
               </button>
             </div>
          </div>
        )}

        {/* Status Overlay (Only visible when active) */}
        {active && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
              <Zap className={`w-4 h-4 ${currentSharpness > SHARPNESS_THRESHOLD ? 'text-emerald-400' : 'text-yellow-400'}`} />
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-200 ${currentSharpness > SHARPNESS_THRESHOLD ? 'bg-emerald-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${Math.min(currentSharpness, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-mono text-white border border-white/10 flex items-center gap-2">
                  {isProcessing ? (
                    <><Activity className="w-3 h-3 animate-pulse text-indigo-400" /> Sending...</>
                  ) : (
                    <><span className="text-emerald-400">{frames.length}</span>/{maxFrames}</>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Thumbnails Overlay (Only visible when active) */}
        {active && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-hidden h-12 pointer-events-none">
            {frames.map((f) => (
              <img key={f.id} src={f.dataUrl} className="h-full w-auto rounded border border-white/30 shadow-sm" alt="frame" />
            ))}
          </div>
        )}

        {/* Manual Stop Button (Only visible when active) */}
        {active && (
          <div className="absolute bottom-4 right-4 pointer-events-auto">
              <button onClick={onStop} className="bg-red-600/90 hover:bg-red-500 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-105" title="Stop & Review">
                  <StopCircle className="w-6 h-6" />
              </button>
          </div>
        )}
      </div>

      {/* RIGHT/BOTTOM: Scan Log */}
      <div className="relative w-full md:w-1/2 h-[55vh] md:h-full bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                Live Log
            </h2>
            <span className="text-xs text-slate-500">{logs.length} results</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 opacity-50">
                    <Activity className="w-8 h-8" />
                    <p className="text-sm">Waiting for scans...</p>
                </div>
            )}
            {logs.map(log => (
                <ScanLog 
                  key={log.id} 
                  entry={log} 
                  onClick={() => setSelectedLog(log)} 
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ScanningView;