import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { authenticateDesktopRequest, getMaxDevicesLimit } from '@/lib/desktopCrypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticateDesktopRequest(request);
  if (!auth.user) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }
  const admin = getSupabaseServerClient();
  const { data, error } = await admin
    .from('user_devices')
    .select('id, machine_id_hash, device_name, os_info, last_seen_at, created_at')
    .eq('user_id', auth.user.id)
    .eq('revoked', false)
    .order('last_seen_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    max_devices: getMaxDevicesLimit(),
    devices: data || [],
  });
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticateDesktopRequest(request);
    if (!auth.user) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
    }
    const url = new URL(request.url);
    let deviceId = url.searchParams.get('id') || '';
    if (!deviceId) {
      try {
        const body = await request.json();
        deviceId = String(body?.device_id || body?.id || '').trim();
      } catch {}
    }

    if (!deviceId) {
      return NextResponse.json({ ok: false, error: 'Thiếu mã thiết bị cần gỡ kích hoạt.' }, { status: 400 });
    }

    const admin = getSupabaseServerClient();
    const { error } = await admin
      .from('user_devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', auth.user.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, removed_id: deviceId });
  } catch {
    return NextResponse.json({ ok: false, error: 'Lỗi gỡ kích hoạt thiết bị.' }, { status: 500 });
  }
}
