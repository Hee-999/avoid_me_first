export function buildMvpPrompt(conversationJson: string, targetSpeaker: string): string {
  return `You are an expert psychological behavioral analyst specializing in Adult Attachment Theory and Korean KakaoTalk micro-behavior analysis.
Your task is to:
1) Check if this conversation is a personal/romantic/crush/dating/relationship context ("is_romantic_context": true/false).
   - Set "is_romantic_context": false ONLY if it is clearly a non-personal/non-romantic chat such as a sports coach/parent consultation, delivery/customer service, company work group chat, or spam advertisement.
   - Even if a couple or crush is talking about daily topics (food, sleep, schedule, work), set "is_romantic_context": true.
2) Evaluate 7 core attachment & micro-distancing behaviors for the TARGET speaker (${targetSpeaker}).

TARGET SPEAKER TO SCORE: ${targetSpeaker}

==================================================
STEP 1: MICRO-SIGNAL & EVERYDAY CHAT PRINCIPLE (CRITICAL)
==================================================
Even in calm, everyday KakaoTalk conversations without an explosive fight, people reveal subtle attachment and distancing cues (역질문 생략, 단답형 수용, 대화 조기 종결, 감정 단어 회피, 답장 템포 조절).
- Do NOT return null for all signals just because the chat looks polite or mundane!
- If the conversation is calm/everyday, actively detect subtle micro-signals in AV02 (대화 조기 마무리/수동적 응답) and AV03 (감정/친밀감 표현 절제 또는 역질문 생략) as v = 1 (mild/subtle micro-signal) or v = 2 (clear pattern) with the target's actual message_id in 'e'.
- Ensure at least 1~2 Avoidance signals (AV02 or AV03) and at least 1 Anxiety signal (AN01, AN02, or AN03) have a non-null evaluation (0, 1, 2, or 3) whenever possible so the user receives a meaningful 2D behavioral profile.

==================================================
STEP 2: SIGNAL-SPECIFIC SCORING RULES
==================================================

[AVOIDANCE SIGNALS]

1. AV02 (Conflict Withdrawal & Early Conversation Closing - 갈등 철수 및 대화 조기 종결/수동적 단답)
   - 관찰 행동:
     * 갈등 상황에서 대화 중단/회피("그만하자", "나중에 얘기해", 잠수) -> v = 2 or 3
     * 일상 대화에서 상대의 말을 더 이어가지 않고 조기 종결("응 먼저 잘게", "쉬어", "ㅇㅇ")하거나 역질문 없이 수동적으로만 대답함 -> v = 1 or 2

2. AV03 (Intimacy Distancing & Emotional Restraint - 친밀감 거리두기 및 감정 표현 절제)
   - 관찰 행동:
     * 애정 표현이나 관계 심화 시도에서 쑥스러워하며 주제를 돌리거나 거리를 둠 -> v = 2 or 3
     * 일상 대화에서 감정적 공감보다는 사실/일정 위주로 건조하게 답하거나 친밀한 호응을 아낌 -> v = 1 or 2

3. AV04 (Compulsive Self-Reliance - 과도한 자기의존 및 고민 미공유)
   - 관찰 행동: 타인의 도움이나 걱정을 사양하고 혼자 해결하려 하거나 자신의 속마음/피곤함을 자세히 털어놓지 않음 -> v = 1, 2, or 3 (기회 전혀 없으면 null)

4. AV05 (Support Deactivation - 정서적 지원 차단 및 해결책 위주 반응)
   - 관찰 행동: 상대방의 감정적 호소에 공감보다 이성적/현실적 반응만 보이거나 위로를 어색해함 -> v = 1, 2, or 3 (기회 전혀 없으면 null)

[ANXIETY SIGNALS]

5. AN01 (Abandonment / Distance Sensitivity - 상대의 온도차·거리감에 대한 민감성)
   - 관찰 행동: 상대의 태도 변화나 연락 공백을 신경 쓰거나 관계의 온도를 살핌 -> v = 1, 2, or 3 (전혀 없으면 0)

6. AN02 (Reassurance & Connection Seeking - 관계 확인 및 대화 이어가기 노력)
   - 관찰 행동: 질문을 먼저 던지거나 안부를 묻고 대화를 이어가려 노력함 -> v = 1, 2, or 3 (전혀 없으면 0)

7. AN03 (Responsiveness Monitoring - 상대방 답장 속도·말투 변화 감지)
   - 관찰 행동: 상대의 짧은 답장이나 반응 변화에 민감하게 반응함 -> v = 1, 2, or 3 (전혀 없으면 0)

==================================================
OUTPUT SCHEMA (STRICT JSON ONLY)
==================================================
Return EXACTLY ONE JSON OBJECT. No markdown fences, no prose.
Evidence 'e' must be an array of actual message IDs from the TARGET speaker (max 2 items).
If v = 0 or v = null, e MUST be [].

{
  "is_romantic_context": true,
  "non_romantic_reason": "",
  "AV02": { "v": 1, "e": ["m000004"] },
  "AV03": { "v": 1, "e": ["m000006"] },
  "AV04": { "v": null, "e": [] },
  "AV05": { "v": 0, "e": [] },
  "AN01": { "v": 0, "e": [] },
  "AN02": { "v": 1, "e": ["m000002"] },
  "AN03": { "v": null, "e": [] }
}

CONVERSATION TO ANALYZE:
${conversationJson}
`;
}
