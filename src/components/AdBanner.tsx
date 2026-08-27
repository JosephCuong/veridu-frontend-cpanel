'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink } from 'lucide-react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  customTitle?: string;
  customSubtitle?: string;
  customLink?: string;
}

export default function AdBanner({
  slotId = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  customTitle,
  customSubtitle,
  customLink = '/thu-vien'
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-5209827375568934';
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (err) {
      // Ignore adsbygoogle load error in local dev
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] p-4 shadow-md text-center transition-all ${className}`}>
      {/* Header Label */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2 border-b border-[var(--border-card)]/60 pb-1.5">
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
          <Sparkles className="w-3 h-3" />
          <span>Không Gian Mục Vụ &amp; Tài Trợ</span>
        </span>
        <span className="opacity-60">QUẢNG CÁO</span>
      </div>

      {/* Google AdSense ins tag */}
      <div className="relative min-h-[100px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '250px', minHeight: '90px', width: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />

        {/* Elegant Fallback Banner when AdSense is filling or in development */}
        <Link
          href={customLink}
          className="group block w-full py-4 px-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/50 transition-all text-left"
        >
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
              <span>{customTitle || 'Tủ Sách Điện Tử & Học Liệu VERIDU'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] font-serif leading-relaxed line-clamp-2">
              {customSubtitle || 'Khám phá hàng trăm đầu sách Thần học, Giáo luật và Slide giáo án PDF miễn phí phục vụ sứ vụ tông đồ.'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
