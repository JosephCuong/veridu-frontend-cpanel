'use client';

import React, { useState } from 'react';
import { Globe, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface ArticleLanguageBannerProps {
  hasManualEnglish: boolean;
  titleEn?: string | null;
}

export default function ArticleLanguageBanner({
  hasManualEnglish,
  titleEn,
}: ArticleLanguageBannerProps) {
  const { locale, t } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);

  // Only show when viewing in English or Latin mode
  if (locale === 'vi') return null;

  const handleTranslateArticle = () => {
    setIsTranslating(true);
    // Set cookie for Google Translate and trigger translation on document if available
    try {
      document.cookie = `googtrans=/vi/${locale}; path=/;`;
      const hostname = window.location.hostname;
      document.cookie = `googtrans=/vi/${locale}; path=/; domain=.${hostname};`;
      window.location.reload();
    } catch {
      setIsTranslating(false);
    }
  };

  const handleRestoreOriginal = () => {
    try {
      document.cookie = 'googtrans=; path=/; max-age=0;';
      const hostname = window.location.hostname;
      document.cookie = `googtrans=; path=/; domain=.${hostname}; max-age=0;`;
      document.cookie = 'googtrans=/vi/vi; path=/;';
      window.location.reload();
    } catch {}
  };

  if (hasManualEnglish) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-serif font-bold text-emerald-400 uppercase tracking-wider">
              {t('article.manual_en_available', 'Bản dịch tiếng Anh học thuật')}
            </div>
            <div className="text-[11px] text-slate-300">
              {titleEn ? `“${titleEn}”` : 'Scholarly canonical English translation authorized by VERIDU Editorial Board.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <div className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider">
            {t('article.scholarly_edition', 'Bản Dịch Hàn Lâm')}
          </div>
          <div className="text-[11px] text-slate-300">
            {t('article.manual_en_missing', 'Bản dịch tiếng Anh chính thức đang được hoàn thiện.')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleTranslateArticle}
          disabled={isTranslating}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
        >
          {isTranslating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{t('article.on_demand_translate_btn', '🌐 Dịch tự động bài này')}</span>
        </button>

        <button
          type="button"
          onClick={handleRestoreOriginal}
          className="px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-700 font-serif text-xs transition-all cursor-pointer"
        >
          {t('article.on_demand_original_btn', '🇻🇳 Xem bản gốc tiếng Việt')}
        </button>
      </div>
    </div>
  );
}
