import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';
import { sanitizePublicSacredMusic } from '@/lib/sacredMusic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isAdminMode = searchParams.get('admin') === '1';
    const season = searchParams.get('season');
    const massPart = searchParams.get('massPart');
    const q = (searchParams.get('q') || '').trim();

    let refreshedSession = undefined;
    if (isAdminMode) {
      const auth = await verifyApiAuth(request, 'admin');
      if (!auth.authenticated) {
        return auth.response!;
      }
      refreshedSession = auth.refreshedSession;
    }

    const db = getSupabaseServerClient();
    let query = db
      .from('sacred_music')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (!isAdminMode) {
      query = query.eq('status', 'published');
    }
    if (season && season !== 'all') {
      query = query.eq('liturgical_season', season);
    }
    if (massPart && massPart !== 'all') {
      query = query.eq('mass_part', massPart);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    let rows = Array.isArray(data) ? data : [];
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((r: any) =>
        `${r.title || ''} ${r.composer || ''} ${r.liturgical_season || ''} ${r.mass_part || ''} ${r.scripture_ref || ''} ${r.psalm_number || ''} ${r.lyrics || ''}`
          .toLowerCase()
          .includes(needle)
      );
    }

    const items = isAdminMode
      ? rows.map((r: any) => ({
          ...sanitizePublicSacredMusic(r),
          pdf_url: r.pdf_url || null,
          pdf_drive_id: r.pdf_drive_id || null,
        }))
      : rows.map(sanitizePublicSacredMusic);

    const res = NextResponse.json({ success: true, items });
    return applyRefreshedAuthCookies(res, refreshedSession);
  } catch (err: any) {
    console.error('API /api/sacred-music/list error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
