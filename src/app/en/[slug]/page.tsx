import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLibraryArticleBySlug, fetchArticleAuthorProfile } from '@/lib/api';
import { ArrowLeft, Tag, Calendar, User, Globe, Share2 } from 'lucide-react';
import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ArticleLanguageBanner from '@/components/ArticleLanguageBanner';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return { title: 'Article Not Found | CRUX VERITATIS' };
  }

  const title = (article.title_en || article.title || 'Scholarly Treatise').replace(/<[^>]+>/g, '');
  const description = (article.excerpt_en || article.excerpt || 'Catholic theological treatise on CRUX VERITATIS.').replace(/<[^>]+>/g, '').substring(0, 160);
  const articleUrl = `${SITE_URL}/en/${resolvedParams.slug}`;
  const viUrl = `${SITE_URL}/${resolvedParams.slug}`;

  return {
    title: `${title} | CRUX VERITATIS`,
    description,
    alternates: {
      canonical: articleUrl,
      languages: {
        'vi-VN': viUrl,
        'en-US': articleUrl,
      },
    },
    openGraph: {
      url: articleUrl,
      siteName: 'CRUX VERITATIS',
      title: `${title} | CRUX VERITATIS`,
      description,
      type: 'article',
    },
  };
}

export default async function EnglishArticlePage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const authorProfile = await fetchArticleAuthorProfile(article.author_id, article.author_name || article.author);

  const displayTitle = (article.title_en || article.title).replace(/<[^>]+>/g, '');
  const displayContent = article.content_en || article.contentHtml || '';
  const displayExcerpt = article.excerpt_en || article.excerpt || '';
  const isTranslated = Boolean(article.content_en && article.content_en.trim().length > 0);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-24 pt-20 sm:pt-24 md:pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP NAVIGATION & LANGUAGE SWITCH */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
          <Link
            href="/en"
            className="inline-flex items-center text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline bg-[var(--bg-card)] px-3.5 py-1.5 rounded-full border border-[var(--border-card)] shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to English Portal
          </Link>

          {/* Bilingual Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-900/60 border border-slate-700/60 shadow-sm text-xs">
            <Link
              href={`/${resolvedParams.slug}`}
              className="px-3 py-1 rounded-full text-slate-400 hover:text-white transition-all font-medium"
            >
              🇻🇳 Tiếng Việt
            </Link>
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold shadow transition-all">
              🇬🇧 English
            </span>
          </div>
        </div>

        {/* BILINGUAL / TRANSLATION ACTION BANNER */}
        <ArticleLanguageBanner 
          articleId={article.id}
          articleSlug={resolvedParams.slug}
          articleTitle={article.title}
          hasManualEnglish={isTranslated}
          titleEn={article.title_en}
          contentEn={article.content_en}
          excerptEn={article.excerpt_en}
        />

        {/* ARTICLE HEADER */}
        <header className="space-y-4 border-b border-[var(--border-card)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-serif font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" /> {article.category || 'Sacred Theology'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[var(--text-main)] leading-tight">
            {displayTitle}
          </h1>

          {displayExcerpt && (
            <p className="text-base sm:text-lg text-[var(--text-muted)] font-serif italic leading-relaxed">
              {displayExcerpt.replace(/<[^>]+>/g, '')}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-2 font-mono">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>{authorProfile.christian_name ? `${authorProfile.christian_name} ${authorProfile.full_name}` : (article.author_name || 'VERIDU Faculty')}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{article.created_at ? new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Undated'}</span>
            </div>
          </div>
        </header>

        {/* ARTICLE BODY */}
        <main className="scholarly-body">
          <VisualArticleRenderer contentHtml={displayContent} />
        </main>

        {/* FOOTER NAVIGATION */}
        <footer className="pt-8 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/en"
            className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
          >
            &larr; Back to International Portal
          </Link>
          <Link
            href={`/${resolvedParams.slug}`}
            className="text-xs text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Đọc bản gốc tiếng Việt &rarr;
          </Link>
        </footer>

      </div>
    </div>
  );
}
