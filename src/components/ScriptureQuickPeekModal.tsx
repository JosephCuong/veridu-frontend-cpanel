'use client';

import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, ExternalLink, X, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface ScripturePeekTarget {
  bookSlug: string;
  bookName?: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  rawRef: string;
}

interface VerseItem {
  verse: string | number;
  text: string;
  heading?: string | null;
}

interface VerseApiResponse {
  success: boolean;
  book: {
    code: string;
    name: string;
    testament: string;
  };
  chapter: number;
  verseStart: number;
  verseEnd: number;
  translation: {
    slug: string;
    name: string;
  };
  verses: VerseItem[];
  totalInRange: number;
  remainingCount: number;
  hasMore: boolean;
  readerUrl: string;
  error?: string;
}

interface ScriptureQuickPeekModalProps {
  target: ScripturePeekTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

const verseCache = new Map<string, VerseApiResponse>();

export default function ScriptureQuickPeekModal({
  target,
  isOpen,
  onClose,
}: ScriptureQuickPeekModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VerseApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !target) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const vStart = target.verseStart || 1;
    const vEnd = target.verseEnd || vStart;
    const cacheKey = `${target.bookSlug}-${target.chapter}-${vStart}-${vEnd}-ntt`;

    if (verseCache.has(cacheKey)) {
      setData(verseCache.get(cacheKey)!);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const queryUrl = `/api/bible/verse?book=${encodeURIComponent(target.bookSlug)}&chapter=${target.chapter}&verse=${vStart}&verseEnd=${vEnd}&t=ntt`;

    fetch(queryUrl)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Không thể tải câu Kinh Thánh.');
        }
        return json as VerseApiResponse;
      })
      .then((resData) => {
        if (!isMounted) return;
        verseCache.set(cacheKey, resData);
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Đã có lỗi xảy ra khi truy vấn dữ liệu.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, target]);

  // Handle Escape key & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !target) return null;

  const displayBookName = data?.book?.name || target.bookName || target.bookSlug;
  const vStart = target.verseStart || 1;
  const vEnd = target.verseEnd || vStart;
  const rangeDisplay = vStart === vEnd ? `${vStart}` : `${vStart}-${vEnd}`;
  const readerUrl = data?.readerUrl || `/kinh-thanh/${target.bookSlug}/${target.chapter}?t=ntt#v${vStart}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scripture-modal-title"
      className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl bg-[var(--bg-card)] border border-amber-500/35 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP ACCENT GRADIENT LINE */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shrink-0" />

        {/* HEADER */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[var(--border-card)] flex items-start justify-between gap-4 shrink-0 bg-[var(--bg-card)]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id="scripture-modal-title"
                  className="font-serif text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100 tracking-tight"
                >
                  {displayBookName} {target.chapter}:{rangeDisplay}
                </h3>
                {data?.book?.testament && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    {data.book.testament}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans flex items-center gap-1.5">
                <span>📖</span>
                <span>{data?.translation?.name || 'Bản dịch Lm. Nguyễn Thế Thuấn (NTT)'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
            title="Đóng (Esc)"
            aria-label="Đóng cửa sổ tra cứu Kinh Thánh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (SCROLLABLE CONTENT) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-[var(--text-muted)]">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-serif italic">Đang mở Lời Chúa từ hệ thống Kinh Thánh...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Bạn vẫn có thể mở trực tiếp trang đọc Kinh Thánh của Sách{' '}
                <strong>{displayBookName}</strong> để tra cứu toàn văn đoạn này.
              </p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-3.5">
              {data.verses.map((v) => (
                <div
                  key={v.verse}
                  className="flex items-start gap-3.5 p-3 rounded-2xl bg-amber-500/[0.04] hover:bg-amber-500/[0.08] border border-amber-500/15 transition-all"
                >
                  <span className="shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 mt-0.5 select-none">
                    {v.verse}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    {v.heading && (
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-sans">
                        {v.heading}
                      </div>
                    )}
                    <p className="font-serif text-[16px] sm:text-[17px] leading-relaxed text-[var(--text-main)] italic">
                      “{v.text}”
                    </p>
                  </div>
                </div>
              ))}

              {/* OVERFLOW BADGE IF RANGE EXCEEDS 3 VERSES */}
              {data.hasMore && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Còn <strong>{data.remainingCount} câu</strong> tiếp theo trong đoạn trích này.
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] italic font-serif">
                    Xem trọn vẹn trong trang đọc ↗
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 sm:px-6 py-4 border-t border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <Link
            href={readerUrl}
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg shadow-amber-500/20 transition-all cursor-pointer group"
          >
            <span>Đến Trang Đọc Sách</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
