'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Character } from '@/lib/api';
import { 
  Search, 
  LayoutGrid, 
  GitCommitVertical, 
  BookOpen, 
  Cross, 
  Scroll, 
  Crown, 
  Heart, 
  ArrowRight,
  Filter,
  User,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CharacterExplorerProps {
  initialCharacters: Character[];
}

export default function CharacterExplorer({ initialCharacters }: CharacterExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'cuu-uoc' | 'tan-uoc'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Extract unique roles for the filter
  const availableRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    initialCharacters.forEach(c => {
      if (c.role) rolesSet.add(c.role);
    });
    return Array.from(rolesSet);
  }, [initialCharacters]);

  // Filtered characters
  const filteredCharacters = useMemo(() => {
    return initialCharacters.filter(char => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = char.name.toLowerCase().includes(q);
        const matchOrig = char.original_name?.toLowerCase().includes(q);
        const matchMeaning = char.meaning?.toLowerCase().includes(q);
        const matchRole = char.role.toLowerCase().includes(q);
        const matchEra = char.era.toLowerCase().includes(q);
        const matchDesc = char.short_description?.toLowerCase().includes(q);
        if (!matchName && !matchOrig && !matchMeaning && !matchRole && !matchEra && !matchDesc) {
          return false;
        }
      }

      // 2. Testament Filter
      if (testamentFilter !== 'all') {
        if (char.testament !== testamentFilter) return false;
      }

      // 3. Role Filter
      if (roleFilter !== 'all') {
        if (char.role !== roleFilter) return false;
      }

      return true;
    });
  }, [initialCharacters, searchQuery, testamentFilter, roleFilter]);

  // Helper icon for character role
  const getRoleIcon = (role: string, testament: string) => {
    if (role.includes('Mẹ Thiên Chúa')) return <Heart className="w-3.5 h-3.5 text-rose-500" />;
    if (role.includes('Vua')) return <Crown className="w-3.5 h-3.5 text-amber-500" />;
    if (role.includes('Ngôn Sứ') || role.includes('Tiên tri')) return <Scroll className="w-3.5 h-3.5 text-indigo-400" />;
    if (role.includes('Tông Đồ') || role.includes('Thủ Lãnh')) return <Cross className="w-3.5 h-3.5 text-emerald-500" />;
    if (testament === 'tan-uoc') return <Cross className="w-3.5 h-3.5 text-amber-500" />;
    return <BookOpen className="w-3.5 h-3.5 text-amber-600" />;
  };

  return (
    <div className="space-y-10">
      
      {/* ── Control Bar: Search & Filter Tabs ── */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
        
        {/* Row 1: Search Box & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, tên gốc (Do Thái/Hy Lạp), vai trò, thời kỳ..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-amber-500 px-2 py-1"
              >
                Xóa
              </button>
            )}
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] self-center sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Xem Dạng Lưới Thẻ Kính Màu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới Thẻ</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Xem Dạng Dòng Thời Gian Lịch Sử"
            >
              <GitCommitVertical className="w-3.5 h-3.5" />
              <span>Dòng Thời Gian</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Tabs (Testament & Role) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-card)]">
          
          {/* Testament Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setTestamentFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                testamentFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              Tất Cả ({initialCharacters.length})
            </button>

            <button
              onClick={() => setTestamentFilter('cuu-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                testamentFilter === 'cuu-uoc'
                  ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Cựu Ước ({initialCharacters.filter(c => c.testament === 'cuu-uoc').length})</span>
            </button>

            <button
              onClick={() => setTestamentFilter('tan-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                testamentFilter === 'tan-uoc'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              <Cross className="w-3.5 h-3.5" />
              <span>Tân Ước ({initialCharacters.filter(c => c.testament === 'tan-uoc').length})</span>
            </button>
          </div>

          {/* Role Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Lọc theo vai trò nhân vật"
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Mọi vai trò</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* ── Empty State ── */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <User className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">Không Tìm Thấy Nhân Vật Phù Hợp</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc phân loại.
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setTestamentFilter('all'); setRoleFilter('all'); }}
            className="px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs transition"
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ── View Mode 1: Stained-Glass Card Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCharacters.map((char) => {
            const isOldTestament = char.testament === 'cuu-uoc';
            const topScripture = char.scriptures && char.scriptures.length > 0 ? char.scriptures[0] : null;

            return (
              <Link
                key={char.id}
                href={`/nhan-vat/${char.slug}`}
                className="group relative bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Amber Corner Glow */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

                <div className="space-y-5 relative z-10">
                  
                  {/* Top Avatar & Badges */}
                  <div className="flex items-start gap-4">
                    
                    {/* Avatar with Halo Ring */}
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 p-1 flex-shrink-0 relative overflow-hidden shadow-lg group-hover:border-amber-500 transition-all">
                      <div className="w-full h-full rounded-xl overflow-hidden relative">
                        {char.avatar_url ? (
                          <Image
                            src={char.avatar_url}
                            alt={char.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="80px"
                            unoptimized={char.avatar_url.includes('googleusercontent.com')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-500/20 text-amber-500 font-serif font-black text-xl">
                            {char.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Titles & Era */}
                    <div className="space-y-1 flex-1 min-w-0">
                      
                      {/* Testament & Role Badge */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isOldTestament
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {getRoleIcon(char.role, char.testament)}
                          <span>{char.role}</span>
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] group-hover:text-amber-500 transition-colors truncate">
                        {char.name}
                      </h3>

                      {/* Original Name */}
                      {char.original_name && (
                        <p className="text-xs text-[var(--text-muted)] italic font-serif truncate" title={char.original_name}>
                          {char.original_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Era Badge */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-main)] px-3 py-1.5 rounded-xl border border-[var(--border-card)]">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="truncate">{char.era}</span>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed font-serif">
                    {char.short_description || (char.biography ? char.biography.replace(/<[^>]+>/g, '').substring(0, 140) : '')}
                  </p>

                  {/* Scripture Mention Preview */}
                  {topScripture && (
                    <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <BookOpen className="w-3 h-3" />
                        <span>Trích đoạn: {topScripture.reference}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] italic line-clamp-2">
                        &ldquo;{topScripture.text}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Core Virtues Chips */}
                  {char.virtues && char.virtues.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {char.virtues.slice(0, 2).map((virtue, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-card)]">
                          ★ {virtue}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* Bottom Action Link */}
                <div className="pt-4 mt-5 border-t border-[var(--border-card)] flex items-center justify-between text-xs font-bold text-amber-500 group-hover:text-amber-400 transition-colors">
                  <span>Khám Phá Hồ Sơ Wiki</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      ) : (

        /* ── View Mode 2: Chronological Timeline ── */
        <div className="relative border-l-2 border-amber-500/40 ml-4 sm:ml-12 md:ml-20 space-y-10 py-6">
          {filteredCharacters.map((char, index) => {
            const isOldTestament = char.testament === 'cuu-uoc';

            return (
              <div key={char.id} className="relative pl-6 sm:pl-10 group">
                
                {/* Glowing Milestone Marker */}
                <div className="absolute -left-[17px] top-4 w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 border-amber-500 flex items-center justify-center text-amber-500 shadow-md group-hover:scale-125 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <span className="text-xs font-black">{index + 1}</span>
                </div>

                {/* Timeline Card */}
                <Link
                  href={`/nhan-vat/${char.slug}`}
                  className="block bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-start sm:items-center gap-4">
                      
                      {/* Avatar */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden relative border border-amber-500/30 flex-shrink-0 shadow-md">
                        {char.avatar_url ? (
                          <Image 
                            src={char.avatar_url} 
                            alt={char.name} 
                            fill 
                            className="object-cover" 
                            sizes="64px" 
                            unoptimized={char.avatar_url.includes('googleusercontent.com')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-500/20 text-amber-500 font-serif font-bold">
                            {char.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Header Info */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isOldTestament
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {char.role}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-sans">
                            {char.era}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] group-hover:text-amber-500 transition-colors">
                          {char.name}
                        </h3>

                        {char.original_name && (
                          <p className="text-xs text-[var(--text-muted)] italic font-serif">
                            {char.original_name} — <span className="opacity-80">{char.meaning}</span>
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Arrow Button */}
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 self-end md:self-center">
                      <span>Xem Hồ Sơ</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>

                  {/* Summary Text */}
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-4 leading-relaxed font-serif">
                    {char.short_description}
                  </p>

                  {/* Theology Lesson Highlight */}
                  {char.theology && (
                    <div className="mt-4 pt-3 border-t border-[var(--border-card)] text-xs text-[var(--text-main)] italic flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="line-clamp-1">{char.theology}</span>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

      )}

    </div>
  );
}
