'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import TurnstileWidget from '@/components/TurnstileWidget';
import { VIETNAM_DIOCESES, VOCATION_OPTIONS } from '@/lib/catholicConstants';
import { UserPlus, Lock, Mail, User, Church, Compass, ShieldCheck, CheckCircle, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [christianName, setChristianName] = useState('');
  const [parish, setParish] = useState('');
  const [diocese, setDiocese] = useState(VIETNAM_DIOCESES[0]);
  const [vocation, setVocation] = useState('layperson');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const strengthScore =
    (password.length >= 8 ? 1 : 0) +
    (/[a-zA-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=/ho-so&remember=1`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        setErrorMsg('Lỗi khởi động đăng ký Google: ' + error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối dịch vụ Google: ' + (err.message || 'Lỗi'));
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!turnstileToken) {
      setErrorMsg('Vui lòng hoàn tất bước xác thực chống bot Cloudflare trước khi đăng ký.');
      return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setErrorMsg('Mật khẩu phải dài tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          fullName: displayName,
          christianName,
          parish,
          diocese,
          vocation,
          turnstileToken,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result?.success) {
        setErrorMsg(result?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      } else if (result.needsEmailConfirm) {
        setSuccessMsg(
          'Khởi tạo tài khoản thành công! Vui lòng mở hộp thư Email (kiểm tra cả mục Thư rác/Quảng cáo) và bấm vào liên kết xác nhận để kích hoạt.'
        );
      } else {
        if (result.session?.access_token && result.session?.refresh_token) {
          await supabase.auth
            .setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
            })
            .catch(() => {});
        }
        const userProfile: UserProfile = result.user;
        saveAuthSession('veridu_active_session', userProfile, false);
        setSuccessMsg('Đăng ký thành công! Đang chuyển vào Hồ Sơ của bạn...');
        setTimeout(() => {
          router.push('/ho-so');
        }, 800);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMsg(err.message || 'Không thể kết nối máy chủ đăng ký.');
    } finally {
      setIsLoading(false);
      setTurnstileReset((n) => n + 1);
      setTurnstileToken('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden pt-24 sm:pt-28 md:pt-36 pb-16">
      <main className="max-w-xl mx-auto px-4 relative z-10 flex flex-col justify-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/90 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="space-y-2.5 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-xl shadow-amber-500/10">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-amber-600 dark:text-amber-400">
              Tạo Tài Khoản VERIDU
            </h1>
            <p className="text-sm font-serif text-[var(--text-muted)]">
              Tham gia cộng đồng học tập Lời Chúa &amp; đồng bộ ứng dụng VERIDU
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-serif text-center flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-serif text-center flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Quick Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-serif font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-md transition-all flex items-center justify-center space-x-3 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span>Đăng Ký Nhanh 1 Chạm Bằng Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-card)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-serif">
              <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)] font-bold">
                Hoặc đăng ký bằng Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <span className="text-amber-500 font-serif mr-1.5 font-black">✝</span> Tên Thánh (tùy chọn)
                </label>
                <input
                  type="text"
                  value={christianName}
                  onChange={(e) => setChristianName(e.target.value)}
                  placeholder="VD: Giuse, Maria..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5" /> Họ và Tên *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Địa Chỉ Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Mật Khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự (chữ + số)"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl pl-4 pr-10 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 pt-0.5">
                    {[1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full ${
                          strengthScore >= idx
                            ? strengthScore >= 3
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-[var(--border-card)]'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Nhập Lại Mật Khẩu *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Bậc Sống
                </label>
                <select
                  value={vocation}
                  onChange={(e) => setVocation(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                >
                  {VOCATION_OPTIONS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <Church className="w-3.5 h-3.5 mr-1.5" /> Giáo Xứ (tùy chọn)
                </label>
                <input
                  type="text"
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  placeholder="VD: Giáo xứ Tân Định"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center">
                  <Compass className="w-3.5 h-3.5 mr-1.5" /> Giáo Phận
                </label>
                <select
                  value={diocese}
                  onChange={(e) => setDiocese(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                >
                  {VIETNAM_DIOCESES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cloudflare Turnstile Anti-Bot */}
            <TurnstileWidget
              action="signup"
              onToken={setTurnstileToken}
              resetSignal={turnstileReset}
            />

            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold py-3.5 px-4 text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Khởi Tạo Tài Khoản...</span>
                </>
              ) : (
                <span>Hoàn Tất Đăng Ký</span>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[var(--border-card)]/60">
            <p className="text-xs font-serif text-[var(--text-muted)]">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
