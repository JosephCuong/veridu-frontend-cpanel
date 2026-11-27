import { NextResponse } from 'next/server';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = await verifyApiAuth(request, 'any');
  if (!auth.authenticated || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const currentPassword = String(body?.currentPassword || '');
    const newPassword = String(body?.newPassword || '');

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu mới phải dài tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số.',
        },
        { status: 400 }
      );
    }

    const providers = auth.user.providers || [];
    const hasEmailProvider = providers.includes('email');

    // If user already has a password, verify currentPassword first
    if (hasEmailProvider) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng nhập mật khẩu hiện tại để xác minh trước khi đổi.' },
          { status: 400 }
        );
      }
      const verifyRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auth.user.email,
          password: currentPassword,
        }),
        cache: 'no-store',
      });
      if (!verifyRes.ok) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu hiện tại chưa chính xác.' },
          { status: 400 }
        );
      }
    }

    const adminDb = getSupabaseServerClient();
    const { error } = await adminDb.auth.admin.updateUserById(auth.user.id, {
      password: newPassword,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Không thể cập nhật mật khẩu lúc này.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: hasEmailProvider
        ? 'Đã đổi mật khẩu thành công! Mật khẩu mới có hiệu lực cho cả Website và App VERIDU.'
        : 'Đã thiết lập mật khẩu thành công! Từ giờ bạn có thể đăng nhập App VERIDU Desktop bằng Email Google và mật khẩu này.',
    });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return applyRefreshedAuthCookies(response, auth.refreshedSession);
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi cập nhật mật khẩu.' }, { status: 500 });
  }
}
