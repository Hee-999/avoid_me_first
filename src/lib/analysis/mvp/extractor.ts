import { callDeepSeekAPI } from "../extractor/deepseekClient";
import { buildMvpPrompt } from "./prompt";
import { calculateDimension, calculateFitness, getPrimaryType } from "./scoring";
import { MvpAnalysisResult, MvpRawExtraction, MvpSignal } from "./types";

export interface MvpExtractionOptions {
  conversationJson: string;
  targetSpeaker: string;
}

export async function analyzeConversationMvpV2(options: MvpExtractionOptions): Promise<{ result: MvpAnalysisResult | null; latency_ms: number; error?: string }> {
  const start = Date.now();
  const prompt = buildMvpPrompt(options.conversationJson, options.targetSpeaker);
  
  let rawResponse = "";
  try {
    const response = await callDeepSeekAPI(prompt);
    rawResponse = response.content;
  } catch (e: any) {
    return { result: null, latency_ms: Date.now() - start, error: e.message };
  }

  let cleaned = extractJsonSubstring(rawResponse);
  if (!cleaned) {
    return { result: null, latency_ms: Date.now() - start, error: "Empty JSON extracted." };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e: any) {
    return { result: null, latency_ms: Date.now() - start, error: "JSON Parse error: " + e.message };
  }

  // Cap v=3 -> 2 if evidence length <= 1
  const keys = ["AV02", "AV03", "AV04", "AV05", "AN01", "AN02", "AN03"];
  const signals: any = {};
  
  for (const k of keys) {
    const obj = parsed[k];
    if (obj && obj.v !== undefined && Array.isArray(obj.e)) {
      let val = obj.v;
      if (val === 3 && obj.e.length <= 1) {
        val = 2;
      }
      signals[k] = { v: val, e: obj.e };
    } else {
      // Fallback for missing keys
      signals[k] = { v: null, e: [] };
    }
  }

  const rawSignals = signals as MvpRawExtraction;

  const avoidance = calculateDimension([rawSignals.AV02, rawSignals.AV03, rawSignals.AV04, rawSignals.AV05], 4);
  const anxiety = calculateDimension([rawSignals.AN01, rawSignals.AN02, rawSignals.AN03], 3);

  const fitness = calculateFitness(anxiety.score, avoidance.score);
  const primaryType = getPrimaryType(fitness);
  const primaryTypeConfidence = (avoidance.status === "low_coverage" || anxiety.status === "low_coverage") ? "low" : "normal";

  const result: MvpAnalysisResult = {
    version: "mvp-scoring-v2.0",
    signals: rawSignals,
    dimensions: {
      avoidance,
      anxiety
    },
    fitness,
    primary_type: primaryType,
    primary_type_confidence: primaryTypeConfidence
  };

  return {
    result,
    latency_ms: Date.now() - start
  };
}

function extractJsonSubstring(raw: string): string {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
    return "";
  }
  return raw.substring(firstBrace, lastBrace + 1);
}
