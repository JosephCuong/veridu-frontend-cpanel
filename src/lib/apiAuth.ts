import { NextRequest, NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export interface RefreshedSessionTokens {
  access_token: string;
  refresh_token: string;
}

export interface VerifiedAuthResult {
  authenticated: boolean;
  accessToken?: string;
  refreshedSession?: RefreshedSessionTokens;
  user?: {
    id: string;
    email: string;
    role: string;
    displayName?: string;
    isAdmin: boolean;
    isAuthor: boolean;
    providers?: string[];
  };
  error?: string;
  response?: NextResponse;
}

const INVALID_TOKENS = new Set([
  '',
  'null',
  'undefined',
  'guest_token',
  'sb_session_active',
  'veridu_active_session',
]);

export function extractCookieValue(cookieHeader: string, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) {
      const raw = part.slice(idx + 1).trim();
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

function isUsableToken(value: string | null | undefined): value is string {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || INVALID_TOKENS.has(trimmed)) return false;
  return trimmed.split('.').length === 3;
}

/**
 * Helper to attach refreshed HttpOnly session cookies onto an outgoing NextResponse
 * whenever verifyApiAuth silently renewed an expired 1-hour access token.
 */
export function applyRefreshedAuthCookies(
  response: NextResponse,
  refreshed?: RefreshedSessionTokens
): NextResponse {
  if (!refreshed?.access_token) return response;
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 72 * 60 * 60;

  response.cookies.set('veridu_auth_token', refreshed.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  if (refreshed.refresh_token) {
    response.cookies.set('veridu_refresh_token', refreshed.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
  }

  return response;
}

async function fetchSupabaseAuthUser(accessToken: string): Promise<any | null> {
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
  if (!userRes.ok) return null;
  const data: any = await userRes.json();
  return data?.id ? data : null;
}

async function refreshSupabaseTokens(
  refreshToken: string
): Promise<{ user: any; access_token: string; refresh_token: string } | null> {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data: any = await res.json();
  if (!data?.access_token || !data?.user?.id) return null;
  return {
    user: data.user,
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
  };
}

export async function verifyApiAuth(
  req: Request | NextRequest,
  requiredRole?: 'admin' | 'author' | 'any'
): Promise<VerifiedAuthResult> {
  try {
    let token: string | null = null;
    const cookieHeader = req.headers.get('cookie') || '';

    // 1. Extract Bearer Token from Authorization Header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const candidate = authHeader.substring(7).trim();
      if (isUsableToken(candidate)) {
        token = candidate;
      }
    }

    // 2. Extract Token from HttpOnly Cookie (veridu_auth_token) or legacy veridu_token cookie
    if (!token) {
      const httpOnlyToken = extractCookieValue(cookieHeader, 'veridu_auth_token');
      if (isUsableToken(httpOnlyToken)) {
        token = httpOnlyToken;
      } else {
        const legacyToken = extractCookieValue(cookieHeader, 'veridu_token');
        if (isUsableToken(legacyToken)) {
          token = legacyToken;
        }
      }
    }

    const refreshTokenCookie = extractCookieValue(cookieHeader, 'veridu_refresh_token')?.trim() || '';

    if (!token && !refreshTokenCookie) {
      return {
        authenticated: false,
        error: 'Chưa đăng nhập. Vui lòng cung cấp mã xác thực hợp lệ.',
        response: NextResponse.json(
          { success: false, error: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' },
          { status: 401 }
        ),
      };
    }

    // 3. Verify JWT via lightweight direct REST call (auto-refresh if expired and refresh cookie exists)
    let authUser: any = null;
    let activeAccessToken = token || '';
    let refreshedSession: RefreshedSessionTokens | undefined;

    if (token) {
      authUser = await fetchSupabaseAuthUser(token);
    }

    if (!authUser && refreshTokenCookie && refreshTokenCookie.length > 10) {
      const refreshed = await refreshSupabaseTokens(refreshTokenCookie);
      if (refreshed) {
        authUser = refreshed.user;
        activeAccessToken = refreshed.access_token;
        refreshedSession = {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
        };
      }
    }

    if (!authUser?.id) {
      return {
        authenticated: false,
        error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
        response: NextResponse.json(
          { success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' },
          { status: 401 }
        ),
      };
    }

    const userId = String(authUser.id);
    const userEmail = String(authUser.email || '');
    const providers: string[] = Array.isArray(authUser?.app_metadata?.providers)
      ? authUser.app_metadata.providers.map((p: any) => String(p))
      : authUser?.app_metadata?.provider
      ? [String(authUser.app_metadata.provider)]
      : [];

    // 4. Query verified role & permissions strictly from Supabase DB (never trust user_metadata.role)
    const adminDb = getSupabaseServerClient();
    const [{ data: profile }, { data: rolesRows }] = await Promise.all([
      adminDb
        .from('profiles')
        .select('role, full_name, is_verified_author')
        .eq('id', userId)
        .maybeSingle(),
      adminDb
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId),
    ]);

    const dbRole = (profile?.role || 'Học Viên').trim();
    const dbRoleLower = dbRole.toLowerCase();
    const roleIds = (rolesRows || []).map((r: any) => String(r.role_id || '').toLowerCase());

    const isAdmin =
      roleIds.includes('admin') ||
      dbRoleLower === 'admin' ||
      dbRoleLower === 'quản trị viên' ||
      dbRoleLower === 'super_admin';

    const isAuthor =
      isAdmin ||
      Boolean(profile?.is_verified_author) ||
      roleIds.some((r) => ['author', 'scholar', 'instructor', 'catechist', 'editor'].includes(r)) ||
      [
        'tác giả / học giả',
        'học giả veridu',
        'giảng viên thần học',
        'giáo lý viên',
        'người đóng góp',
        'author',
        'scholar',
        'instructor',
        'catechist',
        'teacher',
      ].includes(dbRoleLower);

    // 5. Enforce requiredRole checks
    if (requiredRole === 'admin' && !isAdmin) {
      return {
        authenticated: false,
        error: 'Bạn không có quyền quản trị để thực hiện thao tác này.',
        response: NextResponse.json(
          { success: false, error: 'Truy cập bị từ chối: Yêu cầu quyền Quản Trị Viên.' },
          { status: 403 }
        ),
      };
    }

    if (requiredRole === 'author' && !isAuthor) {
      return {
        authenticated: false,
        error: 'Bạn cần quyền Tác Giả / Giảng Viên hoặc Quản Trị Viên để thực hiện thao tác này.',
        response: NextResponse.json(
          { success: false, error: 'Truy cập bị từ chối: Yêu cầu quyền Tác Giả hoặc Quản Trị Viên.' },
          { status: 403 }
        ),
      };
    }

    return {
      authenticated: true,
      accessToken: activeAccessToken,
      refreshedSession,
      user: {
        id: userId,
        email: userEmail,
        role: isAdmin ? 'Quản Trị Viên' : dbRole,
        displayName: profile?.full_name || authUser.user_metadata?.full_name || userEmail,
        isAdmin,
        isAuthor,
        providers,
      },
    };
  } catch (err: any) {
    return {
      authenticated: false,
      error: err?.message || 'Lỗi kiểm tra bảo mật máy chủ.',
      response: NextResponse.json(
        { success: false, error: 'Lỗi xác thực hệ thống.' },
        { status: 500 }
      ),
    };
  }
}
