'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CatechismEntry } from '@/lib/api';
import { 
  BookOpen, 
  Cross, 
  Sun, 
  Shield, 
  Flame, 
  Search, 
  HelpCircle, 
  Layers, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Maximize2, 
  Minimize2, 
  Type, 
  Sparkles,
  Award,
  ArrowRight,
  Filter,
  Eye
} from 'lucide-react';

interface CatechismExplorerProps {
  initialEntries: CatechismEntry[];
}

const PILLARS_CONFIG = [
  {
    number: 1,
    roman: 'I',
    title: 'Tuyên Xưng Đức Tin',
    subtitle: 'Kinh Tin Kính Các Tông Đồ',
    desc: 'Mầu nhiệm Thiên Chúa Ba Ngôi, Sáng Tạo, Nhập Thể, Cứu Chuộc & Hội Thánh.',
    icon: Cross,
    color: 'amber',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    range: 'CCC 1 - 1065'
  },
  {
    number: 2,
    roman: 'II',
    title: 'Cử Hành Mầu Nhiệm Kitô Giáo',
    subtitle: 'Phụng Vụ & 7 Bí Tích',
    desc: 'Ân sủng trao ban qua Phụng Vụ Thánh, 7 Bí Tích & Đời sống phụng vụ.',
    icon: Sun,
    color: 'rose',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    range: 'CCC 1066 - 1690'
  },
  {
    number: 3,
    roman: 'III',
    title: 'Đời Sống Trong Đức Kitô',
    subtitle: 'Luân Lý & 10 Điều Răn',
    desc: 'Phẩm giá con người, ơn gọi nên thánh, Tám Mối Phúc & Mười Điều Răn.',
    icon: Shield,
    color: 'emerald',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    range: 'CCC 1691 - 2557'
  },
  {
    number: 4,
    roman: 'IV',
    title: 'Kinh Nguyện Kitô Giáo',
    subtitle: 'Cầu Nguyện & Kinh Lạy Cha',
    desc: 'Ý nghĩa kinh nguyện, truyền thống cầu nguyện & 7 Lời Nguyện Kinh Lạy Cha.',
    icon: Flame,
    color: 'indigo',
    badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    range: 'CCC 2558 - 2865'
  }
];

