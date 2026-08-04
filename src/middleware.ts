import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('veridu_token')?.value;
  const userCookie = request.cookies.get('veridu_user')?.value;
  const { pathname } = request.nextUrl;

  // Bảo vệ đường dẫn Admin
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
  matcher: ['/admin/:path*'],
};