"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Loading from "@/components/Loading";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";
import { preprocessConversation } from "@/lib/analysis/preprocessor";

export default function Home() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [participants, setParticipants] = useState<{id: string, display_label: string}[] | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{id: string, display_label: string} | null>(null);
  const [rawText, setRawText] = useState("");
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

  const handleAnalyzeClick = (text: string) => {
    if (!text.trim()) {
      alert("대화 내용을 입력해주세요!");
      return;
    }
    
    try {
      const preprocessed = preprocessConversation(text);
      
      if (preprocessed.participants.length < 2) {
        alert("대화 참여자를 구분하기 어려워요.\n카카오톡 대화 형식을 확인해주세요.");
        return;
      }
      if (preprocessed.participants.length > 2) {
        alert("현재 1:1 대화 분석만 지원합니다.");
        return;
      }
      
      setParticipants(preprocessed.participants);
      setSelectedTarget(null); // Reset selection
      setRawText(text);
    } catch (err) {
      alert("대화 형식을 분석하는 데 실패했습니다.");
    }
  };

  const handleSpeakerSelect = async (selectedTargetSpeaker: {id: string, display_label: string}) => {
    if (!participants) return;
    
    const userSpeaker = participants.find(p => p.id !== selectedTargetSpeaker.id);
    if (!userSpeaker) return;

    setParticipants(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: rawText,
          user_speaker_id: userSpeaker.id,
          target_speaker_id: selectedTargetSpeaker.id,
          target_speaker_label: selectedTargetSpeaker.display_label
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다.");
      }

      router.push(`/result/${data.id}`);
      
    } catch (err: any) {
      alert(err.message);
      setIsAnalyzing(false);
    }
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
          <InputSection onAnalyze={handleAnalyzeClick} />
        </motion.div>
        
      </div>

      {/* Speaker Selection Modal */}
      {participants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-zinc-900 mb-2">분석하고자 하는 대상은 누구인가요?</h3>
              <p className="text-[14px] text-zinc-500">선택하신 분의 회피 성향과 애착 유형을 분석합니다.</p>
            </div>
            
            <div className="space-y-3">
              {participants.map(p => {
                const isSelected = selectedTarget?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedTarget(p)}
                    className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center justify-between group ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-zinc-100 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-bold text-[16px] ${isSelected ? 'text-blue-700' : 'text-zinc-800'}`}>
                      {p.display_label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500' : 'border-zinc-300 group-hover:border-blue-300'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-blue-500 transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => {
                if (selectedTarget) {
                  handleSpeakerSelect(selectedTarget);
                }
              }}
              disabled={!selectedTarget}
              className="mt-6 w-full py-4 bg-zinc-950 text-white font-bold text-[15px] rounded-xl hover:bg-zinc-800 transition disabled:opacity-30 disabled:hover:bg-zinc-950"
            >
              확인
            </button>

            <button
              onClick={() => {
                setParticipants(null);
                setSelectedTarget(null);
              }}
              className="mt-3 w-full py-3 text-[14px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && <Loading />}
    </div>
  );
}
