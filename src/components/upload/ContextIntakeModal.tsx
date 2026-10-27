"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ContextIntakeData {
  situation: string;
  recurrence: string;
  desired_focus: string;
}

interface ContextIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContextIntakeData | null) => void;
  targetLabel: string;
}

export function ContextIntakeModal({
  isOpen,
  onClose,
  onSubmit,
  targetLabel = "상대방"
}: ContextIntakeModalProps) {
  const [situation, setSituation] = useState<string>("");
  const [recurrence, setRecurrence] = useState<string>("");
  const [desiredFocus, setDesiredFocus] = useState<string>("");

  const situationOptions = [
    { label: "평소 일상", desc: "특별한 갈등 없는 일상적인 대화" },
    { label: "서운함·다툼", desc: "의견 차이나 서운함을 표현한 상황" },
    { label: "시간을 갖는 중", desc: "연락을 줄이거나 거리를 두는 기간" },
    { label: "이별 전후", desc: "헤어짐을 언급했거나 이별 후의 대화" },
    { label: "기타·모름", desc: "상황을 특정하기 어려움" }
  ];

  const recurrenceOptions = [
    { label: "처음", desc: "이전에는 이런 반응을 본 적 없음" },
    { label: "가끔 반복", desc: "종종 비슷한 태도를 보임" },
    { label: "자주 반복", desc: "갈등이나 문제 때마다 반복됨" },
    { label: "판단하기 어려움", desc: "기억이 잘 안 나거나 애매함" }
  ];

  const focusOptions = [
    { label: "대화의 의미", desc: `${targetLabel}의 반응과 가능한 해석` },
    { label: "반복되는 관계 패턴", desc: "둘 사이에 반복되는 상호작용 고리" },
    { label: "어떻게 답할지", desc: "일상·갈등 상황에 맞는 자연스러운 답장" },
    { label: "앞으로 무엇을 확인할지", desc: "앞으로 주의 깊게 관찰할 행동" }
  ];

  const handleSubmit = () => {
    onSubmit({
      situation: situation || "선택 안 함",
      recurrence: recurrence || "선택 안 함",
      desired_focus: desiredFocus || "선택 안 함"
    });
  };

  const handleSkip = () => {
    onSubmit(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 mb-1">
                맞춤 분석 맥락
              </span>
              <h3 className="text-[17px] font-black text-zinc-900 tracking-tight">
                대화 배경을 3가지만 알려주세요
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Subtitle Notice */}
          <div className="px-6 py-2.5 bg-zinc-50 border-b border-zinc-100 text-[12px] text-zinc-500 font-medium leading-relaxed shrink-0">
            * 답변은 캡처 대화를 정확한 맥락에서 해석하는 데만 사용됩니다.
          </div>

          {/* Body (Scrollable) */}
          <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
            {/* Q1 */}
            <div>
              <label className="block text-[13.5px] font-bold text-zinc-900 mb-2">
                1. 이 대화 당시 어떤 상황이었나요?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {situationOptions.map((opt) => {
                  const isSelected = situation === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSituation(opt.label)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs"
                          : "border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <div>
                        <span className="text-[13px] block">{opt.label}</span>
                        <span className="text-[11px] text-zinc-400 font-normal">{opt.desc}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-blue-600 bg-blue-600" : "border-zinc-300"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q2 */}
            <div>
              <label className="block text-[13.5px] font-bold text-zinc-900 mb-2">
                2. 궁금한 대화 방식이나 반응이 이전에도 있었나요?
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {recurrenceOptions.map((opt) => {
                  const isSelected = recurrence === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setRecurrence(opt.label)}
                      className={`text-left px-3 py-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs"
                          : "border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-[13px] block">{opt.label}</span>
                      <span className="text-[10.5px] text-zinc-400 font-normal mt-0.5 line-clamp-1">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q3 */}
            <div>
              <label className="block text-[13.5px] font-bold text-zinc-900 mb-2">
                3. 이번 대화에서 어떤 도움을 받고 싶나요?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {focusOptions.map((opt) => {
                  const isSelected = desiredFocus === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setDesiredFocus(opt.label)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs"
                          : "border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <div>
                        <span className="text-[13px] block">{opt.label}</span>
                        <span className="text-[11px] text-zinc-400 font-normal">{opt.desc}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-blue-600 bg-blue-600" : "border-zinc-300"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-zinc-100 bg-white shrink-0 space-y-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14.5px] font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>입력 완료하고 분석 시작</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="text-[12.5px] text-zinc-400 hover:text-zinc-600 font-medium py-1 transition cursor-pointer underline underline-offset-4"
              >
                질문 건너뛰고 바로 분석하기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
