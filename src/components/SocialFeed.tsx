'use client';

import React, { useEffect, useState } from 'react';

interface SocialFeedProps {
  pageUrl?: string;
  title?: string;
}

export default function SocialFeed({ 
  pageUrl = "https://www.facebook.com/veridu.net", 
  title = "Kết nối cùng VERIDU" 
}: SocialFeedProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-500"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-600/30 font-bold">
          FB
        </div>
        <h3 className="font-serif font-black text-xl text-[var(--text-main)]">{title}</h3>
      </div>

      <div className="relative z-10 bg-white rounded-xl overflow-hidden shadow-inner flex justify-center">
        {mounted ? (
          <iframe 
            src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
            title="Bảng tin Facebook Fanpage VERIDU"
            width="340" 
            height="500" 
            style={{ border: 'none', overflow: 'hidden' }} 
            scrolling="no" 
            frameBorder="0" 
            allowFullScreen={true} 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        ) : (
          <div className="h-[500px] w-full flex items-center justify-center bg-slate-100 text-slate-400">
            <span className="animate-pulse">Đang tải bảng tin...</span>
          </div>
        )}
      </div>
    </div>
  );
}
