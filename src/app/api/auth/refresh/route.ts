import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { extractCookieValue } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const refreshToken = extractCookieValue(cookieHeader, 'veridu_refresh_token')?.trim();

    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy phiên làm mới.' }, { status: 401 });
    }

    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Phiên đăng nhập đã hết hạn.' }, { status: 401 });
    }

    const data: any = await res.json();
    if (!data?.access_token) {
      return NextResponse.json({ ok: false, error: 'Không thể làm mới phiên.' }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = 72 * 60 * 60;
    const response = NextResponse.json({
      ok: true,
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
      },
    });

    response.cookies.set('veridu_auth_token', data.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    if (data.refresh_token) {
      response.cookies.set('veridu_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'Lỗi làm mới phiên.' }, { status: 500 });
  }
}