export default function CatechismExplorer({ initialEntries }: CatechismExplorerProps) {
  const [activeTab, setActiveTab] = useState<'reader' | 'pillars' | 'compendium'>('reader');
  const [selectedPart, setSelectedPart] = useState<number>(0); // 0 = All
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntryId, setSelectedEntryId] = useState<number>(initialEntries[0]?.id || 1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [expandedCompendiums, setExpandedCompendiums] = useState<Record<number, boolean>>({ 1: true, 36: true, 271: true });

  // Filtered Entries based on Part and Search Query
  const filteredEntries = useMemo(() => {
    return initialEntries.filter((entry) => {
      // 1. Part Filter
      if (selectedPart > 0 && entry.part_number !== selectedPart) return false;

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${entry.title} ${entry.summary || ''} ${entry.question || ''} ${entry.ccc_number_range} ${entry.section_title || ''} ${entry.chapter_title || ''} ${(entry.tags || []).join(' ')}`.toLowerCase();
      
      const numMatch = q.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0]);
        if (
          (entry.paragraph_start <= num && entry.paragraph_end >= num) ||
          entry.compendium_number === num
        ) {
          return true;
        }
      }

      return matchText.includes(q);
    });
  }, [initialEntries, selectedPart, searchQuery]);

  // Current Selected Active Entry for Reader View
  const currentEntry = useMemo(() => {
    const found = filteredEntries.find((e) => e.id === selectedEntryId);
    return found || filteredEntries[0] || initialEntries[0];
  }, [filteredEntries, selectedEntryId, initialEntries]);

  // Handle Copy Snippet
  const handleCopy = (entry: CatechismEntry) => {
    if (typeof navigator !== 'undefined') {
      const textToCopy = `[${entry.ccc_number_range}] ${entry.title}\n${entry.summary || ''}\nNguồn: Giáo Lý Hội Thánh Công Giáo — VERIDU (https://www.thapgia.com/giao-ly)`;
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const toggleCompendium = (id: number) => {
    setExpandedCompendiums(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`space-y-8 w-full transition-all duration-300 ${isFocusMode ? 'fixed inset-0 z-50 bg-[var(--bg-main)] p-4 sm:p-8 overflow-y-auto' : ''}`}>
      
      {/* ── FOCUS MODE HEADER (IF ACTIVE) ── */}
      {isFocusMode && (
        <div className="max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2 text-amber-500 font-serif font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Chế Độ Đọc Tĩnh Tâm — Sách Giáo Lý Hội Thánh</span>
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

      {/* ── CONTROL BAR: NAVIGATION TABS & SEARCH ── */}
      {!isFocusMode && (
        <div className="space-y-5">
          
          {/* Main Mode Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
            
            {/* View Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-inner">
              <button
                onClick={() => setActiveTab('reader')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'reader'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Trình Đọc Toàn Thư (CCC)</span>
              </button>

              <button
                onClick={() => setActiveTab('pillars')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'pillars'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>4 Trụ Cột Sơ Đồ Cây</span>
              </button>

              <button
                onClick={() => setActiveTab('compendium')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'compendium'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Bản Toát Yếu (Hỏi - Thưa)</span>
              </button>
            </div>

            {/* Quick Stats / Info Badge */}
            <div className="text-xs font-serif text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hiển thị <strong>{filteredEntries.length}</strong> chủ đề giáo lý chuẩn mực</span>
            </div>

          </div>

          {/* Search Box & Part Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            
            {/* Live Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu số đoạn (VD: 1324, 27), số câu Toát Yếu (Câu 1, 36) hoặc từ khóa (Thánh Thể, Ba Ngôi)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 text-xs sm:text-sm outline-none transition-all shadow-sm font-serif"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-amber-500 font-bold"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Part Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedPart(0)}
                className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition-all ${
                  selectedPart === 0
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Tất Cả 4 Phần
              </button>

              {PILLARS_CONFIG.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.number}
                    onClick={() => setSelectedPart(p.number)}
                    className={`px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      selectedPart === p.number
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>Phần {p.roman}</span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          TAB 1: TRÌNH ĐỌC TOÀN THƯ (FULL-TEXT CATECHISM READER)
      ======================================================== */}
      {activeTab === 'reader' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Index Sidebar (4/12) */}
          {!isFocusMode && (
            <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="text-xs font-serif font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 flex items-center justify-between">
                <span>Danh Mục Đề Mục &amp; Số Đoạn</span>
                <span>{filteredEntries.length} mục</span>
              </div>

              <div className="space-y-2.5">
                {filteredEntries.map((entry) => {
                  const isSelected = entry.id === currentEntry?.id;
                  const pillar = PILLARS_CONFIG.find(p => p.number === entry.part_number);

                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntryId(entry.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col space-y-2 group ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                          : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded-full border ${pillar?.badge || 'border-amber-500/30'}`}>
                          Phần {pillar?.roman}: {entry.ccc_number_range}
                        </span>
                        {entry.compendium_number && (
                          <span className="text-amber-500 font-serif font-bold">
                            Câu #{entry.compendium_number}
                          </span>
                        )}
                      </div>

                      <div className="font-serif font-bold text-sm text-[var(--text-main)] group-hover:text-amber-500 transition-colors line-clamp-2">
                        {entry.title}
                      </div>

                      {entry.summary && (
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                          {entry.summary}
                        </p>
                      )}
                    </button>
                  );
                })}

                {filteredEntries.length === 0 && (
                  <div className="p-8 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] space-y-2">
                    <p className="font-serif text-sm text-[var(--text-muted)]">Không tìm thấy số đoạn hoặc từ khóa phù hợp.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedPart(0); }}
                      className="text-xs font-bold text-amber-500 hover:underline"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Right Reader Canvas (8/12 or 12/12 in focus mode) */}
          <main className={`${isFocusMode ? 'max-w-4xl mx-auto col-span-12' : 'lg:col-span-8'} space-y-6`}>
            
            {currentEntry ? (
              <article className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl space-y-8 backdrop-blur-xl">
                
                {/* Article Header & Tools */}
                <div className="space-y-4 border-b border-[var(--border-card)] pb-6">
                  
                  {/* Top Badges & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-serif font-bold text-xs border border-amber-500/40">
                        {currentEntry.ccc_number_range}
                      </span>
                      {currentEntry.compendium_number && (
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-main)] text-stone-300 font-serif font-bold text-xs border border-[var(--border-card)]">
                          Toát Yếu: Câu #{currentEntry.compendium_number}
                        </span>
                      )}
                    </div>

                    {/* Font & Focus Tools */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setFontSize(prev => prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal')}
                        className="p-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500 transition"
                        title="Chỉnh cỡ chữ"
                      >
                        <Type className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopy(currentEntry)}
                        className="p-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500 transition"
                        title="Sao chép trích đoạn"
                      >
                        {copiedId === currentEntry.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className="p-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500 transition"
                        title={isFocusMode ? "Thu nhỏ" : "Chế độ Đọc Tĩnh Tâm Toàn Màn Hình"}
                      >
                        {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Section Breadcrumbs */}
                  <div className="text-xs font-serif text-[var(--text-muted)]">
                    <span>{currentEntry.part_title}</span>
                    {currentEntry.section_title && <span> › {currentEntry.section_title}</span>}
                    {currentEntry.chapter_title && <span> › {currentEntry.chapter_title}</span>}
                  </div>

                  {/* Question (If from Compendium) */}
                  {currentEntry.question && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-1">
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">Câu Hỏi Khảo Cứu:</span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] italic">
                        &ldquo;{currentEntry.question}&rdquo;
                      </h3>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="font-serif font-bold text-2xl sm:text-4xl text-[var(--text-main)] leading-tight tracking-tight">
                    {currentEntry.title}
                  </h1>

                  {/* Executive Summary Callout */}
                  {currentEntry.summary && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm sm:text-base font-serif italic text-stone-300 leading-relaxed">
                      <strong className="text-amber-400 font-sans not-italic text-xs uppercase tracking-wider block mb-1">Tóm Lược Tín Lý:</strong>
                      {currentEntry.summary}
                    </div>
                  )}

                </div>

                {/* Main Detailed Content Body */}
                <div 
                  className={`prose dark:prose-invert max-w-none font-serif text-[var(--text-main)] leading-relaxed space-y-5 ${
                    fontSize === 'xlarge' ? 'text-xl sm:text-2xl leading-loose' : fontSize === 'large' ? 'text-lg sm:text-xl leading-relaxed' : 'text-base sm:text-lg'
                  }`}
                  dangerouslySetInnerHTML={{ __html: currentEntry.content_html }}
                />

                {/* Scripture References Cross-Links */}
                {currentEntry.scripture_references && currentEntry.scripture_references.length > 0 && (
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4">
                    <div className="flex items-center gap-2 font-serif font-bold text-sm text-amber-500 border-b border-amber-500/20 pb-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Nền Tảng Kinh Thánh Liên Quan</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {currentEntry.scripture_references.map((sc, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-amber-500 font-sans">{sc.reference}</span>
                            <Link
                              href={`/doc-kinh-thanh/${sc.book_slug}/${sc.chapter}`}
                              className="text-[11px] text-amber-500 hover:underline flex items-center gap-1"
                            >
                              <span>Đọc toàn văn</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <p className="font-serif italic text-[var(--text-main)] text-xs sm:text-sm leading-relaxed">
                            &ldquo;{sc.text}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags & Cross References Footer */}
                <div className="pt-4 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[var(--text-muted)] font-serif">Đề mục:</span>
                    {(currentEntry.tags || []).map((t, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-card)] font-bold text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/quiz"
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-serif font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Luyện Thi Giáo Lý</span>
                  </Link>
                </div>

              </article>
            ) : (
              <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
                <BookOpen className="w-12 h-12 text-amber-500 mx-auto opacity-50" />
                <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">Chưa Chọn Đề Mục Giáo Lý</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">Vui lòng chọn một số đoạn từ danh sách bên trái hoặc sử dụng thanh tìm kiếm để bắt đầu khảo cứu.</p>
              </div>
            )}

          </main>

        </div>
      )}

      {/* ========================================================
          TAB 2: 4 TRỤ CỘT GIÁO LÝ (INTERACTIVE 4 PILLARS TREE)
      ======================================================== */}
      {activeTab === 'pillars' && (
        <div className="space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-serif">Bản Đồ Cấu Trúc Toàn Thư</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">Bốn Trụ Cột Đức Tin Hội Thánh</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Toàn bộ Sách Giáo Lý Hội Thánh Công Giáo được Thánh Giáo Hoàng Gioan Phaolô II ban hành dựa trên 4 trụ cột vĩnh cửu của truyền thống Tông Đồ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS_CONFIG.map((p) => {
              const IconComp = p.icon;
              const entriesInPillar = initialEntries.filter(e => e.part_number === p.number);

              return (
                <div
                  key={p.number}
                  className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/25 shadow-xl hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComp className="w-7 h-7 text-amber-500" />
                      </div>
                      <span className="font-serif font-black text-xs px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300">
                        Phần {p.roman} • {p.range}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif font-black text-xl sm:text-2xl text-[var(--text-main)] group-hover:text-amber-500 transition-colors">
                        {p.title}
                      </h3>
                      <p className="font-serif font-bold text-xs text-amber-600 dark:text-amber-400">
                        {p.subtitle}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
                        {p.desc}
                      </p>
                    </div>

                    {/* Sub-Topics Sample List */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Các đề mục cốt lõi:</span>
                      <div className="space-y-1.5">
                        {entriesInPillar.map((ent) => (
                          <button
                            key={ent.id}
                            onClick={() => {
                              setSelectedEntryId(ent.id);
                              setActiveTab('reader');
                            }}
                            className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/15 border border-[var(--border-card)] hover:border-amber-500/40 text-xs font-serif flex items-center justify-between transition group/item"
                          >
                            <span className="font-bold text-[var(--text-main)] group-hover/item:text-amber-500 truncate pr-2">
                              {ent.title}
                            </span>
                            <span className="text-[10px] text-amber-500 font-sans flex-shrink-0">
                              {ent.ccc_number_range} →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => {
                      setSelectedPart(p.number);
                      setActiveTab('reader');
                    }}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <span>Khảo Cứu Toàn Bộ Phần {p.roman}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 3: BẢN TOÁT YẾU HỎI - THƯA (COMPENDIUM Q&A)
      ======================================================== */}
      {activeTab === 'compendium' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          
          <div className="text-center space-y-2 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-serif">Compendium Catechismi Catholicae Ecclesiae</span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">Bản Toát Yếu Giáo Lý (Hỏi &amp; Thưa)</h2>
            <p className="text-xs text-[var(--text-muted)]">Tổng hợp các câu hỏi giáo lý cốt lõi được trả lời súc tích, chính xác cho đời sống đức tin thường nhật.</p>
          </div>

          <div className="space-y-4">
            {filteredEntries.filter(e => e.question).map((entry) => {
              const isExpanded = !!expandedCompendiums[entry.id];
              const pillar = PILLARS_CONFIG.find(p => p.number === entry.part_number);

              return (
                <div
                  key={entry.id}
                  className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 transition-all shadow-md space-y-4"
                >
                  {/* Question Header Accordion Trigger */}
                  <div
                    onClick={() => toggleCompendium(entry.id)}
                    className="flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-serif font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        #{entry.compendium_number || entry.id}
                      </span>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillar?.badge || 'border-amber-500/30'}`}>
                          Phần {pillar?.roman} • {entry.ccc_number_range}
                        </span>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] leading-snug">
                          {entry.question}
                        </h3>
                      </div>
                    </div>

                    <button className="p-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-amber-500 transition flex-shrink-0">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Answer Content */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-[var(--border-card)] space-y-4 animate-in fade-in duration-300">
                      
                      {/* Short Answer Callout */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 font-serif text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
                        <strong className="font-sans text-amber-500 font-bold text-xs uppercase tracking-wider block mb-1">Lời Thưa Cốt Lõi:</strong>
                        {entry.summary}
                      </div>

                      {/* Detailed Context Text */}
                      <div 
                        className="prose dark:prose-invert max-w-none text-xs sm:text-sm font-serif text-stone-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: entry.content_html }}
                      />

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <button
                          onClick={() => {
                            setSelectedEntryId(entry.id);
                            setActiveTab('reader');
                          }}
                          className="font-serif font-bold text-amber-500 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mở trong Trình Đọc Toàn Thư</span>
                        </button>

                        <button
                          onClick={() => handleCopy(entry)}
                          className="text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1 font-bold"
                        >
                          {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
                          <span>{copiedId === entry.id ? 'Đã sao chép' : 'Chia sẻ'}</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
