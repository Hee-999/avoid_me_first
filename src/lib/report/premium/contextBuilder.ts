import { callResilientLLM } from "../../analysis/llmRouter";
import { MvpAnalysisResult } from "../../analysis/mvp/types";
import { DerivedReportContext } from "./types";

export async function buildDerivedReportContext(
  conversationJson: string,
  targetSpeaker: string,
  mvpResult: MvpAnalysisResult,
  contextIntake?: { situation?: string; recurrence?: string; desired_focus?: string } | null
): Promise<DerivedReportContext> {
  const prompt = `
당신은 관계 및 대화 분석 전문가입니다.
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

분석 대상 화자: ${targetSpeaker}
상대방: 대화 상대자

★ [구체적 장면 요약 원칙 (key_situations)]:
- 대화에서 실제로 오간 주요 장면(약속 제안, 일정 조율 및 변경, 취소 및 사과, 일상 화제 교유 등)을 2~4개 추출하세요.
- 실제 대화에 갈등이나 침묵이 없었다면, 억지로 회피형 신호를 꾸며내지 말고 실제 오간 사실(일정 조율, 협조적 대화 등)을 있는 그대로 객관적으로 서술하세요.
- "target_behavior"에는 반드시 ${targetSpeaker}가 취한 구체적 반응을 기술하세요.
- "other_person_behavior"에는 상대방이 취한 구체적 반응을 기술하세요.
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
  "key_situations": [
    {
      "situation": "실제 발생한 대화 상황이나 화제 (한국어)",
      "target_behavior": "분석 대상자(${targetSpeaker})가 보인 구체적 행동 및 발화 태도 (한국어)",
      "other_person_behavior": "상대방이 보인 행동 및 반응 (한국어)",
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
