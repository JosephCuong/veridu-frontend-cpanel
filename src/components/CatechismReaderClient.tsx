'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CatechismParagraph } from '@/lib/api';
import AdBanner from '@/components/AdBanner';
import { 
  BookOpen, 
  Layers, 
  Bookmark, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Maximize2, 
  Minimize2, 
  Scroll, 
  Award, 
  X, 
  Search, 
  Hash
} from 'lucide-react';

interface PartMeta {
  partNumber: number;
  slug: string;
  roman: string;
  title: string;
}

const DEFAULT_PARTS_LIST: PartMeta[] = [
  { partNumber: 0, slug: 'loi-mo-dau', roman: '0', title: 'Lời Mở Đầu' },
  { partNumber: 1, slug: 'phan-1', roman: 'I', title: 'Phần I: Tuyên Xưng Đức Tin' },
  { partNumber: 2, slug: 'phan-2', roman: 'II', title: 'Phần II: Cử Hành Mầu Nhiệm' },
  { partNumber: 3, slug: 'phan-3', roman: 'III', title: 'Phần III: Đời Sống Trong Đức Kitô' },
  { partNumber: 4, slug: 'phan-4', roman: 'IV', title: 'Phần IV: Kinh Nguyện Kitô Giáo' },
];

interface CatechismReaderClientProps {
  paragraphs: CatechismParagraph[];
  currentPartConfig: {
    partNumber: number;
    slug: string;
    roman: string;
    title: string;
    subtitle: string;
    range: string;
    color: string;
  };
}

