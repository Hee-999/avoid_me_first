"use client";

import { useState, forwardRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Footer } from "@/components/legal/Footer";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { CaptureGuideModal } from "@/components/guide/CaptureGuideModal";

export interface AnalyzeRequestPayload {
  slices: Array<{ base64: string; mimeType: string }>;
  targetRole: "target" | "user";
  targetLabel: string;
}

interface InputSectionProps {
  onAnalyzeImages: (payload: AnalyzeRequestPayload) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

const InputSection = forwardRef<HTMLElement, InputSectionProps>(
  ({ onAnalyzeImages, onBack, isSubmitting = false }, ref) => {
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
    const [slices, setSlices] = useState<Array<{ base64: string; mimeType: string }>>([]);
    const [targetRole, setTargetRole] = useState<"target" | "user">("target");
    const [targetLabel, setTargetLabel] = useState<string>("상대방");

    const handleTargetRoleChange = (role: "target" | "user") => {
      setTargetRole(role);
      if (role === "target") {
        setTargetLabel("상대방");
      } else {
        setTargetLabel("나");
      }
    };

    const handleAnalyzeClick = () => {
      if (slices.length === 0) {
        alert("카카오톡 대화 캡처 사진을 최소 1장 이상 등록해주세요!");
        return;
      }
      onAnalyzeImages({
        slices,
        targetRole,
        targetLabel: targetLabel.trim() || (targetRole === "target" ? "상대방" : "나")
      });
    };

    return (
      <section ref={ref} className="relative w-full flex flex-col bg-transparent z-20">
        <div className="max-w-md mx-auto w-full flex flex-col flex-1">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="self-start mb-6 text-[13px] font-bold text-zinc-400 hover:text-zinc-800 transition flex items-center gap-1.5 px-3 py-1.5 -ml-3 rounded-lg hover:bg-zinc-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              처음으로
            </button>
          )}

          {/* Model Info Box */}
          <div className="mb-6 bg-white border border-zinc-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
            <button
              onClick={() => setIsModelInfoOpen(!isModelInfoOpen)}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-[14px] font-semibold text-zinc-800">
                  바솔로뮤(Bartholomew) 성인 애착 모델이란?
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-zinc-400 transform transition-transform ${isModelInfoOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isModelInfoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 pt-4 border-t border-zinc-100 text-[14px] text-zinc-600 leading-relaxed overflow-hidden"
              >
                심리학자 킴 바솔로뮤(Kim Bartholomew)가 제안한 4분할 애착 이론입니다. 자기 자신과 타인을 긍정하는지 부정하는지를 기준으로 <strong>안정형, 불안형, 거부-회피형, 공포-회피형</strong> 4가지로 분류합니다.
                <br />
                <br />
                이 서비스는 AI 비전 모델이 카톡 대화 캡처의 말풍선 패턴을 정밀 분석하여, 선택하신 대상의 방어기제와 회피 성향을 학술적 기준에 기반해 판독해 드립니다.
              </motion.div>
            )}
          </div>

          {/* Screenshot Uploader Component */}
          <div className="flex flex-col mb-4">
            <ImageUploader
              onImagesReady={(newSlices) => setSlices(newSlices)}
              onOpenGuide={() => setIsGuideOpen(true)}
              disabled={isSubmitting}
            />
          </div>

          {/* Analysis Target Selection Box */}
          <div className="mb-6 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <label className="block text-[14px] font-bold text-zinc-900 mb-2.5">
              누구의 회피 성향을 분석할까요?
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleTargetRoleChange("target")}
                className={`py-3 px-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  targetRole === "target"
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs"
                    : "border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <span className="text-[14px] flex items-center gap-1.5">
                  <span>👤</span> 상대방 분석
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  (좌측 말풍선 기준)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTargetRoleChange("user")}
                className={`py-3 px-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  targetRole === "user"
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs"
                    : "border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <span className="text-[14px] flex items-center gap-1.5">
                  <span>🙋</span> 내 성향 분석
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  (우측 노란 말풍선)
                </span>
              </button>
            </div>

            {/* Custom Label Input */}
            <div className="flex items-center gap-2 pt-2.5 border-t border-zinc-100 text-[13px]">
              <span className="text-zinc-500 font-medium shrink-0">결과 호칭:</span>
              <input
                type="text"
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
                placeholder={targetRole === "target" ? "상대방 (예: 그 사람, 남친)" : "나"}
                maxLength={10}
                className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-800 text-[13px] outline-none focus:border-blue-500 focus:bg-white transition"
              />
              <span className="text-[11px] text-zinc-400 shrink-0">
                (리포트 표시용)
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyzeClick}
            disabled={isSubmitting || slices.length === 0}
            className="w-full py-4.5 bg-zinc-950 text-white font-bold text-[16px] rounded-xl transform transition-all hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI 심층 분석 중... (약 3~5초 소요)
              </span>
            ) : (
              <>
                <span>{targetLabel || (targetRole === "target" ? "상대방" : "나")}</span>의 회피 성향 분석 시작
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Sample Result Link */}
          <div className="flex justify-center mb-6">
            <Link
              href="/sample-result"
              className="text-[13px] font-semibold text-zinc-500 hover:text-zinc-800 underline underline-offset-4 transition-colors flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-zinc-100"
            >
              <span>예시 결과 확인하기</span>
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Privacy & Disclaimers */}
          <div className="mt-auto text-center text-[13px] text-zinc-400 font-medium pb-4">
            <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-lg mb-3 mx-auto w-full text-left text-zinc-500 break-keep">
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>카카오톡 [프로필 가리기]로 캡처하시면 실명과 프로필 사진이 완벽하게 보호됩니다.</li>
                <li>업로드된 캡처 이미지는 AI 분석 처리 직후 즉시 파기되며 서버에 저장되지 않습니다.</li>
                <li>건강·성생활·정치·종교 등 민감한 개인정보가 포함된 대화는 업로드하지 않는 것을 권장합니다.</li>
              </ul>
            </div>
            <p className="text-[12px] text-zinc-400">
              본 분석은 참고용 디지털 콘텐츠이며 전문적인 심리 상담이나 의료 진단을 대체하지 않습니다.
            </p>

            <Footer isEmbedded={true} />
          </div>
        </div>

        {/* 5-Step Capture & Privacy Guide Modal */}
        <CaptureGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </section>
    );
  }
);

InputSection.displayName = "InputSection";

export default InputSection;
