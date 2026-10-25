"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SAMPLE_ANALYSIS } from "@/lib/fixtures/sampleAnalysis";
import { ATTACHMENT_TYPE_MAPPING } from "@/lib/analysis/types";
import { PremiumReportLocked } from "@/components/premium/PremiumReportLocked";
import { ShareResultCard } from "@/components/share/ShareResultCard";

const SIGNAL_MAPPING: Record<string, { title: string, behavior: string, reason: string }> = {
  "stonewalling": { 
    title: "대화 단절", 
    behavior: "갈등 상황이나 감정적 압박이 생겼을 때, 즉각적인 답변을 멈추고 침묵으로 대화를 일방 중단하는 태도가 관찰됩니다.",
    reason: "직접적인 대립을 피하고 자신의 심리적 안전거리를 확보하려는 전형적인 회피 방어기제입니다." 
  },
  "dismissing_emotions": { 
    title: "감정 축소 및 회피", 
    behavior: "상대방의 서운함이나 감정적 호소에 공감하기보다, 대수롭지 않게 넘기거나 논리적인 반박으로 대응하는 모습이 관찰됩니다.",
    reason: "감정을 깊게 다루는 것을 취약함으로 인식하여 상황을 이성적으로 통제하려는 성향입니다." 
  },
  "intellectualization": { 
    title: "지나친 이성화", 
    behavior: "감정 교류가 필요한 대화에서도 감정 공감 대신 논리와 시시비비 위주로만 상황을 분석하려는 반응이 나타납니다.",
    reason: "자신이나 상대의 감정을 느끼는 대신 이성적 사고의 틀 안에서 방어하려는 태도입니다." 
  },
  "topic_shifting": { 
    title: "화제 전환", 
    behavior: "불편한 감정이나 갈등 주제가 언급되면 자연스럽게 다른 일상 이야기로 대화의 방향을 돌리는 양상이 나타납니다.",
    reason: "갈등 국면에 오래 머무르는 것을 피하고자 대화의 흐름을 분산시키는 반응입니다." 
  },
  "demanding_reassurance": { 
    title: "관계 확인 욕구", 
    behavior: "상대방의 반응 속도나 감정 상태에 민감하게 반응하며 애정을 거듭 확인하려는 양상이 관찰됩니다.",
    reason: "관계의 연결성이 끊어질 수 있다는 불안감을 해소하기 위한 보호 행동입니다." 
  },
  "over_texting": { 
    title: "과도한 연락 패턴", 
    behavior: "답장이 지연될 때 감정적 불안이 높아지며 짧은 간격으로 메시지를 이어 보내는 모습이 나타납니다.",
    reason: "상대의 침묵을 거절 신호로 인식하여 즉각적인 통제감을 얻으려는 심리입니다." 
  },
  "fear_of_abandonment": { 
    title: "거리감에 대한 민감성", 
    behavior: "상대가 혼자만의 시간을 필요로 하거나 거리를 둘 때 급격한 불안감이나 서운함을 표출하는 패턴이 나타납니다.",
    reason: "거리두기를 이별이나 관계 단절의 징후로 해석하여 느끼는 불안 반응입니다." 
  },
  "validating_emotions": { 
    title: "감정적 수용", 
    behavior: "상대방의 감정을 있는 그대로 인정하고 수용하는 차분하고 안정적인 대화 태도가 관찰됩니다.",
    reason: "감정의 차이를 안전하게 수용할 수 있는 안정된 심리적 기반을 가지고 있습니다." 
  }
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
        
        {/* 샘플 예시 안내 뱃지 */}
        <div className="mb-6 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <span className="block text-[13px] font-bold text-blue-900">샘플 분석 결과 미리보기</span>
            <p className="text-[12px] text-blue-700 leading-snug mt-0.5">실제 대화 분석 시 제공되는 결과 리포트 및 화면 구성의 예시입니다.</p>
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
          <h3 className="text-[14px] font-bold text-zinc-700 mb-5">유형별 행동 적합도</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-600">안정형</span>
                <span className="text-zinc-900">{attachment_fitness.secure}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.secure}%` }} className="h-full bg-emerald-400 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-600">몰입/불안형</span>
                <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.preoccupied}%` }} className="h-full bg-amber-400 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-blue-600 font-black">거부-회피형</span>
                <span className="text-zinc-900 font-black">{attachment_fitness.dismissing}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.dismissing}%` }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-600">공포-회피형</span>
                <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${attachment_fitness.fearful}%` }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-zinc-100 flex justify-between">
            <div className="text-center">
              <span className="block text-[11px] text-zinc-400 font-bold mb-1">불안 점수</span>
              {attachment_dimensions.anxiety_status === "insufficient" ? (
                <span className="block text-[15px] font-bold text-zinc-500 py-0.5">단서 부족</span>
              ) : (
                <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.anxiety} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
              )}
            </div>
            <div className="w-px bg-zinc-100" />
            <div className="text-center">
              <span className="block text-[11px] text-zinc-400 font-bold mb-1">회피 점수</span>
              {attachment_dimensions.avoidance_status === "insufficient" ? (
                <span className="block text-[15px] font-bold text-zinc-500 py-0.5">단서 부족</span>
              ) : (
                <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.avoidance} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
              )}
            </div>
          </div>
        </motion.div>

        {/* 1. 분석 근거: 대화 원문 노출 없이 관찰된 행동 양상과 해석 이유 제시 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-black text-zinc-900">01. 분석 근거</h3>
            <span className="text-[11px] font-semibold text-zinc-400">포착된 행동 패턴과 해석</span>
          </div>
          
          <div className="space-y-4">
            {signals && Object.entries(signals)
              .slice(0, 2)
              .map(([key, _]: any, idx) => {
                const mappedSignal = SIGNAL_MAPPING[key] || { 
                  title: key.replace(/_/g, ' '), 
                  behavior: "해당 애착 성향을 나타내는 행동 반응이 관찰되었습니다.",
                  reason: "애착 유형의 방어 기제가 대화 태도에 반영된 것으로 해석됩니다."
                };

                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-3">
                    {/* 패턴 타이틀 배지 */}
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <strong className="text-[14px] text-zinc-900 font-bold">{mappedSignal.title}</strong>
                    </div>

                    {/* [관찰된 행동 양상] 대화 내용 직접 노출 없이 행동 특성 요약 */}
                    <div className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 text-[12.5px] leading-relaxed text-zinc-700">
                      <span className="text-[11px] font-bold text-zinc-500 block mb-1">🔍 관찰된 행동 양상</span>
                      <p>{mappedSignal.behavior}</p>
                    </div>

                    {/* [설명] 해당 행동을 해석한 이유 */}
                    <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-3.5 text-zinc-700 text-[12.5px] leading-relaxed">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11.5px] mb-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>해석한 이유</span>
                      </div>
                      <p>{mappedSignal.reason}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>

        {/* 2. 무료 도움 한 가지: 대화 표현 제안 1개 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-black text-zinc-900">02. 무료 도움 한 가지</h3>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">즉시 실천 팁</span>
          </div>

          <div className="bg-gradient-to-br from-blue-50/60 via-white to-zinc-50 p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-3.5">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 block mb-1">상황별 맞춤 소통 제안</span>
              <h4 className="text-[13.5px] font-bold text-zinc-800">
                {target_speaker_label || "상대방"}이 갈등 후 대화를 회피하거나 입을 닫을 때
              </h4>
            </div>

            {/* 추천 말풍선 */}
            <div className="bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-sm text-[13.5px] font-semibold leading-relaxed shadow-sm">
              "지금 당장 대답하지 않아도 괜찮아. 네가 편할 때 저녁 8시쯤 천천히 얘기하자."
            </div>

            {/* 효과 및 해석 */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/70 text-[12.5px] text-zinc-600 leading-relaxed">
              <strong className="text-zinc-800 block mb-1">💡 왜 이 표현이 효과적일까요?</strong>
              거부-회피형 성향의 상대는 감정적 압박을 느낄 때 방어기제로 대화를 일방 중단합니다. 
              응답해야 하는 시간에 여유를 주고 자율성을 보장해주면, 심리적 안전감을 느껴 스스로 대화로 복귀할 가능성이 높아집니다.
            </div>
          </div>
        </motion.div>

        {/* FREE: 03. 무료 결과 공유 영역 */}
        <div className="mb-8 flex gap-3 print:hidden">
          <button 
            onClick={() => alert("예시 결과 화면입니다.")}
            className="flex-1 py-3 bg-white text-zinc-900 border border-zinc-200 text-[13px] font-bold rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            이미지 저장
          </button>
          <button 
            onClick={() => alert("예시 결과 화면입니다.")}
            className="flex-1 py-3 bg-zinc-900 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-md shadow-zinc-200 cursor-pointer"
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
