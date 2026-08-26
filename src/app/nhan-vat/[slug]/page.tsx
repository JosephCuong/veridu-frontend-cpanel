import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCharacterBySlug, fetchCharacters } from '@/lib/api';
import { formatImageUrl } from '@/lib/htmlProcessor';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Crown, 
  Heart, 
  Cross, 
  Scroll, 
  Target, 
  Users, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  Compass,
  Award,
  ListOrdered
} from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const character = await fetchCharacterBySlug(resolvedParams.slug);

  if (!character) {
    return { title: 'Không tìm thấy nhân vật | VERIDU' };
  }

  const title = `${character.name} — Tiểu Sử & Ý Nghĩa Thần Học | VERIDU`;
  const description = character.short_description || `Khám phá cuộc đời, vai trò và ý nghĩa thần học của ${character.name} trong Kinh Thánh.`;
  const image = character.avatar_url || character.cover_image || 'https://www.thapgia.com/images/veridu_logo_dark.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: 'article',
    }
  };
}

// Generate static params for all seeded characters
export async function generateStaticParams() {
  const characters = await fetchCharacters();
  return characters.map(c => ({ slug: c.slug }));
}

export default async function CharacterDetailPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const character = await fetchCharacterBySlug(resolvedParams.slug);

  if (!character) {
    notFound();
  }

  const isOldTestament = character.testament === 'cuu-uoc';
  const allCharacters = await fetchCharacters();
  
  // Find neighboring and related characters for quick navigation
  const currentIndex = allCharacters.findIndex(c => c.slug === character.slug);
  const prevCharacter = currentIndex > 0 ? allCharacters[currentIndex - 1] : null;
  const nextCharacter = currentIndex >= 0 && currentIndex < allCharacters.length - 1 ? allCharacters[currentIndex + 1] : null;

  // Filter 4-5 related characters (same era or testament)
  const relatedCharacters = allCharacters
    .filter(c => c.slug !== character.slug && (c.era === character.era || c.testament === character.testament))
    .slice(0, 5);

  const avatarOptimized = formatImageUrl(character.avatar_url, 'avatar');
  const coverOptimized = formatImageUrl(character.cover_image, 'cover');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 flex flex-col font-sans pt-16 sm:pt-20 pb-24">
      
      {/* ── Top Single-Button Back Navigation (Clean & Minimalist) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 w-full flex items-center justify-between">
        <Link
          href="/nhan-vat"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] hover:bg-amber-500/15 border border-[var(--border-card)] hover:border-amber-500/40 text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
          <span>Trở về Danh mục Nhân vật</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-serif hidden sm:flex">
          <span>Khảo Cứu Nhân Vật Thánh Kinh</span>
          <span>•</span>
          <span className="text-amber-500 font-bold">{isOldTestament ? 'Cựu Ước' : 'Tân Ước'}</span>
        </div>
      </div>

      {/* ── 1. SACRED HERO ART CANVAS (BÌA NỀN NGHỆ THUẬT HOÀNH TRÁNG) ── */}
      <section className="relative overflow-hidden min-h-[380px] sm:min-h-[440px] flex items-end justify-start border-y border-amber-500/30 shadow-2xl bg-stone-950">
        
        {/* Cover Background Image with Pure 65% Visibility & Warm Liturgical Lighting */}
        {coverOptimized ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={coverOptimized}
              alt={`${character.name} Cover Artwork`}
              fill
              className="object-cover object-center opacity-70 scale-105 transition-transform duration-1000 ease-out"
              priority
              sizes="100vw"
            />
            {/* Smooth Liturgical Vignette Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)]/90 via-transparent to-[var(--bg-main)]/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-800 to-amber-950 opacity-90" />
        )}

        {/* Ambient Stained-Glass Sacred Glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Superimposed Header Typography Overlay */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 space-y-4">
          
          {/* Testament & Role Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
              {isOldTestament ? <Scroll className="w-3.5 h-3.5 text-amber-400" /> : <Cross className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isOldTestament ? 'Cựu Ước' : 'Tân Ước'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/20 text-stone-200 text-xs font-serif font-bold uppercase tracking-wider backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{character.role}</span>
            </span>

            {character.feast_day && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-200 text-xs font-serif font-bold uppercase tracking-wider backdrop-blur-md">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Lễ Kính: {character.feast_day}</span>
              </span>
            )}
          </div>

          {/* Main Name Heading */}
          <h1 className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-none drop-shadow-lg">
            {character.name}
          </h1>

          {/* Original Hebrew/Greek Name & Meaning */}
          {(character.original_name || character.meaning) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm sm:text-base">
              {character.original_name && (
                <span className="font-serif italic text-amber-300 font-bold tracking-wide drop-shadow">
                  {character.original_name}
                </span>
              )}
              {character.original_name && character.meaning && <span className="text-white/40">•</span>}
              {character.meaning && (
                <span className="text-stone-300 font-sans text-xs sm:text-sm">
                  <strong className="text-amber-200/90 font-serif">Ý nghĩa:</strong> {character.meaning}
                </span>
              )}
            </div>
          )}

          {/* Short Bio Quote Box */}
          {character.short_description && (
            <div className="pt-2 max-w-3xl">
              <p className="font-serif italic text-sm sm:text-base text-stone-200/95 leading-relaxed bg-black/40 border-l-4 border-amber-400 backdrop-blur-md p-3.5 rounded-r-2xl shadow-lg">
                &ldquo;{character.short_description}&rdquo;
              </p>
            </div>
          )}

        </div>

      </section>

      {/* ── 2. MAIN 3-COLUMN ENCYCLOPEDIC WIKI ARCHITECTURE ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================
              LEFT COLUMN (3/12): STICKY TOC & RELATED CHARACTERS
          ======================================================== */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 order-2 lg:order-1">
            
            {/* Table of Contents Box */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-3 text-amber-600 dark:text-amber-400 font-serif font-bold text-xs uppercase tracking-wider">
                <ListOrdered className="w-4 h-4 text-amber-500" />
                <span>Mục Lục Khảo Cứu</span>
              </div>

              <nav className="space-y-1.5 text-xs font-serif font-semibold">
                <a href="#tong-quan" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>1. Hồ Sơ Tổng Quan</span>
                </a>
                <a href="#tieu-su" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>2. Hành Trình &amp; Tiểu Sử</span>
                </a>
                {character.scriptures && character.scriptures.length > 0 && (
                  <a href="#kinh-thanh" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>3. Trích Đoạn Kinh Thánh</span>
                  </a>
                )}
                {character.theology && (
                  <a href="#than-hoc" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>4. Ý Nghĩa Thần Học</span>
                  </a>
                )}
                {character.relationships && character.relationships.length > 0 && (
                  <a href="#tuong-quan" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>5. Thân Cận &amp; Gia Phả</span>
                  </a>
                )}
              </nav>
            </div>

            {/* Related Figures in Same Era */}
            {relatedCharacters.length > 0 && (
              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-3 text-[var(--text-main)] font-serif font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Nhân Vật Cùng Thời Kỳ</span>
                </div>

                <div className="space-y-2.5">
                  {relatedCharacters.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/nhan-vat/${rel.slug}`}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-amber-500/10 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-amber-500/10 border border-amber-500/30 flex-shrink-0 shadow-sm">
                        {rel.avatar_url ? (
                          <Image
                            src={formatImageUrl(rel.avatar_url, 'avatar')}
                            alt={rel.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif font-bold text-xs text-amber-500">
                            {rel.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-500 truncate transition-colors">
                          {rel.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate font-sans">
                          {rel.role}
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>

          {/* ========================================================
              CENTER COLUMN (6/12): MAIN EDITORIAL ARTICLE CONTENT
          ======================================================== */}
          <main className="lg:col-span-6 space-y-12 order-3 lg:order-2">
            
            {/* 1. Fast Facts Overview Section */}
            <section id="tong-quan" className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 shadow-xl space-y-6 scroll-mt-28">
              <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-4">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h2 className="font-serif font-bold text-xl text-[var(--text-main)]">Hồ Sơ Tổng Quan (Fast Facts)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Thời Kỳ Lịch Sử
                  </span>
                  <p className="font-serif font-bold text-base text-[var(--text-main)]">{character.era || 'Thời Cựu Ước'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-500" /> Vai Trò Cốt Lõi
                  </span>
                  <p className="font-serif font-bold text-base text-[var(--text-main)]">{character.role}</p>
                </div>

                {character.virtues && character.virtues.length > 0 && (
                  <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[var(--border-card)]">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" /> Các Nhân Đức Nổi Bật
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {character.virtues.map((v, i) => (
                        <span key={i} className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          ★ {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Detailed Biography & Faith Journey */}
            <section id="tieu-su" className="space-y-6 scroll-mt-28">
              <div className="border-b border-amber-500/20 pb-3 flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-500" />
                <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Hành Trình Cuộc Đời &amp; Tiểu Sử</h2>
              </div>

              <div 
                className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed font-serif text-[var(--text-main)] space-y-5"
                dangerouslySetInnerHTML={{ __html: character.biography || '<p>Chưa có nội dung tiểu sử chi tiết.</p>' }}
              />
            </section>

            {/* 3. Scripture Treasury with Interactive Direct Bible Links */}
            {character.scriptures && character.scriptures.length > 0 && (
              <section id="kinh-thanh" className="space-y-6 scroll-mt-28">
                <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Kho Tàng Trích Đoạn Kinh Thánh</h2>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] font-serif">
                    {character.scriptures.length} trích đoạn trọng tâm
                  </span>
                </div>

                <div className="space-y-5">
                  {character.scriptures.map((sc, index) => {
                    const bibleReaderUrl = `/doc-kinh-thanh/${sc.book_slug}/${sc.chapter}`;

                    return (
                      <div 
                        key={index}
                        className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm transition-all hover:shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-card)] pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-sans font-bold text-xs uppercase tracking-wider border border-amber-500/30">
                              {sc.reference}
                            </span>
                            {sc.note && (
                              <span className="font-serif font-bold text-sm text-[var(--text-main)]">
                                {sc.note}
                              </span>
                            )}
                          </div>

                          <Link
                            href={bibleReaderUrl}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline self-start sm:self-auto transition"
                            title={`Mở chương ${sc.chapter} trong Trình Đọc Kinh Thánh VERIDU`}
                          >
                            <span>Đọc toàn văn Kinh Thánh</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <blockquote className="font-serif text-base sm:text-lg text-[var(--text-main)] italic leading-relaxed pl-4 border-l-4 border-amber-500 bg-amber-500/5 p-4 rounded-r-2xl">
                          &ldquo;{sc.text}&rdquo;
                        </blockquote>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. Theological Significance & Christological Typology */}
            {character.theology && (
              <section id="than-hoc" className="bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-amber-500/5 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-10 space-y-4 shadow-xl scroll-mt-28">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Target className="w-6 h-6 text-amber-500" />
                  <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Ý Nghĩa Thần Học &amp; Bài Học Tâm Linh</h2>
                </div>

                <p className="font-serif text-base sm:text-lg text-[var(--text-main)] leading-relaxed italic">
                  {character.theology}
                </p>
              </section>
            )}

            {/* 5. Relationships & Biblical Genealogy */}
            {character.relationships && character.relationships.length > 0 && (
              <section id="tuong-quan" className="space-y-6 scroll-mt-28">
                <div className="border-b border-amber-500/20 pb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Nhân Vật Thân Cận &amp; Gia Phả</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {character.relationships.map((rel, i) => (
                    <div 
                      key={i}
                      className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-sm hover:border-amber-500/40 transition"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-serif font-bold text-base text-[var(--text-main)] truncate">
                          {rel.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] font-sans">
                          {rel.role}
                        </p>
                      </div>

                      {rel.slug && (
                        <Link
                          href={`/nhan-vat/${rel.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs flex-shrink-0 transition"
                        >
                          Hồ Sơ →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Next/Previous Character Navigation Bar */}
            <nav className="pt-8 border-t border-[var(--border-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
              {prevCharacter ? (
                <Link
                  href={`/nhan-vat/${prevCharacter.slug}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-left w-full sm:w-auto transition group"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Nhân vật trước</span>
                    <span className="font-serif font-bold text-sm text-[var(--text-main)]">{prevCharacter.name}</span>
                  </div>
                </Link>
              ) : <div />}

              <Link
                href="/nhan-vat"
                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs uppercase tracking-wider transition shadow-md"
              >
                Danh Sách 60 Nhân Vật
              </Link>

              {nextCharacter ? (
                <Link
                  href={`/nhan-vat/${nextCharacter.slug}`}
                  className="flex items-center justify-end gap-3 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-right w-full sm:w-auto transition group"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Nhân vật tiếp theo</span>
                    <span className="font-serif font-bold text-sm text-[var(--text-main)]">{nextCharacter.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : <div />}
            </nav>

          </main>

          {/* ========================================================
              RIGHT COLUMN (3/12): SACRED CATHOLIC INFOBOX (WIKI CARD)
          ======================================================== */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 order-1 lg:order-3">
            
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl space-y-5">
              
              {/* Infobox Header: Portrait Avatar with Halo Ring */}
              <div className="space-y-3 text-center">
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden relative border-2 border-amber-500/40 shadow-xl bg-stone-950 p-1">
                  <div className="w-full h-full rounded-xl overflow-hidden relative">
                    {avatarOptimized ? (
                      <Image
                        src={avatarOptimized}
                        alt={character.name}
                        fill
                        className="object-cover object-top"
                        priority
                        sizes="(max-width: 1024px) 100vw, 300px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif font-bold text-5xl text-amber-400 bg-stone-900">
                        {character.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">{character.name}</h3>
                  {character.original_name && (
                    <p className="font-serif text-xs italic text-amber-500">{character.original_name}</p>
                  )}
                </div>
              </div>

              {/* Infobox Key-Value Table */}
              <div className="border-t border-[var(--border-card)] pt-3 space-y-3 text-xs">
                
                <div className="flex justify-between items-start gap-2 border-b border-[var(--border-card)]/50 pb-2">
                  <span className="text-[var(--text-muted)] font-serif">Giao Ước:</span>
                  <span className="font-bold text-[var(--text-main)] text-right">
                    {isOldTestament ? 'Cựu Ước' : 'Tân Ước'}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 border-b border-[var(--border-card)]/50 pb-2">
                  <span className="text-[var(--text-muted)] font-serif">Thời Đại:</span>
                  <span className="font-bold text-[var(--text-main)] text-right">
                    {character.era || 'Thời Cựu Ước'}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2 border-b border-[var(--border-card)]/50 pb-2">
                  <span className="text-[var(--text-muted)] font-serif">Vai Trò:</span>
                  <span className="font-bold text-[var(--text-main)] text-right">
                    {character.role}
                  </span>
                </div>

                {character.meaning && (
                  <div className="flex justify-between items-start gap-2 border-b border-[var(--border-card)]/50 pb-2">
                    <span className="text-[var(--text-muted)] font-serif">Ý Nghĩa:</span>
                    <span className="font-bold text-[var(--text-main)] text-right italic">
                      {character.meaning}
                    </span>
                  </div>
                )}

                {character.feast_day && (
                  <div className="flex justify-between items-start gap-2 border-b border-[var(--border-card)]/50 pb-2">
                    <span className="text-[var(--text-muted)] font-serif">Lễ Kính:</span>
                    <span className="font-bold text-rose-500 text-right">
                      {character.feast_day}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Interactive Actions */}
              <div className="pt-2 border-t border-[var(--border-card)] space-y-2">
                <Link
                  href="/kinh-thanh"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-serif font-bold flex items-center justify-center gap-2 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc Kinh Thánh 73 Sách</span>
                </Link>

                <Link
                  href="/ban-do"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-serif font-bold flex items-center justify-center gap-2 transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Bản Đồ Thánh Địa 3D</span>
                </Link>

                <Link
                  href="/quiz"
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-serif font-bold flex items-center justify-center gap-2 transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Đấu Trường Quiz Đức Tin</span>
                </Link>
              </div>

            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
