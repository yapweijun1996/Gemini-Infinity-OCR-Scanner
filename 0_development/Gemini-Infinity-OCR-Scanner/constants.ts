import { ModelOption, PromptPreset } from "./types";

export const DEFAULT_MODEL = "gemini-2.5-flash";

export const AVAILABLE_MODELS: ModelOption[] = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Fast & Cheap)" },
  { value: "gemini-2.5-flash-lite-latest", label: "Gemini 2.5 Flash Lite" },
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Exp" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Better Reasoning)" },
];

export const DEFAULT_SYSTEM_PROMPT = `
You are a high-precision OCR engine. 
1. Analyze the provided images. 
2. Extract ALL visible text strictly as it appears. 
3. Return the result in valid JSON format with a 'full_text' field containing the merged text.
4. If a part is illegible, mark it as [UNCLEAR]. 
`.trim();

export const PROMPT_PRESETS: PromptPreset[] = [
  { 
    label: "Standard OCR (JSON)", 
    value: DEFAULT_SYSTEM_PROMPT 
  },
  { 
    label: "Text Only (Single Line)", 
    value: "Extract the single most prominent line of text visible. Return ONLY the raw plain text string. Do not use Markdown or JSON." 
  },
  { 
    label: "Code / ID Only (< 10 chars)", 
    value: "Extract only the main visible code, ID number, or price. Max 10 characters. Return ONLY the raw string. No markdown." 
  },
  { 
    label: "Markdown Format", 
    value: "Extract all text and preserve layout using Markdown headers, lists, and tables. Return raw Markdown." 
  }
];

export const DEFAULT_MAX_FRAMES = 5;
export const DEFAULT_CAPTURE_INTERVAL_MS = 500; // Default 0.5s
export const SHARPNESS_THRESHOLD = 20; // Lowered from 50. New algorithm scales score x10, so 20 is accessible.