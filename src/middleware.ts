import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtRole(token: string): string | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    // Thay thế ký tự base64url sang chuẩn base64
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('veridu_token')?.value;
  const { pathname } = request.nextUrl;

  // Bảo vệ đường dẫn Admin ở cấp độ Server-side (Edge)
  if (pathname.startsWith('/admin') || pathname.startsWith('/cai-dat')) {
    if (!token) {
      // Nếu không có cookie xác thực, đẩy về trang chủ và mở form đăng nhập
      return NextResponse.redirect(new URL('/?auth=login', request.url));
    }

    // Nếu truy cập /admin, bắt buộc phải có role là administrator
    if (pathname.startsWith('/admin')) {
      const role = decodeJwtRole(token);
      if (role !== 'administrator') {
        // Không phải admin, đẩy về trang chủ
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cai-dat/:path*'],
};
