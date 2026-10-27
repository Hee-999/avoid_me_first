import { callResilientLLM } from "../../analysis/llmRouter";
import { MvpAnalysisResult } from "../../analysis/mvp/types";
import { DerivedReportContext, PremiumReportV2 } from "./types";
import { buildPremiumReportPromptPart1, buildPremiumReportPromptPart2, LANGUAGE_CORRECTION_PREFIX } from "./prompts";
import { validateKoreanReportChapter, validatePremiumReportPart } from "./validator";

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
  partName: "Part_1" | "Part_2"
): Promise<any> {
  const start = Date.now();
  const maxTokens = parseInt(process.env.DEEPSEEK_PREMIUM_REPORT_MAX_TOKENS || "4200", 10);
  let inputTokens = 0;
  let outputTokens = 0;
  let correction = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await callResilientLLM(correction + prompt, maxTokens);
    inputTokens += response.usage?.prompt_tokens || 0;
    outputTokens += response.usage?.completion_tokens || 0;
    const json = extractJsonSubstring(response.content);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      correction = "이전 출력은 유효한 JSON이 아닙니다. 모든 필수 키와 올바른 자료형을 포함한 순수 JSON만 다시 작성하세요.\n\n";
      if (attempt === 1) throw new Error(`${partName}: 재시도 후에도 응답 형식을 확인하지 못했습니다`);
      continue;
    }
    const issues = validatePremiumReportPart(parsed, partName);
    const korean = validateKoreanReportChapter(json);
    if (issues.length === 0 && korean) {
      lastGenerationMetrics.push({ partName, language_status: "passed", retry_count: attempt,
        input_tokens: inputTokens, output_tokens: outputTokens, latency_ms: Date.now() - start });
      return parsed;
    }
    correction = (korean ? "" : LANGUAGE_CORRECTION_PREFIX) +
      "이전 출력에 필수 내용 또는 형식 누락이 있습니다. 아래 필드의 문제를 수정하세요. 관찰하지 않은 갈등은 만들지 말고 실제 장면에 맞는 구체적인 조언을 작성하세요.\n" +
      issues.slice(0, 12).join("\n") + "\n\n";
    if (attempt === 1) throw new Error(`${partName}: 필수 내용 검증에 실패했습니다 (${issues.map(i => i.split(":")[0]).join(", ") || "language"})`);
  }
  throw new Error(`${partName}: 리포트를 준비하지 못했습니다`);
}

export async function generatePremiumReport(
  mvpResult: MvpAnalysisResult,
  derivedContext: DerivedReportContext,
  targetLabel: string = "분석 대상"
): Promise<PremiumReportV2> {
  // Reset metrics
  lastGenerationMetrics.length = 0;

  const prompt1 = buildPremiumReportPromptPart1(mvpResult, derivedContext, targetLabel);
  const prompt2 = buildPremiumReportPromptPart2(mvpResult, derivedContext, targetLabel);
  
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
    throw new Error("유료 리포트를 준비하지 못했습니다: " + e.message);
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
