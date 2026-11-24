'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Package,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  Lock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function ProfileDesktopTab() {
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [data, setData] = useState<{
    max_devices: number;
    devices: any[];
    entitlements: any[];
    resources: any[];
    latest_release: any | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadDesktopInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/me/desktop', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(
          res.status === 401
            ? 'Phiên xác thực đã hết hạn hoặc cần làm mới. Vui lòng đăng xuất và đăng nhập lại để xem thông tin thiết bị App VERIDU.'
            : json?.error || 'Không thể tải thông tin App VERIDU.'
        );
      } else {
        setData(json);
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDesktopInfo();
  }, [loadDesktopInfo]);

  const handleRevokeDevice = async (deviceId: string) => {
    setRevokingId(deviceId);
    setNotice(null);
    setError(null);
    try {
      const res = await fetch(`/api/me/desktop?id=${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error || 'Không thể gỡ thiết bị.');
      } else {
        setNotice(json.message || 'Đã gỡ thiết bị thành công!');
        await loadDesktopInfo();
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-black flex items-center gap-2">
            <Laptop className="w-6 h-6 text-amber-500" />
            <span>App VERIDU &amp; Thiết Bị</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
            Quản lý máy tính Windows đang gắn với tài khoản của bạn và các gói tài nguyên Thư Viện đã mở khóa.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadDesktopInfo}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 cursor-pointer transition"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/ung-dung"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải VERIDU {data?.latest_release?.version ? `v${data.latest_release.version}` : 'v1.1.0'}</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-serif font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-serif font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-xs font-serif text-amber-500 animate-pulse">
          Đang tải thông tin thiết bị và gói tài nguyên...
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Active Windows Devices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>
                  Máy Tính Đã Ủy Quyền ({data.devices.length}/{data.max_devices})
                </span>
              </h3>
              <span className="text-[11px] font-serif text-[var(--text-muted)]">
                Mỗi tài khoản đồng bộ tối đa {data.max_devices} máy tính
              </span>
            </div>

            {data.devices.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif text-[var(--text-muted)] space-y-2">
                <p>Bạn chưa kết nối máy tính Windows nào với tài khoản VERIDU này.</p>
                <p>
                  Tải và mở <strong>VERIDU cho Windows</strong>, sau đó đăng nhập bằng chính email &amp; mật khẩu này để tự động đồng bộ Thư Viện tài nguyên Giáo Lý.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.devices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-serif font-bold text-sm text-[var(--text-main)]">
                        {dev.device_name || 'Máy tính Windows'}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {dev.os_info || 'Windows 64-bit'} · Hoạt động gần nhất:{' '}
                        {dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleString('vi-VN') : '—'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={revokingId === dev.id}
                      onClick={() => handleRevokeDevice(dev.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{revokingId === dev.id ? 'Đang Gỡ...' : 'Gỡ Thiết Bị Này'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resource Packs */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-card)]">
            <h3 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Kho Tài Nguyên Thư Viện Trong App VERIDU</span>
            </h3>

            {data.resources.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif text-[var(--text-muted)]">
                Chưa có gói tài nguyên nào được phát hành.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.resources.map((res) => (
                  <div
                    key={res.pack_id}
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] leading-snug">
                        {res.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-serif font-bold shrink-0 flex items-center gap-1 ${
                          res.unlocked
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {res.unlocked ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Đã Mở
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" /> Cần Cấp Quyền
                          </>
                        )}
                      </span>
                    </div>
                    {res.subtitle && (
                      <p className="text-[11px] font-serif text-[var(--text-muted)] line-clamp-2">{res.subtitle}</p>
                    )}
                    <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between pt-1">
                      <span>v{res.version} · {res.item_count?.toLocaleString('vi-VN')} mục</span>
                      <span>{res.file_size_bytes ? `${(res.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Download & Guide Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-serif">
              <div className="font-bold text-[var(--text-main)]">Cần hướng dẫn cài đặt &amp; sử dụng ngoại tuyến?</div>
              <div className="text-[var(--text-muted)] mt-0.5">
                Xem trọn bộ ảnh màn hình, hướng dẫn Windows SmartScreen và Sổ Tay PDF chi tiết.
              </div>
            </div>
            <Link
              href="/ung-dung"
              className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
            >
              <span>Mở Trang Ứng Dụng</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
