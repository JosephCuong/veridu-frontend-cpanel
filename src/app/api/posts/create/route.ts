import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';
import { formatImageUrl, convertGoogleDriveImagesInHtml } from '@/lib/htmlProcessor';

import { calculateReadingTime } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_AUTHOR_ID = 'eef94645-01fb-471f-9b10-cdd3fea35143';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      excerpt, 
      category, 
      article_type, 
      featured_image, 
      content, 
      status, 
      author_id,
      author_name,
      reading_time,
      published_at
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung bài viết không được để trống.' }, { status: 400 });
    }

    let finalSlug = (slug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (!finalSlug) {
      finalSlug = `bai-viet-${Date.now()}`;
    }

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingPost) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const validAuthorId = (author_id && typeof author_id === 'string' && UUID_REGEX.test(author_id))
      ? author_id
      : DEFAULT_AUTHOR_ID;

    const normalizedArticleType = (article_type === 'interactive') ? 'interactive' : 'standard';
    const cleanContent = convertGoogleDriveImagesInHtml(content);
    const finalReadingTime = (reading_time && typeof reading_time === 'string' && reading_time.trim())
      ? reading_time.trim()
      : calculateReadingTime(cleanContent);
    const finalAuthorName = (author_name && typeof author_name === 'string' && author_name.trim())
      ? author_name.trim()
      : 'Ban Biên Tập VERIDU';
    const finalPublishedAt = (published_at && typeof published_at === 'string' && published_at.trim())
      ? new Date(published_at).toISOString()
      : new Date().toISOString();

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: title.trim(),
          slug: finalSlug,
          excerpt: excerpt ? excerpt.trim() : '',
          category: category || 'Thần Học',
          article_type: normalizedArticleType,
          featured_image: formatImageUrl(featured_image),
          content: cleanContent,
          status: status || 'published',
          author_id: validAuthorId,
          author_name: finalAuthorName,
          reading_time: finalReadingTime,
          published_at: finalPublishedAt
        }
      ])
      .select();

    if (error) {
      console.error('Supabase create post error:', error);
      return NextResponse.json({ error: error.message || 'Lỗi khi lưu bài viết vào CSDL Supabase' }, { status: 500 });
    }

    const createdPost = (data && data.length > 0) ? data[0] : null;

    // Flush ISR Cache immediately on post creation
    try {
      revalidatePath('/thu-vien');
      revalidatePath('/');
      if (finalSlug) {
        revalidatePath(`/${finalSlug}`);
        revalidatePath(`/thu-vien/${finalSlug}`);
      }
    } catch (e) {
      console.warn('Cache revalidation warning on create:', e);
    }

    return NextResponse.json({ success: true, post: createdPost, slug: finalSlug });
  } catch (err: any) {
    console.error('API /api/posts/create error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống khi tạo bài viết' }, { status: 500 });
  }
}
