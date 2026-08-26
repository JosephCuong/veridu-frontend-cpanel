'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  fetchLibraryItemBySlug, 
  fetchLibraryItems, 
  LibraryItem, 
  checkUserDownloadQuota 
} from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Eye, 
  ListOrdered, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Clock,
  Layers,
  Tv,
  Presentation,
  UserCheck
} from 'lucide-react';

export default function DocumentDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'toc' | 'attachments'>('summary');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Quota info
  const [quotaInfo, setQuotaInfo] = useState<{
    canDownload: boolean;
    remainingQuota: number;
    maxQuota: number;
    isUnlimited: boolean;
  }>({ canDownload: true, remainingQuota: 5, maxQuota: 5, isUnlimited: false });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    async function loadData() {
      if (!slug) return;
      setIsLoading(true);
      const data = await fetchLibraryItemBySlug(slug);
      if (data) {
        setItem(data);
        const related = await fetchLibraryItems('document', data.category);
        setRelatedItems(related.filter((r) => r.slug !== slug).slice(0, 4));

        if (stored) {
          checkUserDownloadQuota(stored.id, stored.role).then(setQuotaInfo);
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [slug]);

  const handleDownload = async (overrideUrl?: string, overrideName?: string) => {
    setDownloadError('');
    setDownloadSuccess(false);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!quotaInfo.canDownload && !quotaInfo.isUnlimited) {
      setDownloadError('Bạn đã sử dụng hết 5 lượt tải miễn phí trong hôm nay. Hạn mức sẽ được làm mới sau 24h.');
      return;
    }

    setIsDownloading(true);
    try {
      if (overrideUrl) {
        const link = document.createElement('a');
        link.href = overrideUrl;
        link.target = '_blank';
        link.download = overrideName || `${item?.slug}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadSuccess(true);
        return;
      }

      const res = await fetch(`/api/library/download/${slug}?userId=${user.id}&userRole=${encodeURIComponent(user.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Lỗi xử lý tải về.');

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
      setDownloadError(err.message || 'Lỗi tải tài liệu.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center space-y-4 pt-32">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm text-[var(--text-muted)] italic">
          Đang nạp thông tin tài liệu...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-32">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-serif font-black text-2xl">Không Tìm Thấy Tài Liệu</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang danh mục khác.
          </p>
        </div>
        <Link
          href="/thu-vien/tai-lieu"
          className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
        >
          &larr; Về Kho Tài Liệu Mục Vụ
        </Link>
      </div>
    );
  }

  const isSlidePresentation = 
    item.format?.toLowerCase().includes('pptx') || 
    item.format?.toLowerCase().includes('slide') || 
    !!(item.google_slide_id && item.google_slide_id.length > 3);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 pb-20 font-sans">
      
      {/* ── BREADCRUMB ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="flex items-center gap-2 text-xs font-serif text-[var(--text-muted)]">
          <Link href="/" className="hover:text-amber-500 transition">Trang Chủ</Link>
          <span>/</span>
          <Link href="/thu-vien" className="hover:text-amber-500 transition">Thư Viện</Link>
          <span>/</span>
          <Link href="/thu-vien/tai-lieu" className="hover:text-amber-500 transition">Kho Tài Liệu Mục Vụ</Link>
          <span>/</span>
          <span className="text-amber-500 font-bold truncate max-w-[200px] sm:max-w-md">{item.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── HERO PROFILE SECTION ── */}
        <section className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left: 3D Cover / Slide Preview */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative group perspective-1000">
                
                <div className={`w-56 sm:w-64 ${isSlidePresentation ? 'h-44 sm:h-52' : 'h-80 sm:h-92'} rounded-2xl bg-gradient-to-br ${item.cover_bg_gradient} p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-2 border-white/20 transform transition-transform group-hover:scale-105 relative overflow-hidden`}>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-400 text-slate-950 font-mono inline-block">
                      {item.format}
                    </span>
                    <h3 className="font-serif font-black text-base sm:text-lg text-white leading-tight drop-shadow-md">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-white/20 space-y-1">
                    <p className="text-xs font-serif italic text-white/90 drop-shadow truncate">
                      {item.author}
                    </p>
                    <span className="text-[10px] font-mono text-white/60 block">
                      {item.pages_count > 0 ? `${item.pages_count} trang / slide` : ''} {item.file_size_label ? `• ${item.file_size_label}` : ''}
                    </span>
                  </div>

                </div>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-orange-500/20 blur-xl rounded-full pointer-events-none"></div>
              </div>
            </div>

            {/* Right: Document Details & Action Buttons */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/30">
                    {item.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {item.view_count.toLocaleString()} lượt xem
                  </span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-amber-500" /> {item.download_count.toLocaleString()} lượt tải
                  </span>
                </div>

                <h1 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-main)] leading-tight">
                  {item.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[var(--text-muted)] pt-1">
                  <span className="flex items-center gap-1.5 font-serif italic">
                    <UserCheck className="w-4 h-4 text-amber-500" /> Biên soạn: <strong className="text-[var(--text-main)]">{item.author}</strong>
                  </span>
                  {item.pages_count > 0 && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <Layers className="w-4 h-4 text-amber-500" /> {item.pages_count} trang/slide
                    </span>
                  )}
                  {item.file_size_label && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4 text-amber-500" /> {item.file_size_label}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Excerpt */}
              <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] leading-relaxed italic border-l-2 border-orange-500 pl-4 py-1">
                &ldquo;{item.description}&rdquo;
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                
                {/* View / Present Button */}
                <Link
                  href={`/thu-vien/doc/${item.slug}`}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-sm flex items-center gap-2 hover:bg-amber-400 transition shadow-xl shadow-amber-500/25 group transform hover:scale-[1.02] active:scale-95"
                >
                  {isSlidePresentation ? (
                    <>
                      <Presentation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Trình Chiếu Slide 16:9</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>Xem Tài Liệu (Lật Trang A4)</span>
                    </>
                  )}
                </Link>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload()}
                  disabled={isDownloading}
                  className="px-6 py-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 text-[var(--text-main)] font-serif font-bold text-sm flex items-center gap-2 hover:text-amber-500 transition shadow-md disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-amber-500" />}
                  <span>Tải Tài Liệu Gốc</span>
                  {user && !quotaInfo.isUnlimited && (
                    <span className="text-[11px] font-mono bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 ml-1">
                      {quotaInfo.remainingQuota}/{quotaInfo.maxQuota} lượt
                    </span>
                  )}
                </button>

              </div>

              {/* Download Feedback */}
              {downloadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Tài liệu đang được tải về thành công!</span>
                </div>
              )}
              {downloadError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}

            </div>

          </div>

        </section>

        {/* ── TABS NAVIGATION ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-2 overflow-x-auto">
            
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-5 py-2.5 rounded-2xl font-serif font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Giới Thiệu Giáo Án / Slide</span>
            </button>

            {item.table_of_contents && item.table_of_contents.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('toc')}
                className={`px-5 py-2.5 rounded-2xl font-serif font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'toc'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Mục Lục Các Bài Học ({item.table_of_contents.length})</span>
              </button>
            )}

            {item.attachments && item.attachments.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('attachments')}
                className={`px-5 py-2.5 rounded-2xl font-serif font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
                  activeTab === 'attachments'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                <span>Tệp Đính Kèm &amp; Slide ({item.attachments.length})</span>
              </button>
            )}

          </div>

          {/* ── TAB 1: FULL SUMMARY ── */}
          {activeTab === 'summary' && (
            <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6 animate-fadeIn">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] flex items-center gap-2">
                <Presentation className="w-5 h-5 text-amber-500" />
                <span>Mục Tiêu &amp; Phương Pháp Sư Phạm</span>
              </h2>

              {item.full_summary_html ? (
                <div 
                  className="prose dark:prose-invert max-w-none font-serif text-sm sm:text-base text-[var(--text-main)] leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: item.full_summary_html }}
                />
              ) : (
                <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          )}

          {/* ── TAB 2: TABLE OF CONTENTS ── */}
          {activeTab === 'toc' && item.table_of_contents && (
            <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-amber-500" />
                  <span>Danh Sách Các Bài Giảng</span>
                </h2>
                <Link
                  href={`/thu-vien/doc/${item.slug}`}
                  className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  Mở Trình Chiếu Trực Tiếp &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.table_of_contents.map((t, idx) => (
                  <Link
                    key={idx}
                    href={`/thu-vien/doc/${item.slug}`}
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 flex items-center justify-between gap-3 text-xs sm:text-sm transition group"
                  >
                    <span className="font-serif font-bold text-[var(--text-main)] group-hover:text-amber-500 transition">
                      {t.title}
                    </span>
                    {t.page && (
                      <span className="font-mono text-xs text-amber-500 font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
                        Slide / Trang {t.page}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: ATTACHMENTS ── */}
          {activeTab === 'attachments' && item.attachments && (
            <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6 animate-fadeIn">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-amber-500" />
                <span>Tệp Đính Kèm, Slide PPTX &amp; Bài Tập</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 flex items-center justify-between gap-4 transition group"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {att.file_type}
                      </span>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] truncate group-hover:text-amber-500 transition">
                        {att.name}
                      </h4>
                      {att.size_label && (
                        <span className="text-xs text-[var(--text-muted)] block font-mono">{att.size_label}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(att.url, att.name)}
                      className="p-3 rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow shrink-0"
                      title={`Tải ${att.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* ── RELATED ITEMS SECTION ── */}
        {relatedItems.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-[var(--border-card)]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>Tài Liệu Cùng Chuyên Mục</span>
              </h3>
              <Link
                href="/thu-vien/tai-lieu"
                className="text-xs font-bold text-amber-500 hover:underline"
              >
                Xem tất cả kho tài liệu &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedItems.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/thu-vien/tai-lieu/${rel.slug}`}
                  className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 shadow-lg flex flex-col justify-between space-y-4 group transition hover:-translate-y-1"
                >
                  <div className={`w-full h-44 rounded-2xl bg-gradient-to-br ${rel.cover_bg_gradient} p-4 flex flex-col justify-between shadow-inner relative overflow-hidden`}>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 text-white font-mono self-start border border-white/20">
                      {rel.format}
                    </span>
                    <div>
                      <h4 className="font-serif font-black text-xs sm:text-sm text-white line-clamp-2 leading-snug drop-shadow">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] font-serif italic text-white/80 mt-1 truncate">
                        {rel.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                    <span>{rel.pages_count > 0 ? `${rel.pages_count} trang/slide` : 'Giáo án'}</span>
                    <span className="text-amber-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Chi Tiết <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            const u = getStoredUser();
            setUser(u);
            if (u) checkUserDownloadQuota(u.id, u.role).then(setQuotaInfo);
          }}
        />
      )}

    </div>
  );
}
