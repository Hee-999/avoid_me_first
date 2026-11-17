"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getMappedType, getAnalysisUiPresentation } from "@/lib/analysis/types";

export default function ShareResult() {
  const router = useRouter();
  const params = useParams();
  const shareId = params.share_id as string;

  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    fetch(`/api/share/public/${shareId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("존재하지 않거나 비공개된 분석 결과입니다.");
        }
        return res.json();
      })
      .then((data) => setAnalysis(data))
      .catch((err) => setError(err.message));
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm border border-zinc-200">
          <p className="text-red-500 font-bold mb-2">접근 불가</p>
          <p className="text-zinc-600 text-[14px]">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[13px] font-bold"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  const {
    attachment_dimensions,
    attachment_fitness,
    primary_type,
    secondary_type,
    share_alias,
    analysis_mode,
    v3_metrics,
  } = analysis;

  const partnerName = share_alias || "상대방";
  const isFlirting = analysis_mode === "flirting";
  const myTemp = v3_metrics?.my_temperature ?? 68;
  const partnerTemp = v3_metrics?.partner_temperature ?? 48;
  const tempGap = Math.abs(myTemp - partnerTemp);
  const cautionScore = v3_metrics?.backfire_probability ?? 65;

  const uiPres = getAnalysisUiPresentation({
    primaryType: primary_type,
    anxietyScore: attachment_dimensions?.anxiety ?? 0,
    avoidanceScore: attachment_dimensions?.avoidance ?? 0,
    anxietyStatus: attachment_dimensions?.anxiety_status,
    avoidanceStatus: attachment_dimensions?.avoidance_status,
    speakerLabel: partnerName,
  });

  const isAnxietyInsufficient = attachment_dimensions?.anxiety_status === "insufficient";
  const isAvoidanceInsufficient = attachment_dimensions?.avoidance_status === "insufficient";

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] font-black text-zinc-900 tracking-tight">러브패턴</span>
          <span className="text-[12px] font-bold text-zinc-500">공유된 속마음 &amp; 온도차 요약</span>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10 space-y-6">
        {/* 1. V3 온도차 & 한 줄 판독 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full">
              {isFlirting ? "💘 썸 · 호감도 판독" : "💔 재회 · 애매한 사이 판독"}
            </span>
            <span className="text-[11px] font-bold text-zinc-500">
              분석 대상: {partnerName}
            </span>
          </div>

          <div>
            <p className="text-[12px] font-bold text-blue-600 mb-1">
              카톡 대화 기반 두 사람의 온도차
            </p>
            <h1 className="text-[21px] font-black text-zinc-900 tracking-tight leading-snug">
              나와 {partnerName}님의 현재 온도차는{" "}
              <span className="text-rose-600">{tempGap}°C</span>입니다.
            </h1>
          </div>

          {/* 쌍방 온도 게이지 */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-3.5">
            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-700">나의 대화 온도</span>
                <span className="text-rose-600 font-black">{myTemp}°C</span>
              </div>
              <div className="w-full bg-zinc-200/80 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${myTemp}%` }}
                  transition={{ duration: 0.9 }}
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                <span className="text-zinc-700">{partnerName}님의 반응 온도</span>
                <span className="text-blue-600 font-black">{partnerTemp}°C</span>
              </div>
              <div className="w-full bg-zinc-200/80 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${partnerTemp}%` }}
                  transition={{ duration: 0.9 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* 한 줄 판독 요약 */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <span className="text-[11px] font-extrabold text-blue-700 block mb-1">
              💡 대화 흐름 한 줄 요약
            </span>
            <p className="text-[13.5px] text-zinc-800 leading-relaxed font-medium">
              {v3_metrics?.one_line_summary || uiPres.description}
            </p>
          </div>

          {/* 주의 지수 배지 */}
          <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/70 rounded-xl px-4 py-3 text-[12px]">
            <span className="font-bold text-amber-900">성급한 연락 주의 지수</span>
            <span className="font-black text-amber-700">{cautionScore}%</span>
          </div>
        </motion.div>

        {/* 2. 보조 근거: 상대방의 관계 성향 적합도 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6"
        >
          <div className="mb-4">
            <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">
              왜 이런 온도차가 나타났을까?
            </span>
            <h3 className="text-[15px] font-black text-zinc-900">
              {partnerName}님의 관계 반응 성향: <span className="text-blue-600">{uiPres.headlineMain}</span>
            </h3>
            {uiPres.mode === "standard" && secondary_type && (
              <p className="mt-1 text-[12px] text-zinc-500">
                * 상황에 따라 <strong className="text-zinc-700">{getMappedType(secondary_type).ko}</strong> 특성도 함께 나타납니다.
              </p>
            )}
          </div>

          {uiPres.showFitnessBars && (
            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1">
                  <span className={primary_type === "secure" ? "text-blue-600 font-bold" : "text-zinc-600"}>안정형</span>
                  <span className="text-zinc-900">{attachment_fitness.secure}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${attachment_fitness.secure}%` }} className="h-full bg-emerald-400 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1">
                  <span className={uiPres.mode === "anxiety_dominant" || primary_type === "preoccupied" ? "text-blue-600 font-bold" : "text-zinc-600"}>몰입/불안형</span>
                  {isAnxietyInsufficient ? (
                    <span className="text-amber-700 text-[11px]">단서 부족</span>
                  ) : (
                    <span className="text-zinc-900">{attachment_fitness.preoccupied}%</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  {!isAnxietyInsufficient && (
                    <div style={{ width: `${attachment_fitness.preoccupied}%` }} className="h-full bg-amber-400 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1">
                  <span className={uiPres.mode === "avoidance_dominant" || primary_type === "dismissing" || primary_type === "dismissive-avoidant" ? "text-blue-600 font-bold" : "text-zinc-600"}>거부-회피형</span>
                  {isAvoidanceInsufficient ? (
                    <span className="text-amber-700 text-[11px]">단서 부족</span>
                  ) : (
                    <span className="text-zinc-900">{attachment_fitness.dismissing}%</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  {!isAvoidanceInsufficient && (
                    <div style={{ width: `${attachment_fitness.dismissing}%` }} className="h-full bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] font-bold mb-1">
                  <span className={primary_type === "fearful" || primary_type === "fearful-avoidant" ? "text-blue-600 font-bold" : "text-zinc-600"}>공포-회피형</span>
                  <span className="text-zinc-900">{attachment_fitness.fearful}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${attachment_fitness.fearful}%` }} className="h-full bg-indigo-500 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-zinc-100 flex justify-around text-center">
            <div>
              <span className="block text-[11px] text-zinc-400 font-bold mb-0.5">관계 불안 지수</span>
              <span className="text-[16px] font-black text-zinc-800">
                {isAnxietyInsufficient ? "단서 부족" : `${attachment_dimensions.anxiety}점`}
              </span>
            </div>
            <div className="w-px bg-zinc-100" />
            <div>
              <span className="block text-[11px] text-zinc-400 font-bold mb-0.5">거리두기(방어벽) 지수</span>
              <span className="text-[16px] font-black text-zinc-800">
                {isAvoidanceInsufficient ? "단서 부족" : `${attachment_dimensions.avoidance}점`}
              </span>
            </div>
          </div>
        </motion.div>

        <p className="text-[11px] text-zinc-400 text-center">
          🔒 공유 링크에서는 원문 카톡 대화 및 유료 심층 리포트·1:1 상담 내역이 절대 공개되지 않습니다.
        </p>

        {/* Viral CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <h4 className="text-[18px] font-black mb-2">그 사람과 나의 진짜 온도차는?</h4>
            <p className="text-[13px] text-zinc-300 mb-5 leading-relaxed">
              카카오톡 대화나 캡처만 넣으면<br />두 사람의 온도차와 숨은 속마음을 판독해 드립니다.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 bg-white text-zinc-900 text-[15px] font-bold rounded-xl hover:bg-zinc-100 transition transform active:scale-95 shadow-lg"
            >
              나도 카톡으로 속마음 판독하기
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
