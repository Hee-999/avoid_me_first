export interface SignalFeature {
  count: number;
  intensity: number; // 1 to 5
  evidence_quotes: string[];
}

export interface ExtractedSignals {
  // Avoidance signals
  stonewalling: SignalFeature;
  dismissing: SignalFeature;
  intellectualization: SignalFeature;
  topic_shifting: SignalFeature;
  // Anxiety signals
  demanding_reassurance: SignalFeature;
  over_texting: SignalFeature;
}

export interface ExtractedData {
  signals: ExtractedSignals;
  demand_withdraw_detected: boolean;
  trigger_phrases: Array<{
    phrase: string;
    intensity: number; // 1 to 5
    reason: string;
  }>;
}

export interface ScoredResult {
  avoidanceScore: number;
  anxietyScore: number;
  extractedData: ExtractedData;
}

export interface ClassificationProfile {
  type: string;
  avoidanceBand: string;
  anxietyBand: string;
  primaryDefenses: string[];
}

export interface FinalAnalysis {
  scored: ScoredResult;
  profile: ClassificationProfile;
}
