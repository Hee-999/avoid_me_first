import { PremiumPurchasePrompt, getPurchaseLabel } from "../../../components/premium/PremiumPurchasePrompt";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PremiumReport } from "../../../components/premium/PremiumReport";
import { PrintablePremiumReport } from "../../../components/premium/PrintablePremiumReport";
import { PremiumReportLocked } from "../../../components/premium/PremiumReportLocked";
import { SAMPLE_ANALYSIS } from "../../fixtures/sampleAnalysis";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getAnalysisUiPresentation } from "../../analysis/types";
import { getPremiumOffer } from "./offer";
import { validatePremiumReportPart } from "./validator";
import { buildPremiumReportPromptPart1, buildPremiumReportPromptPart2 } from "./prompts";
import type { MvpAnalysisResult } from "../../analysis/mvp/types";
import type { DerivedReportContext } from "./types";

const options = { primaryType: "unclear", anxietyScore: 0, avoidanceScore: 0, anxietyStatus: "insufficient", avoidanceStatus: "insufficient" };
test("평가 불가와 관찰되지 않은 0점 구분", () => {
  const missing = getAnalysisUiPresentation(options);
  assert.equal(missing.mode, "insufficient_all");
  assert.match(missing.headlineMain, /단서가 부족/);
  const zero = getAnalysisUiPresentation({ ...options, avoidanceStatus: "ok" });
  assert.equal(zero.mode, "not_observed");
  assert.match(zero.description, /확정하는 결과는 아니/);
  const observed = getAnalysisUiPresentation({ ...options, avoidanceStatus: "low_coverage", avoidanceScore: 67 });
  assert.equal(observed.mode, "avoidance_dominant");
  assert.equal(getAnalysisUiPresentation({ ...options, primaryType: "secure", anxietyStatus: "ok", avoidanceStatus: "ok" }).mode, "not_observed");
  assert.equal(getAnalysisUiPresentation({ ...options, anxietyStatus: "ok", anxietyScore: 67 }).mode, "anxiety_dominant");
});
test("일상 대화도 관심사에 맞게 제안하며 자료가 없는 경우 구매를 앞세우지 않음", () => {
  const normal = { primary_type: "secure", attachment_dimensions: { anxiety: 0, avoidance: 0, anxiety_status: "ok" as const, avoidance_status: "ok" as const } };
  const reply = getPremiumOffer({ ...normal, derived_context: { context_intake: { desired_focus: "어떻게 답할지" } } });
  assert.match(reply.title, /답장/);
  assert.equal(reply.canOffer, true);
  assert.match(getPremiumOffer({ ...normal, derived_context: { context_intake: { desired_focus: "반복되는 관계 패턴" } } }).title, /소통 방식/);
  const missing = { primary_type: "unclear", attachment_dimensions: { anxiety: 0, avoidance: 0, anxiety_status: "insufficient" as const, avoidance_status: "insufficient" as const } };
  assert.equal(getPremiumOffer(missing).canOffer, false);
  assert.equal(getPremiumOffer({ ...missing, derived_context: { key_situations: [{ situation: "일상 안부", target_behavior: "질문에 답하고 상대의 하루를 물음" }] } }).canOffer, true);
  assert.equal(getPremiumOffer({ ...normal, status: { report: "failed" } }).canOffer, false);
});
test("기존 저장 테스트 리포트 20개는 구조 검증을 통과함", () => {
  for (let i = 1; i <= 20; i++) {
    const report = JSON.parse(readFileSync(`premium_test_CASE_${String(i).padStart(3, "0")}.json`, "utf8"));
    assert.deepEqual(validatePremiumReportPart(report, "Part_1"), [], `사례 ${i} 전반부`);
    assert.deepEqual(validatePremiumReportPart(report, "Part_2"), [], `사례 ${i} 후반부`);
  }
});
test("빈 필수 항목·잘못된 자료형·일반적인 없음 출력은 차단, 선택 배열은 허용", () => {
  const report = JSON.parse(readFileSync("premium_test_CASE_017.json", "utf8"));
  assert.deepEqual(validatePremiumReportPart({ ...report, trigger_profile: [], behavior_patterns: [] }, "Part_1"), []);
  assert.ok(validatePremiumReportPart({ ...report, evidence_deep_dive: [] }, "Part_1").length);
  assert.ok(validatePremiumReportPart({ ...report, conversation_rewrites: [] }, "Part_2").length);
  assert.ok(validatePremiumReportPart({ ...report, action_plan: "없음" }, "Part_2").length);
  assert.ok(validatePremiumReportPart({ ...report, executive_summary: { headline: "없음", body: "판단 불가", key_points: [] } }, "Part_1").length);
});
test("양쪽 유료 프롬프트에 설문과 일상 대화 상담 원칙이 전달됨", () => {
  const context = { context_intake: { situation: "평소 일상", recurrence: "처음", desired_focus: "어떻게 답할지" } } as DerivedReportContext;
  for (const build of [buildPremiumReportPromptPart1, buildPremiumReportPromptPart2]) {
    const prompt = build({} as MvpAnalysisResult, context);
    assert.match(prompt, /어떻게 답할지/);
    assert.match(prompt, /Even if avoidance is 0/);
    assert.match(prompt, /Keep EVERY JSON key/);
  }
});

