export interface SignalFeature {
  signal_id: string;
  category: "hyperactivating" | "deactivating" | "emotion" | "secure";
  dimension: "anxiety" | "avoidance" | "both";
  count: number;
  intensity: number; // 1 to 5
  evidence_quotes: string[];
}

export interface ExtractedSignals {
  demanding_reassurance: SignalFeature;
  over_texting: SignalFeature;
  fear_of_abandonment: SignalFeature;
  stonewalling: SignalFeature;
  dismissing_emotions: SignalFeature;
  intellectualization: SignalFeature;
  topic_shifting: SignalFeature;
  validating_emotions: SignalFeature;
}

export interface ExtractedData {
  message_length: number; // Total length of raw text
  signals: ExtractedSignals;
  demand_withdraw_detected: boolean;
  trigger_phrases: Array<{
    phrase: string;
    intensity: number;
    reason: string;
  }>;
}

export interface AttachmentDimensions {
  anxiety: number; // 0 - 100
  avoidance: number; // 0 - 100
}

export interface AttachmentFitness {
  secure: number; // 0 - 100
  preoccupied: number; // 0 - 100
  dismissing: number; // 0 - 100
  fearful: number; // 0 - 100
}

export interface ConfidenceScore {
  score: number; // 0 - 100
  level: "High" | "Medium" | "Low";
  reason: string;
}

export interface FinalAnalysis {
  attachment_dimensions: AttachmentDimensions;
  attachment_fitness: AttachmentFitness;
  primary_type: string;
  secondary_type: string;
  is_mixed_pattern: boolean;
  confidence: ConfidenceScore;
  extracted_data: ExtractedData;
}
