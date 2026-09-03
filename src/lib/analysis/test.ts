import { calculateDimensions } from "./scorer";
import { classifyTypes, calculateConfidence } from "./classifier";
import { ExtractedData } from "./types";

function runTest(name: string, data: Partial<ExtractedData>) {
  // Fill missing parts with 0
  const defaultData: ExtractedData = {
    message_length: 500,
    demand_withdraw_detected: false,
    trigger_phrases: [],
    signals: {
      demanding_reassurance: { signal_id: "", category: "hyperactivating", dimension: "anxiety", count: 0, intensity: 1, evidence_quotes: [] },
      over_texting: { signal_id: "", category: "hyperactivating", dimension: "anxiety", count: 0, intensity: 1, evidence_quotes: [] },
      fear_of_abandonment: { signal_id: "", category: "emotion", dimension: "anxiety", count: 0, intensity: 1, evidence_quotes: [] },
      stonewalling: { signal_id: "", category: "deactivating", dimension: "avoidance", count: 0, intensity: 1, evidence_quotes: [] },
      dismissing_emotions: { signal_id: "", category: "deactivating", dimension: "avoidance", count: 0, intensity: 1, evidence_quotes: [] },
      intellectualization: { signal_id: "", category: "deactivating", dimension: "avoidance", count: 0, intensity: 1, evidence_quotes: [] },
      topic_shifting: { signal_id: "", category: "deactivating", dimension: "avoidance", count: 0, intensity: 1, evidence_quotes: [] },
      validating_emotions: { signal_id: "", category: "secure", dimension: "both", count: 0, intensity: 1, evidence_quotes: [] },
    },
    ...data
  };
  
  if (data.signals) {
    defaultData.signals = { ...defaultData.signals, ...data.signals };
  }

  const dim = calculateDimensions(defaultData);
  const types = classifyTypes(dim);
  const conf = calculateConfidence(defaultData, dim);

  console.log(`\n=== Test: ${name} ===`);
  console.log(`Dimensions: Anx = ${dim.anxiety}, Avo = ${dim.avoidance}`);
  console.log(`Primary Type: ${types.primary}`);
  console.log(`Secondary Type: ${types.secondary}`);
  console.log(`Mixed?: ${types.isMixed}`);
  console.log(`Fitness: Secure(${types.fitness.secure}), Preoccupied(${types.fitness.preoccupied}), Dismissing(${types.fitness.dismissing}), Fearful(${types.fitness.fearful})`);
  console.log(`Confidence: ${conf.level} (${conf.score}) - ${conf.reason}`);
}

// Case A: Secure (Low, Low)
runTest("Case A: Secure", {
  signals: {
    // @ts-ignore
    validating_emotions: { count: 3, intensity: 5 },
    // @ts-ignore
    stonewalling: { count: 0, intensity: 1 }
  }
});

// Case B: Preoccupied (High Anx, Low Avo)
runTest("Case B: Preoccupied", {
  signals: {
    // @ts-ignore
    demanding_reassurance: { count: 4, intensity: 5 },
    // @ts-ignore
    fear_of_abandonment: { count: 2, intensity: 5 }
  }
});

// Case C: Dismissing (Low Anx, High Avo)
runTest("Case C: Dismissing", {
  signals: {
    // @ts-ignore
    stonewalling: { count: 4, intensity: 5 },
    // @ts-ignore
    dismissing_emotions: { count: 3, intensity: 4 }
  }
});

// Case D: Fearful (High Anx, High Avo)
runTest("Case D: Fearful", {
  signals: {
    // @ts-ignore
    demanding_reassurance: { count: 3, intensity: 4 },
    // @ts-ignore
    stonewalling: { count: 3, intensity: 5 }
  }
});

// Case E: Middle 
runTest("Case E: Middle", {
  signals: {
    // @ts-ignore
    demanding_reassurance: { count: 1, intensity: 2 },
    // @ts-ignore
    stonewalling: { count: 1, intensity: 2 }
  }
});

// Case F: Contradictory Signals -> Low Confidence
runTest("Case F: Contradictory Signals", {
  message_length: 50, // very short
  signals: {
    // @ts-ignore
    fear_of_abandonment: { count: 1, intensity: 5 },
    // @ts-ignore
    stonewalling: { count: 1, intensity: 5 }
  }
});
