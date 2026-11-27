'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import TurnstileWidget from '@/components/TurnstileWidget';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const OAUTH_ERROR_MAP: Record<string, string> = {
  oauth_cancelled: 'Bạn đã hủy đăng nhập bằng Google.',
  oauth_exchange_failed: 'Phiên xác thực Google đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
  oauth_provider_error: 'Dịch vụ Google trả về lỗi khi đăng nhập. Vui lòng thử lại sau.',
  missing_code: 'Thiếu mã xác thực từ Google. Vui lòng bấm đăng nhập lại.',
  internal_oauth_error: 'Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.',
  session_expired: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
};

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/ho-so';
  const queryError = searchParams.get('error') || '';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (queryError) {
      setErrorMsg(OAUTH_ERROR_MAP[queryError] || 'Không thể hoàn tất xác thực. Vui lòng đăng nhập lại.');
    }
  }, [queryError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setErrorMsg('Vui lòng đợi xác thực chống bot Cloudflare hoàn tất trước khi đăng nhập.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const email = username.includes('@') ? username.trim() : `${username.trim()}@veridu.com`;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe, turnstileToken }),
      });

      const result = await res.json();

      if (!res.ok || !result?.success || !result?.user) {
        setErrorMsg(result?.error || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      } else {
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');

        if (result.session?.access_token && result.session?.refresh_token) {
          try {
            await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
            });
          } catch (e) {
            console.warn('Supabase client session sync warning:', e);
          }
        }

        const userProfile: UserProfile = result.user;
        saveAuthSession('veridu_active_session', userProfile, rememberMe);

        const safeTarget =
          redirectTarget.startsWith('/') && !redirectTarget.startsWith('//') ? redirectTarget : '/ho-so';
        setTimeout(() => {
          window.location.href = safeTarget;
        }, 450);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsLoading(false);
      setTurnstileReset((n) => n + 1);
      setTurnstileToken('');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const safeRedirect =
        redirectTarget.startsWith('/') && !redirectTarget.startsWith('//') ? redirectTarget : '/ho-so';
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(safeRedirect)}&remember=${rememberMe ? '1' : '0'}`;
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
        setErrorMsg('Lỗi khởi động đăng nhập Google: ' + error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối dịch vụ Google: ' + (err.message || 'Lỗi'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden pt-24 sm:pt-28 md:pt-36 pb-16">
      <main className="max-w-md mx-auto px-4 relative z-10 flex flex-col justify-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/90 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden group">
          <div className="space-y-2.5 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400 shadow-xl shadow-amber-500/10">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-[var(--text-main)]">Đăng Nhập VERIDU</h1>
            <p className="text-sm text-[var(--text-muted)] font-serif">
              Một tài khoản duy nhất cho Website &amp; App VERIDU
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs text-center flex items-center justify-center space-x-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs text-center flex items-center justify-center space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google Sign-in Button */}
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
            <span>Tiếp Tục Nhanh Với Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-card)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-serif">
              <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)] font-bold">
                Hoặc đăng nhập bằng Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Địa Chỉ Email</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-xs transition text-[var(--text-main)] shadow-inner"
                />
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)]">Mật Khẩu</label>
                <Link href="/quen-mat-khau" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-serif">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-xs transition text-[var(--text-main)] shadow-inner"
                />
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  aria-label="Hiện hoặc ẩn mật khẩu"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-main)]/70 border border-[var(--border-card)] space-y-1.5 transition-all">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-card)] text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
                <span className="text-xs font-serif font-semibold text-[var(--text-main)]">
                  Ghi nhớ đăng nhập trên thiết bị này
                </span>
              </label>
              <p className="text-[11px] text-[var(--text-muted)] font-serif pl-6 leading-relaxed">
                {rememberMe
                  ? 'Duy trì phiên đăng nhập an toàn tối đa 72 giờ (tự động gia hạn ngầm).'
                  : 'Mặc định: Phiên làm việc tự kết thúc khi bạn đóng trình duyệt.'}
              </p>
            </div>

            {/* Cloudflare Turnstile Anti-Bot */}
            <TurnstileWidget
              action="login"
              onToken={setTurnstileToken}
              resetSignal={turnstileReset}
            />

            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-sm shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <span>Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center border-t border-[var(--border-card)] text-xs text-[var(--text-muted)] font-serif space-y-2">
            <div>
              Chưa có tài khoản học tập?{' '}
              <Link href="/dang-ky" className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
                Đăng ký thành viên
              </Link>
            </div>
            <Link href="/" className="block text-[11px] hover:text-[var(--text-main)] transition">
              ← Quay lại trang chủ VERIDU
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
