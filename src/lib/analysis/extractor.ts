import { ExtractedData } from "./types";

export async function extractFeaturesFromText(rawText: string): Promise<ExtractedData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Dummy extraction mirroring a Fearful-Avoidant response mixed with anxiety
  return {
    message_length: rawText.length > 0 ? rawText.length : 850,
    signals: {
      demanding_reassurance: {
        signal_id: "dr_1", category: "hyperactivating", dimension: "anxiety",
        count: 1, intensity: 3, evidence_quotes: ["나 진짜 사랑하긴 해?"]
      },
      over_texting: {
        signal_id: "ot_1", category: "hyperactivating", dimension: "anxiety",
        count: 0, intensity: 1, evidence_quotes: []
      },
      fear_of_abandonment: {
        signal_id: "fa_1", category: "emotion", dimension: "anxiety",
        count: 1, intensity: 4, evidence_quotes: ["우리 이대로 끝인 걸까봐 무서워"]
      },
      stonewalling: {
        signal_id: "st_1", category: "deactivating", dimension: "avoidance",
        count: 2, intensity: 5, evidence_quotes: ["그만하자", "나중에 얘기해 진짜 피곤하니까"]
      },
      dismissing_emotions: {
        signal_id: "di_1", category: "deactivating", dimension: "avoidance",
        count: 1, intensity: 3, evidence_quotes: ["또 시작이네. 별것도 아닌 걸로."]
      },
      intellectualization: {
        signal_id: "in_1", category: "deactivating", dimension: "avoidance",
        count: 0, intensity: 1, evidence_quotes: []
      },
      topic_shifting: {
        signal_id: "ts_1", category: "deactivating", dimension: "avoidance",
        count: 1, intensity: 4, evidence_quotes: ["아 몰라, 배고픈데 밥이나 먹자"]
      },
      validating_emotions: {
        signal_id: "ve_1", category: "secure", dimension: "both",
        count: 0, intensity: 1, evidence_quotes: []
      }
    },
    demand_withdraw_detected: true,
    trigger_phrases: [
      {
        phrase: "우리가 풀 건 풀어야지. 왜 매번 피하려고만 해?",
        intensity: 5,
        reason: "직접적인 직면 요구와 비난성 뉘앙스가 포함되어 방어기제를 자극함"
      }
    ]
  };
}
