"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FinalAnalysis, getDimensionObservationText, getAnalysisUiPresentation } from "@/lib/analysis/types";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { PrintablePremiumReport } from "@/components/premium/PrintablePremiumReport";
import { ShareAliasModal } from "@/components/share/ShareAliasModal";
import { PremiumPurchasePrompt } from "@/components/premium/PremiumPurchasePrompt";
import { PremiumChatSection } from "@/components/premium/PremiumChatSection";
import { ShareResultCard } from "@/components/share/ShareResultCard";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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
  const [postPayTel, setPostPayTel] = useState("");
  const [postPayStatus, setPostPayStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [postPayMsg, setPostPayMsg] = useState<string | null>(null);
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

  const startNicepayCheckout = async (orderType: "report" | "chat_topup", buyerTel?: string) => {
    try {
      setIsPaymentProcessing(true);
      const res = await fetch(`/api/premium/prepare/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          ...(buyerTel ? { buyerTel } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "결제 준비 중 오류가 발생했습니다.");
      }

      if (!(window as any).AUTHNICE) {
        throw new Error("결제 모듈을 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const baseUrl = (
        process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")
      ).replace(/\/+$/, "");

      (window as any).AUTHNICE.requestPay({
        clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
        method: "cardAndEasyPay",
        orderId: data.orderId,
        amount: data.amount,
        goodsName: data.goodsName,
        ...(data.buyerTel ? { buyerTel: data.buyerTel } : {}),
        returnUrl: `${baseUrl}/api/premium/callback`,
        fnError: function (result: any) {
          setIsPaymentProcessing(false);
          alert(result.errorMsg || "결제 중 오류가 발생했습니다.");
        },
      });
    } catch (err: any) {
      setIsPaymentProcessing(false);
      alert(err.message);
    }
  };

  const handleUnlock = async (buyerTel?: string) => {
    if (isPaymentProcessing) return;

    // [개발/테스트용 바이패스]: 로컬 개발 환경(NODE_ENV !== 'production')이거나 관리자 secret이 있을 때만 허용 (프로덕션 일반 유저 차단)
    const isDev = process.env.NODE_ENV !== "production";
    const isTestParam = searchParams.get("test") === "true" || searchParams.get("bypass") === "true";
    const adminSecret = searchParams.get("secret");

    if ((isDev && isTestParam) || adminSecret) {
      try {
        setIsPaymentProcessing(true);
        const unlockUrl = adminSecret
          ? `/api/premium/unlock/${id}?secret=${encodeURIComponent(adminSecret)}`
          : `/api/premium/unlock/${id}`;
        const res = await fetch(unlockUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyerTel }),
        });
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

    await startNicepayCheckout("report", buyerTel);
  };

  const handleSendPostPayAlimtalk = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = postPayTel.replace(/[^0-9]/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) {
      setPostPayStatus("error");
      setPostPayMsg("올바른 휴대폰 번호(010...)를 입력해주세요.");
      return;
    }
    setPostPayStatus("sending");
    setPostPayMsg(null);
    try {
      const res = await fetch(`/api/report/send-access/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerTel: digits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "발송에 실패했습니다.");
      setPostPayStatus("sent");
      setPostPayMsg("카카오톡으로 전용 링크와 열람 PIN 4자리를 발송했습니다!");
    } catch (err: any) {
      setPostPayStatus("error");
      setPostPayMsg(err.message || "발송 중 오류가 발생했습니다.");
    }
  };

  const handleTopupPay = async () => {
    if (isPaymentProcessing) return;
    await startNicepayCheckout("chat_topup");
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

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10 break-keep" ref={reportRef}>
        
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

        {isPremium && searchParams.get("topup") === "success" && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-[12.5px] font-semibold text-blue-900">
            ✅ 1:1 AI 질문권 3회가 추가 충전되었습니다! 하단 상담실에서 이어서 질문해 보세요.
          </div>
        )}

        {/* FREE/PAID: 01. V3 핵심 판독 & 쌍방 온도차 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full">
              {derived_context?.analysis_mode === "flirting" ? "💘 썸 · 호감도 판독" : "💔 재회 · 애매한 사이 판독"}
            </span>
            {target_speaker_label && (
              <span className="inline-block px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-bold rounded-full">
                대상: {target_speaker_label}
              </span>
            )}
          </div>

          <h1 className="text-[18px] sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug whitespace-nowrap">
            {target_speaker_label || "상대방"}의 진짜 속마음 &amp;{" "}
            <span className="text-blue-600">
              {derived_context?.analysis_mode === "flirting" ? "썸 온도차" : "재회 온도차"}
            </span>{" "}
            판독
          </h1>

          {/* V3 쌍방 온도차 & 성사 확률 카드 */}
          {(() => {
            const v3 = derived_context?.v3_metrics;
            const userTemp = v3?.user_temperature ?? 74;
            const targetTemp = v3?.target_temperature ?? 38;
            const backfire = v3?.backfire_risk_percent ?? 72;
            const successProb = v3?.success_probability ?? 46;
            const signalCount = v3?.signal_count ?? 2;
            const teaseScene = v3?.tease_scene_summary || "상대방의 답장 호흡과 감정 표현에서 미묘한 온도차가 포착되었습니다.";
            const targetName = target_speaker_label || "상대방";

            return (
              <div className="mt-4 space-y-3">
                {/* 1. 쌍방 온도차 게이지 (티저/공개) */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2 text-[11.5px] font-bold text-zinc-700 mb-2">
                    <span className="whitespace-nowrap">🌡️ 두 사람의 관계 온도차</span>
                    {isPremium ? (
                      <span className="text-blue-600 font-black whitespace-nowrap shrink-0">
                        {derived_context?.analysis_mode === "flirting" ? "썸 성사" : "재회"} 가능성 {successProb}%
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-extrabold whitespace-nowrap shrink-0">
                        🔒 상대 온도 잠금
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                      <span className="text-[11px] font-bold text-zinc-500 block">내 감정/몰입 온도</span>
                      <span className="text-[20px] font-black text-zinc-900">{userTemp}%</span>
                      <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${userTemp}%` }} />
                      </div>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                      <span className="text-[11px] font-bold text-zinc-500 block">{targetName}의 실제 온도</span>
                      {isPremium ? (
                        <>
                          <span className="text-[20px] font-black text-blue-600">{targetTemp}%</span>
                          <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${targetTemp}%` }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[20px] font-black text-zinc-400 select-none">🔒 ??%</span>
                          <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-300 rounded-full w-1/3 blur-[1px]" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {isPremium && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[12px]">
                      <span className="font-bold text-amber-800">⚠️ 성급한 연락 주의 지수</span>
                      <span className="font-black text-amber-600">{backfire}%</span>
                    </div>
                  )}
                </div>

                {/* 2. 소름 요약 1줄 + 위기감 경고 1줄 (무료 화면 티저 전용 — 유료 결제 후에는 아래 네이비 박스와 중복되므로 숨김) */}
                {!isPremium && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2.5">
                    <p className="text-[13.5px] text-zinc-800 leading-relaxed font-semibold">
                      📌 <span className="text-blue-700 font-bold">{teaseScene}</span>에서{" "}
                      <strong>핵심 심리 시그널 {signalCount}개</strong>가 동시에 포착되었습니다.
                    </p>
                    <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-3.5 py-2.5 text-[12.5px] font-bold text-amber-900 leading-snug">
                      💡 상대의 진짜 의도를 모른 채 섣불리 연락하면 대화가 더 멀어질 수 있어요{" "}
                      <span className="text-amber-700">(성급한 연락 주의 지수 {backfire}%)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </motion.div>

        {/* PAID BANNER + POST-PURCHASE ALIMTALK OPT-IN (점수 카드와 핵심 속마음 진단 사이) */}
        {isPremium && searchParams.get("paid") === "1" && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-[12.5px] text-emerald-950 space-y-2.5">
            <p className="font-bold">
              ✅ 결제가 완료되었습니다! 아래에서 심층 리포트와 1:1 AI 상담을 바로 확인하세요.
            </p>
            {postPayStatus === "sent" ? (
              <p className="text-[12px] font-bold text-emerald-700 bg-white rounded-xl px-3 py-2 border border-emerald-200">
                📩 {postPayMsg}
              </p>
            ) : (
              <form onSubmit={handleSendPostPayAlimtalk} className="space-y-2 pt-1">
                <p className="text-[12px] text-emerald-900 font-semibold">
                  창을 닫아도 다시 보시려면 카톡으로 전용 링크와 비밀 키(PIN 4자리)를 받아두세요.
                </p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={postPayTel}
                    onChange={(e) => setPostPayTel(e.target.value)}
                    placeholder="010-1234-5678"
                    className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2.5 text-[13px] text-zinc-900 outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={postPayStatus === "sending"}
                    className="px-4 py-2.5 bg-zinc-900 text-white text-[12.5px] font-bold rounded-xl hover:bg-zinc-800 transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {postPayStatus === "sending" ? "발송 중..." : "카톡 받기"}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800/90 leading-snug">
                  🔒 입력하신 번호는 다른 목적으로 쓰이지 않고, 리포트 링크 발송과 본인만 링크를 확인할 수 있도록 본인 확인용 비밀 키 발송에만 쓰입니다.
                </p>
                {postPayStatus === "error" && postPayMsg && (
                  <p className="text-[11.5px] font-bold text-red-600">{postPayMsg}</p>
                )}
              </form>
            )}
          </div>
        )}

        <PremiumPurchasePrompt analysis={analysis} onUnlock={handleUnlock} isProcessing={isPaymentProcessing} isPremium={isPremium} />

        {/* PREMIUM SECTIONS & PAYWALL */}
        <div id="premium-purchase-details" className="relative scroll-mt-6">
          
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

          {isPremium && (
            <PremiumChatSection
              analysisId={id}
              initialChat={(analysis.status as any)?.chat}
              targetLabel={target_speaker_label || "상대방"}
              analysisMode={derived_context?.analysis_mode || "reunion"}
              onTopupPay={handleTopupPay}
              isTopupProcessing={isPaymentProcessing}
            />
          )}

          <div className="hidden print:block">
            <PrintablePremiumReport analysis={analysis} isPremium={isPremium} />
          </div>
              
              {/* Archive Link Button */}
              {isPremium && (analysis.status?.report === "completed" || analysis.status?.report === "ready") && (
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-200 print:hidden" data-html2canvas-ignore>
                  <p className="text-center text-[13px] font-bold text-zinc-700 mb-1">분석 리포트 보관 안내</p>
                  <p className="text-center text-[12px] text-zinc-500 mb-2 leading-relaxed">
                    구매한 리포트와 1:1 상담 내역은 문자로 발송된 전용 링크(또는 홈 화면 조회)로 1년간 언제든 다시 확인할 수 있습니다.
                  </p>

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
                    className="w-full py-3.5 bg-zinc-100 text-zinc-800 text-[14px] font-bold rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 border border-zinc-200 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    내 리포트 다시보기 링크 복사
                  </button>
                  <p className="text-center text-[11px] text-zinc-400 mt-1">다른 브라우저에서 열람할 때는 문자로 받은 PIN 4자리가 필요합니다.</p>
                </div>
              )}
          </div>

        <div className="mt-8">
        {/* FREE: 결과 공유 */}
        <div className="mb-4 flex gap-3 print:hidden">
          <button
            onClick={handleShareClick}
            className="w-full py-3.5 bg-zinc-900 text-white text-[13.5px] font-bold rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-md shadow-zinc-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            결과 링크 공유
          </button>
        </div>
        <p className="text-center text-[11px] text-zinc-500 font-medium mb-1.5 print:hidden">
          🔒 공유된 링크에서는 유료 심층 리포트·1:1 AI 상담 내용·연락처가 절대 보이지 않습니다.
        </p>
        <p className="text-center text-[11px] text-zinc-400 mb-8 print:hidden">
          무료 분석 결과는 30일간 보관되며 기간이 지나면 자동 삭제됩니다.
        </p>

        </div>
        <div className="h-24 print:hidden" aria-hidden="true" />
      </main>

      <ShareAliasModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        onShare={(alias) => {
          executeShare(alias);
        }} 
        originalName={target_speaker_label || "상대방"}
      />
    </div>
  );
}
