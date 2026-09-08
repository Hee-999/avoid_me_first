import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/legal/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "카톡으로 보는 상대방 애착 패턴 | 회피형 판독기",
  description: "카카오톡 대화를 붙여넣으면 상대가 대화에서 보인 불안·회피 패턴과 애착 유형을 분석합니다. 대화 원문은 서비스 DB에 저장되지 않습니다.",
  keywords: ["회피형", "애착 유형", "애착 패턴", "불안형", "회피형 연애", "카톡 대화 분석"],
  openGraph: {
    title: "카톡으로 보는 상대방 애착 패턴 | 회피형 판독기",
    description: "카카오톡 대화를 붙여넣으면 상대가 대화에서 보인 불안·회피 패턴과 애착 유형을 분석합니다. 대화 원문은 서비스 DB에 저장되지 않습니다.",
    url: '/',
    siteName: '회피형 판독기',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '회피형 판독기 - 카톡 대화 분석',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "카톡으로 보는 상대방 애착 패턴 | 회피형 판독기",
    description: "카카오톡 대화를 붙여넣으면 상대가 대화에서 보인 불안·회피 패턴과 애착 유형을 분석합니다. 대화 원문은 서비스 DB에 저장되지 않습니다.",
    images: ['/og-image.png'],
  },
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
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
