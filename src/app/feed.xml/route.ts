import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 3600; // Cache 1 hour

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thapgia.com';

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, content, created_at, category, author_name')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching posts for RSS:', error);
    }

    const itemsXml = (posts || [])
      .map((post) => {
        const postUrl = `${siteUrl}/${post.slug}`;
        const pubDate = post.created_at ? new Date(post.created_at).toUTCString() : new Date().toUTCString();
        const description = escapeXml(post.excerpt || (post.content ? post.content.slice(0, 280) + '...' : ''));
        const category = escapeXml(post.category || 'Công Giáo & Thần Học');
        const author = escapeXml(post.author_name || 'Ban Học Vụ VERIDU');

        return `
    <item>
      <title>${escapeXml(post.title || 'Bài viết VERIDU')}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${category}</category>
      <author>${author}</author>
      <description>${description}</description>
    </item>`;
      })
      .join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VERIDU - Thư Viện Tri Thức &amp; Linh Đạo Công Giáo</title>
    <link>${siteUrl}</link>
    <description>Nền tảng tra cứu Kinh Thánh, Giáo lý Hội Thánh, Lịch sử Cứu độ và Thần học Công giáo chuẩn xác, khoa học và phụng vụ.</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('RSS generation error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
