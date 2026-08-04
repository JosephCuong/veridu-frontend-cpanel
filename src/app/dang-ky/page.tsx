'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { saveAuthSession } from '@/lib/auth';
import { UserPlus, Lock, Mail, User, Church, Compass, ArrowRight, ShieldCheck, Cross } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [christianName, setChristianName] = useState('Giuse');
  const [parish, setParish] = useState('');
  const [diocese, setDiocese] = useState('Giáo Phận Sài Gòn');
  const [role, setRole] = useState('Học Viên');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          christianName,
          parish,
          diocese,
          role
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        saveAuthSession(data.token, data.user);
        window.location.href = '/ho-so';
      } else {
        setErrorMsg(data.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div className="space-y-3 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10 transform transition-transform duration-500 hover:scale-110 hover:rotate-3">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Tạo Tài Khoản Công Giáo</h1>
            <p className="text-sm text-[var(--text-muted)]">Tham gia cộng đồng học tập & suy niệm Lời Chúa VERIDU</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center animate-pulse flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <span className="text-amber-400 font-serif mr-1.5 font-black">✝</span> Tên Thánh
                </label>
                <input 
                  type="text"
                  required
                  value={christianName}
                  onChange={(e) => setChristianName(e.target.value)}
                  placeholder="Giuse, Maria..."
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <User className="w-3 h-3 mr-1.5" /> Họ và Tên
                </label>
                <input 
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Mail className="w-3 h-3 mr-1.5" /> Địa Chỉ Email
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@thapgia.com"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Lock className="w-3 h-3 mr-1.5" /> Mật Khẩu
                </label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Church className="w-3 h-3 mr-1.5" /> Giáo Xứ
                </label>
                <input 
                  type="text"
                  required
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  placeholder="Tân Định"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Compass className="w-3 h-3 mr-1.5" /> Giáo Phận
                </label>
                <select 
                  value={diocese}
                  onChange={(e) => setDiocese(e.target.value)}
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  <option value="Giáo Phận Sài Gòn">Giáo Phận Sài Gòn</option>
                  <option value="Giáo Phận Xuân Lộc">Giáo Phận Xuân Lộc</option>
                  <option value="Giáo Phận Phú Cường">Giáo Phận Phú Cường</option>
                  <option value="Giáo Phận Hà Nội">Giáo Phận Hà Nội</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold py-4 px-4 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center text-base">
                {isLoading ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  <>
                    Hoàn Tất Đăng Ký
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center pt-5 border-t border-[var(--border-card)]/50">
            <p className="text-sm text-[var(--text-muted)]">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
