'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { KeyRound, Lock, CheckCircle2, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const initRecovery = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session) {
            if (active) {
              setHasSession(true);
              setReady(true);
            }
            return;
          }
        }

        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (hash && hash.includes('access_token=')) {
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const access_token = params.get('access_token') || '';
          const refresh_token = params.get('refresh_token') || '';
          if (access_token && refresh_token) {
            const { data } = await supabase.auth.setSession({ access_token, refresh_token });
            if (data?.session && active) {
              setHasSession(true);
              setReady(true);
              return;
            }
          }
        }

        const { data: current } = await supabase.auth.getSession();
        if (active) {
          setHasSession(Boolean(current?.session));
          setReady(true);
        }
      } catch {
        if (active) {
          setHasSession(false);
          setReady(true);
        }
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session && active) {
        setHasSession(true);
        setReady(true);
      }
    });

    initRecovery();

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, [searchParams]);

  const strengthScore =
    (password.length >= 8 ? 1 : 0) +
    (/[a-zA-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 8 ký tự, gồm cả chữ cái và chữ số.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message || 'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.');
      } else {
        await supabase.auth.signOut().catch(() => {});
        setSuccess(true);
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 md:pt-36 pb-16 px-4">
      <main className="max-w-md mx-auto">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-serif font-black text-2xl">Đặt Lại Mật Khẩu</h1>
            <p className="text-xs font-serif text-[var(--text-muted)]">
              Thiết lập mật khẩu mới dùng chung cho Website cruxveritatis.org và App VERIDU
            </p>
          </div>

          {!ready ? (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs font-serif text-[var(--text-muted)]">Đang kiểm tra liên kết khôi phục...</p>
            </div>
          ) : success ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-serif font-bold text-sm text-emerald-600 dark:text-emerald-400">
                Đổi Mật Khẩu Thành Công!
              </h3>
              <p className="text-xs font-serif text-[var(--text-muted)]">
                Bạn đã có thể đăng nhập bằng mật khẩu mới trên cả trình duyệt và App VERIDU Desktop.
              </p>
              <Link
                href="/dang-nhap"
                className="inline-flex items-center justify-center mt-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs transition"
              >
                Đăng Nhập Ngay
              </Link>
            </div>
          ) : !hasSession ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
              <AlertTriangle className="w-9 h-9 text-red-500 mx-auto" />
              <h3 className="font-serif font-bold text-sm text-red-600 dark:text-red-400">
                Liên Kết Không Hợp Lệ Hoặc Đã Hết Hạn
              </h3>
              <p className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                Liên kết đặt lại mật khẩu chỉ dùng được một lần và có hiệu lực trong thời gian ngắn. Vui lòng gửi lại yêu cầu mới.
              </p>
              <Link
                href="/quen-mat-khau"
                className="inline-flex items-center justify-center mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs transition"
              >
                Gửi Lại Yêu Cầu Khôi Phục
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-serif flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)]">Mật Khẩu Mới</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự (gồm chữ và số)"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    aria-label="Hiện hoặc ẩn mật khẩu"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-colors ${
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
                <label className="text-xs font-serif font-bold text-[var(--text-muted)]">
                  Xác Nhận Mật Khẩu Mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Mật Khẩu Mới</span>}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
