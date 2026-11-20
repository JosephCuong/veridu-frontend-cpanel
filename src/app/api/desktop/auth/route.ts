import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { authenticateDesktopRequest, getMaxDevicesLimit } from '@/lib/desktopCrypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticateDesktopRequest(request);
  if (!auth.user) {
    return NextResponse.json({ authenticated: false, error: auth.error }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: auth.profile,
    max_devices: getMaxDevicesLimit(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body?.action || 'login').toLowerCase();

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (action === 'refresh') {
      const refreshToken = String(body?.refresh_token || '').trim();
      if (!refreshToken) {
        return NextResponse.json({ ok: false, error: 'Thiếu refresh_token.' }, { status: 400 });
      }
      const { data, error } = await authClient.auth.refreshSession({ refresh_token: refreshToken });
      if (error || !data.session || !data.user) {
        return NextResponse.json({ ok: false, error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' }, { status: 401 });
      }
      const admin = getSupabaseServerClient();
      const { data: profile } = await admin
        .from('profiles')
        .select('id, email, full_name, christian_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      return NextResponse.json({
        ok: true,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: profile || { id: data.user.id, email: data.user.email, full_name: data.user.email, role: 'user' },
        max_devices: getMaxDevicesLimit(),
      });
    }

    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu tài khoản VERIDU.' }, { status: 400 });
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { ok: false, error: 'Email hoặc mật khẩu chưa chính xác.' },
        { status: 401 }
      );
    }

    const admin = getSupabaseServerClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('id, email, full_name, christian_name, role')
      .eq('id', data.user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        ok: true,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: profile || {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email,
          role: 'user',
        },
        max_devices: getMaxDevicesLimit(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json({ ok: false, error: 'Lỗi xử lý đăng nhập Desktop.' }, { status: 500 });
  }
}
