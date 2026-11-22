"use client";

import { useState, useEffect, forwardRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LiveAnalysisBadge } from "@/components/common/LiveAnalysisBadge";
import { Footer } from "@/components/legal/Footer";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { CaptureGuideModal } from "@/components/guide/CaptureGuideModal";
import { ContextIntakeModal, ContextIntakeData } from "@/components/upload/ContextIntakeModal";
import { ReportLookupModal } from "@/components/premium/ReportLookupModal";

export interface AnalyzeRequestPayload {
  slices: Array<{ base64: string; mimeType: string }>;
  targetRole: "target" | "user";
  targetLabel: string;
  analysisMode: "reunion" | "flirting";
  contextIntake?: ContextIntakeData | null;
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
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [isLookupOpen, setIsLookupOpen] = useState(false);
    const [slices, setSlices] = useState<Array<{ base64: string; mimeType: string }>>([]);
    const [targetRole, setTargetRole] = useState<"target" | "user">("target");
    const [targetLabel, setTargetLabel] = useState<string>("상대방");
    const [analysisMode, setAnalysisMode] = useState<"reunion" | "flirting">("reunion");
    const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
    const [loadingStep, setLoadingStep] = useState("대화 캡처 및 이모티콘 정밀 판독 중...");

    useEffect(() => {
      if (!isSubmitting) {
        setLoadingStep("대화 캡처 및 이모티콘 정밀 판독 중...");
        return;
      }

      const t1 = setTimeout(() => {
        setLoadingStep("12가지 애착 심리 지표 채점 중...");
      }, 5000);

      const t2 = setTimeout(() => {
        setLoadingStep("상호작용 패턴 및 방어기제 분석 중...");
      }, 12000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }, [isSubmitting]);

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
      if (!isPrivacyAgreed) {
        alert("개인정보처리방침 및 AI 대화 분석 이용에 동의해주세요.");
        return;
      }
      // 맥락 질문 모달 열기
      setIsIntakeOpen(true);
    };

    const handleIntakeSubmit = (intakeData: ContextIntakeData | null) => {
      setIsIntakeOpen(false);
      onAnalyzeImages({
        slices,
        targetRole,
        targetLabel: targetLabel.trim() || (targetRole === "target" ? "상대방" : "나"),
        analysisMode,
        contextIntake: intakeData
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

          {/* Live Social Proof Floating Bar */}
          <LiveAnalysisBadge className="mb-4" />

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
                <span className="text-[13.5px] font-semibold text-zinc-800 break-keep">
                  카톡 캡처로 어떻게 속마음과 온도차를 판독하나요?
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
                className="mt-4 pt-4 border-t border-zinc-100 text-[13.5px] text-zinc-600 leading-relaxed overflow-hidden break-keep"
              >
                AI 비전 모델이 카톡 대화의 답장 호흡, 감정 표현 수위, 거리두기 신호를 정밀 분석하여 <strong>두 사람의 관계 온도차와 재회·썸 성사 가능성</strong>을 판독합니다.
                <br />
                <br />
                심리학의 성인 애착 모델(불안·회피 차원)을 함께 적용해 상대방이 왜 그런 반응을 보였는지 근본적인 이유와 실전 카톡 대처법까지 안내해 드려요.
              </motion.div>
            )}
          </div>

          {/* Analysis Mode Selection (2 Modes) */}
          <div className="mb-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <label className="block text-[14px] font-bold text-zinc-900 mb-2.5">
              어떤 관계를 판독할까요?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAnalysisMode("reunion")}
                className={`py-3 px-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                  analysisMode === "reunion"
                    ? "border-zinc-900 bg-zinc-900 text-white font-bold shadow-xs"
                    : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300"
                }`}
              >
                <span className="text-[13.5px] flex items-center gap-1">
                  <span>💔</span> 재회 · 애매한 사이
                </span>
                <span className={`text-[11px] font-normal ${analysisMode === "reunion" ? "text-zinc-300" : "text-zinc-400"}`}>
                  이별·거리두기·미련 판독
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAnalysisMode("flirting")}
                className={`py-3 px-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                  analysisMode === "flirting"
                    ? "border-rose-500 bg-rose-500 text-white font-bold shadow-xs"
                    : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300"
                }`}
              >
                <span className="text-[13.5px] flex items-center gap-1">
                  <span>💘</span> 썸 · 호감도
                </span>
                <span className={`text-[11px] font-normal ${analysisMode === "flirting" ? "text-rose-100" : "text-zinc-400"}`}>
                  호감 vs 어장·밀당 판독
                </span>
              </button>
            </div>
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
            <label className="block text-[14px] font-bold text-zinc-900 mb-1">
              누구의 속마음을 중심으로 판독할까요?
            </label>
            <p className="text-[11.5px] text-zinc-500 mb-2.5 break-keep">
              우측 노란 말풍선(나)과 좌측 말풍선(상대)의 온도차를 함께 봐요.
            </p>
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
                  (우측 말풍선 기준)
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

          {/* Privacy & AI Analysis Consent */}
          <div className="mb-3 flex items-start gap-2.5 px-1">
            <input
              id="privacy-consent"
              type="checkbox"
              checked={isPrivacyAgreed}
              onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 accent-zinc-900 cursor-pointer"
            />
            <div className="text-[12.5px] leading-snug text-zinc-600">
              <label htmlFor="privacy-consent" className="cursor-pointer select-none">
                <span className="font-semibold text-zinc-800">(필수)</span>{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-zinc-900 underline underline-offset-2 hover:text-blue-600"
                >
                  개인정보처리방침
                </Link>{" "}
                및 AI 대화 분석(국외 API 일시 처리 후 즉시 파기)에 동의합니다.
              </label>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyzeClick}
            disabled={isSubmitting || slices.length === 0 || !isPrivacyAgreed}
            className="w-full py-4.5 bg-zinc-950 text-white font-bold text-[16px] rounded-xl transform transition-all hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-[14px]">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                <span>{loadingStep}</span>
              </span>
            ) : (
              <>
                <span>{targetLabel || (targetRole === "target" ? "상대방" : "나")}</span> 속마음 &amp; 확률 판독 시작
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Sample Result & Lookup Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Link
              href="/sample-result"
              className="text-[13px] font-semibold text-zinc-500 hover:text-zinc-800 underline underline-offset-4 transition-colors flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-zinc-100"
            >
              <span>예시 결과 보기</span>
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-zinc-300">|</span>
            <button
              type="button"
              onClick={() => setIsLookupOpen(true)}
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              <span>🔍 결제한 리포트 · 상담 이어하기</span>
            </button>
          </div>

          {/* Privacy & Disclaimers */}
          <div className="mt-auto text-center text-[13px] text-zinc-400 font-medium pb-4">
            <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-lg mb-3 mx-auto w-full text-left text-zinc-500 break-keep">
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>카카오톡 [프로필 가리기]로 캡처하시면 실명과 프로필 사진이 보호됩니다.</li>
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

        {/* 3-Question Context Intake Modal */}
        <ContextIntakeModal
          isOpen={isIntakeOpen}
          onClose={() => setIsIntakeOpen(false)}
          onSubmit={handleIntakeSubmit}
          targetLabel={targetLabel}
        />

        {/* Purchased Report Lookup Modal */}
        <ReportLookupModal
          isOpen={isLookupOpen}
          onClose={() => setIsLookupOpen(false)}
        />
      </section>
    );
  }
);

InputSection.displayName = "InputSection";

export default InputSection;
