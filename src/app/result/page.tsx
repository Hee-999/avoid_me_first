"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateReport } from "@/lib/report/generator";
import { FinalAnalysis } from "@/lib/analysis/types";

export default function Result() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [analysis, setAnalysis] = useState<FinalAnalysis | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In production, the rawText would be passed from state or context.
    // For now, we generate the report directly.
    generateReport("mock data").then(setAnalysis);
  }, []);

  if (!analysis) return null; // Wait for initial parse

  const { scored, profile } = analysis;

  const handleExport = async (format: 'jpg' | 'pdf') => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      // Small delay to ensure any rendering is done before capture
      await new Promise(res => setTimeout(res, 100));
      
      // Dynamically import to prevent SSR errors in Next.js
      const html2canvas = (await import("html2canvas")).default;
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = 'avoidance-report.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      } else if (format === 'pdf') {
        const { jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save('avoidance-report.pdf');
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("리포트 저장 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
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
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10" ref={reportRef}>
        
        {/* FREE: 01. 분석 요약 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-snug">
            이 대화에서는<br/>
            <span className="text-blue-600">명확한 회피 경향</span>이 관찰되었습니다.
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h3 className="text-[13px] font-bold text-zinc-500 mb-4">종합 애착 유형 진단</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-black text-zinc-900">{scored.avoidanceScore}</span>
            <span className="text-[15px] font-bold text-zinc-400 mb-1">/ 100 점 (회피 지수)</span>
          </div>
          <p className="text-[14px] font-semibold text-zinc-700 mb-6">
            분석 유형: <strong className="text-blue-600">{profile.type}</strong>
          </p>

          <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${scored.avoidanceScore}%` }} transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            />
          </div>
          <div className="flex justify-between items-center text-[12px] font-medium text-zinc-400">
            <span>안정형 (0)</span>
            <span className="text-red-500 font-bold">{profile.avoidanceBand}</span>
          </div>
        </motion.div>

        {/* FREE: 02. 결과의 근거 미리보기 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <h3 className="text-[16px] font-bold text-zinc-900 mb-4">포착된 핵심 행동 패턴 (미리보기)</h3>
          <ul className="space-y-3">
            {profile.primaryDefenses.slice(0, 2).map((def, idx) => (
              <li key={idx} className="flex gap-3 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                <span className="text-blue-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </span>
                <div>
                  <strong className="block text-[14px] text-zinc-900 mb-1">{def}</strong>
                  <p className="text-[13px] text-zinc-600 leading-relaxed">대화 상에서 해당 패턴과 유사한 특징이 반복적으로 관찰되었습니다.</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* PREMIUM SECTIONS & PAYWALL */}
        <div className="relative">
          
          <div className={`space-y-12 pb-16 ${!isPremium ? 'opacity-30 blur-[6px] pointer-events-none select-none h-[400px] overflow-hidden' : 'transition-all duration-700'}`}>
            
            {/* 01. 핵심 행동 패턴 */}
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">
                🔒 01. 핵심 행동 패턴
              </h3>
              <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-3">
                <strong className="text-[15px] text-zinc-900 block">Stonewalling (대화 단절)</strong>
                <p className="text-[13px] text-zinc-600">감지 횟수: {scored.extractedData.signals.stonewalling.count}회 / 강도: {scored.extractedData.signals.stonewalling.intensity}</p>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <span className="text-[12px] font-bold text-zinc-400 mb-1 block">관련 분석 지표</span>
                  <p className="text-[13px] text-zinc-700">갈등 상황 시 상대는 감정적 압박을 피하기 위해 물리적/심리적 소통을 즉각적으로 차단하는 경향을 보입니다.</p>
                </div>
              </div>
            </section>

            {/* 02. 행동 근거 분석 */}
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">
                🔒 02. 행동 근거 분석
              </h3>
              <div className="space-y-4">
                {scored.extractedData.signals.stonewalling.evidence_quotes.map((quote, i) => (
                  <div key={i} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-2">원문</span>
                    <p className="text-[14px] text-zinc-900 font-medium mb-3">"{quote}"</p>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block mb-1">해석</span>
                    <p className="text-[13px] text-zinc-600">문제 해결보다는 갈등 상황 자체를 벗어나는 것을 최우선으로 삼는 대화 단절 신호입니다.</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 03. Trigger Profile */}
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">
                🔒 03. 상대의 Trigger Profile
              </h3>
              {scored.extractedData.trigger_phrases.map((trigger, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-zinc-200">
                  <p className="text-[15px] font-bold text-red-500 mb-2">"{trigger.phrase}"</p>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${trigger.intensity * 20}%` }} />
                  </div>
                  <p className="text-[13px] text-zinc-600">{trigger.reason}</p>
                </div>
              ))}
            </section>

            {/* 04. Defense / Avoidance Process */}
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">
                🔒 04. 회피 작동 메커니즘
              </h3>
              <div className="flex flex-col items-center">
                <div className="w-full bg-white p-4 text-center rounded-lg border border-zinc-200"><span className="text-[11px] font-bold text-zinc-400 block">Trigger</span>직면 요구</div>
                <div className="h-4 w-px bg-zinc-300 my-1" />
                <div className="w-full bg-white p-4 text-center rounded-lg border border-zinc-200"><span className="text-[11px] font-bold text-zinc-400 block">Internal Reaction</span>통제감 상실 및 비난에 대한 두려움</div>
                <div className="h-4 w-px bg-zinc-300 my-1" />
                <div className="w-full bg-blue-50 text-blue-900 p-4 text-center rounded-lg border border-blue-200 font-bold"><span className="text-[11px] font-bold text-blue-400 block">Defense Response</span>거리두기 및 침묵 (Stonewalling)</div>
              </div>
            </section>

            {/* 05 ~ 09: Interaction Guides (Placeholder structure) */}
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">🔒 05. Interaction Guide</h3>
              <div className="bg-white p-5 rounded-xl border border-green-200">
                <span className="text-[11px] font-bold text-green-600 block mb-1">권장 행동</span>
                <p className="text-[14px] text-zinc-800 font-medium mb-2">안전 기지 제공하기 (시간 두기)</p>
                <p className="text-[13px] text-zinc-600">감정이 격해졌을 때 명확한 기한을 둔 공간을 허락해 주어야 합니다.</p>
              </div>
            </section>

            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">🔒 06. Communication Guide</h3>
              <div className="p-4 bg-white border border-zinc-200 rounded-xl">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1">현재 표현의 문제점</span>
                <p className="text-[13px] text-zinc-600 mb-3">상대의 잘못을 지적하는 방식은 죄책감 방어기제를 자극합니다.</p>
                <span className="text-[11px] font-bold text-blue-600 block mb-1">추천 방식</span>
                <p className="text-[14px] text-zinc-800 font-medium">나 전달법 (I-message) 사용</p>
              </div>
            </section>

            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">🔒 07. Conversation Rewrite</h3>
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div className="line-through text-zinc-400 text-[14px] mb-2">"너는 왜 매번 피해?"</div>
                <div className="text-center text-zinc-300 my-2">⬇</div>
                <div className="text-blue-600 font-medium text-[14px]">"네가 연락이 안 될 때 나는 많이 불안해."</div>
              </div>
            </section>
            
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">🔒 08. 위험 / 회복 신호 관찰</h3>
              <ul className="space-y-3">
                <li className="flex gap-2 items-start text-[13px] text-zinc-600"><span className="text-green-500">✔</span> 회복 신호: 먼저 일상적인 질문(밥 먹었어?)을 건네옴</li>
                <li className="flex gap-2 items-start text-[13px] text-zinc-600"><span className="text-red-500">⚠</span> 위험 신호: "모르겠어"라는 단답이 3번 이상 반복됨</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">🔒 09. 행동 플랜 (Action Plan)</h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-center p-3 bg-white border border-zinc-200 rounded-lg"><span className="font-black text-zinc-300 text-xl">1</span><span className="text-[14px] text-zinc-800 font-medium">갈등 발생 직후 대화 중단 및 냉각기(최소 2시간) 선언</span></div>
                <div className="flex gap-3 items-center p-3 bg-white border border-zinc-200 rounded-lg"><span className="font-black text-zinc-300 text-xl">2</span><span className="text-[14px] text-zinc-800 font-medium">감정을 배제한 객관적 사실만 텍스트로 전달</span></div>
              </div>
            </section>

            <section>
              <h3 className="text-[18px] font-black text-zinc-900 mb-4 flex items-center gap-2">🔒 10. 상대 사용설명서 Summary</h3>
              <div className="bg-zinc-900 text-white p-6 rounded-2xl mb-8">
                <h4 className="text-lg font-black mb-4 border-b border-zinc-700 pb-2">사용 설명서 요약</h4>
                <ul className="space-y-2 text-[13px] text-zinc-300">
                  <li><strong className="text-zinc-100">핵심 성향:</strong> {profile.type}</li>
                  <li><strong className="text-zinc-100">발작 버튼:</strong> 통제감 상실 및 직접적 직면 요구</li>
                  <li><strong className="text-zinc-100">권장 접근:</strong> 안전 기지 허용 및 나 전달법</li>
                </ul>
              </div>
              
              {/* Export Buttons (Only visible when premium is unlocked) */}
              {isPremium && (
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-200" data-html2canvas-ignore>
                  <p className="text-center text-[13px] font-bold text-zinc-500 mb-2">리포트 저장 및 공유하기</p>
                  <button 
                    onClick={() => handleExport('jpg')}
                    disabled={isExporting}
                    className="w-full py-3.5 bg-zinc-100 text-zinc-800 text-[14px] font-bold rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 border border-zinc-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    이미지(JPG)로 다운로드
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
            </section>
          </div>

          {/* Paywall Overlay */}
          <AnimatePresence>
            {!isPremium && (
              <motion.div 
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-10 flex flex-col items-center bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent pb-10"
              >
                <div className="sticky top-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col items-center text-center max-w-[280px]">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h4 className="text-[16px] font-bold text-zinc-900 mb-2">프리미엄 리포트 잠김</h4>
                  <p className="text-[13px] text-zinc-500 leading-relaxed mb-6">
                    숨겨진 발작 버튼 분석과 관계 회복을 위한 1:1 맞춤형 대화법 등 모든 자물쇠(🔒) 항목을 확인하세요.
                  </p>
                  <button 
                    onClick={() => setIsPremium(true)}
                    className="w-full py-4 bg-zinc-900 text-white text-[15px] font-bold rounded-xl hover:bg-zinc-800 transition transform active:scale-95 shadow-lg"
                  >
                    내 상대 사용설명서 전체 보기
                  </button>
                  <span className="text-[11px] text-zinc-400 mt-3">*현재는 테스트 모드(무료)입니다.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
