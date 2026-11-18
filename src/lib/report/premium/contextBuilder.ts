import { callResilientLLM } from "../../analysis/llmRouter";
import { MvpAnalysisResult } from "../../analysis/mvp/types";
import {
  AnalysisMode,
  DerivedReportContext,
  TargetStanceTier,
  UserEngagementTier,
  V3Metrics,
} from "./types";

interface ConversationStats {
  totalMessages: number;
  userMsgShare: number; // 0..1
  userQuestionRate: number; // 0..1
  targetQuestionRate: number; // 0..1
  targetAvgLen: number;
}

function extractConversationStats(conversationJson: string, targetSpeaker: string): ConversationStats {
  try {
    const parsed = JSON.parse(conversationJson);
    const list: Array<{ speaker?: string; text?: string; message?: string; content?: string }> =
      Array.isArray(parsed) ? parsed : Array.isArray(parsed?.messages) ? parsed.messages : [];

    if (list.length === 0) {
      return { totalMessages: 0, userMsgShare: 0.5, userQuestionRate: 0, targetQuestionRate: 0, targetAvgLen: 0 };
    }

    let userCount = 0;
    let targetCount = 0;
    let userQuestions = 0;
    let targetQuestions = 0;
    let targetLenSum = 0;

    for (const m of list) {
      const spk = (m.speaker || "").trim();
      const txt = String(m.text ?? m.message ?? m.content ?? "").trim();
      const isTarget = spk === targetSpeaker || spk === "SPEAKER_A";

      if (isTarget) {
        targetCount++;
        targetLenSum += txt.length;
        if (txt.includes("?")) targetQuestions++;
      } else {
        userCount++;
        if (txt.includes("?")) userQuestions++;
      }
    }

    const total = userCount + targetCount;
    return {
      totalMessages: total,
      userMsgShare: total > 0 ? userCount / total : 0.5,
      userQuestionRate: userCount > 0 ? userQuestions / userCount : 0,
      targetQuestionRate: targetCount > 0 ? targetQuestions / targetCount : 0,
      targetAvgLen: targetCount > 0 ? targetLenSum / targetCount : 0,
    };
  } catch {
    return { totalMessages: 0, userMsgShare: 0.5, userQuestionRate: 0, targetQuestionRate: 0, targetAvgLen: 0 };
  }
}

