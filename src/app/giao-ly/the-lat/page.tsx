import React from 'react';
import Link from 'next/link';
import { fetchCatechismParagraphs } from '@/lib/api';
import CatechismFlashcardClient from '@/components/CatechismFlashcardClient';
import { ChevronLeft, Sparkles, BookOpen, Trophy, Award, RotateCw } from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Trung Tâm Thẻ Lật Ghi Nhớ Giáo Lý | VERIDU',
  description: 'Học và ôn tập các tín điều, mầu nhiệm và giáo huấn cốt lõi của Hội Thánh Công Giáo qua hệ thống Thẻ Lật Flashcard 3D thông minh tích lũy điểm kinh nghiệm Faith XP.'
};

export default async function CatechismFlashcardsPage() {
  // Fetch all in-brief and representative paragraphs for flashcard decks
  const { data: allParagraphs } = await fetchCatechismParagraphs(undefined, undefined, undefined, 1000, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* Top Breadcrumb */}
      <div className="w-full border-b border-[var(--border-card)] bg-[var(--bg-card)]/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/giao-ly"
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trở về Trang Chủ Giáo Lý</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-serif">
            <span className="text-[var(--text-muted)]">Phân Hệ Học Tập › </span>
            <strong className="text-amber-500">Thẻ Lật Ghi Nhớ Tín Lý</strong>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-serif font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>HỌC &amp; GHI NHỚ TÍN LÝ HỘI THÁNH CÔNG GIÁO</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)]">
          Bộ Thẻ Lật Giáo Lý (Flashcards)
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          Phương pháp học nhanh, ghi nhớ sâu các chân lý đức tin, 7 bí tích, 10 điều răn và kinh nguyện thông qua cơ chế lật thẻ 3D và tích lũy điểm thưởng Faith XP.
        </p>
      </div>

      {/* Interactive Client Component */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-4">
        <CatechismFlashcardClient allParagraphs={allParagraphs} />
      </div>

    </div>
  );
}
