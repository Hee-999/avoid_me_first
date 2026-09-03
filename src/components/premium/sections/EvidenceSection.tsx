import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  evidences: PremiumReportV2['evidence_deep_dive'];
}

export function EvidenceSection({ evidences }: Props) {
  if (!evidences || evidences.length === 0) return null;

  return (
    <section className="relative">
      <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
        <span className="text-xl">🕵️‍♀️</span> Ch.4 대화 딥다이브 (Evidence)
      </h3>
      
      <div className="space-y-8">
        {evidences.map((evidence, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="bg-blue-50/50 p-5 border-b border-blue-100">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest block mb-1">상황 분석 {idx + 1}</span>
              <h4 className="text-[16px] font-bold text-blue-900">{evidence.title}</h4>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Situation & Behavior */}
              <div className="grid gap-4">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-400 block mb-2">배경 상황</span>
                  <p className="text-[13px] text-zinc-700 leading-relaxed">{evidence.situation}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-400 block mb-2">관찰된 행동/발화</span>
                  <p className="text-[13px] text-zinc-700 leading-relaxed font-medium">"{evidence.observed_behavior}"</p>
                </div>
              </div>
              
              {/* Interaction */}
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-2">상호작용 과정</span>
                <p className="text-[14px] text-zinc-700 leading-relaxed border-l-2 border-zinc-200 pl-4 py-1">
                  {evidence.interaction}
                </p>
              </div>
              
              {/* Interpretations */}
              <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-50 space-y-4">
                <div>
                  <span className="text-[12px] font-bold text-blue-600 flex items-center gap-1 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
                    심층 해석
                  </span>
                  <p className="text-[14px] text-zinc-800 leading-relaxed">{evidence.interpretation}</p>
                </div>
                
                {evidence.alternative_explanation && (
                  <div>
                    <span className="text-[12px] font-bold text-purple-600 flex items-center gap-1 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 
                      대안적 설명 (다른 관점)
                    </span>
                    <p className="text-[14px] text-zinc-700 leading-relaxed">{evidence.alternative_explanation}</p>
                  </div>
                )}
                
                <div className="pt-4 mt-2 border-t border-blue-100/50">
                  <span className="text-[12px] font-bold text-zinc-900 block mb-2">결론</span>
                  <p className="text-[14px] font-medium text-zinc-800 leading-relaxed bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                    {evidence.conclusion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
