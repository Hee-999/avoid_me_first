"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export interface PremiumPurchasePromptProps {
  analysis: Partial<FinalAnalysis>;
  onUnlock: () => void;
  isProcessing?: boolean;
  isPremium?: boolean;
}

export function getPurchaseLabel(analysis: Partial<FinalAnalysis>): string {
  const focus = analysis.derived_context?.context_intake?.desired_focus || "";
  if (focus.includes("답할지")) return "맞춤 카톡 답장 3선 & 속마음 열기";
  if (focus.includes("관계 패턴")) return "숨은 속마음 & 관계 주도권 열기";
  if (focus.includes("대화의 의미")) return "말풍선 속 진짜 속마음 판독 열기";
  if (focus.includes("앞으로")) return "향후 행동 예측 & 맞춤 답장 열기";
  return "상대방 속마음 & 맞춤 카톡 답장 열기";
}

export function PremiumPurchasePrompt({
  analysis,
  onUnlock,
  isProcessing = false,
  isPremium = false,
}: PremiumPurchasePromptProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const offer = getPremiumOffer(analysis);
  const label = getPurchaseLabel(analysis);
  const available = !isPremium && offer.canOffer;

  const targetName = analysis.target_speaker_label || "상대방";
  const keySituations = Array.isArray(analysis.derived_context?.key_situations)
    ? analysis.derived_context?.key_situations
    : [];
  const firstSituationRaw = keySituations[0]?.situation || "";
  const firstSituation = firstSituationRaw
    .replace(/SPEAKER_A/g, targetName)
    .replace(/SPEAKER_B/g, "나")
    .trim();
  const firstBehaviorRaw = keySituations[0]?.target_behavior || "";
  const firstBehavior = firstBehaviorRaw
    .replace(/SPEAKER_A/g, targetName)
    .replace(/SPEAKER_B/g, "나")
    .trim();

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
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
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
      <section
        ref={cardRef}
        aria-label="맞춤 대화 리포트 안내"
        className="my-7 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-50/60 via-white to-white p-5 shadow-md print:hidden"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900">
            🔥 정밀 해독 완료 · 미공개 리포트 잠금
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">일회성 열람 · 자동결제 없음</span>
        </div>

        <h2 className="text-[19px] font-black leading-snug text-zinc-950">
          {offer.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-600">
          {offer.description}
        </p>

        {/* 절단신공 (Saju-style 10% Teaser + 90% Blurred Lock Box) */}
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/90 p-3.5 space-y-2.5">
          <div className="text-[12px] font-bold text-zinc-800 flex items-center justify-between">
            <span>🔎 {targetName}님의 카톡에서 포착된 핵심 해독 항목</span>
            <span className="text-[11px] text-amber-700 font-extrabold">3개 항목 잠금 중</span>
          </div>

          <div className="rounded-lg bg-white p-3 border border-zinc-200/80">
            <p className="text-[12px] font-bold text-zinc-900">
              1. 🔒 {firstSituation ? `'${firstSituation.slice(0, 26)}${firstSituation.length > 26 ? "..." : ""}' 장면의 진짜 속마음` : `${targetName}님이 저 카톡을 보낸 진짜 무의식 속마음`}
            </p>
            <p className="mt-1 text-[12px] text-zinc-600">
              {firstBehavior
                ? `${firstBehavior.slice(0, 34)}${firstBehavior.length > 34 ? "..." : ""} 반응 이면에는 현재 관계에서 `
                : "겉으로 드러난 말투와 실제 속마음의 온도차를 분석한 결과, 현재 관계에서 "}
              <span className="select-none blur-[4px] bg-zinc-200/70 px-1 rounded">
                감정적 에너지를 아끼며 주도권을 지키려는 방어 기제
              </span>
              가 작동하고 있습니다.
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 border border-zinc-200/80">
            <p className="text-[12px] font-bold text-red-700">
              2. 🚫 지금 {targetName}님에게 가장 피해야 할 카톡 표현
            </p>
            <p className="mt-1 text-[12px] text-zinc-600">
              이 대화 흐름에서 조급한 마음에{" "}
              <span className="select-none blur-[4px] bg-red-100 px-1 rounded">
                서운함을 직접 확인하거나 일정 확답을 재촉하는 카톡
              </span>
              을 보내면 상대방의 심리적 부담이 커질 수 있습니다.
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 border border-zinc-200/80">
            <p className="text-[12px] font-bold text-emerald-800">
              3. 💬 복사해서 바로 보내는 상황별 맞춤 카톡 답장 3선
            </p>
            <p className="mt-1 text-[12px] text-zinc-600">
              {targetName}님의 현재 성향에 맞춰{" "}
              <span className="select-none blur-[4px] bg-emerald-100 px-1 rounded">
                부담 없이 먼저 역질문과 연락이 오게 만드는 실전 답장 문장
              </span>
              을 즉시 복사해 쓰실 수 있습니다.
            </p>
          </div>
        </div>

        {/* 가격 & 오픈 특가 안내 (4,900원 취소선 + 2,900원 + 41% 할인율) */}
        <div className="mt-4 mb-2 flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] font-black text-white">
              오픈 특가 41% OFF
            </span>
            <span className="text-[12px] font-medium text-zinc-400 line-through">4,900원</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-amber-900">특별 할인가</span>
            <span className="text-[18px] font-black text-zinc-950">2,900원</span>
          </div>
        </div>

        <ShimmerButton
          onClick={onUnlock}
          disabled={isProcessing}
          data-purchase-placement="summary"
          shimmerColor="#ffffff"
          shimmerSize="0.1em"
          shimmerDuration="2.5s"
          background="linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)"
          borderRadius="16px"
          className="mt-2 w-full py-4 text-[15px] font-black shadow-xl shadow-zinc-950/20"
        >
          <span className="flex items-center justify-center gap-2 tracking-tight">
            <span>🔓</span>
            <span>{isProcessing ? "결제창을 여는 중..." : `${label} 열기`}</span>
          </span>
        </ShimmerButton>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-zinc-500">
          <span>✓ 결제 즉시 열람</span>
          <span>·</span>
          <span>✓ 1년간 다시보기 & PDF 저장</span>
          <span>·</span>
          <span>✓ 회원가입 없음</span>
        </div>

        <button
          type="button"
          onClick={() =>
            document
              .getElementById("premium-purchase-details")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="mx-auto mt-3 block text-[12px] font-semibold text-zinc-500 underline underline-offset-4 cursor-pointer"
        >
          리포트에 담긴 전체 구성 자세히 보기
        </button>
      </section>

      {showSticky &&
        createPortal(
          <aside
            aria-label="맞춤 리포트 구매"
            className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-zinc-200 bg-white/95 px-4 pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur-sm print:hidden"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-1.5 flex items-center justify-between text-[11px] px-1">
              <span className="font-extrabold text-amber-700">🔥 오픈 특가 41% 할인 적용 중</span>
              <span className="text-zinc-400 line-through">4,900원 &rarr; <strong className="text-zinc-900 font-black not-italic">2,900원</strong></span>
            </div>
            <ShimmerButton
              onClick={onUnlock}
              disabled={isProcessing}
              data-purchase-placement="sticky"
              shimmerColor="#ffffff"
              shimmerSize="0.08em"
              shimmerDuration="2.5s"
              background="linear-gradient(135deg, #18181b 0%, #27272a 100%)"
              borderRadius="14px"
              className="w-full py-3.5 text-[14px] font-black shadow-md"
            >
              <span className="flex items-center justify-center gap-1 tracking-tight">
                <span>🔓</span>
                <span>{isProcessing ? "결제창을 여는 중..." : `${label} · 2,900원`}</span>
              </span>
            </ShimmerButton>
          </aside>,
          document.body
        )}
    </>
  );
}
