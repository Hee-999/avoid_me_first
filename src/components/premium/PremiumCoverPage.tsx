import React from 'react';
import { AttachmentProfileChart } from './AttachmentProfileChart';

interface Props {
  targetName: string;
  primaryType: string;
  anxiety: number;
  avoidance: number;
}

export function PremiumCoverPage({ targetName, primaryType, anxiety, avoidance }: Props) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="hidden print:flex flex-col min-h-screen justify-between bg-white px-12 py-24 page-break-after">
      
      {/* Top Header */}
      <div className="flex justify-between items-start border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-[20px] font-black text-zinc-900 tracking-tight">AVOIDANCE READER</h1>
          <p className="text-[12px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Premium Attachment Analysis</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-medium text-zinc-500">{today}</p>
          <p className="text-[11px] font-bold text-zinc-400 mt-1">개인 보관용 보고서</p>
        </div>
      </div>

      {/* Main Title Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-lg mb-6">
            심층 애착 패턴 분석 리포트
          </span>
          <h2 className="text-[42px] font-black text-zinc-900 leading-tight tracking-tight">
            <span className="text-blue-600">{targetName}</span>님의<br/>
            진짜 속마음과<br/>
            관계 패턴 분석
          </h2>
        </div>

        <div className="mt-12 bg-zinc-50 border border-zinc-200 rounded-3xl p-10 max-w-2xl">
          <h3 className="text-[14px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">주 애착 유형 (Primary Type)</h3>
          <p className="text-[28px] font-black text-zinc-900 mb-8">{primaryType}</p>
          
          <div className="flex items-center gap-12">
            <div>
              <p className="text-[12px] font-bold text-zinc-400 mb-1">불안 차원 (Anxiety)</p>
              <p className="text-[24px] font-black text-zinc-800">{anxiety} <span className="text-[14px] font-medium text-zinc-400">/ 100</span></p>
            </div>
            <div className="w-px h-12 bg-zinc-200"></div>
            <div>
              <p className="text-[12px] font-bold text-zinc-400 mb-1">회피 차원 (Avoidance)</p>
              <p className="text-[24px] font-black text-zinc-800">{avoidance} <span className="text-[14px] font-medium text-zinc-400">/ 100</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Preview on Cover */}
      <div className="w-full max-w-md mx-auto mt-8 opacity-90 scale-90 origin-bottom">
        <AttachmentProfileChart anxiety={anxiety} avoidance={avoidance} primaryType={primaryType} />
      </div>

      {/* Footer Area */}
      <div className="pt-8 border-t border-zinc-200 mt-16 text-center">
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          본 보고서는 인공지능이 대화 패턴을 기반으로 분석한 결과이며, 전문적인 심리 상담이나 의료적 진단을 대체할 수 없습니다.<br/>
          제공된 정보는 참고용으로만 활용하시기 바랍니다.
        </p>
      </div>
      
    </div>
  );
}
