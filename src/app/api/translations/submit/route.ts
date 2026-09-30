import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendAdminNewTranslationAlert } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      article_id,
      article_slug,
      article_title_vi,
      contributor_name, 
      contributor_email, 
      title_en, 
      content_en, 
      notes 
    } = body;

    if (!contributor_name || !contributor_email) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp Họ tên và Email của người dịch.' }, 
        { status: 400 }
      );
    }

    if (!title_en || !content_en) {
      return NextResponse.json(
        { error: 'Vui lòng nhập Tiêu đề và Nội dung bản dịch tiếng Anh.' }, 
        { status: 400 }
      );
    }

    // Gửi email thông báo cho Ban Quản Trị / Ban Học Vụ VERIDU (non-blocking)
    sendAdminNewTranslationAlert({
      articleId: article_id,
      articleSlug: article_slug,
      articleTitleVi: article_title_vi || 'Bài viết VERIDU',
      contributorName: contributor_name.trim(),
      contributorEmail: contributor_email.trim().toLowerCase(),
      titleEn: title_en.trim(),
      contentEn: content_en.trim(),
      notes: notes ? notes.trim() : undefined
    }).catch(err => console.error('[API translation submit] Lỗi gửi email cảnh báo cho Admin:', err));

    return NextResponse.json({ 
      success: true, 
      message: 'Bản dịch học thuật của bạn đã được gửi thành công tới Ban Biên Tập VERIDU. Chúng tôi sẽ thẩm định và xuất bản sớm nhất!' 
    });
  } catch (error: any) {
    console.error('API /api/translations/submit error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống khi gửi bản dịch' }, { status: 500 });
  }
}
