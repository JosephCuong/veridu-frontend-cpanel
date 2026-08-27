'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Award, 
  Coins, 
  Star, 
  RefreshCw, 
  Check, 
  HelpCircle, 
  Flame, 
  Volume2, 
  VolumeX, 
  Trophy,
  Clock,
  Users,
  BookOpen,
  Cross,
  Shield,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { getStoredUser, addFaithPoints } from '@/lib/auth';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/lib/gamesData';

const TOTAL_TIME = 15; // 15 seconds per question

export default function TruthConquestGamePage() {
  const [user, setUser] = useState<any>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  
  // Game Play States
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [endReason, setEndReason] = useState<'timeout' | 'wrong' | 'surrender' | 'victory'>('wrong');
  const [accumulatedXp, setAccumulatedXp] = useState(0);
  const [safeXpEarned, setSafeXpEarned] = useState(0);

  // 15-Second Dramatic Countdown Timer
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 4 Sacred Lifelines
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineSaintUsed, setLifelineSaintUsed] = useState(false);
  const [lifelineSpiritUsed, setLifelineSpiritUsed] = useState(false);
  const [lifelineChangeUsed, setLifelineChangeUsed] = useState(false);

  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [activeModal, setActiveModal] = useState<'saint' | 'spirit' | 'change' | null>(null);

  const curQuestion: MillionaireQuestion = MILLIONAIRE_QUESTIONS[currentLevel] || MILLIONAIRE_QUESTIONS[0];

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

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
        gain.gain.setValueAtTime(type === 'urgent' ? 0.15 : 0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'lock') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(146.83, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.4);
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.5);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 1.2);
        });
      }
    } catch (e) {}
  }, [soundEnabled]);

  const handleTimeOut = useCallback(() => {
    playSound('wrong');
    setGameEnded(true);
    setEndReason('timeout');
    if (safeXpEarned > 0) {
      addFaithPoints(safeXpEarned, 'Mốc an toàn Chinh Phục Chân Lý');
    }
  }, [playSound, safeXpEarned]);

  // 15s Countdown Engine
  useEffect(() => {
    if (gameEnded || isLocked || activeModal) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          playSound('urgent');
        } else {
          playSound('tick');
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameEnded, isLocked, activeModal, playSound, handleTimeOut]);

  // Select and Lock Answer with 1.8s Suspense
  const handleSelectOption = (idx: number) => {
    if (isLocked || isRevealed || gameEnded) return;

    setSelectedOpt(idx);
    setIsLocked(true);
    playSound('lock');

    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => {
      setIsRevealed(true);
      const correct = idx === curQuestion.answer_index;
      setIsCorrect(correct);

      if (correct) {
        playSound('correct');
        setAccumulatedXp(curQuestion.prize_xp);

        if (curQuestion.is_safe_milestone) {
          setSafeXpEarned(curQuestion.prize_xp);
        }

        setTimeout(() => {
          if (currentLevel < MILLIONAIRE_QUESTIONS.length - 1) {
            setCurrentLevel(prev => prev + 1);
            setSelectedOpt(null);
            setIsLocked(false);
            setIsRevealed(false);
            setIsCorrect(null);
            setHiddenOptions([]);
            setTimeLeft(TOTAL_TIME);
          } else {
            playSound('fanfare');
            setGameEnded(true);
            setEndReason('victory');
            setSafeXpEarned(curQuestion.prize_xp);
            addFaithPoints(curQuestion.prize_xp, 'Chiến Thắng Chinh Phục Chân Lý');
          }
        }, 1800);
      } else {
        playSound('wrong');
        setTimeout(() => {
          setGameEnded(true);
          setEndReason('wrong');
          if (safeXpEarned > 0) {
            addFaithPoints(safeXpEarned, 'Mốc an toàn Chinh Phục Chân Lý');
          }
        }, 1800);
      }
    }, 1800);
  };

  // Surrender / Walk away with accumulated XP
  const handleSurrender = () => {
    if (isLocked || gameEnded) return;
    if (confirm(`Bạn có chắc muốn Dừng Cuộc Chơi và bảo lưu ${accumulatedXp.toLocaleString()} Faith XP không?`)) {
      setGameEnded(true);
      setEndReason('surrender');
      setSafeXpEarned(accumulatedXp);
      if (accumulatedXp > 0) {
        addFaithPoints(accumulatedXp, 'Bảo lưu điểm Chinh Phục Chân Lý');
      }
    }
  };

  // 4 Lifelines Handlers
  const use5050 = () => {
    if (lifeline5050Used || isLocked || gameEnded) return;
    setLifeline5050Used(true);
    const wrongIdxs = [0, 1, 2, 3].filter(i => i !== curQuestion.answer_index);
    const toHide = wrongIdxs.slice(0, 2);
    setHiddenOptions(toHide);
    playSound('correct');
  };

  const useSaint = () => {
    if (lifelineSaintUsed || isLocked || gameEnded) return;
    setLifelineSaintUsed(true);
    setActiveModal('saint');
  };

  const useSpirit = () => {
    if (lifelineSpiritUsed || isLocked || gameEnded) return;
    setLifelineSpiritUsed(true);
    setActiveModal('spirit');
  };

  const useChangeQuestion = () => {
    if (lifelineChangeUsed || isLocked || gameEnded) return;
    setLifelineChangeUsed(true);
    setTimeLeft(TOTAL_TIME);
    setActiveModal('change');
  };

  const restartGame = () => {
    setCurrentLevel(0);
    setSelectedOpt(null);
    setIsLocked(false);
    setIsRevealed(false);
    setIsCorrect(null);
    setGameEnded(false);
    setAccumulatedXp(0);
    setSafeXpEarned(0);
    setLifeline5050Used(false);
    setLifelineSaintUsed(false);
    setLifelineSpiritUsed(false);
    setLifelineChangeUsed(false);
    setHiddenOptions([]);
    setTimeLeft(TOTAL_TIME);
  };

  // Dynamic SVG Timer Circle for 15 Seconds
  const timerPercent = (timeLeft / TOTAL_TIME) * 100;
  const isUrgent = timeLeft <= 5;
  const timerColor = isUrgent
    ? 'text-rose-500 stroke-rose-500 animate-pulse'
    : timeLeft > 8
    ? 'text-emerald-500 stroke-emerald-500'
    : 'text-amber-500 stroke-amber-500';

  const saintPoll = [
    { label: 'A', percent: curQuestion.answer_index === 0 ? 68 : 12 },
    { label: 'B', percent: curQuestion.answer_index === 1 ? 72 : 10 },
    { label: 'C', percent: curQuestion.answer_index === 2 ? 65 : 14 },
    { label: 'D', percent: curQuestion.answer_index === 3 ? 70 : 9 }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black text-stone-100 flex flex-col font-sans select-none pb-12 pt-28 sm:pt-32">
      
      {/* ── 1. CLEAN INTEGRATED ARENA TOP BAR (NO OVERLAPS) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/game"
            className="p-2 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/40 transition shadow-md flex items-center gap-1.5 text-xs font-serif font-bold"
            title="Về Cổng Game"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Cổng Game</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                ĐẤU TRƯỜNG PHỤNG VỤ
              </span>
            </div>
            <h1 className="font-serif font-black text-base sm:text-xl text-stone-100 truncate">
              Chinh Phục Chân Lý
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs font-mono font-bold shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{accumulatedXp.toLocaleString()} Faith XP</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-amber-500/40 transition cursor-pointer shadow-md"
            title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── 2. FULL-VIEW GAMESHOW STAGE ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT 8 COLS: QUESTION STAGE, LIFELINES & ANSWERS */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            
            {/* Top Stage Control Strip: Level Badge + Single 15s Circular Countdown + 4 Lifelines */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3">
              
              {/* Level Indicator */}
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-black text-xs shadow-inner">
                  CÂU {currentLevel + 1} / {MILLIONAIRE_QUESTIONS.length}
                </span>
                {curQuestion.is_safe_milestone && (
                  <span className="text-[11px] font-serif text-amber-400 font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    ★ MỐC AN TOÀN
                  </span>
                )}
              </div>

              {/* 15s Single Circular Animated Timer (No duplicate text) */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${timerColor} transition-all duration-1000`}
                    strokeDasharray={`${timerPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-xs font-mono font-black ${isUrgent ? 'text-rose-400 animate-ping' : 'text-stone-100'}`}>
                  {timeLeft}s
                </span>
              </div>

              {/* 4 Lifelines */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={use5050}
                  disabled={lifeline5050Used || isLocked}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    lifeline5050Used
                      ? 'bg-stone-950/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                      : 'bg-stone-950 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-sm'
                  }`}
                  title="50:50 - Loại 2 phương án sai"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">50:50</span>
                </button>

                <button
                  onClick={useSaint}
                  disabled={lifelineSaintUsed || isLocked}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    lifelineSaintUsed
                      ? 'bg-stone-950/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                      : 'bg-stone-950 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-sm'
                  }`}
                  title="Hỏi ý Thánh Bổn Mạng"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Thánh Bổn Mạng</span>
                </button>

                <button
                  onClick={useSpirit}
                  disabled={lifelineSpiritUsed || isLocked}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    lifelineSpiritUsed
                      ? 'bg-stone-950/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                      : 'bg-stone-950 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-sm'
                  }`}
                  title="Ơn Chúa Thánh Thần soi sáng"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">Ơn Soi Sáng</span>
                </button>

                <button
                  onClick={useChangeQuestion}
                  disabled={lifelineChangeUsed || isLocked}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    lifelineChangeUsed
                      ? 'bg-stone-950/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                      : 'bg-stone-950 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-sm'
                  }`}
                  title="Đổi câu hỏi cùng cấp"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Đổi Câu</span>
                </button>
              </div>

            </div>

            {/* Spotlight Question Box with Dynamic Red Pulse Under 5 Seconds */}
            <div className={`flex-1 p-6 sm:p-10 rounded-3xl min-h-[190px] sm:min-h-[230px] flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 ${
              isUrgent
                ? 'bg-gradient-to-b from-rose-950/40 via-stone-950/90 to-black border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-gradient-to-b from-stone-900/90 to-stone-950/90 border-2 border-amber-500/40 shadow-[0_20px_50px_rgba(217,119,6,0.12)]'
            }`}>
              
              {/* Top Light Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${
                isUrgent
                  ? 'bg-gradient-to-r from-rose-600 via-rose-300 to-rose-600 animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600'
              }`} />
              
              <div className="flex items-center gap-2 mb-3">
                {isUrgent && <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />}
                <span className={`text-[11px] font-mono tracking-widest uppercase font-bold ${
                  isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400/90'
                }`}>
                  {isUrgent ? '⚠️ SẮP HẾT 15 GIÂY!' : `✦ TRỊ GIÁ ${curQuestion.prize_xp.toLocaleString()} FAITH XP ✦`}
                </span>
              </div>

              <p className="text-lg sm:text-2xl md:text-3xl font-serif font-black text-amber-50 leading-relaxed max-w-2xl drop-shadow-md">
                "{curQuestion.question}"
              </p>
            </div>

            {/* 4 Answer Buttons in 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {curQuestion.options.map((opt, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                if (isHidden) {
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-stone-950/20 border border-stone-900/40 opacity-10 pointer-events-none min-h-[64px]"
                    />
                  );
                }

                let btnClasses = 'bg-stone-900/80 border-stone-800 hover:border-amber-500 hover:bg-stone-850 text-stone-100';
                
                if (selectedOpt === idx) {
                  if (isRevealed) {
                    if (isCorrect === true) {
                      btnClasses = 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-lg shadow-emerald-600/40 animate-pulse';
                    } else {
                      btnClasses = 'bg-rose-600 border-rose-400 text-white font-bold shadow-lg shadow-rose-600/40';
                    }
                  } else {
                    btnClasses = 'bg-amber-500 border-amber-300 text-slate-950 font-black shadow-xl shadow-amber-500/40 animate-pulse scale-[1.02]';
                  }
                } else if (isRevealed && idx === curQuestion.answer_index) {
                  btnClasses = 'bg-emerald-600/80 border-emerald-400 text-emerald-100 font-bold shadow-lg shadow-emerald-500/20';
                }

                return (
                  <button
                    key={idx}
                    disabled={isLocked || gameEnded}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-xs sm:text-base font-serif text-left transition-all duration-200 flex items-center gap-3.5 shadow-md cursor-pointer disabled:cursor-not-allowed min-h-[64px] ${btnClasses}`}
                  >
                    <span className="w-8 h-8 rounded-xl bg-black/50 text-amber-400 font-mono font-bold flex items-center justify-center text-xs sm:text-sm shrink-0 border border-amber-500/30">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-semibold leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Tension status label */}
            {isLocked && !isRevealed && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-serif font-bold text-center animate-pulse">
                ⏳ Đang khóa câu trả lời... Giây phút quyết định!
              </div>
            )}

            {isRevealed && curQuestion.explanation && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-serif leading-relaxed border ${
                isCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}>
                <strong className="block font-bold mb-1">
                  {isCorrect ? '✓ Chính xác tuyệt đối!' : '✕ Lời giải thích:'}
                </strong>
                <p className="italic">{curQuestion.explanation}</p>
              </div>
            )}

          </div>

          {/* RIGHT 4 COLS: FULL-HEIGHT STAINED-GLASS PRIZE LADDER & SURRENDER */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              <div className="pb-3 border-b border-stone-800 flex items-center justify-between">
                <span className="font-serif font-bold text-xs sm:text-sm text-stone-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-400" /> Thang Điểm Tri Thức
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">Faith XP</span>
              </div>

              {/* 10 Ladder Levels */}
              <div className="space-y-1.5">
                {MILLIONAIRE_QUESTIONS.slice().reverse().map((q, idx) => {
                  const actualLevel = MILLIONAIRE_QUESTIONS.length - 1 - idx;
                  const isCurrent = actualLevel === currentLevel;
                  const isPassed = actualLevel < currentLevel;

                  let rowClass = 'text-stone-500 bg-stone-950/40 border border-transparent';
                  if (isCurrent) {
                    rowClass = 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-[1.03] border-amber-300';
                  } else if (q.is_safe_milestone) {
                    rowClass = 'text-amber-300 font-bold border border-amber-500/40 bg-amber-500/10';
                  } else if (isPassed) {
                    rowClass = 'text-emerald-400 font-semibold bg-emerald-500/5 border-emerald-500/20';
                  }

                  return (
                    <div
                      key={q.id}
                      className={`flex items-center justify-between py-2 px-3.5 rounded-xl transition-all ${rowClass}`}
                    >
                      <span className="font-serif flex items-center gap-2 text-xs sm:text-sm">
                        <span>Nấc {actualLevel + 1}</span>
                        {q.is_safe_milestone && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                            MỐC ★
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold">{q.prize_xp.toLocaleString()} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Surrender & Walk Away Button */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <button
                onClick={handleSurrender}
                disabled={isLocked || gameEnded || accumulatedXp === 0}
                className="w-full py-3 rounded-2xl border border-stone-700 hover:border-amber-500/50 bg-stone-950 text-xs sm:text-sm font-serif font-bold text-stone-300 hover:text-amber-300 flex items-center justify-center gap-2 transition disabled:opacity-30 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Dừng Cuộc Chơi (Bảo Lưu {accumulatedXp.toLocaleString()} XP)</span>
              </button>
              <p className="text-[10px] text-stone-500 text-center font-serif">
                ✦ Bảo toàn toàn bộ điểm số đạt được vào Hồ Sơ cá nhân.
              </p>
            </div>

          </div>

        </div>

        {/* ── 3. INTERACTIVE SAINT & COMMUNITY POLL MODAL ── */}
        {activeModal === 'saint' && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/50 shadow-2xl text-stone-100 space-y-5 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-amber-300">
                    Ý Kiến Cộng Đồng &amp; Thánh Bổn Mạng
                  </h3>
                  <span className="text-[11px] text-stone-400 font-serif">Khảo sát trực tuyến</span>
                </div>
              </div>

              {/* Bar Chart Breakdown */}
              <div className="space-y-2.5">
                {saintPoll.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-stone-300">
                      <span>Phương án {item.label}</span>
                      <strong className="text-amber-400">{item.percent}%</strong>
                    </div>
                    <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs font-serif text-stone-300 italic">
                ✦ Lời Thánh: "{curQuestion.saint_advice}"
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md"
              >
                Tiếp Tục Đấu Trí
              </button>

            </div>
          </div>
        )}

        {/* ── 4. SCRIPTURE SCROLL MODAL (ƠN SOI SÁNG) ── */}
        {activeModal === 'spirit' && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500 shadow-2xl text-stone-100 space-y-5 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-amber-300">
                    Ơn Chúa Thánh Thần Soi Sáng
                  </h3>
                  <span className="text-[11px] text-stone-400 font-serif">Ánh sáng Lời Chúa dẫn lối</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/80 border border-amber-500/30 text-xs sm:text-sm font-serif leading-relaxed text-amber-100 italic">
                "{curQuestion.scripture_hint}"
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md"
              >
                Tạ Ơn Chúa · Trở Lại Bàn Đấu
              </button>

            </div>
          </div>
        )}

        {/* ── 5. CHANGE QUESTION NOTICE ── */}
        {activeModal === 'change' && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-stone-900 border-2 border-amber-500 shadow-2xl text-stone-100 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
              <h3 className="font-serif font-black text-lg text-amber-300">
                Đã Đổi Câu Hỏi Thành Công!
              </h3>
              <p className="text-xs font-serif text-stone-300">
                Đồng hồ đã được đặt lại 15 giây. Chúc bạn vững tin vượt ải!
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs"
              >
                Bắt Đầu
              </button>
            </div>
          </div>
        )}

        {/* ── 6. GAME OVER / VICTORY MODAL ── */}
        {gameEnded && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="max-w-lg w-full p-8 rounded-3xl bg-stone-900 border-2 border-amber-500 shadow-2xl text-stone-100 text-center space-y-5">
              
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 mx-auto text-4xl shadow-xl shadow-amber-500/20">
                {endReason === 'victory' ? '👑' : endReason === 'surrender' ? '🛡️' : '⛪'}
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-amber-300">
                  {endReason === 'victory'
                    ? 'XUẤT SẮC! TIẾN SĨ HỘI THÁNH'
                    : endReason === 'surrender'
                    ? 'BẢO TOÀN DANH HIỆU THÀNH CÔNG'
                    : endReason === 'timeout'
                    ? 'HẾT 15 GIÂY ĐẤU TRÍ'
                    : 'KẾT THÚC CHẶNG THỬ THÁCH'}
                </h3>
                <p className="text-xs sm:text-sm font-serif text-stone-300">
                  {endReason === 'victory'
                    ? 'Bạn đã chinh phục hoàn hảo 10 nấc thang chân lý tuyệt đỉnh!'
                    : `Bạn đã bảo lưu thành công phần thưởng cho tài khoản.`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400 font-serif">Tổng Phần Thưởng Nhận Được:</span>
                <div className="text-2xl font-mono font-black text-emerald-400">
                  +{safeXpEarned.toLocaleString()} Faith XP
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={restartGame}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-serif font-bold cursor-pointer"
                >
                  Thử Lại Từ Đầu
                </button>
                <Link
                  href="/game"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-black shadow-lg cursor-pointer"
                >
                  Về Cổng Game
                </Link>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
