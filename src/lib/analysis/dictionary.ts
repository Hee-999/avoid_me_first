export const SIGNAL_DICTIONARY_VERSION = "1.0";

export type SignalRole = "CORE" | "SUPPORTING" | "REPORT_ONLY";
export type SignalDimension = "avoidance" | "anxiety" | "anxiety_related";

export interface SignalDefinition {
  id: string;
  name: string;
  dimension: SignalDimension;
  role: SignalRole;
  family: string;
  definition: string;
  required_context?: string | string[];
  positive_evidence: string[];
  strong_evidence?: string;
  counter_evidence: string[];
  false_positives: string[];
  score_contribution?: number; // Only used for REPORT_ONLY if 0
  usage?: string;
}

export const signalDictionary: Record<string, SignalDefinition> = {
  // ------------------------------
  // AVOIDANCE SIGNALS
  // ------------------------------
  AV01: {
    id: "AV01",
    name: "Emotional Disclosure Avoidance (감정적 자기노출 회피)",
    dimension: "avoidance",
    role: "SUPPORTING",
    family: "EMOTIONAL_OPENNESS",
    definition: "자신의 감정이나 취약한 상태를 상대에게 공개하는 것을 반복적으로 피하거나 최소화하는 행동.",
    positive_evidence: [
      "감정을 묻는 질문에 반복적으로 답변 회피",
      "감정 축소",
      "감정 대화가 시작되면 화제 전환",
      "취약한 상태 표현을 지속적으로 차단"
    ],
    strong_evidence: "서로 다른 상황에서도 감정 대화가 제시될 때 일관되게 회피하는 패턴.",
    counter_evidence: [
      "감정을 구체적으로 설명",
      "시간이 필요하다고 한 뒤 실제 대화 재개",
      "취약함이나 두려움을 자연스럽게 공유"
    ],
    false_positives: [
      "일시적인 피로",
      "업무 등 상황적 이유",
      "단 한 번의 짧은 응답"
    ]
  },
  AV02: {
    id: "AV02",
    name: "Conflict Withdrawal (갈등 상황에서 대화 철수)",
    dimension: "avoidance",
    role: "CORE",
    family: "DISTANCING",
    definition: "관계 갈등 또는 문제 해결 상황에서 상호작용을 종료하거나 반복적으로 철수하는 행동.",
    required_context: ["relationship_conflict", "problem_solving_attempt"],
    positive_evidence: [
      "대화 자체 종료",
      "문제 논의 거부",
      "반복적 disengagement",
      "문제를 해결하지 않은 채 접촉 종료"
    ],
    strong_evidence: "서로 다른 갈등 상황에서도 동일한 철수 패턴 반복.",
    counter_evidence: [
      "temporary pause 요청",
      "구체적인 재논의 시점 제안",
      "이후 실제 re-engagement",
      "constructive problem solving"
    ],
    false_positives: [
      "폭언을 피하기 위한 대화 종료",
      "연락 폭격에 대한 정상적 경계",
      "업무 / 수면 등 명확한 외부 이유"
    ]
  },
  AV03: {
    id: "AV03",
    name: "Intimacy Distancing (친밀감 증가 시 거리두기)",
    dimension: "avoidance",
    role: "CORE",
    family: "DISTANCING",
    definition: "관계의 친밀감이나 상호의존성이 증가하는 상황에서 반복적으로 거리를 확보하려는 행동.",
    required_context: ["관계 정의", "미래 계획", "취약성 공유", "애정 표현", "관계 심화"],
    positive_evidence: [
      "친밀감 증가 이후 명확한 거리두기 행동."
    ],
    strong_evidence: "서로 다른 친밀감 관련 상황에서도 동일 패턴 반복.",
    counter_evidence: [
      "관계 심화에 편안하게 반응",
      "미래 계획에 적극 참여",
      "친밀감 표현을 자연스럽게 주고받음"
    ],
    false_positives: [
      "특정 결혼관",
      "특정 관계에 대한 합리적인 의사결정",
      "단순히 혼자 있는 시간을 선호하는 성향"
    ]
  },
  AV04: {
    id: "AV04",
    name: "Compulsive Self-Reliance (과도한 자기의존)",
    dimension: "avoidance",
    role: "CORE",
    family: "DEPENDENCY_DEACTIVATION",
    definition: "어려움이나 distress를 타인에게 의존하지 않고 혼자 해결해야 한다고 지속적으로 강조하는 행동.",
    positive_evidence: [
      "도움 지속적 거부",
      "타인에게 기대는 것 자체에 부정적 태도",
      "어려운 상황에서도 혼자 해결해야 한다고 반복 표현"
    ],
    strong_evidence: "스트레스 / 관계 / 일상 등 여러 맥락에서 반복.",
    counter_evidence: [
      "필요한 상황에서는 자연스럽게 도움을 요청하거나 수용."
    ],
    false_positives: [
      "단순한 독립성",
      "'내가 할게' 같은 일회성 표현"
    ]
  },
  AV05: {
    id: "AV05",
    name: "Support Deactivation (스트레스 상황에서 정서적 지원 차단)",
    dimension: "avoidance",
    role: "CORE",
    family: "DEPENDENCY_DEACTIVATION",
    definition: "실제 스트레스나 어려움이 발생했을 때 파트너의 정서적 지원이나 도움을 지속적으로 이용하지 않는 행동.",
    required_context: ["stress", "distress", "personal difficulty"],
    positive_evidence: [
      "도움 요청 억제",
      "제공되는 위로 반복 거절",
      "힘든 상황에서 의도적 거리 확보"
    ],
    counter_evidence: [
      "distress 상황에서 감정 공유",
      "도움 요청",
      "위로 수용"
    ],
    false_positives: [
      "실제로 도움이 필요하지 않거나 혼자 처리하는 것이 합리적인 상황."
    ]
  },
  AV06: {
    id: "AV06",
    name: "Attachment Need Minimization (애착 / 의존 욕구 축소)",
    dimension: "avoidance",
    role: "SUPPORTING",
    family: "DEPENDENCY_DEACTIVATION",
    definition: "관계, 애정, 상호의존의 필요성을 지속적으로 중요하지 않은 것으로 축소하는 표현.",
    positive_evidence: [
      "관계 필요성 반복 축소",
      "의존 자체를 부정적으로 평가",
      "애정이나 연락 욕구를 일관되게 폄하"
    ],
    counter_evidence: [
      "상호 의존과 애정 욕구를 편안하게 인정."
    ],
    false_positives: [
      "연락 빈도에 대한 개인 취향",
      "독립적인 연애 스타일 하나만 존재"
    ]
  },

  // ------------------------------
  // ANXIETY SIGNALS
  // ------------------------------
  AN01: {
    id: "AN01",
    name: "Abandonment / Rejection Concern (거절 / 버림받음 우려)",
    dimension: "anxiety",
    role: "CORE",
    family: "RELATIONSHIP_SECURITY",
    definition: "관계 종료, 거절 또는 애정 상실에 대한 우려가 반복적으로 나타나는 행동.",
    positive_evidence: [
      "상대가 떠날 가능성을 반복 걱정",
      "버림받음 두려움",
      "애정 상실에 대한 지속적 불안"
    ],
    strong_evidence: "실제 관계 위협이 명확하지 않은 여러 상황에서도 반복.",
    counter_evidence: [
      "관계에 대한 기본적인 안정감과 상대의 독립된 시간을 허용."
    ],
    false_positives: [
      "상대가 실제로 이별 의사를 밝혔거나 명확한 관계 위협이 존재하는 상황."
    ]
  },
  AN02: {
    id: "AN02",
    name: "Excessive Reassurance Seeking (반복적인 관계 확인 / 안심 요구)",
    dimension: "anxiety",
    role: "CORE",
    family: "RELATIONSHIP_SECURITY",
    definition: "이미 reassurance를 제공받은 이후에도 애정이나 관계 상태를 반복적으로 확인하는 행동.",
    positive_evidence: [
      "반복적인 애정 확인",
      "reassurance 이후 다시 reassurance 요구",
      "temporary relief 후 재확인"
    ],
    strong_evidence: "여러 상황에서 reassurance cycle 반복.",
    counter_evidence: [
      "한 번 확인한 뒤 답을 받아들이고 안정됨."
    ],
    false_positives: [
      "실제로 관계 상태가 모호하거나 상대가 지속적으로 모순된 신호를 보내는 경우."
    ]
  },
  AN03: {
    id: "AN03",
    name: "Responsiveness Hypervigilance (상대 반응 변화 과잉 모니터링)",
    dimension: "anxiety",
    role: "CORE",
    family: "THREAT_MONITORING",
    definition: "답장 시간, 말투, 연락 빈도, 애정 표현 등의 작은 변화를 관계 위협 신호로 지속적으로 모니터링하는 행동.",
    positive_evidence: [
      "답장 지연 지속 확인",
      "말투 변화 반복 확인",
      "연락 패턴 변화에 과도한 의미 부여"
    ],
    strong_evidence: "여러 종류의 작은 변화에서 관계 위협 해석 반복.",
    counter_evidence: [
      "작은 변화를 여러 가능한 이유 중 하나로 받아들임."
    ],
    false_positives: [
      "실제로 상대방의 행동 패턴이 크게 변했거나 객관적인 관계 위협이 존재하는 경우."
    ]
  },
  AN04: {
    id: "AN04",
    name: "Proximity / Contact Escalation (불안 시 접촉 시도 증가)",
    dimension: "anxiety",
    role: "SUPPORTING",
    family: "PROXIMITY_REGULATION",
    definition: "관계 불확실성이나 불안이 높아질수록 메시지, 전화 등 접촉 행동이 급격히 증가하는 패턴.",
    positive_evidence: [
      "연속 메시지 증가",
      "반복 전화",
      "불안 상황에서 contact frequency 급증"
    ],
    counter_evidence: [
      "불안을 느껴도 일정한 contact boundary 유지."
    ],
    false_positives: [
      "긴급 상황",
      "안전 문제",
      "실제 약속 불이행",
      "답변이 반드시 필요한 실무 상황"
    ]
  },
  AN05: {
    id: "AN05",
    name: "Investment Asymmetry Concern (관계 투자 비대칭 우려)",
    dimension: "anxiety_related",
    role: "REPORT_ONLY",
    family: "RELATIONSHIP_BALANCE",
    definition: "자신이 상대보다 관계에 더 많은 애정이나 노력을 투자하고 있다는 우려를 반복적으로 표현하는 패턴.",
    positive_evidence: [
      "'나만 좋아하는 것 같다'",
      "'항상 나만 연락한다'",
      "투자 수준 차이에 대한 반복적 불만"
    ],
    counter_evidence: [],
    false_positives: [],
    score_contribution: 0,
    usage: "Premium Report 개인화에만 사용. 정상적인 관계 갈등에서도 흔히 나타날 수 있으므로 v1 점수에는 포함하지 않음."
  },
  AN06: {
    id: "AN06",
    name: "Rejection-Threat Interpretation (모호한 신호를 거절 / 이별 위협으로 해석)",
    dimension: "anxiety",
    role: "SUPPORTING",
    family: "THREAT_MONITORING",
    definition: "여러 해석이 가능한 상대 행동을 빠르게 거절, 애정 상실 또는 이별 신호로 해석하는 행동.",
    positive_evidence: [
      "모호한 행동 → 관계 위협으로 빠르게 연결."
    ],
    counter_evidence: [
      "여러 가능한 이유를 열어두고 해석."
    ],
    false_positives: [
      "실제로 반복적인 rejection cue가 존재하는 경우."
    ]
  }
};
