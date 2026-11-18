import { callResilientLLM } from "../../analysis/llmRouter";
import { MvpAnalysisResult } from "../../analysis/mvp/types";
import { AnalysisMode, DerivedReportContext } from "./types";

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
- 대화 파트너 (SPEAKER_B) = 이 분석을 의뢰한 **본인**입니다. 절대 "사용자님"이나 "상대방"으로 부르지 말고, 문맥상 자연스럽게 주어를 생략하거나 "내가"로 표현하세요! (예: "이별 후 보고 싶다고 먼저 연락하자, 상대는 연락을 끊는 편이 낫겠다고 선을 그은 장면")

★ [V3 수치(v3_metrics) 산정 기준 - 예시 숫자 복사 절대 금지!]:
반드시 [MVP 점수 결과](불안·회피·안정형 적합도)와 [실제 대화 텍스트]의 분위기·거절 강도·여지 유무를 종합해서 매번 새롭게 계산하세요:
- user_temperature (0~100 정수): 대화에서 본인(SPEAKER_B)이 감정을 표현하고, 먼저 연락하거나 관계를 이어가려는 적극성/몰입도 (소극적이면 40~55, 보통이면 56~72, 간절히 매달리거나 장문으로 마음을 전하면 73~92)
- target_temperature (0~100 정수): 대화에서 상대(SPEAKER_A)가 보여주는 실제 호감·배려·대화 의지 온도 (단호한 거절·연락 차단이면 15~30, 피로·거리두기·회피면 31~49, 미안함·해명·일상 안부가 섞여 있으면 50~66, 다정하고 적극적이면 67~90)
- success_probability (0~100 정수): 현재 대화 흐름 기준 재회/썸 진전 가능성 (단절 선언이면 15~32, 방어적이지만 여지가 남았으면 35~58, 사과/해명/소통 의지가 보이면 60~85)
- backfire_risk_percent (0~100 정수): 지금 당장 성급하게 확인·추궁 연락을 보냈을 때 상대가 더 닫힐 위험도 (단호한 거절·회피 60 이상이면 70~89, 조심스러운 거리두기면 48~69, 안정적 소통이면 20~45)
- signal_count (1~6 정수): 대화에서 포착된 주요 심리/방어 시그널 개수 (MVP 점수 결과의 count > 0인 신호 수 참고)

★ [구체적 장면 요약 원칙 (key_situations)]:
- 대화에서 실제로 오간 주요 장면(약속 제안, 일정 조율 및 변경, 취소 및 사과, 일상 화제 교류 등)을 2~4개 추출하세요.
- 실제 대화에 갈등이나 침묵이 없었다면, 억지로 회피형 신호를 꾸며내지 말고 실제 오간 사실(일정 조율, 협조적 대화 등)을 있는 그대로 객관적으로 서술하세요.
- "target_behavior"에는 반드시 그 사람(SPEAKER_A, ${targetSpeaker})이 취한 구체적 반응을 기술하세요.
- "other_person_behavior"에는 본인(SPEAKER_B)이 취한 구체적 반응을 기술하세요.
- "interaction_result"에는 해당 장면이 어떻게 일단락되었는지를 기술하세요.

${contextIntake ? `
[사용자 설문 배경 맥락 (조언 관점 참고용)]:
- 대화 당시 상황: ${contextIntake.situation || "미입력"}
- 이전 반응 빈도: ${contextIntake.recurrence || "미입력"}
- 가장 알고 싶은 점: ${contextIntake.desired_focus || "미입력"}

★ [설문 분리 절대 원칙]:
- 사용자가 '가끔 반복' 등을 선택했더라도, 실제 대화에 없는 갈등·침묵·거리두기 행동을 허위로 지어내지 마세요.
- 설문 내용은 조언을 제공할 때 사용자의 관심사(${contextIntake.desired_focus || "관계 패턴"})에 초점을 맞추는 렌즈로만 활용하세요.
` : ""}

