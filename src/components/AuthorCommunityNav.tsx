'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HeartHandshake, 
  Compass, 
  BookMarked, 
  Scale, 
  PenTool,
  Sparkles
} from 'lucide-react';

interface AuthorCommunityNavProps {
  currentTab?: 'contribute' | 'needed' | 'style-guide' | 'legal-terms';
}

export default function AuthorCommunityNav({ currentTab }: AuthorCommunityNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      id: 'contribute',
      href: '/dong-gop',
      label: 'Sứ Mạng & Đóng Góp',
      icon: HeartHandshake,
      badge: 'Cộng Tác'
    },
    {
      id: 'needed',
      href: '/noi-dung-can-thiet',
      label: 'Nội Dung Cần Thiết',
      icon: Compass,
      badge: '8 Chuyên Mục'
    },
    {
      id: 'style-guide',
      href: '/huong-dan-viet-bai',
      label: 'Quy Chuẩn Viết Bài',
      icon: BookMarked,
      badge: 'Huấn Quyền & Mẫu HTML'
    },
    {
      id: 'legal-terms',
      href: '/dieu-khoan-tac-gia',
      label: 'Điều Khoản Tác Giả',
      icon: Scale,
      badge: 'Bản Quyền'
    }
  ];

  return (
    <div className="w-full bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-card)] sticky top-[72px] z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          
          {/* Main 4 Community Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all shrink-0 select-none ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span 
                      className={`hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded-full font-mono font-normal uppercase ${
                        isActive 
                          ? 'bg-slate-950/20 text-slate-950' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action to Creator Studio */}
          <div className="shrink-0 pl-2">
            <Link
              href="/dang-bai"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-serif font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Vào Phòng Soạn Thảo</span>
              <Sparkles className="w-3 h-3 text-slate-950/70" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
