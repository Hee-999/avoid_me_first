import Link from "next/link";
import { FinalAnalysis } from "@/lib/analysis/types";
import { getPremiumOffer } from "@/lib/report/premium/offer";
export function PremiumReportLocked({ analysis, onUnlock, isProcessing = false }: { analysis?: Partial<FinalAnalysis>; onUnlock?: () => void; isProcessing?: boolean }) {
  const offer = getPremiumOffer(analysis);
  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-8 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-2">프리미엄 관계 분석 리포트</h2>
        <p className="text-[14px] text-zinc-500">선택하신 고민에 맞춘 대화 상담 가이드 (3,000자 핵심 요약)</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden select-none">
        
        {/* Fake blurred content background (Simulated Report) */}
        <p className="text-[11px] text-zinc-500 mb-3">아래는 제공 항목의 구성 예시이며, 실제 분석 내용이 아닙니다.</p>
        <div className="absolute inset-x-6 top-14 opacity-40 blur-[3px] pointer-events-none space-y-8">
          
          <div className="text-left">
            <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> 핵심 분석 요약
            </h3>
            <div className="space-y-4">
              <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
                {offer.preview}
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex gap-2 text-[14px] text-zinc-700 font-medium">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>실제 장면의 해석과 상황에 맞는 소통 방법</span>
                </li>
              </ul>
              <div className="h-4 bg-zinc-200 rounded w-4/5 mt-4"></div>
              <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-zinc-800 mb-3 flex items-center gap-2">
              <span>⏰</span> 앞으로 살펴볼 반응과 대화 방법
            </h3>
            <div className="h-20 bg-zinc-100 rounded-xl border border-zinc-300"></div>
          </div>
          
          <div>
            <h3 className="text-[16px] font-bold text-zinc-800 mb-3 flex items-center gap-2">
              <span>💬</span> 상황에 맞는 추천 표현과 이유
            </h3>
            <div className="space-y-3">
              <div className="h-10 bg-red-50 rounded-lg"></div>
              <div className="h-10 bg-red-50 rounded-lg"></div>
            </div>
          </div>

        </div>

        {/* Lock Overlay */}
        <div className="relative mt-12 bg-gradient-to-b from-white/10 via-white/80 to-white backdrop-blur-[1px] z-10 flex flex-col items-center justify-end pb-8 px-4">
          
          <div className="relative bg-white/95 p-6 rounded-3xl shadow-2xl shadow-zinc-200/60 border border-zinc-100 flex flex-col items-center text-center w-full max-w-sm mx-auto">
            <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-5 shadow-lg transform -translate-y-12 absolute">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            
            <h4 className="text-[18px] font-black text-zinc-900 mb-2 mt-4">{offer.title}</h4>
            <p className="text-[12px] text-zinc-500 mb-4">{offer.description}</p>
            
            <ul className="text-[13px] text-zinc-700 space-y-2 mb-5 text-left w-full px-2 font-medium bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100">
              {offer.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2.5 items-start">
                  <span className="text-blue-600 font-bold mt-0.5">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="text-[11px] text-zinc-400 bg-zinc-50/80 w-full p-2.5 rounded-lg mb-4 text-left border border-zinc-100 leading-relaxed">
              개인화된 리포트는 분석 후 미리 준비되며, 결제 완료 후 열람할 수 있습니다.<br/>
              디지털 콘텐츠 제공 개시 후에는 환불정책에 따라 <span className="text-zinc-500 font-semibold">단순 변심에 의한 환불이 제한될 수 있습니다.</span><br/>
              <span className="block mt-1 text-zinc-500 font-medium tracking-tight">✓ 구매 후 1년간 다시보기 지원 &nbsp;&nbsp; ✓ PDF 저장 기능 지원</span>
            </div>

            {/* 얼리버드 가격 안내 (결제 버튼 바로 위) */}
            <div className="mb-3 text-center w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[12px] font-bold">
                <span>🔥</span> 얼리버드 특별가 2,900원
              </div>
              <p className="text-[11.5px] text-zinc-500 font-medium mt-1">
                초기 판매 종료 후 단계적으로 인상 예정입니다.
              </p>
            </div>

            {offer.insufficient && (
              <Link href="/" className="block w-full mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-[13px] font-bold text-blue-700">
                고민했던 장면을 추가로 분석하기
              </Link>
            )}
            {!offer.canOffer && <p className="mb-3 text-[12px] text-zinc-600">{analysis?.status?.report === "failed" ? "리포트를 준비하지 못했어요. 잠시 후 다시 확인해주세요." : "구체적인 상담을 위해 대화 장면을 조금 더 확인해주세요."}</p>}
            {onUnlock && offer.canOffer && (
              <button 
                data-purchase-placement="details"
                onClick={onUnlock}
                disabled={isProcessing}
                className={`w-full py-4 text-white text-[15px] font-bold rounded-xl transition transform shadow-xl flex justify-center items-center gap-2 ${
                  isProcessing 
                    ? "bg-zinc-400 cursor-not-allowed scale-100" 
                    : "bg-[#C2410C] hover:bg-[#9A3412] active:scale-95"
                }`}
              >
                {isProcessing ? "결제창을 여는 중..." : "맞춤 대화 리포트 열기 · 2,900원"}
              </button>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
}
