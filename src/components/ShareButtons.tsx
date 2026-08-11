'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Share2, Check } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const buttonClass = "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg backdrop-blur-md border";

  return (
    <div className={`fixed z-50 transition-all duration-500 ease-in-out ${isSticky ? 'bottom-6 left-1/2 -translate-x-1/2 lg:bottom-1/2 lg:translate-y-1/2 lg:left-6 lg:translate-x-0 lg:scale-100 lg:opacity-100 scale-100 opacity-100' : '-bottom-24 left-1/2 -translate-x-1/2 lg:bottom-1/2 lg:translate-y-1/2 lg:-left-24 lg:translate-x-0 scale-50 opacity-0 pointer-events-none'}`}>
      <div className="flex lg:flex-col items-center space-x-3 lg:space-x-0 lg:space-y-3 px-6 py-3 lg:px-3 lg:py-6 rounded-full bg-[var(--bg-card)]/95 border border-[var(--border-card)] shadow-2xl backdrop-blur-xl">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 lg:mr-0 lg:mb-2 flex items-center lg:justify-center uppercase tracking-wider hidden sm:flex">
          <Share2 className="w-3 h-3 mr-1 lg:mr-0 lg:mb-1 text-slate-600 dark:text-slate-400" />
          <span className="lg:hidden">Chia sẻ</span>
        </span>

        {/* Facebook */}
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/30 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold text-xs`}
          aria-label="Chia sẻ lên Facebook"
        >
          FB
        </a>

        {/* Twitter (X) */}
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-slate-800/10 text-slate-800 dark:text-slate-200 border-slate-700/30 hover:bg-slate-800 hover:text-white hover:border-slate-800 font-bold text-xs`}
          aria-label="Chia sẻ lên X (Twitter)"
        >
          X
        </a>

        {/* Zalo */}
        <a 
          href={`https://sp.zalo.me/plugins/share?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-sky-600/10 text-sky-700 dark:text-sky-400 border-sky-600/30 hover:bg-sky-600 hover:text-white hover:border-sky-600 font-bold text-xs`}
          aria-label="Chia sẻ lên Zalo"
        >
          Zalo
        </a>

        {/* Copy Link */}
        <button 
          onClick={handleCopyLink}
          className={`${buttonClass} ${copied ? 'bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/30' : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-600/30 hover:bg-amber-500 hover:text-slate-950'}`}
          aria-label="Sao chép liên kết"
        >
          {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
