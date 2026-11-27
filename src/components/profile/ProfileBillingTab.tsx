'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Receipt,
  Building2,
  User,
  ShieldCheck,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { COUNTRY_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/lib/catholicConstants';

interface BillingProfile {
  account_type: 'individual' | 'parish_org';
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  tax_code: string;
  address_line: string;
  province_city: string;
  country: string;
  preferred_currency: 'VND' | 'USD';
  preferred_payment_method: string;
}

interface PaymentOrder {
  id: string;
  order_code: string;
  item_type: string;
  item_title: string;
  amount: number;
  currency: string;
  payment_provider: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

const DEFAULT_BILLING: BillingProfile = {
  account_type: 'individual',
  billing_name: '',
  billing_email: '',
  billing_phone: '',
  tax_code: '',
  address_line: '',
  province_city: '',
  country: 'VN',
  preferred_currency: 'VND',
  preferred_payment_method: 'vietqr',
};

export default function ProfileBillingTab() {
  const [billing, setBilling] = useState<BillingProfile>(DEFAULT_BILLING);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/me/billing', { credentials: 'include' })
      .then((r) => r.json())
      .then((res) => {
        if (!mounted) return;
        if (res?.success && res.billing) {
          setBilling({
            account_type: res.billing.account_type === 'parish_org' ? 'parish_org' : 'individual',
            billing_name: res.billing.billing_name || '',
            billing_email: res.billing.billing_email || '',
            billing_phone: res.billing.billing_phone || '',
            tax_code: res.billing.tax_code || '',
            address_line: res.billing.address_line || '',
            province_city: res.billing.province_city || '',
            country: res.billing.country || 'VN',
            preferred_currency: res.billing.preferred_currency === 'USD' ? 'USD' : 'VND',
            preferred_payment_method: res.billing.preferred_payment_method || 'vietqr',
          });
          setOrders(Array.isArray(res.orders) ? res.orders : []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/me/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(billing),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể lưu thông tin thanh toán.' });
      } else {
        setFeedback({ type: 'success', text: 'Đã lưu thông tin thanh toán & xuất biên lai an toàn!' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối máy chủ khi lưu thông tin.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-8 shadow-xl flex items-center justify-center gap-3 text-xs font-serif text-[var(--text-muted)]">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        <span>Đang tải thông tin thanh toán &amp; biên lai...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        <div className="border-b border-[var(--border-card)] pb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-black flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-500" />
              <span>Thông Tin Thanh Toán &amp; Biên Lai</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
              Dùng khi nhận mã bản quyền gói tài nguyên VERIDU, xuất biên lai cho Giáo xứ/Hội dòng hoặc nhận ấn phẩm.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-serif font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Bảo mật riêng tư tuyệt đối
          </span>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-serif font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Account Type Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBilling({ ...billing, account_type: 'individual' })}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
              billing.account_type === 'individual'
                ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40'
            }`}
          >
            <User className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-serif font-bold text-xs">Cá Nhân</div>
              <p className="text-[11px] font-serif text-[var(--text-muted)] mt-0.5">
                Giáo dân, tu sĩ, linh mục, học viên mua hoặc nhận tài nguyên cá nhân
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setBilling({ ...billing, account_type: 'parish_org' })}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
              billing.account_type === 'parish_org'
                ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40'
            }`}
          >
            <Building2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-serif font-bold text-xs">Giáo Xứ / Hội Dòng / Tổ Chức</div>
              <p className="text-[11px] font-serif text-[var(--text-muted)] mt-0.5">
                Xuất biên lai theo tên đơn vị, ban giáo lý, chủng viện hoặc mã số thuế
              </p>
            </div>
          </button>
        </div>

        {/* Core Billing Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
          <div>
            <label className="font-bold block mb-1.5">
              {billing.account_type === 'parish_org' ? 'Tên Giáo Xứ / Hội Dòng / Đơn Vị:' : 'Họ & Tên Trên Biên Lai:'}
            </label>
            <input
              type="text"
              value={billing.billing_name}
              onChange={(e) => setBilling({ ...billing, billing_name: e.target.value })}
              placeholder={billing.account_type === 'parish_org' ? 'VD: Giáo xứ Tân Định / Ban Giáo Lý...' : 'VD: Giuse Nguyễn Văn A'}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" /> Email Nhận Biên Lai &amp; Mã Bản Quyền:
            </label>
            <input
              type="email"
              value={billing.billing_email}
              onChange={(e) => setBilling({ ...billing, billing_email: e.target.value })}
              placeholder="name@example.com"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-500" /> Số Điện Thoại / Zalo Hỗ Trợ:
            </label>
            <input
              type="tel"
              value={billing.billing_phone}
              onChange={(e) => setBilling({ ...billing, billing_phone: e.target.value })}
              placeholder="VD: 09xx xxx xxx"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          {billing.account_type === 'parish_org' ? (
            <div>
              <label className="font-bold block mb-1.5">Mã Số Thuế (nếu cần hóa đơn):</label>
              <input
                type="text"
                value={billing.tax_code}
                onChange={(e) => setBilling({ ...billing, tax_code: e.target.value })}
                placeholder="VD: 030xxxxxxx"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div>
              <label className="font-bold block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" /> Đơn Vị Tiền Tệ Ưu Tiên:
              </label>
              <select
                value={billing.preferred_currency}
                onChange={(e) => setBilling({ ...billing, preferred_currency: e.target.value as 'VND' | 'USD' })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
              >
                <option value="VND">VND — Việt Nam Đồng (₫)</option>
                <option value="USD">USD — Đô la Mỹ ($ · Hải ngoại / Quốc tế)</option>
              </select>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="font-bold block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Địa Chỉ Liên Hệ / Nhận Ấn Phẩm (tùy chọn):
            </label>
            <input
              type="text"
              value={billing.address_line}
              onChange={(e) => setBilling({ ...billing, address_line: e.target.value })}
              placeholder="Số nhà, đường, phường/xã, quận/huyện..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5">Tỉnh / Thành Phố:</label>
            <input
              type="text"
              value={billing.province_city}
              onChange={(e) => setBilling({ ...billing, province_city: e.target.value })}
              placeholder="VD: TP. Hồ Chí Minh, Đồng Nai, California..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5">Quốc Gia:</label>
            <select
              value={billing.country}
              onChange={(e) => {
                const nextCountry = e.target.value;
                setBilling({
                  ...billing,
                  country: nextCountry,
                  preferred_currency: nextCountry === 'VN' ? 'VND' : 'USD',
                });
              }}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:border-amber-500"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferred Payment Method */}
        <div className="space-y-2.5">
          <label className="text-xs font-serif font-bold block">Phương Thức Thanh Toán Ưu Tiên:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-2.5 transition ${
                  billing.preferred_payment_method === opt.value
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40'
                }`}
              >
                <input
                  type="radio"
                  name="preferred_payment_method"
                  value={opt.value}
                  checked={billing.preferred_payment_method === opt.value}
                  onChange={(e) => setBilling({ ...billing, preferred_payment_method: e.target.value })}
                  className="mt-0.5 accent-amber-500"
                />
                <div className="text-xs font-serif">
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="p-4 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--border-card)] text-[11px] font-serif text-[var(--text-muted)] leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>Cam kết bảo mật dữ liệu thanh toán:</strong> VERIDU tách biệt hoàn toàn thông tin biên lai khỏi hồ sơ công khai và <strong>không bao giờ lưu số thẻ ngân hàng hay mã bảo mật CVV</strong>. Mọi giao dịch thẻ hoặc chuyển khoản đều đi qua cổng thanh toán được mã hóa chuẩn quốc tế.
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Đang Lưu...' : 'Lưu Thông Tin Thanh Toán'}</span>
        </button>
      </form>

      {/* Order & Receipt History */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="border-b border-[var(--border-card)] pb-3">
          <h3 className="text-lg font-serif font-black flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <span>Lịch Sử Đơn Hàng &amp; Đóng Góp</span>
          </h3>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-0.5">
            Theo dõi các gói tài nguyên đã kích hoạt, biên lai đóng góp và khóa bản quyền của bạn.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-xs font-serif text-[var(--text-muted)] space-y-1.5">
            <Receipt className="w-9 h-9 mx-auto opacity-30" />
            <p className="font-bold text-[var(--text-main)]">Chưa có giao dịch nào được ghi nhận.</p>
            <p>Khi bạn đăng ký gói tài nguyên chuyên sâu hoặc đóng góp ủng hộ VERIDU, biên lai sẽ hiển thị tự động tại đây.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3 text-xs font-serif"
              >
                <div>
                  <div className="font-bold text-[var(--text-main)]">{o.item_title || o.item_type}</div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">
                    Mã: {o.order_code} · {new Date(o.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {o.amount.toLocaleString('vi-VN')} {o.currency}
                  </div>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.status === 'paid'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : o.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-500/15 text-slate-500'
                    }`}
                  >
                    {o.status === 'paid' ? 'Đã thanh toán' : o.status === 'pending' ? 'Chờ xác nhận' : o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
