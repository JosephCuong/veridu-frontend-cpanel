import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = getSupabaseServerClient();
    const { data, error } = await admin
      .from('desktop_releases')
      .select('version, release_notes, setup_url, portable_url, sha256, min_required, published_at')
      .eq('is_latest', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: true,
        latest: data || {
          version: '2.2.0',
          release_notes: '',
          setup_url: 'https://www.cruxveritatis.org/',
          portable_url: 'https://www.cruxveritatis.org/',
          sha256: '',
          min_required: false,
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    );
  } catch {
    return NextResponse.json({ ok: false, error: 'Không thể kiểm tra phiên bản mới.' }, { status: 500 });
  }
}
