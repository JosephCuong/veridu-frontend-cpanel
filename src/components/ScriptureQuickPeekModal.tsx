'use client';

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, ExternalLink, X, Loader2, Scroll } from 'lucide-react';
import Link from 'next/link';

export interface ScripturePeekTarget {
  bookSlug: string;
  bookName?: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  rawRef: string;
  anchorRect?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
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
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Position state for desktop popover
  const [popoverPosition, setPopoverPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    placement: 'top' | 'bottom';
    arrowLeft: number;
  } | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const initialScrollYRef = useRef<number>(0);

  // Ensure portal target is mounted
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Compute smart popover position on desktop
  useLayoutEffect(() => {
    if (!isOpen || !target) {
      setPopoverPosition(null);
      return;
    }

    if (typeof window === 'undefined') return;
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    if (mobile || !target.anchorRect) {
      setPopoverPosition(null);
      return;
    }

    const rect = target.anchorRect;
    const popoverWidth = Math.min(460, window.innerWidth - 32);
    
    // Horizontal center alignment relative to anchor
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    // Keep within viewport boundaries (16px padding)
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    // Arrow pointer position
    const arrowLeft = Math.max(16, Math.min(popoverWidth - 24, rect.left + rect.width / 2 - left));

    // Vertical placement logic (auto-flip)
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement: 'top' | 'bottom' = 'bottom';
    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;

    // Prefer bottom unless space below is tight (< 300px) and top has more space
    if (spaceBelow < 300 && spaceAbove > spaceBelow) {
      placement = 'top';
      bottom = window.innerHeight - rect.top + 10;
    } else {
      placement = 'bottom';
      top = rect.bottom + 10;
    }

    setPopoverPosition({
      top,
      bottom,
      left,
      width: popoverWidth,
      placement,
      arrowLeft,
    });

    initialScrollYRef.current = window.scrollY;
  }, [isOpen, target]);

  // Fetch Scripture Data
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

