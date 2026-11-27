import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email: rawEmail,
      password: rawPassword,
      fullName: rawFullName,
      christianName: rawChristianName,
      parish: rawParish,
      diocese: rawDiocese,
      vocation: rawVocation,
      turnstileToken,
    } = body || {};

    // 1. Verify Cloudflare Turnstile (anti-bot)
    const turnstile = await verifyTurnstileToken(request, turnstileToken, 'signup');
    if (!turnstile.ok) {
      return NextResponse.json(
        { success: false, error: turnstile.error || 'Xác thực chống bot thất bại.' },
        { status: 403 }
      );
    }

    const email = String(rawEmail || '').trim().toLowerCase();
    const password = String(rawPassword || '');
    const fullName = String(rawFullName || '').trim();
    const christianName = String(rawChristianName || '').trim();
    const parish = String(rawParish || '').trim();
    const diocese = String(rawDiocese || '').trim();
    const vocation = String(rawVocation || 'layperson').trim() || 'layperson';

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: 'Địa chỉ email không hợp lệ.' }, { status: 400 });
    }

    if (fullName.length < 2) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập Họ và Tên (tối thiểu 2 ký tự).' }, { status: 400 });
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu phải có tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số.',
        },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const redirectTo =
      origin.includes('localhost') || origin.includes('127.0.0.1')
        ? `${origin}/auth/callback`
        : 'https://www.cruxveritatis.org/auth/callback';

    // 2. Call Supabase Auth signup REST endpoint
    const signupRes = await fetch(
      `${supabaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            full_name: fullName,
            christian_name: christianName,
            parish,
            diocese,
            vocation,
          },
        }),
        cache: 'no-store',
      }
    );

    const signupData: any = await signupRes.json().catch(() => ({}));

    if (!signupRes.ok) {
      const msgLower = String(signupData?.msg || signupData?.error_description || signupData?.message || '').toLowerCase();
      let friendly = 'Không thể tạo tài khoản lúc này. Vui lòng thử lại.';
      if (msgLower.includes('already registered') || msgLower.includes('already exists')) {
        friendly = 'Email này đã được đăng ký. Bạn hãy chuyển sang trang Đăng Nhập hoặc dùng Quên Mật Khẩu.';
      } else if (msgLower.includes('rate limit') || signupRes.status === 429) {
        friendly = 'Hệ thống đang nhận quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
      } else if (signupData?.msg || signupData?.message) {
        friendly = String(signupData.msg || signupData.message);
      }
      return NextResponse.json({ success: false, error: friendly }, { status: signupRes.status >= 400 ? signupRes.status : 400 });
    }

    const createdUser = signupData?.user || (signupData?.id ? signupData : null);
    const accessToken: string = signupData?.access_token || signupData?.session?.access_token || '';
    const refreshToken: string = signupData?.refresh_token || signupData?.session?.refresh_token || '';

    // Supabase returns empty identities when email already exists with confirm email enabled
    if (createdUser && Array.isArray(createdUser.identities) && createdUser.identities.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email này đã có tài khoản trên VERIDU. Vui lòng đăng nhập hoặc chọn Quên Mật Khẩu.',
        },
        { status: 409 }
      );
    }

    // 3. Ensure pastoral fields are synced to public.profiles via service_role
    if (createdUser?.id) {
      try {
        const adminDb = getSupabaseServerClient();
        await adminDb.from('profiles').upsert(
          {
            id: createdUser.id,
            email,
            full_name: fullName,
            christian_name: christianName,
            parish,
            diocese,
            vocation,
            role: 'Học Viên',
            points: 100,
            manna: 100,
            streak: 1,
            current_title: 'NGƯỜI TÌM HIỂU',
            badges: ['tan_tong'],
            profile_completed: Boolean(christianName || parish || diocese),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (e) {
        console.warn('Register profile sync warning:', e);
      }
    }

    const userProfile = {
      id: createdUser?.id || '',
      username: email.split('@')[0],
      email,
      displayName: fullName,
      fullName,
      christianName,
      parish,
      diocese,
      vocation,
      role: 'Học Viên',
      streak: 1,
      points: 100,
      manna: 100,
      avatar: '',
      selected_title: 'NGƯỜI TÌM HIỂU',
      badges: ['tan_tong'],
      profile_completed: Boolean(christianName || parish || diocese),
    };

    const needsEmailConfirm = !accessToken;
    const response = NextResponse.json({
      success: true,
      needsEmailConfirm,
      user: userProfile,
      session: accessToken && refreshToken ? { access_token: accessToken, refresh_token: refreshToken } : undefined,
    });

    if (accessToken) {
      const isProd = process.env.NODE_ENV === 'production';
      response.cookies.set('veridu_auth_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
      });
      if (refreshToken) {
        response.cookies.set('veridu_refresh_token', refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: '/',
        });
      }
      response.cookies.set('veridu_user', encodeURIComponent(JSON.stringify(userProfile)), {
        secure: isProd,
        sameSite: 'lax',
        path: '/',
      });
    }

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ trong quá trình đăng ký tài khoản.' },
      { status: 500 }
    );
  }
}
