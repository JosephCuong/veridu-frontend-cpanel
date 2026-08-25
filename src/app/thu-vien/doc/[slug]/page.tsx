'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
  FileText, 
  Eye, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Lock, 
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bookmark
} from 'lucide-react';

export default function DocumentSandboxReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Reader Controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTocDrawer, setShowTocDrawer] = useState(false);
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

  // ── Load Item & User Quota ──
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    async function loadData() {
      if (!slug) return;
      setIsLoading(true);
      
      const data = await fetchLibraryItemBySlug(slug);
      if (data) {
        setItem(data);

        // Load related items
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

  // ── Handle Download with Tiered Quota ──
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

      // Refresh quota
      const newQuota = await checkUserDownloadQuota(user.id, user.role);
      setQuotaInfo(newQuota);

      // Trigger browser download
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

  // Construct Sandbox Viewer URL
  const getSandboxViewerUrl = () => {
    if (!item) return '';

    // If Google Drive file ID exists, use Google Docs Preview sandbox
    if (item.drive_file_id && item.drive_file_id.length > 5 && !item.drive_file_id.startsWith('http')) {
      return `https://drive.google.com/file/d/${item.drive_file_id}/preview`;
    }

    // Direct PDF Viewer fallback
    if (item.file_url) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(item.file_url)}&embedded=true`;
    }

    return 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf&embedded=true';
  };

  // Filter TOC
  const filteredToc = item?.table_of_contents?.filter((t) =>
    t.title.toLowerCase().includes(tocSearch.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center space-y-4 pt-24">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm text-[var(--text-muted)] italic">
          Đang nạp dữ liệu và mở khung sandbox tác phẩm...
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
      
      {/* ── TOP STAINED-GLASS TOOLBAR ── */}
      <header className="sticky top-0 z-30 w-full bg-[var(--bg-card)]/90 backdrop-blur-xl border-b border-[var(--border-card)] shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
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

          {/* Right: Actions Bar */}
          <div className="flex items-center gap-2 shrink-0">
            
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

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/40 transition"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Smart Download Button with Quota Badge */}
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

        {/* Download Notifications */}
        {downloadSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tệp đang được tải về máy của bạn thành công!</span>
          </div>
        )}

        {downloadError && (
          <div className="bg-red-500/20 border-b border-red-500/40 px-4 py-2 text-center text-xs font-bold text-red-400 flex items-center justify-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4" />
            <span>{downloadError}</span>
          </div>
        )}
      </header>

      {/* ── MAIN SANDBOX VIEWER CONTAINER ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col items-stretch relative">
        
        {/* Sandbox Iframe Wrapper */}
        <div className="flex-1 w-full bg-slate-950 rounded-3xl border-2 border-amber-500/30 overflow-hidden shadow-2xl relative min-h-[75vh] sm:min-h-[82vh] flex flex-col">
          
          <iframe
            src={getSandboxViewerUrl()}
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
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 flex items-center justify-between gap-3 text-xs transition group cursor-default"
                  >
                    <span className="font-serif font-bold text-[var(--text-main)] group-hover:text-amber-500 transition flex-1">
                      {t.title}
                    </span>
                    {t.page && (
                      <span className="font-mono text-[10px] text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                        Trang {t.page}
                      </span>
                    )}
                  </div>
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
