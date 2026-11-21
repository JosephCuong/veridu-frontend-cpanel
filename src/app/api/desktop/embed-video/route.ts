import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawV = (url.searchParams.get('v') || '').trim();
  const rawList = (url.searchParams.get('list') || '').trim();
  const rawStart = parseInt(url.searchParams.get('start') || '0', 10);
  const autoplay = url.searchParams.get('autoplay') === '0' ? '0' : '1';

  const validV = /^[a-zA-Z0-9_-]{11}$/.test(rawV) ? rawV : '';
  const validList = /^[a-zA-Z0-9_-]{10,64}$/.test(rawList) ? rawList : '';
  const startSec = Number.isFinite(rawStart) && rawStart > 0 ? Math.floor(rawStart) : 0;

  if (!validV && !validList) {
    return new NextResponse('Invalid YouTube video identifier', { status: 400 });
  }

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay,
    origin: 'https://www.cruxveritatis.org',
  });
  if (startSec > 0) params.set('start', String(startSec));

  let embedSrc = '';
  if (validV) {
    embedSrc = `https://www.youtube.com/embed/${validV}?${params.toString()}`;
  } else {
    params.set('list', validList);
    embedSrc = `https://www.youtube.com/embed/videoseries?${params.toString()}`;
  }

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <title>VERIDU Video Player</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0B0A0A; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
  </style>
</head>
<body>
  <iframe
    src="${embedSrc}"
    title="VERIDU Video"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    allowfullscreen
  ></iframe>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self' 'unsafe-inline'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors http://127.0.0.1:* http://localhost:* https://www.cruxveritatis.org https://thapgia.com;",
      'Cache-Control': 'public, max-age=300',
    },
  });
}
