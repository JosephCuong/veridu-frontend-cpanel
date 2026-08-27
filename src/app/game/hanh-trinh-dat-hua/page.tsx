'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Award, 
  Coins, 
  Star, 
  Shield, 
  Check, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Flame, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { getStoredUser, addFaithPoints } from '@/lib/auth';
import { MAP_ZONES, MapStage, MapZone } from '@/lib/gamesData';

export default function ExodusQuest2DGamePage() {
  const [user, setUser] = useState<any>(null);
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const [selectedStage, setSelectedStage] = useState<MapStage | null>(null);
  const [completedStages, setCompletedStages] = useState<number[]>([1]); // Stage 1 unlocked by default
  const [userScore, setUserScore] = useState({ xp: 0, manna: 100, stars: 3 });
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const curZone = MAP_ZONES[activeZoneIndex] || MAP_ZONES[0];

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const playEffectSound = (type: 'correct' | 'wrong') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const handleSelectOption = (optIdx: number) => {
    if (!selectedStage || isAnswered) return;
    setIsAnswered(true);

    if (optIdx === selectedStage.answer_index) {
      playEffectSound('correct');
      setFeedback({
        isCorrect: true,
        text: `🎉 Chính xác! Bạn nhận được +${selectedStage.reward_xp} Faith XP và +${selectedStage.reward_manna} Manna. Trạm kế tiếp đã được mở khóa!`
      });

      setUserScore(prev => ({
        xp: prev.xp + selectedStage.reward_xp,
        manna: prev.manna + selectedStage.reward_manna,
        stars: prev.stars + 3
      }));

      // Unlock Next Stage
      if (!completedStages.includes(selectedStage.id)) {
        const nextId = selectedStage.id + 1;
        setCompletedStages(prev => [...prev, selectedStage.id, nextId]);
      }

      // Add Faith Points
      addFaithPoints(selectedStage.reward_xp, `Vượt trạm ${selectedStage.title}`);

      // Save to Supabase in background
      if (user && user.id) {
        fetch('/api/game/progress/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            gameSlug: 'hanh-trinh-dat-hua',
            zoneId: curZone.id,
            stageId: selectedStage.id,
            stars: 3,
            addXp: selectedStage.reward_xp,
            addManna: selectedStage.reward_manna
          })
        });
      }
    } else {
      playEffectSound('wrong');
      setFeedback({
        isCorrect: false,
        text: `❌ Chưa chính xác. Gợi ý Lời Chúa: ${selectedStage.scripture_ref}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none pb-24 pt-16 md:pt-20">
      
      {/* ── 1. GAME TOP BAR ── */}
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
              Bản Đồ Chiến Đấu 2D
            </span>
            <h1 className="font-serif font-black text-sm sm:text-base text-stone-100 truncate">
              Hành Trình Đất Hứa
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-amber-400">
            <Coins className="w-4 h-4" />
            <span>{userScore.manna} 🍞</span>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-emerald-400">
            <Star className="w-4 h-4" />
            <span>{userScore.xp} XP</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── 2. ZONE SELECTOR TABS ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {MAP_ZONES.map((zone, idx) => (
            <button
              key={zone.id}
              onClick={() => {
                setActiveZoneIndex(idx);
                setSelectedStage(null);
                setFeedback(null);
              }}
              className={`px-4 py-2 rounded-2xl font-serif text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeZoneIndex === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>{zone.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. INTERACTIVE 2D MAP CANVAS / SVG ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] bg-gradient-to-br from-stone-900 via-stone-950 to-black rounded-3xl border-2 border-stone-800 shadow-2xl overflow-hidden p-6 flex items-center justify-center">
          
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* SVG Map Road */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 15 75 Q 35 45 48 72 T 78 38 T 88 22"
              fill="none"
              stroke="#d97706"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              opacity="0.5"
            />
          </svg>

          {/* Map Stages Nodes */}
          {curZone.stages.map((stage) => {
            const isCompleted = completedStages.includes(stage.id);
            const isUnlocked = isCompleted || completedStages.includes(stage.id - 1);
            const isSelected = selectedStage?.id === stage.id;

            return (
              <div
                key={stage.id}
                style={{
                  position: 'absolute',
                  left: `${stage.x_percent}%`,
                  top: `${stage.y_percent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="flex flex-col items-center group cursor-pointer z-20"
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedStage(stage);
                    setIsAnswered(false);
                    setFeedback(null);
                  }
                }}
              >
                <button
                  disabled={!isUnlocked}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all flex items-center justify-center text-xl sm:text-2xl shadow-xl ${
                    isSelected
                      ? 'bg-amber-400 border-white ring-4 ring-amber-400/50 scale-110'
                      : isCompleted
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : isUnlocked
                      ? 'bg-amber-500 border-amber-300 text-slate-950 animate-bounce'
                      : 'bg-stone-900 border-stone-800 text-stone-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? '✓' : stage.icon}
                </button>

                <div className="mt-2 text-center pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-serif font-bold text-stone-200 block drop-shadow-md">
                    {stage.title}
                  </span>
                  <span className="text-[9px] font-mono text-amber-400">
                    +{stage.reward_xp} XP
                  </span>
                </div>
              </div>
            );
          })}

        </div>

        {/* ── 4. STAGE CHALLENGE MODAL / PANEL ── */}
        {selectedStage && (
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/40 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedStage.icon}</span>
                <div>
                  <h3 className="font-serif font-black text-lg sm:text-xl text-amber-300">
                    {selectedStage.title}: {selectedStage.subtitle}
                  </h3>
                  <span className="text-xs text-stone-400 font-serif flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Trích đoạn: {selectedStage.scripture_ref}
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/30 font-bold">
                +{selectedStage.reward_xp} XP / +{selectedStage.reward_manna} Manna
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <p className="text-sm sm:text-base font-serif text-stone-200 leading-relaxed font-bold">
                {selectedStage.question}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedStage.options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl text-xs sm:text-sm font-serif text-left border transition flex items-center gap-3 cursor-pointer ${
                    isAnswered && idx === selectedStage.answer_index
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-stone-950/70 border-stone-800 hover:border-amber-500 text-stone-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {feedback && (
              <div className={`p-4 rounded-2xl text-xs font-serif font-bold ${
                feedback.isCorrect 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                <p>{feedback.text}</p>
                {selectedStage.explanation && (
                  <p className="text-[11px] text-stone-300 mt-1.5 font-normal italic">
                    ✦ Ý nghĩa: {selectedStage.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
