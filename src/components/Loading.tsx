"use client";

import { useEffect, useState, useRef } from "react";

export default function Loading() {
  const [loadingText, setLoadingText] = useState("카카오톡 대화 패턴 추출 중...");
  const progressRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    // Text animation
    const texts = [
      "카카오톡 대화 패턴 추출 중...",
      "갈등 상황에서의 반응 분석 중...",
      "바솔로뮤 애착 모델과 매핑 중...",
      "숨겨진 회피 성향 최종 진단 중..."
    ];
    
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 1100);

    // Progress counter animation using requestAnimationFrame for zero-lag 60fps
    let startTime = Date.now();
    let animationFrameId: number;
    const duration = 4500; // 4.5 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(99, Math.floor((elapsed / duration) * 100));
      
      if (progressRef.current) {
        progressRef.current.innerText = `${currentProgress}%`;
      }

      if (currentProgress < 99) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      clearInterval(textInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-zinc-50/95 animate-in fade-in duration-300">
      {/* Animated Pulse Ring */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-zinc-200 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse] opacity-70"></div>
        
        {/* Center icon */}
        <div className="absolute flex items-center justify-center bg-zinc-900 w-10 h-10 rounded-full shadow-lg">
          <svg className="w-5 h-5 text-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <svg className="w-5 h-5 text-red-500 absolute" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      </div>

      <h2 ref={progressRef} className="text-3xl font-black text-zinc-900 mb-1 tracking-tight">0%</h2>
      <h3 className="text-[15px] font-bold text-zinc-700 mb-2">분석 진행 중</h3>
      <p className="text-[13px] font-medium text-zinc-500 min-h-[20px] transition-opacity duration-300">
        {loadingText}
      </p>
    </div>
  );
}
