import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng cung cấp email và mật khẩu' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Email hoặc mật khẩu không chính xác' }, 
        { status: 401 }
      );
    }

    const { access_token, user } = data.session;

    // Fetch user profile from Supabase CSDL
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const userData = profile || { id: user.id, email: user.email, role: 'user' };

    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Set secure Cookie on response (72 hours max if rememberMe, otherwise browser session cookie)
    const cookieOptions: any = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    if (rememberMe) {
      cookieOptions.maxAge = 72 * 60 * 60; // 72 hours
    }

    response.cookies.set('veridu_token', access_token, cookieOptions);
    response.cookies.set('veridu_user', encodeURIComponent(JSON.stringify(userData)), cookieOptions);

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ trong quá trình đăng nhập' }, { status: 500 });
  }
}
