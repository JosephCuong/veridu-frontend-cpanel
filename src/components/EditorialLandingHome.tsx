'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, GraduationCap, Shield, Library, Cross, Quote, ArrowRight, 
  ChevronRight, Play, Award, Church, User, CheckCircle2, Settings, ExternalLink
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { LANDING_MEDIA_CONFIG, PillarCardConfig, TrainingTrackConfig } from '@/config/landingMediaConfig';
import { getGoogleDriveImageUrl } from '@/lib/driveHelper';
import ArticleCarousel from '@/components/ArticleCarousel';

interface EditorialLandingHomeProps {
  courses: any[];
  homepageData: any;
  embedUrl: string | null;
}

export default function EditorialLandingHome({
  courses,
  homepageData,
}: EditorialLandingHomeProps) {
  const { t, locale, isEn } = useTranslation();
  const [config, setConfig] = useState(LANDING_MEDIA_CONFIG);

  const renderPillarIcon = (name: string, className: string) => {
    switch (name) {
      case 'book': return <BookOpen className={className} />;
      case 'graduation': return <GraduationCap className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'library': return <Library className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const renderBadgeIcon = (name: string, className: string) => {
    switch (name) {
      case 'cross': return <Cross className={className} />;
      case 'book': return <BookOpen className={className} />;
      case 'award': return <Award className={className} />;
      case 'church': return <Church className={className} />;
      case 'user': return <User className={className} />;
      default: return <Church className={className} />;
    }
  };

  return (
    <div className="w-full flex flex-col space-y-16 sm:space-y-20 lg:space-y-24 pb-20 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      {/* ══════════════════════════════════════════════════════════════════════════
          1. SECTION 1: EDITORIAL BRUTALIST HERO (GIANT TYPOGRAPHY BEHIND CUTOUT)
         ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] w-full flex flex-col justify-between pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#FAF7F2] dark:bg-[#0B0D12] transition-colors duration-500 border-b border-stone-200 dark:border-white/10">
        
        {/* Ambient Subtle Cathedral Texture Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0 bg-cover bg-center transition-opacity"
          style={{
            backgroundImage: `url("${getGoogleDriveImageUrl(config.hero.backgroundAtmosphereUrl, 2400)}")`,
            filter: 'blur(30px) saturate(0.6)'
          }}
        />

        {/* ── GIANT BACKGROUND DISPLAY TYPOGRAPHY (M A F I A STYLE ➔ V E R I D U) ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-1 select-none overflow-hidden">
          <span className="font-playfair font-black text-[18vw] sm:text-[16vw] lg:text-[14vw] tracking-[0.14em] text-stone-900/[0.07] dark:text-amber-400/[0.08] leading-none whitespace-nowrap uppercase">
            {config.hero.giantWord}
          </span>
        </div>

        {/* ── TOP EDITORIAL MOTTO BAR (LEFT) ── */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="space-y-1">
            <div className="w-8 h-[2px] bg-amber-600 dark:bg-amber-400 mb-2"></div>
            {config.hero.subMottoLeft.map((motto, idx) => (
              <p 
                key={idx} 
                className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.18em] uppercase text-stone-700 dark:text-slate-300"
              >
                {motto}
              </p>
            ))}
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-playfair font-bold uppercase tracking-widest backdrop-blur-md">
            <span className="text-amber-600 dark:text-amber-400">✝</span>
            <span>VERITAS VOS LIBERABIT</span>
          </div>
        </div>

        {/* ── FOREGROUND MAJESTIC SACRED CUTOUT FIGURE (CENTER) ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-4 my-auto">
          {/* Radiant Halo behind figure */}
          <div className="absolute w-72 sm:w-96 lg:w-[480px] h-72 sm:h-96 lg:h-[480px] rounded-full bg-amber-500/20 dark:bg-amber-400/15 blur-3xl pointer-events-none" />

          {/* Majestic Arch Frame Cutout */}
          <div className="relative w-64 sm:w-80 md:w-96 lg:w-[420px] h-[360px] sm:h-[420px] md:h-[480px] rounded-t-[190px] sm:rounded-t-[220px] rounded-b-2xl overflow-hidden shadow-2xl border-2 border-[#C5A059] dark:border-amber-400/50 group transition-transform duration-500 hover:scale-[1.02]">
            <Image
              src={getGoogleDriveImageUrl(config.hero.foregroundCutoutUrl, 1600)}
              alt="Đức Kitô — Ánh Sáng Thế Gian"
              fill
              priority
              unoptimized={true}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 320px, 420px"
            />
            {/* Subtle Vignette & Light Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-950/80 border border-amber-400/40 text-amber-300 font-playfair text-xs tracking-widest uppercase backdrop-blur-md shadow-lg">
                ✝ LUX CHRISTI ✝
              </span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM EDITORIAL ACTION BAR (CTAs LEFT + EDITION RIGHT) ── */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 max-w-7xl mx-auto w-full pt-4">
          
          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={config.hero.primaryCta.href}
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl bg-stone-900 dark:bg-amber-500 hover:bg-black dark:hover:bg-amber-400 text-white dark:text-slate-950 font-playfair font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2.5"
            >
              <span>{config.hero.primaryCta.text}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={config.hero.secondaryCta.href}
              className="px-6 py-3.5 rounded-xl border border-stone-400 dark:border-white/20 text-stone-800 dark:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 font-playfair font-bold text-xs sm:text-sm tracking-widest uppercase transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span>{config.hero.secondaryCta.text}</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </div>

          {/* Sub Edition Tag on Right */}
          <div className="text-left sm:text-right space-y-1">
            <span className="text-[11px] font-mono tracking-widest uppercase text-stone-500 dark:text-slate-400">
              {config.hero.editionTag}
            </span>
            <div className="w-12 h-[2px] bg-amber-600 dark:bg-amber-400 sm:ml-auto"></div>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. SECTION 2: 4-COLUMN CINEMATIC FEATURE STRIP (THE DARK HORIZONTAL BAND)
         ══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#0D0F15] text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-16 border-y border-stone-800 dark:border-amber-500/20 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
                NỀN MÓNG THÁNH KINH &amp; HỌC THUẬT
              </span>
              <h2 className="font-playfair font-black text-2xl sm:text-3xl text-white mt-1">
                Bốn Trụ Cột Tri Thức VERIDU
              </h2>
            </div>
            <span className="text-xs font-serif italic text-stone-400">
              Khám phá toàn diện các phân hệ trọng tâm
            </span>
          </div>

          {/* 4 Feature Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.pillars.map((pillar) => (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between min-h-[300px] p-6 bg-slate-900/60 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
              >
                {/* Background Image with Cinematic Dark Gradient */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={getGoogleDriveImageUrl(pillar.imageUrl, 800)}
                    alt={pillar.pillarName}
                    fill
                    unoptimized={true}
                    className="object-cover object-center opacity-30 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F15] via-[#0D0F15]/80 to-transparent pointer-events-none" />
                </div>

                {/* Top: Icon & Subtitle */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    {renderPillarIcon(pillar.iconName, 'w-5 h-5')}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400">
                      {pillar.subtitle}
                    </span>
                    <h3 className="font-playfair font-bold text-xl text-white group-hover:text-amber-300 transition-colors">
                      {pillar.pillarName}
                    </h3>
                  </div>
                </div>

                {/* Bottom: Description & Action Link */}
                <div className="relative z-10 space-y-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-stone-300 font-serif leading-relaxed line-clamp-3">
                    {pillar.description}
                  </p>
                  <div className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>{pillar.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </Link>
            ))}
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. SECTION 3: THE STORY SPLIT SECTION (VIA · VITA · VERITAS)
         ══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Bold Editorial 3-Word Headline & Sacred Narrative */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
                {config.story.categoryTag}
              </span>
              
              <h2 className="font-playfair font-black text-4xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-stone-100 tracking-tight leading-[1.05]">
                {config.story.threeWords.map((word, idx) => (
                  <span key={idx} className="block">{word}</span>
                ))}
              </h2>

              <p className="font-playfair font-bold text-sm sm:text-base text-amber-800 dark:text-amber-300 tracking-wider uppercase pt-1">
                {config.story.translationText}
              </p>
            </div>

            {/* Scriptural Quote Box */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-600 dark:border-amber-400 space-y-1">
              <p className="font-serif italic text-sm sm:text-base text-stone-800 dark:text-amber-200">
                {config.story.scriptureQuote}
              </p>
              <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
                {config.story.scriptureRef}
              </span>
            </div>

            <p className="font-serif text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed">
              {config.story.narrativeParagraph}
            </p>

            <div className="pt-2">
              <Link
                href={config.story.cta.href}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-stone-900 dark:bg-amber-500 hover:bg-black dark:hover:bg-amber-400 text-white dark:text-slate-950 font-playfair font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-lg hover:scale-105"
              >
                <span>{config.story.cta.text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* Right Column: Large Dramatic Sacred Artwork Photo */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-stone-300 dark:border-amber-500/30 group">
              <Image
                src={getGoogleDriveImageUrl(config.story.imageUrl, 1800)}
                alt={config.story.imageAlt}
                fill
                unoptimized={true}
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400">
                  THÁNH ĐƯỜNG HUẤN QUYỀN
                </span>
                <h3 className="font-playfair font-bold text-lg text-white">
                  {config.story.imageAlt}
                </h3>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. SECTION 4: 5-COLUMN TRUST & FAITH BADGES STRIP (LIGHT CLEAN BAND)
         ══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#F4EFEA] dark:bg-slate-900/50 py-8 px-4 sm:px-8 border-y border-stone-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
          {config.faithBadges.map((badge) => (
            <div 
              key={badge.id} 
              className="flex items-start gap-3 p-2 rounded-xl transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                {renderBadgeIcon(badge.iconName, 'w-4 h-4')}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-playfair font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-slate-400 font-serif leading-tight">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. SECTION 5: "LỘ TRÌNH ĐÀO TẠO ĐỨC TIN" (CHOOSE YOUR EDITION 4-CARD GRID)
         ══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 dark:border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
              LỘ TRÌNH HỌC TẬP CHUYÊN SÂU
            </span>
            <h2 className="font-playfair font-black text-2xl sm:text-4xl text-stone-900 dark:text-white mt-1">
              Chương Trình Đào Tạo Đức Tin
            </h2>
          </div>
          <Link
            href="/khoa-hoc"
            className="text-xs font-mono font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5"
          >
            <span>XEM TẤT CẢ KHÓA HỌC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Luxury Track Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {config.trainingTracks.map((track) => (
            <div
              key={track.id}
              className={`rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative border ${
                track.badge
                  ? 'border-amber-500 shadow-2xl bg-white dark:bg-slate-900 ring-2 ring-amber-500/30'
                  : 'border-stone-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-md hover:shadow-xl'
              }`}
            >
              {/* Optional Most Popular / Highlight Badge */}
              {track.badge && (
                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-playfair font-black text-[10px] tracking-wider uppercase shadow-md">
                  {track.badge}
                </div>
              )}

              {/* Card Thumbnail Image */}
              <div className="relative w-full h-44 overflow-hidden bg-slate-900">
                <Image
                  src={getGoogleDriveImageUrl(track.imageUrl, 800)}
                  alt={track.title}
                  fill
                  unoptimized={true}
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-400/30 backdrop-blur-md">
                  {track.levelTag}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-playfair font-bold text-lg text-stone-900 dark:text-white leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-slate-400 font-serif leading-relaxed">
                    {track.subtitle}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-2 pt-2 border-t border-stone-200 dark:border-white/10 text-xs font-serif text-stone-700 dark:text-slate-300">
                  {track.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Action CTA Button */}
                <div className="pt-4">
                  <Link
                    href={track.href}
                    className={`w-full py-3 rounded-xl font-playfair font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm ${
                      track.badge
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-900 dark:text-white border border-stone-200 dark:border-white/10'
                    }`}
                  >
                    <span>{track.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          6. SECTION 6: THƯ VIỆN BÀI VIẾT & SUY NIỆM MỚI NHẤT
         ══════════════════════════════════════════════════════════════════════════ */}
      {homepageData?.articles && homepageData.articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full space-y-6">
          <div className="flex justify-between items-end border-b border-stone-200 dark:border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                TRI THỨC &amp; SUY NIỆM
              </span>
              <h2 className="font-playfair font-black text-2xl sm:text-3xl text-stone-900 dark:text-white mt-1">
                Bài Viết Mới Cập Nhật
              </h2>
            </div>
            <Link 
              href="/thu-vien" 
              className="text-xs font-mono font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Xem toàn bộ thư viện →
            </Link>
          </div>
          <ArticleCarousel articles={homepageData.articles} />
        </section>
      )}

    </div>
  );
}
