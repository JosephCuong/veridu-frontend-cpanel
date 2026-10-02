'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Tag, 
  User, 
  Calendar, 
  Clock, 
  Headphones, 
  Video, 
  Globe, 
  Check, 
  Sparkles 
} from 'lucide-react';
import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import ArticleGeoTimelineWidget from '@/components/ArticleGeoTimelineWidget';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import AdminEditFloatingButton from '@/components/AdminEditFloatingButton';
import ArticleAuthorCard from '@/components/ArticleAuthorCard';
import ArticleRelatedContent from '@/components/ArticleRelatedContent';
import ArticleCitationAndLicense from '@/components/ArticleCitationAndLicense';
import ArticleLanguageBanner from '@/components/ArticleLanguageBanner';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/components/Toast';

export interface ArticleReaderClientProps {
  initialLocale: 'vi' | 'en';
  article: any;
  geoTimeline?: {
    locations: any[];
    timelineEvents: any[];
  } | null;
  authorProfile: any;
  relatedItems: any[];
  cleanHtmlContentVi: string;
  cleanHtmlContentEn: string;
  sacredScripture: {
    quote: string;
    source: string;
  };
  extractedImages: string[];
  coverImage?: string;
  defaultImage: string;
  siteUrl: string;
  articleJsonLd: any;
}

const HeroBanner = ({ imageUrl }: { imageUrl?: string }) => {
  if (!imageUrl) return null;
  const isGoogleDrive = imageUrl.includes('googleusercontent.com') || imageUrl.includes('drive.google.com');
  return (
    <div className="w-full h-[40vh] sm:h-[50vh] relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent z-10"></div>
      <Image 
        src={imageUrl} 
        alt="Cover" 
        fill 
        className="object-cover animate-fadeIn" 
        sizes="100vw" 
        priority 
        unoptimized={isGoogleDrive}
      />
    </div>
  );
};

const MetaDataRow = ({ article, locale }: { article: any; locale: 'vi' | 'en' }) => {
  const isEn = locale === 'en';
  const authorName = article.author_name || article.author || (isEn ? 'VERIDU Editorial Board' : 'Ban Biên Tập VERIDU');
  
  const rawReadingTime = article.reading_time || article.readingTime;
  const readingTime = isEn 
    ? (article.reading_time_en || `${parseInt(rawReadingTime) || 5} min read`) 
    : (rawReadingTime || '5 phút đọc');
  
  let formattedDate = '';
  const dateVal = article.published_at || article.created_at;
  if (dateVal) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        if (isEn) {
          formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          formattedDate = `${day}/${month}/${year}`;
        }
      }
    } catch (e) {}
  }

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300 mt-6">
      {authorName && (
        <div className="flex items-center gap-1.5 bg-[var(--bg-main)] px-3 py-1.5 rounded-full border border-[var(--border-card)]">
          <User className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>{authorName}</span>
        </div>
      )}
      {formattedDate && (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      )}
      {readingTime && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>{readingTime}</span>
        </div>
      )}
      {article.category && (
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>{article.category}</span>
        </div>
      )}
      {(article.audio_url || article.contentHtml?.includes('<audio') || article.interactiveHtml?.includes('<audio') || article.content_en?.includes('<audio')) && (
        <a 
          href="#podcast-audio" 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30 transition-all cursor-pointer group"
          title={isEn ? "Click to listen to Podcast Audio" : "Nhấp để nghe bản Audio Podcast"}
        >
          <Headphones className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span>{isEn ? "🎧 Audio Podcast" : "🎧 Có Podcast Audio"}</span>
        </a>
      )}
      {(article.video_url || article.contentHtml?.includes('veridu-embed-video') || article.interactiveHtml?.includes('veridu-embed-video') || article.content_en?.includes('veridu-embed-video')) && (
        <a 
          href="#video-embed" 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/30 transition-all cursor-pointer group"
          title={isEn ? "Click to watch subtitled video" : "Nhấp để xem Video phụ đề"}
        >
          <Video className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span>{isEn ? "🎬 Subtitled Video" : "🎬 Có Video Phụ Đề"}</span>
        </a>
      )}
    </div>
  );
};

