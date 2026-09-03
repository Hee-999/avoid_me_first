import { PreprocessedConversation } from "../interfaces";

export type SufficiencyResult = "PASS" | "LIMITED" | "INSUFFICIENT";

export interface SufficiencyConfig {
  minTotalTextMessages: number;
  minSpeakerATextMessages: number;
  minSpeakerBTextMessages: number;
  minSpeakerACharacterCount: number;
  minSpeakerBCharacterCount: number;
  minParseConfidence: number;
}

export const DEFAULT_SUFFICIENCY_CONFIG: SufficiencyConfig = {
  minTotalTextMessages: 12,
  minSpeakerATextMessages: 4,
  minSpeakerBTextMessages: 4,
  minSpeakerACharacterCount: 80,
  minSpeakerBCharacterCount: 80,
  minParseConfidence: 0.80,
};

export interface SufficiencyEvaluation {
  result: SufficiencyResult;
  reasons: string[];
}

/**
 * Structural Sufficiency Gate v1.0
 * DeepSeek AI 호출 전에 최소한의 대화 볼륨이 존재하는지 검증하는 Engineering Threshold.
 */
export function evaluateStructuralSufficiency(
  conversation: PreprocessedConversation,
  config: SufficiencyConfig = DEFAULT_SUFFICIENCY_CONFIG
): SufficiencyEvaluation {
  const { stats, parser } = conversation;
  const reasons: string[] = [];

  if (parser.parse_confidence < config.minParseConfidence) {
    reasons.push(`Low parse confidence: ${parser.parse_confidence}`);
  }
  if (stats.speaker_a_text_messages + stats.speaker_b_text_messages < config.minTotalTextMessages) {
    reasons.push(`Insufficient total messages: ${stats.speaker_a_text_messages + stats.speaker_b_text_messages} < ${config.minTotalTextMessages}`);
  }
  if (stats.speaker_a_text_messages < config.minSpeakerATextMessages) {
    reasons.push(`Insufficient Speaker A messages: ${stats.speaker_a_text_messages} < ${config.minSpeakerATextMessages}`);
  }
  if (stats.speaker_b_text_messages < config.minSpeakerBTextMessages) {
    reasons.push(`Insufficient Speaker B messages: ${stats.speaker_b_text_messages} < ${config.minSpeakerBTextMessages}`);
  }
  if (stats.speaker_a_character_count < config.minSpeakerACharacterCount) {
    reasons.push(`Insufficient Speaker A characters: ${stats.speaker_a_character_count} < ${config.minSpeakerACharacterCount}`);
  }
  if (stats.speaker_b_character_count < config.minSpeakerBCharacterCount) {
    reasons.push(`Insufficient Speaker B characters: ${stats.speaker_b_character_count} < ${config.minSpeakerBCharacterCount}`);
  }

  if (reasons.length > 0) {
    // For MVP, if it fails threshold, it's INSUFFICIENT.
    // Later we can introduce LIMITED logic.
    return {
      result: "INSUFFICIENT",
      reasons
    };
  }

  return {
    result: "PASS",
    reasons: []
  };
}
