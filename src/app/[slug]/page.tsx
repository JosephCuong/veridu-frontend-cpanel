import { getLibraryArticleBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import AdminEditFloatingButton from '@/components/AdminEditFloatingButton';
import { BookOpen, Sparkles, Heart, ArrowLeft, Cross, Calendar, Clock, User, Tag } from 'lucide-react';

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

  const defaultTitle = typeof article.title === 'string' ? article.title.replace(/<[^>]+>/g, '') : 'Bài Viết VERIDU';
  const defaultDesc = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) : 'Khám phá thư viện tài liệu Công giáo trên VERIDU.';
  const defaultImage = article.thumbnail || article.featured_image || 'https://www.thapgia.com/default-og-image.jpg';

  const seo = article.seo || {};

  return {
    title: seo.title || defaultTitle,
    description: seo.description || defaultDesc,
    openGraph: {
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

import { formatImageUrl } from '@/lib/htmlProcessor';

const MetaDataRow = ({ article }: { article: any }) => (
  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300 mt-6">
    {article.author && (
      <div className="flex items-center gap-1.5 bg-[var(--bg-main)] px-3 py-1.5 rounded-full border border-[var(--border-card)]">
        <User className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span>{article.author}</span>
      </div>
    )}
    {article.created_at && (
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
        <span>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    )}
    {(article.readingTime || article.reading_time) && (
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
        <span>{article.readingTime || article.reading_time}</span>
      </div>
    )}
    {article.category && (
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
        <span>{article.category}</span>
      </div>
    )}
  </div>
);

const HeroBanner = ({ imageUrl }: { imageUrl?: string }) => {
  if (!imageUrl) return null;
  return (
    <div className="w-full h-[40vh] sm:h-[50vh] relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent z-10"></div>
      <Image src={imageUrl} alt="Cover" fill className="object-cover animate-fadeIn" sizes="100vw" priority />
    </div>
  );
};

export default async function ShortArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  if (RESERVED_SLUGS.has(resolvedParams.slug)) {
    notFound();
  }

  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const articleType = article.article_type || 'standard';
  const titleText = typeof article.title === 'string' ? article.title : 'Bài Viết VERIDU';
  const htmlContent = article.interactiveHtml || article.contentHtml || '';
  const prayerText = (article as any).prayerText as string | undefined;
  
  const coverImage = formatImageUrl(article.featured_image || article.thumbnail);

  // Domain for share buttons (Short SEO URL)
  const articleUrl = `https://www.thapgia.com/${resolvedParams.slug}`;
  const cleanTitle = titleText.replace(/<[^>]+>/g, '');

  // 1. TEMPLATE BÀI TƯƠNG TÁC (HTML/JS Sandbox Fullscreen)
  if (articleType === 'interactive') {
    return (
      <main className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 overflow-hidden">
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

        <ShareButtons url={articleUrl} title={cleanTitle} />
      </main>
    );
  }

  // 2. TEMPLATE BÀI TỰ ĐỘNG / TĨNH
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-20">
      <HeroBanner imageUrl={coverImage} />

      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-24 sm:pt-28 md:pt-36'}`}>
        <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline mb-4 bg-[var(--bg-card)]/50 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border-card)] shadow-md">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Thư Viện
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 w-full max-w-[850px] mx-auto">
            <article className="p-6 sm:p-12 rounded-3xl glass-panel space-y-8 relative overflow-hidden">
              <header className="border-b border-slate-200/50 dark:border-white/10 pb-8 text-center sm:text-left space-y-4 relative z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-[var(--text-main)] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                  <Tag className="w-3.5 h-3.5" /> {article.category || 'Bài Viết'}
                </span>
                <h1 className="text-3xl sm:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 leading-[1.25] drop-shadow-sm" dangerouslySetInnerHTML={{ __html: titleText }} />
                <MetaDataRow article={article} />
              </header>
              
              <div className="article-content relative z-10">
                <VisualArticleRenderer contentHtml={htmlContent} />
              </div>
              
              {/* Tags */}
              {(article as any).tags && (article as any).tags.length > 0 && (
                <div className="pt-8 border-t border-slate-200/50 dark:border-white/10 flex flex-wrap gap-2 relative z-10">
                  {(article as any).tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/40 dark:bg-slate-800/40 border border-white/20 rounded-lg text-xs font-semibold text-[var(--text-main)] shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </main>

          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-36 self-start">
            <TableOfContents />
          </aside>
        </div>
      </div>

      <ShareButtons url={articleUrl} title={cleanTitle} />
      <AdminEditFloatingButton articleId={article.id} />
    </div>
  );
}
