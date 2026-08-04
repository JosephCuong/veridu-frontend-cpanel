'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { KeyRound, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';
      await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // We ignore errors to prevent user-enumeration
      setIsSubmitted(true);
    } catch (err) {
      // In case of network error, still show success to not leak info
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950">
      

      <main className="max-w-md mx-auto px-4 py-16">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-black text-2xl text-[var(--text-main)]">Quên Mật Khẩu?</h1>
            <p className="text-xs text-[var(--text-muted)]">Nhập địa chỉ Email đã đăng ký để nhận liên kết khôi phục mật khẩu</p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-sm text-emerald-300">Đã Gửi Hướng Dẫn Kích Hoạt!</h3>
              <p className="text-xs text-[var(--text-muted)]">Vui lòng kiểm tra hộp thư đến Email của bạn để hoàn tất việc đặt lại mật khẩu.</p>
              <Link href="/dang-nhap" className="inline-block pt-2 text-xs font-bold text-amber-400 hover:underline">
                &larr; Quay lại Đăng Nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)]">Địa Chỉ Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-main)] focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
              >
                <span>Gửi Yêu Cầu Khôi Phục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[var(--border-card)] text-xs text-[var(--text-muted)]">
            <Link href="/dang-nhap" className="text-amber-400 font-bold hover:underline">
              &larr; Quay lại trang Đăng Nhập
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
