import { AttachmentDimensions, SignalFeature, ExtractedData } from "./types";

/**
 * Normalizes signal count and intensity into a 0-100 score before weighting.
 */
function normalizeSignal(signal: SignalFeature | undefined): number {
  if (!signal || signal.count === 0) return 0;
  // Intensity (1-5) * 15 = max 75. Count * 5 = max 25 (capped).
  const base = signal.intensity * 15;
  const countBonus = Math.min(signal.count * 5, 25);
  return base + countBonus; // 0 to 100
}

export function calculateDimensions(data: ExtractedData): AttachmentDimensions {
  const s = data.signals;
  
  // 1. Avoidance Dimension (Deactivating Strategies)
  // Weights based on previous algorithm and clinical relevance
  const st_score = normalizeSignal(s.stonewalling) * 0.40;
  const di_score = normalizeSignal(s.dismissing_emotions) * 0.30;
  const ts_score = normalizeSignal(s.topic_shifting) * 0.20;
  const in_score = normalizeSignal(s.intellectualization) * 0.10;
  
  let avoidance = st_score + di_score + ts_score + in_score;

  // 2. Anxiety Dimension (Hyperactivating Strategies)
  const dr_score = normalizeSignal(s.demanding_reassurance) * 0.45;
  const ot_score = normalizeSignal(s.over_texting) * 0.35;
  const fa_score = normalizeSignal(s.fear_of_abandonment) * 0.20;

  let anxiety = dr_score + ot_score + fa_score;

  // 3. Demand-Withdraw Pattern Boost
  if (data.demand_withdraw_detected) {
    avoidance += 15;
    anxiety += 10;
  }

  // 4. Secure Buffers (Validating Emotions)
  const secureBuffer = normalizeSignal(s.validating_emotions) * 0.2; // up to 20 points reduction
  avoidance -= secureBuffer;
  anxiety -= secureBuffer;

  // 5. Bounds Check
  return {
    anxiety: Math.max(0, Math.min(100, Math.round(anxiety))),
    avoidance: Math.max(0, Math.min(100, Math.round(avoidance)))
  };
}
