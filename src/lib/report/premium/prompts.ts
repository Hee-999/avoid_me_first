import { DerivedReportContext } from "./types";
import { MvpAnalysisResult } from "../../analysis/mvp/types";

export const PREMIUM_REPORT_LANGUAGE_RULE = `
------------------------------
LANGUAGE & CONVERSATIONAL TONE RULE - HIGHEST PRIORITY
------------------------------
You are a warm, sharp, and realistic 1:1 relationship counselor speaking directly to a Korean friend/client.
ALL user-facing report content MUST be written in natural, easy-to-read conversational Korean (~해요, ~거든요, ~해보세요 체).

1. ABSOLUTE BAN ON REPORT-STYLE / CLINICAL PHRASING:
   - NEVER use words like "사용자님", "사용자님이", "사용자님은", "내담자", "분석 대상", "분석 대상자", "피험자".
   - NEVER address the reader in the 3rd person ("사용자님이 대화를 요청하자..."). Instead, speak directly to the reader by omitting the 2nd-person subject or using natural phrasing ("거리감이 느껴져서 먼저 대화를 꺼내셨을 때...", "답답한 마음에 한 번 더 물어보셨죠", "지금 바로 이렇게 답장해 보세요").
   - For the partner (SPEAKER_A), refer to them naturally as "그 사람" or "상대" (do NOT repeat "상대방은 ~했습니다" at the start of every sentence!).
   - NEVER use stiff report endings like "~관찰되었습니다", "~판독되었습니다", "~시사합니다", "~양상입니다", "~해석됩니다", or noun-ending bullet fragments ("~선택함", "~강화됨", "~중요").
   - ALWAYS end sentences with natural, warm, conversational Korean ("~해요", "~거든요", "~거예요", "~해보세요", "~피하는 게 좋아요").

2. ZERO REPETITION ACROSS SECTIONS (CRITICAL):
   - The reader HATES reading the same explanation twice!
   - Never repeat the same sentence or observation across different sections.
   - Each section has a strict, unique role:
     * executive_summary: The honest conclusion on their current feelings and why the temperature gap happened.
     * evidence_deep_dive: Translating the hidden meaning behind 1-2 specific KakaoTalk lines ("그때 왜 그렇게 말했을까?").
     * interaction_loop: Short, punchy 3-4 step summary of how the two of you got out of sync.
     * communication_guide & conversation_rewrites: Actionable "say this, not that" KakaoTalk advice.
     * attachment_profile: Why their personality/defense mechanism makes them react this way.

3. REALISTIC 2030 KAKAOTALK EXAMPLES (conversation_rewrites):
   - NEVER write textbook counseling / AI-like sentences ("나 전달법", "내가 ~해서 서운했어", "네 감정을 존중해").
   - Write casual, natural 1-2 line KakaoTalk messages that real Korean 20s-30s actually send.

GLOSSARY (When mentioning attachment types in attachment_profile):
- Secure = 안정형
- Preoccupied = 몰입/불안형
- Dismissive-Avoidant = 거부-회피형
- Fearful-Avoidant = 공포-회피형
`;

export const COMMON_RULES = `
CRITICAL RULES:
1. DO NOT CHANGE THE SCORES. Base your report on the authoritative MVP Scoring Result.
2. NO RAW CONVERSATION QUOTES. Paraphrase naturally.
3. PERSONALIZATION: Connect every insight to the actual scenes in DERIVED CONTEXT, without repeating the same words over and over.
4. SHORT & EASY TO READ: Keep sentences short, rhythmic, and effortless to read on a mobile screen.
5. INSUFFICIENT DIMENSION RULE:
   If a dimension in MVP SCORING RESULT has status "insufficient" (or evaluable: 0), explain naturally that the conversation simply didn't have a situation that triggered that side, rather than claiming the score is 0.
6. OUTPUT FORMAT: Output ONLY a valid JSON object matching the requested schema.

${PREMIUM_REPORT_LANGUAGE_RULE}
`;

