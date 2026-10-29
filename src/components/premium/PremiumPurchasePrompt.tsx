"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";

export interface PremiumPurchasePromptProps {
  analysis: Partial<FinalAnalysis>;
  onUnlock: () => void;
  isProcessing?: boolean;
  isPremium?: boolean;
}

export function getPurchaseLabel(analysis: Partial<FinalAnalysis>): string {
  const focus = analysis.derived_context?.context_intake?.desired_focus || "";
  if (focus.includes("답할지")) return "내 대화에 맞는 답장 확인";
  if (focus.includes("관계 패턴")) return "두 사람의 소통 패턴 확인";
  if (focus.includes("대화의 의미")) return "이 반응의 의미 더 알아보기";
  if (focus.includes("앞으로")) return "앞으로 살펴볼 반응 확인";
  return "내 맞춤 대화 리포트 열기";
}

export function PremiumPurchasePrompt({ analysis, onUnlock, isProcessing = false, isPremium = false }: PremiumPurchasePromptProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const offer = getPremiumOffer(analysis);
  const label = getPurchaseLabel(analysis);
  const available = !isPremium && offer.canOffer;

  useEffect(() => {
    if (!available) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const card = cardRef.current;
      const details = document.getElementById("premium-purchase-details");
      if (!card) return;
      const rect = details?.getBoundingClientRect();
      const detailsVisible = !!rect && rect.top < window.innerHeight && rect.bottom > 0;
      setShowSticky(card.getBoundingClientRect().bottom < 0 && !detailsVisible);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [available]);

  if (!available) return null;
  return (
    <>
      <section ref={cardRef} aria-label="맞춤 대화 리포트 안내" className="my-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm print:hidden">
        <p className="mb-2 text-[12px] font-bold text-amber-800">🔥 얼리버드 특별가 · 일회 결제</p>
        <h2 className="text-[19px] font-black leading-snug text-zinc-950">그래서, 다음 카톡은 어떻게 보내면 좋을까요?</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{offer.description}</p>
        <p className="mt-3 text-[12px] leading-relaxed text-zinc-600">추천 카톡 문장과 표현의 이유 · 대화 장면별 해석 · 앞으로의 소통 가이드</p>
        <button type="button" onClick={onUnlock} disabled={isProcessing} data-purchase-placement="summary" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-3 py-3 text-[14px] font-bold text-white shadow-md transition hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] disabled:cursor-wait disabled:opacity-60">
          {isProcessing ? "결제창을 여는 중..." : `🔒 ${label} · 2,900원`}
        </button>
        <button type="button" onClick={() => document.getElementById("premium-purchase-details")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="mx-auto mt-3 block text-[12px] font-semibold text-zinc-500 underline underline-offset-4">리포트에 담긴 내용 자세히 보기</button>
      </section>
      {showSticky && createPortal(
        <aside aria-label="맞춤 리포트 구매" className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-zinc-200 bg-white/95 px-4 pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur-sm print:hidden" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <p className="mb-1 text-center text-[11px] font-semibold text-amber-800">🔥 얼리버드 특별가 · 일회 결제</p>
          <button type="button" onClick={onUnlock} disabled={isProcessing} data-purchase-placement="sticky" className="flex min-h-12 w-full items-center justify-center gap-1 rounded-xl bg-[#C2410C] px-2 py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] disabled:cursor-wait disabled:opacity-60">
            {isProcessing ? "결제창을 여는 중..." : `💬 ${label} · 2,900원`}
          </button>
        </aside>, document.body
      )}
    </>
  );
}
