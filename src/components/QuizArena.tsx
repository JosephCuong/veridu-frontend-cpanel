'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { 
  QuizQuestion, 
  ParticipantState, 
  BIBLICAL_AVATARS, 
  BiblicalAvatar,
  calculateSpeedBonus, 
  fetchQuizQuestions,
  recordQuizAttempt 
} from '@/lib/quiz';
import { 
  Trophy, 
  Flame, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Radio, 
  Award,
  BookOpen
} from 'lucide-react';

interface QuizArenaProps {
  mode: 'solo' | 'live';
  roomPin?: string;
  category?: string;
}

export default function QuizArena({ mode, roomPin = '789012', category = 'all' }: QuizArenaProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Participant Profile & Avatar
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<BiblicalAvatar>(BIBLICAL_AVATARS[0]);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);

  // Match State
  const [gameStatus, setGameStatus] = useState<'lobby' | 'question_active' | 'showing_answer' | 'leaderboard' | 'ended'>('lobby');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showAntiCheatWarning, setShowAntiCheatWarning] = useState(false);

  // Questions & Timer
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLiveQuestion, setCurrentLiveQuestion] = useState<QuizQuestion | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastRoundScoreAdded, setLastRoundScoreAdded] = useState(0);

  // Live Room Presence & Leaderboard
  const [lobbyParticipants, setLobbyParticipants] = useState<ParticipantState[]>([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState<ParticipantState[]>([]);
  const roomChannelRef = useRef<any>(null);
  const soloTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check User on mount
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored) {
      setPlayerName(stored.displayName || stored.christianName || stored.username || 'Thí Sinh');
    }
  }, []);

  // ── Tab Switch Anti-Cheat Detection ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStatus === 'question_active') {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          if (next >= 1) {
            setShowAntiCheatWarning(true);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStatus]);

  // ── LIVE MODE REALTIME WEBSOCKET SYNC ──
  useEffect(() => {
    if (mode !== 'live' || !hasJoinedLobby || !roomPin) return;

    const channel = supabase.channel(`room:${roomPin}`, {
      config: {
        broadcast: { ack: true },
        presence: { key: `player_${user?.id || Math.random().toString(36).substring(7)}` }
      }
    });

    roomChannelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const list: ParticipantState[] = [];

        Object.keys(state).forEach((key) => {
          if (!key.startsWith('host_')) {
            const pres: any = state[key];
            if (pres && pres[0]) {
              list.push({
                id: key,
                name: pres[0].name,
                avatarUrl: pres[0].avatarUrl,
                characterName: pres[0].characterName,
                score: pres[0].score || 0,
                streak: pres[0].streak || 0
              });
            }
          }
        });

        setLobbyParticipants(list);
      })
      .on('broadcast', { event: 'sync_state' }, (payload) => {
        const data = payload.payload;
        
        if (data.status === 'question_active') {
          setGameStatus('question_active');
          setCurrentIndex(data.questionIndex || 0);
          setCurrentLiveQuestion(data.questionData || null);
          setTotalQuestions(data.totalQuestions || 10);
          setTimeLeft(data.time || 20);
          setSelectedOption(null);
          setIsAnswered(false);
          setLastRoundScoreAdded(0);
        } else if (data.status === 'showing_answer') {
          setGameStatus('showing_answer');
          setCurrentIndex(data.questionIndex || 0);
          setCurrentLiveQuestion(data.questionData || null);
        } else if (data.status === 'leaderboard') {
          setGameStatus('leaderboard');
          if (data.leaderboard) {
            setLiveLeaderboard(data.leaderboard);
          }
        } else if (data.status === 'ended') {
          setGameStatus('ended');
          if (data.leaderboard) {
            setLiveLeaderboard(data.leaderboard);
          }
        }
      })
      .on('broadcast', { event: 'kick_player' }, (payload) => {
        if (payload.payload?.playerId === `player_${user?.id}`) {
          alert('Bạn đã được Quản trò mời rời khỏi phòng thi.');
          window.location.href = '/quiz';
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user?.id,
            name: playerName,
            avatarUrl: selectedAvatar.avatarUrl,
            characterSlug: selectedAvatar.id,
            characterName: selectedAvatar.name,
            score: score,
            streak: streak
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, hasJoinedLobby, roomPin, user?.id, playerName, selectedAvatar, score, streak]);

  // ── SOLO MODE LOGIC ──
  useEffect(() => {
    if (mode === 'solo') {
      async function initSolo() {
        const data = await fetchQuizQuestions(category === 'all' ? undefined : category, 10);
        if (data && data.length > 0) {
          setQuestions(data);
          setTotalQuestions(data.length);
          setCurrentIndex(0);
          startSoloQuestion(0, data);
        }
      }
      initSolo();
    }

    return () => {
      if (soloTimerRef.current) clearInterval(soloTimerRef.current);
    };
  }, [mode, category]);

  const startSoloQuestion = (idx: number, qList: QuizQuestion[]) => {
    if (soloTimerRef.current) clearInterval(soloTimerRef.current);

    setCurrentIndex(idx);
    setCurrentLiveQuestion(qList[idx]);
    setGameStatus('question_active');
    setTimeLeft(20);
    setSelectedOption(null);
    setIsAnswered(false);
    setLastRoundScoreAdded(0);

    let sec = 20;
    soloTimerRef.current = setInterval(() => {
      sec -= 1;
      setTimeLeft(sec);
      if (sec <= 0) {
        if (soloTimerRef.current) clearInterval(soloTimerRef.current);
        handleSoloTimeUp(idx, qList);
      }
    }, 1000);
  };

  const handleSoloTimeUp = (idx: number, qList: QuizQuestion[]) => {
    setGameStatus('showing_answer');
  };

  const handleNextSoloQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      startSoloQuestion(currentIndex + 1, questions);
    } else {
      setGameStatus('ended');
      if (user) {
        recordQuizAttempt({
          userId: user.id,
          userName: playerName,
          characterAvatar: selectedAvatar.avatarUrl,
          title: `Luyện Tập Cá Nhân - ${category}`,
          score: score,
          total: questions.length * 1500,
          percentage: Math.round((score / (questions.length * 1500)) * 100),
          category: category
        });
      }
    }
  };

  // ── PARTICIPANT ANSWER SELECTION ──
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || gameStatus !== 'question_active' || !currentLiveQuestion) return;

    setIsAnswered(true);
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentLiveQuestion.correctAnswerIndex;
    let addedScore = 0;
    let newStreak = 0;

    if (isCorrect) {
      addedScore = calculateSpeedBonus(timeLeft, 20, streak);
      newStreak = streak + 1;
      setScore((prev) => prev + addedScore);
      setStreak(newStreak);
      setLastRoundScoreAdded(addedScore);
    } else {
      newStreak = 0;
      setStreak(0);
      setLastRoundScoreAdded(0);
    }

    if (mode === 'live' && roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'submit_answer',
        payload: {
          playerId: `player_${user?.id || playerName}`,
          answerIndex: optionIndex,
          timeRemaining: timeLeft,
          isCorrect,
          scoreAdded: addedScore
        }
      });
    } else if (mode === 'solo') {
      if (soloTimerRef.current) clearInterval(soloTimerRef.current);
      setGameStatus('showing_answer');
    }
  };

  // ── LOBBY CONFIRMATION ──
  const handleConfirmJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!playerName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }
    setHasJoinedLobby(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* ── ANTI-CHEAT WARNING MODAL ── */}
      {showAntiCheatWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-red-500/60 max-w-md text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-serif font-black text-2xl text-red-500">Cảnh Báo Chuyển Tab!</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Hệ thống phát hiện bạn vừa rời khỏi màn hình thi đấu ({tabSwitchCount} lần). Hãy tập trung làm bài để bảo đảm tính công bằng trong Đấu Trường Lời Chúa!
            </p>
            <button
              onClick={() => setShowAntiCheatWarning(false)}
              className="w-full py-3 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg hover:bg-red-600 transition"
            >
              Tôi Đã Hiểu &amp; Tiếp Tục
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE LOBBY: ONBOARDING & BIBLICAL AVATAR PICKER ── */}
      {mode === 'live' && !hasJoinedLobby && (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl space-y-8 animate-fadeIn">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Chuẩn Bị Vào Phòng Thi (PIN: {roomPin})
            </div>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
              Chọn Nhân Vật Kinh Thánh Đại Diện
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] italic">
              Chọn một đấng bảo trợ đức tin làm biểu tượng chiến binh tri thức của bạn trong trận đấu này!
            </p>
          </div>

          <form onSubmit={handleConfirmJoinLobby} className="space-y-6">
            
            {/* Nickname Input */}
            <div className="space-y-2 max-w-md mx-auto">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block text-center">
                Tên Hoặc Biệt Danh Hiển Thị:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ví dụ: Giuse Cường, Maria Thảo..."
                className="w-full text-center px-4 py-3 rounded-2xl bg-[var(--bg-main)] border-2 border-amber-500/40 font-serif font-bold text-lg text-[var(--text-main)] focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Biblical Character Avatar Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block text-center">
                Chọn Hình Tượng 12 Nhân Vật Kinh Thánh:
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {BIBLICAL_AVATARS.map((av) => {
                  const isSelected = selectedAvatar.id === av.id;

                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center relative ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-xl shadow-amber-500/20 scale-105'
                          : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-amber-500/50 shadow-md">
                        <Image src={av.avatarUrl} alt={av.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-serif font-bold text-xs text-[var(--text-main)] block">
                          {av.name}
                        </span>
                        <span className="text-[10px] text-amber-500 font-semibold block truncate max-w-[90px]">
                          {av.title}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ready Button */}
            <div className="pt-4 max-w-md mx-auto">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-base flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/30 hover:scale-105"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>SẴN SÀNG VÀO PHÒNG ĐẤU &rarr;</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ── LIVE LOBBY: WAITING FOR HOST TO START ── */}
      {mode === 'live' && hasJoinedLobby && gameStatus === 'lobby' && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/30 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4 border-amber-500 relative shadow-xl scale-110">
            <Image src={selectedAvatar.avatarUrl} alt={selectedAvatar.name} fill className="object-cover" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Xin Chào, {playerName}!
            </h3>
            <p className="text-amber-500 font-bold text-xs uppercase tracking-wider">
              Đại diện: {selectedAvatar.name} &bull; {selectedAvatar.title}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 max-w-md mx-auto">
            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Đã kết nối! Đang đợi Quản trò bấm &ldquo;Bắt Đầu Thi Đấu&rdquo;...</span>
          </div>

          {/* Connected players preview */}
          <div className="pt-4 border-t border-[var(--border-card)] space-y-3">
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              Các bạn cùng chơi đang có mặt ({lobbyParticipants.length}):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {lobbyParticipants.map((p, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{p.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── QUESTION ACTIVE STAGE ── */}
      {gameStatus === 'question_active' && currentLiveQuestion && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header Progress & Timer */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                Câu {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                {currentLiveQuestion.category}
              </span>
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 font-mono">
                <span>{score.toLocaleString()} đ</span>
              </div>
              {streak > 1 && (
                <div className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{streak}</span>
                </div>
              )}
            </div>

            {/* Timer Clock */}
            <div className={`px-4 py-1.5 rounded-xl font-mono font-black text-base flex items-center gap-1.5 ${
              timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-main)] text-amber-500 border border-amber-500/30'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/40 shadow-2xl text-center space-y-4">
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-main)] leading-relaxed">
              {currentLiveQuestion.questionText}
            </h2>
          </div>

          {/* 4 Interactive Option Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentLiveQuestion.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;

              let btnClass = 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-main)] hover:border-amber-500/60 hover:scale-[1.02]';
              if (isSelected) {
                btnClass = 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xl shadow-amber-500/30 scale-[1.02]';
              } else if (isAnswered) {
                btnClass = 'bg-[var(--bg-card)] border-[var(--border-card)] opacity-40 cursor-not-allowed';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-6 rounded-3xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${btnClass}`}
                >
                  <div className={`w-10 h-10 rounded-2xl font-black text-base flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-slate-950 text-amber-500' : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {letter}
                  </div>
                  <span className="font-serif font-bold text-base sm:text-lg flex-1">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center text-xs font-bold text-amber-500 animate-fadeIn">
              🔒 Đã khóa đáp án! Đang đợi công bố kết quả...
            </div>
          )}

        </div>
      )}

      {/* ── SHOWING ANSWER STAGE ── */}
      {gameStatus === 'showing_answer' && currentLiveQuestion && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Result Banner */}
          {(() => {
            const isUserCorrect = selectedOption === currentLiveQuestion.correctAnswerIndex;

            return (
              <div className={`p-8 rounded-3xl border-2 text-center space-y-3 shadow-2xl ${
                isUserCorrect
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-red-500/20 border-red-500 text-red-400'
              }`}>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-white/10">
                  {isUserCorrect ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-400" />
                  )}
                </div>

                <h3 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
                  {isUserCorrect ? 'Chính Xác!' : selectedOption !== null ? 'Chưa Đúng Rồi!' : 'Hết Giờ!'}
                </h3>

                {isUserCorrect && (
                  <p className="font-mono font-black text-lg text-amber-500">
                    +{lastRoundScoreAdded.toLocaleString()} Điểm
                  </p>
                )}
              </div>
            );
          })()}

          {/* Correct Answer & Explanation Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Đáp án đúng là:
              </span>
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-serif font-black text-lg sm:text-xl">
                {String.fromCharCode(65 + currentLiveQuestion.correctAnswerIndex)}. {currentLiveQuestion.options[currentLiveQuestion.correctAnswerIndex]}
              </div>
            </div>

            {/* Scripture & Explanation */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
              {currentLiveQuestion.scriptureRef && (
                <span className="inline-block px-3 py-1 rounded bg-amber-500/20 text-amber-500 font-mono text-xs font-bold">
                  📖 {currentLiveQuestion.scriptureRef}
                </span>
              )}
              <p className="font-serif italic text-xs sm:text-sm text-[var(--text-main)] leading-relaxed pl-3 border-l-2 border-amber-500">
                &ldquo;{currentLiveQuestion.explanation}&rdquo;
              </p>
            </div>
          </div>

          {/* Solo Mode Next Question Button */}
          {mode === 'solo' && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleNextSoloQuestion}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-base flex items-center gap-2 hover:bg-amber-400 transition shadow-xl shadow-amber-500/30"
              >
                <span>{currentIndex + 1 < questions.length ? 'Sang Câu Kế Tiếp' : 'Xem Kết Quả Tổng Kết'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* ── LIVE LEADERBOARD STAGE ── */}
      {gameStatus === 'leaderboard' && (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" /> Bảng Phong Thần Tức Thì
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Top Chiến Binh Dẫn Đầu
            </h2>
          </div>

          <div className="space-y-3">
            {liveLeaderboard.slice(0, 5).map((p, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  idx === 0
                    ? 'bg-amber-500/20 border-amber-500/60 shadow-lg'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-amber-500/40">
                    {p.avatarUrl ? (
                      <Image src={p.avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="font-serif font-bold text-sm text-[var(--text-main)]">
                    {p.name} {p.characterName && <span className="text-[11px] text-amber-500">({p.characterName})</span>}
                  </span>
                </div>

                <span className="font-mono font-black text-base text-amber-500">
                  {p.score.toLocaleString()} đ
                </span>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-[var(--text-muted)] italic pt-2">
            Đang đợi Quản trò chuyển sang câu hỏi tiếp theo...
          </div>
        </div>
      )}

      {/* ── FINAL GAME OVER / PODIUM STAGE ── */}
      {gameStatus === 'ended' && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border-2 border-amber-500/50 shadow-2xl text-center space-y-8 animate-fadeIn">
          
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-500 flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)]">
              Hoàn Tất Trận Đấu!
            </h2>
            <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] italic">
              Chúc mừng bạn đã hoàn thành thử thách tri thức Lời Chúa.
            </p>
          </div>

          {/* Final Score Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] max-w-sm mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Tổng Điểm Của Bạn
            </span>
            <div className="font-mono font-black text-4xl text-amber-500">
              {score.toLocaleString()} đ
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/quiz"
              className="px-8 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-sm flex items-center gap-2 hover:bg-amber-400 transition shadow-xl shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Về Trang Đấu Trường Quiz</span>
            </Link>
          </div>

        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            const u = getStoredUser();
            setUser(u);
            if (u) setPlayerName(u.displayName || u.christianName || u.username || 'Thí Sinh');
          }}
        />
      )}

    </div>
  );
}
