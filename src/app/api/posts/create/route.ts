import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

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
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt ? excerpt.trim() : '',
          category: category || 'Thần Học',
          article_type: article_type || 'theological',
          featured_image: featured_image ? featured_image.trim() : '',
          content,
          status: status || 'published',
          author_id: author_id || 'eef94645-01fb-471f-9b10-cdd3fea35143'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase create post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const createdPost = (data && data.length > 0) ? data[0] : null;

    // Flush ISR Cache immediately on post creation
    try {
      revalidatePath('/thu-vien');
      revalidatePath('/');
      if (slug) revalidatePath(`/${slug}`);
    } catch (e) {}

    return NextResponse.json({ success: true, post: createdPost });
  } catch (err: any) {
    console.error('API /api/posts/create error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
