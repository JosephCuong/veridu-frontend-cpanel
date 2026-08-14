import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, category, article_type, featured_image, content, status, author_id } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung không được để trống' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          slug,
          excerpt: excerpt || '',
          category: category || 'Thần Học',
          article_type: article_type || 'theological',
          featured_image: featured_image || '',
          content,
          status: status || 'published',
          author_id: author_id || 'eef94645-01fb-471f-9b10-cdd3fea35143'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase create post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data });
  } catch (err: any) {
    console.error('API /api/posts/create error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
