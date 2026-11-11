import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LOVE_COLUMNS, getLoveColumnBySlug, LoveColumnArticle } from '@/data/columns';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return LOVE_COLUMNS.map((col) => ({
    slug: col.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = getLoveColumnBySlug(slug);

  if (!col) {
    return {
      title: '칼럼을 찾을 수 없습니다 | 러브패턴',
    };
  }

  const url = `https://lovepattern.site/columns/${col.slug}`;

  return {
    title: `${col.title} | 러브패턴`,
    description: col.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: col.title,
      description: col.summary,
      url,
      type: 'article',
      publishedTime: col.date.replace(/\./g, '-'),
    },
    twitter: {
      card: 'summary_large_image',
      title: col.title,
      description: col.summary,
    },
  };
}

const CATEGORY_STYLES: Record<LoveColumnArticle['category'], { badge: string }> = {
  '카톡 패턴 분석': { badge: 'bg-blue-50 border-blue-200 text-blue-600' },
  '애착 유형': { badge: 'bg-purple-50 border-purple-200 text-purple-600' },
  '관계 대처법': { badge: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  '재회·이별': { badge: 'bg-rose-50 border-rose-200 text-rose-600' },
};

export default async function LoveColumnDetailPage({ params }: Props) {
  const { slug } = await params;
  const col = getLoveColumnBySlug(slug);

  if (!col) {
    notFound();
  }

  const style = CATEGORY_STYLES[col.category] || CATEGORY_STYLES['카톡 패턴 분석'];
  const related = LOVE_COLUMNS.filter((c) => c.slug !== col.slug).slice(0, 3);

  return (
    <div className="w-full bg-zinc-50 min-h-screen pb-24">
      {/* Article Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: col.title,
            description: col.summary,
            datePublished: col.date.replace(/\./g, '-'),
            author: {
              '@type': 'Organization',
              name: '러브패턴 관계 심리 연구소',
            },
            publisher: {
              '@type': 'Organization',
              name: '러브패턴',
              url: 'https://lovepattern.site',
            },
          }),
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 py-3.5 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/columns" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            <span>&larr;</span> 칼럼 목록으로
          </Link>
          <Link
            href="/?view=input"
            className="text-xs font-bold px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm"
          >
            카톡 무료 분석 &rarr;
          </Link>
        </div>
      </header>

      {/* Article Hero */}
      <section className="bg-white border-b border-zinc-200 py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Category & Meta */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${style.badge}`}>
              {col.category}
            </span>
            <span className="text-zinc-400">⏱️ {col.readTime}</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-400">{col.date}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug mb-4">
            {col.title}
          </h1>

          {/* Highlight Callout */}
          <div className="bg-blue-50/70 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-relaxed">
              💡 <span className="text-blue-700">핵심 포인트:</span> {col.highlight}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <article className="bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200 shadow-sm mb-12">
          {col.sections.map((sec, idx) => (
            <div key={idx} className="mb-10 last:mb-0">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
                {sec.heading}
              </h2>

              {sec.subheading && (
                <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-3">
                  {sec.subheading}
                </h3>
              )}

              <div className="space-y-4 text-zinc-700 text-sm sm:text-base leading-relaxed">
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {/* Callout */}
              {sec.callout && (
                <div className="mt-5 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-700">
                  {sec.callout}
                </div>
              )}

              {/* Table */}
              {sec.table && (
                <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-zinc-100 text-zinc-700 font-bold">
                      <tr>
                        {sec.table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-3 border-b border-zinc-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {sec.table.rows.map((r, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                          {r.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-zinc-600">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Checklist */}
              {sec.checklist && (
                <ul className="mt-5 space-y-2.5">
                  {sec.checklist.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700">
                      <span className="text-blue-500 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Mid-Article Funnel Bridge 1 (after section 1) */}
              {idx === 0 && (
                <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
                      🔍 지금 내 카톡 대화도 회피형 신호일까?
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                      고민되는 카톡 캡처만 올리면 상대방의 회피·불안 점수를 10초 만에 무료로 판독해 드립니다.
                    </p>
                  </div>
                  <Link
                    href={`/?view=input&utm_source=column_${col.slug}`}
                    className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-sm transition-colors"
                  >
                    10초 무료 분석 &rarr;
                  </Link>
                </div>
              )}

              {/* Mid-Article Funnel Bridge 2 (after section 2) */}
              {idx === 1 && (
                <div className="my-8 p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
                      💬 지금 뭐라고 답장해야 할지 막막하신가요?
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                      상대방의 말풍선 속 숨은 의도를 읽고, 부담 없이 답장을 이끌어내는 맞춤 카톡 문장을 확인해 보세요.
                    </p>
                  </div>
                  <Link
                    href={`/?view=input&utm_source=column_${col.slug}`}
                    className="shrink-0 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm rounded-full shadow-sm transition-colors"
                  >
                    내 카톡 진단하기 &rarr;
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* FAQ */}
          {col.faq && col.faq.length > 0 && (
            <div className="mt-12 pt-8 border-t border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-4">
                ❓ 자주 묻는 질문
              </h3>
              <div className="space-y-3.5">
                {col.faq.map((item, fIdx) => (
                  <div key={fIdx} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="font-bold text-zinc-800 text-xs sm:text-sm mb-1">
                      Q. {item.question}
                    </p>
                    <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Bottom Full CTA */}
        <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl mb-14">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-300 mb-3">
            💬 실시간 AI 카톡 대화 판독기
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3">
            상대방의 진짜 속마음이 헷갈린다면?
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
            답장 간격, 단답 패턴, 역질문 빈도를 종합 분석하여 상대방의 회피·불안 애착 성향을 과학적으로 진단해 드립니다.
          </p>
          <Link
            href="/?view=input"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all text-sm shadow-lg shadow-blue-900/50"
          >
            🔍 카톡 캡처로 상대방 심리 무료 분석하기
          </Link>
        </section>

        {/* Related Columns */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">
                함께 읽으면 도움 되는 추천 칼럼
              </h3>
              <Link href="/columns" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                전체 칼럼 &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/columns/${rel.slug}`}
                  className="bg-white p-4 rounded-xl border border-zinc-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 mb-1.5 inline-block">
                      {rel.category}
                    </span>
                    <h4 className="font-bold text-zinc-800 text-xs sm:text-sm line-clamp-2 mb-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-400">⏱️ {rel.readTime}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
