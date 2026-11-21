import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "저장된 심층 리포트 | 러브패턴",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReportTokenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
