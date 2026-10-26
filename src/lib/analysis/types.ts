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
  anxiety_status?: "ok" | "low_coverage" | "insufficient";
  avoidance_status?: "ok" | "low_coverage" | "insufficient";
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
  dimensions?: any;
  primary_type_confidence?: string;
  target_speaker_label?: string;
  premium_report?: any;
  derived_context?: any;
}

export const ATTACHMENT_TYPE_MAPPING: Record<string, { ko: string, desc: string, en: string }> = {
  "secure": { ko: "안정형", desc: "상대방과 갈등이 발생해도 감정을 안정적으로 조절하며 솔직하고 원만하게 소통하는 패턴이 나타났어요.", en: "Secure Attachment" },
  "preoccupied": { ko: "몰입/불안형", desc: "관계를 잃을까 불안해하면서, 상대의 반응에 따라 감정이 크게 흔들리는 패턴이 강하게 나타났어요.", en: "Preoccupied Attachment" },
  "dismissing": { ko: "거부-회피형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive Attachment" },
  "dismissive-avoidant": { ko: "거부-회피형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive-Avoidant" },
  "fearful": { ko: "공포-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful Attachment" },
  "fearful-avoidant": { ko: "공포-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful-Avoidant" },
  "unclear": { ko: "판정 보류 (단서 부족)", desc: "제공된 대화에서 한 축 이상의 애착 신호를 평가할 기회가 부족하여 특정 유형으로 확정할 수 없습니다.", en: "Unclear / Insufficient Data" }
};

export const getMappedType = (rawType: string) => {
  if (!rawType) return { ko: "혼합형", desc: "다양한 애착 성향이 혼재된 패턴이 나타납니다.", en: "Mixed" };
  const normalized = rawType.toLowerCase().replace(/[^a-z-]/g, '');
  for (const [key, val] of Object.entries(ATTACHMENT_TYPE_MAPPING)) {
    if (normalized.includes(key)) return val;
  }
  return { ko: rawType, desc: "대화 속에서 다양한 애착 성향이 혼재된 복합적인 패턴이 나타납니다.", en: rawType };
};

export const getDimensionObservationText = (score: number, dimension: 'anxiety' | 'avoidance'): string => {
  const name = dimension === 'anxiety' ? '불안' : '회피';
  if (score >= 60) return `${name} 패턴은 비교적 뚜렷하게 관찰됨`;
  if (score >= 40) return `${name} 패턴이 중간 수준으로 관찰됨`;
  if (score >= 20) return `${name} 패턴이 일부 관찰됨`;
  return `${name} 패턴은 거의 관찰되지 않음`;
};

export interface AnalysisUiPresentation {
  mode: "standard" | "avoidance_dominant" | "anxiety_dominant" | "insufficient_all" | "micro_signal_detected";
  headlinePrefix: string;
  headlineMain: string;
  headlineSuffix: string;
  subEn: string;
  description: string;
  showFitnessBars: boolean;
  fitnessNotice: {
    title: string;
    description: string;
    subText?: string;
  } | null;
}

export interface UiPresentationOptions {
  primaryType: string;
  anxietyScore: number;
  avoidanceScore: number;
  anxietyStatus?: string;
  avoidanceStatus?: string;
  speakerLabel?: string;
}

