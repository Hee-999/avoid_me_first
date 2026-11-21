"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SAMPLE_ANALYSIS } from "@/lib/fixtures/sampleAnalysis";
import { PremiumReport } from "@/components/premium/PremiumReport";
import { PremiumPurchasePrompt } from "@/components/premium/PremiumPurchasePrompt";
import { PremiumReportV2 } from "@/lib/report/premium/types";
import { PRICING } from "@/config/pricing";

const SAMPLE_PAID_REPORT: PremiumReportV2 = {
  executive_summary: {
    headline: "“감정이 끝난 건 아니지만, 상처받을까 봐 방어선을 치고 있어요.”",
    body: "대화가 길어질수록 에너지가 빠르게 소모되는 걸 느끼고 있거든요. 그래서 '피곤하다', '혼자 있고 싶다'는 말로 잠깐 숨을 고르려는 거예요. 반면 대화를 꺼낸 쪽은 관계를 좋게 만들고 싶은 마음에 계속 다가갔고, 그 간격이 온도차로 느껴진 거예요.",
    key_points: [
      "그 사람의 회피는 감정이 없어서가 아니라, 감정을 다루는 게 지금 버겁기 때문이에요.",
      "대화를 미루면서도 미안하다는 말을 남긴 건 최소한의 연결은 유지하고 싶다는 뜻이에요.",
      "지금은 확인이나 재촉보다 한 템포 쉬어주는 게 방어벽을 낮추는 데 훨씬 유리해요.",
    ],
  },
  attachment_profile: {
    primary_interpretation: "감정적 압박이 느껴질 때 거리를 두며 마음을 정돈하는 회피 방어 패턴이 높게 나타납니다.",
    dimension_interpretation: "관계 불안 지수는 중간 수준이지만, 거리두기 지수가 높아 갈등 직후 즉각적인 해결 요구에 방어적으로 닫히는 편입니다.",
  },
  behavior_patterns: [],
  evidence_deep_dive: [
    {
      title: "피곤하다며 대화를 미룬 순간",
      situation: "관계의 거리감을 느낀다며 진지한 대화를 요청했을 때예요.",
      observed_behavior: "요즘 너무 지쳐서 오늘은 여기까지 얘기하자며 대화를 마무리했어요.",
      interaction: "대화를 꺼낸 쪽은 서운함을 드러냈고, 상대는 먼저 자겠다며 선을 그었어요.",
      interpretation: "감정이 격해지는 상황을 견디기 힘들어서 대화를 닫아버린 거예요. 마음이 없어서가 아니라 감정 소모를 피하려는 방어기제예요.",
      alternative_explanation: "단순히 당일 컨디션 저하가 겹쳤을 가능성도 함께 보여요.",
      conclusion: "이 장면은 '지금은 대화의 타이밍이 아니다'라는 신호로 읽으면 돼요.",
    },
    {
      title: "주말 약속을 애매하게 미룬 순간",
      situation: "다음 만남 일정을 구체적으로 잡으려 했을 때예요.",
      observed_behavior: "이번 주는 일정이 좀 유동적이라 보고 연락줄게라고 답했어요.",
      interaction: "확답을 원했던 쪽이 다시 날짜를 묻자 답장 간격이 길어졌어요.",
      interpretation: "부담스러운 책임감이나 기대치가 올라가는 순간 반사적으로 선택권을 쥐고 싶어 하는 반응이에요.",
      alternative_explanation: "실제로 업무나 개인 일정이 확정되지 않았을 여지도 있어요.",
      conclusion: "구체적인 날짜를 재촉하기보다 상대가 편한 날을 고를 여지를 주는 편이 유리해요.",
    },
    {
      title: "먼저 가벼운 일상 톡을 남긴 순간",
      situation: "며칠간 침묵이 이어진 뒤 짧은 안부가 오갔을 때예요.",
      observed_behavior: "미안, 요 며칠 정신이 하나도 없었네. 잘 지내고 있지?라고 말을 걸었어요.",
      interaction: "긴 해명은 없었지만 최소한의 연결 고리는 유지하려는 태도를 보였어요.",
      interpretation: "감정 싸움은 피하고 싶지만, 관계 자체가 완전히 끊어지는 것은 원하지 않는다는 신호예요.",
      alternative_explanation: "예의상 안부를 묻고 넘어갔을 가능성도 배제할 순 없어요.",
      conclusion: "이때 서운함을 바로 꺼내지 않고 가볍게 받아주면 대화 문이 다시 열려요.",
    },
  ],
  trigger_profile: [],
  interaction_loop: {
    summary: "한쪽은 관계를 개선하려고 대화를 꺼내고, 다른 쪽은 부담을 느껴 피하면서 점점 더 엇갈린 거예요.",
    steps: [
      "거리감이 느껴져서 진지한 대화를 꺼냄",
      "부담을 느끼고 피곤하다며 한 발 물러섬",
      "답답한 마음에 언제 얘기할지 한 번 더 재촉함",
      "압박감을 이기지 못하고 대화를 닫아버림",
    ],
    break_points: ["대화를 요청할 때 결론을 요구하지 않고 선택지를 열어두기"],
  },
  conflict_pattern: {
    summary: "감정 확인형 질문이 반복될수록 침묵이 길어집니다.",
    works_better: ["짧고 가벼운 안부"],
    likely_to_worsen: ["장문 해명 요구"],
  },
  communication_guide: [
    {
      situation: "상대가 피곤하다며 대화를 피할 때",
      do: "오늘 고생했어. 편할 때 다시 얘기하자!",
      dont: "매번 이렇게 피하기만 하면 난 어떻게 해?",
      why: "당장 답을 내야 한다는 압박을 지워줘야 마음이 다시 열려요.",
    },
    {
      situation: "약속이나 만남 확답을 미룰 때",
      do: "알겠어~ 일정 정리되면 편하게 알려줘!",
      dont: "그래서 이번 주 된다는 거야 안 된다는 거야?",
      why: "선택의 자유를 남겨줄수록 오히려 먼저 일정을 맞춰오려는 마음이 생겨요.",
    },
    {
      situation: "며칠 만에 먼저 짧은 연락이 왔을 때",
      do: "응 잘 지냈지 ㅋㅋ 요즘 바쁜 일은 좀 정리됐어?",
      dont: "이제야 연락하네. 그동안 왜 답장 안 했어?",
      why: "반가움과 여유로 받아줄 때 죄책감 없이 대화가 길게 이어져요.",
    },
  ],
  conversation_rewrites: [
    {
      situation: "선톡을 보내고 싶을 때",
      original_pattern_summary: "우리 관계 어떻게 생각하냐고 직접 확인하려 함",
      recommended_message: "예: '오늘 지나가다 네가 좋아하던 카페 보여서 생각났어. 이번 주 잘 보내!'",
      why: "답장 의무감을 주지 않는 가벼운 메시지가 회피 성향 상대에게 가장 잘 먹혀요.",
    },
    {
      situation: "상대가 미안하다며 늦게 답장했을 때",
      original_pattern_summary: "바쁜 건 알겠는데 나도 기다리느라 힘들었어",
      recommended_message: "예: '괜찮아! 엄청 바빴나 보네 ㅎㅎ 오늘 마무리 잘하고 푹 쉬어~'",
      why: "서운함 대신 여유를 보여주면 상대가 마음의 짐을 내려놓고 먼저 다가와요.",
    },
  ],
  recovery_signals: [
    "먼저 가벼운 일상 사진이나 짧은 안부를 보내옴",
    "이전 대화 주제를 자연스럽게 다시 꺼냄",
  ],
  risk_signals: [
    "읽씹 후 3일 이상 무응답 지속",
    "단답으로 일관하며 질문에 답을 회피함",
  ],
  action_plan: {
    next_conflict: ["즉각적인 해명 요구 멈추고 하루 텀 두기"],
    next_7_days: ["3~4일 간격으로 부담 없는 일상 톡 1회만 보내기", "상대 반응 속도에 맞춰 템포 조절하기"],
    next_30_days: ["가벼운 만남 제안 전 감정적 안정기 유지하기"],
  },
  manual_summary: {
    effective_approach: ["여유 있는 태도"],
    ineffective_approach: ["감정 추궁"],
    conflict_reentry: "가벼운 안부로 재진입",
    distance_response: "한 발 물러서기",
    relationship_check: "답장 길이와 질문 여부 확인",
    watch_for: ["반복되는 회피"],
    key_sentence: "기다림이 아니라 여유를 보여주는 게 핵심이에요.",
  },
  methodology: { body: "" },
};

