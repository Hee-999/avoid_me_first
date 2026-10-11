export interface SanitizedMessage {
  speaker: string;
  time: string;
  text: string;
  message_id?: string;
}

export interface SanitizationResult {
  messages: SanitizedMessage[];
  targetSpeakerId: string;
}

export function sanitizeConversation(
  messages: { speaker_id: string; text: string; timestamp?: string | null; id?: string }[],
  targetSpeakerId: string
): SanitizationResult {
  const speakerMap = new Map<string, string>();
  let speakerCounter = 0;

  // Regex patterns for PII
  const patterns = [
    // URL
    { regex: /https?:\/\/[^\s]+/g, replacement: '[URL]' },
    // Email
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
    // ID Number (주민등록번호 6자리-7자리)
    { regex: /\b\d{6}[-\s]?[1-4]\d{6}\b/g, replacement: '[ID_NUMBER]' },
    // Card Number (4자리-4자리-4자리-4자리)
    { regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[CARD_NUMBER]' },
    // Phone Number (휴대전화, 일반전화)
    { regex: /\b(?:010|011|016|017|018|019|02|0[3-9][0-9])[-\s]?\d{3,4}[-\s]?\d{4}\b/g, replacement: '[PHONE]' },
    // IP Address
    { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP]' },
  ];

  // [역할 고정]: 분석 대상(targetSpeakerId)은 항상 반드시 SPEAKER_A로 고정
  // 대화 파트너는 SPEAKER_B(그 외 C...)로 고정하여 모든 후속 LLM 단계에서 화자 혼선 원천 차단
  speakerMap.set(targetSpeakerId, "SPEAKER_A");
  let partnerCounter = 1; // 1 -> 'B'
  for (const m of messages) {
    if (m.speaker_id !== targetSpeakerId && !speakerMap.has(m.speaker_id)) {
      const code = String.fromCharCode(65 + partnerCounter);
      speakerMap.set(m.speaker_id, `SPEAKER_${code}`);
      partnerCounter++;
    }
  }

  const sanitizedMessages: SanitizedMessage[] = messages.map((m) => {
    const pseudonym = speakerMap.get(m.speaker_id) || "SPEAKER_B";

    // 2. Mask PII in text
    let sanitizedText = m.text;
    for (const { regex, replacement } of patterns) {
      sanitizedText = sanitizedText.replace(regex, replacement);
    }

    return {
      speaker: pseudonym,
      time: m.timestamp || 'unknown',
      text: sanitizedText,
      message_id: m.id,
    };
  });

  const sanitizedTargetId = speakerMap.get(targetSpeakerId) || targetSpeakerId;

  return {
    messages: sanitizedMessages,
    targetSpeakerId: sanitizedTargetId,
  };
}
