'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from 'lucide-react';
import { Article } from '@/lib/api';

interface ArticleCarouselProps {
  articles: Article[];
}

export default function ArticleCarousel({ articles }: ArticleCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center hover:bg-amber-500 hover:text-slate-950"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={scrollRight}
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
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden flex flex-col hover:border-indigo-500/50 transition-all shadow-lg hover:-translate-y-1"
          >
            <div className="relative h-40 overflow-hidden">
              <Image 
                src={article.thumbnail!} 
                alt={article.title} 
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                sizes="(max-width: 640px) 280px, 320px"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-500/30">
                {article.category}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                <Calendar className="w-3 h-3" />
                <span>{article.created_at}</span>
              </div>
              
              <h3 className="font-serif font-bold text-base text-[var(--text-main)] mb-2 line-clamp-2 leading-tight">
                {article.title}
              </h3>
              
              <p className="text-xs text-[var(--text-muted)] line-clamp-3 mb-4 flex-1">
                {article.excerpt}
              </p>
              
              <Link 
                href={`/thu-vien/${article.slug}`}
                className="inline-flex items-center gap-2 text-indigo-500 text-xs font-bold hover:text-indigo-400 transition-colors mt-auto"
              >
                <BookOpen className="w-4 h-4" /> Đọc bài viết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
