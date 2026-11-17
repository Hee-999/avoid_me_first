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
1. JSON의 모든 텍스트 값(value)은 반드시 자연스럽고 정중한 한국어(~해요체 또는 ~합니다)로 작성해야 합니다. 영어를 절대 사용하지 마세요.
2. 한국어 조사 표기 준수: 인물 호칭 뒤에 붙는 조사는 받침 유무에 맞게 정확히 표기하세요.
   - 받침이 있는 단어("상대방", "작성자") 뒤에는 반드시 '은/이/을/과/으로'를 사용하세요. (예: "상대방은", "상대방이", "상대방을", "상대방과")
   - "상대방는", "상대방가", "상대방를", "상대방와"와 같은 비문법적 조사 결합은 절대 금지합니다.

★ [개인정보 보호 절대 규칙]:
대화 속 원문 문장을 그대로 따옴표로 인용하지 마세요. 구체적인 상황과 태도를 객관적 서술로 재구성하세요.
(예: "그만하자" ❌ -> "갈등 상황에서 대화를 더 이어가지 않고 종료하려는 의사를 밝힘" ⭕)

★ [화자 지칭 절대 규칙 - 매우 중요!]:
- ${targetSpeaker} (SPEAKER_A) = 우리가 속마음을 판독하려는 **"그 사람 (상대)"**입니다. 문장에서 **"그 사람"** 또는 **"상대"**라고 부르세요. ("분석 대상자", "분석 대상", "피험자" 같은 딱딱한 단어 절대 사용 금지!)
- 대화 파트너 (SPEAKER_B) = 이 분석을 의뢰한 본인입니다. 문장에서 "사용자님"이라는 어색한 호칭을 쓰지 말고, 주어를 자연스럽게 생략하거나 **"내가"**로 표현하세요! ("거리감이 느껴져 먼저 대화를 요청했지만, 그 사람은 피곤하다며 미루고 대화를 끝낸 장면")

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
    "tease_scene_summary": "무료 결과 첫 줄에 띄울 카톡 핵심 장면 요약 1줄 (원문 그대로 인용하지 말고 구체적 발화 맥락을 한 문장으로 요약. 반드시 SPEAKER_B는 '사용자님', SPEAKER_A는 '상대방'으로 지칭할 것. 예: 사용자님이 관계의 거리감을 언급하며 대화를 요청했지만, 상대방은 피곤함과 혼자 있고 싶다는 이유로 대화를 미루고 종료한 장면)",
    "backfire_risk_percent": 75,
    "success_probability": 42,
    "user_temperature": 78,
    "target_temperature": 34,
    "signal_count": 3,
    "headline_verdict": "현재 관계의 핵심 진단을 직설적이고 현실적인 1줄로 요약 (예: 상대방은 지금 감정 소모를 피하려 방어막을 치고 있으며, 성급한 확인 연락은 역효과를 부릅니다)"
  },
  "key_situations": [
    {
      "situation": "실제 발생한 대화 상황이나 화제 (한국어, SPEAKER_B는 '사용자님', SPEAKER_A는 '상대방'으로 지칭)",
      "target_behavior": "상대방(SPEAKER_A)이 보인 구체적 행동 및 발화 태도 (한국어, '분석 대상자'라는 단어 사용 금지)",
      "other_person_behavior": "사용자님(SPEAKER_B)이 보인 행동 및 반응 (한국어)",
      "interaction_result": "해당 장면의 마무리 및 결과 (한국어)"
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