test("기존 리포트 20개 웹·인쇄 렌더링과 일상 대화 구매 버튼 확인", () => {
  for (let i = 1; i <= 20; i++) {
    const report = JSON.parse(readFileSync(`premium_test_CASE_${String(i).padStart(3, "0")}.json`, "utf8"));
    const analysis = { ...SAMPLE_ANALYSIS, premium_report: report, status: { report: "ready" } };
    const web = renderToStaticMarkup(React.createElement(PremiumReport, { analysis, isPremium: true }));
    const print = renderToStaticMarkup(React.createElement(PrintablePremiumReport, { analysis, isPremium: true }));
    assert.ok(web.includes(report.executive_summary.headline));
    assert.ok(print.includes(report.executive_summary.headline));
    assert.ok(!web.includes("발작 버튼") && !web.includes("왜 발작하는가") && !web.includes("기존 발화 패턴 (비추천)"));
  }
  const daily = { ...SAMPLE_ANALYSIS, primary_type: "secure", attachment_dimensions: { anxiety: 0, avoidance: 0, anxiety_status: "ok" as const, avoidance_status: "ok" as const }, derived_context: { context_intake: { desired_focus: "어떻게 답할지" } } };
  const html = renderToStaticMarkup(React.createElement(PremiumReportLocked, { analysis: daily, onUnlock() {} }));
  assert.ok(html.includes("이번 대화에 맞는 답장 표현"));
  assert.ok(html.includes("얼리버드 특별가 2,900원"));
  assert.ok(html.includes("맞춤 대화 리포트 열기"));
  assert.ok(!html.includes("강한 방어기제"));
});

test("요약 구매 안내는 관심사·가격·코랄 버튼을 표시하고 구매 완료 시 사라짐", () => {
  const daily = { ...SAMPLE_ANALYSIS, primary_type: "secure", attachment_dimensions: { anxiety: 0, avoidance: 0 }, derived_context: { context_intake: { desired_focus: "어떻게 답할지" } } };
  assert.equal(getPurchaseLabel(daily), "내 대화에 맞는 답장 확인");
  const props = { analysis: daily, onUnlock() {} };
  const html = renderToStaticMarkup(React.createElement(PremiumPurchasePrompt, props));
  assert.ok(html.includes("내 대화에 맞는 답장 확인"));
  assert.ok(html.includes("2,900원"));
  assert.ok(html.includes("#C2410C"));
  assert.equal(renderToStaticMarkup(React.createElement(PremiumPurchasePrompt, { ...props, isPremium: true })), "");
  assert.equal(renderToStaticMarkup(React.createElement(PremiumPurchasePrompt, { ...props, analysis: { ...daily, status: { report: "failed" } } })), "");
});
