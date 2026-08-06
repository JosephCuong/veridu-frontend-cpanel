import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/site.webmanifest',
  '/sw.js',
]);

const STATIC_FILE_REGEX = /\.(txt|xml|json|ico|png|jpg|jpeg|svg|webp|gif|webmanifest|js|css)$/i;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('veridu_token')?.value;
  const userCookie = request.cookies.get('veridu_user')?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect 301 cho các permalink bài viết cũ từ WordPress dạng `/ten-bai-viet/` sang `/thu-vien/ten-bai-viet`
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

  // 2. Bảo vệ đường dẫn Admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/dang-nhap', request.url));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!user || error) {
        return NextResponse.redirect(new URL('/dang-nhap', request.url));
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = String(profile?.role || user.user_metadata?.role || '').toLowerCase();
      const isAdminRole =
        role.includes('admin') ||
        role.includes('quản trị') ||
        role.includes('administrator');

      if (!user || !isAdminRole) {
        return NextResponse.redirect(new URL('/dang-nhap', request.url));
      }

      return NextResponse.next();
    } catch (e) {
      console.error('Middleware admin auth error:', e);
      return NextResponse.redirect(new URL('/dang-nhap', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
