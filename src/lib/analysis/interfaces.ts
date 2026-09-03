import { SIGNAL_DICTIONARY_VERSION } from "./dictionary";

/**
 * Version Management for Architecture Components
 */
export const MODEL_VERSIONS = {
  signal_dictionary_version: SIGNAL_DICTIONARY_VERSION,
  sufficiency_version: "1.0",
  extractor_prompt_version: "1.0",
  scoring_version: "1.0",
  fitness_version: "1.0",
  report_version: "1.0"
};

/**
 * Expected output structure from the DeepSeek Signal Extractor
 */
export interface ExtractedSignalStatus {
  signal_id: string; // e.g. "AV02"
  status: "detected" | "not_detected" | "ambiguous" | "insufficient";
  strength: 0 | 1 | 2 | 3;
  confidence: number; // 0~100
  evidence_message_ids: string[];
  counter_evidence_message_ids: string[];
  distinct_episode_count: number;
  reason: string;
}

/**
 * The unified output of the DeepSeek Extractor module.
 */
export interface DeepSeekExtractionResult {
  signals: ExtractedSignalStatus[];
  metadata: {
    extractor_version: string;
    dictionary_version: string;
  };
}

/**
 * The next step in the pipeline is the Conversation Preprocessor.
 * This defines the standard format the Extractor will consume.
 */
export interface ProcessedMessage {
  id: string; // e.g. "m000001"
  speaker_id: string; // "speaker_a" or "speaker_b"
  timestamp: string | null;
  type: "text" | "media" | "system";
  media_type?: string;
  text: string;
  episode_id: string;
  message_group_id: string;
}

export interface ConversationParticipant {
  id: "speaker_a" | "speaker_b";
  display_label: string;
}

export interface IdentityMapping {
  user_speaker_id: "speaker_a" | "speaker_b" | null;
  target_speaker_id: "speaker_a" | "speaker_b" | null;
}

export interface ConversationStats {
  total_messages: number;
  speaker_a_messages: number;
  speaker_b_messages: number;
  speaker_a_text_messages: number;
  speaker_b_text_messages: number;
  speaker_a_character_count: number;
  speaker_b_character_count: number;
  episode_count: number;
  media_count: number;
  system_message_count: number;
  start_time: string | null;
  end_time: string | null;
}

export interface ParserResult {
  detected_format: string;
  parse_confidence: number; // 0 to 1
  warnings: string[];
}

export interface PreprocessedConversation {
  schema_version: string; // e.g. "conversation-v1.0"
  participants: ConversationParticipant[];
  identity_mapping: IdentityMapping;
  messages: ProcessedMessage[];
  stats: ConversationStats;
  parser: ParserResult;
}
