import { getLibraryArticleBySlug, determineArticleType } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import AdminEditFloatingButton from '@/components/AdminEditFloatingButton';
import { BookOpen, Heart, ArrowLeft, Cross, Calendar, Clock, User, Tag, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1-hour Edge CDN caching with on-demand revalidation

// ─── GENERATE METADATA FROM SITESEO ──────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return { title: 'Không tìm thấy bài viết | VERIDU' };
  }

  const defaultTitle = typeof article.title === 'string' ? article.title.replace(/<[^>]+>/g, '') : 'Bài Viết VERIDU';
  const defaultDesc = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) : 'Khám phá thư viện tài liệu Công giáo trên VERIDU.';
  const defaultImage = article.thumbnail || article.featured_image || 'https://www.thapgia.com/default-og-image.jpg';

  const seo = article.seo || {};

  return {
    title: seo.title || defaultTitle,
    description: seo.description || defaultDesc,
    alternates: {
      canonical: `https://www.thapgia.com/${resolvedParams.slug}`,
    },
    openGraph: {
      url: `https://www.thapgia.com/${resolvedParams.slug}`,
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

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const MetaDataRow = ({ article }: { article: any }) => (
  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-serif text-[var(--text-muted)] mt-5 pt-4 border-t border-[var(--border-card)]/40">
    {article.author && (
      <div className="flex items-center gap-1.5 bg-[var(--bg-main)] px-3 py-1.5 rounded-full border border-[var(--border-card)] text-[var(--text-main)] font-bold">
        <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{article.author}</span>
      </div>
    )}
    {article.created_at && (
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-amber-500" />
        <span>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    )}
    {(article.readingTime || article.reading_time) && (
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span>{article.readingTime || article.reading_time}</span>
      </div>
    )}
    {article.category && (
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-amber-500" />
        <span>{article.category}</span>
      </div>
    )}
  </div>
);

const HeroBanner = ({ imageUrl }: { imageUrl?: string }) => {
  if (!imageUrl) return null;
  const isGoogleDrive = imageUrl.includes('googleusercontent.com') || imageUrl.includes('drive.google.com');
  return (
    <div className="w-full h-[38vh] sm:h-[48vh] relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/60 to-transparent z-10"></div>
      <Image 
        src={imageUrl} 
        alt="Cover" 
        fill 
        className="object-cover animate-fadeIn" 
        sizes="100vw" 
        priority 
        unoptimized={isGoogleDrive}
      />
    </div>
  );
};

export default async function LibraryArticle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Unified Article Type Resolution (interactive vs standard)
  const resolvedType = determineArticleType(article.category, article.article_type, article.interactiveHtml || article.contentHtml);
  const isInteractive = resolvedType === 'interactive';

  const titleText = typeof article.title === 'string' ? article.title : 'Bài Viết VERIDU';
  const htmlContent = article.interactiveHtml || article.contentHtml || '';
  const scriptureQuote = (article as any).scripture_quote || (article as any).scriptureQuote;
  const prayerText = (article as any).prayer_text || (article as any).prayerText;
  const coverImage = article.featured_image || article.thumbnail;
  const articleUrl = `https://www.thapgia.com/thu-vien/${resolvedParams.slug}`;
  const cleanTitle = titleText.replace(/<[^>]+>/g, '');
  const defaultDesc = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) : 'Khám phá thư viện tài liệu Công giáo trên VERIDU.';
  const defaultImage = article.thumbnail || article.featured_image || 'https://www.thapgia.com/default-og-image.jpg';

  // Structured Data (JSON-LD) for Article & Breadcrumb
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        "isPartOf": { "@id": "https://www.thapgia.com/#website" },
        "headline": cleanTitle,
        "description": (article.excerpt || defaultDesc).replace(/<[^>]+>/g, '').substring(0, 200),
        "image": [coverImage || defaultImage],
        "datePublished": article.created_at || new Date().toISOString(),
        "dateModified": article.updated_at || article.created_at || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": article.author || "Ban Biên Tập VERIDU"
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.thapgia.com/#organization",
          "name": "VERIDU",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.thapgia.com/favicon.ico"
          }
        },
        "mainEntityOfPage": articleUrl
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang Chủ",
            "item": "https://www.thapgia.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Thư Viện",
            "item": "https://www.thapgia.com/thu-vien"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": cleanTitle,
            "item": articleUrl
          }
        ]
      }
    ]
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ĐỊNH DẠNG BÀI VIẾT TƯƠNG TÁC (Interactive Fullscreen Sandbox Takeover)
  // ═══════════════════════════════════════════════════════════════════════════
  if (isInteractive) {
    return (
      <main className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 overflow-hidden">
        <style>{`
          header, footer, button[aria-label="Trở về đầu trang"] { display: none !important; }
          body { background-color: #020617 !important; overflow: hidden !important; }
        `}</style>
        
        {/* Floating Glassmorphic Exit Button */}
        <div className="absolute top-6 left-6 z-50">
          <Link 
            href="/thu-vien" 
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 border border-white/20 shadow-2xl text-white hover:scale-105 hover:bg-slate-800/90 backdrop-blur-md transition-all group font-serif font-bold text-xs cursor-pointer"
            title="Thoát Toàn Màn Hình & Quay Lại Thư Viện"
            aria-label="Thoát toàn màn hình"
          >
            <ArrowLeft className="w-4 h-4 drop-shadow-md group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span>Thoát Toàn Màn Hình</span>
          </Link>
        </div>
        
        <iframe 
          src={`/api/raw-html/${resolvedParams.slug}`} 
          className="w-full h-full border-none bg-slate-950"
          title={cleanTitle}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />

        <ShareButtons url={articleUrl} title={cleanTitle} />
      </main>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ĐỊNH DẠNG BÀI VIẾT CƠ BẢN (Standard / Rich Structured Editorial Article)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-28">
      <HeroBanner imageUrl={coverImage} />

      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${coverImage ? '-mt-28' : 'pt-24 sm:pt-28 md:pt-36'}`}>
        
        {/* Back Link */}
        <Link 
          href="/thu-vien" 
          className="inline-flex items-center text-xs font-bold font-serif text-amber-700 dark:text-amber-400 hover:underline mb-6 bg-[var(--bg-card)]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-card)] shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Thư Viện
        </Link>
        
        {/* 2-Column Responsive Layout (70% Article Body + 30% Sticky TOC) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Main Article Body Container */}
          <main className="flex-1 w-full min-w-0 max-w-[880px] mx-auto">
            <article className="p-6 sm:p-12 lg:p-14 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-8 relative overflow-hidden backdrop-blur-sm">
              
              {/* Header Section */}
              <header className="border-b border-[var(--border-card)] pb-8 text-center sm:text-left space-y-4 relative z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> {article.category || 'Khảo Cứu & Suy Niệm'}
                </span>

                <h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[var(--text-main)] leading-[1.2] drop-shadow-sm" 
                  dangerouslySetInnerHTML={{ __html: titleText }} 
                />

                <MetaDataRow article={article} />
              </header>

              {/* Special Scripture Quote Block (Trích Đoạn Lời Chúa Nổi Bật) */}
              {scriptureQuote && (
                <div className="p-6 sm:p-8 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-3 relative z-10 shadow-inner backdrop-blur-md">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-serif">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Lời Chúa Soi Đường
                  </span>
                  <blockquote className="font-serif italic text-amber-950 dark:text-amber-100 text-lg sm:text-xl leading-relaxed">
                    &quot;{scriptureQuote}&quot;
                  </blockquote>
                </div>
              )}
              
              {/* Visual & Structured Article Content Renderer */}
              <div className="article-content relative z-10 font-serif">
                <VisualArticleRenderer contentHtml={htmlContent} />
              </div>

              {/* Special Prayer Block (Lời Nguyện Kính) */}
              {prayerText && (
                <div className="p-6 sm:p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 relative z-10 mt-12 backdrop-blur-md shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 font-serif">
                    <Heart className="w-4 h-4 text-red-500" /> Lời Nguyện Suy Niệm
                  </span>
                  <p className="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed">
                    &quot;{prayerText}&quot;
                  </p>
                </div>
              )}
              
              {/* Tags List */}
              {(article as any).tags && (article as any).tags.length > 0 && (
                <div className="pt-8 border-t border-[var(--border-card)] flex flex-wrap gap-2 relative z-10 font-serif">
                  {(article as any).tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-lg text-xs font-semibold text-[var(--text-main)] shadow-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

            </article>
          </main>

          {/* Sticky Table of Contents (TOC) Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-32 self-start">
            <TableOfContents />
          </aside>

        </div>
      </div>

      <ShareButtons url={articleUrl} title={cleanTitle} />
      <AdminEditFloatingButton articleId={article.id} />
    </div>
  );
}
