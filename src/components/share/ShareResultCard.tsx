import React, { forwardRef } from "react";
import { FinalAnalysis } from "@/lib/analysis/types";

interface ShareResultCardProps {
  analysis: FinalAnalysis;
  alias: string;
}

export const ShareResultCard = forwardRef<HTMLDivElement, ShareResultCardProps>(
  ({ analysis, alias }, ref) => {
    const { primary_type, attachment_fitness, attachment_dimensions } = analysis;

    return (
      <div 
        ref={ref}
        className="w-[1080px] h-[1350px] bg-zinc-50 flex flex-col p-16 absolute -left-[9999px]"
        style={{ fontFamily: "'Pretendard', sans-serif" }}
      >
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-zinc-200 flex flex-col p-16 overflow-hidden relative">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-16 relative z-10">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg"></div>
              Avoidance Reader
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
            
            <h1 className="text-7xl font-black text-zinc-900 tracking-tight leading-snug mb-16">
              이 대화에서 보인<br/>
              주 애착 패턴은<br/>
              <span className="text-blue-600">{primary_type}</span>입니다.
            </h1>

            {/* 2D Score Board */}
            <div className="bg-zinc-50 rounded-3xl p-10 border border-zinc-100">
              <h3 className="text-2xl font-bold text-zinc-500 mb-8">유형별 행동 적합도</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xl font-bold mb-3">
                    <span className={primary_type === "안정형 (Secure)" ? "text-blue-600" : "text-zinc-600"}>안정형 (Secure)</span>
                    <span className="text-zinc-900">{attachment_fitness.secure}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                    <div style={{ width: `${attachment_fitness.secure}%` }} className="h-full bg-emerald-400 rounded-full" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xl font-bold mb-3">
                    <span className={primary_type === "몰입/불안형 (Preoccupied)" ? "text-blue-600" : "text-zinc-600"}>몰입/불안형 (Preoccupied)</span>
                    <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                    <div style={{ width: `${attachment_fitness.preoccupied}%` }} className="h-full bg-amber-400 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xl font-bold mb-3">
                    <span className={primary_type === "거부-회피형 (Dismissive-Avoidant)" ? "text-blue-600" : "text-zinc-600"}>거부-회피형 (Dismissive)</span>
                    <span className="text-zinc-900">{attachment_fitness.dismissing}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                    <div style={{ width: `${attachment_fitness.dismissing}%` }} className="h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xl font-bold mb-3">
                    <span className={primary_type === "공포-회피형 (Fearful-Avoidant)" ? "text-blue-600" : "text-zinc-600"}>공포-회피형 (Fearful)</span>
                    <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                    <div style={{ width: `${attachment_fitness.fearful}%` }} className="h-full bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-zinc-200 flex justify-between px-10">
                <div className="text-center">
                  <span className="block text-xl text-zinc-400 font-bold mb-2">불안 점수</span>
                  <span className="block text-5xl font-black text-zinc-800">{attachment_dimensions.anxiety} <span className="text-2xl font-medium text-zinc-400">/ 100</span></span>
                </div>
                <div className="w-px bg-zinc-200" />
                <div className="text-center">
                  <span className="block text-xl text-zinc-400 font-bold mb-2">회피 점수</span>
                  <span className="block text-5xl font-black text-zinc-800">{attachment_dimensions.avoidance} <span className="text-2xl font-medium text-zinc-400">/ 100</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center relative z-10">
            <p className="text-2xl font-bold text-zinc-400">나의 카카오톡 대화 분석해보기</p>
            <p className="text-xl text-zinc-300 mt-2">avoidance.com</p>
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
