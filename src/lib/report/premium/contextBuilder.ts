import { callDeepSeekAPI } from "../../analysis/extractor/deepseekClient";
import { MvpAnalysisResult } from "../../analysis/mvp/types";
import { DerivedReportContext } from "./types";

export async function buildDerivedReportContext(
  conversationJson: string,
  targetSpeaker: string,
  mvpResult: MvpAnalysisResult
): Promise<DerivedReportContext> {
  const prompt = `
You are an expert relationship analyst. 
Your task is to summarize the key interactions and situations from the provided raw conversation.
You must output a structured JSON matching the DerivedReportContext schema.

CRITICAL PRIVACY RULE: 
DO NOT include any exact quotes or raw message text from the conversation in your output.
You must synthesize and describe the situations objectively.
(e.g., INSTEAD OF "그만하자" -> USE "갈등을 멈추고 대화를 종료하려는 의사 표현")

TARGET SPEAKER: ${targetSpeaker}
MVP SCORING RESULT:
${JSON.stringify(mvpResult, null, 2)}

RAW CONVERSATION:
${conversationJson}

OUTPUT SCHEMA (Return ONLY JSON):
{
  "relationship_context": "Overall summary of the relationship dynamic based on the conversation (max 2 sentences).",
  "key_situations": [
    {
      "situation": "Describe the context/conflict.",
      "target_behavior": "What the target speaker did.",
      "other_person_behavior": "What the other person did.",
      "interaction_result": "How it ended."
    }
  ],
  "key_patterns": [
    {
      "signal_id": "AV02 (or relevant signal from MVP results)",
      "observation": "Describe how this signal manifested without quotes.",
      "counterpoint": "Any healthy counter-evidence observed? (optional)"
    }
  ],
  "trigger_candidates": ["List of situations that triggered the target's attachment behaviors"],
  "interaction_patterns": ["Describe cyclical patterns between the two speakers"],
  "counter_evidence": ["List of healthy behaviors or exceptions to their primary attachment type"],
  "healthy_patterns": ["List of secure/healthy communication patterns observed"]
}
`;

  try {
    const response = await callDeepSeekAPI(prompt);
    const rawOutput = response.content;
    const jsonStr = extractJsonSubstring(rawOutput);
    if (!jsonStr) {
      throw new Error("Failed to extract JSON from Derived Context AI response");
    }
    const parsed = JSON.parse(jsonStr) as DerivedReportContext;
    return parsed;
  } catch (e: any) {
    console.error("Context Builder Error:", e);
    // Return a fallback context so the pipeline doesn't break entirely, 
    // though the report will be less personalized.
    return {
      relationship_context: "분석 중 상황 요약을 추출하는 데 실패했습니다.",
      key_situations: [],
      key_patterns: [],
      trigger_candidates: [],
      interaction_patterns: [],
      counter_evidence: [],
      healthy_patterns: []
    };
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
