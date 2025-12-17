export enum AppState {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE', // Unified state for infinity loop
  STOPPED = 'STOPPED', // Camera off, logs visible
  ERROR = 'ERROR'
}

export interface ScannedFrame {
  id: string;
  dataUrl: string; // Base64
  sharpness: number;
  timestamp: number;
}

export interface OCRResult {
  rawText: string;
  mergedText: string;
  jsonOutput: any;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  thumbnail: string;
  text: string;
  status: 'pending' | 'success' | 'error';
  json?: any;
}

export interface AppConfig {
  apiKey: string;
  model: string;
  maxFrames: number;
  captureInterval: number;
  systemPrompt: string;
}

export interface ModelOption {
  value: string;
  label: string;
}

export interface PromptPreset {
  label: string;
  value: string;
}