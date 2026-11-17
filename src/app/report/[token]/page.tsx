"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { PremiumChatSection, ChatMessageItem } from "@/components/premium/PremiumChatSection";
import { FinalAnalysis } from "@/lib/analysis/types";

interface PublicReportPayload {
  requires_pin?: boolean;
  analysis_id?: string;
  premium_report?: any;
  derived_context?: any;
  target_speaker_label?: string;
  primary_type?: string;
  secondary_type?: string;
  attachment_dimensions?: { anxiety: number; avoidance: number };
  attachment_fitness?: { secure: number; preoccupied: number; dismissing: number; fearful: number };
  chat?: { remaining_turns: number; total_used: number; messages: ChatMessageItem[] };
}

export default function ReportArchive() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [payload, setPayload] = useState<PublicReportPayload | null>(null);
  const [requiresPin, setRequiresPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isTopupProcessing, setIsTopupProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/report/public/${token}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "보고서를 불러올 수 없습니다.");
      }

      if (data.requires_pin) {
        setRequiresPin(true);
        setPayload(data);
        return;
      }

      setRequiresPin(false);
      setPayload(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.trim();
    if (!/^\d{4}$/.test(cleaned)) {
      setPinError("문자 메시지에 적힌 숫자 4자리 PIN을 입력해주세요.");
      return;
    }

    setPinError(null);
    setIsVerifyingPin(true);
    try {
      const res = await fetch("/api/report/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "PIN 확인에 실패했습니다.");
      }
      await fetchReport();
    } catch (err: any) {
      setPinError(err.message || "PIN 확인 중 오류가 발생했습니다.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleTopupPay = async () => {
    if (!payload?.analysis_id || isTopupProcessing) return;
    try {
      setIsTopupProcessing(true);
      const res = await fetch(`/api/premium/prepare/${payload.analysis_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType: "chat_topup" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "결제 준비 중 오류가 발생했습니다.");
      }
      if (!(window as any).AUTHNICE) {
        throw new Error("결제 모듈을 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const baseUrl = (
        process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")
      ).replace(/\/+$/, "");

      (window as any).AUTHNICE.requestPay({
        clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
        method: "cardAndEasyPay",
        orderId: data.orderId,
        amount: data.amount,
        goodsName: data.goodsName,
        ...(data.buyerTel ? { buyerTel: data.buyerTel } : {}),
        returnUrl: `${baseUrl}/api/premium/callback`,
        fnError: function (result: any) {
          setIsTopupProcessing(false);
          alert(result.errorMsg || "결제 중 오류가 발생했습니다.");
        },
      });
    } catch (err: any) {
      setIsTopupProcessing(false);
      alert(err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm border border-zinc-200">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-zinc-900 font-bold mb-2">접근 불가</p>
          <p className="text-zinc-600 text-[14px]">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[13px] font-bold cursor-pointer"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (requiresPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-sm w-full border border-zinc-200">
          <div className="text-center mb-5">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white text-xl mb-3">
              🔒
            </span>
            <h1 className="text-[19px] font-black text-zinc-900">열람 PIN 4자리 입력</h1>
            <p className="mt-1.5 text-[13px] text-zinc-500 leading-relaxed">
              타인 열람 방지를 위해 결제 시 문자로 발송된 <strong>열람 PIN 4자리</strong>를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/[^0-9]/g, ""));
                if (pinError) setPinError(null);
              }}
              placeholder="숫자 4자리 (예: 8492)"
              className="w-full text-center tracking-[0.4em] text-[20px] font-black bg-zinc-50 border border-zinc-300 rounded-xl py-3 text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition"
            />
            {pinError && <p className="text-[12px] font-bold text-red-600 text-center">{pinError}</p>}
            <button
              type="submit"
              disabled={isVerifyingPin || pinInput.length !== 4}
              className="w-full py-3.5 bg-zinc-900 text-white text-[14px] font-bold rounded-xl hover:bg-zinc-800 transition disabled:opacity-40 cursor-pointer"
            >
              {isVerifyingPin ? "확인 중..." : "리포트 & 1:1 상담실 열기"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!payload?.premium_report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  const syntheticAnalysis = {
    premium_report: payload.premium_report,
    derived_context: payload.derived_context,
    target_speaker_label: payload.target_speaker_label || "상대방",
    primary_type: payload.primary_type,
    secondary_type: payload.secondary_type,
    attachment_dimensions: payload.attachment_dimensions,
    attachment_fitness: payload.attachment_fitness,
    status: { report: "completed", chat: payload.chat },
  } as unknown as FinalAnalysis;

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center print:hidden">
        <p className="text-xs text-amber-800 font-bold">
          이 페이지는 PIN 인증으로 보호된 본인 전용 리포트 및 1:1 AI 상담실입니다.
        </p>
      </div>

      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200 print:hidden">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -ml-1 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">상세 분석 리포트 (보관용)</span>
          <div className="w-7"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10 break-keep">
        {/* V3 핵심 판독 요약 (보관용 링크에서도 동일하게 표시) */}
        {(() => {
          const v3 = payload.derived_context?.v3_metrics;
          const userTemp = v3?.user_temperature ?? 74;
          const targetTemp = v3?.target_temperature ?? 38;
          const backfire = v3?.backfire_risk_percent ?? 72;
          const successProb = v3?.success_probability ?? 46;
          const signalCount = v3?.signal_count ?? 2;
          const teaseScene =
            v3?.tease_scene_summary ||
            "상대방의 답장 호흡과 감정 표현에서 미묘한 온도차가 포착되었습니다.";
          const targetName = payload.target_speaker_label || "상대방";
          const isFlirting = payload.derived_context?.analysis_mode === "flirting";

          return (
            <div className="mb-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full">
                  {isFlirting ? "💘 썸 · 호감도 판독" : "💔 재회 · 애매한 사이 판독"}
                </span>
                <span className="inline-block px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-bold rounded-full">
                  대상: {targetName}
                </span>
              </div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-snug">
                {targetName}의 진짜 속마음 &amp;{" "}
                <span className="text-blue-600">{isFlirting ? "썸 온도차" : "재회 온도차"}</span> 판독
              </h1>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-[12px] font-bold text-zinc-700 mb-2">
                  <span>🌡️ 두 사람의 관계 온도차 (을의 연애 지수)</span>
                  <span className="text-blue-600 font-black">
                    {isFlirting ? "썸 성사" : "재회"} 가능성 {successProb}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                    <span className="text-[11px] font-bold text-zinc-500 block">내 감정/몰입 온도</span>
                    <span className="text-[20px] font-black text-zinc-900">{userTemp}%</span>
                    <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${userTemp}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                    <span className="text-[11px] font-bold text-zinc-500 block">{targetName}의 실제 온도</span>
                    <span className="text-[20px] font-black text-blue-600">{targetTemp}%</span>
                    <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${targetTemp}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[12px]">
                  <span className="font-bold text-amber-800">⚠️ 성급한 연락 주의 지수</span>
                  <span className="font-black text-amber-600">{backfire}%</span>
                </div>
              </div>
            </div>
          );
        })()}

        <PremiumReport
          analysis={syntheticAnalysis}
          isPremium={true}
          onRetry={() => {}}
          onUnlock={() => {}}
        />

        {payload.analysis_id && (
          <PremiumChatSection
            analysisId={payload.analysis_id}
            initialChat={payload.chat}
            targetLabel={payload.target_speaker_label || "상대방"}
            analysisMode={payload.derived_context?.analysis_mode || "reunion"}
            onTopupPay={handleTopupPay}
            isTopupProcessing={isTopupProcessing}
          />
        )}
      </main>
    </div>
  );
}
