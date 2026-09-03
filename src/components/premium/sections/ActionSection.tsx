import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  rewrites: PremiumReportV2['conversation_rewrites'];
  recovery: PremiumReportV2['recovery_signals'];
  risk: PremiumReportV2['risk_signals'];
  plan: PremiumReportV2['action_plan'];
  manual: PremiumReportV2['manual_summary'];
}

export function ActionSection({ rewrites, recovery, risk, plan, manual }: Props) {
  return (
    <div className="space-y-12">
      {/* 09. Conversation Rewrites */}
      {rewrites && rewrites.length > 0 && (
        <section className="relative">
          <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="text-xl">✍️</span> Ch.9 대화 리라이팅 (이렇게 바꿔보세요)
          </h3>
          
          <div className="grid gap-4">
            {rewrites.map((rw, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="mb-4 pb-4 border-b border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-400 block mb-1">상황</span>
                  <p className="text-[13px] text-zinc-800 font-medium">{rw.situation}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-zinc-50 p-4 rounded-xl relative opacity-80">
                    <span className="text-[10px] font-bold text-zinc-400 block mb-2">기존 발화 패턴 (비추천)</span>
                    <p className="text-[14px] text-zinc-500 line-through decoration-zinc-300">"{rw.original_pattern_summary}"</p>
                  </div>
                  
                  <div className="flex justify-center text-blue-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-600 block mb-2">추천 발화 (I-message 등)</span>
                    <p className="text-[15px] font-bold text-blue-900">"{rw.recommended_message}"</p>
                  </div>
                  
                  <p className="text-[12px] text-zinc-600 bg-white p-3 rounded-lg border border-zinc-100 shadow-sm mt-4">
                    <span className="font-bold text-zinc-800 mr-1">이유:</span>{rw.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. Signals */}
      {(recovery?.length > 0 || risk?.length > 0) && (
        <section className="relative">
          <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="text-xl">📡</span> Ch.10 회복 신호 및 위험 신호 감지
          </h3>
          
          <div className="grid gap-6">
            {recovery && recovery.length > 0 && (
              <div className="bg-green-50/30 p-6 rounded-2xl border border-green-100">
                <h4 className="text-[14px] font-bold text-green-700 mb-4 flex items-center gap-2">
                  <span className="text-green-500">🌱</span> 긍정적 회복 신호 (이럴 땐 다가가세요)
                </h4>
                <ul className="space-y-3">
                  {recovery.map((sig, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-[13px] text-zinc-700 leading-relaxed">
                      <span className="text-green-500 mt-0.5">•</span> {sig}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {risk && risk.length > 0 && (
              <div className="bg-red-50/30 p-6 rounded-2xl border border-red-100">
                <h4 className="text-[14px] font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="text-red-500">🚨</span> 경계해야 할 위험 신호 (이럴 땐 거리두기)
                </h4>
                <ul className="space-y-3">
                  {risk.map((sig, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-[13px] text-zinc-700 leading-relaxed">
                      <span className="text-red-500 mt-0.5">•</span> {sig}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 11. Action Plan */}
      {plan && (
        <section className="relative">
          <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="text-xl">📅</span> Ch.11 구체적 행동 타임라인 (Action Plan)
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-400"></div>
              <h4 className="text-[14px] font-bold text-zinc-900 mb-4">🚨 다음번 갈등 발생 직후 (Next Conflict)</h4>
              <ul className="space-y-2">
                {(plan.next_conflict || []).map((p, i) => (
                  <li key={i} className="text-[13px] text-zinc-700 flex gap-2"><span className="text-red-400">-</span> {p}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>
              <h4 className="text-[14px] font-bold text-zinc-900 mb-4">🗓️ 앞으로 7일간의 목표 (Next 7 Days)</h4>
              <ul className="space-y-2">
                {(plan.next_7_days || []).map((p, i) => (
                  <li key={i} className="text-[13px] text-zinc-700 flex gap-2"><span className="text-blue-400">-</span> {p}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-400"></div>
              <h4 className="text-[14px] font-bold text-zinc-900 mb-4">🎯 장기적 관계 유지 전략 (Next 30 Days)</h4>
              <ul className="space-y-2">
                {(plan.next_30_days || []).map((p, i) => (
                  <li key={i} className="text-[13px] text-zinc-700 flex gap-2"><span className="text-purple-400">-</span> {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 12. Manual Summary */}
      {manual && (
        <section className="relative">
          <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
            <span className="text-xl">📘</span> Ch.12 상대방 사용 설명서 (최종 요약)
          </h3>
          
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h4 className="text-[16px] font-black text-white/90 mb-6 pb-4 border-b border-zinc-700 flex items-center justify-between">
              <span>상대방 매뉴얼 요약본</span>
              <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-1 rounded">보관용</span>
            </h4>
            
            <div className="grid gap-x-8 gap-y-6">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-2 uppercase tracking-widest">효과적인 접근법</span>
                <ul className="space-y-1">
                  {(manual.effective_approach || []).map((a, i) => <li key={i} className="text-[13px] text-zinc-200">✓ {a}</li>)}
                </ul>
              </div>
              
              <div>
                <span className="text-[11px] font-bold text-zinc-400 block mb-2 uppercase tracking-widest">금기 사항</span>
                <ul className="space-y-1">
                  {(manual.ineffective_approach || []).map((a, i) => <li key={i} className="text-[13px] text-zinc-200 text-red-300">✗ {a}</li>)}
                </ul>
              </div>
              
              <div className="sm:col-span-2 pt-4 border-t border-zinc-800">
                <div className="grid gap-4">
                  <div className="bg-zinc-800/50 p-4 rounded-xl">
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">갈등 재진입 요령</span>
                    <p className="text-[13px] text-zinc-300">{manual.conflict_reentry}</p>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-xl">
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">거리두기 대처법</span>
                    <p className="text-[13px] text-zinc-300">{manual.distance_response}</p>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-xl">
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">관계 점검 방식</span>
                    <p className="text-[13px] text-zinc-300">{manual.relationship_check}</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2 bg-blue-900/30 p-5 rounded-2xl border border-blue-800/50 mt-2">
                <span className="text-[11px] font-bold text-blue-400 block mb-2">가장 중요한 핵심 문장 (Key Sentence)</span>
                <p className="text-[16px] font-black text-blue-100 text-center leading-relaxed">
                  "{manual.key_sentence}"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
