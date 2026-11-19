import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  rewrites: PremiumReportV2['conversation_rewrites'];
  recovery: PremiumReportV2['recovery_signals'];
  risk: PremiumReportV2['risk_signals'];
  plan: PremiumReportV2['action_plan'];
  manual: PremiumReportV2['manual_summary'];
}

function extractQuoteOnly(text: string): string {
  const m = (text || "").match(/예:\s*['"]([^'"]+)['"]/);
  if (m?.[1]) return m[1];
  return (text || "").replace(/^['"]|['"]$/g, "").trim();
}

export function RewriteSection({
  rewrites,
  isFlirting = false,
  chapterLabel = '제5장',
}: {
  rewrites: PremiumReportV2['conversation_rewrites'];
  isFlirting?: boolean;
  chapterLabel?: string;
}) {
  if (!rewrites || rewrites.length === 0) return null;
  return (
    <section className="relative pt-8 border-t border-white/10 break-keep">
      <div className="mb-5 text-left">
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black tracking-wide mb-2">
          {chapterLabel}
        </span>
        <h3 className="text-[18px] sm:text-[19px] font-black text-white print:text-zinc-900 flex items-center gap-2">
          <span>💬</span>
          <span>지금 바로 이렇게 답장해 보세요</span>
        </h3>
        <p className="text-[13px] text-slate-400 mt-1">
          {isFlirting
            ? '어색하거나 무거운 말투 대신, 자연스럽게 대화를 이어가는 현실 썸 카톡 예시예요.'
            : '상대가 부담을 느끼는 말투 대신, 방어벽을 스르륵 낮추는 현실 카톡 예시예요.'}
        </p>
      </div>

      <div className="grid gap-4">
        {rewrites.map((rw, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm break-inside-avoid">
            <div className="mb-3.5 pb-3 border-b border-zinc-100 flex items-center justify-between gap-2">
              <p className="text-[14px] text-zinc-900 font-bold">{rw.situation}</p>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full shrink-0">
                예시 {idx + 1}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/70">
                <span className="text-[11px] font-bold text-zinc-500 block mb-1">
                  😅 이렇게 보내면 더 숨어버려요
                </span>
                <p className="text-[13.5px] text-zinc-600 leading-relaxed">
                  “{extractQuoteOnly(rw.original_pattern_summary)}”
                </p>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                <span className="text-[11px] font-extrabold text-blue-700 block mb-1">
                  ✨ 이렇게 보내면 부담 없이 답장이 와요
                </span>
                <p className="text-[14.5px] font-bold text-blue-950 leading-relaxed">
                  “{extractQuoteOnly(rw.recommended_message)}”
                </p>
              </div>

              <p className="text-[12.5px] text-zinc-600 bg-zinc-50/80 px-3.5 py-2.5 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-800 mr-1">포인트:</span>
                {rw.why}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NextStepChecklistSection({
  recovery,
  risk,
  plan,
  manual,
  isFlirting = false,
  chapterLabel = '제6장',
}: {
  recovery: PremiumReportV2['recovery_signals'];
  risk: PremiumReportV2['risk_signals'];
  plan: PremiumReportV2['action_plan'];
  manual: PremiumReportV2['manual_summary'];
  isFlirting?: boolean;
  chapterLabel?: string;
}) {
  const hasSignals = Boolean(recovery?.length || risk?.length);
  const hasPlan = Boolean(plan?.next_7_days?.length || plan?.next_30_days?.length);
  const keySentence = manual?.key_sentence;

  if (!hasSignals && !hasPlan && !keySentence) return null;

  return (
    <section className="relative pt-8 border-t border-white/10 space-y-5 break-keep">
      <div className="text-left">
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black tracking-wide mb-2">
          {chapterLabel}
        </span>
        <h3 className="text-[18px] sm:text-[19px] font-black text-white print:text-zinc-900 flex items-center gap-2">
          <span>📅</span>
          <span>{isFlirting ? '선톡 타이밍 & 그린라이트·주의 신호' : '연락 타이밍 & 청신호·적신호 체크'}</span>
        </h3>
        <p className="text-[13px] text-slate-400 mt-1">
          앞으로 어떻게 움직일지, 그 사람의 어떤 반응을 봐야 할지 정리했어요.
        </p>
      </div>

      {/* 1. 단기/중기 행동 플랜 */}
      {hasPlan && (
        <div className="grid grid-cols-1 gap-3.5">
          {!!plan?.next_7_days?.length && (
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
              <h4 className="text-[13.5px] font-extrabold text-blue-700 mb-2.5 flex items-center gap-1.5">
                <span>🗓️</span> 당장 이번 주에는요 (7일)
              </h4>
              <ul className="space-y-2">
                {plan.next_7_days.map((p, i) => (
                  <li key={i} className="text-[13px] text-zinc-700 leading-relaxed flex gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!plan?.next_30_days?.length && (
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
              <h4 className="text-[13.5px] font-extrabold text-indigo-700 mb-2.5 flex items-center gap-1.5">
                <span>🎯</span> 한 달 동안은 이렇게 해보세요
              </h4>
              <ul className="space-y-2">
                {plan.next_30_days.map((p, i) => (
                  <li key={i} className="text-[13px] text-zinc-700 leading-relaxed flex gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 2. 긍정 신호 vs 주의 신호 */}
      {hasSignals && (
        <div className="grid grid-cols-1 gap-3.5">
          {recovery && recovery.length > 0 && (
            <div className="bg-zinc-800/60 p-5 rounded-2xl border border-emerald-500/30">
              <h4 className="text-[13.5px] font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                <span>🟢</span> {isFlirting ? '호감이 올라가고 있다는 그린라이트' : '마음이 풀리고 있다는 청신호'}
              </h4>
              <ul className="space-y-2">
                {recovery.map((sig, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-[13px] text-zinc-200 leading-relaxed">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {risk && risk.length > 0 && (
            <div className="bg-zinc-800/60 p-5 rounded-2xl border border-rose-500/30">
              <h4 className="text-[13.5px] font-bold text-rose-400 mb-2.5 flex items-center gap-1.5">
                <span>🔴</span> {isFlirting ? '템포를 조금 조절해야 할 주의 신호' : '한 템포 쉬어가야 할 적신호'}
              </h4>
              <ul className="space-y-2">
                {risk.map((sig, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-[13px] text-zinc-200 leading-relaxed">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. 꼭 기억할 한 문장 */}
      {keySentence && (
        <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-5 rounded-2xl border border-blue-400/30 text-center">
          <span className="text-[11px] font-bold text-blue-300 block mb-1.5">
            📌 카톡 보내기 전 딱 한 번만 떠올려 보세요
          </span>
          <p className="text-[14.5px] font-black text-white leading-relaxed">
            “{keySentence.replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "")}”
          </p>
        </div>
      )}
    </section>
  );
}

export function ActionSection({
  rewrites,
  recovery,
  risk,
  plan,
  manual,
  isFlirting = false,
}: Props & { isFlirting?: boolean }) {
  return (
    <div className="space-y-10">
      <RewriteSection rewrites={rewrites} isFlirting={isFlirting} />
      <NextStepChecklistSection recovery={recovery} risk={risk} plan={plan} manual={manual} isFlirting={isFlirting} />
    </div>
  );
}