function computeDeterministicV3Metrics(
  rawV3: Partial<V3Metrics> | undefined,
  mvpResult: MvpAnalysisResult,
  stats: ConversationStats,
  analysisMode: AnalysisMode
): V3Metrics {
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(n)));

  const anx = mvpResult.dimensions?.anxiety?.score ?? 25;
  const avd = mvpResult.dimensions?.avoidance?.score ?? 40;
  const secFit = mvpResult.fitness?.secure ?? 45;

  const detectedSignals = Object.values(mvpResult.signals || {}).filter(
    (s: any) => s && typeof s === "object" && typeof s.count === "number" && s.count > 0
  ).length;

  // 1. Target stance tier -> base temperature (AI picks only the tier, code computes exact score)
  const validStances: TargetStanceTier[] = [
    "HARD_REJECT",
    "AVOIDANT_DISTANCE",
    "NEUTRAL_POLITE",
    "WARM_OPEN",
    "HIGH_AFFECTION",
  ];
  const fallbackStance: TargetStanceTier =
    avd >= 68 ? "AVOIDANT_DISTANCE" : avd >= 48 ? "NEUTRAL_POLITE" : "WARM_OPEN";
  const targetStance: TargetStanceTier = validStances.includes(rawV3?.target_stance as TargetStanceTier)
    ? (rawV3!.target_stance as TargetStanceTier)
    : fallbackStance;

  const stanceBaseTemp: Record<TargetStanceTier, number> = {
    HARD_REJECT: 20,
    AVOIDANT_DISTANCE: 34,
    NEUTRAL_POLITE: 47,
    WARM_OPEN: 58,
    HIGH_AFFECTION: 78,
  };

  // 2. User engagement tier -> base temperature
  const validEngagements: UserEngagementTier[] = ["PASSIVE", "BALANCED", "EAGER", "DESPERATE"];
  const fallbackEngagement: UserEngagementTier =
    anx >= 60 ? "DESPERATE" : anx >= 35 ? "EAGER" : "BALANCED";
  const userEngagement: UserEngagementTier = validEngagements.includes(
    rawV3?.user_engagement as UserEngagementTier
  )
    ? (rawV3!.user_engagement as UserEngagementTier)
    : fallbackEngagement;

  const engagementBaseTemp: Record<UserEngagementTier, number> = {
    PASSIVE: 44,
    BALANCED: 60,
    EAGER: 75,
    DESPERATE: 87,
  };

  // Guard against short screenshot noise (< 10 messages reduces objective ratio weight by half)
  const sampleWeight = stats.totalMessages >= 10 ? 1.0 : stats.totalMessages > 0 ? 0.5 : 0;

  // User temperature: engagement tier + anxiety adjustment + message share/question boost
  const userShareDelta = (stats.userMsgShare - 0.5) * 16 * sampleWeight;
  const userQDelta = Math.min(6, stats.userQuestionRate * 12) * sampleWeight;
  const userAnxDelta = Math.max(-5, Math.min(7, (anx - 30) * 0.14));
  const user_temperature = clamp(
    engagementBaseTemp[userEngagement] + userShareDelta + userQDelta + userAnxDelta,
    30,
    94
  );

  // Target temperature: stance tier + (secure - avoidance) calibration
  // IMPORTANT: Do NOT boost temperature for long messages or questions if stance is HARD_REJECT or AVOIDANT_DISTANCE
  // (protects against polite long rejections inflating temperature)
  const isClosedStance = targetStance === "HARD_REJECT" || targetStance === "AVOIDANT_DISTANCE";
  const mvpBalanceDelta = Math.max(-6, Math.min(6, (secFit - avd) * 0.09));
  const targetEngagementBoost = isClosedStance
    ? 0
    : (Math.min(5, stats.targetQuestionRate * 10) + (stats.targetAvgLen >= 18 ? 2 : 0)) * sampleWeight;

  // Cap WARM_OPEN (일상적 친밀감/예의상 잘 해주는 사이) at 66% so 75%+ is reserved for genuine HIGH_AFFECTION
  const stanceMaxTemp: Record<TargetStanceTier, number> = {
    HARD_REJECT: 28,
    AVOIDANT_DISTANCE: 43,
    NEUTRAL_POLITE: 54,
    WARM_OPEN: 66,
    HIGH_AFFECTION: 90,
  };

  const target_temperature = clamp(
    stanceBaseTemp[targetStance] + mvpBalanceDelta + targetEngagementBoost,
    14,
    stanceMaxTemp[targetStance]
  );

  // Success probability (재회/썸 성사 가능성)
  const oneSidedPenalty = Math.max(0, user_temperature - target_temperature - 22) * 0.22;
  const rawSuccess =
    target_temperature * 0.68 + secFit * 0.22 + (100 - avd) * 0.1 - oneSidedPenalty;
  const stanceMaxSuccess: Record<TargetStanceTier, number> = {
    HARD_REJECT: 28,
    AVOIDANT_DISTANCE: 46,
    NEUTRAL_POLITE: 56,
    WARM_OPEN: 68,
    HIGH_AFFECTION: 88,
  };
  const success_probability = clamp(rawSuccess, 12, stanceMaxSuccess[targetStance]);

  // Backfire risk (성급한 연락 주의 지수)
  const stanceRiskBase: Record<TargetStanceTier, number> = {
    HARD_REJECT: 82,
    AVOIDANT_DISTANCE: 68,
    NEUTRAL_POLITE: 50,
    WARM_OPEN: 36,
    HIGH_AFFECTION: 20,
  };
  const avdRiskDelta = (avd - 40) * 0.18;
  const gapRiskDelta = Math.max(0, user_temperature - target_temperature) * 0.15;
  const backfire_risk_percent = clamp(
    stanceRiskBase[targetStance] + avdRiskDelta + gapRiskDelta,
    15,
    92
  );

  return {
    target_stance: targetStance,
    user_engagement: userEngagement,
    user_temperature,
    target_temperature,
    success_probability,
    backfire_risk_percent,
    signal_count: Math.max(1, detectedSignals),
    tease_scene_summary:
      rawV3?.tease_scene_summary ||
      "대화 흐름과 답장 호흡에서 두 사람의 미묘한 온도차가 포착된 장면",
    headline_verdict:
      rawV3?.headline_verdict ||
      (analysisMode === "flirting"
        ? "호감과 조심스러움이 섞여 있어서, 부담 없는 템포 조절이 중요한 시점이에요."
        : "감정 소모를 피하려는 방어선이 보여서, 성급한 확인 연락보다 여유를 주는 게 좋아요."),
  };
}

