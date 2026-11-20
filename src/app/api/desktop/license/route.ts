import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  authenticateDesktopRequest,
  getMaxDevicesLimit,
  signDesktopLicense,
} from '@/lib/desktopCrypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await authenticateDesktopRequest(request);
    if (!auth.user) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const packId = String(body?.pack_id || '').trim();
    const machineIdHash = String(body?.machine_id_hash || '').trim().toLowerCase();
    const deviceName = String(body?.device_name || 'Windows PC').slice(0, 120);
    const osInfo = String(body?.os_info || 'Windows').slice(0, 120);

    if (!packId || !/^[a-f0-9]{32,64}$/.test(machineIdHash)) {
      return NextResponse.json(
        { ok: false, error: 'Thiếu pack_id hoặc machine_id_hash hợp lệ.' },
        { status: 400 }
      );
    }

    const admin = getSupabaseServerClient();

    const { data: resRow, error: resErr } = await admin
      .from('desktop_resources')
      .select('pack_id, version, title, sha256, file_size_bytes, download_url, access_tier, is_published')
      .eq('pack_id', packId)
      .maybeSingle();

    if (resErr || !resRow || !resRow.is_published) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy gói tài nguyên này trên hệ thống.' }, { status: 404 });
    }

    const isAdmin =
      auth.profile &&
      ['admin', 'superadmin', 'quản trị viên'].includes(String(auth.profile.role || '').toLowerCase());
    let expiresAt: string | null = null;
    let hasAccess = resRow.access_tier === 'free' || resRow.access_tier === 'member' || Boolean(isAdmin);

    if (!hasAccess) {
      const { data: ent } = await admin
        .from('user_entitlements')
        .select('expires_at, revoked')
        .eq('user_id', auth.user.id)
        .eq('pack_id', packId)
        .eq('revoked', false)
        .maybeSingle();

      if (ent) {
        const nowIso = new Date().toISOString();
        if (!ent.expires_at || ent.expires_at > nowIso) {
          hasAccess = true;
          expiresAt = ent.expires_at || null;
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          code: 'ENTITLEMENT_REQUIRED',
          error: 'Tài khoản của bạn chưa được cấp quyền cho gói tài nguyên này.',
        },
        { status: 403 }
      );
    }

    const maxDevices = getMaxDevicesLimit();
    const { data: devices } = await admin
      .from('user_devices')
      .select('id, machine_id_hash, device_name, os_info, last_seen_at')
      .eq('user_id', auth.user.id)
      .eq('revoked', false)
      .order('last_seen_at', { ascending: false });

    const activeDevices = devices || [];
    const currentDevice = activeDevices.find((d: { machine_id_hash: string }) => d.machine_id_hash === machineIdHash);

    if (currentDevice) {
      await admin
        .from('user_devices')
        .update({
          device_name: deviceName,
          os_info: osInfo,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', currentDevice.id);
    } else if (activeDevices.length >= maxDevices) {
      return NextResponse.json(
        {
          ok: false,
          code: 'DEVICE_LIMIT_REACHED',
          max_devices: maxDevices,
          active_devices: activeDevices,
          error: `Tài khoản hiện giới hạn tối đa ${maxDevices} thiết bị. Vui lòng gỡ kích hoạt thiết bị cũ trước khi tải trên máy này.`,
        },
        { status: 403 }
      );
    } else {
      const { error: devInsErr } = await admin.from('user_devices').upsert(
        {
          user_id: auth.user.id,
          machine_id_hash: machineIdHash,
          device_name: deviceName,
          os_info: osInfo,
          revoked: false,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,machine_id_hash' }
      );
      if (devInsErr) {
        return NextResponse.json({ ok: false, error: 'Không thể đăng ký thiết bị.' }, { status: 500 });
      }
    }

    const { data: keyRow, error: keyErr } = await admin
      .from('desktop_resource_keys')
      .select('content_key_hex')
      .eq('pack_id', packId)
      .maybeSingle();

    if (keyErr || !keyRow?.content_key_hex) {
      return NextResponse.json(
        { ok: false, error: 'Gói tài nguyên chưa có khóa mã hóa hợp lệ trên máy chủ.' },
        { status: 500 }
      );
    }

    const licenseVlic = await signDesktopLicense({
      v: 2,
      pack_id: resRow.pack_id,
      version: resRow.version,
      user_id: auth.user.id,
      email: auth.user.email || '',
      machine_id_hash: machineIdHash,
      content_key_hex: keyRow.content_key_hex,
      issued_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    return NextResponse.json(
      {
        ok: true,
        pack_id: resRow.pack_id,
        version: resRow.version,
        title: resRow.title,
        sha256: resRow.sha256,
        file_size_bytes: resRow.file_size_bytes,
        download_url: resRow.download_url,
        license_vlic: licenseVlic,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Lỗi cấp giấy phép tài nguyên.' },
      { status: 500 }
    );
  }
}
