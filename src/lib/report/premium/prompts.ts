import { DerivedReportContext } from "./types";
import { MvpAnalysisResult } from "../../analysis/mvp/types";

export const PREMIUM_REPORT_LANGUAGE_RULE = `
------------------------------
LANGUAGE RULE - HIGHEST PRIORITY
------------------------------
You are writing a premium relationship analysis report for a Korean-speaking user.
ALL user-facing report content MUST be written in natural, professional Korean (한국어).

This rule has higher priority than:
- English JSON field names
- English schema definitions
- English section names
- English examples
- English psychology terminology
- English variable names
- English source material

Even if the schema or prompt is written in English, the VALUE of every user-visible string must be Korean.

JSON KEY: Keep in English.
JSON VALUE: If it is a string meant to be read by the user, it MUST be Korean.

TONE:
- Professional, calm, specific, and easy to read.
- Read like a clinical counseling report.
- DO NOT use overly clinical terms like "해당 피험자는...", "상기 대상자는...", "본 개체는...".
- INSTEAD use "분석 대상은...", "상대방은...", "이번 대화에서는...".
- Avoid English translated styles (e.g. "그의 회피 시스템이 활성화됩니다" -> "갈등 압력이 높아질수록 대화 참여를 줄이는 패턴이 나타납니다").
- DO NOT treat your psychological inferences as absolute facts. Use "관찰되었습니다", "나타납니다", "반응을 보였습니다" rather than absolute declarations of their inner thoughts.

GLOSSARY (Use these exact Korean terms):
- Secure = 안정형
- Preoccupied = 몰입/불안형
- Dismissive-Avoidant = 거부-회피형
- Fearful-Avoidant = 공포-회피형
- Anxiety = 불안
- Avoidance = 회피
- Conflict Withdrawal = 갈등 상황 대화 철수
- Intimacy Distancing = 친밀감 증가 시 거리두기
- Compulsive Self-Reliance = 과도한 자기의존
- Support Deactivation = 정서적 지원 차단
- Abandonment Concern = 거절·버림받음 우려
- Excessive Reassurance Seeking = 반복적 관계 확인·안심 요구
- Responsiveness Hypervigilance = 상대 반응 변화 과잉 모니터링
`;

export const COMMON_RULES = `
CRITICAL RULES:
1. DO NOT CHANGE THE SCORES. The authoritative MVP Scoring Result is provided below. You must base your report on it.
2. NO RAW CONVERSATION QUOTES. Paraphrase gently.
3. PERSONALIZATION: Do not generate a generic article. Connect your explanations to the specific behaviors in the Context.
4. COUNTER EVIDENCE: If coverage is low or there are healthy patterns, explicitly mention them as counter-evidence.
5. NO LONG ESSAYS: Your response must be extremely dense, compact, and visual. We are designing UI cards, not a textbook.
6. NO THEORETICAL REPETITION: Do not explain what "Avoidant Attachment" is. The user already knows. Just explain THEIR specific behavior.
7. AVOID REDUNDANCY: If you mentioned something in Behavior Analysis, do not repeat it in the Executive Summary.
8. LENGTH LIMITS (STRICT): You MUST adhere to the maximum array length and sentence limits defined in the schema.
9. OUTPUT FORMAT: You must output ONLY a valid JSON object matching the requested schema exactly.

${PREMIUM_REPORT_LANGUAGE_RULE}
`;

export function buildPremiumReportPromptPart1(
  mvpResult: MvpAnalysisResult,
  derivedContext: DerivedReportContext
): string {
  return `
You are an expert relationship counselor and clinical psychologist specializing in Adult Attachment Theory.
Your task is to generate Part 1 (Chapters 1 to 7) of a comprehensive, highly personalized Premium Relationship Report.

${COMMON_RULES}

INPUT DATA:
--- MVP SCORING RESULT (AUTHORITATIVE) ---
${JSON.stringify(mvpResult, null, 2)}

--- DERIVED CONTEXT ---
${JSON.stringify(derivedContext, null, 2)}

OUTPUT SCHEMA FOR PART 1 (STRICT JSON):
{
  "executive_summary": {
    "headline": "A short, impactful headline in Korean (max 1 sentence).",
    "body": "A dense 2~3 sentence summary in Korean of the overall relationship pattern and core behavior. Do not exceed 3 sentences.",
    "key_points": ["Point 1 in Korean", "Point 2 in Korean", "Point 3 in Korean"] // EXACTLY 3 short bullet points.
  },
  "attachment_profile": {
    "primary_interpretation": "Why this profile is the primary fit (1-2 sentences in Korean).",
    "secondary_interpretation": "If applicable, secondary type characteristics (1-2 sentences in Korean).",
    "dimension_interpretation": "What the Anxiety and Avoidance scores mean here (1-2 sentences in Korean)."
  },
  "behavior_patterns": [
    // Provide ONLY the TOP 2 or 3 most important signals. DO NOT list all signals.
    {
      "signal_id": "e.g., AV02",
      "title": "Korean Title (e.g., 갈등 상황 대화 철수)",
      "score": 0,
      "strength_label": "e.g., 명확, 약함, 없음",
      "observation": "What was observed (1 sentence in Korean)",
      "interpretation": "What it means (1 sentence in Korean)",
      "relationship_effect": "How it affects the partner (1 sentence in Korean)",
      "counterpoint": "Any counter evidence (1 sentence in Korean)"
    }
  ],
  "evidence_deep_dive": [
    // Provide EXACTLY 2 key scenes. No more.
    {
      "title": "Korean Title of the scene (short)",
      "situation": "Context (1 sentence in Korean)",
      "observed_behavior": "What happened (1 sentence in Korean)",
      "interaction": "How both reacted (1 sentence in Korean)",
      "interpretation": "Meaning (1 sentence in Korean)",
      "alternative_explanation": "Alternative explanation (1 sentence in Korean)",
      "conclusion": "Final judgment (1 sentence in Korean)"
    }
  ],
  "trigger_profile": [
    // Provide MAX 3 triggers.
    {
      "trigger": "What triggered the behavior (short phrase in Korean)",
      "observed_response": "How they responded (short phrase in Korean)",
      "interpretation": "Why they responded this way (1 sentence in Korean)",
      "recommended_approach": "How to approach differently (1 sentence in Korean)"
    }
  ],
  "interaction_loop": {
    "summary": "Summary of the loop (1-2 sentences in Korean)",
    "steps": ["Step 1 (short phrase)", "Step 2", "Step 3"], // Flow diagram steps
    "break_points": ["Intervention point (1 sentence in Korean)"]
  }
}
`;
}

