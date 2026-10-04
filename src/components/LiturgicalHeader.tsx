'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getStoredUser, logout, UserProfile } from '@/lib/auth';
import { calculateLevelInfo } from '@/lib/gamification';
import { 
  Flame, Moon, Sun, Menu, X, User, LogOut, LogIn, ChevronDown, 
  Shield, GraduationCap, Settings, PenTool, ChevronRight, Search, Bookmark
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/context/LanguageContext';

interface NavItem {
  label: string;
  href: string;
}

interface NavGroup {
  id: string;
  title: string;
  matchPrefixes: string[];
  items: NavItem[];
}

export default function LiturgicalHeader() {
  const pathname = usePathname();
  const { t, locale, isEn } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Active dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Drawer state
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

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 8) {
          setIsVisible(false);
          setIsUserMenuOpen(false);
          setOpenDropdown(null);
        } else if (lastScrollY - currentScrollY > 8) {
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

  // Click outside to close user menu & dropdowns
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

  // ────────────────────────────────────────────────────────
  // 5 CORE STREAMLINED NAV GROUPS (EDITORIAL BRUTALIST LUXURY)
  // ────────────────────────────────────────────────────────
  const navGroups: NavGroup[] = [
    {
      id: 'scripture',
      title: isEn ? 'Scripture' : 'Kinh Thánh',
      matchPrefixes: ['/kinh-thanh', '/ban-do', '/lich-su', '/nhan-vat'],
      items: [
        { label: isEn ? 'Text (73 Books)' : 'Bản Văn (73 Cuốn)', href: '/kinh-thanh' },
        { label: isEn ? 'Holy Land 3D Map' : 'Bản Đồ Thánh Địa', href: '/ban-do' },
        { label: isEn ? 'Biblical Timeline' : 'Dòng Thời Gian', href: '/lich-su' },
        { label: isEn ? 'Biblical Figures' : 'Nhân Vật Đức Tin', href: '/nhan-vat' },
      ],
    },
    {
      id: 'courses',
      title: isEn ? 'Academy' : 'Khóa Học',
      matchPrefixes: ['/khoa-hoc'],
      items: [
        { label: isEn ? 'All Courses' : 'Tất Cả Khóa Học', href: '/khoa-hoc' },
        { label: isEn ? 'Sacred Liturgy' : 'Phụng Vụ Thánh', href: '/khoa-hoc?category=phung-vu' },
        { label: isEn ? 'Scripture Study' : 'Kinh Thánh Khảo Luận', href: '/khoa-hoc?category=cuu-uoc' },
        { label: isEn ? 'Catechesis' : 'Giáo Lý Căn Bản', href: '/khoa-hoc?category=giao-ly' },
        { label: isEn ? 'Dogmatic Theology' : 'Thần Học Tín Lý', href: '/khoa-hoc?category=than-hoc' },
        { label: isEn ? 'Christian Philosophy' : 'Triết Học Kitô Giáo', href: '/khoa-hoc?category=triet-hoc' },
      ],
    },
    {
      id: 'catechism',
      title: isEn ? 'Catechism' : 'Giáo Lý',
      matchPrefixes: ['/giao-ly', '/quiz', '/game'],
      items: [
        { label: isEn ? 'Catechism of the Catholic Church' : 'Bản Văn Giáo Lý', href: '/giao-ly' },
        { label: isEn ? 'Study Flashcards' : 'Thẻ Lật Ôn Tập', href: '/giao-ly/the-lat' },
        { label: isEn ? 'Quiz Arena' : 'Đấu Trường Đức Tin', href: '/quiz' },
        { label: isEn ? 'Faith Webgames' : 'Trò Chơi Trắc Nghiệm', href: '/game' },
      ],
    },
    {
      id: 'library',
      title: isEn ? 'Library' : 'Thư Viện',
      matchPrefixes: ['/thu-vien', '/sach-tranh'],
      items: [
        { label: isEn ? 'Articles & Treatises' : 'Bài Viết Khảo Cứu', href: '/thu-vien' },
        { label: isEn ? 'Theology Bookshelf' : 'Tủ Sách Thần Học', href: '/thu-vien/sach' },
        { label: isEn ? 'Illustrated Storybooks' : 'Sách Tranh Thánh Kinh', href: '/sach-tranh' },
        { label: isEn ? 'Documents & Records' : 'Văn Kiện & Tài Liệu', href: '/thu-vien/tai-lieu' },
      ],
    },
    {
      id: 'contact',
      title: isEn ? 'Contact' : 'Liên Hệ',
      matchPrefixes: ['/dong-gop', '/tac-gia', '/huong-dan-viet-bai', '/dieu-khoan-su-dung', '/chinh-sach-bao-mat'],
      items: [
        { label: isEn ? 'Mission Donation' : 'Đóng Góp Sứ Vụ', href: '/dong-gop' },
        { label: isEn ? 'Editorial Authors' : 'Đội Ngũ Tác Giả', href: '/tac-gia' },
        { label: isEn ? 'Author Guidelines' : 'Hướng Dẫn Soạn Bài', href: '/huong-dan-viet-bai' },
        { label: isEn ? 'Terms of Service' : 'Điều Khoản Sử Dụng', href: '/dieu-khoan-su-dung' },
        { label: isEn ? 'Privacy Policy' : 'Chính Sách Bảo Mật', href: '/chinh-sach-bao-mat' },
      ],
    },
  ];

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
        className="absolute right-0 top-full mt-3 w-76 sm:w-80 bg-[#FAF7F2] dark:bg-[#0B0D12] border border-stone-200 dark:border-amber-500/30 rounded-2xl shadow-2xl p-4 space-y-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl select-none"
      >
        {/* User Identity Header Card */}
        <div className="flex items-center gap-3 pb-3 border-b border-stone-200 dark:border-white/10">
          <div className="relative w-11 h-11 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-lg font-black overflow-hidden border border-amber-500/40 shadow-inner shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="44px" />
            ) : (
              user.christianName ? user.christianName[0] : '✝'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-playfair font-bold text-sm text-stone-900 dark:text-white truncate">
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
        <div className="p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2">
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
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2">
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
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs transition-all shadow-xs"
              >
                <span>Bảng Quản Trị</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link
                href="/soan-bai"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-900 dark:text-white font-serif font-bold text-xs border border-stone-300 dark:border-white/20 transition-all"
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-serif font-bold text-stone-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <User className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{t('nav.profile')}</span>
          </Link>

          <Link 
            href="/khoa-hoc" 
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-serif font-bold text-stone-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Khóa Học Của Tôi</span>
          </Link>

          <Link 
            href="/cai-dat" 
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-serif font-bold text-stone-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{t('nav.settings')}</span>
          </Link>
        </div>

        {/* Sign Out */}
        <div className="pt-2 border-t border-stone-200 dark:border-white/10">
          <button 
            type="button"
            onClick={() => {
              setIsUserMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-serif font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 notranslate ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* ══════════════════════════════════════════════════════════════════════════
          TIER 1: TOP UTILITY BAR (Black / Obsidian Dark Elegant Ribbon)
          Faithful reproduction of reference template top utility bar
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#111215] text-[#9CA3AF] dark:bg-[#07080A] dark:text-[#7E828E] border-b border-black/40 dark:border-white/5 text-[10px] sm:text-[10.5px] font-mono tracking-[0.14em] uppercase select-none transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-7.5 sm:h-8 flex items-center justify-between">
          
          {/* Left: Sacred Scripture Motto */}
          <div className="flex items-center gap-2 truncate">
            <span className="text-amber-500 dark:text-amber-400 font-serif">✝</span>
            <span className="font-semibold text-stone-200 dark:text-stone-300 truncate hover:text-amber-400 transition-colors">
              {isEn 
                ? '"YOUR WORD IS A LAMP TO MY FEET" — PS 119:105' 
                : '"LỜI CHÚA LÀ NGỌN ĐÈN SOI CHO CON BƯỚC" — TV 119,105'}
            </span>
          </div>

          {/* Right: Quick Utility Links */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3 shrink-0 text-stone-400 dark:text-stone-400">
            <Link 
              href="/dong-gop" 
              className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              {isEn ? 'DONATE' : 'ĐÓNG GÓP'}
            </Link>
            <span className="text-stone-600 dark:text-stone-600">•</span>
            <Link 
              href="/thu-vien/tai-lieu" 
              className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              {isEn ? 'DOCUMENTS' : 'VĂN KIỆN'}
            </Link>
            <span className="text-stone-600 dark:text-stone-600">•</span>
            <Link 
              href="/tac-gia" 
              className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              {isEn ? 'AUTHORS' : 'TÁC GIẢ'}
            </Link>
            <span className="text-stone-600 dark:text-stone-600">•</span>
            <Link 
              href="/dieu-khoan-su-dung" 
              className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors"
            >
              {isEn ? 'HELP' : 'TRỢ GIÚP'}
            </Link>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TIER 2: MAIN NAVIGATION BAR (Editorial Centered Logo Architecture)
          Left: 5 Editorial Menus | Center: VERIDU Brand | Right: Action Tools
         ══════════════════════════════════════════════════════════════════════════ */}
      <div 
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF7F2]/95 dark:bg-[#0B0D12]/95 backdrop-blur-2xl border-b border-[#E5E0D8] dark:border-white/10 shadow-sm dark:shadow-2xl/40'
            : 'bg-[#FAF7F2]/90 dark:bg-[#0B0D12]/90 backdrop-blur-md border-b border-[#E5E0D8]/80 dark:border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between relative">
          
          {/* ────────────────────────────────────────────────────────
              1. LEFT COLUMN: 5 REFINED EDITORIAL MENUS (Desktop >= 1024px)
             ──────────────────────────────────────────────────────── */}
          <div className="flex-1 hidden lg:flex items-center justify-start gap-4 xl:gap-6">
            <nav className="flex items-center gap-1 xl:gap-2 text-[11px] xl:text-xs font-playfair font-bold tracking-[0.14em] uppercase">
              {navGroups.map((group) => {
                const isGroupActive = group.matchPrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
                const isOpen = openDropdown === group.id;

                return (
                  <div 
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(group.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                        isOpen || isGroupActive
                          ? 'text-amber-800 dark:text-amber-300 font-black bg-amber-500/10'
                          : 'text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/40 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{group.title}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500'}`} />
                    </button>

                    {/* Slim Elegant Dropdown Card (Editorial Style) */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 sm:w-56 bg-white/98 dark:bg-[#11141E]/98 backdrop-blur-2xl border border-stone-200 dark:border-amber-500/25 rounded-2xl shadow-xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {group.items.map((item) => {
                          const isItemActive = pathname === item.href || (item.href !== '/khoa-hoc' && pathname.startsWith(item.href));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-serif transition-colors ${
                                isItemActive
                                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold'
                                  : 'text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-white/5 font-medium'
                              }`}
                            >
                              <span>{item.label}</span>
                              <ChevronRight className="w-3 h-3 text-stone-400/60 dark:text-stone-500/60 group-hover:text-amber-600" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ────────────────────────────────────────────────────────
              2. CENTER COLUMN: MAJESTIC CENTER BRAND LOGO
              Matches "MAFIA THE GAME" exact central prominent hierarchy
             ──────────────────────────────────────────────────────── */}
          <div className="shrink-0 flex flex-col items-center justify-center text-center px-4 group select-none">
            <Link href="/" className="flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
              <span className="font-playfair font-black text-2xl sm:text-[26px] tracking-[0.26em] text-stone-900 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors uppercase leading-none">
                VERIDU
              </span>
              <span className="font-mono text-[8.5px] sm:text-[9.5px] tracking-[0.34em] text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase font-medium leading-none mt-1">
                VIA · VITA · VERITAS
              </span>
            </Link>
          </div>

          {/* ────────────────────────────────────────────────────────
              3. RIGHT COLUMN: EDITORIAL UTILITIES & USER HUB
              Matches Search, Wishlist, Theme, Login on reference
             ──────────────────────────────────────────────────────── */}
          <div className="flex-1 hidden lg:flex items-center justify-end gap-3 sm:gap-4">
            
            {/* Search Tool Link */}
            <Link 
              href="/search"
              className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] xl:text-xs font-playfair font-bold uppercase tracking-[0.14em] text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/40 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Tìm kiếm bài viết, tài liệu, kinh thánh"
            >
              <Search className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 group-hover:text-amber-600" />
              <span>{isEn ? 'SEARCH' : 'TÌM KIẾM'}</span>
            </Link>

            {/* Saved Scripture / Faith Notes */}
            <Link 
              href="/ho-so"
              className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] xl:text-xs font-playfair font-bold uppercase tracking-[0.14em] text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200/40 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Sổ tay lưu trữ bài viết & câu Kinh Thánh"
            >
              <Bookmark className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 group-hover:text-amber-600" />
              <span>{isEn ? 'SAVED' : 'ĐÃ LƯU'}</span>
            </Link>

            {/* Theme Toggle Button */}
            <button 
              type="button"
              onClick={toggleTheme}
              aria-label="Chuyển đổi giao diện Sáng / Tối"
              className="p-1.5 rounded-full bg-stone-100 dark:bg-slate-900/80 hover:bg-stone-200 dark:hover:bg-slate-850 border border-stone-300 dark:border-slate-700/60 text-stone-700 dark:text-amber-400 hover:border-amber-500/50 transition-all shadow-xs cursor-pointer"
              title={isDarkMode ? 'Chế độ Tối (Nhấp để chuyển sang Sáng)' : 'Chế độ Sáng (Nhấp để chuyển sang Tối)'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-700" />}
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher compact />

            {/* User Hub Trigger or Login Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full bg-stone-100 dark:bg-slate-900/80 hover:bg-stone-200 dark:hover:bg-slate-850 border border-stone-300 dark:border-slate-700/60 hover:border-amber-500/50 text-stone-900 dark:text-slate-100 transition-all text-xs font-bold shadow-xs cursor-pointer group"
                  title={`${user.christianName || ''} ${user.displayName || ''}`}
                >
                  <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-xs font-black overflow-hidden border border-amber-500/40">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="28px" />
                    ) : (
                      user.christianName ? user.christianName[0] : '✝'
                    )}
                    {isAdmin && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white dark:ring-slate-950" />
                    )}
                  </div>

                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-black text-[9px] sm:text-[10px] uppercase border border-amber-500/30">
                    CẤP {levelInfo.level}
                  </span>

                  <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{user.streak || 1}</span>
                  </span>

                  <ChevronDown className={`w-3 h-3 text-stone-500 dark:text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-amber-600 dark:text-amber-400' : 'group-hover:text-amber-600 dark:group-hover:text-amber-400'}`} />
                </button>

                {renderUserMenuDropdown()}
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white dark:text-slate-950 rounded-full font-playfair font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-105 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? 'LOGIN' : 'ĐĂNG NHẬP'}</span>
              </Link>
            )}

          </div>

          {/* ────────────────────────────────────────────────────────
              4. MOBILE ACTIONS BAR (Screen < 1024px)
             ──────────────────────────────────────────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            
            {/* Search Icon */}
            <Link 
              href="/search"
              aria-label="Tìm kiếm"
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-900/80 border border-stone-300 dark:border-slate-700/60 text-stone-700 dark:text-slate-200 hover:text-amber-700 shadow-xs"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Theme Toggle */}
            <button 
              type="button"
              onClick={toggleTheme}
              aria-label="Chuyển đổi giao diện Sáng / Tối"
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-900/80 border border-stone-300 dark:border-slate-700/60 text-stone-700 dark:text-amber-400 shadow-xs"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu danh mục"
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-900/80 border border-stone-300 dark:border-slate-700/60 text-stone-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 shadow-xs cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-600 dark:text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          ADAPTIVE MOBILE DRAWER (Below lg: < 1024px)
         ──────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E2D8] dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-950/98 p-4 sm:p-5 space-y-4 shadow-2xl backdrop-blur-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300 text-stone-800 dark:text-slate-200">
          
          {/* User card if logged in */}
          {user && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-sm font-black border border-amber-500/40 overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="36px" />
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

          {/* Quick Language bar for mobile */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-200/50 dark:bg-white/5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              {isEn ? 'Language' : 'Ngôn ngữ'}:
            </span>
            <LanguageSwitcher compact />
          </div>

          {/* 5 Mobile Nav Accordions */}
          {navGroups.map((group) => {
            const isExpanded = mobileExpandedGroup === group.id;

            return (
              <div key={group.id} className="space-y-1.5 border-b border-stone-200/70 dark:border-white/10 pb-2.5">
                <button
                  type="button"
                  onClick={() => setMobileExpandedGroup(isExpanded ? null : group.id)}
                  className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-playfair font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400"
                >
                  <span>{group.title}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-600' : 'text-stone-400'}`} />
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 pl-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl bg-stone-200/60 dark:bg-white/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 text-xs text-stone-800 dark:text-slate-200 font-serif"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-3 h-3 text-stone-400/50" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
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
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? 'LOGIN' : 'ĐĂNG NHẬP'}</span>
              </Link>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
