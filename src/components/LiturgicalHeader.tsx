'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getStoredUser, logout, UserProfile } from '@/lib/auth';
import { calculateLevelInfo } from '@/lib/gamification';
import { 
  Flame, Moon, Sun, Menu, X, User, LogOut, LogIn, ChevronDown, 
  BookOpen, MapPin, Clock, Users, FileText, Library, Award, Shield, Cross, Sparkles,
  Zap, Droplets, Settings, Gamepad2, Scroll, MoreHorizontal
} from 'lucide-react';

export default function LiturgicalHeader() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Dropdown states for Desktop/Tablet Nav menus
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile/Tablet Drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);

  // Auth & Profile Menu state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const desktopUserMenuRef = useRef<HTMLDivElement>(null);
  const tabletUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    // Background live sync with Supabase profiles
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
              displayName: dbProfile.display_name || dbProfile.full_name || currentUser.displayName,
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

    // Live update when EXP / Mana / Streak changes
    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        setUser(getStoredUser());
      }
    };
    window.addEventListener('veridu_user_updated', handleUserUpdate);

    // Sync dark mode from DOM
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Scroll listener for Smart Reveal & Translucent Glass
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
  }, [lastScrollY]);

  // Click-Outside & Escape key listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (desktopUserMenuRef.current && desktopUserMenuRef.current.contains(target)) ||
        (tabletUserMenuRef.current && tabletUserMenuRef.current.contains(target))
      ) {
        return;
      }
      setIsUserMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  // Close drawer and dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

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

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  // Determine Logo src
  const isHomepageAtTop = pathname === '/' && !isScrolled;
  const isDarkLook = isDarkMode || isHomepageAtTop;
  const logoSrc = isDarkLook 
    ? '/images/veridu_logo_light.png' 
    : '/images/veridu_logo_dark.png';

  // Gamification Level
  const levelInfo = calculateLevelInfo(user?.points || 100, (user as any)?.selected_title || (user as any)?.current_title);

  // Hide global header in dedicated document reader or storybook reader
  if (pathname?.startsWith('/thu-vien/doc/') || (pathname !== '/sach-tranh' && pathname?.startsWith('/sach-tranh/'))) {
    return null;
  }

  // Ultra-Sleek Streamlined User Menu Popover Card (Glassmorphic)
  const renderUserMenuDropdown = () => {
    if (!isUserMenuOpen || !user) return null;
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-0.5 z-50 animate-in zoom-in-95 duration-150 backdrop-blur-2xl select-none"
      >
        {/* 1. Hồ Sơ */}
        <Link 
          href="/ho-so" 
          onClick={() => setIsUserMenuOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-slate-200 hover:bg-amber-500/15 hover:text-amber-400 transition-colors group cursor-pointer"
        >
          <User className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Hồ Sơ</span>
        </Link>

        {/* 2. Cài Đặt */}
        <Link 
          href="/cai-dat" 
          onClick={() => setIsUserMenuOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-slate-200 hover:bg-amber-500/15 hover:text-amber-400 transition-colors group cursor-pointer"
        >
          <Settings className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Cài Đặt</span>
        </Link>

        {/* 3. Đăng Bài (Admin) */}
        {user.role === 'Quản Trị Viên' && (
          <Link 
            href="/dang-bai" 
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-amber-400 hover:bg-amber-500/15 transition-colors group cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Đăng Bài</span>
          </Link>
        )}

        {/* 4. Đăng Xuất */}
        <div className="pt-1 border-t border-slate-800 my-0.5">
          <button 
            type="button"
            onClick={() => {
              setIsUserMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-bold text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl'
          : 'bg-transparent border-b border-white/10 backdrop-blur-xs'
      }`}
    >
      
      {/* ========================================================
          1. LARGE DESKTOP (xl: >= 1280px): 2-TIER GRAND LITURGICAL
      ======================================================== */}
      <div className="hidden xl:block w-full">
        
        {/* TIER 1: CENTERED LOGO & BALANCED UTILITIES */}
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-16 flex items-center justify-between relative border-b border-white/10">
          
          {/* Left: Balanced slogan */}
          <div className="flex-1 flex items-center">
            <span className="font-serif text-[10px] tracking-[0.28em] uppercase font-bold text-amber-400/90 drop-shadow-xs">
              VIA · VITA · VERITAS
            </span>
          </div>

          {/* Center: Hero Logo */}
          <div className="shrink-0 flex justify-center items-center px-4">
            <Link href="/" className="group flex items-center justify-center transition-transform hover:scale-105">
              <div className="relative h-10 w-44 flex items-center justify-center">
                <Image 
                  src={logoSrc} 
                  alt="VERIDU Logo" 
                  width={180} 
                  height={50}
                  priority
                  className="object-contain max-h-10 w-auto transition-opacity duration-300 drop-shadow-md"
                />
              </div>
            </Link>
          </div>

          {/* Right: Full Streak & User Pill */}
          <div className="flex-1 flex items-center justify-end gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                
                {/* Streak Badge */}
                <div 
                  title={`Chuỗi học tập liên tục: ${user.streak || 1} ngày`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-bold text-xs shadow-xs"
                >
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                  <span>{user.streak || 1} Ngày</span>
                </div>
                
                {/* Full Desktop User Pill */}
                <div className="relative" ref={desktopUserMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 hover:border-amber-500/50 text-slate-100 transition-all text-xs font-bold shadow-md cursor-pointer group"
                  >
                    <div className="relative w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif text-xs font-black overflow-hidden border border-amber-500/30">
                      {user.avatar ? (
                        <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="28px" />
                      ) : (
                        user.christianName ? user.christianName[0] : '✝'
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-serif font-bold text-slate-100 truncate max-w-[130px]">
                        {user.christianName ? `${user.christianName} ` : ''}{user.displayName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono font-black text-[10px] uppercase border border-amber-500/30">
                        CẤP {levelInfo.level}
                      </span>
                    </div>

                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-amber-400'}`} />
                  </button>

                  {renderUserMenuDropdown()}
                </div>

              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-slate-950 rounded-full font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all hover:scale-105"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              aria-label="Chuyển đổi giao diện Sáng / Tối"
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 text-amber-400 hover:border-amber-500/50 transition-all shadow-md cursor-pointer"
              title={isDarkMode ? 'Chế độ Tối (Nhấp để chuyển sang Sáng)' : 'Chế độ Sáng (Nhấp để chuyển sang Tối)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>

        </div>

        {/* TIER 2: HIGH-CONTRAST HORIZONTAL NAVIGATION */}
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-center">
          <nav className="flex items-center gap-8 text-xs uppercase font-serif font-bold tracking-wider">
            
            {/* 1. KINH THÁNH */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('kinh-thanh')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/kinh-thanh" 
                className={`flex items-center gap-1.5 py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                  pathname.startsWith('/kinh-thanh') || pathname === '/ban-do' || pathname === '/lich-su' || pathname === '/nhan-vat' 
                    ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' 
                    : ''
                }`}
              >
                <span>Kinh Thánh</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 transition-transform group-hover:rotate-180" />
              </Link>

              {openDropdown === 'kinh-thanh' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/kinh-thanh" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-amber-400">Sách Kinh Thánh</div>
                      <div className="text-[10px] text-slate-400 lowercase">73 Sách Cựu &amp; Tân Ước</div>
                    </div>
                  </Link>

                  <Link href="/ban-do" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-emerald-400">Bản Đồ 3D</div>
                      <div className="text-[10px] text-slate-400 lowercase">Địa danh &amp; vùng đất Thánh</div>
                    </div>
                  </Link>

                  <Link href="/lich-su" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-purple-400">Dòng Thời Gian</div>
                      <div className="text-[10px] text-slate-400 lowercase">Lịch sử cứu độ qua các thời kỳ</div>
                    </div>
                  </Link>

                  <Link href="/nhan-vat" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-indigo-400">Nhân Vật</div>
                      <div className="text-[10px] text-slate-400 lowercase">Gia phả &amp; tiểu sử Thánh</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. KHÓA HỌC */}
            <Link 
              href="/khoa-hoc" 
              className={`py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                pathname.startsWith('/khoa-hoc') ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Khóa Học
            </Link>

            {/* 3. THƯ VIỆN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('thu-vien')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/thu-vien" 
                className={`flex items-center gap-1.5 py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                  pathname.startsWith('/thu-vien') ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' : ''
                }`}
              >
                <span>Thư Viện</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 transition-transform group-hover:rotate-180" />
              </Link>

              {openDropdown === 'thu-vien' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/thu-vien" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-amber-400">Bài Viết</div>
                      <div className="text-[10px] text-slate-400 lowercase">Suy niệm &amp; thần học</div>
                    </div>
                  </Link>

                  <Link href="/thu-vien/sach" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <Library className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-indigo-400">Tủ Sách</div>
                      <div className="text-[10px] text-slate-400 lowercase">Sách điện tử PDF, EPUB</div>
                    </div>
                  </Link>

                  <Link href="/thu-vien/tai-lieu" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/15 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-rose-400">Tài Liệu</div>
                      <div className="text-[10px] text-slate-400 lowercase">Giáo án &amp; văn kiện PDF/Word</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. GIÁO LÝ */}
            <Link 
              href="/giao-ly" 
              className={`py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                pathname.startsWith('/giao-ly') ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Giáo Lý
            </Link>

            {/* 5. SÁCH TRANH */}
            <Link 
              href="/sach-tranh" 
              className={`py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                pathname.startsWith('/sach-tranh') ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Sách Tranh
            </Link>

            {/* 6. ĐẤU TRƯỜNG */}
            <Link 
              href="/quiz" 
              className={`py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                pathname.startsWith('/quiz') ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Đấu Trường
            </Link>

            {/* 7. GAME */}
            <Link 
              href="/game" 
              className={`py-1 text-slate-200 hover:text-amber-400 transition-colors drop-shadow-xs ${
                pathname.startsWith('/game') ? 'text-amber-400 font-black border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Game
            </Link>

          </nav>
        </div>

      </div>

      {/* ========================================================
          2. TABLET & LAPTOP (md to xl: 768px - 1279px): SLEEK 1-ROW
      ======================================================== */}
      <div className="hidden md:flex xl:hidden w-full h-16 px-4 lg:px-8 items-center justify-between border-b border-white/10">
        
        {/* Left: Brand Logo */}
        <div className="shrink-0 flex items-center">
          <Link href="/" className="group flex items-center transition-transform hover:scale-105">
            <div className="relative h-9 w-32 lg:w-36 flex items-center">
              <Image 
                src={logoSrc} 
                alt="VERIDU Logo" 
                width={150} 
                height={42}
                priority
                className="object-contain max-h-9 w-auto transition-opacity duration-300 drop-shadow-md"
              />
            </div>
          </Link>
        </div>

        {/* Center: High-Contrast Navigation */}
        <nav className="flex items-center gap-3 lg:gap-5 text-xs uppercase font-serif font-bold tracking-wider">
          
          {/* 1. KINH THÁNH */}
          <div 
            className="relative py-2"
            onMouseEnter={() => handleMouseEnter('kinh-thanh-tab')}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href="/kinh-thanh" 
              className={`flex items-center gap-1 py-1 text-slate-200 hover:text-amber-400 transition-colors ${
                pathname.startsWith('/kinh-thanh') || pathname === '/ban-do' || pathname === '/lich-su' || pathname === '/nhan-vat' 
                  ? 'text-amber-400 font-black' 
                  : ''
              }`}
            >
              <span>Kinh Thánh</span>
              <ChevronDown className="w-3 h-3 text-amber-400/80 transition-transform group-hover:rotate-180" />
            </Link>

            {openDropdown === 'kinh-thanh-tab' && (
              <div className="absolute top-full left-0 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <Link href="/kinh-thanh" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-500/15 group transition-colors">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-amber-400">73 Sách Thánh</span>
                </Link>
                <Link href="/ban-do" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-emerald-500/15 group transition-colors">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-emerald-400">Bản Đồ 3D</span>
                </Link>
                <Link href="/lich-su" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-purple-500/15 group transition-colors">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-purple-400">Dòng Thời Gian</span>
                </Link>
                <Link href="/nhan-vat" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-indigo-500/15 group transition-colors">
                  <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-indigo-400">Nhân Vật</span>
                </Link>
              </div>
            )}
          </div>

          {/* 2. KHÓA HỌC */}
          <Link 
            href="/khoa-hoc" 
            className={`py-1 text-slate-200 hover:text-amber-400 transition-colors ${
              pathname.startsWith('/khoa-hoc') ? 'text-amber-400 font-black' : ''
            }`}
          >
            Khóa Học
          </Link>

          {/* 3. THƯ VIỆN */}
          <div 
            className="relative py-2"
            onMouseEnter={() => handleMouseEnter('thu-vien-tab')}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href="/thu-vien" 
              className={`flex items-center gap-1 py-1 text-slate-200 hover:text-amber-400 transition-colors ${
                pathname.startsWith('/thu-vien') ? 'text-amber-400 font-black' : ''
              }`}
            >
              <span>Thư Viện</span>
              <ChevronDown className="w-3 h-3 text-amber-400/80 transition-transform group-hover:rotate-180" />
            </Link>

            {openDropdown === 'thu-vien-tab' && (
              <div className="absolute top-full left-0 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <Link href="/thu-vien" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-500/15 group transition-colors">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-amber-400">Bài Viết &amp; Suy Niệm</span>
                </Link>
                <Link href="/thu-vien/sach" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-indigo-500/15 group transition-colors">
                  <Library className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-indigo-400">Tủ Sách Điện Tử</span>
                </Link>
                <Link href="/thu-vien/tai-lieu" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-rose-500/15 group transition-colors">
                  <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-rose-400">Tài Liệu Giáo Án</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. GIÁO LÝ */}
          <Link 
            href="/giao-ly" 
            className={`py-1 text-slate-200 hover:text-amber-400 transition-colors ${
              pathname.startsWith('/giao-ly') ? 'text-amber-400 font-black' : ''
            }`}
          >
            Giáo Lý
          </Link>

          {/* 5. ON LAPTOP (>= 1024px): SHOW ALL DIRECT LINKS */}
          <Link 
            href="/sach-tranh" 
            className={`hidden lg:inline py-1 text-slate-200 hover:text-amber-400 transition-colors ${
              pathname.startsWith('/sach-tranh') ? 'text-amber-400 font-black' : ''
            }`}
          >
            Sách Tranh
          </Link>

          <Link 
            href="/quiz" 
            className={`hidden lg:inline py-1 text-slate-200 hover:text-amber-400 transition-colors ${
              pathname.startsWith('/quiz') ? 'text-amber-400 font-black' : ''
            }`}
          >
            Đấu Trường
          </Link>

          <Link 
            href="/game" 
            className={`hidden lg:inline py-1 text-slate-200 hover:text-amber-400 transition-colors ${
              pathname.startsWith('/game') ? 'text-amber-400 font-black' : ''
            }`}
          >
            Game
          </Link>

          {/* 6. ON TABLET (< 1024px): COMPACT "KHÁC" DROPDOWN */}
          <div 
            className="lg:hidden relative py-2"
            onMouseEnter={() => handleMouseEnter('khac-tab')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'khac-tab' ? null : 'khac-tab')}
              className={`flex items-center gap-1 py-1 text-slate-200 hover:text-amber-400 transition-colors cursor-pointer ${
                pathname.startsWith('/sach-tranh') || pathname.startsWith('/quiz') || pathname.startsWith('/game')
                  ? 'text-amber-400 font-black' 
                  : ''
              }`}
            >
              <span>Khác</span>
              <ChevronDown className="w-3 h-3 text-amber-400/80 transition-transform group-hover:rotate-180" />
            </button>

            {openDropdown === 'khac-tab' && (
              <div className="absolute top-full right-0 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <Link href="/sach-tranh" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-500/15 group transition-colors">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-amber-400">Sách Tranh Thiếu Nhi</span>
                </Link>
                <Link href="/quiz" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-500/15 group transition-colors">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-amber-400">Đấu Trường Quiz</span>
                </Link>
                <Link href="/game" className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-500/15 group transition-colors">
                  <Gamepad2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-slate-100 group-hover:text-amber-400">Cổng Game Giáo Lý</span>
                </Link>
              </div>
            )}
          </div>

        </nav>

        {/* Right: Streamlined Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Compact Streak Pill */}
          {user && (
            <div 
              title={`Chuỗi học tập liên tục: ${user.streak || 1} ngày`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-bold text-xs shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{user.streak || 1}</span>
            </div>
          )}

          {/* Compact User Pill */}
          {user ? (
            <div className="relative" ref={tabletUserMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-1 pr-2 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 hover:border-amber-500/50 text-slate-100 transition-all text-xs font-bold shadow-md cursor-pointer group"
                title={`${user.christianName || ''} ${user.displayName || ''}`}
              >
                <div className="relative w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif text-xs font-black overflow-hidden border border-amber-500/30">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="28px" />
                  ) : (
                    user.christianName ? user.christianName[0] : '✝'
                  )}
                </div>

                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono font-black text-[10px] uppercase border border-amber-500/30">
                  CẤP {levelInfo.level}
                </span>

                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-amber-400'}`} />
              </button>

              {renderUserMenuDropdown()}
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-slate-950 rounded-full font-bold text-xs shadow-sm hover:bg-amber-400 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 text-amber-400 hover:border-amber-500/50 transition-all shadow-md cursor-pointer"
            title={isDarkMode ? 'Chế độ Tối (Nhấp để chuyển sang Sáng)' : 'Chế độ Sáng (Nhấp để chuyển sang Tối)'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Tablet Drawer Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Mở menu đầy đủ"
            className="lg:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 hover:text-amber-400 shadow-sm cursor-pointer"
            title="Mở toàn bộ danh mục"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* ========================================================
          3. MOBILE (< 768px): COMPACT 1-ROW HEADER
      ======================================================== */}
      <div className="md:hidden w-full h-16 px-4 flex items-center justify-between border-b border-white/10">
        
        {/* Left: Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Mở menu"
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 hover:text-amber-400 shadow-sm cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex items-center justify-center">
          <div className="relative h-8 w-32 flex items-center justify-center">
            <Image 
              src={logoSrc} 
              alt="VERIDU Logo" 
              width={140} 
              height={40}
              priority
              className="object-contain max-h-8 w-auto drop-shadow-md"
            />
          </div>
        </Link>

        {/* Right: Theme Toggle & User Avatar */}
        <div className="flex items-center gap-2">
          {user && (
            <div 
              title={`Chuỗi: ${user.streak || 1} ngày`}
              className="flex items-center gap-1 px-2 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-bold text-[11px]"
            >
              <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{user.streak || 1}</span>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            aria-label="Đổi giao diện Sáng / Tối"
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-amber-400 shadow-sm cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {user ? (
            <Link href="/ho-so" className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-serif text-xs font-black overflow-hidden shadow-sm">
              {user.avatar ? (
                <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="32px" />
              ) : (
                user.christianName ? user.christianName[0] : 'G'
              )}
            </Link>
          ) : (
            <Link href="/dang-nhap" className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm">
              <LogIn className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>

      {/* ========================================================
          4. ADAPTIVE MENU DRAWER (Mobile & Tablet)
      ======================================================== */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950/98 p-5 space-y-4 shadow-2xl backdrop-blur-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300 text-slate-200">
          
          {/* User Profile Card Summary */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-serif font-black overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" width={40} height={40} className="object-cover" />
                  ) : (
                    '✝'
                  )}
                </div>
                <div>
                  <div className="font-serif font-bold text-sm text-slate-100">
                    {user.christianName} {user.displayName}
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono font-bold">
                    CẤP {levelInfo.level} · {levelInfo.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-bold text-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user.streak || 1} Ngày</span>
              </div>
            </div>
          )}

          {/* 1. KINH THÁNH GROUP */}
          <div className="space-y-1">
            <button 
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'kinh-thanh' ? null : 'kinh-thanh')}
              className="w-full py-2.5 flex items-center justify-between text-sm font-bold text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400" /> Kinh Thánh
              </span>
              <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${mobileExpandedGroup === 'kinh-thanh' ? 'rotate-180' : ''}`} />
            </button>

            {mobileExpandedGroup === 'kinh-thanh' && (
              <div className="pl-6 space-y-2 py-2 border-l-2 border-amber-500/30 ml-2">
                <Link href="/kinh-thanh" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-amber-400">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Sách (73 Sách Thánh)
                </Link>
                <Link href="/ban-do" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-emerald-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Bản Đồ 3D Thánh Địa
                </Link>
                <Link href="/lich-su" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-purple-400">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Dòng Thời Gian Cứu Độ
                </Link>
                <Link href="/nhan-vat" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-indigo-400">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Nhân Vật Kinh Thánh
                </Link>
              </div>
            )}
          </div>

          {/* 2. KHÓA HỌC */}
          <Link href="/khoa-hoc" className="block py-2.5 text-sm font-bold text-slate-200 hover:text-amber-400 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-400" /> Khóa Học
          </Link>

          {/* 3. THƯ VIỆN GROUP */}
          <div className="space-y-1">
            <button 
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'thu-vien' ? null : 'thu-vien')}
              className="w-full py-2.5 flex items-center justify-between text-sm font-bold text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Library className="w-4 h-4 text-indigo-400" /> Thư Viện
              </span>
              <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform ${mobileExpandedGroup === 'thu-vien' ? 'rotate-180' : ''}`} />
            </button>

            {mobileExpandedGroup === 'thu-vien' && (
              <div className="pl-6 space-y-2 py-2 border-l-2 border-indigo-500/30 ml-2">
                <Link href="/thu-vien" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-amber-400">
                  <FileText className="w-3.5 h-3.5 text-amber-400" /> Bài Viết &amp; Suy Niệm
                </Link>
                <Link href="/thu-vien/sach" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-indigo-400">
                  <Library className="w-3.5 h-3.5 text-indigo-400" /> Tủ Sách Điện Tử (PDF/EPUB)
                </Link>
                <Link href="/thu-vien/tai-lieu" className="flex items-center gap-2 py-1.5 text-xs text-slate-300 hover:text-rose-400">
                  <BookOpen className="w-3.5 h-3.5 text-rose-400" /> Tài Liệu &amp; Giáo Án
                </Link>
              </div>
            )}
          </div>

          {/* 4. GIÁO LÝ */}
          <Link href="/giao-ly" className="block py-2.5 text-sm font-bold text-slate-200 hover:text-amber-400 flex items-center gap-2.5">
            <Cross className="w-4 h-4 text-rose-400" /> Giáo Lý
          </Link>

          {/* 5. SÁCH TRANH THIẾU NHI */}
          <Link href="/sach-tranh" className="block py-2.5 text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Sách Tranh Thiếu Nhi
          </Link>

          {/* 6. ĐẤU TRƯỜNG */}
          <Link href="/quiz" className="block py-2.5 text-sm font-bold text-slate-200 hover:text-amber-400 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-400" /> Đấu Trường
          </Link>

          {/* 7. CỔNG GAME GIÁO LÝ */}
          <Link href="/game" className="block py-2.5 text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2.5">
            <Gamepad2 className="w-4 h-4 text-amber-400" /> Cổng Game Giáo Lý
          </Link>

          {/* User Links in Drawer */}
          <div className="pt-4 border-t border-slate-800 space-y-1">
            {user ? (
              <div className="space-y-1">
                <Link href="/ho-so" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-xs font-bold text-slate-200 hover:text-amber-400">
                  <User className="w-4 h-4 text-amber-400" /> Hồ Sơ
                </Link>
                <Link href="/cai-dat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-xs font-bold text-slate-200 hover:text-amber-400">
                  <Settings className="w-4 h-4 text-indigo-400" /> Cài Đặt
                </Link>
                {user.role === 'Quản Trị Viên' && (
                  <Link href="/dang-bai" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-xs font-bold text-amber-400 hover:text-amber-300">
                    <FileText className="w-4 h-4 text-amber-400" /> Đăng Bài
                  </Link>
                )}
                <button type="button" onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full text-left flex items-center gap-2 py-2 text-xs font-bold text-red-400 cursor-pointer">
                  <LogOut className="w-4 h-4" /> Đăng Xuất
                </button>
              </div>
            ) : (
              <Link href="/dang-nhap" className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" /> Đăng Nhập / Đăng Ký
              </Link>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
