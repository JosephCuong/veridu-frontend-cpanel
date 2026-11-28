import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'admin');
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID bản nhạc cần xóa.' }, { status: 400 });
    }

    const db = getSupabaseServerClient();
    const { data: target } = await db
      .from('sacred_music')
      .select('slug')
      .eq('id', Number(id))
      .maybeSingle();

    const { error } = await db.from('sacred_music').delete().eq('id', Number(id));
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    try {
      revalidatePath('/thanh-nhac');
      if (target?.slug) revalidatePath(`/thanh-nhac/${target.slug}`);
      revalidatePath('/sitemap.xml');
    } catch {}

    const res = NextResponse.json({ success: true });
    return applyRefreshedAuthCookies(res, auth.refreshedSession);
  } catch (err: any) {
    console.error('API /api/sacred-music/delete error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Lỗi khi xóa bài Thánh Ca.' }, { status: 500 });
  }
}
