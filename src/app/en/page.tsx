import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, Compass, Globe, Award, Sparkles, ArrowRight, ShieldCheck, Cross } from 'lucide-react';
import { getLibraryArticles } from '@/lib/api';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';

export const metadata: Metadata = {
  title: 'CRUX VERITATIS — Catholic Biblical Studies & Sacred Theology',
  description: 'An international academic portal dedicated to Catholic Scripture studies, Patristics, Dogmatic Theology, and Church History.',
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      'vi-VN': SITE_URL,
      'en-US': `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: 'CRUX VERITATIS — Catholic Biblical Studies & Sacred Theology',
    description: 'An international academic portal dedicated to Catholic Scripture studies, Patristics, Dogmatic Theology, and Church History.',
    url: `${SITE_URL}/en`,
    siteName: 'CRUX VERITATIS',
    type: 'website',
  },
};

export default async function EnglishLandingPage() {
  const articles = await getLibraryArticles();
  // Filter articles that have English translations, or fallback to latest articles
  const translatedArticles = articles.filter(a => a.content_en && a.content_en.trim().length > 0);
  const displayArticles = translatedArticles.length > 0 ? translatedArticles : articles.slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-24 pt-20 sm:pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HERO SECTION */}
        <header className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-serif font-bold uppercase tracking-widest shadow-sm">
            <Globe className="w-3.5 h-3.5" /> International Edition · English
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-[var(--text-main)] leading-tight">
            CRUX VERITATIS
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-amber-700 dark:text-amber-300 leading-relaxed">
            &ldquo;Veritas Vos Liberabit&rdquo; — The Truth Shall Make You Free (Jn 8:32)
          </p>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-sans">
            A digital academic sanctuary bridging Biblical Exegesis, Sacred Geography, Patristics, and Church History in full communion with the Universal Catholic Church.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/kinh-thanh"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Sacred Scripture
            </Link>

            <Link
              href="/ban-do"
              className="px-6 py-3 rounded-full bg-[var(--bg-card)] hover:bg-slate-800 border border-[var(--border-card)] text-[var(--text-main)] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            >
              <Compass className="w-4 h-4 text-amber-500" /> Holy Land 3D Map
            </Link>

            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-700 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              🇻🇳 Bản Tiếng Việt
            </Link>
          </div>
        </header>

        {/* SCHOLARLY PILLARS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-lg text-[var(--text-main)]">Biblical Exegesis</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Historical-critical analysis, ancient Near Eastern context, and canonical Patristic commentary on all 73 books of Sacred Scripture.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-lg text-[var(--text-main)]">Sacred Geography</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              High-precision geospatial mapping of Holy Land sanctuaries, biblical journey routes, and archaeological excavation records.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-lg text-[var(--text-main)]">Dogmatic Theology</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Trinitarian orthodoxy, Christology, and Thomistic synthesis guided by the Magisterium and the Catechism of the Catholic Church.
            </p>
          </div>
        </section>

        {/* ARTICLES SECTION */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
            <div>
              <h2 className="text-2xl font-serif font-black text-[var(--text-main)]">
                Featured Studies &amp; Research
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {translatedArticles.length > 0 
                  ? 'Academic treatises available in English translation'
                  : 'Bilingual publications in theological research'}
              </p>
            </div>

            <Link
              href="/thu-vien"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Full Library (VI) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => {
              const displayTitle = article.title_en || article.title;
              const displayExcerpt = article.excerpt_en || article.excerpt;
              const articleHref = article.title_en ? `/en/${article.slug}` : `/${article.slug}`;

              return (
                <article
                  key={article.id}
                  className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] p-6 shadow-md hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="font-semibold text-amber-500 uppercase tracking-wider">
                        {article.category || 'Theology'}
                      </span>
                      {article.title_en && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                          EN Translated
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base text-[var(--text-main)] group-hover:text-amber-500 transition-colors line-clamp-2">
                      <Link href={articleHref}>{displayTitle.replace(/<[^>]+>/g, '')}</Link>
                    </h3>

                    {displayExcerpt && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                        {displayExcerpt.replace(/<[^>]+>/g, '')}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{article.author_name || 'VERIDU Faculty'}</span>
                    <Link
                      href={articleHref}
                      className="font-bold text-amber-500 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Read Study <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
