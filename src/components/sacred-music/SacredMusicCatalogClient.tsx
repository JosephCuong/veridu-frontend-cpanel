'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Music,
  Search,
  Play,
  FileText,
  Lock,
  PlayCircle,
  BookOpen,
  Cross,
  Download,
  Eye,
  Mic2,
  SlidersHorizontal,
  ExternalLink,
  Settings,
  X,
} from 'lucide-react';
import {
  LITURGICAL_SEASONS,
  MASS_PARTS,
  SEASON_ACCENT_MAP,
  SacredMusicItem,
} from '@/lib/sacredMusic';
import { getStoredUser, UserProfile } from '@/lib/auth';

interface SacredMusicCatalogClientProps {
  initialItems: SacredMusicItem[];
}

export default function SacredMusicCatalogClient({
  initialItems,
}: SacredMusicCatalogClientProps) {
  const [items] = useState<SacredMusicItem[]>(initialItems);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('ALL');
  const [selectedPart, setSelectedPart] = useState<string>('ALL');

  useEffect(() => {
    setUser(getStoredUser());
    const onUserUpdate = (e: Event) => {
      const custom = e as CustomEvent<UserProfile | null>;
      setUser(custom.detail ?? getStoredUser());
    };
    window.addEventListener('veridu_user_updated', onUserUpdate);
    return () => window.removeEventListener('veridu_user_updated', onUserUpdate);
  }, []);

  const isAdmin =
    user?.role === 'Quản Trị Viên' ||
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'veridu.net@gmail.com';

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedSeason !== 'ALL' && item.liturgical_season !== selectedSeason) {
        return false;
      }
      if (selectedPart !== 'ALL' && item.mass_part !== selectedPart) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.title,
        item.title_en,
        item.composer,
        item.liturgical_season,
        item.mass_part,
        item.scripture_ref,
        item.psalm_number ? `tv ${item.psalm_number} thanh vinh ${item.psalm_number}` : '',
        item.musical_key,
        item.lyrics,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, selectedSeason, selectedPart]);

  const featuredCount = useMemo(() => items.filter((i) => i.has_pdf).length, [items]);
  const videoCount = useMemo(() => items.filter((i) => Boolean(i.youtube_url)).length, [items]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedSeason !== 'ALL' || selectedPart !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSeason('ALL');
    setSelectedPart('ALL');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-[98px] sm:pt-[106px] pb-24">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.02] to-[var(--bg-main)] dark:from-stone-950 dark:via-stone-900/70 dark:to-[var(--bg-main)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 20%, rgba(217, 119, 6, 0.2), transparent 42%), radial-gradient(circle at 82% 25%, rgba(124, 58, 237, 0.14), transparent 40%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Cross className="w-3.5 h-3.5" />
                <span>Không Gian Thánh Nhạc &amp; Phụng Vụ</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-main)] leading-tight">
                Thư Viện Thánh Nhạc{' '}
                <span className="text-amber-600 dark:text-amber-400">VERIDU</span>
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
                Nghe Đáp Ca, Thánh Ca theo từng mùa phụng vụ, kết nối trực tiếp bản văn Thánh Vịnh
                trong Kinh Thánh và tải sheet nhạc PDF chuẩn dành cho ca đoàn &amp; cộng đoàn.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)]">
                  <Music className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <strong className="text-[var(--text-main)]">{items.length}</strong> tác phẩm
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)]">
                  <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
                  <strong className="text-[var(--text-main)]">{videoCount}</strong> video hát mẫu /
                  karaoke
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)]">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <strong className="text-[var(--text-main)]">{featuredCount}</strong> sheet nhạc PDF
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://www.youtube.com/@veridu.net-gmail"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Kênh YouTube VERIDU</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {isAdmin && (
                <Link
                  href="/admin/thanh-nhac"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:border-amber-500/60 text-[var(--text-main)] border border-[var(--border-card)] font-semibold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>Quản Trị Thánh Nhạc</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH & LITURGICAL FILTERS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 space-y-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên bài hát, Thánh Vịnh (vd: Tv 79), tác giả (Lm. Kim Long), lời ca..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa Bộ Lọc</span>
              </button>
            )}
          </div>

          {/* Season Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>Mùa Phụng Vụ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSeason('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedSeason === 'ALL'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/50 hover:text-[var(--text-main)]'
                }`}
              >
                Tất cả mùa
              </button>
              {LITURGICAL_SEASONS.map((season) => {
                const accent = SEASON_ACCENT_MAP[season];
                const isActive = selectedSeason === season;
                return (
                  <button
                    key={season}
                    type="button"
                    onClick={() => setSelectedSeason(isActive ? 'ALL' : season)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/50 hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-white' : accent?.dot || 'bg-amber-500'
                      }`}
                    />
                    <span>{season}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mass Part Filter Pills */}
          <div className="space-y-2 pt-1 border-t border-[var(--border-card)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Phần Lễ &amp; Thể Loại
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedPart('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  selectedPart === 'ALL'
                    ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/40'
                }`}
              >
                Tất cả
              </button>
              {MASS_PARTS.map((part) => {
                const isActive = selectedPart === part;
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => setSelectedPart(isActive ? 'ALL' : part)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                      isActive
                        ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/40 hover:text-[var(--text-main)]'
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Banner about Member PDF Access */}
        {!user && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm">
            <div className="flex items-start sm:items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Quyền tải Sheet Nhạc PDF:</strong> Bạn có thể nghe &amp; xem video hoàn toàn
                tự do; để tải về hoặc xem trực tiếp bản nhạc PDF chất lượng cao, hãy{' '}
                <strong>đăng nhập tài khoản VERIDU miễn phí</strong> trong trang chi tiết từng bài.
              </span>
            </div>
          </div>
        )}

        {/* ── CATALOG GRID ── */}
        {filteredItems.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
            <Music className="w-10 h-10 text-amber-500/60 mx-auto" />
            <h2 className="font-serif text-lg font-bold text-[var(--text-main)]">
              Chưa tìm thấy bài Thánh Ca phù hợp
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
              Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc mùa phụng vụ để xem toàn bộ thư viện Thánh Nhạc.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
              >
                Xem Tất Cả Tác Phẩm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const seasonStyle =
                SEASON_ACCENT_MAP[item.liturgical_season] || SEASON_ACCENT_MAP['Thường Niên'];

              return (
                <Link
                  key={item.id}
                  href={`/thanh-nhac/${item.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Visual Cover / YouTube Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-amber-950/90 via-stone-900 to-purple-950/90">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-amber-900/40 via-stone-900/90 to-amber-950/90">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mb-3">
                          <Music className="w-6 h-6 text-amber-300" />
                        </div>
                        <span className="font-serif text-sm font-semibold text-amber-100/90 line-clamp-2">
                          {item.title}
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md bg-black/55 text-white border border-white/15`}
                      >
                        <span className={`w-2 h-2 rounded-full ${seasonStyle.dot}`} />
                        <span>{item.liturgical_season}</span>
                      </span>
                    </div>

                    {/* Center Play Icon for YouTube */}
                    {item.youtube_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover:bg-amber-600 group-hover:scale-110 transition-all shadow-lg">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Bottom media badges */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/15">
                          {item.mass_part}
                        </span>
                        {item.liturgical_year && item.liturgical_year !== 'Chung' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/80 text-stone-950 font-bold">
                            {item.liturgical_year}
                          </span>
                        )}
                      </div>

                      {item.karaoke_youtube_url && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-600/85 text-white">
                          <Mic2 className="w-3 h-3" />
                          Karaoke
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h2 className="font-serif text-base sm:text-lg font-bold text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2 leading-snug">
                        {item.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                        <span className="font-medium text-[var(--text-main)]/85">
                          {item.composer}
                        </span>
                        {item.musical_key && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-card)] text-[11px] font-mono">
                            Tone {item.musical_key}
                          </span>
                        )}
                        {item.scripture_ref && (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                            <BookOpen className="w-3 h-3" />
                            {item.scripture_ref}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between gap-2 text-xs">
                      {item.has_pdf ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-semibold text-[11px]">
                          {user ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>{user ? 'Sheet PDF sẵn sàng' : 'PDF • Đăng nhập để tải'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)]">Video &amp; Lời ca</span>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {item.views}
                        </span>
                        {item.has_pdf && (
                          <span className="inline-flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {item.downloads}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
