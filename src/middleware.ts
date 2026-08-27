import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const KNOWN_ROUTES = new Set([
  '/',
  '/thu-vien',
  '/thu-vien/sach',
  '/thu-vien/tai-lieu',
  '/giao-ly',
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
  '/tac-gia',
  '/tac-gia/dashboard',
  '/sach-tranh',
  '/sach-tranh/studio',
  '/quiz',


  '/quiz/control',
  '/quiz/room',
  '/dang-nhap',
  '/dang-ky',
  '/quen-mat-khau',
  '/ho-so',
  '/cai-dat',
  '/search',
  '/dieu-khoan-su-dung',
  '/chinh-sach-bao-mat',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/site.webmanifest',
  '/sw.js',
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPath = pathname.replace(/\/$/, '') || '/';

  // 1. Redirect admin paths to home page
  if (pathname.startsWith('/admin') || pathname.startsWith('/wp-admin')) {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  // 2. 301 Permanent Redirects for Old URLs -> Modern Short SEO URLs
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

  // Preserve dedicated library subpages like /thu-vien/sach/*, /thu-vien/tai-lieu/*, and /thu-vien/doc/*
  if (
    cleanPath.startsWith('/thu-vien/') && 
    cleanPath !== '/thu-vien' && 
    !cleanPath.startsWith('/thu-vien/sach') && 
    !cleanPath.startsWith('/thu-vien/tai-lieu') &&
    !cleanPath.startsWith('/thu-vien/doc')
  ) {
    const slug = cleanPath.replace('/thu-vien/', '');
    return NextResponse.redirect(new URL(`/${slug}`, request.url), { status: 301 });
  }

  // 3. Attach standard security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
