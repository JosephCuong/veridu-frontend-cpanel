'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getStoredUser, logout, UserProfile } from '@/lib/auth';
import { calculateLevelInfo } from '@/lib/gamification';
import { 
  Flame, Moon, Sun, Menu, X, User, LogOut, LogIn, ChevronDown, 
  BookOpen, MapPin, Clock, Users, FileText, Library, Award, Shield, 
  Sparkles, Settings, Gamepad2, GraduationCap, Trophy, HelpCircle,
  PenTool, Megaphone, Compass, BookMarked, Layers, ChevronRight
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/context/LanguageContext';

export default function LiturgicalHeader() {
  const pathname = usePathname();
  const { t, locale, isEn } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Active mega menu dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile/Tablet Drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);

  // Auth & Profile Menu state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'Quản Trị Viên' || user?.role === 'admin';

  // Toggle Theme (Dark / Light)
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('veridu-theme', 'dark');
      localStorage.setItem('veridu_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('veridu-theme', 'light');
      localStorage.setItem('veridu_theme', 'light');
    }
    window.dispatchEvent(new CustomEvent('veridu_theme_changed', { detail: { dark: newMode } }));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('veridu-theme') || localStorage.getItem('veridu_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  // Fetch Admin moderation badge count if admin
  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/moderation')
        .then(res => res.json())
        .then(data => {
          const count = 
            (data.applications?.length || 0) + 
            (data.posts?.length || 0) + 
            (data.resources?.length || 0) + 
            (data.courses?.length || 0);
          setPendingCount(count);
        })
        .catch(() => {});
    }
  }, [user, isAdmin]);

  // Sync user profile & live updates
  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (currentUser?.id && (typeof currentUser.id === 'string' && currentUser.id.includes('-') || currentUser.email)) {
      import('@/lib/supabaseClient').then(async ({ supabase }) => {
        try {
          let query = supabase.from('profiles').select('*');
          if (typeof currentUser.id === 'string' && currentUser.id.includes('-')) {
            query = query.eq('id', currentUser.id);
          } else {
            query = query.eq('email', currentUser.email);
          }
          const { data: dbProfile } = await query.maybeSingle();

          if (dbProfile) {
            const liveUser: UserProfile = {
              ...currentUser,
              displayName: dbProfile.full_name || currentUser.displayName,
              fullName: dbProfile.full_name || currentUser.displayName,
              christianName: dbProfile.christian_name || currentUser.christianName,
              parish: dbProfile.parish || currentUser.parish,
              diocese: dbProfile.diocese || currentUser.diocese,
              role: dbProfile.role === 'admin' ? 'Quản Trị Viên' : (dbProfile.role || currentUser.role),
              points: dbProfile.points !== undefined && dbProfile.points !== null ? dbProfile.points : currentUser.points,
              manna: dbProfile.manna !== undefined && dbProfile.manna !== null ? dbProfile.manna : currentUser.manna,
              avatar: dbProfile.avatar_url || currentUser.avatar,
              selected_title: dbProfile.current_title || (currentUser as any).selected_title || 'NGƯỜI TÌM HIỂU'
            };
            setUser(liveUser);
          }
        } catch (err) {
          console.warn('Header live sync error:', err);
        }
      });
    }

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        setUser(getStoredUser());
      }
    };

    window.addEventListener('veridu_user_updated', handleUserUpdate);

    // Scroll listener for Smart Reveal
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
          setIsVisible(false);
          setIsUserMenuOpen(false);
          setOpenDropdown(null);
        } else if (lastScrollY - currentScrollY > 5) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('veridu_user_updated', handleUserUpdate);
    };
  }, [lastScrollY, isAdmin]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dropdown hover helpers
  const handleMouseEnter = (menuKey: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  // Determine Logo src
  const logoSrc = isDarkMode 
    ? '/images/veridu_logo_light.png' 
    : '/images/veridu_logo_dark.png';

  // Gamification Level Calculation
  const levelInfo = calculateLevelInfo(user?.points || 100, (user as any)?.selected_title || (user as any)?.current_title);

  // Focus Mode: Hide Header on dedicated editors and course players
  const isCoursePlayer = pathname !== '/khoa-hoc' && !!pathname?.startsWith('/khoa-hoc/');
  if (
    pathname === '/soan-bai' || 
    pathname?.startsWith('/soan-bai/') || 
    pathname?.startsWith('/thu-vien/doc/') || 
    (pathname !== '/sach-tranh' && pathname?.startsWith('/sach-tranh/')) ||
    pathname?.startsWith('/admin/khoa-hoc') ||
    pathname?.startsWith('/khoa-hoc/studio') ||
    isCoursePlayer
  ) {
    return null;
  }

  // Unified User Dropdown Modal
  const renderUserMenuDropdown = () => {
    if (!isUserMenuOpen || !user) return null;

    const streakCount = user.streak || 1;
    const displayName = user.displayName || user.fullName || 'Tín Hữu';
    const christianName = user.christianName ? `${user.christianName} ` : '';
    const fullDisplayName = `${christianName}${displayName}`.trim();
    const title = (user as any).selected_title || (user as any).current_title || 'NGƯỜI TÌM HIỂU';

    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-full mt-2.5 w-80 bg-white dark:bg-slate-950/98 border border-stone-200 dark:border-amber-500/30 rounded-3xl shadow-2xl p-4 space-y-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl select-none"
      >
        {/* User Identity Header Card */}
        <div className="flex items-center gap-3 pb-3 border-b border-stone-200 dark:border-white/10">
          <div className="relative w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-lg font-black overflow-hidden border border-amber-500/40 shadow-inner shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="48px" />
            ) : (
              user.christianName ? user.christianName[0] : '✝'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white truncate">
              {fullDisplayName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold text-[10px] uppercase border border-amber-500/30">
                {locale === 'en' ? `LVL ${levelInfo.level}` : (locale === 'la' ? `GRADUS ${levelInfo.level}` : `CẤP ${levelInfo.level}`)}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-slate-400 truncate">
                {title}
              </span>
            </div>
            {(user.parish || user.diocese) && (
              <p className="text-[10px] text-stone-500 dark:text-slate-400 truncate mt-0.5 font-serif italic">
                {user.parish ? `${user.parish}, ` : ''}{user.diocese || ''}
              </p>
            )}
          </div>
        </div>

        {/* Faith Stats Bar: Streak & Progress Bar */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Chuỗi chuyên cần</span>
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
              {streakCount} {locale === 'en' ? 'Days' : (locale === 'la' ? 'Dies' : 'Ngày liên tục')}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-stone-500 dark:text-slate-400 font-mono">
              <span>{levelInfo.currentExp} Manna</span>
              <span>{levelInfo.nextLevelExp} Manna (Cấp {levelInfo.level + 1})</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, levelInfo.progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* ADMIN COMMAND CENTER (Exclusive for Administrators) */}
        {isAdmin && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Trung Tâm Quản Trị</span>
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black animate-pulse">
                  {pendingCount} chờ duyệt
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <Link
                href="/admin"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs transition-all shadow-sm"
              >
                <span>Bảng Quản Trị</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link
                href="/soan-bai"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-900 dark:text-white font-serif font-bold text-xs border border-stone-300 dark:border-white/20 transition-all"
              >
                <PenTool className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Soạn Bài</span>
              </Link>
            </div>
          </div>
        )}

        {/* Personal Links */}
        <div className="space-y-0.5 pt-1">
          <Link 
            href="/ho-so" 
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-stone-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <User className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{t('nav.profile')}</span>
          </Link>

          <Link 
            href="/khoa-hoc" 
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-stone-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Khóa Học Của Tôi</span>
          </Link>

          <Link 
            href="/cai-dat" 
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-stone-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{t('nav.settings')}</span>
          </Link>
        </div>

        {/* Sign Out */}
        <div className="pt-2 border-t border-white/10">
          <button 
            type="button"
            onClick={() => {
              setIsUserMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-serif font-bold text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 notranslate ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-[#FAF7F2]/90 dark:bg-[#0B0D12]/92 backdrop-blur-2xl border-b border-[#E7E2D8] dark:border-amber-500/20 shadow-sm dark:shadow-2xl'
          : 'bg-[#FAF7F2]/80 dark:bg-[#0B0D12]/80 border-b border-[#E7E2D8]/80 dark:border-white/10 backdrop-blur-md'
      }`}
    >
      {/* ────────────────────────────────────────────────────────
          UNIFIED 1-TIER SLIMLINE MASTER HEADER (Height: 68px)
      ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        
        {/* 1. LEFT: BRAND LOGO & MOTTO */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link href="/" className="group flex items-center transition-transform hover:scale-105">
            <div className="relative h-9 w-32 sm:w-36 flex items-center">
              <Image 
                src={logoSrc} 
                alt="VERIDU Logo" 
                width={150} 
                height={40}
                priority
                className="object-contain max-h-9 w-auto drop-shadow-sm"
              />
            </div>
          </Link>

          <div className="hidden lg:block h-5 w-px bg-stone-300 dark:bg-white/15" />

          <span className="hidden xl:inline-block font-cinzel text-[10px] tracking-[0.26em] uppercase font-bold text-amber-700 dark:text-amber-400 drop-shadow-xs">
            VIA · VITA · VERITAS
          </span>
        </div>

        {/* 2. CENTER: 4 HIGH-IMPACT MEGA-MENUS (Desktop >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs uppercase font-serif font-bold tracking-wider">
          
          {/* MENU 1: LỜI CHÚA & LỊCH SỬ */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('scripture')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                openDropdown === 'scripture' || pathname.startsWith('/kinh-thanh') || pathname === '/ban-do' || pathname === '/lich-su' || pathname === '/nhan-vat'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-black'
                  : 'text-stone-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-white/5'
              }`}
            >
              <span>{isEn ? 'Scripture & History' : 'Lời Chúa & Lịch Sử'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'scripture' ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-slate-400'}`} />
            </button>

            {openDropdown === 'scripture' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[460px] bg-white dark:bg-[#11141E]/98 border border-[#E7E2D8] dark:border-slate-700/80 rounded-3xl shadow-2xl p-3 grid grid-cols-2 gap-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <Link 
                  href="/kinh-thanh" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15 group transition-colors border border-transparent hover:border-amber-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 font-serif">Kinh Thánh 73 Sách</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Bản dịch LM. Nguyễn Thế Thuấn</div>
                  </div>
                </Link>

                <Link 
                  href="/ban-do" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 group transition-colors border border-transparent hover:border-emerald-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-serif">Bản Đồ Khảo Cổ 3D</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Giêrusalem, Galilê & Đất Hứa</div>
                  </div>
                </Link>

                <Link 
                  href="/lich-su" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-purple-500/10 dark:hover:bg-purple-500/15 group transition-colors border border-transparent hover:border-purple-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 font-serif">Lịch Sử Cứu Độ</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">4000 năm Lịch sử Cứu độ</div>
                  </div>
                </Link>

                <Link 
                  href="/nhan-vat" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 group transition-colors border border-transparent hover:border-indigo-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-serif">Nhân Vật Thánh Kinh</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Tổ phụ, Ngôn sứ, Tông đồ</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* MENU 2: THẦN HỌC & TRI THỨC */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('theology')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer font-serif ${
                openDropdown === 'theology' || pathname.startsWith('/thu-vien') || pathname.startsWith('/giao-ly') || pathname === '/sach-tranh'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-black'
                  : 'text-stone-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-white/5'
              }`}
            >
              <span>{isEn ? 'Theology & Library' : 'Thần Học & Tri Thức'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'theology' ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-slate-400'}`} />
            </button>

            {openDropdown === 'theology' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[460px] bg-white dark:bg-[#11141E]/98 border border-[#E7E2D8] dark:border-slate-700/80 rounded-3xl shadow-2xl p-3 grid grid-cols-2 gap-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <Link 
                  href="/thu-vien" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15 group transition-colors border border-transparent hover:border-amber-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 font-serif">Thư Viện Bài Viết</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Khảo cứu & suy niệm học thuật</div>
                  </div>
                </Link>

                <Link 
                  href="/giao-ly" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-rose-500/10 dark:hover:bg-rose-500/15 group transition-colors border border-transparent hover:border-rose-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 mt-0.5">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 font-serif">Giáo Lý Hội Thánh</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Tra cứu 4 phần & thẻ lật</div>
                  </div>
                </Link>

                <Link 
                  href="/thu-vien/sach" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 group transition-colors border border-transparent hover:border-indigo-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
                    <Library className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-serif">Tủ Sách & Tài Liệu</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Sách kinh điển PDF, EPUB</div>
                  </div>
                </Link>

                <Link 
                  href="/sach-tranh" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-teal-500/10 dark:hover:bg-teal-500/15 group transition-colors border border-transparent hover:border-teal-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 font-serif">Sách Tranh Công Giáo</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Sách tranh tương tác sinh động</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* MENU 3: KHÓA HỌC */}
          <Link
            href="/khoa-hoc"
            className={`px-3 py-2 rounded-xl transition-all font-serif ${
              pathname.startsWith('/khoa-hoc')
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-black'
                : 'text-stone-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-white/5'
            }`}
          >
            <span>{isEn ? 'Courses' : 'Khóa Học'}</span>
          </Link>

          {/* MENU 4: ĐẤU TRƯỜNG & ĐÓNG GÓP */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('arena')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer font-serif ${
                openDropdown === 'arena' || pathname === '/quiz' || pathname.startsWith('/game') || pathname === '/dong-gop'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-black'
                  : 'text-stone-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-white/5'
              }`}
            >
              <span>{isEn ? 'Arena & Community' : 'Đấu Trường & Cộng Đoàn'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'arena' ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-slate-400'}`} />
            </button>

            {openDropdown === 'arena' && (
              <div className="absolute top-full right-0 mt-1.5 w-[460px] bg-white dark:bg-[#11141E]/98 border border-[#E7E2D8] dark:border-slate-700/80 rounded-3xl shadow-2xl p-3 grid grid-cols-2 gap-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <Link 
                  href="/quiz" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15 group transition-colors border border-transparent hover:border-amber-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 font-serif">Đấu Trường Giáo Lý</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Phòng thi đố vui trực tiếp</div>
                  </div>
                </Link>

                <Link 
                  href="/game" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-purple-500/10 dark:hover:bg-purple-500/15 group transition-colors border border-transparent hover:border-purple-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 mt-0.5">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 font-serif">Trò Chơi Đức Tin</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Triệu phú & Đất hứa</div>
                  </div>
                </Link>

                <Link 
                  href="/dong-gop" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 group transition-colors border border-transparent hover:border-emerald-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-serif">Đóng Góp Bài Viết</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Ứng tuyển tác giả học thuật</div>
                  </div>
                </Link>

                <Link 
                  href="/huong-dan-viet-bai" 
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 group transition-colors border border-transparent hover:border-indigo-500/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-serif">Quy Chuẩn Soạn Bài</div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400 lowercase line-clamp-1">Sổ tay khối chuẩn VERIDU</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

        </nav>

        {/* 3. RIGHT: STREAMLINED UTILITIES & UNIFIED USER HUB */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Language Switcher */}
          <LanguageSwitcher compact />

          {/* Theme Toggle Button */}
          <button 
            type="button"
            onClick={toggleTheme}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
            className="p-2 rounded-full bg-stone-100 dark:bg-slate-900/80 hover:bg-stone-200 dark:hover:bg-slate-850 border border-stone-300 dark:border-slate-700/60 text-amber-700 dark:text-amber-400 hover:border-amber-500/50 transition-all shadow-sm cursor-pointer"
            title={isDarkMode ? 'Chế độ Tối (Nhấp để chuyển sang Sáng)' : 'Chế độ Sáng (Nhấp để chuyển sang Tối)'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* UNIFIED USER HUB (Pill Trigger) */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-stone-100 dark:bg-slate-900/80 hover:bg-stone-200 dark:hover:bg-slate-850 border border-stone-300 dark:border-slate-700/60 hover:border-amber-500/50 text-stone-900 dark:text-slate-100 transition-all text-xs font-bold shadow-sm cursor-pointer group"
                title={`${user.christianName || ''} ${user.displayName || ''}`}
              >
                {/* Avatar with potential Admin indicator */}
                <div className="relative w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-xs font-black overflow-hidden border border-amber-500/40">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="28px" />
                  ) : (
                    user.christianName ? user.christianName[0] : '✝'
                  )}
                  {isAdmin && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white dark:ring-slate-950" />
                  )}
                </div>

                {/* Level Badge */}
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-black text-[10px] uppercase border border-amber-500/30">
                  CẤP {levelInfo.level}
                </span>

                {/* Streak Counter */}
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.streak || 1}</span>
                </span>

                <ChevronDown className={`w-3 h-3 text-stone-500 dark:text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'group-hover:text-amber-600 dark:group-hover:text-amber-400'}`} />
              </button>

              {renderUserMenuDropdown()}
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white dark:text-slate-950 rounded-full font-serif font-bold text-xs shadow-md shadow-amber-600/20 hover:scale-105 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.login')}</span>
            </Link>
          )}

          {/* MOBILE / TABLET MENU TOGGLE BUTTON */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Mở menu danh mục"
            className="lg:hidden p-2 rounded-xl bg-stone-100 dark:bg-slate-900/80 border border-stone-300 dark:border-slate-700/60 text-stone-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 shadow-sm cursor-pointer ml-1"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-600 dark:text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* ────────────────────────────────────────────────────────
          ADAPTIVE MOBILE DRAWER (Below lg: < 1024px)
      ──────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E2D8] dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-950/98 p-5 space-y-4 shadow-2xl backdrop-blur-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300 text-stone-800 dark:text-slate-200">
          
          {/* User card if logged in */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-sm font-black border border-amber-500/40 overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="40px" />
                  ) : (
                    user.christianName ? user.christianName[0] : '✝'
                  )}
                </div>
                <div>
                  <div className="font-serif font-bold text-xs text-stone-900 dark:text-white">
                    {user.christianName ? `${user.christianName} ` : ''}{user.displayName}
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    CẤP {levelInfo.level} · {levelInfo.currentExp} Manna · 🔥 {user.streak || 1} ngày
                  </div>
                </div>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-serif font-bold text-[11px]"
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Group 1: Lời Chúa & Lịch Sử */}
          <div className="space-y-1">
            <div className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 px-2 py-1">
              Lời Chúa &amp; Lịch Sử
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/kinh-thanh"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kinh Thánh</span>
              </Link>
              <Link
                href="/ban-do"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bản Đồ 3D</span>
              </Link>
              <Link
                href="/lich-su"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-purple-500/10 dark:hover:bg-purple-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Lịch Sử</span>
              </Link>
              <Link
                href="/nhan-vat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Nhân Vật</span>
              </Link>
            </div>
          </div>

          {/* Group 2: Thần Học & Tri Thức */}
          <div className="space-y-1 pt-2 border-t border-stone-200 dark:border-white/10">
            <div className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 px-2 py-1">
              Thần Học &amp; Tri Thức
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/thu-vien"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Bài Viết</span>
              </Link>
              <Link
                href="/giao-ly"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <BookMarked className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Giáo Lý</span>
              </Link>
              <Link
                href="/thu-vien/sach"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <Library className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Tủ Sách</span>
              </Link>
              <Link
                href="/sach-tranh"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-teal-500/10 dark:hover:bg-teal-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Sách Tranh</span>
              </Link>
            </div>
          </div>

          {/* Group 3: Khóa Học & Đấu Trường */}
          <div className="space-y-1 pt-2 border-t border-stone-200 dark:border-white/10">
            <div className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 px-2 py-1">
              Khóa Học &amp; Đấu Trường
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/khoa-hoc"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-serif font-bold"
              >
                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Khóa Học</span>
              </Link>
              <Link
                href="/quiz"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Đấu Trường</span>
              </Link>
              <Link
                href="/game"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-purple-500/10 dark:hover:bg-purple-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Trò Chơi</span>
              </Link>
              <Link
                href="/dong-gop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
              >
                <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Đóng Góp</span>
              </Link>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 dark:border-white/10 flex items-center justify-between">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs text-rose-500 dark:text-rose-400 font-serif font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            ) : (
              <Link
                href="/dang-nhap"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white dark:text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
