import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예시 분석 결과 미리보기 | 러브패턴",
  description:
    "실제 카톡 대화 분석 시 제공되는 무료 온도차 판독과 7개 장 심층 리포트 예시를 미리 확인해 보세요.",
  alternates: {
    canonical: "/sample-result",
  },
  openGraph: {
    title: "예시 분석 결과 미리보기 | 러브패턴",
    description:
      "실제 카톡 대화 분석 시 제공되는 무료 온도차 판독과 7개 장 심층 리포트 예시를 미리 확인해 보세요.",
    url: "/sample-result",
  },
};

export default function SampleResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
