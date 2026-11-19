import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  triggers: PremiumReportV2['trigger_profile'];
  loop?: PremiumReportV2['interaction_loop'];
}

export function TriggerSection({ triggers }: { triggers: PremiumReportV2['trigger_profile'] }) {
  if (!triggers || triggers.length === 0) return null;
  return null;
}

export function LoopSection({
  loop,
  isFlirting = false,
  chapterLabel = '제3장',
}: {
  loop?: PremiumReportV2['interaction_loop'];
  isFlirting?: boolean;
  chapterLabel?: string;
}) {
  if (!loop || !loop.steps || loop.steps.length === 0) return null;
  return (
    <section className="relative pt-8 border-t border-zinc-200 break-keep">
      <div className="mb-5 text-left">
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-black tracking-wide mb-2">
          {chapterLabel}
        </span>
        <h3 className="text-[18px] sm:text-[19px] font-black text-zinc-900 flex items-center gap-2">
          <span>🔁</span>
          <span>{isFlirting ? '두 사람 대화에서 드러난 썸 흐름' : '두 사람이 자꾸 엇갈리는 패턴'}</span>
        </h3>
        <p className="text-[13px] text-zinc-500 mt-1">
          {isFlirting
            ? '어느 지점에서 대화가 자연스럽게 이어지거나 템포가 달라지는지 한눈에 짚어드릴게요.'
            : '어느 순간부터 대화가 겉돌고 멀어지는지 한눈에 짚어드릴게요.'}
        </p>
      </div>
      
      <div className="bg-zinc-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg print:bg-white print:text-zinc-900 print:border print:border-zinc-200 print:shadow-none">
        <p className="text-[14px] text-zinc-200 leading-relaxed mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
          {loop.summary}
        </p>
        
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-zinc-700 print:bg-zinc-200"></div>
          
          <div className="space-y-4 relative">
            {loop.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3.5 items-center relative z-10 break-inside-avoid">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center font-black text-[13px] text-blue-300 shrink-0 shadow-sm">
                  {idx + 1}
                </div>
                <div className="bg-zinc-800/80 px-4 py-3.5 rounded-2xl border border-zinc-700/80 flex-1">
                  <p className="text-[13.5px] text-zinc-100 leading-relaxed font-medium">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {loop.break_points && loop.break_points.length > 0 && (
          <div className="mt-6 pt-5 border-t border-zinc-800 break-inside-avoid">
            <span className="text-[12px] font-bold text-emerald-400 block mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isFlirting ? '썸 흐름을 살리는 핵심 포인트' : '이 악순환을 끊는 핵심 포인트'}
            </span>
            <div className="space-y-2">
              {loop.break_points.map((point, idx) => (
                <div key={idx} className="flex gap-2.5 items-start bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/40">
                  <span className="text-emerald-400 mt-0.5">💡</span>
                  <p className="text-[13.5px] text-emerald-100 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function InteractionSection({
  loop,
  isFlirting = false,
  chapterLabel = '제3장',
}: Props & { isFlirting?: boolean; chapterLabel?: string }) {
  return <LoopSection loop={loop} isFlirting={isFlirting} chapterLabel={chapterLabel} />;
}
