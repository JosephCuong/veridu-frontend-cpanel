import { getLibraryArticleBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import { BookOpen, Sparkles, Heart, ArrowLeft, Cross, Calendar, Clock, User, Tag } from 'lucide-react';

// ─── GENERATE METADATA FROM SITESEO ──────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return { title: 'Không tìm thấy bài viết | VERIDU' };
  }

  // Fallback values
  const defaultTitle = typeof article.title === 'string' ? article.title.replace(/<[^>]+>/g, '') : 'Bài Viết VERIDU';
  const defaultDesc = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) : 'Khám phá thư viện tài liệu Công giáo trên VERIDU.';
  const defaultImage = article.thumbnail || article.featured_image || 'https://www.thapgia.com/default-og-image.jpg';

  // Read SiteSEO data injected via REST API
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

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const MetaDataRow = ({ article }: { article: any }) => (
  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium text-[var(--text-muted)] mt-6">
    {article.author && (
      <div className="flex items-center gap-1.5 bg-[var(--bg-main)] px-3 py-1.5 rounded-full border border-[var(--border-card)]">
        <User className="w-3.5 h-3.5 text-amber-500" />
        <span>{article.author}</span>
      </div>
    )}
    {article.created_at && (
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
      </div>
    )}
    {(article.readingTime || article.reading_time) && (
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{article.readingTime || article.reading_time}</span>
      </div>
    )}
    {article.category && (
      <div className="flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-slate-400" />
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


export default async function LibraryArticle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const articleType = article.article_type || 'standard';
  const titleText = typeof article.title === 'string' ? article.title : 'Bài Viết VERIDU';
  const htmlContent = article.interactiveHtml || article.contentHtml || '';
  const prayerText = (article as any).prayerText as string | undefined;
  
  const coverImage = article.featured_image || article.thumbnail;

  // Domain for share buttons
  const articleUrl = `https://www.thapgia.com/thu-vien/${resolvedParams.slug}`;
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
          className="w-full h-full border-none bg-slate-950"
          title={cleanTitle}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />

        <ShareButtons url={articleUrl} title={cleanTitle} />
      </main>
    );
  }

  // 2. TEMPLATE TRANG RỘNG / TẠP CHÍ (Wide / Magazine)
  if (articleType === 'magazine' || articleType === 'wide') {
    return (
      <div className="w-full min-h-screen stained-glass-bg text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        <HeroBanner imageUrl={coverImage} />

        <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20 ${coverImage ? '-mt-32' : 'pt-12'}`}>
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-[var(--text-main)] hover:text-amber-500 hover:scale-105 transition-all mb-4 glass-panel px-4 py-2 rounded-full shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Thư Viện
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-1 w-full min-w-0">
              <article className="p-6 sm:p-14 rounded-3xl glass-panel space-y-8 relative overflow-hidden">
                <header className="border-b border-slate-200/50 dark:border-white/10 pb-8 relative z-10">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-[var(--text-main)] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-6 shadow-sm">
                    Tạp Chí / Phóng Sự
                  </span>
                  <h1 className="font-serif font-black text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 leading-[1.15] drop-shadow-sm" dangerouslySetInnerHTML={{ __html: titleText }} />
                  <div className="mt-4">
                    <MetaDataRow article={article} />
                  </div>
                </header>

                <div className="article-content relative z-10">
                  <VisualArticleRenderer contentHtml={htmlContent} className="w-full" />
                </div>
              </article>
            </main>

            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 self-start">
              <TableOfContents />
            </aside>
          </div>
        </div>
        
        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // 3. TEMPLATE BÀI SUY NIỆM LỜI CHÚA (Scripture Meditation Template)
  if (articleType === 'meditation') {
    return (
      <div className="w-full min-h-screen stained-glass-bg text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        <HeroBanner imageUrl={coverImage} />

        <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-12'}`}>
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-[var(--text-main)] hover:text-amber-500 hover:scale-105 transition-all mb-4 glass-panel px-4 py-2 rounded-full shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Thư Viện
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <main className="flex-1 w-full max-w-[850px] mx-auto">
              <article className="p-6 sm:p-12 rounded-3xl glass-panel space-y-8 relative overflow-hidden">
                <header className="space-y-4 border-b border-slate-200/50 dark:border-white/10 pb-8 text-center sm:text-left relative z-10">
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Suy Niệm Lời Chúa
                  </span>
                  <h1 className="font-serif font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-400 dark:to-red-400 leading-[1.2] drop-shadow-sm" dangerouslySetInnerHTML={{ __html: titleText }} />
                  <MetaDataRow article={article} />
                </header>

                {/* Scripture Quote Box */}
                {article.scriptureQuote && (
                  <div className="p-6 sm:p-8 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-3 relative z-10 shadow-inner backdrop-blur-md">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Trích Đoạn Kinh Thánh
                    </span>
                    <blockquote className="font-serif italic text-amber-800 dark:text-amber-100 text-lg sm:text-xl leading-relaxed">
                      &quot;{article.scriptureQuote}&quot;
                    </blockquote>
                  </div>
                )}

                {/* Visual Article Content Body */}
                <div className="article-content relative z-10">
                  <VisualArticleRenderer contentHtml={htmlContent} />
                </div>

                {/* Prayer Section Box */}
                {prayerText && (
                  <div className="p-6 sm:p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 relative z-10 mt-12 backdrop-blur-md shadow-inner">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-red-500" /> Cầu Nguyện Kính
                    </span>
                    <p className="font-serif italic text-indigo-950 dark:text-indigo-100 text-base leading-relaxed">
                      &quot;{prayerText}&quot;
                    </p>
                  </div>
                )}
              </article>
            </main>

            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 self-start">
              <TableOfContents />
            </aside>
          </div>
        </div>
        
        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // 4. TEMPLATE BÀI THẦN HỌC TẠP CHÍ / CHUYÊN ĐỀ NGHIÊN CỨU (Academic Essay Template)
  if (articleType === 'theological') {
    return (
      <div className="w-full min-h-screen stained-glass-bg text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        <HeroBanner imageUrl={coverImage} />

        <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-12'}`}>
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-[var(--text-main)] hover:text-amber-500 hover:scale-105 transition-all mb-4 glass-panel px-4 py-2 rounded-full shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Thư Viện
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-1 w-full max-w-[850px] mx-auto">
              <article className="p-6 sm:p-12 rounded-3xl glass-panel space-y-8 relative overflow-hidden">
                <header className="space-y-4 border-b border-slate-200/50 dark:border-white/10 pb-8 text-center sm:text-left relative z-10">
                  <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                    <Cross className="w-3.5 h-3.5" /> {article.category || 'Thần Học'}
                  </span>
                  <h1 className="font-serif font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-300 leading-[1.2] drop-shadow-sm" dangerouslySetInnerHTML={{ __html: titleText }} />
                  <MetaDataRow article={article} />
                </header>

                <div className="article-content relative z-10">
                  <VisualArticleRenderer contentHtml={htmlContent} />
                </div>
              </article>
            </main>

            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 self-start">
              <TableOfContents />
            </aside>
          </div>
        </div>

        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // 5. TEMPLATE TIÊU CHUẨN MẶC ĐỊNH (Standard)
  return (
    <div className="w-full min-h-screen stained-glass-bg text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
      <HeroBanner imageUrl={coverImage} />

      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-12'}`}>
        <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline mb-4 bg-[var(--bg-card)]/50 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border-card)] shadow-md">
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

          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-32 self-start">
            <TableOfContents />
          </aside>
        </div>
      </div>

      <ShareButtons url={articleUrl} title={cleanTitle} />
    </div>
  );
}
