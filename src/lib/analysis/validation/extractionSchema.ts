export interface ExtractedSignal {
  id: string;
  status: "detected" | "not_detected" | "ambiguous" | "insufficient";
  strength: number | null;
  reason: string;
  evidence: string[];
  context: string[];
  counter: string[];
  alt: string[];
}

export interface DeepSeekExtractionPayload {
  v: string;
  target_speaker_id: string;
  context_summary?: string;
  signals: ExtractedSignal[];
}
