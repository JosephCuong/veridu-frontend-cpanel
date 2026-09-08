'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const isExcludedRoute = pathname === '/dang-bai' || pathname?.startsWith('/dang-bai/');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const showButton = isVisible && !isExcludedRoute;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Trở về đầu trang"
      tabIndex={showButton ? 0 : -1}
      style={{ contain: 'layout paint', willChange: 'opacity, transform' }}
      className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-2xl shadow-amber-500/30 transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 border border-amber-300/50 backdrop-blur-md flex items-center justify-center group ${
        showButton
          ? 'opacity-100 pointer-events-auto scale-100 translate-y-0'
          : 'opacity-0 pointer-events-none scale-75 translate-y-4 select-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}

