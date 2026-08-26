'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { fetchQuizQuestions } from '@/lib/quiz';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Play, 
  PlusCircle, 
  ShieldCheck, 
  BookOpen, 
  Scroll, 
  Cross, 
  Church, 
  Flame, 
  HelpCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

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
      if (parseInt(attempts) >= 3) {
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
        setErrorMsg(`Hiện chưa có câu hỏi cho chủ đề này. Vui lòng chọn chủ đề khác.`);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể bắt đầu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-32 pb-20">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 flex-1 w-full">
        
        {/* ── Hero Header ── */}
        <header className="space-y-4 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Đấu Trường Tri Thức Công Giáo &amp; Kinh Thánh</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-tight tracking-tight">
            Đấu Trường Quiz
          </h1>

          <p className="font-serif text-sm sm:text-lg text-[var(--text-muted)] leading-relaxed italic max-w-2xl mx-auto">
            &ldquo;Kiểm tra và bồi dưỡng tri thức Kinh Thánh, Giáo Lý và Phụng Vụ qua các chế độ thi đấu trực tiếp thời gian thực.&rdquo;
          </p>

          {/* Quick Host Action Bar */}
          <div className="pt-2 flex justify-center">
            <Link
              href="/quiz/control"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm transition shadow-sm hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span>Tạo Phòng Thi (Dành Cho GLV &amp; Quản Trò) &rarr;</span>
            </Link>
          </div>
        </header>

        {/* ── Game Modes Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Mode 1: Live Arena (PIN) */}
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-2 shadow-sm">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                  Đấu Trường Trực Tiếp (Live)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                  Thi đấu đồng bộ cùng lớp Giáo Lý, Giáo Xứ hoặc Thiếu Nhi Thánh Thể. Nhập mã PIN 6 số do Quản trò cung cấp.
                </p>
              </div>
            </div>

            {!user ? (
              <div className="space-y-4 relative z-10">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-600 dark:text-amber-400 font-bold leading-relaxed">
                  🔒 Đấu trường Live yêu cầu đăng nhập tài khoản để đồng bộ tiến trình và chọn Nhân Vật Kinh Thánh đại diện.
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Để Nhập PIN</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block text-center">
                    Nhập PIN Phòng Thi (6 Số)
                  </label>
                  <input 
                    type="text" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="888999" 
                    maxLength={6}
                    className="w-full text-center font-mono font-black text-3xl sm:text-4xl py-3 px-4 rounded-2xl bg-[var(--bg-main)] border-2 border-amber-500/30 text-[var(--text-main)] focus:outline-none focus:border-amber-500 tracking-widest shadow-inner transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={pin.length !== 6}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 transition-all shadow-xl shadow-amber-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Tham Gia Phòng Đấu &rarr;</span>
                </button>
              </form>
            )}
          </div>

          {/* Mode 2: Solo Practice */}
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-indigo-500/50 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-2 shadow-sm">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                  Luyện Tập Cá Nhân (Solo)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                  Tự rèn luyện và kiểm tra tri thức với ngân hàng 30+ câu hỏi chuẩn mực. Chọn chủ đề bạn muốn thử thách.
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Chọn Chủ Đề Ôn Tập:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Tất Cả', icon: <BookOpen className="w-3 h-3 text-amber-500" /> },
                    { id: 'Cựu Ước', label: 'Cựu Ước', icon: <Scroll className="w-3 h-3 text-amber-600" /> },
                    { id: 'Tân Ước', label: 'Tân Ước', icon: <Cross className="w-3 h-3 text-emerald-500" /> },
                    { id: 'Giáo Lý', label: 'Giáo Lý', icon: <Church className="w-3 h-3 text-indigo-400" /> }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-500 text-center font-semibold bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleStartSolo}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Bắt Đầu Luyện Tập &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setUser(getStoredUser());
          }}
        />
      )}
    </div>
  );
}
