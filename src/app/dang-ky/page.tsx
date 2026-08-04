'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';

import { saveAuthSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { UserPlus, Lock, Mail, User, Church, Compass, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [christianName, setChristianName] = useState('Giuse');
  const [parish, setParish] = useState('');
  const [diocese, setDiocese] = useState('Giáo Ph?n Sài G?n');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            christian_name: christianName,
            parish,
            diocese,
            role: 'student'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message || 'Ðãng k? th?t b?i. Vui l?ng ki?m tra l?i.');
      } else {
        const userProfile: any = {
          id: data.user?.id || '1',
          email: email,
          displayName: displayName || email,
          christianName: christianName,
          parish: parish,
          diocese: diocese,
          role: 'H?c Viên',
          streak: 1
        };

        saveAuthSession(data.session?.access_token || 'sb_session_active', userProfile);

        if (data.session) {
          setSuccessMsg('Ðãng k? thành công! Ðang chuy?n hý?ng...');
          setTimeout(() => { window.location.href = '/ho-so'; }, 1000);
        } else {
          setSuccessMsg('Ð? kh?i t?o tài kho?n! Vui l?ng ki?m tra Email ð? xác nh?n (ho?c ðãng nh?p ngay n?u t?t Confirm Email).');
        }
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMsg(err.message || 'Không th? k?t n?i d?ch v? Supabase. Ki?m tra l?i API Keys.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      <main className="max-w-xl mx-auto px-4 py-16 relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="space-y-3 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-amber-400">T?o Tài Kho?n Công Giáo</h1>
            <p className="text-sm text-[var(--text-muted)]">Tham gia c?ng ð?ng h?c t?p & suy ni?m L?i Chúa VERIDU</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <span className="text-amber-400 font-serif mr-1.5 font-black">?</span> Tên Thánh
                </label>
                <input 
                  type="text" required value={christianName} onChange={(e) => setChristianName(e.target.value)}
                  placeholder="Giuse, Maria..."
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <User className="w-3 h-3 mr-1.5" /> H? và Tên
                </label>
                <input 
                  type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguy?n Vãn A"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Mail className="w-3 h-3 mr-1.5" /> Ð?a Ch? Email
                </label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@thapgia.com"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Lock className="w-3 h-3 mr-1.5" /> M?t Kh?u
                </label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Church className="w-3 h-3 mr-1.5" /> Giáo X?
                </label>
                <input 
                  type="text" required value={parish} onChange={(e) => setParish(e.target.value)}
                  placeholder="Tân Ð?nh"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Compass className="w-3 h-3 mr-1.5" /> Giáo Ph?n
                </label>
                <select 
                  value={diocese} onChange={(e) => setDiocese(e.target.value)}
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                >
                  <option value="Giáo Ph?n Sài G?n">Giáo Ph?n Sài G?n</option>
                  <option value="Giáo Ph?n Xuân L?c">Giáo Ph?n Xuân L?c</option>
                  <option value="Giáo Ph?n Phú Cý?ng">Giáo Ph?n Phú Cý?ng</option>
                  <option value="Giáo Ph?n Hà N?i">Giáo Ph?n Hà N?i</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 px-4 shadow-lg transition-all flex items-center justify-center mt-4"
            >
              {isLoading ? 'Ðang x? l?...' : 'Hoàn T?t Ðãng K?'}
            </button>
          </form>

          <div className="text-center pt-5 border-t border-[var(--border-card)]/50">
            <p className="text-sm text-[var(--text-muted)]">
              Ð? có tài kho?n?{' '}
              <Link href="/dang-nhap" className="text-amber-400 font-bold hover:underline">
                Ðãng nh?p ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
