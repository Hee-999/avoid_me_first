"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FinalAnalysis } from "@/lib/analysis/types";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { PrintablePremiumReport } from "@/components/premium/PrintablePremiumReport";
import { ShareAliasModal } from "@/components/share/ShareAliasModal";
import { ShareResultCard } from "@/components/share/ShareResultCard";

const ATTACHMENT_TYPE_MAPPING: Record<string, { ko: string, desc: string, en: string }> = {
  "secure": { ko: "안정형", desc: "상대방과 갈등이 발생해도 감정을 안정적으로 조절하며 솔직하고 원만하게 소통하는 패턴이 나타났어요.", en: "Secure Attachment" },
  "preoccupied": { ko: "불안-몰입형", desc: "관계를 잃을까 불안해하면서, 상대의 반응에 따라 감정이 크게 흔들리는 패턴이 강하게 나타났어요.", en: "Preoccupied Attachment" },
  "dismissing": { ko: "회피-독립형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive Attachment" },
  "dismissive-avoidant": { ko: "회피-독립형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive-Avoidant" },
  "fearful": { ko: "불안-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful Attachment" },
  "fearful-avoidant": { ko: "불안-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful-Avoidant" }
};

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

export default function Result() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const [isPremium, setIsPremium] = useState(false);
  const [analysis, setAnalysis] = useState<FinalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'share' | 'image'>('share');
  const [shareAlias, setShareAlias] = useState("상대방");
  const reportRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/result/${id}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("이 분석 결과의 소유자가 아닙니다.");
        if (res.status === 404) throw new Error("존재하지 않는 분석 결과입니다.");
        throw new Error("서버 오류가 발생했습니다.");
      }
      const data = await res.json();
      setAnalysis(data.analysis);
      setIsPremium(prev => prev || data.premium_unlocked);
      if (data.share_enabled) setShareId(data.share_id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchAnalysis();

    // Alert payment error if exists
    const paymentError = searchParams.get('error');
    if (paymentError) {
      // Remove query param to prevent showing alert again on refresh
      window.history.replaceState({}, '', `/result/${id}`);
      setTimeout(() => alert(paymentError), 500);
    }
  }, [id, router, searchParams]);

  useEffect(() => {
    if (!id) return;

    // Polling logic if report is generating
    const interval = setInterval(() => {
      setAnalysis(prev => {
        if (prev && prev.status?.report === 'generating') {
          fetchAnalysis();
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm border border-zinc-200">
          <p className="text-red-500 font-bold mb-2">접근 불가</p>
          <p className="text-zinc-600 text-[14px]">{error}</p>
          <button onClick={() => router.push('/')} className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[13px] font-bold">홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  const { attachment_dimensions, attachment_fitness, primary_type, secondary_type, is_mixed_pattern, signals, primary_type_confidence, target_speaker_label } = analysis;

  const getMappedType = (rawType: string) => {
    const normalized = rawType.toLowerCase().replace(/[^a-z-]/g, '');
    for (const [key, val] of Object.entries(ATTACHMENT_TYPE_MAPPING)) {
      if (normalized.includes(key)) return val;
    }
    return { ko: rawType, desc: "대화 속에서 다양한 애착 성향이 혼재된 복합적인 패턴이 나타납니다.", en: rawType };
  };

  const mappedPrimary = getMappedType(primary_type);

  const handleExport = async (format: 'jpg' | 'pdf') => {
    setIsExporting(true);
    
    try {
      if (format === 'jpg') {
        if (!shareCardRef.current) return;
        setModalMode('image');
        setIsShareModalOpen(true);
        // We defer actual capture to after alias is set
      } else if (format === 'pdf') {
        window.print();
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("리포트 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const executeImageExport = async (alias: string) => {
    setShareAlias(alias);
    setIsShareModalOpen(false);
    setIsExporting(true);
    try {
      await new Promise(res => setTimeout(res, 500)); // wait for alias to render in hidden card
      if (!shareCardRef.current) return;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 1
      });
      const link = document.createElement('a');
      link.download = 'avoidance-report.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("이미지 저장에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareClick = () => {
    setModalMode('share');
    setIsShareModalOpen(true);
  };

  const executeShare = async (alias: string) => {
    setShareAlias(alias);
    setIsShareModalOpen(false);
    
    try {
      let currentShareId = shareId;
      if (!currentShareId) {
        const res = await fetch(`/api/share/${id}`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ share_alias: alias })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        currentShareId = data.share_token; // updated to share_token
        setShareId(currentShareId);
      }
      
      const shareUrl = `${window.location.origin}/share/${currentShareId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: "애착 유형 분석 결과",
          text: "AI가 분석한 상대의 애착 유형 결과를 확인해보세요.",
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("공유 링크가 복사되었습니다!");
      }
    } catch (err) {
      console.error(err);
      alert("공유하기에 실패했습니다.");
    }
  };

  const handleUnlock = async () => {
    if (isPaymentProcessing) return;
    try {
      setIsPaymentProcessing(true);
      // 1. Prepare payment
      const res = await fetch(`/api/premium/prepare/${id}`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "결제 준비 중 오류가 발생했습니다.");
      }

      // 2. Call NICEPAY
      if (!(window as any).AUTHNICE) {
        throw new Error("결제 모듈을 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
      (window as any).AUTHNICE.requestPay({
        clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
        method: 'card',
        orderId: data.orderId,
        amount: data.amount,
        goodsName: data.goodsName,
        returnUrl: `${baseUrl}/api/premium/callback`,
        fnError: function (result: any) {
          setIsPaymentProcessing(false);
          alert(result.errorMsg || "결제 중 오류가 발생했습니다.");
        }
      });

    } catch (err: any) {
      setIsPaymentProcessing(false);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">분석 결과 리포트</span>
          <button onClick={handleShareClick} className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -mr-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10" ref={reportRef}>
        
        {/* Confidence Warning */}
        {analysis.primary_type_confidence === "low" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
            <span className="text-red-500 mt-0.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></span>
            <div>
              <strong className="block text-[13px] font-bold text-red-800 mb-1">분석 근거 부족 (Low Coverage)</strong>
              <p className="text-[12px] text-red-600 leading-snug">제공된 대화의 양이 너무 적거나 갈등 상황이 충분하지 않아 정확한 분석이 어려울 수 있습니다.</p>
            </div>
          </div>
        )}

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
                <span className={primary_type === "안정형 (Secure)" ? "text-blue-600" : "text-zinc-600"}>안정형 (Secure)</span>
                <span className="text-zinc-900">{attachment_fitness.secure}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.secure}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-400 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className={primary_type === "몰입/불안형 (Preoccupied)" ? "text-blue-600" : "text-zinc-600"}>몰입/불안형 (Preoccupied)</span>
                <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.preoccupied}%` }} transition={{ duration: 1 }} className="h-full bg-amber-400 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className={primary_type === "거부-회피형 (Dismissive-Avoidant)" ? "text-blue-600" : "text-zinc-600"}>거부-회피형 (Dismissive)</span>
                <span className="text-zinc-900">{attachment_fitness.dismissing}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.dismissing}%` }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className={primary_type === "공포-회피형 (Fearful-Avoidant)" ? "text-blue-600" : "text-zinc-600"}>공포-회피형 (Fearful)</span>
                <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.fearful}%` }} transition={{ duration: 1 }} className="h-full bg-indigo-500 rounded-full" />
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
              .slice(0, 1)
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
                    <p className="text-[13px] text-zinc-600 leading-relaxed pl-8">
                      "{mappedSignal.desc}"
                    </p>
                  </div>
                );
              })}
          </div>
        </motion.div>

        {/* FREE: 03. 무료 결과 공유 */}
        <div className="mb-8 flex gap-3 print:hidden">
          <button 
            onClick={() => handleExport('jpg')}
            disabled={isExporting}
            className="flex-1 py-3 bg-white text-zinc-900 border border-zinc-200 text-[13px] font-bold rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            이미지 저장
          </button>
          <button 
            onClick={handleShareClick}
            className="flex-1 py-3 bg-zinc-900 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-md shadow-zinc-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            결과 링크 공유
          </button>
        </div>
        <p className="text-center text-[11px] text-zinc-400 mb-8 print:hidden">
          무료 분석 결과는 30일간 보관되며 기간이 지나면 자동 삭제됩니다.
        </p>

        {/* PREMIUM SECTIONS & PAYWALL */}
        <div className="relative">
          
          <div className="print:hidden">
            <PremiumReport 
              analysis={analysis} 
              isPremium={isPremium} 
              onRetry={() => {
                console.log("Retry requested");
              }}
              onUnlock={handleUnlock}
              isProcessing={isPaymentProcessing}
            />
          </div>

          <div className="hidden print:block">
            <PrintablePremiumReport analysis={analysis} isPremium={isPremium} />
          </div>
              
              {/* Export Buttons */}
              {isPremium && (analysis.status?.report === "completed" || analysis.status?.report === "ready") && (
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-200 print:hidden" data-html2canvas-ignore>
                  <p className="text-center text-[13px] font-bold text-zinc-500 mb-2">분석이 완료되었습니다</p>
                  <p className="text-center text-[12px] text-zinc-400 mb-2 leading-relaxed">구매한 상세 분석 보고서는 1년간 다시 확인할 수 있습니다.<br/>장기 보관을 원하시면 PDF로 저장해주세요.</p>
                  
                  <button 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full py-3.5 bg-blue-50 text-blue-700 text-[14px] font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    PDF로 저장하기
                  </button>

                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/report/archive/${id}`, { method: 'POST' });
                        const data = await res.json();
                        if (data.error) throw new Error(data.error);
                        
                        const archiveUrl = `${window.location.origin}/report/${data.report_token}`;
                        await navigator.clipboard.writeText(archiveUrl);
                        alert("보고서 다시보기 링크가 복사되었습니다!");
                      } catch (err) {
                        console.error(err);
                        alert("링크 생성에 실패했습니다.");
                      }
                    }}
                    disabled={isExporting}
                    className="w-full py-3.5 bg-zinc-100 text-zinc-800 text-[14px] font-bold rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 border border-zinc-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    내 보고서 다시보기 링크 복사
                  </button>
                  <p className="text-center text-[11px] text-zinc-400 mt-1">이 링크를 가진 사람은 보고서를 볼 수 있습니다. 외부에 공개하지 마세요.</p>
                </div>
              )}
          </div>

      </main>

      <ShareAliasModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        onShare={(alias) => {
          if (modalMode === 'share') executeShare(alias);
          else executeImageExport(alias);
        }} 
        originalName={target_speaker_label || "상대방"}
      />
      
      <div className="absolute top-[-9999px] left-[-9999px]">
        <ShareResultCard ref={shareCardRef} analysis={analysis} alias={shareAlias} />
      </div>
    </div>
  );
}
