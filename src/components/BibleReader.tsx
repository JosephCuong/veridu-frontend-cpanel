'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BibleBook, BibleVerse, ChapterCommentary, BibleTranslation 
} from '@/lib/bible';
import { fetchBibleChapter, fetchBibleMetadata } from '@/lib/api';
import { BIBLE_LOCATIONS, BibleLocation } from '@/components/BibleMap';
import { supabase } from '@/lib/supabaseClient';
import AdBanner from '@/components/AdBanner';
import { 
  ChevronLeft, ChevronRight, ChevronDown, 
  Columns, MessageSquareText, Headphones, 
  X, Heart, Shield, Compass, PlayCircle, Settings2, BookOpen, Search, Menu, 
  MapPin, LayoutGrid, Type, ExternalLink, Scroll, Sparkles, Award, ArrowRight,
  PanelLeftClose, PanelLeftOpen, Bookmark, Check, BookMarked, Gamepad2, Layers
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

interface MultiTranslationVerse {
  translationSlug: string;
  translationName: string;
  verseText: string;
}

interface RelatedArticle {
  id: number | string;
  title: string;
  slug: string;
  category: string;
  featured_image?: string;
  created_at?: string;
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

  // Selected Book, Chapter, Translation
  const selectedBook = books.find((b) => b.slug === initialBookSlug) || books[0];
  const selectedTranslation = translations.find((t) => t.slug === initialTranslation) || translations[0];
  const currentChapter = initialChapter;

  // Selected Verse for Multi-Translation Contextual Study Pane
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<string | null>(null);
  const [multiTranslationVerses, setMultiTranslationVerses] = useState<MultiTranslationVerse[]>([]);
  const [isLoadingMultiVerses, setIsLoadingMultiVerses] = useState(false);

  // Column 1 Layout Dock Toggle (Left Nav with Auto-collapse)
  const [isNavDocked, setIsNavDocked] = useState(false);
  const [userToggledNav, setUserToggledNav] = useState(false);
  const [isHoveringNav, setIsHoveringNav] = useState(false);

  // Column 3 Study Pane Toggle & Tabs (Right Pane)
  const [isStudyPaneOpen, setIsStudyPaneOpen] = useState(false);
  const [activeStudyTab, setActiveStudyTab] = useState<'commentary' | 'parallel' | 'map' | 'video'>('commentary');

  // Related Articles in Right Sidebar
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  // Mobile Drawers
  const [showMobileNavDrawer, setShowMobileNavDrawer] = useState(false);

  // Text Customization
  const [fontSize, setFontSize] = useState<number>(19);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [lineHeight, setLineHeight] = useState<number>(1.85);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  // Dropdowns & Read Modes
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  const [readMode, setReadMode] = useState<'single' | 'parallel'>('single');
  const [parallelLayoutMode, setParallelLayoutMode] = useState<'side-by-side' | 'stacked'>('side-by-side');
  
  // Parallel Translation Selection (supports 1 or more secondary translations)
  const [selectedSecondaryTranslations, setSelectedSecondaryTranslations] = useState<string[]>([
    translations.length > 1 ? (translations.find(t => t.slug !== selectedTranslation.slug)?.slug || translations[1].slug) : translations[0].slug
  ]);
  const [parallelVersesMap, setParallelVersesMap] = useState<Record<string, BibleVerse[]>>({});
  const [isFetchingParallel, setIsFetchingParallel] = useState(false);

  // Search Filter in Left Navigation
  const [bookSearch, setBookSearch] = useState('');

  // ⏱️ Auto-collapse Left Sidebar after 3.5 seconds
  useEffect(() => {
    if (userToggledNav) return;

    const timer = setTimeout(() => {
      if (!isHoveringNav) {
        setIsNavDocked(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [initialBookSlug, initialChapter, userToggledNav, isHoveringNav]);

  // Fetch Related Library Articles for Right Sidebar
  useEffect(() => {
    let isMounted = true;
    setIsLoadingArticles(true);

    const fetchRelated = async () => {
      try {
        const bookKeyword = selectedBook.nameVi.replace(/^(Sách|Thư|Tin Mừng|Sấm ngôn)\s+/i, '').trim();
        
        // Search in Supabase posts for relevant tags/titles
        const { data } = await supabase
          .from('posts')
          .select('id, title, slug, category, featured_image, created_at')
          .eq('status', 'published')
          .or(`title.ilike.%${bookKeyword}%,category.ilike.%Kinh Thánh%,category.ilike.%Thần Học%`)
          .order('created_at', { ascending: false })
          .limit(3);

        if (isMounted) {
          if (data && data.length > 0) {
            setRelatedArticles(data);
          } else {
            // Fallback to recent articles
            const { data: fallbackData } = await supabase
              .from('posts')
              .select('id, title, slug, category, featured_image, created_at')
              .eq('status', 'published')
              .order('created_at', { ascending: false })
              .limit(3);
            if (fallbackData) setRelatedArticles(fallbackData);
          }
          setIsLoadingArticles(false);
        }
      } catch (e) {
        if (isMounted) setIsLoadingArticles(false);
      }
    };

    fetchRelated();
    return () => { isMounted = false; };
  }, [selectedBook.slug, selectedBook.nameVi]);

  // Fetch Parallel Verses whenever readMode is parallel or secondary translations change
  useEffect(() => {
    if (readMode === 'parallel' && selectedSecondaryTranslations.length > 0) {
      let isMounted = true;
      setIsFetchingParallel(true);

      Promise.all(
        selectedSecondaryTranslations.map(slug => 
          fetchBibleChapter(slug, selectedBook.slug, currentChapter)
            .then(res => ({ slug, verses: res?.verses || [] }))
            .catch(() => ({ slug, verses: [] }))
        )
      ).then(results => {
        if (isMounted) {
          const map: Record<string, BibleVerse[]> = {};
          results.forEach(r => {
            map[r.slug] = r.verses;
          });
          setParallelVersesMap(map);
          setIsFetchingParallel(false);
        }
      });

      return () => { isMounted = false; };
    }
  }, [readMode, selectedSecondaryTranslations, selectedBook.slug, currentChapter]);

  // Auto-switch layout: if 1 secondary translation -> default 'side-by-side', if 2+ -> default 'stacked'
  useEffect(() => {
    if (selectedSecondaryTranslations.length > 1) {
      setParallelLayoutMode('stacked');
    } else {
      setParallelLayoutMode('side-by-side');
    }
  }, [selectedSecondaryTranslations.length]);

  // Smart Detection of Holy Land Locations in Chapter
  const detectedLocations = useMemo(() => {
    if (!initialVerses || initialVerses.length === 0) return [];
    const fullText = initialVerses.map(v => v.content).join(' ');
    return BIBLE_LOCATIONS.filter(loc => {
      const keywords = [
        loc.nameVi.toLowerCase(),
        loc.nameEn.toLowerCase(),
        loc.nameVi.split('(')[0].trim().toLowerCase(),
        ...(loc.nameVi.includes('Giê-ru-sa-lem') ? ['giêrusalem', 'jerusalem', 'yerushalaim', 'giê-ru-sa-lem'] : []),
        ...(loc.nameVi.includes('Bê-lem') ? ['bêlem', 'bethlehem', 'bê-lem'] : []),
        ...(loc.nameVi.includes('Na-da-rét') ? ['nazarét', 'nazareth', 'na-da-rét', 'naxarét'] : []),
        ...(loc.nameVi.includes('Ga-li-lê') ? ['galilê', 'galilea', 'ga-li-lê'] : []),
        ...(loc.nameVi.includes('Si-nai') ? ['sinai', 'si-nai', 'si-na-i'] : []),
        ...(loc.nameVi.includes('Ai Cập') ? ['ai cập', 'egypt'] : []),
        ...(loc.nameVi.includes('Ba-by-lon') ? ['babylon', 'ba-by-lon'] : []),
        ...(loc.nameVi.includes('Rô-ma') ? ['roma', 'rô-ma', 'rome'] : [])
      ];
      return keywords.some(kw => kw.length > 2 && fullText.toLowerCase().includes(kw));
    });
  }, [initialVerses]);

  // Fetch verse in ALL available translations when a verse is clicked
  const handleVerseClick = async (verseNum: string) => {
    if (selectedVerseNumber === verseNum && isStudyPaneOpen && activeStudyTab === 'parallel') {
      setSelectedVerseNumber(null);
      return;
    }

    setSelectedVerseNumber(verseNum);
    setActiveStudyTab('parallel');
    setIsStudyPaneOpen(true);
    setIsLoadingMultiVerses(true);

    try {
      const { data: bookData } = await supabase
        .from('bible_books')
        .select('id')
        .eq('code', selectedBook.slug)
        .single();

      if (bookData?.id) {
        const { data: verseRows } = await supabase
          .from('bible_verses')
          .select('text, content, translation_id, bible_translations(name, slug)')
          .eq('book_id', bookData.id)
          .eq('chapter', currentChapter)
          .eq('verse', parseInt(verseNum, 10) || verseNum);

        if (verseRows && verseRows.length > 0) {
          const mapped: MultiTranslationVerse[] = verseRows.map((r: any) => ({
            translationSlug: r.bible_translations?.slug || 'unknown',
            translationName: r.bible_translations?.name || 'Bản Dịch',
            verseText: r.text || r.content || ''
          }));
          setMultiTranslationVerses(mapped);
        } else {
          const curVerse = initialVerses.find(v => String(v.verse) === String(verseNum));
          setMultiTranslationVerses([{
            translationSlug: selectedTranslation.slug,
            translationName: selectedTranslation.name,
            verseText: curVerse?.content || ''
          }]);
        }
      }
    } catch (e) {
      console.error('Error fetching multi-translation verses:', e);
    } finally {
      setIsLoadingMultiVerses(false);
    }
  };

  const handleNav = (slug: string, chapter: number, trans: string) => {
    setSelectedVerseNumber(null);
    setIsNavDocked(true);
    router.push(`/kinh-thanh/${slug}/${chapter}?t=${trans}`);
  };

  const openToolTab = (tab: 'commentary' | 'parallel' | 'map' | 'video') => {
    if (isStudyPaneOpen && activeStudyTab === tab) {
      setIsStudyPaneOpen(false);
    } else {
      setActiveStudyTab(tab);
      setIsStudyPaneOpen(true);
    }
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

  const showExpandedNav = !isNavDocked || isHoveringNav;

  return (
    <div className="w-full relative bg-[var(--bg-main)] text-[var(--text-main)] min-h-[85vh] font-sans pb-16">
      
      {/* ========================================================================= */}
      {/* 🌟 3-COLUMN FLEXIBLE WORKSPACE (COL 1 NAV - COL 2 READING - COL 3 SIDEBAR) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-4 xl:gap-6 items-start">

        {/* ----------------------------------------------------------------------- */}
        {/* 📌 CỘT 1: MENU ĐIỀU HƯỚNG SÁCH & CHƯƠNG (AUTO-COLLAPSIBLE LEFT SIDEBAR) */}
        {/* ----------------------------------------------------------------------- */}
        <aside 
          onMouseEnter={() => setIsHoveringNav(true)}
          onMouseLeave={() => setIsHoveringNav(false)}
          className={`hidden xl:flex flex-col transition-all duration-300 ${
            showExpandedNav ? 'col-span-3' : 'col-span-1 w-16'
          } bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 shadow-xl backdrop-blur-xl sticky top-28 max-h-[calc(100vh-8rem)] overflow-hidden z-20`}
        >
          
          {/* Header & Dock Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] shrink-0">
            {showExpandedNav && (
              <h3 className="font-serif font-bold text-xs tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Kinh Thánh ({books.length} Sách)</span>
              </h3>
            )}
            <button 
              onClick={() => {
                setIsNavDocked(!isNavDocked);
                setUserToggledNav(true);
              }}
              title={isNavDocked ? "Mở rộng danh sách Sách" : "Thu gọn cột trái để mở rộng không gian đọc"}
              className="p-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 border border-[var(--border-card)] transition-all mx-auto cursor-pointer"
            >
              {isNavDocked ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* DOCKED MODE (ICON BAR ONLY) */}
          {!showExpandedNav ? (
            <div className="py-4 space-y-2 flex flex-col items-center flex-1 overflow-y-auto scrollbar-none">
              {books.slice(0, 20).map((b) => (
                <button
                  key={b.slug}
                  onClick={() => handleNav(b.slug, 1, selectedTranslation.slug)}
                  title={`${b.nameVi} (${b.totalChapters} Chương)`}
                  className={`w-10 h-10 rounded-2xl font-serif text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${
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
                  placeholder="Tra cứu sách..." 
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
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between font-serif font-bold cursor-pointer ${
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
                                  className={`py-1 text-center font-sans font-bold rounded-lg text-[11px] transition-all cursor-pointer ${
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
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between font-serif font-bold cursor-pointer ${
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
                                  className={`py-1 text-center font-sans font-bold rounded-lg text-[11px] transition-all cursor-pointer ${
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
        {/* 📜 CỘT 2: KHÔNG GIAN ĐỌC KINH THÁNH CHÍNH (8/12 KHI CỘT TRÁI THU GỌN)    */}
        {/* ----------------------------------------------------------------------- */}
        <main className={`col-span-12 ${
          showExpandedNav ? 'xl:col-span-6' : 'xl:col-span-8'
        } space-y-4 transition-all duration-300`}>
          
          {/* Card Khung Đọc Chính */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative min-h-[80vh]">
            
            {/* 🌟 THANH ĐIỀU HƯỚNG TÍCH HỢP GỌN GÀNG Ở ĐẦU BÀI */}
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-card)]/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 backdrop-blur-md">
              
              {/* Left: Mobile Nav Drawer Button & Book Name Pill Badges */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowMobileNavDrawer(true)}
                  className="xl:hidden p-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-amber-500 hover:bg-amber-500/10 transition-colors"
                  aria-label="Mục lục Sách"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/25 shadow-xs flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {selectedBook.nameVi}
                  </span>
                  
                  {/* Chapter Selector Dropdown Pill */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsChapterMenuOpen(!isChapterMenuOpen)}
                      className="px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Chương {currentChapter}</span>
                      <ChevronDown className="w-3 h-3 opacity-70" />
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
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

              {/* Right: Integrated Compact Action Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                
                {/* 🔀 Song Song Button */}
                <button
                  onClick={() => setReadMode(readMode === 'single' ? 'parallel' : 'single')}
                  title="Bật/Tắt Đọc Song Song các bản dịch"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs cursor-pointer ${
                    readMode === 'parallel'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-[var(--bg-main)] hover:bg-amber-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Song Song</span>
                </button>

                {/* 📖 Chú Giải Button */}
                <button
                  onClick={() => openToolTab('commentary')}
                  title="Mở Chú Giải Thần Học theo Chương"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs cursor-pointer ${
                    isStudyPaneOpen && activeStudyTab === 'commentary'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-[var(--bg-main)] hover:bg-amber-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Chú Giải</span>
                </button>

                {/* 🗺️ Địa Danh Button */}
                <button
                  onClick={() => openToolTab('map')}
                  title="Xem Bản Đồ Địa Danh Thánh Địa trong chương này"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs cursor-pointer ${
                    isStudyPaneOpen && activeStudyTab === 'map'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                      : 'bg-[var(--bg-main)] hover:bg-emerald-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Địa Danh</span>
                  {detectedLocations.length > 0 && (
                    <span className="bg-emerald-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                      {detectedLocations.length}
                    </span>
                  )}
                </button>

                {/* 🎨 Font Customization Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    title="Tùy chỉnh cỡ chữ & phông chữ"
                    className="p-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] transition-all cursor-pointer"
                  >
                    <Type className="w-4 h-4 text-amber-500" />
                  </button>

                  {showSettingsMenu && (
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

              </div>
            </div>

            {/* Audio Player Row */}
            {showAudioPlayer && commentary?.audioUrl && (
              <div className="px-6 py-3 bg-amber-500/10 border-b border-[var(--border-card)] flex items-center gap-3 animate-in fade-in">
                <Headphones className="w-5 h-5 text-amber-500 shrink-0" />
                <audio controls className="w-full h-8 outline-none" autoPlay={false}>
                  <source src={commentary.audioUrl} type="audio/mpeg" />
                  Trình duyệt không hỗ trợ audio.
                </audio>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                READING PANE BODY CONTENT
               ════════════════════════════════════════════════════════════════ */}
            <div className="p-6 sm:p-10 md:p-12 max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-start">
              
              {/* Header Title */}
              <div className="text-center mb-8 border-b border-[var(--border-card)] pb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight mb-2">
                  {selectedBook.nameVi}
                </h1>
                <h2 className="text-lg sm:text-xl text-amber-600 dark:text-amber-400 font-serif italic">Chương {currentChapter}</h2>
                <div className="mt-2 text-xs text-[var(--text-muted)] font-serif">
                  Bản dịch chính: <span className="font-bold text-[var(--text-main)]">{selectedTranslation.name.replace(/^Bản dịch\s+/i, '')}</span>
                </div>
              </div>

              {/* 🔀 PARALLEL MODE TRANSLATION CONTROL BAR & LAYOUT SWITCHER */}
              {readMode === 'parallel' && (
                <div className="mb-8 p-4 bg-[var(--bg-main)] border border-amber-500/30 rounded-3xl space-y-3 animate-in fade-in shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Left: Secondary Translations Selector */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Columns className="w-4 h-4 text-amber-500" />
                        <span>Đối Chiếu Với:</span>
                      </span>

                      {translations.filter(t => t.slug !== selectedTranslation.slug).map(t => {
                        const isChecked = selectedSecondaryTranslations.includes(t.slug);
                        return (
                          <button
                            key={t.slug}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                if (selectedSecondaryTranslations.length > 1) {
                                  setSelectedSecondaryTranslations(prev => prev.filter(s => s !== t.slug));
                                }
                              } else {
                                setSelectedSecondaryTranslations(prev => [...prev, t.slug]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-serif transition-all cursor-pointer flex items-center gap-1 ${
                              isChecked
                                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
                                : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            <span>{t.name.replace(/^Bản dịch\s+/i, '')}</span>
                            {isChecked && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right: Layout Mode Toggle (2 Cột Đối Chiếu vs Xếp Dòng Dưới) */}
                    <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-card)] p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setParallelLayoutMode('side-by-side')}
                        className={`px-3 py-1 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                          parallelLayoutMode === 'side-by-side'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                        title="Chia 2 cột song song cạnh nhau"
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>2 Cột Đối Chiếu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setParallelLayoutMode('stacked')}
                        className={`px-3 py-1 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${
                          parallelLayoutMode === 'stacked'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                        title="Xếp dòng các bản dịch bên dưới mỗi câu"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Xếp Dòng Dưới</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

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
                    const isSelected = String(selectedVerseNumber) === String(verse.verse);

                    return (
                      <div key={verse.id} className="group/verse relative">
                        {verse.heading && (
                          <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-800 dark:text-amber-400 mt-10 mb-5 border-b border-[var(--border-card)] pb-2">
                            {verse.heading}
                          </h3>
                        )}

                        {/* ── CASE 1: PARALLEL MODE - SIDE-BY-SIDE 2 COLUMNS ── */}
                        {readMode === 'parallel' && parallelLayoutMode === 'side-by-side' && selectedSecondaryTranslations.length === 1 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 -mx-3 rounded-2xl border-b border-[var(--border-card)]/40 hover:bg-[var(--bg-main)]/50 transition">
                            
                            {/* Left Column: Primary Translation */}
                            <div 
                              onClick={() => handleVerseClick(String(verse.verse))}
                              className="flex gap-2.5 items-start cursor-pointer"
                            >
                              <sup className="text-xs font-bold text-amber-600 dark:text-amber-400 select-none shrink-0 mt-1 font-sans">
                                {verse.verse}
                              </sup>
                              <div className="flex-1 space-y-1">
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block font-sans opacity-70">
                                  {selectedTranslation.name.replace(/^Bản dịch\s+/i, '')}
                                </span>
                                <p className="text-[var(--text-main)] leading-relaxed">{verse.content}</p>
                              </div>
                            </div>

                            {/* Right Column: Secondary Translation */}
                            <div className="flex gap-2.5 items-start border-l border-[var(--border-card)]/60 pl-4">
                              {(() => {
                                const secSlug = selectedSecondaryTranslations[0];
                                const secVerse = (parallelVersesMap[secSlug] || []).find(v => String(v.verse) === String(verse.verse));
                                const secTransName = translations.find(t => t.slug === secSlug)?.name || 'Bản dịch 2';
                                return (
                                  <div className="flex-1 space-y-1">
                                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block font-sans opacity-70">
                                      {secTransName.replace(/^Bản dịch\s+/i, '')}
                                    </span>
                                    <p className="text-[var(--text-muted)] leading-relaxed italic">
                                      {secVerse ? secVerse.content : '...'}
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>

                          </div>
                        ) : readMode === 'parallel' ? (
                          /* ── CASE 2: PARALLEL MODE - STACKED ROWS ── */
                          <div 
                            onClick={() => handleVerseClick(String(verse.verse))}
                            className={`p-3.5 -mx-3 rounded-2xl transition-all cursor-pointer border-b border-[var(--border-card)]/40 ${
                              isSelected ? 'bg-amber-500/10 border-amber-500/40 shadow-inner' : 'hover:bg-[var(--bg-main)]/60'
                            }`}
                          >
                            <div className="flex gap-3 items-start">
                              <sup className="text-xs font-bold text-amber-600 dark:text-amber-400 select-none shrink-0 mt-1 font-sans">
                                {verse.verse}
                              </sup>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block font-sans mb-0.5">
                                    {selectedTranslation.name}:
                                  </span>
                                  <p className="text-[var(--text-main)] leading-relaxed">{verse.content}</p>
                                </div>

                                {selectedSecondaryTranslations.map(secSlug => {
                                  const secVerse = (parallelVersesMap[secSlug] || []).find(v => String(v.verse) === String(verse.verse));
                                  const secTransName = translations.find(t => t.slug === secSlug)?.name || secSlug;
                                  return (
                                    <div key={secSlug} className="pl-3 border-l-2 border-indigo-500/40 text-[0.92em] space-y-0.5">
                                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block font-sans">
                                        {secTransName}:
                                      </span>
                                      <p className="text-[var(--text-muted)] italic leading-relaxed">
                                        {secVerse ? secVerse.content : '...'}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── CASE 3: STANDARD SINGLE TRANSLATION READING ── */
                          <div 
                            onClick={() => handleVerseClick(String(verse.verse))}
                            title="Nhấp để xem đối chiếu tất cả bản dịch của câu này ở Cột 3"
                            className={`flex gap-3 items-start p-3 -mx-3 rounded-2xl transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/15 border border-amber-500/40 shadow-inner' 
                                : 'hover:bg-[var(--bg-main)]/60'
                            }`}
                          >
                            <sup className="text-xs font-bold text-amber-600 dark:text-amber-400 select-none shrink-0 mt-1 font-sans">
                              {verse.verse}
                            </sup>
                            <p className="text-[var(--text-main)] leading-relaxed flex-1">
                              {verse.content}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prev / Next Chapter Navigation Buttons */}
              <div className="flex items-center justify-between pt-10 mt-12 border-t border-[var(--border-card)]">
                {hasPrevChapter ? (
                  <button
                    onClick={() => handleNav(selectedBook.slug, currentChapter - 1, selectedTranslation.slug)}
                    className="px-5 py-2.5 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500 hover:text-slate-950 border border-[var(--border-card)] text-xs font-serif font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Chương {currentChapter - 1}</span>
                  </button>
                ) : <div />}

                <span className="text-xs font-serif text-[var(--text-muted)]">
                  Chương {currentChapter} / {selectedBook.totalChapters}
                </span>

                {hasNextChapter ? (
                  <button
                    onClick={() => handleNav(selectedBook.slug, currentChapter + 1, selectedTranslation.slug)}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-500 text-xs font-serif font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <span>Chương {currentChapter + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : <div />}
              </div>

            </div>

            {/* In-Feed Native Free Ad Space / Banner Tài Trợ Cuối Bài Đọc */}
            <div className="p-6 sm:p-10 border-t border-[var(--border-card)]/50">
              <AdBanner
                slotId="kinh-thanh-infeed"
                format="horizontal"
                customTitle="Bản Đồ 3D Thánh Địa Kinh Thánh VERIDU"
                customSubtitle="Theo dấu hành trình đức tin của các Tổ Phụ, Xuất Hành và các cuộc du hành truyền giáo của Thánh Phaolô."
                customLink="/ban-do"
              />
            </div>

          </div>
        </main>


        {/* ----------------------------------------------------------------------- */}
        {/* 🔬 CỘT 3: CỘT PHẢI TINH GỌN (BÀI VIẾT LIÊN QUAN + QUẢNG CÁO + LỐI TẮT)   */}
        {/* ----------------------------------------------------------------------- */}
        <aside className={`col-span-12 ${
          showExpandedNav ? 'xl:col-span-3' : 'xl:col-span-3'
        } space-y-5 transition-all duration-300 lg:sticky lg:top-28`}>
          
          {/* STATE A: ACTIVE DEEP STUDY PANE (KHI BẤM XEM CHÚ GIẢI / ĐỐI CHIẾU / ĐỊA DANH) */}
          {isStudyPaneOpen ? (
            <div className="bg-[var(--bg-card)] border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in">
              {/* Header & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] mb-3">
                <span className="font-serif font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Không Gian Phân Tích</span>
                </span>
                <button 
                  onClick={() => setIsStudyPaneOpen(false)}
                  className="p-1 rounded-full bg-[var(--bg-main)] hover:bg-[var(--border-card)] transition-colors text-[var(--text-muted)] cursor-pointer"
                  title="Đóng Cột Phân Tích"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compact Tabs Bar Header */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl shrink-0 mb-4 text-[11px] font-bold">
                <button
                  onClick={() => setActiveStudyTab('commentary')}
                  title="Chú giải Thần học theo Chương"
                  className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                  title="Đối chiếu tất cả bản dịch"
                  className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                  title="Địa danh 3D Kinh Thánh"
                  className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                  title="Video & Suy niệm"
                  className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
              <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[var(--border-card)] max-h-[calc(100vh-16rem)]">
                
                {/* TAB 1: CHÚ GIẢI THEO CHƯƠNG */}
                {activeStudyTab === 'commentary' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-[11px] font-bold text-[var(--text-muted)] border-b border-[var(--border-card)] pb-2 uppercase tracking-wider">
                      Chú Giải Thần Học: {selectedBook.nameVi} - Chương {currentChapter}
                    </div>

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
                        Chương này hiện chưa có bài viết chú giải thần học.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ĐỐI CHIẾU CÂU TRÊN TẤT CẢ BẢN DỊCH */}
                {activeStudyTab === 'parallel' && (
                  <div className="space-y-3 text-xs">
                    {selectedVerseNumber ? (
                      <div className="space-y-3">
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between">
                          <span className="font-bold text-amber-800 dark:text-amber-400">
                            Đối Chiếu Câu {selectedVerseNumber} ({multiTranslationVerses.length} bản dịch)
                          </span>
                          <button 
                            onClick={() => setSelectedVerseNumber(null)}
                            className="p-1 hover:bg-amber-500/20 rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                          </button>
                        </div>

                        {isLoadingMultiVerses ? (
                          <div className="py-8 text-center text-[var(--text-muted)] animate-pulse">
                            Đang tải tất cả bản dịch...
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {multiTranslationVerses.map((item, idx) => (
                              <div key={idx} className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)] space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                                  {item.translationName}
                                </span>
                                <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: item.verseText }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-[var(--text-muted)] italic space-y-2">
                        <Columns className="w-8 h-8 mx-auto opacity-30" />
                        <p>Nhấp vào một câu Kinh Thánh ở Cột giữa để xem câu đó đồng thời trên tất cả các bản dịch hiện có!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ĐỊA DANH 3D */}
                {activeStudyTab === 'map' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-b border-[var(--border-card)] pb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Địa Danh Trong Chương
                      </span>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px]">
                        {detectedLocations.length} địa danh
                      </span>
                    </div>

                    {detectedLocations.length > 0 ? (
                      <div className="space-y-3">
                        {detectedLocations.map((loc) => (
                          <div key={loc.id} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all">
                            {loc.imageUrl && (
                              <div className="relative w-full h-24">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={loc.imageUrl} alt={loc.nameVi} className="w-full h-full object-cover" />
                                <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  {loc.era}
                                </span>
                              </div>
                            )}
                            <div className="p-3 space-y-2">
                              <h5 className="font-serif font-bold text-sm text-[var(--text-main)]">{loc.nameVi}</h5>
                              <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">{loc.description}</p>
                              
                              <Link 
                                href="/ban-do"
                                className="w-full py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 text-[11px] hover:bg-emerald-500 transition-colors shadow-sm"
                              >
                                <span>Khám Phá Bản Đồ 3D</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)] space-y-3 text-center">
                        <MapPin className="w-8 h-8 mx-auto text-emerald-500 opacity-40" />
                        <p className="text-[var(--text-muted)] leading-relaxed">
                          Không phát hiện tên địa danh nổi bật nào trong chương này.
                        </p>
                        <Link 
                          href="/ban-do" 
                          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-md"
                        >
                          <span>Mở Bản Đồ 3D Toàn Màn Hình</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: VIDEO */}
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
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════
                STATE B: REFINED COMPANION SIDEBAR (3 ESSENTIAL BLOCKS)
               ════════════════════════════════════════════════════════════════ */
            <div className="space-y-5">
              
              {/* KHỐI 1: BÀI VIẾT KHẢO CỨU & SUY NIỆM LIÊN QUAN */}
              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-[var(--border-card)]/60 pb-2">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-amber-500" />
                    <span>Bài Viết &amp; Khảo Cứu Liên Quan</span>
                  </h4>
                  <Link href="/thu-vien" className="text-[10px] font-serif text-[var(--text-muted)] hover:text-amber-500 transition-colors">
                    Xem tất cả ›
                  </Link>
                </div>

                {isLoadingArticles ? (
                  <div className="space-y-2.5 py-2 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 rounded-2xl bg-[var(--bg-main)]" />
                    ))}
                  </div>
                ) : relatedArticles.length > 0 ? (
                  <div className="space-y-2.5">
                    {relatedArticles.map((art) => (
                      <Link
                        key={art.id}
                        href={`/thu-vien/${art.slug}`}
                        className="group flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--bg-main)]/60 hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition-all"
                      >
                        {art.featured_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={art.featured_image} 
                            alt={art.title} 
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-card)]" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase block truncate">
                            {art.category || 'Khảo Cứu'}
                          </span>
                          <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h5>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] font-serif italic py-2">
                    Chưa có bài viết liên kết trực tiếp.
                  </p>
                )}
              </div>

              {/* KHỐI 2: KHÔNG GIAN MỤC VỤ & GOOGLE ADSENSE TỰ NHIÊN */}
              <AdBanner
                slotId="kinh-thanh-sidebar"
                format="rectangle"
                customTitle="Tủ Sách Điện Tử & Học Liệu VERIDU"
                customSubtitle="Khám phá hàng trăm đầu sách Thần học, Giáo luật và Slide giáo án PDF miễn phí."
                customLink="/thu-vien/sach"
              />

              {/* KHỐI 3: CỔNG KẾT NỐI HỆ THỐNG TINH GỌN (SÁCH TRANH, QUIZ, WEBGAME) */}
              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Khám Phá Hệ Thống VERIDU</span>
                </h4>

                <div className="space-y-2">
                  {/* Sách Tranh */}
                  <Link
                    href="/sach-tranh"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Sách Tranh Kinh Thánh
                      </h5>
                      <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Minh họa sống động cho thiếu nhi & gia đình</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Đấu Trường Quiz */}
                  <Link
                    href="/quiz"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        Đấu Trường Quiz Kinh Thánh
                      </h5>
                      <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Trắc nghiệm kiến thức thời gian thực</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Game Hành Trình Đất Hứa */}
                  <Link
                    href="/game"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-emerald-500/10 border border-[var(--border-card)] hover:border-emerald-500/40 transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        WebGame Giáo Dục Đức Tin
                      </h5>
                      <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Hành Trình Về Đất Hứa &amp; Triệu Phú Đức Tin</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          )}

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE DRAWERS FOR NAVIGATION                                         */}
      {/* ========================================================================= */}
      {showMobileNavDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm xl:hidden flex animate-in fade-in">
          <div className="w-4/5 max-w-xs bg-[var(--bg-card)] h-full p-4 flex flex-col border-r border-[var(--border-card)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] mb-3">
              <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Mục Lục Kinh Thánh
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

    </div>
  );
}
