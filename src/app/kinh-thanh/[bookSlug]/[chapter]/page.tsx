import React from 'react';
import type { Metadata } from 'next';
import BibleReader from '@/components/BibleReader';
import { fetchBibleChapter, fetchBibleMetadata } from '@/lib/api';
import { getCanonicalBookSlug, CANONICAL_BIBLE_BOOKS } from '@/lib/bibleData';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';

export const revalidate = 86400; // 24 hours Edge CDN cache for Holy Scripture

export async function generateStaticParams() {
  const params: { bookSlug: string; chapter: string }[] = [];

  // Popular high-traffic chapters to pre-render at build time
  const popularChapters: Record<string, string[]> = {
    'sang-the': ['2', '3'],
    'xuat-hanh': ['2', '20'],
    'thanh-vinh': ['23', '91', '119'],
    'mat-theu': ['5', '6', '7', '28'],
    'mac-co': ['16'],
    'lu-ca': ['2', '15', '24'],
    'gio-an': ['3', '14', '15', '20'],
    'cong-vu-tong-do': ['2'],
    'ro-ma': ['8', '12'],
    '1-co-rin-to': ['13'],
    'khai-huyen': ['21', '22'],
  };

  for (const book of CANONICAL_BIBLE_BOOKS) {
    // Pre-render Chapter 1 for all 73 canonical books
    params.push({ bookSlug: book.code, chapter: '1' });

    // Pre-render selected foundational theological chapters
    const extras = popularChapters[book.code];
    if (extras) {
      for (const ch of extras) {
        params.push({ bookSlug: book.code, chapter: ch });
      }
    }
  }

  return params;
}

interface PageProps {
  params: Promise<{
    bookSlug: string;
    chapter: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawBookSlug = resolvedParams.bookSlug || 'sang-the';
  const canonicalBookSlug = getCanonicalBookSlug(rawBookSlug) || rawBookSlug;
  const chapterStr = resolvedParams.chapter || '1';
  const chapterNumber = parseInt(chapterStr, 10) || 1;

  const metadata = await fetchBibleMetadata();
  const book = metadata.books.find(b => b.slug.toLowerCase() === canonicalBookSlug.toLowerCase()) || { nameVi: 'Kinh Thánh' };
  
  const title = `Sách ${book.nameVi} — Chương ${chapterNumber} | Kinh Thánh VERIDU`;
  const description = `Đọc, nghiên cứu và suy niệm Sách ${book.nameVi} Chương ${chapterNumber} trọn bộ 73 Sách Cựu Ước & Tân Ước với bản dịch chuẩn xác, hệ thống chú giải phụng vụ và đối chiếu Lời Chúa trên VERIDU.`;
  const pageUrl = `https://www.thapgia.com/kinh-thanh/${canonicalBookSlug}/${chapterNumber}?t=ntt`;

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
          url: `https://www.thapgia.com/api/og?title=${encodeURIComponent(`Sách ${book.nameVi} — Chương ${chapterNumber}`)}&category=${encodeURIComponent('Kinh Thánh Trọn Bộ')}&author=${encodeURIComponent('Lời Chúa Hằng Ngày')}`,
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
  
  const rawBookSlug = resolvedParams.bookSlug || 'sang-the';
  const canonicalBookSlug = getCanonicalBookSlug(rawBookSlug) || rawBookSlug;
  const chapterStr = resolvedParams.chapter || '1';
  const chapterNumber = parseInt(chapterStr, 10) || 1;
  const translationSlug = (resolvedSearchParams.t as string) || 'ntt';

  // If the book slug is an abbreviation/alias (e.g. 1-sm, sm, st) or translation query ?t= is missing,
  // 301 redirect to canonical slug with ?t=ntt
  if (canonicalBookSlug !== rawBookSlug || !resolvedSearchParams.t) {
    redirect(`/kinh-thanh/${canonicalBookSlug}/${chapterNumber}?t=${translationSlug}`);
  }

  const [metadata, data] = await Promise.all([
    fetchBibleMetadata(),
    fetchBibleChapter(translationSlug, canonicalBookSlug, chapterNumber)
  ]);

  const currentBook = metadata.books.find(b => b.slug.toLowerCase() === canonicalBookSlug.toLowerCase());
  const bookNameVi = currentBook ? currentBook.nameVi : 'Kinh Thánh';
  const pageUrl = `https://www.thapgia.com/kinh-thanh/${canonicalBookSlug}/${chapterNumber}?t=${translationSlug}`;

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
            "item": `https://www.thapgia.com/kinh-thanh/${canonicalBookSlug}/1?t=${translationSlug}`
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
            initialBookSlug={canonicalBookSlug}
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

      {/* Cổng chia sẻ & Tạo thẻ ảnh Lời Chúa */}
      <ShareButtons
        url={pageUrl}
        title={`Sách ${bookNameVi} - Chương ${chapterNumber}`}
        quote={data?.verses?.[0]?.content ? `„${data.verses[0].content}”` : `Sách ${bookNameVi}, Chương ${chapterNumber}`}
        category="Thánh Kinh Trọn Bộ"
        author={`Bản dịch ${translationSlug.toUpperCase()}`}
      />
    </div>
  );
}
