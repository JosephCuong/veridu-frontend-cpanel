'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  HelpCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Award, 
  Users, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Zap,
  Info,
  Crown,
  ChevronRight,
  Cross,
  BookOpen,
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/lib/gamesData';
import { getStoredUser, addFaithPoints } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

export default function TrieuPhuDucTinPage() {
  const [user, setUser] = useState<any>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'answer_locked' | 'passed' | 'failed' | 'walk_away' | 'victory'>('lobby');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<MillionaireQuestion[]>(MILLIONAIRE_QUESTIONS);
  const [isBankLoading, setIsBankLoading] = useState(false);

  // Settings for Background
  const [bgSettings, setBgSettings] = useState<{ bg_url: string; opacity: number }>({
    bg_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1920&auto=format&fit=crop',
    opacity: 0.85
  });

  // Manna & Play Economy
  const [hasFreePlayToday, setHasFreePlayToday] = useState(true);
  const [showMannaAlert, setShowMannaAlert] = useState(false);
  const [earnedMannaBonus, setEarnedMannaBonus] = useState(0);

  // Timer & Suspense State
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Lifelines
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineSaintUsed, setLifelineSaintUsed] = useState(false);
  const [lifelineSpiritUsed, setLifelineSpiritUsed] = useState(false);
  const [lifelineChangeUsed, setLifelineChangeUsed] = useState(false);

  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [activeModal, setActiveModal] = useState<'saint' | 'spirit' | 'change' | 'rules' | null>(null);

  const curQuestion: MillionaireQuestion = gameQuestions[currentLevel] || gameQuestions[0] || MILLIONAIRE_QUESTIONS[0];

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    checkDailyFreePlay();
    loadGameSettings();
    loadDynamicQuestions();

    const handleUserUpdate = (e: any) => {
      if (e.detail) setUser(e.detail);
    };
    window.addEventListener('veridu_user_updated', handleUserUpdate);
    return () => window.removeEventListener('veridu_user_updated', handleUserUpdate);
  }, []);

  const loadGameSettings = async () => {
    try {
      const res = await fetch('/api/game/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setBgSettings({
          bg_url: data.settings.millionaire_bg_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1920&auto=format&fit=crop',
          opacity: typeof data.settings.overlay_opacity === 'number' ? data.settings.overlay_opacity : 0.85
        });
      }
    } catch (e) {}
  };

  const checkDailyFreePlay = () => {
    const today = new Date().toISOString().slice(0, 10);
    const lastPlayed = typeof window !== 'undefined' ? localStorage.getItem('veridu_last_free_play_date') : null;
    if (lastPlayed === today) {
      setHasFreePlayToday(false);
    } else {
      setHasFreePlayToday(true);
    }
  };

  const loadDynamicQuestions = async () => {
    try {
      setIsBankLoading(true);
      const { data, error } = await supabase
        .from('catechism_quiz_bank')
        .select('*');

      if (!error && data && data.length >= 15) {
        const easy = data.filter((q: any) => q.difficulty === 'Dễ').sort(() => 0.5 - Math.random());
        const med = data.filter((q: any) => q.difficulty === 'Trung Bình').sort(() => 0.5 - Math.random());
        const hard = data.filter((q: any) => q.difficulty === 'Khó').sort(() => 0.5 - Math.random());

        const prizes = [10, 20, 50, 100, 200, 400, 700, 1000, 1500, 2500, 4000, 6000, 8500, 12000, 20000];
        
        // Take 5 Easy + 5 Medium + 5 Hard
        const selected = [
          ...easy.slice(0, 5),
          ...med.slice(0, 5),
          ...hard.slice(0, 5)
        ];

        if (selected.length === 15) {
          const mapped: MillionaireQuestion[] = selected.map((q: any, idx: number) => ({
            id: q.id,
            level: idx + 1,
            question: q.title,
            options: Array.isArray(q.options) ? q.options : [],
            answer_index: typeof q.answer_index === 'number' ? q.answer_index : 0,
            explanation: q.explanation || 'Theo Giáo Lý Hội Thánh Công Giáo.',
            scripture_hint: q.hint || q.bible_book || 'Tin tưởng và phó thác nơi Chúa.',
            saint_advice: 'Thánh Bổn Mạng: Hãy suy xét cẩn trọng dựa trên Lời Chúa và Giáo Huấn Hội Thánh.',
            prize_xp: prizes[idx],
            prize_manna: idx === 4 ? 10 : idx === 9 ? 20 : idx === 14 ? 50 : 0,
            is_safe_milestone: idx === 4 || idx === 9 || idx === 14
          }));
          setGameQuestions(mapped);
        }
      }
    } catch (e) {
    } finally {
      setIsBankLoading(false);
    }
  };

  // Web Audio Synthesizer Engine for Dramatic Suspense
  const playSound = useCallback((type: 'tick' | 'heartbeat' | 'lock' | 'correct' | 'wrong' | 'fanfare' | 'urgent') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'heartbeat' || type === 'urgent') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'urgent' ? 120 : 95, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(type === 'urgent' ? 0.2 : 0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'lock') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(146.83, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.4);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.4);
      } else if (type === 'correct') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.12, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === 'fanfare') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          gain.gain.setValueAtTime(0.15, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 1.2);
        });
      }
    } catch (e) {}
  }, [soundEnabled]);

  // 15s Countdown Timer with auto-pause on modal
  useEffect(() => {
    let timer: any = null;
    if (gameState === 'playing' && !activeModal) {
      if (timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 6 && prev > 1) {
              playSound('urgent');
            } else if (prev > 6) {
              playSound('tick');
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        handleTimeOut();
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, activeModal, playSound]);

  const handleTimeOut = () => {
    playSound('wrong');
    setIsCorrect(false);
    setGameState('failed');
    awardRewards('timeout');
  };

  // Start Game with Manna Cost or Daily Free Play
  const startGame = () => {
    const today = new Date().toISOString().slice(0, 10);
    const lastPlayed = typeof window !== 'undefined' ? localStorage.getItem('veridu_last_free_play_date') : null;

    const curUser = getStoredUser();
    const currentManna = curUser?.manna !== undefined ? curUser.manna : 100;

    if (lastPlayed !== today) {
      // First game of the day is FREE
      localStorage.setItem('veridu_last_free_play_date', today);
      setHasFreePlayToday(false);
    } else {
      // Subsequent games cost 20 Manna
      if (currentManna < 20) {
        setShowMannaAlert(true);
        return;
      }
      const updated = addFaithPoints(0, -20);
      if (updated) setUser(updated);
    }

    loadDynamicQuestions();
    setCurrentLevel(0);
    setGameState('playing');
    setTimeLeft(15);
    setSelectedOption(null);
    setIsCorrect(null);
    setHiddenOptions([]);
    setLifeline5050Used(false);
    setLifelineSaintUsed(false);
    setLifelineSpiritUsed(false);
    setLifelineChangeUsed(false);
    setEarnedMannaBonus(0);
  };

  const restartGame = () => {
    startGame();
  };

  // Answer Selection & Lock
  const handleSelectOption = (idx: number) => {
    if (gameState !== 'playing' || hiddenOptions.includes(idx)) return;
    setSelectedOption(idx);
    setGameState('answer_locked');
    playSound('lock');

    setTimeout(() => {
      const correct = idx === curQuestion.answer_index;
      setIsCorrect(correct);

      if (correct) {
        playSound('correct');
        // Check milestone bonus
        if (currentLevel === 4) setEarnedMannaBonus(prev => prev + 10);
        if (currentLevel === 9) setEarnedMannaBonus(prev => prev + 20);
        if (currentLevel === 14) setEarnedMannaBonus(prev => prev + 50);

        if (currentLevel === gameQuestions.length - 1) {
          setTimeout(() => {
            playSound('fanfare');
            setGameState('victory');
            awardRewards('victory');
          }, 1200);
        } else {
          setGameState('passed');
        }
      } else {
        playSound('wrong');
        setGameState('failed');
        awardRewards('failed');
      }
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentLevel < gameQuestions.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setGameState('playing');
      setTimeLeft(15);
      setSelectedOption(null);
      setIsCorrect(null);
      setHiddenOptions([]);
    }
  };

  const handleWalkAway = () => {
    playSound('correct');
    setGameState('walk_away');
    awardRewards('walk_away');
  };

  const awardRewards = (status: 'victory' | 'failed' | 'walk_away' | 'timeout') => {
    let finalXP = 0;
    let finalManna = earnedMannaBonus;
    let newTitle: string | undefined = undefined;
    let newBadge: string | undefined = undefined;

    if (status === 'victory') {
      finalXP = gameQuestions[14]?.prize_xp || 20000;
      finalManna += 50;
      newTitle = 'Tiến Sĩ Hội Thánh';
      newBadge = 'tien_si_hoi_thanh';
    } else if (status === 'walk_away') {
      finalXP = gameQuestions[currentLevel]?.prize_xp || 0;
      if (currentLevel >= 9) {
        newTitle = 'Môn Đệ Kiên Vững';
        newBadge = 'mon_de_kien_vung';
      } else if (currentLevel >= 4) {
        newTitle = 'Tân Tòng Nhiệt Thành';
        newBadge = 'tan_tong_nhiet_thanh';
      }
    } else {
      // Failed or Timeout: Safe milestones at Level 5 (index 4) or Level 10 (index 9)
      if (currentLevel >= 9) {
        finalXP = gameQuestions[9]?.prize_xp || 2500;
        newTitle = 'Môn Đệ Kiên Vững';
        newBadge = 'mon_de_kien_vung';
      } else if (currentLevel >= 4) {
        finalXP = gameQuestions[4]?.prize_xp || 200;
        newTitle = 'Tân Tòng Nhiệt Thành';
        newBadge = 'tan_tong_nhiet_thanh';
      } else {
        finalXP = 0;
      }
    }

    const updated = addFaithPoints(finalXP, finalManna, newTitle, newBadge);
    if (updated) setUser(updated);
  };

  // Lifeline Actions
  const use5050 = () => {
    if (lifeline5050Used || gameState !== 'playing') return;
    setLifeline5050Used(true);
    playSound('tick');

    const wrongIndexes = [0, 1, 2, 3].filter(i => i !== curQuestion.answer_index);
    const shuffled = wrongIndexes.sort(() => 0.5 - Math.random());
    setHiddenOptions([shuffled[0], shuffled[1]]);
  };

  const useSaintPatron = () => {
    if (lifelineSaintUsed || gameState !== 'playing') return;
    setLifelineSaintUsed(true);
    playSound('tick');
    setActiveModal('saint');
  };

  const useHolySpirit = () => {
    if (lifelineSpiritUsed || gameState !== 'playing') return;
    setLifelineSpiritUsed(true);
    playSound('tick');
    setActiveModal('spirit');
  };

  const useChangeQuestion = () => {
    if (lifelineChangeUsed || gameState !== 'playing') return;
    setLifelineChangeUsed(true);
    playSound('tick');
    setActiveModal('change');
  };

  return (
    <div 
      className="min-h-screen text-slate-100 font-sans select-none pb-24 pt-28 sm:pt-32 relative overflow-hidden transition-all duration-700 bg-cover bg-center"
      style={{ backgroundImage: `url('${bgSettings.bg_url}')` }}
    >
      {/* Dark Opacity Overlay Layer */}
      <div 
        className="absolute inset-0 bg-slate-950 pointer-events-none transition-opacity duration-500"
        style={{ opacity: bgSettings.opacity }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        
        {/* ── 1. TOP STATUS BAR & CONTROLS ── */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <Link 
              href="/game"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-serif font-bold border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Cổng Game</span>
            </Link>

            <div className="h-6 w-px bg-slate-800" />

            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black tracking-wider uppercase border border-amber-500/30">
                  VIA VERITAS
                </span>
                <span className="text-xs font-serif font-bold text-stone-300 hidden md:inline">
                  Chinh Phục Chân Lý (15 Bậc)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Faith Points & Manna HUD */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-amber-500/30 text-xs font-serif shadow-inner">
              <div className="flex items-center gap-1 text-amber-400 font-mono font-bold" title="Điểm Faith XP tích lũy">
                <Trophy className="w-3.5 h-3.5" />
                <span>{(user?.points || 0).toLocaleString('vi-VN')} XP</span>
              </div>
              <div className="w-px h-3.5 bg-slate-700" />
              <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold" title="Bánh Manna hiện có">
                <Zap className="w-3.5 h-3.5" />
                <span>{user?.manna !== undefined ? user.manna : 100} Manna</span>
              </div>
            </div>

            {/* Daily Free Play Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-serif">
              {hasFreePlayToday ? (
                <span className="text-emerald-400 font-bold text-[11px]">✨ Lượt Miễn Phí</span>
              ) : (
                <span className="text-stone-400 text-[11px]">20 Manna / Lượt</span>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-stone-300 hover:text-white transition border border-slate-700 cursor-pointer"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
          </div>
        </div>

        {/* ── 2. LOBBY STATE ── */}
        {gameState === 'lobby' && (
          <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border-2 border-amber-500/40 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 border-2 border-amber-500/40 shadow-inner">
              <Cross className="w-16 h-16 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 font-mono text-xs font-bold tracking-widest uppercase border border-amber-500/30">
                15 NẤC THANG ĐỨC TIN &amp; TRI THỨC CÔNG GIÁO
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-amber-300 tracking-wide">
                Chinh Phục Chân Lý
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-serif max-w-xl mx-auto leading-relaxed">
                Vượt qua 15 câu hỏi thần học, Kinh Thánh và giáo huấn phụng vụ. Mỗi câu hỏi có đúng <strong className="text-amber-400">15 giây suy nghĩ</strong>. Vượt qua Mốc 5 &amp; Mốc 10 để bảo lưu điểm và nhận danh hiệu cao quý!
              </p>
            </div>

            {/* Rules Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="font-mono text-amber-400 font-bold text-xs block">🛡️ MỐC AN TOÀN 1</span>
                <strong className="text-sm font-serif text-white block">Câu 5: 200 XP</strong>
                <span className="text-[11px] text-emerald-400 block">+10 Bánh Manna</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="font-mono text-amber-400 font-bold text-xs block">🛡️ MỐC AN TOÀN 2</span>
                <strong className="text-sm font-serif text-white block">Câu 10: 2.500 XP</strong>
                <span className="text-[11px] text-emerald-400 block">+20 Bánh Manna</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-1 bg-amber-500/5">
                <span className="font-mono text-amber-300 font-bold text-xs block">👑 ĐỈNH CAO CHÂN LÝ</span>
                <strong className="text-sm font-serif text-amber-300 block">Câu 15: 20.000 XP</strong>
                <span className="text-[11px] text-emerald-400 block">+50 Bánh Manna</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={startGame}
                disabled={isBankLoading}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>{hasFreePlayToday ? 'Chơi Miễn Phí Ngay' : 'Bắt Đầu (20 Manna)'}</span>
              </button>

              <button
                onClick={() => setActiveModal('rules')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-stone-200 font-serif font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4 text-amber-400" />
                <span>Xem Luật Chơi Chi Tiết</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 3. IN-GAME ARENA ── */}
        {(gameState === 'playing' || gameState === 'answer_locked' || gameState === 'passed') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main Question Stage (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top Controls: 4 Lifelines + Central Timer + Walk Away */}
              <div className="p-4 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
                
                {/* 4 Lifelines */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={use5050}
                    disabled={lifeline5050Used || gameState !== 'playing'}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      lifeline5050Used 
                        ? 'opacity-30 bg-slate-800 text-stone-500 border border-slate-800' 
                        : 'bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer shadow-md'
                    }`}
                    title="Loại bỏ 2 phương án sai"
                  >
                    <span>50:50</span>
                  </button>

                  <button
                    onClick={useSaintPatron}
                    disabled={lifelineSaintUsed || gameState !== 'playing'}
                    className={`px-3 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 ${
                      lifelineSaintUsed 
                        ? 'opacity-30 bg-slate-800 text-stone-500 border border-slate-800' 
                        : 'bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer shadow-md'
                    }`}
                    title="Ý kiến Thánh Bổn Mạng & Cộng Đoàn"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Thánh Bổn Mạng</span>
                  </button>

                  <button
                    onClick={useHolySpirit}
                    disabled={lifelineSpiritUsed || gameState !== 'playing'}
                    className={`px-3 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 ${
                      lifelineSpiritUsed 
                        ? 'opacity-30 bg-slate-800 text-stone-500 border border-slate-800' 
                        : 'bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer shadow-md'
                    }`}
                    title="Ơn Soi Sáng của Lời Chúa"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ơn Soi Sáng</span>
                  </button>

                  <button
                    onClick={useChangeQuestion}
                    disabled={lifelineChangeUsed || gameState !== 'playing'}
                    className={`px-3 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 ${
                      lifelineChangeUsed 
                        ? 'opacity-30 bg-slate-800 text-stone-500 border border-slate-800' 
                        : 'bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer shadow-md'
                    }`}
                    title="Đổi sang câu hỏi khác cùng độ khó"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đổi Câu</span>
                  </button>
                </div>

                {/* Central Timer & Rules Button */}
                <div className="flex items-center gap-3">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-mono font-black text-base shadow-inner transition-all ${
                    timeLeft <= 5 
                      ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500 animate-ping' 
                      : 'bg-amber-500/15 text-amber-400 border-2 border-amber-500/40'
                  }`}>
                    {timeLeft}s
                  </div>

                  <button
                    onClick={() => setActiveModal('rules')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-serif font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Luật</span>
                  </button>

                  <button
                    onClick={handleWalkAway}
                    disabled={gameState !== 'playing'}
                    className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-serif font-bold border border-rose-500/30 transition cursor-pointer flex items-center gap-1.5"
                    title="Dừng cuộc chơi và bảo toàn điểm số"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dừng Chơi</span>
                  </button>
                </div>

              </div>

              {/* Question Card Box */}
              <div className={`p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border-2 transition-all duration-300 space-y-4 shadow-2xl relative ${
                timeLeft <= 5 
                  ? 'border-rose-500 shadow-rose-500/20 animate-pulse' 
                  : 'border-amber-500/40 shadow-amber-500/10'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    CÂU HỎI {curQuestion.level} / 15
                  </span>
                  <span className="text-amber-400 font-black">
                    GIẢI THƯỞNG: {curQuestion.prize_xp.toLocaleString('vi-VN')} XP
                  </span>
                </div>

                <h2 className="font-serif font-bold text-lg sm:text-xl text-white leading-relaxed">
                  {curQuestion.question}
                </h2>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {curQuestion.options.map((opt, idx) => {
                  const isHidden = hiddenOptions.includes(idx);
                  const isSelected = selectedOption === idx;
                  const isAnswerKey = idx === curQuestion.answer_index;

                  let btnStyle = "bg-slate-900/80 hover:bg-slate-800/90 text-stone-200 border-slate-800";
                  
                  if (isSelected && gameState === 'answer_locked') {
                    btnStyle = "bg-amber-500/30 text-amber-300 border-amber-500 animate-pulse";
                  } else if (gameState === 'passed' && isAnswerKey) {
                    btnStyle = "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/40";
                  }

                  if (isHidden) {
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/40 opacity-20 pointer-events-none text-center">
                        <span className="text-xs font-mono text-stone-600">---</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={gameState !== 'playing'}
                      className={`p-4 rounded-2xl border-2 text-left font-serif transition-all transform active:scale-98 flex items-center gap-3 cursor-pointer shadow-lg ${btnStyle}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-800/90 flex items-center justify-center font-mono font-black text-xs text-amber-400 shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Passed Feedback & Next Button */}
              {gameState === 'passed' && (
                <div className="p-5 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CHÍNH XÁC! Chúc mừng bạn đã vượt qua Câu {curQuestion.level}</span>
                    </div>
                    <p className="text-xs text-stone-300 italic font-serif">
                      {curQuestion.explanation}
                    </p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-serif font-black text-xs shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Câu Kế Tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

            {/* 15-Level Ladder Sidebar (4 Cols) */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  15 BẬC THANG DANH VỌNG
                </span>
                <span className="text-[11px] font-serif text-stone-400">XP Tích Lũy</span>
              </div>

              <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
                {gameQuestions.slice().reverse().map((q, idx) => {
                  const actualLevel = gameQuestions.length - 1 - idx;
                  const isCurrent = currentLevel === actualLevel;
                  const isPassed = actualLevel < currentLevel;
                  const isSafe = q.is_safe_milestone;

                  let rowStyle = "text-stone-400 hover:bg-slate-800/40";
                  if (isCurrent) {
                    rowStyle = "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-102";
                  } else if (isPassed) {
                    rowStyle = "text-emerald-400 bg-emerald-950/20";
                  } else if (isSafe) {
                    rowStyle = "text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30";
                  }

                  return (
                    <div
                      key={q.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif flex items-center justify-between transition-all ${rowStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] w-5 text-right font-bold">
                          {q.level}
                        </span>
                        {isSafe && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="truncate max-w-[120px]">
                          {actualLevel === 14 ? 'Đỉnh Cao Chân Lý' : actualLevel === 9 ? 'Môn Đệ Kiên Vững' : actualLevel === 4 ? 'Tân Tòng' : `Bậc ${q.level}`}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-[11px]">
                        {q.prize_xp.toLocaleString('vi-VN')} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── 4. END GAME MODALS (Victory / Failed / Walk Away) ── */}
        {(gameState === 'victory' || gameState === 'failed' || gameState === 'walk_away') && (
          <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border-2 border-amber-500 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-400">
            {gameState === 'victory' ? (
              <div className="inline-flex p-5 rounded-full bg-amber-500/20 border-2 border-amber-400 shadow-lg">
                <Crown className="w-16 h-16 text-amber-400 animate-bounce" />
              </div>
            ) : gameState === 'walk_away' ? (
              <div className="inline-flex p-5 rounded-full bg-blue-500/20 border-2 border-blue-400">
                <ShieldCheck className="w-16 h-16 text-blue-400" />
              </div>
            ) : (
              <div className="inline-flex p-5 rounded-full bg-rose-500/20 border-2 border-rose-400">
                <XCircle className="w-16 h-16 text-rose-400" />
              </div>
            )}

            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-300">
                {gameState === 'victory'
                  ? 'VINH QUANG ĐỈNH CAO CHÂN LÝ!'
                  : gameState === 'walk_away'
                  ? 'BẢO TOÀN DANH DỰ THÀNH CÔNG'
                  : 'TIẾC QUÁ! HẸN GẶP LẠI Ở LẦN SAU'}
              </h2>
              <p className="text-xs text-stone-300 font-serif">
                {gameState === 'victory'
                  ? 'Bạn đã xuất sắc vượt qua 15 nấc thang và đạt danh hiệu Tiến Sĩ Hội Thánh!'
                  : gameState === 'walk_away'
                  ? `Bạn đã dừng cuộc chơi an toàn tại Câu ${currentLevel + 1} và bảo toàn điểm số.`
                  : `Bạn đã dừng bước tại Câu ${curQuestion.level}. Đáp án đúng là: ${curQuestion.options[curQuestion.answer_index]}`}
              </p>
            </div>

            {/* Reward Summary */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-serif">
                <span className="text-stone-400">Faith XP Đạt Được:</span>
                <strong className="text-amber-400 font-mono text-sm">
                  +{gameState === 'victory' ? '20.000' : gameState === 'walk_away' ? (gameQuestions[currentLevel]?.prize_xp || 0).toLocaleString('vi-VN') : currentLevel >= 9 ? '2.500' : currentLevel >= 4 ? '200' : '0'} XP
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs font-serif">
                <span className="text-stone-400">Bánh Manna Thưởng:</span>
                <strong className="text-emerald-400 font-mono text-sm">
                  +{earnedMannaBonus + (gameState === 'victory' ? 50 : 0)} Manna
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={restartGame}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Ván Mới</span>
              </button>
              <Link
                href="/game"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-stone-200 font-serif font-bold text-xs border border-slate-700"
              >
                Về Cổng Game
              </Link>
            </div>
          </div>
        )}

        {/* ── 5. LIFELINE POPUP MODALS (Saint, Spirit, Rules, Manna Alert) ── */}
        {activeModal === 'saint' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <Users className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-amber-300">Ý Kiến Thánh Bổn Mạng &amp; Cộng Đoàn</h3>
              <p className="text-xs text-stone-300 font-serif italic">"{curQuestion.saint_advice}"</p>
              <div className="p-3 rounded-xl bg-slate-800 text-xs font-mono text-emerald-400 font-bold">
                85% Cộng Đoàn nghiêng về Phương án {String.fromCharCode(65 + curQuestion.answer_index)}
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Đã Tiếp Nhận
              </button>
            </div>
          </div>
        )}

        {activeModal === 'spirit' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <Flame className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
              <h3 className="font-serif font-bold text-lg text-amber-300">Ơn Soi Sáng Lời Chúa</h3>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-serif text-amber-200 italic leading-relaxed">
                📖 "{curQuestion.scripture_hint}"
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Đã Hiểu Lời Chúa
              </button>
            </div>
          </div>
        )}

        {activeModal === 'change' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <RefreshCw className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-amber-300">Đổi Câu Hỏi Mới</h3>
              <p className="text-xs text-stone-300 font-serif">
                Bạn đã kích hoạt quyền đổi câu hỏi. Hệ thống sẽ thay thế câu hỏi này bằng một câu hỏi khác trong ngân hàng.
              </p>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTimeLeft(15);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Xác Nhận Đổi
              </button>
            </div>
          </div>
        )}

        {activeModal === 'rules' && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl text-stone-200 space-y-5 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <Crown className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-serif font-bold text-xl text-amber-300">Luật Chơi: Chinh Phục Chân Lý</h3>
                <p className="text-xs text-stone-400 font-serif">15 Nấc Thang Đức Tin &amp; Tri Thức Công Giáo</p>
              </div>

              <div className="space-y-3 text-xs font-serif leading-relaxed text-stone-300">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <strong className="text-amber-400 block mb-0.5">⏱️ 1. Thời Gian 15 Giây Kịch Tính:</strong>
                  Mỗi câu hỏi có đúng 15 giây đếm ngược. Khi còn 5 giây, khung câu hỏi sẽ nhấp nháy đỏ báo động.
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <strong className="text-amber-400 block mb-0.5">🛡️ 2. Thang Điểm &amp; Mốc An Toàn:</strong>
                  - <strong>Mốc 1 (Câu 5)</strong>: Bảo lưu 200 XP + Thưởng 10 Manna (Danh hiệu: Tân Tòng).<br/>
                  - <strong>Mốc 2 (Câu 10)</strong>: Bảo lưu 2.500 XP + Thưởng 20 Manna (Danh hiệu: Môn Đệ).<br/>
                  - <strong>Đỉnh Cao (Câu 15)</strong>: Đoạt 20.000 XP + Thưởng 50 Manna (Danh hiệu: Tiến Sĩ Hội Thánh).
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <strong className="text-amber-400 block mb-0.5">⚡ 3. Bốn Quyền Trợ Giúp Phụng Vụ:</strong>
                  - <strong>50:50</strong>: Loại 2 đáp án sai.<br/>
                  - <strong>Thánh Bổn Mạng</strong>: Lắng nghe ý kiến cộng đoàn &amp; Thánh quan thầy.<br/>
                  - <strong>Ơn Soi Sáng</strong>: Mở cuộn Kinh Thánh gợi ý.<br/>
                  - <strong>Đổi Câu</strong>: Đổi sang câu hỏi khác.
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <strong className="text-amber-400 block mb-0.5">🥖 4. Năng Lượng Manna:</strong>
                  Miễn phí 1 lượt đầu tiên mỗi ngày. Các lượt sau tiêu tốn 20 Manna. Điểm XP và Manna thưởng được cộng dồn vĩnh viễn vào Hồ Sơ!
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-xs"
              >
                Đã Hiểu · Tiếp Tục Chơi Ngay
              </button>
            </div>
          </div>
        )}

        {showMannaAlert && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-rose-500 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <Zap className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-rose-300">Không Đủ Bánh Manna</h3>
              <p className="text-xs text-stone-300 font-serif leading-relaxed">
                Bạn đã sử dụng hết lượt chơi miễn phí hôm nay và cần ít nhất <strong className="text-amber-400">20 Manna</strong> để tiếp tục lượt chơi mới.
              </p>
              <div className="flex gap-2">
                <Link
                  href="/sach-tranh"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs block text-center"
                >
                  Đọc Sách Nhận Manna
                </Link>
                <button
                  onClick={() => setShowMannaAlert(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-stone-300 font-bold text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
