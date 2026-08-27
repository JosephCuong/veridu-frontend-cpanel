'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Award, 
  Coins, 
  Star, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Lock, 
  Play, 
  RotateCcw,
  Info,
  X
} from 'lucide-react';
import { getStoredUser, addFaithPoints } from '@/lib/auth';
import { MAP_ZONES, MapStage, MapZone } from '@/lib/gamesData';

export default function ExodusQuestGamePage() {
  const [user, setUser] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<MapZone>(MAP_ZONES[0]);
  const [activeStage, setActiveStage] = useState<MapStage | null>(null);
  
  // Quiz dialog in stage
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stageProgress, setStageProgress] = useState<Record<number, { stars: number; unlocked: boolean }>>({
    1: { stars: 0, unlocked: true }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const playSound = (type: 'win' | 'fail' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'win') {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.4);
        });
      } else if (type === 'fail') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const handleStageClick = (stage: MapStage) => {
    const isUnlocked = stageProgress[stage.id]?.unlocked || stage.id === 1;
    if (!isUnlocked) return;
    setActiveStage(stage);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !activeStage) return;

    setIsSubmitted(true);
    const correct = selectedAnswer === activeStage.answer_index;
    setIsCorrect(correct);

    if (correct) {
      playSound('win');
      setStageProgress(prev => ({
        ...prev,
        [activeStage.id]: { stars: 3, unlocked: true },
        [activeStage.id + 1]: { stars: 0, unlocked: true }
      }));

      // Add Faith Points
      addFaithPoints(activeStage.reward_xp, `Vượt ải ${activeStage.title}`);

      // Call API save progress
      if (user && user.id) {
        fetch('/api/game/progress/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            gameSlug: 'hanh-trinh-dat-hua',
            zoneId: activeStage.zone_id,
            stageId: activeStage.id,
            stars: 3,
            addXp: activeStage.reward_xp,
            addManna: activeStage.reward_manna
          })
        });
      }
    } else {
      playSound('fail');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none pb-12 pt-28 sm:pt-32">
      
      {/* Top Header */}
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
                BẢN ĐỒ CHIẾN ĐẤU 2D
              </span>
            </div>
            <h1 className="font-serif font-black text-base sm:text-xl text-stone-100 truncate">
              Hành Trình Đất Hứa
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRules(true)}
            className="px-3 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-serif font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Luật Chơi</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-amber-500/40 transition cursor-pointer shadow-md"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center">
        
        {/* Zone Selector */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {MAP_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-2 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedZone.id === zone.id
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{zone.title}</span>
            </button>
          ))}
        </div>

        {/* 2D Interactive Map Stage */}
        <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/30 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
          
          {/* Animated Background Grid & Sacred Terrain */}
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* SVG Journey Trail Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 120 380 Q 250 300 400 360 T 680 280 T 900 120"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="8 8"
              className="opacity-40 animate-pulse"
            />
          </svg>

          {/* Map Title Info */}
          <div className="relative z-10 space-y-1">
            <h2 className="font-serif font-black text-xl sm:text-2xl text-amber-200">
              {selectedZone.title}
            </h2>
            <p className="text-xs text-stone-400 font-serif max-w-lg">
              {selectedZone.description}
            </p>
          </div>

          {/* Interactive Stages Markers */}
          <div className="absolute inset-0 z-20">
            {selectedZone.stages.map((stage) => {
              const prog = stageProgress[stage.id] || { stars: 0, unlocked: stage.id === 1 };
              const isUnlocked = prog.unlocked;
              const hasPassed = prog.stars > 0;

              return (
                <div
                  key={stage.id}
                  style={{ left: `${stage.x_percent}%`, top: `${stage.y_percent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  onClick={() => handleStageClick(stage)}
                >
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-xl ${
                      hasPassed
                        ? 'bg-emerald-600 border-2 border-emerald-300 text-white shadow-emerald-600/30'
                        : isUnlocked
                        ? 'bg-amber-500 border-2 border-amber-300 text-slate-950 shadow-amber-500/40 animate-bounce'
                        : 'bg-stone-900 border-2 border-stone-800 text-stone-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span>{stage.icon}</span>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-2 px-3 py-1 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px] font-serif font-bold text-stone-200 whitespace-nowrap shadow-md group-hover:border-amber-500/50 transition">
                    {stage.title}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Stage Challenge Modal */}
        {activeStage && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/50 shadow-2xl text-stone-100 space-y-5 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeStage.icon}</span>
                  <div>
                    <h3 className="font-serif font-black text-lg text-amber-300">
                      {activeStage.title}
                    </h3>
                    <span className="text-[11px] text-amber-400/80 font-serif font-bold">
                      {activeStage.scripture_ref}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <span>+{activeStage.reward_xp} XP</span>
                </div>
              </div>

              {/* Question */}
              <p className="font-serif font-bold text-sm sm:text-base text-stone-100 leading-relaxed">
                "{activeStage.question}"
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {activeStage.options.map((opt, idx) => {
                  let btnClasses = 'bg-stone-950 border-stone-800 hover:border-amber-500 text-stone-300';
                  if (selectedAnswer === idx) {
                    if (isSubmitted) {
                      btnClasses = isCorrect
                        ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                        : 'bg-rose-600 border-rose-400 text-white font-bold';
                    } else {
                      btnClasses = 'bg-amber-500 border-amber-400 text-slate-950 font-bold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-serif text-left transition flex items-center gap-3 cursor-pointer ${btnClasses}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-black/40 text-amber-400 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className={`p-3.5 rounded-2xl text-xs font-serif leading-relaxed border ${
                  isCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}>
                  <strong>{isCorrect ? '✓ Vượt ải thành công!' : '✕ Chưa chính xác:'}</strong>
                  <p className="mt-1">{activeStage.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveStage(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-serif font-bold cursor-pointer"
                >
                  Đóng
                </button>
                {!isSubmitted ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-serif font-bold disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    Xác Nhận Lời Đáp
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveStage(null)}
                    className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-serif font-bold cursor-pointer shadow-md"
                  >
                    Tiếp Tục Bản Đồ
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* RULES MODAL FOR 2D MAP */}
        {showRules && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-stone-900 border-2 border-amber-500/50 shadow-2xl text-stone-100 space-y-5 animate-in zoom-in-95 duration-200 relative">
              
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-amber-300">
                    Luật Chơi: Hành Trình Đất Hứa 2D
                  </h3>
                  <span className="text-[11px] text-stone-400 font-serif">Khám phá &amp; Vượt ải Kinh Thánh</span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs font-serif leading-relaxed text-stone-300 max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <strong className="text-amber-400 font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> 1. Vượt 12 Trạm Xuất Hành
                  </strong>
                  <p className="text-stone-400">
                    Hành trình gồm 4 Vùng Đất Thánh Kinh. Người chơi bắt đầu từ Trạm 1 (Bụi Cây Bốc Cháy) và phải vượt qua từng ải để mở khóa trạm kế tiếp.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <strong className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Star className="w-4 h-4" /> 2. Đánh Giá 3 Sao &amp; Phần Thưởng
                  </strong>
                  <p className="text-stone-400">
                    Trả lời chính xác thử thách Kinh Thánh tại mỗi trạm để đạt <strong>3 Sao Tuyệt Đối</strong>, nhận ngay <strong>+{40} XP</strong> và <strong>+{20} Bánh Manna</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <strong className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Coins className="w-4 h-4" /> 3. Đổi Quà Tại Cửa Tiệm Hồng Ân
                  </strong>
                  <p className="text-stone-400">
                    Dùng Bánh Manna tích lũy được để đổi lấy Huy Hiệu Thánh, Khung Avatar Ánh Sáng và trọn bộ file PDF Tranh Tô Màu Kinh Thánh.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md hover:bg-amber-400 transition"
              >
                Đã Hiểu · Khám Phá Bản Đồ
              </button>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
