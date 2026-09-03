import { callDeepSeekAPI } from "../../analysis/extractor/deepseekClient";
import { MvpAnalysisResult } from "../../analysis/mvp/types";
import { DerivedReportContext, PremiumReportV2 } from "./types";
import { buildPremiumReportPromptPart1, buildPremiumReportPromptPart2, LANGUAGE_CORRECTION_PREFIX } from "./prompts";
import { validateKoreanReportChapter } from "./validator";

export interface GenerationMetrics {
  partName: string;
  language_status: "passed" | "failed";
  retry_count: number;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
}

export const lastGenerationMetrics: GenerationMetrics[] = [];

async function generateWithLanguageEnforcement(
  prompt: string, 
  partName: string
): Promise<any> {
  let start = Date.now();
  let retry_count = 0;
  const maxTokens = parseInt(process.env.DEEPSEEK_PREMIUM_REPORT_MAX_TOKENS || "4200", 10);
  let response = await callDeepSeekAPI(prompt, maxTokens);
  let rawOutput = response.content;
  let jsonStr = extractJsonSubstring(rawOutput);
  let input_tokens = response.usage?.prompt_tokens || 0;
  let output_tokens = response.usage?.completion_tokens || 0;
  
  if (!jsonStr) {
    throw new Error(`Failed to extract JSON from ${partName}`);
  }

  let parsedResult: any;
  try {
    parsedResult = JSON.parse(jsonStr);
  } catch (parseError) {
    console.log(`[JSON Parse Error] ${partName} failed to parse JSON. Retrying...`);
    retry_count++;
    const retryPrompt = "Your previous output had a JSON syntax error. Please output strictly valid JSON.\n\n" + prompt;
    response = await callDeepSeekAPI(retryPrompt, maxTokens);
    rawOutput = response.content;
    jsonStr = extractJsonSubstring(rawOutput);
    input_tokens += response.usage?.prompt_tokens || 0;
    output_tokens += response.usage?.completion_tokens || 0;
    
    if (!jsonStr) throw new Error(`Failed to extract JSON from ${partName} during retry`);
    
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch (e2) {
      throw new Error(`JSON parse failed again for ${partName} after retry: ${e2}`);
    }
  }

  let isValidKorean = validateKoreanReportChapter(jsonStr);
  let language_status: "passed" | "failed" = isValidKorean ? "passed" : "failed";

  if (!isValidKorean && retry_count === 0) {
    console.log(`[Language Enforcement] ${partName} failed Korean validation. Retrying...`);
    retry_count++;
    
    // Retry once with Correction Prefix
    const retryPrompt = LANGUAGE_CORRECTION_PREFIX + "\n\n" + prompt;
    response = await callDeepSeekAPI(retryPrompt, maxTokens);
    rawOutput = response.content;
    jsonStr = extractJsonSubstring(rawOutput);
    input_tokens += response.usage?.prompt_tokens || 0;
    output_tokens += response.usage?.completion_tokens || 0;
    
    if (!jsonStr) throw new Error(`Failed to extract JSON from ${partName} during retry`);
    
    isValidKorean = validateKoreanReportChapter(jsonStr);
    language_status = isValidKorean ? "passed" : "failed";
    
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch (e3) {
      throw new Error(`JSON parse failed during language retry for ${partName}: ${e3}`);
    }
  }

  const latency_ms = Date.now() - start;

  lastGenerationMetrics.push({
    partName,
    language_status,
    retry_count,
    input_tokens,
    output_tokens,
    latency_ms
  });

  return parsedResult;
}

export async function generatePremiumReport(
  mvpResult: MvpAnalysisResult,
  derivedContext: DerivedReportContext
): Promise<PremiumReportV2> {
  // Reset metrics
  lastGenerationMetrics.length = 0;

  const prompt1 = buildPremiumReportPromptPart1(mvpResult, derivedContext);
  const prompt2 = buildPremiumReportPromptPart2(mvpResult, derivedContext);
  
  try {
    // Call DeepSeek concurrently for both parts with validation
    const [parsed1, parsed2] = await Promise.all([
      generateWithLanguageEnforcement(prompt1, "Part_1"),
      generateWithLanguageEnforcement(prompt2, "Part_2")
    ]);

    // Merge both parts into the final 15-chapter schema
    const finalReport: PremiumReportV2 = {
      ...parsed1,
      ...parsed2
    };

    return finalReport;
  } catch (e: any) {
    console.error("Premium Report Generation Error:", e);
    throw new Error("Failed to generate premium report: " + e.message);
  }
}

function extractJsonSubstring(raw: string): string {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
    return "";
  }
  return raw.substring(firstBrace, lastBrace + 1);
}
