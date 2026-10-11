"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getMappedType, getDimensionObservationText, getAnalysisUiPresentation } from "@/lib/analysis/types";

export default function ShareResult() {
  const router = useRouter();
  const params = useParams();
  const shareId = params.share_id as string;
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    
    fetch(`/api/share/public/${shareId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("존재하지 않거나 비공개된 분석 결과입니다.");
        }
        return res.json();
      })
      .then(data => setAnalysis(data))
      .catch(err => setError(err.message));
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm border border-zinc-200">
          <p className="text-red-500 font-bold mb-2">접근 불가</p>
          <p className="text-zinc-600 text-[14px]">{error}</p>
          <button onClick={() => router.push('/')} className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[13px] font-bold">홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  const { attachment_dimensions, attachment_fitness, primary_type, secondary_type, share_alias } = analysis;

  const uiPres = getAnalysisUiPresentation({
    primaryType: primary_type,
    anxietyScore: attachment_dimensions?.anxiety ?? 0,
    avoidanceScore: attachment_dimensions?.avoidance ?? 0,
    anxietyStatus: attachment_dimensions?.anxiety_status,
    avoidanceStatus: attachment_dimensions?.avoidance_status,
    speakerLabel: share_alias || "상대방"
  });

  const isAnxietyInsufficient = attachment_dimensions?.anxiety_status === "insufficient";
  const isAvoidanceInsufficient = attachment_dimensions?.avoidance_status === "insufficient";

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-center">
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">공유된 애착 유형 결과</span>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-block px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full mb-4">
            분석 대상: {share_alias || "상대방"}
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-snug">
            {uiPres.headlinePrefix && (
              <>
                {uiPres.headlinePrefix}<br/>
              </>
            )}
            <span className={uiPres.mode === "insufficient_all" ? "text-zinc-600" : "text-blue-600"}>
              {uiPres.headlineMain}
            </span>
            {uiPres.headlineSuffix}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-400 font-semibold tracking-wide uppercase">
            {uiPres.subEn}
          </p>
          
          <div className="mt-4 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
            <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
              {uiPres.description}
            </p>
          </div>

          {uiPres.mode === "standard" && secondary_type && (
            <p className="mt-2 text-[14px] text-zinc-500 font-medium">
              *보조 유형으로 <strong className="text-zinc-700">{getMappedType(secondary_type).ko}</strong> 성향도 확인되었습니다.
            </p>
          )}
        </motion.div>

        {/* 2D Fitness Score Board */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-8">
          <h3 className="text-[13px] font-bold text-zinc-500 mb-5">4가지 애착 유형 적합도</h3>
          
          {!uiPres.showFitnessBars && uiPres.fitnessNotice ? (
            <div className="py-1 mb-2">
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <h4 className="text-[13px] font-bold text-zinc-900">
                    {uiPres.fitnessNotice.title}
                  </h4>
                </div>

                <div className="space-y-1.5 text-[12px] text-zinc-700 leading-relaxed font-medium">
                  <div className="flex items-center gap-2 text-zinc-800">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{uiPres.fitnessNotice.description}</span>
                  </div>
                  {uiPres.fitnessNotice.subText && (
                    <p className="text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-200/60 mt-2">
                      * {uiPres.fitnessNotice.subText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={primary_type === "secure" ? "text-blue-600 font-bold" : "text-zinc-600"}>안정형 (Secure)</span>
                  <span className="text-zinc-900">{attachment_fitness.secure}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.secure}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-400 rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={uiPres.mode === "anxiety_dominant" || primary_type === "preoccupied" ? "text-blue-600 font-bold" : "text-zinc-600"}>몰입/불안형 (Preoccupied)</span>
                  {isAnxietyInsufficient ? (
                    <span className="text-amber-700/90 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200/60">판단 보류 (단서 부족)</span>
                  ) : (
                    <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  {isAnxietyInsufficient ? (
                    <div className="h-full bg-zinc-200/40 rounded-full w-full" />
                  ) : (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.preoccupied}%` }} transition={{ duration: 1 }} className="h-full bg-amber-400 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={uiPres.mode === "avoidance_dominant" || primary_type === "dismissing" || primary_type === "dismissive-avoidant" ? "text-blue-600 font-bold" : "text-zinc-600"}>거부-회피형 (Dismissive)</span>
                  {isAvoidanceInsufficient ? (
                    <span className="text-amber-700/90 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200/60">판단 보류 (단서 부족)</span>
                  ) : (
                    <span className="text-zinc-900 font-bold">{attachment_fitness.dismissing}%</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  {isAvoidanceInsufficient ? (
                    <div className="h-full bg-zinc-200/40 rounded-full w-full" />
                  ) : (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.dismissing}%` }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={primary_type === "fearful" || primary_type === "fearful-avoidant" ? "text-blue-600 font-bold" : "text-zinc-600"}>공포-회피형 (Fearful)</span>
                  <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.fearful}%` }} transition={{ duration: 1 }} className="h-full bg-indigo-500 rounded-full" />
                </div>
              </div>

              {(isAnxietyInsufficient || isAvoidanceInsufficient) && (
                <div className="mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 font-medium leading-relaxed">
                  {isAnxietyInsufficient && (
                    <p>* 대화 내 불안 성향을 평가할 기회가 없어 <strong>몰입/불안형은 판단 보류</strong>되었습니다.</p>
                  )}
                  {isAvoidanceInsufficient && (
                    <p>* 대화 내 회피 성향을 평가할 기회가 없어 <strong>거부-회피형은 판단 보류</strong>되었습니다.</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 pt-5 border-t border-zinc-100 flex justify-between">
            <div className="text-center">
              <span className="block text-[11px] text-zinc-400 font-bold mb-1">불안 차원 (Anxiety)</span>
              {attachment_dimensions.anxiety_status === "insufficient" ? (
                <span className="block text-[15px] font-bold text-zinc-500 py-0.5">단서 부족</span>
              ) : (
                <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.anxiety} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
              )}
            </div>
            <div className="w-px bg-zinc-100" />
            <div className="text-center">
              <span className="block text-[11px] text-zinc-400 font-bold mb-1">회피 차원 (Avoidance)</span>
              {attachment_dimensions.avoidance_status === "insufficient" ? (
                <span className="block text-[15px] font-bold text-zinc-500 py-0.5">단서 부족</span>
              ) : (
                <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.avoidance} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Viral CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center">
            <h4 className="text-[18px] font-black mb-2">나의 애착 유형도 궁금하다면?</h4>
            <p className="text-[13px] text-zinc-300 mb-6 leading-relaxed">
              카카오톡 대화를 붙여넣기만 하면<br/>AI가 숨겨진 애착 패턴을 분석해 드립니다.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3.5 bg-white text-zinc-900 text-[15px] font-bold rounded-xl hover:bg-zinc-100 transition transform active:scale-95 shadow-lg"
            >
              나도 내 상대 분석해보기
            </button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
