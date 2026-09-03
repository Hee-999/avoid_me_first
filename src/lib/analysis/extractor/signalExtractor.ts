import { PreprocessedConversation } from "../interfaces";
import { DeepSeekExtractionPayload, ExtractedSignal } from "../validation/extractionSchema";
import { buildExtractorPrompt, buildRepairPrompt } from "./extractorPrompt";
import { callDeepSeekAPI } from "./deepseekClient";
import { validateExtraction } from "../validation/validator";

export interface ExtractionProcessResult {
  valid: boolean;
  repair_attempted: boolean;
  repair_reason?: "json_parse_error" | "schema_validation_error";
  payload?: DeepSeekExtractionPayload;
  errors?: string[];
  warnings?: string[];
  raw_json?: string;
  latency_ms?: number;
  output_tokens?: number;
}

const extractJson = (text: string) => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
};

function mapToCanonical(id: string, obj: any, msgIdMap: Map<string, string>): ExtractedSignal {
  const statusMap: any = {
    "D": "detected",
    "N": "not_detected",
    "A": "ambiguous",
    "I": "insufficient"
  };

  const mapIds = (arr: any) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(mid => msgIdMap.get(mid) || mid);
  };

  return {
    id,
    status: statusMap[obj.s] || "insufficient",
    strength: obj.v !== undefined ? obj.v : null,
    reason: obj.r || "",
    evidence: mapIds(obj.e),
    context: mapIds(obj.c),
    counter: mapIds(obj.x),
    alt: Array.isArray(obj.a) ? obj.a : []
  };
}

export async function extractSignals(
  conversation: PreprocessedConversation,
  targetSpeakerId: "speaker_a" | "speaker_b"
): Promise<ExtractionProcessResult> {
  const start = Date.now();
  
  // Shorten Message IDs
  const longToShort = new Map<string, string>();
  const shortToLong = new Map<string, string>();
  
  conversation.messages.forEach((m, idx) => {
    const shortId = `m${idx+1}`;
    longToShort.set(m.id, shortId);
    shortToLong.set(shortId, m.id);
  });

  const anonymizedMessages = conversation.messages.map(m => ({
    id: longToShort.get(m.id),
    speaker: m.speaker_id === "speaker_a" ? "SPEAKER_A" : "SPEAKER_B",
    text: m.text
  }));

  const anonymizedJson = JSON.stringify(anonymizedMessages);
  const targetStr = targetSpeakerId === "speaker_a" ? "SPEAKER_A" : "SPEAKER_B";
  
  const prompt = buildExtractorPrompt(anonymizedJson, targetStr);
  
  let rawText = "";
  try {
    rawText = await callDeepSeekAPI(prompt);
    console.log(`[DEBUG] Target: ${targetSpeakerId}, RAW RESPONSE:\n${rawText}\n`);
  } catch(e: any) {
    return { valid: false, repair_attempted: false, latency_ms: Date.now() - start, errors: [e.message] };
  }

  let parsed: any = null;
  let repairReason = "";
  
  try {
    parsed = extractJson(rawText);
  } catch(e) {
    repairReason = "json_parse_error";
  }

  const REQUIRED_KEYS = [
    "AV01", "AV02", "AV03", "AV04", "AV05", "AV06",
    "AN01", "AN02", "AN03", "AN04", "AN05", "AN06"
  ];

  if (!repairReason) {
    const missingKeys = REQUIRED_KEYS.filter(k => !parsed[k]);
    if (missingKeys.length > 3) {
      repairReason = "schema_validation_error"; // Only repair if many missing
    }
  }

  if (!repairReason) {
    const signals = REQUIRED_KEYS.map(k => mapToCanonical(k, parsed[k] || { s: "I", r: "누락" }, shortToLong));
    const payload: DeepSeekExtractionPayload = { v: "1.5-quality-first", target_speaker_id: targetSpeakerId, context_summary: parsed.context_summary, signals };
    const val = validateExtraction(payload, conversation);
    return {
      valid: val.valid,
      repair_attempted: false,
      latency_ms: Date.now() - start,
      payload: val.payload,
      errors: val.errors,
      warnings: val.warnings,
      raw_json: rawText
    };
  }

  // REPAIR
  const repairPrompt = buildRepairPrompt([repairReason], rawText);
  let repairText = "";
  try {
    repairText = await callDeepSeekAPI(repairPrompt);
  } catch(e: any) {
    return { valid: false, repair_attempted: true, latency_ms: Date.now() - start, errors: [e.message] };
  }

  let repairParsed: any = null;
  try {
    repairParsed = extractJson(repairText);
  } catch(e) {
    return { valid: false, repair_attempted: true, latency_ms: Date.now() - start, errors: ["Repair parse failed"] };
  }

  const signals = REQUIRED_KEYS.map(k => mapToCanonical(k, repairParsed[k] || { s: "I", r: "누락" }, shortToLong));
  const payload: DeepSeekExtractionPayload = { v: "1.5-quality-first", target_speaker_id: targetSpeakerId, context_summary: repairParsed.context_summary, signals };
  const val = validateExtraction(payload, conversation);

  return {
    valid: val.valid,
    repair_attempted: true,
    latency_ms: Date.now() - start,
    payload: val.payload,
    errors: val.errors,
    warnings: val.warnings,
    raw_json: repairText
  };
}
