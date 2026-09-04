'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Search, 
  Filter, 
  Layers, 
  Cross, 
  FileText, 
  Heart, 
  Gamepad2, 
  BookOpen, 
  BookMarked,
  FileDown,
  Sparkles,
  X,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { formatImageUrl } from '@/lib/htmlProcessor';

interface LibraryClientProps {
  initialArticles: any[];
}

export default function LibraryClient({ initialArticles }: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');
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

  const articleTypes = [
    { id: 'all', label: 'Tất cả định dạng', icon: Layers },
    { id: 'standard', label: '📖 Bài Viết Tiêu Chuẩn', icon: FileText },
    { id: 'interactive', label: '🚀 Tương Tác 3D', icon: Gamepad2 }
  ];

  // Filter & Sort logic
  const filteredArticles = useMemo(() => {
    return initialArticles
      .filter(article => {
        const title = typeof article.title === 'string' ? article.title : article.title?.rendered || '';
        const excerpt = typeof article.excerpt === 'string' ? article.excerpt : article.excerpt?.rendered || '';
        
        const matchesSearch = 
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          excerpt.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = activeCategory === 'all' || article.category === activeCategory;
        const matchesType = activeType === 'all' || (article.article_type || 'standard') === activeType;

        return matchesSearch && matchesCat && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0).getTime();
        const dateB = new Date(b.created_at || b.date || 0).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [initialArticles, searchQuery, activeCategory, activeType, sortBy]);

  const isFiltering = searchQuery !== '' || activeCategory !== 'all' || activeType !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveType('all');
  };

  return (
    <div className="w-full pb-20">
      
      {/* ── 1. SACRED HERO SECTION (CLEAN PARCHMENT / LIGHT & DARK COMPLIANT) ── */}
      <section className="relative w-full pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/[0.04] via-transparent to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Thư Viện Bài Viết{' '}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-300 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              &amp; Suy Niệm Công Giáo
            </span>
          </h1>

          <p className="font-serif italic text-sm sm:text-base lg:text-lg text-[var(--text-muted)] max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Tổng hợp các bài khảo cứu Thần học, Giáo luật Phụng vụ, Linh đạo sống đức tin và các bài viết giáo lý tương tác trực quan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-2 text-xs font-serif text-[var(--text-muted)] shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span><strong className="text-[var(--text-main)] font-mono">{initialArticles.length}</strong> Bài viết tuyển chọn</span>
            </div>

            <Link
              href="/thu-vien/sach"
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] hover:border-amber-500/50 border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] transition shadow-sm"
            >
              <BookMarked className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Tủ Sách Điện Tử</span>
            </Link>

            <Link
              href="/thu-vien/tai-lieu"
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] hover:border-amber-500/50 border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] transition shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tài Liệu PDF</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. TWO-COLUMN MAIN WORKSPACE (ARTICLES 70% + SIDEBAR 30%) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ══════════ LEFT COLUMN: ARTICLE FEED (8 / 12 COLS) ══════════ */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Action & Result Count Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)] flex items-center gap-2">
                  <span>Danh Sách Bài Viết</span>
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
                    <span>Xóa bộ lọc</span>
                  </button>
                )}
              </div>

              {/* Sort Order Toggle */}
              <div className="flex items-center gap-2 text-xs font-serif">
                <span className="text-[var(--text-muted)]">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] text-xs font-serif font-bold focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Mới Nhất</option>
                  <option value="oldest">Cũ Nhất</option>
                </select>
              </div>
            </div>

            {/* Articles Grid (2 Columns on Medium/Large Screens) */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((article: any) => {
                  const titleText = typeof article.title === 'string' ? article.title : article.title?.rendered || 'Bài viết VERIDU';
                  const templateType = article.article_type || 'standard';
                  const typeObj = articleTypes.find(t => t.id === templateType);
                  const typeLabel = typeObj?.label || 'Bài viết';
                  const TypeIcon = typeObj?.icon || FileText;

                  const imgSrc = formatImageUrl(article.thumbnail || article.featured_image);
                  const postDate = article.created_at || article.date;
                  const formattedDate = postDate 
                    ? new Date(postDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : null;

                  return (
                    <article 
                      key={article.id || article.slug} 
                      className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Thumbnail Container (16:9 Aspect Ratio) */}
                        <Link href={`/${article.slug}`} className="block relative overflow-hidden aspect-[16/9] bg-slate-900">
                          {imgSrc ? (
                            <Image 
                              src={imgSrc} 
                              alt={titleText.replace(/<[^>]*>?/gm, '')} 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-900/40 flex flex-col items-center justify-center gap-2 p-4 text-center">
                              <BookOpen className="w-10 h-10 text-amber-500/60" />
                              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">VERIDU Library</span>
                            </div>
                          )}

                          {/* Top Badges Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md shadow-md">
                              <TypeIcon className="w-3 h-3 text-amber-400" />
                              <span>{typeLabel}</span>
                            </span>

                            {article.category && (
                              <span className="text-[10px] font-bold text-stone-200 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-700 backdrop-blur-md shadow-md truncate max-w-[120px]">
                                {article.category}
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

                          {article.excerpt && (
                            <div 
                              className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed font-sans"
                              dangerouslySetInnerHTML={{ __html: article.excerpt }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-5 sm:p-6 pt-0">
                        <Link 
                          href={`/${article.slug}`}
                          className="w-full py-2.5 rounded-2xl bg-[var(--bg-main)] hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:border-amber-500/40"
                        >
                          {templateType === 'interactive' ? (
                            <>
                              <span>Mở Trải Nghiệm 3D</span>
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-slate-950" />
                            </>
                          ) : (
                            <>
                              <span>Đọc Chi Tiết</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-slate-950 transition-transform group-hover:translate-x-0.5" />
                            </>
                          )}
                        </Link>
                      </div>

                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 px-4 bg-[var(--bg-card)] border border-dashed border-[var(--border-card)] rounded-3xl space-y-4">
                <Layers className="w-12 h-12 mx-auto text-amber-500/40 animate-pulse" />
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  Không tìm thấy bài viết nào
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-serif max-w-md mx-auto">
                  Không có bài viết nào khớp với từ khóa tìm kiếm hoặc bộ lọc chuyên mục đã chọn.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-black shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Xóa Tất Cả Bộ Lọc
                </button>
              </div>
            )}

          </div>

          {/* ══════════ RIGHT COLUMN: STICKY SIDEBAR (4 / 12 COLS) ══════════ */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* 1. Instant Search Widget */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <label className="text-xs font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                <span>Tìm Kiếm Nhanh</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập tên bài, từ khóa..." 
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
                  <span>Chuyên Mục</span>
                </h3>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="text-[11px] text-amber-500 hover:underline font-serif"
                  >
                    Mặc định
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
                  <span>Tất Cả Chuyên Mục</span>
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

            {/* 3. Format / Article Type Filter Widget */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Định Dạng Bài Đọc</span>
              </h3>

              <div className="space-y-1.5">
                {articleTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = activeType === type.id;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveType(type.id)}
                      className={`w-full px-3.5 py-2 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Quick Library Navigation Shortcuts */}
            <div className="bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-indigo-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Kho Tàng Tài Liệu Mở Rộng</span>
              </h3>
              
              <div className="space-y-2 pt-1">
                <Link
                  href="/thu-vien/sach"
                  className="p-3 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-indigo-400" />
                    <span>Tủ Sách Điện Tử &amp; Giáo Lý</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/thu-vien/tai-lieu"
                  className="p-3 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    <span>Tài Liệu Phụng Vụ &amp; Giáo Án PDF</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/sach-tranh"
                  className="p-3 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                    <span>Sách Tranh Lật Trang 3D</span>
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
