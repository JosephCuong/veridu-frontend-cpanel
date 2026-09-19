'use client';
export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/ho-so';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const email = username.includes('@') ? username.trim() : `${username.trim()}@veridu.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        setErrorMsg('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      } else {
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');

        // Query full verified profile from Supabase profiles table
        let dbProfile: any = null;
        if (data.user?.id) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profileData) {
              dbProfile = profileData;
            }
          } catch (e) {
            console.warn('Profile fetch error:', e);
          }
        }

        const roleName = (dbProfile?.role === 'admin' || data.user?.user_metadata?.role === 'admin')
          ? 'Quản Trị Viên'
          : (dbProfile?.role || 'Học Viên');

        const userProfile: UserProfile = {
          id: data.user?.id || '1',
          username: dbProfile?.email?.split('@')[0] || data.user?.email?.split('@')[0] || username,
          email: data.user?.email || email,
          displayName: dbProfile?.full_name || data.user?.user_metadata?.full_name || 'Thành Viên VERIDU',
          fullName: dbProfile?.full_name || data.user?.user_metadata?.full_name || 'Thành Viên VERIDU',
          christianName: dbProfile?.christian_name || data.user?.user_metadata?.christian_name || 'Giuse',
          parish: dbProfile?.parish || data.user?.user_metadata?.parish || 'Tân Định',
          diocese: dbProfile?.diocese || data.user?.user_metadata?.diocese || 'Giáo Phận Sài Gòn',
          role: roleName,
          streak: dbProfile?.streak || 1,
          points: dbProfile?.points !== undefined && dbProfile?.points !== null ? dbProfile.points : 100,
          manna: dbProfile?.manna !== undefined && dbProfile?.manna !== null ? dbProfile.manna : 100,
          avatar: dbProfile?.avatar_url || '',
          selected_title: dbProfile?.current_title || 'NGƯỜI TÌM HIỂU',
          badges: dbProfile?.badges || ['tan_tong']
        };

        saveAuthSession(data.session?.access_token || 'sb_session_active', userProfile, rememberMe);

        // Redirect smoothly to target route or profile
        setTimeout(() => { 
          window.location.href = redirectTarget; 
        }, 600);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTarget)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
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
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/90 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          
          <div className="space-y-3 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400 shadow-xl shadow-amber-500/10">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-[var(--text-main)]">Đăng Nhập VERIDU</h1>
            <p className="text-sm text-[var(--text-muted)] font-serif">Chào mừng bạn quay trở lại với nền tảng học tập Lời Chúa</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Email hoặc Tên Tài Khoản</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@example.com hoặc username"
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-xs transition text-[var(--text-main)] shadow-inner"
                />
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-serif">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border-card)] text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[var(--text-muted)]">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
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

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-card)]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-serif">
              <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)] font-bold">
                Hoặc
              </span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-serif font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-md transition-all flex items-center justify-center space-x-3 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>Đăng Nhập Nhanh Bằng Google</span>
          </button>

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
