'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Compass, Clock, Award, PlayCircle, ArrowRight, MapPin
} from 'lucide-react';

interface ThemeConfig {
  id: string;
  name: string;
  badge: string;
  subname: string;
  innerColor: string;
  midColor: string;
  outerColor: string;
  glowColor: string;
  accentText: string;
  modelOrbit: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  iconType: 'book' | 'compass' | 'clock' | 'award';
}

const THEMES: Record<string, ThemeConfig> = {
  gold: {
    id: 'gold',
    name: 'Kinh Thánh 73 Sách',
    subname: 'Bản dịch Cố LM. Nguyễn Thế Thuấn',
    badge: 'Kinh Thánh Trọn Bộ 73 Sách',
    innerColor: '#78350f',
    midColor: '#451a03',
    outerColor: '#020617',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    accentText: 'from-amber-400 via-amber-300 to-yellow-500',
    modelOrbit: '0deg 75deg 380%',
    description: 'Nghiên cứu và suy niệm trọn bộ 73 Sách Cựu Ước & Tân Ước với bản dịch chuẩn xác, hệ thống chú giải thần học và đối chiếu câu chữ.',
    ctaText: 'Đọc Kinh Thánh',
    ctaLink: '/kinh-thanh',
    iconType: 'book'
  },
  emerald: {
    id: 'emerald',
    name: 'Thánh Địa Khảo Cổ',
    subname: 'Giêrusalem, Galilê & Đất Hứa',
    badge: 'Khảo Cứu Địa Lý Thánh Địa',
    innerColor: '#064e3b',
    midColor: '#022c22',
    outerColor: '#020617',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    accentText: 'from-emerald-400 via-teal-300 to-emerald-500',
    modelOrbit: '45deg 65deg 380%',
    description: 'Khám phá các địa danh và di tích khảo cổ Thánh Kinh qua không gian 3D tương tác tại Giêrusalem, Đồi Sọ Golgotha và Biển Hồ Galilê.',
    ctaText: 'Khám Phá Bản Đồ',
    ctaLink: '/ban-do',
    iconType: 'compass'
  },
  purple: {
    id: 'purple',
    name: 'Lịch Sử Cứu Độ',
    subname: 'Từ Khởi Nguyên đến Phục Sinh',
    badge: 'Tiến Trình Lịch Sử Cứu Độ',
    innerColor: '#4c1d95',
    midColor: '#2e1065',
    outerColor: '#020617',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    accentText: 'from-purple-400 via-indigo-300 to-purple-500',
    modelOrbit: '-45deg 80deg 380%',
    description: 'Hành trình 4000 năm Lịch sử Cứu độ: từ Giao ước thời các Tổ phụ, thời Ngôn sứ đến mầu nhiệm Nhập Thể và Phục Sinh cứu độ muôn dân.',
    ctaText: 'Xem Dòng Thời Gian',
    ctaLink: '/lich-su',
    iconType: 'clock'
  },
  crimson: {
    id: 'crimson',
    name: 'Đấu Trường Giáo Lý',
    subname: 'Học hỏi Giáo lý & Đố vui Đức Tin',
    badge: 'Đấu Trường Giáo Lý & Kinh Thánh',
    innerColor: '#881337',
    midColor: '#450a0a',
    outerColor: '#020617',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    accentText: 'from-rose-400 via-red-300 to-rose-500',
    modelOrbit: '90deg 90deg 380%',
    description: 'Không gian thi đua kiến thức Giáo lý Hội Thánh và Kinh Thánh với phòng thi trực tiếp cùng cộng đoàn, tích lũy điểm thưởng và vinh danh.',
    ctaText: 'Vào Đấu Trường',
    ctaLink: '/quiz',
    iconType: 'award'
  }
};

