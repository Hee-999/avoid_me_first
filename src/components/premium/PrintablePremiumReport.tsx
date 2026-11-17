import React from 'react';
import { FinalAnalysis } from '@/lib/analysis/types';
import { PremiumCoverPage } from './PremiumCoverPage';
import { AttachmentProfileChart } from './AttachmentProfileChart';
import { ExecutiveSection } from './sections/ExecutiveSection';
import { BehaviorSection } from './sections/BehaviorSection';
import { EvidenceSection } from './sections/EvidenceSection';
import { TriggerSection, LoopSection } from './sections/InteractionSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { ActionSection } from './sections/ActionSection';

interface Props {
  analysis: FinalAnalysis;
  isPremium: boolean;
}

export function PrintablePremiumReport({ analysis, isPremium }: Props) {
  if (!isPremium) return null;

  const reportStatus = analysis.status?.report || 'completed';
  const reportData = analysis.premium_report;

  if ((reportStatus !== 'completed' && reportStatus !== 'ready') || !reportData) {
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
          anxietyStatus={analysis.attachment_dimensions?.anxiety_status}
          avoidanceStatus={analysis.attachment_dimensions?.avoidance_status}
        />
      </div>

      {/* Group 2: 1. 핵심 속마음 해부 */}
      <div className="break-before-page pt-10 space-y-6">
        <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} showProfile={false} />
        <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 text-[13px] leading-relaxed text-zinc-700 space-y-2">
          <div className="font-bold text-indigo-700 text-[12.5px]">
            💡 일시적 피로 vs 진짜 거리두기 구별법
          </div>
          <p>
            이번 대화에서 나타난 거리두기나 대화 미루기 반응은 {analysis.target_speaker_label || '상대방'}의 기질적인 방어 성향일 수도 있지만, 당시 극심한 피로나 스트레스로 인한 일시적인 감정 과부하 상태였을 가능성도 함께 고려해야 합니다.
          </p>
        </div>
      </div>

      {/* Group 3: 2. 주요 카톡 장면별 속마음 근거 (Evidence) */}
      <div className="break-before-page pt-10">
        <EvidenceSection evidences={reportData.evidence_deep_dive} />
      </div>

      {/* Group 4: 3. 반응 유발 요인 & 상호작용 흐름 */}
      {(reportData.trigger_profile?.length > 0 || reportData.interaction_loop?.steps?.length > 0) && (
        <div className="break-before-page pt-10">
          <TriggerSection triggers={reportData.trigger_profile} />
          <div className="mt-12">
            <LoopSection loop={reportData.interaction_loop} />
          </div>
        </div>
      )}

      {/* Group 5: 4. 실전 카톡 & 대응 가이드 */}
      <div className="break-before-page pt-10">
        <div className="text-center mb-12 bg-zinc-50 py-10 px-6 rounded-2xl border border-zinc-200">
          <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-600 text-[12px] font-bold rounded-lg mb-4">
            실전 카톡 &amp; 대응 가이드
          </span>
          <h2 className="text-[24px] font-black text-zinc-900">
            지금부터 어떻게 행동해야 할까요?
          </h2>
          <p className="text-[14px] text-zinc-500 mt-2">
            금지 멘트부터 바로 복사해서 쓰는 상황별 카톡 답장까지 한눈에 정리했습니다.
          </p>
        </div>
        <CommunicationSection conflict={reportData.conflict_pattern} guide={reportData.communication_guide} />
      </div>

      {/* Group 6: 카톡 톤앤매너 비교 & 신호/타임라인 */}
      <div className="break-before-page pt-10">
        <ActionSection
          rewrites={reportData.conversation_rewrites}
          recovery={reportData.recovery_signals}
          risk={reportData.risk_signals}
          plan={reportData.action_plan}
          manual={reportData.manual_summary}
        />
      </div>

      {/* Group 7: 하단 학술 심리 근거 */}
      <div className="break-before-page pt-10 pb-20 space-y-10">
        <AttachmentProfileChart 
          anxiety={analysis.attachment_dimensions?.anxiety || 0} 
          avoidance={analysis.attachment_dimensions?.avoidance || 0} 
          primaryType={analysis.primary_type} 
          anxietyStatus={analysis.attachment_dimensions?.anxiety_status}
          avoidanceStatus={analysis.attachment_dimensions?.avoidance_status}
        />
        <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} showSummary={false} />
        {reportData.behavior_patterns?.length > 0 && (
          <BehaviorSection patterns={reportData.behavior_patterns} />
        )}
      </div>
    </div>
  );
}
