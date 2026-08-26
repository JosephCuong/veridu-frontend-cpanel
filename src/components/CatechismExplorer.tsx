'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { CatechismParagraph } from '@/lib/api';
import { 
  BookOpen, 
  Cross, 
  Sun, 
  Shield, 
  Flame, 
  Search, 
  Layers, 
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
  ExternalLink,
  BookMarked,
  RotateCw,
  Eye,
  Trophy,
  FlameKindling,
  Sparkle,
  Book,
  X,
  HelpCircle
} from 'lucide-react';

interface CatechismExplorerProps {
  initialParagraphs: CatechismParagraph[];
  totalCount: number;
}

const PILLARS_META = [
  {
    number: 1,
    roman: 'I',
    title: 'Tuyên Xưng Đức Tin',
    subtitle: 'Kinh Tin Kính Các Tông Đồ',
    desc: 'Mầu nhiệm Thiên Chúa Ba Ngôi, Sáng Tạo, Nhập Thể, Cứu Chuộc & Hội Thánh.',
    icon: Cross,
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    range: 'CCC 1 - 1065',
    color: '#f59e0b'
  },
  {
    number: 2,
    roman: 'II',
    title: 'Cử Hành Mầu Nhiệm Kitô Giáo',
    subtitle: 'Phụng Vụ & 7 Bí Tích',
    desc: 'Ân sủng trao ban qua Phụng Vụ Thánh, 7 Bí Tích & Đời sống phụng vụ.',
    icon: Sun,
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    range: 'CCC 1066 - 1690',
    color: '#f43f5e'
  },
  {
    number: 3,
    roman: 'III',
    title: 'Đời Sống Trong Đức Kitô',
    subtitle: 'Luân Lý & 10 Điều Răn',
    desc: 'Phẩm giá con người, ơn gọi nên thánh, Tám Mối Phúc & Mười Điều Răn.',
    icon: Shield,
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    range: 'CCC 1691 - 2557',
    color: '#10b981'
  },
  {
    number: 4,
    roman: 'IV',
    title: 'Kinh Nguyện Kitô Giáo',
    subtitle: 'Cầu Nguyện & Kinh Lạy Cha',
    desc: 'Ý nghĩa kinh nguyện, truyền thống cầu nguyện & 7 Lời Nguyện Kinh Lạy Cha.',
    icon: Flame,
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    range: 'CCC 2558 - 2865',
    color: '#6366f1'
  }
];

