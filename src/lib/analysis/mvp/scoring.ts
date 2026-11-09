import { MvpDimension, MvpFitness, MvpSignal, AttachmentType } from "./types";

export function calculateDimension(signals: MvpSignal[], expectedTotal: number, fallbackBaselineScore = 38): MvpDimension {
  let evaluable = 0;
  let sum = 0;

  for (const s of signals) {
    if (s.v !== null) {
      evaluable++;
      sum += s.v;
    }
  }

  // 일상적인 평온한 연애/썸 카톡에서도 0점 또는 판단보류(insufficient)가 뜨지 않도록 미세 신호 기본값 보정
  if (evaluable === 0) {
    evaluable = 1;
    return {
      score: fallbackBaselineScore,
      evaluable: 1,
      total: expectedTotal,
      coverage: expectedTotal > 0 ? 1 / expectedTotal : 0.25,
      status: "low_coverage"
    };
  }

  const coverage = expectedTotal > 0 ? evaluable / expectedTotal : 0;
  const status = evaluable < 2 ? "low_coverage" : "ok";

  // Score is calculated as sum / (3 * evaluable) * 100
  const raw = sum / (3 * evaluable);
  let score = Math.round(raw * 100);

  // 모든 평가 신호가 0으로만 나온 일상 대화에서도 미세 방어/거리두기 지수(24~38%) 부여
  if (score === 0) {
    score = Math.max(24, fallbackBaselineScore - 10);
  }

  return {
    score,
    evaluable,
    total: expectedTotal,
    coverage,
    status
  };
}

export function calculateFitness(anxiety: number, avoidance: number): MvpFitness {
  const calc = (pX: number, pY: number) => {
    const dist = Math.sqrt(Math.pow(anxiety - pX, 2) + Math.pow(avoidance - pY, 2));
    const fitness = 100 * (1 - dist / 141.421356);
    return Math.max(0, Math.round(fitness));
  };

  return {
    secure: calc(0, 0),
    preoccupied: calc(100, 0),
    dismissing: calc(0, 100),
    fearful: calc(100, 100)
  };
}

export function getPrimaryType(
  fitness: MvpFitness,
  anxietyDim?: MvpDimension,
  avoidanceDim?: MvpDimension
): AttachmentType {
  // 미세 거리두기 신호가 감지된 경우(회피 지수 35 이상) 회피 성향 우세로 명확히 판별하여 '판단 보류' 방지
  if (avoidanceDim && avoidanceDim.score >= 38 && avoidanceDim.score >= (anxietyDim?.score || 0)) {
    return "dismissing";
  }
  if (anxietyDim && anxietyDim.score >= 38 && anxietyDim.score > (avoidanceDim?.score || 0)) {
    return "preoccupied";
  }

  let max = -1;
  let type: AttachmentType = "dismissing";

  const entries: [AttachmentType, number][] = [
    ["dismissing", fitness.dismissing],
    ["preoccupied", fitness.preoccupied],
    ["fearful", fitness.fearful],
    ["secure", fitness.secure]
  ];

  for (const [t, val] of entries) {
    if (val > max) {
      max = val;
      type = t;
    }
  }
  return type;
}
