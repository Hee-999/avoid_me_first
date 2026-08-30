"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Loading from "@/components/Loading";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";

export default function Home() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track absolute window scroll position
  const { scrollY } = useScroll();

  // --- Animation Orchestration (using pixel values for exact control) ---
  // 1. Hero Text fades out early
  const heroTextOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 200], [0, -50]);

  // 2. The Video massively scales up to zoom into the white center
  const videoScale = useTransform(scrollY, [100, 600], [1, 6]);

  // 3. A solid white overlay fades in to transition the bright center into a clean canvas
  const canvasOpacity = useTransform(scrollY, [400, 600], [0, 1]);

  // 4. The Input UI fades in and rises slightly on the newly formed white canvas
  const inputOpacity = useTransform(scrollY, [600, 800], [0, 1]);
  const inputY = useTransform(scrollY, [600, 800], [40, 0]);
  
  // Use state to enable pointer events safely rather than tying it to a motion value directly
  // Framer Motion style pointerEvents sometimes has quirks.
  const [isInputActive, setIsInputActive] = useState(false);
  
  useEffect(() => {
    return scrollY.on("change", (latest) => {
      if (latest > 600 && !isInputActive) setIsInputActive(true);
      if (latest <= 600 && isInputActive) setIsInputActive(false);
    });
  }, [scrollY, isInputActive]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      router.push("/result");
    }, 4500);
  };

  const scrollToInput = () => {
    // Scroll down to reveal the input section (scrolling by window height is enough)
    window.scrollTo({
      top: window.innerHeight * 1.2,
      behavior: "smooth"
    });
  };

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-zinc-950 selection:bg-blue-200">
      
      {/* 
        Fixed container that holds the cinematic transition. 
        It stays on screen while the user scrolls down the 200vh space.
      */}
      <div className="fixed inset-x-0 mx-auto top-0 w-full max-w-md h-screen overflow-hidden bg-black z-0">
        
        {/* Step 1: The Hero Section (Video & Text) */}
        <HeroSection 
          backgroundVideoUrl="/Abstract_glowing_motion_background_202608301121.mp4" 
          onCtaClick={scrollToInput}
          textOpacity={heroTextOpacity}
          textY={heroTextY}
          videoScale={videoScale}
        />

        {/* Step 2: The White Canvas Overlay 
            As the video zooms into the bright center, this white layer fades in 
            to create a seamless transition to a pure background for the form.
        */}
        <motion.div 
          style={{ opacity: canvasOpacity }}
          className="absolute inset-0 bg-white z-10 pointer-events-none"
        />

        {/* Step 3: The Input Section Form
            Fades in over the white canvas. It's fixed inside this container.
        */}
        <motion.div
          style={{ opacity: inputOpacity, y: inputY }}
          className={`absolute inset-0 z-20 flex flex-col pt-16 pb-12 px-6 overflow-y-auto transition-all ${isInputActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* 
            Since this div fades in at the end of the scroll, we disable pointer events 
            when opacity is 0 to prevent accidental clicks on invisible inputs.
          */}
          <InputSection onAnalyze={handleAnalyze} />
        </motion.div>
        
      </div>

      {isAnalyzing && <Loading />}
    </div>
  );
}
