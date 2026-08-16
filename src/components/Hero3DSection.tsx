'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, BookOpen, MapPin, Clock, Gamepad2, 
  PlayCircle, ChevronRight, Flame, ShieldCheck, ArrowRight
} from 'lucide-react';

interface ThemeConfig {
  id: string;
  name: string;
  badge: string;
  innerColor: string;
  midColor: string;
  outerColor: string;
  glowColor: string;
  accentText: string;
  modelOrbit: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  cardImage: string;
}

const THEMES: Record<string, ThemeConfig> = {
  gold: {
    id: 'gold',
    name: 'Kinh Thánh 73 Sách',
    badge: 'MÔ HÌNH KINHTHÁNH 3D · BẢN DỊCH PHỤNG VỤ',
    innerColor: '#78350f',
    midColor: '#451a03',
    outerColor: '#020617',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    accentText: 'from-amber-400 via-amber-300 to-yellow-500',
    modelOrbit: '0deg 75deg 380%',
    description: 'Khám phá 73 Sách Cựu Ước & Tân Ước với bản dịch chuẩn Phụng vụ KTCG, có chú giải thần học và đối chiếu đa ngôn ngữ.',
    ctaText: 'Đọc Kinh Thánh 73 Sách',
    ctaLink: '/kinh-thanh',
    cardImage: '📖'
  },
  emerald: {
    id: 'emerald',
    name: 'Bản Đồ 3D Vùng Đất Thánh',
    badge: 'KHÁM PHÁ ĐỊA LÝ & KHẢO CỔ KINHTHÁNH 3D',
    innerColor: '#064e3b',
    midColor: '#022c22',
    outerColor: '#020617',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    accentText: 'from-emerald-400 via-teal-300 to-emerald-500',
    modelOrbit: '45deg 65deg 380%',
    description: 'Hành trình khảo cổ 3D tương tác tại Giêrusalem, Đồi Sọ Golgotha, Sa mạc Qumran và Hồ Ga-li-lê trong bối cảnh Kinh Thánh.',
    ctaText: 'Khám Phá Bản Đồ 3D',
    ctaLink: '/ban-do',
    cardImage: '🗺️'
  },
  purple: {
    id: 'purple',
    name: 'Dòng Thời Gian Cứu Độ',
    badge: '4000 NĂM LỊCH SỬ CỨU ĐỘ · THEOLOGICAL TIMELINE',
    innerColor: '#4c1d95',
    midColor: '#2e1065',
    outerColor: '#020617',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    accentText: 'from-purple-400 via-indigo-300 to-purple-500',
    modelOrbit: '-45deg 80deg 380%',
    description: 'Dõi theo tiến trình Giao ước từ thời Khởi Nguyên Sáng Tạo, Giao ước Môsê đến Sự Xô Đổ Cái Chết của Đức Giêsu Kitô.',
    ctaText: 'Xem Dòng Thời Gian',
    ctaLink: '/lich-su',
    cardImage: '⏳'
  },
  crimson: {
    id: 'crimson',
    name: 'Đấu Trường Quiz 6 Số',
    badge: 'REAL-TIME QUIZ ARENA · LUYỆN THI GIÁO LÝ',
    innerColor: '#881337',
    midColor: '#450a0a',
    outerColor: '#020617',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    accentText: 'from-rose-400 via-red-300 to-rose-500',
    modelOrbit: '90deg 90deg 380%',
    description: 'Tham gia phòng thi Quiz Giáo lý 6 số trực tiếp cùng giáo xứ, thi đấu xếp hạng và tích lũy điểm thưởng linh đạo.',
    ctaText: 'Tham Gia Quiz Arena',
    ctaLink: '/quiz',
    cardImage: '🏆'
  }
};

