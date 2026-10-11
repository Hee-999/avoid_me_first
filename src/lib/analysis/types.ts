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
}

export const ATTACHMENT_TYPE_MAPPING: Record<string, { ko: string, desc: string, en: string }> = {
  "secure": { ko: "안정형", desc: "상대방과 갈등이 발생해도 감정을 안정적으로 조절하며 솔직하고 원만하게 소통하는 패턴이 나타났어요.", en: "Secure Attachment" },
  "preoccupied": { ko: "불안-몰입형", desc: "관계를 잃을까 불안해하면서, 상대의 반응에 따라 감정이 크게 흔들리는 패턴이 강하게 나타났어요.", en: "Preoccupied Attachment" },
  "dismissing": { ko: "회피-독립형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive Attachment" },
  "dismissive-avoidant": { ko: "회피-독립형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive-Avoidant" },
  "fearful": { ko: "불안-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful Attachment" },
  "fearful-avoidant": { ko: "불안-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful-Avoidant" },
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
  mode: "standard" | "avoidance_dominant" | "anxiety_dominant" | "insufficient_all";
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

  const speaker = speakerLabel || "상대";

  // 1. Both dimensions are evaluable AND not unclear
  if (!isAnxietyInsufficient && !isAvoidanceInsufficient && !isUnclear) {
    const mapped = getMappedType(primaryType);
    return {
      mode: "standard",
      headlinePrefix: `${speaker}의 주 애착 유형은`,
      headlineMain: `"${mapped.ko}"`,
      headlineSuffix: "입니다.",
      subEn: mapped.en,
      description: mapped.desc,
      showFitnessBars: true,
      fitnessNotice: null
    };
  }

  // 2. Avoidance only evaluable and score >= 60
  if (!isAvoidanceInsufficient && isAnxietyInsufficient && avoidanceScore >= 60) {
    return {
      mode: "avoidance_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"회피 성향이 비교적 뚜렷하게 보여요"',
      headlineSuffix: "",
      subEn: "High Avoidance Pattern Observed",
      description: "다만 불안 성향을 평가할 단서가 부족해 거부-회피형(Dismissing)과 공포-회피형(Fearful) 중 어느 유형에 가까운지는 아직 구분하기 어렵습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "4가지 애착 유형은 판정 보류",
        description: `회피 패턴은 비교적 뚜렷하게 관찰됨 (${avoidanceScore}점)`,
        subText: "대화 내 불안 성향을 평가할 단서가 부족하여 몰입/불안형은 판단 보류되었습니다."
      }
    };
  }

  // 3. Anxiety only evaluable and score >= 60
  if (!isAnxietyInsufficient && isAvoidanceInsufficient && anxietyScore >= 60) {
    return {
      mode: "anxiety_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"불안 성향이 비교적 뚜렷하게 보여요"',
      headlineSuffix: "",
      subEn: "High Anxiety Pattern Observed",
      description: "다만 회피 성향을 평가할 단서가 부족해 몰입/불안형(Preoccupied)과 공포-회피형(Fearful) 중 어느 유형에 가까운지는 아직 구분하기 어렵습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "4가지 애착 유형은 판정 보류",
        description: `불안 패턴은 비교적 뚜렷하게 관찰됨 (${anxietyScore}점)`,
        subText: "대화 내 회피 성향을 평가할 단서가 부족하여 거부-회피형은 판단 보류되었습니다."
      }
    };
  }

  // 2-B. Avoidance moderate (40~59) with anxiety insufficient
  if (!isAvoidanceInsufficient && isAnxietyInsufficient && avoidanceScore >= 40) {
    return {
      mode: "avoidance_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"회피 성향이 일부 관찰돼요"',
      headlineSuffix: "",
      subEn: "Moderate Avoidance Pattern Observed",
      description: "다만 불안 성향을 평가할 단서가 부족해 거부-회피형(Dismissing)과 공포-회피형(Fearful) 중 어느 유형에 가까운지는 아직 구분하기 어렵습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "4가지 애착 유형은 판정 보류",
        description: `회피 패턴이 중간 수준으로 관찰됨 (${avoidanceScore}점)`,
        subText: "대화 내 불안 성향을 평가할 단서가 부족하여 몰입/불안형은 판단 보류되었습니다."
      }
    };
  }

  // 3-B. Anxiety moderate (40~59) with avoidance insufficient
  if (!isAnxietyInsufficient && isAvoidanceInsufficient && anxietyScore >= 40) {
    return {
      mode: "anxiety_dominant",
      headlinePrefix: `${speaker}에게서`,
      headlineMain: '"불안 성향이 일부 관찰돼요"',
      headlineSuffix: "",
      subEn: "Moderate Anxiety Pattern Observed",
      description: "다만 회피 성향을 평가할 단서가 부족해 몰입/불안형(Preoccupied)과 공포-회피형(Fearful) 중 어느 유형에 가까운지는 아직 구분하기 어렵습니다.",
      showFitnessBars: true,
      fitnessNotice: {
        title: "4가지 애착 유형은 판정 보류",
        description: `불안 패턴이 중간 수준으로 관찰됨 (${anxietyScore}점)`,
        subText: "대화 내 회피 성향을 평가할 단서가 부족하여 거부-회피형은 판단 보류되었습니다."
      }
    };
  }

  // 4. Both insufficient or below threshold
  return {
    mode: "insufficient_all",
    headlinePrefix: "현재 대화에서는",
    headlineMain: '"애착 유형을 판단할 단서가 부족해요"',
    headlineSuffix: "",
    subEn: "Insufficient Data for Evaluation",
    description: "현재 대화에서는 갈등이나 감정 표현 상황이 충분하지 않아, 불안 및 회피 성향을 평가하기 어렵습니다.",
    showFitnessBars: false,
    fitnessNotice: {
      title: "애착 유형을 계산할 단서가 부족합니다.",
      description: "현재 대화에서는 불안·회피 패턴을 평가할 상황이 충분하지 않음",
      subText: "갈등 상황이 포함된 더 많은 대화를 분석하면 정밀한 유형 확인이 가능합니다."
    }
  };
}


