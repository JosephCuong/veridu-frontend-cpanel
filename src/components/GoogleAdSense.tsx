'use client';

import React from 'react';
import Script from 'next/script';

export default function GoogleAdSense() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-5209827375568934';

  if (!clientId) return null;

  return (
    <Script
      id="google-adsense-init"
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
    />
  );
}