export function buildPremiumReportPromptPart1(
  mvpResult: MvpAnalysisResult,
  derivedContext: DerivedReportContext,
  targetLabel: string = "상대방"
): string {
  const modeHint =
    derivedContext.analysis_mode === "flirting"
      ? "[분석 모드: 💘 썸 · 호감도 판독] 호감 시그널인지 예의상 답장인지, 어떻게 썸 텐션을 살릴지 친근하게 코칭하세요."
      : "[분석 모드: 💔 재회 · 애매한 사이 판독] 마음이 식은 건지 감정 소모가 두려워 숨은 건지, 어떻게 방어벽을 낮출지 친근하게 코칭하세요.";

  return `
You are a top Korean relationship strategist coaching the user 1:1.
${modeHint}

${COMMON_RULES}

--- SPEAKER ROLES (DO NOT INVERT) ---
- SPEAKER_A = 우리가 속마음을 알고 싶은 "그 사람 (상대)"
- SPEAKER_B = 지금 이 리포트를 읽고 있는 본인 ("사용자님"이라는 단어 절대 쓰지 말고, "먼저 대화를 꺼내셨을 때", "다가갈수록"처럼 직접 말 걸듯이 쓰세요!)

INPUT DATA:
--- MVP SCORING RESULT ---
${JSON.stringify(mvpResult, null, 2)}

--- DERIVED CONTEXT ---
${JSON.stringify(derivedContext, null, 2)}

OUTPUT SCHEMA FOR PART 1 (STRICT JSON, ALL VALUES IN CONVERSATIONAL KOREAN ~해요체):
{
  "executive_summary": {
    "headline": "눈앞에서 말해주듯 직관적이고 여운 있는 핵심 한 줄 진단 (~해요/~거예요 체, 예: 마음이 완전히 끝난 게 아니라, 지금은 감정 쓰는 게 버거워서 동굴로 숨은 상태예요)",
    "body": "그 사람이 지금 왜 이런 태도를 보이는지, 두 사람의 온도차가 왜 벌어졌는지 옆에서 설명해주듯 술술 읽히게 작성 (2~3문장, ~해요/~거든요 체, '사용자님'/'상대방은' 금지)",
    "key_points": [
      "핵심 포인트 1 (완결된 ~해요/~거예요 문장, 개조식 ~함 금지)",
      "핵심 포인트 2 (완결된 ~해요/~거예요 문장)",
      "핵심 포인트 3 (완결된 ~해요/~거예요 문장)"
    ]
  },
  "attachment_profile": {
    "primary_interpretation": "그 사람의 평소 연애 방어기제와 이번 대화 반응을 연결해 친근하게 설명 (1-2문장, ~해요 체)",
    "secondary_interpretation": "함께 참고할 만한 심리적 특징을 쉽게 설명 (1-2문장, ~해요 체)",
    "dimension_interpretation": "두 사람의 온도차가 왜 생겼는지 불안·거리두기 성향으로 쉽게 풀어 설명 (1-2문장, ~해요 체)"
  },
  "behavior_patterns": [
    {
      "signal_id": "e.g., AV02",
      "title": "짧은 한글 제목",
      "score": 0,
      "strength_label": "명확",
      "observation": "관찰된 행동 (1문장, ~했어요 체)",
      "interpretation": "속마음 의미 (1문장, ~해요 체)",
      "relationship_effect": "관계 영향 (1문장, ~해요 체)",
      "counterpoint": "긍정적 여지 (1문장, ~해요 체)"
    }
  ],
  "evidence_deep_dive": [
    // 1 or 2 scenes MAX. Do NOT repeat the exact same wording from executive_summary!
    {
      "title": "장면 제목 (짧고 직관적으로, 예: 피곤하다며 대화를 미룬 순간)",
      "situation": "어떤 분위기에서 나온 장면인지 쉽게 설명 (1문장, ~했을 때예요/~상황이었어요 체, '사용자님' 단어 금지)",
      "observed_behavior": "그 사람이 보인 핵심 카톡 반응 요약 (1문장, ~했어요 체)",
      "interaction": "그 뒤 대화가 어떻게 흘러갔는지 (1문장, ~했죠/~했어요 체)",
      "interpretation": "그 사람이 속으로 왜 이런 반응을 보였는지 진짜 속마음 해독 (1~2문장, ~거든요/~해요 체)",
      "alternative_explanation": "혹시 이런 현실적인 이유(피로, 타이밍 등)일 가능성도 짚어주기 (1문장, ~수도 있어요 체)",
      "conclusion": "그래서 이 장면을 어떻게 받아들이면 되는지 한 줄 정리 (1문장, ~해요 체)"
    }
  ],
  "trigger_profile": [],
  "interaction_loop": {
    "summary": "두 사람이 왜 자꾸 엇갈렸는지 한두 문장으로 쉽게 짚어주기 (~해요/~거든요 체, '사용자님' 금지)",
    "steps": [
      "1단계 (짧고 자연스러운 구절, 예: 거리감이 느껴져 진지한 대화를 꺼냄)",
      "2단계 (예: 부담을 느끼고 피곤하다며 한 발 물러섬)",
      "3단계 (예: 답답한 마음에 언제 얘기할지 한 번 더 재촉함)",
      "4단계 (예: 압박감을 이기지 못하고 대화를 닫아버림)"
    ],
    "break_points": [
      "이 엇갈림을 끊어낼 수 있는 현실적인 스위치 한 줄 (~해보세요/~좋아요 체)"
    ]
  }
}
`;
}

