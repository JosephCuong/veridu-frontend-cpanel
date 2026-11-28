export interface SacredMusicItem {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  composer: string;
  lyricist?: string | null;
  liturgical_season: string;
  mass_part: string;
  liturgical_year?: string | null;
  psalm_number?: number | null;
  musical_key?: string | null;
  voicing?: string | null;
  youtube_url?: string | null;
  karaoke_youtube_url?: string | null;
  audio_url?: string | null;
  /** Stripped from public responses so PDF download/preview strictly requires login */
  has_pdf: boolean;
  pdf_url?: string | null;
  pdf_drive_id?: string | null;
  thumbnail_url?: string | null;
  scripture_ref?: string | null;
  scripture_book_slug?: string | null;
  scripture_chapter?: number | null;
  related_post_slug?: string | null;
  lyrics?: string | null;
  description?: string | null;
  status: 'published' | 'draft';
  is_featured?: boolean;
  views: number;
  downloads: number;
  created_at?: string;
  updated_at?: string;
}

export const LITURGICAL_SEASONS = [
  'Mùa Vọng',
  'Giáng Sinh',
  'Mùa Chay',
  'Phục Sinh',
  'Thường Niên',
  'Lễ Trọng & Các Thánh',
  'Đức Mẹ',
] as const;

export const MASS_PARTS = [
  'Đáp Ca',
  'Nhập Lễ',
  'Dâng Lễ',
  'Hiệp Lễ',
  'Kết Lễ',
  'Thánh Ca Suy Niệm',
  'Tuyển Tập PDF',
] as const;

export const LITURGICAL_YEARS = ['Chung', 'Năm A', 'Năm B', 'Năm C'] as const;

export const SEASON_ACCENT_MAP: Record<string, { badge: string; dot: string }> = {
  'Mùa Vọng': {
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dot: 'bg-purple-500',
  },
  'Giáng Sinh': {
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35',
    dot: 'bg-amber-500',
  },
  'Mùa Chay': {
    badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    dot: 'bg-violet-500',
  },
  'Phục Sinh': {
    badge: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/35',
    dot: 'bg-yellow-500',
  },
  'Thường Niên': {
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  'Lễ Trọng & Các Thánh': {
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  'Đức Mẹ': {
    badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    dot: 'bg-sky-500',
  },
};

export function extractYoutubeVideoId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

export function getYoutubeEmbedUrl(url?: string | null): string | null {
  const id = extractYoutubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function getYoutubeThumbnailUrl(url?: string | null): string | null {
  const id = extractYoutubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function extractGoogleDriveId(urlOrId?: string | null): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  const m =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m && m[1] ? m[1] : null;
}

export function resolveSacredMusicThumbnail(item: {
  thumbnail_url?: string | null;
  youtube_url?: string | null;
  karaoke_youtube_url?: string | null;
}): string {
  if (item.thumbnail_url && item.thumbnail_url.trim()) {
    const driveId = extractGoogleDriveId(item.thumbnail_url);
    if (driveId && item.thumbnail_url.includes('drive.google.com')) {
      return `https://lh3.googleusercontent.com/d/${driveId}=w1200`;
    }
    return item.thumbnail_url.trim();
  }
  const ytThumb = getYoutubeThumbnailUrl(item.youtube_url) || getYoutubeThumbnailUrl(item.karaoke_youtube_url);
  return ytThumb || '';
}

export function sanitizePublicSacredMusic(row: any): SacredMusicItem {
  const hasPdf = Boolean((row.pdf_drive_id && String(row.pdf_drive_id).trim()) || (row.pdf_url && String(row.pdf_url).trim()));
  return {
    id: Number(row.id),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    title_en: row.title_en || null,
    composer: String(row.composer || 'Ban Thánh Nhạc VERIDU'),
    lyricist: row.lyricist || null,
    liturgical_season: String(row.liturgical_season || 'Thường Niên'),
    mass_part: String(row.mass_part || 'Đáp Ca'),
    liturgical_year: row.liturgical_year || 'Chung',
    psalm_number: row.psalm_number !== null && row.psalm_number !== undefined ? Number(row.psalm_number) : null,
    musical_key: row.musical_key || null,
    voicing: row.voicing || 'Đơn ca / Cộng đoàn',
    youtube_url: row.youtube_url || null,
    karaoke_youtube_url: row.karaoke_youtube_url || null,
    audio_url: row.audio_url || null,
    has_pdf: hasPdf,
    thumbnail_url: resolveSacredMusicThumbnail(row) || null,
    scripture_ref: row.scripture_ref || null,
    scripture_book_slug: row.scripture_book_slug || null,
    scripture_chapter: row.scripture_chapter !== null && row.scripture_chapter !== undefined ? Number(row.scripture_chapter) : null,
    related_post_slug: row.related_post_slug || null,
    lyrics: row.lyrics || null,
    description: row.description || null,
    status: row.status === 'draft' ? 'draft' : 'published',
    is_featured: Boolean(row.is_featured),
    views: Number(row.views || 0),
    downloads: Number(row.downloads || 0),
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined,
  };
}
