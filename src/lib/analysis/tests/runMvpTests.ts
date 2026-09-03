import fs from "fs";
import { preprocessConversation } from "../preprocessor";
import { analyzeConversationMvpV2 } from "../mvp/extractor";

const TARGET_CASES: string[] = []; // empty means all cases

export async function runMvpTests(filePath: string) {
  if (!fs.existsSync(filePath)) return console.error(`File not found: ${filePath}`);
  
  const content = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(content);
  
  const testCases = TARGET_CASES.length > 0 ? data.cases.filter((c: any) => TARGET_CASES.includes(c.case_id)) : data.cases;

  console.log(`Starting Validation: MVP Scoring Model v2.0`);
  console.log(`Total Cases to Test: ${testCases.length}\n`);

  for (const tc of testCases) {
    console.log(`==================================================`);
    console.log(`[${tc.case_id}] ${tc.title}`);

    // Pick the speaker that has expectations (usually speaker_b or speaker_a)
    let targetSpeaker = "speaker_a";
    if (tc.expectations && tc.expectations.speaker_b && tc.expectations.speaker_b.length > 0 && 
        (!tc.expectations.speaker_a || tc.expectations.speaker_a.length === 0)) {
      targetSpeaker = "speaker_b";
    }

    console.log(`Target Speaker: ${targetSpeaker}`);
    const preprocessed = preprocessConversation(tc.conversation);

    const { result, latency_ms, error } = await analyzeConversationMvpV2({
      conversationJson: JSON.stringify(preprocessed),
      targetSpeaker
    });

    if (error || !result) {
      console.log(`❌ ERROR: ${error}`);
      continue;
    }

    console.log(`Latency: ${latency_ms}ms`);
    console.log(`API calls per analysis: 1\n`);
    
    console.log(`--- 7 Core Signals ---`);
    for (const [key, val] of Object.entries(result.signals)) {
      console.log(`${key}: v=${val.v}, e=[${val.e.join(", ")}]`);
    }

    console.log(`\n--- Avoidance ---`);
    console.log(`Score: ${result.dimensions.avoidance.score}`);
    console.log(`Coverage: ${result.dimensions.avoidance.coverage * 100}%`);
    console.log(`Status: ${result.dimensions.avoidance.status}`);

    console.log(`\n--- Anxiety ---`);
    console.log(`Score: ${result.dimensions.anxiety.score}`);
    console.log(`Coverage: ${result.dimensions.anxiety.coverage * 100}%`);
    console.log(`Status: ${result.dimensions.anxiety.status}`);

    console.log(`\n--- Bartholomew Fitness ---`);
    console.log(`Secure: ${result.fitness.secure}`);
    console.log(`Preoccupied: ${result.fitness.preoccupied}`);
    console.log(`Dismissing: ${result.fitness.dismissing}`);
    console.log(`Fearful: ${result.fitness.fearful}`);

    console.log(`\nPrimary Type: ${result.primary_type} (Confidence: ${result.primary_type_confidence})`);
  }
}

const filePath = process.argv[2] || "attatchment/attachment_signal_synthetic_20_v1_1.json";
runMvpTests(filePath);
