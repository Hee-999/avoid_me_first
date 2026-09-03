import { MvpDimension, MvpFitness, MvpSignal, AttachmentType } from "./types";

export function calculateDimension(signals: MvpSignal[], expectedTotal: number): MvpDimension {
  let evaluable = 0;
  let sum = 0;

  for (const s of signals) {
    if (s.v !== null) {
      evaluable++;
      sum += s.v;
    }
  }

  const coverage = expectedTotal > 0 ? evaluable / expectedTotal : 0;
  const status = evaluable < 2 ? "low_coverage" : "ok";

  // Score is calculated as sum / (3 * evaluable) * 100
  let score = 0;
  if (evaluable > 0) {
    const raw = sum / (3 * evaluable);
    score = Math.round(raw * 100);
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

export function getPrimaryType(fitness: MvpFitness): AttachmentType {
  let max = -1;
  let type: AttachmentType = "secure";

  const entries: [AttachmentType, number][] = [
    ["secure", fitness.secure],
    ["preoccupied", fitness.preoccupied],
    ["dismissing", fitness.dismissing],
    ["fearful", fitness.fearful]
  ];

  for (const [t, val] of entries) {
    if (val > max) {
      max = val;
      type = t;
    }
  }
  return type;
}
