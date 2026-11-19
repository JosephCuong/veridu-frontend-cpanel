import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { resolveMediaUrl } from '@/lib/driveHelper';

export const revalidate = 600;

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

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org').replace(/\/$/, '');
  const cdnBase = (process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://cdn.thapgia.com/veridu-cdn').replace(/\/$/, '');

  try {
    const [postsRes, booksRes] = await Promise.all([
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
    ]);

    const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
    const books = Array.isArray(booksRes.data) ? booksRes.data : [];

    const articles = posts.map((p: any) => ({
      date: p.created_at ? String(p.created_at).slice(0, 10) : 'Mới nhất',
      category: p.category || 'Thần Học & Thánh Kinh',
      title: p.title || 'Bài viết VERIDU',
      summary: p.excerpt || 'Khảo cứu và suy niệm Lời Chúa tại hệ sinh thái VERIDU.',
      image_url: toAbsoluteUrl(p.featured_image, siteUrl),
      url: `${siteUrl}/${p.slug}`,
    }));

    const featuredMedia = books
      .filter((b: any) => b.youtube_url)
      .map((b: any) => ({
        title: b.title || 'Tài liệu Video VERIDU',
        category: 'YouTube',
        subtitle: b.subtitle || 'Học Thánh Kinh trực quan qua Video hệ sinh thái VERIDU.',
        youtube_url: b.youtube_url,
        thumbnail_url: toAbsoluteUrl(b.cover_image, siteUrl),
        external_url: `${siteUrl}/sach-tranh/${b.slug}`,
      }));

    if (featuredMedia.length === 0) {
      featuredMedia.push({
        title: 'Kênh Học Thuật & Chia Sẻ Lời Chúa VERIDU',
        category: 'YouTube',
        subtitle: 'Các bài giảng, suy niệm Lời Chúa và hướng dẫn học Thánh Kinh trên hệ sinh thái VERIDU.',
        youtube_url: '',
        thumbnail_url: '',
        external_url: 'https://www.youtube.com/',
      });
    }

    const firstPost = posts[0];
    const sponsorBanner = firstPost
      ? {
          badge: firstPost.category || 'Tiêu Điểm VERIDU',
          title: firstPost.title,
          summary: firstPost.excerpt || 'Bài nghiên cứu mới nhất vừa được xuất bản trên Crux Veritatis (VERIDU).',
          image_url: toAbsoluteUrl(firstPost.featured_image, siteUrl),
          cta_label: 'Đọc Trên Website',
          cta_action: 'open_books',
          link_url: `${siteUrl}/${firstPost.slug}`,
          youtube_url: '',
        }
      : {
          badge: 'Tiêu Điểm VERIDU',
          title: 'Nghiên Cứu Thánh Kinh Song Song — Chuẩn Học Thuật & Phụng Vụ Công Giáo',
          summary: 'Khám phá bản đối chiếu CGKPV & Lm. Nguyễn Thế Thuấn, Tủ Sách đọc song song và Lịch Phụng Vụ hằng ngày.',
          image_url: '',
          cta_label: 'Mở Tủ Sách Ngay',
          cta_action: 'open_books',
          link_url: '',
          youtube_url: '',
        };

    const payload = {
      version: '2.1.0',
      generated_at: new Date().toISOString(),
      ecosystem: {
        website_url: `${siteUrl}/`,
        cdn_base_url: cdnBase,
        facebook_url: 'https://www.facebook.com/',
        youtube_channel_url: 'https://www.youtube.com/',
      },
      sponsor_banner: sponsorBanner,
      articles,
      featured_media: featuredMedia,
      social_posts: [
        {
          badge: 'Cộng Đồng',
          title: 'Cộng Đồng Đọc & Suy Niệm Kinh Thánh VERIDU',
          summary: 'Chia sẻ thiệp Lời Chúa hằng ngày và thảo luận các chủ đề Thánh Kinh, Phụng Vụ cùng cộng đoàn.',
          facebook_url: 'https://www.facebook.com/',
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
        version: '2.1.0',
        error: err?.message || 'Feed fallback',
        ecosystem: { website_url: `${siteUrl}/`, cdn_base_url: cdnBase },
        sponsor_banner: null,
        articles: [],
        featured_media: [],
        social_posts: [],
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  }
}
