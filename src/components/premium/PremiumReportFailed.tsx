export function PremiumReportFailed({ onRetry }: { onRetry?: () => void }) {
  return (
    <section className="relative mt-8 pt-8 border-t border-zinc-200">
      <div className="mb-8 text-center">
        <h2 className="text-[22px] font-black text-zinc-900 mb-2">프리미엄 관계 분석 리포트 (V2.0)</h2>
        <p className="text-[14px] text-zinc-500">핵심 밀착형 프리미엄 리포트 (3,000자 요약판)</p>
      </div>

      <div className="bg-red-50/50 p-8 rounded-2xl border border-red-200 text-center">
        <span className="text-4xl mb-4 block">⚠️</span>
        <h3 className="text-[18px] font-bold text-red-900 mb-2">상세 리포트를 생성하지 못했습니다</h3>
        <p className="text-[14px] text-red-700/80 mb-6 max-w-md mx-auto">
          AI 분석 중 일시적인 오류가 발생하여 프리미엄 리포트 생성이 중단되었습니다.
          위의 무료 분석 결과는 안전하게 보존되었습니다.
        </p>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            리포트 재생성 시도하기
          </button>
        )}
      </div>
    </section>
  );
}