export default function Hero3DSection() {
  const [activeTheme, setActiveTheme] = useState<string>('gold');
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const modelRef = useRef<any>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const currentConfig = THEMES[activeTheme] || THEMES.gold;

  // 1. Dynamic script loader for Google <model-viewer>
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).customElements && (window as any).customElements.get('model-viewer')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 2. High-Performance Mouse Parallax (0 React re-renders via RAF & Direct DOM ref)
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 24;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 12;

      if (!isMoving) {
        isMoving = true;
        rafRef.current = requestAnimationFrame(() => {
          if (auraRef.current) {
            auraRef.current.style.transform = `translate3d(${mouseX * -0.5}px, ${mouseY * -0.5}px, 0) rotate(${mouseX}deg)`;
          }

          if (modelRef.current) {
            try {
              const orbitDegX = (mouseX * 1.1).toFixed(1);
              const orbitDegY = (90 + mouseY).toFixed(1);
              modelRef.current.cameraOrbit = `${orbitDegX}deg ${orbitDegY}deg 380%`;
            } catch (err) {}
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
      className="relative min-h-[90vh] sm:min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 pt-36 sm:pt-40 lg:pt-44 pb-16 sm:pb-20 overflow-hidden transition-colors duration-700 will-change-[background]"
      style={{
        background: `radial-gradient(circle at center, ${currentConfig.innerColor} 0%, ${currentConfig.midColor} 55%, ${currentConfig.outerColor} 100%)`
      }}
    >
      {/* 🌟 Radiant Holy Candlelight Background Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 z-0 will-change-transform"
        style={{ backgroundColor: currentConfig.glowColor, transform: 'translate3d(-50%, -50%, 0)' }}
      />

      {/* Floating Sacred Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Main Layout Container */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN: Main Sacred Heading & CTA */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-200 text-xs font-serif font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
            {renderIcon(currentConfig.iconType, 'w-3.5 h-3.5 text-amber-400')}
            <span>{currentConfig.badge}</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-tight">
            <span className="text-slate-100">Học Kinh Thánh</span> <br className="hidden sm:inline" />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentConfig.accentText}`}>
              &amp; Sống Đức Tin
            </span>
          </h1>

          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-sm font-sans">
            {currentConfig.description}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link 
              href={currentConfig.ctaLink}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-sm flex items-center gap-2 transition-all shadow-2xl shadow-amber-500/30 hover:scale-105"
            >
              {renderIcon(currentConfig.iconType, 'w-4 h-4')}
              <span>{currentConfig.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/khoa-hoc"
              className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-serif font-bold text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Xem Các Khóa Học</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CENTER COLUMN: 3D MODEL CANVAS VIEWPORT */}
        <div className="lg:col-span-4 flex items-center justify-center relative min-h-[350px] sm:min-h-[480px]">
          
          {/* Glassmorphic Aura Ring Behind 3D Model with GPU Transform Ref */}
          <div 
            ref={auraRef}
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl pointer-events-none will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          />

          {isScriptLoaded ? (
            /* @ts-ignore - Google <model-viewer> Custom Element */
            <model-viewer
              ref={modelRef}
              src="/models/bible_3d_model.glb"
              alt="Mô hình Kinh Thánh 3D VERIDU"
              camera-controls
              auto-rotate
              rotation-per-second="10deg"
              disable-zoom
              shadow-intensity="1.5"
              environment-image="neutral"
              exposure="1.4"
              interaction-prompt="none"
              camera-orbit={currentConfig.modelOrbit}
              field-of-view="30deg"
              style={{
                width: '100%',
                height: '450px',
                outline: 'none',
                filter: `drop-shadow(0 25px 50px ${currentConfig.glowColor})`
              }}
            >
              {/* @ts-ignore */}
            </model-viewer>
          ) : (
            /* Fallback 3D Sacred Scriptures Glass Card with SVG */
            <div className="w-72 h-96 rounded-3xl bg-white/10 border border-white/30 backdrop-blur-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl animate-pulse">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="font-serif font-bold text-xl text-white">Kinh Thánh 73 Sách</h3>
              <p className="text-xs text-slate-300">Đang nạp không gian Thánh Kinh...</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 4-THEME SACRED CATHOLIC CARDS (100% SVG Icons) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-center">
          <span className="text-xs font-semibold tracking-wider text-amber-200/90 text-center lg:text-left block font-serif">
            Hành Trình Khám Phá:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {Object.values(THEMES).map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    if (isActive) {
                      window.location.href = theme.ctaLink;
                    } else {
                      setActiveTheme(theme.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isActive 
                      ? 'bg-white/20 border-amber-400/80 text-white shadow-2xl scale-[1.02] font-bold backdrop-blur-xl ring-1 ring-amber-400/30' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      isActive 
                        ? 'scale-105 bg-amber-500 text-slate-950 shadow-lg' 
                        : 'bg-white/10 text-amber-300 group-hover:scale-105'
                    }`}>
                      {renderIcon(theme.iconType, 'w-5 h-5')}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-xs font-serif font-bold block truncate text-white">{theme.name}</span>
                      <span className="text-[11px] text-slate-300/80 block truncate font-sans font-normal">
                        {theme.subname}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-amber-400 translate-x-0.5' : 'text-white/30 group-hover:text-white/70'}`} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
}
