import { FinalAnalysis } from "@/lib/analysis/types";

/**
 * NICEPAY 및 카드사 심사를 위한 고정 예시 분석 데이터 픽스처
 * 실제 AI 분석 API나 Supabase DB를 호출하지 않으며, 실제 스키마(FinalAnalysis)와 100% 호환됩니다.
 */
export const SAMPLE_ANALYSIS: FinalAnalysis = {
  primary_type: "dismissing",
  secondary_type: "공포-회피형 (Fearful-Avoidant)",
  is_mixed_pattern: true,
  primary_type_confidence: "high",
  target_speaker_label: "상대방",
  attachment_dimensions: {
    anxiety: 34,
    avoidance: 79
  },
  attachment_fitness: {
    secure: 26,
    preoccupied: 29,
    dismissing: 78,
    fearful: 52
  },
  confidence: {
    score: 92,
    level: "High",
    reason: "갈등 상황에서 반복적인 대화 철수(Stonewalling) 및 감정 축소 신호가 뚜렷하게 관찰되었습니다."
  },
  signals: {
    stonewalling: {
      signal_id: "AV02",
      category: "deactivating",
      dimension: "avoidance",
      count: 3,
      intensity: 5,
      evidence_quotes: [
        "나 지금 좀 혼자 있고 싶어.",
        "오늘 피곤해서 나중에 얘기하자."
      ]
    },
    dismissing_emotions: {
      signal_id: "AV05",
      category: "deactivating",
      dimension: "avoidance",
      count: 2,
      intensity: 4,
      evidence_quotes: [
        "지금 이 얘기 꼭 해야 돼?",
        "왜 자꾸 똑같은 얘기를 하는지 모르겠어."
      ]
    },
    topic_shifting: {
      signal_id: "AV04",
      category: "deactivating",
      dimension: "avoidance",
      count: 1,
      intensity: 4,
      evidence_quotes: [
        "뭐해? (갈등 후 하루 뒤 아무 일 없던 것처럼 연락)"
      ]
    }
  },
  status: {
    scoring: "completed",
    report: "completed"
  }
};
