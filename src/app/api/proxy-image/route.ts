import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 1x1 Transparent PNG for clean, silent fallback without ever returning HTML
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

// Strict Allowlist of trusted image hosts to prevent SSRF and proxy abuse
const ALLOWED_HOST_SUFFIXES = [
  'googleusercontent.com',
  'drive.google.com',
  'unsplash.com',
  'wikimedia.org',
  'thapgia.com',
  'supabase.co',
];

function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(suffix => lower === suffix || lower.endsWith('.' + suffix));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Handle local relative images directly
  if (imageUrl.startsWith('/')) {
    return NextResponse.redirect(new URL(imageUrl, request.url));
  }

  try {
    const targetUrl = decodeURIComponent(imageUrl);

    // Validate URL syntax
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new NextResponse('Invalid URL', { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new NextResponse('Invalid protocol', { status: 400 });
    }

    // SSRF Check: only proxy approved image domains
    if (!isAllowedHost(parsed.hostname)) {
      return new NextResponse('Domain not allowed by proxy policy', { status: 403 });
    }

    // Fetch the remote image with standard browser headers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      // Manual redirect handling prevents following redirects to Google login pages
      redirect: 'follow',
    });

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    // ── CRITICAL SECURITY CHECK (Kaspersky / Anti-Phishing Guard) ──
    // If Google or any host returns HTML (e.g., login redirect or 403 error page),
    // NEVER pass text/html through this image proxy. Return clean fallback image!
    if (!response.ok || !contentType.startsWith('image/')) {
      return new NextResponse(TRANSPARENT_PNG, {
        status: 404,
        headers: {
          'Content-Type': 'image/png',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.warn('Image proxy fetch error (returning fallback):', error.message);
    return new NextResponse(TRANSPARENT_PNG, {
      status: 500,
      headers: {
        'Content-Type': 'image/png',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
}
