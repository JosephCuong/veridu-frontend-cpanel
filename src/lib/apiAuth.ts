import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export interface VerifiedAuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    displayName?: string;
  };
  error?: string;
  response?: NextResponse;
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
      token = authHeader.substring(7).trim();
    }

    // 2. Extract Token from Cookies fallback
    if (!token && 'cookies' in req) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/veridu_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token || token === 'guest_token' || token === 'sb_session_active') {
      // In development or local sessions, check if user session exists in supabase
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        token = sessionData.session.access_token;
      }
    }

    if (!token) {
      return {
        authenticated: false,
        error: 'Chưa đăng nhập. Vui lòng cung cấp mã xác thực hợp lệ.',
        response: NextResponse.json(
          { success: false, error: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' }, 
          { status: 401 }
        )
      };
    }

    // 3. Verify Token with Supabase Auth Server
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return {
        authenticated: false,
        error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
        response: NextResponse.json(
          { success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' }, 
          { status: 401 }
        )
      };
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || '';
    let userRole = authData.user.user_metadata?.role || 'Học Viên';

    // 4. Query actual verified role from Supabase profiles table
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.role) {
        userRole = profile.role;
      }
    } catch (e) {}

    const isExplicitAdmin = (
      userRole === 'Quản Trị Viên' || 
      userRole === 'admin' || 
      authData.user.user_metadata?.role === 'admin'
    );

    // 5. Enforce requiredRole checks
    if (requiredRole === 'admin' && !isExplicitAdmin) {
      return {
        authenticated: false,
        error: 'Bạn không có quyền quản trị để thực hiện thao tác này.',
        response: NextResponse.json(
          { success: false, error: 'Truy cập bị từ chối: Yêu cầu quyền Quản Trị Viên.' }, 
          { status: 403 }
        )
      };
    }

    return {
      authenticated: true,
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
        displayName: authData.user.user_metadata?.full_name || authData.user.user_metadata?.display_name || userEmail
      }
    };
  } catch (err: any) {
    return {
      authenticated: false,
      error: err.message || 'Lỗi kiểm tra bảo mật máy chủ.',
      response: NextResponse.json(
        { success: false, error: 'Lỗi xác thực hệ thống.' }, 
        { status: 500 }
      )
    };
  }
}
