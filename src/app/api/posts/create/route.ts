import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';
import { formatImageUrl, convertGoogleDriveImagesInHtml } from '@/lib/htmlProcessor';
import { calculateReadingTime } from '@/lib/api';
import { revalidatePostPaths } from '@/lib/revalidateHelper';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const auth = await verifyApiAuth(request, 'any');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const supabase = getSupabaseServerClient();
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
      published_at,
      audio_url,
      video_url,
      title_en,
      excerpt_en,
      content_en,
      available_languages
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

    const validAuthorId = (auth.user.isAdmin && author_id && typeof author_id === 'string' && UUID_REGEX.test(author_id))
      ? author_id
      : auth.user.id;
    const effectiveStatus = (auth.user.isAdmin || auth.user.isAuthor)
      ? (status || 'published')
      : 'pending';

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
    const finalAudioUrl = (audio_url && typeof audio_url === 'string' && audio_url.trim())
      ? audio_url.trim()
      : null;
    const finalVideoUrl = (video_url && typeof video_url === 'string' && video_url.trim())
      ? video_url.trim()
      : null;

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
          status: effectiveStatus,
          author_id: validAuthorId,
          author_name: finalAuthorName,
          reading_time: finalReadingTime,
          published_at: finalPublishedAt,
          audio_url: finalAudioUrl,
          video_url: finalVideoUrl,
          title_en: title_en ? String(title_en).trim() : null,
          excerpt_en: excerpt_en ? String(excerpt_en).trim() : null,
          content_en: content_en ? convertGoogleDriveImagesInHtml(String(content_en)) : null,
          available_languages: available_languages || ((title_en || content_en) ? ['vi', 'en'] : ['vi'])
        }
      ])
      .select();

    if (error) {
      console.error('Supabase create post error:', error);
      return NextResponse.json({ error: error.message || 'Lỗi khi lưu bài viết vào CSDL Supabase' }, { status: 500 });
    }

    const createdPost = (data && data.length > 0) ? data[0] : null;

    // Flush targeted ISR Cache immediately on post creation
    revalidatePostPaths({
      slug: finalSlug,
      titleEn: createdPost?.title_en || title_en,
    });

    return NextResponse.json({ success: true, post: createdPost, slug: finalSlug });
  } catch (err: any) {
    console.error('API /api/posts/create error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống khi tạo bài viết' }, { status: 500 });
  }
}
