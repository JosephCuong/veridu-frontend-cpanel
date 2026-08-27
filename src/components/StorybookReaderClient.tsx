'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Sparkles, 
  Award, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  CheckCircle2, 
  Share2, 
  Download, 
  BookOpen, 
  Heart, 
  HelpCircle,
  Play,
  Pause,
  Music
} from 'lucide-react';
import { addFaithPoints } from '@/lib/auth';
import { StorybookPage, StorybookQuizQuestion, StorybookParentGuide } from '@/lib/storybooksData';

interface StorybookProps {
  book: {
    id: number;
    slug: string;
    title: string;
    subtitle?: string;
    total_pages: number;
    target_age?: string;
    description?: string;
    moral_lesson?: string;
    pages_data: StorybookPage[];
    quiz_data: StorybookQuizQuestion[];
    parent_guide?: StorybookParentGuide;
  };
}

export default function StorybookReaderClient({ book }: StorybookProps) {
  const pages: StorybookPage[] = useMemo(() => book.pages_data || [], [book.pages_data]);
  const totalPages = pages.length || book.total_pages || 10;

  // Reading State
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Audio Narration & BGM State
  const [isNarrating, setIsNarrating] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);
  const [isBedtimeMode, setIsBedtimeMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9); // Gentle pace for children

  // Quiz Interactive State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [faithXpEarned, setFaithXpEarned] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Audio Context Ref for synthetic celestial BGM and Page Turn Sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmOscillatorsRef = useRef<any[]>([]);

  // Web Audio Synthetic Sound Effects
  const playPageTurnSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }, []);

  // Web Audio Synthetic Celestial Background Music
  const toggleBgm = () => {
    if (isBgmActive) {
      // Stop BGM
      bgmOscillatorsRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      bgmOscillatorsRef.current = [];
      setIsBgmActive(false);
    } else {
      // Start Gentle Celestial Chords (C Major Pentatonic)
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;

        const freqs = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
        const oscs: any[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.015 / (idx + 1), ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          oscs.push(osc);
        });

        bgmOscillatorsRef.current = oscs;
        setIsBgmActive(true);
      } catch (e) {
        setIsBgmActive(false);
      }
    }
  };

  // Text To Speech Narration
  const speakCurrentPage = useCallback((pageIdx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const currentPage = pages[pageIdx];
    if (!currentPage || !currentPage.text_script) return;

    const utterance = new SpeechSynthesisUtterance(currentPage.text_script);
    utterance.lang = 'vi-VN';
    utterance.rate = speechRate;
    utterance.pitch = 1.05; // Slightly warmer/friendly pitch for children

    utterance.onend = () => {
      if (isBedtimeMode && pageIdx < pages.length - 1) {
        setTimeout(() => {
          setCurrentPageIndex(prev => prev + 1);
        }, 2500);
      } else if (pageIdx === pages.length - 1) {
        setIsNarrating(false);
        setShowQuizModal(true);
      }
    };

    utterance.onerror = () => {
      setIsNarrating(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [pages, speechRate, isBedtimeMode]);

  // Turn Page Next / Prev
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      playPageTurnSound();
      setCurrentPageIndex(prev => prev + 1);
    } else {
      setShowQuizModal(true);
    }
  }, [currentPageIndex, totalPages, playPageTurnSound]);

  const goToPrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      playPageTurnSound();
      setCurrentPageIndex(prev => prev - 1);
    }
  }, [currentPageIndex, playPageTurnSound]);

  // Trigger narration when changing page if active
  useEffect(() => {
    if (isNarrating) {
      speakCurrentPage(currentPageIndex);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPageIndex, isNarrating, speakCurrentPage]);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        setShowQuizModal(false);
        setShowGuideModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      bgmOscillatorsRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isNarrating) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      speakCurrentPage(currentPageIndex);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Quiz Handling
  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    const questions = book.quiz_data || [];
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer_index) {
        correctCount++;
      }
    });

    const xp = correctCount * 25 + 25; // Bonus completion
    setQuizScore(correctCount);
    setFaithXpEarned(xp);
    setQuizSubmitted(true);
    addFaithPoints(xp, 'Hoàn thành Sách Tranh Kinh Thánh');
  };

  const currentPage = pages[currentPageIndex] || {
    page_number: currentPageIndex + 1,
    image_url: `/storybooks/cong-trinh-sang-tao/page_${currentPageIndex + 1}.png`,
    text_script: ''
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-stone-950 text-stone-100 font-sans select-none overflow-hidden">
      
      {/* ── 1. SACRED STORYBOOK TOP NAVBAR (Exact match to user screenshot) ── */}
      <header className="h-16 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 z-30 shrink-0">
        
        {/* Left: Close Button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/sach-tranh"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            title="Đóng sách và về Thư viện"
          >
            <X className="w-5 h-5" />
          </Link>

          <h1 className="font-serif font-bold text-sm sm:text-base text-stone-100 truncate">
            {book.title}
          </h1>
        </div>

        {/* Center: Page Counter Navigator */}
        <div className="flex items-center gap-2 bg-stone-950/80 px-3 py-1.5 rounded-full border border-stone-800 shadow-inner">
          <button
            onClick={goToPrevPage}
            disabled={currentPageIndex === 0}
            className="p-1 rounded-full text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-400 transition"
            title="Trang trước (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-serif font-bold text-amber-400 min-w-[50px] text-center tracking-wider">
            {currentPageIndex + 1} / {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPageIndex === totalPages - 1}
            className="p-1 rounded-full text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-400 transition"
            title="Trang sau (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Controls: Listen, BGM, Bedtime, Quiz, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 🔊 LISTEN BUTTON (Audio Narration) */}
          <button
            onClick={toggleListen}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isNarrating 
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50 animate-pulse' 
                : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-amber-500/30'
            }`}
            title="Bật/Tắt giọng đọc diễn cảm tiếng Việt"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isNarrating ? 'Đang Đọc' : 'Listen'}</span>
          </button>

          {/* 🎵 BGM Ambient Sound */}
          <button
            onClick={toggleBgm}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              isBgmActive 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Bật/Tắt Nhạc Nền Thiên Thần"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* 🌙 Bedtime Auto-play Mode */}
          <button
            onClick={() => setIsBedtimeMode(!isBedtimeMode)}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              isBedtimeMode 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Chế độ Tự Động / Ru Ngủ (Tự chuyển trang sau khi đọc)"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* ✨ Mini Quiz */}
          <button
            onClick={() => setShowQuizModal(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition"
            title="Mở Câu Đố Đức Tin"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition relative"
            title="Chia sẻ sách tranh"
          >
            <Share2 className="w-4 h-4" />
            {copiedUrl && (
              <span className="absolute -bottom-8 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
                Đã sao chép link!
              </span>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition hidden sm:flex"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* ── 2. REALISTIC 2-PAGE SPREAD STORYBOOK VIEWPORT (Pixel-perfect match to screenshot) ── */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-radial from-stone-900 via-stone-950 to-black">
        
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Left Side Floating Arrow */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-stone-900/80 hover:bg-amber-500 text-stone-300 hover:text-slate-950 border border-stone-700 hover:border-amber-400 backdrop-blur-md flex items-center justify-center transition-all shadow-xl disabled:opacity-20 disabled:hover:bg-stone-900/80 disabled:hover:text-stone-300"
          title="Trang trước (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Side Floating Arrow */}
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex === totalPages - 1}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-stone-900/80 hover:bg-amber-500 text-stone-300 hover:text-slate-950 border border-stone-700 hover:border-amber-400 backdrop-blur-md flex items-center justify-center transition-all shadow-xl disabled:opacity-20 disabled:hover:bg-stone-900/80 disabled:hover:text-stone-300"
          title="Trang sau (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 🌟 2-PAGE SPREAD CONTAINER (Rendering the 300 DPI spread image directly with 3D spine and shadow) */}
        <div className="w-full max-w-5xl max-h-[82vh] aspect-[16/12] sm:aspect-[16/12.3] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-2 border-stone-800/80 flex relative bg-stone-900">
          
          {/* Central 3D Book Spine Shadow */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-transparent via-stone-950/25 to-transparent pointer-events-none z-10" />

          {/* Full High-Resolution 300 DPI Spread Image */}
          <div className="relative w-full h-full">
            <Image
              src={currentPage.image_url}
              alt={currentPage.caption || `Trang ${currentPage.page_number}`}
              fill
              priority
              className="object-contain transition-opacity duration-300"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>

          {/* Parent Guide Quick Trigger at bottom right */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="absolute bottom-3 right-4 z-20 px-3 py-1 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-stone-300 border border-stone-700/50 backdrop-blur-md text-[11px] font-serif flex items-center gap-1 transition shadow-md"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Góc Phụ Huynh &amp; Giáo Lý Viên</span>
          </button>

        </div>

      </main>

      {/* ── 3. MINI-QUIZ MODAL ── */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/40 shadow-2xl text-stone-100 space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl text-amber-300">
                    {quizSubmitted ? 'Kết Quả Đố Vui Đức Tin' : 'Câu Đố Vui Cuối Truyện'}
                  </h3>
                  <p className="text-xs text-stone-400 font-serif">
                    Cùng kiểm tra trí nhớ và rinh về Huy Hiệu Lời Chúa nhé!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQuizModal(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiz Questions List */}
            {!quizSubmitted ? (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {(book.quiz_data || []).map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3">
                    <div className="font-serif font-bold text-sm text-stone-200 flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs shrink-0">
                        Câu {qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`p-3 rounded-xl text-xs font-serif text-left border transition ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < (book.quiz_data?.length || 1)}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Nộp Bài &amp; Nhận Huy Hiệu</span>
                </button>
              </div>
            ) : (
              /* Quiz Results & Rewards View */
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 mx-auto animate-bounce">
                  <Award className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-black text-2xl text-amber-300">
                    Xuất Sắc! Bé Đạt {quizScore}/{(book.quiz_data || []).length} Điểm
                  </h4>
                  <p className="text-xs font-serif text-stone-300 max-w-md mx-auto">
                    Thiên Chúa rất vui khi bé chăm chú lắng nghe Lời Ngài. Bé nhận được huy hiệu <strong className="text-amber-400">"Bé Chăm Lắng Nghe Lời Chúa"</strong> và <strong className="text-emerald-400">+{faithXpEarned} Faith XP</strong>!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs font-serif text-stone-300 max-w-md mx-auto text-left space-y-2">
                  <span className="font-bold text-amber-400 block">✦ Bài học đọng lại:</span>
                  <p>{book.moral_lesson || 'Khắc sâu lòng biết ơn Đấng Tạo Hóa và yêu mến vạn vật xung quanh.'}</p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-serif font-bold"
                  >
                    Làm Lại
                  </button>

                  <Link
                    href="/sach-tranh"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold shadow-lg"
                  >
                    Đọc Sách Khác
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 4. PARENT & CATECHIST GUIDE MODAL ── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/30 shadow-2xl text-stone-100 space-y-6">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Góc Phụ Huynh &amp; Giáo Lý Viên
                </h3>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-serif leading-relaxed">
              <div className="space-y-1">
                <strong className="text-amber-400 font-sans uppercase tracking-wider text-[11px] block">
                  Chủ đề suy niệm:
                </strong>
                <p className="text-stone-300">{book.parent_guide?.moral_theme || book.moral_lesson}</p>
              </div>

              {book.parent_guide?.reflection_questions && (
                <div className="space-y-2">
                  <strong className="text-amber-400 font-sans uppercase tracking-wider text-[11px] block">
                    Gợi ý câu hỏi trò chuyện cùng bé:
                  </strong>
                  <ul className="space-y-1.5 text-stone-300 list-disc list-inside">
                    {book.parent_guide.reflection_questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {book.parent_guide?.family_prayer && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <strong className="text-amber-400 font-sans uppercase tracking-wider text-[11px] block">
                    Lời nguyện gia đình trước giờ ngủ:
                  </strong>
                  <p className="text-stone-200 italic">{book.parent_guide.family_prayer}</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
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
