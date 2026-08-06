'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getLiturgicalSeasonInfo, LiturgicalSeason } from '@/lib/liturgical';
import { getStoredUser, logout, UserProfile } from '@/lib/auth';
import { 
  Search, Flame, BookOpen, Gamepad2, Compass, 
  Moon, Sun, Menu, X, MapPin, Clock, LogIn, User, Settings, LogOut, Cross, Shield, Sparkles 
} from 'lucide-react';

export default function LiturgicalHeader() {
  const router = useRouter();
  const [season, setSeason] = useState<LiturgicalSeason | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setSeason(getLiturgicalSeasonInfo(new Date()));
    setUser(getStoredUser());

    // Sync React theme state from HTML element (initialized by layout.tsx inline script)
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('veridu-theme', 'light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('veridu-theme', 'dark');
    }
  };

  const accentColor = season?.colorHex || '#F5C518';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--header-bg)] border-b border-[var(--border-card)] transition-colors duration-300">
      {/* Top Banner Liturgical Season */}
      <div 
        className="w-full py-1 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ 
          backgroundColor: season?.badgeBg || 'rgba(245, 197, 24, 0.15)',
          color: accentColor,
          borderBottom: `1px solid ${season?.glowHex || 'rgba(245, 197, 24, 0.3)'}`
        }}
      >
        <span>{season?.icon || <Sparkles className="w-3.5 h-3.5 inline" />}</span>
        <span>Lịch Phụng Vụ Hôm Nay: <strong>{season?.nameVi || 'Mùa Thường Niên'}</strong></span>
        <span className="opacity-60 hidden sm:inline">| Lời Chúa Là Nguồn Sống (VIA · VITA · VERITAS)</span>
      </div>

      {/* Main Header Container */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-black text-xl text-slate-950 shadow-lg transition-transform group-hover:scale-105"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${season?.glowHex || 'rgba(245, 197, 24, 0.4)'}` }}
          >
            V
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-xl tracking-wider text-[var(--text-main)] group-hover:text-amber-500 transition-colors">
              VERIDU
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)]">
              VIA · VITA · VERITAS
            </span>
          </div>
        </Link>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); if (searchQuery) router.push(`/search?q=${encodeURIComponent(searchQuery)}`); }}
            className="w-full relative flex items-center"
          >
            <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra cứu bài học, Kinh Thánh, chủ đề (VD: Ga 3,16)..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full pl-9 pr-4 py-1.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-sm"
            />
          </form>
        </div>

        {/* Right: Gamification, Auth & Controls */}
        <div className="flex items-center gap-3">
          
          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Streaks Widget */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 font-bold text-xs shadow-sm">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                <span>{user.streak || 5} Ngày</span>
              </div>
              
              <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 transition-all text-xs font-bold text-[var(--text-main)] shadow-sm"
              >
                <div className="relative w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-serif text-xs font-black overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="24px" />
                  ) : (
                    user.christianName ? user.christianName[0] : 'G'
                  )}
                </div>
                <span className="hidden sm:inline">{user.christianName} {user.displayName}</span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                  <div className="px-3 py-2 border-b border-[var(--border-card)] text-[11px] space-y-0.5">
                    <div className="font-bold text-[var(--text-main)]">{user.christianName} {user.displayName}</div>
                    <div className="text-amber-500">{user.parish}</div>
                    <div className="text-amber-500 sm:hidden flex items-center gap-1 mt-1 font-bold">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> {user.streak || 5} Ngày
                    </div>
                  </div>

                  <Link href="/ho-so" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-amber-500/10 hover:text-amber-500">
                    <User className="w-4 h-4" /> Hồ Sơ Cá Nhân
                  </Link>
                  {(user.role === 'Quản Trị Viên' || user.role === 'administrator') && (
                    <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-500">
                      <Shield className="w-4 h-4" /> Quản Trị Hệ Thống
                    </Link>
                  )}
                  <Link href="/cai-dat" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-amber-500/10 hover:text-amber-500">
                    <Settings className="w-4 h-4" /> Cài Đặt Lịch Phụng Vụ
                  </Link>
                  <button 
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" /> Đăng Xuất
                  </button>
                </div>
              )}
            </div>
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 rounded-full font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] hover:text-amber-500 hover:border-amber-500/40 transition-all shadow-sm"
            title={isDarkMode ? 'Chuyển sang Chế độ Sáng (Light Mode)' : 'Chuyển sang Chế độ Tối (Dark Mode)'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Mobile Search Toggle */}
          <button 
            onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }}
            className="md:hidden p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] hover:text-amber-500 hover:border-amber-500/40 transition-all shadow-sm"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); }}
            className="md:hidden p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] hover:text-amber-500 hover:border-amber-500/40 transition-all shadow-sm"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-md animate-in slide-in-from-top-2">
          <form 
            onSubmit={(e) => { e.preventDefault(); if (searchQuery) router.push(`/search?q=${encodeURIComponent(searchQuery)}`); }}
            className="w-full relative flex items-center"
          >
            <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra cứu bài học, Kinh Thánh..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 shadow-inner"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="hidden md:block border-t border-[var(--border-card)] bg-[var(--header-bg)]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center gap-6 lg:gap-8 h-11 text-sm font-medium overflow-x-auto custom-scrollbar">
          <Link href="/" className="text-amber-500 font-bold flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap">
            <Compass className="w-4 h-4" /> Trang Chủ
          </Link>
          <Link href="/courses" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <BookOpen className="w-4 h-4" /> Khóa Học LMS
          </Link>
          <Link href="/thu-vien" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <Cross className="w-4 h-4 text-amber-500" /> Thư Viện Bài Viết
          </Link>
          <Link href="/ban-do-kinh-thanh" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <MapPin className="w-4 h-4 text-emerald-500" /> Bản Đồ 3D
          </Link>
          <Link href="/dong-thoi-gian" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <Clock className="w-4 h-4 text-purple-500" /> Dòng Thời Gian
          </Link>
          <Link href="/quiz" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <Gamepad2 className="w-4 h-4 text-amber-500" /> Quiz Giáo Lý
          </Link>
          <Link href="/doc-kinh-thanh" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <BookOpen className="w-4 h-4 text-amber-500" /> Đọc Kinh Thánh
          </Link>
          <Link href="/nhan-vat" className="text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2 transition-colors whitespace-nowrap">
            <User className="w-4 h-4 text-indigo-500" /> Nhân Vật
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-card)] bg-[var(--bg-card)] p-4 space-y-3 shadow-xl">
          <Link href="/" className="py-2 text-amber-500 font-semibold flex items-center gap-2"><Compass className="w-4 h-4" /> Trang Chủ</Link>
          <Link href="/courses" className="py-2 text-[var(--text-main)] flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-500" /> Khóa Học LMS</Link>
          <Link href="/thu-vien" className="py-2 text-[var(--text-main)] flex items-center gap-2"><Cross className="w-4 h-4 text-amber-500" /> Thư Viện Bài Viết</Link>
          <Link href="/ban-do-kinh-thanh" className="py-2 text-[var(--text-main)] flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> Bản Đồ Kinh Thánh</Link>
          <Link href="/dong-thoi-gian" className="py-2 text-[var(--text-main)] flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /> Dòng Thời Gian Cứu Độ</Link>
          <Link href="/quiz" className="py-2 text-[var(--text-main)] flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-amber-500" /> Quiz Giáo Lý</Link>
          <Link href="/doc-kinh-thanh" className="py-2 text-[var(--text-main)] flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-500" /> Đọc Kinh Thánh</Link>
          <Link href="/nhan-vat" className="py-2 text-[var(--text-main)] flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> Nhân Vật Kinh Thánh</Link>
          {!user && (
            <Link 
              href="/dang-nhap"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-left py-2 text-amber-500 font-bold flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Đăng Nhập / Đăng Ký
            </Link>
          )}
        </div>
      )}

    </header>
  );
}
