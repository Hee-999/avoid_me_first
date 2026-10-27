"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FinalAnalysis, getDimensionObservationText, getAnalysisUiPresentation } from "@/lib/analysis/types";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { PrintablePremiumReport } from "@/components/premium/PrintablePremiumReport";
import { ShareAliasModal } from "@/components/share/ShareAliasModal";
import { ShareResultCard } from "@/components/share/ShareResultCard";

const ATTACHMENT_TYPE_MAPPING: Record<string, { ko: string, desc: string, en: string }> = {
  "secure": { ko: "안정형", desc: "상대방과 갈등이 발생해도 감정을 안정적으로 조절하며 솔직하고 원만하게 소통하는 패턴이 나타났어요.", en: "Secure Attachment" },
  "preoccupied": { ko: "몰입/불안형", desc: "관계를 잃을까 불안해하면서, 상대의 반응에 따라 감정이 크게 흔들리는 패턴이 강하게 나타났어요.", en: "Preoccupied Attachment" },
  "dismissing": { ko: "거부-회피형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive Attachment" },
  "dismissive-avoidant": { ko: "거부-회피형", desc: "갈등이 생기면 감정적인 대화를 피하고, 혼자만의 시간을 가지며 거리를 두려는 패턴이 나타났어요.", en: "Dismissive-Avoidant" },
  "fearful": { ko: "공포-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful Attachment" },
  "fearful-avoidant": { ko: "공포-회피형", desc: "가까워지고 싶은 욕구와 상처받을까 두려워하는 마음이 충돌하여 예측하기 어려운 패턴이 나타났어요.", en: "Fearful-Avoidant" },
  "unclear": { ko: "판정 보류 (단서 부족)", desc: "제공된 대화에서 한 축 이상의 애착 신호를 평가할 기회가 부족하여 특정 유형으로 확정할 수 없습니다.", en: "Unclear / Insufficient Data" }
};

