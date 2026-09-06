import React from 'react';
import { PremiumReportV2 } from '@/lib/report/premium/types';

interface Props {
  anxiety: number;
  avoidance: number;
  primaryType: string;
}

export function AttachmentProfileChart({ anxiety, avoidance, primaryType }: Props) {
  // Normalize scores to 0-100 just in case
  const x = Math.max(0, Math.min(100, avoidance));
  const y = Math.max(0, Math.min(100, anxiety));
  
  // Calculate percentage positions for the marker
  const leftPos = `${x}%`;
  const bottomPos = `${y}%`;

  return (
    <div className="w-full max-w-sm mx-auto my-8 avoid-page-break">
      <div className="text-center mb-6">
        <h4 className="text-[15px] font-bold text-zinc-900 mb-1">애착 차원 프로필 (Anxiety × Avoidance)</h4>
        <p className="text-[12px] text-zinc-500">현재의 감정 및 회피 성향이 어느 사분면에 위치하는지 보여줍니다.</p>
      </div>

      <div className="relative w-full aspect-square bg-zinc-50 rounded-xl border border-zinc-200 p-4">
        {/* Graph Area */}
        <div className="relative w-full h-full bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
          {/* Grid Lines */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-200"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-200"></div>
          
          {/* Grid ticks (subtle) */}
          <div className="absolute left-0 right-0 top-1/4 h-px bg-zinc-100 border-dashed border-t"></div>
          <div className="absolute left-0 right-0 top-3/4 h-px bg-zinc-100 border-dashed border-t"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-zinc-100 border-dashed border-l"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-zinc-100 border-dashed border-l"></div>

          {/* Quadrant Labels */}
          {/* Q1: Top-Left (Low Avoidance, High Anxiety) = Preoccupied */}
          <div className="absolute top-2 left-2 text-[10px] font-bold text-amber-500/80">몰입/불안형<br/><span className="text-[9px] font-medium text-amber-400/80">Preoccupied</span></div>
          {/* Q2: Top-Right (High Avoidance, High Anxiety) = Fearful */}
          <div className="absolute top-2 right-2 text-right text-[10px] font-bold text-indigo-500/80">공포-회피형<br/><span className="text-[9px] font-medium text-indigo-400/80">Fearful</span></div>
          {/* Q3: Bottom-Left (Low Avoidance, Low Anxiety) = Secure */}
          <div className="absolute bottom-2 left-2 text-[10px] font-bold text-emerald-500/80">안정형<br/><span className="text-[9px] font-medium text-emerald-400/80">Secure</span></div>
          {/* Q4: Bottom-Right (High Avoidance, Low Anxiety) = Dismissive */}
          <div className="absolute bottom-2 right-2 text-right text-[10px] font-bold text-blue-500/80">거부-회피형<br/><span className="text-[9px] font-medium text-blue-400/80">Dismissive</span></div>

          {/* User Marker */}
          <div 
            className="absolute w-4 h-4 rounded-full bg-blue-600 shadow-md transform -translate-x-1/2 translate-y-1/2 z-10 border-2 border-white"
            style={{ left: leftPos, bottom: bottomPos }}
          >
            {/* Ping animation effect */}
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75 print:hidden"></div>
            {/* Tooltip-like label */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap">
              {primaryType}
            </div>
          </div>
        </div>

        {/* Axis Labels */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full text-[10px] font-bold text-zinc-400 mt-2">
          회피 (Avoidance) <span className="font-medium text-zinc-300">→</span>
        </div>
        <div className="absolute top-1/2 -left-1 -translate-x-full -translate-y-1/2 -rotate-90 text-[10px] font-bold text-zinc-400 mr-2 whitespace-nowrap">
          불안 (Anxiety) <span className="font-medium text-zinc-300">→</span>
        </div>
      </div>
      
      {/* Legend / Info */}
      <div className="mt-8 flex justify-center gap-6 text-[11px] font-medium text-zinc-500">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> 현재 위치</div>
        <div>Anxiety: {y.toFixed(1)} / Avoidance: {x.toFixed(1)}</div>
      </div>
    </div>
  );
}
