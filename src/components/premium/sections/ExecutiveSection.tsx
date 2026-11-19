import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';
import FocusFrameBorder from '@/components/ui/shine-border-06';

interface Props {
  summary: PremiumReportV2['executive_summary'];
  profile: PremiumReportV2['attachment_profile'];
  showSummary?: boolean;
  showProfile?: boolean;
  isFlirting?: boolean;
  chapterLabel?: string;
}

export function ExecutiveSection({
  summary,
  profile,
  showSummary = true,
  showProfile = true,
  isFlirting = false,
  chapterLabel = '제1장',
}: Props) {
  if (!summary || !profile) return null;

  return (
    <section className="space-y-5 break-keep">
      {/* 제1장. 핵심 속마음 진단 + 비학술 설계도 요약 */}
      {showSummary && (
      <>
        <div className="text-left">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-black tracking-wide mb-2">
            {chapterLabel}
          </span>
          <h3 className="text-[18px] sm:text-[19px] font-black text-zinc-900">
            {isFlirting ? '상대의 진짜 속마음 & 호감 설계도' : '상대의 진짜 속마음 & 관계 설계도'}
          </h3>
          <p className="text-[13px] text-zinc-500 mt-1">
            {isFlirting
              ? '상대가 내게 얼마나 마음을 열고 있는지, 왜 이런 템포로 답장하는지 핵심부터 짚어드릴게요.'
              : '상대가 나를 밀어내는 것처럼 보여도 그 안에 어떤 마음이 작동하고 있는지 핵심부터 짚어드릴게요.'}
          </p>
        </div>

        {/* 바솔로뮤 비학술 설계도 요약 (2줄) */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-[12.5px] text-zinc-700 leading-relaxed space-y-1">
          <p className="font-extrabold text-zinc-900 text-[12px]">
            🧭 이 리포트를 읽는 핵심 기준 (마음의 거리 × 자기 보호)
          </p>
          <p>
            {isFlirting
              ? '사람마다 상대에게 기대고 싶은 마음과, 섣불리 상처받지 않으려는 신중함의 균형이 달라요. 아래 장면들은 그 사람이 두 마음 사이에서 어떻게 템포를 조절하는지 보여주는 기록이에요.'
              : '사람마다 상대와 가까워지고 싶은 마음과, 감정이 버거울 때 스스로를 지키려는 방어 본능이 달라요. 아래 장면들은 그 사람이 두 마음 사이에서 어떻게 거리를 조절하는지 보여주는 기록이에요.'}
          </p>
        </div>

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
      </>
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
