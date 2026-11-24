'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  Laptop,
  Package,
  CheckCircle,
  AlertCircle,
  Mail,
  Church,
} from 'lucide-react';

interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  christian_name: string | null;
  parish: string | null;
  diocese: string | null;
  role: string | null;
  role_key: string;
  is_verified_author: boolean;
  is_admin: boolean;
  points: number | null;
  streak: number | null;
  created_at: string | null;
  active_devices_count: number;
  active_entitlements_count: number;
}

const ROLE_OPTIONS = [
  { key: 'student', label: 'Học Viên' },
  { key: 'catechist', label: 'Giáo Lý Viên' },
  { key: 'author', label: 'Tác Giả / Học Giả' },
  { key: 'instructor', label: 'Giảng Viên Thần Học' },
  { key: 'admin', label: 'Quản Trị Viên' },
];

export default function AdminUsersTab({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [summary, setSummary] = useState({
    total_users: 0,
    total_admins: 0,
    total_verified_authors: 0,
    total_active_devices: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = useCallback(async (queryText = '') => {
    setLoading(true);
    setFeedback(null);
    try {
      const qs = queryText.trim() ? `?q=${encodeURIComponent(queryText.trim())}` : '';
      const res = await fetch(`/api/admin/users${qs}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          text: data?.error || 'Không thể tải danh sách người dùng. Vui lòng đăng nhập lại bằng tài khoản Quản Trị.',
        });
      } else {
        setUsers(data.users || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers('');
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRoleKey: string) => {
    setSavingId(userId);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, role_key: newRoleKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data?.error || 'Cập nhật phân quyền thất bại.' });
      } else {
        setFeedback({ type: 'success', text: data.message || 'Đã cập nhật vai trò người dùng.' });
        await loadUsers(search);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
          <div className="text-[11px] font-serif text-[var(--text-muted)]">Tổng Thành Viên</div>
          <div className="text-2xl font-serif font-black text-[var(--text-main)] mt-1">{summary.total_users}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
          <div className="text-[11px] font-serif text-[var(--text-muted)]">Quản Trị Viên</div>
          <div className="text-2xl font-serif font-black text-amber-600 dark:text-amber-400 mt-1">{summary.total_admins}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
          <div className="text-[11px] font-serif text-[var(--text-muted)]">Tác Giả / Giảng Viên</div>
          <div className="text-2xl font-serif font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.total_verified_authors}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
          <div className="text-[11px] font-serif text-[var(--text-muted)]">Máy App VERIDU Hoạt Động</div>
          <div className="text-2xl font-serif font-black text-sky-600 dark:text-sky-400 mt-1">{summary.total_active_devices}</div>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') loadUsers(search);
            }}
            placeholder="Tìm theo email, họ tên, tên thánh, giáo xứ..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif text-[var(--text-main)] focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          type="button"
          onClick={() => loadUsers(search)}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Tìm / Làm Mới</span>
        </button>
      </div>

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

      {/* Users List */}
      {loading ? (
        <div className="p-10 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif text-amber-500">
          Đang tải danh sách thành viên...
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
          <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
          <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Không tìm thấy thành viên nào</h4>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const isSelf = currentUserId && u.id === currentUserId;
            return (
              <div
                key={u.id}
                className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif font-black text-base text-[var(--text-main)]">
                      {u.christian_name ? `${u.christian_name} ` : ''}
                      {u.full_name || 'Thành Viên VERIDU'}
                    </h4>
                    {u.is_admin && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-serif font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Quản Trị
                      </span>
                    )}
                    {isSelf && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-serif font-bold">
                        Tài khoản hiện tại
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] font-serif">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Mail className="w-3.5 h-3.5" /> {u.email}
                    </span>
                    {(u.parish || u.diocese) && (
                      <span className="flex items-center gap-1">
                        <Church className="w-3.5 h-3.5" /> {[u.parish, u.diocese].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                      <Laptop className="w-3.5 h-3.5" /> {u.active_devices_count} thiết bị
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Package className="w-3.5 h-3.5" /> {u.active_entitlements_count} gói tài nguyên
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] font-serif font-bold text-[var(--text-muted)]">Vai trò:</label>
                  <select
                    value={u.role_key}
                    disabled={savingId === u.id || Boolean(isSelf)}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500 disabled:opacity-60 cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