export default function ArticleReaderClient({
  initialLocale,
  article,
  geoTimeline,
  authorProfile,
  relatedItems,
  cleanHtmlContentVi,
  cleanHtmlContentEn,
  sacredScripture,
  extractedImages,
  coverImage,
  defaultImage,
  siteUrl,
  articleJsonLd,
}: ArticleReaderClientProps) {
  const { locale: contextLocale, setLocale } = useTranslation();
  const { showToast } = useToast();

  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(initialLocale);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const hasEnglishTranslation = Boolean(article.content_en && article.content_en.trim().length > 0);
  const isEn = currentLang === 'en';

  // Synchronize initial context locale if page was directly loaded with initialLocale
  useEffect(() => {
    if (contextLocale !== initialLocale && (initialLocale === 'vi' || initialLocale === 'en')) {
      setLocale(initialLocale);
    }
  }, [initialLocale, contextLocale, setLocale]);

  // Handle language switch
  const handleSwitchLanguage = React.useCallback((targetLang: 'vi' | 'en') => {
    if (targetLang === currentLang) return;

    if (targetLang === 'en' && !hasEnglishTranslation) {
      showToast(
        'info',
        'Bản Dịch Đang Biên Soạn',
        'Bài viết này hiện chưa có bản dịch tiếng Anh học thuật. Quý vị có thể tham khảo bản gốc tiếng Việt bên dưới.'
      );
      // Stay on Vietnamese view, keep header synced to vi
      setLocale('vi');
      return;
    }

    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentLang(targetLang);
      setLocale(targetLang);

      // Smooth URL pushState without page reload
      const newUrl = targetLang === 'en' ? `/en/${article.slug}` : `/${article.slug}`;
      if (typeof window !== 'undefined' && window.location.pathname !== newUrl) {
        window.history.pushState({ lang: targetLang }, '', newUrl);
      }

      setIsTransitioning(false);
    }, 120);
  }, [currentLang, hasEnglishTranslation, showToast, setLocale, article.slug]);

  // Sync when user clicks language in LiturgicalHeader
  const prevContextLocaleRef = useRef(contextLocale);
  useEffect(() => {
    if (prevContextLocaleRef.current !== contextLocale) {
      prevContextLocaleRef.current = contextLocale;
      if (contextLocale === 'en' && currentLang !== 'en') {
        handleSwitchLanguage('en');
      } else if (contextLocale === 'vi' && currentLang !== 'vi') {
        handleSwitchLanguage('vi');
      }
    }
  }, [contextLocale, currentLang, handleSwitchLanguage]);

  // Support Browser Back and Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const isEnglishPath = window.location.pathname.startsWith('/en/');
      const targetLang: 'vi' | 'en' = isEnglishPath ? 'en' : 'vi';
      if (targetLang !== currentLang) {
        if (targetLang === 'en' && !hasEnglishTranslation) {
          setCurrentLang('vi');
          setLocale('vi');
        } else {
          setCurrentLang(targetLang);
          setLocale(targetLang);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentLang, hasEnglishTranslation, setLocale]);

  // Compute active content values
  const displayTitle = isEn && article.title_en ? article.title_en : (article.title || 'Bài Viết VERIDU');
  const cleanTitle = displayTitle.replace(/<[^>]+>/g, '');
  const displayContent = isEn && hasEnglishTranslation ? cleanHtmlContentEn : cleanHtmlContentVi;
  const displayExcerpt = isEn && article.excerpt_en ? article.excerpt_en : (article.excerpt || '');
  const activeArticleUrl = isEn ? `${siteUrl}/en/${article.slug}` : `${siteUrl}/${article.slug}`;

  const effectiveLocations = geoTimeline?.locations || [];
  const effectiveTimelineEvents = geoTimeline?.timelineEvents || [];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <HeroBanner imageUrl={coverImage} />

      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${coverImage ? '-mt-24' : 'pt-24 sm:pt-28 md:pt-36'}`}>
        
        {/* Top Navigation Row: Back Button & In-Place Language Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <Link 
            href={isEn ? "/en" : "/thu-vien"} 
            className="inline-flex items-center text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline bg-[var(--bg-card)]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[var(--border-card)] shadow-md transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> 
            <span>{isEn ? "Back to English Portal" : "Quay Lại Thư Viện"}</span>
          </Link>

          {/* Bilingual Quick-Switch Pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-card)] shadow-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSwitchLanguage('vi')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                currentLang === 'vi'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/10'
              }`}
              aria-pressed={currentLang === 'vi'}
              title="Đọc ấn bản tiếng Việt"
            >
              <span className="text-sm">🇻🇳</span>
              <span>Tiếng Việt</span>
              {currentLang === 'vi' && <Check className="w-3 h-3 text-slate-950 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchLanguage('en')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/10'
              }`}
              aria-pressed={currentLang === 'en'}
              title={hasEnglishTranslation ? "Read English Translation" : "Bản dịch tiếng Anh đang chuẩn bị"}
            >
              <span className="text-sm">🇬🇧</span>
              <span>English</span>
              {hasEnglishTranslation && currentLang !== 'en' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Available" />
              )}
              {currentLang === 'en' && <Check className="w-3 h-3 text-slate-950 ml-0.5" />}
            </button>
          </div>
        </div>
        
        {/* Main 2-Column Stained-Glass Scholarly Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 w-full max-w-[850px] mx-auto space-y-8">
            
            {/* Bilingual Scholar / Contribution Banner */}
            <ArticleLanguageBanner 
              articleId={article.id}
              articleSlug={article.slug}
              articleTitle={cleanTitle}
              hasManualEnglish={hasEnglishTranslation} 
              titleEn={article.title_en} 
              contentEn={article.content_en}
              excerptEn={article.excerpt_en}
              activeLocale={currentLang}
            />

            {/* Main Scholarly Article Card with Silky Cross-Fade Transition */}
            <article 
              className={`p-6 sm:p-12 rounded-3xl glass-panel space-y-8 relative overflow-hidden veridu-scholarly-article transition-opacity duration-200 ${
                isTransitioning ? 'opacity-40 blur-[1px]' : 'opacity-100 blur-0'
              }`}
            >
              <header className="border-b border-slate-200/50 dark:border-white/10 pb-8 text-center sm:text-left space-y-4 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-[var(--text-main)] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                    <Tag className="w-3.5 h-3.5" /> {article.category || (isEn ? 'Sacred Theology' : 'Bài Viết')}
                  </span>

                  {/* Contextual In-Article Language Switch Button */}
                  {hasEnglishTranslation && currentLang === 'vi' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchLanguage('en')}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-105"
                      title="Read English Translation"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>🇬🇧 Read in English</span>
                    </button>
                  )}
                  {currentLang === 'en' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchLanguage('vi')}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-105"
                      title="Đọc bản gốc tiếng Việt"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      <span>🇻🇳 Đọc bản gốc tiếng Việt</span>
                    </button>
                  )}
                </div>

                <h1 
                  className="text-3xl sm:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 leading-[1.25] drop-shadow-sm" 
                  dangerouslySetInnerHTML={{ __html: displayTitle }} 
                />

                {displayExcerpt && (
                  <p className="text-base sm:text-lg text-[var(--text-muted)] font-serif italic leading-relaxed pt-1">
                    {displayExcerpt.replace(/<[^>]+>/g, '')}
                  </p>
                )}

                <MetaDataRow article={article} locale={currentLang} />
              </header>
              
              {/* Core Content Container - Always marked with .article-content for TOC scanning */}
              <div className="article-content relative z-10">
                <VisualArticleRenderer contentHtml={displayContent} />
              </div>
              
              {/* Tags */}
              {(article as any).tags && (article as any).tags.length > 0 && (
                <div className="pt-8 border-t border-slate-200/50 dark:border-white/10 flex flex-wrap gap-2 relative z-10">
                  {(article as any).tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/40 dark:bg-slate-800/40 border border-white/20 rounded-lg text-xs font-semibold text-[var(--text-main)] shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Dedicated Scholarly Explorer Section: Geo & Timeline (Placed cleanly outside <article>) */}
            {(effectiveLocations.length > 0 || effectiveTimelineEvents.length > 0) && (
              <div id="geo-timeline-section" className="relative z-10 scroll-mt-24">
                <ArticleGeoTimelineWidget 
                  locations={effectiveLocations} 
                  timelineEvents={effectiveTimelineEvents} 
                  articleTitle={cleanTitle} 
                  articleSlug={article.slug}
                />
              </div>
            )}

            {/* 1. About the Author */}
            <ArticleAuthorCard 
              author={authorProfile} 
              publishedDate={article.published_at || article.created_at} 
              locale={currentLang}
            />

            {/* 2. Multi-dimensional Related Content */}
            <ArticleRelatedContent 
              items={relatedItems} 
            />

            {/* 3. Academic Citation & Copyright License */}
            <ArticleCitationAndLicense 
              title={cleanTitle} 
              authorName={authorProfile.christian_name ? `${authorProfile.christian_name} ${authorProfile.full_name}` : (authorProfile.full_name || article.author_name || article.author || 'VERIDU')} 
              publishedDate={article.created_at} 
              url={activeArticleUrl} 
              locale={currentLang}
            />
          </main>

          {/* Sticky Table of Contents Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-36 self-start">
            <TableOfContents locale={currentLang} contentKey={currentLang} />
          </aside>
        </div>
      </div>

      {/* Share Buttons Floating Overlay */}
      <ShareButtons 
        url={activeArticleUrl} 
        title={cleanTitle} 
        quote={sacredScripture.quote}
        quoteSource={sacredScripture.source}
        category={article.category || (isEn ? 'Sacred Theology' : 'Thần Học & Thánh Kinh')}
        author={authorProfile.christian_name ? `${authorProfile.christian_name} ${authorProfile.full_name}` : (article.author_name || article.author || 'Ban Học Vụ VERIDU')}
        imageUrl={coverImage || defaultImage}
        availableImages={extractedImages}
      />
      <AdminEditFloatingButton articleId={article.id} />
    </div>
  );
}
