'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser, logout, UserProfile } from '@/lib/auth';
import { 
  User, Mail, Church, Compass, Award, Flame, Shield, LogOut, 
  Settings, BookOpen, CheckCircle, Clock
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Bạn chưa đăng nhập.</p>
          <Link href="/dang-nhap" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl">
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl font-serif font-black shadow-xl">
              {user.christianName ? user.christianName[0] : (user.displayName ? user.displayName[0] : 'V')}
            </div>
            
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-amber-400 font-serif font-bold text-xs uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  ✝ {user.christianName || 'Tín Hữu'}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {user.role || 'Học Viên'}
                </span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[var(--text-main)]">{user.displayName || user.email}</h1>
              <p className="text-sm text-[var(--text-muted)] flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(user.role === 'Quản Trị Viên' || user.role === 'admin' || user.email === 'veridu.net@gmail.com') && (
                <Link href="/admin" className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1.5 transition-all">
                  <Shield className="w-4 h-4" /> Trang Admin
                </Link>
              )}
              <button onClick={logout} className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                <LogOut className="w-4 h-4" /> Đăng Xuất
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--border-card)]">
            <div className="p-4 rounded-2xl bg-[var(--bg-main)]/40 border border-[var(--border-card)] flex items-center gap-3">
              <Church className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-semibold uppercase">Giáo Xứ</div>
                <div className="font-bold text-sm text-[var(--text-main)]">{user.parish || 'Chưa cập nhật'}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-main)]/40 border border-[var(--border-card)] flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-semibold uppercase">Giáo Phận</div>
                <div className="font-bold text-sm text-[var(--text-main)]">{user.diocese || 'Giáo Phận Sài Gòn'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
