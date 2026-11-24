import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';
import { revalidatePostPaths } from '@/lib/revalidateHelper';

export async function DELETE(request: Request) {
  try {
    const auth = await verifyApiAuth(request, 'any');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết cần xóa' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: existingPost } = await supabase
      .from('posts')
      .select('id, slug, author_id, title_en')
      .eq('id', id)
      .maybeSingle();

    if (!existingPost) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết cần xóa' }, { status: 404 });
    }

    if (!auth.user.isAdmin && existingPost.author_id !== auth.user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền xóa bài viết này' }, { status: 403 });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePostPaths({ slug: existingPost.slug, titleEn: existingPost.title_en });

    return NextResponse.json({ success: true, message: 'Đã xóa bài viết thành công' });
  } catch (err: any) {
    console.error('API /api/posts/delete error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
