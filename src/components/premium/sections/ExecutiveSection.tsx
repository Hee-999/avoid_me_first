import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

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
      {/* 01. Executive Summary */}
      {showSummary && (
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[11.5px] font-bold mb-4 backdrop-blur-md">
          핵심 속마음 진단
        </span>
        
        <h3 className="text-[19px] sm:text-[21px] font-black leading-snug mb-3.5 text-white/95">
          {summary.headline || "지금 그 사람의 진짜 속마음"}
        </h3>
        
        <p className="text-[14px] text-blue-100/95 leading-relaxed mb-6">
          {summary.body}
        </p>
        
        <div className="space-y-2.5">
          {(summary.key_points || []).map((point, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-black/20 p-3.5 rounded-xl">
              <span className="text-blue-300 font-black shrink-0">{idx + 1}</span>
              <p className="text-[13.5px] font-medium text-white/95 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
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