const SIGNAL_MAPPING: Record<string, { title: string, behavior: string, reason: string }> = {
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
    behavior: "감정 교류가 필요한 대화에서도 논리와 사실관계 위주로만 상황을 분석하려는 반응이 나타납니다.", 
    reason: "감정을 느끼는 대신 이성적 사고의 틀 안에서 방어하려는 태도입니다." 
  },
  "topic_shifting": { 
    title: "화제 전환", 
    behavior: "불편한 감정이나 갈등 주제가 언급되면 자연스럽게 다른 일상 이야기로 대화의 방향을 돌리는 양상이 나타납니다.", 
    reason: "갈등 국면에 오래 머무르는 것을 피하고자 대화의 흐름을 분산시키는 반응입니다." 
  },
  "validating_emotions": { 
    title: "감정적 수용", 
    behavior: "상대방의 감정을 있는 그대로 인정하고 수용하는 차분하고 안정적인 대화 태도가 관찰됩니다.", 
    reason: "감정의 차이를 안전하게 수용할 수 있는 안정된 심리적 기반을 가지고 있습니다." 
  },
  "AV02": { 
    title: "갈등 상황 대화 철수", 
    behavior: "갈등이나 문제 제기 상황에서 즉각적인 감정 표현을 피하고 대화 접점을 일방적으로 닫는 태도가 포착되었습니다.", 
    reason: "갈등의 감정적 압박으로부터 자신을 보호하기 위해 물리적·심리적 거리를 확보하려는 회피 반응입니다." 
  },
  "AV03": { 
    title: "친밀감 거리두기", 
    behavior: "상대가 깊은 애정 표현이나 정서적 밀착을 요구할 때 심리적 부담을 느끼고 방어적인 태도를 보이는 경향이 나타납니다.", 
    reason: "자신의 자율성과 독립성이 침해받는다고 느껴 방어막을 형성하려는 태도입니다." 
  },
  "AV04": { 
    title: "과도한 자기의존", 
    behavior: "어려운 상황에서도 상대에게 도움이나 감정을 터놓지 않고 혼자 해결하려는 반응이 관찰되었습니다.", 
    reason: "타인에게 의지하는 것을 위험하거나 취약한 것으로 인식하는 방어 기제입니다." 
  },
  "AV05": { 
    title: "감정 축소 및 차단", 
    behavior: "상대방의 서운함이나 감정적 표현을 '별일 아닌 것'으로 축소하거나 이성적 잣대로만 평가하려는 양상이 보입니다.", 
    reason: "상대의 격한 감정에 직면했을 때 생기는 내적 긴장을 억누르기 위한 무의식적 차단 반응입니다." 
  },
  "AN01": { 
    title: "거절 및 이별 우려", 
    behavior: "상대방의 사소한 태도 변화에도 관계가 단절될 수 있다는 염려와 위기감을 강하게 표현하는 경향이 나타납니다.", 
    reason: "거절에 대한 두려움으로 인해 관계의 안전성을 지속적으로 확인받고자 하는 불안 반응입니다." 
  },
  "AN02": { 
    title: "반복적 관계 확인 요구", 
    behavior: "상대방의 애정과 관심을 거듭 확인하려 하며, 즉각적인 확답이 없을 때 초조해하는 반응이 관찰됩니다.", 
    reason: "애착 대상과의 정서적 연결이 유지되고 있는지 안도감을 얻으려는 시도입니다." 
  },
  "AN03": { 
    title: "반응 변화 과잉 민감성", 
    behavior: "답장의 지연 시간이나 메시지 어투의 미세한 변화를 관계 이상 신호로 과잉 해석하는 경향이 관찰됩니다.", 
    reason: "상대의 침묵이나 거리두기를 감정적 거절로 직결시켜 과잉 방어하는 패턴입니다." 
  }
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

  const [isRetryingReport, setIsRetryingReport] = useState(false);

  const handleRetryReport = async () => {
    if (isRetryingReport) return;
    setIsRetryingReport(true);
    try {
      const res = await fetch(`/api/premium/retry/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "리포트 재생성에 실패했습니다.");
      }
      await fetchAnalysis();
    } catch (err: any) {
      alert(err.message || "리포트 재생성 중 오류가 발생했습니다.");
    } finally {
      setIsRetryingReport(false);
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

  const { attachment_dimensions, attachment_fitness, primary_type, secondary_type, is_mixed_pattern, signals, primary_type_confidence, target_speaker_label, derived_context } = analysis;
  const contextIntake = derived_context?.context_intake;

  const uiPres = getAnalysisUiPresentation({
    primaryType: primary_type,
    anxietyScore: attachment_dimensions?.anxiety ?? 0,
    avoidanceScore: attachment_dimensions?.avoidance ?? 0,
    anxietyStatus: attachment_dimensions?.anxiety_status,
    avoidanceStatus: attachment_dimensions?.avoidance_status,
    speakerLabel: target_speaker_label || "상대방"
  });

  const isAnxietyInsufficient = attachment_dimensions?.anxiety_status === "insufficient";
  const isAvoidanceInsufficient = attachment_dimensions?.avoidance_status === "insufficient";

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
      link.download = 'lovepattern-report.png';
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

    // [개발/테스트용 바이패스]: 로컬 개발 환경(NODE_ENV !== 'production')이거나 관리자 secret이 있을 때만 허용 (프로덕션 일반 유저 차단)
    const isDev = process.env.NODE_ENV !== 'production';
    const isTestParam = searchParams.get('test') === 'true' || searchParams.get('bypass') === 'true';
    const adminSecret = searchParams.get('secret');

    if ((isDev && isTestParam) || adminSecret) {
      try {
        setIsPaymentProcessing(true);
        const unlockUrl = adminSecret 
          ? `/api/premium/unlock/${id}?secret=${encodeURIComponent(adminSecret)}` 
          : `/api/premium/unlock/${id}`;
        const res = await fetch(unlockUrl, { method: 'POST' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "테스트 잠금 해제에 실패했습니다.");
        }
        await fetchAnalysis();
      } catch (err: any) {
        alert(err.message || "테스트 잠금 해제 중 오류가 발생했습니다.");
      } finally {
        setIsPaymentProcessing(false);
      }
      return;
    }

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
            {uiPres.headlinePrefix && (
              <>
                {uiPres.headlinePrefix}<br/>
              </>
            )}
            <span className={uiPres.mode === "insufficient_all" ? "text-zinc-600" : "text-blue-600"}>
              {uiPres.headlineMain}
            </span>
            {uiPres.headlineSuffix}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-400 font-semibold tracking-wide uppercase">
            {uiPres.subEn}
          </p>
          
          <div className="mt-4 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
            <p className="text-[14px] text-zinc-700 leading-relaxed font-medium">
              {uiPres.description}
            </p>
          </div>

          {uiPres.mode === "standard" && is_mixed_pattern && (
            <p className="mt-4 text-[13px] text-zinc-500 font-medium bg-zinc-100 p-3 rounded-lg inline-block">
              *보조 유형인 <strong className="text-zinc-700">{secondary_type}</strong> 성향도 혼재되어 나타납니다.
            </p>
          )}
        </motion.div>

        {/* FREE: 2D Fitness Score Board - Only render when valid scores/signals exist */}
        {uiPres.showFitnessBars && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
            <h3 className="text-[14px] font-bold text-zinc-700 mb-5">유형별 행동 적합도</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={primary_type === "안정형" ? "text-blue-600 font-bold" : "text-zinc-600"}>안정형</span>
                  <span className="text-zinc-900">{attachment_fitness.secure}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.secure}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-400 rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={uiPres.mode === "anxiety_dominant" || primary_type === "몰입/불안형" ? "text-blue-600 font-bold" : "text-zinc-600"}>몰입/불안형</span>
                  {isAnxietyInsufficient ? (
                    <span className="text-zinc-500 font-semibold bg-zinc-100 px-2 py-0.5 rounded text-[11px] border border-zinc-200/60">상황 미발생</span>
                  ) : (
                    <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  {isAnxietyInsufficient ? (
                    <div className="h-full bg-zinc-200/40 rounded-full w-full" />
                  ) : (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.preoccupied}%` }} transition={{ duration: 1 }} className="h-full bg-amber-400 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={uiPres.mode === "avoidance_dominant" || primary_type === "거부-회피형" ? "text-blue-600 font-bold" : "text-zinc-600"}>거부-회피형</span>
                  {isAvoidanceInsufficient ? (
                    <span className="text-zinc-500 font-semibold bg-zinc-100 px-2 py-0.5 rounded text-[11px] border border-zinc-200/60">상황 미발생</span>
                  ) : (
                    <span className="text-zinc-900 font-bold">{attachment_fitness.dismissing}%</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  {isAvoidanceInsufficient ? (
                    <div className="h-full bg-zinc-200/40 rounded-full w-full" />
                  ) : (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.dismissing}%` }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1.5">
                  <span className={primary_type === "공포-회피형" ? "text-blue-600 font-bold" : "text-zinc-600"}>공포-회피형</span>
                  <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${attachment_fitness.fearful}%` }} transition={{ duration: 1 }} className="h-full bg-indigo-500 rounded-full" />
                </div>
              </div>

              {(isAnxietyInsufficient || isAvoidanceInsufficient) && (
                <div className="mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 font-medium leading-relaxed">
                  {isAnxietyInsufficient && (
                    <p>* 대화 내 불안 자극 상황이 나타나지 않아 <strong>불안 관련 지표는 추가 관찰이 필요</strong>합니다.</p>
                  )}
                  {isAvoidanceInsufficient && (
                    <p>* 대화 내 갈등 회피 상황이 나타나지 않아 <strong>회피 관련 지표는 추가 관찰이 필요</strong>합니다.</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-5 border-t border-zinc-100 flex justify-between">
              <div className="text-center">
                <span className="block text-[11px] text-zinc-400 font-bold mb-1">불안 지표</span>
                {attachment_dimensions.anxiety_status === "insufficient" ? (
                  <span className="block text-[14px] font-bold text-zinc-400 py-0.5">상황 미발생</span>
                ) : (
                  <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.anxiety} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
                )}
              </div>
              <div className="w-px bg-zinc-100" />
              <div className="text-center">
                <span className="block text-[11px] text-zinc-400 font-bold mb-1">회피 지표</span>
                {attachment_dimensions.avoidance_status === "insufficient" ? (
                  <span className="block text-[14px] font-bold text-zinc-400 py-0.5">상황 미발생</span>
                ) : (
                  <span className="block text-[18px] font-black text-zinc-800">{attachment_dimensions.avoidance} <span className="text-[12px] font-medium text-zinc-400">/ 100</span></span>
                )}
              </div>
            </div>
          </motion.div>
        )}

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

            // 1. English speaker placeholder replacement with grammatically correct postpositions
            res = res
              .replace(/SPEAKER_A(?:는|은)/g, `${targetName}${josaEun}`)
              .replace(/SPEAKER_A(?:가|이)/g, `${targetName}${josaI}`)
              .replace(/SPEAKER_A(?:를|을)/g, `${targetName}${josaEul}`)
              .replace(/SPEAKER_A(?:와|과)/g, `${targetName}${josaGwa}`)
              .replace(/SPEAKER_A/g, targetName)
              .replace(/SPEAKER_B(?:는|은)/g, "나는")
              .replace(/SPEAKER_B(?:가|이)/g, "내가")
              .replace(/SPEAKER_B(?:를|을)/g, "나를")
              .replace(/SPEAKER_B(?:와|과)/g, "나와")
              .replace(/SPEAKER_B/g, "나")
              .replace(/The other person/gi, targetName)
              .replace(/the other person/gi, targetName);

            // 2. targetName-specific postposition normalization
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

            // 3. Global postposition correction for '상대방'
            res = res
              .replace(/상대방는/g, "상대방은")
              .replace(/상대방가/g, "상대방이")
              .replace(/상대방를/g, "상대방을")
              .replace(/상대방와/g, "상대방과")
              .replace(/상대방로/g, "상대방으로");

            return res.trim();
          };

          const keySituations = Array.isArray(derived_context?.key_situations) ? derived_context.key_situations : [];
          const relationshipContext = cleanText(derived_context?.relationship_context);

          // Extract observed signals from signals object
          const items = signals ? Object.entries(signals)
            .filter(([key, signal]: any) => {
              if (!signal) return false;
              if (key === "dimensions" || key === "target_speaker_label") return false;
              if (signal.v && signal.v > 0) return true;
              if (signal.count && signal.count > 0) return true;
              if (Array.isArray(signal.evidence_quotes) && signal.evidence_quotes.length > 0) return true;
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

          const desired = contextIntake?.desired_focus || "";

          // Check specific signal types to provide hyper-contextual advice
          const hasAV02 = items.some(it => it.key === "AV02") || (signals?.AV02 && ((signals.AV02.v && signals.AV02.v > 0) || (signals.AV02.count && signals.AV02.count > 0)));
          const hasStonewalling = items.some(it => it.key === "stonewalling") || (signals?.stonewalling && ((signals.stonewalling.v && signals.stonewalling.v > 0) || (signals.stonewalling.count && signals.stonewalling.count > 0)));
          const hasAV05 = items.some(it => it.key === "AV05" || it.key === "dismissing_emotions");
          const hasAN01 = items.some(it => it.key === "AN01" || it.key === "over_texting" || it.key === "demanding_reassurance");

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
                        {relationshipContext || "대화 장면 요약을 충분히 확인하지 못했어요. 이 안내만으로 대화의 상태를 판단하지는 않았어요."}
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
                  {items.length > 0 ? (
                    <>
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

                      {/* 심리 분석가의 관찰 포인트: 면피성 단정 불가 멘트가 아닌 실질적 임상 분별 가이드 */}
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
                    </>
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-3.5">
                      <div className="space-y-2 text-[13px] text-zinc-700 leading-relaxed font-medium">
                        <p>
                          {uiPres.description}
                        </p>
                        <p className="text-zinc-600">
                          유형 판정과 별개로, 위에 정리된 실제 장면과 선택하신 고민을 바탕으로 대화의 의미와 다음 표현을 살펴볼 수 있어요.
                        </p>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 text-[12px] text-zinc-600 leading-relaxed space-y-1">
                        <strong className="text-zinc-800 block text-[12.5px]">💡 더 구체적인 대화 상담을 위한 안내</strong>
                        <p>
                          사람의 진짜 애착 방어기제는 평소의 일상 모습보다 <strong>서운함을 표현했을 때, 갈등이 생겼을 때, 연락이 어긋났을 때</strong> 명확하게 드러납니다.
                        </p>
                        <p className="text-zinc-500 text-[11.5px] pt-1">
                          상대방에게 답답함이나 거리감을 느꼈던 당시의 대화를 추가로 분석하시면 고민하신 반응의 맥락을 더 구체적으로 살펴볼 수 있습니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ============================================================== */}
              {/* 03. 상황에 맞는 도움 하나 (Actionable Help) */}
              {/* ============================================================== */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-black text-zinc-900">03. 상황에 맞는 도움 하나</h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {(() => {
                      if (desired.includes("답할지")) return "요청하신 추천 발화 팁";
                      if (desired.includes("관계 패턴")) return "요청하신 대화 핑퐁 점검 팁";
                      if (desired.includes("대화의 의미")) return "요청하신 상대방 태도 해석 팁";
                      if (desired.includes("앞으로")) return "요청하신 향후 관찰 가이드";
                      return "즉시 실천 대화 팁";
                    })()}
                  </span>
                </div>

                {(() => {
                  let advice = {
                    title: "상황별 맞춤 소통 제안",
                    situation: `${targetName}과 일상적인 약속이나 대화를 주고받을 때`,
                    quote: "네 일정 편하게 확인해보고 언제든 편할 때 알려줘!",
                    reasonTitle: "왜 이 표현이 효과적일까요?",
                    reason: "일상적인 일정 조율에서는 상대방에게 시간적 여유와 자율성을 줄 때 관계의 편안함과 호감이 자연스럽게 높아집니다."
                  };

                  if (items.length === 0) {
                    // 일상 조율 / 스몰토크 상황에 맞는 현실적인 팁
                    if (desired.includes("관계 패턴")) {
                      advice = {
                        title: "일정·연락 조율 시 대화 핑퐁 팁",
                        situation: `${targetName}과의 약속 일정이 자주 변경되거나 조율이 길어질 때`,
                        quote: "이번 주는 바쁜 것 같으니, 다음 주 편한 요일 2~3개 알려주면 내가 맞출게!",
                        reasonTitle: "선택지 좁히기 대화법의 효과",
                        reason: "일정 변경이 잦을 때 매번 건별로 되묻기보다 선택지를 2~3개로 좁혀서 제시해주면, 상대방의 일정 결정 피로도를 덜어주면서 대화가 늘어지는 것을 자연스럽게 방지할 수 있습니다."
                      };
                    } else if (desired.includes("대화의 의미")) {
                      advice = {
                        title: "일상 대화에서의 반응 태도 해석",
                        situation: `${targetName}이 사유를 설명하며 양해를 구하거나 화제를 나눌 때`,
                        quote: "상대방이 일정 사유를 밝히고 대안을 묻는 것은 관계에 대한 성의와 협조적인 태도를 나타냅니다.",
                        reasonTitle: "이것이 의미하는 바는?",
                        reason: "진짜 애착 회피 성향은 무응답이나 일방적인 잠수로 이어집니다. 반면 대화 속에서 사유를 구체적으로 밝히고 양해를 구하는 것은 현실적인 일정 제약에 따른 자연스러운 협조 반응입니다."
                      };
                    } else if (desired.includes("앞으로")) {
                      advice = {
                        title: "향후 관계 진전을 위한 관찰 포인트",
                        situation: `앞으로 ${targetName}과의 관계 깊이를 가늠해보고 싶을 때`,
                        quote: "가벼운 개인적 고민이나 부탁을 먼저 부드럽게 건네보세요.",
                        reasonTitle: "이것을 지켜보아야 하는 이유",
                        reason: "일상적인 스몰토크와 달리, 약간의 감정적 나눔이나 의지하는 대화를 건넸을 때 상대가 적극적으로 공감하고 다가오는지, 아니면 부담을 느끼고 화제를 돌리는지가 상대의 실제 애착 안정도를 확인하는 결정적 계기가 됩니다."
                      };
                    } else {
                      advice = {
                        title: "부담을 덜어주는 일상 답장 표현",
                        situation: `${targetName}과 일상적인 약속이나 만남을 조율할 때`,
                        quote: "일정 편하게 확인해보고 네가 여유 있을 때 천천히 알려줘!",
                        reasonTitle: "왜 이 표현이 효과적일까요?",
                        reason: "일정 조율 상황에서 즉각적인 확답을 재촉하지 않고 여유를 줄 때, 상대방은 심리적 압박 없이 편안하게 일정을 정리하여 답장할 수 있습니다."
                      };
                    }
                  } else {
                    // 실제 방어 신호가 관찰된 상황에 맞는 정밀 맞춤 팁
                    const norm = (primary_type || "").toLowerCase();

                    // CASE 1: 상대방이 피로/거절을 이유로 대화를 미루거나 철수할 때 (AV02 감지)
                    if (hasAV02) {
                      if (desired.includes("관계 패턴")) {
                        advice = {
                          title: "대화 미루기·회피 패턴 끊기 솔루션",
                          situation: `${targetName}이 "피곤하다", "지금은 얘기하고 싶지 않다"며 대화를 미루거나 거절할 때`,
                          quote: "지금 많이 지치고 피곤한 상태라면 편하게 쉬어. 대신 내일 저녁 8시쯤 다시 편하게 이야기하자. 언제 다시 얘기할 수 있을지만 정해줘.",
                          reasonTitle: "회피를 방지하는 '타임아웃 + 재개 시점 합의' 대화법",
                          reason: "피로나 스트레스를 이유로 대화를 미루는 상대에게 당장 대화를 요구하면 방어벽이 더 두꺼워집니다. 상대의 휴식 욕구를 온전히 인정해주되, '언제 다시 이야기할지 구체적인 시점'을 명확히 약속받으면 일방적인 회피로 흐르는 것을 막고 안전하게 대화를 재개할 수 있습니다."
                        };
                      } else if (desired.includes("대화의 의미")) {
                        advice = {
                          title: "대화 거절·피로 호소의 숨은 심리",
                          situation: `${targetName}이 "피곤하다"며 대화를 피하는 진짜 속마음이 궁금할 때`,
                          quote: "감정적 대화에 직면했을 때 느끼는 피로는 갈등 압박을 감당하기 어려워 셔터를 내리는 무의식적 에너지 절약 신호입니다.",
                          reasonTitle: "단순한 핑계나 무관심이 아닌 이유",
                          reason: "회피 성향의 사람은 감정적 갈등 상황에서 극심한 심리적 에너지 소모를 겪습니다. '피곤하다'는 말은 관계에 대한 거절이라기보다 감정적 과부하 상태에서 자신을 보호하기 위한 일시적 방어입니다."
                        };
                      } else if (desired.includes("앞으로")) {
                        advice = {
                          title: "대화 미루기 후 핵심 관찰 포인트",
                          situation: `대화를 미루는 ${targetName}과의 관계에서 진심을 가늠해보고 싶을 때`,
                          quote: "대화가 중단된 다음 날이나 감정이 가라앉은 후, 상대가 먼저 대화를 복원하려 노력하는지 확인해보세요.",
                          reasonTitle: "진짜 회피 성향과 일시적 피로를 가르는 기준",
                          reason: "당시 대화를 미룬 것이 일시적 피로 때문이었다면 에너지가 충전된 후 스스로 관계를 복원합니다. 반면 며칠간 아무 일 없었다는 듯 덮어두려 한다면 만성적인 갈등 회피 패턴일 가능성이 높습니다."
                        };
                      } else {
                        advice = {
                          title: "대화 미루기에 부담을 덜어주는 답장 제안",
                          situation: `${targetName}이 피로를 호소하며 대화를 내일로 미루거나 멈추려 할 때`,
                          quote: "오늘 하루 고생 많았어. 푹 쉬고, 내일 저녁 편할 때 언제든 연락 줘!",
                          reasonTitle: "부담을 낮추고 자발적 복귀를 유도하는 효과",
                          reason: "대화를 회피하려는 상대에게 조급하게 캐묻기보다, 상대의 에너지가 회복될 시간을 주고 스스로 연락해오도록 신뢰를 보내는 것이 효과적입니다."
                        };
                      }
                    } else if (hasStonewalling) {
                      // CASE 2: 침묵 / 무응답 / 잠수 (Stonewalling 감지)
                      if (desired.includes("관계 패턴")) {
                        advice = {
                          title: "침묵·단절 패턴 끊기 솔루션",
                          situation: `${targetName}과의 대화가 갈등 상황에서 침묵이나 무응답으로 이어질 때`,
                          quote: "우리가 이런 순간마다 대화가 뚝 끊기는 것 같아. 서로 다그치지 않고 천천히 감정을 나눠보고 싶어.",
                          reasonTitle: "반복을 끊는 메타 대화법의 효과",
                          reason: "침묵이 반복될 때는 대화 내용 자체를 따지기보다 '대화가 멈추는 패턴 자체'를 부드럽게 짚어내는 메타 대화가 가장 효과적입니다."
                        };
                      } else if (desired.includes("대화의 의미")) {
                        advice = {
                          title: "침묵·단답의 심리적 의도",
                          situation: `${targetName}이 감정적 질문에 입을 닫거나 단답으로 일관할 때`,
                          quote: "침묵은 상대를 무시하려는 것이 아니라, 통제 불가능한 감정 폭발을 막기 위해 스스로 내벽을 치는 방어 반응입니다.",
                          reasonTitle: "침묵의 이면에 숨은 의도",
                          reason: "회피형 상대는 갈등 상황에서 어떻게 반응해야 할지 모를 때 침묵을 택합니다. 침묵은 적대감이 아니라 자신을 지키기 위한 방패입니다."
                        };
                      } else {
                        advice = {
                          title: "침묵 상황에서의 완화 답장 제안",
                          situation: `${targetName}이 갈등 후 대화를 회피하거나 입을 닫을 때`,
                          quote: "지금 당장 대답하지 않아도 괜찮아. 네가 편할 때 저녁 8시쯤 천천히 얘기하자.",
                          reasonTitle: "왜 이 표현이 효과적일까요?",
                          reason: "거리두기 성향의 상대는 감정적 압박을 느낄 때 방어기제로 대화를 일방 중단합니다. 응답 시간에 여유를 주고 자율성을 보장해주면 심리적 안전감을 느껴 대화로 복귀할 가능성이 높아집니다."
                        };
                      }
                    } else if (hasAV05) {
                      // CASE 3: 감정 축소 및 무시 (AV05 감지)
                      if (desired.includes("관계 패턴")) {
                        advice = {
                          title: "감정 차단 패턴 끊기 솔루션",
                          situation: `${targetName}이 감정적 서운함을 "별일 아니다", "예민하다"며 축소할 때`,
                          quote: "네 눈엔 사소해 보일 수 있지만, 나한테는 마음이 쓰이는 일이라 꼭 편하게 얘기 나눠보고 싶었어.",
                          reasonTitle: "비난 없이 내 감정의 가치를 지키는 'I-Message'",
                          reason: "상대의 축소 태도에 화를 내면 논쟁으로 번집니다. 상대의 판단을 탓하지 않고 '나에게 이것이 왜 의미가 있는지' 내 감정에 집중해 전달하면 상대도 방어를 누그러뜨립니다."
                        };
                      } else {
                        advice = {
                          title: "감정 논쟁을 방지하는 답장 제안",
                          situation: `${targetName}이 감정 문제를 논리적으로만 따지려 할 때`,
                          quote: "네 말이 논리적으로 맞을 수 있어. 다만 내가 그때 속상했던 마음에 조금만 공감해주면 정말 고마울 것 같아.",
                          reasonTitle: "논리와 감정을 분리하는 효과",
                          reason: "상대의 이성적 분석을 인정해주면서 공감 영역을 부드럽게 요청하면, 상대를 방어적 반박에서 벗어나 공감 모드로 전환할 수 있습니다."
                        };
                      }
                    } else if (hasAN01 || norm.includes("preoccup") || norm.includes("불안") || norm.includes("몰입")) {
                      // CASE 4: 불안 / 재촉 / 관계 확인 (불안 성향)
                      advice = {
                        title: "불안 자극을 줄여주는 답장 제안",
                        situation: `${targetName}이 불안해하며 즉각적인 확인과 연락을 요구할 때`,
                        quote: "내가 지금 중요한 일 처리 중이라 30분 뒤에 바로 연락할게! 우리 사이 문제없으니 안심해.",
                        reasonTitle: "왜 이 표현이 효과적일까요?",
                        reason: "불안형 상대는 침묵이나 지연을 거절로 오해합니다. 구체적인 재연락 시점과 관계가 안전하다는 확신을 먼저 제공하면 불안 반응이 빠르게 안정됩니다."
                      };
                    } else {
                      // CASE 5: 일반 회피형 기본 팁
                      if (desired.includes("관계 패턴")) {
                        advice = {
                          title: "반복되는 패턴 끊기 솔루션",
                          situation: `${targetName}과의 대화가 갈등 상황에서 겉돌거나 침묵으로 이어질 때`,
                          quote: "우리가 이런 순간마다 대화가 뚝 끊기는 것 같아. 서로 어떤 감정인지 다그치지 않고 천천히 얘기해보고 싶어.",
                          reasonTitle: "반복을 끊는 메타 대화법의 효과",
                          reason: "반복되는 갈등 패턴을 끊을 때는 대화 내용을 따지기보다 '대화가 멈추는 패턴 자체'를 함께 짚어내는 메타 대화가 가장 효과적입니다."
                        };
                      } else {
                        advice = {
                          title: "감정적 압박을 낮추는 답장 제안",
                          situation: `${targetName}이 갈등 후 대화를 회피하거나 입을 닫을 때`,
                          quote: "지금 당장 대답하지 않아도 괜찮아. 네가 편할 때 저녁 8시쯤 천천히 얘기하자.",
                          reasonTitle: "왜 이 표현이 효과적일까요?",
                          reason: "거리두기 성향의 상대는 감정적 압박을 느낄 때 방어기제로 대화를 일방 중단합니다. 응답해야 하는 시간에 여유를 주고 자율성을 보장해주면, 심리적 안전감을 느껴 스스로 대화로 복귀할 가능성이 높아집니다."
                        };
                      }
                    }
                  }

                  return (
                    <div className="bg-gradient-to-br from-blue-50/60 via-white to-zinc-50 p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-3.5">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-400 block mb-1">{advice.title}</span>
                        <h4 className="text-[13.5px] font-bold text-zinc-800">
                          {cleanText(advice.situation)}
                        </h4>
                      </div>

                      {/* 추천 말풍선 */}
                      <div className="bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-sm text-[13.5px] font-semibold leading-relaxed shadow-sm">
                        "{cleanText(advice.quote)}"
                      </div>

                      {/* 효과 및 해석 */}
                      <div className="bg-white p-3.5 rounded-xl border border-zinc-200/70 text-[12.5px] text-zinc-600 leading-relaxed">
                        <div className="flex items-center gap-1.5 text-zinc-800 font-bold mb-1">
                          <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                          </svg>
                          <span>{advice.reasonTitle}</span>
                        </div>
                        <p>{cleanText(advice.reason)}</p>
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            </div>
          );
        })()}

        {/* FREE: 03. 무료 결과 공유 */}
        <div className="mb-8 flex gap-3 print:hidden">
          <button 
            onClick={() => handleExport('jpg')}
            disabled={isExporting}
            className="flex-1 py-3 bg-white text-zinc-900 border border-zinc-200 text-[13px] font-bold rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            이미지 저장
          </button>
          <button 
            onClick={handleShareClick}
            className="flex-1 py-3 bg-zinc-900 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-md shadow-zinc-200 cursor-pointer"
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
              onRetry={handleRetryReport}
              isRetrying={isRetryingReport}
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
