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
  const insufficient = (dims?.anxiety_status === "insufficient" && dims?.avoidance_status === "insufficient") ||
    (unclear && !dims?.anxiety_status && !dims?.avoidance_status);
  const hasScenes = Array.isArray(context?.key_situations) && context.key_situations.some((s: { situation?: string; target_behavior?: string }) => s?.situation?.trim() && s?.target_behavior?.trim());
  const failed = analysis?.status?.report === "failed";
  const base = { insufficient, canOffer: !failed && (!insufficient || hasScenes) };
  const shared = ["실제 대화 장면별 반응과 가능한 해석", "상황에 맞는 추천 카톡 문장과 표현의 이유", "앞으로 살펴볼 반응과 구체적인 소통 가이드"];
  if (insufficient) return { ...base,
    title: "유형 판단과 별개로, 이 대화를 더 살펴볼까요?",
    description: "애착 유형을 확정하는 상품이 아니에요. 확인된 대화 장면이 있다면 그 의미와 소통 방법을 중심으로 상담 가이드를 제공합니다.",
    benefits: shared,
    preview: "실제 장면의 의미와 가능한 다른 해석을 구분하고, 선택하신 고민에 맞는 표현을 제안합니다."
  };
  if (dims && dims.avoidance_status !== "insufficient" && dims.avoidance > 0) return { ...base,
    title: "다시 대화를 이어갈 방법까지 준비하세요",
    description: "관찰된 거리두기 반응을 바탕으로, 내 마음을 전달할 표현과 이후 확인할 신호를 정리합니다.",
    benefits: [shared[0], "대화를 다시 꺼낼 때 참고할 접근 방법", "부담을 줄이는 맞춤 카톡 표현과 이유", "반복되는 반응과 긍정적인 변화를 확인할 가이드"],
    preview: "대화가 멈춘 장면에서 어떤 접근이 도움이 될지, 실제 반응과 다른 가능성을 함께 살펴봅니다."
  };
  if (dims && dims.anxiety_status !== "insufficient" && dims.anxiety > 0) return { ...base,
    title: "확인하고 싶은 마음을 더 편하게 전해보세요",
    description: "관계 확인과 안심을 구하는 흐름을 살펴보고, 서로의 부담을 줄이는 대화 방법을 제안합니다.",
    benefits: shared, preview: "확인 요구가 오간 맥락과 상대의 반응을 구분하고, 마음을 전달할 수 있는 표현을 정리합니다."
  };
  if (focus.includes("답할지")) return { ...base, title: "이번 대화에 맞는 답장 표현을 확인하세요", description: "회피 반응이 없어도, 다음에 어떻게 말할지는 고민될 수 있어요. 실제 장면에 맞는 추천 문장과 이유를 확인하세요.", benefits: shared, preview: "현재 대화의 흐름을 살리면서 자연스럽게 답할 수 있는 문장과 그 이유를 제안합니다." };
  if (focus.includes("관계 패턴")) return { ...base, title: "두 사람의 소통 방식을 더 알아보세요", description: "잘 맞는 부분과 조율할 부분을 구분하고, 유지하면 좋은 소통 방법을 정리합니다.", benefits: shared, preview: "대화에서 확인된 상호작용을 바탕으로, 잘 작동한 방식과 앞으로 조율할 지점을 살펴봅니다." };
  if (focus.includes("앞으로")) return { ...base, title: "앞으로 어떤 반응을 살펴보면 좋을까요?", description: "이번 대화의 맥락을 바탕으로, 이후 확인할 행동과 편안하게 대화를 이어갈 방법을 정리합니다.", benefits: shared, preview: "추측으로 결론 내리기보다 이후 대화에서 실제로 확인할 수 있는 반응을 정리합니다." };
  return { ...base, title: "이 대화의 의미와 다음 표현을 더 살펴보세요", description: "회피형 여부를 넘어, 실제 대화 속 반응과 가능한 해석, 나에게 필요한 소통 방법을 담았습니다.", benefits: shared, preview: "대화의 긍정적인 부분과 가능한 해석을 살펴보고, 같은 상황에서 활용할 표현을 제안합니다." };
}
