'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Cross, LogIn, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import TurnstileWidget from '@/components/TurnstileWidget';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [christianName, setChristianName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [parish, setParish] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
    setTurnstileToken('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!turnstileToken) {
      setErrorMsg('Vui lòng đợi xác thực chống bot hoàn tất.');
      return;
    }

    setIsLoading(true);

    try {
      const email = username.includes('@') ? username.trim() : `${username.trim()}@veridu.com`;

      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, rememberMe, turnstileToken }),
        });
        const result = await res.json().catch(() => ({}));

        if (!res.ok || !result?.success || !result?.user) {
          setErrorMsg(result?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
        } else {
          if (result.session?.access_token && result.session?.refresh_token) {
            await supabase.auth
              .setSession({
                access_token: result.session.access_token,
                refresh_token: result.session.refresh_token,
              })
              .catch(() => {});
          }
          const userObj: UserProfile = result.user;
          saveAuthSession('veridu_active_session', userObj, rememberMe);
          onSuccess(userObj);
          onClose();
        }
      } else {
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
            diocese: '',
            turnstileToken,
          }),
        });
        const result = await res.json().catch(() => ({}));

        if (!res.ok || !result?.success) {
          setErrorMsg(result?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } else if (result.needsEmailConfirm) {
          setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra hộp thư Email để xác nhận tài khoản.');
        } else {
          if (result.session?.access_token && result.session?.refresh_token) {
            await supabase.auth
              .setSession({
                access_token: result.session.access_token,
                refresh_token: result.session.refresh_token,
              })
              .catch(() => {});
          }
          const userObj: UserProfile = result.user;
          saveAuthSession('veridu_active_session', userObj, rememberMe);
          onSuccess(userObj);
          onClose();
        }
      }
    } catch {
      setErrorMsg('Thao tác thất bại. Vui lòng kiểm tra kết nối mạng.');
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
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(window.location.pathname)}&remember=${rememberMe ? '1' : '0'}`;
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
        setErrorMsg('Lỗi đăng nhập Google: ' + error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối dịch vụ Google: ' + (err.message || 'Lỗi'));
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1 cursor-pointer"
          aria-label="Đóng hộp thoại"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
            <Cross className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">
            {mode === 'login' ? 'Đăng Nhập VERIDU' : 'Đăng Ký Tài Khoản'}
          </h2>
          <p className="text-xs font-serif text-[var(--text-muted)]">
            {mode === 'login'
              ? 'Lưu tiến độ học tập & đồng bộ App VERIDU'
              : 'Tạo hồ sơ Công giáo miễn phí trong 30 giây'}
          </p>
        </div>

        {/* Google Quick Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-serif font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          <span>Tiếp tục nhanh với Google</span>
        </button>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl text-xs font-serif font-bold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Đăng Ký
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-serif">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-serif flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Tên Thánh</label>
                <input
                  type="text"
                  value={christianName}
                  onChange={(e) => setChristianName(e.target.value)}
                  placeholder="Giuse, Maria..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Họ &amp; Tên *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Địa Chỉ Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Mật Khẩu</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Tối thiểu 8 ký tự (chữ + số)' : '••••••••'}
                required
                minLength={mode === 'register' ? 8 : undefined}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Giáo Xứ (tùy chọn)</label>
              <input
                type="text"
                value={parish}
                onChange={(e) => setParish(e.target.value)}
                placeholder="VD: Giáo Xứ Tân Định"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="modal-remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[var(--border-card)] text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="modal-remember-me" className="text-[11px] font-serif text-[var(--text-muted)] cursor-pointer select-none">
                Ghi nhớ đăng nhập (tối đa 72 giờ)
              </label>
            </div>
          )}

          <TurnstileWidget
            key={mode}
            action={mode === 'login' ? 'login' : 'signup'}
            onToken={setTurnstileToken}
            resetSignal={turnstileReset}
          />

          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Xử Lý...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Ngay</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Khởi Tạo Tài Khoản</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
