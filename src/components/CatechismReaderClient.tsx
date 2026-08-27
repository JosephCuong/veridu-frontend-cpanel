'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CatechismParagraph } from '@/lib/api';
import { 
  BookOpen, 
  Layers, 
  Book, 
  Bookmark, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Maximize2, 
  Minimize2, 
  Type, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Eye, 
  X, 
  Search, 
  BookMarked,
  RotateCw,
  ExternalLink
} from 'lucide-react';

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
  // Reading Mode: 'continuous' | 'single' | 'bookflip'
  const [viewMode, setViewMode] = useState<'continuous' | 'single' | 'bookflip'>('continuous');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jumpInput, setJumpInput] = useState<string>('');
  const [inBriefOnly, setInBriefOnly] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Single & Continuous index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Bookflip page
  const [bookPage, setBookPage] = useState<number>(0);

  // Popover modal state
  const [popoverNumber, setPopoverNumber] = useState<number | null>(null);
  const [popoverData, setPopoverData] = useState<CatechismParagraph | null>(null);
  const [popoverLoading, setPopoverLoading] = useState<boolean>(false);

  // Local bookmarks & read tracking
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedBM = localStorage.getItem('veridu_ccc_bookmarks');
      if (savedBM) setBookmarks(new Set(JSON.parse(savedBM)));
    } catch (e) {}
  }, []);

  // Filtered and sorted paragraphs (Strictly ascending by paragraph_number or id)
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
        setBookPage(Math.floor(idx / 2));
        setJumpInput('');
      } else {
        openCccPopover(num);
      }
    }
  };

  const openCccPopover = async (num: number) => {
    setPopoverNumber(num);
    setPopoverLoading(true);
    try {
      const local = paragraphs.find(p => p.paragraph_number === num);
      if (local) {
        setPopoverData(local);
      } else {
        const res = await fetch(`/api/catechism/${num}`);
        if (res.ok) {
          const data = await res.json();
          setPopoverData(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPopoverLoading(false);
    }
  };

  const toggleBookmark = (num?: number) => {
    if (!num) return;
    const updated = new Set(bookmarks);
    if (updated.has(num)) updated.delete(num);
    else updated.add(num);
    setBookmarks(updated);
    try {
      localStorage.setItem('veridu_ccc_bookmarks', JSON.stringify(Array.from(updated)));
    } catch (e) {}
  };

  const handleCopy = (p: CatechismParagraph) => {
    if (typeof navigator !== 'undefined') {
      const textToCopy = `[${p.title}]\n${p.plain_text || ''}\nNguồn: Giáo Lý Hội Thánh Công Giáo — VERIDU (https://www.thapgia.com/giao-ly)`;
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className={`space-y-6 w-full ${isFocusMode ? 'fixed inset-0 z-50 bg-[var(--bg-main)] p-4 sm:p-8 overflow-y-auto' : ''}`}>
      
      {/* ── FOCUS MODE HEADER ── */}
      {isFocusMode && (
        <div className="max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2 text-amber-500 font-serif font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Chế Độ Đọc Tĩnh Tâm — {currentPartConfig.title}</span>
          </div>
          <button
            onClick={() => setIsFocusMode(false)}
            className="px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-xs font-bold flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Thoát Chế Độ Tĩnh Tâm</span>
          </button>
        </div>
      )}

      {/* ── TOOLBAR: 4 MODES, JUMP INPUT & FONT SIZE ── */}
      {!isFocusMode && (
        <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Mode Switchers */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition ${
                viewMode === 'continuous'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Đọc Toàn Văn</span>
            </button>

            <button
              onClick={() => setViewMode('single')}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition ${
                viewMode === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Từng Số Đoạn</span>
            </button>

            <button
              onClick={() => setViewMode('bookflip')}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition ${
                viewMode === 'bookflip'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
            >
              <Book className="w-4 h-4" />
              <span>Sách Lật 2 Trang</span>
            </button>

            <button
              onClick={() => setInBriefOnly(!inBriefOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                inBriefOnly
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-[var(--bg-main)] border border-[var(--border-card)] text-amber-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chỉ Tóm Lược</span>
            </button>
          </div>

          {/* Jump input & Font Controls */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleJump} className="relative flex items-center">
              <input
                type="text"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="Nhảy đến số..."
                className="w-36 sm:w-44 pl-3 pr-7 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 text-xs font-serif outline-none"
              />
              <button type="submit" className="absolute right-2 text-amber-500 hover:scale-110">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              onClick={() => setFontSize(prev => prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal')}
              className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500"
              title="Chỉnh cỡ chữ"
            >
              <Type className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500"
              title="Toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ── MODE 1: CONTINUOUS FULL-TEXT READER (2 COLUMNS) ── */}
      {viewMode === 'continuous' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sorted Table of Contents (4/12) */}
          {!isFocusMode && (
            <aside className="lg:col-span-4 space-y-3 lg:sticky lg:top-28 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="text-xs font-serif font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 flex items-center justify-between">
                <span>Mục Lục ({sortedAndFiltered.length} điều)</span>
                <span>Thứ tự: Tăng dần</span>
              </div>

              <div className="space-y-2">
                {sortedAndFiltered.map((p, idx) => {
                  const isSelected = p.id === activeParagraph?.id;
                  const isBookmarked = bookmarks.has(p.paragraph_number || -1);

                  return (
                    <button
                      key={p.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col space-y-1.5 group ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                          : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-amber-500 border border-amber-500/30">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {p.is_in_brief && <span className="text-amber-400 font-serif">Tóm lược</span>}
                          {isBookmarked && <Bookmark className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                      </div>
                      <p className="font-serif text-xs text-[var(--text-main)] group-hover:text-amber-500 transition-colors line-clamp-2 leading-relaxed">
                        {p.plain_text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Right Column: Reading Canvas (8/12) */}
          <main className={`${isFocusMode ? 'max-w-4xl mx-auto col-span-12' : 'lg:col-span-8'} space-y-6`}>
            {activeParagraph && (
              <article className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl space-y-8 backdrop-blur-xl">
                
                {/* Header Metadata */}
                <div className="space-y-3 border-b border-[var(--border-card)] pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-serif font-black text-xs shadow-sm">
                        {activeParagraph.title}
                      </span>
                      {activeParagraph.is_in_brief && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-serif font-bold text-xs border border-amber-500/40">
                          ✦ TÓM LƯỢC TÍN LÝ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleBookmark(activeParagraph.paragraph_number)}
                        className={`p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs transition ${
                          bookmarks.has(activeParagraph.paragraph_number || -1)
                            ? 'text-amber-500 border-amber-500'
                            : 'text-[var(--text-muted)] hover:text-amber-500'
                        }`}
                        title="Đánh dấu trang"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopy(activeParagraph)}
                        className="p-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500 transition"
                        title="Sao chép trích đoạn"
                      >
                        {copiedId === activeParagraph.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                    <span>{activeParagraph.full_path}</span>
                  </div>
                </div>

                {/* HTML Content Body */}
                <div 
                  className={`prose dark:prose-invert max-w-none font-serif text-[var(--text-main)] leading-relaxed space-y-4 ${
                    fontSize === 'xlarge' ? 'text-xl sm:text-2xl leading-loose' : fontSize === 'large' ? 'text-lg sm:text-xl leading-relaxed' : 'text-base sm:text-lg'
                  }`}
                  dangerouslySetInnerHTML={{ __html: activeParagraph.content_html }}
                />

                {/* Cross References (Click to Open Popover) */}
                {activeParagraph.cross_references && activeParagraph.cross_references.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                      Tham Chiếu Chéo Các Số Giáo Lý Khác:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeParagraph.cross_references.map(num => (
                        <button
                          key={num}
                          onClick={() => openCccPopover(num)}
                          className="px-3 py-1 rounded-xl bg-[var(--bg-card)] border border-amber-500/40 text-xs font-serif font-bold text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1 shadow-sm"
                        >
                          <span>CCC #{num}</span>
                          <Eye className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footnotes */}
                {activeParagraph.footnotes && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif italic text-stone-400 leading-relaxed">
                    <strong className="font-sans not-italic text-[10px] uppercase font-bold text-amber-500 block mb-1">Nguồn &amp; Chú Dẫn Huấn Quyền:</strong>
                    {activeParagraph.footnotes}
                  </div>
                )}

                {/* Bottom Navigation Buttons */}
                <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 disabled:opacity-30 text-xs font-serif font-bold flex items-center gap-1.5 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Số Trước</span>
                  </button>

                  <Link
                    href="/giao-ly/the-lat"
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-serif font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Học Thẻ Lật</span>
                  </Link>

                  <button
                    disabled={currentIndex >= sortedAndFiltered.length - 1}
                    onClick={() => setCurrentIndex(prev => Math.min(sortedAndFiltered.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-30 text-xs font-serif font-bold flex items-center gap-1.5 transition shadow-md"
                  >
                    <span>Số Kế Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </article>
            )}
          </main>

        </div>
      )}

      {/* ── MODE 2: SINGLE PARAGRAPH STUDY ── */}
      {viewMode === 'single' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {activeParagraph && (
            <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                <span className="font-serif font-black text-2xl text-amber-500">
                  {activeParagraph.title}
                </span>
                <span className="text-xs font-serif text-[var(--text-muted)]">
                  {currentPartConfig.title}
                </span>
              </div>

              <div 
                className={`prose dark:prose-invert max-w-none font-serif text-[var(--text-main)] leading-loose ${
                  fontSize === 'xlarge' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg'
                }`}
                dangerouslySetInnerHTML={{ __html: activeParagraph.content_html }}
              />

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-card)]">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="px-5 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center gap-2 hover:border-amber-500 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Điều Khoản Trước</span>
                </button>

                <button
                  disabled={currentIndex >= sortedAndFiltered.length - 1}
                  onClick={() => setCurrentIndex(prev => Math.min(sortedAndFiltered.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 hover:bg-amber-400 disabled:opacity-30 shadow-lg"
                >
                  <span>Điều Khoản Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 3: BOOKFLIP 2 PAGES ── */}
      {viewMode === 'bookflip' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Page */}
            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-[var(--border-card)] pb-2">
                  Trang Trái • {sortedAndFiltered[bookPage * 2]?.title || 'Hết'}
                </span>
                {sortedAndFiltered[bookPage * 2] ? (
                  <div 
                    className="prose dark:prose-invert max-w-none font-serif text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sortedAndFiltered[bookPage * 2].content_html }}
                  />
                ) : (
                  <p className="text-xs font-serif text-[var(--text-muted)]">Hết trang</p>
                )}
              </div>
              <span className="text-[10px] text-stone-500 font-serif text-center block pt-2 border-t border-[var(--border-card)]">
                Trang {bookPage * 2 + 1}
              </span>
            </div>

            {/* Right Page */}
            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-[var(--border-card)] pb-2">
                  Trang Phải • {sortedAndFiltered[bookPage * 2 + 1]?.title || 'Hết'}
                </span>
                {sortedAndFiltered[bookPage * 2 + 1] ? (
                  <div 
                    className="prose dark:prose-invert max-w-none font-serif text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sortedAndFiltered[bookPage * 2 + 1].content_html }}
                  />
                ) : (
                  <p className="text-xs font-serif text-[var(--text-muted)]">Hết trang</p>
                )}
              </div>
              <span className="text-[10px] text-stone-500 font-serif text-center block pt-2 border-t border-[var(--border-card)]">
                Trang {bookPage * 2 + 2}
              </span>
            </div>

          </div>

          {/* Book Navigator */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
            <button
              disabled={bookPage === 0}
              onClick={() => setBookPage(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Lật Trang Trước</span>
            </button>

            <span className="text-xs font-serif font-bold text-amber-500">
              Trang {bookPage + 1} / {Math.ceil(sortedAndFiltered.length / 2)}
            </span>

            <button
              disabled={(bookPage + 1) * 2 >= sortedAndFiltered.length}
              onClick={() => setBookPage(prev => prev + 1)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 shadow-md"
            >
              <span>Lật Trang Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL POPOVER FOR CCC CROSS-REFERENCES ── */}
      {popoverNumber !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  Khảo Cứu Nhanh: GLHTCG Số {popoverNumber}
                </h3>
              </div>
              <button
                onClick={() => setPopoverNumber(null)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {popoverLoading ? (
              <div className="py-12 text-center text-xs font-serif text-amber-500 animate-pulse">
                Đang tải điều khoản số {popoverNumber}...
              </div>
            ) : popoverData ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="text-xs font-serif text-[var(--text-muted)]">
                  {popoverData.full_path}
                </div>
                <div 
                  className="prose dark:prose-invert max-w-none font-serif text-sm leading-relaxed text-[var(--text-main)]"
                  dangerouslySetInnerHTML={{ __html: popoverData.content_html }}
                />
                {popoverData.footnotes && (
                  <div className="p-3 rounded-xl bg-[var(--bg-main)] text-[11px] font-serif italic text-stone-400">
                    {popoverData.footnotes}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-serif text-[var(--text-muted)] text-center py-6">
                Chưa có dữ liệu chi tiết cho số {popoverNumber}.
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-card)]">
              <button
                onClick={() => {
                  const idx = sortedAndFiltered.findIndex(p => p.paragraph_number === popoverNumber);
                  if (idx >= 0) {
                    setCurrentIndex(idx);
                    setViewMode('continuous');
                    setPopoverNumber(null);
                  }
                }}
                className="text-xs font-serif font-bold text-amber-500 hover:underline flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Mở trong Trình Đọc Này</span>
              </button>

              <button
                onClick={() => setPopoverNumber(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-main)] font-serif font-bold text-xs"
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
