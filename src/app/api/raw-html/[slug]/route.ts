import { getLibraryArticleBySlug } from '@/lib/api';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request, 
  { params }: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return new NextResponse('Article Not Found', { status: 404 });
  }

  const rawHtml = article.interactiveHtml || article.contentHtml || '';

  if (!rawHtml.trim()) {
    return new NextResponse('Empty Content', { status: 204 });
  }

  // Permissive yet safe CSP headers allowing Chart.js, Tailwind, Mermaid, Three.js, Google Fonts, etc.
  const cspHeader = [
    "default-src 'self' https: data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.skypack.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: data: blob:",
    "frame-ancestors 'self'"
  ].join('; ');

  return new NextResponse(rawHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': cspHeader
    },
  });
}
