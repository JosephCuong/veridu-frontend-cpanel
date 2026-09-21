import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = '2487e684076a60a76ed3e8f3dc6983e7';
const HOST = 'www.thapgia.com';
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

export async function POST(request: Request) {
  try {
    let targetUrls: string[] = [];

    // Parse body if provided
    try {
      const body = await request.json();
      if (body?.urls && Array.isArray(body.urls) && body.urls.length > 0) {
        targetUrls = body.urls;
      }
    } catch {
      // Body is empty or not JSON, fallback to all published URLs
    }

    // If no URLs specified, collect all primary published content
    if (targetUrls.length === 0) {
      targetUrls.push(
        `${BASE_URL}/`,
        `${BASE_URL}/thu-vien`,
        `${BASE_URL}/kinh-thanh`,
        `${BASE_URL}/giao-ly`,
        `${BASE_URL}/khoa-hoc`,
        `${BASE_URL}/ban-do`,
        `${BASE_URL}/lich-su`,
        `${BASE_URL}/nhan-vat`,
        `${BASE_URL}/quiz`,
        `${BASE_URL}/game`,
        `${BASE_URL}/sach-tranh`
      );

      // Fetch all published articles
      const { data: posts } = await supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published');

      if (posts) {
        posts.forEach((p) => {
          if (p.slug) targetUrls.push(`${BASE_URL}/${p.slug}`);
        });
      }

      // Fetch storybooks
      const { data: storybooks } = await supabase
        .from('storybooks')
        .select('slug')
        .eq('status', 'published');

      if (storybooks) {
        storybooks.forEach((s) => {
          if (s.slug) targetUrls.push(`${BASE_URL}/sach-tranh/${s.slug}`);
        });
      }
    }

    // Deduplicate URLs
    const uniqueUrls = Array.from(new Set(targetUrls));

    // 1. Submit to IndexNow (Bing, Yandex, Seznam, Naver)
    let indexNowStatus = 0;
    let indexNowResponseText = '';
    try {
      const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          host: HOST,
          key: INDEXNOW_KEY,
          keyLocation: KEY_LOCATION,
          urlList: uniqueUrls,
        }),
      });
      indexNowStatus = indexNowRes.status;
      indexNowResponseText = await indexNowRes.text();
    } catch (err: any) {
      console.error('IndexNow submission error:', err);
      indexNowResponseText = err?.message || 'Error';
    }

    // 2. Ping Google Sitemap
    let googlePingStatus = 0;
    try {
      const gRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
      googlePingStatus = gRes.status;
    } catch (err: any) {
      console.error('Google ping error:', err);
    }

    // 3. Ping Bing Sitemap
    let bingPingStatus = 0;
    try {
      const bRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
      bingPingStatus = bRes.status;
    } catch (err: any) {
      console.error('Bing ping error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Tín hiệu chỉ mục đã được phát đi thành công tới các công cụ tìm kiếm.',
      submittedUrlsCount: uniqueUrls.length,
      sampleUrls: uniqueUrls.slice(0, 5),
      results: {
        indexNow: {
          status: indexNowStatus,
          message: indexNowStatus === 200 || indexNowStatus === 202 ? 'OK / Queued' : indexNowResponseText,
        },
        googleSitemapPing: {
          status: googlePingStatus,
        },
        bingSitemapPing: {
          status: bingPingStatus,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal error in IndexNow endpoint',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/indexnow',
    host: HOST,
    keyLocation: KEY_LOCATION,
    usage: 'Gửi yêu cầu POST tới endpoint này để kích hoạt đồng bộ IndexNow & Google/Bing Ping.',
  });
}
