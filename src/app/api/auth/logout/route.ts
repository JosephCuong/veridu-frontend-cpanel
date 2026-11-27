import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { extractCookieValue } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const isProd = process.env.NODE_ENV === 'production';

  // Optionally revoke Supabase session globally when requested
  try {
    let scope: 'local' | 'global' = 'local';
    try {
      const body = await request.json();
      if (body?.global === true) scope = 'global';
    } catch {}

    const cookieHeader = request.headers.get('cookie') || '';
    const token = extractCookieValue(cookieHeader, 'veridu_auth_token');
    if (token && token.split('.').length === 3) {
      await fetch(`${supabaseUrl}/auth/v1/logout?scope=${scope}`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }).catch(() => {});
    }
  } catch {}

  const response = NextResponse.json({ success: true });

  response.cookies.set('veridu_auth_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('veridu_refresh_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('veridu_token', '', {
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('veridu_user', '', {
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  return response;
}
