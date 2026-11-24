import { supabaseUrl, supabaseAnonKey } from './supabaseClient';
import { getSupabaseServerClient } from './supabaseServer';

export interface DesktopLicensePayload {
  v: number;
  pack_id: string;
  version: string;
  user_id: string;
  email: string;
  machine_id_hash: string;
  content_key_hex: string;
  issued_at: string;
  expires_at: string | null;
}

export interface SignedDesktopLicense {
  payload: DesktopLicensePayload;
  canonical: string;
  signature_hex: string;
  alg: 'Ed25519';
}

export function getMaxDevicesLimit(): number {
  const raw = Number(process.env.VERIDU_MAX_DEVICES || '1');
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export function canonicalizeLicensePayload(payload: DesktopLicensePayload): string {
  const ordered: Record<string, unknown> = {};
  Object.keys(payload)
    .sort()
    .forEach((k) => {
      ordered[k] = (payload as unknown as Record<string, unknown>)[k];
    });
  return JSON.stringify(ordered);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, '');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(clean, 'base64'));
  }
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signDesktopLicense(payload: DesktopLicensePayload): Promise<SignedDesktopLicense> {
  const privB64 = (process.env.VERIDU_LICENSE_PRIVATE_KEY || '').trim();
  if (!privB64) {
    throw new Error('VERIDU_LICENSE_PRIVATE_KEY chưa được cấu hình trên máy chủ.');
  }

  const pkcs8Bytes = base64ToUint8Array(privB64);
  const pkcs8Buffer = pkcs8Bytes.buffer.slice(
    pkcs8Bytes.byteOffset,
    pkcs8Bytes.byteOffset + pkcs8Bytes.byteLength
  ) as ArrayBuffer;

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pkcs8Buffer,
    { name: 'Ed25519' },
    false,
    ['sign']
  );

  const canonical = canonicalizeLicensePayload(payload);
  const msgBytes = new TextEncoder().encode(canonical);
  const sigBuf = await crypto.subtle.sign('Ed25519', cryptoKey, msgBytes);
  const signature_hex = uint8ArrayToHex(new Uint8Array(sigBuf));

  return {
    payload,
    canonical,
    signature_hex,
    alg: 'Ed25519',
  };
}

export async function authenticateDesktopRequest(request: Request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return { user: null, profile: null, error: 'Thiếu mã xác thực phiên đăng nhập.' };
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!userRes.ok) {
    return { user: null, profile: null, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
  }

  const userData: any = await userRes.json();
  if (!userData?.id) {
    return { user: null, profile: null, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
  }

  const admin = getSupabaseServerClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, email, full_name, christian_name, role')
    .eq('id', userData.id)
    .maybeSingle();

  return {
    user: userData,
    profile: profile || {
      id: userData.id,
      email: userData.email || '',
      full_name: userData.user_metadata?.full_name || userData.email || 'Thành Viên VERIDU',
      role: 'user',
    },
    error: null,
  };
}
