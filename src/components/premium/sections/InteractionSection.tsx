import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  triggers: PremiumReportV2['trigger_profile'];
  loop?: PremiumReportV2['interaction_loop'];
}

export function TriggerSection({ triggers }: { triggers: PremiumReportV2['trigger_profile'] }) {
  if (!triggers || triggers.length === 0) return null;
  return (
    <section className="relative">
      <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
        <span className="text-xl">⚡</span> Ch.5 트리거 프로필 (발작 버튼)
      </h3>
      
      <div className="grid gap-4">
        {triggers.map((trigger, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden break-inside-avoid">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
            
            <p className="text-[15px] font-bold text-red-600 mb-3">"{trigger.trigger}"</p>
            
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-1">관찰된 반응</span>
                <p className="text-[13px] text-zinc-700 bg-red-50/50 p-2 rounded-lg">{trigger.observed_response}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-1">해석 (왜 발작하는가?)</span>
                <p className="text-[13px] text-zinc-700">{trigger.interpretation}</p>
              </div>
              <div className="pt-3 border-t border-zinc-100">
                <span className="text-[11px] font-bold text-green-600 block mb-1">권장 대처법</span>
                <p className="text-[13px] font-medium text-zinc-800">{trigger.recommended_approach}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LoopSection({ loop }: { loop?: PremiumReportV2['interaction_loop'] }) {
  if (!loop || !loop.steps || loop.steps.length === 0) return null;
  return (
    <section className="relative">
      <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
        <span className="text-xl">🔁</span> Ch.6 상호작용 악순환 고리
      </h3>
      
      <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-lg print:bg-white print:text-zinc-900 print:border print:border-zinc-200 print:shadow-none">
        <p className="text-[14px] text-zinc-300 leading-relaxed mb-8 bg-black/20 p-4 rounded-xl print:text-zinc-700 print:bg-zinc-50 print:border print:border-zinc-100">
          {loop.summary}
        </p>
        
        <div className="relative">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-zinc-700 print:bg-zinc-200"></div>
          
          <div className="space-y-6 relative">
            {loop.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start relative z-10 break-inside-avoid">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center font-black text-zinc-400 shrink-0 mt-1 shadow-sm print:bg-white print:border-zinc-200 print:text-zinc-500">
                  {idx + 1}
                </div>
                <div className="bg-zinc-800/80 p-5 rounded-2xl border border-zinc-700 flex-1 hover:border-zinc-500 transition-colors print:bg-white print:border-zinc-200 print:shadow-sm">
                  <p className="text-[14px] text-zinc-200 leading-relaxed print:text-zinc-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {loop.break_points && loop.break_points.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800 print:border-zinc-200 break-inside-avoid">
            <span className="text-[12px] font-bold text-green-400 uppercase tracking-widest block mb-4 flex items-center gap-2 print:text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse print:bg-green-500"></span>
              고리 끊어내기 (Break Points)
            </span>
            <div className="space-y-2">
              {loop.break_points.map((point, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-green-900/20 p-4 rounded-xl border border-green-900/30 print:bg-green-50 print:border-green-100">
                  <span className="text-green-500 mt-0.5 print:text-green-600">💡</span>
                  <p className="text-[14px] text-green-100/90 leading-relaxed print:text-green-800">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function InteractionSection({ triggers, loop }: Props) {
  return (
    <div className="space-y-12">
      <TriggerSection triggers={triggers} />
      <LoopSection loop={loop} />
    </div>
  );
}
