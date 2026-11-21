import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { resolveMediaUrl } from '@/lib/driveHelper';

export const revalidate = 600;

const YOUTUBE_CHANNEL_ID = 'UCFz4Ub9k011BpqI19NotQgQ';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@veridu.net-gmail';
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/veridu.net/';

function toAbsoluteUrl(raw: string | null | undefined, siteUrl: string): string {
  if (!raw) return '';
  const resolved = resolveMediaUrl(raw, 'image');
  if (!resolved) return '';
  if (resolved.startsWith('https://') || resolved.startsWith('http://')) {
    return resolved;
  }
  if (resolved.startsWith('/')) {
    return `${siteUrl}${resolved}`;
  }
  return '';
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

interface FeedVideoItem {
  video_id: string;
  title: string;
  category: string;
  is_short: boolean;
  subtitle: string;
  published: string;
  youtube_url: string;
  thumbnail_url: string;
  external_url: string;
}

async function fetchYoutubeChannelVideos(limit = 15): Promise<FeedVideoItem[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const resp = await fetch(rssUrl, {
      headers: { 'User-Agent': 'VERIDU-Feed/2.3' },
      next: { revalidate: 900 },
    });
    if (!resp.ok) return [];
    const xml = await resp.text();
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const items: FeedVideoItem[] = [];

    let match: RegExpExecArray | null;
    while ((match = entryRegex.exec(xml)) !== null && items.length < limit) {
      const block = match[1];
      const vidMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      const pubMatch = block.match(/<published>([^<]+)<\/published>/);
      if (!vidMatch || !titleMatch) continue;
      const vid = vidMatch[1].trim();
      const title = decodeXmlEntities(titleMatch[1]);
      const pubDate = pubMatch ? pubMatch[1].trim().slice(0, 10) : '';
      const isShort = /#shorts/i.test(title);
      const isPsalm = /đáp ca|thánh vịnh|karaoke/i.test(title);
      const category = isShort ? 'Shorts' : (isPsalm ? 'Đáp Ca & Thánh Vịnh' : 'Video Kinh Thánh');
      items.push({
        video_id: vid,
        title,
        category,
        is_short: isShort,
        subtitle: pubDate ? `${pubDate} • ${category}` : category,
        published: pubDate,
        youtube_url: `https://www.youtube.com/watch?v=${vid}`,
        thumbnail_url: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        external_url: YOUTUBE_CHANNEL_URL,
      });
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org').replace(/\/$/, '');
  const cdnBase = (process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://cdn.thapgia.com/veridu-cdn').replace(/\/$/, '');

  try {
    const [postsRes, booksRes, ytVideos] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, slug, excerpt, category, featured_image, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('storybooks')
        .select('id, title, slug, subtitle, cover_image, youtube_url, created_at')
        .order('created_at', { ascending: false })
        .limit(4),
      fetchYoutubeChannelVideos(15),
    ]);

    const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
    const books = Array.isArray(booksRes.data) ? booksRes.data : [];

    const articles = posts.map((p: any) => ({
      date: p.created_at ? String(p.created_at).slice(0, 10) : 'Mới nhất',
      category: p.category || 'Kinh Thánh',
      title: p.title || 'Bài viết VERIDU',
      summary: p.excerpt || '',
      image_url: toAbsoluteUrl(p.featured_image, siteUrl),
      url: `${siteUrl}/${p.slug}`,
    }));

    const storybookVideos: FeedVideoItem[] = books
      .filter((b: any) => b.youtube_url)
      .map((b: any) => ({
        video_id: '',
        title: b.title || 'Video VERIDU',
        category: 'Video Kinh Thánh',
        is_short: false,
        subtitle: b.subtitle || '',
        published: b.created_at ? String(b.created_at).slice(0, 10) : '',
        youtube_url: b.youtube_url,
        thumbnail_url: toAbsoluteUrl(b.cover_image, siteUrl),
        external_url: `${siteUrl}/sach-tranh/${b.slug}`,
      }));

    const featuredMedia: FeedVideoItem[] = [...ytVideos, ...storybookVideos].slice(0, 15);

    if (featuredMedia.length === 0) {
      featuredMedia.push({
        video_id: '',
        title: 'Kênh YouTube VERIDU',
        category: 'YouTube',
        is_short: false,
        subtitle: 'Các video Kinh Thánh, Thánh vịnh đáp ca và suy niệm mới nhất.',
        published: '',
        youtube_url: '',
        thumbnail_url: '',
        external_url: YOUTUBE_CHANNEL_URL,
      });
    }

    const firstPost = posts[0];
    const sponsorBanner = firstPost
      ? {
          badge: firstPost.category || 'Bài Mới',
          title: firstPost.title,
          summary: firstPost.excerpt || '',
          image_url: toAbsoluteUrl(firstPost.featured_image, siteUrl),
          cta_label: 'Đọc Trên Website',
          cta_action: 'open_books',
          link_url: `${siteUrl}/${firstPost.slug}`,
          youtube_url: '',
        }
      : null;

    const payload = {
      version: '2.3.1',
      generated_at: new Date().toISOString(),
      ecosystem: {
        website_url: `${siteUrl}/`,
        cdn_base_url: cdnBase,
        facebook_url: FACEBOOK_PAGE_URL,
        youtube_channel_url: YOUTUBE_CHANNEL_URL,
        youtube_channel_id: YOUTUBE_CHANNEL_ID,
      },
      sponsor_banner: sponsorBanner,
      articles,
      featured_media: featuredMedia,
      social_posts: [
        {
          badge: 'Facebook',
          title: 'Cộng Đồng VERIDU trên Facebook',
          summary: 'Theo dõi các bài suy niệm, trích dẫn Lời Chúa và cập nhật mới nhất tại fanpage chính thức.',
          facebook_url: FACEBOOK_PAGE_URL,
          website_url: `${siteUrl}/`,
        },
      ],
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        version: '2.3.1',
        generated_at: new Date().toISOString(),
        ecosystem: {
          website_url: `${siteUrl}/`,
          cdn_base_url: cdnBase,
          facebook_url: FACEBOOK_PAGE_URL,
          youtube_channel_url: YOUTUBE_CHANNEL_URL,
        },
        articles: [],
        featured_media: [],
        social_posts: [],
        error: err?.message || 'Feed unavailable',
      },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
