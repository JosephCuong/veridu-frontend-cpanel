'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, Compass, Clock, Award, ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface ThemeConfig {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  subname: string;
  latinMonogram: string;
  quote: string;
  glowColor: string;
  accentText: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  iconType: 'book' | 'compass' | 'clock' | 'award';
}

export default function Hero3DSection() {
  const { t, isEn } = useTranslation();
  const [activeTheme, setActiveTheme] = useState<string>('gold');
  const [isDark, setIsDark] = useState<boolean>(false);
  const archRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Synchronize Dark / Light mode state with DOM
  useEffect(() => {
    const updateThemeState = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    updateThemeState();
    window.addEventListener('veridu_theme_changed', updateThemeState);
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('veridu_theme_changed', updateThemeState);
      observer.disconnect();
    };
  }, []);

  // 4 Core Liturgical Themes
  const themes: Record<string, ThemeConfig> = useMemo(() => ({
    gold: {
      id: 'gold',
      name: t('home.theme_bible_name', 'Kinh Thánh 73 Sách'),
      shortName: isEn ? 'Scripture' : 'Kinh Thánh',
      subname: t('home.theme_bible_sub', 'Bản dịch Cố LM. Nguyễn Thế Thuấn'),
      badge: t('home.theme_bible_badge', 'Cựu Ước & Tân Ước · 73 Sách'),
      latinMonogram: 'SACRA SCRIPTURA',
      quote: t('home.theme_bible_quote', '“Lời Chúa là ngọn đèn soi cho con bước” — Tv 119,105'),
      glowColor: 'rgba(245, 158, 11, 0.28)',
      accentText: 'from-amber-700 via-amber-600 to-yellow-600 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-500',
      description: t('home.theme_bible_desc', 'Nghiên cứu và suy niệm trọn bộ 73 Sách Cựu Ước & Tân Ước với bản dịch chuẩn xác, hệ thống chú giải thần học và đối chiếu câu chữ.'),
      ctaText: t('home.theme_bible_cta', 'Đọc Kinh Thánh'),
      ctaLink: '/kinh-thanh',
      iconType: 'book'
    },
    emerald: {
      id: 'emerald',
      name: t('home.theme_map_name', 'Thánh Địa Khảo Cổ'),
      shortName: isEn ? '3D Map' : 'Khảo Cổ',
      subname: t('home.theme_map_sub', 'Giêrusalem, Galilê & Đất Hứa'),
      badge: t('home.theme_map_badge', 'Khảo Cứu Địa Lý Thánh Địa 3D'),
      latinMonogram: 'TERRA SANCTA',
      quote: t('home.theme_map_quote', '“Đất tràn trề sữa và mật ong” — Xh 3,8'),
      glowColor: 'rgba(16, 185, 129, 0.28)',
      accentText: 'from-emerald-700 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500',
      description: t('home.theme_map_desc', 'Khám phá các địa danh và di tích khảo cổ Thánh Kinh qua không gian 3D tương tác tại Giêrusalem, Đồi Sọ Golgotha và Biển Hồ Galilê.'),
      ctaText: t('home.theme_map_cta', 'Khám Phá Bản Đồ'),
      ctaLink: '/ban-do',
      iconType: 'compass'
    },
    purple: {
      id: 'purple',
      name: t('home.theme_timeline_name', 'Lịch Sử Cứu Độ'),
      shortName: isEn ? 'Timeline' : 'Lịch Sử',
      subname: t('home.theme_timeline_sub', 'Từ Khởi Nguyên đến Phục Sinh'),
      badge: t('home.theme_timeline_badge', 'Tiến Trình 4000 Năm Cứu Độ'),
      latinMonogram: 'HISTORIA SALUTIS',
      quote: t('home.theme_timeline_quote', '“Từ nguyên thủy đã có Ngôi Lời” — Ga 1,1'),
      glowColor: 'rgba(168, 85, 247, 0.28)',
      accentText: 'from-purple-700 via-indigo-600 to-purple-600 dark:from-purple-400 dark:via-indigo-300 dark:to-purple-500',
      description: t('home.theme_timeline_desc', 'Hành trình 4000 năm Lịch sử Cứu độ: từ Giao ước thời các Tổ phụ, thời Ngôn sứ đến mầu nhiệm Nhập Thể và Phục Sinh cứu độ muôn dân.'),
      ctaText: t('home.theme_timeline_cta', 'Xem Dòng Thời Gian'),
      ctaLink: '/lich-su',
      iconType: 'clock'
    },
    crimson: {
      id: 'crimson',
      name: t('home.theme_quiz_name', 'Đấu Trường Giáo Lý'),
      shortName: isEn ? 'Arena' : 'Đấu Trường',
      subname: t('home.theme_quiz_sub', 'Học hỏi Giáo lý & Đố vui Đức Tin'),
      badge: t('home.theme_quiz_badge', 'Đấu Trường Giáo Lý & Đức Tin'),
      latinMonogram: 'FIDES ET RATIO',
      quote: t('home.theme_quiz_quote', '“Hãy chiến đấu trong cuộc thi đấu cao đẹp” — 1Tm 6,12'),
      glowColor: 'rgba(244, 63, 94, 0.28)',
      accentText: 'from-rose-700 via-red-600 to-rose-600 dark:from-rose-400 dark:via-red-300 dark:to-rose-500',
      description: t('home.theme_quiz_desc', 'Không gian thi đua kiến thức Giáo lý Hội Thánh và Kinh Thánh với phòng thi trực tiếp cùng cộng đoàn, tích lũy điểm thưởng và vinh danh.'),
      ctaText: t('home.theme_quiz_cta', 'Vào Đấu Trường'),
      ctaLink: '/quiz',
      iconType: 'award'
    }
  }), [t, isEn]);

  const currentConfig = themes[activeTheme] || themes.gold;

  // Gentle 3D Mouse Parallax Tilt for Gothic Stained Glass Window
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 16;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 12;

      if (!isMoving) {
        isMoving = true;
        rafRef.current = requestAnimationFrame(() => {
          if (archRef.current) {
            const rotX = (-mouseY * 0.45).toFixed(2);
            const rotY = (mouseX * 0.45).toFixed(2);
            archRef.current.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
          }
          isMoving = false;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const renderIcon = (type: string, className: string) => {
    switch (type) {
      case 'book': return <BookOpen className={className} />;
      case 'compass': return <Compass className={className} />;
      case 'clock': return <Clock className={className} />;
      case 'award': return <Award className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[85vh] sm:min-h-[90vh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 overflow-hidden transition-colors duration-700 bg-[#FAF7F2] dark:bg-[#0B0D12]"
    >
      {/* ────────────────────────────────────────────────────────
          🌟 LUX DIVINA — HEAVENLY CONICAL SUNBEAM & AMBIENT LIGHT
      ──────────────────────────────────────────────────────── */}
      {/* Top Conical Rosette Window Beam */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1100px] h-[500px] sm:h-[650px] pointer-events-none z-0 opacity-80 dark:opacity-60 transition-opacity duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(251, 191, 36, 0.22) 0%, rgba(180, 83, 9, 0.08) 50%, transparent 80%)'
            : 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(217, 119, 6, 0.16) 0%, rgba(197, 160, 89, 0.08) 50%, transparent 80%)'
        }}
      />

      {/* Volumetric Cathedral Light Rays (Subtle Angles) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-25 dark:opacity-20"
        style={{
          backgroundImage: 'linear-gradient(115deg, transparent 40%, rgba(251, 191, 36, 0.15) 50%, transparent 60%), linear-gradient(65deg, transparent 35%, rgba(245, 158, 11, 0.12) 48%, transparent 58%)'
        }}
      />

      {/* Subtle Cathedral Vault Arch Silhouette Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] dark:opacity-[0.06] flex items-center justify-center">
        <div className="w-[1200px] h-[800px] rounded-t-[600px] border-[2px] border-amber-900 dark:border-amber-400" />
      </div>

      {/* ────────────────────────────────────────────────────────
          2-COLUMN SACRED EDITORIAL HERO (55% Left - 45% Right)
      ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        
        {/* LEFT COLUMN: Main Sacred Heading, Subtitle, CTAs & Faith Proof Points */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
          
          {/* Liturgical Theme Badge with Latin Cross */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/30 dark:border-amber-400/30 text-amber-800 dark:text-amber-300 text-xs font-cinzel font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
            <span className="text-amber-600 dark:text-amber-400 text-sm">✝</span>
            <span>{currentConfig.badge}</span>
          </div>

          {/* Grand Classical Scripture Headline */}
          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.14]">
            <span className="text-stone-900 dark:text-stone-100 font-serif">
              {t('home.hero_title_1', 'Học Kinh Thánh')}
            </span> <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentConfig.accentText} font-serif`}>
              {t('home.hero_title_2', '& Sống Đức Tin')}
            </span>
          </h1>

          {/* Theological Description & Scriptural Motto */}
          <p className="text-stone-700 dark:text-slate-300 text-base sm:text-lg font-serif italic leading-relaxed max-w-xl mx-auto lg:mx-0">
            {currentConfig.description}
          </p>

          {/* Scriptural Golden Callout */}
          <div className="py-1 px-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border-l-2 border-amber-600 dark:border-amber-400 text-xs font-serif text-amber-900 dark:text-amber-200 max-w-xl mx-auto lg:mx-0">
            {currentConfig.quote}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link 
              href={currentConfig.ctaLink}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white dark:text-slate-950 font-serif font-bold text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-xl shadow-amber-600/20 hover:scale-105"
            >
              {renderIcon(currentConfig.iconType, 'w-4 h-4')}
              <span>{currentConfig.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/khoa-hoc"
              className="px-7 py-3.5 rounded-2xl bg-stone-200/80 dark:bg-white/10 hover:bg-stone-300/80 dark:hover:bg-white/20 text-stone-800 dark:text-white font-serif font-bold text-sm tracking-wider uppercase border border-stone-300 dark:border-white/20 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>{t('home.view_courses_btn', 'Xem Các Khóa Học')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAITH & SCHOLARLY STATS BAR (Proof Points) */}
          <div className="pt-6 border-t border-stone-300/80 dark:border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-cinzel font-black text-amber-700 dark:text-amber-400">73 Sách</div>
              <div className="text-[11px] text-stone-600 dark:text-slate-400 font-sans uppercase tracking-wider">Cựu &amp; Tân Ước</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-cinzel font-black text-amber-700 dark:text-amber-400">4000 Năm</div>
              <div className="text-[11px] text-stone-600 dark:text-slate-400 font-sans uppercase tracking-wider">Lịch Sử Cứu Độ</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-cinzel font-black text-amber-700 dark:text-amber-400">Tọa Độ 3D</div>
              <div className="text-[11px] text-stone-600 dark:text-slate-400 font-sans uppercase tracking-wider">Khảo Cổ Thánh Địa</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-cinzel font-black text-amber-700 dark:text-amber-400">Học Giả</div>
              <div className="text-[11px] text-stone-600 dark:text-slate-400 font-sans uppercase tracking-wider">Ban Học Vụ VERIDU</div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: GOTHIC STAINED-GLASS WINDOW ART (CHRIST RISEN) + THEME DOCK */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          
          {/* Radiant Halo Behind the Gothic Window */}
          <div 
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 opacity-60 dark:opacity-40"
            style={{ backgroundColor: currentConfig.glowColor }}
          />

          {/* ⛪ GOTHIC STAINED-GLASS ARCH WINDOW (Authentic Pointed Arch Frame) */}
          <div
            ref={archRef}
            className="relative w-72 sm:w-80 md:w-88 h-[470px] sm:h-[500px] rounded-t-[170px] sm:rounded-t-[190px] rounded-b-3xl p-3.5 bg-gradient-to-b from-[#C5A059] via-[#E8D4A2] to-[#8C6D2D] dark:from-[#D4AF37] dark:via-[#9A7B2C] dark:to-[#382B0A] shadow-[0_20px_50px_rgba(197,160,89,0.35)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col items-center justify-between text-center transition-all duration-300 overflow-hidden group select-none will-change-transform"
            style={{ transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)' }}
          >
            {/* Inner Gothic Window Arch Container */}
            <div className="relative w-full h-full rounded-t-[155px] sm:rounded-t-[175px] rounded-b-2xl overflow-hidden bg-slate-950 flex flex-col justify-between">
              
              {/* Sacred Stained Glass Image: Christ Risen in Cathedral Window */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/stained_glass_christ.jpg"
                  alt="Đức Kitô Phục Sinh — Cửa Sổ Kính Màu Nhà Thờ Chính Tòa"
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 320px, 380px"
                />
                
                {/* Subtle Inner Glass Vignette & Tint */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75 pointer-events-none" />
                
                {/* Moving Divine Light Sweep */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              </div>

              {/* Upper Arch Rosette Header: Latin Inscription */}
              <div className="relative z-10 pt-5 sm:pt-6 px-4">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-950/70 border border-amber-400/40 backdrop-blur-md">
                  <span className="font-cinzel text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-amber-300 uppercase drop-shadow-md">
                    ✦ LUX CHRISTI ✦
                  </span>
                </div>
              </div>

              {/* Middle Area: Sacred Monogram Symbols */}
              <div className="relative z-10 flex justify-between w-full px-5 text-amber-300/80 font-cinzel font-black text-sm drop-shadow-md select-none">
                <span>Α</span>
                <span>Ω</span>
              </div>

              {/* Lower Glass Overlay Card: Active Theme Focus & Quick CTA */}
              <div className="relative z-10 m-2 p-3 sm:p-3.5 rounded-2xl bg-slate-950/85 border border-amber-400/40 backdrop-blur-xl space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-[10px] font-bold tracking-widest uppercase text-amber-400">
                    {currentConfig.latinMonogram}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {activeTheme.toUpperCase()}
                  </span>
                </div>

                <div className="font-serif font-black text-sm sm:text-base text-white truncate">
                  {currentConfig.name}
                </div>

                <Link
                  href={currentConfig.ctaLink}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <span>{t('home.card_open_study', 'Mở Khảo Cứu')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

          {/* INTEGRATED LITURGICAL THEME SELECTOR DOCK (4 Phím Chủ Đề Phụng Vụ) */}
          <div className="w-full max-w-sm sm:max-w-md mt-4 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-stone-300 dark:border-amber-400/30 backdrop-blur-xl shadow-lg flex items-center justify-between gap-1 select-none">
            {Object.values(themes).map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveTheme(theme.id)}
                  className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md font-black'
                      : 'text-stone-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10'
                  }`}
                  title={theme.name}
                >
                  {renderIcon(theme.iconType, 'w-3.5 h-3.5 shrink-0')}
                  <span className="truncate hidden sm:inline">{theme.shortName}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </section>
  );
}
