import { ExtractedData, ScoredResult, SignalFeature } from "./types";

/**
 * Calculates a score (0-100) based on signal count and intensity.
 * A simple deterministic algorithm for now.
 */
function calculateSignalScore(signal: SignalFeature, weight: number): number {
  if (signal.count === 0) return 0;
  // Intensity (1-5) contributes heavily. Count acts as a multiplier (up to a cap).
  const base = signal.intensity * 15; // max 75
  const countBonus = Math.min(signal.count * 5, 25); // max 25
  return (base + countBonus) * weight;
}

export function calculateScores(data: ExtractedData): ScoredResult {
  const s = data.signals;
  
  // Avoidance weight sum = 1.0
  const stonewallingScore = calculateSignalScore(s.stonewalling, 0.4);
  const dismissingScore = calculateSignalScore(s.dismissing, 0.3);
  const topicShiftingScore = calculateSignalScore(s.topic_shifting, 0.2);
  const intellectualizationScore = calculateSignalScore(s.intellectualization, 0.1);
  
  let avoidanceScore = Math.round(
    stonewallingScore + dismissingScore + topicShiftingScore + intellectualizationScore
  );

  // Anxiety weight sum = 1.0
  const demandingScore = calculateSignalScore(s.demanding_reassurance, 0.6);
  const overTextingScore = calculateSignalScore(s.over_texting, 0.4);
  
  let anxietyScore = Math.round(demandingScore + overTextingScore);

  // Boost avoidance if demand-withdraw pattern is detected explicitly
  if (data.demand_withdraw_detected) {
    avoidanceScore = Math.min(100, avoidanceScore + 15);
  }

  // Ensure bounds
  avoidanceScore = Math.max(0, Math.min(100, avoidanceScore));
  anxietyScore = Math.max(0, Math.min(100, anxietyScore));

  return {
    avoidanceScore,
    anxietyScore,
    extractedData: data
  };
}
