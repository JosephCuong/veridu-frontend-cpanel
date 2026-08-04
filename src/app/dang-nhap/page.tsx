'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { saveAuthSession } from '@/lib/auth';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck, Cross } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        saveAuthSession(data.token, data.user);
        window.location.href = '/ho-so';
      } else {
        setErrorMsg(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-md mx-auto px-4 py-16 relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <div className="space-y-3 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10 transform transition-transform duration-500 hover:scale-110 hover:rotate-3">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Đăng Nhập VERIDU</h1>
            <p className="text-sm text-[var(--text-muted)]">Cộng đồng học tập & suy niệm Lời Chúa</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center animate-pulse flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                <Mail className="w-3 h-3 mr-1.5" />
                Tên Đăng Nhập Hoặc Email
              </label>
              <div className="relative group/input">
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="email@thapgia.com"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Lock className="w-3 h-3 mr-1.5" />
                  Mật Khẩu
                </label>
                <Link href="/quen-mat-khau" className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-medium transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group/input">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold py-3.5 px-4 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center">
                {isLoading ? (
                  <span className="animate-pulse">Đang kết nối...</span>
                ) : (
                  <>
                    Vào Không Gian Học Tập
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[var(--border-card)]/50">
            <p className="text-sm text-[var(--text-muted)]">
              Chưa có tài khoản?{' '}
              <Link href="/dang-ky" className="text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors">
                Gia nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