export function buildPremiumReportPromptPart2(
  mvpResult: MvpAnalysisResult,
  derivedContext: DerivedReportContext
): string {
  return `
You are an expert relationship counselor and clinical psychologist specializing in Adult Attachment Theory.
Your task is to generate Part 2 (Chapters 8 to 15) of a comprehensive, highly personalized Premium Relationship Report.

${COMMON_RULES}

INPUT DATA:
--- MVP SCORING RESULT (AUTHORITATIVE) ---
${JSON.stringify(mvpResult, null, 2)}

--- DERIVED CONTEXT ---
${JSON.stringify(derivedContext, null, 2)}

OUTPUT SCHEMA FOR PART 2 (STRICT JSON):
{
  "conflict_pattern": {
    "summary": "Overall conflict pattern in Korean (1-2 sentences)",
    "works_better": ["Do A (short phrase)", "Do B"], // Max 3 items
    "likely_to_worsen": ["Don't A (short phrase)", "Don't B"] // Max 3 items
  },
  "communication_guide": [
    // Provide MAX 3 DO/DON'T cards
    {
      "situation": "Situation in Korean (e.g., 갈등 직후)",
      "do": "What to do in Korean (1 sentence)",
      "dont": "What not to do in Korean (1 sentence)",
      "why": "Reason in Korean (1 sentence)"
    }
  ],
  "conversation_rewrites": [
    // Provide EXACTLY 2 rewrites. No more.
    {
      "situation": "Situation in Korean (short phrase)",
      "original_pattern_summary": "Original pattern in Korean (short phrase)",
      "recommended_message": "Recommended message in Korean (short, natural, ready to copy-paste)",
      "why": "Why it's better in Korean (1 sentence)"
    }
  ],
  "recovery_signals": ["Korean Signal 1", "Korean Signal 2", "Korean Signal 3"], // Max 3 short bullets
  "risk_signals": ["Korean Signal 1", "Korean Signal 2", "Korean Signal 3"], // Max 3 short bullets
  "action_plan": {
    "next_conflict": ["Action 1 (short sentence)"], // Max 1-2 items
    "next_7_days": ["Action 1 (short sentence)"], // Max 1-2 items
    "next_30_days": ["Action 1 (short sentence)"] // Max 1-2 items
  },
  "manual_summary": {
    "effective_approach": ["Approach 1 (short phrase)"], // Max 3 items
    "ineffective_approach": ["Approach 1 (short phrase)"], // Max 3 items
    "conflict_reentry": "How to re-enter conflict in Korean (1 sentence)",
    "distance_response": "How to respond to distance in Korean (1 sentence)",
    "relationship_check": "How to check relationship in Korean (1 sentence)",
    "watch_for": ["Signal 1 (short phrase)"], // Max 2 items
    "key_sentence": "One crucial sentence to remember in Korean"
  },
  "methodology": {
    "body": "본 분석은 성인 애착의 불안·회피 차원을 기반으로 대화 패턴을 분석합니다. 점수는 임상 진단을 의미하지 않습니다." // Use this exact short sentence or similar. Max 100 characters.
  }
}
`;
}

export const LANGUAGE_CORRECTION_PREFIX = `
------------------------------
LANGUAGE CORRECTION REQUIRED
------------------------------
이전 응답의 내용과 JSON 구조는 유지하되, 사용자에게 노출되는 모든 문장(JSON Value)을 자연스러운 한국어(Korean)로 다시 작성하세요.
영어 JSON key와 Signal ID를 제외한 설명 문장은 반드시 100% 한국어여야 합니다.
영어 문단이나 영어 문장을 절대 출력하지 마세요.
`;
