import React from 'react';
import { Metadata } from 'next';
import { fetchCharacters } from '@/lib/api';
import CharacterExplorer from '@/components/CharacterExplorer';
import { Sparkles, Scroll, BookOpen, Crown } from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour with ISR

export const metadata: Metadata = {
  title: 'Nhân Vật Kinh Thánh | Thư Viện Wiki VERIDU',
  description: 'Khám phá tiểu sử, niên biểu lịch sử, ý nghĩa thần học và các trích đoạn Kinh Thánh của các nhân vật then chốt trong Lịch sử Cứu Độ.',
  openGraph: {
    title: 'Nhân Vật Kinh Thánh | VERIDU',
    description: 'Bản đồ nhân vật và bách khoa toàn thư đức tin Công giáo về các nhân vật Cựu Ước và Tân Ước.',
  }
};

export default async function CharactersPage() {
  const characters = await fetchCharacters();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 flex flex-col font-sans pt-24 sm:pt-28 md:pt-32 pb-20">
      
      {/* ── Top Hero Header Section ── */}
      <section className="relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-card)]/50 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
        
        {/* Subtle Stained-Glass Ambient Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto text-center space-y-5">
          
          {/* Catholic Liturgical Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Kho Tàng Lịch Sử Cứu Độ (Heilsgeschichte)</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Nhân Vật Kinh Thánh
          </h1>

          {/* Subtitle */}
          <p className="font-serif text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed italic">
            &ldquo;Khám phá hành trình đức tin, tiểu sử lịch sử và ý nghĩa thần học sâu sắc của các Tổ phụ, Ngôn sứ, Vua và các Thánh Tông đồ.&rdquo;
          </p>

          {/* Quick Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Scroll className="w-3.5 h-3.5 text-amber-500" />
              <span>Cựu Ước &amp; Tân Ước</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Trích dẫn Kinh Thánh Phụng Vụ</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Crown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hồ Sơ Wiki Toàn Diện</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Main Interactive Directory Container ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <CharacterExplorer initialCharacters={characters} />
      </main>

    </div>
  );
}
