'use client';
export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { saveAuthSession } from '@/lib/auth';
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

        // Query real verified role from Supabase profiles table
        let userRole = 'Học Viên';
        if (data.user?.user_metadata?.role === 'admin') {
          userRole = 'Quản Trị Viên';
        } else if (data.user?.id) {
          try {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('role, display_name, christian_name, parish, diocese')
              .eq('id', data.user.id)
              .maybeSingle();

            if (dbProfile?.role) {
              userRole = dbProfile.role;
            }
          } catch (e) {
            console.warn('Profile role fetch warning:', e);
          }
        }

        const userProfile: any = {
          id: data.user?.id || '1',
          email: data.user?.email || email,
          displayName: data.user?.user_metadata?.display_name || data.user?.user_metadata?.full_name || username,
          christianName: data.user?.user_metadata?.christian_name || '',
          parish: data.user?.user_metadata?.parish || '',
          diocese: data.user?.user_metadata?.diocese || 'Giáo Phận Sài Gòn',
          role: userRole,
          streak: 1
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

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[var(--border-card)] text-amber-500 focus:ring-amber-500 bg-[var(--bg-main)] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-[var(--text-muted)] cursor-pointer select-none font-serif">
                Ghi nhớ đăng nhập trên thiết bị này (30 ngày)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[var(--border-card)]">
            <p className="text-xs text-[var(--text-muted)] font-serif">
              Chưa có tài khoản đức tin?{' '}
              <Link 
                href={`/dang-ky${redirectTarget !== '/ho-so' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
                className="text-amber-600 dark:text-amber-400 hover:underline font-bold"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
