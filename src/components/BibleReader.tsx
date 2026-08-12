'use client';

import React, { useState, useEffect } from 'react';
import { 
  BibleBook, BibleVerse, ChapterCommentary, BibleTranslation 
} from '@/lib/bible';
import { fetchBibleChapter } from '@/lib/api';
import { BIBLE_LOCATIONS, BibleLocation } from '@/components/BibleMap';
import { supabase } from '@/lib/supabaseClient';
import { 
  ChevronLeft, ChevronRight, ChevronDown, 
  Columns, MessageSquareText, Headphones, 
  X, Heart, Shield, Compass, PlayCircle, Settings2, BookOpen, Search, Menu, 
  MapPin, LayoutGrid, Type, ExternalLink, Sparkles
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

  // Column 1 Layout Dock Toggle (Left Nav)
  const [isNavDocked, setIsNavDocked] = useState(false);

  // Column 3 Study Pane Toggle & Tabs (Right Pane)
  // MẶC ĐỊNH ẨN CỘT 3 THEO YÊU CẦU CỦA USER
  const [isStudyPaneOpen, setIsStudyPaneOpen] = useState(false);
  const [activeStudyTab, setActiveStudyTab] = useState<'commentary' | 'parallel' | 'map' | 'video'>('commentary');

  // Mobile Drawers
  const [showMobileNavDrawer, setShowMobileNavDrawer] = useState(false);

  // Text Customization
  const [fontSize, setFontSize] = useState<number>(19);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [lineHeight, setLineHeight] = useState<number>(1.85);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  // Search Filter in Left Navigation
  const [bookSearch, setBookSearch] = useState('');

  // Smart Detection of Holy Land Locations in Chapter
  const [detectedLocations, setDetectedLocations] = useState<BibleLocation[]>([]);

  useEffect(() => {
    if (initialVerses && initialVerses.length > 0) {
      const fullText = initialVerses.map(v => v.content).join(' ');
      const matches = BIBLE_LOCATIONS.filter(loc => {
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
      setDetectedLocations(matches);
    } else {
      setDetectedLocations([]);
    }
  }, [initialVerses]);

  // Fetch verse in ALL available translations when a verse is clicked
  const handleVerseClick = async (verseNum: string) => {
    if (selectedVerseNumber === verseNum && isStudyPaneOpen && activeStudyTab === 'parallel') {
      // Toggle off
      setSelectedVerseNumber(null);
      return;
    }

    setSelectedVerseNumber(verseNum);
    setActiveStudyTab('parallel');
    setIsStudyPaneOpen(true);
    setIsLoadingMultiVerses(true);

    try {
      // Query Supabase for all verses matching book code, chapter, and verse number
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
          // Fallback to initial verse content
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

  const activeVerseObj = selectedVerseNumber ? initialVerses.find(v => String(v.verse) === String(selectedVerseNumber)) : null;

  return (
    <div className="w-full relative bg-[var(--bg-main)] text-[var(--text-main)] min-h-[85vh] font-sans pb-16">
      
      {/* ========================================================================= */}
      {/* 🌟 FLEXIBLE WORKSPACE GRID (COL 1 NAV - COL 2 READING - COL 3 STUDY)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-4 xl:gap-6 items-start">

        {/* ----------------------------------------------------------------------- */}
        {/* 📌 CỘT 1: MENU ĐIỀU HƯỚNG SÁCH & CHƯƠNG (BÊN TRÁI)                      */}
        {/* ----------------------------------------------------------------------- */}
        <aside className={`hidden xl:flex flex-col transition-all duration-300 ${
          isNavDocked ? 'col-span-1 w-16' : 'col-span-3'
        } bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 shadow-xl backdrop-blur-xl sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden`}>
          
          {/* Header & Dock Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] shrink-0">
            {!isNavDocked && (
              <h3 className="font-serif font-bold text-xs tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Kinh Thánh ({books.length} Sách)</span>
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
            <div className="py-4 space-y-2 flex flex-col items-center flex-1 overflow-y-auto scrollbar-none">
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
        {/* 📜 CỘT 2: KHÔNG GIAN ĐỌC CHÍNH (TỰ ĐỘNG MỞ RỘNG KHI CỘT 3 ẨN)          */}
        {/* ----------------------------------------------------------------------- */}
        <main className={`col-span-12 ${
          isStudyPaneOpen 
            ? (isNavDocked ? 'xl:col-span-8 lg:col-span-8' : 'xl:col-span-6 lg:col-span-8')
            : (isNavDocked ? 'xl:col-span-11 lg:col-span-12' : 'xl:col-span-9 lg:col-span-12')
        } space-y-4 transition-all duration-300`}>
          
          {/* Card Khung Đọc Chính */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative min-h-[80vh]">
            
            {/* 🌟 THANH ĐIỀU HƯỚNG TÍCH HỢP GỌN GÀNG Ở ĐẦU BÀI (NO OVERLAPPING TOOLBAR) */}
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-card)]/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 backdrop-blur-md">
              
              {/* Left: Mobile Nav Drawer Button & Book Name */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowMobileNavDrawer(true)}
                  className="xl:hidden p-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-amber-500 hover:bg-amber-500/10 transition-colors"
                  aria-label="Mục lục Sách"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)] flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400">{selectedBook.nameVi}</span>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-xs sm:text-sm font-sans">Chương {currentChapter}</span>
                </div>
              </div>

              {/* Right: Integrated Compact Action Buttons for Column 3 Tabs */}
              <div className="flex items-center gap-1.5 text-xs">
                
                {/* 💬 Chú Giải Button */}
                <button
                  onClick={() => openToolTab('commentary')}
                  title="Xem Chú Giải Thần Học theo Chương"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs ${
                    isStudyPaneOpen && activeStudyTab === 'commentary'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-[var(--bg-main)] hover:bg-amber-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Chú Giải</span>
                </button>

                {/* 📑 Đối Chiếu Button */}
                <button
                  onClick={() => openToolTab('parallel')}
                  title="Đối Chiếu Các Bản Dịch"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs ${
                    isStudyPaneOpen && activeStudyTab === 'parallel'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-[var(--bg-main)] hover:bg-amber-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Đối Chiếu</span>
                </button>

                {/* 🗺️ Địa Danh Button */}
                <button
                  onClick={() => openToolTab('map')}
                  title="Địa Danh Kinh Thánh trong Chương"
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs ${
                    isStudyPaneOpen && activeStudyTab === 'map'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
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

                {/* 🎬 Video Button */}
                {commentary?.videoUrl && (
                  <button
                    onClick={() => openToolTab('video')}
                    title="Xem Video Bối Cảnh"
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 border text-[11px] sm:text-xs ${
                      isStudyPaneOpen && activeStudyTab === 'video'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md font-black'
                        : 'bg-[var(--bg-main)] hover:bg-rose-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Video</span>
                  </button>
                )}

                {/* 🎧 Audio Button */}
                {commentary?.audioUrl && (
                  <button
                    onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                    title="Bật/Tắt Nghe Audio"
                    className={`p-1.5 rounded-xl border transition-all ${
                      showAudioPlayer 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                        : 'bg-[var(--bg-main)] hover:bg-amber-500/10 border-[var(--border-card)] text-[var(--text-main)]'
                    }`}
                  >
                    <Headphones className="w-4 h-4 text-amber-500" />
                  </button>
                )}

                {/* 🎨 Font Customization Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    title="Tùy chỉnh cỡ chữ & phông chữ"
                    className="p-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] transition-all"
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


            {/* READING PANE BODY CONTENT */}
            <div className="p-6 sm:p-10 md:p-12">
              
              {/* Header Title */}
              <div className="text-center mb-10 border-b border-[var(--border-card)] pb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight mb-2">
                  {selectedBook.nameVi}
                </h1>
                <h2 className="text-lg sm:text-xl text-amber-600 dark:text-amber-400 font-serif italic">Chương {currentChapter}</h2>
                <div className="mt-2 text-xs text-[var(--text-muted)]">
                  Bản dịch: <span className="font-bold text-[var(--text-main)]">{selectedTranslation.name}</span>
                </div>
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
                    const isSelected = String(selectedVerseNumber) === String(verse.verse);

                    return (
                      <div key={verse.id} className="group/verse relative">
                        {verse.heading && (
                          <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-800 dark:text-amber-400 mt-10 mb-5 border-b border-[var(--border-card)] pb-2">
                            {verse.heading}
                          </h3>
                        )}

                        <div 
                          onClick={() => handleVerseClick(String(verse.verse))}
                          title="Nhấp để xem đối chiếu tất cả bản dịch của câu này ở Cột 3"
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

                          <div className="flex-1 w-full relative">
                            <div dangerouslySetInnerHTML={{ __html: verse.content }} />
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
        {/* 🔬 CỘT 3: KHÔNG GIAN PHÂN TÍCH & CHÚ GIẢI (MẶC ĐỊNH ẨN TỰ ĐỘNG TRƯỢT RA) */}
        {/* ----------------------------------------------------------------------- */}
        {isStudyPaneOpen && (
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 shadow-2xl backdrop-blur-xl sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Header & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] mb-3">
              <span className="font-serif font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Không Gian Phân Tích</span>
              </span>
              <button 
                onClick={() => setIsStudyPaneOpen(false)}
                className="p-1 rounded-full bg-[var(--bg-main)] hover:bg-[var(--border-card)] transition-colors text-[var(--text-muted)]"
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
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
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
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
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
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
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
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
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
            <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[var(--border-card)] max-h-[calc(100vh-12rem)]">
              
              {/* TAB 1: CHÚ GIẢI THEO CHƯƠNG (AS REQUESTED BY USER) */}
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

              {/* TAB 2: ĐỐI CHIẾU CÂU TRÊN TẤT CẢ BẢN DỊCH HIỆN CÓ (MULTI-TRANSLATION) */}
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
                          className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
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
                      <p>Nhấp vào một câu Kinh Thánh ở Cột 2 để xem câu đó đồng thời trên tất cả các bản dịch hiện có!</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ĐỊA DÀNH 3D MÓC NỐI TỰ ĐỘNG (SMART LOCATION DETECTION) */}
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
                        Không phát hiện tên địa danh nổi bật nào trong chương này. Bạn có thể mở Bản đồ 3D để khám phá Vùng Đất Thánh!
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
        )}

      </div>


      {/* ========================================================================= */}
      {/* 📱 MOBILE DRAWERS FOR NAVIGATION                                         */}
      {/* ========================================================================= */}

      {/* Mobile Nav Drawer (Left) */}
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
