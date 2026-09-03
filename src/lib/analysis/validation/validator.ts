import { DeepSeekExtractionPayload } from "./extractionSchema";
import { PreprocessedConversation } from "../interfaces";
import { signalDictionary } from "../dictionary";

export const validator_version = "1.4-mvp";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  payload?: DeepSeekExtractionPayload;
  warnings?: string[];
}

export function validateExtraction(
  payload: DeepSeekExtractionPayload,
  conversation: PreprocessedConversation
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const targetSpeakerId = payload.target_speaker_id;
  
  const targetMsgs = new Set(conversation.messages.filter(m => m.speaker_id === targetSpeakerId).map(m => m.id));
  const allMsgs = new Set(conversation.messages.map(m => m.id));
  
  const msgToEpisode = new Map<string, string>();
  conversation.messages.forEach(m => {
    msgToEpisode.set(m.id, m.episode_id);
  });

  const requiredSignalIds = Object.keys(signalDictionary);
  const signals = payload.signals;

  const foundIds = signals.map(s => s.id);
  const uniqueIds = new Set(foundIds);
  if (foundIds.length !== uniqueIds.size) errors.push(`Duplicate signals detected.`);
  
  for (const reqId of requiredSignalIds) {
    if (!uniqueIds.has(reqId)) errors.push(`Missing required signal ${reqId}`);
  }

  for (const s of signals) {
    if (!requiredSignalIds.includes(s.id)) continue;

    // Normalization: slice arrays
    if (s.evidence.length > 2) s.evidence = s.evidence.slice(0, 2);
    if (s.context.length > 2) s.context = s.context.slice(0, 2);
    if (s.counter.length > 1) s.counter = s.counter.slice(0, 1);
    if (s.alt.length > 1) s.alt = s.alt.slice(0, 1);

    // Message validation
    const observedEpisodes = new Set<string>();
    for (const mid of s.evidence) {
      if (!allMsgs.has(mid)) {
        errors.push(`${s.id}: evidence msg ${mid} does not exist`);
      } else if (!targetMsgs.has(mid)) {
        errors.push(`${s.id}: evidence msg ${mid} does not belong to ${targetSpeakerId}`);
      } else {
        observedEpisodes.add(msgToEpisode.get(mid) || "unknown");
      }
    }
    const computed_distinct_episode_count = observedEpisodes.size;

    for (const mid of s.context) {
      if (!allMsgs.has(mid)) errors.push(`${s.id}: context msg ${mid} does not exist`);
    }
    for (const mid of s.counter) {
      if (!allMsgs.has(mid)) errors.push(`${s.id}: counter msg ${mid} does not exist`);
    }

    // Status logic
    if (s.status === "detected") {
      if (typeof s.strength !== "number" || s.strength < 1 || s.strength > 3) {
        errors.push(`${s.id}: strength must be 1, 2, or 3 when detected`);
      }
      if (s.evidence.length === 0) {
        errors.push(`${s.id}: must have evidence when detected`);
      }
      if (s.strength === 3 && computed_distinct_episode_count < 2) {
        s.strength = 2; // Cap
        warnings.push(`STRENGTH_CAPPED: ${s.id} from 3 to 2 (single episode)`);
      }
    } else if (s.status === "not_detected") {
      if (s.strength !== 0) s.strength = 0;
    } else if (s.status === "ambiguous") {
      if (s.strength !== null) s.strength = null;
      if (s.evidence.length === 0 && s.context.length === 0 && s.alt.length === 0 && s.counter.length === 0) {
        errors.push(`${s.id}: ambiguous needs some evidence, context, counter, or alt`);
      }
    } else if (s.status === "insufficient") {
      if (s.strength !== null) s.strength = null;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    payload,
    warnings
  };
}
