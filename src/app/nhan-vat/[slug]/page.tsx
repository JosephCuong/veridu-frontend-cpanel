import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCharacterBySlug, fetchCharacters } from '@/lib/api';
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
  Share2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star
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
  
  // Find neighboring characters for previous/next navigation
  const currentIndex = allCharacters.findIndex(c => c.slug === character.slug);
  const prevCharacter = currentIndex > 0 ? allCharacters[currentIndex - 1] : null;
  const nextCharacter = currentIndex >= 0 && currentIndex < allCharacters.length - 1 ? allCharacters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 flex flex-col font-sans pt-20 sm:pt-24 pb-20">
      
      {/* ── Top Breadcrumb & Navigation Bar ── */}
      <div className="border-b border-[var(--border-card)] bg-[var(--bg-card)]/50 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <nav className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] overflow-x-auto scrollbar-none">
            <Link href="/" className="hover:text-amber-500 transition">Trang Chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
            <Link href="/nhan-vat" className="hover:text-amber-500 transition">Nhân Vật Kinh Thánh</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
            <span className="text-[var(--text-main)] font-bold truncate">{character.name}</span>
          </nav>

          <Link
            href="/nhan-vat"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] hover:text-amber-500 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Danh mục nhân vật</span>
          </Link>

        </div>
      </div>

      {/* ── Hero Banner & Character Profile Header ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-amber-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/30">
        
        {/* Sacred Cover Background Artwork */}
        {character.cover_image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={character.cover_image}
              alt={`${character.name} Background`}
              fill
              className="object-cover opacity-20 filter blur-[2px] scale-105"
              priority
              unoptimized={character.cover_image.includes('googleusercontent.com')}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/90 to-amber-950/95" />
          </div>
        )}

        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-10">
            
            {/* Sacred Art Portrait with Halo */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl p-1.5 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 shadow-2xl relative">
                <div className="w-full h-full rounded-[22px] overflow-hidden relative bg-stone-950">
                  {character.avatar_url ? (
                    <Image
                      src={character.avatar_url}
                      alt={character.name}
                      fill
                      className="object-cover"
                      priority
                      unoptimized={character.avatar_url.includes('googleusercontent.com')}
                      sizes="(max-width: 768px) 192px, 224px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif font-black text-4xl text-amber-400">
                      {character.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Halo Glow Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-sans font-black text-[10px] uppercase tracking-wider shadow-lg whitespace-nowrap">
                {isOldTestament ? 'Cựu Ước' : 'Tân Ước'}
              </div>
            </div>

            {/* Profile Bio Header Info */}
            <div className="space-y-4 text-center md:text-left flex-1">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{character.role}</span>
                </span>

                {character.feast_day && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lễ Kính: {character.feast_day}</span>
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                {character.name}
              </h1>

              {/* Original Name & Meaning */}
              {character.original_name && (
                <div className="space-y-1">
                  <div className="font-serif text-lg sm:text-xl text-amber-300/90 italic">
                    {character.original_name}
                  </div>
                  {character.meaning && (
                    <p className="text-xs sm:text-sm text-stone-300 font-sans">
                      <strong className="text-amber-200">Ý nghĩa danh xưng:</strong> {character.meaning}
                    </p>
                  )}
                </div>
              )}

              {/* Short Summary Description */}
              {character.short_description && (
                <p className="font-serif text-sm sm:text-base text-stone-200/90 leading-relaxed italic max-w-2xl">
                  &ldquo;{character.short_description}&rdquo;
                </p>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* ── Main Content Body ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        
        {/* ── Section 1: Fast Fact Infobox Grid ── */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/25 shadow-xl space-y-6">
          
          <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-4">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold text-xl text-[var(--text-main)]">Hồ Sơ Tổng Quan (Fast Facts)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            
            {/* Fact 1: Era */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" /> Thời Kỳ Lịch Sử
              </span>
              <p className="font-serif font-bold text-base text-[var(--text-main)]">{character.era}</p>
            </div>

            {/* Fact 2: Role */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> Vai Trò Cốt Lõi
              </span>
              <p className="font-serif font-bold text-base text-[var(--text-main)]">{character.role}</p>
            </div>

            {/* Fact 3: Feast Day */}
            {character.feast_day && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Ngày Lễ Kính
                </span>
                <p className="font-serif font-bold text-base text-[var(--text-main)]">{character.feast_day}</p>
              </div>
            )}

            {/* Fact 4: Virtues */}
            {character.virtues && character.virtues.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3 space-y-2 pt-2 border-t border-[var(--border-card)]">
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

        {/* ── Section 2: Detailed Biography (Tiểu Sử & Hành Trình Đức Tin) ── */}
        <section className="space-y-6">
          <div className="border-b border-amber-500/20 pb-3 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Hành Trình Cuộc Đời &amp; Tiểu Sử</h2>
          </div>

          <div 
            className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed font-serif text-[var(--text-main)] space-y-5"
            dangerouslySetInnerHTML={{ __html: character.biography || '<p>Chưa có nội dung tiểu sử chi tiết.</p>' }}
          />
        </section>

        {/* ── Section 3: Scripture Treasury (Trích Dẫn Kinh Thánh Có Liên Kết Trình Đọc) ── */}
        {character.scriptures && character.scriptures.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Kho Tàng Trích Đoạn Kinh Thánh</h2>
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                {character.scriptures.length} trích đoạn then chốt
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {character.scriptures.map((sc, index) => {
                const bibleReaderUrl = `/doc-kinh-thanh/${sc.book_slug}/${sc.chapter}`;

                return (
                  <div 
                    key={index}
                    className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm transition-all hover:shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-card)] pb-3">
                      
                      {/* Reference Badge & Note */}
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-sans font-black text-xs uppercase tracking-wider border border-amber-500/30">
                          {sc.reference}
                        </span>
                        {sc.note && (
                          <span className="font-serif font-bold text-sm text-[var(--text-main)]">
                            {sc.note}
                          </span>
                        )}
                      </div>

                      {/* Smart Link to VERIDU Bible Reader */}
                      <Link
                        href={bibleReaderUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline self-start sm:self-auto transition"
                        title={`Mở chương ${sc.chapter} trong Trình Đọc Kinh Thánh VERIDU`}
                      >
                        <span>Đọc toàn văn trong Kinh Thánh</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Scripture Quote Text */}
                    <blockquote className="font-serif text-base sm:text-lg text-[var(--text-main)] italic leading-relaxed pl-4 border-l-4 border-amber-500 bg-amber-500/5 p-4 rounded-r-2xl">
                      &ldquo;{sc.text}&rdquo;
                    </blockquote>

                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Section 4: Theological Significance & Spiritual Lessons ── */}
        {character.theology && (
          <section className="bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-amber-500/5 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-10 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Target className="w-6 h-6 text-amber-500" />
              <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Ý Nghĩa Thần Học &amp; Bài Học Tâm Linh</h2>
            </div>

            <p className="font-serif text-base sm:text-lg text-[var(--text-main)] leading-relaxed italic">
              {character.theology}
            </p>
          </section>
        )}

        {/* ── Section 5: Relationships & Related Figures ── */}
        {character.relationships && character.relationships.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-amber-500/20 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">Nhân Vật Thân Cận &amp; Gia Phả</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {character.relationships.map((rel, i) => (
                <div 
                  key={i}
                  className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 flex items-center justify-between gap-3 shadow-sm hover:border-amber-500/40 transition"
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

        {/* ── Bottom Navigation & Neighboring Characters ── */}
        <section className="pt-8 border-t border-[var(--border-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {prevCharacter ? (
            <Link
              href={`/nhan-vat/${prevCharacter.slug}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-left w-full sm:w-auto transition group"
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
            className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-black text-xs uppercase tracking-widest transition shadow-lg"
          >
            Tất Cả Nhân Vật
          </Link>

          {nextCharacter ? (
            <Link
              href={`/nhan-vat/${nextCharacter.slug}`}
              className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-right w-full sm:w-auto transition group"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Nhân vật tiếp theo</span>
                <span className="font-serif font-bold text-sm text-[var(--text-main)]">{nextCharacter.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}

        </section>

      </main>

    </div>
  );
}
