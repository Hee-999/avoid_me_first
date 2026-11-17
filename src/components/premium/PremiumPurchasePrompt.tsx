"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";
import { PRICING } from "@/config/pricing";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export interface PremiumPurchasePromptProps {
  analysis: Partial<FinalAnalysis>;
  onUnlock: (buyerTel?: string) => void;
  isProcessing?: boolean;
  isPremium?: boolean;
}

export function getPurchaseLabel(analysis: Partial<FinalAnalysis>): string {
  const mode = analysis.derived_context?.analysis_mode;
  if (mode === "flirting") return "상대 속마음 · 썸 확률 & 카톡 답장 열기";
  const focus = analysis.derived_context?.context_intake?.desired_focus || "";
  if (focus.includes("답할지")) return "맞춤 카톡 답장 3선 & 속마음 열기";
  if (focus.includes("관계 패턴")) return "숨은 속마음 & 관계 주도권 열기";
  if (focus.includes("대화의 의미")) return "말풍선 속 진짜 속마음 판독 열기";
  if (focus.includes("앞으로")) return "향후 행동 예측 & 맞춤 답장 열기";
  return "진짜 속마음 · 확률 & 카톡 답장 열기";
}

export function PremiumPurchasePrompt({
  analysis,
  onUnlock,
  isProcessing = false,
  isPremium = false,
}: PremiumPurchasePromptProps) {
  const cardRef = useRef<HTMLElement>(null);
  const telInputRef = useRef<HTMLInputElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [buyerTel, setBuyerTel] = useState("");
  const [telError, setTelError] = useState<string | null>(null);
  const [selectedChipHint, setSelectedChipHint] = useState<string | null>(null);

  const offer = getPremiumOffer(analysis);
  const label = getPurchaseLabel(analysis);
  const available = !isPremium && offer.canOffer;

  const targetName = analysis.target_speaker_label || "상대방";
  const mode = analysis.derived_context?.analysis_mode || "reunion";
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

  const previewChips =
    mode === "flirting"
      ? [
          `${targetName}한테 내가 보낼 카톡 첨삭해줘`,
          `지금 먼저 선톡하면 부담스러워할까?`,
          `이거 진짜 호감일까, 어장/예의일까?`,
        ]
      : [
          `${targetName}한테 내가 보낼 카톡 첨삭해줘`,
          `지금 먼저 연락하면 역효과 날까?`,
          `다시 예전처럼 돌아갈 수 있을까?`,
        ];

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

  const handlePayAttempt = (fromSticky = false) => {
    const digits = buyerTel.replace(/[^0-9]/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) {
      setTelError("리포트 전용 링크와 열람 PIN 4자리를 받을 휴대폰 번호를 입력해주세요.");
      if (fromSticky) {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => telInputRef.current?.focus(), fromSticky ? 350 : 0);
      return;
    }
    setTelError(null);
    onUnlock(digits);
  };

  if (!available) return null;

  return (
    <>
      <section
        ref={cardRef}
        aria-label="맞춤 대화 리포트 안내"
        className="my-6 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-50/60 via-white to-white p-5 shadow-md print:hidden"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900">
            🔥 정밀 해독 완료 · 미공개 리포트 잠금
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">일회성 결제 · 자동결제 없음</span>
        </div>

        <h2 className="text-[19px] font-black leading-snug text-zinc-950">
          {offer.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-600">
          {offer.description}
        </p>

        {/* 절단신공 (Blurred Lock Box) */}
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/90 p-3.5 space-y-2.5">
          <div className="text-[12px] font-bold text-zinc-800 flex items-center justify-between">
            <span>🔎 {targetName}님의 카톡에서 포착된 핵심 해독</span>
            <span className="text-[11px] text-amber-700 font-extrabold">3개 항목 + AI상담 3회</span>
          </div>

          <div className="rounded-lg bg-white p-3 border border-zinc-200/80">
            <p className="text-[12px] font-bold text-zinc-900">
              1. 🔒 {firstSituation ? `'${firstSituation.slice(0, 26)}${firstSituation.length > 26 ? "..." : ""}' 장면의 진짜 속마음` : `${targetName}님이 저 카톡을 보낸 진짜 무의식 속마음`}
            </p>
            <p className="mt-1 text-[12px] text-zinc-600">
              {firstBehavior
                ? `${firstBehavior.slice(0, 34)}${firstBehavior.length > 34 ? "..." : ""} 반응 이면에는 `
                : "겉으로 드러난 말투와 실제 속마음의 온도차를 분석한 결과, "}
              <span className="select-none blur-[4px] bg-zinc-200/70 px-1 rounded">
                감정적 에너지를 아끼며 주도권을 지키려는 방어 기제
              </span>
              가 작동하고 있습니다.
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 border border-zinc-200/80">
            <p className="text-[12px] font-bold text-red-700">
              2. 🚫 지금 {targetName}님에게 절대 보내면 안 되는 금지 멘트
            </p>
            <p className="mt-1 text-[12px] text-zinc-600">
              이 흐름에서 조급한 마음에{" "}
              <span className="select-none blur-[4px] bg-red-100 px-1 rounded">
                서운함을 직접 확인하거나 확답을 재촉하는 카톡
              </span>
              을 보내면 상대의 방어벽이 닫힙니다.
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 border border-zinc-200/80">
            <p className="text-[12px] font-bold text-emerald-800">
              3. 💬 복사해서 바로 쓰는 상황별 카톡 답장 3선 + 성사 확률 %
            </p>
            <p className="mt-1 text-[12px] text-zinc-600">
              {targetName}님의 성향에 맞춰{" "}
              <span className="select-none blur-[4px] bg-emerald-100 px-1 rounded">
                부담 없이 먼저 역질문과 연락이 오게 만드는 실전 답장 문장
              </span>
              을 즉시 복사해 쓰실 수 있습니다.
            </p>
          </div>
        </div>

        {/* AI 1:1 상담 프리뷰 (Hook) */}
        <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/50 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-blue-900">
              💬 1:1 AI 속마음 상담 예시 질문 (결제 시 질문권 3회 포함)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {previewChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedChipHint(`"${chip}" 질문은 잠금 해제 즉시 1:1 AI 상담에서 바로 답변해 드립니다!`);
                  telInputRef.current?.focus();
                }}
                className="text-left text-[11.5px] font-semibold text-blue-900 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-full px-2.5 py-1 transition cursor-pointer"
              >
                🔒 {chip}
              </button>
            ))}
          </div>
          {selectedChipHint && (
            <p className="mt-2 text-[11.5px] font-bold text-blue-700 leading-snug">
              ✨ {selectedChipHint}
            </p>
          )}
        </div>

        {/* 가격 & 오픈 특가 안내 (4,900원 취소선 + 2,900원 + 41% OFF) */}
        <div className="mt-4 mb-3 flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                오픈 특가 41% OFF
              </span>
              <span className="text-[12px] font-medium text-zinc-400 line-through">
                {PRICING.REPORT.originalPrice.toLocaleString()}원
              </span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-600 block mt-0.5">
              심층 리포트 + 1:1 AI 상담 3회 포함
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-amber-900">특별 할인가</span>
            <span className="text-[20px] font-black text-zinc-950">
              {PRICING.REPORT.salePrice.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 문자 받을 휴대폰 번호 입력 (1칸) */}
        <div className="mb-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <label htmlFor="buyer-tel-input" className="block text-[12px] font-bold text-zinc-800 mb-1.5">
            📱 리포트 전용 링크 &amp; 열람 PIN 4자리 받을 번호
          </label>
          <input
            ref={telInputRef}
            id="buyer-tel-input"
            type="tel"
            inputMode="numeric"
            value={buyerTel}
            onChange={(e) => {
              setBuyerTel(e.target.value);
              if (telError) setTelError(null);
            }}
            placeholder="010-1234-5678 (회원가입 없이 문자로 발송)"
            className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-[14px] text-zinc-900 outline-none focus:border-zinc-900 transition"
          />
          <p className="mt-1.5 text-[11px] text-zinc-500 leading-snug">
            다른 브라우저(사파리·크롬 등)로 이동해도 문자에 적힌 링크와 랜덤 PIN 4자리로 언제든 다시 보고 상담을 이어갈 수 있어요.
          </p>
          {telError && (
            <p className="mt-1.5 text-[11.5px] font-bold text-red-600">{telError}</p>
          )}
        </div>

        <ShimmerButton
          onClick={() => handlePayAttempt(false)}
          disabled={isProcessing}
          data-purchase-placement="summary"
          shimmerColor="#ffffff"
          shimmerSize="0.1em"
          shimmerDuration="2.5s"
          background="linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)"
          borderRadius="16px"
          className="mt-1 w-full py-4 text-[15px] font-black shadow-xl shadow-zinc-950/20"
        >
          <span className="flex items-center justify-center gap-2 tracking-tight">
            <span>🔓</span>
            <span>
              {isProcessing
                ? "결제창을 여는 중..."
                : `${label} (${PRICING.REPORT.salePrice.toLocaleString()}원)`}
            </span>
          </span>
        </ShimmerButton>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-zinc-500">
          <span>✓ 결제 즉시 열람</span>
          <span>·</span>
          <span>✓ 1년간 전용 링크 다시보기</span>
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
              <span className="font-extrabold text-amber-700">🔥 오픈 특가 41% OFF · AI상담 3회 포함</span>
              <span className="text-zinc-400 line-through">
                {PRICING.REPORT.originalPrice.toLocaleString()}원 &rarr;{" "}
                <strong className="text-zinc-900 font-black not-italic">
                  {PRICING.REPORT.salePrice.toLocaleString()}원
                </strong>
              </span>
            </div>
            <ShimmerButton
              onClick={() => handlePayAttempt(true)}
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
                <span>
                  {isProcessing
                    ? "결제창을 여는 중..."
                    : `${label} · ${PRICING.REPORT.salePrice.toLocaleString()}원`}
                </span>
              </span>
            </ShimmerButton>
          </aside>,
          document.body
        )}
    </>
  );
}
