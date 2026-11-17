import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  patterns: PremiumReportV2['behavior_patterns'];
}

export function BehaviorSection({ patterns }: Props) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <section className="relative">
      <div className="mb-5">
        <h3 className="text-[17px] font-black text-zinc-900 flex items-center gap-2">
          <span className="text-xl">📊</span> 위 성향 판독의 대화 속 결정적 근거
        </h3>
        <p className="text-[12.5px] text-zinc-500 mt-1">
          막연한 추측이 아니라 실제 카톡 대화에서 포착된 행동 신호들입니다.
        </p>
      </div>
      
      <div className="grid gap-4">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-[15px] font-bold text-zinc-900 leading-snug">{pattern.title}</h4>
              <span className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                pattern.strength_label.includes('명확') || pattern.strength_label.includes('강함')
                  ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                  : 'bg-zinc-100 text-zinc-600'
              }`}>
                신호 강도: {pattern.strength_label}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 text-[13px] text-zinc-700 leading-relaxed">
                <span className="font-bold text-zinc-900 mr-1.5">포착된 행동:</span>
                “{pattern.observation}”
              </div>
              
              <p className="text-[13.5px] text-zinc-800 leading-relaxed">
                <strong className="text-blue-600 font-bold mr-1.5">속마음 의미:</strong>
                {pattern.interpretation}
              </p>
              
              <p className="text-[13px] text-zinc-600 leading-relaxed pt-2.5 border-t border-zinc-100">
                <strong className="text-indigo-600 font-bold mr-1.5">관계 영향:</strong>
                {pattern.relationship_effect}
              </p>
              
              {pattern.counterpoint && (
                <p className="text-[12.5px] text-emerald-700 bg-emerald-50/60 px-3.5 py-2.5 rounded-xl border border-emerald-100 leading-relaxed">
                  <strong className="font-bold mr-1">🌱 긍정적 반대 신호:</strong>
                  {pattern.counterpoint}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
