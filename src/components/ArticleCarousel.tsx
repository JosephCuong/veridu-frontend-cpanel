'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Layers } from 'lucide-react';
import { Article } from '@/lib/api';

interface ArticleCarouselProps {
  articles: Article[];
}

export default function ArticleCarousel({ articles }: ArticleCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <div className="relative group">
      {/* Scroll Buttons - Visible on hover on desktop */}
      <button 
        onClick={scrollLeft}
        aria-label="Cuộn sang trái"
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-amber-500 hover:text-slate-950"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={scrollRight}
        aria-label="Cuộn sang phải"
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-amber-500 hover:text-slate-950"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article) => {
          const imgSrc = article.thumbnail || article.featured_image;
          const hasImage = imgSrc && !imageErrors[String(article.id)];

          const formattedDate = article.created_at
            ? new Date(article.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : '';

          const titleText = typeof article.title === 'string'
            ? article.title.replace(/<[^>]*>/g, '')
            : 'Bài viết VERIDU';

          const excerptText = article.excerpt
            ? article.excerpt.replace(/<[^>]*>/g, '')
            : '';

          return (
            <div 
              key={article.id} 
              className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden flex flex-col hover:border-amber-500/50 transition-all shadow-lg hover:-translate-y-1 group/card"
            >
              {/* Card Media Header */}
              <div className="relative h-44 overflow-hidden bg-slate-900 flex items-center justify-center">
                {hasImage ? (
                  <Image 
                    src={imgSrc} 
                    alt={titleText} 
                    fill
                    onError={() => setImageErrors(prev => ({ ...prev, [String(article.id)]: true }))}
                    className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 280px, 320px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-900/40 flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <BookOpen className="w-10 h-10 text-amber-500/70" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">VERIDU Library</span>
                  </div>
                )}

                {article.category && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md">
                    {article.category}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {formattedDate && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  
                  <h3 className="font-serif font-bold text-base text-[var(--text-main)] mb-2 line-clamp-2 leading-snug group-hover/card:text-amber-500 transition-colors">
                    {titleText}
                  </h3>
                  
                  {excerptText && (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                      {excerptText}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-card)]">
                  <Link 
                    href={`/thu-vien/${article.slug}`}
                    className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold hover:underline transition-colors"
                  >
                    <BookOpen className="w-4 h-4" /> Đọc bài viết &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

