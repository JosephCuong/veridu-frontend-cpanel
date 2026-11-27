import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const turnstileToken = body?.turnstileToken;

    // 1. Verify Turnstile (anti-bot / anti-email-bombing)
    const turnstile = await verifyTurnstileToken(request, turnstileToken, 'forgot_password');
    if (!turnstile.ok) {
      return NextResponse.json(
        { success: false, error: turnstile.error || 'Xác thực chống bot không thành công.' },
        { status: 403 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const redirectTo =
      origin.includes('localhost') || origin.includes('127.0.0.1')
        ? `${origin}/dat-lai-mat-khau`
        : 'https://www.cruxveritatis.org/dat-lai-mat-khau';

    await fetch(`${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    }).catch(() => {});

    // Always return generic success to prevent user enumeration
    return NextResponse.json(
      {
        success: true,
        message: 'Nếu địa chỉ email đã tồn tại trên hệ thống VERIDU, liên kết khôi phục mật khẩu đã được gửi tới hộp thư của bạn.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Không thể xử lý yêu cầu khôi phục mật khẩu lúc này.' },
      { status: 500 }
    );
  }
}
