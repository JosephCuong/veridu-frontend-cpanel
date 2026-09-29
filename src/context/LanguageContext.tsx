'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SupportedLocale, TranslationDictionary } from '@/locales/types';
import { viDictionary } from '@/locales/vi';
import { enDictionary } from '@/locales/en';
import { laDictionary } from '@/locales/la';

const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  vi: viDictionary,
  en: enDictionary,
  la: laDictionary,
};

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (keyPath: string, fallback?: string) => string;
  dictionary: TranslationDictionary;
  isEn: boolean;
  isVi: boolean;
  isLa: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocaleState] = useState<SupportedLocale>('vi');

  // Synchronize initial locale from pathname or storage
  useEffect(() => {
    if (pathname?.startsWith('/en/') || pathname === '/en') {
      setLocaleState('en');
    } else if (pathname?.startsWith('/la/') || pathname === '/la') {
      setLocaleState('la');
    } else {
      const stored = localStorage.getItem('veridu-locale') as SupportedLocale;
      if (stored && ['vi', 'en', 'la'].includes(stored)) {
        setLocaleState(stored);
      } else {
        setLocaleState('vi');
      }
    }
  }, [pathname]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('veridu-locale', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }));

    // URL Routing transition
    const currentPath = pathname || '/';

    // Synchronize googtrans cookie for automated body translation
    try {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (newLocale === 'en') {
          document.cookie = 'googtrans=/vi/en; path=/;';
          document.cookie = `googtrans=/vi/en; path=/; domain=.${hostname};`;
        } else if (newLocale === 'la') {
          document.cookie = 'googtrans=/vi/la; path=/;';
          document.cookie = `googtrans=/vi/la; path=/; domain=.${hostname};`;
        } else {
          document.cookie = 'googtrans=; path=/; max-age=0;';
          document.cookie = `googtrans=; path=/; domain=.${hostname}; max-age=0;`;
          document.cookie = 'googtrans=/vi/vi; path=/;';
        }
      }
    } catch {
      // Ignore SSR cookie errors
    }

    if (newLocale === 'en') {
      if (!currentPath.startsWith('/en')) {
        const cleanPath = currentPath.replace(/^\/(la)/, '') || '/';
        const target = cleanPath === '/' ? '/en' : `/en${cleanPath}`;
        router.push(target);
      }
    } else if (newLocale === 'la') {
      if (!currentPath.startsWith('/la')) {
        const cleanPath = currentPath.replace(/^\/(en)/, '') || '/';
        const target = cleanPath === '/' ? '/la' : `/la${cleanPath}`;
        router.push(target);
      }
    } else {
      // Return to Vietnamese (no prefix)
      if (currentPath.startsWith('/en') || currentPath.startsWith('/la')) {
        const viPath = currentPath.replace(/^\/(en|la)/, '') || '/';
        router.push(viPath);
      }
    }
  };

  const dictionary = useMemo(() => DICTIONARIES[locale] || viDictionary, [locale]);

  // Nested key resolver helper (e.g. t('nav.bible') => 'Sacred Scripture')
  const t = (keyPath: string, fallback?: string): string => {
    try {
      const parts = keyPath.split('.');
      let current: any = dictionary;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Fallback to Vietnamese dictionary
          let viFallback: any = viDictionary;
          for (const viPart of parts) {
            if (viFallback && typeof viFallback === 'object' && viPart in viFallback) {
              viFallback = viFallback[viPart];
            } else {
              return fallback || keyPath;
            }
          }
          return typeof viFallback === 'string' ? viFallback : (fallback || keyPath);
        }
      }
      return typeof current === 'string' ? current : (fallback || keyPath);
    } catch {
      return fallback || keyPath;
    }
  };

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    dictionary,
    isEn: locale === 'en',
    isVi: locale === 'vi',
    isLa: locale === 'la',
  }), [locale, dictionary]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: 'vi' as SupportedLocale,
      setLocale: () => {},
      t: (keyPath: string, fallback?: string) => fallback || keyPath,
      dictionary: viDictionary,
      isEn: false,
      isVi: true,
      isLa: false,
    };
  }
  return context;
}
