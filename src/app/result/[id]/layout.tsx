import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카톡 속마음 분석 결과 | 러브패턴",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
