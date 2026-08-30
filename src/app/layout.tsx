import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "회피형 판독기 - 심리 분석",
  description: "바솔로뮤 성인 애착 모델 기반 카톡 대화 심리 분석",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-zinc-100 text-zinc-900 antialiased`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col overflow-x-hidden border-x border-zinc-200">
          {children}
        </main>
      </body>
    </html>
  );
}
