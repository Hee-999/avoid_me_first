import type { Metadata } from 'next';
import Link from 'next/link';
import { LOVE_COLUMNS, LoveColumnArticle } from '@/data/columns';

export const metadata: Metadata = {
  title: '애착 심리 & 카톡 패턴 분석 칼럼 10선 | 러브패턴',
  description: '회피형 카톡 특징부터 불안형-회피형 갈등 해결법, 카톡 읽씹 대처 템플릿까지 바솔로뮤 애착 모델 기반 실전 가이드를 만나보세요.',
  alternates: {
    canonical: '/columns',
  },
};

const CATEGORY_STYLES: Record<LoveColumnArticle['category'], { badge: string }> = {
  '카톡 패턴 분석': { badge: 'bg-blue-50 border-blue-200 text-blue-600' },
  '애착 유형': { badge: 'bg-purple-50 border-purple-200 text-purple-600' },
  '관계 대처법': { badge: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  '재회·이별': { badge: 'bg-rose-50 border-rose-200 text-rose-600' },
};

export default function LoveColumnsPage() {
  return (
    <div className="w-full bg-zinc-50 min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-lg tracking-tight text-zinc-900 group-hover:text-blue-600 transition-colors">
              러브패턴
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              관계 심리 연구소
            </span>
          </Link>
          <Link
            href="/?view=input"
            className="text-xs font-bold px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm"
          >
            카톡 10초 무료 분석 &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-zinc-200 py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-xs font-semibold text-zinc-600 mb-3">
            📚 바솔로뮤 성인 애착 모델 기반 심리 분석
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-3">
            회피형·불안형 <span className="text-blue-600">애착 심리 칼럼</span>
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
            상대방의 카톡 단답과 읽씹 속에 숨겨진 무의식 방어기제를 분석하고, 상처받지 않고 건강하게 소통하는 실전 솔루션을 제공합니다.
          </p>
        </div>
      </section>

      {/* Grid of Columns */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LOVE_COLUMNS.map((col) => {
            const style = CATEGORY_STYLES[col.category] || CATEGORY_STYLES['카톡 패턴 분석'];
            return (
              <Link
                key={col.slug}
                href={`/columns/${col.slug}`}
                className="group bg-white p-6 rounded-2xl border border-zinc-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${style.badge}`}>
                      {col.category}
                    </span>
                    <span className="text-zinc-400 font-medium">⏱️ {col.readTime}</span>
                  </div>

                  <h2 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors text-base sm:text-lg leading-snug mb-2.5">
                    {col.title}
                  </h2>

                  <p className="text-zinc-500 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                    {col.summary}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{col.date}</span>
                  <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    칼럼 읽기 &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Funnel Bridge to Upload */}
        <div className="mt-14 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-300 mb-3">
            💬 100% 비식별화 안심 분석
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2 leading-tight">
            지금 내 카톡에서도 회피·불안 신호가 감지될까?
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
            카톡 캡처 사진 3장만 올리시면, 상대방의 회피 지수와 숨겨진 무의식 속마음을 AI가 10초 만에 무료로 판독해 드립니다.
          </p>
          <Link
            href="/?view=input"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all text-sm shadow-lg shadow-blue-900/50"
          >
            🔍 내 카톡 대화 10초 무료 분석하기 &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
