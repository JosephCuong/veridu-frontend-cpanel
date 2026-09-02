import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';
import { formatImageUrl } from '@/lib/htmlProcessor';

export const dynamic = 'force-dynamic';

function slugifyVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, slug, excerpt, category, article_type, featured_image, content, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết cần cập nhật.' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung bài viết không được để trống.' }, { status: 400 });
    }

    const numericId = Number(id);

    // 1. Fetch existing post to inspect prior status & slug
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, slug, status')
      .eq('id', numericId)
      .maybeSingle();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết trong CSDL.' }, { status: 404 });
    }

    // 2. Safe slug computation
    let finalSlug = (slug && typeof slug === 'string' && slug.trim()) 
      ? slug.trim() 
      : slugifyVietnamese(title);

    if (!finalSlug) {
      finalSlug = existingPost.slug || `bai-viet-${numericId}`;
    }

    // 3. Preserve 'published' status
    const targetStatus = (existingPost.status === 'published' || status === 'published') 
      ? 'published' 
      : (status || existingPost.status || 'published');

    // 4. Update Supabase record
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt ? excerpt.trim() : '',
        category: category || 'Thần Học',
        article_type: article_type || 'theological',
        featured_image: formatImageUrl(featured_image),
        content,
        status: targetStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', numericId)
      .select();

    if (error) {
      console.error('Supabase update post error:', error);
      return NextResponse.json({ error: error.message || 'Lỗi khi cập nhật bài viết' }, { status: 500 });
    }

    const updatedPost = (data && data.length > 0) ? data[0] : null;

    // 5. Complete ISR Cache Invalidation for all related paths
    try {
      revalidatePath('/');
      revalidatePath('/thu-vien');
      revalidatePath(`/${finalSlug}`);
      revalidatePath(`/thu-vien/${finalSlug}`);

      if (existingPost.slug && existingPost.slug !== finalSlug) {
        revalidatePath(`/${existingPost.slug}`);
        revalidatePath(`/thu-vien/${existingPost.slug}`);
      }
    } catch (e) {
      console.warn('Cache revalidation warning:', e);
    }

    return NextResponse.json({ success: true, post: updatedPost, slug: finalSlug });
  } catch (err: any) {
    console.error('API /api/posts/update error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống khi cập nhật' }, { status: 500 });
  }
}
