import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes requiring user authentication
const AUTH_REQUIRED_ROUTES = [
  '/ho-so',
  '/cai-dat',
  '/dang-bai',
  '/tac-gia/dashboard',
  '/quiz/control'
];

// Routes strictly requiring administrator role
const ADMIN_REQUIRED_ROUTES = [
  '/admin/quiz-bank',
  '/admin/sach-tranh',
  '/quiz/studio',
  '/sach-tranh/studio'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPath = pathname.replace(/\/$/, '') || '/';

  // 1. Redirect legacy wp-admin or general admin paths (except allowed admin studios)
  if (
    pathname.startsWith('/wp-admin') ||
    (pathname.startsWith('/admin') && 
     pathname !== '/admin/sach-tranh' && 
     pathname !== '/admin/quiz-bank')
  ) {
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

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SERVER-SIDE ROUTE GUARD (AUTHENTICATION & AUTHORIZATION ENFORCEMENT)
  // ══════════════════════════════════════════════════════════════════════════
  const tokenCookie = request.cookies.get('veridu_token')?.value;
  const userCookie = request.cookies.get('veridu_user')?.value;
  const hasValidAuthToken = Boolean(tokenCookie && tokenCookie !== 'guest_token');

  // Check if route requires login
  const isAuthRequired = AUTH_REQUIRED_ROUTES.some(route => cleanPath === route || cleanPath.startsWith(`${route}/`));
  const isAdminRequired = ADMIN_REQUIRED_ROUTES.some(route => cleanPath === route || cleanPath.startsWith(`${route}/`));

  if (isAuthRequired && !hasValidAuthToken) {
    const loginRedirectUrl = new URL('/dang-nhap', request.url);
    loginRedirectUrl.searchParams.set('redirect', cleanPath);
    return NextResponse.redirect(loginRedirectUrl);
  }

  if (isAdminRequired) {
    if (!hasValidAuthToken) {
      const loginRedirectUrl = new URL('/dang-nhap', request.url);
      loginRedirectUrl.searchParams.set('redirect', cleanPath);
      return NextResponse.redirect(loginRedirectUrl);
    }

    // Role check from user cookie
    let isUserAdmin = false;
    if (userCookie) {
      try {
        const decoded = userCookie.includes('%') ? decodeURIComponent(userCookie) : userCookie;
        const parsed = JSON.parse(decoded);
        if (parsed?.role === 'Quản Trị Viên' || parsed?.role === 'admin') {
          isUserAdmin = true;
        }
      } catch (e) {}
    }

    if (!isUserAdmin) {
      return NextResponse.redirect(new URL('/ho-so?error=forbidden', request.url));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. ATTACH HARDENED SECURITY HEADERS
  // ══════════════════════════════════════════════════════════════════════════
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
