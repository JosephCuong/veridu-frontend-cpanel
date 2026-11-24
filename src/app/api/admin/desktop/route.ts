import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'admin');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const supabase = getSupabaseServerClient();

    const [
      { data: releases },
      { data: resources },
      { data: devices },
      { data: entitlements },
      { data: profiles },
    ] = await Promise.all([
      supabase
        .from('desktop_releases')
        .select('*')
        .order('is_latest', { ascending: false })
        .order('published_at', { ascending: false }),
      supabase
        .from('desktop_resources')
        .select('pack_id, pack_type, title, subtitle, version, item_count, file_size_bytes, access_tier, is_published, updated_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('user_devices')
        .select('*')
        .order('last_seen_at', { ascending: false }),
      supabase
        .from('user_entitlements')
        .select('*')
        .order('granted_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('created_at', { ascending: false }),
    ]);

    const profileMap = new Map<string, any>();
    for (const p of profiles || []) {
      profileMap.set(p.id, p);
    }

    const resourceMap = new Map<string, any>();
    for (const r of resources || []) {
      resourceMap.set(r.pack_id, r);
    }

    const enrichedDevices = (devices || []).map((d: any) => {
      const u = profileMap.get(d.user_id);
      return {
        ...d,
        user_email: u?.email || d.user_id,
        user_name: u?.full_name || 'Thành Viên',
      };
    });

    const enrichedEntitlements = (entitlements || []).map((e: any) => {
      const u = profileMap.get(e.user_id);
      const r = resourceMap.get(e.pack_id);
      return {
        ...e,
        user_email: u?.email || e.user_id,
        user_name: u?.full_name || 'Thành Viên',
        pack_title: r?.title || e.pack_id,
      };
    });

    return NextResponse.json({
      success: true,
      releases: releases || [],
      resources: resources || [],
      devices: enrichedDevices,
      entitlements: enrichedEntitlements,
      users: profiles || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi tải dữ liệu App VERIDU' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'admin');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const body = await request.json();
    const { action } = body || {};
    const supabase = getSupabaseServerClient();

    if (action === 'update_release') {
      const { version, setup_url, portable_url, sha256, release_notes, is_latest } = body;
      if (!version || typeof version !== 'string') {
        return NextResponse.json({ success: false, error: 'Thiếu số phiên bản (version)' }, { status: 400 });
      }

      if (is_latest === true) {
        await supabase.from('desktop_releases').update({ is_latest: false }).neq('version', version.trim());
      }

      const payload: Record<string, any> = {
        version: version.trim(),
        setup_url: (setup_url || '').trim() || 'https://www.cruxveritatis.org/ung-dung',
        portable_url: (portable_url || '').trim() || 'https://www.cruxveritatis.org/ung-dung',
        sha256: (sha256 || '').trim() || null,
        release_notes: (release_notes || '').trim(),
        is_latest: is_latest !== undefined ? Boolean(is_latest) : true,
        published_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('desktop_releases')
        .upsert(payload, { onConflict: 'version' })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      try {
        revalidatePath('/ung-dung');
        revalidatePath('/');
      } catch (e) {}

      return NextResponse.json({
        success: true,
        release: data,
        message: `Đã cập nhật liên kết tải cho VERIDU v${version.trim()}!`,
      });
    }

    if (action === 'revoke_device') {
      const { device_id, hard_delete } = body;
      if (!device_id) {
        return NextResponse.json({ success: false, error: 'Thiếu device_id' }, { status: 400 });
      }

      if (hard_delete) {
        const { error } = await supabase.from('user_devices').delete().eq('id', device_id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      } else {
        const { error } = await supabase
          .from('user_devices')
          .update({ revoked: true })
          .eq('id', device_id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Đã thu hồi quyền truy cập của thiết bị này.' });
    }

    if (action === 'grant_entitlement') {
      const { user_id, pack_id, source, expires_at } = body;
      if (!user_id || !pack_id) {
        return NextResponse.json({ success: false, error: 'Vui lòng chọn thành viên và gói tài nguyên.' }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('user_entitlements')
        .select('id')
        .eq('user_id', user_id)
        .eq('pack_id', pack_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_entitlements')
          .update({
            revoked: false,
            source: source || 'admin_grant',
            expires_at: expires_at || null,
            granted_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      } else {
        const { error } = await supabase.from('user_entitlements').insert({
          user_id,
          pack_id,
          source: source || 'admin_grant',
          expires_at: expires_at || null,
          revoked: false,
          granted_at: new Date().toISOString(),
        });
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Đã cấp quyền gói tài nguyên thành công!' });
    }

    if (action === 'revoke_entitlement') {
      const { entitlement_id } = body;
      if (!entitlement_id) {
        return NextResponse.json({ success: false, error: 'Thiếu entitlement_id' }, { status: 400 });
      }

      const { error } = await supabase
        .from('user_entitlements')
        .update({ revoked: true })
        .eq('id', entitlement_id);

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

      return NextResponse.json({ success: true, message: 'Đã thu hồi gói tài nguyên.' });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi xử lý thao tác App VERIDU' }, { status: 500 });
  }
}
