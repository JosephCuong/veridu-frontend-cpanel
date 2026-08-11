'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Mail, Send, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (!error) {
        setStatus('success');
        setMessage('Đăng ký thành công!');
        setEmail('');
      } else {
        setStatus('error');
        if (error.code === '23505') {
          setMessage('Email này đã được đăng ký.');
        } else {
          setMessage('Có lỗi xảy ra, vui lòng thử lại.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <footer className="mt-auto relative w-full overflow-hidden bg-[var(--header-bg)] border-t border-[var(--border-card)] backdrop-blur-xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-50"></div>
      
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* 1. Branding Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)] flex items-center justify-center font-serif font-black text-xl text-slate-950 shadow-[0_0_15px_rgba(245,197,24,0.3)] transition-transform group-hover:scale-105">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-wider text-[var(--text-main)] group-hover:text-[var(--accent-gold)] transition-colors">
                  VERIDU
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)]">
                  VIA · VITA · VERITAS
                </span>
              </div>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Nền tảng học tập Công Giáo đa phương tiện. Kết hợp LMS hiện đại, Bản đồ 3D, Dòng thời gian, và Kinh Thánh trực quan.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <MapPin className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>Việt Nam</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Phone className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>(+84) 123 456 789</span>
              </div>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--text-main)] mb-6 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--accent-gold)]" /> Liên Kết Nhanh
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/khoa-hoc" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[var(--accent-gold)] before:rounded-full">
                  Khóa Học LMS
                </Link>
              </li>
              <li>
                <Link href="/kinh-thanh" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[var(--accent-gold)] before:rounded-full">
                  Đọc Kinh Thánh
                </Link>
              </li>
              <li>
                <Link href="/ban-do" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[var(--accent-gold)] before:rounded-full">
                  Bản Đồ 3D
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[var(--accent-gold)] before:rounded-full">
                  Quiz Giáo Lý
                </Link>
              </li>
              <li>
                <Link href="/thu-vien" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[var(--accent-gold)] before:rounded-full">
                  Thư Viện Bài Viết
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Resources */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--text-main)] mb-6">Trợ Giúp & Pháp Lý</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  Hướng Dẫn Sử Dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  Câu Hỏi Thường Gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  Điều Khoản & Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  Chính Sách Bảo Mật
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--text-main)] mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--accent-gold)]" /> Nhận Bản Tin
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
              Đăng ký để nhận thông báo về các khóa học mới và bài học Lời Chúa hàng tuần.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--accent-gold)] hover:bg-amber-400 text-slate-950 rounded-lg transition-colors disabled:opacity-50"
                title="Đăng Ký"
              >
                {status === 'loading' ? (
                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            {message && (
              <div className={`mt-3 text-xs font-semibold px-3 py-2 rounded-lg border ${
                status === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {message}
              </div>
            )}
            
            <div className="mt-8">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Kết Nối</h4>
              <div className="flex items-center gap-4">
                <a href="https://facebook.com/veridu.net" target="_blank" rel="noopener noreferrer" aria-label="Trang Facebook Fanpage VERIDU" className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 hover:bg-blue-600/10 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Trang Instagram VERIDU" className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-600 hover:bg-rose-600/10 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Kênh YouTube VERIDU" className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 hover:bg-red-600/10 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-[var(--border-card)] relative z-10">
          <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)] text-center md:text-left">
              &copy; {new Date().getFullYear()} VERIDU. Nền Tảng Học Tập Công Giáo.
            </p>
            <div className="flex items-center gap-6 text-xs text-[var(--text-muted)] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hệ thống hoạt động tốt</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