const SAMPLE_FLIRTING_PAID_REPORT: PremiumReportV2 = {
  executive_summary: {
    headline: "“호감은 분명히 있는데, 먼저 선을 넘기 전 내 반응을 살피는 중이에요.”",
    body: "단답으로 끝내지 않고 네 일상이나 취향을 다시 물어보는 걸 보면 단순 예의 이상의 관심이 있어요. 다만 상대가 원래 조심스럽게 템포를 맞추는 편이라, 네가 먼저 가볍게 신호를 줄수록 훨씬 빠르게 가까워질 수 있는 상태예요.",
    key_points: [
      "대화가 끊길 타이밍에도 질문이나 리액션으로 자연스럽게 이어가려는 흔적이 보여요.",
      "답장 간격이 조금 들쭉날쭉한 건 관심이 없어서가 아니라, 말 고르며 신중하게 답장하는 편이기 때문이에요.",
      "지금은 마음 확인을 서두르기보다, 가벼운 공통 관심사나 만남 여지를 던져주는 게 가장 잘 먹혀요.",
    ],
  },
  attachment_profile: {
    primary_interpretation: "호감이 생기면 초반엔 신중하게 상대 반응을 살피다가, 확신이 서면 편안하게 다가오는 타입이에요.",
    dimension_interpretation: "기대감과 조심스러움이 균형을 이루고 있어서, 부담 없는 유머와 가벼운 만남 제안에 가장 자연스럽게 반응하는 편입니다.",
  },
  behavior_patterns: [],
  evidence_deep_dive: [
    {
      title: "답장 끝에 내 일상을 다시 물어본 순간",
      situation: "퇴근 후 오늘 하루 어땠는지 가벼운 안부가 오갔을 때예요.",
      observed_behavior: "나는 이제 집 들어왔어! 오늘 야근한다더니 밥은 챙겨 먹었어?라고 답했어요.",
      interaction: "단순 인사에서 끝날 수 있는 대화를 자연스럽게 상대 안부 질문으로 이어갔어요.",
      interpretation: "관심이 없는 상대에게는 보통 자기 얘기만 하고 대화를 닫는데, 네 상태를 기억하고 되묻는 건 호감의 분명한 신호예요.",
      alternative_explanation: "평소 누구에게나 다정하고 배려가 깊은 성격일 가능성도 함께 보여요.",
      conclusion: "이 장면은 대화를 더 이어가고 싶다는 긍정 신호로 받아들여도 좋아요.",
    },
    {
      title: "취향 이야기에 사진을 보내며 반응한 순간",
      situation: "좋아하는 음식과 카페 이야기를 나누던 흐름이었어요.",
      observed_behavior: "헐 나 거기 진짜 좋아하는데! 저번에 갔을 때 찍은 사진 봐봐라며 사진을 공유했어요.",
      interaction: "텍스트만 주고받다가 직접 찍은 사진까지 꺼내며 대화 텐션을 끌어올렸어요.",
      interpretation: "자신의 일상 조각을 공유한다는 건 심리적 거리를 좁히고 싶고, 다음에 같이 가보자는 은근한 여지를 남기는 행동이에요.",
      alternative_explanation: "단순히 맛집 정보 공유를 좋아하는 성향일 수도 있어요.",
      conclusion: "이 흐름을 살려 '다음에 거기 같이 가자'는 가벼운 제안으로 연결하기 딱 좋아요.",
    },
    {
      title: "주말 계획을 슬쩍 먼저 물어본 순간",
      situation: "금요일 저녁 무렵 서로 주말 일정을 이야기할 때예요.",
      observed_behavior: "이번 주말에는 별일 없으면 쉬려고? 아니면 약속 있어?라고 슬쩍 물었어요.",
      interaction: "직접 만나자고 하진 않았지만, 주말 시간 여부를 간접적으로 확인했어요.",
      interpretation: "거절당할 부담을 줄이면서도 네가 시간이 비는지 먼저 체크해보려는 전형적인 썸 단계의 탐색 질문이에요.",
      alternative_explanation: "가벼운 스몰토크 차원에서 주말 안부를 물었을 수도 있어요.",
      conclusion: "여기서 '아직 별일 없어! 너는?'처럼 여지를 열어두면 다음 약속이 자연스럽게 잡혀요.",
    },
  ],
  trigger_profile: [],
  interaction_loop: {
    summary: "한쪽이 가벼운 일상과 취향을 던지면, 다른 쪽이 질문과 리액션으로 받아주면서 자연스럽게 썸 텐션이 쌓이고 있어요.",
    steps: [
      "가벼운 일상이나 공통 관심사로 먼저 톡을 건넴",
      "상대가 웃음 리액션과 함께 역질문으로 대화를 이어감",
      "서로의 취향과 주말 일정을 자연스럽게 공유하기 시작함",
      "조금만 더 확실한 만남 여지가 생기면 급격히 가까워질 흐름",
    ],
    break_points: ["대화가 잘 통할 때 '다음에 같이 가보자' 한 마디를 가볍게 얹어주기"],
  },
  conflict_pattern: {
    summary: "무거운 확인 질문보다 가벼운 티키타카에서 호감이 가장 크게 올라갑니다.",
    works_better: ["가벼운 약속 여지 던지기"],
    likely_to_worsen: ["관심 유무를 직접 캐묻기"],
  },
  communication_guide: [
    {
      situation: "상대가 주말 일정이나 퇴근 후 시간을 슬쩍 물어볼 때",
      do: "아직 딱히 약속 없어! 맛집이나 가볼까 생각 중인데 너는 뭐 해?",
      dont: "응 집에서 쉴 것 같아 (단답으로 대화 끝내기)",
      why: "상대가 어렵게 던진 탐색 질문에 여지를 열어줘야 다음 약속 제안이 자연스럽게 나와요.",
    },
    {
      situation: "답장 간격이 평소보다 조금 길어졌을 때",
      do: "오늘 바쁜 날인가 보다! 이따 여유 있을 때 천천히 봐~",
      dont: "혹시 바빠? 왜 답장이 늦어?",
      why: "여유 있는 태도가 오히려 상대에게 '이 사람과 대화하면 편하다'는 인상을 남깁니다.",
    },
    {
      situation: "공통 관심사 이야기로 텐션이 올라왔을 때",
      do: "말 나온 김에 이번 주에 시간 맞으면 거기 같이 가볼래? ㅎㅎ",
      dont: "나중에 시간 되면 언제 한 번 가봐! (기약 없이 넘기기)",
      why: "텐션이 높을 때 가볍게 날짜 힌트를 줘야 썸이 실제 만남으로 이어집니다.",
    },
  ],
  conversation_rewrites: [
    {
      situation: "가볍게 선톡으로 만남 약속을 끌어내고 싶을 때",
      original_pattern_summary: "이번 주말에 시간 돼? 나랑 밥 먹자 언제 볼래?",
      recommended_message: "예: '여기 파스타 진짜 맛있다는데 ㅋㅋ 이번 주에 시간 맞으면 같이 가볼래?'",
      why: "부담스러운 데이트 신청 대신 '맛집 같이 가기' 프레임을 쓰면 수락 확률이 훨씬 높아져요.",
    },
    {
      situation: "상대가 주말에 뭐 하냐고 먼저 물어봤을 때",
      original_pattern_summary: "그냥 집에서 쉴 것 같아 넌?",
      recommended_message: "예: '아직 정해진 건 없어 ㅎㅎ 바람 쐬고 싶은데 너는 주말에 뭐 해?'",
      why: "나갈 의향이 있다는 힌트를 함께 주면 상대가 먼저 만남을 제안하기 쉬워져요.",
    },
  ],
  recovery_signals: [
    "대화 끝에 먼저 '너는 뭐 해?', '오늘 어땠어?'처럼 역질문이 이어질 때",
    "일상 사진이나 유튜브·맛집 링크를 먼저 공유해 올 때",
    "주말이나 퇴근 후 일정을 슬쩍 물어보며 빈 시간을 체크할 때",
  ],
  risk_signals: [
    "질문을 던져도 단답('응', '맞아')으로만 끝나고 되묻지 않을 때",
    "약속 이야기를 꺼냈을 때 다음 기약 없이 화제를 돌릴 때",
    "답장 간격이 계속 반나절 이상 길어지며 리액션이 줄어들 때",
  ],
  action_plan: {
    next_conflict: ["어색한 침묵이 와도 조급해하지 말고 하루 뒤 가벼운 일상 톡으로 환기하기"],
    next_7_days: [
      "대화가 잘 이어지는 타이밍에 가벼운 맛집·카페 만남 1번 제안해보기",
      "상대 답장 속도에 맞춰 너무 길지 않게 티키타카 리듬 유지하기",
    ],
    next_30_days: [
      "첫 만남 이후 자연스럽게 애프터 약속과 일상 공유 빈도 늘려가기",
    ],
  },
  manual_summary: {
    effective_approach: ["가벼운 티키타카와 여지 남기기"],
    ineffective_approach: ["조급한 마음 확인 질문"],
    conflict_reentry: "공통 관심사 톡으로 자연스럽게 재진입",
    distance_response: "여유 있게 템포 맞추기",
    relationship_check: "역질문과 일정 공유 빈도 확인",
    watch_for: ["단답 반복 여부"],
    key_sentence: "마음을 확인하려 하기보다, 같이 시간 보내고 싶은 사람이라는 느낌을 주는 게 핵심이에요.",
  },
  methodology: { body: "" },
};

