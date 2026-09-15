"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SAMPLE_ANALYSIS } from "@/lib/fixtures/sampleAnalysis";
import { ATTACHMENT_TYPE_MAPPING } from "@/lib/analysis/types";
import { PremiumReportLocked } from "@/components/premium/PremiumReportLocked";
import { ShareResultCard } from "@/components/share/ShareResultCard";

const SIGNAL_MAPPING: Record<string, { title: string, desc: string }> = {
  "demanding_reassurance": { title: "관계 확인 욕구", desc: "관계가 괜찮은지 반복적으로 확인하려는 경향이 나타나요." },
  "over_texting": { title: "과도한 연락", desc: "답장이 없으면 불안해하며 연락을 계속하는 패턴이 보여요." },
  "fear_of_abandonment": { title: "버림받을 것에 대한 두려움", desc: "상대방이 떠날지도 모른다는 불안감을 표현하는 패턴이 보여요." },
  "stonewalling": { title: "대화 단절 (Stonewalling)", desc: "갈등 상황에서 대화를 회피하고 침묵으로 일관하는 경향이 나타나요." },
  "dismissing_emotions": { title: "감정 축소 및 회피", desc: "상대의 감정적 호소를 가볍게 넘기거나 이성적으로만 대하려는 패턴이 보여요." },
  "intellectualization": { title: "지나친 이성화", desc: "감정적인 공감 대신 논리와 이성으로만 상황을 분석하려는 패턴이 보여요." },
  "topic_shifting": { title: "화제 전환 (Topic Shifting)", desc: "불편한 감정이나 갈등 주제가 나오면 다른 이야기로 말을 돌리려는 경향이 나타나요." },
  "validating_emotions": { title: "감정적 수용", desc: "상대방의 감정을 있는 그대로 인정하고 수용하는 안정적인 대화 패턴이 보여요." }
};

