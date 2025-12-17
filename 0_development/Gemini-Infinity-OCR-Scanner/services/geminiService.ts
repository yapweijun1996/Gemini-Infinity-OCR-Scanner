import { GoogleGenAI } from "@google/genai";
import { ScannedFrame, OCRResult } from "../types";

export const performOCR = async (
  apiKey: string,
  modelName: string,
  frames: ScannedFrame[],
  systemInstruction: string
): Promise<OCRResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Prepare parts: System prompt + Images
  const parts: any[] = [];
  
  // Add images
  frames.forEach((frame) => {
    // Remove "data:image/jpeg;base64," prefix
    const base64Data = frame.dataUrl.split(',')[1];
    if (base64Data) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }
  });

  // Add text prompt
  parts.push({
    text: "Process these images according to the system instructions."
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temp for factual extraction
        // We do not enforce JSON schema here to allow "Text Only" prompts to return raw strings
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Empty response from Gemini");

    let json: any = {};
    let mergedText = textResponse;

    // smart parsing: try JSON, fall back to raw text
    try {
        // Clean potential markdown blocks like ```json ... ```
        const cleanText = textResponse.replace(/```json|```/g, '').trim();
        json = JSON.parse(cleanText);
        // If the default JSON schema is used, we look for 'full_text'
        if (json.full_text) {
            mergedText = json.full_text;
        } else {
            // If it's some other JSON, just stringify it for display
            mergedText = typeof json === 'object' ? JSON.stringify(json, null, 2) : String(json);
        }
    } catch (e) {
        // Not JSON? That's fine (e.g. "Text Only" mode).
        json = { raw_output: textResponse };
        mergedText = textResponse;
    }
    
    return {
      rawText: textResponse,
      mergedText: mergedText,
      jsonOutput: json
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process images with Gemini");
  }
};