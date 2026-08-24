'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  MapPin, 
  Clock, 
  Users, 
  Flame, 
  GraduationCap, 
  Cross, 
  Trophy, 
  Send, 
  Mail, 
  FileText, 
  Library, 
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  Layers,
  Compass,
  Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Detect theme state from documentElement
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.trim() }]);

      if (!error) {
        setStatus('success');
        setMessage('Đăng ký nhận Lời Chúa thành công!');
        setEmail('');
      } else {
        setStatus('error');
        if (error.code === '23505') {
          setMessage('Email này đã được đăng ký.');
        } else {
          setMessage('Có lỗi xảy ra, vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Không thể kết nối đến máy chủ.');
    }
  };

  const logoSrc = isDarkMode 
    ? '/images/veridu_logo_light.png' 
    : '/images/veridu_logo_dark.png';

  return (
    <footer className="mt-auto relative w-full overflow-hidden bg-[var(--header-bg)] border-t border-[var(--border-card)] backdrop-blur-2xl transition-colors duration-300">
      
      {/* 🌟 Liturgical Decorative Gold Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-60"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-10 relative z-10">
        
        {/* 🌟 4-COLUMN LITURGICAL CATHEDRAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          
          {/* CỘT 1: NHẬN DIỆN & SỨ MẠNG (4/12 Col) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group transition-transform hover:scale-[1.02]">
              <div className="relative h-10 w-44 flex items-center">
                <Image 
                  src={logoSrc} 
                  alt="VERIDU Logo" 
                  width={180} 
                  height={50}
                  className="object-contain max-h-10 w-auto transition-opacity duration-300 drop-shadow-md"
                />
              </div>
            </Link>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-[10px] font-bold tracking-widest uppercase">
                <Cross className="w-3 h-3 text-amber-500" /> VIA · VITA · VERITAS
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                Nền tảng số hóa tri thức Công giáo, nghiên cứu Thánh Kinh, Bản đồ 3D Thánh Địa, Đấu trường Giáo lý và Thư viện Thần học hiệp thông phụng sự Hội Thánh.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Việt Nam · Hiệp thông cùng Giáo Hội Toàn Cầu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>lienhe@thapgia.com · veridu.net@gmail.com</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: THÁNH KINH & KHÔNG GIAN 3D (3/12 Col) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif font-black text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
              <BookOpen className="w-4 h-4 text-amber-500" /> Thánh Kinh &amp; Lịch Sử
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/kinh-thanh" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Đọc Kinh Thánh Trực Tuyến</span>
                </Link>
              </li>
              <li>
                <Link href="/ban-do" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Bản Đồ 3D Thánh Địa</span>
                </Link>
              </li>
              <li>
                <Link href="/dong-thoi-gian" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Dòng Thời Gian Lịch Sử Thánh</span>
                </Link>
              </li>
              <li>
                <Link href="/nhan-vat" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Tra Cứu Nhân Vật Thánh Kinh</span>
                </Link>
              </li>
              <li>
                <Link href="/khoa-hoc" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Khóa Học LMS Công Giáo</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THƯ VIỆN & GIÁO LÝ (2/12 Col) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif font-black text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
              <Library className="w-4 h-4 text-amber-500" /> Tri Thức &amp; Mục Vụ
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/thu-vien" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Thư Viện Bài Viết</span>
                </Link>
              </li>
              <li>
                <Link href="/giao-ly" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Giáo Lý Hội Thánh</span>
                </Link>
              </li>
              <li>
                <Link href="/thu-vien/sach" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Tủ Sách Thần Học</span>
                </Link>
              </li>
              <li>
                <Link href="/thu-vien/tai-lieu" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Tài Liệu Huấn Quyền</span>
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Đấu Trường Giáo Lý</span>
                </Link>
              </li>
              <li>
                <Link href="/dang-bai" className="text-[var(--text-muted)] hover:text-amber-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:scale-125 transition-transform"></span>
                  <span>Đăng Tải Bài Viết</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: BẢN TIN PHỤNG VỤ & KẾT NỐI (3/12 Col) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif font-black text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
              <Mail className="w-4 h-4 text-amber-500" /> Nhận Bản Tin Phụng Vụ
            </h3>
            
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Đăng ký để nhận suy niệm Lời Chúa, phân tích tín lý và các tài liệu nghiên cứu mới nhất qua email.
            </p>

            <form onSubmit={handleSubscribe} className="relative">
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl py-3 pl-4 pr-12 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50 shadow-sm"
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95 shadow-md"
                title="Đăng Ký Nhận Bản Tin"
                aria-label="Đăng ký nhận bản tin"
              >
                {status === 'loading' ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {message && (
              <div className={`text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 ${
                status === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{message}</span>
              </div>
            )}
            
            <div className="pt-2">
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">Mạng Xã Hội Công Giáo</div>
              <div className="flex items-center gap-2.5">
                <a 
                  href="https://facebook.com/veridu.net" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Trang Facebook Fanpage VERIDU" 
                  className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-blue-500 hover:border-blue-500 hover:bg-blue-500/10 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Kênh YouTube VERIDU" 
                  className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Trang Instagram VERIDU" 
                  className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500 hover:bg-rose-500/10 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>
          
        </div>

        {/* 🌟 CÂU LỜI CHÚA TRANG TRỌNG CHÂN TRANG */}
        <div className="py-6 border-t border-[var(--border-card)] text-center space-y-1">
          <p className="font-serif italic text-xs sm:text-sm text-amber-800 dark:text-amber-400 font-medium">
            &ldquo;Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.&rdquo;
          </p>
          <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">— Thánh Vịnh 119, 105 —</span>
        </div>

        {/* 🌟 BOTTOM BAR: COPYRIGHT, LEGAL POLICIES & SYSTEM STATUS */}
        <div className="pt-6 border-t border-[var(--border-card)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} <strong className="text-[var(--text-main)] font-bold">VERIDU</strong> · Hiệp Thông &amp; Phụng Sự Giáo Hội.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-[11px]">
            <Link href="/dieu-khoan-su-dung" className="hover:text-amber-500 transition-colors">
              Điều Khoản Sử Dụng
            </Link>
            <Link href="/chinh-sach-bao-mat" className="hover:text-amber-500 transition-colors">
              Chính Sách Bảo Mật
            </Link>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Hệ thống an toàn &amp; ổn định
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
