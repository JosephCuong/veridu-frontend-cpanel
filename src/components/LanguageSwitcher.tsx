'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';

export type SupportedLocale = 'vi' | 'en' | 'la';

interface LocaleOption {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LOCALES: LocaleOption[] = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    nativeLabel: 'Tiếng Việt (Mặc định)',
    flag: '🇻🇳',
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English (International)',
    flag: '🇬🇧',
  },
  {
    code: 'la',
    label: 'Latina',
    nativeLabel: 'Lingua Latina (Liturgica)',
    flag: '🇻🇦',
  },
];

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export default function LanguageSwitcher({ className = '', compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('vi');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect current locale from URL path or cookie/localStorage
  useEffect(() => {
    if (pathname?.startsWith('/en/') || pathname === '/en') {
      setCurrentLocale('en');
    } else if (pathname?.startsWith('/la/') || pathname === '/la') {
      setCurrentLocale('la');
    } else {
      // Check stored preference
      const savedLocale = localStorage.getItem('veridu-locale') as SupportedLocale;
      if (savedLocale && ['vi', 'en', 'la'].includes(savedLocale)) {
        setCurrentLocale(savedLocale);
      } else {
        setCurrentLocale('vi');
      }
    }
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: SupportedLocale) => {
    setIsOpen(false);
    setCurrentLocale(newLocale);

    // Persist in localStorage and cookie for SSR
    localStorage.setItem('veridu-locale', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }));

    // Route logic
    const currentPath = pathname || '/';

    if (newLocale === 'en') {
      if (!currentPath.startsWith('/en')) {
        // Switch to /en/... or /en
        const targetPath = currentPath === '/' ? '/en' : `/en${currentPath}`;
        router.push(targetPath);
      }
    } else if (newLocale === 'la') {
      if (!currentPath.startsWith('/la')) {
        const cleanPath = currentPath.replace(/^\/(en|la)/, '') || '/';
        const targetPath = cleanPath === '/' ? '/la' : `/la${cleanPath}`;
        router.push(targetPath);
      }
    } else {
      // Switching to VI (default, no prefix)
      if (currentPath.startsWith('/en') || currentPath.startsWith('/la')) {
        const viPath = currentPath.replace(/^\/(en|la)/, '') || '/';
        router.push(viPath);
      }
    }
  };

  const activeOption = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Chọn ngôn ngữ"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 text-slate-200 hover:border-amber-500/50 hover:text-amber-400 transition-all shadow-md text-xs font-semibold cursor-pointer"
        title="Ngôn ngữ / Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-xs uppercase tracking-wider">{activeOption.code}</span>
        <span className="text-sm leading-none">{activeOption.flag}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-amber-400 font-serif">
            🌐 Chọn Ngôn Ngữ / Language
          </div>

          <div className="py-1">
            {LOCALES.map((option) => {
              const isSelected = option.code === currentLocale;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => switchLocale(option.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{option.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.nativeLabel}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        {option.code} · {option.label}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 mt-1 border-t border-slate-800 text-[9px] text-slate-400 font-serif leading-tight">
            ✝️ Bản dịch hàn lâm &amp; Phụng vụ chuẩn tắc
          </div>
        </div>
      )}
    </div>
  );
}
