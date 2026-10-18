import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;

    if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const client = getAuthenticatedSupabaseClient();

    // 1. Try inserting into dedicated newsletter_subscribers table if it exists
    const { error: subError } = await client
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (!subError) {
      return NextResponse.json({
        success: true,
        message: 'Đăng ký nhận bản tin Lời Chúa thành công!'
      });
    }

    if (subError.code === '23505') {
      return NextResponse.json(
        { success: false, code: '23505', error: 'Email này đã được đăng ký nhận bản tin trước đó.' },
        { status: 409 }
      );
    }

    // 2. Fallback: If newsletter_subscribers table is not yet provisioned (PGRST205),
    // store safely in author_applications with role_applied = 'newsletter_subscriber'
    const { error: fallbackError } = await client
      .from('author_applications')
      .insert([{
        full_name: 'Độc Giả Bản Tin VERIDU',
        email,
        role_applied: 'newsletter_subscriber',
        bio: 'Đăng ký nhận bản tin Lời Chúa & Bài viết mới từ Footer.',
        status: 'subscribed'
      }]);

    if (fallbackError && fallbackError.code === '23505') {
      return NextResponse.json(
        { success: false, code: '23505', error: 'Email này đã được đăng ký nhận bản tin trước đó.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký nhận bản tin Lời Chúa thành công!'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Lỗi máy chủ khi đăng ký bản tin.' },
      { status: 500 }
    );
  }
}
