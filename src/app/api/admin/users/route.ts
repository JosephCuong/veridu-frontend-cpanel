import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLE_MAP: Record<string, { profileRole: string; roleId: string; isVerifiedAuthor: boolean }> = {
  student: { profileRole: 'Học Viên', roleId: 'student', isVerifiedAuthor: false },
  catechist: { profileRole: 'Giáo Lý Viên', roleId: 'catechist', isVerifiedAuthor: true },
  author: { profileRole: 'Tác Giả / Học Giả', roleId: 'author', isVerifiedAuthor: true },
  instructor: { profileRole: 'Giảng Viên Thần Học', roleId: 'instructor', isVerifiedAuthor: true },
  admin: { profileRole: 'admin', roleId: 'admin', isVerifiedAuthor: true },
};

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'admin');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const q = (request.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
    const supabase = getSupabaseServerClient();

    const [
      { data: profiles, error: profErr },
      { data: rolesRows },
      { data: devices },
      { data: entitlements },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, christian_name, parish, diocese, role, is_verified_author, points, manna, streak, created_at, updated_at')
        .order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role_id, is_primary'),
      supabase.from('user_devices').select('id, user_id, device_name, os_info, last_seen_at, revoked'),
      supabase.from('user_entitlements').select('id, user_id, pack_id, source, revoked, expires_at, granted_at'),
    ]);

    if (profErr) {
      return NextResponse.json({ success: false, error: profErr.message }, { status: 500 });
    }

    const rolesByUser = new Map<string, string[]>();
    for (const r of rolesRows || []) {
      const list = rolesByUser.get(r.user_id) || [];
      if (r.role_id) list.push(String(r.role_id));
      rolesByUser.set(r.user_id, list);
    }

    const devicesByUser = new Map<string, any[]>();
    for (const d of devices || []) {
      if (d.revoked) continue;
      const list = devicesByUser.get(d.user_id) || [];
      list.push(d);
      devicesByUser.set(d.user_id, list);
    }

    const entitlementsByUser = new Map<string, any[]>();
    for (const e of entitlements || []) {
      if (e.revoked) continue;
      const list = entitlementsByUser.get(e.user_id) || [];
      list.push(e);
      entitlementsByUser.set(e.user_id, list);
    }

    let enriched = (profiles || []).map((p: any) => {
      const userRoles = rolesByUser.get(p.id) || [];
      const activeDevices = devicesByUser.get(p.id) || [];
      const activeEntitlements = entitlementsByUser.get(p.id) || [];
      const roleLower = String(p.role || '').toLowerCase();
      const isAdmin = userRoles.includes('admin') || roleLower === 'admin' || roleLower === 'quản trị viên';

      let normalizedRoleKey = 'student';
      if (isAdmin) normalizedRoleKey = 'admin';
      else if (userRoles.includes('instructor') || roleLower.includes('giảng')) normalizedRoleKey = 'instructor';
      else if (userRoles.includes('author') || roleLower.includes('tác giả') || roleLower.includes('học giả')) normalizedRoleKey = 'author';
      else if (userRoles.includes('catechist') || roleLower.includes('giáo lý')) normalizedRoleKey = 'catechist';

      return {
        ...p,
        roles: userRoles,
        role_key: normalizedRoleKey,
        is_admin: isAdmin,
        active_devices_count: activeDevices.length,
        active_devices: activeDevices,
        active_entitlements_count: activeEntitlements.length,
        active_entitlements: activeEntitlements,
      };
    });

    if (q) {
      enriched = enriched.filter((u: any) => {
        const hay = `${u.email || ''} ${u.full_name || ''} ${u.christian_name || ''} ${u.parish || ''} ${u.diocese || ''} ${u.role || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({
      success: true,
      users: enriched,
      summary: {
        total_users: (profiles || []).length,
        total_admins: enriched.filter((u: any) => u.is_admin).length,
        total_verified_authors: enriched.filter((u: any) => u.is_verified_author).length,
        total_active_devices: (devices || []).filter((d: any) => !d.revoked).length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi tải danh sách người dùng' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request, 'admin');
    if (!auth.authenticated || !auth.user) {
      return auth.response!;
    }

    const body = await request.json();
    const { user_id, role_key, is_verified_author } = body || {};

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json({ success: false, error: 'Thiếu user_id' }, { status: 400 });
    }

    if (user_id === auth.user.id && role_key && role_key !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Không thể tự hạ quyền Quản Trị Viên của chính tài khoản đang đăng nhập.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (role_key && ALLOWED_ROLE_MAP[role_key]) {
      const mapping = ALLOWED_ROLE_MAP[role_key];
      updatePayload.role = mapping.profileRole;
      updatePayload.is_verified_author =
        typeof is_verified_author === 'boolean' ? is_verified_author : mapping.isVerifiedAuthor;

      // Sync user_roles table cleanly
      await supabase.from('user_roles').delete().eq('user_id', user_id);
      if (mapping.roleId !== 'student') {
        await supabase.from('user_roles').upsert(
          {
            user_id,
            role_id: mapping.roleId,
            is_primary: true,
            granted_at: new Date().toISOString(),
            granted_by: auth.user.id,
          },
          { onConflict: 'user_id,role_id' }
        );
      }
    } else if (typeof is_verified_author === 'boolean') {
      updatePayload.is_verified_author = is_verified_author;
    } else {
      return NextResponse.json({ success: false, error: 'Tham số cập nhật vai trò không hợp lệ' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user_id)
      .select('id, email, full_name, role, is_verified_author')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: 'Đã cập nhật phân quyền người dùng thành công!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi cập nhật người dùng' }, { status: 500 });
  }
}
