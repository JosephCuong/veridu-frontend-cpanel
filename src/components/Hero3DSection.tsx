'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Compass, Clock, Award, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, MapPin
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface ThemeConfig {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  subname: string;
  innerColor: string;
  midColor: string;
  outerColor: string;
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
  const auraRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Dynamic Theme Definitions using Liturgical Theological Dictionary
  const themes: Record<string, ThemeConfig> = useMemo(() => ({
    gold: {
      id: 'gold',
      name: t('home.theme_bible_name', 'Kinh Thánh 73 Sách'),
      shortName: isEn ? 'Scripture' : 'Kinh Thánh',
      subname: t('home.theme_bible_sub', 'Bản dịch Cố LM. Nguyễn Thế Thuấn'),
      badge: t('home.theme_bible_badge', 'Kinh Thánh Trọn Bộ 73 Sách'),
      innerColor: '#78350f',
      midColor: '#451a03',
      outerColor: '#020617',
      glowColor: 'rgba(245, 158, 11, 0.28)',
      accentText: 'from-amber-400 via-amber-300 to-yellow-500',
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
      badge: t('home.theme_map_badge', 'Khảo Cứu Địa Lý Thánh Địa'),
      innerColor: '#064e3b',
      midColor: '#022c22',
      outerColor: '#020617',
      glowColor: 'rgba(16, 185, 129, 0.28)',
      accentText: 'from-emerald-400 via-teal-300 to-emerald-500',
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
      badge: t('home.theme_timeline_badge', 'Tiến Trình Lịch Sử Cứu Độ'),
      innerColor: '#4c1d95',
      midColor: '#2e1065',
      outerColor: '#020617',
      glowColor: 'rgba(168, 85, 247, 0.28)',
      accentText: 'from-purple-400 via-indigo-300 to-purple-500',
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
      badge: t('home.theme_quiz_badge', 'Đấu Trường Giáo Lý & Kinh Thánh'),
      innerColor: '#881337',
      midColor: '#450a0a',
      outerColor: '#020617',
      glowColor: 'rgba(244, 63, 94, 0.28)',
      accentText: 'from-rose-400 via-red-300 to-rose-500',
      description: t('home.theme_quiz_desc', 'Không gian thi đua kiến thức Giáo lý Hội Thánh và Kinh Thánh với phòng thi trực tiếp cùng cộng đoàn, tích lũy điểm thưởng và vinh danh.'),
      ctaText: t('home.theme_quiz_cta', 'Vào Đấu Trường'),
      ctaLink: '/quiz',
      iconType: 'award'
    }
  }), [t, isEn]);

  const currentConfig = themes[activeTheme] || themes.gold;

  // High-Performance 3D Mouse Parallax & Tilt (0 React re-renders via RAF & Direct DOM ref)
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 24;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 16;

      if (!isMoving) {
        isMoving = true;
        rafRef.current = requestAnimationFrame(() => {
          if (auraRef.current) {
            auraRef.current.style.transform = `translate3d(${mouseX * -0.6}px, ${mouseY * -0.6}px, 0) scale(${1 + Math.abs(mouseX) * 0.005})`;
          }

          if (cardRef.current) {
            const rotX = (-mouseY * 0.8).toFixed(2);
            const rotY = (mouseX * 0.8).toFixed(2);
            cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
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
      className="relative min-h-[85vh] sm:min-h-[92vh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-20 overflow-hidden transition-colors duration-700 will-change-[background]"
      style={{
        background: `radial-gradient(circle at center, ${currentConfig.innerColor} 0%, ${currentConfig.midColor} 55%, ${currentConfig.outerColor} 100%)`
      }}
    >
      {/* 🌟 Radiant Holy Candlelight Background Ambient Glow */}
      <div 
        ref={auraRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700 z-0 will-change-transform"
        style={{ backgroundColor: currentConfig.glowColor, transform: 'translate3d(-50%, -50%, 0)' }}
      />

      {/* Floating Sacred Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* ────────────────────────────────────────────────────────
          2-COLUMN BALANCED SACRED HERO (58% Left - 42% Right)
      ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        
        {/* LEFT COLUMN: Main Sacred Heading, Subtitle, CTAs & Faith Trust Stats */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
          
          {/* Liturgical Theme Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-200 text-xs font-serif font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
            {renderIcon(currentConfig.iconType, 'w-3.5 h-3.5 text-amber-400')}
            <span>{currentConfig.badge}</span>
          </div>

          {/* Grand Scripture Headline */}
          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.18]">
            <span className="text-slate-100">{t('home.hero_title_1', 'Học Kinh Thánh')}</span> <br className="hidden sm:inline" />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentConfig.accentText}`}>
              {t('home.hero_title_2', '& Sống Đức Tin')}
            </span>
          </h1>

          {/* Theological Description */}
          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-sm font-sans">
            {currentConfig.description}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
            <Link 
              href={currentConfig.ctaLink}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
            >
              {renderIcon(currentConfig.iconType, 'w-4 h-4')}
              <span>{currentConfig.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/khoa-hoc"
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-serif font-bold text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>{t('home.view_courses_btn', 'Xem Các Khóa Học')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAITH & SCHOLARLY STATS BAR (Proof Points) */}
          <div className="pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="space-y-0.5">
              <div className="text-base sm:text-lg font-serif font-black text-amber-400">73 Sách</div>
              <div className="text-[11px] text-slate-300 font-sans">Cựu &amp; Tân Ước</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base sm:text-lg font-serif font-black text-amber-400">4000 Năm</div>
              <div className="text-[11px] text-slate-300 font-sans">Lịch Sử Cứu Độ</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base sm:text-lg font-serif font-black text-amber-400">Tọa Độ 3D</div>
              <div className="text-[11px] text-slate-300 font-sans">Khảo Cổ Thánh Địa</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-base sm:text-lg font-serif font-black text-amber-400">Học Giả</div>
              <div className="text-[11px] text-slate-300 font-sans">Ban Học Vụ VERIDU</div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 3D STAINED-GLASS CARD + INTEGRATED THEME PILL DOCK */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          
          {/* Glassmorphic Aura Ring Behind Card */}
          <div 
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-amber-400/20 bg-amber-500/10 backdrop-blur-2xl shadow-[0_0_80px_rgba(245,158,11,0.25)] pointer-events-none will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          />

          {/* Stained-Glass 3D Sacred Scriptures Card (Mouse Tilt Parallax) */}
          <div
            ref={cardRef}
            className="relative w-72 sm:w-80 h-[430px] rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-black/40 border border-amber-400/40 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 flex flex-col items-center justify-between text-center transition-all duration-300 overflow-hidden group select-none will-change-transform"
            style={{ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)' }}
          >
            {/* Shimmer Light Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* Inner Sacred Border Trim */}
            <div className="absolute inset-2.5 rounded-2xl border border-amber-400/20 pointer-events-none" />

            {/* Card Header: Latin Sacred Monogram */}
            <div className="relative z-10 pt-1 space-y-1">
              <div className="text-[10px] tracking-[0.25em] font-serif font-black text-amber-300/90 uppercase drop-shadow-sm">
                {t('home.card_latin_header', '✦ VERIDU SACRA SCRIPTURA ✦')}
              </div>
              <div className="text-[11px] font-sans text-slate-300/80 tracking-wider">
                {currentConfig.badge}
              </div>
            </div>

            {/* Card Centerpiece: Golden Cross & Sacred Bible Iconography */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              {/* Radial Halo Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
              
              {/* Grand Icon Container */}
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400/25 via-amber-900/40 to-slate-950/80 border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20 group-hover:scale-105 transition-all duration-500">
                {/* Sacred Alpha & Omega Inscription */}
                <div className="absolute top-2 w-full px-3 flex justify-between text-[11px] font-serif font-black text-amber-300/70 select-none">
                  <span>Α</span>
                  <span>Ω</span>
                </div>

                {/* Holy Symbol */}
                <div className="text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                  {renderIcon(currentConfig.iconType, 'w-12 h-12 text-amber-300')}
                </div>

                {/* Sacred Monogram Bottom */}
                <div className="absolute bottom-1.5 text-[9px] font-serif font-black text-amber-400/70 tracking-widest">
                  IHS
                </div>
              </div>

              {/* Dynamic Theme Title & Subname */}
              <h3 className="mt-4 font-serif font-black text-lg text-white tracking-wide drop-shadow-md">
                {currentConfig.name}
              </h3>
              <p className="mt-0.5 text-xs text-amber-200/80 font-sans max-w-[220px] line-clamp-1">
                {currentConfig.subname}
              </p>
            </div>

            {/* Card Footer: Interactive Glowing Action Button */}
            <div className="relative z-10 w-full pb-1">
              <Link 
                href={currentConfig.ctaLink} 
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 cursor-pointer"
              >
                <span>{t('home.card_open_study', 'Mở Khảo Cứu')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* INTEGRATED GLASSMORPHIC THEME SELECTOR DOCK */}
          <div className="w-full max-w-sm mt-4 p-1 rounded-2xl bg-slate-950/75 border border-amber-400/30 backdrop-blur-xl shadow-xl flex items-center justify-between gap-1 select-none">
            {Object.values(themes).map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveTheme(theme.id)}
                  className={`flex-1 py-2 px-1 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
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
