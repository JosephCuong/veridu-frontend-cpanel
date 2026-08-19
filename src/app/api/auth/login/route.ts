import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

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

    // Set secure HttpOnly Cookie on response
    response.cookies.set('veridu_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 ngày
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ trong quá trình đăng nhập' }, { status: 500 });
  }
}
