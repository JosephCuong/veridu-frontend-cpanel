import React from 'react';
import type { Metadata } from 'next';
import BibleReader from '@/components/BibleReader';
import { fetchBibleChapter, fetchBibleMetadata } from '@/lib/api';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours Edge CDN cache for Holy Scripture

interface PageProps {
  params: Promise<{
    bookSlug: string;
    chapter: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const bookSlug = resolvedParams.bookSlug || 'st';
  const chapterStr = resolvedParams.chapter || '1';
  const chapterNumber = parseInt(chapterStr, 10) || 1;

  const metadata = await fetchBibleMetadata();
  const book = metadata.books.find(b => b.slug.toLowerCase() === bookSlug.toLowerCase()) || { nameVi: 'Kinh Thánh' };
  
  const title = `Sách ${book.nameVi} — Chương ${chapterNumber} | Kinh Thánh VERIDU`;
  const description = `Đọc, nghiên cứu và suy niệm Sách ${book.nameVi} Chương ${chapterNumber} trọn bộ 73 Sách Cựu Ước & Tân Ước với bản dịch chuẩn xác, hệ thống chú giải phụng vụ và đối chiếu Lời Chúa trên VERIDU.`;
  const pageUrl = `https://www.thapgia.com/kinh-thanh/${bookSlug}/${chapterNumber}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'VERIDU',
      type: 'article',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: `Kinh Thánh - Sách ${book.nameVi}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
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

  const currentBook = metadata.books.find(b => b.slug.toLowerCase() === bookSlug.toLowerCase());
  const bookNameVi = currentBook ? currentBook.nameVi : 'Kinh Thánh';
  const pageUrl = `https://www.thapgia.com/kinh-thanh/${bookSlug}/${chapterNumber}`;

  // Structured Data (JSON-LD) for Bible Breadcrumb & Book
  const bibleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang Chủ",
            "item": "https://www.thapgia.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Kinh Thánh 73 Sách",
            "item": "https://www.thapgia.com/kinh-thanh"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `Sách ${bookNameVi}`,
            "item": `https://www.thapgia.com/kinh-thanh/${bookSlug}/1`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": `Chương ${chapterNumber}`,
            "item": pageUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-20 md:pt-28">
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bibleJsonLd) }}
      />

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
