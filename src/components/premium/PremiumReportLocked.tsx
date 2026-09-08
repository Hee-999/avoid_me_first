export function PremiumReportLocked({ onUnlock }: { onUnlock?: () => void }) {
  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-8 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-2">프리미엄 관계 분석 리포트 (V2.0)</h2>
        <p className="text-[14px] text-zinc-500">핵심 밀착형 프리미엄 리포트 (3,000자 요약판)</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 relative overflow-hidden select-none">
        
        {/* Fake blurred content background (Simulated Report) */}
        <div className="opacity-40 blur-[3px] pointer-events-none space-y-8">
          
          <div className="text-left">
            <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> Ch.1 심층 분석 요약 (Executive Summary)
            </h3>
            <div className="space-y-4">
              <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
                분석 대상자는 현재 갈등 상황에서 강한 방어기제를 작동시키고 있습니다. 특히 자신의 감정을 보호하기 위해 상대방과의 거리를 두거나...
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex gap-2 text-[14px] text-zinc-700 font-medium">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>핵심 방어기제: 무의식적인 감정 회피 및...</span>
                </li>
              </ul>
              <div className="h-4 bg-zinc-200 rounded w-4/5 mt-4"></div>
              <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-zinc-800 mb-3 flex items-center gap-2">
              <span>⏰</span> 갈등 후 다시 연락하기 좋은 타이밍
            </h3>
            <div className="h-20 bg-zinc-100 rounded-xl border border-zinc-300"></div>
          </div>
          
          <div>
            <h3 className="text-[16px] font-bold text-zinc-800 mb-3 flex items-center gap-2">
              <span>💬</span> 상대에게 절대 하면 안 되는 말
            </h3>
            <div className="space-y-3">
              <div className="h-10 bg-red-50 rounded-lg"></div>
              <div className="h-10 bg-red-50 rounded-lg"></div>
            </div>
          </div>

        </div>

        {/* Lock Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/80 to-white backdrop-blur-[1px] z-10 flex flex-col items-center justify-end pb-8 px-4">
          
          <div className="relative bg-white/95 p-6 rounded-3xl shadow-2xl shadow-zinc-200/60 border border-zinc-100 flex flex-col items-center text-center w-full max-w-sm mx-auto">
            <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-5 shadow-lg transform -translate-y-12 absolute">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            
            <h4 className="text-[18px] font-black text-zinc-900 mb-4 mt-4">내 상대 사용설명서 열기</h4>
            
            <ul className="text-[13px] text-zinc-600 space-y-2.5 mb-6 text-left w-full px-2 font-medium">
              <li className="flex gap-2.5 items-start"><span className="text-blue-500 font-bold mt-0.5">✓</span> 갈등 상황에서의 진짜 속마음</li>
              <li className="flex gap-2.5 items-start"><span className="text-blue-500 font-bold mt-0.5">✓</span> 상대방에게 다가가는 최적의 타이밍</li>
              <li className="flex gap-2.5 items-start"><span className="text-blue-500 font-bold mt-0.5">✓</span> 피해야 할 발작 버튼과 추천 대화법</li>
            </ul>

            <p className="text-[12.5px] text-zinc-500 leading-relaxed mb-4 bg-zinc-50 px-3 py-2 rounded-lg">
              상대의 행동 이유부터 연락 타이밍, 갈등 대응 방법까지 지금 바로 확인해보세요.
            </p>

            <div className="text-[11px] text-zinc-400 bg-zinc-50/80 w-full p-2.5 rounded-lg mb-5 text-left border border-zinc-100 leading-relaxed">
              결제 완료 후 개인화된 상세 리포트 생성이 즉시 시작됩니다.<br/>
              생성이 시작된 이후에는 디지털 콘텐츠 특성상 <span className="text-zinc-500 font-semibold">단순 변심에 의한 환불이 제한될 수 있습니다.</span><br/>
              <span className="block mt-1.5 text-zinc-500 font-medium tracking-tight">✓ 구매 후 1년간 다시보기 지원 &nbsp;&nbsp; ✓ PDF 저장 기능 지원</span>
            </div>

            {onUnlock && (
              <button 
                onClick={onUnlock}
                className="w-full py-4 bg-zinc-950 text-white text-[15px] font-bold rounded-xl hover:bg-zinc-800 transition transform active:scale-95 shadow-xl flex justify-center items-center gap-2"
              >
                내 상대 사용설명서 열기 · ₩2,900
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            )}
            {/* The previous text is replaced by the disclaimer block above. 
                We remove the 11px text below the button to keep UI clean. */}
          </div>
        </div>
        
      </div>
    </section>
  );
}
