import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/legal/Footer";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lovepattern.site'),
  title: "그 사람, 진짜 속마음이 뭘까? | 러브패턴",
  description: "카톡 대화 캡처로 재회·썸 확률과 두 사람의 관계 온도차, 숨은 속마음을 판독해 보세요. 대화 원문은 저장되지 않습니다.",
  keywords: [
    "러브패턴",
    "카톡 속마음 분석",
    "재회 확률",
    "썸 호감도 테스트",
    "연애 온도차",
    "회피형",
    "회피형 연애",
    "애착유형 테스트",
    "카톡 대화 분석"
  ],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'guclDu3Whts1gcWwd3mFpjYlbMge6eJRSHW3anCDQX0',
    other: {
      'naver-site-verification': 'a93cd37a80d00ce1d831b6883214206d96c98a50',
    },
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
    title: "그 사람, 진짜 속마음이 뭘까? | 러브패턴",
    description: "카톡 대화 캡처로 재회·썸 확률과 두 사람의 관계 온도차, 숨은 속마음을 판독해 보세요.",
    url: '/',
    siteName: '러브패턴',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '러브패턴 - 카톡 속마음 & 온도차 판독',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "그 사람, 진짜 속마음이 뭘까? | 러브패턴",
    description: "카톡 대화 캡처로 재회·썸 확률과 두 사람의 관계 온도차, 숨은 속마음을 판독해 보세요.",
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://lovepattern.site/#webapp",
      "name": "러브패턴",
      "url": "https://lovepattern.site",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "description": "카카오톡 대화 캡처를 분석해 썸 호감도, 재회 가능성, 두 사람의 관계 온도차와 상대방의 진짜 속마음을 판독하는 연애 심리 분석 서비스입니다.",
      "offers": [
        {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "KRW",
          "name": "무료 카톡 속마음 & 온도차 분석",
          "description": "카톡 대화 기반 내 감정 온도, 핵심 심리 시그널 및 성급한 연락 주의 지수 무료 판독"
        },
        {
          "@type": "Offer",
          "price": "3900",
          "priceCurrency": "KRW",
          "name": "심층 속마음 리포트 + 1:1 AI 상담",
          "description": "상대 실제 온도(%), 재회·썸 성사 가능성, 7개 장 심층 리포트 및 1:1 AI 카톡 상담 3회 제공"
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://lovepattern.site/#website",
      "url": "https://lovepattern.site",
      "name": "러브패턴",
      "inLanguage": "ko-KR"
    },
    {
      "@type": "Organization",
      "@id": "https://lovepattern.site/#organization",
      "name": "러브패턴",
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
        <MetaPixel />
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

