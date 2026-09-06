import React from 'react';
import { FinalAnalysis } from '@/lib/analysis/types';
import { PremiumReportLocked } from './PremiumReportLocked';
import { PremiumReportGenerating } from './PremiumReportGenerating';
import { PremiumReportFailed } from './PremiumReportFailed';
import { PremiumCoverPage } from './PremiumCoverPage';
import { AttachmentProfileChart } from './AttachmentProfileChart';

// Placeholders for the 15-chapter sections
import { ExecutiveSection } from './sections/ExecutiveSection';
import { BehaviorSection } from './sections/BehaviorSection';
import { EvidenceSection } from './sections/EvidenceSection';
import { InteractionSection } from './sections/InteractionSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { ActionSection } from './sections/ActionSection';

interface PremiumReportProps {
  analysis: any;
  isPremium: boolean;
  onRetry?: () => void;
  onUnlock?: () => void;
}

export function PremiumReport({ analysis, isPremium, onRetry, onUnlock }: PremiumReportProps) {
  // 1. LOCKED State
  if (!isPremium) {
    return <PremiumReportLocked onUnlock={onUnlock} />;
  }

  // Premium Access Granted
  const reportStatus = analysis.status?.report || 'completed';

  const reportData = analysis.premium_report;
  
  // 2. GENERATING State
  if (reportStatus === 'generating' || reportStatus === 'not_started' || (!reportData && reportStatus !== 'failed')) {
    return <PremiumReportGenerating />;
  }

  // 3. FAILED State
  if (reportStatus === 'failed') {
    return <PremiumReportFailed onRetry={onRetry} />;
  }

  // 5. READY State
  return (
    <>
      {/* 
        PDF 전용 커버 페이지 (웹에서는 hidden)
      */}
      <PremiumCoverPage 
        targetName={analysis.target_speaker_label || '상대방'}
        primaryType={analysis.primary_type}
        anxiety={analysis.attachment_dimensions?.anxiety || 0}
        avoidance={analysis.attachment_dimensions?.avoidance || 0}
      />

      <div className="premium-report-v2-container mt-12 pt-8 border-t border-zinc-200">
        
        {/* 웹 전용 인트로 헤더 (인쇄 시 표지가 있으므로 가림) */}
        <div className="mb-12 text-center print:hidden">
          <h2 className="text-[26px] font-black text-zinc-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            프리미엄 관계 심층 리포트
          </h2>
          <p className="text-[15px] text-zinc-500">대화 속 숨겨진 진짜 속마음을 짚어낸 3,000자 핵심 요약 리포트입니다.</p>
        </div>

        <div className="space-y-16">
          {/* Ch.1, Ch.2: Executive Summary & Attachment Profile */}
          <div className="avoid-page-break">
            <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} />
          </div>

          {/* 2D 프로필 차트 (웹/모바일 화면에서 Ch.1 이후 자연스럽게 노출) */}
          <AttachmentProfileChart 
            anxiety={analysis.attachment_dimensions?.anxiety || 0} 
            avoidance={analysis.attachment_dimensions?.avoidance || 0} 
            primaryType={analysis.primary_type} 
          />

          {/* Ch.3: Behavior Patterns */}
          <BehaviorSection patterns={reportData.behavior_patterns} />

          {/* Ch.4: Evidence Deep Dive */}
          <EvidenceSection evidences={reportData.evidence_deep_dive} />

          {/* Ch.5, Ch.6: Trigger Profile & Interaction Loop */}
          <InteractionSection triggers={reportData.trigger_profile} loop={reportData.interaction_loop} />

          {/* ACTION GUIDE BLOCK (Ch.7 ~ Ch.12) */}
          {/* 이 블록부터는 사용자가 실천해야 하는 Action 요소이므로 다크톤으로 구분 */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 my-16 print:bg-transparent print:text-zinc-900 print:border-t-2 print:border-zinc-300 print:rounded-none print:px-0">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1.5 bg-blue-500/20 text-blue-300 text-[12px] font-bold rounded-lg mb-4 print:bg-zinc-100 print:text-zinc-600">
                ACTION GUIDE
              </span>
              <h2 className="text-[24px] font-black text-white print:text-zinc-900">
                지금부터 어떻게 행동해야 할까요?
              </h2>
              <p className="text-[14px] text-slate-400 mt-2 print:text-zinc-500">
                분석을 넘어, 실제 관계 개선과 대화 단절을 막기 위한 행동 가이드입니다.
              </p>
            </div>
            
            <div className="space-y-16">
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
          
        </div>
      </div>
    </>
  );
}
