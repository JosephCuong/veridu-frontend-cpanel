'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Zap
} from 'lucide-react';
import { getStoredUser, addFaithPoints } from '@/lib/auth';
import { MILLIONAIRE_QUESTIONS, MillionaireQuestion } from '@/lib/gamesData';

export default function FaithMillionaireGamePage() {
  const [user, setUser] = useState<any>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [safeXpEarned, setSafeXpEarned] = useState(0);

  // 4 Lifelines
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineSaintUsed, setLifelineSaintUsed] = useState(false);
  const [lifelineSpiritUsed, setLifelineSpiritUsed] = useState(false);
  const [lifelineChangeUsed, setLifelineChangeUsed] = useState(false);

  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [activeModalMessage, setActiveModalMessage] = useState<{ title: string; text: string } | null>(null);

  const curQuestion: MillionaireQuestion = MILLIONAIRE_QUESTIONS[currentLevel] || MILLIONAIRE_QUESTIONS[0];

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleSelectOption = (idx: number) => {
    if (isAnswered || gameEnded) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === curQuestion.answer_index) {
      setIsCorrect(true);

      // If safe milestone, update safe XP
      if (curQuestion.is_safe_milestone) {
        setSafeXpEarned(curQuestion.prize_xp);
      }

      setTimeout(() => {
        if (currentLevel < MILLIONAIRE_QUESTIONS.length - 1) {
          setCurrentLevel(prev => prev + 1);
          setSelectedOpt(null);
          setIsAnswered(false);
          setIsCorrect(null);
          setHiddenOptions([]);
        } else {
          // Victory! Level 10 completed!
          setGameEnded(true);
          setSafeXpEarned(curQuestion.prize_xp);
          addFaithPoints(curQuestion.prize_xp, 'Chiến Thắng Ai Là Triệu Phú Đức Tin');
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setGameEnded(true);
        if (safeXpEarned > 0) {
          addFaithPoints(safeXpEarned, 'Mốc an toàn Ai Là Triệu Phú Đức Tin');
        }
      }, 1500);
    }
  };

  // Lifelines
  const use5050 = () => {
    if (lifeline5050Used || isAnswered) return;
    setLifeline5050Used(true);
    const wrongIdxs = [0, 1, 2, 3].filter(i => i !== curQuestion.answer_index);
    const toHide = wrongIdxs.slice(0, 2);
    setHiddenOptions(toHide);
  };

  const useSaint = () => {
    if (lifelineSaintUsed || isAnswered) return;
    setLifelineSaintUsed(true);
    setActiveModalMessage({
      title: '🕊️ Lời Khuyên Của Thánh Bổn Mạng',
      text: curQuestion.saint_advice || 'Hãy suy ngẫm sâu sắc về Lời Chúa và Giáo Lý Hội Thánh!'
    });
  };

  const useSpirit = () => {
    if (lifelineSpiritUsed || isAnswered) return;
    setLifelineSpiritUsed(true);
    setActiveModalMessage({
      title: '🔥 Ơn Chúa Thánh Thần Soi Sáng',
      text: `Đoạn Kinh Thánh liên quan: "${curQuestion.scripture_hint}"`
    });
  };

  const useChangeQuestion = () => {
    if (lifelineChangeUsed || isAnswered) return;
    setLifelineChangeUsed(true);
    setActiveModalMessage({
      title: '🔄 Đã Đổi Câu Hỏi',
      text: 'Thử thách mới đã được chuẩn bị sẵn sàng cho bạn!'
    });
  };

  const restartGame = () => {
    setCurrentLevel(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setGameEnded(false);
    setSafeXpEarned(0);
    setLifeline5050Used(false);
    setLifelineSaintUsed(false);
    setLifelineSpiritUsed(false);
    setLifelineChangeUsed(false);
    setHiddenOptions([]);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none pb-24 pt-16 md:pt-20">
      
      {/* ── 1. HEADER ── */}
      <header className="h-16 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/game"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            title="Về Cổng Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Đấu Trường Đố Vui
            </span>
            <h1 className="font-serif font-black text-sm sm:text-base text-stone-100 truncate">
              Ai Là Triệu Phú Đức Tin
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-bold">
            Câu {currentLevel + 1} / {MILLIONAIRE_QUESTIONS.length}
          </span>
        </div>
      </header>

      {/* ── 2. MAIN ARENA ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        
        {/* 4 Lifelines Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={use5050}
            disabled={lifeline5050Used}
            className={`p-3 rounded-2xl border text-xs font-serif font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              lifeline5050Used
                ? 'bg-stone-900/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                : 'bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-md'
            }`}
          >
            <span>⚖️ 50:50</span>
          </button>

          <button
            onClick={useSaint}
            disabled={lifelineSaintUsed}
            className={`p-3 rounded-2xl border text-xs font-serif font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              lifelineSaintUsed
                ? 'bg-stone-900/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                : 'bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-md'
            }`}
          >
            <span>🕊️ Thánh Bổn Mạng</span>
          </button>

          <button
            onClick={useSpirit}
            disabled={lifelineSpiritUsed}
            className={`p-3 rounded-2xl border text-xs font-serif font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              lifelineSpiritUsed
                ? 'bg-stone-900/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                : 'bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-md'
            }`}
          >
            <span>🔥 Ơn Soi Sáng</span>
          </button>

          <button
            onClick={useChangeQuestion}
            disabled={lifelineChangeUsed}
            className={`p-3 rounded-2xl border text-xs font-serif font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              lifelineChangeUsed
                ? 'bg-stone-900/40 border-stone-800 text-stone-600 opacity-40 cursor-not-allowed'
                : 'bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shadow-md'
            }`}
          >
            <span>🔄 Đổi Câu Hỏi</span>
          </button>
        </div>

        {/* Board & Ladder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Question Board */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/40 min-h-[160px] flex items-center justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />
              <p className="text-base sm:text-xl font-serif font-bold text-amber-100 leading-relaxed">
                "{curQuestion.question}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {curQuestion.options.map((opt, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                if (isHidden) {
                  return <div key={idx} className="p-4 rounded-2xl bg-stone-950/30 border border-stone-900 opacity-20" />;
                }

                let btnStyle = 'bg-stone-900 border-stone-800 hover:border-amber-500 text-stone-300';
                if (selectedOpt === idx) {
                  if (isCorrect === true) {
                    btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-400 animate-pulse';
                  } else if (isCorrect === false) {
                    btnStyle = 'bg-rose-600 text-white font-bold border-rose-400';
                  } else {
                    btnStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                  }
                } else if (isAnswered && idx === curQuestion.answer_index) {
                  btnStyle = 'bg-emerald-600/60 text-emerald-200 font-bold border-emerald-400';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-serif text-left transition flex items-center gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Money/XP Ladder */}
          <div className="lg:col-span-4 p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-1.5 text-xs font-mono">
            <div className="text-[11px] font-bold text-stone-400 font-serif uppercase tracking-wider pb-2 border-b border-stone-800 flex items-center justify-between">
              <span>🏆 Thang Điểm Tri Thức</span>
              <span className="text-amber-400">XP Thưởng</span>
            </div>

            {MILLIONAIRE_QUESTIONS.slice().reverse().map((q, idx) => {
              const actualLevel = MILLIONAIRE_QUESTIONS.length - 1 - idx;
              const isCurrent = actualLevel === currentLevel;
              const isPassed = actualLevel < currentLevel;

              return (
                <div
                  key={q.id}
                  className={`flex justify-between py-1 px-2.5 rounded-xl transition ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : q.is_safe_milestone
                      ? 'text-amber-300 font-bold border border-amber-500/30'
                      : isPassed
                      ? 'text-emerald-400'
                      : 'text-stone-500'
                  }`}
                >
                  <span className="font-serif">
                    Câu {actualLevel + 1} {q.is_safe_milestone && '⭐'}
                  </span>
                  <span>{q.prize_xp.toLocaleString()} XP</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── 3. MODAL POPUP FOR LIFELINES ── */}
        {activeModalMessage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-stone-900 border-2 border-amber-500 shadow-2xl text-stone-100 space-y-4 text-center">
              <h3 className="font-serif font-black text-lg text-amber-300">
                {activeModalMessage.title}
              </h3>
              <p className="text-xs sm:text-sm font-serif text-stone-200 leading-relaxed italic">
                {activeModalMessage.text}
              </p>
              <button
                onClick={() => setActiveModalMessage(null)}
                className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        )}

        {/* ── 4. GAME OVER / VICTORY MODAL ── */}
        {gameEnded && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-8 rounded-3xl bg-stone-900 border-2 border-amber-500 shadow-2xl text-stone-100 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 mx-auto text-3xl">
                🏆
              </div>

              <h3 className="font-serif font-black text-2xl text-amber-300">
                {currentLevel >= MILLIONAIRE_QUESTIONS.length - 1 && isCorrect
                  ? '👑 XUẤT SẮC! TIẾN SĨ HỘI THÁNH'
                  : 'KẾT THÚC THỬ THÁCH'}
              </h3>

              <p className="text-xs sm:text-sm font-serif text-stone-300 leading-relaxed">
                Bạn đã hoàn thành chặng thi đấu và bảo lưu được{' '}
                <strong className="text-emerald-400 font-mono">+{safeXpEarned.toLocaleString()} Faith XP</strong>!
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={restartGame}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-serif font-bold cursor-pointer"
                >
                  Chơi Lại
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
