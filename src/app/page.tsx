"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Loading from "@/components/Loading";
import HeroSection from "@/components/HeroSection";
import InputSection, { AnalyzeRequestPayload } from "@/components/InputSection";

export default function Home() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewState, setViewState] = useState<"hero" | "input">("hero");

  const handleAnalyzeImages = async (payload: AnalyzeRequestPayload) => {
    if (!payload.slices || payload.slices.length === 0) {
      alert("카카오톡 대화 캡처 사진을 등록해주세요!");
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: payload.slices,
          target_role: payload.targetRole,
          target_speaker_label: payload.targetLabel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다.");
      }

      router.push(`/result/${data.id}`);
    } catch (err: any) {
      alert(err.message || "분석 요청에 실패했습니다.");
      setIsAnalyzing(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "러브패턴",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://lovepattern.site",
    "description": "대화 캡처 기반 관계 행동 패턴 분석 (참고용 디지털 콘텐츠)",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web"
  };

  return (
    <div className="relative h-[100dvh] bg-zinc-100 selection:bg-blue-200 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed inset-x-0 mx-auto top-0 w-full max-w-md h-[100dvh] bg-white z-0">
        {/* Step 1: The Hero Section (Video & Text) */}
        <HeroSection
          backgroundVideoUrl="/hero_loop.mp4"
          onCtaClick={() => setViewState("input")}
          textOpacity={viewState === "hero" ? 1 : 0}
          textY={viewState === "hero" ? 0 : -50}
          videoScale={viewState === "hero" ? 1 : 6}
        />

        {/* Step 2: The White Canvas Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: viewState === "input" ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-white z-10 pointer-events-none"
        />

        {/* Step 3: The Input Section Form */}
        <motion.div
          initial={false}
          animate={{
            opacity: viewState === "input" ? 1 : 0,
            y: viewState === "input" ? 0 : 40
          }}
          transition={{ duration: 0.6, delay: viewState === "input" ? 0.3 : 0, ease: "easeOut" }}
          className={`absolute inset-0 z-20 flex flex-col pt-16 pb-12 px-6 overflow-y-auto transition-all ${
            viewState === "input" ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <InputSection
            onAnalyzeImages={handleAnalyzeImages}
            onBack={() => setViewState("hero")}
            isSubmitting={isAnalyzing}
          />
        </motion.div>
      </div>

      {isAnalyzing && <Loading />}
    </div>
  );
}
