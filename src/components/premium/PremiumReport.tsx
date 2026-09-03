import React from 'react';
import { MvpResultV2 } from '@/lib/analysis/mvp/types';
import { PremiumReportLocked } from './PremiumReportLocked';
import { PremiumReportGenerating } from './PremiumReportGenerating';
import { PremiumReportFailed } from './PremiumReportFailed';

// Placeholders for the 15-chapter sections (will be implemented next)
import { ExecutiveSection } from './sections/ExecutiveSection';
import { BehaviorSection } from './sections/BehaviorSection';
import { EvidenceSection } from './sections/EvidenceSection';
import { InteractionSection } from './sections/InteractionSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { ActionSection } from './sections/ActionSection';

interface PremiumReportProps {
  analysis: MvpResultV2;
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
  
  // 2. GENERATING State (or missing data fallback)
  if (reportStatus === 'generating' || reportStatus === 'not_started' || (!reportData && reportStatus !== 'failed')) {
    return <PremiumReportGenerating />;
  }

  // 3. FAILED State
  if (reportStatus === 'failed') {
    return <PremiumReportFailed onRetry={onRetry} />;
  }

  // 5. READY State (Full 15-Chapter Rendering)
  return (
    <div className="premium-report-v2-container mt-12 pt-8 border-t border-zinc-200">
      <div className="mb-12 text-center">
        <h2 className="text-[26px] font-black text-zinc-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          프리미엄 관계 심층 리포트
        </h2>
        <p className="text-[15px] text-zinc-500">대화 속 숨겨진 진짜 속마음을 짚어낸 3,000자 핵심 요약 리포트입니다.</p>
      </div>

      <div className="space-y-16">
        {/* Ch.1, Ch.2: Executive Summary & Attachment Profile */}
        <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} />

        {/* Ch.3: Behavior Patterns */}
        <BehaviorSection patterns={reportData.behavior_patterns} />

        {/* Ch.4: Evidence Deep Dive */}
        <EvidenceSection evidences={reportData.evidence_deep_dive} />

        {/* Ch.5, Ch.6: Trigger Profile & Interaction Loop */}
        <InteractionSection triggers={reportData.trigger_profile} loop={reportData.interaction_loop} />

        {/* Ch.7, Ch.8: Conflict Pattern & Communication Guide */}
        <CommunicationSection conflict={reportData.conflict_pattern} guide={reportData.communication_guide} />

        {/* Ch.9 ~ Ch.12: Action Plan, Rewrites, Signals, Manual */}
        <ActionSection 
          rewrites={reportData.conversation_rewrites}
          recovery={reportData.recovery_signals}
          risk={reportData.risk_signals}
          plan={reportData.action_plan}
          manual={reportData.manual_summary}
        />
      </div>
    </div>
  );
}
