import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getLibraryArticleBySlug } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { prepareArticlePageData } from '@/lib/articlePageHelper';
import ArticleReaderClient from '@/components/article/ArticleReaderClient';

export const revalidate = 3600; // 1-hour Edge CDN caching with on-demand ISR revalidation
export const dynamicParams = true; // Allow new articles published after build time

export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published');

    if (!posts || posts.length === 0) return [];
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.warn('generateStaticParams error in [slug]:', error);
    return [];
  }
}

const RESERVED_SLUGS = new Set([
  'admin', 'wp-admin', 'thu-vien', 'courses', 'khoa-hoc', 'doc-kinh-thanh', 
  'kinh-thanh', 'ban-do-kinh-thanh', 'ban-do', 'dong-thoi-gian', 'lich-su', 
  'nhan-vat', 'quiz', 'dang-nhap', 'dang-ky', 'quen-mat-khau', 'ho-so', 'cai-dat', 'search', 
  'dang-bai', 'api', '_next', 'dieu-khoan-su-dung', 'chinh-sach-bao-mat', 'giao-ly'
]);

// ─── GENERATE METADATA FROM SITESEO ──────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  if (RESERVED_SLUGS.has(resolvedParams.slug)) {
    return { title: 'Trang | VERIDU' };
  }

  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return { title: 'Không tìm thấy bài viết | VERIDU' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';
  const defaultTitle = typeof article.title === 'string' ? article.title.replace(/<[^>]+>/g, '') : 'Bài Viết VERIDU';
  const defaultDesc = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) : 'Khám phá thư viện tài liệu Công giáo trên VERIDU.';
  const ogDynamicUrl = `${siteUrl}/api/og?title=${encodeURIComponent(defaultTitle)}&category=${encodeURIComponent(article.category || 'Thần Học & Thánh Kinh')}&author=${encodeURIComponent(article.author_name || article.author || 'Ban Học Vụ VERIDU')}`;
  const defaultImage = (article.thumbnail && !article.thumbnail.includes('default-og-image')) ? article.thumbnail : ((article.featured_image && !article.featured_image.includes('default-og-image')) ? article.featured_image : ogDynamicUrl);

  const seo = article.seo || {};

  return {
    title: seo.title || defaultTitle,
    description: seo.description || defaultDesc,
    alternates: {
      canonical: `${siteUrl}/${resolvedParams.slug}`,
      languages: {
        'vi-VN': `${siteUrl}/${resolvedParams.slug}`,
        'en-US': `${siteUrl}/en/${resolvedParams.slug}`,
      },
    },
    openGraph: {
      url: `${siteUrl}/${resolvedParams.slug}`,
      siteName: 'VERIDU',
      title: seo.og_title || seo.title || defaultTitle,
      description: seo.og_description || seo.description || defaultDesc,
      images: [
        {
          url: seo.og_image || defaultImage,
          width: 1200,
          height: 630,
          alt: defaultTitle,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.og_title || seo.title || defaultTitle,
      description: seo.og_description || seo.description || defaultDesc,
      images: [seo.og_image || defaultImage],
    },
    robots: {
      index: seo.noindex === 'yes' ? false : true,
      follow: seo.noindex === 'yes' ? false : true,
    }
  };
}

export default async function ShortArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  if (RESERVED_SLUGS.has(resolvedParams.slug)) {
    notFound();
  }

  const pageData = await prepareArticlePageData(resolvedParams.slug);

  if (!pageData) {
    notFound();
  }

  const { article, articleJsonLd, cleanTitle } = pageData;
  const articleType = article.article_type || 'standard';

  // 1. TEMPLATE BÀI TƯƠNG TÁC (HTML/JS Sandbox Fullscreen)
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
        
        {/* Floating Glassmorphic Back / Exit Full-Screen Button */}
        <div className="absolute top-6 left-6 z-50">
          <Link 
            href="/thu-vien" 
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full glass-panel border border-white/20 shadow-2xl text-white hover:scale-105 hover:bg-white/20 backdrop-blur-md transition-all group font-medium text-sm cursor-pointer"
            title="Thoát Toàn Màn Hình & Quay Lại Thư Viện"
            aria-label="Thoát toàn màn hình"
          >
            <ArrowLeft className="w-4 h-4 drop-shadow-md group-hover:-translate-x-1 transition-transform" />
            <span>Thoát Toàn Màn Hình</span>
          </Link>
        </div>
        
        <iframe 
          src={`/api/raw-html/${resolvedParams.slug}`} 
          className="w-full h-full border-none"
          title={cleanTitle}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
      </main>
    );
  }

  // 2. UNIFIED STAINED-GLASS ARTICLE READER (Client-Side Smooth Switching)
  return (
    <ArticleReaderClient 
      initialLocale="vi"
      {...pageData}
    />
  );
}
