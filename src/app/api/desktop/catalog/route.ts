import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { authenticateDesktopRequest, getMaxDevicesLimit } from '@/lib/desktopCrypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const admin = getSupabaseServerClient();
    const { data: resources, error } = await admin
      .from('desktop_resources')
      .select('pack_id, pack_type, title, subtitle, author, description, language, version, item_count, file_size_bytes, sha256, download_url, access_tier, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const auth = await authenticateDesktopRequest(request);
    const ownedSet = new Set<string>();
    let activeDevices: Array<{ id: string; machine_id_hash: string; device_name: string; os_info: string; last_seen_at: string }> = [];

    if (auth.user) {
      const nowIso = new Date().toISOString();
      const { data: ents } = await admin
        .from('user_entitlements')
        .select('pack_id, expires_at, revoked')
        .eq('user_id', auth.user.id)
        .eq('revoked', false);

      (ents || []).forEach((e: { pack_id: string; expires_at: string | null }) => {
        if (!e.expires_at || e.expires_at > nowIso) {
          ownedSet.add(e.pack_id);
        }
      });

      const { data: devs } = await admin
        .from('user_devices')
        .select('id, machine_id_hash, device_name, os_info, last_seen_at')
        .eq('user_id', auth.user.id)
        .eq('revoked', false)
        .order('last_seen_at', { ascending: false });

      activeDevices = devs || [];
    }

    const isAdmin =
      auth.profile &&
      ['admin', 'superadmin', 'quản trị viên'].includes(String(auth.profile.role || '').toLowerCase());

    const enriched = (resources || []).map((r: Record<string, unknown>) => {
      const tier = String(r.access_tier || 'free');
      const pid = String(r.pack_id || '');
      const owned =
        tier === 'free' ||
        (Boolean(auth.user) && (tier === 'member' || isAdmin || ownedSet.has(pid)));
      return {
        ...r,
        owned,
        requires_login: true,
      };
    });

    return NextResponse.json(
      {
        ok: true,
        authenticated: Boolean(auth.user),
        user: auth.profile,
        max_devices: getMaxDevicesLimit(),
        active_devices: activeDevices,
        resources: enriched,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Lỗi tải danh mục tài nguyên.' },
      { status: 500 }
    );
  }
}
