import { ExtractedData } from "./types";

/**
 * Placeholder for the LLM Extraction Layer.
 * In a real environment, this function would send the `rawText` to an LLM
 * with a prompt enforcing the ExtractedData JSON schema.
 */
export async function extractFeaturesFromText(rawText: string): Promise<ExtractedData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Dummy extraction based on a typical avoidant conversation
  return {
    signals: {
      stonewalling: {
        count: 2,
        intensity: 5,
        evidence_quotes: ["그만하자", "나중에 얘기해 진짜 피곤하니까"]
      },
      dismissing: {
        count: 1,
        intensity: 3,
        evidence_quotes: ["또 시작이네. 별것도 아닌 걸로."]
      },
      intellectualization: {
        count: 0,
        intensity: 1,
        evidence_quotes: []
      },
      topic_shifting: {
        count: 1,
        intensity: 4,
        evidence_quotes: ["아 몰라, 배고픈데 밥이나 먹자"]
      },
      demanding_reassurance: {
        count: 0,
        intensity: 1,
        evidence_quotes: []
      },
      over_texting: {
        count: 0,
        intensity: 1,
        evidence_quotes: []
      }
    },
    demand_withdraw_detected: true,
    trigger_phrases: [
      {
        phrase: "우리가 풀 건 풀어야지. 왜 매번 피하려고만 해?",
        intensity: 5,
        reason: "직접적인 직면 요구와 비난성 뉘앙스가 포함되어 상대의 회피 방어기제를 즉각적으로 발동시킴"
      }
    ]
  };
}
