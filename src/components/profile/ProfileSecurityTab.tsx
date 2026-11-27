'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { clearAuthData } from '@/lib/auth';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut,
  Laptop,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ProfileSecurityTabProps {
  email: string;
  hasGoogle: boolean;
  hasPassword: boolean;
  onPasswordUpdated?: () => void;
}

export default function ProfileSecurityTab({
  email,
  hasGoogle,
  hasPassword,
  onPasswordUpdated,
}: ProfileSecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const strengthScore =
    (newPassword.length >= 8 ? 1 : 0) +
    (/[a-zA-Z]/.test(newPassword) ? 1 : 0) +
    (/\d/.test(newPassword) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(newPassword) ? 1 : 0);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setFeedback({ type: 'error', text: 'Mật khẩu mới phải tối thiểu 8 ký tự, gồm cả chữ cái và chữ số.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : '',
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setFeedback({ type: 'error', text: data?.error || 'Không thể cập nhật mật khẩu.' });
      } else {
        setFeedback({ type: 'success', text: data.message || 'Đã cập nhật mật khẩu thành công!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onPasswordUpdated?.();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    setFeedback(null);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent('/ho-so?tab=security')}&remember=1`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) {
        setFeedback({ type: 'error', text: 'Không thể khởi động liên kết Google: ' + error.message });
        setLinkingGoogle(false);
      }
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối Google.' });
      setLinkingGoogle(false);
    }
  };

  const handleLogoutAllBrowsers = async () => {
    setLoggingOutAll(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ global: true }),
      });
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
      clearAuthData();
      window.location.href = '/dang-nhap';
    } catch {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connected Sign-in Methods */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="border-b border-[var(--border-card)] pb-4">
          <h2 className="text-xl sm:text-2xl font-serif font-black flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <span>Bảo Mật &amp; Phương Thức Đăng Nhập</span>
          </h2>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Quản lý liên kết Google, mật khẩu đăng nhập Website &amp; App VERIDU Desktop, và phiên đăng nhập.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-[var(--text-main)]">Email &amp; Mật Khẩu</div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] truncate max-w-[180px]">{email}</div>
            </div>
            {hasPassword ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                Đã kích hoạt
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] shrink-0">
                Chưa đặt mật khẩu
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-[var(--text-main)]">Đăng Nhập Nhanh Google</div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {hasGoogle ? 'Đã liên kết với tài khoản Google' : 'Chưa liên kết Google'}
              </div>
            </div>
            {hasGoogle ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                Đã liên kết
              </span>
            ) : (
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold text-[11px] transition cursor-pointer shrink-0"
              >
                {linkingGoogle ? 'Đang mở...' : 'Liên kết'}
              </button>
            )}
          </div>
        </div>

        {/* Helpful callout for Google-only users wanting to sign in on Desktop App */}
        {!hasPassword && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-serif flex items-start gap-3">
            <Laptop className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-[var(--text-main)]">
                Đặt mật khẩu để đăng nhập vào App VERIDU trên máy tính
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Bạn đang đăng nhập nhanh bằng Google nên chưa có mật khẩu riêng. Hãy đặt mật khẩu ở khung bên dưới — sau đó bạn có thể dùng chính email <strong>{email}</strong> và mật khẩu này để đăng nhập vào App VERIDU Desktop (vẫn giữ nguyên đăng nhập nhanh Google trên web).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Set / Change Password Form */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
      >
        <div className="border-b border-[var(--border-card)] pb-3">
          <h3 className="text-lg font-serif font-black flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span>{hasPassword ? 'Đổi Mật Khẩu Tài Khoản' : 'Thiết Lập Mật Khẩu Cho App VERIDU'}</span>
          </h3>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-serif font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
          {hasPassword && (
            <div className="sm:col-span-2">
              <label className="font-bold block mb-1.5">Mật Khẩu Hiện Tại:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang sử dụng"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl pl-10 pr-10 py-3 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold block mb-1.5">Mật Khẩu Mới:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự (chữ + số)"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
              />
            </div>
            {newPassword && (
              <div className="flex gap-1 pt-1.5">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full ${
                      strengthScore >= idx
                        ? strengthScore >= 3
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-[var(--border-card)]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1.5">Xác Nhận Mật Khẩu Mới:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          <span>{saving ? 'Đang Lưu...' : hasPassword ? 'Cập Nhật Mật Khẩu' : 'Tạo Mật Khẩu Ngay'}</span>
        </button>
      </form>

      {/* Global Session Revocation */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">
            Đăng Xuất Khỏi Tất Cả Trình Duyệt
          </h4>
          <p className="text-xs font-serif text-[var(--text-muted)]">
            Thu hồi toàn bộ phiên đăng nhập web trên các máy tính hoặc điện thoại khác mà bạn từng đăng nhập.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogoutAllBrowsers}
          disabled={loggingOutAll}
          className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-500/30 font-serif font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loggingOutAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          <span>Đăng Xuất Mọi Nơi</span>
        </button>
      </div>
    </div>
  );
}
