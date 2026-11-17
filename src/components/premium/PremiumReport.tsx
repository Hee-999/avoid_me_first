import React from 'react';
import { PremiumReportLocked } from './PremiumReportLocked';
import { PremiumReportGenerating } from './PremiumReportGenerating';
import { PremiumReportFailed } from './PremiumReportFailed';
import { PremiumCoverPage } from './PremiumCoverPage';
import { AttachmentProfileChart } from './AttachmentProfileChart';

import { ExecutiveSection } from './sections/ExecutiveSection';
import { EvidenceSection } from './sections/EvidenceSection';
import { InteractionSection } from './sections/InteractionSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { ActionSection } from './sections/ActionSection';

interface PremiumReportProps {
  analysis: any;
  isPremium: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  onUnlock?: () => void;
  isProcessing?: boolean;
}

export function PremiumReport({ analysis, isPremium, onRetry, isRetrying = false, onUnlock, isProcessing = false }: PremiumReportProps) {
  if (!isPremium) {
    return <PremiumReportLocked analysis={analysis} onUnlock={onUnlock} isProcessing={isProcessing} />;
  }

  const reportStatus = analysis.status?.report || 'completed';
  const reportData = analysis.premium_report;

  if (reportStatus === 'generating' || reportStatus === 'not_started' || (!reportData && reportStatus !== 'failed')) {
    return <PremiumReportGenerating />;
  }

  if (reportStatus === 'failed') {
    return <PremiumReportFailed onRetry={onRetry} isRetrying={isRetrying} />;
  }

  return (
    <>
      <PremiumCoverPage 
        targetName={analysis.target_speaker_label || '상대방'}
        primaryType={analysis.primary_type}
        anxiety={analysis.attachment_dimensions?.anxiety || 0}
        avoidance={analysis.attachment_dimensions?.avoidance || 0}
        anxietyStatus={analysis.attachment_dimensions?.anxiety_status}
        avoidanceStatus={analysis.attachment_dimensions?.avoidance_status}
      />

      <div className="premium-report-v2-container mt-8 pt-6 border-t border-zinc-200 break-keep">
        <div className="space-y-12">
          {/* 1. 핵심 속마음 해부 (Executive Summary) */}
          <div className="avoid-page-break space-y-5">
            <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} showProfile={false} />

            {/* 일시적 피로 vs 진짜 거리두기 구별법 */}
            <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 text-[13.5px] leading-relaxed text-zinc-700 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[13px]">
                <span>💡</span>
                <span>잠깐 지친 걸까요, 아니면 진짜 거리를 두는 걸까요?</span>
              </div>
              <p>
                그 사람이 대화를 미루거나 피곤하다고 물러선 건 원래 방어벽이 높은 성향 때문일 수도 있지만, 그날따라 유독 지쳐서 감정 쓸 여유가 없었을 가능성도 있어요.
              </p>
              <p className="text-zinc-600 text-[13px] pt-2 border-t border-indigo-100/60">
                감정이 가라앉은 뒤에 그 사람이 먼저 슬쩍 말을 걸어오는지, 아니면 계속 없던 일처럼 덮으려 하는지 지켜보면 진짜 속마음을 바로 알 수 있어요.
              </p>
            </div>
          </div>

          {/* 2. 대화 장면 근거 & 상호작용 흐름 */}
          <EvidenceSection evidences={reportData.evidence_deep_dive} />
          <InteractionSection triggers={reportData.trigger_profile} loop={reportData.interaction_loop} />

          {/* 3. 실전 카톡 & 대응 가이드 (다크 박스) */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 print:bg-transparent print:text-zinc-900 print:border-t-2 print:border-zinc-300 print:rounded-none print:px-0">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-[11.5px] font-bold rounded-full mb-3 print:bg-zinc-100 print:text-zinc-600">
                실전 카톡 &amp; 대응 가이드
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-black text-white print:text-zinc-900">
                지금부터 이렇게 움직여 보세요
              </h2>
              <p className="text-[13px] text-slate-400 mt-1.5 print:text-zinc-500">
                상대의 방어벽을 낮추고 답장을 끌어내는 현실 대처법이에요.
              </p>
            </div>
            
            <div className="space-y-12">
              <CommunicationSection conflict={reportData.conflict_pattern} guide={reportData.communication_guide} />
              <ActionSection 
                rewrites={reportData.conversation_rewrites}
                recovery={reportData.recovery_signals}
                risk={reportData.risk_signals}
                plan={reportData.action_plan}
                manual={reportData.manual_summary}
              />
            </div>
          </div>

          {/* 4. 하단 심리 배경 근거 */}
          <div className="pt-8 border-t border-zinc-200 space-y-8">
            <div className="bg-zinc-100/80 border border-zinc-200/80 rounded-3xl p-5 sm:p-6 text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-white text-zinc-700 text-[11px] font-bold rounded-full border border-zinc-200/80">
                심리학적 배경 근거
              </span>
              <h3 className="text-[17px] sm:text-[19px] font-black text-zinc-900">
                그 사람이 자꾸 선을 긋는 진짜 이유
              </h3>
              <p className="text-[13px] text-zinc-600 max-w-md mx-auto leading-relaxed">
                카톡 답장 속도와 감정 표현에서 느껴진 온도차는 그 사람 안의 <strong>관계 불안 지수</strong>와 <strong>거리두기 지수</strong>에서 비롯돼요.
              </p>
            </div>
            <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} showSummary={false} />
            <AttachmentProfileChart 
              anxiety={analysis.attachment_dimensions?.anxiety || 0} 
              avoidance={analysis.attachment_dimensions?.avoidance || 0} 
              primaryType={analysis.primary_type} 
              anxietyStatus={analysis.attachment_dimensions?.anxiety_status}
              avoidanceStatus={analysis.attachment_dimensions?.avoidance_status}
            />
          </div>
        </div>
      </div>
    </>
  );
}