export async function buildDerivedReportContext(
  conversationJson: string,
  targetSpeaker: string,
  mvpResult: MvpAnalysisResult,
  contextIntake?: { situation?: string; recurrence?: string; desired_focus?: string } | null,
  analysisMode: AnalysisMode = "reunion"
): Promise<DerivedReportContext> {
  const modeLabel =
    analysisMode === "flirting"
      ? "💘 썸 · 호감도 판독기 (초기 썸, 일상 연락, 밀당 의중 및 호감도 파악)"
      : "💔 재회 · 애매한 사이 판독기 (이별 전후, 시간 갖기, 거리두기, 미련 및 재회 가능성 파악)";

  const stats = extractConversationStats(conversationJson, targetSpeaker);

  const prompt = `
당신은 관계 및 대화 분석 전문가입니다.
선택된 분석 모드: ${modeLabel}
제공된 실제 대화 텍스트(RAW CONVERSATION)를 바탕으로, 두 사람 사이에 일어난 핵심 상호작용과 구체적인 장면들을 객관적으로 요약하세요.
반드시 아래 정의된 JSON 스키마 형식으로만 반환하세요.

★ [언어 및 한국어 조사 절대 규칙]: 
1. JSON의 모든 텍스트 값(value)은 반드시 자연스럽고 읽기 쉬운 한국어(~해요체 또는 자연스러운 구어체)로 작성해야 합니다. 영어를 절대 사용하지 마세요.
2. "사용자님", "분석 대상자", "피험자" 같은 딱딱한 보고서 호칭을 절대 쓰지 마세요! 리포트를 읽는 본인은 주어를 생략하거나 자연스럽게("먼저", "서운한 마음을 꺼내자") 표현하고, 상대(SPEAKER_A)는 "${targetSpeaker}" 또는 "상대"라고 부르세요.
3. 한국어 조사 표기 준수: 인물 호칭 뒤에 붙는 조사는 받침 유무에 맞게 정확히 표기하세요.
   - 받침이 있는 단어("상대방") 뒤에는 '은/이/을/과/으로', 받침이 없는 단어("상대") 뒤에는 '는/가/를/와/로'를 쓰세요.

★ [개인정보 보호 절대 규칙]:
대화 속 원문 문장을 그대로 따옴표로 인용하지 마세요. 구체적인 상황과 태도를 자연스러운 서술로 재구성하세요.
(예: "그만하자" ❌ -> 갈등 상황에서 대화를 더 이어가지 않고 종료하려는 의사를 밝힘 ⭕)

★ [화자 지칭 절대 규칙 - 매우 중요!]:
- ${targetSpeaker} (SPEAKER_A) = 속마음을 판독하려는 **"상대"**입니다.
- 대화 파트너 (SPEAKER_B) = 이 분석을 의뢰한 **본인**입니다. 절대 "사용자님"이나 "상대방"으로 부르지 말고, 문맥상 자연스럽게 주어를 생략하거나 "내가"로 표현하세요!

★ [V3 태도 등급 판별 기준 - 숫자가 아닌 아래 코드 중 1개씩만 정확히 선택하세요!]:
1. target_stance (상대방 ${targetSpeaker}의 실제 문맥 태도 - 아래 5개 중 택 1):
   - "HARD_REJECT": 길게 적었든 짧게 적었든 "연락 그만하자", "이젠 정리하자", "불편하다"처럼 명확히 선을 긋거나 거절하는 문맥
   - "AVOIDANT_DISTANCE": "피곤하다", "나중에 얘기하자", "혼자 있고 싶다"처럼 대화를 미루고 방어벽을 치는 문맥
   - "NEUTRAL_POLITE": 거절은 아니지만 미안함·해명·무난한 일상 안부 정도로 조심스럽게 응대하는 문맥
   - "WARM_OPEN": 상대가 먼저 질문을 던지거나 일상·관심사를 자연스럽게 공유하며 대화를 이어가는 문맥
   - "HIGH_AFFECTION": 다정한 표현, 애정, 보고 싶다는 말이나 적극적인 만남 추진이 드러나는 문맥
2. user_engagement (본인 SPEAKER_B의 감정 몰입도 - 아래 4개 중 택 1):
   - "PASSIVE": 짧고 담백하게 반응하거나 먼저 다가가지 않는 편
   - "BALANCED": 과하지 않게 비슷한 호흡으로 대화를 주고받는 편
   - "EAGER": 먼저 안부를 묻거나 서운함·궁금증을 적극적으로 표현하는 편
   - "DESPERATE": 장문으로 마음을 호소하거나 반복 확인·재회를 간절히 요청하는 편

★ [구체적 장면 요약 원칙 (key_situations)]:
- 대화에서 실제로 오간 주요 장면(약속 제안, 일정 조율 및 변경, 취소 및 사과, 일상 화제 교류 등)을 2~4개 추출하세요.
- 실제 대화에 갈등이나 침묵이 없었다면, 억지로 회피형 신호를 꾸며내지 말고 실제 오간 사실(일정 조율, 협조적 대화 등)을 있는 그대로 객관적으로 서술하세요.
- "target_behavior"에는 반드시 ${targetSpeaker}가 취한 구체적 반응을 기술하세요.
- "other_person_behavior"에는 본인(SPEAKER_B)이 취한 구체적 반응을 기술하세요.
- "interaction_result"에는 해당 장면이 어떻게 일단락되었는지를 기술하세요.

${contextIntake ? `
[사용자 설문 배경 맥락 (조언 관점 참고용)]:
- 대화 당시 상황: ${contextIntake.situation || "미입력"}
- 이전 반응 빈도: ${contextIntake.recurrence || "미입력"}
- 가장 알고 싶은 점: ${contextIntake.desired_focus || "미입력"}
` : ""}

[MVP 점수 결과]:
${JSON.stringify(mvpResult, null, 2)}

[실제 대화 텍스트 (RAW CONVERSATION)]:
${conversationJson}

[반환 JSON 스키마 - 순수 JSON만 반환]:
{
  "relationship_context": "대화 전체를 통해 본 두 사람의 관계 및 상호작용 흐름 요약 (한국어 1~2문장, '사용자님' 금지)",
  "v3_metrics": {
    "target_stance": "HARD_REJECT | AVOIDANT_DISTANCE | NEUTRAL_POLITE | WARM_OPEN | HIGH_AFFECTION 중 1개",
    "user_engagement": "PASSIVE | BALANCED | EAGER | DESPERATE 중 1개",
    "tease_scene_summary": "무료 결과 첫 줄에 띄울 카톡 핵심 장면 요약 1줄 ('사용자님' 금지, 원문 인용 금지. 예: 서운한 마음을 꺼내며 대화를 요청했지만, 상대가 피곤하다며 답을 미룬 장면)",
    "headline_verdict": "현재 관계의 핵심 진단을 말 건네듯 직설적인 1줄로 요약 (~해요 체)"
  },
  "key_situations": [
    {
      "situation": "실제 발생한 대화 상황이나 화제 ('사용자님' 단어 금지)",
      "target_behavior": "${targetSpeaker}이(가) 보인 구체적 행동 및 발화 태도 ('분석 대상자' 금지)",
      "other_person_behavior": "본인(SPEAKER_B)이 보인 행동 및 반응 ('사용자님' 금지)",
      "interaction_result": "해당 장면의 마무리 및 결과"
    }
  ],
  "key_patterns": [
    {
      "signal_id": "관련 신호 ID (예: AV02, 없으면 NONE)",
      "observation": "대화에서 관찰된 실제 태도 서술 (한국어)",
      "counterpoint": "함께 관찰된 긍정적이거나 협조적인 태도 (한국어, 선택사항)"
    }
  ],
  "trigger_candidates": ["상대방의 반응이나 감정이 유발된 구체적 순간들 (한국어)"],
  "interaction_patterns": ["두 사람 사이에 오간 상호작용 핑퐁 양상 (한국어)"],
  "counter_evidence": ["애착 방어기제와 상반되는 건강하고 우호적인 행동들 (한국어)"],
  "healthy_patterns": ["대화에서 확인된 안정적이고 배려 깊은 소통 모습들 (한국어)"]
}
`;

  try {
    const response = await callResilientLLM(prompt);
    const rawOutput = response.content;
    const jsonStr = extractJsonSubstring(rawOutput);
    if (!jsonStr) {
      throw new Error("Failed to extract JSON from Derived Context AI response");
    }
    const parsed = JSON.parse(jsonStr) as DerivedReportContext;
    parsed.analysis_mode = analysisMode;
    parsed.v3_metrics = computeDeterministicV3Metrics(
      parsed.v3_metrics,
      mvpResult,
      stats,
      analysisMode
    );
    return parsed;
  } catch (e: any) {
    console.error("Context Builder Error:", e);
    return {
      analysis_mode: analysisMode,
      v3_metrics: computeDeterministicV3Metrics(undefined, mvpResult, stats, analysisMode),
      relationship_context: "대화 흐름을 바탕으로 두 사람의 관계 온도를 정리했어요.",
      key_situations: [],
      key_patterns: [],
      trigger_candidates: [],
      interaction_patterns: [],
      counter_evidence: [],
      healthy_patterns: [],
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
