import { AttachmentDimensions, AttachmentFitness, ConfidenceScore, ExtractedData } from "./types";

const MAX_DISTANCE = Math.sqrt(Math.pow(100, 2) + Math.pow(100, 2)); // ~141.42

/**
 * Calculates 2D Euclidean Distance Fitness.
 * 100 means perfect match with the ideal point, 0 means furthest possible.
 */
function calculateFitness(x: number, y: number, targetX: number, targetY: number): number {
  const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
  const fitness = 100 - (distance / MAX_DISTANCE) * 100;
  return Math.round(fitness);
}

export function classifyTypes(dim: AttachmentDimensions): { fitness: AttachmentFitness, primary: string, secondary: string, isMixed: boolean } {
  // Ideal coordinates (Anxiety, Avoidance)
  const f = {
    secure: calculateFitness(dim.anxiety, dim.avoidance, 0, 0),
    preoccupied: calculateFitness(dim.anxiety, dim.avoidance, 100, 0),
    dismissing: calculateFitness(dim.anxiety, dim.avoidance, 0, 100),
    fearful: calculateFitness(dim.anxiety, dim.avoidance, 100, 100),
  };

  const types = [
    { name: "안정형 (Secure)", score: f.secure },
    { name: "몰입/불안형 (Preoccupied)", score: f.preoccupied },
    { name: "거부-회피형 (Dismissive-Avoidant)", score: f.dismissing },
    { name: "공포-회피형 (Fearful-Avoidant)", score: f.fearful }
  ].sort((a, b) => b.score - a.score);

  const primary = types[0].name;
  const secondary = types[1].name;
  const isMixed = (types[0].score - types[1].score) <= 10;

  return {
    fitness: f,
    primary,
    secondary,
    isMixed
  };
}

export function calculateConfidence(data: ExtractedData, dim: AttachmentDimensions): ConfidenceScore {
  let score = 20; // Base score
  
  // Add based on signal count
  const signalKeys = Object.keys(data.signals) as Array<keyof typeof data.signals>;
  const totalSignals = signalKeys.reduce((acc, key) => acc + data.signals[key].count, 0);
  score += Math.min(totalSignals * 10, 50);
  
  // Add based on text length (assume ~10 chars per word)
  if (data.message_length > 1000) score += 30;
  else if (data.message_length > 500) score += 20;
  else if (data.message_length > 100) score += 10;
  
  // Contradiction penalty
  // If extreme anxiety AND extreme avoidance but very few signals, could be a misread or short burst.
  if (dim.anxiety > 70 && dim.avoidance > 70 && totalSignals < 3) {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  let level: "High" | "Medium" | "Low" = "Low";
  let reason = "대화량이 매우 적거나 유의미한 행동 신호가 부족하여 분석의 신뢰도가 낮습니다.";
  
  if (score >= 80) {
    level = "High";
    reason = "충분한 대화량과 일관된 행동 신호가 다수 발견되어 분석 신뢰도가 매우 높습니다.";
  } else if (score >= 50) {
    level = "Medium";
    reason = "대화에서 특정한 패턴이 감지되었으나, 텍스트 양이 제한적이므로 참고용으로 활용하세요.";
  }

  return { score, level, reason };
}
