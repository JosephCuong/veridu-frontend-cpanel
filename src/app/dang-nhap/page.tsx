'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';

import { saveAuthSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });

      if (error) {
        setErrorMsg('Email ho?c m?t kh?u không chính xác.');
      } else {
        const userProfile: any = {
          id: data.user?.id || '1',
          email: data.user?.email || username,
          displayName: data.user?.user_metadata?.full_name || username,
          christianName: data.user?.user_metadata?.christian_name || '',
          parish: data.user?.user_metadata?.parish || '',
          diocese: data.user?.user_metadata?.diocese || '',
          role: data.user?.user_metadata?.role === 'admin' ? 'Qu?n Tr? Viên' : 'H?c Viên',
          streak: 1
        };
        saveAuthSession(data.session?.access_token || 'sb_token', userProfile, rememberMe);
        window.location.href = '/ho-so';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('L?i ðãng nh?p: ' + (err.message || 'Không th? k?t n?i Supabase'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      <main className="max-w-md mx-auto px-4 py-16 relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="space-y-3 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-amber-400">Ðãng Nh?p VERIDU</h1>
            <p className="text-sm text-[var(--text-muted)]">Chào m?ng b?n quay tr? l?i v?i n?n t?ng h?c t?p L?i Chúa</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                <Mail className="w-3 h-3 mr-1.5" /> Ð?a Ch? Email
              </label>
              <input 
                type="email" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="email@thapgia.com"
                className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                <span className="flex items-center"><Lock className="w-3 h-3 mr-1.5" /> M?t Kh?u</span>
                <Link href="/quen-mat-khau" className="text-xs text-amber-400 hover:underline">Quên m?t kh?u?</Link>
              </label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
              />
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 px-4 shadow-lg transition-all flex items-center justify-center mt-4"
            >
              {isLoading ? 'Ðang x? l?...' : 'Ðãng Nh?p'}
            </button>
          </form>

          <div className="text-center pt-5 border-t border-[var(--border-card)]/50">
            <p className="text-sm text-[var(--text-muted)]">
              Chýa có tài kho?n?{' '}
              <Link href="/dang-ky" className="text-amber-400 font-bold hover:underline">
                Ðãng k? ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
