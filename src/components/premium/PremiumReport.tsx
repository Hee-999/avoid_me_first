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
  const isFlirting = analysis.derived_context?.analysis_mode === 'flirting';

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
        <div className="space-y-10">
          {/* 제1장. 핵심 속마음 진단 & 관계 설계도 */}
          <div className="avoid-page-break space-y-5">
            <ExecutiveSection
              summary={reportData.executive_summary}
              profile={reportData.attachment_profile}
              showProfile={false}
              isFlirting={isFlirting}
              chapterLabel="제1장"
            />

            {/* 썸 vs 재회 분기 짧은 팁 */}
            <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-2xl p-5 text-[13.5px] leading-relaxed text-zinc-700 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[13px]">
                <span>💡</span>
                <span>
                  {isFlirting
                    ? '호감이 있어서 조심스러운 걸까요, 예의상 답장하는 걸까요?'
                    : '잠깐 지친 걸까요, 아니면 진짜 거리를 두는 걸까요?'}
                </span>
              </div>
              <p>
                {isFlirting
                  ? '답장이 뜸하거나 말을 아끼는 건 관심이 없어서가 아니라, 아직 선을 넘어도 될지 눈치를 보거나 연애 템포가 느린 성향 때문일 수 있어요.'
                  : '그 사람이 대화를 미루거나 피곤하다고 물러선 건 원래 방어벽이 높은 성향 때문일 수도 있지만, 그날따라 유독 지쳐서 감정 쓸 여유가 없었을 가능성도 있어요.'}
              </p>
              <p className="text-zinc-600 text-[13px] pt-2 border-t border-indigo-100/60">
                {isFlirting
                  ? '대화 끝에 상대가 내 일상을 다시 물어봐 주는지, 아니면 대화를 깔끔하게 닫기만 하는지 보면 진짜 호감 여부를 바로 알 수 있어요.'
                  : '감정이 가라앉은 뒤에 그 사람이 먼저 슬쩍 말을 걸어오는지, 아니면 계속 없던 일처럼 덮으려 하는지 지켜보면 진짜 속마음을 바로 알 수 있어요.'}
              </p>
            </div>
          </div>

          {/* 제2장. 카톡 장면별 해독 */}
          <EvidenceSection evidences={reportData.evidence_deep_dive} isFlirting={isFlirting} chapterLabel="제2장" />

          {/* 제3장. 상호작용 흐름 / 엇갈림 패턴 */}
          <InteractionSection triggers={reportData.trigger_profile} loop={reportData.interaction_loop} isFlirting={isFlirting} chapterLabel="제3장" />

          {/* 제4~6장. 실전 카톡 & 대응 가이드 (다크 박스) */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 my-8 print:bg-transparent print:text-zinc-900 print:border-t-2 print:border-zinc-300 print:rounded-none print:px-0">
            <div className="text-left mb-8">
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-[11.5px] font-bold rounded-full mb-3 print:bg-zinc-100 print:text-zinc-600">
                {isFlirting ? '실전 썸 카톡 & 어프로치 가이드' : '실전 카톡 & 대응 가이드'}
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-black text-white print:text-zinc-900">
                {isFlirting ? '지금부터 이렇게 썸을 이어가 보세요' : '지금부터 이렇게 움직여 보세요'}
              </h2>
              <p className="text-[13px] text-slate-400 mt-1.5 print:text-zinc-500">
                {isFlirting
                  ? '상대에게 부담은 주지 않으면서 호감과 텐션을 끌어올리는 현실 대처법이에요.'
                  : '상대의 방어벽을 낮추고 답장을 끌어내는 현실 대처법이에요.'}
              </p>
            </div>
            
            <div className="space-y-10">
              <CommunicationSection conflict={reportData.conflict_pattern} guide={reportData.communication_guide} isFlirting={isFlirting} chapterLabel="제4장" />
              <ActionSection 
                rewrites={reportData.conversation_rewrites}
                recovery={reportData.recovery_signals}
                risk={reportData.risk_signals}
                plan={reportData.action_plan}
                manual={reportData.manual_summary}
                isFlirting={isFlirting}
              />
            </div>
          </div>

          {/* 제7장. 이 리포트의 심리학적 근거와 결론 */}
          <div className="pt-8 border-t border-zinc-200 space-y-6">
            <div className="text-left space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-black tracking-wide">
                제7장
              </span>
              <h3 className="text-[18px] sm:text-[19px] font-black text-zinc-900">
                {isFlirting ? '상대가 이런 템포를 보이는 진짜 이유' : '그 사람이 자꾸 선을 긋는 진짜 이유'}
              </h3>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                {isFlirting
                  ? '썸 단계에서 보이는 답장 템포와 감정 표현의 크기는 그 사람 안의 기대감과 신중함의 균형에서 비롯돼요.'
                  : '카톡 답장 속도와 감정 표현에서 느껴진 온도차는 그 사람 안의 관계 불안 지수와 거리두기 지수에서 비롯돼요.'}
              </p>
            </div>

            <ExecutiveSection summary={reportData.executive_summary} profile={reportData.attachment_profile} showSummary={false} isFlirting={isFlirting} />

            <AttachmentProfileChart 
              anxiety={analysis.attachment_dimensions?.anxiety || 0} 
              avoidance={analysis.attachment_dimensions?.avoidance || 0} 
              primaryType={analysis.primary_type} 
              anxietyStatus={analysis.attachment_dimensions?.anxiety_status}
              avoidanceStatus={analysis.attachment_dimensions?.avoidance_status}
            />

            {/* 리포트 전체 결론 (제4~6장 전략과 수미상관 연결) */}
            <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-2">
              <p className="text-[12px] font-extrabold text-blue-300">
                📌 이 리포트의 핵심 결론
              </p>
              <p className="text-[13.5px] text-zinc-100 leading-relaxed">
                {isFlirting
                  ? '결국 상대의 애착 성향과 답장 템포를 이해하면, 조급하게 확인하려 들지 않아도 대화의 주도권을 자연스럽게 가져올 수 있어요. 위 제4~6장에서 정리해 드린 가벼운 답장과 타이밍 기준대로 한 번 움직여 보세요.'
                  : '결국 상대가 선을 긋는 건 마음이 완전히 끝나서가 아니라, 감정이 버거울 때 스스로를 보호하는 방식 때문이에요. 위 제4~6장에서 정리해 드린 압박 없는 답장과 타이밍 기준대로 한 템포 여유를 주시면 마음이 훨씬 편하게 열릴 거예요.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
