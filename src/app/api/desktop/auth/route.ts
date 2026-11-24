import { NextResponse } from 'next/server';
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

    if (action === 'refresh') {
      const refreshToken = String(body?.refresh_token || '').trim();
      if (!refreshToken) {
        return NextResponse.json({ ok: false, error: 'Thiếu refresh_token.' }, { status: 400 });
      }
      const refreshRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      });
      if (!refreshRes.ok) {
        return NextResponse.json({ ok: false, error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' }, { status: 401 });
      }
      const data: any = await refreshRes.json();
      if (!data?.access_token || !data?.user?.id) {
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
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        user: profile || { id: data.user.id, email: data.user.email, full_name: data.user.email, role: 'user' },
        max_devices: getMaxDevicesLimit(),
      });
    }

    const rawEmail = String(body?.email || '').trim().toLowerCase();
    const email = rawEmail.includes('@') ? rawEmail : (rawEmail ? `${rawEmail}@veridu.com` : '');
    const password = String(body?.password || '');
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu tài khoản VERIDU.' }, { status: 400 });
    }

    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!tokenRes.ok) {
      let errCode = '';
      try {
        const errBody: any = await tokenRes.json();
        errCode = String(errBody?.error_code || errBody?.error || '');
      } catch {}
      const msg =
        errCode === 'email_not_confirmed'
          ? 'Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư trước khi đăng nhập.'
          : 'Email hoặc mật khẩu chưa chính xác. (Lưu ý: tắt bộ gõ tiếng Việt UniKey/CapsLock khi nhập mật khẩu và dùng đúng mật khẩu trên cruxveritatis.org.)';
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }

    const data: any = await tokenRes.json();
    if (!data?.access_token || !data?.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Không thể khởi tạo phiên đăng nhập. Vui lòng thử lại.' },
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
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
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
