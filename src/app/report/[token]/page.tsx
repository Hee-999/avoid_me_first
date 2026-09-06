"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { FinalAnalysis } from "@/lib/analysis/types";

export default function ReportArchive() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/public/${token}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "보고서를 불러올 수 없습니다.");
        }
        
        setReportData(data.premium_report);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchReport();
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm border border-zinc-200">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-zinc-900 font-bold mb-2">접근 불가</p>
          <p className="text-zinc-600 text-[14px]">{error}</p>
          <button onClick={() => router.push('/')} className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[13px] font-bold">홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  // Create a synthetic analysis object to satisfy PremiumReport props
  // Only the premium_report is actually used in the unlocked state, but we mock the rest safely.
  const syntheticAnalysis = {
    premium_report: reportData,
    status: { report: "completed" }
  } as unknown as FinalAnalysis;

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-center print:hidden">
        <p className="text-xs text-red-600 font-bold">이 링크를 가진 사람은 보고서를 볼 수 있습니다. 외부에 공개하지 마세요.</p>
      </div>
      
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200 print:hidden">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">상세 분석 보고서 (보관용)</span>
          <div className="w-7"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10">
        <PremiumReport 
          analysis={syntheticAnalysis} 
          isPremium={true} 
          onRetry={() => {}}
          onUnlock={() => {}}
        />
        
        <div className="mt-12 flex justify-center print:hidden">
          <button 
            onClick={() => window.print()}
            className="w-full max-w-[200px] py-3.5 bg-blue-50 text-blue-700 text-[14px] font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF 문서로 다시 저장
          </button>
        </div>
      </main>
    </div>
  );
}
