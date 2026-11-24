'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Package,
  Download,
  RefreshCw,
  Save,
  Trash2,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function AdminDesktopTab() {
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Release form state (defaults to latest release)
  const [relVersion, setRelVersion] = useState('1.1.0');
  const [relSetupUrl, setRelSetupUrl] = useState('');
  const [relPortableUrl, setRelPortableUrl] = useState('');
  const [relSha256, setRelSha256] = useState('');
  const [relNotes, setRelNotes] = useState('');
  const [relIsLatest, setRelIsLatest] = useState(true);

  // Grant entitlement form state
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPackId, setGrantPackId] = useState('');
  const [grantSource, setGrantSource] = useState('admin_grant');

  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDesktopData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/desktop', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể tải dữ liệu App VERIDU.' });
      } else {
        setReleases(data.releases || []);
        setResources(data.resources || []);
        setDevices(data.devices || []);
        setEntitlements(data.entitlements || []);
        setUsers(data.users || []);

        const latest = (data.releases || []).find((r: any) => r.is_latest) || (data.releases || [])[0];
        if (latest) {
          setRelVersion(latest.version || '1.1.0');
          setRelSetupUrl(latest.setup_url || '');
          setRelPortableUrl(latest.portable_url || '');
          setRelSha256(latest.sha256 || '');
          setRelNotes(latest.release_notes || '');
          setRelIsLatest(Boolean(latest.is_latest));
        }

        if ((data.resources || []).length > 0 && !grantPackId) {
          setGrantPackId(data.resources[0].pack_id);
        }
        if ((data.users || []).length > 0 && !grantUserId) {
          setGrantUserId(data.users[0].id);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, [grantPackId, grantUserId]);

  useEffect(() => {
    loadDesktopData();
  }, [loadDesktopData]);

  const handleSaveRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction('release');
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/desktop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update_release',
          version: relVersion,
          setup_url: relSetupUrl,
          portable_url: relPortableUrl,
          sha256: relSha256,
          release_notes: relNotes,
          is_latest: relIsLatest,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể lưu phiên bản.' });
      } else {
        setFeedback({ type: 'success', text: data.message || 'Đã cập nhật liên kết tải thành công!' });
        await loadDesktopData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    setBusyAction(`dev-${deviceId}`);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/desktop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'revoke_device', device_id: deviceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể gỡ thiết bị.' });
      } else {
        setFeedback({ type: 'success', text: data.message });
        await loadDesktopData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleGrantEntitlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId || !grantPackId) return;
    setBusyAction('grant');
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/desktop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'grant_entitlement',
          user_id: grantUserId,
          pack_id: grantPackId,
          source: grantSource,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể cấp quyền gói.' });
      } else {
        setFeedback({ type: 'success', text: data.message });
        await loadDesktopData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleRevokeEntitlement = async (entitlementId: string) => {
    setBusyAction(`ent-${entitlementId}`);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/desktop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'revoke_entitlement', entitlement_id: entitlementId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể thu hồi gói.' });
      } else {
        setFeedback({ type: 'success', text: data.message });
        await loadDesktopData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setBusyAction(null);
    }
  };

  const activeDevices = devices.filter((d) => !d.revoked);
  const activeEntitlements = entitlements.filter((e) => !e.revoked);

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-serif font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. RELEASE & GOOGLE DRIVE LINK MANAGER */}
      <form
        onSubmit={handleSaveRelease}
        className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
          <div>
            <h3 className="font-serif font-black text-lg text-[var(--text-main)] flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" />
              <span>Quản Lý Phiên Bản &amp; Liên Kết Tải App VERIDU</span>
            </h3>
            <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
              Dán link chia sẻ Google Drive (hoặc link tải trực tiếp) cho bộ cài <strong>Setup.exe</strong> và <strong>Portable.zip</strong>. Trang <Link href="/ung-dung" className="text-amber-600 dark:text-amber-400 underline">/ung-dung</Link> và trình kiểm tra cập nhật trong App sẽ tự động đồng bộ ngay lập tức.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ung-dung"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1.5 transition"
            >
              <span>Xem /ung-dung</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={loadDesktopData}
              disabled={loading}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
          <div>
            <label className="font-bold block mb-1.5">Phiên Bản (Version)</label>
            <input
              type="text"
              required
              value={relVersion}
              onChange={(e) => setRelVersion(e.target.value)}
              placeholder="1.1.0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5">Mã Kiểm Tra SHA-256 (Setup.exe)</label>
            <input
              type="text"
              value={relSha256}
              onChange={(e) => setRelSha256(e.target.value)}
              placeholder="58b27a7d..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5">Link Tải Bộ Cài Đặt Windows (Setup .exe)</label>
            <input
              type="url"
              value={relSetupUrl}
              onChange={(e) => setRelSetupUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="font-bold block mb-1.5">Link Tải Bản Chạy Ngay (Portable .zip)</label>
            <input
              type="url"
              value={relPortableUrl}
              onChange={(e) => setRelPortableUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-bold block mb-1.5">Ghi Chú Phát Hành (Release Notes)</label>
            <textarea
              rows={3}
              value={relNotes}
              onChange={(e) => setRelNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs font-serif cursor-pointer select-none">
            <input
              type="checkbox"
              checked={relIsLatest}
              onChange={(e) => setRelIsLatest(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span>Đặt làm phiên bản chính thức mới nhất (is_latest)</span>
          </label>

          <button
            type="submit"
            disabled={busyAction === 'release'}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{busyAction === 'release' ? 'Đang Lưu...' : 'Lưu & Cập Nhật Trang /ung-dung'}</span>
          </button>
        </div>

        {releases.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-card)] flex flex-wrap gap-2">
            {releases.map((r) => (
              <button
                key={r.version}
                type="button"
                onClick={() => {
                  setRelVersion(r.version);
                  setRelSetupUrl(r.setup_url || '');
                  setRelPortableUrl(r.portable_url || '');
                  setRelSha256(r.sha256 || '');
                  setRelNotes(r.release_notes || '');
                  setRelIsLatest(Boolean(r.is_latest));
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono border transition cursor-pointer ${
                  relVersion === r.version
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500/40'
                }`}
              >
                v{r.version} {r.is_latest ? '★' : ''}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* 2. ACTIVE WINDOWS DEVICES */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
          <div>
            <h3 className="font-serif font-black text-base text-[var(--text-main)] flex items-center gap-2">
              <Laptop className="w-5 h-5 text-sky-500" />
              <span>Thiết Bị App VERIDU Đang Hoạt Động ({activeDevices.length})</span>
            </h3>
            <p className="text-xs font-serif text-[var(--text-muted)] mt-0.5">
              Mỗi tài khoản gắn 1 máy tính Windows. Khi thành viên đổi máy, nhấn &ldquo;Gỡ Thiết Bị&rdquo; để giải phóng slot.
            </p>
          </div>
        </div>

        {activeDevices.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-card)] text-xs font-serif text-[var(--text-muted)]">
            Chưa có máy tính Windows nào đăng nhập vào App VERIDU.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeDevices.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-serif font-bold text-sm text-[var(--text-main)]">
                    {d.device_name || 'Windows PC'} <span className="text-xs font-normal text-[var(--text-muted)]">· {d.os_info || 'Windows 64-bit'}</span>
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">
                    {d.user_name} ({d.user_email}) · Hoạt động gần nhất:{' '}
                    {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString('vi-VN') : '—'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyAction === `dev-${d.id}`}
                  onClick={() => handleRevokeDevice(d.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Gỡ Thiết Bị</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. RESOURCE ENTITLEMENTS */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-5">
        <div className="border-b border-[var(--border-card)] pb-3">
          <h3 className="font-serif font-black text-base text-[var(--text-main)] flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            <span>Gói Tài Nguyên Thư Viện &amp; Cấp Quyền ({activeEntitlements.length})</span>
          </h3>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-0.5">
            Cấp hoặc thu hồi quyền tải các gói tài liệu mã hóa (.vpkg) trong Kho Thư Viện App VERIDU.
          </p>
        </div>

        {/* Grant Form */}
        <form onSubmit={handleGrantEntitlement} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-xs font-serif">
          <div>
            <label className="font-bold block mb-1">Thành Viên</label>
            <select
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-emerald-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Gói Tài Nguyên</label>
            <select
              value={grantPackId}
              onChange={(e) => setGrantPackId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-emerald-500"
            >
              {resources.map((r) => (
                <option key={r.pack_id} value={r.pack_id}>
                  {r.title} ({r.access_tier})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Nguồn Cấp</label>
            <select
              value={grantSource}
              onChange={(e) => setGrantSource(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:outline-none focus:border-emerald-500"
            >
              <option value="admin_grant">Quản trị cấp trực tiếp</option>
              <option value="donor">Ân nhân ủng hộ</option>
              <option value="purchase">Đã đăng ký mua</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={busyAction === 'grant' || !grantUserId || !grantPackId}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-serif font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cấp Quyền Gói</span>
          </button>
        </form>

        {/* Active Entitlements List */}
        {activeEntitlements.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-card)] text-xs font-serif text-[var(--text-muted)]">
            Hiện chưa có bản ghi cấp quyền riêng nào (các gói <strong>free</strong> mặc định mở cho mọi thành viên đã đăng nhập).
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeEntitlements.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-serif font-bold text-sm text-[var(--text-main)]">{e.pack_title}</div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">
                    {e.user_name} ({e.user_email}) · Nguồn: {e.source}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyAction === `ent-${e.id}`}
                  onClick={() => handleRevokeEntitlement(e.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Thu Hồi</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
