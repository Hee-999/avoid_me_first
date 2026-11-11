import Link from "next/link";
import { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";

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

  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-6 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-1.5">프리미엄 관계 분석 리포트</h2>
        <p className="text-[13.5px] text-zinc-500">
          {targetName}님과의 대화 맥락에 맞춘 12개 챕터 심층 분석 가이드
        </p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 relative overflow-hidden select-none">
        {/* 1. 실제 리포트 12개 챕터 수록 목차 */}
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-[12px] font-bold text-zinc-500 pb-2 border-b border-zinc-100">
            <span>📑 리포트 수록 목차 (총 12개 챕터)</span>
            <span className="text-amber-700 font-extrabold">결제 즉시 전체 열람</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-[12px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 1. 핵심 요약 & 종합 진단</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 2. 2D 애착 성향 프로필 차트</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 3. 카톡 대화 속 행동 패턴 해독</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 4. 말풍선별 심리 근거 정밀 판독</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 5. 방어기제 유발 요인(Trigger) 분석</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 6. 반복되는 관계 갈등 루프 분석</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 7. 갈등 시 대화 철수 패턴 진단</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="font-bold text-zinc-800">Ch 8. 맞춤형 소통 가이드 및 화법</span>
              <span className="text-[11px] text-zinc-400 font-semibold">🔒 잠금</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 sm:col-span-2">
              <span className="font-bold text-amber-950">Ch 9~12. 복사해서 바로 쓰는 맞춤 답장 3선 & 관계 회복 골든타임 행동 지침</span>
              <span className="text-[11px] text-amber-700 font-extrabold">🔒 핵심 실전</span>
            </div>
          </div>
        </div>

        {/* 2. 12개 챕터 샘플 리포트 캡처본 예시 (사주 스타일 2x3 카드 그리드) */}
        <div className="my-6 rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50/80 to-white p-4 text-center">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold mb-3 px-1">
            <span>🔍 실제 제공되는 리포트 화면 예시</span>
            <span>샘플 리포트</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { title: "Ch 1. 핵심 요약", tag: "진단서" },
              { title: "Ch 2. 2D 프로필", tag: "차트 분석" },
              { title: "Ch 4. 말풍선 해독", tag: "속마음" },
              { title: "Ch 5. 방어기제", tag: "트리거" },
              { title: "Ch 8. 소통 가이드", tag: "화법 제안" },
              { title: "Ch 10. 맞춤 답장", tag: "실전 카톡" },
            ].map((card, cIdx) => (
              <div
                key={cIdx}
                className="relative flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-sm text-left h-28 overflow-hidden select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-block rounded bg-blue-50 px-1 py-0.5 text-[9px] font-bold text-blue-700">
                      {card.tag}
                    </span>
                    <span className="text-[9px] text-zinc-300 font-mono">p.{cIdx + 1}</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-800 leading-tight line-clamp-1">{card.title}</p>
                </div>

                {/* 텍스트 흉내 낸 블러 모의 라인 (A4 4장 빼곡한 분량 시각화) */}
                <div className="space-y-1.5 opacity-40 blur-[1px]">
                  <div className="h-1.5 bg-zinc-300 rounded w-full"></div>
                  <div className="h-1.5 bg-zinc-200 rounded w-5/6"></div>
                  <div className="h-1.5 bg-zinc-300 rounded w-4/6"></div>
                  <div className="h-1.5 bg-zinc-200 rounded w-full"></div>
                </div>

                <div className="text-[9.5px] font-bold text-amber-700 flex items-center gap-0.5">
                  <span>🔒</span>
                  <span>상세 열람</span>
                </div>
              </div>
            ))}
          </div>

          {/* 분량 안내 공식 하이라이트 문구 */}
          <div className="mt-4 pt-3 border-t border-zinc-200/70 text-center">
            <p className="text-[14px] font-black text-zinc-900 tracking-tight">
              총 12개 챕터의 정밀 심층 분석
            </p>
            <p className="text-[13px] font-bold text-blue-600 mt-0.5">
              A4 4페이지 분량의 상황별 맞춤 풀이 제공
            </p>
          </div>
        </div>

        {/* 3. 결제 안내 카드 & 결제 버튼 */}
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

            {/* 얼리버드 가격 안내 (결제 버튼 바로 위) */}
            <div className="mb-3 text-center w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[12px] font-bold">
                <span>🔥</span> 얼리버드 특별가 2,900원
              </div>
              <p className="text-[11.5px] text-zinc-500 font-medium mt-1">
                일회성 결제 · 자동 정기결제 없음
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
              <button
                data-purchase-placement="details"
                onClick={onUnlock}
                disabled={isProcessing}
                className={`w-full py-4 text-white text-[15px] font-bold rounded-xl transition transform shadow-xl flex justify-center items-center gap-2 cursor-pointer ${
                  isProcessing
                    ? "bg-zinc-400 cursor-not-allowed scale-100"
                    : "bg-[#C2410C] hover:bg-[#9A3412] active:scale-95"
                }`}
              >
                {isProcessing ? "결제창을 여는 중..." : "🔓 맞춤 대화 리포트 열기 · 2,900원"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
