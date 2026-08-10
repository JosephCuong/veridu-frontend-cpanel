import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const KNOWN_ROUTES = new Set([
  '/',
  '/thu-vien',
  '/courses',
  '/doc-kinh-thanh',
  '/ban-do-kinh-thanh',
  '/dong-thoi-gian',
  '/nhan-vat',
  '/quiz',
  '/dang-nhap',
  '/dang-ky',
  '/ho-so',
  '/cai-dat',
  '/search',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/site.webmanifest',
  '/sw.js',
]);

const STATIC_FILE_REGEX = /\.(txt|xml|json|ico|png|jpg|jpeg|svg|webp|gif|webmanifest|js|css|woff|woff2|ttf|eot|otf|map)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Chuyển hướng các đường dẫn admin cũ về trang chủ
  if (pathname.startsWith('/admin') || pathname.startsWith('/wp-admin')) {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  // 2. Redirect 301 cho các permalink bài viết cũ từ WordPress dạng `/ten-bai-viet/` sang `/thu-vien/ten-bai-viet`
  const cleanPath = pathname.replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const isStaticFile = pathname.includes('.') || STATIC_FILE_REGEX.test(cleanPath);

  if (
    segments.length === 1 &&
    !KNOWN_ROUTES.has(cleanPath) &&
    !isStaticFile &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  ) {
    const slug = segments[0];
    const targetUrl = new URL(`/thu-vien/${slug}`, request.url);
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
