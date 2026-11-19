"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SAMPLE_ANALYSIS } from "@/lib/fixtures/sampleAnalysis";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { PremiumPurchasePrompt } from "@/components/premium/PremiumPurchasePrompt";
import { PremiumReportV2 } from "@/lib/report/premium/types";
import { PRICING } from "@/config/pricing";

const SAMPLE_PAID_REPORT: PremiumReportV2 = {
  executive_summary: {
    headline: "“감정이 끝난 건 아니지만, 상처받을까 봐 방어선을 치고 있어요.”",
    body: "대화가 길어질수록 에너지가 빠르게 소모되는 걸 느끼고 있거든요. 그래서 '피곤하다', '혼자 있고 싶다'는 말로 잠깐 숨을 고르려는 거예요. 반면 대화를 꺼낸 쪽은 관계를 좋게 만들고 싶은 마음에 계속 다가갔고, 그 간격이 온도차로 느껴진 거예요.",
    key_points: [
      "그 사람의 회피는 감정이 없어서가 아니라, 감정을 다루는 게 지금 버겁기 때문이에요.",
      "대화를 미루면서도 미안하다는 말을 남긴 건 최소한의 연결은 유지하고 싶다는 뜻이에요.",
      "지금은 확인이나 재촉보다 한 템포 쉬어주는 게 방어벽을 낮추는 데 훨씬 유리해요.",
    ],
  },
  attachment_profile: {
    primary_interpretation: "감정적 압박이 느껴질 때 거리를 두며 마음을 정돈하는 회피 방어 패턴이 높게 나타납니다.",
    dimension_interpretation: "관계 불안 지수는 중간 수준이지만, 거리두기 지수가 높아 갈등 직후 즉각적인 해결 요구에 방어적으로 닫히는 편입니다.",
  },
  behavior_patterns: [],
  evidence_deep_dive: [
    {
      title: "피곤하다며 대화를 미룬 순간",
      situation: "관계의 거리감을 느낀다며 진지한 대화를 요청했을 때예요.",
      observed_behavior: "\"요즘 너무 지쳐서 오늘은 여기까지 얘기하자\"며 대화를 마무리했어요.",
      interaction: "대화를 꺼낸 쪽은 서운함을 드러냈고, 상대는 먼저 자겠다며 선을 그었어요.",
      interpretation: "감정이 격해지는 상황을 견디기 힘들어서 대화를 닫아버린 거예요. 마음이 없어서가 아니라 감정 소모를 피하려는 방어기제예요.",
      alternative_explanation: "단순히 당일 컨디션 저하가 겹쳤을 가능성도 함께 보여요.",
      conclusion: "이 장면은 '지금은 대화의 타이밍이 아니다'라는 신호로 읽으면 돼요.",
    },
  ],
  trigger_profile: [],
  interaction_loop: {
    summary: "한쪽은 관계를 개선하려고 대화를 꺼내고, 다른 쪽은 부담을 느껴 피하면서 점점 더 엇갈린 거예요.",
    steps: [
      "거리감이 느껴져서 진지한 대화를 꺼냄",
      "부담을 느끼고 피곤하다며 한 발 물러섬",
      "답답한 마음에 언제 얘기할지 한 번 더 재촉함",
      "압박감을 이기지 못하고 대화를 닫아버림",
    ],
    break_points: ["대화를 요청할 때 결론을 요구하지 않고 선택지를 열어두기"],
  },
  conflict_pattern: {
    summary: "감정 확인형 질문이 반복될수록 침묵이 길어집니다.",
    works_better: ["짧고 가벼운 안부"],
    likely_to_worsen: ["장문 해명 요구"],
  },
  communication_guide: [
    {
      situation: "상대가 피곤하다며 대화를 피할 때",
      do: "오늘 고생했어. 편할 때 다시 얘기하자!",
      dont: "매번 이렇게 피하기만 하면 난 어떻게 해?",
      why: "당장 답을 내야 한다는 압박을 지워줘야 마음이 다시 열려요.",
    },
  ],
  conversation_rewrites: [
    {
      situation: "선톡을 보내고 싶을 때",
      original_pattern_summary: "우리 관계 어떻게 생각하냐고 직접 확인하려 함",
      recommended_message: "예: '오늘 지나가다 네가 좋아하던 카페 보여서 생각났어. 이번 주 잘 보내!'",
      why: "답장 의무감을 주지 않는 가벼운 메시지가 회피 성향 상대에게 가장 잘 먹혀요.",
    },
  ],
  recovery_signals: [
    "먼저 가벼운 일상 사진이나 짧은 안부를 보내옴",
    "이전 대화 주제를 자연스럽게 다시 꺼냄",
  ],
  risk_signals: [
    "읽씹 후 3일 이상 무응답 지속",
    "단답으로 일관하며 질문에 답을 회피함",
  ],
  action_plan: {
    next_conflict: ["즉각적인 해명 요구 멈추고 하루 텀 두기"],
    next_7_days: ["3~4일 간격으로 부담 없는 일상 톡 1회만 보내기", "상대 반응 속도에 맞춰 템포 조절하기"],
    next_30_days: ["가벼운 만남 제안 전 감정적 안정기 유지하기"],
  },
  manual_summary: {
    effective_approach: ["여유 있는 태도"],
    ineffective_approach: ["감정 추궁"],
    conflict_reentry: "가벼운 안부로 재진입",
    distance_response: "한 발 물러서기",
    relationship_check: "답장 길이와 질문 여부 확인",
    watch_for: ["반복되는 회피"],
    key_sentence: "기다림이 아니라 여유를 보여주는 게 핵심이에요.",
  },
  methodology: { body: "" },
};

