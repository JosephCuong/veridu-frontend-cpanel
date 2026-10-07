import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCatechismParagraphs } from '@/lib/api';
import CatechismReaderClient from '@/components/CatechismReaderClient';
import { BookOpen, Scroll, Award } from 'lucide-react';

export const revalidate = 3600;

interface PartConfig {
  partNumber: number;
  slug: string;
  roman: string;
  title: string;
  subtitle: string;
  range: string;
  color: string;
  desc: string;
}

const PARTS_MAP: Record<string, PartConfig> = {
  'loi-mo-dau': {
    partNumber: 0,
    slug: 'loi-mo-dau',
    roman: '0',
    title: 'Lời Mở Đầu',
    subtitle: 'Đời Sống Con Người Là Nhận Biết & Yêu Mến Thiên Chúa',
    range: 'CCC 1 – 25',
    color: '#3b82f6',
    desc: 'Bản chất đức tin, mục đích của việc dạy giáo lý và bố cục Sách Giáo Lý.'
  },
  'phan-1': {
    partNumber: 1,
    slug: 'phan-1',
    roman: 'I',
    title: 'Phần I: Tuyên Xưng Đức Tin',
    subtitle: 'Kinh Tin Kính Của Các Tông Đồ',
    range: 'CCC 1 – 1065',
    color: '#f59e0b',
    desc: 'Mầu nhiệm Thiên Chúa Ba Ngôi, Sáng Tạo, Nhập Thể, Cứu Chuộc & Hội Thánh.'
  },
  'phan-2': {
    partNumber: 2,
    slug: 'phan-2',
    roman: 'II',
    title: 'Phần II: Cử Hành Mầu Nhiệm Kitô Giáo',
    subtitle: 'Phụng Vụ Thánh & Bảy Bí Tích',
    range: 'CCC 1066 – 1690',
    color: '#f43f5e',
    desc: 'Nhiệm cục Bí tích, Phụng vụ Thánh Thể, 7 Bí Tích & Lễ nghi an táng.'
  },
  'phan-3': {
    partNumber: 3,
    slug: 'phan-3',
    roman: 'III',
    title: 'Phần III: Đời Sống Trong Đức Kitô',
    subtitle: 'Luân Lý Kitô Giáo & Mười Điều Răn',
    range: 'CCC 1691 – 2557',
    color: '#10b981',
    desc: 'Phẩm giá con người, ơn gọi nên thánh, Tám Mối Phúc & Mười Điều Răn.'
  },
  'phan-4': {
    partNumber: 4,
    slug: 'phan-4',
    roman: 'IV',
    title: 'Phần IV: Kinh Nguyện Kitô Giáo',
    subtitle: 'Kinh Lạy Cha & Đời Sống Cầu Nguyện',
    range: 'CCC 2558 – 2865',
    color: '#6366f1',
    desc: 'Ý nghĩa kinh nguyện, truyền thống cầu nguyện & 7 Lời Nguyện Kinh Lạy Cha.'
  }
};

export async function generateStaticParams() {
  return [
    { part: 'loi-mo-dau' },
    { part: 'phan-1' },
    { part: 'phan-2' },
    { part: 'phan-3' },
    { part: 'phan-4' }
  ];
}

