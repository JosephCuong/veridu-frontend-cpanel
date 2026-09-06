'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RelatedItem } from '@/lib/api';
import { 
  FileText, 
  MapPin, 
  Clock, 
  User, 
  ArrowRight, 
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface ArticleRelatedContentProps {
  items: RelatedItem[];
}

const TYPE_CONFIG = {
  article: {
    label: 'Bài Viết',
    icon: FileText,
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500'
  },
  location: {
    label: 'Địa Danh & Bản Đồ',
    icon: MapPin,
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500'
  },
  timeline: {
    label: 'Dòng Thời Gian',
    icon: Clock,
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500'
  },
  character: {
    label: 'Nhân Vật Kinh Thánh',
    icon: User,
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300',
    dotColor: 'bg-purple-500'
  }
};

const ITEMS_PER_PAGE = 6;

export default function ArticleRelatedContent({ items }: ArticleRelatedContentProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Stats for tabs
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      map[item.type] = (map[item.type] || 0) + 1;
    });
    return map;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((item) => item.type === activeTab);
  }, [items, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (!items || items.length === 0) {
    return null;
  }

  const tabs = [
    { id: 'all', label: 'Tất Cả', icon: Layers },
    ...(counts['article'] ? [{ id: 'article', label: 'Bài Viết', icon: FileText }] : []),
    ...(counts['location'] ? [{ id: 'location', label: 'Bản Đồ', icon: MapPin }] : []),
    ...(counts['timeline'] ? [{ id: 'timeline', label: 'Thời Gian', icon: Clock }] : []),
    ...(counts['character'] ? [{ id: 'character', label: 'Nhân Vật', icon: User }] : [])
  ];

  return (
    <section 
      aria-label="Nội dung liên quan"
      className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-card)] shadow-xl relative overflow-hidden space-y-6"
    >
      {/* Top Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)]">
            Nội Dung Khảo Cứu Liên Quan
          </h3>
        </div>

        <span className="text-xs font-serif text-[var(--text-muted)]">
          Tìm thấy <strong className="text-[var(--text-main)] font-mono">{filteredItems.length}</strong> tư liệu kết nối
        </span>
      </div>

      {/* Filter Tabs (Styled like reference image) */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
        {paginatedItems.map((item) => {
          const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.article;
          const TypeIcon = config.icon;

          return (
            <article
              key={item.id}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* 16:9 Thumbnail Link */}
                <Link href={item.url} className="block relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                      <BookOpen className="w-8 h-8 text-amber-500/50" />
                      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {config.label}
                      </span>
                    </div>
                  )}

                  {/* Badge Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-md ${config.badgeBg}`}>
                      <TypeIcon className="w-3 h-3" />
                      <span>{item.typeLabel}</span>
                    </span>

                    {item.subtitle && (
                      <span className="text-[10px] font-bold text-stone-200 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700 backdrop-blur-md shadow-md truncate max-w-[110px]">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Card Info */}
                <div className="p-4 space-y-2">
                  <Link href={item.url} className="block group-hover:text-amber-500 transition-colors">
                    <h4 
                      className="font-serif font-bold text-sm text-[var(--text-main)] group-hover:text-amber-500 line-clamp-2 leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                  </Link>

                  {item.description && (
                    <p className="text-xs text-[var(--text-muted)] font-serif line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <Link
                  href={item.url}
                  className="w-full py-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all shadow-sm group-hover:border-amber-500/40"
                >
                  <span>Khám Phá</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-slate-950 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination (if more than 1 page) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-[var(--border-card)]">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500 text-xs text-[var(--text-main)]"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-mono text-xs">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-bold transition-all ${
                  currentPage === page
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-500 text-xs text-[var(--text-main)]"
            title="Trang tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
