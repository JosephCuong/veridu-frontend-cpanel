'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Moon, 
  Award, 
  Maximize2, 
  Minimize2, 
  Share2, 
  BookOpen, 
  HelpCircle,
  Play,
  Pause,
  Music,
  RefreshCw,
  Check
} from 'lucide-react';
import { addFaithPoints } from '@/lib/auth';
import { resolveMediaUrl } from '@/lib/driveHelper';
import { StorybookPage, StorybookQuizQuestion, StorybookParentGuide, StorybookTimestamp } from '@/lib/storybooksData';

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
    full_audio_url?: string;
    audio_timestamps?: StorybookTimestamp[];
    pages_data: StorybookPage[];
    quiz_data: StorybookQuizQuestion[];
    parent_guide?: StorybookParentGuide;
  };
}

export default function StorybookReaderClient({ book }: StorybookProps) {
  const pages: StorybookPage[] = useMemo(() => book.pages_data || [], [book.pages_data]);
  const totalPages = pages.length || book.total_pages || 10;

  // Reading State
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Audio Playback & Auto-flip Engine State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPageTurn, setAutoPageTurn] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [pageDurationSec, setPageDurationSec] = useState(15);
  const [isWaitingToFlip, setIsWaitingToFlip] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);

  // Audio elements and Timers
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoFlipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmOscillatorsRef = useRef<any[]>([]);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [faithXpEarned, setFaithXpEarned] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentPage = pages[currentPageIndex] || {
    page_number: currentPageIndex + 1,
    image_url: `/storybooks/cong-trinh-sang-tao/page_${currentPageIndex + 1}.png`,
    text_script: '',
    estimated_duration: 15
  };

  // Sound Effect for realistic 3D book page flip
  const playPageTurnSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
      
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }, []);

  // Web Audio Synthetic Celestial Background Music
  const toggleBgm = () => {
    if (isBgmActive) {
      bgmOscillatorsRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      bgmOscillatorsRef.current = [];
      setIsBgmActive(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;

        const freqs = [261.63, 329.63, 392.00, 523.25];
        const oscs: any[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.012 / (idx + 1), ctx.currentTime);
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

  // Turn page forward
  const goToNextPage = useCallback(() => {
    if (autoFlipTimeoutRef.current) clearTimeout(autoFlipTimeoutRef.current);
    setIsWaitingToFlip(false);

    if (currentPageIndex < totalPages - 1) {
      playPageTurnSound();
      setCurrentPageIndex(prev => prev + 1);
      setCurrentTimeSec(0);
    } else {
      setIsPlayingAudio(false);
      setShowQuizModal(true);
    }
  }, [currentPageIndex, totalPages, playPageTurnSound]);

  // Turn page backward
  const goToPrevPage = useCallback(() => {
    if (autoFlipTimeoutRef.current) clearTimeout(autoFlipTimeoutRef.current);
    setIsWaitingToFlip(false);

    if (currentPageIndex > 0) {
      playPageTurnSound();
      setCurrentPageIndex(prev => prev - 1);
      setCurrentTimeSec(0);
    }
  }, [currentPageIndex, playPageTurnSound]);

  // Handle Page Narration Finished (Triggers 1.5s Pause -> Auto Flip)
  const handlePageAudioFinished = useCallback(() => {
    if (autoPageTurn) {
      setIsWaitingToFlip(true);
      autoFlipTimeoutRef.current = setTimeout(() => {
        setIsWaitingToFlip(false);
        goToNextPage();
      }, 1500);
    } else {
      setIsPlayingAudio(false);
    }
  }, [autoPageTurn, goToNextPage]);

  // Web speech fallback
  const fallbackWebSpeech = useCallback((text: string, duration: number) => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      utterance.pitch = 1.05;

      utterance.onend = () => {
        handlePageAudioFinished();
      };
      utterance.onerror = () => {
        handlePageAudioFinished();
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      setIsPlayingAudio(true);
    }
  }, [handlePageAudioFinished]);

  // Play narration audio for current page
  const playCurrentPageAudio = useCallback((pageIdx: number) => {
    const curPage = pages[pageIdx];
    if (!curPage) return;

    const duration = curPage.estimated_duration || (curPage.end_time && curPage.start_time ? curPage.end_time - curPage.start_time : 15);
    setPageDurationSec(duration);
    setCurrentTimeSec(0);
    setIsWaitingToFlip(false);

    // Audio file or stream (supports .mp3, .wav, .m4a, .ogg and Google Drive)
    const rawAudio = curPage.audio_url || book.full_audio_url;
    const resolvedAudio = rawAudio ? resolveMediaUrl(rawAudio, 'audio') : '';

    if (resolvedAudio && audioElRef.current) {
      const el = audioElRef.current;
      el.src = resolvedAudio;
      if (curPage.start_time) {
        el.currentTime = curPage.start_time;
      }
      el.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        fallbackWebSpeech(curPage.text_script, duration);
      });
      return;
    }

    fallbackWebSpeech(curPage.text_script, duration);
  }, [pages, book.full_audio_url, fallbackWebSpeech]);

  // Progress ticker effect
  useEffect(() => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    if (isPlayingAudio && !isWaitingToFlip) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= pageDurationSec) {
            handlePageAudioFinished();
            return pageDurationSec;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlayingAudio, isWaitingToFlip, pageDurationSec, handlePageAudioFinished]);

  // When page index changes, trigger audio if playing
  useEffect(() => {
    if (isPlayingAudio) {
      playCurrentPageAudio(currentPageIndex);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPageIndex]);

  const togglePlayAudio = useCallback(() => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      if (autoFlipTimeoutRef.current) clearTimeout(autoFlipTimeoutRef.current);
      setIsPlayingAudio(false);
      setIsWaitingToFlip(false);
    } else {
      playCurrentPageAudio(currentPageIndex);
      setIsPlayingAudio(true);
    }
  }, [isPlayingAudio, playCurrentPageAudio, currentPageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayAudio();
      } else if (e.key === 'Escape') {
        setShowQuizModal(false);
        setShowGuideModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, togglePlayAudio]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      bgmOscillatorsRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (autoFlipTimeoutRef.current) clearTimeout(autoFlipTimeoutRef.current);
    };
  }, []);

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

    const xp = correctCount * 25 + 25;
    setQuizScore(correctCount);
    setFaithXpEarned(xp);
    setQuizSubmitted(true);
    addFaithPoints(xp, 'Hoàn thành Sách Tranh Kinh Thánh');
  };

  const progressPercent = Math.min(100, Math.round((currentTimeSec / (pageDurationSec || 15)) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const resolvedImageSrc = resolveMediaUrl(currentPage.image_url, 'image');

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-stone-950 text-stone-100 font-sans select-none overflow-hidden">
      
      {/* Hidden Audio Controller */}
      <audio ref={audioElRef} className="hidden" onEnded={handlePageAudioFinished} />

      {/* ── 1. SACRED STORYBOOK TOP NAVBAR ── */}
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
            className="p-1 rounded-full text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-400 transition cursor-pointer"
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
            className="p-1 rounded-full text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-400 transition cursor-pointer"
            title="Trang sau (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Controls: Listen, BGM, Auto-flip toggle, Quiz, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 🔊 LISTEN / PLAY / PAUSE BUTTON */}
          <button
            onClick={togglePlayAudio}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isPlayingAudio 
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50' 
                : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-amber-500/30'
            }`}
            title="Bật/Tắt giọng đọc lời thoại tiếng Việt"
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tạm Dừng</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          {/* 🔄 Auto Page Turn Toggle */}
          <button
            onClick={() => setAutoPageTurn(!autoPageTurn)}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              autoPageTurn 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
            }`}
            title={autoPageTurn ? "Tự động lật trang: Đang BẬT (Sau khi đọc xong nghỉ 1.5s)" : "Tự động lật trang: Đang TẮT"}
          >
            <RefreshCw className={`w-4 h-4 ${autoPageTurn ? 'text-amber-400' : ''}`} />
          </button>

          {/* 🎵 BGM Ambient Sound */}
          <button
            onClick={toggleBgm}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              isBgmActive 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Bật/Tắt Nhạc Nền Thiên Thần"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Mini Quiz */}
          <button
            onClick={() => setShowQuizModal(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition cursor-pointer"
            title="Mở Câu Đố Đức Tin"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition relative cursor-pointer"
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
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition hidden sm:flex cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* ── 2. REALISTIC 2-PAGE SPREAD STORYBOOK VIEWPORT ── */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-radial from-stone-900 via-stone-950 to-black">
        
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Left Side Floating Arrow */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-stone-900/80 hover:bg-amber-500 text-stone-300 hover:text-slate-950 border border-stone-700 hover:border-amber-400 backdrop-blur-md flex items-center justify-center transition-all shadow-xl disabled:opacity-20 disabled:hover:bg-stone-900/80 disabled:hover:text-stone-300 cursor-pointer"
          title="Trang trước (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Side Floating Arrow */}
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex === totalPages - 1}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-stone-900/80 hover:bg-amber-500 text-stone-300 hover:text-slate-950 border border-stone-700 hover:border-amber-400 backdrop-blur-md flex items-center justify-center transition-all shadow-xl disabled:opacity-20 disabled:hover:bg-stone-900/80 disabled:hover:text-stone-300 cursor-pointer"
          title="Trang sau (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 2-PAGE SPREAD CONTAINER */}
        <div className="w-full max-w-5xl max-h-[82vh] aspect-[16/12] sm:aspect-[16/12.3] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-2 border-stone-800/80 flex flex-col relative bg-stone-900">
          
          {/* Central 3D Book Spine Shadow */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-transparent via-stone-950/25 to-transparent pointer-events-none z-10" />

          {/* Full High-Resolution Spread Image (.png, .webp, .jpg or Google Drive) */}
          <div className="relative w-full flex-1 overflow-hidden">
            <Image
              src={resolvedImageSrc}
              alt={currentPage.caption || `Trang ${currentPage.page_number}`}
              fill
              priority
              className="object-contain transition-opacity duration-300"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>

          {/* DYNAMIC AUDIO PROGRESS BAR & PACING CONTROLLER */}
          <div className="bg-stone-950/85 backdrop-blur-md border-t border-stone-800 px-4 py-2.5 flex items-center justify-between gap-3 z-20">
            
            <div className="flex items-center gap-2 text-xs font-serif text-stone-300">
              <button
                onClick={togglePlayAudio}
                className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <span className="font-mono text-[11px] text-amber-400">
                {formatTime(currentTimeSec)} / {formatTime(pageDurationSec)}
              </span>

              {isWaitingToFlip && (
                <span className="text-[11px] text-amber-400 animate-pulse font-serif italic hidden sm:inline">
                  ✦ Chuẩn bị lật trang...
                </span>
              )}
            </div>

            {/* Audio Progress Bar */}
            <div className="flex-1 max-w-md h-1.5 bg-stone-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-300 rounded-full shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Parent Guide Button */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-stone-400 hover:text-amber-400 text-xs font-serif flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Góc Phụ Huynh</span>
            </button>

          </div>

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
                  <Check className="w-4 h-4" />
                  <span>Nộp Bài &amp; Nhận Huy Hiệu</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 mx-auto">
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
                    Đóng
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 4. PARENT GUIDE MODAL ── */}
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
