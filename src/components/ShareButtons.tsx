'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Share2, Check, BookOpen, Send } from 'lucide-react';
import QuoteCardModal from './QuoteCardModal';

export interface ShareButtonsProps {
  url: string;
  title: string;
  quote?: string;
  quoteSource?: string;
  category?: string;
  author?: string;
  imageUrl?: string;
  availableImages?: string[];
}

export default function ShareButtons({
  url,
  title,
  quote = '',
  quoteSource = '',
  category,
  author,
  imageUrl,
  availableImages = [],
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsSticky(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  const buttonClass = "w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border shrink-0 transition-all duration-200 active:scale-95 cursor-pointer";

  return (
    <>
      {/* ── DESKTOP-ONLY FLOATING SHARE DOCK (Hidden on Mobile < lg to avoid viewport clutter) ── */}
      <aside
        aria-label="Chia sẻ bài viết phụng vụ"
        style={{ contain: 'layout paint' }}
        className={'hidden lg:flex fixed z-40 transition-opacity duration-200 ease-out ' + (
          isSticky
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        ) + ' left-6 top-[max(140px,calc(50vh-180px))]'}
      >
        <div className="flex flex-col items-center gap-2 p-2 rounded-full bg-[var(--bg-card)]/95 border border-[var(--border-card)] shadow-2xl backdrop-blur-xl">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20 shrink-0"
            title="Cổng chia sẻ phụng vụ"
            aria-hidden="true"
          >
            <Share2 className="w-4 h-4" />
          </div>

          {/* Trigger Quote Card Generator Modal - Sacred BookOpen Icon */}
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className={buttonClass + ' bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-slate-950 border-amber-500/40 shadow-amber-500/10'}
            title="Trích xuất Thẻ Lời Chúa & Châm Ngôn"
            aria-label="Tạo thẻ ảnh Lời Chúa"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Facebook */}
          <a 
            href={'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass + ' bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/30 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold text-xs'}
            aria-label="FB - Chia sẻ lên Facebook"
            title="Chia sẻ lên Facebook"
          >
            FB
          </a>

          {/* Zalo */}
          <a 
            href={'https://sp.zalo.me/plugins/share?url=' + encodedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass + ' bg-sky-600/10 text-sky-700 dark:text-sky-400 border-sky-600/30 hover:bg-sky-600 hover:text-white hover:border-sky-600 font-bold text-xs'}
            aria-label="Chia sẻ lên Zalo"
            title="Chia sẻ lên Zalo"
          >
            Zalo
          </a>

          {/* Telegram */}
          <a 
            href={'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedTitle}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass + ' bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-600/30 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 font-bold text-xs'}
            aria-label="Chia sẻ lên Telegram"
            title="Chia sẻ lên Telegram"
          >
            <Send className="w-3.5 h-3.5" />
          </a>

          {/* Twitter (X) */}
          <a 
            href={'https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass + ' bg-slate-800/10 text-slate-800 dark:text-slate-200 border-slate-700/30 hover:bg-slate-800 hover:text-white hover:border-slate-800 font-bold text-xs'}
            aria-label="Chia sẻ lên X (Twitter)"
            title="Chia sẻ lên X"
          >
            X
          </a>

          {/* Copy Link */}
          <button 
            onClick={handleCopyLink}
            className={buttonClass + ' ' + (copied ? 'bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/30' : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-600/30 hover:bg-amber-500 hover:text-slate-950')}
            aria-label="Sao chép liên kết"
            title="Sao chép liên kết"
          >
            {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Quote Card Modal */}
      <QuoteCardModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialQuote={quote}
        initialTitle={quoteSource}
        initialAuthor={author || 'Học Viện Thần Học VERIDU'}
        category={category || 'Thần Học & Thánh Kinh'}
        imageUrl={imageUrl}
        availableImages={availableImages}
      />
    </>
  );
}

{/* ── INLINE ARTICLE SHARE CARD (Perfect for Mobile and Article End on All Devices) ── */}
export function ArticleInlineShare({
  url,
  title,
  quote = '',
  quoteSource = '',
  category,
  author,
  imageUrl,
  availableImages = [],
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: quote || title,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full my-6 p-4 sm:p-6 rounded-3xl bg-[var(--bg-card)]/90 border border-[var(--border-card)] shadow-lg backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Title & Liturgical Note */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
              Lan Tỏa Bài Khảo Luận
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-serif italic">
              Đồng hành cùng VERIDU gieo mầm hạt giống đức tin đến cộng đoàn
            </p>
          </div>
        </div>

        {/* Share Action Buttons (Compliant with 44px touch targets) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          {/* Quote Card Trigger Button */}
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="h-11 px-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 border border-amber-500/30 transition-all flex items-center gap-2 text-xs font-serif font-bold shadow-sm cursor-pointer active:scale-95"
            title="Trích xuất thẻ ảnh Lời Chúa & Châm Ngôn"
            aria-label="Tạo thẻ ảnh Lời Chúa"
          >
            <BookOpen className="w-4 h-4 text-amber-500 group-hover:text-slate-950" />
            <span>Tạo Thẻ Ảnh</span>
          </button>

          {/* Facebook */}
          <a
            href={'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-2xl bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-600/30 flex items-center justify-center text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Chia sẻ lên Facebook"
            aria-label="Chia sẻ lên Facebook"
          >
            FB
          </a>

          {/* Zalo */}
          <a
            href={'https://sp.zalo.me/plugins/share?url=' + encodedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-2xl bg-sky-600/10 hover:bg-sky-600 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-600/30 flex items-center justify-center text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Chia sẻ lên Zalo"
            aria-label="Chia sẻ lên Zalo"
          >
            Zalo
          </a>

          {/* Telegram */}
          <a
            href={'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedTitle}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-2xl bg-cyan-600/10 hover:bg-cyan-600 text-cyan-600 dark:text-cyan-400 hover:text-white border border-cyan-600/30 flex items-center justify-center text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Chia sẻ lên Telegram"
            aria-label="Chia sẻ lên Telegram"
          >
            <Send className="w-4 h-4" />
          </a>

          {/* Twitter / X */}
          <a
            href={'https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-2xl bg-slate-800/10 dark:bg-slate-700/20 hover:bg-slate-800 text-[var(--text-main)] hover:text-white border border-[var(--border-card)] flex items-center justify-center text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Chia sẻ lên X"
            aria-label="Chia sẻ lên X"
          >
            X
          </a>

          {/* Copy Link / Native Share */}
          <button
            onClick={handleNativeShare}
            className={'h-11 px-3.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-serif font-bold shadow-sm cursor-pointer active:scale-95 ' + (
              copied
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                : 'bg-[var(--bg-card)] hover:bg-amber-500/15 text-[var(--text-main)] hover:text-amber-500 border-[var(--border-card)]'
            )}
            title="Sao chép đường dẫn bài viết"
            aria-label="Sao chép liên kết"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
            <span>{copied ? 'Đã Sao Chép' : 'Sao Chép Link'}</span>
          </button>
        </div>
      </div>

      {/* Quote Card Modal */}
      <QuoteCardModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialQuote={quote}
        initialTitle={quoteSource}
        initialAuthor={author || 'Học Viện Thần Học VERIDU'}
        category={category || 'Thần Học & Thánh Kinh'}
        imageUrl={imageUrl}
        availableImages={availableImages}
      />
    </div>
  );
}
