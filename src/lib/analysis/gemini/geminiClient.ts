/**
 * Google Gemini API Client for Multimodal Vision & Chat Completion.
 * Built with native fetch, exponential backoff retries, and automatic model failover.
 */

export interface GeminiInlineData {
  base64: string;
  mimeType: string;
}

export interface GeminiResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-3.8-flash";

async function executeGeminiRequest(
  model: string,
  parts: any[],
  apiKey: string,
  responseMimeType?: string
): Promise<GeminiResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  };

  if (responseMimeType) {
    payload.generationConfig.responseMimeType = responseMimeType;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${model}) [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(`Empty response from Gemini API (${model})`);
  }

  return {
    content: text,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0
    }
  };
}

/**
 * Call Gemini with 2-level retry and automatic model fallback
 */
async function callGeminiWithResilience(
  parts: any[],
  responseMimeType?: string
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const model of modelsToTry) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        return await executeGeminiRequest(model, parts, apiKey, responseMimeType);
      } catch (err: any) {
        console.warn(`[GEMINI] Model ${model} attempt ${attempts} failed:`, err.message);
        if (attempts < maxAttempts) {
          // Exponential backoff wait (1s, 2s)
          await new Promise((res) => setTimeout(res, attempts * 1000));
        }
      }
    }
    console.warn(`[GEMINI] Model ${model} failed after ${maxAttempts} attempts, attempting fallback...`);
  }

  throw new Error("All Gemini API attempts (including fallbacks) failed. Please check network and API quota.");
}

/**
 * Call Gemini Vision with multiple images (e.g. KakaoTalk screenshot slices)
 */
export async function callGeminiVision(
  images: GeminiInlineData[],
  prompt: string
): Promise<GeminiResponse> {
  const parts: any[] = [];

  // Add all image parts
  for (const img of images) {
    parts.push({
      inline_data: {
        mime_type: img.mimeType,
        data: img.base64
      }
    });
  }

  // Add the text instruction prompt
  parts.push({ text: prompt });

  return callGeminiWithResilience(parts, "application/json");
}

/**
 * Call Gemini Chat for text analysis or report generation
 */
export async function callGeminiChat(
  prompt: string,
  jsonFormat: boolean = true
): Promise<GeminiResponse> {
  const parts = [{ text: prompt }];
  return callGeminiWithResilience(parts, jsonFormat ? "application/json" : undefined);
}
