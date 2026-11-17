"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SAMPLE_ANALYSIS } from "@/lib/fixtures/sampleAnalysis";
import { PremiumReportLocked } from "@/components/premium/PremiumReportLocked";
import { PremiumPurchasePrompt } from "@/components/premium/PremiumPurchasePrompt";
import { PRICING } from "@/config/pricing";

export default function SampleResultPage() {
  const router = useRouter();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const analysis = SAMPLE_ANALYSIS;
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
  const handleUnlock = async (buyerTel?: string) => {
    if (isPaymentProcessing) return;
    if (!buyerTel) {
      const telEl = document.getElementById("buyer-tel-input") as HTMLInputElement | null;
      if (telEl) {
        telEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => telEl.focus(), 350);
        return;
      }
    }
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
        ...(buyerTel ? { buyerTel } : {}),
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
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-extrabold">
                  상대 온도 잠금 🔒
                </span>
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
                  <span className="text-[20px] font-black text-zinc-400 select-none">🔒 ??%</span>
                  <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-300 rounded-full w-1/3 blur-[1px]" />
                  </div>
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

        <PremiumPurchasePrompt analysis={analysis} onUnlock={handleUnlock} isProcessing={isPaymentProcessing} />

        {/* PREMIUM LOCKED (결제 유도 + 1:1 상담 예시 질문 + 휴대폰 입력) */}
        <div id="premium-purchase-details" className="relative scroll-mt-6">
          <PremiumReportLocked
            analysis={analysis}
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
