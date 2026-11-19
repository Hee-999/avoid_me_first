import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  conflict: PremiumReportV2['conflict_pattern'];
  guide: PremiumReportV2['communication_guide'];
  isFlirting?: boolean;
  chapterLabel?: string;
}

export function CommunicationSection({ guide, isFlirting = false, chapterLabel = '제4장' }: Props) {
  if (!guide || guide.length === 0) return null;

  return (
    <section className="relative break-keep">
      <div className="mb-5 text-left">
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black tracking-wide mb-2">
          {chapterLabel}
        </span>
        <h3 className="text-[18px] sm:text-[19px] font-black text-white print:text-zinc-900 flex items-center gap-2">
          <span>🛑</span>
          <span>{isFlirting ? '상황별 이렇게 반응해 보세요' : '상황별 이렇게 대처해 보세요'}</span>
        </h3>
        <p className="text-[13px] text-slate-400 mt-1">
          {isFlirting
            ? '상대가 부담을 느끼지 않고 자연스럽게 마음을 열게 만드는 기준이에요.'
            : '그 사람의 방어벽을 건드리지 않고 대화를 풀어가는 기준이에요.'}
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
              <div className="grid grid-cols-1 gap-3">
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
              <div className="pt-2.5 border-t border-zinc-100 space-y-1 text-[13px] text-zinc-600 leading-relaxed">
                <span className="block text-indigo-600 font-bold">💡 왜냐하면:</span>
                <p>{item.why}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
