import React from 'react';
import Link from 'next/link';
import { fetchCatechismParagraphs, fetchCatechismEntries, CatechismParagraph } from '@/lib/api';
import CatechismFlashcardClient from '@/components/CatechismFlashcardClient';
import { ChevronLeft, Scroll, BookOpen, Trophy, Award, RotateCw } from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Trung Tâm Thẻ Lật Ghi Nhớ Giáo Lý | VERIDU',
  description: 'Học và ôn tập các tín điều, mầu nhiệm và giáo huấn cốt lõi của Hội Thánh Công Giáo qua hệ thống Thẻ Lật Flashcard 3D thông minh tích lũy điểm kinh nghiệm Faith XP.'
};

export default async function CatechismFlashcardsPage() {
  // Fetch full paragraph range across all 5 parts + curated Catechism entries
  const [{ data: rawParagraphs }, entries] = await Promise.all([
    fetchCatechismParagraphs(undefined, undefined, undefined, 3000, 0),
    fetchCatechismEntries()
  ]);

  // Filter to paragraphs with substantive content (In-Brief, Prologue, or every 8th paragraph)
  const validParagraphCards: CatechismParagraph[] = (rawParagraphs || [])
    .filter(p => {
      const hasBody = Boolean(p.plain_text && p.plain_text.trim().length > 15);
      if (!hasBody) return false;
      return p.is_in_brief || p.part_number === 0 || (p.paragraph_number && p.paragraph_number % 8 === 0);
    })
    .map(p => ({
      id: p.id,
      section_identifier: p.section_identifier,
      paragraph_number: p.paragraph_number,
      paragraph_str: p.paragraph_str,
      title: p.title || `Số ${p.paragraph_number}`,
      part_number: p.part_number,
      part_title: p.part_title,
      section_title: p.section_title,
      chapter_title: p.chapter_title,
      article_title: p.article_title,
      full_path: p.full_path,
      is_in_brief: p.is_in_brief,
      content_html: p.content_html,
      plain_text: (p.plain_text || '').slice(0, 220)
    }));

  // Supplement with curated Catechism Entries (especially for Part I where full paragraphs are pending)
  const entryCards: CatechismParagraph[] = (entries || []).map((e, idx) => ({
    id: 90000 + (e.id || idx),
    section_identifier: e.ccc_number_range || `CCC ${e.paragraph_start}-${e.paragraph_end}`,
    paragraph_number: e.paragraph_start,
    paragraph_str: e.ccc_number_range || `${e.paragraph_start}-${e.paragraph_end}`,
    title: e.ccc_number_range || `CCC ${e.paragraph_start}`,
    part_number: e.part_number,
    part_title: e.part_title,
    section_title: e.section_title,
    chapter_title: e.chapter_title,
    article_title: e.title,
    full_path: e.question ? `${e.title} — ${e.question}` : `${e.part_title} › ${e.title}`,
    is_in_brief: true,
    content_html: e.content_html || `<p>${e.summary || ''}</p>`,
    plain_text: e.summary || e.title
  }));

  const allParagraphs = [...entryCards, ...validParagraphCards];

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
          <Scroll className="w-3.5 h-3.5 text-amber-400" />
          <span>HỌC &amp; GHI NHỚ TÍN LÝ HỘI THÁNH CÔNG GIÁO</span>
          <Scroll className="w-3.5 h-3.5 text-amber-400" />
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
