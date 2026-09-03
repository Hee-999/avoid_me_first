export function PremiumReportGenerating() {
  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-8 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-2">프리미엄 관계 분석 리포트 (V2.0)</h2>
        <p className="text-[14px] text-zinc-500">핵심 밀착형 프리미엄 리포트 (3,000자 요약판)</p>
      </div>

      <div className="bg-white p-12 rounded-2xl border border-blue-200 text-center shadow-sm relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-blue-100/30 to-blue-50/20 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-xl">✨</span>
          </div>
          
          <h3 className="text-[18px] font-black text-blue-900 mb-3">
            맞춤형 심층 분석을 진행 중입니다...
          </h3>
          
          <div className="text-[14px] text-blue-700/80 max-w-md mx-auto space-y-2 mb-6">
            <p className="animate-fade-in-up">전문 AI가 유저님의 대화를 한 줄 한 줄 분석하고 있습니다.</p>
            <p className="animate-fade-in-up animation-delay-200">애착 프로필, 방어기제, 행동 패턴을 도출하고 있습니다.</p>
            <p className="animate-fade-in-up animation-delay-400 font-bold">약 10~20초 정도 소요될 수 있습니다. 잠시만 기다려주세요!</p>
          </div>
          
          {/* Progress Indicator Dots */}
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
