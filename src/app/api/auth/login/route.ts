import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe, access_token: providedToken } = body || {};

    let accessToken = '';
    let refreshToken = '';
    let user: any = null;

    if (providedToken && typeof providedToken === 'string') {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${providedToken}`,
        },
        cache: 'no-store',
      });
      if (!userRes.ok) {
        return NextResponse.json({ error: 'Phiên đăng nhập không hợp lệ' }, { status: 401 });
      }
      const verifiedUser: any = await userRes.json();
      if (!verifiedUser?.id) {
        return NextResponse.json({ error: 'Phiên đăng nhập không hợp lệ' }, { status: 401 });
      }
      accessToken = providedToken;
      user = verifiedUser;
    } else {
      if (!email || !password) {
        return NextResponse.json({ error: 'Vui lòng cung cấp email và mật khẩu' }, { status: 400 });
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
        return NextResponse.json(
          { error: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.' },
          { status: 401 }
        );
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

    // Fetch verified profile & roles from Supabase DB using service role
    const adminDb = getSupabaseServerClient();
    const [{ data: profile }, { data: rolesRows }] = await Promise.all([
      adminDb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      adminDb.from('user_roles').select('role_id').eq('user_id', user.id),
    ]);

    const roleIds = (rolesRows || []).map((r: any) => String(r.role_id || '').toLowerCase());
    const dbRoleLower = String(profile?.role || '').toLowerCase();
    const isAdmin =
      roleIds.includes('admin') ||
      dbRoleLower === 'admin' ||
      dbRoleLower === 'quản trị viên' ||
      dbRoleLower === 'super_admin';

    const resolvedRole = isAdmin ? 'Quản Trị Viên' : (profile?.role || 'Học Viên');

    const userProfile = {
      id: user.id,
      username: profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'member',
      email: user.email || '',
      displayName: profile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      fullName: profile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      christianName: profile?.christian_name || '',
      parish: profile?.parish || '',
      diocese: profile?.diocese || '',
      role: resolvedRole,
      streak: profile?.streak || 1,
      points: profile?.points !== undefined && profile?.points !== null ? profile.points : 100,
      manna: profile?.manna !== undefined && profile?.manna !== null ? profile.manna : 100,
      avatar: profile?.avatar_url || '',
      selected_title: profile?.current_title || 'NGƯỜI TÌM HIỂU',
      badges: Array.isArray(profile?.badges) ? profile.badges : ['tan_tong'],
    };

    const response = NextResponse.json({
      success: true,
      user: userProfile,
      session: refreshToken ? { access_token: accessToken, refresh_token: refreshToken } : undefined,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = rememberMe ? 72 * 60 * 60 : undefined;

    // HttpOnly auth cookie protects JWT from XSS
    response.cookies.set('veridu_auth_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });

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
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ trong quá trình đăng nhập' }, { status: 500 });
  }
}
