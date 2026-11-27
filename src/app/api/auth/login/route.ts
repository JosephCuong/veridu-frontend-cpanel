import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      rememberMe,
      turnstileToken,
      access_token: providedToken,
      refresh_token: providedRefreshToken,
    } = body || {};

    let accessToken = '';
    let refreshToken = '';
    let user: any = null;

    if (providedToken && typeof providedToken === 'string') {
      // OAuth / PKCE session exchange verified directly against Supabase Auth
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${providedToken}`,
        },
        cache: 'no-store',
      });
      if (!userRes.ok) {
        return NextResponse.json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' }, { status: 401 });
      }
      const verifiedUser: any = await userRes.json();
      if (!verifiedUser?.id) {
        return NextResponse.json({ error: 'Phiên đăng nhập không hợp lệ.' }, { status: 401 });
      }
      accessToken = providedToken;
      refreshToken = typeof providedRefreshToken === 'string' ? providedRefreshToken : '';
      user = verifiedUser;
    } else {
      // Password login: verify Cloudflare Turnstile first
      const turnstile = await verifyTurnstileToken(request, turnstileToken, 'login');
      if (!turnstile.ok) {
        return NextResponse.json(
          { error: turnstile.error || 'Xác thực chống bot không thành công.' },
          { status: 403 }
        );
      }

      if (!email || !password) {
        return NextResponse.json({ error: 'Vui lòng cung cấp email và mật khẩu.' }, { status: 400 });
      }

      const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: String(email).trim().toLowerCase(),
          password: String(password),
        }),
        cache: 'no-store',
      });

      if (!tokenRes.ok) {
        let errCode = '';
        try {
          const errData: any = await tokenRes.json();
          errCode = String(errData?.error_code || errData?.error || '');
        } catch {}

        const msg =
          errCode === 'email_not_confirmed'
            ? 'Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư (kể cả mục Spam/Quảng cáo) để kích hoạt.'
            : 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
        return NextResponse.json({ error: msg }, { status: 401 });
      }

      const data: any = await tokenRes.json();
      if (!data?.access_token || !data?.user?.id) {
        return NextResponse.json(
          { error: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.' },
          { status: 401 }
        );
      }

      accessToken = data.access_token;
      refreshToken = data.refresh_token || '';
      user = data.user;
    }

    // Fetch or initialize verified profile & roles from Supabase DB using service role
    const adminDb = getSupabaseServerClient();
    const [{ data: existingProfile }, { data: rolesRows }] = await Promise.all([
      adminDb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      adminDb.from('user_roles').select('role_id').eq('user_id', user.id),
    ]);

    let profile = existingProfile;
    let isNewProfile = false;

    if (!profile) {
      isNewProfile = true;
      const meta = user.user_metadata || {};
      const newProfileRow = {
        id: user.id,
        email: user.email || '',
        full_name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Thành Viên VERIDU',
        christian_name: meta.christian_name || '',
        parish: meta.parish || '',
        diocese: meta.diocese || '',
        vocation: meta.vocation || 'layperson',
        avatar_url: meta.avatar_url || meta.picture || '',
        role: 'Học Viên',
        points: 100,
        manna: 100,
        streak: 1,
        current_title: 'NGƯỜI TÌM HIỂU',
        badges: ['tan_tong'],
        profile_completed: Boolean(meta.christian_name || meta.parish || meta.diocese),
      };
      const { data: inserted } = await adminDb
        .from('profiles')
        .upsert(newProfileRow, { onConflict: 'id' })
        .select('*')
        .maybeSingle();
      profile = inserted || newProfileRow;
    } else if (!profile.avatar_url && (user.user_metadata?.avatar_url || user.user_metadata?.picture)) {
      // Sync Google avatar if profile doesn't have one yet
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      await adminDb
        .from('profiles')
        .update({ avatar_url: googleAvatar, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      profile.avatar_url = googleAvatar;
    }

    const roleIds = (rolesRows || []).map((r: any) => String(r.role_id || '').toLowerCase());
    const dbRoleLower = String(profile?.role || '').toLowerCase();
    const isAdmin =
      roleIds.includes('admin') ||
      dbRoleLower === 'admin' ||
      dbRoleLower === 'quản trị viên' ||
      dbRoleLower === 'super_admin';

    const resolvedRole = isAdmin ? 'Quản Trị Viên' : (profile?.role || 'Học Viên');
    const needsOnboarding = isNewProfile || profile?.profile_completed === false;

    const userProfile = {
      id: user.id,
      username: profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'member',
      email: user.email || '',
      phone: profile?.phone || '',
      displayName: profile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      fullName: profile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      christianName: profile?.christian_name || '',
      parish: profile?.parish || '',
      diocese: profile?.diocese || '',
      vocation: profile?.vocation || 'layperson',
      role: resolvedRole,
      streak: profile?.streak || 1,
      points: profile?.points !== undefined && profile?.points !== null ? profile.points : 100,
      manna: profile?.manna !== undefined && profile?.manna !== null ? profile.manna : 100,
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      selected_title: profile?.current_title || 'NGƯỜI TÌM HIỂU',
      badges: Array.isArray(profile?.badges) ? profile.badges : ['tan_tong'],
      profile_completed: Boolean(profile?.profile_completed),
    };

    const response = NextResponse.json({
      success: true,
      user: userProfile,
      needsOnboarding,
      session: refreshToken ? { access_token: accessToken, refresh_token: refreshToken } : undefined,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = rememberMe ? 72 * 60 * 60 : undefined;

    // HttpOnly access token cookie
    response.cookies.set('veridu_auth_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });

    // HttpOnly refresh token cookie (keeps 72h session alive beyond Supabase 1h JWT expiry)
    if (refreshToken) {
      response.cookies.set('veridu_refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        ...(maxAge ? { maxAge } : {}),
      });
    }

    // Clear legacy non-HttpOnly token cookie if present
    response.cookies.set('veridu_token', '', {
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    // Public UI display profile cookie (non-secret)
    response.cookies.set('veridu_user', encodeURIComponent(JSON.stringify(userProfile)), {
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return response;
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ trong quá trình đăng nhập.' }, { status: 500 });
  }
}