  // Handle Escape key, scroll & body overflow
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Close on significant scroll on desktop to avoid dangling popovers
    const handleScroll = () => {
      if (!isMobile && Math.abs(window.scrollY - initialScrollYRef.current) > 120) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Lock body scroll only for mobile bottom sheet
    const originalOverflow = document.body.style.overflow;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile, onClose]);

  // Click outside listener for desktop popover
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Use setTimeout so the current click that opened the popover doesn't immediately close it
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handlePointerDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen, isMobile, onClose]);

  if (!isOpen || !target || !mounted) return null;

  const displayBookName = data?.book?.name || target.bookName || target.bookSlug;
  const vStart = target.verseStart || 1;
  const vEnd = target.verseEnd || vStart;
  const rangeDisplay = vStart === vEnd ? `${vStart}` : `${vStart}-${vEnd}`;
  const readerUrl = data?.readerUrl || `/kinh-thanh/${target.bookSlug}/${target.chapter}?t=ntt#v${vStart}`;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MOBILE VIEW: BOTTOM SHEET (Trượt từ đáy lên, chạm ngón cái tiện dụng)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isMobile || !popoverPosition) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Bottom Sheet Modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="scripture-sheet-title"
          className="relative z-10 w-full max-h-[82vh] flex flex-col rounded-t-3xl bg-[var(--bg-card)] border-t border-amber-500/40 shadow-2xl text-[var(--text-main)] overflow-hidden animate-in slide-in-from-bottom duration-200"
        >
          {/* Drag Handle Pill */}
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-slate-400/40 dark:bg-slate-600/60" />
          </div>

          {/* Accent Gold Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shrink-0" />

          {/* Header */}
          <div className="px-5 pt-3.5 pb-3 border-b border-[var(--border-card)] flex items-start justify-between gap-3 shrink-0 bg-[var(--bg-card)]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="scripture-sheet-title"
                    className="font-serif text-base font-bold text-amber-950 dark:text-amber-100"
                  >
                    {displayBookName} {target.chapter}:{rangeDisplay}
                  </h3>
                  {data?.book?.testament && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      {data.book.testament}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{data?.translation?.name || 'Bản dịch Lm. Nguyễn Thế Thuấn (NTT)'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 -mr-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
              title="Đóng"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
            {loading && (
              <div className="py-10 flex flex-col items-center justify-center space-y-2.5 text-[var(--text-muted)]">
                <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
                <p className="text-xs font-serif italic">Đang mở Lời Chúa...</p>
              </div>
            )}

            {error && !loading && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Bạn có thể mở trực tiếp trang đọc Kinh Thánh để tra cứu trọn vẹn đoạn này.
                </p>
              </div>
            )}

            {data && !loading && (
              <div className="space-y-3">
                {data.verses.map((v) => (
                  <div
                    key={v.verse}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-amber-500/[0.04] border border-amber-500/15"
                  >
                    <span className="shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30 mt-0.5 select-none">
                      {v.verse}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      {v.heading && (
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-sans">
                          {v.heading}
                        </div>
                      )}
                      <p className="font-serif text-[15px] leading-relaxed text-[var(--text-main)] italic">
                        “{v.text}”
                      </p>
                    </div>
                  </div>
                ))}

                {data.hasMore && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
                    <span className="text-amber-800 dark:text-amber-300 font-medium">
                      Còn <strong>{data.remainingCount} câu</strong> tiếp theo...
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Xem toàn văn ↗
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <Link
              href={readerUrl}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Xem Trọn Sách</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DESKTOP VIEW: SMART CONTEXTUAL POPOVER (Neo ngay sát điểm nhấn)
  // ─────────────────────────────────────────────────────────────────────────────
  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="scripture-popover-title"
      style={{
        position: 'fixed',
        left: `${popoverPosition.left}px`,
        width: `${popoverPosition.width}px`,
        ...(popoverPosition.top !== undefined ? { top: `${popoverPosition.top}px` } : {}),
        ...(popoverPosition.bottom !== undefined ? { bottom: `${popoverPosition.bottom}px` } : {}),
        zIndex: 9999,
      }}
      className="flex flex-col rounded-3xl bg-[var(--bg-card)]/95 border-2 border-amber-500/40 shadow-2xl backdrop-blur-2xl text-[var(--text-main)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Caret Triangle Pointer (Mũi tên trỏ vào câu trích dẫn) */}
      <div
        style={{ left: `${popoverPosition.arrowLeft}px` }}
        className={`absolute w-3 h-3 bg-[var(--bg-card)] border-amber-500/40 rotate-45 z-20 ${
          popoverPosition.placement === 'bottom'
            ? '-top-1.5 border-t-2 border-l-2'
            : '-bottom-1.5 border-b-2 border-r-2'
        }`}
      />

      {/* Top Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shrink-0 relative z-10" />

      {/* Header */}
      <div className="px-4.5 py-3 border-b border-[var(--border-card)] flex items-center justify-between gap-3 shrink-0 bg-[var(--bg-card)] relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                id="scripture-popover-title"
                className="font-serif text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 truncate"
              >
                {displayBookName} {target.chapter}:{rangeDisplay}
              </h3>
              {data?.book?.testament && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
                  {data.book.testament}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-sans truncate">
              {data?.translation?.name || 'Bản dịch Lm. Nguyễn Thế Thuấn (NTT)'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
          title="Đóng (Esc)"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 max-h-[320px] overflow-y-auto space-y-3 flex-1 custom-scrollbar text-xs">
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-[var(--text-muted)]">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-[11px] font-serif italic">Đang tải câu Kinh Thánh...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Bạn có thể mở toàn văn chương sách để tra cứu.
            </p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-2.5">
            {data.verses.map((v) => (
              <div
                key={v.verse}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/15"
              >
                <span className="shrink-0 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 mt-0.5 select-none">
                  {v.verse}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  {v.heading && (
                    <div className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-sans">
                      {v.heading}
                    </div>
                  )}
                  <p className="font-serif text-[14px] leading-relaxed text-[var(--text-main)] italic">
                    “{v.text}”
                  </p>
                </div>
              </div>
            ))}

            {data.hasMore && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px]">
                <span className="text-amber-800 dark:text-amber-300 font-medium">
                  Còn {data.remainingCount} câu nữa trong đoạn này...
                </span>
                <Link
                  href={readerUrl}
                  onClick={onClose}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Xem tiếp ↗
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between gap-2 shrink-0">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          Nhấn Esc hoặc bấm ra ngoài để đóng
        </span>

        <Link
          href={readerUrl}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer group"
        >
          <span>Đến Toàn Văn Chương</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>,
    document.body
  );
}