export function buildPremiumReportPromptPart2(
  mvpResult: MvpAnalysisResult,
  derivedContext: DerivedReportContext,
  targetLabel: string = "상대방"
): string {
  return `
You are a top Korean relationship strategist coaching the user 1:1 on how to message and handle their partner.

${COMMON_RULES}

--- SPEAKER ROLES & ACTION PERSPECTIVE (CRITICAL) ---
- SPEAKER_A = 그 사람 (상대)
- SPEAKER_B = 이 리포트를 읽고 카톡을 보낼 본인 ("사용자님"이라는 단어 절대 쓰지 말고, "지금 바로 이렇게 답장해 보세요", "이런 말은 꼭 참으세요"처럼 직접 말 걸듯이 쓰세요!)
- 모든 가이드와 카톡 예시는 **본인(SPEAKER_B)이 그 사람(SPEAKER_A)에게 어떻게 보내고 행동할지**를 알려주어야 합니다!

INPUT DATA:
--- MVP SCORING RESULT ---
${JSON.stringify(mvpResult, null, 2)}

--- DERIVED CONTEXT ---
${JSON.stringify(derivedContext, null, 2)}

OUTPUT SCHEMA FOR PART 2 (STRICT JSON, ALL VALUES IN CONVERSATIONAL KOREAN ~해요/~해보세요 체):
{
  "conflict_pattern": {
    "summary": "한 줄 요약 (~해요 체)",
    "works_better": ["효과적인 태도 1"],
    "likely_to_worsen": ["피해야 할 태도 1"]
  },
  "communication_guide": [
    // Provide 2 or 3 distinct situations. NEVER start sentences with "사용자님은"! Start directly with the action!
    {
      "situation": "구체적인 상황 제목 (예: 피곤하다며 대화를 자꾸 미룰 때)",
      "do": "직접 코칭하듯 행동 추천 (예: '오늘 많이 지쳤나 보네, 푹 쉬고 내일 편할 때 얘기하자'라고 가볍게 물러서 주세요.)",
      "dont": "직접 코칭하듯 금지 행동 안내 (예: '맨날 피하기만 하잖아, 언제 얘기할 건데?'라며 바로 답을 재촉하지 마세요.)",
      "why": "왜 이렇게 해야 그 사람 마음이 열리는지 쉽게 설명 (1문장, ~거든요/~해요 체)"
    }
  ],
  "conversation_rewrites": [
    // Provide EXACTLY 2 realistic KakaoTalk comparisons.
    {
      "situation": "카톡 보내는 상황 (예: 대화를 피하고 답장이 느려졌을 때)",
      "original_pattern_summary": "실제 카톡 대사만 작성! 자칫 보내기 쉬운 부담/추궁 카톡 대사 (예: 왜 맨날 피하기만 해? 우리 얘기 좀 하자니까)",
      "recommended_message": "실제 카톡 대사만 작성! 상대 부담을 확 낮추는 자연스러운 2030 현실 카톡 대사 (예: 오늘 정신없었지 ㅋㅋ 일단 푹 쉬어~ 내일 저녁에 잠깐 톡 하자)",
      "why": "이 말투가 왜 먹히는지 한 줄 설명 (~거든요/~해요 체)"
    }
  ],
  "recovery_signals": [
    "그 사람 마음이 풀리고 있다는 청신호 1 (~할 때)",
    "청신호 2 (~할 때)",
    "청신호 3 (~할 때)"
  ],
  "risk_signals": [
    "아직 방어벽이 높으니 한 템포 쉬어가야 할 적신호 1 (~할 때)",
    "적신호 2 (~할 때)",
    "적신호 3 (~할 때)"
  ],
  "action_plan": {
    "next_conflict": ["온도차가 다시 벌어질 때 대처법 1문장 (~해보세요 체)"],
    "next_7_days": [
      "당장 이번 주(7일) 행동 지침 1 (~해보세요/~마세요 체, '사용자님' 금지)",
      "당장 이번 주(7일) 행동 지침 2 (~해보세요/~마세요 체)"
    ],
    "next_30_days": [
      "앞으로 한 달(30일) 호흡 조절 전략 1 (~해보세요 체)",
      "앞으로 한 달(30일) 호흡 조절 전략 2 (~해보세요 체)"
    ]
  },
  "manual_summary": {
    "effective_approach": ["접근법 1"],
    "ineffective_approach": ["피할 점 1"],
    "conflict_reentry": "대화 재개 팁 (~해요 체)",
    "distance_response": "거리두기 대처 팁 (~해요 체)",
    "relationship_check": "관계 점검 팁 (~해요 체)",
    "watch_for": ["신호 1"],
    "key_sentence": "카톡 보내기 전에 마음속으로 딱 한 번만 떠올릴 다정하고 현실적인 조언 한 문장 (~하세요/~거예요 체)"
  },
  "methodology": {
    "body": "본 리포트는 대화 속 반응 템포와 거리두기 패턴을 기반으로 두 사람의 관계 흐름을 분석했어요."
  }
}
`;
}

export const LANGUAGE_CORRECTION_PREFIX = `
------------------------------
LANGUAGE CORRECTION REQUIRED
------------------------------
이전 응답의 내용과 JSON 구조는 유지하되, 모든 문장(JSON Value)을 친근하고 자연스러운 한국어 구어체(~해요, ~거든요, ~해보세요)로 다시 작성하세요.
"사용자님", "분석 대상" 같은 어색한 호칭이나 딱딱한 보고서 말투를 절대 쓰지 마세요.
`;