export default function CatechismExplorer({ initialParagraphs, totalCount }: CatechismExplorerProps) {
  // Mode states: continuous | single | bookflip | flashcard | focus
  const [viewMode, setViewMode] = useState<'continuous' | 'single' | 'bookflip' | 'flashcard'>('continuous');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<number>(-1); // -1 = All, 0 = LMD, 1,2,3,4
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jumpInput, setJumpInput] = useState<string>('');
  const [inBriefOnly, setInBriefOnly] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Single paragraph navigation
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Bookflip pagination (2 paragraphs per page)
  const [bookPage, setBookPage] = useState<number>(0);

  // Flashcard states
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);

  // Popover modal for CCC cross references
  const [popoverNumber, setPopoverNumber] = useState<number | null>(null);
  const [popoverData, setPopoverData] = useState<CatechismParagraph | null>(null);
  const [popoverLoading, setPopoverLoading] = useState<boolean>(false);

  // Gamification (Stored locally)
  const [faithXP, setFaithXP] = useState<number>(120);
  const [readParagraphs, setReadParagraphs] = useState<Set<number>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Load user progress from localStorage on mount
  useEffect(() => {
    try {
      const savedXP = localStorage.getItem('veridu_faith_xp');
      if (savedXP) setFaithXP(parseInt(savedXP));

      const savedReads = localStorage.getItem('veridu_read_ccc');
      if (savedReads) setReadParagraphs(new Set(JSON.parse(savedReads)));

      const savedBM = localStorage.getItem('veridu_ccc_bookmarks');
      if (savedBM) setBookmarks(new Set(JSON.parse(savedBM)));
    } catch (e) {}
  }, []);

  // Filtered Paragraphs based on active filters
  const filteredList = useMemo(() => {
    return initialParagraphs.filter((p) => {
      // 1. Part Filter
      if (selectedPart >= 0 && p.part_number !== selectedPart) return false;

      // 2. In Brief Filter
      if (inBriefOnly && !p.is_in_brief) return false;

      // 3. Search Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const numQuery = parseInt(q);
      if (!isNaN(numQuery)) {
        if (p.paragraph_number === numQuery) return true;
      }
      const textMatch = `${p.title} ${p.plain_text || ''} ${p.full_path || ''}`.toLowerCase();
      return textMatch.includes(q);
    });
  }, [initialParagraphs, selectedPart, inBriefOnly, searchQuery]);

  // Flashcard Deck: prioritize In-Brief paragraphs
  const flashcardDeck = useMemo(() => {
    const list = initialParagraphs.filter(p => p.is_in_brief || (p.paragraph_number && p.paragraph_number % 10 === 0));
    return list.length > 0 ? list : initialParagraphs.slice(0, 50);
  }, [initialParagraphs]);

  // Current active single paragraph
  const currentParagraph = filteredList[currentIndex] || filteredList[0] || initialParagraphs[0];

  // Record reading & Award Faith XP
  const markAsRead = (pNumber?: number) => {
    if (!pNumber) return;
    if (!readParagraphs.has(pNumber)) {
      const updated = new Set(readParagraphs).add(pNumber);
      setReadParagraphs(updated);
      const newXP = faithXP + 10;
      setFaithXP(newXP);
      try {
        localStorage.setItem('veridu_faith_xp', newXP.toString());
        localStorage.setItem('veridu_read_ccc', JSON.stringify(Array.from(updated)));
      } catch (e) {}
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (pNumber?: number) => {
    if (!pNumber) return;
    const updated = new Set(bookmarks);
    if (updated.has(pNumber)) updated.delete(pNumber);
    else updated.add(pNumber);
    setBookmarks(updated);
    try {
      localStorage.setItem('veridu_ccc_bookmarks', JSON.stringify(Array.from(updated)));
    } catch (e) {}
  };

  // Jump to specific CCC Number
  const handleJumpToNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim());
    if (!isNaN(num)) {
      const foundIdx = filteredList.findIndex(p => p.paragraph_number === num);
      if (foundIdx >= 0) {
        setCurrentIndex(foundIdx);
        setBookPage(Math.floor(foundIdx / 2));
        setJumpInput('');
        markAsRead(num);
      } else {
        // Find in full list
        const inFull = initialParagraphs.findIndex(p => p.paragraph_number === num);
        if (inFull >= 0) {
          setSelectedPart(-1);
          setInBriefOnly(false);
          setSearchQuery('');
          setTimeout(() => {
            setCurrentIndex(inFull);
            setBookPage(Math.floor(inFull / 2));
            setJumpInput('');
            markAsRead(num);
          }, 50);
        }
      }
    }
  };

  // Fetch CCC Popover Data
  const openCccPopover = async (num: number) => {
    setPopoverNumber(num);
    setPopoverLoading(true);
    try {
      // Find in memory first
      const local = initialParagraphs.find(p => p.paragraph_number === num);
      if (local) {
        setPopoverData(local);
      } else {
        const res = await fetch(`/api/catechism/${num}`);
        if (res.ok) {
          const data = await res.json();
          setPopoverData(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPopoverLoading(false);
    }
  };

  // Handle Copy
  const handleCopy = (p: CatechismParagraph) => {
    if (typeof navigator !== 'undefined') {
      const textToCopy = `[${p.title}]\n${p.plain_text || ''}\nNguồn: Giáo Lý Hội Thánh Công Giáo — VERIDU (https://www.thapgia.com/giao-ly)`;
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Level & Badges calculation
  const currentLevel = Math.floor(faithXP / 100) + 1;
  const nextLevelXP = currentLevel * 100;
  const progressPercent = Math.min(100, Math.round(((faithXP % 100) / 100) * 100));

  return (
    <div className={`space-y-8 w-full transition-all duration-300 ${isFocusMode ? 'fixed inset-0 z-50 bg-[var(--bg-main)] p-4 sm:p-8 overflow-y-auto' : ''}`}>
      
      {/* ── FOCUS MODE HEADER (IF ACTIVE) ── */}
      {isFocusMode && (
        <div className="max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2 text-amber-500 font-serif font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Chế Độ Đọc Tĩnh Tâm — Toàn Thư Giáo Lý Hội Thánh Công Giáo</span>
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

      {/* ── GAMIFIED HEADER STATUS (FAITH XP & STREAK) ── */}
      {!isFocusMode && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/25 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Level & XP Stats */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-base flex flex-col items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-[9px] uppercase tracking-tighter font-sans font-bold leading-none">Cấp</span>
              <span>{currentLevel}</span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <div className="flex items-center justify-between text-xs font-serif font-bold">
                <span className="text-[var(--text-main)] flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Tri Thức Đức Tin (Faith XP)
                </span>
                <span className="text-amber-500">{faithXP} / {nextLevelXP} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-main)] border border-[var(--border-card)] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pillars Progress Badges */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto justify-start md:justify-end pb-1 scrollbar-none">
            {PILLARS_META.map(p => {
              const countInPart = Array.from(readParagraphs).filter(num => {
                const item = initialParagraphs.find(ip => ip.paragraph_number === num);
                return item?.part_number === p.number;
              }).length;

              return (
                <div 
                  key={p.number}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif"
                  title={`Phần ${p.roman}: Đã đọc ${countInPart} điều khoản`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-bold text-[var(--text-muted)]">Phần {p.roman}:</span>
                  <span className="font-sans font-bold text-amber-500">{countInPart}</span>
                </div>
              );
            })}

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5 text-xs font-serif font-bold text-amber-600 dark:text-amber-300">
              <FlameKindling className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{readParagraphs.size} / {totalCount} Điều</span>
            </div>
          </div>

        </div>
      )}

      {/* ── 5 READING MODES TABS & CONTROLS ── */}
      {!isFocusMode && (
        <div className="space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
            
            {/* View Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-inner overflow-x-auto scrollbar-none">
              <button
                onClick={() => setViewMode('continuous')}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  viewMode === 'continuous'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. Đọc Toàn Thư CCC</span>
              </button>

              <button
                onClick={() => setViewMode('single')}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  viewMode === 'single'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>2. Từng Số Đoạn</span>
              </button>

              <button
                onClick={() => setViewMode('bookflip')}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  viewMode === 'bookflip'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Book className="w-4 h-4" />
                <span>3. Sách Lật Phụng Vụ</span>
              </button>

              <button
                onClick={() => setViewMode('flashcard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  viewMode === 'flashcard'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>4. Thẻ Lật Ghi Nhớ</span>
              </button>
            </div>

            {/* Jump to CCC Number & Tools */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleJumpToNumber} className="relative flex items-center">
                <input
                  type="text"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  placeholder="Nhảy đến số (VD: 2558)..."
                  className="w-40 sm:w-48 pl-3 pr-8 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 text-xs font-serif outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 text-xs font-bold text-amber-500 hover:scale-110 transition"
                  title="Nhảy đến số điều"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <button
                onClick={() => setFontSize(prev => prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal')}
                className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500"
                title="Chỉnh cỡ chữ"
              >
                <Type className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500"
                title="Chế độ Đọc Tĩnh Tâm Toàn Màn Hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Search Bar & Pillars Selector */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu toàn văn: Lời Chúa, Kinh Tin Kính, 7 Bí Tích, 10 Điều Răn, Kinh Lạy Cha..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 text-xs sm:text-sm outline-none font-serif"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-amber-500 font-bold">
                  Xóa
                </button>
              )}
            </div>

            {/* Pillar Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedPart(-1)}
                className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition ${
                  selectedPart === -1
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
              >
                Tất Cả
              </button>

              <button
                onClick={() => setSelectedPart(0)}
                className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition ${
                  selectedPart === 0
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
              >
                Lời Mở Đầu
              </button>

              {PILLARS_META.map(p => (
                <button
                  key={p.number}
                  onClick={() => setSelectedPart(p.number)}
                  className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition ${
                    selectedPart === p.number
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]'
                  }`}
                >
                  Phần {p.roman}
                </button>
              ))}

              <button
                onClick={() => setInBriefOnly(!inBriefOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap flex items-center gap-1 transition ${
                  inBriefOnly
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-amber-500'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Chỉ Tóm Lược</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          CHẾ ĐỘ 1: TRÌNH ĐỌC TOÀN THƯ CCC (CONTINUOUS READER)
      ======================================================== */}
      {viewMode === 'continuous' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Index Sidebar */}
          {!isFocusMode && (
            <aside className="lg:col-span-4 space-y-3 lg:sticky lg:top-28 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="text-xs font-serif font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 flex items-center justify-between">
                <span>Mục Lục ({filteredList.length} điều)</span>
                <span>CCC 1 - 2865</span>
              </div>

              <div className="space-y-2">
                {filteredList.slice(0, 100).map((p, idx) => {
                  const isSelected = p.id === currentParagraph.id;
                  const isBookmarked = bookmarks.has(p.paragraph_number || -1);
                  const isRead = readParagraphs.has(p.paragraph_number || -1);

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        markAsRead(p.paragraph_number);
                      }}
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
                          {isRead && <Check className="w-3 h-3 text-emerald-500" />}
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

          {/* Reading Body */}
          <main className={`${isFocusMode ? 'max-w-4xl mx-auto col-span-12' : 'lg:col-span-8'} space-y-6`}>
            {currentParagraph && (
              <article className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl space-y-8 backdrop-blur-xl">
                
                {/* Header Metadata */}
                <div className="space-y-4 border-b border-[var(--border-card)] pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-serif font-black text-xs shadow-sm">
                        {currentParagraph.title}
                      </span>
                      {currentParagraph.is_in_brief && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-serif font-bold text-xs border border-amber-500/40">
                          ✦ TÓM LƯỢC TÍN LÝ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleBookmark(currentParagraph.paragraph_number)}
                        className={`p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs transition ${
                          bookmarks.has(currentParagraph.paragraph_number || -1)
                            ? 'text-amber-500 border-amber-500'
                            : 'text-[var(--text-muted)] hover:text-amber-500'
                        }`}
                        title="Đánh dấu trang"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopy(currentParagraph)}
                        className="p-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500 transition"
                        title="Sao chép trích đoạn"
                      >
                        {copiedId === currentParagraph.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                    <span>{currentParagraph.full_path}</span>
                  </div>
                </div>

                {/* HTML Body */}
                <div 
                  className={`prose dark:prose-invert max-w-none font-serif text-[var(--text-main)] leading-relaxed space-y-4 ${
                    fontSize === 'xlarge' ? 'text-xl sm:text-2xl leading-loose' : fontSize === 'large' ? 'text-lg sm:text-xl leading-relaxed' : 'text-base sm:text-lg'
                  }`}
                  dangerouslySetInnerHTML={{ __html: currentParagraph.content_html }}
                />

                {/* Cross References Badges (Clickable Popover) */}
                {currentParagraph.cross_references && currentParagraph.cross_references.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                      Tham Chiếu Chéo Các Số Giáo Lý Khác:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {currentParagraph.cross_references.map(num => (
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
                {currentParagraph.footnotes && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif italic text-stone-400 leading-relaxed">
                    <strong className="font-sans not-italic text-[10px] uppercase font-bold text-amber-500 block mb-1">Nguồn &amp; Chú Dẫn Huấn Quyền:</strong>
                    {currentParagraph.footnotes}
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => {
                      const prev = currentIndex - 1;
                      setCurrentIndex(prev);
                      markAsRead(filteredList[prev]?.paragraph_number);
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 disabled:opacity-30 text-xs font-serif font-bold flex items-center gap-1.5 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Số Trước</span>
                  </button>

                  <Link
                    href="/quiz"
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-serif font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Đấu Trường Giáo Lý</span>
                  </Link>

                  <button
                    disabled={currentIndex >= filteredList.length - 1}
                    onClick={() => {
                      const next = currentIndex + 1;
                      setCurrentIndex(next);
                      markAsRead(filteredList[next]?.paragraph_number);
                    }}
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

      {/* ========================================================
          CHẾ ĐỘ 2: KHẢO CỨU TỪNG SỐ ĐOẠN (SINGLE PARAGRAPH STUDY)
      ======================================================== */}
      {viewMode === 'single' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {currentParagraph && (
            <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl space-y-8 backdrop-blur-xl">
              
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                <span className="font-serif font-black text-2xl text-amber-500">
                  {currentParagraph.title}
                </span>
                <span className="text-xs font-serif text-[var(--text-muted)]">
                  {currentParagraph.part_title}
                </span>
              </div>

              <div 
                className={`prose dark:prose-invert max-w-none font-serif text-[var(--text-main)] leading-loose ${
                  fontSize === 'xlarge' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg'
                }`}
                dangerouslySetInnerHTML={{ __html: currentParagraph.content_html }}
              />

              {currentParagraph.cross_references && currentParagraph.cross_references.length > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-card)]">
                  <span className="text-xs font-bold text-amber-500">Tham chiếu chéo:</span>
                  {currentParagraph.cross_references.map(n => (
                    <button
                      key={n}
                      onClick={() => openCccPopover(n)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-amber-500/40 text-xs font-serif text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition"
                    >
                      #{n}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-card)]">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => {
                    const prev = currentIndex - 1;
                    setCurrentIndex(prev);
                    markAsRead(filteredList[prev]?.paragraph_number);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center gap-2 hover:border-amber-500 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Điều Khoản Trước</span>
                </button>

                <button
                  disabled={currentIndex >= filteredList.length - 1}
                  onClick={() => {
                    const next = currentIndex + 1;
                    setCurrentIndex(next);
                    markAsRead(filteredList[next]?.paragraph_number);
                  }}
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

      {/* ========================================================
          CHẾ ĐỘ 3: SÁCH LẬT PHỤNG VỤ (BOOKFLIP 2 PAGES)
      ======================================================== */}
      {viewMode === 'bookflip' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Page */}
            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-6 relative">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-[var(--border-card)] pb-2">
                  Trang Trái • {filteredList[bookPage * 2]?.title || 'Hết'}
                </span>
                {filteredList[bookPage * 2] ? (
                  <div 
                    className="prose dark:prose-invert max-w-none font-serif text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: filteredList[bookPage * 2].content_html }}
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
            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl flex flex-col justify-between space-y-6 relative">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-[var(--border-card)] pb-2">
                  Trang Phải • {filteredList[bookPage * 2 + 1]?.title || 'Hết'}
                </span>
                {filteredList[bookPage * 2 + 1] ? (
                  <div 
                    className="prose dark:prose-invert max-w-none font-serif text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: filteredList[bookPage * 2 + 1].content_html }}
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

          {/* BookFlip Navigator */}
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
              Trang {bookPage + 1} / {Math.ceil(filteredList.length / 2)}
            </span>

            <button
              disabled={(bookPage + 1) * 2 >= filteredList.length}
              onClick={() => setBookPage(prev => prev + 1)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 shadow-md"
            >
              <span>Lật Trang Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          CHẾ ĐỘ 4: THẺ LẬT GHI NHỚ (FLASHCARDS DECK)
      ======================================================== */}
      {viewMode === 'flashcard' && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-serif">Bộ Thẻ Học Nhanh Giáo Lý</span>
            <h3 className="font-serif font-black text-2xl text-[var(--text-main)]">Thẻ Lật Ôn Tập &amp; Ghi Nhớ Tín Lý</h3>
          </div>

          {flashcardDeck[flashcardIndex] && (
            <div 
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              className="min-h-[320px] p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-amber-500/10 border-2 border-amber-500/40 shadow-2xl cursor-pointer flex flex-col justify-between transition-transform duration-500 transform hover:scale-[1.01]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-serif font-black text-xs">
                    {flashcardDeck[flashcardIndex].title}
                  </span>
                  <span className="text-xs font-serif text-[var(--text-muted)] flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{flashcardFlipped ? 'Mặt Sau (Lời Giải)' : 'Mặt Trước (Vấn Nạn)'}</span>
                  </span>
                </div>

                {!flashcardFlipped ? (
                  <div className="space-y-3 pt-6">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Đề Mục Khảo Cứu:</span>
                    <h4 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] leading-relaxed">
                      {flashcardDeck[flashcardIndex].full_path}
                    </h4>
                    <p className="text-xs font-serif italic text-stone-400 pt-4">
                      (Nhấp vào thẻ để lật xem lời giải tín lý chuẩn mực)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Giáo Huấn Chính Thức:</span>
                    <div 
                      className="prose dark:prose-invert max-w-none font-serif text-sm sm:text-base leading-relaxed text-[var(--text-main)]"
                      dangerouslySetInnerHTML={{ __html: flashcardDeck[flashcardIndex].content_html }}
                    />
                  </div>
                )}
              </div>

              <div className="text-center pt-4 border-t border-[var(--border-card)] text-xs font-serif font-bold text-amber-500">
                Thẻ {flashcardIndex + 1} / {flashcardDeck.length}
              </div>
            </div>
          )}

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              disabled={flashcardIndex === 0}
              onClick={() => {
                setFlashcardFlipped(false);
                setFlashcardIndex(prev => Math.max(0, prev - 1));
              }}
              className="px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thẻ Trước</span>
            </button>

            <button
              onClick={() => {
                setFaithXP(prev => prev + 25);
                setFlashcardFlipped(false);
                if (flashcardIndex < flashcardDeck.length - 1) {
                  setFlashcardIndex(prev => prev + 1);
                }
              }}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-emerald-400 transition"
            >
              <Check className="w-4 h-4" />
              <span>Đã Thuộc (+25 XP)</span>
            </button>

            <button
              disabled={flashcardIndex >= flashcardDeck.length - 1}
              onClick={() => {
                setFlashcardFlipped(false);
                setFlashcardIndex(prev => prev + 1);
              }}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 shadow-md"
            >
              <span>Thẻ Kế Tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================
          MODAL POPOVER: XEM NHANH SỐ CCC THAM CHIẾU CHÉO
      ======================================================== */}
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
                  const idx = filteredList.findIndex(p => p.paragraph_number === popoverNumber);
                  if (idx >= 0) {
                    setCurrentIndex(idx);
                    setViewMode('continuous');
                    setPopoverNumber(null);
                  }
                }}
                className="text-xs font-serif font-bold text-amber-500 hover:underline flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Mở trong Trình Đọc Toàn Thư</span>
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
