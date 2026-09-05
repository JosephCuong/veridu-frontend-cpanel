'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock, 
  GitCommitVertical, 
  LayoutGrid, 
  SlidersHorizontal, 
  Search, 
  BookOpen, 
  ExternalLink, 
  User, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Layers,
  ShieldCheck,
  Cross,
  Scroll,
  Church,
  ArrowRight,
  Info
} from 'lucide-react';
import { fetchTimelineEvents, TimelineEventData } from '@/lib/api';

export default function SalvationTimeline() {
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'vertical' | 'matrix' | 'horizontal'>('vertical');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cuu-uoc' | 'tan-uoc' | 'giao-hoi'>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeHorizontalIndex, setActiveHorizontalIndex] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchTimelineEvents();
        setEvents(data);
      } catch (err) {
        console.error('Lỗi khi tải dòng thời gian:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Extract unique Eras
  const availableEras = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach(e => {
      if (e.era_id && e.era_name) {
        map.set(e.era_id, e.era_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchSub = evt.subtitle?.toLowerCase().includes(q);
        const matchYear = evt.year_label.toLowerCase().includes(q);
        const matchEra = evt.era_name.toLowerCase().includes(q);
        const matchSummary = evt.summary?.toLowerCase().includes(q);
        const matchFig = evt.key_figures?.some(f => f.name.toLowerCase().includes(q));
        const matchLoc = evt.locations?.some(l => l.name.toLowerCase().includes(q));
        if (!matchTitle && !matchSub && !matchYear && !matchEra && !matchSummary && !matchFig && !matchLoc) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (evt.category !== selectedCategory) return false;
      }

      // 3. Era Filter
      if (selectedEra !== 'all') {
        if (evt.era_id !== selectedEra) return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedEra]);

  // Group events by Era for Matrix View
  const groupedByEra = useMemo(() => {
    const groups: { [key: string]: { name: string; items: TimelineEventData[] } } = {};
    filteredEvents.forEach(evt => {
      if (!groups[evt.era_id]) {
        groups[evt.era_id] = {
          name: evt.era_name,
          items: []
        };
      }
      groups[evt.era_id].items.push(evt);
    });
    return groups;
  }, [filteredEvents]);

  // Helper icons and colors by category
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'cuu-uoc':
        return {
          label: 'Cựu Ước',
          icon: <Scroll className="w-3.5 h-3.5" />,
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dotColor: '#d97706'
        };
      case 'tan-uoc':
        return {
          label: 'Tân Ước',
          icon: <Cross className="w-3.5 h-3.5" />,
          badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dotColor: '#059669'
        };
      case 'giao-hoi':
      default:
        return {
          label: 'Lịch Sử Giáo Hội',
          icon: <Church className="w-3.5 h-3.5" />,
          badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
          dotColor: '#6366f1'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl space-y-4 shadow-xl">
        <Clock className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm font-bold text-[var(--text-muted)]">
          Đang nạp Dòng Thời Gian Lịch Sử Cứu Độ &amp; Giáo Hội...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* ── Control Bar: Search, Filters & View Switcher ── */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
        
        {/* Row 1: Search & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm biến cố, nhân vật (Môsê, Đavít...), địa danh hoặc năm..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-amber-500 px-2 py-1"
              >
                Xóa
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] self-center sm:self-auto overflow-x-auto scrollbar-none w-full sm:w-auto">
            
            <button
              onClick={() => setViewMode('vertical')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                viewMode === 'vertical'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Xem Trục Thời Gian Dọc Chi Tiết"
            >
              <GitCommitVertical className="w-3.5 h-3.5" />
              <span>Trục Dọc</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                viewMode === 'matrix'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Xem Ma Trận 7 Đại Kỷ Nguyên"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>7 Kỷ Nguyên</span>
            </button>

            <button
              onClick={() => setViewMode('horizontal')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                viewMode === 'horizontal'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Xem Băng Chuyền Năm Ngang Tương Tác"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Băng Chuyền</span>
            </button>

          </div>

        </div>

        {/* Row 2: Category & Era Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-card)]">
          
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              Tất Cả ({events.length})
            </button>

            <button
              onClick={() => setSelectedCategory('cuu-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'cuu-uoc'
                  ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              📜 Cựu Ước ({events.filter(e => e.category === 'cuu-uoc').length})
            </button>

            <button
              onClick={() => setSelectedCategory('tan-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'tan-uoc'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              ✝️ Tân Ước ({events.filter(e => e.category === 'tan-uoc').length})
            </button>

            <button
              onClick={() => setSelectedCategory('giao-hoi')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'giao-hoi'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              ⛪ Lịch Sử Giáo Hội ({events.filter(e => e.category === 'giao-hoi').length})
            </button>
          </div>

          {/* Era Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-semibold">Kỷ nguyên:</span>
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              aria-label="Lọc theo Đại Kỷ Nguyên"
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Mọi Kỷ Nguyên (7 Kỷ Nguyên)</option>
              {availableEras.map(era => (
                <option key={era.id} value={era.id}>{era.name}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* ── Empty State ── */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <Clock className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">Không Tìm Thấy Biến Cố Phù Hợp</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc phân loại.
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedEra('all'); }}
            className="px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs transition"
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      ) : viewMode === 'vertical' ? (

        /* ── VIEW MODE 1: Stained-Glass Vertical Journey Axis ── */
        <div className="relative border-l-2 border-amber-500/40 ml-4 sm:ml-10 md:ml-16 space-y-12 py-6">
          {filteredEvents.map((evt, index) => {
            const meta = getCategoryMeta(evt.category);

            return (
              <div key={evt.id} className="relative pl-6 sm:pl-10 group">
                
                {/* Milestone Glowing Circle Marker */}
                <div 
                  style={{ borderColor: meta.dotColor }}
                  className="absolute -left-[17px] top-4 w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 flex items-center justify-center shadow-lg group-hover:scale-125 transition-all text-xs font-black text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950"
                >
                  {index + 1}
                </div>

                {/* Main Card Container */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
                  
                  {/* Ambient Glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

                  {/* Header Row: Era Badge, Year Badge, Category */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${meta.badgeClass}`}>
                        {meta.icon}
                        <span>{meta.label}</span>
                      </span>

                      <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-main)] px-3 py-1 rounded-full border border-[var(--border-card)]">
                        {evt.era_name}
                      </span>
                    </div>

                    {/* Year Label */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.year_label}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)] group-hover:text-amber-500 transition-colors">
                      {evt.title}
                    </h2>
                    {evt.subtitle && (
                      <p className="font-serif text-sm text-[var(--text-muted)] italic">
                        {evt.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Image & Summary Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {evt.image_url && (
                      <div className="md:col-span-4 relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-amber-500/30 shadow-md">
                        <Image
                          src={evt.image_url}
                          alt={evt.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}

                    <div className={`${evt.image_url ? 'md:col-span-8' : 'md:col-span-12'} space-y-3`}>
                      {evt.summary && (
                        <p className="font-serif font-bold text-sm sm:text-base text-amber-600 dark:text-amber-400 leading-relaxed italic">
                          &ldquo;{evt.summary}&rdquo;
                        </p>
                      )}

                      <div 
                        className="prose dark:prose-invert text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-sans max-w-none space-y-2"
                        dangerouslySetInnerHTML={{ __html: evt.content || '' }}
                      />
                    </div>
                  </div>

                  {/* 3-Way Relational Interlinks: Figures, Locations, Scriptures */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-[var(--border-card)] text-xs">
                    
                    {/* Key Figures */}
                    {evt.key_figures && evt.key_figures.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                        <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-500" /> Nhân vật then chốt
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evt.key_figures.map((fig, i) => (
                            fig.slug ? (
                              <Link
                                key={i}
                                href={`/nhan-vat/${fig.slug}`}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 transition"
                              >
                                <span>{fig.name}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            ) : (
                              <span key={i} className="px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-main)] font-semibold">
                                {fig.name}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations */}
                    {evt.locations && evt.locations.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                        <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" /> Địa danh gắn liền
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evt.locations.map((loc, i) => (
                            <Link
                              key={i}
                              href="/ban-do"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 transition"
                            >
                              <span>{loc.name}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Library Article if exists */}
                    {evt.article_slug && (
                      <div className="space-y-1.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                        <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500" /> Chuyên khảo nghiên cứu
                        </span>
                        <div>
                          <Link
                            href={`/${evt.article_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-900 dark:text-amber-100 hover:text-slate-950 font-bold text-xs transition-all shadow-sm"
                          >
                            <span>Đọc Chuyên Khảo</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Anchors & Historical Verification (if available) */}
                  {(evt.biblical_anchor || evt.archaeological_anchor) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border-card)]">
                      {evt.biblical_anchor && (
                        <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-amber-500" /> Căn Cứ Kinh Thánh
                          </span>
                          <p className="font-serif text-xs text-[var(--text-main)]">
                            {evt.biblical_anchor}
                          </p>
                        </div>
                      )}
                      {evt.archaeological_anchor && (
                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3 h-3 text-emerald-500" /> Căn Cứ Khảo Cổ / Lịch Sử
                          </span>
                          <p className="font-serif text-xs text-[var(--text-main)]">
                            {evt.archaeological_anchor}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scripture Quotes Block */}
                  {evt.scriptures && evt.scriptures.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
                      {evt.scriptures.map((sc, idx) => {
                        const readerUrl = `/doc-kinh-thanh/${sc.book_slug}/${sc.chapter}`;
                        return (
                          <div key={idx} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
                                {sc.reference}
                              </span>
                              <Link
                                href={readerUrl}
                                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition"
                              >
                                <span>Đọc trong Kinh Thánh</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <p className="font-serif italic text-xs sm:text-sm text-[var(--text-main)] leading-relaxed pl-2 border-l-2 border-amber-500">
                              &ldquo;{sc.text}&rdquo;
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Theology Box */}
                  {evt.theology && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-main)] to-amber-500/5 border border-amber-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Cross className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ý Nghĩa Thần Học &amp; Bài Học Tâm Linh</span>
                      </div>
                      <p className="font-serif italic text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                        {evt.theology}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      ) : viewMode === 'matrix' ? (

        /* ── VIEW MODE 2: 7 Eras Matrix Explorer ── */
        <div className="space-y-12">
          {Object.entries(groupedByEra).map(([eraId, eraGroup], groupIdx) => (
            <div key={eraId} className="space-y-6">
              
              {/* Era Header Banner */}
              <div className="flex items-center gap-3 border-b-2 border-amber-500/40 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-base flex items-center justify-center shadow-lg">
                  {groupIdx + 1}
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl sm:text-2xl text-[var(--text-main)]">
                    {eraGroup.name}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    {eraGroup.items.length} biến cố trọng tâm
                  </span>
                </div>
              </div>

              {/* Grid of Cards in Era */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eraGroup.items.map((item) => {
                  const meta = getCategoryMeta(item.category);

                  return (
                    <div
                      key={item.id}
                      className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 rounded-3xl p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-500">
                            {item.year_label}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-lg text-[var(--text-main)] line-clamp-2">
                          {item.title}
                        </h4>

                        {item.summary && (
                          <p className="text-xs text-[var(--text-muted)] line-clamp-3 font-serif leading-relaxed">
                            {item.summary}
                          </p>
                        )}
                      </div>

                      {/* Bottom Interlinks Preview */}
                      <div className="pt-3 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-2 text-xs">
                        {item.key_figures && item.key_figures.length > 0 && (
                          <span className="text-[11px] text-[var(--text-muted)] truncate">
                            👤 {item.key_figures.map(f => f.name).join(', ')}
                          </span>
                        )}
                        {item.article_slug && (
                          <Link
                            href={`/${item.article_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 transition-all hover:bg-amber-500 hover:text-slate-950"
                          >
                            <span>Đọc bài</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      ) : (

        /* ── VIEW MODE 3: Horizontal Milestone Stepper & Slider ── */
        <div className="space-y-8">
          
          {/* Horizontal Scroller Timeline Header */}
          <div className="glass-panel p-4 rounded-3xl border border-amber-500/30 shadow-xl overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-3 min-w-max px-2">
              {filteredEvents.map((evt, idx) => {
                const isActive = activeHorizontalIndex === idx;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setActiveHorizontalIndex(idx)}
                    className={`px-4 py-3 rounded-2xl text-left transition-all duration-200 flex flex-col gap-1 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 font-bold'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider block">
                      {evt.year_label}
                    </span>
                    <span className="text-xs font-serif font-bold truncate max-w-[160px] block">
                      {evt.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Milestone Spotlight Card */}
          {filteredEvents[activeHorizontalIndex] && (
            (() => {
              const activeEvt = filteredEvents[activeHorizontalIndex];
              const meta = getCategoryMeta(activeEvt.category);

              return (
                <div className="bg-[var(--bg-card)] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
                  
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-semibold">
                          {activeEvt.era_name}
                        </span>
                      </div>
                      <h2 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-main)]">
                        {activeEvt.title}
                      </h2>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-mono font-black text-sm shadow-md">
                      {activeEvt.year_label}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {activeEvt.image_url && (
                      <div className="md:col-span-5 relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg">
                        <Image
                          src={activeEvt.image_url}
                          alt={activeEvt.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      </div>
                    )}

                    <div className={`${activeEvt.image_url ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
                      {activeEvt.summary && (
                        <p className="font-serif font-bold text-base text-amber-600 dark:text-amber-400 leading-relaxed italic">
                          &ldquo;{activeEvt.summary}&rdquo;
                        </p>
                      )}

                      <div 
                        className="prose dark:prose-invert text-sm text-[var(--text-main)] leading-relaxed font-sans max-w-none space-y-3"
                        dangerouslySetInnerHTML={{ __html: activeEvt.content || '' }}
                      />

                      {activeEvt.theology && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <Cross className="w-3.5 h-3.5 text-amber-500" /> Ý Nghĩa Thần Học
                          </span>
                          <p className="font-serif italic text-xs sm:text-sm text-[var(--text-main)]">
                            {activeEvt.theology}
                          </p>
                        </div>
                      )}

                      {/* Anchors in Horizontal View */}
                      {(activeEvt.biblical_anchor || activeEvt.archaeological_anchor) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeEvt.biblical_anchor && (
                            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-amber-500" /> Căn Cứ Kinh Thánh
                              </span>
                              <p className="font-serif text-xs text-[var(--text-main)]">
                                {activeEvt.biblical_anchor}
                              </p>
                            </div>
                          )}
                          {activeEvt.archaeological_anchor && (
                            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Layers className="w-3 h-3 text-emerald-500" /> Căn Cứ Khảo Cổ
                              </span>
                              <p className="font-serif text-xs text-[var(--text-main)]">
                                {activeEvt.archaeological_anchor}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Attached Article in Horizontal View */}
                      {activeEvt.article_slug && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-[var(--text-main)]">Chuyên khảo nghiên cứu đính kèm</span>
                          </div>
                          <Link
                            href={`/${activeEvt.article_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-sm"
                          >
                            <span>Đọc Chuyên Khảo</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons for Slider */}
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--border-card)]">
                    <button
                      disabled={activeHorizontalIndex === 0}
                      onClick={() => setActiveHorizontalIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold disabled:opacity-30 hover:border-amber-500 transition flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Biến cố trước</span>
                    </button>

                    <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                      {activeHorizontalIndex + 1} / {filteredEvents.length}
                    </span>

                    <button
                      disabled={activeHorizontalIndex === filteredEvents.length - 1}
                      onClick={() => setActiveHorizontalIndex(prev => Math.min(filteredEvents.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold disabled:opacity-30 hover:border-amber-500 transition flex items-center gap-1.5"
                    >
                      <span>Biến cố tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })()
          )}

        </div>

      )}

    </div>
  );
}
