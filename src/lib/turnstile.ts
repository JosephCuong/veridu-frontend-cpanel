export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAGVrOHEBp8B-RDfd';

export type TurnstileAction = 'login' | 'signup' | 'forgot_password';

export interface TurnstileVerifyResult {
  ok: boolean;
  error?: string;
  codes?: string[];
}

function getExpectedHostnames(): Set<string> {
  const raw =
    process.env.TURNSTILE_HOSTNAMES ||
    (process.env.NODE_ENV === 'production'
      ? 'www.cruxveritatis.org,cruxveritatis.org'
      : 'localhost,127.0.0.1,www.cruxveritatis.org,cruxveritatis.org');

  return new Set(
    raw
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  );
}

function extractClientIp(request: Request): string | undefined {
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return undefined;
}

/**
 * Canonical Cloudflare Turnstile server-side Siteverify check.
 * Fails closed on missing/invalid token, action mismatch, hostname mismatch, or network failure.
 */
export async function verifyTurnstileToken(
  request: Request,
  token: unknown,
  expectedAction: TurnstileAction
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  // Local dev fallback ONLY if secret is not configured outside production
  if (!secret) {
    if (!isProd) {
      return { ok: true };
    }
    return {
      ok: false,
      error: 'Hệ thống xác thực chống bot chưa được cấu hình đầy đủ.',
    };
  }

  if (typeof token !== 'string' || token.trim().length === 0 || token.length > 2048) {
    return {
      ok: false,
      error: 'Vui lòng hoàn tất bước xác thực bảo mật (chống bot) trước khi tiếp tục.',
    };
  }

  const expectedHostnames = getExpectedHostnames();
  if (expectedHostnames.size === 0) {
    return { ok: false, error: 'Cấu hình tên miền xác thực không hợp lệ.' };
  }

  const remoteip = extractClientIp(request);

  try {
    const params = new URLSearchParams({
      secret,
      response: token.trim(),
    });
    if (remoteip) {
      params.set('remoteip', remoteip);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        error: 'Không thể kết nối máy chủ xác thực chống bot. Vui lòng thử lại.',
      };
    }

    const data: any = await res.json();
    const hostname = String(data?.hostname || '').trim().toLowerCase();
    const action = String(data?.action || '').trim();
    const codes: string[] = Array.isArray(data?.['error-codes']) ? data['error-codes'] : [];

    if (data?.success !== true) {
      return {
        ok: false,
        codes,
        error: 'Xác thực chống bot chưa hợp lệ hoặc đã hết hạn. Vui lòng thử lại.',
      };
    }

    if (action !== expectedAction) {
      return {
        ok: false,
        codes: ['action-mismatch'],
        error: 'Phiên xác thực chống bot không khớp thao tác. Vui lòng tải lại và thử lại.',
      };
    }

    if (!expectedHostnames.has(hostname)) {
      return {
        ok: false,
        codes: ['hostname-mismatch'],
        error: 'Tên miền gửi yêu cầu xác thực không hợp lệ.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Hết thời gian xác thực chống bot. Vui lòng thử lại.',
    };
  }
}
