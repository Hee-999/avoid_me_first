import React from 'react';
import { FinalAnalysis } from '@/lib/analysis/types';
import { PremiumCoverPage } from './PremiumCoverPage';
import { AttachmentProfileChart } from './AttachmentProfileChart';
import { ExecutiveSection } from './sections/ExecutiveSection';
import { BehaviorSection } from './sections/BehaviorSection';
import { EvidenceSection } from './sections/EvidenceSection';
import { TriggerSection, LoopSection } from './sections/InteractionSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { RewriteSection, SignalSection, PlanSection, ManualSection } from './sections/ActionSection';

interface Props {
  analysis: FinalAnalysis;
  isPremium: boolean;
}

export function PrintablePremiumReport({ analysis, isPremium }: Props) {
  if (!isPremium) return null;

  const reportStatus = analysis.status?.report || 'completed';
  const reportData = analysis.premium_report;

  if (reportStatus !== 'completed' && reportStatus !== 'ready' || !reportData) {
    return null;
  }

  return (
    <div className="hidden print:block w-full max-w-none bg-white text-zinc-900 m-0 p-0" style={{ fontFamily: "'Pretendard', sans-serif" }}>
      
      {/* Group 1: Cover Page */}
      <div className="break-after-page">
        <PremiumCoverPage 
          targetName={analysis.target_speaker_label || '상대방'}
          primaryType={analysis.primary_type}
          anxiety={analysis.attachment_dimensions?.anxiety || 0}
          avoidance={analysis.attachment_dimensions?.avoidance || 0}
        />
      </div>

      {/* Group 2: Attachment Profile Intro + Chart */}
      <div className="break-before-page break-after-auto pt-10">
        <div className="mb-12">
          <h2 className="text-[26px] font-black text-zinc-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            프리미엄 관계 심층 리포트
          </h2>
          <p className="text-[15px] text-zinc-500">대화 속 숨겨진 진짜 속마음을 짚어낸 핵심 요약 리포트입니다.</p>
        </div>
        <AttachmentProfileChart 
          anxiety={analysis.attachment_dimensions?.anxiety || 0} 
          avoidance={analysis.attachment_dimensions?.avoidance || 0} 
          primaryType={analysis.primary_type} 
        />
      </div>

      {/* Group 3: Ch.1 Executive Summary + Ch.2 Profile Interpretation */}
      <div className="break-before-page pt-10">
        <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} />
      </div>

      {/* Group 4: Ch.3 Behavior Patterns */}
      <div className="break-before-page pt-10">
        <BehaviorSection patterns={reportData.behavior_patterns} />
      </div>

      {/* Group 5: Ch.4 Evidence Deep Dive */}
      <div className="break-before-page pt-10">
        <EvidenceSection evidences={reportData.evidence_deep_dive} />
      </div>

      {/* Group 6: Ch.5 Trigger Profile + Ch.6 Loop */}
      <div className="break-before-page pt-10">
        <TriggerSection triggers={reportData.trigger_profile} />
        <div className="mt-12">
          <LoopSection loop={reportData.interaction_loop} />
        </div>
      </div>

      {/* Group 7: Action Guide Intro + Ch.7 Communication */}
      <div className="break-before-page pt-10">
        <div className="text-center mb-12 bg-zinc-50 py-10 px-6 rounded-2xl border border-zinc-200">
          <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-600 text-[12px] font-bold rounded-lg mb-4">
            ACTION GUIDE
          </span>
          <h2 className="text-[24px] font-black text-zinc-900">
            지금부터 어떻게 행동해야 할까요?
          </h2>
          <p className="text-[14px] text-zinc-500 mt-2">
            분석을 넘어, 실제 관계 개선과 대화 단절을 막기 위한 행동 가이드입니다.
          </p>
        </div>
        <CommunicationSection conflict={reportData.conflict_pattern} guide={reportData.communication_guide} />
      </div>

      {/* Group 9: Ch.9 Conversation Rewrites */}
      <div className="break-before-page pt-10">
        <RewriteSection rewrites={reportData.conversation_rewrites} />
      </div>

      {/* Group 10: Ch.10 Signals + Ch.11 Action Plan */}
      <div className="break-before-page pt-10">
        <SignalSection recovery={reportData.recovery_signals} risk={reportData.risk_signals} />
        <div className="mt-12">
          <PlanSection plan={reportData.action_plan} />
        </div>
      </div>

      {/* Group 11: Ch.12 Manual Summary */}
      <div className="break-before-page pt-10 pb-20">
        <ManualSection manual={reportData.manual_summary} />
      </div>
      
    </div>
  );
}
