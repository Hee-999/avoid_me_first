import fs from 'fs';
import path from 'path';
import { analyzeConversationMvpV2 } from '../../../analysis/mvp/extractor';
import { buildDerivedReportContext } from '../contextBuilder';
import { generatePremiumReport, lastGenerationMetrics } from '../generator';

const TEST_CASES = Array.from({length: 20}, (_, i) => `CASE_${String(i + 1).padStart(3, '0')}`);

async function runPremiumTests() {
  console.log("Starting Premium Report v2.0 Tests...");

  const syntheticPath = path.join(process.cwd(), 'attatchment', 'attachment_signal_synthetic_20_v1_1.json');
  const syntheticData = JSON.parse(fs.readFileSync(syntheticPath, 'utf8'));

  for (const caseId of TEST_CASES) {
    const testCase = syntheticData.cases.find((c: any) => c.case_id === caseId);
    if (!testCase) {
      console.log(`\n❌ [${caseId}] Not found in synthetic data.`);
      continue;
    }

    console.log(`\n==================================================`);
    console.log(`[${testCase.case_id}] ${testCase.title}`);
    const targetSpeaker = testCase.analysis_target || "speaker_b";

    try {
      const convJson = JSON.stringify(testCase.conversation);
      
      // 1. MVP Scoring
      const { result: mvpResult, error: mvpError } = await analyzeConversationMvpV2({
        conversationJson: convJson,
        targetSpeaker
      });
      if (mvpError || !mvpResult) throw new Error("MVP Scoring failed: " + mvpError);

      console.log(`✅ MVP Score: Anxiety=${mvpResult.dimensions.anxiety.score}, Avoidance=${mvpResult.dimensions.avoidance.score}, Primary=${mvpResult.primary_type}`);

      // 2. Context Building
      const startCtx = Date.now();
      const derivedContext = await buildDerivedReportContext(convJson, targetSpeaker, mvpResult);
      const ctxLatency = Date.now() - startCtx;
      console.log(`✅ Context Built (${ctxLatency}ms)`);
      
      // Check for raw quotes in derived context (Privacy Check)
      const ctxStr = JSON.stringify(derivedContext);
      const firstMsgText = testCase.conversation?.[0]?.text;
      if (firstMsgText && ctxStr.includes(firstMsgText.substring(0, 5))) {
         console.warn(`⚠️ Warning: Raw text might be leaking into Derived Context!`);
      }

      // 3. Premium Report Generation
      const startRep = Date.now();
      const report = await generatePremiumReport(mvpResult, derivedContext);
      const repLatency = Date.now() - startRep;
      
      const reportStr = JSON.stringify(report, null, 2);
      const charCount = reportStr.length;

      console.log(`✅ Premium Report Generated (${repLatency}ms) | Size: ${charCount} chars`);
      
      // Output sample of Executive Summary
      console.log(`\n[Headline]: ${report.executive_summary.headline}`);
      console.log(`[Summary]: ${report.executive_summary.body.substring(0, 100)}...`);

      // Language Enforcement Metrics Output
      console.log(`\n--- PREMIUM REPORT KOREAN ENFORCEMENT ---`);
      console.log(`CASE_ID: ${caseId}`);
      console.log(`total_wall_latency_ms: ${repLatency}ms\n`);

      let totalRetries = 0;
      let totalInput = 0;
      let totalOutput = 0;
      let fails = 0;
      
      console.log(`각 chapter:`);
      lastGenerationMetrics.forEach(metric => {
         console.log(`- chapter_name: ${metric.partName}`);
         console.log(`- status: ${metric.language_status}`);
         console.log(`- latency_ms: ${metric.latency_ms}`);
         console.log(`- input_tokens: ${metric.input_tokens}`);
         console.log(`- output_tokens: ${metric.output_tokens}`);
         console.log(`- retry_count: ${metric.retry_count}\n`);
         
         totalRetries += metric.retry_count;
         totalInput += metric.input_tokens;
         totalOutput += metric.output_tokens;
         if (metric.language_status === 'failed') fails++;
      });
      
      console.log(`TOTAL:`);
      console.log(`- input_tokens: ${totalInput}`);
      console.log(`- output_tokens: ${totalOutput}`);
      console.log(`- retry_count: ${totalRetries}\n`);

      if (fails === 0) {
         console.log(`PREMIUM REPORT KOREAN ENFORCEMENT\nREADY\n`);
      } else {
         console.log(`PREMIUM REPORT KOREAN ENFORCEMENT\nNEEDS REVISION\n`);
      }

      // Privacy Check on final report
      if (firstMsgText && reportStr.includes(firstMsgText.substring(0, 5))) {
         console.error(`❌ PRIVACY FAIL: Raw text found in Premium Report!`);
      } else {
         console.log(`✅ PRIVACY PASS: No raw text detected.`);
      }

      // Save output to file for manual review
      fs.writeFileSync(path.join(process.cwd(), `premium_test_${caseId}.json`), reportStr);

    } catch (e: any) {
      console.error(`❌ ERROR in ${caseId}:`, e.message);
    }
  }
}

runPremiumTests();
