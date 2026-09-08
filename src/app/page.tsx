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
  const [viewState, setViewState] = useState<'hero' | 'input'>('hero');

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
      setSelectedTarget(null);
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "회피형 판독기",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "description": "대화 기반 관계 행동 패턴 분석 (참고용 디지털 콘텐츠)",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web"
  };

  return (
    <div className="relative h-[100dvh] bg-zinc-950 selection:bg-blue-200 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="fixed inset-x-0 mx-auto top-0 w-full max-w-md h-[100dvh] bg-black z-0">
        
        {/* Step 1: The Hero Section (Video & Text) */}
        <HeroSection 
          backgroundVideoUrl="/Abstract_glowing_motion_background_202608301121.mp4" 
          onCtaClick={() => setViewState('input')}
          textOpacity={viewState === 'hero' ? 1 : 0}
          textY={viewState === 'hero' ? 0 : -50}
          videoScale={viewState === 'hero' ? 1 : 6}
        />

        {/* Step 2: The White Canvas Overlay */}
        <motion.div 
          initial={false}
          animate={{ opacity: viewState === 'input' ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-white z-10 pointer-events-none"
        />

        {/* Step 3: The Input Section Form */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: viewState === 'input' ? 1 : 0,
            y: viewState === 'input' ? 0 : 40
          }}
          transition={{ duration: 0.6, delay: viewState === 'input' ? 0.3 : 0, ease: "easeOut" }}
          className={`absolute inset-0 z-20 flex flex-col pt-16 pb-12 px-6 overflow-y-auto transition-all ${viewState === 'input' ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <InputSection onAnalyze={handleAnalyzeClick} onBack={() => setViewState('hero')} />
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
