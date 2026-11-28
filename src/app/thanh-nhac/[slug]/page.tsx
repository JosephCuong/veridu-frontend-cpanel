import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { sanitizePublicSacredMusic, SacredMusicItem } from '@/lib/sacredMusic';
import SacredMusicDetailClient from '@/components/sacred-music/SacredMusicDetailClient';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchSacredMusicBySlug(slug: string): Promise<SacredMusicItem | null> {
  const { data, error } = await supabase
    .from('sacred_music')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return null;
  return sanitizePublicSacredMusic(data);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchSacredMusicBySlug(slug);

  if (!item) {
    return {
      title: 'Không tìm thấy bài Thánh Ca | VERIDU',
    };
  }

  const description =
    item.description ||
    `${item.title} (${item.composer}) – ${item.mass_part}, ${item.liturgical_season}. Nghe bản hát mẫu YouTube và tải sheet nhạc PDF tại VERIDU.`;

  return {
    title: `${item.title} | Thánh Nhạc VERIDU`,
    description,
    alternates: {
      canonical: `https://www.cruxveritatis.org/thanh-nhac/${item.slug}`,
    },
    openGraph: {
      title: `${item.title} | Thánh Nhạc VERIDU`,
      description,
      url: `https://www.cruxveritatis.org/thanh-nhac/${item.slug}`,
      type: 'music.song',
      images: item.thumbnail_url ? [{ url: item.thumbnail_url }] : undefined,
    },
  };
}

export default async function SacredMusicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await fetchSacredMusicBySlug(slug);

  if (!item) {
    notFound();
  }

  // Fetch optional related VERIDU theological article
  let relatedPost: {
    slug: string;
    title: string;
    excerpt?: string | null;
    category?: string | null;
  } | null = null;

  if (item.related_post_slug) {
    const { data: postData } = await supabase
      .from('posts')
      .select('slug, title, excerpt, category')
      .eq('slug', item.related_post_slug)
      .eq('status', 'published')
      .maybeSingle();

    if (postData) {
      relatedPost = postData;
    }
  }

  // Fetch up to 4 related hymns (prefer same liturgical season)
  const { data: relatedRows } = await supabase
    .from('sacred_music')
    .select('*')
    .eq('status', 'published')
    .neq('slug', item.slug)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  const relatedHymns = (relatedRows || [])
    .map(sanitizePublicSacredMusic)
    .sort((a, b) => {
      const aMatch = a.liturgical_season === item.liturgical_season ? 1 : 0;
      const bMatch = b.liturgical_season === item.liturgical_season ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: item.title,
    byArtist: {
      '@type': 'Person',
      name: item.composer,
    },
    genre: `Thánh Nhạc Công Giáo, ${item.mass_part}, ${item.liturgical_season}`,
    inLanguage: 'vi',
    url: `https://www.cruxveritatis.org/thanh-nhac/${item.slug}`,
    thumbnailUrl: item.thumbnail_url || undefined,
    description: item.description || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SacredMusicDetailClient
        item={item}
        relatedPost={relatedPost}
        relatedHymns={relatedHymns}
      />
    </>
  );
}
