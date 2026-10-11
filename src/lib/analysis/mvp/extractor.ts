import { callResilientLLM } from "../llmRouter";
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
    const response = await callResilientLLM(prompt);
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

  // 1. Build message to episode mapping for deterministic episode cap
  const msgToEpisode = new Map<string, string>();
  let totalEpisodes = 1;
  try {
    const parsedConv = JSON.parse(options.conversationJson);
    const msgList = Array.isArray(parsedConv) 
      ? parsedConv 
      : (Array.isArray(parsedConv?.messages) ? parsedConv.messages : []);
    
    const episodeSet = new Set<string>();
    for (const m of msgList) {
      const mid = m.message_id || m.id;
      const ep = m.episode_id || "e001";
      if (mid) msgToEpisode.set(mid, ep);
      episodeSet.add(ep);
    }
    if (episodeSet.size > 0) {
      totalEpisodes = episodeSet.size;
    }
  } catch {
    // fallback
  }

  // 2. Parse and deterministically validate each signal
  const keys = ["AV02", "AV03", "AV04", "AV05", "AN01", "AN02", "AN03"];
  const signals: any = {};
  
  for (const k of keys) {
    const obj = parsed[k];
    if (obj && obj.v !== undefined) {
      let val = obj.v;
      let ev: string[] = Array.isArray(obj.e) ? obj.e : [];

      if (val === null || val === 0) {
        signals[k] = { v: val, e: [] };
      } else {
        // [Episode Rule]: Strength 3 is ONLY allowed if evidence spans 2+ distinct episodes
        const observedEpisodes = new Set<string>();
        for (const mid of ev) {
          const ep = msgToEpisode.get(mid);
          if (ep) observedEpisodes.add(ep);
        }

        // 1 episode -> max strength 2
        if (val === 3 && observedEpisodes.size < 2) {
          val = 2;
        }

        signals[k] = { v: val, e: ev };
      }
    } else {
      // Fallback for missing keys
      signals[k] = { v: null, e: [] };
    }
  }

  const rawSignals = signals as MvpRawExtraction;

  const avoidance = calculateDimension([rawSignals.AV02, rawSignals.AV03, rawSignals.AV04, rawSignals.AV05], 4);
  const anxiety = calculateDimension([rawSignals.AN01, rawSignals.AN02, rawSignals.AN03], 3);

  const fitness = calculateFitness(anxiety.score, avoidance.score);
  const primaryType = getPrimaryType(fitness, anxiety, avoidance);

  // [Confidence Principle]: Score represents pattern intensity, Confidence represents generalizability
  // - 평가 가능한 signal이 1개 이하거나 primary_type이 unclear이면 confidence = "low"
  // - 독립 episode가 1개뿐이면 high confidence 금지 (최대 "normal")
  // - 2개 이상의 독립 episode에서 다수 signal 평가 시 "high"
  const totalEvaluable = avoidance.evaluable + anxiety.evaluable;
  let primaryTypeConfidence: "high" | "normal" | "low" = "normal";

  if (totalEvaluable <= 1 || primaryType === "unclear") {
    primaryTypeConfidence = "low";
  } else if (totalEpisodes <= 1) {
    primaryTypeConfidence = "normal";
  } else if (totalEpisodes >= 2 && totalEvaluable >= 3) {
    primaryTypeConfidence = "high";
  } else {
    primaryTypeConfidence = "normal";
  }

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
