'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export default function AdBanner({
  slotId = '1234567890',
  format = 'auto',
  responsive = true,
  className = ''
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3636359556839352';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // Ignore adsbygoogle load error in local dev
    }
  }, []);

  return (
    <div className={`w-full my-6 text-center overflow-hidden min-h-[90px] flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest block mb-1">
        QUẢNG CÁO
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '280px', minHeight: '90px' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
