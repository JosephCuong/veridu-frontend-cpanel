import React from 'react';
import EditorialLandingHome from '@/components/EditorialLandingHome';
import { fetchCourses, fetchHomepageData } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { getGoogleDriveImageUrl } from '@/lib/driveHelper';
import { sanitizePublicSacredMusic } from '@/lib/sacredMusic';
import {
  ACTIVE_LITURGICAL_SEASON,
  ADVENT_CURATED_POST_SLUGS,
  AdventShowcaseItem,
} from '@/config/liturgicalSeasonConfig';

export const revalidate = 3600; // ISR 1h cache + on-demand revalidatePath on publish/edit to save server CPU

async function fetchAdventShowcaseItems(): Promise<AdventShowcaseItem[]> {
  if (ACTIVE_LITURGICAL_SEASON !== 'advent') return [];

  const items: AdventShowcaseItem[] = [];
  const seenSlugs = new Set<string>();

  try {
    const [{ data: musicRows }, { data: postRows }] = await Promise.all([
      supabase
        .from('sacred_music')
        .select('*')
        .eq('status', 'published')
        .eq('liturgical_season', 'Mùa Vọng')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('posts')
        .select('id, slug, title, category, excerpt, featured_image, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    const allPosts = Array.isArray(postRows) ? postRows : [];

    // 1. Prioritize explicitly curated Advent slugs + keyword-matched Advent posts
    const adventKeywords = /mùa vọng|giáng sinh|o adonai|nhập thể|bê-lem|đấng toàn năng|emmanuel|advent/i;
    const matchedPosts = allPosts.filter(
      (p: any) =>
        ADVENT_CURATED_POST_SLUGS.includes(p.slug) ||
        adventKeywords.test(`${p.title || ''} ${p.excerpt || ''} ${p.category || ''}`)
    );

    // Order curated priority first, then newest matched posts
    matchedPosts.sort((a: any, b: any) => {
      const aIdx = ADVENT_CURATED_POST_SLUGS.indexOf(a.slug);
      const bIdx = ADVENT_CURATED_POST_SLUGS.indexOf(b.slug);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });

    for (const post of matchedPosts.slice(0, 5)) {
      if (!post?.slug || seenSlugs.has(post.slug)) continue;
      seenSlugs.add(post.slug);
      const rawThumb = post.featured_image || null;
      const thumbUrl = rawThumb
        ? rawThumb.includes('drive.google.com')
          ? getGoogleDriveImageUrl(rawThumb, 900)
          : rawThumb
        : null;

      items.push({
        id: `post-${post.id || post.slug}`,
        kind: 'article',
        badge: post.category ? `Mùa Vọng · ${post.category}` : 'Suy Niệm Mùa Vọng',
        title: String(post.title || 'Bài viết Mùa Vọng VERIDU').replace(/<[^>]*>/g, ''),
        excerpt: String(post.excerpt || '').replace(/<[^>]*>/g, ''),
        href: `/${post.slug}`,
        thumbnailUrl: thumbUrl,
        meta: 'Bài viết suy niệm',
      });
    }

    // 2. Interleave Advent Sacred Music (Đáp Ca Mùa Vọng + PDF)
    const adventMusic = (musicRows || []).map(sanitizePublicSacredMusic);
    for (const song of adventMusic) {
      const musicItem: AdventShowcaseItem = {
        id: `music-${song.id}`,
        kind: 'music',
        badge: `Thánh Nhạc · ${song.mass_part}`,
        title: song.title,
        excerpt:
          song.description ||
          `Đáp Ca Mùa Vọng (${song.composer}) — Video hát mẫu YouTube kèm sheet nhạc PDF chuẩn phụng vụ.`,
        href: `/thanh-nhac/${song.slug}`,
        thumbnailUrl: song.thumbnail_url,
        meta: song.has_pdf ? `${song.composer} · Có PDF` : song.composer,
      };
      // Insert right after the first article so visitors immediately see both Article & Sacred Music
      if (items.length >= 1) {
        items.splice(1, 0, musicItem);
      } else {
        items.push(musicItem);
      }
    }
  } catch (err) {
    console.error('[Home] Failed to load Advent showcase items:', err);
  }

  return items;
}

export default async function Home() {
  // Fetch live courses, homepage data, and seasonal Advent showcase from Supabase
  const [courses, homepageData, adventItems] = await Promise.all([
    fetchCourses(),
    fetchHomepageData(),
    fetchAdventShowcaseItems(),
  ]);

  const youtubeUrl = homepageData?.settings?.youtube_url;
  let embedUrl = null;
  if (youtubeUrl) {
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    } else {
      embedUrl = youtubeUrl; // Fallback
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300">
      <EditorialLandingHome 
        courses={courses}
        homepageData={homepageData}
        embedUrl={embedUrl}
        adventItems={adventItems}
      />
    </div>
  );
}
