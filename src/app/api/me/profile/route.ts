import { NextResponse } from 'next/server';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyApiAuth(request, 'any');
  if (!auth.authenticated || !auth.user) {
    return auth.response!;
  }

  try {
    const adminDb = getSupabaseServerClient();
    const { data: profile, error } = await adminDb
      .from('profiles')
      .select('*')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: 'Không thể tải thông tin hồ sơ.' }, { status: 500 });
    }

    const providers = auth.user.providers || [];
    const response = NextResponse.json({
      success: true,
      profile: {
        id: auth.user.id,
        email: auth.user.email,
        full_name: profile?.full_name || auth.user.displayName || '',
        christian_name: profile?.christian_name || '',
        vocation: profile?.vocation || 'layperson',
        parish: profile?.parish || '',
        diocese: profile?.diocese || '',
        phone: profile?.phone || '',
        feast_day: profile?.feast_day || '',
        province_city: profile?.province_city || '',
        country: profile?.country || 'VN',
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || '',
        role: auth.user.role,
        points: profile?.points ?? 100,
        manna: profile?.manna ?? 100,
        streak: profile?.streak ?? 1,
        current_title: profile?.current_title || 'NGƯỜI TÌM HIỂU',
        badges: Array.isArray(profile?.badges) ? profile.badges : ['tan_tong'],
        marketing_consent: profile?.marketing_consent ?? true,
        profile_completed: Boolean(profile?.profile_completed),
        is_verified_author: Boolean(profile?.is_verified_author),
        created_at: profile?.created_at || null,
      },
      security: {
        providers,
        hasGoogle: providers.includes('google'),
        hasPassword: providers.includes('email'),
      },
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return applyRefreshedAuthCookies(response, auth.refreshedSession);
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi tải hồ sơ.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyApiAuth(request, 'any');
  if (!auth.authenticated || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const cleanStr = (v: unknown, maxLen: number) =>
      typeof v === 'string' ? v.trim().slice(0, maxLen) : undefined;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const fullName = cleanStr(body?.full_name, 120);
    if (fullName !== undefined) updates.full_name = fullName;

    const christianName = cleanStr(body?.christian_name, 80);
    if (christianName !== undefined) updates.christian_name = christianName;

    const vocation = cleanStr(body?.vocation, 40);
    if (vocation !== undefined) updates.vocation = vocation || 'layperson';

    const parish = cleanStr(body?.parish, 120);
    if (parish !== undefined) updates.parish = parish;

    const diocese = cleanStr(body?.diocese, 120);
    if (diocese !== undefined) updates.diocese = diocese;

    const phone = cleanStr(body?.phone, 32);
    if (phone !== undefined) updates.phone = phone;

    const feastDay = cleanStr(body?.feast_day, 80);
    if (feastDay !== undefined) updates.feast_day = feastDay;

    const provinceCity = cleanStr(body?.province_city, 100);
    if (provinceCity !== undefined) updates.province_city = provinceCity;

    const country = cleanStr(body?.country, 16);
    if (country !== undefined) updates.country = country || 'VN';

    const bio = cleanStr(body?.bio, 600);
    if (bio !== undefined) updates.bio = bio;

    const avatarUrl = cleanStr(body?.avatar_url, 500);
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const currentTitle = cleanStr(body?.current_title, 100);
    if (currentTitle !== undefined) updates.current_title = currentTitle;

    if (typeof body?.marketing_consent === 'boolean') {
      updates.marketing_consent = body.marketing_consent;
    }

    if (typeof body?.profile_completed === 'boolean') {
      updates.profile_completed = body.profile_completed;
    } else if (fullName || christianName || parish || diocese) {
      updates.profile_completed = true;
    }

    const adminDb = getSupabaseServerClient();
    const { data: updated, error } = await adminDb
      .from('profiles')
      .update(updates)
      .eq('id', auth.user.id)
      .select('*')
      .maybeSingle();

    if (error || !updated) {
      return NextResponse.json({ success: false, error: 'Không thể lưu cập nhật hồ sơ.' }, { status: 500 });
    }

    const userCookiePayload = {
      id: auth.user.id,
      username: auth.user.email.split('@')[0] || 'member',
      email: auth.user.email,
      phone: updated.phone || '',
      displayName: updated.full_name || auth.user.email,
      fullName: updated.full_name || auth.user.email,
      christianName: updated.christian_name || '',
      parish: updated.parish || '',
      diocese: updated.diocese || '',
      vocation: updated.vocation || 'layperson',
      feastDay: updated.feast_day || '',
      provinceCity: updated.province_city || '',
      country: updated.country || 'VN',
      bio: updated.bio || '',
      role: auth.user.role,
      streak: updated.streak || 1,
      points: updated.points ?? 100,
      manna: updated.manna ?? 100,
      avatar: updated.avatar_url || '',
      selected_title: updated.current_title || 'NGƯỜI TÌM HIỂU',
      badges: Array.isArray(updated.badges) ? updated.badges : ['tan_tong'],
      profile_completed: Boolean(updated.profile_completed),
    };

    const response = NextResponse.json({
      success: true,
      profile: updated,
      user: userCookiePayload,
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('veridu_user', encodeURIComponent(JSON.stringify(userCookiePayload)), {
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return applyRefreshedAuthCookies(response, auth.refreshedSession);
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi lưu hồ sơ.' }, { status: 500 });
  }
}