[MVP 점수 결과]:
${JSON.stringify(mvpResult, null, 2)}

[실제 대화 텍스트 (RAW CONVERSATION)]:
${conversationJson}

[반환 JSON 스키마 - 순수 JSON만 반환]:
{
  "relationship_context": "대화 전체를 통해 본 두 사람의 관계 및 상호작용 흐름 요약 (한국어 1~2문장)",
  "v3_metrics": {
    "tease_scene_summary": "무료 결과 첫 줄에 띄울 카톡 핵심 장면 요약 1줄 ('사용자님' 금지, 원문 인용 금지. 예: 서운한 마음을 꺼내며 대화를 요청했지만, 상대가 피곤하다며 답을 미룬 장면)",
    "backfire_risk_percent": "<정수 20~90: 위 산정 기준에 따라 실제 대화에 맞게 계산>",
    "success_probability": "<정수 15~88: 위 산정 기준에 따라 실제 대화에 맞게 계산>",
    "user_temperature": "<정수 40~92: 위 산정 기준에 따라 실제 대화에 맞게 계산>",
    "target_temperature": "<정수 15~90: 위 산정 기준에 따라 실제 대화에 맞게 계산>",
    "signal_count": "<정수 1~6: 실제 포착된 심리 시그널 수>",
    "headline_verdict": "현재 관계의 핵심 진단을 말 건네듯 직설적인 1줄로 요약 (~해요 체, 예: 지금은 감정이 식었다기보다, 대화 부담이 커져서 잠깐 선을 긋고 있는 상태예요)"
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

    // Clamp & sanitize v3_metrics numeric fields in case model returns stringified numbers
    if (parsed.v3_metrics) {
      const clampInt = (v: any, min: number, max: number, fallback: number) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(min, Math.min(max, Math.round(n)));
      };
      const anx = mvpResult.dimensions?.anxiety?.score ?? 25;
      const avd = mvpResult.dimensions?.avoidance?.score ?? 45;
      const secFit = mvpResult.fitness?.secure ?? 45;
      const detectedSignals = Object.values(mvpResult.signals || {}).filter(
        (s: any) => s && typeof s === "object" && typeof s.count === "number" && s.count > 0
      ).length;

      parsed.v3_metrics.user_temperature = clampInt(
        parsed.v3_metrics.user_temperature,
        30,
        95,
        Math.min(90, Math.max(48, Math.round(58 + anx * 0.3)))
      );
      parsed.v3_metrics.target_temperature = clampInt(
        parsed.v3_metrics.target_temperature,
        10,
        95,
        Math.min(88, Math.max(20, Math.round(75 - avd * 0.55)))
      );
      parsed.v3_metrics.success_probability = clampInt(
        parsed.v3_metrics.success_probability,
        10,
        95,
        Math.min(88, Math.max(22, Math.round(secFit * 0.5 + (100 - avd) * 0.4)))
      );
      parsed.v3_metrics.backfire_risk_percent = clampInt(
        parsed.v3_metrics.backfire_risk_percent,
        15,
        95,
        Math.min(90, Math.max(28, Math.round(32 + avd * 0.6)))
      );
      parsed.v3_metrics.signal_count = clampInt(
        parsed.v3_metrics.signal_count,
        1,
        8,
        Math.max(1, detectedSignals)
      );
    }

    return parsed;
  } catch (e: any) {
    console.error("Context Builder Error:", e);
    // Return a fallback context so the pipeline doesn't break entirely, 
    // though the report will be less personalized.
    return {
      analysis_mode: analysisMode,
      v3_metrics: {
        tease_scene_summary: "상대방의 답장 호흡과 감정 표현에서 미묘한 온도차가 포착된 장면",
        backfire_risk_percent: 68,
        success_probability: 45,
        user_temperature: 72,
        target_temperature: 38,
        signal_count: 2,
        headline_verdict: "현재 대화 흐름에서는 성급하게 결론을 내리거나 재촉하기보다 상대의 방어선을 먼저 파악해야 합니다."
      },
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
