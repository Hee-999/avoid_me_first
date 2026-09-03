import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  conflict: PremiumReportV2['conflict_pattern'];
  guide: PremiumReportV2['communication_guide'];
}

export function CommunicationSection({ conflict, guide }: Props) {
  return (
    <div className="space-y-12">
      {/* 07. Conflict Pattern */}
      {conflict && (
        <section className="relative">
          <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="text-xl">⚔️</span> Ch.7 갈등 대처 패턴 요약
          </h3>
          
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <p className="text-[14px] text-zinc-700 leading-relaxed mb-6 font-medium">
              {conflict.summary}
            </p>
            
            <div className="grid gap-6">
              {/* Works Better */}
              <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
                <span className="text-[12px] font-bold text-green-600 block mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> 
                  효과적인 대처 방식
                </span>
                <ul className="space-y-3">
                  {(conflict.works_better || []).map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-[13px] text-zinc-700 leading-relaxed">
                      <span className="text-green-500 mt-0.5">✔</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Likely to Worsen */}
              <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                <span className="text-[12px] font-bold text-red-600 block mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> 
                  상황을 악화시키는 방식
                </span>
                <ul className="space-y-3">
                  {(conflict.likely_to_worsen || []).map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-[13px] text-zinc-700 leading-relaxed">
                      <span className="text-red-500 mt-0.5">❌</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 08. Communication Guide */}
      {guide && guide.length > 0 && (
        <section className="relative">
          <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="text-xl">💬</span> Ch.8 상황별 대화 가이드 (Do & Don't)
          </h3>
          
          <div className="space-y-4">
            {guide.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="bg-zinc-50 p-4 border-b border-zinc-200">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Situation {idx + 1}</span>
                  <h4 className="text-[15px] font-bold text-zinc-900">{item.situation}</h4>
                </div>
                
                <div className="p-6 grid gap-6">
                  {/* Do */}
                  <div>
                    <span className="text-[12px] font-bold text-blue-600 block mb-2 uppercase tracking-widest">👍 DO (권장)</span>
                    <p className="text-[14px] text-zinc-800 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                      {item.do}
                    </p>
                  </div>
                  
                  {/* Don't */}
                  <div>
                    <span className="text-[12px] font-bold text-red-500 block mb-2 uppercase tracking-widest">🛑 DON'T (금지)</span>
                    <p className="text-[14px] text-zinc-800 leading-relaxed bg-red-50/50 p-4 rounded-xl border border-red-50">
                      {item.dont}
                    </p>
                  </div>
                  
                  {/* Why */}
                  <div className="pt-4 border-t border-zinc-100">
                    <span className="text-[11px] font-bold text-purple-600 block mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 
                      왜 이렇게 해야 할까요?
                    </span>
                    <p className="text-[13px] text-zinc-600 leading-relaxed">
                      {item.why}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
