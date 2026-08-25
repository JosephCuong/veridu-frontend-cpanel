'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { 
  LibraryItem, 
  fetchLibraryItemBySlug, 
  fetchLibraryItems, 
  checkUserDownloadQuota 
} from '@/lib/api';
import { 
  BookOpen, 
  Download, 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  ListOrdered, 
  X, 
  Eye, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Moon,
  Scroll,
  Layers,
  ChevronLeft,
  Settings2,
  Share2,
  Laptop,
  Check
} from 'lucide-react';

export default function DocumentSandboxReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Engine & UI Customization State ──
  const [engineMode, setEngineMode] = useState<'sandbox' | 'enhanced' | 'native'>('sandbox');
  const [colorTheme, setColorTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFitWidth, setIsFitWidth] = useState(true);
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('scroll');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>('1');

  // Reader Controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [tocSearch, setTocSearch] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<{
    canDownload: boolean;
    remainingQuota: number;
    maxQuota: number;
    isUnlimited: boolean;
  }>({ canDownload: true, remainingQuota: 5, maxQuota: 5, isUnlimited: false });

  // Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Load Data & Quota ──
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    async function loadData() {
      if (!slug) return;
      setIsLoading(true);
      
      const data = await fetchLibraryItemBySlug(slug);
      if (data) {
        setItem(data);

        // Load related
        const allItems = await fetchLibraryItems(data.item_type, data.category);
        setRelatedItems(allItems.filter((it) => it.slug !== slug).slice(0, 4));

        // Check quota if user logged in
        if (stored) {
          const q = await checkUserDownloadQuota(stored.id, stored.role);
          setQuotaInfo(q);
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [slug]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handlePageChange(Math.min((item?.pages_count || 999), currentPage + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePageChange(Math.max(1, currentPage - 1));
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoom(Math.min(200, zoomLevel + 15));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoom(Math.max(50, zoomLevel - 15));
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, zoomLevel, item?.pages_count]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Lỗi khi mở toàn màn hình:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoom = (newZoom: number) => {
    setIsFitWidth(false);
    setZoomLevel(newZoom);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    setInputPage(String(pageNum));
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(inputPage);
    if (!isNaN(p) && p >= 1 && p <= (item?.pages_count || 9999)) {
      handlePageChange(p);
    } else {
      setInputPage(String(currentPage));
    }
  };

  // ── Download Handler ──
  const handleDownload = async () => {
    setDownloadError('');
    setDownloadSuccess(false);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!quotaInfo.canDownload && !quotaInfo.isUnlimited) {
      setDownloadError('Bạn đã sử dụng hết 5 lượt tải miễn phí trong ngày. Hạn mức sẽ được làm mới sau 24h.');
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/library/download/${slug}?userId=${user.id}&userRole=${encodeURIComponent(user.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Không thể xử lý yêu cầu tải về.');
      }

      setDownloadSuccess(true);

      const newQuota = await checkUserDownloadQuota(user.id, user.role);
      setQuotaInfo(newQuota);

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.target = '_blank';
        link.download = result.fileName || `${slug}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Lỗi khi tải tài liệu.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Stream / Sandbox Source Resolution ──
  const getStreamUrl = () => {
    if (!item) return '';

    // If Google Drive file ID is present, use our optimized Byte-Stream Proxy
    if (item.drive_file_id && item.drive_file_id.length > 5 && !item.drive_file_id.startsWith('http')) {
      return `/api/library/proxy-drive/${item.drive_file_id}`;
    }

    return item.file_url || '';
  };

  const getViewerUrl = () => {
    if (!item) return '';

    if (engineMode === 'sandbox') {
      // Google Cloud Viewer Sandbox
      if (item.drive_file_id && item.drive_file_id.length > 5 && !item.drive_file_id.startsWith('http')) {
        return `https://drive.google.com/file/d/${item.drive_file_id}/preview`;
      }
      return `https://docs.google.com/viewer?url=${encodeURIComponent(item.file_url || '')}&embedded=true`;
    }

    if (engineMode === 'native' || engineMode === 'enhanced') {
      // Direct Stream from Proxy
      return getStreamUrl();
    }

    return '';
  };

  // Theme Styles for Reader Container
  const getThemeStyles = () => {
    if (colorTheme === 'sepia') {
      return {
        bg: 'bg-[#f4ebd9] text-[#433422]',
        border: 'border-[#dfcfb0]',
        panel: 'bg-[#ebe0c7]',
        text: 'text-[#433422]'
      };
    }
    if (colorTheme === 'light') {
      return {
        bg: 'bg-white text-slate-900',
        border: 'border-slate-200',
        panel: 'bg-slate-50',
        text: 'text-slate-900'
      };
    }
    return {
      bg: 'bg-[#090d16] text-[#e2e8f0]',
      border: 'border-amber-500/30',
      panel: 'bg-[#131b2e]',
      text: 'text-[#e2e8f0]'
    };
  };

  const currentTheme = getThemeStyles();

  const filteredToc = item?.table_of_contents?.filter((t) =>
    t.title.toLowerCase().includes(tocSearch.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center space-y-4 pt-24">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm text-[var(--text-muted)] italic">
          Đang nạp luồng dữ liệu và thiết lập trình đọc nâng cao...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-24">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-serif font-black text-2xl">Không Tìm Thấy Tác Phẩm</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tài liệu hoặc sách bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn mới.
          </p>
        </div>
        <Link
          href="/thu-vien/sach"
          className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
        >
          &larr; Về Tủ Sách Thư Viện
        </Link>
      </div>
    );
  }

  const backLink = item.item_type === 'document' ? '/thu-vien/tai-lieu' : '/thu-vien/sach';
  const backLabel = item.item_type === 'document' ? 'Kho Tài Liệu' : 'Tủ Sách Nghiên Cứu';

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 ${
        isFullscreen ? 'p-0' : 'pt-20 sm:pt-24 pb-16'
      }`}
    >
      
      {/* ── TOP STAINED-GLASS CONTROL BAR ── */}
      <header className="sticky top-0 z-30 w-full bg-[var(--bg-card)]/90 backdrop-blur-xl border-b border-[var(--border-card)] shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Back & Title info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={backLink}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/40 transition shrink-0"
              title={`Quay về ${backLabel}`}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {item.format}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-semibold truncate hidden sm:inline">
                  {item.pages_count > 0 ? `${item.pages_count} trang` : ''} {item.file_size_label ? `• ${item.file_size_label}` : ''}
                </span>
              </div>
              <h1 className="font-serif font-black text-sm sm:text-base text-[var(--text-main)] truncate max-w-xs sm:max-w-md md:max-w-lg">
                {item.title}
              </h1>
            </div>
          </div>

          {/* Center: Page Navigation & Zoom Tools (For Enhanced Mode) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
            
            {/* Page Jumper */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="p-1 rounded hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition"
                title="Trang trước (Phím mũi tên trái)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 text-xs">
                <input
                  type="text"
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value.replace(/\D/g, ''))}
                  className="w-10 text-center py-0.5 px-1 rounded bg-[var(--bg-card)] border border-[var(--border-card)] font-mono font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  / {item.pages_count || '?'}
                </span>
              </form>

              <button
                type="button"
                onClick={() => handlePageChange(Math.min((item.pages_count || 999), currentPage + 1))}
                className="p-1 rounded hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition"
                title="Trang sau (Phím mũi tên phải)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="w-[1px] h-4 bg-[var(--border-card)]"></div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleZoom(Math.max(50, zoomLevel - 15))}
                className="p-1 rounded hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-mono font-bold text-amber-500 w-12 text-center">
                {isFitWidth ? 'Vừa' : `${zoomLevel}%`}
              </span>

              <button
                type="button"
                onClick={() => handleZoom(Math.min(200, zoomLevel + 15))}
                className="p-1 rounded hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right: Mode Switcher, Settings, TOC & Download */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Engine Switcher */}
            <select
              value={engineMode}
              onChange={(e) => setEngineMode(e.target.value as any)}
              className="hidden sm:block text-xs font-bold px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-amber-500"
              title="Chọn trình đọc tệp"
            >
              <option value="sandbox">🌐 Google Cloud Preview</option>
              <option value="enhanced">⚡ VERIDU Stream Engine</option>
              <option value="native">📄 Native Browser Stream</option>
            </select>

            {/* UI Settings Popover (Color theme & view mode) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                className={`p-2 rounded-xl border transition ${
                  showSettingsPopover
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-amber-500/40'
                }`}
                title="Tùy chỉnh giao diện đọc"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              {/* Popover Dropdown */}
              {showSettingsPopover && (
                <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl space-y-4 z-50 backdrop-blur-xl animate-fadeIn">
                  
                  {/* Theme Select */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                      Tông Màu Đọc Sách:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setColorTheme('dark')}
                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                          colorTheme === 'dark'
                            ? 'bg-[#090d16] text-amber-400 border-amber-500 shadow-sm'
                            : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Hắc Thạch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setColorTheme('sepia')}
                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                          colorTheme === 'sepia'
                            ? 'bg-[#f4ebd9] text-[#433422] border-[#bda682] shadow-sm font-black'
                            : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                        }`}
                      >
                        <Scroll className="w-3.5 h-3.5" />
                        <span>Giấy Da</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setColorTheme('light')}
                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                          colorTheme === 'light'
                            ? 'bg-white text-slate-900 border-slate-400 shadow-sm'
                            : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Sáng</span>
                      </button>
                    </div>
                  </div>

                  {/* Engine Select for Mobile */}
                  <div className="space-y-1.5 sm:hidden border-t border-[var(--border-card)] pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                      Trình Xem:
                    </span>
                    <select
                      value={engineMode}
                      onChange={(e) => setEngineMode(e.target.value as any)}
                      className="w-full text-xs font-bold p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-main)]"
                    >
                      <option value="sandbox">🌐 Google Cloud Preview</option>
                      <option value="enhanced">⚡ VERIDU Stream Engine</option>
                      <option value="native">📄 Native Browser Stream</option>
                    </select>
                  </div>

                </div>
              )}
            </div>

            {/* Table of Contents Button */}
            {item.table_of_contents && item.table_of_contents.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTocDrawer(!showTocDrawer)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  showTocDrawer
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-amber-500/40'
                }`}
                title="Mục lục tác phẩm"
              >
                <ListOrdered className="w-4 h-4" />
                <span className="hidden md:inline">Mục Lục</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/40 transition"
              title={isFullscreen ? 'Thu nhỏ cửa sổ (F)' : 'Toàn màn hình (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Smart Download Button with Quota */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Tải Về</span>
              {user && !quotaInfo.isUnlimited && (
                <span className="text-[10px] font-mono bg-slate-950/20 px-1.5 py-0.5 rounded-full ml-1">
                  {quotaInfo.remainingQuota}/{quotaInfo.maxQuota}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Download Feedback Alerts */}
        {downloadSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tệp đang được truyền tải về máy thành công!</span>
          </div>
        )}

        {downloadError && (
          <div className="bg-red-500/20 border-b border-red-500/40 px-4 py-2 text-center text-xs font-bold text-red-400 flex items-center justify-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4" />
            <span>{downloadError}</span>
          </div>
        )}
      </header>

      {/* ── MAIN ADVANCED VIEWER CONTAINER ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col items-stretch relative">
        
        {/* Custom Themed Wrapper */}
        <div 
          className={`flex-1 w-full rounded-3xl border-2 ${currentTheme.border} ${currentTheme.bg} overflow-hidden shadow-2xl relative min-h-[75vh] sm:min-h-[84vh] flex flex-col transition-all duration-300`}
          style={{
            transform: !isFitWidth ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          
          {/* Iframe Stream Viewer */}
          <iframe
            src={getViewerUrl()}
            title={item.title}
            className="w-full flex-1 border-0 rounded-3xl"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            allowFullScreen
          />

        </div>

        {/* ── SLIDE-OVER TABLE OF CONTENTS (TOC DRAWER) ── */}
        {showTocDrawer && item.table_of_contents && (
          <aside className="fixed top-0 right-0 z-40 w-full sm:w-96 h-full bg-[var(--bg-card)] border-l border-amber-500/30 shadow-2xl p-6 flex flex-col justify-between animate-slideLeft backdrop-blur-2xl">
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-black text-lg text-[var(--text-main)]">Mục Lục Tác Phẩm</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTocDrawer(false)}
                  className="p-1.5 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-red-400 transition"
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
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
              />

              {/* TOC Items List */}
              <div className="space-y-2 pt-2">
                {filteredToc.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (t.page) {
                        handlePageChange(t.page);
                        setShowTocDrawer(false);
                      }
                    }}
                    className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 flex items-center justify-between gap-3 text-xs transition group text-left"
                  >
                    <span className="font-serif font-bold text-[var(--text-main)] group-hover:text-amber-500 transition flex-1">
                      {t.title}
                    </span>
                    {t.page && (
                      <span className="font-mono text-[10px] text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                        Trang {t.page}
                      </span>
                    )}
                  </button>
                ))}
              </div>

            </div>

            <div className="pt-4 border-t border-[var(--border-card)] text-center text-[11px] text-[var(--text-muted)] italic">
              Bản quyền tác phẩm thuộc về Hội Thánh &amp; Các Tác Giả.
            </div>
          </aside>
        )}

      </main>

      {/* ── METADATA & RELATED SECTION (WHEN NOT FULLSCREEN) ── */}
      {!isFullscreen && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 w-full">
          
          {/* Details Overview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                  Giới Thiệu Tác Phẩm
                </span>
                <h2 className="font-serif font-black text-xl sm:text-2xl text-[var(--text-main)] mt-1">
                  {item.title}
                </h2>
                <span className="text-xs text-[var(--text-muted)] font-serif italic">
                  Tác giả / Biên soạn: <strong className="text-[var(--text-main)]">{item.author}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {item.view_count.toLocaleString()} lượt xem</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-amber-500" /> {item.download_count.toLocaleString()} lượt tải</span>
              </div>
            </div>

            <p className="font-serif text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed italic border-l-2 border-amber-500 pl-4">
              &ldquo;{item.description}&rdquo;
            </p>
          </div>

          {/* Related Items Recommendations */}
          {relatedItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif font-black text-lg text-[var(--text-main)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tác Phẩm Cùng Chuyên Mục Bạn Có Thể Thích</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {relatedItems.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/thu-vien/doc/${rel.slug}`}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 shadow-md flex flex-col justify-between space-y-3 group transition"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {rel.format}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-500 transition line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-card)]">
                      <span className="truncate max-w-[120px]">{rel.author}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </section>
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
