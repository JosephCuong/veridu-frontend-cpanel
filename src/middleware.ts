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
  '/admin',
  '/search',
  '/favicon.ico',
]);

export function middleware(request: NextRequest) {
  const token = request.cookies.get('veridu_token')?.value;
  const userCookie = request.cookies.get('veridu_user')?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect 301 cho các permalink bài viết cũ từ WordPress dạng `/ten-bai-viet/` sang `/thu-vien/ten-bai-viet`
  const cleanPath = pathname.replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 1 && !KNOWN_ROUTES.has(cleanPath) && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const slug = segments[0];
    const targetUrl = new URL(`/thu-vien/${slug}`, request.url);
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // 2. Bảo vệ đường dẫn Admin
  if (pathname.startsWith('/admin')) {
    if (!token && !userCookie) {
      return NextResponse.redirect(new URL('/dang-nhap', request.url));
    }

    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        const role = String(user.role || '').toLowerCase();
        // Cho phép truy cập nếu role là admin, quản trị viên, hoặc administrator
        if (role.includes('admin') || role.includes('quản trị') || role.includes('administrator')) {
          return NextResponse.next();
        }
      } catch (e) {
        console.error('Middleware cookie parse error:', e);
      }
    }

    // Nếu có token Supabase, cho phép đi tiếp vào trang admin
    if (token) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};