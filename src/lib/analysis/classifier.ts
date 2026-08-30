import { ScoredResult, ClassificationProfile } from "./types";

export function classifyProfile(result: ScoredResult): ClassificationProfile {
  const { avoidanceScore, anxietyScore } = result;
  
  let type = "안정형 (Secure)";
  if (avoidanceScore > 60 && anxietyScore < 40) {
    type = "거부-회피형 (Dismissive-Avoidant)";
  } else if (avoidanceScore > 60 && anxietyScore >= 40) {
    type = "공포-회피형 (Fearful-Avoidant)";
  } else if (avoidanceScore <= 60 && anxietyScore >= 60) {
    type = "몰입/불안형 (Preoccupied)";
  }

  // Avoidance Band
  let avoidanceBand = "";
  if (avoidanceScore >= 80) avoidanceBand = "극단적 수준의 강한 회피 성향 (상위 5% 이내의 심각도)";
  else if (avoidanceScore >= 60) avoidanceBand = "명확한 회피 방어기제 작동";
  else if (avoidanceScore >= 40) avoidanceBand = "경미한/상황적 회피 성향";
  else avoidanceBand = "안정적 대처 가능";

  // Primary Defenses mapping based on extracted data
  const primaryDefenses: string[] = [];
  const signals = result.extractedData.signals;
  
  if (signals.stonewalling.count > 0) primaryDefenses.push("동굴 현상(대화 단절)");
  if (signals.dismissing.count > 0) primaryDefenses.push("감정 축소/폄하");
  if (signals.topic_shifting.count > 0) primaryDefenses.push("주제 회피");
  if (signals.intellectualization.count > 0) primaryDefenses.push("지식화/감정 배제");

  return {
    type,
    avoidanceBand,
    anxietyBand: "보류", // Can expand anxiety bands similarly
    primaryDefenses
  };
}
