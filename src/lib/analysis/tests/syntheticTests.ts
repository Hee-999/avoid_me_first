import { preprocessConversation } from "../preprocessor";
import { evaluateStructuralSufficiency } from "../sufficiency/structuralGate";
import { extractSignals } from "../extractor/signalExtractor";

export interface TestCase {
  id: string;
  description: string;
  rawText: string;
}

export const SYNTHETIC_SMOKE_TEST: TestCase = {
  id: "SMOKE_001",
  description: "Basic smoke test for Preprocessor -> Sufficiency -> DeepSeek Extractor -> Validation",
  rawText: `
[구름] [오후 11:32] 나 오늘 너무 피곤해서... 우리 내일 얘기하면 안 될까?
[별이] [오후 11:33] 또 내일로 미루려고?
[별이] [오후 11:33] 우리 계속 이렇게 넘어갈 순 없잖아
[구름] [오후 11:34] 지금은 진짜 얘기하고 싶지 않아
[별이] [오후 11:34] 나는 싸우자는 게 아니라 풀 건 풀자는 거야
[별이] [오후 11:35] 왜 문제 생길 때마다 대화를 피하려고 해?
[구름] [오후 11:35] 또 시작이네
[구름] [오후 11:35] 그만하자
[별이] [오후 11:36] 그럼 언제 얘기할 건데?
[구름] [오후 11:37] 모르겠어 지금은 그냥 혼자 있고 싶어
[구름] [오후 11:38] 나중에 얘기해
[별이] [오후 11:38] 알았어
`
};

export async function runTest(testCase: TestCase) {
  console.log(`\n================================`);
  console.log(`Running Test: ${testCase.id}`);
  console.log(`Description: ${testCase.description}`);
  console.log(`================================`);

  // 1. Preprocessor
  console.log("-> 1. Preprocessing...");
  const preprocessed = preprocessConversation(testCase.rawText);
  console.log(`   Detected ${preprocessed.stats.total_messages} messages`);

  // 2. Sufficiency Gate
  console.log("-> 2. Evaluating Structural Sufficiency...");
  const sufficiency = evaluateStructuralSufficiency(preprocessed);
  console.log(`   Result: ${sufficiency.result}`);
  if (sufficiency.result === "INSUFFICIENT") {
    console.log("   Reasons:", sufficiency.reasons);
    console.log("   Skipping Extraction.");
    return;
  }

  // 3. Extraction & Validation
  console.log("-> 3. Calling DeepSeek Extractor (Wait 5-15s)...");
  try {
    const extraction = await extractSignals(preprocessed);
    
    if (extraction.valid) {
      console.log(`✅ SUCCESS! Validation passed.`);
      console.log(`   Repair attempted: ${extraction.repair_attempted}`);
      console.log(`   Speaker A signals: ${extraction.payload?.speaker_a.signals.length}`);
      console.log(`   Speaker B signals: ${extraction.payload?.speaker_b.signals.length}`);
    } else {
      console.log(`❌ FAILED! Validation errors:`);
      extraction.errors?.forEach(e => console.log(`   - ${e}`));
      console.log(`   Repair attempted: ${extraction.repair_attempted}`);
      console.log(`   Raw Output: ${extraction.raw_json?.substring(0, 500)}...`);
    }
  } catch (error: any) {
    console.log(`❌ ERROR! Process crashed:`, error.message);
  }
}

// Harness for Future 20 Cases
export async function runAllTests(testCases: TestCase[]) {
  let passCount = 0;
  for (const tc of testCases) {
    // In actual implementation, we'll compare with expected results
    await runTest(tc);
  }
}

// Only run smoke test if executed directly
if (require.main === module) {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("❌ SKIP: DEEPSEEK_API_KEY not found in .env.local");
    process.exit(1);
  }
  runTest(SYNTHETIC_SMOKE_TEST).catch(console.error);
}
