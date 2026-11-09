import { FinalAnalysis } from "../../analysis/types";

export interface PremiumOffer {
  title: string;
  description: string;
  benefits: string[];
  preview: string;
  insufficient: boolean;
  canOffer: boolean;
}

export function getPremiumOffer(analysis?: Partial<FinalAnalysis>): PremiumOffer {
  const dims = analysis?.attachment_dimensions;
  const context = analysis?.derived_context;
  const focus: string = context?.context_intake?.desired_focus || "";
  const unclear = /unclear|보류/.test(analysis?.primary_type || "");
  const insufficient =
    (dims?.anxiety_status === "insufficient" && dims?.avoidance_status === "insufficient") ||
    (unclear && !dims?.anxiety_status && !dims?.avoidance_status);
  const failed = analysis?.status?.report === "failed";

  // 핵심 수정: 리포트 생성 실패(failed)가 아닌 한 모든 대화 분석 결과에서 100% 유료 리포트 구매창 상시 노출 보장
  const base = { insufficient: false, canOffer: !failed };

  const shared = [
    "실제 카톡 말풍선별 숨은 속마음 & 방어기제 정밀 해독",
    "지금 절대 보내면 안 되는 금기어 vs 복사해서 바로 쓰는 맞춤 카톡 답장 3선",
    "상대방이 먼저 연락 오게 만드는 골든타임 & 관계 주도권 가이드"
  ];

  if (insufficient) {
    return {
      ...base,
      title: "평온해 보이는 말투 뒤에 숨겨진 '미세 거리두기 신호'를 확인하세요",
      description:
        "겉으로는 다정하거나 평범해 보여도 역질문 생략, 답장 호흡, 대화 마무리 방식에 상대의 진짜 호감도와 방어기제가 숨어 있습니다.",
      benefits: shared,
      preview:
        "무료 요약에서 다루지 못한 상대방의 무의식 속마음과, 지금 보냈을 때 가장 반응이 좋은 맞춤형 카톡 답장 3가지를 바로 공개합니다."
    };
  }

  if (dims && dims.avoidance_status !== "insufficient" && dims.avoidance > 0) {
    return {
      ...base,
      title: "동굴로 들어간 상대방, 어떻게 카톡해야 먼저 다가올까요?",
      description:
        "감지된 거리두기·방어 반응을 뚫고 부담 없이 답장을 이끌어내는 실전 카톡 문장과 타이밍을 정리했습니다.",
      benefits: [
        shared[0],
        "상대의 방어벽을 낮추는 첫마디 & 대화 재개 타이밍",
        "부담을 0으로 줄이는 맞춤형 카톡 답장 3선과 심리적 이유",
        "어장/회피 여부를 판별하는 향후 반응 체크리스트"
      ],
      preview:
        "대화가 끊기거나 단답이 온 장면에서 절대 피해야 할 추격 카톡과, 상대가 안심하고 반응하는 실전 문장을 확인하세요."
    };
  }

  if (dims && dims.anxiety_status !== "insufficient" && dims.anxiety > 0) {
    return {
      ...base,
      title: "불안한 마음을 들키지 않고 관계 주도권을 가져오는 법",
      description:
        "상대방의 온도차에 흔들리지 않으면서도 자연스럽게 애정과 확신을 이끌어내는 맞춤 대화법을 제안합니다.",
      benefits: shared,
      preview:
        "상대가 부담을 느끼지 않게 내 서운함을 전달하는 고급 화법과 상황별 카톡 답장 예시를 확인하세요."
    };
  }

  if (focus.includes("답할지")) {
    return {
      ...base,
      title: "지금 이 카톡에 바로 복사해서 보낼 수 있는 최적의 답장 3선",
      description:
        "어떻게 답장해야 할지 막막한 순간, 상대의 심리를 정확히 건드려 대화를 이어가는 실전 카톡 문장을 확인하세요.",
      benefits: shared,
      preview:
        "현재 대화의 미묘한 텐션을 살리면서 상대의 호감과 역질문을 자연스럽게 유도하는 답장 스크립트를 제공합니다."
    };
  }

  return {
    ...base,
    title: "이 카톡 뒤에 숨은 진짜 속마음과 다음 답장 전략을 열어보세요",
    description:
      "무료 요약에는 담지 못한 말풍선별 정밀 속마음 판독과, 지금 바로 써먹는 실전 카톡 답장 스크립트 3선을 담았습니다.",
    benefits: shared,
    preview:
      "상대방이 왜 이런 말투로 답했는지 무의식 의도를 해독하고, 관계를 유리하게 이끄는 맞춤형 답장을 제안합니다."
  };
}
