'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';
import Cookies from 'js-cookie';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if user already consented
    const localConsent = typeof window !== 'undefined' ? localStorage.getItem('veridu_cookie_consent') : null;
    const cookieConsent = Cookies.get('veridu_cookie_consent');

    if (!localConsent && !cookieConsent) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veridu_cookie_consent', 'accepted');
    }
    Cookies.set('veridu_cookie_consent', 'accepted', { 
      expires: 365, 
      path: '/', 
      sameSite: 'lax',
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:'
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Thông báo Cookie & Bảo mật"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-auto animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="relative rounded-2xl bg-slate-950/90 dark:bg-slate-950/95 border border-amber-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-slate-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleAccept}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          title="Đóng thông báo"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
              <span>Bảo Mật &amp; Trải Nghiệm Học Tập</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              VERIDU sử dụng cookie thiết yếu nhằm duy trì phiên đăng nhập bảo mật, ghi nhận chuỗi học tập (streak) và tối ưu hóa tốc độ tải trang.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <Link
            href="/chinh-sach-bao-mat"
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Tìm hiểu Chính Sách Bảo Mật
          </Link>

          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer text-center"
          >
            Đã hiểu &amp; Chấp nhận
          </button>
        </div>

      </div>
    </aside>
  );
}
