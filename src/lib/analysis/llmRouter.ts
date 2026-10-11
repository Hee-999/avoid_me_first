import { callDeepSeekAPI } from "./extractor/deepseekClient";
import { callGeminiChat } from "./gemini/geminiClient";

export interface UnifiedLLMResponse {
  content: string;
  provider: "gemini" | "deepseek";
  usage?: any;
}

/**
 * Resilient Multi-Provider LLM Caller.
 * Seamlessly routes between Gemini and DeepSeek with automatic failover.
 */
export async function callResilientLLM(
  prompt: string,
  maxTokens?: number
): Promise<UnifiedLLMResponse> {
  const preferredProvider = process.env.PRIMARY_LLM_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "deepseek");

  if (preferredProvider === "gemini") {
    try {
      const res = await callGeminiChat(prompt, true);
      return { content: res.content, provider: "gemini", usage: res.usage };
    } catch (geminiErr: any) {
      console.warn("[LLM ROUTER] Gemini failed, falling back to DeepSeek:", geminiErr.message);
      if (process.env.DEEPSEEK_API_KEY) {
        const dsRes = await callDeepSeekAPI(prompt, maxTokens);
        return { content: dsRes.content, provider: "deepseek", usage: dsRes.usage };
      }
      throw geminiErr;
    }
  } else {
    try {
      const dsRes = await callDeepSeekAPI(prompt, maxTokens);
      return { content: dsRes.content, provider: "deepseek", usage: dsRes.usage };
    } catch (dsErr: any) {
      console.warn("[LLM ROUTER] DeepSeek failed, falling back to Gemini:", dsErr.message);
      if (process.env.GEMINI_API_KEY) {
        const geminiRes = await callGeminiChat(prompt, true);
        return { content: geminiRes.content, provider: "gemini", usage: geminiRes.usage };
      }
      throw dsErr;
    }
  }
}
