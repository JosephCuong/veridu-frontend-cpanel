'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion, MOCK_QUIZ_QUESTIONS, calculateSpeedBonus, fetchQuizQuestions } from '@/lib/quiz';
import { supabase } from '@/lib/supabaseClient';
import { 
  Trophy, Flame, Clock, AlertTriangle, CheckCircle2, XCircle, 
  RotateCcw, ArrowRight 
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';

interface QuizArenaProps {
  mode: 'solo' | 'live';
  roomPin?: string;
  category?: string;
}

export default function QuizArena({ mode, roomPin = '789012', category = 'all' }: QuizArenaProps) {
  // Common State
  const [gameStatus, setGameStatus] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showAntiCheatWarning, setShowAntiCheatWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Solo State
  const getCategoryName = (slug: string) => {
    switch (slug) {
      case 'bible': return 'Kinh Thánh';
      case 'catechism': return 'Giáo Lý';
      case 'liturgy': return 'Phụng Vụ';
      case 'history': return 'Lịch Sử';
      default: return 'Tất cả';
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>(getCategoryName(category));
  const [difficulty, setDifficulty] = useState<'Thường' | 'Thử Thách'>('Thường');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Shared Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Live State
  const [currentLiveQuestion, setCurrentLiveQuestion] = useState<QuizQuestion | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [hasJoinedLive, setHasJoinedLive] = useState(false);

  // -------------------------------------------------------------
  // REAL-TIME (LIVE MODE) LOGIC
  // -------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'live' || !hasJoinedLive) return;

    // Join Room Channel
    const roomChannel = supabase.channel(`room:${roomPin}`, {
      config: {
        broadcast: { ack: true },
        presence: { key: playerName }
      }
    });

    roomChannel
      .on('broadcast', { event: 'sync_state' }, (payload) => {
        const { status, questionIndex, questionData, time, isShowingAnswer } = payload.payload;
        setGameStatus(status);
        setCurrentIndex(questionIndex);
        setCurrentLiveQuestion(questionData);
        setTimeLeft(time);
        
        // Reset answer state if it's a new question and we haven't locked in
        if (!isShowingAnswer) {
          if (time === 20 || time === 10) {
            setSelectedOption(null);
            setIsAnswered(false);
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await roomChannel.track({
            name: playerName,
            score: score,
            streak: streak
          });
        }
      });

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [mode, hasJoinedLive, roomPin, playerName, score, streak]);

  // Update presence when score changes in live mode
  useEffect(() => {
    if (mode === 'live' && hasJoinedLive) {
      const channel = supabase.channel(`room:${roomPin}`);
      channel.track({ name: playerName, score, streak });
    }
  }, [score, streak, mode, hasJoinedLive, roomPin, playerName]);

  // -------------------------------------------------------------
  // SOLO MODE LOGIC
  // -------------------------------------------------------------
  const startSoloGame = async () => {
    if (!user) {
      const attempts = localStorage.getItem('veridu_solo_attempts') || '0';
      if (parseInt(attempts) >= 1) {
        setShowAuthModal(true);
        return;
      }
      localStorage.setItem('veridu_solo_attempts', '1');
    }
    setIsLoading(true);
    setGameStatus('playing');
    const data = await fetchQuizQuestions(selectedCategory, 30);
    setQuestions(data);
    setTimeLeft(difficulty === 'Thử Thách' ? 10 : 20);
    setIsLoading(false);
  };

  useEffect(() => {
    if (mode !== 'solo') return;
    if (isAnswered || gameStatus !== 'playing') return;
    if (timeLeft <= 0) {
      handleAnswer(-1); 
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameStatus, mode]);

  // -------------------------------------------------------------
  // ANTI-CHEAT (BOTH MODES)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStatus === 'playing') {
        setTabSwitchCount((prev) => prev + 1);
        setShowAntiCheatWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStatus]);

  // -------------------------------------------------------------
  // ANSWER HANDLING
  // -------------------------------------------------------------
  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const activeQuestion = mode === 'live' ? currentLiveQuestion : questions[currentIndex];
    if (!activeQuestion) return;

    const isCorrect = optionIdx === activeQuestion.correctAnswerIndex;

    if (isCorrect) {
      const points = calculateSpeedBonus(timeLeft, mode === 'live' ? 20 : (difficulty === 'Thử Thách' ? 10 : 20));
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
    
    // Broadcast answer if live
    if (mode === 'live' && hasJoinedLive) {
       const channel = supabase.channel(`room:${roomPin}`);
       channel.send({
         type: 'broadcast',
         event: 'player_answered',
         payload: {
           playerName,
           isCorrect,
           points: isCorrect ? calculateSpeedBonus(timeLeft, 20) : 0
         }
       });
    }
  };

  const nextSoloQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(difficulty === 'Thử Thách' ? 10 : 20);
    } else {
      setGameStatus('gameover');
    }
  };

  // -------------------------------------------------------------
  // RENDER LOBBY
  // -------------------------------------------------------------
  if (gameStatus === 'lobby') {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl text-center space-y-8 animate-fadeIn">
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500 shadow-lg shadow-amber-500/20 mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-black text-3xl text-[var(--text-main)]">
            {mode === 'live' ? 'Vào Phòng Live' : 'Đấu Trường VERIDU'}
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            {mode === 'live' ? `Nhập tên của bạn để tham gia phòng ${roomPin}` : 'Cấu hình trận đấu trước khi bắt đầu để thử thách kiến thức Đức Tin của bạn.'}
          </p>
        </div>

        {mode === 'solo' ? (
          <>
            <div className="space-y-6 text-left">
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Chủ Đề Kiến Thức</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Tất cả', 'Cựu Ước', 'Tân Ước', 'Giáo Lý'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:border-amber-500/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Độ Khó (Thời gian suy nghĩ)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Thường', 'Thử Thách'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff as any)}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                        difficulty === diff
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:border-emerald-500/40'
                      }`}
                    >
                      {diff} {diff === 'Thử Thách' ? '(10s)' : '(20s)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={startSoloGame}
              className="w-full py-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-base flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
            >
              <RotateCcw className="w-5 h-5" /> Tham Gia Đấu Trường
            </button>
          </>
        ) : (
          <div className="space-y-6">
             {!user ? (
               <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-500 font-medium">
                   🔒 Bạn cần đăng nhập tài khoản trước khi tham gia phòng thi trực tiếp.
                 </div>
                 <button 
                   onClick={() => setShowAuthModal(true)}
                   className="w-full py-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-base flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
                 >
                   🔑 Đăng Nhập Ngay
                 </button>
               </div>
             ) : (
               <>
                 <input 
                   type="text" 
                   placeholder="Nhập tên hiển thị của bạn..." 
                   value={playerName}
                   onChange={(e) => setPlayerName(e.target.value)}
                   className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-main)] font-bold text-center focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                 />
                 <button 
                    disabled={!playerName.trim()}
                    onClick={() => setHasJoinedLive(true)}
                    className="w-full py-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-base flex items-center justify-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-amber-500/20"
                  >
                    <ArrowRight className="w-5 h-5" /> {hasJoinedLive ? 'Đang đợi Host bắt đầu...' : 'Vào Phòng'}
                  </button>
               </>
             )}
          </div>
        )}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER GAME OVER
  // -------------------------------------------------------------
  if (gameStatus === 'gameover') {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
          <Trophy className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-black text-3xl text-[var(--text-main)]">Tổng Kết Điểm</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)]">
          <div>
            <span className="text-xs text-[var(--text-muted)] block">Tổng Điểm Số</span>
            <span className="font-serif font-black text-2xl text-amber-400">{score}</span>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)] block">Chuỗi Streak Cao Nhất</span>
            <span className="font-serif font-black text-2xl text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-amber-500" /> {streak}
            </span>
          </div>
        </div>
        {mode === 'solo' && (
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl mt-4">Chơi Lại</button>
        )}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER PLAYING
  // -------------------------------------------------------------
  const activeQuestion = mode === 'live' ? currentLiveQuestion : questions[currentIndex];

  if (!activeQuestion) {
     return <div className="text-center py-20 text-[var(--text-muted)] font-medium">Đang đợi Host nạp câu hỏi...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Anti-cheat Alert */}
      {showAntiCheatWarning && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-500">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">Cảnh báo vi phạm nội quy!</h4>
            <p className="text-xs opacity-80 mt-1">Hệ thống phát hiện bạn vừa chuyển Tab hoặc mở ứng dụng khác (Tổng số: {tabSwitchCount} lần). Việc tra cứu tài liệu trong lúc thi là không được phép. Hành vi này đã được ghi nhận.</p>
          </div>
          <button onClick={() => setShowAntiCheatWarning(false)} className="p-1 hover:bg-red-500/20 rounded-lg">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Stats */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 font-bold text-sm flex items-center gap-1.5">
             Câu {currentIndex + 1}
          </div>
          <div className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
             <Trophy className="w-4 h-4 text-amber-500" /> {score} Điểm
          </div>
          {streak >= 3 && (
            <div className="text-sm font-bold text-orange-500 flex items-center gap-1 animate-pulse">
              <Flame className="w-4 h-4 fill-orange-500" /> x{streak} Streak
            </div>
          )}
        </div>

        <div className={`px-4 py-1.5 rounded-lg border font-bold text-sm flex items-center gap-2 ${
          timeLeft <= 5 
            ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
        }`}>
          <Clock className="w-4 h-4" /> 00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl relative overflow-hidden">
        {timeLeft <= 5 && !isAnswered && (
          <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
        )}

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{activeQuestion.category}</span>
            <h3 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-[var(--text-main)] leading-tight">
              {activeQuestion.questionText}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === activeQuestion.correctAnswerIndex;
              const showResult = isAnswered || timeLeft === 0 || (mode === 'live' && isAnswered); // for live, we might wait for host to reveal, but let's show right away to user for simplicity, or wait. Let's wait if live? No, Kahoot shows right/wrong immediately when time ends or after answering.

              let btnClass = "bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/50 hover:bg-amber-500/5 text-[var(--text-main)]";
              
              if (isSelected && !showResult) {
                btnClass = "bg-amber-500/20 border-amber-500 text-amber-500";
              } else if (showResult) {
                if (isCorrectOption) {
                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-500";
                } else if (isSelected && !isCorrectOption) {
                  btnClass = "bg-red-500/20 border-red-500 text-red-500";
                } else {
                  btnClass = "bg-[var(--bg-main)] border-[var(--border-card)] opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered || timeLeft === 0}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 font-bold text-base sm:text-lg group ${btnClass}`}
                >
                  {option}
                  
                  {showResult && isCorrectOption && (
                    <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 text-emerald-500 animate-in zoom-in" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <XCircle className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 text-red-500 animate-in zoom-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Solo Mode Next Button */}
      {mode === 'solo' && isAnswered && (
        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
          <button 
            onClick={nextSoloQuestion}
            className="px-8 py-4 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center gap-2 hover:bg-amber-400 shadow-xl shadow-amber-500/20"
          >
            Câu Tiếp Theo <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Live mode wait message */}
      {mode === 'live' && isAnswered && (
         <div className="text-center py-4 text-emerald-400 font-bold animate-pulse">
           Đã ghi nhận đáp án! Chờ Host...
         </div>
      )}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
