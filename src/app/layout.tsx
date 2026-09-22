import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/legal/Footer";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "카톡으로 보는 상대방 애착 패턴 | 회피형 판독기",
  description: "카카오톡 대화를 붙여넣으면 상대가 대화에서 보인 불안·회피 패턴과 애착 유형을 분석합니다. 대화 원문은 서비스 DB에 저장되지 않습니다.",
  keywords: [
    "회피형",
    "회피형 특징",
    "회피형 연애",
    "애착유형 테스트",
    "애착 유형 검사",
    "불안형",
    "공포회피형",
    "거부회피형",
    "카톡 대화 분석",
    "바솔로뮤 애착유형"
  ],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'guclDu3Whts1gcWwd3mFpjYlbMge6eJRSHW3anCDQX0',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://lovepattern.site/#webapp",
      "name": "회피형 판독기",
      "url": "https://lovepattern.site",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "description": "카카오톡 대화를 기반으로 바솔로뮤 성인 애착 모델을 적용하여 상대방의 회피형·불안형 애착 패턴을 판독하는 심리 분석 서비스입니다.",
      "offers": [
        {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "KRW",
          "name": "무료 애착 유형 분석",
          "description": "카톡 대화 기반 불안·회피 4대 애착 유형 및 점수 무료 판독"
        },
        {
          "@type": "Offer",
          "price": "4900",
          "priceCurrency": "KRW",
          "name": "프리미엄 심층 분석 리포트",
          "description": "상대방 무의식 방어기제, 핵심 트리거, 1:1 맞춤 카톡 대응 화법 가이드"
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://lovepattern.site/#organization",
      "name": "회피형 판독기",
      "url": "https://lovepattern.site",
      "logo": "https://lovepattern.site/og-image.png"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-zinc-100 text-zinc-900 antialiased`}>
        <Script src="https://pay.nicepay.co.kr/v1/js/" strategy="lazyOnload" />
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

