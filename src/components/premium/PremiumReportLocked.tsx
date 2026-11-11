import Link from "next/link";
import { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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

  const chapterList = [
    { num: "Ch 1", title: "핵심 분석 요약 & 관계 종합 진단" },
    { num: "Ch 2", title: "2D 애착 성향 정밀 프로필 차트" },
    { num: "Ch 3", title: "카톡 대화 속 무의식 행동 패턴 해독" },
    { num: "Ch 4", title: "주요 말풍선별 심리 근거 딥다이브 (Evidence)" },
    { num: "Ch 5", title: "거리두기 유발 요인(Trigger Profile) 정밀 진단" },
    { num: "Ch 6", title: "반복되는 오해와 갈등 상호작용 루프 분석" },
    { num: "Ch 7", title: "갈등 발생 시 대화 철수 패턴 집중 해석" },
    { num: "Ch 8", title: "상대의 방어벽을 낮추는 맞춤형 소통 가이드" },
    { num: "Ch 9", title: "상황별 대화 리라이팅 (추천 카톡 발화 스크립트)" },
    { num: "Ch 10", title: "대화 복귀 신호(Recovery) 포착 및 타이밍 가이드" },
    { num: "Ch 11", title: "절대 피해야 할 위험 행동 및 금기 표현(Risk)" },
    { num: "Ch 12", title: "관계 회복을 위한 3단계 실천 로드맵 (Action Plan)" },
  ];

  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-6 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-1.5">프리미엄 관계 분석 리포트</h2>
        <p className="text-[13.5px] text-zinc-500">
          {targetName}님과의 대화 맥락에 맞춘 12개 챕터 심층 분석 가이드
        </p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 relative overflow-hidden select-none">
        {/* 1. 실제 리포트 12개 챕터 수록 목차 (한 줄에 1개 챕터씩 시원하게 표시하여 글자 잘림 완전 차단) */}
        <div className="mb-7 space-y-2">
          <div className="flex items-center justify-between text-[12px] font-bold text-zinc-500 pb-2 border-b border-zinc-100">
            <span>📑 리포트 수록 목차 (총 12개 챕터)</span>
            <span className="text-amber-700 font-extrabold">결제 즉시 전체 열람</span>
          </div>
          <div className="space-y-1.5 text-left text-[12.5px]">
            {chapterList.map((chap, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                  idx >= 8
                    ? "bg-amber-50/70 border-amber-200/80 text-amber-950 font-bold"
                    : "bg-zinc-50/90 border-zinc-100 text-zinc-800 font-semibold"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600 shrink-0 font-bold">
                    {chap.num}
                  </span>
                  <span className="truncate">{chap.title}</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium shrink-0 flex items-center gap-1">
                  <span>🔒</span>
                  <span>{idx >= 8 ? "핵심 실전" : "잠금"}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 실제 결제 후 리포트 축소 캡처본 예시 (사주 스타일 빼곡한 페이지 뷰) */}
        <div className="my-7 rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50/90 via-white to-white p-4 sm:p-5 text-center">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold mb-3 px-1">
            <span>📄 실제 제공되는 리포트 페이지 구성</span>
            <span className="text-[10px] bg-zinc-200/60 px-1.5 py-0.5 rounded text-zinc-600">샘플 리포트</span>
          </div>

          {/* 실제 리포트 페이지를 그대로 축소한 4장(A4 4페이지) 썸네일 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Page 1: 표지 & 핵심 요약 진단 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm text-left h-48 flex flex-col justify-between overflow-hidden relative">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">LOVE PATTERN</span>
                  <span className="text-[9px] text-zinc-400 font-mono">p.1</span>
                </div>
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-2 text-white">
                  <span className="text-[8px] bg-white/20 px-1 rounded font-bold">핵심 요약</span>
                  <p className="text-[9px] font-bold mt-1 line-clamp-1">{targetName}님의 애착 패턴 진단</p>
                  <div className="space-y-0.5 mt-1.5 opacity-60">
                    <div className="h-1 bg-white/50 rounded w-full"></div>
                    <div className="h-1 bg-white/50 rounded w-4/5"></div>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/40 space-y-1">
                  <div className="text-[8.5px] font-bold text-zinc-800">Ch.2 애착 프로필</div>
                  <div className="h-1 bg-zinc-200 rounded w-3/4"></div>
                  <div className="h-1 bg-zinc-200 rounded w-full"></div>
                </div>
              </div>
              <div className="text-[9px] text-zinc-400 font-medium text-center bg-zinc-50 py-0.5 rounded border border-zinc-100">
                Ch 1~2 종합 진단서
              </div>
            </div>

            {/* Page 2: 2D 프로필 차트 & 카톡 말풍선 해독 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm text-left h-48 flex flex-col justify-between overflow-hidden relative">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                  <span className="text-[9px] font-bold text-zinc-500">2D Profile & Evidence</span>
                  <span className="text-[9px] text-zinc-400 font-mono">p.2</span>
                </div>
                {/* 모의 2D 사분면 차트 박스 */}
                <div className="h-14 rounded-lg bg-zinc-50 border border-zinc-200 p-1 flex items-center justify-center relative">
                  <div className="w-full h-px bg-zinc-300 absolute"></div>
                  <div className="h-full w-px bg-zinc-300 absolute"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow z-10 translate-x-2 -translate-y-2"></div>
                  <span className="text-[7.5px] text-zinc-400 absolute bottom-0.5 right-1">회피 회귀축</span>
                </div>
                {/* Evidence 말풍선 블록 */}
                <div className="space-y-1">
                  <div className="bg-zinc-50 p-1 rounded border border-zinc-100 text-[8px] text-zinc-600 truncate">
                    💬 "{targetName}: 그냥 피곤해서 그래"
                  </div>
                  <div className="h-1 bg-blue-100 rounded w-full"></div>
                  <div className="h-1 bg-zinc-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="text-[9px] text-zinc-400 font-medium text-center bg-zinc-50 py-0.5 rounded border border-zinc-100">
                Ch 3~5 행동 & 트리거
              </div>
            </div>

            {/* Page 3: 갈등 루프 분석 & 소통 가이드 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm text-left h-48 flex flex-col justify-between overflow-hidden relative">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                  <span className="text-[9px] font-bold text-zinc-500">Loop & Guide</span>
                  <span className="text-[9px] text-zinc-400 font-mono">p.3</span>
                </div>
                <div className="p-1.5 rounded-lg border border-purple-100 bg-purple-50/40 space-y-1">
                  <span className="text-[8px] font-bold text-purple-900">갈등 상호작용 순환도</span>
                  <div className="space-y-0.5">
                    <div className="h-1 bg-purple-200 rounded w-full"></div>
                    <div className="h-1 bg-purple-200 rounded w-4/5"></div>
                    <div className="h-1 bg-purple-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg border border-zinc-100 bg-zinc-50 space-y-1">
                  <span className="text-[8px] font-bold text-zinc-800">소통 화법 3대 원칙</span>
                  <div className="h-1 bg-zinc-200 rounded w-full"></div>
                  <div className="h-1 bg-zinc-200 rounded w-5/6"></div>
                  <div className="h-1 bg-zinc-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="text-[9px] text-zinc-400 font-medium text-center bg-zinc-50 py-0.5 rounded border border-zinc-100">
                Ch 6~8 갈등 & 화법
              </div>
            </div>

            {/* Page 4: Action Guide (리라이팅 & 맞춤 카톡 3선) */}
            <div className="rounded-xl border border-amber-300 bg-slate-900 p-2.5 shadow-sm text-left h-48 flex flex-col justify-between overflow-hidden relative text-white">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <span className="text-[9px] font-black text-amber-300 uppercase tracking-tighter">ACTION GUIDE</span>
                  <span className="text-[9px] text-zinc-400 font-mono">p.4</span>
                </div>
                {/* 맞춤 카톡 답장 카드 예시 */}
                <div className="bg-white/10 rounded-lg p-1.5 border border-white/10 space-y-1">
                  <span className="text-[7.5px] font-bold text-amber-300">💬 추천 카톡 답장 스크립트</span>
                  <div className="h-1.5 bg-amber-400/80 rounded w-full"></div>
                  <div className="h-1 bg-white/40 rounded w-5/6"></div>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5 space-y-1 border border-white/5">
                  <span className="text-[7.5px] font-bold text-emerald-300">✓ 회복 골든타임 행동 지침</span>
                  <div className="h-1 bg-emerald-400/50 rounded w-full"></div>
                  <div className="h-1 bg-white/30 rounded w-3/4"></div>
                </div>
              </div>
              <div className="text-[9px] text-amber-300 font-bold text-center bg-white/10 py-0.5 rounded border border-white/10">
                Ch 9~12 실전 액션 가이드
              </div>
            </div>
          </div>

          {/* 분량 하이라이트 문구 */}
          <div className="mt-5 pt-3.5 border-t border-zinc-200/80 text-center">
            <p className="text-[15px] font-black text-zinc-900 tracking-tight">
              총 12개 챕터의 정밀 심층 분석
            </p>
            <p className="text-[13px] font-bold text-blue-600 mt-0.5">
              A4 4페이지 분량의 상황별 맞춤 풀이 제공
            </p>
          </div>
        </div>

        {/* 3. 결제 안내 카드 & ShimmerButton 결제 버튼 */}
        <div className="relative pt-2 z-10 flex flex-col items-center justify-end pb-2">
          <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-zinc-200/60 border border-zinc-100 flex flex-col items-center text-center w-full max-w-sm mx-auto">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-4 shadow-md transform -translate-y-10 absolute">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h4 className="text-[18px] font-black text-zinc-900 mb-2 mt-3">{offer.title}</h4>
            <p className="text-[12.5px] text-zinc-500 mb-4 leading-relaxed">{offer.description}</p>

            <ul className="text-[13px] text-zinc-700 space-y-2 mb-5 text-left w-full px-2 font-medium bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100">
              {offer.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2.5 items-start">
                  <span className="text-blue-600 font-bold mt-0.5">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="text-[11px] text-zinc-400 bg-zinc-50/80 w-full p-2.5 rounded-lg mb-4 text-left border border-zinc-100 leading-relaxed">
              개인화된 리포트는 분석 후 미리 준비되며, 결제 완료 즉시 열람할 수 있습니다.<br />
              디지털 콘텐츠 제공 개시 후에는 환불정책에 따라{" "}
              <span className="text-zinc-500 font-semibold">단순 변심에 의한 환불이 제한될 수 있습니다.</span>
              <br />
              <span className="block mt-1 text-zinc-500 font-medium tracking-tight">
                ✓ 구매 후 1년간 다시보기 지원 &nbsp;&nbsp; ✓ PDF 저장 기능 지원
              </span>
            </div>

            {/* 오픈 특가 가격 안내 (4,900원 취소선 + 2,900원 + 41% 할인율 표기) */}
            <div className="mb-4 w-full rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-3.5 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-600 text-white rounded-md text-[10.5px] font-black">
                <span>🔥</span> 오픈 기념 한정 특가 41% OFF
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[14px] text-zinc-400 line-through font-medium">정상가 4,900원</span>
                <span className="text-[20px] font-black text-zinc-950">2,900원</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium mt-1">
                일회성 결제 · 자동 추가결제 없음
              </p>
            </div>

            {offer.insufficient && (
              <Link
                href="/"
                className="block w-full mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-[13px] font-bold text-blue-700"
              >
                고민했던 장면을 추가로 분석하기
              </Link>
            )}
            {!offer.canOffer && (
              <p className="mb-3 text-[12px] text-zinc-600">
                {analysis?.status?.report === "failed"
                  ? "리포트를 준비하지 못했어요. 잠시 후 다시 확인해주세요."
                  : "구체적인 상담을 위해 대화 장면을 조금 더 확인해주세요."}
              </p>
            )}
            {onUnlock && offer.canOffer && (
              <ShimmerButton
                onClick={onUnlock}
                disabled={isProcessing}
                data-purchase-placement="details"
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                shimmerDuration="2.5s"
                background="linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)"
                borderRadius="18px"
                className="w-full py-4 text-[15px] font-black shadow-xl shadow-zinc-950/20"
              >
                <span className="flex items-center justify-center gap-2 tracking-tight">
                  <span>🔓</span>
                  <span>{isProcessing ? "결제창을 여는 중..." : "맞춤 대화 리포트 열기 · 2,900원"}</span>
                </span>
              </ShimmerButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
