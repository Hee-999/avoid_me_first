import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  evidences: PremiumReportV2['evidence_deep_dive'];
}

export function EvidenceSection({ evidences }: Props) {
  if (!evidences || evidences.length === 0) return null;

  return (
    <section className="relative break-keep">
      <div className="mb-4">
        <h3 className="text-[17px] sm:text-[18px] font-black text-zinc-900 flex items-center gap-2">
          <span className="text-xl">🕵️‍♀️</span> 카톡 장면으로 본 진짜 속마음
        </h3>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          그 사람이 왜 그렇게 말했는지 실제 대화 장면을 하나씩 뜯어볼게요.
        </p>
      </div>

      <div className="space-y-5">
        {evidences.map((evidence, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-zinc-900 text-white px-5 py-3.5 flex items-center justify-between gap-2">
              <h4 className="text-[14.5px] font-bold truncate">{evidence.title}</h4>
              <span className="text-[11px] font-bold text-blue-300 bg-white/10 px-2.5 py-0.5 rounded-full shrink-0">
                장면 {idx + 1}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* 1. 대화 장면 & 반응 */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500">
                  <span>💬</span>
                  <span>이때 이런 흐름이었죠</span>
                </div>
                <p className="text-[13.5px] text-zinc-700 leading-relaxed">
                  {evidence.situation}
                </p>
                {evidence.observed_behavior && (
                  <div className="bg-white px-3.5 py-2.5 rounded-xl border border-zinc-200/80 text-[13.5px] font-bold text-zinc-900">
                    “{evidence.observed_behavior}”
                  </div>
                )}
                {evidence.interaction && (
                  <p className="text-[13px] text-zinc-600 leading-relaxed pt-0.5">
                    → {evidence.interaction}
                  </p>
                )}
              </div>

              {/* 2. 속마음 해독 */}
              <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-blue-700">
                  <span>💡</span>
                  <span>이 말 뒤에 숨은 진짜 속마음</span>
                </div>
                <p className="text-[13.5px] text-zinc-800 leading-relaxed font-medium">
                  {evidence.interpretation}
                </p>
                {evidence.alternative_explanation && (
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed pt-2 border-t border-blue-100/70">
                    <strong className="text-indigo-600 font-bold">한 가지 더: </strong>
                    {evidence.alternative_explanation}
                  </p>
                )}
              </div>

              {/* 3. 결론 */}
              <div className="flex items-start gap-2 bg-zinc-900/5 px-4 py-3 rounded-xl border border-zinc-200/60">
                <span className="text-[14px] shrink-0 mt-0.5">📌</span>
                <p className="text-[13.5px] font-bold text-zinc-900 leading-relaxed">
                  {evidence.conclusion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
