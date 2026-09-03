import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  summary: PremiumReportV2['executive_summary'];
  profile: PremiumReportV2['attachment_profile'];
}

export function ExecutiveSection({ summary, profile }: Props) {
  if (!summary || !profile) return null;

  return (
    <section className="space-y-6">
      {/* 01. Executive Summary */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[12px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
          Ch.1 Executive Summary
        </span>
        
        <h3 className="text-[24px] font-black leading-tight mb-4 text-white/95">
          {summary.headline || "심층 분석 요약"}
        </h3>
        
        <p className="text-[15px] text-blue-100/90 leading-relaxed mb-8">
          {summary.body}
        </p>
        
        <div className="space-y-3">
          {(summary.key_points || []).map((point, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-black/20 p-4 rounded-xl">
              <span className="text-blue-300 font-black shrink-0">{idx + 1}</span>
              <p className="text-[14px] font-medium text-white/90">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 02. Attachment Profile */}
      <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm">
        <h3 className="text-[18px] font-black text-zinc-900 mb-6 flex items-center gap-2">
          <span className="text-xl">🧬</span> Ch.2 애착 프로필 해석
        </h3>
        
        <div className="space-y-6">
          <div>
            <span className="text-[12px] font-bold text-blue-600 block mb-2">주 성향 (Primary)</span>
            <p className="text-[14px] text-zinc-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              {profile.primary_interpretation}
            </p>
          </div>
          
          {profile.secondary_interpretation && (
            <div>
              <span className="text-[12px] font-bold text-purple-600 block mb-2">보조 성향 (Secondary)</span>
              <p className="text-[14px] text-zinc-700 leading-relaxed bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                {profile.secondary_interpretation}
              </p>
            </div>
          )}
          
          <div>
            <span className="text-[12px] font-bold text-zinc-500 block mb-2">불안/회피 축 해석</span>
            <p className="text-[14px] text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              {profile.dimension_interpretation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
