import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getLibraryArticleBySlug } from '@/lib/api';
import { prepareArticlePageData } from '@/lib/articlePageHelper';
import ArticleReaderClient from '@/components/article/ArticleReaderClient';

export const revalidate = 3600;
export const dynamicParams = true;

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
  const pageData = await prepareArticlePageData(resolvedParams.slug);

  if (!pageData) {
    notFound();
  }

  const { article, articleJsonLd, cleanTitleEn } = pageData;
  const articleType = article.article_type || 'standard';

  // 1. Fullscreen interactive sandbox (if applicable)
  if (articleType === 'interactive') {
    return (
      <main className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <style>{`
          header, footer, button[aria-label="Trở về đầu trang"] { display: none !important; }
          body { background-color: #020617 !important; overflow: hidden !important; }
        `}</style>
        
        <div className="absolute top-6 left-6 z-50">
          <Link 
            href="/en" 
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full glass-panel border border-white/20 shadow-2xl text-white hover:scale-105 hover:bg-white/20 backdrop-blur-md transition-all group font-medium text-sm cursor-pointer"
            title="Exit Fullscreen & Return to Portal"
            aria-label="Exit fullscreen"
          >
            <ArrowLeft className="w-4 h-4 drop-shadow-md group-hover:-translate-x-1 transition-transform" />
            <span>Exit Fullscreen</span>
          </Link>
        </div>
        
        <iframe 
          src={`/api/raw-html/${resolvedParams.slug}`} 
          className="w-full h-full border-none"
          title={cleanTitleEn}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
      </main>
    );
  }

  // 2. Unified Stained-Glass Scholarly Reader initialized in English
  return (
    <ArticleReaderClient 
      initialLocale="en"
      {...pageData}
    />
  );
}
