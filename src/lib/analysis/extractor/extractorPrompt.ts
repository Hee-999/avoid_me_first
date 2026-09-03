export const extractor_version = "1.4.2-context-tune";
export const extractor_prompt_version = "1.4.2-context-tune";

const compactDictionary = `AV01 Emotional Distancing:
- Context: Opportunity for sharing emotion/vulnerability exists
- Detect: minimizes feelings, intellectualizes emotion, changes subject
- Counter: factual answer to factual question

AV02 Conflict Withdrawal:
- Context: Relationship conflict or problem-solving interaction exists
- Detect: repeatedly ends/refuses unresolved discussion, silent treatment
- Counter: temporary pause with actual return, normal boundary under pressure, practical reason (busy)

AV03 Intimacy Distancing:
- Context: Intimacy building, future planning, or relationship deepening exists
- Detect: vague about commitment, avoids "we", dismisses relationship importance
- Counter: cautious early dating, honest incompatibility

AV04 Independence Preference:
- Context: Situation involving offering/needing help, interdependence, or doing tasks alone exists
- Detect: rigidly refuses help, insists on doing it alone to an extreme
- Counter: normal self-reliance

AV05 Support Deactivation:
- Context: Partner distress + support opportunity exists
- Detect: ignores partner's distress, offers cold solutions, annoyed by need
- Counter: practical advice out of care

AV06 Suppressing Distress:
- Context: Conversation related to relationship needs, dependency, or affection desire exists
- Detect: insists "I'm fine" when not, hides vulnerability
- Counter: normal coping, genuine well-being

AN01 Rejection Fear:
- Context: Situation related to relationship stability, rejection, or partner leaving exists
- Detect: assumes partner is leaving/angry with zero evidence, hyper-vigilant
- Counter: reacting to actual relationship threat

AN02 Excessive Reassurance Seeking:
- Context: Opportunity for reassurance or checking relationship status/affection exists
- Detect: repeatedly asks "do you love me?", needs constant validation
- Counter: normal check-in after argument

AN03 Clinging/Pursuing:
- Context: Situation where partner's responsiveness or communication frequency change is discussed
- Detect: double texting excessively, demanding immediate replies, violating requested space
- Counter: checking in on an emergency

AN04 Emotional Reactivity:
- Context: Situation where contact behaviors or minor disagreements under anxiety can be observed
- Detect: wildly disproportionate emotional outburst, catastrophic thinking
- Counter: anger at actual abuse/betrayal

AN05 Over-dependence:
- Context: Conversation related to relationship effort or investment balance exists
- Detect: cannot make basic choices without partner, needs partner to regulate emotions entirely
- Counter: asking for normal advice

AN06 Boundary Violation:
- Context: Situation involving interpreting ambiguous partner behavior or limits exists
- Detect: pushes partner's limits out of anxiety, checks phone, demands proof of love
- Counter: mutually agreed sharing`;

export function buildExtractorPrompt(anonymizedConversationJson: string, targetSpeaker: "SPEAKER_A" | "SPEAKER_B"): string {
  return `You are an objective behavioral signal extractor based on Adult Attachment Research.
Analyze ONLY the TARGET speaker: ${targetSpeaker}. 
The other speaker's messages are ONLY for Context.

### IMPORTANT DISTINCTION
You must distinguish these three statuses clearly:
- INSUFFICIENT ("I"): There was NO meaningful opportunity or relevant context to evaluate this signal in the conversation (e.g., purely mundane daily chat).
- NOT_DETECTED ("N"): A relevant context/opportunity EXISTED, but the specific signal behavior was absent or normal.
- AMBIGUOUS ("A"): A relevant context EXISTED, but the behavior interpretation is uncertain (e.g., could be a normal boundary or avoidance).

Do NOT use INSUFFICIENT merely because evidence is weak. If a relevant relational context exists:
- clear behavior -> detected ("D")
- relevant context but behavior absent -> not_detected ("N")
- uncertain interpretation -> ambiguous ("A")
Use INSUFFICIENT only when there was NO relevant evaluation opportunity.

### CONTEXT-FIRST SIGNAL JUDGMENT
Evaluate each signal in exactly this order:
1. Is the REQUIRED CONTEXT (evaluation opportunity) for the signal present in the overall conversation?
   - If NO context exists -> s: "I" (insufficient)
2. If context DOES exist, did ${targetSpeaker} exhibit the behavior?
   - YES -> s: "D" (detected), v: 1, 2, or 3
   - NO -> s: "N" (not_detected), v: 0
   - UNCLEAR -> s: "A" (ambiguous)

### STRENGTH (v)
1: Weak evidence or alternative explanation exists.
2: Clear evidence, or repeated behaviors within a SINGLE episode.
3: Behavior repeated across MULTIPLE DISTINCT episodes.

### ARRAYS (Omit if empty)
e = TARGET's evidence message IDs (max 2)
c = Context message IDs (max 2)
x = Counter evidence message IDs (max 1)
a = Alternative explanation code (max 1). Allowed ONLY: busy, sleep, work, stress, practical_reason, normal_boundary, contact_pressure, temporary_pause, actual_breakup_threat, actual_relationship_threat, emergency.
r = Reason for your judgment (MAX 15 characters, e.g., "회피함", "연락 압박", "일상 대화"). You MUST write this before writing the status 's' to think first.

### COMPACT DICTIONARY
${compactDictionary}

### INPUT CONVERSATION
${anonymizedConversationJson}

### TASK
Return EXACTLY ONE JSON OBJECT containing "context_summary" and the 12 Signal IDs as keys. No markdown, no prose.

JSON FORMAT EXAMPLE:
{
  "context_summary": "A가 연락을 압박하고 B가 거절함",
  "AV01": { "r": "상황 없음", "s": "I" },
  "AV02": { "r": "대화 중단 요구", "s": "D", "v": 2, "e": ["m4", "m8"], "c": ["m3"] },
  "AV03": { "r": "행동 없음", "s": "N", "v": 0 },
  "AV04": { "r": "바빠서 거절", "s": "A", "e": ["m12"], "a": ["practical_reason"] }
  // ... MUST include all 12 keys (AV01~06, AN01~06)
}
`;
}

export function buildRepairPrompt(errors: string[], originalJson: string): string {
  return `Your previous response could not be parsed or lacked exactly 12 keys or context_summary.
Return ONLY valid JSON. Keep the format. No markdown fences.

ERRORS:
${errors.join("\n")}

ORIGINAL TEXT:
${originalJson}
`;
}
