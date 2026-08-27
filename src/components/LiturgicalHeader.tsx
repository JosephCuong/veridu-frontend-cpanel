'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getStoredUser, logout, UserProfile } from '@/lib/auth';
import { 
  Flame, Moon, Sun, Menu, X, User, LogOut, LogIn, ChevronDown, 
  BookOpen, MapPin, Clock, Users, FileText, Library, Award, Shield, Cross, Sparkles
} from 'lucide-react';


export default function LiturgicalHeader() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Dropdown states for Desktop
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());

    // Sync dark mode from DOM
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Scroll listener for Smart Reveal & Translucent Glass
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Detect if scrolled past top boundary
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Smart Reveal: Hide on scroll down, show on scroll up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
          // Scrolling down -> hide header
          setIsVisible(false);
          setIsUserMenuOpen(false);
          setOpenDropdown(null);
        } else if (lastScrollY - currentScrollY > 5) {
          // Scrolling up -> show header
          setIsVisible(true);
        }
      } else {
        // Near top -> always visible
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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

  // Determine Logo src:
  // - On Hero banner (scrollY <= 20) on homepage: background is dark -> use light logo
  // - On Dark Mode: use light logo
  // - On Light Mode & Scrolled down: use dark logo
  const isHomepageAtTop = pathname === '/' && !isScrolled;
  const logoSrc = (isDarkMode || isHomepageAtTop) 
    ? '/images/veridu_logo_light.png' 
    : '/images/veridu_logo_dark.png';

  // Hide global header in dedicated document reader or storybook reader
  if (pathname?.startsWith('/thu-vien/doc/') || (pathname !== '/sach-tranh' && pathname?.startsWith('/sach-tranh/'))) {
    return null;
  }


  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 transform ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled 
          ? 'backdrop-blur-2xl bg-[var(--header-bg)]/90 border-b border-[var(--border-card)] shadow-xl' 
          : (pathname === '/' ? 'bg-transparent text-white' : 'backdrop-blur-xl bg-[var(--header-bg)]/80 border-b border-[var(--border-card)]')
      }`}
    >
      {/* ========================================================
          DESKTOP 2-TIER HEADER (Hidden on Mobile < 768px)
      ======================================================== */}
      <div className="hidden md:block w-full">
        
        {/* TIER 1: CENTERED LOGO & UTILITY ACTIONS */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between relative border-b border-[var(--border-card)]/40">
          
          {/* Left: Balanced spacer / slogan */}
          <div className="flex-1 flex items-center">
            <span className="font-serif text-[10px] tracking-[0.25em] uppercase font-bold text-amber-500/80 hidden lg:inline">
              VIA · VITA · VERITAS
            </span>
          </div>

          {/* Center: Hero Logo Image */}
          <div className="shrink-0 flex justify-center items-center px-4">
            <Link href="/" className="group flex items-center justify-center transition-transform hover:scale-105">
              <div className="relative h-10 w-40 sm:w-44 flex items-center justify-center">
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

          {/* Right: Streak & Auth Controls */}
          <div className="flex-1 flex items-center justify-end gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Streaks Widget */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-800 dark:text-amber-400 font-bold text-xs shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{user.streak || 1} Ngày</span>
                </div>
                
                {/* User Dropdown */}
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
                    <span className="hidden lg:inline">{user.christianName} {user.displayName}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl p-2 space-y-1 z-50">
                      <div className="px-3 py-2 border-b border-[var(--border-card)] text-[11px] space-y-0.5">
                        <div className="font-bold text-[var(--text-main)]">{user.christianName} {user.displayName}</div>
                        <div className="text-amber-500">{user.parish || 'Giáo xứ'}</div>
                      </div>

                      <Link href="/ho-so" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-amber-500/10 hover:text-amber-500">
                        <User className="w-4 h-4" /> Hồ Sơ Cá Nhân
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
              className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] hover:text-amber-500 hover:border-amber-500/40 transition-all shadow-sm"
              title={isDarkMode ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>

        </div>

        {/* TIER 2: HORIZONTAL NAVIGATION BAR WITH DROPDOWNS */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-11 flex items-center justify-center">
          <nav className="flex items-center gap-8 lg:gap-12 text-xs font-bold tracking-wide uppercase">
            
            {/* 1. KINH THÁNH (DROPDOWN) */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('kinh-thanh')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/kinh-thanh" 
                className={`flex items-center gap-1.5 py-1 text-[var(--text-main)] hover:text-amber-500 transition-colors ${
                  pathname.startsWith('/kinh-thanh') || pathname.startsWith('/ban-do') || pathname.startsWith('/lich-su') || pathname.startsWith('/nhan-vat') ? 'text-amber-500 font-black' : ''
                }`}
              >
                <span>Kinh Thánh</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500 transition-transform group-hover:rotate-180" />
              </Link>

              {openDropdown === 'kinh-thanh' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/kinh-thanh" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-amber-500">Sách</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Đọc trọn bộ 73 Sách Thánh</div>
                    </div>
                  </Link>

                  <Link href="/ban-do" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-emerald-500">Bản Đồ</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Khảo cổ 3D Thánh Địa</div>
                    </div>
                  </Link>

                  <Link href="/lich-su" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-purple-500">Dòng Thời Gian</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Lịch sử Cứu Độ 4000 năm</div>
                    </div>
                  </Link>

                  <Link href="/nhan-vat" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-indigo-500">Nhân Vật</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Tổ phụ, Ngôn sứ & Tông đồ</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. KHÓA HỌC */}
            <Link 
              href="/khoa-hoc" 
              className={`py-1 text-[var(--text-main)] hover:text-amber-500 transition-colors ${
                pathname.startsWith('/khoa-hoc') ? 'text-amber-500 font-black' : ''
              }`}
            >
              Khóa Học
            </Link>

            {/* 3. THƯ VIỆN (DROPDOWN) */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('thu-vien')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/thu-vien" 
                className={`flex items-center gap-1.5 py-1 text-[var(--text-main)] hover:text-amber-500 transition-colors ${
                  pathname.startsWith('/thu-vien') ? 'text-amber-500 font-black' : ''
                }`}
              >
                <span>Thư Viện</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500 transition-transform group-hover:rotate-180" />
              </Link>

              {openDropdown === 'thu-vien' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/thu-vien" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-amber-500">Bài Viết</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Suy niệm & thần học</div>
                    </div>
                  </Link>

                  <Link href="/thu-vien/sach" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Library className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-indigo-500">Tủ Sách</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Sách điện tử PDF, EPUB</div>
                    </div>
                  </Link>

                  <Link href="/thu-vien/tai-lieu" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 group transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-rose-500">Tài Liệu</div>
                      <div className="text-[10px] text-[var(--text-muted)] lowercase">Giáo án & văn kiện PDF/Word</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. GIÁO LÝ */}
            <Link 
              href="/giao-ly" 
              className={`py-1 text-[var(--text-main)] hover:text-amber-500 transition-colors ${
                pathname.startsWith('/giao-ly') ? 'text-amber-500 font-black' : ''
              }`}
            >
              Giáo Lý
            </Link>

            {/* 5. SÁCH TRANH THIẾU NHI */}
            <Link 
              href="/sach-tranh" 
              className={`py-1 flex items-center gap-1 text-[var(--text-main)] hover:text-amber-500 transition-colors ${
                pathname.startsWith('/sach-tranh') ? 'text-amber-500 font-black' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sách Tranh</span>
            </Link>

            {/* 6. ĐẤU TRƯỜNG */}
            <Link 
              href="/quiz" 
              className={`py-1 text-[var(--text-main)] hover:text-amber-500 transition-colors ${
                pathname.startsWith('/quiz') ? 'text-amber-500 font-black' : ''
              }`}
            >
              Đấu Trường
            </Link>


          </nav>
        </div>

      </div>

      {/* ========================================================
          MOBILE 1-ROW HEADER (Visible on Mobile < 768px)
      ======================================================== */}
      <div className="md:hidden w-full h-16 px-4 flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Mở menu"
          className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] hover:text-amber-500 shadow-sm"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
          <button 
            onClick={toggleTheme}
            aria-label="Đổi giao diện Sáng / Tối"
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] shadow-sm"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {user ? (
            <Link href="/ho-so" className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center font-serif text-xs font-black overflow-hidden shadow-sm">
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
          MOBILE MENU ACCORDION DRAWER
      ======================================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-card)] bg-[var(--bg-card)] p-5 space-y-4 shadow-2xl backdrop-blur-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300">
          
          {/* 1. KINH THÁNH GROUP */}
          <div className="space-y-1">
            <button 
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'kinh-thanh' ? null : 'kinh-thanh')}
              className="w-full py-2.5 flex items-center justify-between text-sm font-bold text-[var(--text-main)]"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-500" /> Kinh Thánh
              </span>
              <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${mobileExpandedGroup === 'kinh-thanh' ? 'rotate-180' : ''}`} />
            </button>

            {mobileExpandedGroup === 'kinh-thanh' && (
              <div className="pl-6 space-y-2 py-2 border-l-2 border-amber-500/30 ml-2">
                <Link href="/kinh-thanh" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-amber-500">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Sách (73 Sách Thánh)
                </Link>
                <Link href="/ban-do" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-emerald-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Bản Đồ 3D Thánh Địa
                </Link>
                <Link href="/lich-su" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-purple-500">
                  <Clock className="w-3.5 h-3.5 text-purple-500" /> Dòng Thời Gian Cứu Độ
                </Link>
                <Link href="/nhan-vat" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-indigo-500">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> Nhân Vật Kinh Thánh
                </Link>
              </div>
            )}
          </div>

          {/* 2. KHÓA HỌC */}
          <Link href="/khoa-hoc" className="block py-2.5 text-sm font-bold text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-500" /> Khóa Học
          </Link>

          {/* 3. THƯ VIỆN GROUP */}
          <div className="space-y-1">
            <button 
              onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'thu-vien' ? null : 'thu-vien')}
              className="w-full py-2.5 flex items-center justify-between text-sm font-bold text-[var(--text-main)]"
            >
              <span className="flex items-center gap-2.5">
                <Library className="w-4 h-4 text-indigo-500" /> Thư Viện
              </span>
              <ChevronDown className={`w-4 h-4 text-indigo-500 transition-transform ${mobileExpandedGroup === 'thu-vien' ? 'rotate-180' : ''}`} />
            </button>

            {mobileExpandedGroup === 'thu-vien' && (
              <div className="pl-6 space-y-2 py-2 border-l-2 border-indigo-500/30 ml-2">
                <Link href="/thu-vien" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-amber-500">
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Bài Viết &amp; Suy Niệm
                </Link>
                <Link href="/thu-vien/sach" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-indigo-500">
                  <Library className="w-3.5 h-3.5 text-indigo-500" /> Tủ Sách Điện Tử (PDF/EPUB)
                </Link>
                <Link href="/thu-vien/tai-lieu" className="flex items-center gap-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-rose-500">
                  <BookOpen className="w-3.5 h-3.5 text-rose-500" /> Tài Liệu &amp; Giáo Án
                </Link>
              </div>
            )}
          </div>

          {/* 4. GIÁO LÝ */}
          <Link href="/giao-ly" className="block py-2.5 text-sm font-bold text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2.5">
            <Cross className="w-4 h-4 text-rose-500" /> Giáo Lý
          </Link>

          {/* 5. SÁCH TRANH THIẾU NHI */}
          <Link href="/sach-tranh" className="block py-2.5 text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-500 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Sách Tranh Thiếu Nhi
          </Link>

          {/* 6. ĐẤU TRƯỜNG */}
          <Link href="/quiz" className="block py-2.5 text-sm font-bold text-[var(--text-main)] hover:text-amber-500 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-500" /> Đấu Trường
          </Link>


          {/* User Section in Drawer */}
          <div className="pt-4 border-t border-[var(--border-card)] space-y-2">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-500 flex items-center gap-2">
                  <Flame className="w-4 h-4 fill-amber-500" /> Chuỗi học tập: {user.streak || 1} Ngày
                </div>
                <Link href="/ho-so" className="block py-2 text-xs font-bold text-[var(--text-main)]">Hồ Sơ Cá Nhân ({user.christianName} {user.displayName})</Link>
                <button onClick={logout} className="w-full text-left py-2 text-xs font-bold text-red-500">Đăng Xuất</button>
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
