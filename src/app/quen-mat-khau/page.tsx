'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TurnstileWidget from '@/components/TurnstileWidget';
import { KeyRound, Mail, ArrowRight, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) return;
    if (!turnstileToken) {
      setErrorMsg('Vui lòng hoàn tất xác thực chống bot Cloudflare trước khi gửi yêu cầu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), turnstileToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error || 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.');
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      setTurnstileReset((n) => n + 1);
      setTurnstileToken('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 pt-24 sm:pt-28 md:pt-36 pb-16">
      <main className="max-w-md mx-auto px-4">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-black text-2xl text-[var(--text-main)]">Quên Mật Khẩu?</h1>
            <p className="text-xs font-serif text-[var(--text-muted)]">
              Nhập địa chỉ Email đã đăng ký để nhận liên kết khôi phục mật khẩu
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-serif flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-serif font-bold text-sm text-emerald-600 dark:text-emerald-400">
                Đã Gửi Hướng Dẫn Khôi Phục!
              </h3>
              <p className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                Nếu email tồn tại trên VERIDU, liên kết đặt lại mật khẩu đã được gửi tới hộp thư của bạn (hãy kiểm tra thêm mục Thư rác/Quảng cáo nếu chưa thấy).
              </p>
              <Link
                href="/dang-nhap"
                className="inline-block pt-2 text-xs font-serif font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                &larr; Quay lại Đăng Nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[var(--text-muted)]">Địa Chỉ Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl pl-10 pr-4 py-3 text-xs text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <TurnstileWidget
                action="forgot_password"
                onToken={setTurnstileToken}
                resetSignal={turnstileReset}
              />

              <button
                type="submit"
                disabled={isLoading || !turnstileToken}
                className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Gửi Yêu Cầu Khôi Phục</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[var(--border-card)] text-xs font-serif text-[var(--text-muted)]">
            <Link href="/dang-nhap" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
              &larr; Quay lại trang Đăng Nhập
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
