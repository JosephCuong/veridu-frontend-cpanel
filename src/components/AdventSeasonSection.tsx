'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ADVENT_WEEKS,
  AdventShowcaseItem,
} from '@/config/liturgicalSeasonConfig';
import {
  VeriduCandleIcon,
  VeriduCrownIcon,
  VeriduLyreIcon,
  VeriduMangerIcon,
  VeriduScriptureIcon,
  VeriduStarIcon,
} from '@/components/icons/VeriduIcons';
import VeriduPlaceholder from '@/components/VeriduPlaceholder';

interface AdventSeasonSectionProps {
  items: AdventShowcaseItem[];
}

export default function AdventSeasonSection({ items }: AdventSeasonSectionProps) {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  const activeWeek = ADVENT_WEEKS[selectedWeekIndex] || ADVENT_WEEKS[0];

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const offset = direction === 'left' ? -330 : 330;
    sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section
      aria-label="Chuyên mục Mùa Vọng VERIDU"
      className="relative w-full overflow-hidden bg-[#121629] text-stone-100 border-y border-[#C89238]/25"
    >
      {/* Subtle nocturnal starlight radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 24%, rgba(200, 146, 56, 0.14), transparent 44%), radial-gradient(circle at 82% 72%, rgba(124, 58, 237, 0.12), transparent 46%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-14 sm:py-18 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* ── LEFT COLUMN: MINIMALIST SACRED AXIS & 4 ADVENT CANDLES ── */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#C89238]/30 bg-gradient-to-b from-[#171C36]/95 via-[#13172C]/95 to-[#0E1122]/95 p-7 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Corner liturgical hairline accent */}
            <div className="pointer-events-none absolute inset-3 rounded-2xl border border-[#C89238]/15" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.26em] uppercase text-[#D8A74E]/90">
                MÙA VỌNG · TEMPUS ADVENTUS
              </span>

              {/* Vertical Minimalist Sacred Symbols: Star -> Crown -> Manger */}
              <div className="flex flex-col items-center py-2 text-[#D8A74E]" aria-hidden="true">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8A74E]/75 mb-2" />
                <VeriduStarIcon className="w-9 h-9 drop-shadow-[0_0_12px_rgba(216,167,78,0.45)]" />
                <span className="w-[1px] h-7 bg-gradient-to-b from-[#D8A74E]/80 to-[#D8A74E]/35 my-2" />
                <VeriduCrownIcon className="w-8 h-8" />
                <span className="w-[1px] h-7 bg-gradient-to-b from-[#D8A74E]/80 to-[#D8A74E]/35 my-2" />
                <VeriduMangerIcon className="w-8 h-8" />
                <span className="w-[1px] h-6 bg-gradient-to-b from-[#D8A74E]/75 to-transparent mt-2" />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-playfair font-bold text-2xl sm:text-3xl tracking-wide text-[#F5E6C8]">
                  Veni, Domine Jesu
                </h2>
                <p className="text-xs sm:text-sm tracking-[0.14em] uppercase text-[#D8A74E]/85">
                  Hãy đến, lạy Chúa Giêsu
                </p>
              </div>
            </div>

            {/* Interactive 4 Advent Candles */}
            <div className="relative z-10 mt-7 pt-6 border-t border-[#C89238]/20 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {ADVENT_WEEKS.map((w, idx) => {
                  const isLit = idx <= selectedWeekIndex;
                  const isSelected = idx === selectedWeekIndex;
                  const isRose = w.candleColor === 'rose';

                  return (
                    <button
                      key={w.week}
                      type="button"
                      onClick={() => setSelectedWeekIndex(idx)}
                      className={`group flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? isRose
                            ? 'bg-rose-500/15 border-rose-400/55 text-rose-200 shadow-[0_0_18px_rgba(244,114,182,0.18)]'
                            : 'bg-[#C89238]/15 border-[#D8A74E]/60 text-[#F5E6C8] shadow-[0_0_18px_rgba(216,167,78,0.18)]'
                          : 'bg-white/[0.02] border-white/10 text-stone-400 hover:border-[#C89238]/40 hover:text-stone-200'
                      }`}
                      aria-pressed={isSelected}
                      title={`${w.label}: ${w.theme}`}
                    >
                      <VeriduCandleIcon
                        lit={isLit}
                        className={`w-6 h-6 transition-transform duration-300 group-hover:scale-105 ${
                          isLit
                            ? isRose
                              ? 'text-rose-300'
                              : 'text-[#E3B45C]'
                            : 'text-stone-500'
                        }`}
                        flameClassName={isLit ? 'text-amber-300' : undefined}
                      />
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                        Tuần {w.roman}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Week Liturgical Meaning Box */}
              <div className="rounded-2xl bg-[#0B0E1D]/75 border border-[#C89238]/20 p-4 space-y-2 text-left">
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
                  <span
                    className={
                      activeWeek.candleColor === 'rose'
                        ? 'text-rose-300 font-bold'
                        : 'text-[#D8A74E] font-bold'
                    }
                  >
                    {activeWeek.latinTag}
                  </span>
                  <span className="text-stone-400">{activeWeek.candleLabel}</span>
                </div>
                <div className="font-playfair font-bold text-base text-white">
                  {activeWeek.label}: {activeWeek.theme}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeWeek.summary}
                </p>
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-white/10 text-xs">
                  <span className="italic text-[#E8C98A] line-clamp-1">
                    {activeWeek.scriptureQuote}
                  </span>
                  <Link
                    href={activeWeek.scriptureHref}
                    className="shrink-0 font-mono text-[11px] text-[#D8A74E] hover:underline"
                  >
                    {activeWeek.scriptureRef} →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: ADVENT SLIDER FOR ARTICLES & SACRED MUSIC ── */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Section Header + Slider Arrows */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#D8A74E]">
                  <VeriduStarIcon className="w-4 h-4" />
                  <span>Hành Trình Mùa Vọng Cùng VERIDU</span>
                </div>
                <h2 className="font-playfair font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
                  Suy Niệm, Kinh Thánh &amp; Thánh Nhạc Mùa Vọng
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                  Tuyển chọn các khảo luận Kinh Thánh về mầu nhiệm Nhập Thể, ý nghĩa phụng vụ 4 tuần
                  Mùa Vọng và bản Đáp Ca – sheet PDF đồng hành cùng cộng đoàn.
                </p>
              </div>

              {items.length > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollSlider('left')}
                    aria-label="Xem mục Mùa Vọng trước"
                    className="w-9 h-9 rounded-full border border-[#C89238]/35 bg-white/[0.04] hover:bg-[#C89238] hover:text-slate-950 text-[#E3B45C] flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider('right')}
                    aria-label="Xem mục Mùa Vọng tiếp theo"
                    className="w-9 h-9 rounded-full border border-[#C89238]/35 bg-white/[0.04] hover:bg-[#C89238] hover:text-slate-950 text-[#E3B45C] flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Horizontal Snap Slider */}
            <div
              ref={sliderRef}
              className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item) => {
                const hasValidThumb =
                  Boolean(item.thumbnailUrl) && !failedImages[item.id];

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group snap-start shrink-0 w-[275px] sm:w-[310px] rounded-2xl overflow-hidden border border-white/10 hover:border-[#D8A74E]/60 bg-[#171C33]/85 hover:bg-[#1B213B] transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* 16:10 Media Box */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0E1224]">
                        {hasValidThumb && item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            loading="lazy"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <VeriduPlaceholder
                            variant={item.kind === 'music' ? 'music' : 'advent'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121629]/85 via-transparent to-black/20 pointer-events-none" />

                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#111528]/85 text-[#E8C070] border border-[#D8A74E]/40 backdrop-blur-md">
                            {item.kind === 'music' ? (
                              <VeriduLyreIcon className="w-3 h-3" />
                            ) : (
                              <VeriduScriptureIcon className="w-3 h-3" />
                            )}
                            <span>{item.badge}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-2.5">
                        <h3 className="font-playfair font-bold text-base sm:text-lg text-white group-hover:text-[#E8C070] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-stone-300/90 line-clamp-3 leading-relaxed">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-400 truncate">
                        {item.meta || (item.kind === 'music' ? 'YouTube & Sheet PDF' : 'Bài viết VERIDU')}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#E3B45C] group-hover:translate-x-1 transition-transform shrink-0">
                        <span>{item.kind === 'music' ? 'Nghe & Tải' : 'Đọc ngay'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Quick Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/thu-vien"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C89238] hover:bg-[#D8A74E] text-slate-950 font-playfair font-bold text-xs tracking-wider uppercase shadow-lg transition"
                >
                  <VeriduScriptureIcon className="w-4 h-4" />
                  <span>Khám Phá Thư Viện Mùa Vọng</span>
                </Link>
                <Link
                  href="/thanh-nhac"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#C89238]/40 hover:border-[#D8A74E] bg-white/[0.03] hover:bg-white/[0.08] text-[#F5E6C8] font-playfair font-bold text-xs tracking-wider uppercase transition"
                >
                  <VeriduLyreIcon className="w-4 h-4 text-[#D8A74E]" />
                  <span>Đáp Ca &amp; Thánh Nhạc</span>
                </Link>
              </div>

              <span className="text-[11px] font-mono text-stone-400 hidden sm:inline">
                Tự động cập nhật khi có bài Mùa Vọng mới
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
