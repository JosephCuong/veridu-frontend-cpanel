import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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

    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        slug,
        excerpt: excerpt || '',
        category: category || 'Thần Học',
        article_type: article_type || 'theological',
        featured_image: featured_image || '',
        content,
        status: status || 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data });
  } catch (err: any) {
    console.error('API /api/posts/update error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
