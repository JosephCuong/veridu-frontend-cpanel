import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const KNOWN_ROUTES = new Set([
  '/',
  '/thu-vien',
  '/khoa-hoc',
  '/courses',
  '/kinh-thanh',
  '/doc-kinh-thanh',
  '/ban-do',
  '/ban-do-kinh-thanh',
  '/lich-su',
  '/dong-thoi-gian',
  '/dang-bai',
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
  const cleanPath = pathname.replace(/\/$/, '');

  // 1. Redirect admin paths to home page
  if (pathname.startsWith('/admin') || pathname.startsWith('/wp-admin')) {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  // 2. 301 Permanent Redirects for Old URLs -> Short SEO URLs
  if (cleanPath === '/ban-do-kinh-thanh') {
    return NextResponse.redirect(new URL('/ban-do', request.url), { status: 301 });
  }
  if (cleanPath === '/dong-thoi-gian') {
    return NextResponse.redirect(new URL('/lich-su', request.url), { status: 301 });
  }
  if (cleanPath === '/thu-vien/dang-bai') {
    return NextResponse.redirect(new URL('/dang-bai', request.url), { status: 301 });
  }
  if (cleanPath === '/courses') {
    return NextResponse.redirect(new URL('/khoa-hoc', request.url), { status: 301 });
  }
  if (cleanPath.startsWith('/courses/')) {
    const subPath = cleanPath.replace('/courses/', '');
    return NextResponse.redirect(new URL(`/khoa-hoc/${subPath}`, request.url), { status: 301 });
  }
  if (cleanPath === '/doc-kinh-thanh') {
    return NextResponse.redirect(new URL('/kinh-thanh', request.url), { status: 301 });
  }
  if (cleanPath.startsWith('/doc-kinh-thanh/')) {
    const subPath = cleanPath.replace('/doc-kinh-thanh/', '');
    return NextResponse.redirect(new URL(`/kinh-thanh/${subPath}`, request.url), { status: 301 });
  }
  if (cleanPath.startsWith('/thu-vien/') && cleanPath !== '/thu-vien') {
    const slug = cleanPath.replace('/thu-vien/', '');
    return NextResponse.redirect(new URL(`/${slug}`, request.url), { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
