'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Filter, Layers, Cross, FileText, Heart, Gamepad2, Maximize2, BookOpen } from 'lucide-react';

interface LibraryClientProps {
  initialArticles: any[];
}

export default function LibraryClient({ initialArticles }: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');

  // Extract unique categories and types
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialArticles.forEach(article => {
      if (article.category) cats.add(article.category);
    });
    return Array.from(cats);
  }, [initialArticles]);

  const articleTypes = [
    { id: 'all', label: 'Tất cả định dạng' },
    { id: 'standard', label: 'Bài viết (Standard)' },
    { id: 'meditation', label: 'Suy Niệm' },
    { id: 'theological', label: 'Thần Học' },
    { id: 'interactive', label: 'Tương Tác 3D' }
  ];

  // Filter logic
  const filteredArticles = useMemo(() => {
    return initialArticles.filter(article => {
      const title = typeof article.title === 'string' ? article.title : article.title?.rendered || '';
      
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'all' || article.category === activeCategory;
      const matchesType = activeType === 'all' || (article.article_type || 'standard') === activeType;

      return matchesSearch && matchesCat && matchesType;
    });
  }, [initialArticles, searchQuery, activeCategory, activeType]);

  return (
    <div className="space-y-10">
      
      {/* Page Title Header */}
      <header className="space-y-4 text-center sm:text-left border-b border-[var(--border-card)] pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
          <Cross className="w-3.5 h-3.5" /> Kho Tàng Bài Viết VERIDU
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight">
          Thư Viện Bài Viết & Suy Niệm Công Giáo
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
          Tổng hợp các bài nghiên cứu Giáo luật Phụng vụ, Suy niệm Lời Chúa hằng ngày và các bài viết tương tác giáo lý trực quan.
        </p>
      </header>

      {/* Filter Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-lg font-serif">Bộ Lọc Tức Thời</h2>
          </div>
          
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none text-sm transition-all"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)] w-24">Chuyên Mục:</span>
              <button 
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50'}`}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Types */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] w-24">Định Dạng:</span>
            {articleTypes.map(type => (
              <button 
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeType === type.id ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50'}`}
              >
                {type.id === 'standard' && <FileText className="w-3.5 h-3.5" />}
                {type.id === 'meditation' && <Heart className="w-3.5 h-3.5" />}
                {type.id === 'theological' && <Cross className="w-3.5 h-3.5" />}
                {type.id === 'interactive' && <Gamepad2 className="w-3.5 h-3.5" />}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      {filteredArticles.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredArticles.map((article: any) => {
            const titleText = typeof article.title === 'string' ? article.title : article.title?.rendered || 'Bài viết VERIDU';
            const templateType = article.article_type || 'standard';
            const typeLabel = articleTypes.find(t => t.id === templateType)?.label || 'Bài viết';

            const imgSrc = article.thumbnail || article.featured_image;

            return (
              <div 
                key={article.id} 
                className="break-inside-avoid bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all shadow-xl group flex flex-col"
              >
                <div className="relative overflow-hidden aspect-[16/9] bg-slate-900 flex items-center justify-center">
                  {imgSrc ? (
                    <Image 
                      src={imgSrc} 
                      alt={titleText.replace(/<[^>]*>?/gm, '')} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-900/40 flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <BookOpen className="w-10 h-10 text-amber-500/70" />
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">VERIDU Library</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                            {typeLabel}
                            </span>
                            {article.category && (
                                <span className="text-[11px] text-[var(--text-muted)] font-bold">{article.category}</span>
                            )}
                        </div>

                        <h2 
                            className="font-serif font-bold text-xl text-[var(--text-main)] group-hover:text-amber-500 transition-colors line-clamp-3 leading-snug"
                            dangerouslySetInnerHTML={{ __html: titleText }}
                        />

                        {article.excerpt && (
                            <div 
                            className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.excerpt }}
                            />
                        )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-[var(--border-card)]">
                        <Link 
                            href={`/thu-vien/${article.slug}`}
                            className="w-full py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                            {templateType === 'interactive' ? (
                              <>
                                <span>Xem Toàn Màn Hình</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                              </>
                            ) : (
                              <>
                                <span>Đọc Bài Viết</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                        </Link>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-[var(--text-muted)] border border-dashed border-[var(--border-card)] rounded-3xl">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-serif text-lg">Không tìm thấy bài viết nào phù hợp với bộ lọc.</p>
        </div>
      )}

    </div>
  );
}
