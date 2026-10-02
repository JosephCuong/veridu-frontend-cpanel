'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { SupportedLocale } from '@/locales/types';

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
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (code: SupportedLocale) => {
    setIsOpen(false);
    setLocale(code);
  };

  const activeOption = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Chọn ngôn ngữ / Select Language"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-100 dark:bg-slate-900/80 hover:bg-stone-200 dark:hover:bg-slate-850 border border-stone-300 dark:border-slate-700/60 text-stone-800 dark:text-slate-200 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400 transition-all shadow-sm text-xs font-semibold cursor-pointer"
        title="Ngôn ngữ / Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-xs uppercase tracking-wider">{activeOption.code}</span>
        <span className="text-sm leading-none">{activeOption.flag}</span>
        <ChevronDown
          className={`w-3 h-3 text-stone-500 dark:text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-stone-200 dark:border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-stone-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif flex items-center justify-between">
            <span>🌐 {t('header.language', 'Chọn Ngôn Ngữ')}</span>
            <span className="font-mono text-[9px] text-stone-400 dark:text-slate-500">i18n</span>
          </div>

          <div className="py-1">
            {LOCALES.map((option) => {
              const isSelected = option.code === locale;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold'
                      : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800/80 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{option.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">{option.nativeLabel}</span>
                      <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                        {option.code} · {option.label}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="px-3.5 py-2 mt-1 border-t border-stone-200 dark:border-slate-800 text-[9px] text-stone-500 dark:text-slate-400 font-serif leading-tight">
            ✝️ Bản dịch hàn lâm &amp; Phụng vụ chuẩn tắc
          </div>
        </div>
      )}
    </div>
  );
}
