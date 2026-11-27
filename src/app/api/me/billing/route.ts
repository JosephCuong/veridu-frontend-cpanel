import { NextResponse } from 'next/server';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const ALLOWED_ACCOUNT_TYPES = new Set(['individual', 'parish_org']);
const ALLOWED_CURRENCIES = new Set(['VND', 'USD']);
const ALLOWED_METHODS = new Set(['vietqr', 'bank_transfer', 'momo', 'card', 'paypal']);

export async function GET(request: Request) {
  const auth = await verifyApiAuth(request, 'any');
  if (!auth.authenticated || !auth.user) {
    return auth.response!;
  }

  try {
    const adminDb = getSupabaseServerClient();
    const [{ data: billing }, { data: profile }, { data: orders }] = await Promise.all([
      adminDb
        .from('user_billing_profiles')
        .select('*')
        .eq('user_id', auth.user.id)
        .maybeSingle(),
      adminDb
        .from('profiles')
        .select('full_name, phone, province_city, country')
        .eq('id', auth.user.id)
        .maybeSingle(),
      adminDb
        .from('payment_orders')
        .select('id, order_code, item_type, item_id, item_title, amount, currency, payment_provider, status, paid_at, created_at')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const resolvedBilling = billing || {
      user_id: auth.user.id,
      account_type: 'individual',
      billing_name: profile?.full_name || '',
      billing_email: auth.user.email || '',
      billing_phone: profile?.phone || '',
      tax_code: '',
      address_line: '',
      province_city: profile?.province_city || '',
      country: profile?.country || 'VN',
      preferred_currency: 'VND',
      preferred_payment_method: 'vietqr',
    };

    const response = NextResponse.json({
      success: true,
      billing: resolvedBilling,
      orders: orders || [],
    });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return applyRefreshedAuthCookies(response, auth.refreshedSession);
  } catch {
    return NextResponse.json({ success: false, error: 'Không thể tải thông tin thanh toán.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyApiAuth(request, 'any');
  if (!auth.authenticated || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const clean = (v: unknown, max: number) =>
      typeof v === 'string' ? v.trim().slice(0, max) : '';

    const accountType = ALLOWED_ACCOUNT_TYPES.has(String(body?.account_type))
      ? String(body.account_type)
      : 'individual';
    const currency = ALLOWED_CURRENCIES.has(String(body?.preferred_currency))
      ? String(body.preferred_currency)
      : 'VND';
    const method = ALLOWED_METHODS.has(String(body?.preferred_payment_method))
      ? String(body.preferred_payment_method)
      : 'vietqr';

    const billingName = clean(body?.billing_name, 160);
    const billingEmail = clean(body?.billing_email, 160) || auth.user.email;
    const billingPhone = clean(body?.billing_phone, 32);
    const taxCode = accountType === 'parish_org' ? clean(body?.tax_code, 40) : '';
    const addressLine = clean(body?.address_line, 250);
    const provinceCity = clean(body?.province_city, 100);
    const country = clean(body?.country, 16) || 'VN';

    if (billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
      return NextResponse.json({ success: false, error: 'Email nhận biên lai không hợp lệ.' }, { status: 400 });
    }

    const adminDb = getSupabaseServerClient();
    const { data: saved, error } = await adminDb
      .from('user_billing_profiles')
      .upsert(
        {
          user_id: auth.user.id,
          account_type: accountType,
          billing_name: billingName,
          billing_email: billingEmail,
          billing_phone: billingPhone,
          tax_code: taxCode,
          address_line: addressLine,
          province_city: provinceCity,
          country,
          preferred_currency: currency,
          preferred_payment_method: method,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: 'Không thể lưu thông tin thanh toán.' }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      billing: saved,
    });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return applyRefreshedAuthCookies(response, auth.refreshedSession);
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi lưu thông tin thanh toán.' }, { status: 500 });
  }
}
