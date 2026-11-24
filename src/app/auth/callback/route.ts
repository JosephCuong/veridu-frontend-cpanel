import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawRedirect = requestUrl.searchParams.get('redirect') || '/ho-so';
  // Prevent open redirect: only allow relative internal paths
  const redirectTarget = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/ho-so';
  const rememberParam = requestUrl.searchParams.get('remember');
  const isRemember = rememberParam === '1';

  if (!code) {
    return NextResponse.redirect(new URL('/dang-nhap?error=missing_code', requestUrl.origin));
  }

  try {
    const statelessAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await statelessAnon.auth.exchangeCodeForSession(code);

    if (error || !data.user || !data.session) {
      console.error('Google OAuth callback exchange error:', error);
      return NextResponse.redirect(new URL('/dang-nhap?error=oauth_exchange_failed', requestUrl.origin));
    }

    const user = data.user;
    const session = data.session;
    const adminDb = getSupabaseServerClient();

    // Fetch or initialize user profile in Supabase using server client
    let dbProfile: any = null;
    try {
      const { data: profileData } = await adminDb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        dbProfile = profileData;
      } else {
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Thành Viên VERIDU',
          christian_name: user.user_metadata?.christian_name || '',
          parish: '',
          diocese: '',
          role: 'Học Viên',
          points: 100,
          manna: 100,
          streak: 1,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          current_title: 'NGƯỜI TÌM HIỂU',
          badges: ['tan_tong'],
        };

        const { data: insertedProfile } = await adminDb
          .from('profiles')
          .insert(newProfile)
          .select('*')
          .maybeSingle();

        dbProfile = insertedProfile || newProfile;
      }
    } catch (profileErr) {
      console.warn('Profile sync warning during Google OAuth:', profileErr);
    }

    // Check DB user_roles strictly (never trust user_metadata.role)
    const { data: rolesRows } = await adminDb
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);

    const roleIds = (rolesRows || []).map((r: any) => String(r.role_id || '').toLowerCase());
    const dbRoleLower = String(dbProfile?.role || '').toLowerCase();
    const isAdmin =
      roleIds.includes('admin') ||
      dbRoleLower === 'admin' ||
      dbRoleLower === 'quản trị viên' ||
      dbRoleLower === 'super_admin';

    const roleName = isAdmin ? 'Quản Trị Viên' : (dbProfile?.role || 'Học Viên');

    const userProfile = {
      id: user.id,
      username: dbProfile?.email?.split('@')[0] || user.email?.split('@')[0] || 'member',
      email: user.email || '',
      displayName: dbProfile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      fullName: dbProfile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      christianName: dbProfile?.christian_name || '',
      parish: dbProfile?.parish || '',
      diocese: dbProfile?.diocese || '',
      role: roleName,
      streak: dbProfile?.streak || 1,
      points: dbProfile?.points !== undefined && dbProfile?.points !== null ? dbProfile.points : 100,
      manna: dbProfile?.manna !== undefined && dbProfile?.manna !== null ? dbProfile.manna : 100,
      avatar: dbProfile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      selected_title: dbProfile?.current_title || 'NGƯỜI TÌM HIỂU',
      badges: Array.isArray(dbProfile?.badges) ? dbProfile.badges : ['tan_tong'],
    };

    const destinationUrl = new URL(redirectTarget, requestUrl.origin);
    const response = NextResponse.redirect(destinationUrl);

    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = isRemember ? 72 * 60 * 60 : undefined;

    response.cookies.set('veridu_auth_token', session.access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      ...(maxAge ? { maxAge } : {}),
    });

    // Clear legacy non-HttpOnly token cookie
    response.cookies.set('veridu_token', '', {
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: 0,
    });

    response.cookies.set('veridu_user', encodeURIComponent(JSON.stringify(userProfile)), {
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      ...(maxAge ? { maxAge } : {}),
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return response;
  } catch (err: any) {
    console.error('Unhandled error in Google OAuth callback:', err);
    return NextResponse.redirect(new URL('/dang-nhap?error=internal_oauth_error', requestUrl.origin));
  }
}
