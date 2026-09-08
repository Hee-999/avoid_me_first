export interface SignalFeature {
  signal_id: string;
  category: "hyperactivating" | "deactivating" | "emotion" | "secure";
  dimension: "anxiety" | "avoidance" | "both";
  count: number;
  intensity: number; // 1 to 5
  evidence_quotes: string[];
}

export interface ExtractedSignals {
  demanding_reassurance: SignalFeature;
  over_texting: SignalFeature;
  fear_of_abandonment: SignalFeature;
  stonewalling: SignalFeature;
  dismissing_emotions: SignalFeature;
  intellectualization: SignalFeature;
  topic_shifting: SignalFeature;
  validating_emotions: SignalFeature;
}

export interface ExtractedData {
  message_length: number; // Total length of raw text
  signals: ExtractedSignals;
  demand_withdraw_detected: boolean;
  trigger_phrases: Array<{
    phrase: string;
    intensity: number;
    reason: string;
  }>;
}

export interface AttachmentDimensions {
  anxiety: number; // 0 - 100
  avoidance: number; // 0 - 100
}

export interface AttachmentFitness {
  secure: number; // 0 - 100
  preoccupied: number; // 0 - 100
  dismissing: number; // 0 - 100
  fearful: number; // 0 - 100
}

export interface ConfidenceScore {
  score: number; // 0 - 100
  level: "High" | "Medium" | "Low";
  reason: string;
}

export interface FinalAnalysis {
  attachment_dimensions: AttachmentDimensions;
  attachment_fitness: AttachmentFitness;
  primary_type: string;
  secondary_type: string;
  is_mixed_pattern: boolean;
  confidence: ConfidenceScore;
  extracted_data?: ExtractedData;
  status?: { scoring?: string; report?: string };
  signals?: any;
  primary_type_confidence?: string;
  target_speaker_label?: string;
  premium_report?: any;
}

export const ATTACHMENT_TYPE_MAPPING: Record<string, { ko: string, desc: string, en: string }> = {
  "secure": { ko: "안정형", desc: "상대방과 갈등이 발생해도 감정을 안정적으로 조절하며 솔직하고 원만하게 소통하는 패턴이 나타났어요.", en: "Secure Attachment" },
  "preoccupied": { ko: "불안-몰입형", desc: "관계를 잃을까 불안해하면서, 상대의 반응에 따라 감정이 크게 흔들리는 패턴이 강하게 나타났어요.", en: "Preoccupied Attachment" },
  "dismissing": { ko: "회피-독립형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive Attachment" },
  "dismissive-avoidant": { ko: "회피-독립형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive-Avoidant" },
  "fearful": { ko: "불안-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful Attachment" },
  "fearful-avoidant": { ko: "불안-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful-Avoidant" }
};

export const getMappedType = (rawType: string) => {
  if (!rawType) return { ko: "혼합형", desc: "다양한 애착 성향이 혼재된 패턴이 나타납니다.", en: "Mixed" };
  const normalized = rawType.toLowerCase().replace(/[^a-z-]/g, '');
  for (const [key, val] of Object.entries(ATTACHMENT_TYPE_MAPPING)) {
    if (normalized.includes(key)) return val;
  }
  return { ko: rawType, desc: "대화 속에서 다양한 애착 성향이 혼재된 복합적인 패턴이 나타납니다.", en: rawType };
};
