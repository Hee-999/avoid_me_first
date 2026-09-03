import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  patterns: PremiumReportV2['behavior_patterns'];
}

export function BehaviorSection({ patterns }: Props) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <section className="relative">
      <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
        <span className="text-xl">📊</span> Ch.3 핵심 행동 패턴 심층 분석
      </h3>
      
      <div className="grid gap-4">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-[15px] font-bold text-zinc-900 leading-snug">{pattern.title}</h4>
              <span className={`shrink-0 text-[11px] font-bold px-2 py-1 rounded-md ${
                pattern.strength_label.includes('명확') || pattern.strength_label.includes('강함')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-zinc-100 text-zinc-500'
              }`}>
                {pattern.strength_label}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-1 uppercase tracking-wider">관찰된 사실</span>
                <p className="text-[13px] text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg">
                  "{pattern.observation}"
                </p>
              </div>
              
              <div>
                <span className="text-[11px] font-bold text-blue-500 block mb-1 uppercase tracking-wider">심리적 해석</span>
                <p className="text-[13px] text-zinc-700 leading-relaxed">
                  {pattern.interpretation}
                </p>
              </div>
              
              <div className="pt-3 border-t border-zinc-100">
                <span className="text-[11px] font-bold text-purple-500 block mb-1 uppercase tracking-wider">관계에 미치는 영향</span>
                <p className="text-[13px] text-zinc-700 leading-relaxed">
                  {pattern.relationship_effect}
                </p>
              </div>
              
              {pattern.counterpoint && (
                <div className="pt-3 border-t border-zinc-100">
                  <span className="text-[11px] font-bold text-green-500 block mb-1 uppercase tracking-wider">반대 증거 (건강한 패턴)</span>
                  <p className="text-[13px] text-zinc-600 leading-relaxed">
                    {pattern.counterpoint}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
