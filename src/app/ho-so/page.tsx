'use client';

import React, { useState, useEffect } from 'react';

import { getStoredUser, UserProfile, logout } from '@/lib/auth';
import { 
  User, Flame, Award, BookOpen, Settings, LogOut, 
  Church, Compass, ShieldCheck, CheckCircle2, Trophy, Gamepad2
} from 'lucide-react';
import Link from 'next/link';

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* User Hero Header Card */}
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center font-serif font-black text-3xl text-amber-400 shadow-xl shadow-amber-500/20">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                user.christianName ? user.christianName.charAt(0) : 'G'
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-amber-400 text-sm">✝ {user.christianName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                  {user.role}
                </span>
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">{user.displayName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Church className="w-3.5 h-3.5 text-amber-400" /> {user.parish}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-indigo-400" /> {user.diocese}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user.role === 'administrator' || user.role === 'Quản Trị Viên') && (
              <Link 
                href="/admin" 
                className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
              >
                <ShieldCheck className="w-4 h-4" /> Quản Trị Hệ Thống
              </Link>
            )}
            {(user.role === 'administrator' || user.role === 'Giáo Lý Viên' || user.role === 'Quản Trị Viên') && (
              <Link 
                href="/quiz/control" 
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                <Gamepad2 className="w-4 h-4" /> Bảng Điều Khiển Live
              </Link>
            )}
            <Link 
              href="/cai-dat" 
              className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-lg shadow-emerald-500/10"
            >
              <Settings className="w-4 h-4" /> Cài Đặt Hồ Sơ
            </Link>
            <button 
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-2 hover:bg-red-500 hover:text-slate-950 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng Xuất
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)]/40 border border-white/5 backdrop-blur-2xl shadow-xl flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
              <Flame className="w-7 h-7 fill-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">Chuỗi Học Tập</span>
              <span className="font-serif font-black text-2xl text-amber-400">{user.streak} Ngày</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)]/40 border border-white/5 backdrop-blur-2xl shadow-xl flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">Huy Hiệu</span>
              <span className="font-serif font-black text-2xl text-indigo-300">3 Đạt Được</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-card)]/40 border border-white/5 backdrop-blur-2xl shadow-xl flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">Khóa Học</span>
              <span className="font-serif font-black text-2xl text-emerald-400">2 Hoàn Thành</span>
            </div>
          </div>
        </div>

        {/* Badge Showcase */}
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-4">
          <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Bảng Vinh Danh Huy Hiệu Công Giáo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-amber-500/30 flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <h4 className="font-bold text-sm text-amber-300">Dũng Sĩ Chân Lý</h4>
                <p className="text-xs text-[var(--text-muted)]">Hoàn thành 5 bài Quiz Giáo Lý xuất sắc</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-3">
              <span className="text-3xl">🕊️</span>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">Môn Đệ Trung Kiên</h4>
                <p className="text-xs text-[var(--text-muted)]">Duy trì 5 ngày học liên tục</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">Học Giả Kinh Thánh</h4>
                <p className="text-xs text-[var(--text-muted)]">Đọc hết 46 chương Cựu Ước</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
