import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';
import FocusFrameBorder from '@/components/ui/shine-border-06';

interface Props {
  summary: PremiumReportV2['executive_summary'];
  profile: PremiumReportV2['attachment_profile'];
  showSummary?: boolean;
  showProfile?: boolean;
}

export function ExecutiveSection({ summary, profile, showSummary = true, showProfile = true }: Props) {
  if (!summary || !profile) return null;

  return (
    <section className="space-y-6 break-keep">
      {/* 01. Executive Summary (FocusFrameBorder) */}
      {showSummary && (
      <FocusFrameBorder duration={2.4} color="#3b82f6" className="shadow-md">
        <div className="bg-white p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11.5px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              핵심 속마음 진단
            </span>
          </div>

          <h3 className="text-[19px] sm:text-[21px] font-black leading-snug mb-3 text-zinc-950">
            {summary.headline || "지금 그 사람의 진짜 속마음"}
          </h3>

          <p className="text-[14px] text-zinc-600 leading-relaxed mb-5">
            {summary.body}
          </p>

          <div className="space-y-2 pt-4 border-t border-zinc-100">
            {(summary.key_points || []).map((point, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-zinc-50/80 border border-zinc-100 p-3.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[13.5px] font-semibold text-zinc-800 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </FocusFrameBorder>
      )}

      {/* 02. Attachment Profile */}
      {showProfile && (
      <div className="bg-white border border-zinc-200 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="space-y-3.5">
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <span className="text-[12px] font-extrabold text-blue-700 block mb-1">
              그 사람의 기본 연애 성향
            </span>
            <p className="text-[13.5px] text-zinc-800 leading-relaxed">
              {profile.primary_interpretation}
            </p>
          </div>
          
          {profile.secondary_interpretation && (
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <span className="text-[12px] font-extrabold text-purple-700 block mb-1">
                놓치기 쉬운 또 다른 면모
              </span>
              <p className="text-[13.5px] text-zinc-800 leading-relaxed">
                {profile.secondary_interpretation}
              </p>
            </div>
          )}
          
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/70">
            <span className="text-[12px] font-extrabold text-zinc-700 block mb-1">
              그래서 우리 둘 사이에 온도차가 생긴 거예요
            </span>
            <p className="text-[13.5px] text-zinc-700 leading-relaxed">
              {profile.dimension_interpretation}
            </p>
          </div>
        </div>
      </div>
      )}
    </section>
  );
}
