'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Globe, 
  Compass, 
  UserCheck, 
  ScrollText, 
  Heart, 
  Cross, 
  Church, 
  Layers, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  PenTool, 
  Flame 
} from 'lucide-react';

import {
  RESEARCH_CATEGORIES,
  ResearchCategory
} from '@/lib/researchData';

// Helper to render icon by name
function CategoryIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  switch (name) {
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'UserCheck': return <UserCheck className={className} />;
    case 'ScrollText': return <ScrollText className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Cross': return <Cross className={className} />;
    case 'Church': return <Church className={className} />;
    default: return <BookOpen className={className} />;
  }
}

export default function ResearchLandingPage() {
  // ── State Management ──
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMethodologyTab, setActiveMethodologyTab] = useState<string>('kinh-thanh');
  
  // Hero Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Copy Feedback State
  const [copiedOutline, setCopiedOutline] = useState(false);

  // Section refs for smooth scrolling
  const methodologyRef = useRef<HTMLDivElement>(null);

  // ── Hero Carousel Auto-Play ──
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % RESEARCH_CATEGORIES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Current Active Methodology Category
  const activeMethodology = useMemo(() => {
    return RESEARCH_CATEGORIES.find((c) => c.id === activeMethodologyTab) || RESEARCH_CATEGORIES[0];
  }, [activeMethodologyTab]);

  // ── Copy Outline Handler ──
  const handleCopyOutline = () => {
    const m = activeMethodology;
    let text = `[DÀN Ý NGHIÊN CỨU CHUẨN - ${m.name.toUpperCase()}]\n` +
      `Phương pháp: ${m.methodology.frameworkName}\n` +
      `Mô tả: ${m.methodology.subtitle}\n\n` +
      `--- CÁC BƯỚC THỰC HIỆN ---\n`;
    
    m.methodology.steps.forEach((s) => {
      text += `Bước ${s.step}: ${s.name}\n- Mô tả: ${s.desc}\n- Câu hỏi then chốt: ${s.keyQuestions}\n\n`;
    });

    text += `--- DÀN Ý 4 PHẦN CHUẨN MỰC ---\n`;
    m.methodology.structureTemplate.forEach((st) => {
      text += `[${st.section}]: ${st.guidance}\n`;
    });

    text += `\n--- NGUỒN TƯ LIỆU BẮT BUỘC ---\n` + m.methodology.requiredSources.join('\n');
    text += `\n\nNguồn: Cổng Nghiên Cứu VERIDU (https://www.thapgia.com/noi-dung-can-thiet)`;

    navigator.clipboard.writeText(text);
    setCopiedOutline(true);
    setTimeout(() => setCopiedOutline(false), 2500);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Academic Dignity & Quick Stats)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden border-b border-[var(--border-card)]">
        {/* Subtle Stained-Glass Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-3xl rounded-full" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Catholic Academic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 backdrop-blur-md text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-serif font-semibold tracking-wide shadow-sm">
            <Cross className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>VIA • VITA • VERITAS — CỔNG THAM KHẢO &amp; KHƠI NGUỒN HỌC THUẬT</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Định Hướng Học Thuật &amp;{' '}
              <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Phương Pháp Luận
              </span>{' '}
              Nghiên Cứu
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[var(--text-muted)] font-serif max-w-3xl mx-auto leading-relaxed">
              Khám phá 8 trụ cột học thuật Công giáo chuẩn mực, tiếp cận quy trình nghiên cứu khoa học từ Chú giải Kinh Thánh 6 tầng đến Thần học Tín lý, Giáo phụ học và Linh đạo.
            </p>
          </div>

          {/* Quick Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-500">8</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Chuyên Ngành Học Thuật</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-500">4</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Bước Phương Pháp Luận</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-500">100%</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Chuẩn Huấn Quyền &amp; CCC</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-500">6</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Tầng Chú Giải Văn Bản</div>
            </div>
          </div>

          {/* Quick Jump Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-amber-500/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm hiểu chuyên ngành học thuật, quy trình nghiên cứu, nguồn trích dẫn..."
                className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-sm focus:outline-none focus:border-amber-500/80 shadow-md font-serif text-[var(--text-main)] placeholder-[var(--text-muted)] transition"
              />
              <button
                onClick={() => scrollToSection(methodologyRef)}
                className="absolute right-3 px-3.5 py-1.5 text-xs rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition font-serif font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Phương Pháp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURED HERO CAROUSEL (Chuyên Mục Nổi Bật)
      ───────────────────────────────────────────────────────────── */}
      <section 
        className="py-12 border-b border-[var(--border-card)] relative overflow-hidden bg-gradient-to-b from-transparent via-[var(--bg-card)]/30 to-transparent"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Controls Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
                Tiêu Điểm Chuyên Ngành
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-main)]">
                8 Trụ Cột Nghiên Cứu Chuyên Sâu
              </h2>
            </div>
            
            {/* Arrows & Indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {RESEARCH_CATEGORIES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      carouselIndex === idx ? 'w-6 bg-amber-500' : 'w-2 bg-[var(--border-card)] hover:bg-amber-500/50'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 pl-2">
                <button
                  onClick={() => setCarouselIndex((prev) => (prev === 0 ? RESEARCH_CATEGORIES.length - 1 : prev - 1))}
                  className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/50 transition cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % RESEARCH_CATEGORIES.length)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/50 transition cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Slide Card */}
          {(() => {
            const currentCat = RESEARCH_CATEGORIES[carouselIndex];
            return (
              <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl overflow-hidden transition-all duration-500">
                {/* Background Stained-Glass Ambient Accent */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Category Narrative */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <CategoryIcon name={currentCat.iconName} className="w-4 h-4" />
                      <span>{currentCat.name} • Trụ Cột #{carouselIndex + 1}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)] leading-snug">
                      {currentCat.methodology.title}
                    </h3>

                    <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif leading-relaxed">
                      {currentCat.description}
                    </p>

                    {/* Key Focal Points */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs uppercase tracking-wider font-mono text-[var(--text-muted)] font-semibold block">
                        Các Trọng Tâm Khảo Cứu:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentCat.focalPoints.map((fp, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif text-[var(--text-main)] shadow-xs"
                          >
                            • {fp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons: Methodology & Drafting */}
                    <div className="pt-4 border-t border-[var(--border-card)] flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveMethodologyTab(currentCat.id);
                          scrollToSection(methodologyRef);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs sm:text-sm hover:bg-amber-400 transition shadow-md cursor-pointer"
                      >
                        <span>Xem Phương Pháp Luận Chuyên Mục</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <Link
                        href="/soan-bai"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-main)] font-serif font-semibold text-xs sm:text-sm transition cursor-pointer"
                      >
                        <PenTool className="w-4 h-4 text-amber-500" />
                        <span>Biên Soạn Chuyên Khảo Này</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Key Questions & Academic Highlights */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-card)] space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-amber-500 uppercase tracking-widest font-semibold">
                        Khung Phương Pháp Luận
                      </span>
                      <h4 className="font-serif font-bold text-base text-[var(--text-main)]">
                        {currentCat.methodology.frameworkName}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] font-serif">
                        {currentCat.methodology.subtitle}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
                      <span className="text-xs font-serif font-bold text-[var(--text-main)] block">
                        Các Câu Hỏi Khảo Cứu Điển Hình:
                      </span>
                      <ul className="space-y-2 text-xs text-[var(--text-muted)] font-serif">
                        {currentCat.methodology.steps.slice(0, 3).map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span><strong>Bước {s.step}:</strong> {s.name} — <em>&ldquo;{s.keyQuestions}&rdquo;</em></span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 text-[11px] font-serif text-[var(--text-muted)] border-t border-[var(--border-card)] flex items-center justify-between">
                      <span>Nguồn trích dẫn:</span>
                      <span className="text-amber-500 font-bold">{currentCat.methodology.requiredSources.length} nguồn tài liệu quy chuẩn</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. BENTO GRID: MA TRẬN 8 CHUYÊN NGÀNH NGHIÊN CỨU
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-[var(--border-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
              Kiến Trúc Học Thuật VERIDU
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)]">
              Ma Trận 8 Chuyên Ngành Nghiên Cứu
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
              Mỗi chuyên ngành đại diện cho một lăng kính đức tin và lý trí (Fides et Ratio), được trang bị các tiêu chuẩn học thuật nghiêm ngặt.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RESEARCH_CATEGORIES.map((cat, idx) => {
              // Highlight 2 main categories as larger cards
              const isLarge = cat.id === 'kinh-thanh' || cat.id === 'than-hoc';

              return (
                <div
                  key={cat.id}
                  className={`group relative rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 transition-all duration-300 shadow-sm flex flex-col justify-between ${
                    isLarge ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${cat.badgeColor} border`}>
                        <CategoryIcon name={cat.iconName} className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-amber-500 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif mt-2 line-clamp-3 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    {/* Focal Points Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cat.focalPoints.slice(0, isLarge ? 4 : 2).map((fp, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-lg bg-[var(--bg-main)] text-[11px] text-[var(--text-muted)] font-serif border border-[var(--border-card)]"
                        >
                          {fp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Click to Explore */}
                  <div className="pt-6 mt-4 border-t border-[var(--border-card)] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveMethodologyTab(cat.id);
                        scrollToSection(methodologyRef);
                      }}
                      className="text-xs font-serif font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Sổ tay phương pháp</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <Link
                      href="/soan-bai"
                      className="text-xs font-serif font-semibold text-[var(--text-muted)] hover:text-amber-500 transition flex items-center gap-1"
                    >
                      <span>Biên soạn &rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE METHODOLOGY PLAYBOOK (Sổ Tay Phương Pháp)
      ───────────────────────────────────────────────────────────── */}
      <section 
        ref={methodologyRef} 
        id="methodology-section"
        className="py-16 border-b border-[var(--border-card)] bg-gradient-to-b from-transparent via-[var(--bg-card)]/40 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
              Quy Chuẩn Học Thuật Đặc Thù
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)]">
              Sổ Tay Phương Pháp Luận Nghiên Cứu
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
              Mỗi phân môn yêu cầu một quy trình thẩm định và tiếp cận khoa học riêng biệt nhằm bảo đảm tính chân lý, lòng trung thành với Huấn Quyền và sự phong phú của Thần học.
            </p>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center">
            {RESEARCH_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeMethodologyTab;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveMethodologyTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-serif font-bold whitespace-nowrap transition cursor-pointer border ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-105' 
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/40 hover:text-[var(--text-main)]'
                  }`}
                >
                  <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Methodology Details Container */}
          <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-lg overflow-hidden p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Header: Framework Title & Description */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-card)]">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-semibold text-amber-500 tracking-wider uppercase">
                  Khung Quy Trình: {activeMethodology.methodology.frameworkName}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">
                  {activeMethodology.methodology.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                  {activeMethodology.methodology.subtitle}
                </p>
              </div>

              {/* Copy Outline Button */}
              <button
                onClick={handleCopyOutline}
                className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-serif font-bold transition shadow-sm cursor-pointer"
              >
                {copiedOutline ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Đã Sao Chép Dàn Ý!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Dàn Ý Chuẩn</span>
                  </>
                )}
              </button>
            </div>

            {/* Methodology Step-by-Step Flow */}
            <div className="space-y-4">
              <h4 className="text-sm font-serif font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Quy Trình Triển Khai Từng Bước:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMethodology.methodology.steps.map((step) => (
                  <div
                    key={step.step}
                    className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3 relative group hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-serif font-bold text-xs">
                        {step.step}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Bước {step.step}
                      </span>
                    </div>

                    <h5 className="font-serif font-bold text-sm text-[var(--text-main)] leading-snug">
                      {step.name}
                    </h5>

                    <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                      {step.desc}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-card)]/60">
                      <div className="text-[11px] font-serif italic text-amber-500/90">
                        <span className="font-semibold">Câu hỏi then chốt:</span> &ldquo;{step.keyQuestions}&rdquo;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Column: Required Primary Sources & Structure Template */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              
              {/* Column 1: Required Sources */}
              <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4">
                <h4 className="text-sm font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Nguồn Tư Liệu Bắt Buộc Trích Dẫn:</span>
                </h4>
                <ul className="space-y-2.5">
                  {activeMethodology.methodology.requiredSources.map((source, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: 4-Part Structure Template */}
              <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4">
                <h4 className="text-sm font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Cấu Trúc Bài Nghiên Cứu Mẫu (Dàn Ý 4 Phần):</span>
                </h4>
                <div className="space-y-3">
                  {activeMethodology.methodology.structureTemplate.map((part, i) => (
                    <div key={i} className="text-xs font-serif space-y-1">
                      <div className="font-bold text-[var(--text-main)] text-amber-600 dark:text-amber-400">
                        {part.section}
                      </div>
                      <div className="text-[var(--text-muted)] pl-2 border-l-2 border-amber-500/30">
                        {part.guidance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Exemplary Research Question & Action Callout */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-serif font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Đề Tài Khảo Cứu Điển Hình:
                </div>
                <div className="text-sm sm:text-base font-serif font-bold text-[var(--text-main)] italic">
                  &ldquo;{activeMethodology.methodology.exemplaryQuestion}&rdquo;
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/huong-dan-viet-bai"
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 text-xs font-serif font-semibold text-[var(--text-main)] transition"
                >
                  Quy Chuẩn Viết Bài
                </Link>
                <Link
                  href="/soan-bai"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-serif font-bold hover:bg-amber-400 transition shadow-sm flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Biên Soạn Chuyên Đề Này &rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER INSPIRATION & GUIDELINES CALLOUT
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[var(--border-card)] bg-gradient-to-b from-transparent to-[var(--bg-card)]/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>

          <blockquote className="text-base sm:text-lg md:text-xl font-serif italic text-[var(--text-main)] max-w-2xl mx-auto leading-relaxed">
            &ldquo;Đức tin tìm kiếm sự hiểu biết (Fides quaerens intellectum) — sự hiểu biết lại dẫn tới tình yêu sâu thẳm hơn nơi Thiên Chúa và Lời Người.&rdquo;
          </blockquote>
          
          <div className="text-xs font-serif uppercase tracking-widest text-amber-500 font-bold">
            — Thánh Anselmô thành Canterbury &amp; Thánh Tôma Aquinô
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/huong-dan-viet-bai"
              className="px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-xs font-serif font-semibold text-[var(--text-main)] transition"
            >
              Xem Quy Chuẩn Biên Tập &amp; Trích Dẫn
            </Link>
            <Link
              href="/soan-bai"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-serif font-bold hover:bg-amber-400 transition shadow-md flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Bắt Đầu Biên Soạn Bài Viết</span>
            </Link>
            <Link
              href="/thu-vien"
              className="px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-xs font-serif font-semibold text-[var(--text-main)] transition"
            >
              Khám Phá Thư Viện Bài Viết
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
