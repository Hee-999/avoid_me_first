export function PremiumReportLocked({ onUnlock }: { onUnlock?: () => void }) {
  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-8 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-2">프리미엄 관계 분석 리포트 (V2.0)</h2>
        <p className="text-[14px] text-zinc-500">핵심 밀착형 프리미엄 리포트 (3,000자 요약판)</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/80 to-white backdrop-blur-[2px] z-10 flex flex-col items-center justify-end pb-12">
          
          <div className="relative mt-4 bg-white/90 p-6 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-200 flex flex-col items-center text-center max-w-sm mx-auto w-full">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h4 className="text-[16px] font-bold text-zinc-900 mb-2">프리미엄 리포트 잠김</h4>
            <p className="text-[13px] text-zinc-500 leading-relaxed mb-6">
              숨겨진 발작 버튼 분석과 관계 회복을 위한 1:1 맞춤형 대화법 등 모든 자물쇠(🔒) 항목을 확인하세요.
            </p>
            {onUnlock && (
              <button 
                onClick={onUnlock}
                className="w-full py-4 bg-zinc-900 text-white text-[15px] font-bold rounded-xl hover:bg-zinc-800 transition transform active:scale-95 shadow-lg"
              >
                내 상대 사용설명서 전체 보기 (₩4,900)
              </button>
            )}
            <span className="text-[11px] text-zinc-400 mt-3">*결제 시 영구 소장 가능 (테스트 중 무료 개방)</span>
          </div>
        </div>
        
        {/* Fake blurred content background (Placeholder/Skeleton) */}
        <div className="opacity-30 blur-sm pointer-events-none space-y-4">
          <div className="h-4 bg-zinc-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-zinc-200 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 rounded w-5/6 mx-auto"></div>
          <div className="h-32 bg-zinc-100 rounded-xl mt-6 border border-zinc-200"></div>
          
          <div className="flex gap-4 justify-center mt-6">
            <div className="h-24 w-1/3 bg-zinc-200 rounded-xl"></div>
            <div className="h-24 w-1/3 bg-zinc-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
