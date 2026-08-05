'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BibleBook, BibleVerse, ChapterCommentary, BibleTranslation
} from '@/lib/bible';
import { fetchBibleChapter } from '@/lib/api';
import { 
  ChevronLeft, ChevronRight, ChevronDown, 
  Columns, MessageSquareText, Headphones, 
  X, Heart, Shield, Compass, PlayCircle, Settings2, BookOpen, Search, Menu, MoreVertical
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
  const selectedBook = books.find((b) => b.slug === initialBookSlug) || books[0];
  const selectedTranslation = translations.find((t) => t.slug === initialTranslation) || translations[0];
  const currentChapter = initialChapter;
  
  // Feature Toggles
  const [readMode, setReadMode] = useState<'single' | 'parallel'>('single');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  
  // Mobile Options Menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Second Translation State
  const [secondTranslationSlug, setSecondTranslationSlug] = useState<string>(
    translations.length > 1 ? translations[1].slug : translations[0].slug
  );
  const [secondVerses, setSecondVerses] = useState<BibleVerse[]>([]);
  const [isFetchingSecond, setIsFetchingSecond] = useState(false);

  // Font Controls
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  
  // Book Search in Grid
  const [bookSearch, setBookSearch] = useState('');

  // Auto-hide toolbar on scroll down
  const [showToolbar, setShowToolbar] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowToolbar(false);
      } else {
        setShowToolbar(true);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch second translation verses if parallel mode is active
  useEffect(() => {
    if (readMode === 'parallel') {
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
  }, [readMode, secondTranslationSlug, selectedBook.slug, currentChapter]);

  const handleNav = (slug: string, chapter: number, trans: string) => {
     router.push(`/doc-kinh-thanh/${slug}/${chapter}?t=${trans}`);
  };

  const hasNextChapter = currentChapter < (selectedBook?.totalChapters || 1);
  const hasPrevChapter = currentChapter > 1;

  const filteredBooks = books.filter(b => 
    b.nameVi?.toLowerCase().includes(bookSearch.toLowerCase()) || 
    b.slug.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const otBooks = filteredBooks.filter(b => b.testament === 'Cựu Ước');
  const ntBooks = filteredBooks.filter(b => b.testament === 'Tân Ước');

  return (
    <div className="w-full relative pb-32 bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen font-sans">
      
      {/* 🌟 1. SMART STICKY TOOLBAR (GLASSMORPHISM) */}
      <div className={`sticky top-4 z-40 transition-all duration-500 ease-in-out ${
        showToolbar ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0 pointer-events-none'
      } ${isScrolled ? 'shadow-xl' : 'shadow-2xl'}`}>
        <div className="mx-auto max-w-6xl p-2 md:p-3 bg-[var(--header-bg)]/70 border border-[var(--border-card)] rounded-full backdrop-blur-2xl flex items-center justify-between shadow-2xl shadow-[var(--bg-card)]/10">
          
          {/* Left: Navigation Breadcrumb & Book Selector */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsGridMenuOpen(true)}
              className="flex items-center gap-2 bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 hover:border-[var(--accent-gold)]/40 rounded-xl px-4 py-2 transition-all"
            >
              <Menu className="w-4 h-4" />
              <span className="font-serif font-bold truncate max-w-[120px] sm:max-w-none">{selectedBook.nameVi}</span>
            </button>
            <span className="text-[var(--text-muted)] font-bold">/</span>
            <div className="relative">
              <button 
                onClick={() => setIsChapterMenuOpen(!isChapterMenuOpen)}
                className="font-serif font-bold bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--accent-gold)]/50 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <span>Chương {currentChapter}</span>
                <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
              </button>
              {isChapterMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsChapterMenuOpen(false)}></div>
                  <div className="absolute left-0 top-full mt-2 p-3 w-64 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-card)]">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: selectedBook.totalChapters || 1 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setIsChapterMenuOpen(false);
                            handleNav(selectedBook.slug, i + 1, selectedTranslation.slug);
                          }}
                          className={`p-2 rounded-lg text-sm font-bold transition-all ${
                            currentChapter === i + 1
                              ? 'bg-[var(--accent-gold)] text-white'
                              : 'bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-main)]'
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

          {/* Desktop Toolbar Options */}
          <div className="hidden md:flex items-center justify-center gap-3">
            
            <select
              value={selectedTranslation?.slug}
              onChange={(e) => handleNav(selectedBook.slug, currentChapter, e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--accent-gold)]/50 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none transition-all cursor-pointer"
            >
              {translations.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>

            <button
              onClick={() => setReadMode(readMode === 'single' ? 'parallel' : 'single')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                readMode === 'parallel'
                  ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)] shadow-lg'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--accent-gold)]/10 border-[var(--border-card)] text-[var(--text-main)]'
              }`}
            >
              <Columns className="w-4 h-4" /> Đối Chiếu
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                showSidebar
                  ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)] shadow-lg'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--accent-gold)]/10 border-[var(--border-card)] text-[var(--text-main)]'
              }`}
            >
              <MessageSquareText className="w-4 h-4" /> Chú Giải
            </button>

            <button
              onClick={() => commentary?.videoUrl && setShowVideoModal(true)}
              disabled={!commentary?.videoUrl}
              title={!commentary?.videoUrl ? "Video đang được cập nhật" : "Xem Video Bối Cảnh"}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                !commentary?.videoUrl 
                  ? 'bg-[var(--bg-main)]/50 border-[var(--border-card)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
                  : 'bg-[var(--bg-card)] hover:bg-rose-500 hover:text-white border-[var(--border-card)] hover:border-rose-500 text-[var(--text-main)] group'
              }`}
            >
              <PlayCircle className={`w-4 h-4 ${!commentary?.videoUrl ? 'text-[var(--text-muted)]' : 'text-rose-500 group-hover:text-white'}`} /> Video
            </button>

            <button
              onClick={() => commentary?.audioUrl && setShowAudioPlayer(!showAudioPlayer)}
              disabled={!commentary?.audioUrl}
              title={!commentary?.audioUrl ? "Audio đang được cập nhật" : "Nghe Audio"}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                !commentary?.audioUrl
                  ? 'bg-[var(--bg-main)]/50 border-[var(--border-card)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
                  : showAudioPlayer
                    ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)] shadow-lg'
                    : 'bg-[var(--bg-card)] hover:bg-[var(--accent-gold)]/10 border-[var(--border-card)] text-[var(--text-main)]'
              }`}
            >
              <Headphones className="w-4 h-4" /> Nghe
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--accent-gold)]/10 border border-[var(--border-card)] transition-all"
              >
                <Settings2 className="w-4 h-4" />
              </button>
              
              {showSettings && (
                <div className="absolute right-0 top-full mt-4 p-4 w-64 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Tùy Chỉnh Văn Bản</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Cỡ chữ: {fontSize}px</label>
                      <input type="range" min="14" max="36" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-[var(--accent-gold)]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Giãn dòng: {lineHeight}</label>
                      <input type="range" min="1.4" max="2.5" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-[var(--accent-gold)]" />
                    </div>
                    <div className="flex bg-[var(--bg-main)] border border-[var(--border-card)] p-1 rounded-xl">
                      <button onClick={() => setFontFamily('serif')} className={`flex-1 py-1.5 text-sm rounded-lg transition-all ${fontFamily === 'serif' ? 'bg-[var(--accent-gold)] shadow-sm font-bold text-white' : 'text-[var(--text-muted)]'}`}>Serif</button>
                      <button onClick={() => setFontFamily('sans')} className={`flex-1 py-1.5 text-sm rounded-lg transition-all ${fontFamily === 'sans' ? 'bg-[var(--accent-gold)] shadow-sm font-bold text-white' : 'text-[var(--text-muted)]'}`}>Sans</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toolbar Options Menu */}
          <div className="md:hidden flex items-center gap-2">
            <select
              value={selectedTranslation?.slug}
              onChange={(e) => handleNav(selectedBook.slug, currentChapter, e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none transition-all cursor-pointer max-w-[80px] truncate"
            >
              {translations.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>

            <div className="relative">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-2 p-2 w-48 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 animate-in fade-in flex flex-col gap-1">
                  <button
                    onClick={() => { setReadMode(readMode === 'single' ? 'parallel' : 'single'); setShowMobileMenu(false); }}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${readMode === 'parallel' ? 'bg-[var(--accent-gold)] text-white' : 'hover:bg-[var(--bg-main)]'}`}
                  >
                    <Columns className="w-4 h-4" /> Đối Chiếu
                  </button>
                  <button
                    onClick={() => { setShowSidebar(true); setShowMobileMenu(false); }}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${showSidebar ? 'bg-[var(--accent-gold)] text-white' : 'hover:bg-[var(--bg-main)]'}`}
                  >
                    <MessageSquareText className="w-4 h-4" /> Chú Giải
                  </button>
                  <button
                    onClick={() => { commentary?.videoUrl && setShowVideoModal(true); setShowMobileMenu(false); }}
                    disabled={!commentary?.videoUrl}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${!commentary?.videoUrl ? 'text-[var(--text-muted)] opacity-60' : 'hover:bg-[var(--bg-main)]'}`}
                  >
                    <PlayCircle className={`w-4 h-4 ${commentary?.videoUrl ? 'text-rose-500' : ''}`} /> Video
                  </button>
                  <button
                    onClick={() => { commentary?.audioUrl && setShowAudioPlayer(!showAudioPlayer); setShowMobileMenu(false); }}
                    disabled={!commentary?.audioUrl}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                      !commentary?.audioUrl ? 'text-[var(--text-muted)] opacity-60' 
                      : showAudioPlayer ? 'bg-[var(--accent-gold)] text-white' : 'hover:bg-[var(--bg-main)]'
                    }`}
                  >
                    <Headphones className="w-4 h-4" /> Nghe Audio
                  </button>
                  <button
                    onClick={() => { setShowSettings(!showSettings); setShowMobileMenu(false); }}
                    className="px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 hover:bg-[var(--bg-main)]"
                  >
                    <Settings2 className="w-4 h-4" /> Giao Diện
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player Row */}
        {showAudioPlayer && commentary?.audioUrl && (
          <div className="mx-auto max-w-6xl mt-2 p-3 bg-[var(--header-bg)] border border-[var(--border-card)] rounded-2xl animate-in fade-in slide-in-from-top-2">
            <audio controls className="w-full h-10 outline-none" autoPlay={false}>
              <source src={commentary.audioUrl} type="audio/mpeg" />
              Trình duyệt không hỗ trợ.
            </audio>
          </div>
        )}
      </div>

      {/* 🌟 2. MAIN READING AREA */}
      <div className="flex relative mt-8 overflow-hidden mx-auto max-w-[1400px]">
        
        {/* Book Content */}
        <div className={`transition-all duration-500 ease-in-out px-2 md:px-4 ${showSidebar ? 'w-full lg:w-2/3 xl:w-3/4' : 'w-full'}`}>
          
          {readMode === 'parallel' && (
            <div className="flex justify-end mb-4 animate-in fade-in">
               <div className="flex items-center gap-3 bg-[var(--bg-card)]/60 p-2 rounded-2xl border border-[var(--border-card)] backdrop-blur-md shadow-sm">
                 <span className="text-sm font-bold text-[var(--accent-gold-text)] ml-2">Bản dịch đối chiếu:</span>
                 <select
                    value={secondTranslationSlug}
                    onChange={(e) => setSecondTranslationSlug(e.target.value)}
                    className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none transition-all cursor-pointer"
                  >
                    {translations.map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
               </div>
            </div>
          )}

          <div className="bg-[var(--bg-card)]/50 border border-[var(--border-card)]/50 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-10 md:p-12 lg:p-16 shadow-2xl backdrop-blur-xl relative min-h-[50vh]">
            
            <div className="text-center mb-16 border-b border-[var(--border-card)] pb-8 relative">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif tracking-tight mb-4 drop-shadow-sm">
                {selectedBook.nameVi}
              </h1>
              <h2 className="text-xl md:text-2xl text-[var(--accent-gold-text)] font-serif italic">Chương {currentChapter}</h2>
            </div>

            {initialVerses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">Chương này hiện chưa có dữ liệu hoặc đang được cập nhật.</p>
              </div>
            ) : (
              <div 
                className={`space-y-8 relative z-10 transition-all duration-300 ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
              >
                {initialVerses.map((verse) => {
                  const sv = secondVerses.find(v => v.verse === verse.verse);
                  
                  return (
                  <div key={verse.id} className="group/verse relative">
                    {verse.heading && (
                      <h3 className="text-2xl font-bold font-serif text-[var(--accent-gold-text)] mt-12 mb-6 border-b border-[var(--border-card)] pb-2">
                        {verse.heading}
                      </h3>
                    )}
                    <div className={`flex gap-3 md:gap-6 items-start hover:bg-[var(--bg-main)]/50 p-3 -mx-3 rounded-2xl transition-colors ${readMode === 'parallel' ? 'flex-col lg:flex-row' : ''}`}>
                      <span className="text-sm font-black text-[var(--accent-gold-text)]/70 mt-1.5 w-6 md:w-8 text-right shrink-0 select-none">
                        {verse.verse}
                      </span>
                      
                      <div className={`flex-1 w-full ${readMode === 'parallel' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10' : ''}`}>
                        
                        {/* Primary Translation */}
                        <div className="relative">
                           {readMode === 'parallel' && <div className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">{selectedTranslation.name}</div>}
                           <div dangerouslySetInnerHTML={{ __html: verse.content }} />
                        </div>
                        
                        {/* Secondary Translation */}
                        {readMode === 'parallel' && (
                          <div className="relative">
                            <div className="hidden lg:block absolute -left-5 top-2 bottom-2 w-px bg-[var(--border-card)]"></div>
                            {/* Mobile divider */}
                            <div className="block lg:hidden w-1/4 h-px bg-[var(--border-card)] my-4"></div>
                            
                            <div className="text-xs font-bold text-[var(--accent-gold-text)]/70 mb-2 uppercase tracking-wider">
                              {translations.find(t => t.slug === secondTranslationSlug)?.name || 'Bản Dịch Đối Chiếu'}
                            </div>
                            {isFetchingSecond ? (
                               <div className="animate-pulse bg-[var(--border-card)] h-4 rounded w-3/4 mt-2"></div>
                            ) : sv ? (
                               <div className="text-[var(--text-muted)]" dangerouslySetInnerHTML={{ __html: sv.content }} />
                            ) : (
                               <span className="text-[var(--text-muted)] italic">...</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}

            {/* 🌟 4. INLINE BOTTOM NAVIGATION */}
            <div className="mt-16 pt-8 border-t border-[var(--border-card)] flex items-center justify-between gap-4">
              <button 
                onClick={() => hasPrevChapter && handleNav(selectedBook.slug, currentChapter - 1, selectedTranslation.slug)}
                disabled={!hasPrevChapter}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  hasPrevChapter 
                    ? 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:bg-[var(--accent-gold)] hover:text-white hover:border-[var(--accent-gold)] cursor-pointer'
                    : 'bg-transparent border-[var(--border-card)]/50 text-[var(--text-muted)]/50 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chương Trước</span>
              </button>

              <button 
                onClick={() => hasNextChapter && handleNav(selectedBook.slug, currentChapter + 1, selectedTranslation.slug)}
                disabled={!hasNextChapter}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  hasNextChapter 
                    ? 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:bg-[var(--accent-gold)] hover:text-white hover:border-[var(--accent-gold)] cursor-pointer'
                    : 'bg-transparent border-[var(--border-card)]/50 text-[var(--text-muted)]/50 cursor-not-allowed'
                }`}
              >
                <span>Chương {currentChapter + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 3. SLIDE-OVER COMMENTARY SIDEBAR */}
        <div 
          className={`fixed lg:relative inset-y-0 right-0 z-50 w-full md:w-[400px] lg:w-1/3 xl:w-1/4 transition-transform duration-500 ease-in-out transform ${
            showSidebar ? 'translate-x-0' : 'translate-x-full lg:hidden lg:w-0'
          }`}
        >
          {showSidebar && (
            <div className="h-full w-full bg-[var(--header-bg)] border-l border-[var(--border-card)] lg:rounded-3xl lg:border lg:my-0 shadow-2xl backdrop-blur-2xl flex flex-col fixed inset-0 lg:static">
              
              <div className="p-4 border-b border-[var(--border-card)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]/50 lg:rounded-t-3xl">
                <h3 className="font-serif font-black text-xl flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[var(--accent-gold)]"/> Chú Giải & Bối Cảnh
                </h3>
                <button onClick={() => setShowSidebar(false)} className="p-2 bg-[var(--bg-main)] hover:bg-[var(--border-card)] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-[var(--border-card)]">
                {commentary?.historicalContext && (
                   <div className="bg-[var(--accent-gold)]/5 rounded-2xl p-5 border border-[var(--accent-gold)]/20">
                     <h4 className="font-bold text-[var(--accent-gold-text)] mb-3 flex items-center gap-2"><Compass className="w-5 h-5"/> Bối Cảnh Lịch Sử</h4>
                     <p className="text-sm leading-relaxed font-sans">{commentary.historicalContext}</p>
                   </div>
                )}
                {commentary?.theologicalMeaning && (
                   <div className="bg-[var(--accent-gold)]/5 rounded-2xl p-5 border border-[var(--accent-gold)]/20">
                     <h4 className="font-bold text-[var(--accent-gold-text)] mb-3 flex items-center gap-2"><Shield className="w-5 h-5"/> Ý Nghĩa Thần Học</h4>
                     <p className="text-sm leading-relaxed font-sans">{commentary.theologicalMeaning}</p>
                   </div>
                )}
                {commentary?.practicalApplication && (
                   <div className="bg-[var(--accent-gold)]/5 rounded-2xl p-5 border border-[var(--accent-gold)]/20">
                     <h4 className="font-bold text-[var(--accent-gold-text)] mb-3 flex items-center gap-2"><Heart className="w-5 h-5"/> Bài Học Thực Hành</h4>
                     <p className="text-sm leading-relaxed font-sans">{commentary.practicalApplication}</p>
                   </div>
                )}
                {(!commentary || !(commentary.historicalContext || commentary.theologicalMeaning || commentary.practicalApplication)) && (
                   <div className="text-center text-[var(--text-muted)] py-10 italic">
                     Chương này hiện chưa có tài liệu chú giải.
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>



      {/* 🌟 5. GRID-BASED BOOK SELECTOR MODAL */}
      {isGridMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--border-card)]">
            <div className="p-6 border-b border-[var(--border-card)] flex items-center justify-between shrink-0">
              <h3 className="font-serif font-black text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-[var(--accent-gold)]" /> Chọn Sách Kinh Thánh
              </h3>
              <button onClick={() => setIsGridMenuOpen(false)} className="p-2 bg-[var(--bg-main)] hover:bg-[var(--border-card)] rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 border-b border-[var(--border-card)] bg-[var(--bg-main)]/50 shrink-0">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sách (VD: Sáng Thế, Tin Mừng...)" 
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-all font-semibold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[var(--border-card)]">
              {otBooks.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-8 h-px bg-[var(--border-card)]"></div> Cựu Ước
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {otBooks.map(b => (
                      <button 
                        key={b.slug}
                        onClick={() => { setIsGridMenuOpen(false); handleNav(b.slug, 1, selectedTranslation.slug); }}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center h-20 ${
                          selectedBook.slug === b.slug 
                            ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white shadow-lg shadow-[var(--accent-gold)]/30' 
                            : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--accent-gold)]/50 hover:shadow-md'
                        }`}
                      >
                        <span className="font-serif font-bold text-[0.95rem] line-clamp-2 leading-tight">{b.nameVi || b.slug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ntBooks.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-8 h-px bg-[var(--border-card)]"></div> Tân Ước
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {ntBooks.map(b => (
                      <button 
                        key={b.slug}
                        onClick={() => { setIsGridMenuOpen(false); handleNav(b.slug, 1, selectedTranslation.slug); }}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center h-20 ${
                          selectedBook.slug === b.slug 
                            ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white shadow-lg shadow-[var(--accent-gold)]/30' 
                            : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--accent-gold)]/50 hover:shadow-md'
                        }`}
                      >
                        <span className="font-serif font-bold text-[0.95rem] line-clamp-2 leading-tight">{b.nameVi || b.slug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredBooks.length === 0 && (
                <div className="text-center py-20 text-[var(--text-muted)] font-serif italic">
                  Không tìm thấy sách nào phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 6. VIDEO MODAL */}
      {showVideoModal && commentary?.videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-black rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative shadow-rose-500/20 border border-[var(--border-card)]">
            <div className="p-4 flex items-center justify-between absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <h3 className="font-serif font-black text-xl flex items-center gap-2 text-white drop-shadow-md">
                <PlayCircle className="w-6 h-6 text-rose-500" /> Video Bối Cảnh: {selectedBook.nameVi} - Chương {currentChapter}
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="p-2 bg-white/10 hover:bg-white/25 rounded-full transition text-white backdrop-blur-md pointer-events-auto">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="relative pt-[56.25%] w-full">
              <iframe
                src={commentary.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
