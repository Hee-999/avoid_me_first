export function buildMvpPrompt(conversationJson: string, targetSpeaker: string): string {
  return `You are an expert psychological behavioral analyst specializing in Adult Attachment Theory.
Your task is to analyze the conversation and evaluate exactly 7 core attachment behaviors for the TARGET speaker.

TARGET SPEAKER TO SCORE: ${targetSpeaker}

==================================================
STEP 1: 0 vs null EVALUATION PRINCIPLE (CRITICAL)
==================================================
For every signal, you MUST FIRST ask:
"Did an actual, real opportunity/context to observe this specific behavior exist in this conversation?"

A. NO OPPORTUNITY (insufficient context):
   → v = null, e = []
   → "대화에서 해당 행동이 안 보였다"와 "그 행동을 평가할 상황 자체가 없었다"는 완전히 다릅니다!
   → 상황 자체가 없어서 관찰할 기회가 없었던 항목은 절대 0을 주지 말고 반드시 null을 반환하세요.
   → null로 처리된 신호는 분모에서 제외되어 점수가 부당하게 희석(하향평준화)되지 않습니다.
   → ★ 기회 부재 구체적 기준 (절대 0 금지, 반드시 null):
     * 대화가 오직 갈등 해결 시도뿐이고 애정/스킨십/친밀감 증진 시도가 전혀 없다면: AV03 = null (0이 아님!)
     * 상대방이 위로/정서적 지원을 제공하려 한 적이 없다면: AV05 = null (0이 아님!)
     * 도움/의존/지원 관련 대화가 없다면: AV04 = null (0이 아님!)
     * 상대방의 거리두기나 불확실성 자극이 없다면: AN01, AN02, AN03 = null (0이 아님!)

B. OPPORTUNITY EXISTED, BUT BEHAVIOR NOT OBSERVED (not detected):
   → v = 0, e = []
   → 해당 행동이 나타날 만한 충분한 상황/자극(예: 상대의 애정표현, 위로 시도, 갈등 해결 시도 등)이 주어졌으나, 대상자가 그 방어기제를 쓰지 않고 건강하게 수용한 경우에만 0을 부여하세요.

C. OPPORTUNITY EXISTED, AND BEHAVIOR OBSERVED (detected):
   → v = 1, 2, or 3, e = ["message_id", ...]
   → 실제 관찰된 행동의 강도에 따라 평가하며, 반드시 해당 발화의 message_id를 e 배열에 포함하세요.

==================================================
STEP 2: SIGNAL-SPECIFIC OPPORTUNITY & SCORING RULES
==================================================

[AVOIDANCE SIGNALS]

1. AV02 (Conflict Withdrawal - 갈등 상황 대화 철수)
   - Opportunity 조건:
     갈등, 서운함 표현, 관계 문제 제기, 또는 해결을 위한 진지한 대화 시도가 대화에 실제로 존재할 때만 평가 가능.
   - 관찰 행동: 대화 일방적 중단, 퇴장("그만하자", "나 잘게", "나중에 얘기해"), 잠수, 회피.
   - ★ 주의 (Temporary Pause vs Withdrawal):
     감정이 격해져서 "지금 감정이 올라와서 30분 뒤에 얘기하자"와 같이 명확한 재논의 시점을 제시하고 실제로 대화를 재개한 경우(temporary pause with resumption)는 회피(AV02)로 잡지 말고 v = 0 (not_detected)으로 처리하세요.
   - Strength & Episode 원칙:
     * 1: 단발성 미루기 또는 경미한 완곡한 회피
     * 2: 동일 에피소드(단일 갈등 세션) 내에서 명확한 회피 반응이 반복됨
     * 3: 서로 다른 "독립된 에피소드(날짜 변경, 상황/주제 전환)"에서 반복적으로 갈등 철수를 선택함
     * ★ 중요: 같은 날 같은 갈등에서 1~2시간 침묵하거나 여러 번 "그만하자"를 반복하더라도 그것은 1개의 에피소드이므로 반드시 최대 Strength 2입니다. Strength 3은 오직 날짜가 바뀌거나 완전히 독립된 별개의 사건에서 재발할 때만 허용됩니다.

2. AV03 (Intimacy Distancing - 친밀감 증가 시 거리두기)
   - Opportunity 조건:
     애정 표현, 스킨십, 사랑 고백, 관계 심화, 연인 간 친밀감 요구, 결혼/진지한 미래 계획 등 "긍정적 친밀감이 가까워지는 상황"이 실제로 존재할 때만 평가 가능!
   - 관찰 행동: 상대가 다가오거나 애정을 표현할 때 냉소, 주제 돌리기, 부담감 표출, 거리두기.
   - ★ 중복 및 오분류 방지 절대 규칙:
     * 갈등을 해결하자고 하거나 내일 다시 얘기하자며 일정을 잡는 것("내일 저녁은 어때?", "시간 정하자")은 갈등 해결 시도(AV02 맥락)일 뿐이며, 친밀감(AV03) 기회가 아닙니다!
     * 단순히 싸우거나 갈등 상황에서 대화를 피했다는 이유로 AV03의 기회가 있었다고 판단하지 마세요.
     * 대화 전체에 애정/친밀감 증가 시도가 전혀 없었다면 AV03은 반드시 null 이어야 합니다!
     * 현실적인 조건(출퇴근 거리, 직장 등)으로 인한 건강한 경계 설정은 거리두기로 오분류하지 마세요.

3. AV04 (Compulsive Self-Reliance - 과도한 자기의존)
   - Opportunity 조건:
     도움 요청, 지원 제안, 의존/돌봄 관련 대화, 힘든 상황에서 타인의 도움을 받을 수 있는 맥락이 실제로 존재할 때만 평가 가능!
   - 관찰 행동: 타인의 호의나 지원을 완강히 거부하고, 고통이나 문제를 공유하지 않고 오직 혼자서만 감당하려 고집함.
   - ★ 중복 방지 절대 규칙:
     "나 혼자 있고 싶어", "오늘은 그만 얘기하자" 같은 갈등 철수 표현은 AV02일 뿐이며, 이를 AV04로 중복 판정하거나 기회로 보지 마세요. 도움/지원 관련 맥락이 없었다면 AV04 = null 입니다.

4. AV05 (Support Deactivation - 정서적 지원 차단)
   - Opportunity 조건:
     대상자가 힘들거나 스트레스 상황에 있고, 상대방이 위로/정서적 지지를 제공하거나 주려고 시도한 상황이 실제로 존재할 때만 평가 가능!
   - 관찰 행동: 상대방의 정서적 위로나 공감, 지지를 매몰차게 차단, 폄하, 거부함.
   - ★ 중복 방지 절대 규칙:
     단순 갈등 회피를 AV05로 중복 판정하지 마세요. 상대의 정서 지원 시도가 없었다면 AV05 = null 입니다.

[ANXIETY SIGNALS]

5. AN01 (Abandonment / Rejection Concern - 거절·버림받음 우려)
   - Opportunity 조건:
     상대방의 물리적/정서적 거리두기, 애매한 반응, 관계의 불확실성이 존재하는 상황일 때만 평가 가능.
   - 관찰 행동: 상대가 나를 떠나거나 버릴 것이라는 두려움을 직접적/간접적으로 표현.
   - ★ 주의: 실제 이별 통보(actual breakup threat - "헤어질 생각도 하고 있어")나 상대방의 명백한 잘못에 대해 자연스럽게 불안해하는 것은 병리적 애착 불안이 아니므로 과대평가하지 마세요 (v = 0 또는 ambiguous).

6. AN02 (Excessive Reassurance Seeking - 반복적 관계 확인·안심 요구)
   - Opportunity 조건:
     상대방이 이미 확인이나 안심을 주었음에도 불구하고 계속되는지 볼 수 있는 맥락일 때만 평가 가능.
   - 관찰 행동: 상대의 감정이나 관계 상태에 대해 "아직도 나 사랑해?", "진짜 화 안 났어?" 등을 반복적으로 묻고 재확인을 요구함.

7. AN03 (Responsiveness Hypervigilance - 상대 반응 변화 과잉 모니터링)
   - Opportunity 조건:
     상대의 일상적인 답장 지연, 짧은 대답, 말투의 미세한 변화 등이 있을 때만 평가 가능.
   - 관찰 행동: 말투, 점(.), 이모티콘 유무, 답장 속도 등의 사소한 변화를 관계 위기로 확대 해석하여 즉각 추궁하거나 불안해함.
   - ★ 주의: 상대가 일방적으로 밤늦게 연락을 멈추거나 정상적인 경계(boundary)를 요청했을 때 정상적인 확인을 하는 것은 과잉 모니터링으로 과대평가하지 마세요.

==================================================
STEP 3: SINGLE ACTION MULTI-TAGGING FORBIDDEN (중복 귀속 금지)
==================================================
동일한 발화/행동 하나를 여러 signal에 중복 귀속하지 마세요.
예를 들어 갈등 상황에서 "오늘은 그만하자", "나 좀 혼자 있고 싶어", "나중에 얘기하자"는
오직 AV02 (갈등 철수) 하나에만 해당합니다.
이를 AV03, AV04, AV05에 중복해서 부여하지 마세요.

==================================================
OUTPUT SCHEMA (STRICT JSON ONLY)
==================================================
Return EXACTLY ONE JSON OBJECT with exactly 7 keys. No markdown fences, no prose.
Evidence 'e' must be an array of actual message IDs from the TARGET speaker that prove the score. Max 2 items.
If v = 0 or v = null, e MUST be [].

{
  "AV02": { "v": 2, "e": ["m000004", "m000008"] },
  "AV03": { "v": null, "e": [] },
  "AV04": { "v": null, "e": [] },
  "AV05": { "v": null, "e": [] },
  "AN01": { "v": null, "e": [] },
  "AN02": { "v": null, "e": [] },
  "AN03": { "v": null, "e": [] }
}

CONVERSATION TO ANALYZE:
${conversationJson}
`;
}

