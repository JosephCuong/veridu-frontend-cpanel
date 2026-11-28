import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';
import { slugify } from '@/lib/slugHelper';
import { extractGoogleDriveId, getYoutubeThumbnailUrl } from '@/lib/sacredMusic';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'admin');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const body = await request.json();
    const {
      id,
      title,
      title_en,
      slug,
      composer,
      lyricist,
      liturgical_season,
      mass_part,
      liturgical_year,
      psalm_number,
      musical_key,
      voicing,
      youtube_url,
      karaoke_youtube_url,
      audio_url,
      pdf_url,
      pdf_drive_id,
      thumbnail_url,
      scripture_ref,
      scripture_book_slug,
      scripture_chapter,
      related_post_slug,
      lyrics,
      description,
      status,
      is_featured,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Tiêu đề bài Thánh Ca không được để trống.' }, { status: 400 });
    }

    const cleanSlug = (slug && String(slug).trim() ? slugify(String(slug)) : slugify(title)) || `thanh-ca-${Date.now()}`;
    const resolvedDriveId = extractGoogleDriveId(pdf_drive_id || pdf_url);
    const resolvedThumb =
      (thumbnail_url && String(thumbnail_url).trim()) ||
      getYoutubeThumbnailUrl(youtube_url) ||
      getYoutubeThumbnailUrl(karaoke_youtube_url) ||
      null;

    const payload: Record<string, any> = {
      slug: cleanSlug,
      title: title.trim(),
      title_en: title_en ? String(title_en).trim() : null,
      composer: composer && String(composer).trim() ? String(composer).trim() : 'Ban Thánh Nhạc VERIDU',
      lyricist: lyricist ? String(lyricist).trim() : null,
      liturgical_season: liturgical_season || 'Thường Niên',
      mass_part: mass_part || 'Đáp Ca',
      liturgical_year: liturgical_year || 'Chung',
      psalm_number: psalm_number !== '' && psalm_number !== null && psalm_number !== undefined ? Number(psalm_number) : null,
      musical_key: musical_key ? String(musical_key).trim() : null,
      voicing: voicing ? String(voicing).trim() : 'Đơn ca / Cộng đoàn',
      youtube_url: youtube_url ? String(youtube_url).trim() : null,
      karaoke_youtube_url: karaoke_youtube_url ? String(karaoke_youtube_url).trim() : null,
      audio_url: audio_url ? String(audio_url).trim() : null,
      pdf_url: pdf_url ? String(pdf_url).trim() : null,
      pdf_drive_id: resolvedDriveId || null,
      thumbnail_url: resolvedThumb,
      scripture_ref: scripture_ref ? String(scripture_ref).trim() : null,
      scripture_book_slug: scripture_book_slug ? String(scripture_book_slug).trim() : null,
      scripture_chapter: scripture_chapter !== '' && scripture_chapter !== null && scripture_chapter !== undefined ? Number(scripture_chapter) : null,
      related_post_slug: related_post_slug ? String(related_post_slug).trim() : null,
      lyrics: lyrics ? String(lyrics) : null,
      description: description ? String(description).trim() : null,
      status: status === 'draft' ? 'draft' : 'published',
      is_featured: Boolean(is_featured),
      updated_at: new Date().toISOString(),
    };

    const db = getSupabaseServerClient();
    let savedRow: any = null;

    if (id) {
      const { data, error } = await db
        .from('sacred_music')
        .update(payload)
        .eq('id', Number(id))
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      savedRow = data;
    } else {
      // Ensure unique slug on create
      const { data: existing } = await db
        .from('sacred_music')
        .select('id')
        .eq('slug', payload.slug)
        .maybeSingle();

      if (existing) {
        payload.slug = `${payload.slug}-${Date.now().toString().slice(-4)}`;
      }
      payload.author_id = auth.user.id;

      const { data, error } = await db
        .from('sacred_music')
        .insert([payload])
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      savedRow = data;
    }

    try {
      revalidatePath('/thanh-nhac');
      if (savedRow?.slug) revalidatePath(`/thanh-nhac/${savedRow.slug}`);
      revalidatePath('/sitemap.xml');
    } catch {}

    const res = NextResponse.json({ success: true, item: savedRow });
    return applyRefreshedAuthCookies(res, auth.refreshedSession);
  } catch (err: any) {
    console.error('API /api/sacred-music/save error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Lỗi khi lưu bài Thánh Ca.' }, { status: 500 });
  }
}
