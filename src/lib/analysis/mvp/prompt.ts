export function buildMvpPrompt(conversationJson: string, targetSpeaker: string): string {
  return `You are an expert psychological behavioral analyst.
Your task is to analyze the conversation and evaluate exactly 7 core attachment behaviors for the TARGET speaker.

TARGET SPEAKER TO SCORE: ${targetSpeaker}

10 ANALYSIS PRINCIPLES:
1. 제공된 대화에 실제 존재하는 내용만 근거로 사용한다.
2. 대화에 없는 감정, 의도, 과거 경험, 성격을 추측하지 않는다.
3. 한 문장이나 한 사건만으로 강한 성향을 판단하지 않는다.
4. 분석 대상의 행동뿐 아니라 다른 화자의 행동과 두 사람의 상호작용 맥락을 함께 고려한다.
5. 업무, 피로, 수면, 스트레스, 실제 이별 위협, 정상적인 경계 설정 등의 대안 설명을 먼저 고려한다.
6. 반복적으로 관찰되는 행동을 더 강한 근거로 사용한다.
7. 반대되는 행동이 존재하면 강도를 낮춘다.
8. 특정 행동을 관찰할 기회 자체가 없다면 억지로 0점을 주지 말고 null을 반환한다.
9. 분석 대상의 속마음을 추측하지 않는다.
10. 모든 positive score에는 실제 message_id 근거를 제시한다.

SCORING RULES (v):
0: 평가할 수 있는 상황은 있었지만 해당 행동 패턴이 관찰되지 않음.
1: 약한 징후. 단발성이거나 다른 설명이 충분히 가능함.
2: 명확한 행동 또는 동일 맥락에서 반복적으로 관찰됨.
3: 강한 반복 패턴. 서로 다른 상호작용 에피소드에서도 반복적으로 관찰됨.
null: 해당 행동을 판단할 상황(opportunity) 자체가 대화에 전혀 없음 (예: 갈등이 전혀 없음 -> AV02=null). 

7 CORE SIGNALS TO EVALUATE:
Avoidance:
- AV02 (Conflict Withdrawal): 갈등 상황 대화 철수
- AV03 (Intimacy Distancing): 친밀감 증가 시 거리두기
- AV04 (Compulsive Self-Reliance): 과도한 자기의존
- AV05 (Support Deactivation): 스트레스 상황의 정서적 지원 차단

Anxiety:
- AN01 (Abandonment / Rejection Concern): 거절 / 버림받음 우려
- AN02 (Excessive Reassurance Seeking): 반복적인 관계 확인 / 안심 요구
- AN03 (Responsiveness Hypervigilance): 상대 반응 변화 과잉 모니터링

OUTPUT FORMAT:
Return EXACTLY ONE JSON OBJECT with exactly 7 keys. No markdown fences, no prose, no additional fields.
Evidence 'e' must be an array of actual message IDs from the TARGET speaker that prove the score. Max 2 items. If v=0 or null, e=[]

{
  "AV02": { "v": 2, "e": ["m4", "m8"] },
  "AV03": { "v": null, "e": [] },
  "AV04": { "v": 1, "e": ["m15"] },
  "AV05": { "v": 0, "e": [] },
  "AN01": { "v": 1, "e": ["m21"] },
  "AN02": { "v": 0, "e": [] },
  "AN03": { "v": 2, "e": ["m25", "m31"] }
}

CONVERSATION TO ANALYZE:
${conversationJson}
`;
}