export default function SampleResultPage() {
  const router = useRouter();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaidPreview, setIsPaidPreview] = useState(false);
  const [isFlirtingMode, setIsFlirtingMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPaidPreview(params.get("preview") === "paid");
    setIsFlirtingMode(params.get("mode") === "flirting");
  }, []);

  const analysis = isPaidPreview
    ? {
        ...SAMPLE_ANALYSIS,
        derived_context: {
          ...(SAMPLE_ANALYSIS.derived_context as any),
          analysis_mode: isFlirtingMode ? "flirting" : "reunion",
          v3_metrics: isFlirtingMode
            ? {
                ...(SAMPLE_ANALYSIS.derived_context as any).v3_metrics,
                user_temperature: 76,
                target_temperature: 68,
                success_probability: 72,
                backfire_risk_percent: 32,
                signal_count: 3,
                tease_scene_summary:
                  "퇴근 후 일상 안부와 주말 계획을 슬쩍 물어보며 사진까지 공유한 장면",
              }
            : (SAMPLE_ANALYSIS.derived_context as any).v3_metrics,
        },
        attachment_dimensions: isFlirtingMode
          ? { anxiety: 42, avoidance: 35, anxiety_status: "ok" as const, avoidance_status: "ok" as const }
          : SAMPLE_ANALYSIS.attachment_dimensions,
        primary_type: isFlirtingMode ? "안정-신중형" : SAMPLE_ANALYSIS.primary_type,
        premium_report: isFlirtingMode ? SAMPLE_FLIRTING_PAID_REPORT : SAMPLE_PAID_REPORT,
        status: { report: "completed", scoring: "completed" },
      }
    : SAMPLE_ANALYSIS;
  const { target_speaker_label, derived_context } = analysis;
  const targetName = target_speaker_label || "상대방";
  const v3 = derived_context?.v3_metrics;
  const userTemp = v3?.user_temperature ?? 78;
  const backfire = v3?.backfire_risk_percent ?? 75;
  const signalCount = v3?.signal_count ?? 3;
  const teaseScene =
    v3?.tease_scene_summary ||
    "주말 일정과 서운한 감정을 꺼냈을 때, 상대방이 피곤하다는 이유로 대화를 미루고 답장을 멈춘 장면";

  // NICEPAY 결제 모듈 진입 핸들러 (샘플 확인용)
  const handleUnlock = async () => {
    if (isPaymentProcessing) return;
    try {
      setIsPaymentProcessing(true);

      if (!(window as any).AUTHNICE) {
        throw new Error("결제 모듈을 로드하는 중입니다. 잠시 후 다시 시도해주세요.");
      }

      const baseUrl = (
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      ).replace(/\/+$/, "");
      const orderId = `sample_${Date.now()}`;

      (window as any).AUTHNICE.requestPay({
        clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_KEY,
        method: "cardAndEasyPay",
        orderId: orderId,
        amount: PRICING.REPORT.salePrice,
        goodsName: PRICING.REPORT.shortName,
        returnUrl: `${baseUrl}/api/premium/callback`,
        fnError: function (result: any) {
          setIsPaymentProcessing(false);
          if (result?.errorMsg) {
            alert(result.errorMsg);
          }
        },
      });
    } catch (err: any) {
      setIsPaymentProcessing(false);
      alert(err.message || "결제 모듈 진입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-zinc-900 flex items-center justify-center p-1 -ml-1 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[13px] font-bold text-zinc-800 tracking-tight">예시 분석 결과 리포트</span>
          <div className="w-5 h-5" />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-6 pt-8 pb-10 break-keep">
        {/* 샘플 예시 안내 뱃지 */}
        <div className="mb-6 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="block text-[13px] font-bold text-blue-900">샘플 분석 결과 미리보기</span>
            <p className="text-[12px] text-blue-700 leading-snug mt-0.5">
              실제 카톡 캡처 분석 시 제공되는 V3 결과 화면 예시입니다.
            </p>
          </div>
        </div>

        {/* V3 핵심 판독 & 쌍방 온도차 티저 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full">
              {isFlirtingMode ? "💘 썸 · 호감도 판독" : "💔 재회 · 애매한 사이 판독"}
            </span>
            <span className="inline-block px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-bold rounded-full">
              대상: {targetName}
            </span>
          </div>

          <h1 className="text-[18px] sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug whitespace-nowrap">
            {targetName}의 진짜 속마음 &amp;{" "}
            <span className="text-blue-600">{isFlirtingMode ? "썸 온도차" : "재회 온도차"}</span> 판독
          </h1>

          <div className="mt-4 space-y-3">
            {/* 1. 쌍방 온도차 게이지 (티저) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-[11.5px] font-bold text-zinc-700 mb-2">
                <span className="whitespace-nowrap">🌡️ 두 사람의 관계 온도차</span>
                {isPaidPreview ? (
                  <span className="text-blue-600 font-black whitespace-nowrap shrink-0">
                    {isFlirtingMode ? "썸 성사" : "재회"} 가능성 {v3?.success_probability ?? 48}%
                  </span>
                ) : (
                  <span className="text-[10.5px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-extrabold whitespace-nowrap shrink-0">
                    🔒 상대 온도 잠금
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-500 block">내 감정/몰입 온도</span>
                  <span className="text-[20px] font-black text-zinc-900">{userTemp}%</span>
                  <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${userTemp}%` }} />
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-500 block">{targetName}의 실제 온도</span>
                  {isPaidPreview ? (
                    <>
                      <span className="text-[20px] font-black text-blue-600">
                        {v3?.target_temperature ?? 46}%
                      </span>
                      <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${v3?.target_temperature ?? 46}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[20px] font-black text-zinc-400 select-none">🔒 ??%</span>
                      <div className="mt-1.5 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-300 rounded-full w-1/3 blur-[1px]" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2. 소름 요약 1줄 + 주의 지수 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2.5">
              <p className="text-[13.5px] text-zinc-800 leading-relaxed font-semibold">
                📌 <span className="text-blue-700 font-bold">{teaseScene}</span>에서{" "}
                <strong>핵심 심리 시그널 {signalCount}개</strong>가 동시에 포착되었습니다.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-3.5 py-2.5 text-[12.5px] font-bold text-amber-900 leading-snug">
                💡 상대의 진짜 의도를 모른 채 섣불리 연락하면 대화가 더 멀어질 수 있어요{" "}
                <span className="text-amber-700">(성급한 연락 주의 지수 {backfire}%)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {isPaidPreview && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-[12.5px] text-emerald-950 space-y-2.5">
            <p className="font-bold">
              ✅ 결제가 완료되었습니다! 아래에서 심층 리포트와 1:1 AI 상담을 바로 확인하세요.
            </p>
            <div className="space-y-2 pt-1">
              <p className="text-[12px] text-emerald-900 font-semibold">
                창을 닫아도 다시 보시려면 카톡으로 전용 링크와 비밀 키(PIN 4자리)를 받아두세요.
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="010-1234-5678"
                  className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2.5 text-[13px] text-zinc-900 outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-zinc-900 text-white text-[12.5px] font-bold rounded-xl hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                >
                  카톡 받기
                </button>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-snug">
                🔒 입력하신 번호는 다른 목적으로 쓰이지 않고, 리포트 링크 발송과 본인만 링크를 확인할 수 있도록 본인 확인용 비밀 키 발송에만 쓰입니다.
              </p>
            </div>
          </div>
        )}

        <PremiumPurchasePrompt
          analysis={analysis}
          onUnlock={handleUnlock}
          isProcessing={isPaymentProcessing}
          isPremium={isPaidPreview}
        />

        {/* PREMIUM REPORT / LOCKED PAYWALL */}
        <div id="premium-purchase-details" className="relative scroll-mt-6">
          <PremiumReport
            analysis={analysis}
            isPremium={isPaidPreview}
            onUnlock={handleUnlock}
            isProcessing={isPaymentProcessing}
          />
        </div>

        {/* 내 카톡으로 직접 분석해보기 CTA */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/?view=input")}
            className="w-full py-4 bg-zinc-950 text-white text-[14.5px] font-bold rounded-2xl hover:bg-zinc-800 transition shadow-md cursor-pointer"
          >
            내 카톡 캡처로 직접 판독해 보기 →
          </button>
        </div>
        <div className="h-24 print:hidden" aria-hidden="true" />
      </main>
    </div>
  );
}