export function getAnalysisUiPresentation(opts: UiPresentationOptions): AnalysisUiPresentation {
  const { primaryType, anxietyScore, avoidanceScore, anxietyStatus, avoidanceStatus, speakerLabel } = opts;
  const isAnxietyInsufficient = anxietyStatus === "insufficient";
  const isAvoidanceInsufficient = avoidanceStatus === "insufficient";
  const isUnclear = !primaryType || primaryType.toLowerCase().includes("unclear") || primaryType.includes("보류");

  const speaker = speakerLabel || "상대방";

  // 1. Both dimensions are evaluable AND not unclear
  if (!isAnxietyInsufficient && !isAvoidanceInsufficient && !isUnclear) {
    const mapped = getMappedType(primaryType);
    return {
      mode: "standard",
      headlinePrefix: `${speaker}의 주 애착 성향은`,
      headlineMain: `"${mapped.ko}"`,
      headlineSuffix: "입니다.",
      subEn: mapped.en,
      description: mapped.desc,
      showFitnessBars: true,
      fitnessNotice: null
    };
  }

  // 2-A. Avoidance high (>= 60)
  if (!isAvoidanceInsufficient && isAnxietyInsufficient && avoidanceScore >= 60) {
    return {
      mode: "avoidance_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"회피 성향이 비교적 뚜렷하게 보여요"',
      headlineSuffix: "",
      subEn: "High Avoidance Pattern Observed",
      description: "갈등이나 감정적 압박 상황에서 대화를 일방적으로 닫거나 거리를 두는 방어 행동이 반복적으로 관찰되었습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "불안 성향은 추가 확인 필요",
        description: `회피 패턴이 뚜렷하게 관찰됨 (${avoidanceScore}점)`,
        subText: "대화 내 불안 성향을 평가할 상황은 나타나지 않아 회피 차원을 중심으로 분석되었습니다."
      }
    };
  }

  // 2-B. Avoidance moderate (40~59)
  if (!isAvoidanceInsufficient && isAnxietyInsufficient && avoidanceScore >= 40) {
    return {
      mode: "avoidance_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"회피 성향이 일부 관찰돼요"',
      headlineSuffix: "",
      subEn: "Moderate Avoidance Pattern Observed",
      description: "갈등이나 부담스러운 상황에서 대화를 미루거나 방어적인 태도를 취하는 모습이 관찰되었습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "불안 성향은 추가 확인 필요",
        description: `회피 패턴이 중간 수준으로 관찰됨 (${avoidanceScore}점)`,
        subText: "대화 내 불안 성향을 평가할 상황은 나타나지 않아 회피 차원을 중심으로 분석되었습니다."
      }
    };
  }

  // 2-C. Avoidance micro-signal (1~39) -> 포착된 행동 중심 안내 (오늘 33점 케이스)
  if (!isAvoidanceInsufficient && avoidanceScore > 0) {
    return {
      mode: "micro_signal_detected",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"갈등 유보·거리두기 반응이 1건 포착되었어요"',
      headlineSuffix: "",
      subEn: "Initial Boundary Signal Observed",
      description: "특정 상황에서 대화를 유보하거나 시간을 두려는 방어적 반응이 관찰되었습니다. 다만 이 1번의 표현만으로 성향을 단정할 수는 없으며, 감정이 가라앉은 뒤 대화를 다시 이어왔는지 전후 맥락을 함께 보아야 합니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "미세 방어 신호 1건 포착",
        description: `특정 장면에서 완곡한 거리두기 반응 관찰 (${avoidanceScore}점)`,
        subText: "성향을 섣불리 단정하기보다 당시 상황의 압박감을 함께 고려하는 것이 권장됩니다."
      }
    };
  }

  // 3-A. Anxiety high (>= 60)
  if (!isAnxietyInsufficient && isAvoidanceInsufficient && anxietyScore >= 60) {
    return {
      mode: "anxiety_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"불안 성향이 비교적 뚜렷하게 보여요"',
      headlineSuffix: "",
      subEn: "High Anxiety Pattern Observed",
      description: "관계의 불확실성이나 연락 지연에 대해 안심을 거듭 요구하거나 예민하게 반응하는 양상이 관찰되었습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "회피 성향은 추가 확인 필요",
        description: `불안 패턴이 뚜렷하게 관찰됨 (${anxietyScore}점)`,
        subText: "대화 내 회피 성향을 평가할 상황은 나타나지 않아 불안 차원을 중심으로 분석되었습니다."
      }
    };
  }

  // 3-B. Anxiety moderate (40~59)
  if (!isAnxietyInsufficient && isAvoidanceInsufficient && anxietyScore >= 40) {
    return {
      mode: "anxiety_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"불안 성향이 일부 관찰돼요"',
      headlineSuffix: "",
      subEn: "Moderate Anxiety Pattern Observed",
      description: "관계 상태에 대한 확인이나 상대 반응에 대한 관심이 다소 높게 관찰되었습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "회피 성향은 추가 확인 필요",
        description: `불안 패턴이 중간 수준으로 관찰됨 (${anxietyScore}점)`,
        subText: "대화 내 회피 성향을 평가할 상황은 나타나지 않아 불안 차원을 중심으로 분석되었습니다."
      }
    };
  }

  // 3-C. Anxiety micro-signal (1~39)
  if (!isAnxietyInsufficient && anxietyScore > 0) {
    return {
      mode: "micro_signal_detected",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"관계 확인·안심 요구 반응이 1건 포착되었어요"',
      headlineSuffix: "",
      subEn: "Initial Reassurance Signal Observed",
      description: "상대방의 상태나 관계에 대해 재확인을 구하는 모습이 관찰되었습니다. 일시적인 확인인지 반복되는 패턴인지는 추가적인 관찰이 필요합니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "미세 확인 신호 1건 포착",
        description: `특정 장면에서 관계 안심 확인 반응 관찰 (${anxietyScore}점)`,
        subText: "성향을 섣불리 단정하기보다 당시 상황의 배경을 함께 고려하는 것이 권장됩니다."
      }
    };
  }

  // 4. Both insufficient or below threshold (일상적 대화 / 방어기제 미발생)
  return {
    mode: "insufficient_all",
    headlinePrefix: "제출해주신 대화에서는",
    headlineMain: '"일상적인 대화와 상호작용이 확인되었어요"',
    headlineSuffix: "",
    subEn: "Everyday Interaction",
    description: "갈등이나 일방적인 거리두기 없이, 일상적인 대화와 조율이 이루어졌습니다.",
    showFitnessBars: false,
    fitnessNotice: null
  };
}


