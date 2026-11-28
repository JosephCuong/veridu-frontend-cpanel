import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { sanitizePublicSacredMusic, SacredMusicItem } from '@/lib/sacredMusic';
import SacredMusicCatalogClient from '@/components/sacred-music/SacredMusicCatalogClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Thư Viện Thánh Nhạc & Đáp Ca Phụng Vụ | VERIDU',
  description:
    'Nghe Đáp Ca, Thánh Ca Công Giáo theo từng Mùa Phụng Vụ, liên kết bản văn Thánh Vịnh Kinh Thánh và tải sheet nhạc PDF dành cho ca đoàn tại VERIDU.',
  alternates: {
    canonical: 'https://www.cruxveritatis.org/thanh-nhac',
  },
  openGraph: {
    title: 'Thư Viện Thánh Nhạc & Đáp Ca Phụng Vụ | VERIDU',
    description:
      'Nghe Đáp Ca, Thánh Ca Công Giáo theo từng Mùa Phụng Vụ, liên kết bản văn Thánh Vịnh và tải sheet nhạc PDF tại VERIDU.',
    url: 'https://www.cruxveritatis.org/thanh-nhac',
    type: 'website',
  },
};

export default async function SacredMusicPage() {
  let items: SacredMusicItem[] = [];

  try {
    const { data, error } = await supabase
      .from('sacred_music')
      .select('*')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      items = data.map(sanitizePublicSacredMusic);
    }
  } catch (err) {
    console.error('[SacredMusicPage] Failed to load sacred_music:', err);
  }

  return <SacredMusicCatalogClient initialItems={items} />;
}