export default function SampleResultPage() {
  const router = useRouter();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaidPreview, setIsPaidPreview] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPaidPreview(params.get("preview") === "paid");
  }, []);

  const analysis = isPaidPreview
    ? {
        ...SAMPLE_ANALYSIS,
        premium_report: SAMPLE_PAID_REPORT,
        status: { report: "completed", scoring: "completed" },
      }
    : SAMPLE_ANALYSIS;
  const { target_speaker_label, derived_context } = analysis;
  const targetName = target_speaker_label || "상대방";
  const v3 = derived_context?.v3_metrics;
  const userTemp = v3?.user_temperature ?? 78;
  const backfire = v3?.backfire_risk_percent ?? 75;
  const signalCount = v3?.signal_count ?? 3;
  const teaseScene =
    v3?.tease_scene_summary ||
    "주말 일정과 서운한 감정을 꺼냈을 때, 상대방이 피곤하다는 이유로 대화를 미루고 답장을 멈춘 장면";

  // NICEPAY 결제 모듈 진입 핸들러 (샘플 확인용)
  const handleUnlock = async () => {
    if (isPaymentProcessing) return;
    try {
      setIsPaymentProcessing(true);

      if (!(window as any).AUTHNICE) {
        throw new Error("결제 모듈을 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const baseUrl = (
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      ).replace(/\/+$/, "");
      const orderId = `sample_${Date.now()}`;

      (window as any).AUTHNICE.requestPay({
        clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
        method: "cardAndEasyPay",
        orderId: orderId,
        amount: PRICING.REPORT.salePrice,
        goodsName: PRICING.REPORT.shortName,
        returnUrl: `${baseUrl}/api/premium/callback`,
        fnError: function (result: any) {
          setIsPaymentProcessing(false);
          if (result?.errorMsg) {
            alert(result.errorMsg);
          }
        },
      });
    } catch (err: any) {
      setIsPaymentProcessing(false);
      alert(err.message || "결제 모듈 진입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -ml-1 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">예시 분석 결과 리포트</span>
          <div className="w-5 h-5" />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10 break-keep">
        {/* 샘플 예시 안내 뱃지 */}
        <div className="mb-6 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="block text-[13px] font-bold text-blue-900">샘플 분석 결과 미리보기</span>
            <p className="text-[12px] text-blue-700 leading-snug mt-0.5">
              실제 카톡 캡처 분석 시 제공되는 V3 결과 화면 예시입니다.
            </p>
          </div>
        </div>

        {/* V3 핵심 판독 & 쌍방 온도차 티저 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full">
              💔 재회 · 애매한 사이 판독
            </span>
            <span className="inline-block px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-bold rounded-full">
              대상: {targetName}
            </span>
          </div>

          <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-snug">
            {targetName}의 진짜 속마음 &amp;{" "}
            <span className="text-blue-600">재회 온도차</span> 판독
          </h1>

          <div className="mt-4 space-y-3">
            {/* 1. 쌍방 온도차 게이지 (티저) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-[12px] font-bold text-zinc-700 mb-2">
                <span>🌡️ 두 사람의 관계 온도차 (을의 연애 지수)</span>
                {isPaidPreview ? (
                  <span className="text-blue-600 font-black">
                    재회 가능성 {v3?.success_probability ?? 48}%
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-extrabold">
                    상대 온도 잠금 🔒
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-500 block">내 감정/몰입 온도</span>
                  <span className="text-[20px] font-black text-zinc-900">{userTemp}%</span>
                  <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${userTemp}%` }} />
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-500 block">{targetName}의 실제 온도</span>
                  {isPaidPreview ? (
                    <>
                      <span className="text-[20px] font-black text-blue-600">
                        {v3?.target_temperature ?? 46}%
                      </span>
                      <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${v3?.target_temperature ?? 46}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[20px] font-black text-zinc-400 select-none">🔒 ??%</span>
                      <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-300 rounded-full w-1/3 blur-[1px]" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2. 소름 요약 1줄 + 주의 지수 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2.5">
              <p className="text-[13.5px] text-zinc-800 leading-relaxed font-semibold">
                📌 <span className="text-blue-700 font-bold">{teaseScene}</span>에서{" "}
                <strong>핵심 심리 시그널 {signalCount}개</strong>가 동시에 포착되었습니다.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-3.5 py-2.5 text-[12.5px] font-bold text-amber-900 leading-snug">
                💡 상대의 진짜 의도를 모른 채 섣불리 연락하면 대화가 더 멀어질 수 있어요{" "}
                <span className="text-amber-700">(성급한 연락 주의 지수 {backfire}%)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {isPaidPreview && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-[12.5px] text-emerald-950 space-y-2.5">
            <p className="font-bold">
              ✅ 결제가 완료되었습니다! 아래에서 심층 리포트와 1:1 AI 상담을 바로 확인하세요.
            </p>
            <div className="space-y-2 pt-1">
              <p className="text-[12px] text-emerald-900 font-semibold">
                창을 닫아도 다시 보시려면 카톡으로 전용 링크와 비밀 키(PIN 4자리)를 받아두세요.
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="010-1234-5678"
                  className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2.5 text-[13px] text-zinc-900 outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-zinc-900 text-white text-[12.5px] font-bold rounded-xl hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                >
                  카톡 받기
                </button>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-snug">
                🔒 입력하신 번호는 다른 목적으로 쓰이지 않고, 리포트 링크 발송과 본인만 링크를 확인할 수 있도록 본인 확인용 비밀 키 발송에만 쓰입니다.
              </p>
            </div>
          </div>
        )}

        <PremiumPurchasePrompt
          analysis={analysis}
          onUnlock={handleUnlock}
          isProcessing={isPaymentProcessing}
          isPremium={isPaidPreview}
        />

        {/* PREMIUM REPORT / LOCKED PAYWALL */}
        <div id="premium-purchase-details" className="relative scroll-mt-6">
          <PremiumReport
            analysis={analysis}
            isPremium={isPaidPreview}
            onUnlock={handleUnlock}
            isProcessing={isPaymentProcessing}
          />
        </div>

        {/* 내 카톡으로 직접 분석해보기 CTA */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/?view=input")}
            className="w-full py-4 bg-zinc-950 text-white text-[14.5px] font-bold rounded-2xl hover:bg-zinc-800 transition shadow-md cursor-pointer"
          >
            내 카톡 캡처로 직접 판독해 보기 →
          </button>
        </div>
        <div className="h-24 print:hidden" aria-hidden="true" />
      </main>
    </div>
  );
}
