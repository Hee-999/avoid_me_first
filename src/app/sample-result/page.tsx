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

        {(() => {
          const targetName = target_speaker_label || "상대방";

          // Helper: Check if Korean character has final consonant (받침)
          const hasFinalConsonant = (word: string): boolean => {
            if (!word) return false;
            const lastChar = word.trim().slice(-1);
            const code = lastChar.charCodeAt(0);
            if (code < 0xac00 || code > 0xd7a3) return false;
            return (code - 0xac00) % 28 > 0;
          };

          // Helper: text cleanup and Korean postposition (조사) correction
          const cleanText = (str?: string) => {
            if (!str) return "";
            let res = str;

            const hasBatchim = hasFinalConsonant(targetName);
            const josaEun = hasBatchim ? "은" : "는";
            const josaI = hasBatchim ? "이" : "가";
            const josaEul = hasBatchim ? "을" : "를";
            const josaGwa = hasBatchim ? "과" : "와";

            res = res
              .replace(/SPEAKER_A(?:는|은)/g, `${targetName}${josaEun}`)
              .replace(/SPEAKER_A(?:가|이)/g, `${targetName}${josaI}`)
              .replace(/SPEAKER_A(?:를|을)/g, `${targetName}${josaEul}`)
              .replace(/SPEAKER_A(?:와|과)/g, `${targetName}${josaGwa}`)
              .replace(/SPEAKER_A/g, targetName)
              .replace(/The other person/gi, targetName)
              .replace(/the other person/gi, targetName);

            if (hasBatchim) {
              res = res
                .replace(new RegExp(`${targetName}는`, "g"), `${targetName}은`)
                .replace(new RegExp(`${targetName}가`, "g"), `${targetName}이`)
                .replace(new RegExp(`${targetName}를`, "g"), `${targetName}을`)
                .replace(new RegExp(`${targetName}와`, "g"), `${targetName}과`);
            } else {
              res = res
                .replace(new RegExp(`${targetName}은`, "g"), `${targetName}는`)
                .replace(new RegExp(`${targetName}이`, "g"), `${targetName}가`)
                .replace(new RegExp(`${targetName}을`, "g"), `${targetName}를`)
                .replace(new RegExp(`${targetName}과`, "g"), `${targetName}와`);
            }

            res = res
              .replace(/상대방는/g, "상대방은")
              .replace(/상대방가/g, "상대방이")
              .replace(/상대방를/g, "상대방을")
              .replace(/상대방와/g, "상대방과")
              .replace(/상대방로/g, "상대방으로");

            return res.trim();
          };

          const keySituations = (analysis as any).derived_context?.key_situations || [];
          const relationshipContext = cleanText((analysis as any).derived_context?.relationship_context);

          const items = signals ? Object.entries(signals)
            .filter(([key, signal]: any) => {
              if (!signal) return false;
              if (key === "dimensions" || key === "target_speaker_label") return false;
              if (signal.count && signal.count > 0) return true;
              return false;
            })
            .slice(0, 2)
            .map(([key]: any) => {
              const mapped = SIGNAL_MAPPING[key] || { 
                title: key.replace(/_/g, ' '), 
                behavior: "해당 애착 성향을 나타내는 행동 반응이 관찰되었습니다.",
                reason: "애착 유형의 방어 기제가 대화 태도에 반영된 것으로 해석됩니다."
              };
              return {
                key,
                title: mapped.title,
                behavior: mapped.behavior,
                reason: mapped.reason
              };
            }) : [];

          return (
            <div className="space-y-8 mb-8">
              {/* ============================================================== */}
              {/* 01. 실제 대화 흐름 (Conversation Flow) */}
              {/* ============================================================== */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-black text-zinc-900">01. 실제 대화 흐름</h3>
                  <span className="text-[11px] font-semibold text-zinc-400">캡처에서 확인된 주요 장면</span>
                </div>

                <div className="space-y-3.5">
                  {keySituations.length > 0 ? (
                    keySituations.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-[12px] shrink-0">
                            {idx + 1}
                          </span>
                          <strong className="text-[14px] text-zinc-900 font-bold leading-snug">{cleanText(item.situation)}</strong>
                        </div>

                        <div className="bg-zinc-50/90 p-3.5 rounded-xl border border-zinc-100 space-y-2 text-[12.5px] leading-relaxed">
                          {item.target_behavior && (
                            <div>
                              <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">{targetName}의 반응</span>
                              <p className="font-medium text-zinc-800">{cleanText(item.target_behavior)}</p>
                            </div>
                          )}
                          {item.interaction_result && (
                            <div className="pt-2 border-t border-zinc-200/60">
                              <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">대화 결과</span>
                              <p className="text-zinc-600">{cleanText(item.interaction_result)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </span>
                        <strong className="text-[13.5px] text-zinc-900 font-bold">대화 전반 요약</strong>
                      </div>
                      <p className="text-[13px] text-zinc-700 leading-relaxed font-medium">
                        {relationshipContext || "일상적인 메시지 교류와 일정 조율이 이루어졌으며, 급격한 갈등이나 일방적인 단절 없이 대화가 이어졌습니다."}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ============================================================== */}
              {/* 02. 가능한 해석 (Plausible Interpretations) */}
              {/* ============================================================== */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-black text-zinc-900">02. 가능한 해석</h3>
                  <span className="text-[11px] font-semibold text-zinc-400">대화 장면에 근거한 분석</span>
                </div>

                <div className="space-y-3.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-[11px] shrink-0">
                          {idx + 1}
                        </span>
                        <strong className="text-[14px] text-zinc-900 font-bold">{item.title}</strong>
                      </div>

                      <div className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 text-[12.5px] leading-relaxed text-zinc-700">
                        <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 mb-1">
                          <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          </svg>
                          관찰된 행동 양상
                        </span>
                        <p className="font-medium text-zinc-800">{cleanText(item.behavior)}</p>
                      </div>

                      <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-3.5 text-zinc-700 text-[12.5px] leading-relaxed">
                        <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11.5px] mb-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>해석한 이유</span>
                        </div>
                        <p>{cleanText(item.reason)}</p>
                      </div>
                    </div>
                  ))}

                  {/* 심리 분석가의 관찰 포인트 */}
                  <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-2xl p-4 text-[12.5px] leading-relaxed text-zinc-700 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[12px]">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <span>심리 분석가의 관찰 포인트</span>
                    </div>
                    <p>
                      이번 대화에서 나타난 거리두기나 대화 미루기 반응은 {targetName}의 기질적인 회피 애착 성향일 수도 있지만, 당시 극심한 피로나 스트레스로 인한 일시적인 감정 과부하(에너지 고갈) 상태였을 가능성도 함께 고려해야 합니다.
                    </p>
                    <p className="text-zinc-600 text-[12px] pt-1 border-t border-indigo-100/60 mt-1">
                      감정이 가라앉은 뒤 {targetName}이 스스로 대화를 다시 이어오는지, 아니면 여전히 문제를 덮어두려 하는지를 함께 지켜보시면 상대방의 실제 애착 패턴을 훨씬 더 입체적이고 정확하게 파악하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ============================================================== */}
              {/* 03. 상황에 맞는 도움 하나 (Actionable Help) */}
              {/* ============================================================== */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-black text-zinc-900">03. 상황에 맞는 도움 하나</h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    요청하신 대화 핑퐁 점검 팁
                  </span>
                </div>

                <div className="bg-gradient-to-br from-blue-50/60 via-white to-zinc-50 p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-3.5">
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">대화 미루기·회피 패턴 끊기 솔루션</span>
                    <h4 className="text-[13.5px] font-bold text-zinc-800">
                      {targetName}이 "피곤하다", "지금은 얘기하고 싶지 않다"며 대화를 미루거나 거절할 때
                    </h4>
                  </div>

                  {/* 추천 말풍선 */}
                  <div className="bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-sm text-[13.5px] font-semibold leading-relaxed shadow-sm">
                    "지금 많이 지치고 피곤한 상태라면 편하게 쉬어. 대신 내일 저녁 8시쯤 다시 편하게 이야기하자. 언제 다시 얘기할 수 있을지만 정해줘."
                  </div>

                  {/* 효과 및 해석 */}
                  <div className="bg-white p-3.5 rounded-xl border border-zinc-200/70 text-[12.5px] text-zinc-600 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-zinc-800 font-bold mb-1">
                      <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <span>회피를 방지하는 '타임아웃 + 재개 시점 합의' 대화법</span>
                    </div>
                    <p>
                      피로나 스트레스를 이유로 대화를 미루는 상대에게 당장 대화를 요구하면 방어벽이 더 두꺼워집니다. 상대의 휴식 욕구를 온전히 인정해주되, '언제 다시 이야기할지 구체적인 시점'을 명확히 약속받으면 일방적인 회피로 흐르는 것을 막고 안전하게 대화를 재개할 수 있습니다.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}

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
