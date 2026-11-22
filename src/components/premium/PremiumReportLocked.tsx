"use client";

import Link from "next/link";
import { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { PRICING } from "@/config/pricing";

const PREVIEW_CHAPTERS = [
  {
    num: "Ch 1",
    shortTitle: "속마음·온도",
    img: "/images/report-preview/ch1.png",
  },
  {
    num: "Ch 2",
    shortTitle: "장면별 해독",
    img: "/images/report-preview/ch2.png",
  },
  {
    num: "Ch 3",
    shortTitle: "엇갈림 패턴",
    img: "/images/report-preview/ch3.png",
  },
  {
    num: "Ch 4",
    shortTitle: "상황별 대처",
    img: "/images/report-preview/ch4.png",
  },
  {
    num: "Ch 5",
    shortTitle: "답장 톤 비교",
    img: "/images/report-preview/ch5.png",
  },
  {
    num: "Ch 6",
    shortTitle: "타이밍·신호",
    img: "/images/report-preview/ch6.png",
  },
  {
    num: "Ch 7",
    shortTitle: "심리 4분면",
    img: "/images/report-preview/ch7.png",
  },
  {
    num: "Ch 8",
    shortTitle: "1:1 AI 상담",
    img: "/images/report-preview/ch8.png",
  },
];

export function PremiumReportLocked({
  analysis,
  onUnlock,
  isProcessing = false,
}: {
  analysis?: Partial<FinalAnalysis>;
  onUnlock?: () => void;
  isProcessing?: boolean;
}) {
  const offer = getPremiumOffer(analysis);
  const targetName = analysis?.target_speaker_label || "상대방";
  const targetCall = targetName === "상대방" ? "상대방" : `${targetName}님`;

  return (
    <section className="relative mt-6 pt-6 border-t border-zinc-200 break-keep">
      <div className="mb-3.5 flex items-end justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <span className="inline-block text-[11px] font-extrabold text-blue-600 mb-0.5">
            총 {PREVIEW_CHAPTERS.length}개 챕터 구성 한눈에 보기
          </span>
          <h3 className="text-[16px] sm:text-[17px] font-black text-zinc-900 whitespace-nowrap">
            결제하면 바로 열리는 리포트 구성
          </h3>
        </div>
        <span className="text-[11px] font-extrabold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
          8개 챕터
        </span>
      </div>

      {/* 4x2 8개 챕터 한눈에 보기 그리드 (내용 노출 없이 구성과 분량만 직관적으로 전달) */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {PREVIEW_CHAPTERS.map((chap) => (
          <div
            key={chap.num}
            className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
              <img
                src={chap.img}
                alt={`${chap.num} ${chap.shortTitle}`}
                className="w-full h-full object-cover object-top scale-[1.02] blur-[0.6px] select-none pointer-events-none"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-zinc-950/15 flex flex-col justify-between p-1.5">
                <span className="self-start inline-block text-[9px] font-black text-white bg-zinc-900/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
                  {chap.num}
                </span>
                <span className="self-center inline-flex items-center gap-0.5 text-[9px] font-bold text-white/95 bg-zinc-900/75 px-1.5 py-0.5 rounded-full">
                  🔒
                </span>
              </div>
            </div>
            <div className="px-1.5 py-1.5 bg-zinc-50/90 border-t border-zinc-100 text-center">
              <p className="text-[10px] font-bold text-zinc-800 leading-tight truncate">
                {chap.shortTitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4줄 요약 + 덤 혜택 + 최종 결제 카드 */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/15 space-y-5">
        <div className="space-y-2">
          <p className="text-[11.5px] font-semibold text-slate-400">
            {targetCall} 대화 분석 심층 리포트
          </p>
          <h4 className="text-[20px] font-black tracking-tight text-white">
            러브패턴 8개 챕터 전체 분석
          </h4>
          <p className="text-[13.5px] text-slate-300 leading-relaxed pt-1">
            “지금 연락해도 될지 혼자 고민만 하다 타이밍을 놓치기 전에, 대화 속 숨은 속마음과 답장 기준을 한 번에 정리했어요.”
          </p>
        </div>

        <ul className="border-y border-white/10 py-4 space-y-2 text-[13px] text-slate-200 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">·</span>
            <span>상대의 실제 속마음 온도(%) &amp; 재회·진전 가능성 판독</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">·</span>
            <span>카톡 장면별 숨은 의도 해독 + 두 사람이 엇갈리는 패턴</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">·</span>
            <span>상황별 실전 대처 기준 &amp; 복사해서 바로 쓰는 답장 3선</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">·</span>
            <span>결제 후 카톡 링크·PIN 4자리로 언제든 다시 보기</span>
          </li>
        </ul>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="inline-block rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-black text-slate-950 mb-1.5">
                오픈 특가 · 20% 혜택
              </span>
              <p className="text-[12px] text-slate-400">
                오픈 특가 종료 후{" "}
                <span className="line-through">
                  {PRICING.REPORT.originalPrice.toLocaleString()}원
                </span>
              </p>
              <p className="text-[28px] font-black tracking-tight text-white leading-tight mt-0.5">
                {PRICING.REPORT.salePrice.toLocaleString()}원
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/8 border border-white/10 px-3.5 py-2.5 text-[12.5px] font-bold text-slate-100 leading-snug">
            💬 리포트 보고 헷갈리면 이 카톡 보내도 될지, 먼저 연락할지{" "}
            <span className="text-amber-300">AI에게 1:1로 3번 더 물어보실 수 있어요.</span>
          </div>

          {offer.insufficient && (
            <Link
              href="/"
              className="block w-full rounded-xl border border-blue-400/30 bg-blue-500/15 p-3 text-center text-[13px] font-bold text-blue-200"
            >
              고민했던 장면을 추가로 분석하기
            </Link>
          )}

          {onUnlock && offer.canOffer && (
            <ShimmerButton
              onClick={onUnlock}
              disabled={isProcessing}
              data-purchase-placement="details"
              shimmerColor="#ffffff"
              shimmerSize="0.1em"
              shimmerDuration="2.5s"
              background="linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1d4ed8 100%)"
              borderRadius="14px"
              className="w-full py-4 text-[15px] font-black shadow-lg shadow-blue-600/25"
            >
              <span className="flex items-center justify-center gap-2 tracking-tight">
                <span>🔓</span>
                <span>
                  {isProcessing
                    ? "결제창을 여는 중..."
                    : `전체 리포트 + 1:1 상담 열기 · ${PRICING.REPORT.salePrice.toLocaleString()}원`}
                </span>
              </span>
            </ShimmerButton>
          )}

          <p className="text-[11px] text-slate-400 text-center">
            일회성 결제 · 자동결제 없음 · 결제 즉시 전체 열람
          </p>
        </div>
      </div>
    </section>
  );
}
