import React from 'react';

import BibleReader from '@/components/BibleReader';
import { fetchBibleChapter, fetchBibleMetadata } from '@/lib/api';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    bookSlug: string;
    chapter: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function KinhThanhPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const bookSlug = resolvedParams.bookSlug || 'sang-the';
  const chapterStr = resolvedParams.chapter || '1';
  const chapterNumber = parseInt(chapterStr, 10) || 1;
  const translationSlug = (resolvedSearchParams.t as string) || 'ntt';

  const [metadata, data] = await Promise.all([
    fetchBibleMetadata(),
    fetchBibleChapter(translationSlug, bookSlug, chapterNumber)
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-20 md:pt-28">
      <main className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6 flex-1 w-full">
        {metadata.books && metadata.books.length > 0 ? (
          <BibleReader
            initialBookSlug={bookSlug}
            initialChapter={chapterNumber}
            initialTranslation={translationSlug}
            books={metadata.books}
            translations={metadata.translations}
            verses={data?.verses || []}
            commentary={data?.commentary || null}
          />
        ) : (
          <div className="text-center py-20 text-[var(--text-muted)]">
            <p className="font-serif text-lg mb-4">Hệ thống chưa có dữ liệu cấu hình Kinh Thánh.</p>
            <Link href="/" className="px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition">
              Quay Lại Trang Chủ
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