export default function CatechismReaderClient({ paragraphs, currentPartConfig }: CatechismReaderClientProps) {
  // Reading Mode: 'single' | 'continuous'
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('single');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jumpInput, setJumpInput] = useState<string>('');
  const [inBriefOnly, setInBriefOnly] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Single & Continuous index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Popover modal state for cross references
  const [popoverNumber, setPopoverNumber] = useState<number | null>(null);
  const [popoverData, setPopoverData] = useState<CatechismParagraph | null>(null);
  const [popoverLoading, setPopoverLoading] = useState<boolean>(false);

  // Local bookmarks
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Reactive sticky synchronization with LiturgicalHeader (eliminates floating gaps)
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

  useEffect(() => {
    // Check initial document attribute
    if (typeof document !== 'undefined' && document.documentElement.dataset.headerVisible === 'false') {
      setIsHeaderVisible(false);
    }

    // 1. Listen to broadcast from LiturgicalHeader
    const handleHeaderVisibility = (e: any) => {
      if (e.detail && typeof e.detail.isVisible === 'boolean') {
        setIsHeaderVisible(e.detail.isVisible);
      }
    };
    window.addEventListener('veridu_header_visibility', handleHeaderVisibility);

    // 2. Fallback scroll watcher (matches LiturgicalHeader's 120px / 8px threshold)
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 120) {
        if (currentY > lastY && currentY - lastY > 8) {
          setIsHeaderVisible(false);
        } else if (lastY - currentY > 8) {
          setIsHeaderVisible(true);
        }
      } else {
        setIsHeaderVisible(true);
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('veridu_header_visibility', handleHeaderVisibility);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    try {
      const savedBM = localStorage.getItem('veridu_ccc_bookmarks');
      if (savedBM) setBookmarks(new Set(JSON.parse(savedBM)));
    } catch (e) {}
  }, []);

  // Filtered and sorted paragraphs
  const sortedAndFiltered = useMemo(() => {
    const list = paragraphs.filter(p => {
      if (inBriefOnly && !p.is_in_brief) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const numQuery = parseInt(q);
      if (!isNaN(numQuery) && p.paragraph_number === numQuery) return true;
      const text = `${p.title} ${p.plain_text || ''} ${p.full_path || ''}`.toLowerCase();
      return text.includes(q);
    });

    return list.sort((a, b) => {
      const numA = a.paragraph_number ?? a.id;
      const numB = b.paragraph_number ?? b.id;
      return numA - numB;
    });
  }, [paragraphs, inBriefOnly, searchQuery]);

  const activeParagraph = sortedAndFiltered[currentIndex] || sortedAndFiltered[0] || paragraphs[0];

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim());
    if (!isNaN(num)) {
      const idx = sortedAndFiltered.findIndex(p => p.paragraph_number === num);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setJumpInput('');
        if (viewMode === 'continuous') {
          const el = document.getElementById(`ccc-p-${num}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        alert(`Không tìm thấy số điều khoản ${num} trong ${currentPartConfig.title}.`);
      }
    }
  };

  const toggleBookmark = (num: number) => {
    const next = new Set(bookmarks);
    if (next.has(num)) {
      next.delete(num);
    } else {
      next.add(num);
    }
    setBookmarks(next);
    localStorage.setItem('veridu_ccc_bookmarks', JSON.stringify(Array.from(next)));
  };

  const handleShare = (num: number) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/giao-ly/doc/${currentPartConfig.slug}?num=${num}`;
      navigator.clipboard.writeText(url);
      setCopiedId(num);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const openCrossReference = async (refNum: number) => {
    setPopoverNumber(refNum);
    setPopoverLoading(true);
    try {
      const res = await fetch(`/api/catechism/${refNum}`);
      const data = await res.json();
      if (data && data.paragraph) {
        setPopoverData(data.paragraph);
      }
    } catch (err) {
      console.warn('Load ref error:', err);
    } finally {
      setPopoverLoading(false);
    }
  };

  const fontSizeClass = fontSize === 'xlarge' 
    ? 'text-lg sm:text-xl leading-relaxed sm:leading-loose'
    : fontSize === 'large'
    ? 'text-base sm:text-lg leading-relaxed sm:leading-loose'
    : 'text-sm sm:text-base leading-relaxed';

  return (
    <div className={`space-y-6 ${isFocusMode ? 'fixed inset-0 z-50 bg-[var(--bg-main)] p-4 sm:p-8 overflow-y-auto' : ''}`}>
      
      {/* ── 1. UNIFIED STICKY CONTROLLER BAR (ZERO FLOATING VOID) ── */}
      <div 
        className={`sticky z-30 transition-[top] duration-300 ease-out bg-[#FAF7F2]/95 dark:bg-[#0B0D12]/95 backdrop-blur-2xl border-y border-stone-200/80 dark:border-amber-500/20 shadow-md ${
          isHeaderVisible ? 'top-[72px] sm:top-[88px] lg:top-[96px]' : 'top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Breadcrumbs & Quick Part Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
            <Link
              href="/giao-ly"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-white/10 text-xs font-serif font-bold text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 flex items-center gap-1 transition shrink-0 shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trở về</span>
            </Link>

            <div className="h-4 w-[1px] bg-stone-300 dark:bg-white/15 hidden sm:block shrink-0" />

            {/* Quick Part Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {DEFAULT_PARTS_LIST.map(p => {
                const isActive = p.slug === currentPartConfig.slug;
                return (
                  <Link
                    key={p.slug}
                    href={`/giao-ly/doc/${p.slug}`}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm ring-1 ring-amber-400 scale-[1.02]'
                        : 'bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-stone-200/60'
                    }`}
                  >
                    {p.partNumber === 0 ? 'Mở Đầu' : `Phần ${p.roman}`}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Reading Controls: View Mode + In-Brief Filter + Font Size + Focus */}
          <div className="flex items-center gap-2 sm:gap-3 justify-between md:justify-end shrink-0">
            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-900 p-0.5 rounded-xl border border-stone-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
                title="Chế độ đọc từng số điều khoản"
              >
                <BookOpen className="w-3 h-3" />
                <span>Từng Số</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('continuous')}
                className={`px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'continuous'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
                title="Chế độ đọc toàn văn liên tục"
              >
                <Layers className="w-3 h-3" />
                <span>Toàn Văn</span>
              </button>
            </div>

            {/* In-Brief Toggle */}
            <button
              type="button"
              onClick={() => setInBriefOnly(!inBriefOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                inBriefOnly
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 font-black'
                  : 'bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300'
              }`}
              title="Chỉ hiển thị các điều khoản tóm lược cốt lõi"
            >
              <Scroll className="w-3 h-3" />
              <span>{inBriefOnly ? '✓ Tóm Lược' : 'Tóm Lược'}</span>
            </button>

            {/* Font Size Adjuster */}
            <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-slate-900 p-0.5 rounded-xl border border-stone-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`w-6 h-6 rounded text-[11px] font-serif flex items-center justify-center cursor-pointer ${fontSize === 'normal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-stone-500 dark:text-stone-400'}`}
                title="Cỡ chữ tiêu chuẩn"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`w-6 h-6 rounded text-xs font-serif flex items-center justify-center cursor-pointer ${fontSize === 'large' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-stone-500 dark:text-stone-400'}`}
                title="Cỡ chữ lớn"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`w-6 h-6 rounded text-xs font-serif font-black flex items-center justify-center cursor-pointer ${fontSize === 'xlarge' ? 'bg-amber-500 text-slate-950 font-black' : 'text-stone-500 dark:text-stone-400'}`}
                title="Cỡ chữ rất lớn"
              >
                A++
              </button>
            </div>

            {/* Focus Mode Button */}
            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-white/10 transition cursor-pointer"
              title={isFocusMode ? 'Thoát chế độ tập trung' : 'Chế độ đọc tập trung toàn màn hình'}
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* ── 2. TWO-COLUMN WORKSPACE (70% READER + 30% STICKY SIDEBAR) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN: CATECHISM CONTENT READING AREA (70% - 8/12 COLUMNS)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-6">
          
          {viewMode === 'single' && activeParagraph ? (
            /* ── Single Paragraph Card View ── */
            <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6 transition-all relative">
              
              {/* Header Meta: Number, Section Path, Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-card)]/60 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-serif font-black text-sm">
                      GLHTCG Số {activeParagraph.paragraph_number}
                    </span>
                    {activeParagraph.is_in_brief && (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-serif font-bold text-[10px] uppercase tracking-wider">
                        Tóm Lược
                      </span>
                    )}
                  </div>
                  {activeParagraph.full_path && (
                    <p className="text-xs text-[var(--text-muted)] font-serif line-clamp-1">
                      {activeParagraph.full_path}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(activeParagraph.paragraph_number ?? (activeParagraph as any).id ?? 0)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                      bookmarks.has(activeParagraph.paragraph_number ?? (activeParagraph as any).id ?? 0)
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:text-amber-500'
                    }`}
                    title="Đánh dấu ghi nhớ"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShare(activeParagraph.paragraph_number ?? (activeParagraph as any).id ?? 0)}
                    className="p-2.5 rounded-2xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-amber-500 border border-[var(--border-card)] transition cursor-pointer"
                    title="Sao chép liên kết chia sẻ"
                  >
                    {copiedId === (activeParagraph.paragraph_number ?? (activeParagraph as any).id ?? 0) ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Text Content */}
              <div className="space-y-4">
                {activeParagraph.title && (
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)]">
                    {activeParagraph.title}
                  </h3>
                )}

                <div 
                  className={`font-serif text-[var(--text-main)] ${fontSizeClass}`}
                  dangerouslySetInnerHTML={{ __html: activeParagraph.content_html || activeParagraph.plain_text || '' }}
                />
              </div>

              {/* Cross References & Citations */}
              {activeParagraph.cross_references && activeParagraph.cross_references.length > 0 && (
                <div className="pt-4 border-t border-[var(--border-card)]/60 space-y-2">
                  <span className="text-xs font-serif font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Đối Chiếu Điều Khoản Liên Quan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeParagraph.cross_references.map(ref => (
                      <button
                        key={ref}
                        onClick={() => openCrossReference(ref)}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition cursor-pointer"
                      >
                        CCC #{ref}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footnotes */}
              {activeParagraph.footnotes && (
                <div className="pt-4 border-t border-[var(--border-card)]/60">
                  <p className="text-[11px] font-serif italic text-[var(--text-muted)] leading-relaxed">
                    Chú thích: {activeParagraph.footnotes}
                  </p>
                </div>
              )}

              {/* Navigation Arrows for Single Mode */}
              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-card)]">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  className="px-4 py-2 rounded-2xl bg-[var(--bg-main)] hover:bg-stone-200/60 dark:hover:bg-white/10 disabled:opacity-40 text-xs font-serif font-bold flex items-center gap-1.5 transition border border-[var(--border-card)] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Số Trước</span>
                </button>

                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {currentIndex + 1} / {sortedAndFiltered.length}
                </span>

                <button
                  disabled={currentIndex >= sortedAndFiltered.length - 1}
                  onClick={() => setCurrentIndex(Math.min(sortedAndFiltered.length - 1, currentIndex + 1))}
                  className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-serif font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer"
                >
                  <span>Số Tiếp Theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* ── Continuous Scroll View ── */
            <div className="space-y-6">
              {sortedAndFiltered.map((p) => (
                <article
                  key={p.id || p.paragraph_number}
                  id={`ccc-p-${p.paragraph_number}`}
                  className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-4 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-card)]/40 pb-3">
                    <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-serif font-bold text-xs">
                      GLHTCG Số {p.paragraph_number}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBookmark(p.paragraph_number ?? (p as any).id ?? 0)}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${bookmarks.has(p.paragraph_number ?? (p as any).id ?? 0) ? 'bg-amber-500 text-slate-950 border-amber-500' : 'text-[var(--text-muted)] border-transparent hover:text-amber-500'}`}
                        title="Đánh dấu ghi nhớ"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div 
                    className={`font-serif text-[var(--text-main)] ${fontSizeClass}`}
                    dangerouslySetInnerHTML={{ __html: p.content_html || p.plain_text || '' }}
                  />
                </article>
              ))}
            </div>
          )}

          {/* ── In-Feed Native Free Ad Space / Banner Tài Trợ ── */}
          <div className="pt-4">
            <AdBanner
              slotId="giao-ly-infeed"
              format="horizontal"
              customTitle="Tủ Sách Thần Học & Khảo Cứu Đức Tin VERIDU"
              customSubtitle="Khám phá các bản dịch tài liệu Công Đồng, Thông Điệp Tông Tòa và Sách Giáo Lý giải thích mở rộng."
              customLink="/thu-vien/sach"
            />
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT COLUMN: STICKY SIDEBAR (30% - 4/12 COLUMNS)
           ════════════════════════════════════════════════════════════════════ */}
        <aside 
          className={`lg:col-span-4 space-y-5 lg:sticky transition-[top] duration-300 ease-out ${
            isHeaderVisible ? 'lg:top-[160px]' : 'lg:top-[72px]'
          }`}
        >
          
          {/* Block 1: Fast Jump to Paragraph & Search */}
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>Nhảy Đến Số Đoạn CCC</span>
            </h4>

            <form onSubmit={handleJump} className="flex gap-2">
              <input
                type="number"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="Nhập số đoạn (vd: 27)..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-sans shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold shadow-md cursor-pointer transition-colors"
              >
                Nhảy
              </button>
            </form>

            <div className="relative pt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ khóa trong phần này..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-4" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-4 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Block 2: Paragraph TOC List Navigator */}
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Mục Lục Số Đoạn</span>
              </h4>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {sortedAndFiltered.length} điều khoản
              </span>
            </div>

            <div className="max-h-[min(380px,calc(100vh-280px))] overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-amber-500/20">
              {sortedAndFiltered.map((p, idx) => {
                const isSelected = viewMode === 'single' && currentIndex === idx;
                return (
                  <button
                    key={p.id || p.paragraph_number}
                    onClick={() => {
                      setCurrentIndex(idx);
                      if (viewMode === 'continuous') {
                        const el = document.getElementById(`ccc-p-${p.paragraph_number}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-serif flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                    }`}
                  >
                    <span className="truncate">Số {p.paragraph_number}: {p.title || 'Điều khoản'}</span>
                    {p.is_in_brief && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold shrink-0 ml-1">
                        Tóm Lược
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block 3: Free Advertisement / Google AdSense Sidebar Box */}
          <AdBanner
            slotId="giao-ly-sidebar"
            format="rectangle"
            customTitle="Ủng Hộ Dự Án Số Hóa Giáo Lý VERIDU"
            customSubtitle="Cùng chung tay lan tỏa Lời Chúa và kho tàng tri thức Huấn Quyền Công Giáo đến hàng triệu tín hữu."
            customLink="/soan-bai"
          />

          {/* Block 4: Educational Shortcuts */}
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
              <Scroll className="w-4 h-4 text-amber-500" />
              <span>Khảo Cứu &amp; Ôn Luyện</span>
            </h4>

            <div className="space-y-2">
              <Link
                href="/giao-ly/the-lat"
                className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Scroll className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Thẻ Lật Ghi Nhớ Tín Lý
                  </h5>
                  <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Học qua flashcard trực quan</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/quiz"
                className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Đấu Trường Quiz Giáo Lý
                  </h5>
                  <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Thử thách tri thức thời gian thực</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </aside>

      </div>

      {/* ── 3. CROSS REFERENCE POPOVER MODAL ── */}
      {popoverNumber && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500 shadow-2xl space-y-4 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setPopoverNumber(null); setPopoverData(null); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-serif font-bold text-xs">
                CCC #{popoverNumber}
              </span>
              <h4 className="font-serif font-bold text-base text-[var(--text-main)]">
                Đối Chiếu Trực Tiếp
              </h4>
            </div>

            {popoverLoading ? (
              <div className="p-8 text-center text-xs font-serif text-[var(--text-muted)]">
                Đang tải điều khoản đối chiếu...
              </div>
            ) : popoverData ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {popoverData.title && (
                  <h5 className="font-serif font-bold text-sm text-amber-600 dark:text-amber-400">
                    {popoverData.title}
                  </h5>
                )}
                <div 
                  className="font-serif text-xs leading-relaxed text-[var(--text-main)]"
                  dangerouslySetInnerHTML={{ __html: popoverData.content_html || popoverData.plain_text || '' }}
                />
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Không thể tải thông tin điều khoản #{popoverNumber}.
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setPopoverNumber(null); setPopoverData(null); }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold font-serif cursor-pointer hover:bg-amber-400 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
