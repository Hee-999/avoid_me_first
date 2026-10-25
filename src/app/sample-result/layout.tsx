import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "예시 분석 결과 | 러브패턴",
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