export async function generateMetadata({ params }: { params: { part: string } }): Promise<Metadata> {
  const partInfo = PARTS_MAP[params.part];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';
  if (!partInfo) return { title: 'Trình Đọc Giáo Lý | VERIDU' };

  const ogImages: Record<string, string> = {
    'loi-mo-dau': `${siteUrl}/images/sacred_cathedral.jpg`,
    'phan-1': `${siteUrl}/images/stained_glass_christ.jpg`,
    'phan-2': `${siteUrl}/images/sacred_cathedral.jpg`,
    'phan-3': `${siteUrl}/images/sacred_peter.jpg`,
    'phan-4': `${siteUrl}/images/sacred_saints.jpg`,
  };
  const ogImage = ogImages[partInfo.slug] || `${siteUrl}/images/stained_glass_christ.jpg`;

  return {
    title: `${partInfo.title} (${partInfo.range}) — Trình Đọc Toàn Văn | VERIDU`,
    description: `Khảo cứu toàn văn ${partInfo.title} (${partInfo.range}) của Sách Giáo Lý Hội Thánh Công Giáo. ${partInfo.desc} Đối chiếu Kinh Thánh và chú dẫn nguồn Huấn Quyền.`,
    keywords: [
      partInfo.title,
      partInfo.subtitle,
      partInfo.range,
      'Giáo lý Hội Thánh Công Giáo',
      'Sách Giáo Lý CCC',
      'Tra cứu điều khoản Giáo lý',
      'Huấn quyền Công giáo',
      'Đức tin Kitô giáo'
    ],
    alternates: {
      canonical: `${siteUrl}/giao-ly/doc/${partInfo.slug}`
    },
    openGraph: {
      title: `${partInfo.title} (${partInfo.range}) | VERIDU`,
      description: `Khảo cứu toàn văn ${partInfo.title} (${partInfo.range}) của Sách Giáo Lý Hội Thánh Công Giáo. ${partInfo.desc}`,
      url: `${siteUrl}/giao-ly/doc/${partInfo.slug}`,
      siteName: 'VERIDU',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${partInfo.title} — VERIDU`
        }
      ],
      locale: 'vi_VN',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${partInfo.title} (${partInfo.range}) | VERIDU`,
      description: `Khảo cứu toàn văn ${partInfo.title} (${partInfo.range}) của Sách Giáo Lý Hội Thánh Công Giáo.`,
      images: [ogImage]
    }
  };
}

export default async function CatechismPartPage({ params }: { params: { part: string } }) {
  const currentPart = PARTS_MAP[params.part];
  if (!currentPart) {
    notFound();
  }

  // Fetch all paragraphs belonging to this part (ordered by paragraph_number ascending)
  const { data: paragraphs, count } = await fetchCatechismParagraphs(currentPart.partNumber, undefined, undefined, 1000, 0);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang Chủ',
            item: siteUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Giáo Lý Hội Thánh Công Giáo',
            item: `${siteUrl}/giao-ly`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: currentPart.title,
            item: `${siteUrl}/giao-ly/doc/${currentPart.slug}`
          }
        ]
      },
      {
        '@type': 'Book',
        name: `Sách Giáo Lý Hội Thánh Công Giáo — ${currentPart.title}`,
        description: currentPart.desc,
        inLanguage: 'vi',
        author: {
          '@type': 'Organization',
          name: 'Hội Thánh Công Giáo — Tòa Thánh Vatican'
        },
        publisher: {
          '@type': 'Organization',
          name: 'VERIDU',
          url: siteUrl
        },
        url: `${siteUrl}/giao-ly/doc/${currentPart.slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-20 sm:pt-24 md:pt-28">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. DEDICATED PART HERO (CLEAN PARCHMENT CONTRAST) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-serif font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{currentPart.range} • {count} Điều Khoản Khảo Cứu</span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-main)]">
              {currentPart.title}
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
              {currentPart.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 flex-shrink-0">
            <Link
              href="/giao-ly/the-lat"
              className="px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 transition shadow-sm"
            >
              <Scroll className="w-3.5 h-3.5 text-amber-500" />
              <span>Thẻ Lật Ghi Nhớ</span>
            </Link>

            <Link
              href="/quiz"
              className="px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-serif font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Đấu Trường Quiz</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED FULL-TEXT READER CLIENT (WITH UNIFIED STICKY CONTROLS) */}
      <div className="w-full">
        <CatechismReaderClient 
          paragraphs={paragraphs} 
          currentPartConfig={currentPart} 
        />
      </div>

    </div>
  );
}
