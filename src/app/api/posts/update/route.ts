import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, slug, excerpt, category, article_type, featured_image, content, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết cần cập nhật' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung không được để trống' }, { status: 400 });
    }

    const numericId = Number(id);

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt ? excerpt.trim() : '',
        category: category || 'Thần Học',
        article_type: article_type || 'theological',
        featured_image: featured_image ? featured_image.trim() : '',
        content,
        status: status || 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', numericId)
      .select();

    if (error) {
      console.error('Supabase update post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updatedPost = (data && data.length > 0) ? data[0] : null;

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (err: any) {
    console.error('API /api/posts/update error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
