import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase, getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';
import { formatImageUrl, convertGoogleDriveImagesInHtml } from '@/lib/htmlProcessor';
import { calculateReadingTime } from '@/lib/api';

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
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = (authHeader && authHeader.startsWith('Bearer ')) 
      ? authHeader.substring(7).trim() 
      : null;

    // Safely get authenticated client or fallback to default client
    const dbClient = getAuthenticatedSupabaseClient(token);

    const body = await request.json();
    const { 
      id, 
      title, 
      slug, 
      excerpt, 
      category, 
      article_type, 
      featured_image, 
      content, 
      status,
      author_name,
      reading_time,
      published_at,
      audio_url,
      video_url,
      title_en,
      excerpt_en,
      content_en,
      available_languages
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết cần cập nhật.' }, { status: 400 });
    }

    const numericId = Number(id);

    // 1. Fetch existing post to inspect prior status & slug
    const { data: existingPost, error: fetchError } = await dbClient
      .from('posts')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết trong CSDL Supabase.' }, { status: 404 });
    }

    const cleanTitle = (title && typeof title === 'string' && title.trim())
      ? title.trim()
      : (existingPost.title || 'Bài Viết VERIDU');

    const rawContent = (content !== undefined && content !== null)
      ? content
      : (existingPost.content || '');

    // 2. Safe slug computation
    let finalSlug = (slug && typeof slug === 'string' && slug.trim()) 
      ? slug.trim() 
      : (title ? slugifyVietnamese(title) : existingPost.slug);

    if (!finalSlug) {
      finalSlug = existingPost.slug || `bai-viet-${numericId}`;
    }

    // 3. Preserve 'published' status
    const targetStatus = (existingPost.status === 'published' || status === 'published') 
      ? 'published' 
      : (status || existingPost.status || 'published');

    const formattedImage = featured_image !== undefined ? formatImageUrl(featured_image) : existingPost.featured_image;
    const cleanContent = convertGoogleDriveImagesInHtml(rawContent);
    const cleanExcerpt = excerpt !== undefined ? (excerpt ? excerpt.trim() : '') : (existingPost.excerpt || '');
    const postCategory = category || existingPost.category || 'Thần Học';
    const postArticleType = (article_type === 'interactive') ? 'interactive' : (existingPost.article_type || 'standard');

    const finalReadingTime = (reading_time && typeof reading_time === 'string' && reading_time.trim())
      ? reading_time.trim()
      : (existingPost.reading_time || calculateReadingTime(cleanContent));
    const finalAuthorName = (author_name && typeof author_name === 'string' && author_name.trim())
      ? author_name.trim()
      : (existingPost.author_name || 'Ban Biên Tập VERIDU');
    const finalPublishedAt = (published_at && typeof published_at === 'string' && published_at.trim())
      ? new Date(published_at).toISOString()
      : (existingPost.published_at || null);

    const finalAudioUrl = (audio_url !== undefined)
      ? (audio_url ? String(audio_url).trim() : null)
      : undefined;
    const finalVideoUrl = (video_url !== undefined)
      ? (video_url ? String(video_url).trim() : null)
      : undefined;

    let updatedPost: any = null;

    // 4. Update payload with English translation fields
    const updatePayload: Record<string, any> = {
      title: cleanTitle,
      slug: finalSlug,
      excerpt: cleanExcerpt,
      category: postCategory,
      article_type: postArticleType,
      featured_image: formattedImage,
      content: cleanContent,
      author_name: finalAuthorName,
      reading_time: finalReadingTime,
      status: targetStatus,
      updated_at: new Date().toISOString()
    };

    if (finalPublishedAt) {
      updatePayload.published_at = finalPublishedAt;
    }
    if (finalAudioUrl !== undefined) {
      updatePayload.audio_url = finalAudioUrl;
    }
    if (finalVideoUrl !== undefined) {
      updatePayload.video_url = finalVideoUrl;
    }

    // English translation fields
    if (title_en !== undefined) {
      updatePayload.title_en = title_en ? String(title_en).trim() : null;
    }
    if (excerpt_en !== undefined) {
      updatePayload.excerpt_en = excerpt_en ? String(excerpt_en).trim() : null;
    }
    if (content_en !== undefined) {
      updatePayload.content_en = content_en ? String(content_en) : null;
    }
    if (available_languages !== undefined) {
      updatePayload.available_languages = available_languages;
    } else if (title_en || content_en || existingPost.title_en || existingPost.content_en) {
      updatePayload.available_languages = ['vi', 'en'];
    }

    const { data: updateData, error: updateError } = await dbClient
      .from('posts')
      .update(updatePayload)
      .eq('id', numericId)
      .select();

    if (updateError) {
      console.error('Supabase update post error:', updateError);
      return NextResponse.json({ error: updateError.message || 'Lỗi khi cập nhật bài viết' }, { status: 500 });
    }

    if (updateData && updateData.length > 0) {
      updatedPost = updateData[0];
    }

    // Fallback: If 0 rows returned by auth client, try direct supabase client
    if (!updatedPost) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('posts')
        .update(updatePayload)
        .eq('id', numericId)
        .select();

      if (!fallbackError && fallbackData && fallbackData.length > 0) {
        updatedPost = fallbackData[0];
      }
    }

    if (!updatedPost) {
      console.error('Post update failed: 0 rows affected in Supabase for ID:', numericId);
      return NextResponse.json({ 
        error: 'Cơ sở dữ liệu Supabase không ghi nhận thay đổi nào cho bài viết #' + numericId + '. Vui lòng kiểm tra quyền đăng nhập.' 
      }, { status: 500 });
    }

    // 5. Complete ISR Cache Invalidation for all related paths including International Portal
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/thu-vien');
      revalidatePath('/en');
      revalidatePath(`/${finalSlug}`);
      revalidatePath(`/en/${finalSlug}`);
      revalidatePath(`/thu-vien/${finalSlug}`);

      if (existingPost.slug && existingPost.slug !== finalSlug) {
        revalidatePath(`/${existingPost.slug}`);
        revalidatePath(`/en/${existingPost.slug}`);
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
