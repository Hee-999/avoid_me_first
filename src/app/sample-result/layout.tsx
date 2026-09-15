import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "예시 분석 결과 | 회피형 판독기",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SampleResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
