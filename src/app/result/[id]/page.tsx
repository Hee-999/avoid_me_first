"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { FinalAnalysis } from "@/lib/analysis/types";
import { PremiumReport } from "@/components/premium/PremiumReport";

export default function Result() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isPremium, setIsPremium] = useState(false);
  const [analysis, setAnalysis] = useState<FinalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
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
        setIsPremium(data.premium_unlocked);
        if (data.share_enabled) setShareId(data.share_id);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAnalysis();

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

  const handleExport = async (format: 'jpg' | 'pdf') => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      await new Promise(res => setTimeout(res, 100));
      const { toPng } = await import("html-to-image");
      
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });
      
      if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = 'avoidance-report.png';
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const { jsPDF } = await import("jspdf");
        
        // Get image dimensions to size the PDF correctly
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        
        const pdfWidth = img.width;
        const pdfHeight = img.height;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [pdfWidth, pdfHeight]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('avoidance-report.pdf');
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("리포트 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      // If not shared yet, request a share ID
      let currentShareId = shareId;
      if (!currentShareId) {
        const res = await fetch(`/api/share/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        currentShareId = data.share_id;
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
    try {
      // Optimistically show generating
      setIsPremium(true);
      
      const res = await fetch(`/api/premium/unlock/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "결제/해제 처리 중 오류가 발생했습니다.");
      }

      // Re-fetch analysis to get the premium_report field
      const fetchRes = await fetch(`/api/result/${id}`, { cache: 'no-store' });
      if (fetchRes.ok) {
        const fetchJSON = await fetchRes.json();
        setAnalysis(fetchJSON.analysis);
      }
    } catch (err: any) {
      alert(err.message);
      setIsPremium(false); // Revert
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
          <button onClick={handleShare} className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -mr-1">
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
            <span className="text-blue-600">{primary_type}</span>입니다.
          </h1>
          {is_mixed_pattern && (
            <p className="mt-2 text-[14px] text-zinc-500 font-medium">
              *보조 유형인 <strong className="text-zinc-700">{secondary_type}</strong> 성향도 강하게 혼재되어 나타납니다.
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
          <ul className="space-y-3">
            {signals && Object.entries(signals)
              .filter(([_, signal]: any) => signal && Array.isArray(signal.e) && signal.e.length > 0)
              .slice(0, 2)
              .map(([key, signal]: any, idx) => (
              <li key={idx} className="flex gap-3 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                <span className="text-blue-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </span>
                <div>
                  <strong className="block text-[14px] text-zinc-900 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</strong>
                  <p className="text-[13px] text-zinc-600 leading-relaxed">해당 성향을 나타내는 신호가 대화 중 {signal.e.length}회 발견되었습니다.</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* PREMIUM SECTIONS & PAYWALL */}
        <div className="relative">
          
          <PremiumReport 
            analysis={analysis} 
            isPremium={isPremium} 
            onRetry={() => {
              // Retry logic could be implemented here to hit a backend endpoint
              console.log("Retry requested");
            }}
            onUnlock={handleUnlock}
          />
              
              {/* Export Buttons */}
              {isPremium && analysis.status?.report === "completed" && (
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-200" data-html2canvas-ignore>
                  <p className="text-center text-[13px] font-bold text-zinc-500 mb-2">리포트 저장 및 공유하기</p>
                  <button 
                    onClick={() => handleExport('jpg')}
                    disabled={isExporting}
                    className="w-full py-3.5 bg-zinc-100 text-zinc-800 text-[14px] font-bold rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 border border-zinc-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    이미지(PNG)로 다운로드
                  </button>
                  <button 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full py-3.5 bg-blue-50 text-blue-700 text-[14px] font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    PDF 문서로 다운로드
                  </button>
                </div>
              )}
          </div>

      </main>
    </div>
  );
}
