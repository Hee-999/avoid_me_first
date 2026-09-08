"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    // Reveal steps sequentially
    const intervals = [
      setTimeout(() => setCurrentStep(1), 1500),
      setTimeout(() => setCurrentStep(2), 3000),
      setTimeout(() => setCurrentStep(3), 4500)
    ];

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, []);

  const steps = [
    "대화 패턴 추출 중",
    "관계 신호 비교 중",
    "애착 유형 분석 중",
    "행동 패턴 정리 중"
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-zinc-50/95 animate-in fade-in duration-300">
      
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 w-full max-w-sm flex flex-col items-center">
        
        {/* Compact Spinner with Heart */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
          
          <div className="absolute flex items-center justify-center w-6 h-6">
            <svg className="w-6 h-6 text-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <svg className="w-6 h-6 text-red-500 absolute drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        </div>

        <h2 className="text-[18px] font-black text-zinc-900 mb-1">상대의 관계 패턴 분석 중</h2>
        <p className="text-[13px] text-zinc-500 mb-8 text-center leading-relaxed">
          대화 속 숨겨진 방어기제와<br/>회피 성향을 찾아내고 있습니다.
        </p>

        {/* Checklist */}
        <div className="w-full space-y-3.5 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isActive = currentStep === idx;
            
            return (
              <div key={idx} className="flex items-center gap-3">
                {isCompleted ? (
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-200 shrink-0"></div>
                )}
                
                <span className={`text-[13.5px] font-medium transition-colors duration-300 ${isCompleted ? 'text-zinc-400' : isActive ? 'text-zinc-900 font-bold' : 'text-zinc-300'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
        
        <p className="text-[11px] text-zinc-400 mt-6 animate-pulse">약 10~20초 정도 소요됩니다.</p>
      </div>

    </div>
  );
}
