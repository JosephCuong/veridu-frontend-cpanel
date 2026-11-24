import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'any');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const supabase = getSupabaseServerClient();

    const [
      { data: devices },
      { data: entitlements },
      { data: resources },
      { data: latestRelease },
    ] = await Promise.all([
      supabase
        .from('user_devices')
        .select('id, device_name, os_info, last_seen_at, revoked, created_at')
        .eq('user_id', auth.user.id)
        .eq('revoked', false)
        .order('last_seen_at', { ascending: false }),
      supabase
        .from('user_entitlements')
        .select('id, pack_id, source, expires_at, revoked, granted_at')
        .eq('user_id', auth.user.id)
        .eq('revoked', false)
        .order('granted_at', { ascending: false }),
      supabase
        .from('desktop_resources')
        .select('pack_id, pack_type, title, subtitle, version, item_count, file_size_bytes, access_tier')
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('desktop_releases')
        .select('version, release_notes, setup_url, portable_url, sha256, published_at')
        .eq('is_latest', true)
        .maybeSingle(),
    ]);

    const resourceMap = new Map<string, any>();
    for (const r of resources || []) {
      resourceMap.set(r.pack_id, r);
    }

    const ownedPackIds = new Set((entitlements || []).map((e: any) => e.pack_id));

    const enrichedResources = (resources || []).map((r: any) => ({
      ...r,
      unlocked: r.access_tier === 'free' || ownedPackIds.has(r.pack_id),
    }));

    const enrichedEntitlements = (entitlements || []).map((e: any) => ({
      ...e,
      pack_title: resourceMap.get(e.pack_id)?.title || e.pack_id,
    }));

    return NextResponse.json({
      success: true,
      max_devices: 1,
      devices: devices || [],
      entitlements: enrichedEntitlements,
      resources: enrichedResources,
      latest_release: latestRelease || null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi tải thông tin App VERIDU' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'any');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    let deviceId = request.nextUrl.searchParams.get('id');
    if (!deviceId) {
      try {
        const body = await request.json();
        deviceId = body?.device_id || body?.id || null;
      } catch {}
    }

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã thiết bị cần gỡ' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Only allow removing a device that strictly belongs to auth.user.id
    const { data: targetDevice } = await supabase
      .from('user_devices')
      .select('id, user_id')
      .eq('id', deviceId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (!targetDevice) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thiết bị thuộc tài khoản của bạn' }, { status: 404 });
    }

    const { error } = await supabase
      .from('user_devices')
      .update({ revoked: true })
      .eq('id', deviceId)
      .eq('user_id', auth.user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gỡ ủy quyền thiết bị thành công! Bạn có thể đăng nhập trên máy tính Windows mới ngay bây giờ.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi gỡ thiết bị' }, { status: 500 });
  }
}