export default function SampleResultPage() {
  const router = useRouter();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const analysis = SAMPLE_ANALYSIS;
  const { attachment_dimensions, attachment_fitness, primary_type, secondary_type, is_mixed_pattern, signals, target_speaker_label } = analysis;

  const getMappedType = (rawType: string) => {
    const normalized = rawType.toLowerCase().replace(/[^a-z-]/g, '');
    for (const [key, val] of Object.entries(ATTACHMENT_TYPE_MAPPING)) {
      if (normalized.includes(key)) return val;
    }
    return { ko: rawType, desc: "대화 속에서 다양한 애착 성향이 혼재된 복합적인 패턴이 나타납니다.", en: rawType };
  };

  const mappedPrimary = getMappedType(primary_type);

  // NICEPAY 결제 모듈 진입 핸들러 (기존 실제 결제 모듈 그대로 호출)
  const handleUnlock = async () => {
    if (isPaymentProcessing) return;
    try {
      setIsPaymentProcessing(true);

      if (!(window as any).AUTHNICE) {
        throw new Error("결제 모듈을 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
      const orderId = `sample_${Date.now()}`;

      (window as any).AUTHNICE.requestPay({
        clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
        method: 'card',
        orderId: orderId,
        amount: 2900,
        goodsName: "프리미엄 관계 심층 리포트",
        returnUrl: `${baseUrl}/api/premium/callback`,
        fnError: function (result: any) {
          setIsPaymentProcessing(false);
          if (result?.errorMsg) {
            alert(result.errorMsg);
          }
        }
      });

    } catch (err: any) {
      setIsPaymentProcessing(false);
      alert(err.message || "결제 모듈 진입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">예시 분석 결과 리포트</span>
          <div className="w-5 h-5" />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10">
        
        {/* 심사용 예시 안내 뱃지 */}
        <div className="mb-6 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <span className="block text-[13px] font-bold text-blue-900">심사용 예시 결과 화면</span>
            <p className="text-[12px] text-blue-700 leading-snug mt-0.5">실제 대화 입력 시 제공되는 분석 결과 및 결제 화면과 동일하게 구성되어 있습니다.</p>
          </div>
        </div>

        {/* FREE: 01. 분석 요약 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {target_speaker_label && (
            <div className="inline-block px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full mb-4">
              분석 대상: {target_speaker_label}
            </div>
          )}
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-snug">
            상대의 주 애착 유형은<br/>
            <span className="text-blue-600">"{mappedPrimary.ko}"</span>입니다.
          </h1>
          <p className="mt-1 text-[13px] text-zinc-400 font-semibold tracking-wide uppercase">
            {mappedPrimary.en}
          </p>
          
          <div className="mt-4 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
            <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
              {mappedPrimary.desc}
            </p>
          </div>

          {is_mixed_pattern && (
            <p className="mt-4 text-[13px] text-zinc-500 font-medium bg-zinc-100 p-3 rounded-lg inline-block">
              *보조 유형인 <strong className="text-zinc-700">{secondary_type}</strong> 성향도 혼재되어 나타납니다.
            </p>
          )}
        </motion.div>

        {/* FREE: 2D Fitness Score Board */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h3 className="text-[13px] font-bold text-zinc-500 mb-5">유형별 행동 적합도 (Euclidean Fitness)</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-600">안정형 (Secure)</span>
                <span className="text-zinc-900">{attachment_fitness.secure}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.secure}%` }} className="h-full bg-emerald-400 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-600">몰입/불안형 (Preoccupied)</span>
                <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.preoccupied}%` }} className="h-full bg-amber-400 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-blue-600 font-black">거부-회피형 (Dismissive)</span>
                <span className="text-zinc-900 font-black">{attachment_fitness.dismissing}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.dismissing}%` }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-600">공포-회피형 (Fearful)</span>
                <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.fearful}%` }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-zinc-100 flex justify-between">
            <div className="text-center">
              <span className="block text-[11px] text-zinc-400 font-bold mb-1">불안 차원 (Anxiety)</span>
              <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.anxiety} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
            </div>
            <div className="w-px bg-zinc-100" />
            <div className="text-center">
              <span className="block text-[11px] text-zinc-400 font-bold mb-1">회피 차원 (Avoidance)</span>
              <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.avoidance} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
            </div>
          </div>
        </motion.div>

        {/* FREE: 02. 결과의 근거 미리보기 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <h3 className="text-[16px] font-bold text-zinc-900 mb-4">포착된 핵심 행동 패턴 (미리보기)</h3>
          
          <div className="space-y-3">
            {signals && Object.entries(signals)
              .filter(([_, signal]: any) => signal && Array.isArray(signal.evidence_quotes) && signal.evidence_quotes.length > 0)
              .slice(0, 2)
              .map(([key, signal]: any, idx) => {
                const mappedSignal = SIGNAL_MAPPING[key] || { title: key.replace(/_/g, ' ').toUpperCase(), desc: `해당 성향을 나타내는 신호가 발견되었습니다.` };
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black">
                        {idx + 1}
                      </span>
                      <strong className="text-[14px] text-zinc-900">{mappedSignal.title}</strong>
                    </div>
                    <p className="text-[13px] text-zinc-600 leading-relaxed pl-8 mb-2">
                      "{mappedSignal.desc}"
                    </p>
                    {signal.evidence_quotes?.[0] && (
                      <div className="ml-8 text-[12px] text-zinc-500 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                        💬 단서: "{signal.evidence_quotes[0]}"
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </motion.div>

        {/* FREE: 03. 무료 결과 공유 영역 */}
        <div className="mb-8 flex gap-3 print:hidden">
          <button 
            onClick={() => alert("예시 결과 화면입니다.")}
            className="flex-1 py-3 bg-white text-zinc-900 border border-zinc-200 text-[13px] font-bold rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            이미지 저장
          </button>
          <button 
            onClick={() => alert("예시 결과 화면입니다.")}
            className="flex-1 py-3 bg-zinc-900 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-md shadow-zinc-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            결과 링크 공유
          </button>
        </div>

        {/* PREMIUM SECTIONS & PAYWALL (NICEPAY 결제 진입 검증 영역) */}
        <div className="relative">
          <PremiumReportLocked 
            onUnlock={handleUnlock} 
            isProcessing={isPaymentProcessing} 
          />
        </div>

      </main>

      <div className="absolute top-[-9999px] left-[-9999px]">
        <ShareResultCard ref={shareCardRef} analysis={analysis} alias="상대방" />
      </div>
    </div>
  );
}
