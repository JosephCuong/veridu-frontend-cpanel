import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTarget = requestUrl.searchParams.get('redirect') || '/ho-so';
  const rememberParam = requestUrl.searchParams.get('remember');
  const isRemember = rememberParam === '1';

  if (!code) {
    return NextResponse.redirect(new URL('/dang-nhap?error=missing_code', requestUrl.origin));
  }

  try {
    // 1. Exchange the auth code for a Supabase session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error('Google OAuth callback exchange error:', error);
      return NextResponse.redirect(new URL('/dang-nhap?error=oauth_exchange_failed', requestUrl.origin));
    }

    const user = data.user;
    const session = data.session;

    // 2. Fetch or initialize the user profile in Supabase
    let dbProfile: any = null;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        dbProfile = profileData;
      } else {
        // Create initial profile for first-time Google sign-in
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Thành Viên VERIDU',
          christian_name: user.user_metadata?.christian_name || 'Giuse',
          parish: 'Tân Định',
          diocese: 'Giáo Phận Sài Gòn',
          role: 'Học Viên',
          points: 100,
          manna: 100,
          streak: 1,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          current_title: 'NGƯỜI TÌM HIỂU',
          badges: ['tan_tong']
        };

        const { data: insertedProfile } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select('*')
          .maybeSingle();

        dbProfile = insertedProfile || newProfile;
      }
    } catch (profileErr) {
      console.warn('Profile sync warning during Google OAuth:', profileErr);
    }

    const roleName = (dbProfile?.role === 'admin' || user.user_metadata?.role === 'admin')
      ? 'Quản Trị Viên'
      : (dbProfile?.role || 'Học Viên');

    const userProfile = {
      id: user.id,
      username: dbProfile?.email?.split('@')[0] || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      displayName: dbProfile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      fullName: dbProfile?.full_name || user.user_metadata?.full_name || 'Thành Viên VERIDU',
      christianName: dbProfile?.christian_name || user.user_metadata?.christian_name || 'Giuse',
      parish: dbProfile?.parish || 'Tân Định',
      diocese: dbProfile?.diocese || 'Giáo Phận Sài Gòn',
      role: roleName,
      streak: dbProfile?.streak || 1,
      points: dbProfile?.points !== undefined && dbProfile?.points !== null ? dbProfile.points : 100,
      manna: dbProfile?.manna !== undefined && dbProfile?.manna !== null ? dbProfile.manna : 100,
      avatar: dbProfile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      selected_title: dbProfile?.current_title || 'NGƯỜI TÌM HIỂU',
      badges: dbProfile?.badges || ['tan_tong']
    };

    // 3. Build response with redirect and secure auth cookies
    const destinationUrl = new URL(redirectTarget, requestUrl.origin);
    const response = NextResponse.redirect(destinationUrl);

    const token = session?.access_token || 'sb_session_active';
    const jsonString = JSON.stringify(userProfile);
    const encodedUser = encodeURIComponent(jsonString);

    // 72 hours max if user checked remember-me; otherwise browser session cookie
    const cookieOptions: any = {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };

    if (isRemember) {
      cookieOptions.maxAge = 72 * 60 * 60; // 72 hours
    }

    response.cookies.set('veridu_token', token, cookieOptions);
    response.cookies.set('veridu_user', encodedUser, cookieOptions);

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return response;
  } catch (err: any) {
    console.error('Unhandled error in Google OAuth callback:', err);
    return NextResponse.redirect(new URL('/dang-nhap?error=internal_oauth_error', requestUrl.origin));
  }
}
