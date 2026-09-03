export type MvpSignalValue = 0 | 1 | 2 | 3 | null;

export interface MvpSignal {
  v: MvpSignalValue;
  e: string[];
}

export interface MvpRawExtraction {
  AV02: MvpSignal;
  AV03: MvpSignal;
  AV04: MvpSignal;
  AV05: MvpSignal;
  AN01: MvpSignal;
  AN02: MvpSignal;
  AN03: MvpSignal;
}

export interface MvpDimension {
  score: number;
  evaluable: number;
  total: number;
  coverage: number;
  status: "ok" | "low_coverage";
}

export interface MvpFitness {
  secure: number;
  preoccupied: number;
  dismissing: number;
  fearful: number;
}

export type AttachmentType = "secure" | "preoccupied" | "dismissing" | "fearful";

export interface MvpAnalysisResult {
  version: string;
  signals: MvpRawExtraction;
  dimensions: {
    avoidance: MvpDimension;
    anxiety: MvpDimension;
  };
  fitness: MvpFitness;
  primary_type: AttachmentType;
  primary_type_confidence: "normal" | "low";
}
