'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  ListOrdered, 
  Download, 
  Sun, 
  Moon, 
  Scroll, 
  X, 
  Sparkles, 
  ShieldCheck,
  RotateCw,
  Loader2,
  FileText,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LibraryItem, checkUserDownloadQuota } from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';

interface BookFlipReaderProps {
  item: LibraryItem;
  streamUrl: string;
}

export default function BookFlipReader({ item, streamUrl }: BookFlipReaderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Page State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(item.pages_count || 1);
  const [isDualSpread, setIsDualSpread] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<'dark' | 'sepia' | 'light'>('sepia');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showTocDrawer, setShowTocDrawer] = useState<boolean>(false);
  const [tocSearch, setTocSearch] = useState<string>('');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState<boolean>(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  // Download Quota
  const [quotaInfo, setQuotaInfo] = useState<{
    canDownload: boolean;
    remainingQuota: number;
    maxQuota: number;
    isUnlimited: boolean;
  }>({ canDownload: true, remainingQuota: 5, maxQuota: 5, isUnlimited: false });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // Canvas Refs
  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSingleRef = useRef<HTMLCanvasElement | null>(null);
  const readerContainerRef = useRef<HTMLDivElement | null>(null);

  // ── 1. Init User & Dynamic Screen Width Detection ──
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored) {
      checkUserDownloadQuota(stored.id, stored.role).then(setQuotaInfo);
    }

    // Default to single page on mobile screens < 768px
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setIsDualSpread(false);
      }
    }
  }, []);

  // ── 2. Dynamically Load PDF.js from CDN ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).pdfjsLib) {
      setIsPdfJsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setIsPdfJsLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      // cleanup script if needed
    };
  }, []);

  // ── 3. Load PDF Document from Proxy Stream ──
  useEffect(() => {
    if (!isPdfJsLoaded || !streamUrl) return;

    let isMounted = true;
    const pdfjsLib = (window as any).pdfjsLib;

    const loadingTask = pdfjsLib.getDocument({
      url: streamUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      rangeChunkSize: 65536, // 64KB byte-range chunks for fast progressive 35MB loading
    });

    loadingTask.promise
      .then((doc: any) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      })
      .catch((err: any) => {
        console.warn('PDF.js loading error fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isPdfJsLoaded, streamUrl]);

  // ── 4. Render Pages to High-DPI Canvases ──
  const renderCanvasPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!pdfDoc || !canvas || pageNum < 1 || pageNum > totalPages) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.warn(`Lỗi khi vẽ trang ${pageNum}:`, err);
    }
  }, [pdfDoc, totalPages]);

  useEffect(() => {
    if (!pdfDoc) return;
    setIsRendering(true);

    const render = async () => {
      if (isDualSpread) {
        // Render left and right pages
        const leftPageNum = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
        const rightPageNum = leftPageNum + 1;

        if (canvasLeftRef.current) {
          await renderCanvasPage(leftPageNum, canvasLeftRef.current);
        }
        if (canvasRightRef.current && rightPageNum <= totalPages) {
          await renderCanvasPage(rightPageNum, canvasRightRef.current);
        }
      } else {
        // Single page mode
        if (canvasSingleRef.current) {
          await renderCanvasPage(currentPage, canvasSingleRef.current);
        }
      }
      setIsRendering(false);
    };

    render();
  }, [pdfDoc, currentPage, isDualSpread, totalPages, renderCanvasPage]);

  // ── 5. Page Navigation & Flip Animations ──
  const goToNextPage = () => {
    if (currentPage >= totalPages) return;
    setIsFlipping(true);
    setFlipDirection('next');

    const step = isDualSpread ? 2 : 1;
    const next = Math.min(totalPages, currentPage + step);

    setTimeout(() => {
      setCurrentPage(next);
      setIsFlipping(false);
    }, 200);
  };

  const goToPrevPage = () => {
    if (currentPage <= 1) return;
    setIsFlipping(true);
    setFlipDirection('prev');

    const step = isDualSpread ? 2 : 1;
    const prev = Math.max(1, currentPage - step);

    setTimeout(() => {
      setCurrentPage(prev);
      setIsFlipping(false);
    }, 200);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(180, z + 15));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((z) => Math.max(70, z - 15));
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isDualSpread]);

  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;
    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Download Handler
  const handleDownload = async () => {
    setDownloadError('');
    setDownloadSuccess(false);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!quotaInfo.canDownload && !quotaInfo.isUnlimited) {
      setDownloadError('Bạn đã sử dụng hết 5 lượt tải miễn phí trong hôm nay.');
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/library/download/${item.slug}?userId=${user.id}&userRole=${encodeURIComponent(user.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Lỗi xử lý tải về.');

      setDownloadSuccess(true);
      const newQuota = await checkUserDownloadQuota(user.id, user.role);
      setQuotaInfo(newQuota);

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.target = '_blank';
        link.download = result.fileName || `${item.slug}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Lỗi tải tệp.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ── 6. Theme Styling ──
  const getThemeClasses = () => {
    switch (colorTheme) {
      case 'sepia':
        return {
          wrapper: 'bg-[#2b251f] text-[#f4ebd9]',
          pageBg: 'bg-[#fbf3e4] text-[#2c2218]',
          spineShadow: 'from-black/20 via-transparent to-black/20',
          panel: 'bg-[#3b322a]/95 text-[#f4ebd9] border-[#5a4d3f]',
          accent: 'text-amber-400',
        };
      case 'light':
        return {
          wrapper: 'bg-slate-200 text-slate-900',
          pageBg: 'bg-white text-slate-900',
          spineShadow: 'from-slate-300/40 via-transparent to-slate-300/40',
          panel: 'bg-white/95 text-slate-900 border-slate-300',
          accent: 'text-amber-600',
        };
      case 'dark':
      default:
        return {
          wrapper: 'bg-[#090d16] text-[#e2e8f0]',
          pageBg: 'bg-[#151d30] text-[#e2e8f0]',
          spineShadow: 'from-black/50 via-transparent to-black/50',
          panel: 'bg-[#12192c]/95 text-[#e2e8f0] border-amber-500/30',
          accent: 'text-amber-400',
        };
    }
  };

  const theme = getThemeClasses();
  const backLink = item.item_type === 'document' ? '/thu-vien/tai-lieu' : '/thu-vien/sach';

  const leftPageNum = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
  const rightPageNum = leftPageNum + 1;

  return (
    <div
      ref={readerContainerRef}
      onContextMenu={(e) => e.preventDefault()} // Anti-theft: Disable right click on book
      className={`w-full min-h-screen ${theme.wrapper} flex flex-col justify-between select-none relative overflow-hidden font-sans transition-colors duration-300`}
    >
      
      {/* ── TOP FLOATING MINIMAL HEADER ── */}
      <header className="w-full z-30 px-4 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10">
        
        {/* Back Link & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backLink}
            className="p-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition shrink-0 flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Thư Viện</span>
          </Link>

          <div className="min-w-0">
            <h1 className="font-serif font-black text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {item.title}
            </h1>
            <span className="text-[11px] text-amber-400 font-serif italic truncate block">
              {item.author}
            </span>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          
          {/* Table of Contents */}
          {item.table_of_contents && item.table_of_contents.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTocDrawer(!showTocDrawer)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition"
              title="Mục lục sách"
            >
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Mục Lục</span>
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title={isFullscreen ? 'Thu nhỏ cửa sổ (F)' : 'Toàn màn hình (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-black text-xs flex items-center gap-1 hover:bg-amber-400 transition shadow-lg disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Tải Về</span>
            {user && !quotaInfo.isUnlimited && (
              <span className="text-[10px] bg-slate-950/20 px-1 rounded font-mono">
                {quotaInfo.remainingQuota}/{quotaInfo.maxQuota}
              </span>
            )}
          </button>

        </div>

      </header>

      {/* Download Status Toast */}
      {downloadSuccess && (
        <div className="bg-emerald-500 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Tác phẩm đang được tải về máy của bạn!
        </div>
      )}
      {downloadError && (
        <div className="bg-red-500 text-white font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {downloadError}
        </div>
      )}

      {/* ── MAIN A4 BOOK CANVAS STAGE ── */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-6 relative overflow-hidden">
        
        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl transition disabled:opacity-20 disabled:hover:bg-black/50 disabled:hover:text-white"
          title="Trang trước (Mũi tên trái / Click lề trái)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* ── A4 BOOK CONTAINER ── */}
        <div
          className="flex items-center justify-center transition-all duration-300 relative"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center center',
          }}
        >
          
          {/* Dual Spread Mode (2 Trang A4 Song Song Mở Ra Như Sách Thật) */}
          {isDualSpread ? (
            <div className="flex items-stretch shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden border-2 border-white/10 relative max-h-[82vh] aspect-[2/1.414]">
              
              {/* Left Page A4 */}
              <div 
                onClick={goToPrevPage}
                className={`w-[min(45vw,520px)] aspect-[1/1.414] ${theme.pageBg} relative flex flex-col justify-between p-4 sm:p-6 cursor-pointer border-r border-black/20 overflow-hidden group`}
              >
                {/* Subtle Paper Texture & Page Edge Shadow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/5 via-transparent to-black/15"></div>
                
                {/* Canvas Container */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <canvas ref={canvasLeftRef} className="max-w-full max-h-full object-contain pointer-events-none shadow-sm" />
                  {!pdfDoc && (
                    <div className="text-center space-y-2 opacity-60">
                      <FileText className="w-10 h-10 mx-auto animate-pulse text-amber-500" />
                      <p className="font-serif text-xs italic">Trang {leftPageNum} • {item.title}</p>
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                <div className="flex items-center justify-between text-[10px] font-serif opacity-50 pt-2 border-t border-black/10">
                  <span>{leftPageNum}</span>
                  <span className="truncate max-w-[200px]">{item.title}</span>
                </div>
              </div>

              {/* Book Spine Center Shadow Effect (Gáy Sách 3D) */}
              <div className="w-4 bg-gradient-to-r from-black/30 via-black/10 to-black/30 absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-10 pointer-events-none"></div>

              {/* Right Page A4 */}
              <div 
                onClick={goToNextPage}
                className={`w-[min(45vw,520px)] aspect-[1/1.414] ${theme.pageBg} relative flex flex-col justify-between p-4 sm:p-6 cursor-pointer overflow-hidden group`}
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-black/5 via-transparent to-black/15"></div>

                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  {rightPageNum <= totalPages ? (
                    <canvas ref={canvasRightRef} className="max-w-full max-h-full object-contain pointer-events-none shadow-sm" />
                  ) : (
                    <div className="text-center space-y-2 opacity-40">
                      <Sparkles className="w-8 h-8 mx-auto text-amber-500" />
                      <p className="font-serif text-xs italic">Hết Tác Phẩm</p>
                    </div>
                  )}
                </div>

                {/* Page Footer */}
                <div className="flex items-center justify-between text-[10px] font-serif opacity-50 pt-2 border-t border-black/10">
                  <span className="truncate max-w-[200px]">{item.author}</span>
                  <span>{rightPageNum <= totalPages ? rightPageNum : ''}</span>
                </div>
              </div>

            </div>
          ) : (
            /* Single Page Mode (1 Trang A4 Tiêu Chuẩn) */
            <div 
              onClick={goToNextPage}
              className={`w-[min(90vw,540px)] aspect-[1/1.414] max-h-[82vh] ${theme.pageBg} rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-white/10 p-5 sm:p-8 flex flex-col justify-between relative cursor-pointer overflow-hidden`}
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <canvas ref={canvasSingleRef} className="max-w-full max-h-full object-contain pointer-events-none shadow-sm" />
                {!pdfDoc && (
                  <div className="text-center space-y-3 opacity-60">
                    <BookOpen className="w-12 h-12 mx-auto text-amber-500 animate-pulse" />
                    <h3 className="font-serif font-black text-base">{item.title}</h3>
                    <p className="text-xs italic">Trang {currentPage} / {totalPages}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-serif opacity-50 pt-3 border-t border-black/10">
                <span className="truncate max-w-[200px]">{item.title}</span>
                <span className="font-mono font-bold">Trang {currentPage} / {totalPages}</span>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl transition disabled:opacity-20 disabled:hover:bg-black/50 disabled:hover:text-white"
          title="Trang sau (Mũi tên phải / Click lề phải)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </main>

      {/* ── BOTTOM STAINED-GLASS CONTROL DOCK ── */}
      <footer className="w-full z-30 px-3 sm:px-6 py-2.5 bg-black/60 backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        
        {/* Page Slider */}
        <div className="flex items-center gap-3 flex-1 min-w-[220px] max-w-md">
          <span className="text-xs font-mono font-bold text-amber-400 whitespace-nowrap">
            Trang {currentPage} / {totalPages}
          </span>

          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
        </div>

        {/* Quick Tools: Dual Page Toggle, Themes & Zoom */}
        <div className="flex items-center gap-2">
          
          {/* Dual / Single Spread Toggle */}
          <button
            type="button"
            onClick={() => setIsDualSpread(!isDualSpread)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isDualSpread
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
            }`}
            title="Chuyển chế độ 2 trang mở song song / 1 trang đơn"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDualSpread ? '2 Trang' : '1 Trang'}</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setColorTheme('dark')}
              className={`p-1.5 rounded-lg text-xs transition ${
                colorTheme === 'dark' ? 'bg-[#090d16] text-amber-400 shadow' : 'text-white/60 hover:text-white'
              }`}
              title="Chủ đề Hắc Thạch"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setColorTheme('sepia')}
              className={`p-1.5 rounded-lg text-xs transition ${
                colorTheme === 'sepia' ? 'bg-[#f4ebd9] text-[#433422] shadow font-black' : 'text-white/60 hover:text-white'
              }`}
              title="Chủ đề Giấy Da Cổ Điển"
            >
              <Scroll className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setColorTheme('light')}
              className={`p-1.5 rounded-lg text-xs transition ${
                colorTheme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-white/60 hover:text-white'
              }`}
              title="Chủ đề Ban Ngày"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 text-white hover:text-amber-400 transition"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-mono font-bold text-amber-400 w-10 text-center">
              {zoomLevel}%
            </span>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(180, z + 10))}
              className="p-1 text-white hover:text-amber-400 transition"
              title="Phóng to (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </footer>

      {/* ── SLIDE-OVER TABLE OF CONTENTS (TOC DRAWER) ── */}
      {showTocDrawer && item.table_of_contents && (
        <aside className="fixed top-0 right-0 z-50 w-full sm:w-96 h-full bg-[#12192c] border-l border-amber-500/30 shadow-2xl p-6 flex flex-col justify-between animate-slideLeft backdrop-blur-2xl text-white">
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-black text-lg text-white">Mục Lục Tác Phẩm</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTocDrawer(false)}
                className="p-1.5 rounded-xl bg-white/10 text-white/60 hover:text-red-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick TOC Search */}
            <input
              type="text"
              value={tocSearch}
              onChange={(e) => setTocSearch(e.target.value)}
              placeholder="Tìm nhanh chương hồi..."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
            />

            {/* TOC Items List */}
            <div className="space-y-2 pt-2">
              {item.table_of_contents
                .filter((t) => t.title.toLowerCase().includes(tocSearch.toLowerCase()))
                .map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (t.page) {
                        setCurrentPage(t.page);
                        setShowTocDrawer(false);
                      }
                    }}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/60 hover:bg-white/10 flex items-center justify-between gap-3 text-xs transition group text-left"
                  >
                    <span className="font-serif font-bold text-white group-hover:text-amber-400 transition flex-1">
                      {t.title}
                    </span>
                    {t.page && (
                      <span className="font-mono text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                        Trang {t.page}
                      </span>
                    )}
                  </button>
                ))}
            </div>

          </div>

          <div className="pt-4 border-t border-white/10 text-center text-[11px] text-white/50 italic">
            Thư Viện Công Giáo VERIDU • Bản quyền tác phẩm thuộc về Hội Thánh.
          </div>
        </aside>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            const u = getStoredUser();
            setUser(u);
            if (u) {
              checkUserDownloadQuota(u.id, u.role).then(setQuotaInfo);
            }
          }}
        />
      )}

    </div>
  );
}
