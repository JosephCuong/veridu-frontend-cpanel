import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export interface VerifiedAuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    displayName?: string;
    isAdmin: boolean;
    isAuthor: boolean;
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

function extractCookieValue(cookieHeader: string, name: string): string | null {
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
  // Valid Supabase JWT has 3 dot-separated parts
  return trimmed.split('.').length === 3;
}

export async function verifyApiAuth(
  req: Request | NextRequest,
  requiredRole?: 'admin' | 'author' | 'any'
): Promise<VerifiedAuthResult> {
  try {
    let token: string | null = null;

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
      const cookieHeader = req.headers.get('cookie') || '';
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

    if (!token) {
      return {
        authenticated: false,
        error: 'Chưa đăng nhập. Vui lòng cung cấp mã xác thực hợp lệ.',
        response: NextResponse.json(
          { success: false, error: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' },
          { status: 401 }
        ),
      };
    }

    // 3. Verify JWT using a stateless Supabase Auth client
    const statelessAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authData, error: authError } = await statelessAnon.auth.getUser(token);

    if (authError || !authData?.user) {
      return {
        authenticated: false,
        error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
        response: NextResponse.json(
          { success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' },
          { status: 401 }
        ),
      };
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || '';

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
      user: {
        id: userId,
        email: userEmail,
        role: isAdmin ? 'Quản Trị Viên' : dbRole,
        displayName: profile?.full_name || authData.user.user_metadata?.full_name || userEmail,
        isAdmin,
        isAuthor,
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
