import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
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
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = (authHeader && authHeader.startsWith('Bearer ')) 
      ? authHeader.substring(7).trim() 
      : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cljglzhuwdniynfkzkxc.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsamdsemh1d2RuaXluZmt6a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTUwMjMsImV4cCI6MjEwMTM5MTAyM30.vcZhNT-2NVkggDWCIlGGhqR9az30ASbAGOUly5-zAZI';

    // Create authenticated client if JWT is provided, otherwise use default client
    const dbClient = token
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } }
        })
      : supabase;

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
    const { data: existingPost, error: fetchError } = await dbClient
      .from('posts')
      .select('id, slug, status')
      .eq('id', numericId)
      .maybeSingle();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết trong CSDL Supabase.' }, { status: 404 });
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

    const formattedImage = formatImageUrl(featured_image);
    const cleanExcerpt = excerpt ? excerpt.trim() : '';
    const cleanTitle = title.trim();
    const postCategory = category || 'Thần Học';
    const postArticleType = (article_type === 'interactive') ? 'interactive' : 'standard';

    let updatedPost: any = null;

    // 4. Tier 1: Try Postgres RPC (SECURITY INVOKER)
    try {
      const { data: rpcData, error: rpcError } = await dbClient.rpc('update_post_content', {
        p_id: numericId,
        p_title: cleanTitle,
        p_slug: finalSlug,
        p_excerpt: cleanExcerpt,
        p_category: postCategory,
        p_article_type: postArticleType,
        p_featured_image: formattedImage,
        p_content: content,
        p_status: targetStatus
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        updatedPost = rpcData[0];
      } else if (rpcError) {
        console.warn('RPC update_post_content error, falling back to direct update:', rpcError.message);
      }
    } catch (rpcEx) {
      console.warn('RPC exception, falling back:', rpcEx);
    }

    // 5. Tier 2: Direct update fallback if RPC didn't return data
    if (!updatedPost) {
      const { data: updateData, error: updateError } = await dbClient
        .from('posts')
        .update({
          title: cleanTitle,
          slug: finalSlug,
          excerpt: cleanExcerpt,
          category: postCategory,
          article_type: postArticleType,
          featured_image: formattedImage,
          content,
          status: targetStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', numericId)
        .select();

      if (updateError) {
        console.error('Supabase update post error:', updateError);
        return NextResponse.json({ error: updateError.message || 'Lỗi khi cập nhật bài viết' }, { status: 500 });
      }

      if (updateData && updateData.length > 0) {
        updatedPost = updateData[0];
      }
    }

    // 6. Strict confirmation check
    if (!updatedPost) {
      console.error('Post update failed: 0 rows affected in Supabase for ID:', numericId);
      return NextResponse.json({ 
        error: 'Cơ sở dữ liệu Supabase không ghi nhận thay đổi nào cho bài viết #' + numericId + '. Vui lòng kiểm tra quyền đăng nhập.' 
      }, { status: 500 });
    }

    // 7. Complete ISR Cache Invalidation for all related paths
    try {
      revalidatePath('/', 'layout');
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
