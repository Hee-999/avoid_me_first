import React, { forwardRef } from "react";
import { FinalAnalysis, getMappedType, getDimensionObservationText, getAnalysisUiPresentation } from "@/lib/analysis/types";

interface ShareResultCardProps {
  analysis: FinalAnalysis;
  alias: string;
}

export const ShareResultCard = forwardRef<HTMLDivElement, ShareResultCardProps>(
  ({ analysis, alias }, ref) => {
    const { primary_type, attachment_fitness, attachment_dimensions } = analysis;

    const uiPres = getAnalysisUiPresentation({
      primaryType: primary_type,
      anxietyScore: attachment_dimensions?.anxiety ?? 0,
      avoidanceScore: attachment_dimensions?.avoidance ?? 0,
      anxietyStatus: attachment_dimensions?.anxiety_status,
      avoidanceStatus: attachment_dimensions?.avoidance_status,
      speakerLabel: alias || "상대방"
    });

    const isAnxietyInsufficient = attachment_dimensions?.anxiety_status === "insufficient";
    const isAvoidanceInsufficient = attachment_dimensions?.avoidance_status === "insufficient";

    return (
      <div 
        ref={ref}
        className="w-[1080px] h-[1350px] bg-zinc-50 flex flex-col p-16"
        style={{ fontFamily: "'Pretendard', sans-serif" }}
      >
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-zinc-200 flex flex-col p-16 overflow-hidden relative">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-16 relative z-10">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg"></div>
              러브패턴
            </div>
            <div className="px-6 py-2 bg-zinc-100 rounded-full text-zinc-600 font-bold text-xl">
              AI 애착 유형 분석
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="inline-block px-6 py-2 bg-zinc-900 text-white text-xl font-bold rounded-full mb-8 w-max">
              분석 대상: {alias}
            </div>
            
            <h1 className="text-6xl font-black text-zinc-900 tracking-tight leading-snug mb-14">
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

            {/* 2D Score Board */}
            <div className="bg-zinc-50 rounded-3xl p-10 border border-zinc-100">
              <h3 className="text-2xl font-bold text-zinc-500 mb-8">유형별 행동 적합도</h3>
              
              {!uiPres.showFitnessBars && uiPres.fitnessNotice ? (
                <div className="py-4 mb-4">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                      <h4 className="text-2xl font-bold text-zinc-900">
                        {uiPres.fitnessNotice.title}
                      </h4>
                    </div>

                    <div className="space-y-3 text-xl leading-relaxed font-medium">
                      <div className="flex items-center gap-3 text-zinc-800">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{uiPres.fitnessNotice.description}</span>
                      </div>
                      {uiPres.fitnessNotice.subText && (
                        <p className="text-lg text-zinc-500 pt-3 border-t border-zinc-200/80 mt-3">
                          * {uiPres.fitnessNotice.subText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xl font-bold mb-3">
                      <span className={primary_type === "secure" ? "text-blue-600 font-bold" : "text-zinc-600"}>안정형</span>
                      <span className="text-zinc-900">{attachment_fitness.secure}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                      <div style={{ width: `${attachment_fitness.secure}%` }} className="h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xl font-bold mb-3">
                      <span className={uiPres.mode === "anxiety_dominant" || primary_type === "preoccupied" ? "text-blue-600 font-bold" : "text-zinc-600"}>몰입/불안형</span>
                      {isAnxietyInsufficient ? (
                        <span className="text-amber-800 font-semibold bg-amber-50 px-3 py-1 rounded-md text-lg border border-amber-200">판단 보류 (단서 부족)</span>
                      ) : (
                        <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
                      )}
                    </div>
                    <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                      {isAnxietyInsufficient ? (
                        <div className="h-full bg-zinc-300/40 rounded-full w-full" />
                      ) : (
                        <div style={{ width: `${attachment_fitness.preoccupied}%` }} className="h-full bg-amber-400 rounded-full" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xl font-bold mb-3">
                      <span className={uiPres.mode === "avoidance_dominant" || primary_type === "dismissing" || primary_type === "dismissive-avoidant" ? "text-blue-600 font-bold" : "text-zinc-600"}>거부-회피형</span>
                      {isAvoidanceInsufficient ? (
                        <span className="text-amber-800 font-semibold bg-amber-50 px-3 py-1 rounded-md text-lg border border-amber-200">판단 보류 (단서 부족)</span>
                      ) : (
                        <span className="text-zinc-900 font-bold">{attachment_fitness.dismissing}%</span>
                      )}
                    </div>
                    <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                      {isAvoidanceInsufficient ? (
                        <div className="h-full bg-zinc-300/40 rounded-full w-full" />
                      ) : (
                        <div style={{ width: `${attachment_fitness.dismissing}%` }} className="h-full bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xl font-bold mb-3">
                      <span className={primary_type === "fearful" || primary_type === "fearful-avoidant" ? "text-blue-600 font-bold" : "text-zinc-600"}>공포-회피형</span>
                      <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                      <div style={{ width: `${attachment_fitness.fearful}%` }} className="h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>

                  {(isAnxietyInsufficient || isAvoidanceInsufficient) && (
                    <div className="mt-6 pt-5 border-t border-zinc-200 text-lg text-zinc-500 font-medium leading-relaxed">
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
              
              <div className="mt-10 pt-8 border-t border-zinc-200 flex justify-between px-10">
                <div className="text-center">
                  <span className="block text-xl text-zinc-400 font-bold mb-2">불안 점수</span>
                  {attachment_dimensions.anxiety_status === "insufficient" ? (
                    <span className="block text-3xl font-bold text-zinc-500 py-2">단서 부족</span>
                  ) : (
                    <span className="block text-5xl font-black text-zinc-800">{attachment_dimensions.anxiety} <span className="text-2xl font-medium text-zinc-400">/ 100</span></span>
                  )}
                </div>
                <div className="w-px bg-zinc-200" />
                <div className="text-center">
                  <span className="block text-xl text-zinc-400 font-bold mb-2">회피 점수</span>
                  {attachment_dimensions.avoidance_status === "insufficient" ? (
                    <span className="block text-3xl font-bold text-zinc-500 py-2">단서 부족</span>
                  ) : (
                    <span className="block text-5xl font-black text-zinc-800">{attachment_dimensions.avoidance} <span className="text-2xl font-medium text-zinc-400">/ 100</span></span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center relative z-10">
            <p className="text-2xl font-bold text-zinc-400">나의 카카오톡 대화 분석해보기</p>
            <p className="text-xl text-zinc-300 mt-2">lovepattern.site</p>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>
      </div>
    );
  }
);

ShareResultCard.displayName = "ShareResultCard";
