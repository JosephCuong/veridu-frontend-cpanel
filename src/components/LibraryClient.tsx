'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  BookMarked,
  FileDown,
  Compass,
  Gamepad2,
  X,
  Calendar,
  ChevronRight,
  Headphones,
  Video
} from 'lucide-react';
import { formatImageUrl } from '@/lib/htmlProcessor';
import { useTranslation } from '@/context/LanguageContext';

interface LibraryClientProps {
  initialArticles: any[];
}

export default function LibraryClient({ initialArticles }: LibraryClientProps) {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Extract unique categories and count
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    initialArticles.forEach(article => {
      if (article.category) {
        counts[article.category] = (counts[article.category] || 0) + 1;
      }
    });
    return counts;
  }, [initialArticles]);

  const categories = useMemo(() => Object.keys(categoryStats), [categoryStats]);

  // Filter & Sort logic
  const filteredArticles = useMemo(() => {
    return initialArticles
      .filter(article => {
        const title = (locale === 'en' && article.title_en) 
          ? article.title_en 
          : (typeof article.title === 'string' ? article.title : article.title?.rendered || '');
        const excerpt = (locale === 'en' && article.excerpt_en) 
          ? article.excerpt_en 
          : (typeof article.excerpt === 'string' ? article.excerpt : article.excerpt?.rendered || '');
        
        const matchesSearch = 
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          excerpt.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = activeCategory === 'all' || article.category === activeCategory;

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0).getTime();
        const dateB = new Date(b.created_at || b.date || 0).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [initialArticles, searchQuery, activeCategory, sortBy, locale]);

  const isFiltering = searchQuery !== '' || activeCategory !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  return (
    <div className="w-full pb-20">
      
      {/* ── 1. SACRED HERO SECTION (CLEAN PARCHMENT / LIGHT & DARK COMPLIANT) ── */}
      <section className="relative w-full pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/[0.04] via-transparent to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            {locale === 'en' ? 'Library of Treatises ' : (locale === 'la' ? 'Bibliotheca Scripturarum ' : 'Thư Viện Bài Viết ')}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-300 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              {locale === 'en' ? '& Sacred Theology' : (locale === 'la' ? '& Theologia Sacra' : '& Suy Niệm Công Giáo')}
            </span>
          </h1>

          <p className="font-serif italic text-sm sm:text-base lg:text-lg text-[var(--text-muted)] max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            {locale === 'en'
              ? 'A curated collection of biblical studies, patristics, liturgical jurisprudence, and interactive theological analyses.'
              : (locale === 'la'
                ? 'Syntaxis investigationum theologiae sacrae, iuris canonici liturgici et scriptorum patristicorum.'
                : 'Tổng hợp các bài khảo cứu Thần học, Giáo luật Phụng vụ, Linh đạo sống đức tin và các bài viết giáo lý tương tác trực quan.')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-2 text-xs font-serif text-[var(--text-muted)] shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                <strong className="text-[var(--text-main)] font-mono">{initialArticles.length}</strong>{' '}
                {locale === 'en' ? 'Selected Treatises' : (locale === 'la' ? 'Articuli Selecti' : 'Bài viết tuyển chọn')}
              </span>
            </div>

            <Link
              href="/thu-vien/sach"
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] hover:border-amber-500/50 border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] transition shadow-sm"
            >
              <BookMarked className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{t('nav.sub_books')}</span>
            </Link>

            <Link
              href="/thu-vien/tai-lieu"
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] hover:border-amber-500/50 border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] transition shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('nav.sub_docs')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. TWO-COLUMN MAIN WORKSPACE (ARTICLES 75% + SIDEBAR 25%) ── */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* ══════════ LEFT COLUMN: ARTICLE FEED (9 / 12 COLS ON XL) ══════════ */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Action & Result Count Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)] flex items-center gap-2">
                  <span>{locale === 'en' ? 'Article Directory' : (locale === 'la' ? 'Index Articulorum' : 'Danh Sách Bài Viết')}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono font-bold">
                    {filteredArticles.length}
                  </span>
                </h2>

                {isFiltering && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400 font-serif font-bold transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{locale === 'en' ? 'Clear Filters' : (locale === 'la' ? 'Purgare' : 'Xóa bộ lọc')}</span>
                  </button>
                )}
              </div>

              {/* Sort Order Toggle */}
              <div className="flex items-center gap-2 text-xs font-serif">
                <span className="text-[var(--text-muted)]">{locale === 'en' ? 'Sort:' : (locale === 'la' ? 'Ordo:' : 'Sắp xếp:')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] text-xs font-serif font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="newest">{locale === 'en' ? 'Newest' : (locale === 'la' ? 'Novissimi' : 'Mới Nhất')}</option>
                  <option value="oldest">{locale === 'en' ? 'Oldest' : (locale === 'la' ? 'Vetustissimi' : 'Cũ Nhất')}</option>
                </select>
              </div>
            </div>

            {/* Articles Grid (3 Columns on Large Screens) */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredArticles.map((article: any) => {
                  const titleText = (locale === 'en' && article.title_en)
                    ? article.title_en
                    : (typeof article.title === 'string' ? article.title : article.title?.rendered || 'Bài viết VERIDU');
                  const excerptText = (locale === 'en' && article.excerpt_en)
                    ? article.excerpt_en
                    : (article.excerpt || '');
                  const templateType = article.article_type || 'standard';

                  const imgSrc = formatImageUrl(article.thumbnail || article.featured_image);
                  const postDate = article.created_at || article.date;
                  let formattedDate = '';
                  if (postDate) {
                    try {
                      const d = new Date(postDate);
                      if (!isNaN(d.getTime())) {
                        formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                      }
                    } catch (e) {}
                  }

                  const hasManualEnglish = !!(article.content_en && article.content_en.trim().length > 0);

                  return (
                    <article 
                      key={article.id || article.slug}
                      className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Thumbnail Image Container */}
                        <Link href={`/${article.slug}`} className="block relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                          {imgSrc ? (
                            <Image 
                              src={imgSrc} 
                              alt={titleText.replace(/<[^>]+>/g, '')} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              unoptimized={imgSrc.includes('googleusercontent.com') || imgSrc.includes('drive.google.com')}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-700">
                              <BookOpen className="w-12 h-12 stroke-[1.2]" />
                            </div>
                          )}

                          {/* Gradient Dark Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                          {/* Category Badge */}
                          {article.category && (
                            <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5">
                              <span className="inline-flex items-center text-[10px] font-serif font-bold text-amber-300 bg-slate-950/85 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md shadow-md">
                                {article.category}
                              </span>
                              {hasManualEnglish && (
                                <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/85 px-2 py-0.5 rounded-full border border-emerald-500/40 backdrop-blur-md shadow-md">
                                  🇬🇧 EN
                                </span>
                              )}
                            </div>
                          )}

                          {/* Media Badges Overlay (Podcast & Video) */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
                            {(article.audio_url || article.contentHtml?.includes('<audio') || article.interactiveHtml?.includes('<audio')) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-200 bg-slate-950/85 px-2.5 py-0.5 rounded-full border border-amber-500/40 backdrop-blur-md shadow-md">
                                <Headphones className="w-3 h-3 text-amber-400" />
                                <span>Podcast</span>
                              </span>
                            )}
                            {(article.video_url || article.contentHtml?.includes('veridu-embed-video') || article.interactiveHtml?.includes('veridu-embed-video')) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-rose-200 bg-slate-950/85 px-2.5 py-0.5 rounded-full border border-rose-500/40 backdrop-blur-md shadow-md">
                                <Video className="w-3 h-3 text-rose-400" />
                                <span>Video</span>
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Article Information Body */}
                        <div className="p-5 sm:p-6 space-y-3">
                          {formattedDate && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-serif">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formattedDate}</span>
                            </div>
                          )}

                          <Link href={`/${article.slug}`} className="block group-hover:text-amber-500 transition-colors">
                            <h3 
                              className="font-serif font-bold text-lg text-[var(--text-main)] group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug"
                              dangerouslySetInnerHTML={{ __html: titleText }}
                            />
                          </Link>

                          {excerptText && (
                            <div 
                              className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed font-sans"
                              dangerouslySetInnerHTML={{ __html: excerptText }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-5 sm:p-6 pt-0">
                        <Link 
                          href={`/${article.slug}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500 hover:text-slate-950 border border-[var(--border-card)] text-[var(--text-main)] text-xs font-serif font-bold flex items-center justify-between transition group-hover:border-amber-500/50 shadow-sm"
                        >
                          <span>{t('common.read_more')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
                <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  {locale === 'en' ? 'No studies found' : (locale === 'la' ? 'Nullus articulus inventus est' : 'Không tìm thấy bài viết phù hợp')}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  {locale === 'en' ? 'Try adjusting your search keywords or resetting filters.' : 'Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục.'}
                </p>
                {isFiltering && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md hover:bg-amber-400 transition cursor-pointer"
                  >
                    {locale === 'en' ? 'Clear Filters' : 'Xóa bộ lọc'}
                  </button>
                )}
              </div>
            )}

          </div>

          {/* ══════════ RIGHT COLUMN: SMART SIDEBAR (3 / 12 COLS ON XL) ══════════ */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6 sticky top-28">
            
            {/* 1. Search Box Widget */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <label className="text-xs font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                <span>{t('common.search')}</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t('common.search_placeholder')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 text-xs text-[var(--text-main)] outline-none transition font-sans placeholder:text-[var(--text-muted)]"
                />
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Categories Filter Widget */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-500" />
                  <span>{locale === 'en' ? 'Theological Categories' : (locale === 'la' ? 'Classes' : 'Chuyên Mục')}</span>
                </h3>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="text-[11px] text-amber-500 hover:underline font-serif"
                  >
                    {locale === 'en' ? 'Reset' : 'Mặc định'}
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full px-3.5 py-2 rounded-2xl text-xs font-serif font-bold transition flex items-center justify-between cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <span>{locale === 'en' ? 'All Categories' : (locale === 'la' ? 'Omnia' : 'Tất Cả Chuyên Mục')}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeCategory === 'all' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'
                  }`}>
                    {initialArticles.length}
                  </span>
                </button>

                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full px-3.5 py-2 rounded-2xl text-xs font-serif font-bold transition flex items-center justify-between cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      activeCategory === cat ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'
                    }`}>
                      {categoryStats[cat] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Quick Library Navigation Shortcuts */}
            <div className="bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-indigo-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>{locale === 'en' ? 'Extended Repository' : 'Kho Tàng Tài Liệu Mở Rộng'}</span>
              </h3>
              
              <div className="space-y-2 pt-1">
                <Link
                  href="/thu-vien/sach"
                  className="p-3 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-indigo-400" />
                    <span>{t('nav.sub_books')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/thu-vien/tai-lieu"
                  className="p-3 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    <span>{t('nav.sub_docs')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/sach-tranh"
                  className="p-3 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                    <span>{t('nav.storybooks')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </aside>

        </div>
      </main>

    </div>
  );
}
