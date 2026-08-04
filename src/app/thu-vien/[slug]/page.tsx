import { getLibraryArticleBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ShareButtons from '@/components/ShareButtons';
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
  const defaultImage = article.thumbnail || article.featured_image || 'https://thapgia.com/default-og-image.jpg';

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
      <img src={imageUrl} alt="Cover" className="w-full h-full object-cover animate-fadeIn" />
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
  const articleUrl = `https://thapgia.com/thu-vien/${resolvedParams.slug}`;
  const cleanTitle = titleText.replace(/<[^>]+>/g, '');

  // 1. TEMPLATE BÀI TƯƠNG TÁC (HTML/JS Sandbox Fullscreen)
  if (articleType === 'interactive') {
    return (
      <main className="w-full h-screen overflow-hidden bg-[var(--bg-main)] relative z-[999]">
        <style>{`
          header, footer, button[aria-label="Trở về đầu trang"] { display: none !important; }
        `}</style>
        <div className="absolute top-4 left-4 z-50 flex items-center space-x-2">
          <Link href="/thu-vien" className="px-4 py-2 bg-[var(--bg-card)] text-amber-500 font-bold text-xs rounded-full backdrop-blur-md transition-all flex items-center border border-[var(--border-card)] shadow-xl hover:bg-[var(--bg-main)]">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Thư Viện
          </Link>
        </div>
        
        <iframe 
          src={`/api/raw-html/${resolvedParams.slug}`} 
          className="w-full h-full border-none bg-white dark:invert dark:hue-rotate-180"
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
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        <HeroBanner imageUrl={coverImage} />

        <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-20 ${coverImage ? '-mt-32' : 'pt-12'}`}>
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline mb-4 bg-[var(--bg-card)]/50 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border-card)]">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện
          </Link>

          <article className="p-6 sm:p-14 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8">
            <header className="border-b border-slate-200 dark:border-[var(--border-card)] pb-8">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-6">
                Tạp Chí / Phóng Sự
              </span>
              <h1 className="font-serif font-black text-4xl sm:text-6xl text-[var(--text-main)] leading-[1.15]" dangerouslySetInnerHTML={{ __html: titleText }} />
              <MetaDataRow article={article} />
            </header>

            <VisualArticleRenderer contentHtml={htmlContent} className="max-w-4xl mx-auto" />
          </article>
        </main>
        
        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // 3. TEMPLATE BÀI SUY NIỆM LỜI CHÚA (Scripture Meditation Template)
  if (articleType === 'meditation') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        <HeroBanner imageUrl={coverImage} />

        <main className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-12'}`}>
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline mb-2 bg-[var(--bg-card)]/50 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border-card)]">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện
          </Link>

          <article className="p-6 sm:p-12 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
            <header className="space-y-4 border-b border-slate-200 dark:border-[var(--border-card)] pb-8 text-center sm:text-left relative z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Suy Niệm Lời Chúa
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-[1.2]" dangerouslySetInnerHTML={{ __html: titleText }} />
              <MetaDataRow article={article} />
            </header>

            {/* Scripture Quote Box */}
            {article.scriptureQuote && (
              <div className="p-6 sm:p-8 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-3 relative z-10 shadow-inner">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Trích Đoạn Kinh Thánh
                </span>
                <blockquote className="font-serif italic text-amber-700 dark:text-amber-100 text-lg sm:text-xl leading-relaxed">
                  "{article.scriptureQuote}"
                </blockquote>
              </div>
            )}

            {/* Visual Article Content Body */}
            <div className="relative z-10">
              <VisualArticleRenderer contentHtml={htmlContent} />
            </div>

            {/* Prayer Section Box */}
            {prayerText && (
              <div className="p-6 sm:p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 relative z-10 mt-12">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" /> Cầu Nguyện Kính
                </span>
                <p className="font-serif italic text-indigo-900 dark:text-indigo-200 text-base leading-relaxed">
                  "{prayerText}"
                </p>
              </div>
            )}
          </article>
        </main>
        
        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // 4. TEMPLATE BÀI THẦN HỌC TẠP CHÍ / CHUYÊN ĐỀ NGHIÊN CỨU (Academic Essay Template)
  if (articleType === 'theological') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        <HeroBanner imageUrl={coverImage} />

        <main className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-12'}`}>
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline mb-2 bg-[var(--bg-card)]/50 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border-card)]">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện
          </Link>

          <article className="p-6 sm:p-12 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8">
            <header className="space-y-4 border-b border-slate-200 dark:border-[var(--border-card)] pb-8 text-center sm:text-left">
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Cross className="w-3.5 h-3.5 text-indigo-500" /> Thần Học & Chuyên Đề
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-[1.2]" dangerouslySetInnerHTML={{ __html: titleText }} />
              <div className="text-xs text-amber-500 font-medium tracking-wide">Trích xuất từ VERIDU CANONIST & Giáo Luật Phụng Vụ</div>
              <MetaDataRow article={article} />
            </header>

            <VisualArticleRenderer contentHtml={htmlContent} />
          </article>
        </main>

        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // 5. TEMPLATE TIÊU CHUẨN MẶC ĐỊNH (Standard)
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
      <HeroBanner imageUrl={coverImage} />

      <main className={`max-w-3xl mx-auto px-4 space-y-6 relative z-20 ${coverImage ? '-mt-24' : 'pt-12'}`}>
        <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline mb-2 bg-[var(--bg-card)]/50 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border-card)]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện
        </Link>
        
        <article className="p-6 sm:p-12 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8">
          <header className="border-b border-slate-200 dark:border-[var(--border-card)] pb-8 text-center sm:text-left space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[var(--text-main)] leading-[1.25]" dangerouslySetInnerHTML={{ __html: titleText }} />
            <MetaDataRow article={article} />
          </header>
          <VisualArticleRenderer contentHtml={htmlContent} />
        </article>
      </main>

      <ShareButtons url={articleUrl} title={cleanTitle} />
    </div>
  );
}

