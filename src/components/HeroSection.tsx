"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroBackground from "./HeroBackground";

interface HeroSectionProps {
  backgroundVideoUrl?: string;
  backgroundPosterUrl?: string;
  onCtaClick: () => void;
  textOpacity: number;
  textY: number;
  videoScale: number;
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
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-start overflow-hidden bg-white">
      
      {/* Background Video (Clean watercolor animation) */}
      <motion.div 
        animate={{ scale: videoScale }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
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
            className="w-full h-full object-cover object-bottom"
          />
        ) : (
          <div className="w-full h-full bg-zinc-50 relative">
            <HeroBackground />
          </div>
        )}
      </motion.div>
      
      {/* Hero Content positioned in the upper clean area above characters */}
      <motion.div 
        animate={{ opacity: textOpacity, y: textY }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 pt-7 sm:pt-9 w-full max-w-sm"
      >
        {/* Brand Name */}
        <p className="text-[13px] sm:text-[14px] font-bold text-zinc-900 tracking-wider mb-3">
          러브패턴
        </p>
        
        {/* Main Title */}
        <h1 className="text-[30px] sm:text-[34px] font-black tracking-tight leading-[1.2] text-zinc-950">
          그 사람,<br />
          정말 회피형일까?
        </h1>
        
        {/* Subtitle */}
        <p className="mt-2.5 sm:mt-3 text-[14px] sm:text-[15px] font-medium leading-snug text-zinc-800">
          카톡 대화 속에 담긴<br />
          애착과 행동 패턴을 살펴보세요.
        </p>

        {/* Primary CTA Button */}
        <button 
          onClick={onCtaClick}
          className="mt-5 sm:mt-6 w-full max-w-[250px] py-3.5 px-6 bg-zinc-950 text-white font-bold text-[15px] rounded-full transform transition hover:bg-zinc-800 active:scale-[0.98] shadow-lg shadow-zinc-950/20 cursor-pointer"
        >
          카톡 캡처로 분석하기
        </button>

        {/* Secondary Link */}
        <Link 
          href="/sample-result"
          className="mt-2.5 text-[13px] sm:text-[13.5px] font-semibold text-zinc-800 hover:text-black underline underline-offset-4 transition py-1 cursor-pointer"
        >
          예시 결과 보기
        </Link>
      </motion.div>
    </div>
  );
}
