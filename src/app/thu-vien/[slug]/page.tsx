import { getLibraryArticleBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ShareButtons from '@/components/ShareButtons';
import { BookOpen, Sparkles, Heart, List, ArrowLeft, Cross } from 'lucide-react';

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
  const defaultImage = article.thumbnail || 'https://thapgia.com/default-og-image.jpg';

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

export default async function LibraryArticle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const articleType = article.article_type || 'standard';
  const titleText = typeof article.title === 'string' ? article.title : 'Bài Viết VERIDU';
  const htmlContent = article.interactiveHtml || article.contentHtml || '';
  // prayerText may come from WP as extra field on some article types
  const prayerText = (article as any).prayerText as string | undefined;

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

  // 2. TEMPLATE BÀI SUY NIỆM LỜI CHÚA (Scripture Meditation Template)
  if (articleType === 'meditation') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 relative z-10">
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện Bài Viết
          </Link>

          <article className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
            <header className="space-y-4 border-b border-slate-200 dark:border-[var(--border-card)] pb-8 text-center relative z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Suy Niệm Lời Chúa
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight" dangerouslySetInnerHTML={{ __html: titleText }} />
              <div className="text-xs text-[var(--text-muted)] font-medium">Nguồn: Thư Viện VERIDU Công Giáo</div>
            </header>

            {/* Scripture Quote Box */}
            {article.scriptureQuote && (
              <div className="p-6 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-2 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Trích Đoạn Kinh Thánh Chú Tâm
                </span>
                <blockquote className="font-serif italic text-amber-700 dark:text-amber-100 text-base sm:text-lg leading-relaxed">
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
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" /> Cầu Nguyện Kính
                </span>
                <p className="font-serif italic text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed">
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

  // 3. TEMPLATE BÀI THẦN HỌC TẠP CHÍ / CHUYÊN ĐỀ NGHIÊN CỨU (Academic Essay Template)
  if (articleType === 'theological') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
        

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 relative z-10">
          <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện Bài Viết
          </Link>

          <article className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-8">
            <header className="space-y-4 border-b border-slate-200 dark:border-[var(--border-card)] pb-8 text-center sm:text-left">
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Cross className="w-3.5 h-3.5 text-indigo-500" /> Thần Học & Chuyên Đề Nghiên Cứu
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight" dangerouslySetInnerHTML={{ __html: titleText }} />
              <div className="text-xs text-amber-500 font-medium">Trích xuất từ VERIDU CANONIST & Giáo Luật Phụng Vụ</div>
            </header>

            <VisualArticleRenderer contentHtml={htmlContent} />
          </article>
        </main>

        <ShareButtons url={articleUrl} title={cleanTitle} />
      </div>
    );
  }

  // --- TEMPLATE TIÊU CHUẨN MẶC ĐỊNH ---
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 relative pb-24">
      

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6 relative z-10">
        <Link href="/thu-vien" className="inline-flex items-center text-xs font-bold text-amber-500 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại Thư Viện Bài Viết
        </Link>
        
        <article className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-6">
          <header className="border-b border-slate-200 dark:border-[var(--border-card)] pb-6 text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[var(--text-main)]" dangerouslySetInnerHTML={{ __html: titleText }} />
            <div className="text-xs text-amber-500 font-semibold">Nguồn: Thư Viện VERIDU</div>
          </header>
          <VisualArticleRenderer contentHtml={htmlContent} />
        </article>
      </main>

      <ShareButtons url={articleUrl} title={cleanTitle} />
    </div>
  );
}