export default function Hero3DSection() {
  const [activeTheme, setActiveTheme] = useState<string>('gold');
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const modelRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // 2. Mouse Parallax Tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setMousePos({ x, y });

      if (modelRef.current) {
        try {
          const orbitDegX = (x * 1.2).toFixed(1);
          const orbitDegY = (90 + y).toFixed(1);
          modelRef.current.cameraOrbit = `${orbitDegX}deg ${orbitDegY}deg 380%`;
        } catch (err) {}
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[85vh] sm:min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 py-16 overflow-hidden transition-all duration-1000"
      style={{
        background: `radial-gradient(circle at center, ${currentConfig.innerColor} 0%, ${currentConfig.midColor} 55%, ${currentConfig.outerColor} 100%)`
      }}
    >
      {/* 🌟 Glowing Radial Light Effects */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 z-0"
        style={{ backgroundColor: currentConfig.glowColor }}
      />

      {/* Floating Sacred Particles / Sparkles Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Main Content Layout Container */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN: Main Sacred Heading & CTA */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-2xl">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{currentConfig.badge}</span>
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-tight">
            <span className="text-slate-100">Học Kinh Thánh</span> <br className="hidden sm:inline" />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentConfig.accentText}`}>
              Trực Quan 3D
            </span>
          </h1>

          <p className="text-slate-100 text-sm sm:text-lg font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-md">
            {currentConfig.description}
          </p>

          <p className="font-serif text-xs tracking-widest text-amber-300 font-bold uppercase drop-shadow">
            VIA &nbsp;·&nbsp; VITA &nbsp;·&nbsp; VERITAS
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link 
              href={currentConfig.ctaLink}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 transition-all shadow-2xl shadow-amber-500/30 hover:scale-105"
            >
              <PlayCircle className="w-5 h-5 fill-current" /> {currentConfig.ctaText}
            </Link>

            <Link
              href="/khoa-hoc"
              className="px-7 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/30 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Xem Tất Cả Khóa Học</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CENTER COLUMN: 3D MODEL CANVAS VIEWPORT */}
        <div className="lg:col-span-4 flex items-center justify-center relative min-h-[350px] sm:min-h-[480px]">
          
          {/* Glassmorphic Aura Ring Behind 3D Model */}
          <div 
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl transition-transform duration-300 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px) rotate(${mousePos.x}deg)`
            }}
          />

          {isScriptLoaded ? (
            /* @ts-ignore - Google <model-viewer> Custom Element */
            <model-viewer
              ref={modelRef}
              src="/models/bible_3d_model.glb"
              alt="Mô hình Kinh Thánh 3D VERIDU"
              camera-controls
              auto-rotate
              rotation-per-second="12deg"
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
            /* Fallback 3D Sacred Scriptures Glass Card for Legacy Browsers */
            <div className="w-72 h-96 rounded-3xl bg-white/10 border border-white/30 backdrop-blur-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl animate-pulse">
              <div className="w-24 h-24 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-5xl flex items-center justify-center">
                📖
              </div>
              <h3 className="font-serif font-black text-xl text-white">Kinh Thánh 73 Sách 3D</h3>
              <p className="text-xs text-slate-300">Đang nạp bộ dựng đồ họa 3D WebGL...</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 4-THEME INTERACTIVE WIDGET CARDS */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 text-center lg:text-right block">
            Chọn Chủ Đề Học Tập 3D:
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
                      ? 'bg-white/20 border-amber-400 text-white shadow-2xl scale-105 font-bold backdrop-blur-xl ring-2 ring-amber-400/50' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/30 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform ${isActive ? 'scale-110 bg-amber-500 text-slate-950 shadow-lg' : 'bg-white/10 group-hover:scale-105'}`}>
                      {theme.cardImage}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-xs font-bold block truncate text-white">{theme.name}</span>
                      <span className="text-[10px] text-slate-300 block truncate">
                        {isActive ? 'Bấm để mở trang →' : 'Xem góc 3D'}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-ping shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* BOTTOM FEATURE QUICK LINKS */}
      <div className="absolute bottom-4 left-0 w-full px-4 text-center z-10 hidden md:block">
        <div className="inline-flex items-center gap-6 px-6 py-2 rounded-full bg-black/40 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
          <Link href="/kinh-thanh" className="hover:text-amber-400 transition">📖 73 Sách Kinh Thánh</Link>
          <span>•</span>
          <Link href="/ban-do" className="hover:text-emerald-400 transition">🗺️ Bản Đồ 3D Khảo Cổ</Link>
          <span>•</span>
          <Link href="/lich-su" className="hover:text-purple-400 transition">⏳ Lịch Sử Cứu Độ</Link>
          <span>•</span>
          <Link href="/quiz" className="hover:text-rose-400 transition">🏆 Quiz Giáo Lý 6 Số</Link>
        </div>
      </div>
    </section>
  );
}
