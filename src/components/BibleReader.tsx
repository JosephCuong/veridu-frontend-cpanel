'use client';

import React, { useState, useEffect } from 'react';
import { 
  BibleBook, BibleVerse, ChapterCommentary, BibleTranslation 
} from '@/lib/bible';
import { fetchBibleChapter } from '@/lib/api';
import { 
  ChevronLeft, ChevronRight, ChevronDown, 
  Columns, MessageSquareText, Headphones, 
  X, Heart, Shield, Compass, PlayCircle, Settings2, BookOpen, Search, Menu, 
  MapPin, Bookmark, LayoutGrid, Layers, Share2, Type, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BibleReaderProps {
  initialBookSlug: string;
  initialChapter: number;
  initialTranslation: string;
  books: BibleBook[];
  translations: BibleTranslation[];
  verses: BibleVerse[];
  commentary: ChapterCommentary | null;
}

export default function BibleReader({
  initialBookSlug,
  initialChapter,
  initialTranslation,
  books,
  translations,
  verses: initialVerses,
  commentary,
}: BibleReaderProps) {
  const router = useRouter();

  // Selected State
  const selectedBook = books.find((b) => b.slug === initialBookSlug) || books[0];
  const selectedTranslation = translations.find((t) => t.slug === initialTranslation) || translations[0];
  const currentChapter = initialChapter;

  // Selected Verse for Contextual Study Pane (Column 3)
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<string | null>(null);

  // Column 1 Layout Dock Toggle
  const [isNavDocked, setIsNavDocked] = useState(false);

  // Column 3 Active Compact Tab ('commentary' | 'parallel' | 'map' | 'video')
  const [activeStudyTab, setActiveStudyTab] = useState<'commentary' | 'parallel' | 'map' | 'video'>('commentary');

  // Mobile Drawers
  const [showMobileNavDrawer, setShowMobileNavDrawer] = useState(false);
  const [showMobileStudyDrawer, setShowMobileStudyDrawer] = useState(false);

  // Feature Toggles
  const [readMode, setReadMode] = useState<'single' | 'parallel'>('single');
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);

  // Second Translation State for Parallel Reading
  const [secondTranslationSlug, setSecondTranslationSlug] = useState<string>(
    translations.length > 1 ? (translations.find(t => t.slug !== selectedTranslation.slug)?.slug || translations[1].slug) : translations[0].slug
  );
  const [secondVerses, setSecondVerses] = useState<BibleVerse[]>([]);
  const [isFetchingSecond, setIsFetchingSecond] = useState(false);

  // Text Customization
  const [fontSize, setFontSize] = useState<number>(19);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [lineHeight, setLineHeight] = useState<number>(1.85);

  // Search Filter in Left Navigation
  const [bookSearch, setBookSearch] = useState('');

  // Fetch parallel verses when parallel read mode is active or user switches tab to parallel
  useEffect(() => {
    if (readMode === 'parallel' || activeStudyTab === 'parallel') {
      let isMounted = true;
      setIsFetchingSecond(true);
      fetchBibleChapter(secondTranslationSlug, selectedBook.slug, currentChapter)
        .then(data => {
          if (isMounted) {
            setSecondVerses(data?.verses || []);
            setIsFetchingSecond(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsFetchingSecond(false);
        });
      return () => { isMounted = false; };
    }
  }, [readMode, activeStudyTab, secondTranslationSlug, selectedBook.slug, currentChapter]);

  const handleNav = (slug: string, chapter: number, trans: string) => {
    setSelectedVerseNumber(null);
    router.push(`/kinh-thanh/${slug}/${chapter}?t=${trans}`);
  };

  const hasNextChapter = currentChapter < (selectedBook?.totalChapters || 1);
  const hasPrevChapter = currentChapter > 1;

  // Filtered books for Cựu Ước / Tân Ước
  const filteredBooks = books.filter(b => 
    b.nameVi?.toLowerCase().includes(bookSearch.toLowerCase()) || 
    b.slug.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const otBooks = filteredBooks.filter(b => b.testament === 'Cựu Ước');
  const ntBooks = filteredBooks.filter(b => b.testament === 'Tân Ước');

  // Selected verse details
  const activeVerse = selectedVerseNumber ? initialVerses.find(v => String(v.verse) === String(selectedVerseNumber)) : null;
  const activeSecondVerse = selectedVerseNumber ? secondVerses.find(v => String(v.verse) === String(selectedVerseNumber)) : null;

  return (
    <div className="w-full relative bg-[var(--bg-main)] text-[var(--text-main)] min-h-[85vh] font-sans pb-16">
      
      {/* ========================================================================= */}
      {/* 🌟 3-COLUMN FLEXIBLE WORKSPACE GRID                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-4 xl:gap-6 items-start">

        {/* ----------------------------------------------------------------------- */}
        {/* 📌 CỘT 1: MENU ĐIỀU HƯỚNG (NAVIGATION SIDEBAR - BÊN TRÁI)               */}
        {/* ----------------------------------------------------------------------- */}
        <aside className={`hidden xl:flex flex-col transition-all duration-300 ${
          isNavDocked ? 'col-span-1 w-16' : 'col-span-3'
        } bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 shadow-xl backdrop-blur-xl sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden`}>
          
          {/* Header & Dock Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] shrink-0">
            {!isNavDocked && (
              <h3 className="font-serif font-bold text-sm tracking-wide text-[var(--accent-gold)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>MỤC LỤC KINHN THÁNH</span>
              </h3>
            )}
            <button 
              onClick={() => setIsNavDocked(!isNavDocked)}
              title={isNavDocked ? "Mở rộng danh sách Sách" : "Thu gọn thành Dock Icon"}
              className="p-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 border border-[var(--border-card)] transition-all mx-auto"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* DOCKED MODE (ICON BAR ONLY) */}
          {isNavDocked ? (
            <div className="py-4 space-y-3 flex flex-col items-center flex-1 overflow-y-auto scrollbar-none">
              {books.slice(0, 15).map((b) => (
                <button
                  key={b.slug}
                  onClick={() => handleNav(b.slug, 1, selectedTranslation.slug)}
                  title={`${b.nameVi} (${b.totalChapters} Chương)`}
                  className={`w-10 h-10 rounded-2xl font-serif text-xs font-bold flex items-center justify-center border transition-all ${
                    selectedBook.slug === b.slug 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                      : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40 text-[var(--text-main)]'
                  }`}
                >
                  {b.nameVi?.substring(0, 2)}
                </button>
              ))}
            </div>
          ) : (
            /* EXPANDED NAVIGATION MODE */
            <div className="flex-1 flex flex-col pt-3 overflow-hidden">
              {/* Quick Search */}
              <div className="relative mb-3 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Tìm sách..." 
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-semibold"
                />
              </div>

              {/* Scrollable Books Accordion */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[var(--border-card)] text-xs">
                
                {/* Cựu Ước */}
                {otBooks.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mb-2 inline-block">
                      Cựu Ước ({otBooks.length})
                    </span>
                    <div className="space-y-1 mt-1">
                      {otBooks.map((b) => (
                        <div key={b.slug} className="rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleNav(b.slug, 1, selectedTranslation.slug)}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between font-serif font-bold ${
                              selectedBook.slug === b.slug
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                            }`}
                          >
                            <span className="truncate">{b.nameVi}</span>
                            <span className="text-[10px] font-sans font-normal opacity-70 shrink-0 ml-1">
                              {b.totalChapters} ch
                            </span>
                          </button>

                          {/* Render Chapter Buttons Inline for Active Book */}
                          {selectedBook.slug === b.slug && (
                            <div className="p-2 bg-[var(--bg-main)]/60 rounded-xl my-1 border border-[var(--border-card)] grid grid-cols-5 gap-1.5 animate-in fade-in">
                              {Array.from({ length: selectedBook.totalChapters || 1 }).map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleNav(b.slug, idx + 1, selectedTranslation.slug)}
                                  className={`py-1 text-center font-sans font-bold rounded-lg text-[11px] transition-all ${
                                    currentChapter === idx + 1
                                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                      : 'bg-[var(--bg-card)] hover:bg-amber-500/20 text-[var(--text-main)] border border-[var(--border-card)]'
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tân Ước */}
                {ntBooks.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 mb-2 inline-block">
                      Tân Ước ({ntBooks.length})
                    </span>
                    <div className="space-y-1 mt-1">
                      {ntBooks.map((b) => (
                        <div key={b.slug} className="rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleNav(b.slug, 1, selectedTranslation.slug)}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between font-serif font-bold ${
                              selectedBook.slug === b.slug
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                            }`}
                          >
                            <span className="truncate">{b.nameVi}</span>
                            <span className="text-[10px] font-sans font-normal opacity-70 shrink-0 ml-1">
                              {b.totalChapters} ch
                            </span>
                          </button>

                          {/* Render Chapter Buttons Inline for Active Book */}
                          {selectedBook.slug === b.slug && (
                            <div className="p-2 bg-[var(--bg-main)]/60 rounded-xl my-1 border border-[var(--border-card)] grid grid-cols-5 gap-1.5 animate-in fade-in">
                              {Array.from({ length: selectedBook.totalChapters || 1 }).map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleNav(b.slug, idx + 1, selectedTranslation.slug)}
                                  className={`py-1 text-center font-sans font-bold rounded-lg text-[11px] transition-all ${
                                    currentChapter === idx + 1
                                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                      : 'bg-[var(--bg-card)] hover:bg-amber-500/20 text-[var(--text-main)] border border-[var(--border-card)]'
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>


        {/* ----------------------------------------------------------------------- */}
        {/* 📜 CỘT 2: KHÔNG GIAN ĐỌC CHÍNH (MAIN READING PANE - Ở GIỮA)            */}
        {/* ----------------------------------------------------------------------- */}
        <main className={`col-span-12 ${
          isNavDocked ? 'xl:col-span-8' : 'xl:col-span-6'
        } lg:col-span-8 space-y-4`}>
          
          {/* Card Khung Đọc Chính */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative min-h-[75vh]">
            
            {/* 🌟 STICKY SLIM TOOLBAR (FLAT TOP BORDER - NO FLOATING OVERLAP) */}
            <div className="sticky top-0 z-30 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-card)] px-4 py-2.5 flex items-center justify-between gap-2 shadow-sm">
              
              {/* Left: Mobile Nav Drawer Trigger & Breadcrumb */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowMobileNavDrawer(true)}
                  className="xl:hidden p-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-amber-500 hover:bg-amber-500/10 transition-colors"
                  aria-label="Mục lục Sách"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-1.5">
                  <span className="text-amber-600 dark:text-amber-400 truncate max-w-[110px] sm:max-w-none">{selectedBook.nameVi}</span>
                  <span className="text-[var(--text-muted)]">/</span>
                  
                  {/* Chapter Selector Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsChapterMenuOpen(!isChapterMenuOpen)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 flex items-center gap-1 text-xs font-bold transition-all"
                    >
                      <span>Chương {currentChapter}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    {isChapterMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsChapterMenuOpen(false)}></div>
                        <div className="absolute left-0 top-full mt-2 p-3 w-56 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 animate-in fade-in max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-card)]">
                          <div className="grid grid-cols-4 gap-1.5">
                            {Array.from({ length: selectedBook.totalChapters || 1 }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setIsChapterMenuOpen(false);
                                  handleNav(selectedBook.slug, i + 1, selectedTranslation.slug);
                                }}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                  currentChapter === i + 1
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : 'bg-[var(--bg-main)] hover:bg-amber-500/20 text-[var(--text-main)]'
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Center/Right: Translation Selector & Toolbar Controls */}
              <div className="flex items-center gap-2 text-xs">
                
                {/* Translation Selector */}
                <select
                  value={selectedTranslation?.slug}
                  onChange={(e) => handleNav(selectedBook.slug, currentChapter, e.target.value)}
                  className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-2.5 py-1.5 font-bold focus:outline-none transition-all cursor-pointer max-w-[130px] sm:max-w-none text-[11px] sm:text-xs"
                >
                  {translations.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.name}</option>
                  ))}
                </select>

                {/* Parallel Mode Toggle Button */}
                <button
                  onClick={() => setReadMode(readMode === 'single' ? 'parallel' : 'single')}
                  title="Bật/Tắt chế độ Đọc Song Song 2 bản dịch"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border text-[11px] sm:text-xs ${
                    readMode === 'parallel'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-[var(--bg-main)] hover:bg-amber-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Song Song</span>
                </button>

                {/* Font Customization Toggle */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    title="Tùy chỉnh cỡ chữ & phông chữ"
                    className="p-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] transition-all"
                  >
                    <Type className="w-4 h-4 text-amber-500" />
                  </button>

                  {showSettings && (
                    <div className="absolute right-0 top-full mt-2 p-4 w-60 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 animate-in fade-in">
                      <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Tùy Chỉnh Văn Bản</h4>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Cỡ chữ:</span>
                            <span className="font-bold text-amber-500">{fontSize}px</span>
                          </div>
                          <input type="range" min="15" max="32" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-amber-500" />
                        </div>
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Giãn dòng:</span>
                            <span className="font-bold text-amber-500">{lineHeight}</span>
                          </div>
                          <input type="range" min="1.4" max="2.4" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-amber-500" />
                        </div>
                        <div className="flex bg-[var(--bg-main)] border border-[var(--border-card)] p-1 rounded-xl">
                          <button onClick={() => setFontFamily('serif')} className={`flex-1 py-1 rounded-lg transition-all font-serif font-bold ${fontFamily === 'serif' ? 'bg-amber-500 text-slate-950' : 'text-[var(--text-muted)]'}`}>Serif</button>
                          <button onClick={() => setFontFamily('sans')} className={`flex-1 py-1 rounded-lg transition-all font-sans font-bold ${fontFamily === 'sans' ? 'bg-amber-500 text-slate-950' : 'text-[var(--text-muted)]'}`}>Sans</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Right Study Drawer Trigger */}
                <button 
                  onClick={() => setShowMobileStudyDrawer(true)}
                  className="lg:hidden p-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                  aria-label="Khung chú giải"
                >
                  <MessageSquareText className="w-4 h-4" />
                </button>

              </div>
            </div>


            {/* READING PANE BODY CONTENT */}
            <div className="p-6 sm:p-10 md:p-12">
              
              {/* Header Title */}
              <div className="text-center mb-10 border-b border-[var(--border-card)] pb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight mb-2">
                  {selectedBook.nameVi}
                </h1>
                <h2 className="text-lg sm:text-xl text-amber-600 dark:text-amber-400 font-serif italic">Chương {currentChapter}</h2>
              </div>

              {initialVerses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
                  <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-serif">Chương này hiện chưa có dữ liệu hoặc đang được cập nhật.</p>
                </div>
              ) : (
                <div 
                  className={`space-y-6 relative z-10 transition-all duration-300 ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                >
                  {initialVerses.map((verse) => {
                    const sv = secondVerses.find(v => String(v.verse) === String(verse.verse));
                    const isSelected = String(selectedVerseNumber) === String(verse.verse);

                    return (
                      <div key={verse.id} className="group/verse relative">
                        {verse.heading && (
                          <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-800 dark:text-amber-400 mt-10 mb-5 border-b border-[var(--border-card)] pb-2">
                            {verse.heading}
                          </h3>
                        )}

                        <div 
                          onClick={() => {
                            setSelectedVerseNumber(isSelected ? null : String(verse.verse));
                            if (!isSelected && activeStudyTab === 'video') setActiveStudyTab('commentary');
                          }}
                          className={`flex gap-3 items-start p-3 -mx-3 rounded-2xl transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-500/15 border-l-4 border-amber-500 shadow-sm' 
                              : 'hover:bg-[var(--bg-main)]/60'
                          }`}
                        >
                          {/* Verse Number Indicator */}
                          <span className={`text-xs font-black mt-1 w-6 text-right shrink-0 select-none ${
                            isSelected ? 'text-amber-600 dark:text-amber-400 font-bold scale-110' : 'text-[var(--accent-gold)] opacity-80'
                          }`}>
                            {verse.verse}
                          </span>

                          <div className={`flex-1 w-full ${readMode === 'parallel' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                            
                            {/* Primary Translation */}
                            <div className="relative">
                              {readMode === 'parallel' && (
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                                  {selectedTranslation.name}
                                </div>
                              )}
                              <div dangerouslySetInnerHTML={{ __html: verse.content }} />
                            </div>

                            {/* Secondary Translation */}
                            {readMode === 'parallel' && (
                              <div className="relative pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--border-card)] md:pl-4">
                                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">
                                  {translations.find(t => t.slug === secondTranslationSlug)?.name || 'Bản Dịch Đối Chiếu'}
                                </div>
                                {isFetchingSecond ? (
                                  <div className="animate-pulse bg-[var(--border-card)] h-4 rounded w-3/4 mt-1"></div>
                                ) : sv ? (
                                  <div className="text-[var(--text-muted)]" dangerouslySetInnerHTML={{ __html: sv.content }} />
                                ) : (
                                  <span className="text-[var(--text-muted)] italic text-xs">...</span>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Inline Chapter Navigation */}
              <div className="mt-14 pt-6 border-t border-[var(--border-card)] flex items-center justify-between gap-4 text-xs font-bold">
                <button 
                  onClick={() => hasPrevChapter && handleNav(selectedBook.slug, currentChapter - 1, selectedTranslation.slug)}
                  disabled={!hasPrevChapter}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                    hasPrevChapter 
                      ? 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 shadow-sm cursor-pointer'
                      : 'bg-transparent border-[var(--border-card)]/50 text-[var(--text-muted)]/50 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Chương Trước</span>
                </button>

                <button 
                  onClick={() => hasNextChapter && handleNav(selectedBook.slug, currentChapter + 1, selectedTranslation.slug)}
                  disabled={!hasNextChapter}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                    hasNextChapter 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-md cursor-pointer'
                      : 'bg-transparent border-[var(--border-card)]/50 text-[var(--text-muted)]/50 cursor-not-allowed'
                  }`}
                >
                  <span>Chương {currentChapter + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </main>


        {/* ----------------------------------------------------------------------- */}
        {/* 🔬 CỘT 3: KHÔNG GIAN PHÂN TÍCH & CHÚ GIẢI (STUDY PANE - BÊN PHẢI)       */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="hidden lg:flex flex-col col-span-4 xl:col-span-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 shadow-xl backdrop-blur-xl sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
          
          {/* 🌟 COMPACT TABS HEADER (TEXT NGẮN & ICON NHƯ USER YÊU CẦU) */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl shrink-0 mb-4 text-[11px] font-bold">
            <button
              onClick={() => setActiveStudyTab('commentary')}
              title="Chú giải Thần học & Ngữ cảnh"
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeStudyTab === 'commentary'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 shrink-0" />
              <span>Chú giải</span>
            </button>

            <button
              onClick={() => setActiveStudyTab('parallel')}
              title="Bản dịch đối chiếu"
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeStudyTab === 'parallel'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Columns className="w-3.5 h-3.5 shrink-0" />
              <span>Đối chiếu</span>
            </button>

            <button
              onClick={() => setActiveStudyTab('map')}
              title="Địa danh 3D & Bản đồ"
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeStudyTab === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Địa danh</span>
            </button>

            <button
              onClick={() => setActiveStudyTab('video')}
              title="Video & Bài suy niệm liên kết"
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeStudyTab === 'video'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Video</span>
            </button>
          </div>

          {/* TAB CONTENT BODY */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[var(--border-card)]">
            
            {/* Selected Verse Active Alert Banner */}
            {selectedVerseNumber && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs animate-in fade-in">
                <span className="font-bold text-amber-800 dark:text-amber-400">
                  Đang chọn Câu {selectedVerseNumber}
                </span>
                <button 
                  onClick={() => setSelectedVerseNumber(null)}
                  className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                </button>
              </div>
            )}

            {/* TAB 1: CHÚ GIẢI */}
            {activeStudyTab === 'commentary' && (
              <div className="space-y-4 text-xs">
                {commentary?.historicalContext && (
                  <div className="bg-[var(--bg-main)]/60 rounded-2xl p-4 border border-[var(--border-card)]">
                    <h4 className="font-serif font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5 text-xs">
                      <Compass className="w-4 h-4" /> Bối Cảnh Lịch Sử
                    </h4>
                    <p className="leading-relaxed text-[var(--text-muted)]">{commentary.historicalContext}</p>
                  </div>
                )}

                {commentary?.theologicalMeaning && (
                  <div className="bg-[var(--bg-main)]/60 rounded-2xl p-4 border border-[var(--border-card)]">
                    <h4 className="font-serif font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5 text-xs">
                      <Shield className="w-4 h-4" /> Ý Nghĩa Thần Học
                    </h4>
                    <p className="leading-relaxed text-[var(--text-muted)]">{commentary.theologicalMeaning}</p>
                  </div>
                )}

                {commentary?.practicalApplication && (
                  <div className="bg-[var(--bg-main)]/60 rounded-2xl p-4 border border-[var(--border-card)]">
                    <h4 className="font-serif font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5 text-xs">
                      <Heart className="w-4 h-4" /> Bài Học Thực Hành
                    </h4>
                    <p className="leading-relaxed text-[var(--text-muted)]">{commentary.practicalApplication}</p>
                  </div>
                )}

                {(!commentary || !(commentary.historicalContext || commentary.theologicalMeaning || commentary.practicalApplication)) && (
                  <div className="text-center py-10 text-[var(--text-muted)] italic">
                    Chương này hiện chưa có tài liệu chú giải chuyên sâu.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ĐỐI CHIẾU BẢN DỊCH */}
            {activeStudyTab === 'parallel' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)] space-y-2">
                  <label className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                    Bản dịch so sánh:
                  </label>
                  <select
                    value={secondTranslationSlug}
                    onChange={(e) => setSecondTranslationSlug(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-2.5 py-1.5 font-bold focus:outline-none cursor-pointer"
                  >
                    {translations.map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {activeVerse ? (
                  <div className="p-4 bg-[var(--bg-main)] rounded-2xl border border-amber-500/30 space-y-3">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs">
                      Câu {activeVerse.verse} đối chiếu:
                    </span>

                    <div className="space-y-2">
                      <div className="p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)]">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-1">
                          {selectedTranslation.name}:
                        </span>
                        <div dangerouslySetInnerHTML={{ __html: activeVerse.content }} />
                      </div>

                      <div className="p-2.5 bg-[var(--bg-card)] rounded-xl border border-amber-500/20">
                        <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block mb-1">
                          {translations.find(t => t.slug === secondTranslationSlug)?.name}:
                        </span>
                        {activeSecondVerse ? (
                          <div dangerouslySetInnerHTML={{ __html: activeSecondVerse.content }} />
                        ) : (
                          <span className="italic text-[var(--text-muted)]">...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-muted)] italic">
                    Nhấp vào một câu ở Cột 2 để xem bản dịch đối chiếu trực tiếp tại đây.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ĐỊA DÀNH & BẢN ĐỒ 3D */}
            {activeStudyTab === 'map' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)] space-y-3">
                  <h4 className="font-serif font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Khám Phá Vùng Đất Thánh
                  </h4>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Xem bản đồ 3D các thành phố, sông ngòi và tuyến đường di chuyển trong sách {selectedBook.nameVi}.
                  </p>

                  <Link 
                    href="/ban-do" 
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-md text-xs"
                  >
                    <span>Mở Bản Đồ 3D Toàn Màn Hình</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 4: VIDEO & BÀI SUY NIỆM LIÊN KẾT */}
            {activeStudyTab === 'video' && (
              <div className="space-y-3 text-xs">
                {commentary?.videoUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-[var(--border-card)] bg-black shadow-lg">
                    <div className="relative pt-[56.25%] w-full">
                      <iframe
                        src={commentary.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-muted)] italic">
                    Video bối cảnh cho chương này đang được biên soạn.
                  </div>
                )}

                {/* Linked Library Articles Button */}
                <Link 
                  href="/thu-vien" 
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500 text-[var(--text-main)] font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Xem Bài Viết Thư Viện Liên Quan</span>
                </Link>
              </div>
            )}

          </div>
        </aside>

      </div>


      {/* ========================================================================= */}
      {/* 📱 MOBILE DRAWERS FOR NAVIGATION & STUDY                                  */}
      {/* ========================================================================= */}

      {/* Mobile Nav Drawer (Left) */}
      {showMobileNavDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm xl:hidden flex animate-in fade-in">
          <div className="w-4/5 max-w-xs bg-[var(--bg-card)] h-full p-4 flex flex-col border-r border-[var(--border-card)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] mb-3">
              <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Mục Lục Sách
              </h3>
              <button onClick={() => setShowMobileNavDrawer(false)} className="p-1 rounded-full bg-[var(--bg-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                {books.map(b => (
                  <button
                    key={b.slug}
                    onClick={() => {
                      setShowMobileNavDrawer(false);
                      handleNav(b.slug, 1, selectedTranslation.slug);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-between ${
                      selectedBook.slug === b.slug ? 'bg-amber-500 text-slate-950' : 'hover:bg-[var(--bg-main)]'
                    }`}
                  >
                    <span>{b.nameVi}</span>
                    <span className="text-[10px] font-sans opacity-70">{b.totalChapters} ch</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowMobileNavDrawer(false)}></div>
        </div>
      )}

      {/* Mobile Study Drawer (Right) */}
      {showMobileStudyDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex justify-end animate-in fade-in">
          <div className="flex-1" onClick={() => setShowMobileStudyDrawer(false)}></div>
          <div className="w-5/6 max-w-sm bg-[var(--bg-card)] h-full p-4 flex flex-col border-l border-[var(--border-card)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] mb-3">
              <h3 className="font-serif font-bold text-sm text-indigo-500 flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" /> Chú Giải & Phân Tích
              </h3>
              <button onClick={() => setShowMobileStudyDrawer(false)} className="p-1 rounded-full bg-[var(--bg-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              {commentary?.historicalContext && (
                <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-card)]">
                  <h4 className="font-bold text-amber-500 mb-1">Bối Cảnh Lịch Sử</h4>
                  <p className="text-[var(--text-muted)]">{commentary.historicalContext}</p>
                </div>
              )}
              {commentary?.theologicalMeaning && (
                <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-card)]">
                  <h4 className="font-bold text-indigo-500 mb-1">Ý Nghĩa Thần Học</h4>
                  <p className="text-[var(--text-muted)]">{commentary.theologicalMeaning}</p>
                </div>
              )}
              {commentary?.practicalApplication && (
                <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-card)]">
                  <h4 className="font-bold text-rose-500 mb-1">Bài Học Thực Hành</h4>
                  <p className="text-[var(--text-muted)]">{commentary.practicalApplication}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
