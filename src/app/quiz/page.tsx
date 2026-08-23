'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { fetchQuizQuestions } from '@/lib/quiz';

import { Gamepad2, Users, Trophy, Play, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (pin.length === 6) {
      router.push(`/quiz/room?pin=${pin}`);
    } else {
      alert("Vui lòng nhập đúng 6 số PIN của phòng thi.");
    }
  };

  const handleStartSolo = async () => {
    setErrorMsg('');
    if (!user) {
      const attempts = localStorage.getItem('veridu_solo_attempts') || '0';
      if (parseInt(attempts) >= 1) {
        setShowAuthModal(true);
        return;
      }
    }

    setIsLoading(true);
    try {
      const questions = await fetchQuizQuestions(selectedCategory, 10);
      if (questions.length > 0) {
        router.push(`/quiz/room?mode=solo&category=${selectedCategory}`);
      } else {
        setErrorMsg(`Hiện không có câu hỏi cho chủ đề này. Vui lòng chọn chủ đề khác.`);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể bắt đầu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-36 pb-16">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-12 flex-1 w-full">
        
        {/* Header */}
        <header className="space-y-4 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Gamepad2 className="w-3.5 h-3.5" /> Đấu Trường Quiz Giáo Lý
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight">
            Thử Thách Tri Thức Công Giáo
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Kiểm tra kiến thức Kinh Thánh, Giáo Lý và Phụng Vụ qua các chế độ thi đấu đa dạng. Học hỏi Lời Chúa qua từng câu hỏi.
          </p>
        </header>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Mode 1: Live Arena (PIN) */}
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">Thi Trực Tiếp (Live)</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Tham gia phòng thi thời gian thực cùng Giáo Xứ hoặc Thiếu Nhi Thánh Thể. Cần mã PIN từ Quản trò.
              </p>
            </div>

            {!user ? (
              <div className="space-y-4 relative z-10">
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center text-xs text-amber-500/90 font-medium leading-relaxed">
                  🔒 Đấu trường Live yêu cầu tài khoản để đồng bộ tiến trình và lưu điểm học tập của bạn.
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
                >
                  🔑 Đăng Nhập Để Nhập PIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                    Nhập PIN Phòng Thi
                  </label>
                  <input 
                    type="text" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="888999" 
                    className="w-full text-center font-mono font-black text-3xl py-3 px-4 rounded-2xl bg-slate-100 dark:bg-[var(--bg-main)] border border-slate-300 dark:border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-amber-500 tracking-widest shadow-inner transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={pin.length !== 6}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 transition-all shadow-xl shadow-amber-500/20"
                >
                  <Play className="w-5 h-5 fill-current" /> Tham Gia Phòng Đấu
                </button>
              </form>
            )}
          </div>

          {/* Mode 2: Solo Practice */}
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">Luyện Tập Cá Nhân</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Tự rèn luyện kiến thức với ngân hàng câu hỏi ngẫu nhiên. Hãy chọn chủ đề bạn muốn ôn tập.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                  Chủ Đề Ôn Tập
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full font-bold text-sm py-4 px-4 rounded-2xl bg-slate-100 dark:bg-[var(--bg-main)] border border-slate-300 dark:border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-indigo-500 shadow-inner appearance-none transition-colors"
                >
                  <option value="all">🌟 Trộn Lẫn (Tất Cả)</option>
                  <option value="bible">📖 Kinh Thánh Cựu & Tân Ước</option>
                  <option value="catechism">✝️ Giáo Lý Hội Thánh Công Giáo</option>
                  <option value="liturgy">🕊️ Phụng Vụ & Các Bí Tích</option>
                  <option value="history">⏳ Lịch Sử Giáo Hội</option>
                </select>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button 
                onClick={handleStartSolo}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                {isLoading ? 'Đang tải câu hỏi...' : 'Bắt Đầu Ôn Luyện'}
              </button>
            </div>
          </div>

        </div>
      </main>

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
