import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  conflict: PremiumReportV2['conflict_pattern'];
  guide: PremiumReportV2['communication_guide'];
}

export function CommunicationSection({ guide }: Props) {
  if (!guide || guide.length === 0) return null;

  return (
    <section className="relative break-keep">
      <div className="mb-4">
        <h3 className="text-[17px] sm:text-[18px] font-black text-white print:text-zinc-900 flex items-center gap-2">
          <span className="text-xl">🛑</span> 상황별 이렇게 대처해 보세요
        </h3>
        <p className="text-[13px] text-slate-400 mt-0.5">
          그 사람의 방어벽을 건드리지 않고 대화를 풀어가는 기준이에요.
        </p>
      </div>

      <div className="space-y-4">
        {guide.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-zinc-50 px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-2">
              <h4 className="text-[14.5px] font-bold text-zinc-900">{item.situation}</h4>
              <span className="text-[11px] font-bold text-zinc-500 bg-zinc-200/70 px-2.5 py-0.5 rounded-full shrink-0">
                상황 {idx + 1}
              </span>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Do */}
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                  <span className="text-[12px] font-extrabold text-blue-700 block mb-1">
                    👍 이렇게 해보세요
                  </span>
                  <p className="text-[13.5px] text-zinc-800 leading-relaxed font-medium">
                    {item.do}
                  </p>
                </div>

                {/* Don't */}
                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100">
                  <span className="text-[12px] font-extrabold text-rose-600 block mb-1">
                    🛑 이건 꼭 피하세요
                  </span>
                  <p className="text-[13.5px] text-zinc-800 leading-relaxed font-medium">
                    {item.dont}
                  </p>
                </div>
              </div>

              {/* Why */}
              <div className="pt-2.5 border-t border-zinc-100 flex items-start gap-1.5 text-[13px] text-zinc-600 leading-relaxed">
                <span className="text-indigo-600 font-bold shrink-0">💡 왜냐하면:</span>
                <span>{item.why}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
