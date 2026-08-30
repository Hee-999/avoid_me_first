"use client";

import { motion, MotionValue } from "framer-motion";
import HeroBackground from "./HeroBackground";

interface HeroSectionProps {
  backgroundVideoUrl?: string;
  backgroundPosterUrl?: string;
  onCtaClick: () => void;
  textOpacity: MotionValue<number>;
  textY: MotionValue<number>;
  videoScale: MotionValue<number>;
}

export default function HeroSection({
  backgroundVideoUrl,
  backgroundPosterUrl,
  onCtaClick,
  textOpacity,
  textY,
  videoScale
}: HeroSectionProps) {
  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Media that zooms in massively */}
      <motion.div 
        style={{ scale: videoScale }} 
        className="absolute inset-0 w-full h-full origin-center"
      >
        {backgroundVideoUrl ? (
          <video 
            src={backgroundVideoUrl} 
            poster={backgroundPosterUrl}
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover opacity-80 mix-blend-screen"
          />
        ) : (
          <div className="w-full h-full bg-zinc-50 relative">
            <HeroBackground />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/90"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-zinc-950/40 mix-blend-multiply" />
      </motion.div>
      
      {/* Hero Content that fades out and moves up */}
      <motion.div 
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 flex flex-col items-center text-center px-6 mt-[-10vh]"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-sm text-zinc-900 text-xs font-semibold rounded-full mb-6 shadow-sm border border-zinc-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          AI 심리 분석 리포트
        </div>
        
        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-white`}>
          그 사람,<br />
          정말 회피형일까?
        </h1>
        
        <p className={`mt-6 text-[15px] font-medium max-w-sm leading-relaxed text-zinc-300`}>
          바솔로뮤 성인 애착 모델 기반으로<br/>카톡 대화 패턴을 분석하여 숨겨진 심리를 판독합니다.
        </p>

        <button 
          onClick={onCtaClick}
          className="mt-10 px-8 py-4 bg-white text-zinc-950 font-bold text-[15px] rounded-xl transform transition hover:bg-zinc-100 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-white/10"
        >
          대화 붙여넣고 분석하기
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </button>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white`}
      >
        <span className="text-[10px] font-bold tracking-widest uppercase mb-2 opacity-80">Scroll to start</span>
        <svg className="w-5 h-5 animate-bounce opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      </motion.div>
    </div>
  );
}
