"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CaptureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CaptureGuideModal({ isOpen, onClose }: CaptureGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      stepNumber: 1,
      badge: "STEP 1",
      title: "채팅방에서 '+' 버튼 누르기",
      desc: "분석하고 싶은 상대방과의 카카오톡 채팅방 좌측 하단에 있는 '+' 메뉴 버튼을 터치합니다.",
      illustration: (
        <div className="w-full h-52 bg-zinc-900 rounded-2xl p-4 flex flex-col justify-between border border-zinc-800 shadow-inner">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300">👤</div>
            <span className="text-xs font-semibold text-zinc-300">상대방</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-yellow-400 text-zinc-950 text-xs px-3 py-1.5 rounded-2xl rounded-tr-none font-medium max-w-[70%]">
                주말에 시간 괜찮아?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded-2xl rounded-tl-none font-medium max-w-[70%]">
                글쎄.. 요즘 좀 바빠서
              </div>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2 border-t border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg animate-bounce shadow-lg shadow-blue-500/30">
              +
            </div>
            <div className="flex-1 h-7 bg-zinc-800/80 rounded-full px-3 text-[11px] text-zinc-500 flex items-center">
              메시지 입력
            </div>
          </div>
        </div>
      )
    },
    {
      stepNumber: 2,
      badge: "STEP 2",
      title: "'캡처' 기능 선택하기",
      desc: "하단에 열린 메뉴 서랍에서 '캡처' 아이콘을 터치하여 캡처 모드로 진입합니다.",
      illustration: (
        <div className="w-full h-52 bg-zinc-900 rounded-2xl p-4 flex flex-col justify-center border border-zinc-800 shadow-inner">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-800/40 text-zinc-500 flex flex-col items-center gap-1 opacity-50">
              <span className="text-xl">🖼️</span>
              <span className="text-[10px]">사진</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex flex-col items-center gap-1 ring-2 ring-blue-500/30">
              <span className="text-xl animate-pulse">✂️</span>
              <span className="text-[11px] font-bold">캡처</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/40 text-zinc-500 flex flex-col items-center gap-1 opacity-50">
              <span className="text-xl">📁</span>
              <span className="text-[10px]">파일</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/40 text-zinc-500 flex flex-col items-center gap-1 opacity-50">
              <span className="text-xl">🎁</span>
              <span className="text-[10px]">선물</span>
            </div>
          </div>
        </div>
      )
    },
    {
      stepNumber: 3,
      badge: "STEP 3 (가장 중요)",
      title: "'캡처 옵션'에서 프로필 가리기",
      desc: "하단 '캡처 옵션'을 누르고 '카카오프렌즈' 또는 '모자이크'를 선택하세요. 상대방 실명과 사진이 가려져 사생활이 100% 보호됩니다!",
      illustration: (
        <div className="w-full h-52 bg-zinc-900 rounded-2xl p-4 flex flex-col justify-between border border-blue-500/30 shadow-inner bg-gradient-to-b from-zinc-900 to-blue-950/20">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              개인정보 보호 옵션
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">보안 100%</span>
          </div>
          <div className="space-y-2 py-2">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
              <span className="text-xs text-zinc-400">변경 안 함</span>
              <div className="w-4 h-4 rounded-full border border-zinc-600"></div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-sm">🍑</span>
                <span className="text-xs">카카오프렌즈 (추천)</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 text-center">
            실명이 '어피치', '라이언' 등으로 자동 변경됩니다.
          </p>
        </div>
      )
    },
    {
      stepNumber: 4,
      badge: "STEP 4",
      title: "시작 & 끝 말풍선 터치 (구간 선택)",
      desc: "분석하고 싶은 대화의 첫 말풍선과 마지막 말풍선을 터치하여 원하는 대화 구간을 길게 선택합니다.",
      illustration: (
        <div className="w-full h-52 bg-zinc-900 rounded-2xl p-4 flex flex-col justify-between border border-zinc-800 shadow-inner">
          <div className="text-[11px] text-zinc-400 text-center font-medium">
            캡처 영역 선택 (20~40개 메시지 권장)
          </div>
          <div className="p-2.5 rounded-xl border-2 border-dashed border-blue-400 bg-blue-950/20 space-y-2 my-auto">
            <div className="flex justify-start items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-pink-400 text-[10px] flex items-center justify-center">🍑</div>
              <div className="bg-zinc-800 text-zinc-200 text-[11px] px-2.5 py-1 rounded-xl">또 그 이야기야? 그만하자.</div>
            </div>
            <div className="flex justify-end">
              <div className="bg-yellow-400 text-zinc-950 text-[11px] px-2.5 py-1 rounded-xl font-medium">우리가 풀 건 풀어야지..</div>
            </div>
          </div>
          <div className="text-[10px] text-blue-400 text-center font-medium">
            ✓ 점선 상자 안의 대화가 한 번에 길게 캡처됩니다
          </div>
        </div>
      )
    },
    {
      stepNumber: 5,
      badge: "STEP 5",
      title: "저장 아이콘 누르고 여기에 업로드!",
      desc: "우측 하단의 '저장(다운로드)' 아이콘을 눌러 갤러리에 저장한 뒤, 우리 사이트 업로드 창에 사진을 올려주시면 끝납니다.",
      illustration: (
        <div className="w-full h-52 bg-zinc-900 rounded-2xl p-4 flex flex-col items-center justify-center border border-zinc-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 flex items-center justify-center text-2xl">
            📥
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">갤러리에 저장 완료!</h4>
            <p className="text-[11px] text-zinc-400">
              저장된 사진(1~5장)을 아래 업로드 창에 선택해주세요.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
            ⚡ AI가 2초 만에 심층 분석을 시작합니다
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-white w-full max-w-sm rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <span className="text-base">📸</span>
            <h3 className="font-bold text-[15px] text-white">카톡 대화 캡처 가이드</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {steps[currentStep].badge}
            </span>
            <span className="text-[12px] text-zinc-500 font-medium">
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          <h4 className="text-[17px] font-bold text-white mb-2">
            {steps[currentStep].title}
          </h4>

          <p className="text-[13px] text-zinc-400 leading-relaxed mb-4 min-h-[40px]">
            {steps[currentStep].desc}
          </p>

          {/* Dynamic Graphic Illustration */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                {steps[currentStep].illustration}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-blue-500" : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold text-[13px] rounded-xl hover:bg-zinc-700 transition"
              >
                이전
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[14px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                다음 단계
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[14px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                확인했습니다 (사진 올리기)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
