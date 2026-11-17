import React from 'react';
import { getMappedType } from '@/lib/analysis/types';

interface Props {
  anxiety: number;
  avoidance: number;
  primaryType: string;
  anxietyStatus?: string;
  avoidanceStatus?: string;
}

export function AttachmentProfileChart({ anxiety, avoidance, primaryType, anxietyStatus, avoidanceStatus }: Props) {
  const x = Math.max(0, Math.min(100, avoidance));
  const y = Math.max(0, Math.min(100, anxiety));
  const koType = getMappedType(primaryType)?.ko || primaryType;

  const leftPos = `${x}%`;
  const bottomPos = `${y}%`;

  return (
    <div className="w-full max-w-sm mx-auto my-6 avoid-page-break break-keep">
      <div className="text-center mb-5">
        <h4 className="text-[15px] font-bold text-zinc-900 mb-1">카톡 반응으로 본 상대의 심리 위치</h4>
        <p className="text-[12px] text-zinc-500">이번 대화에서 드러난 감정 확인 욕구와 방어벽 수준이에요.</p>
      </div>

      <div className="relative w-full aspect-square bg-zinc-50 rounded-xl border border-zinc-200 p-4">
        <div className="relative w-full h-full bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-200"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-200"></div>

          <div className="absolute left-0 right-0 top-1/4 h-px bg-zinc-100 border-dashed border-t"></div>
          <div className="absolute left-0 right-0 top-3/4 h-px bg-zinc-100 border-dashed border-t"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-zinc-100 border-dashed border-l"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-zinc-100 border-dashed border-l"></div>

          <div className="absolute top-2 left-2 text-[10px] font-bold text-amber-600/80">
            몰입/불안형<br/><span className="text-[9px] font-medium text-amber-500/80">연락·확신 추구</span>
          </div>
          <div className="absolute top-2 right-2 text-right text-[10px] font-bold text-indigo-600/80">
            공포-회피형<br/><span className="text-[9px] font-medium text-indigo-400/80">기대와 방어 공존</span>
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] font-bold text-emerald-600/80">
            안정형<br/><span className="text-[9px] font-medium text-emerald-500/80">편안한 소통</span>
          </div>
          <div className="absolute bottom-2 right-2 text-right text-[10px] font-bold text-blue-600/80">
            거부-회피형<br/><span className="text-[9px] font-medium text-blue-400/80">독립성·거리두기</span>
          </div>

          <div
            className="absolute w-4 h-4 rounded-full bg-blue-600 shadow-md transform -translate-x-1/2 translate-y-1/2 z-10 border-2 border-white"
            style={{ left: leftPos, bottom: bottomPos }}
          >
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75 print:hidden"></div>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap">
              {koType}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full text-[10px] font-bold text-zinc-400 mt-2">
          거리두기·방어벽 (회피 지수) <span className="font-medium text-zinc-300">→</span>
        </div>
        <div className="absolute top-1/2 -left-1 -translate-x-full -translate-y-1/2 -rotate-90 text-[10px] font-bold text-zinc-400 mr-2 whitespace-nowrap">
          관계 확인·불안 지수 <span className="font-medium text-zinc-300">→</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-5 text-[11.5px] font-semibold text-zinc-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span> 대화 속 상대 위치
        </div>
        <div>
          관계 불안 지수: {anxietyStatus === 'insufficient' ? '단서 부족' : `${y.toFixed(0)}점`} · 거리두기 지수: {avoidanceStatus === 'insufficient' ? '단서 부족' : `${x.toFixed(0)}점`}
        </div>
      </div>
    </div>
  );
}
