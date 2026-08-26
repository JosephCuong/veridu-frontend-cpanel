'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Download, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LayoutGrid, 
  ListFilter,
  Eye,
  Tv,
  Presentation
} from 'lucide-react';
import { fetchLibraryItems, LibraryItem, checkUserDownloadQuota } from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import LibraryBookshelfGrid from '@/components/LibraryBookshelfGrid';
import LibraryEditorialList from '@/components/LibraryEditorialList';

const CATEGORIES = [
  { id: 'all', name: 'Tất Cả Tài Liệu' },
  { id: 'Giáo Án Slide', name: 'Giáo Án PowerPoint' },
  { id: 'Phụng Vụ', name: 'Nghi Thức Phụng Vụ' },
  { id: 'Văn Kiện', name: 'Văn Kiện & Quy Chế' },
  { id: 'Thánh Nhạc', name: 'Thánh Nhạc & Hát Lễ' }
];

export default function DocumentsLibraryPage() {
  const [docs, setDocs] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'shelf' | 'list'>('shelf');

  // Auth & Download Quota
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    loadDocs();
  }, [selectedCategory]);

  const loadDocs = async () => {
    setIsLoading(true);
    const data = await fetchLibraryItems('document', selectedCategory);
    setDocs(data);
    setIsLoading(false);
  };

  const filteredDocs = docs.filter((d) => {
    const matchSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const handleDownload = async (doc: LibraryItem) => {
    setDownloadMessage(null);
    const currentUser = getStoredUser();

    if (!currentUser) {
      setUser(null);
      setShowAuthModal(true);
      return;
    }

    setDownloadingSlug(doc.slug);

    try {
      const quota = await checkUserDownloadQuota(currentUser.id, currentUser.role);
      if (!quota.canDownload && !quota.isUnlimited) {
        setDownloadMessage({
          text: `Bạn đã sử dụng hết 5 lượt tải miễn phí trong hôm nay. Hạn mức sẽ được làm mới sau 24h.`,
          isError: true
        });
        setDownloadingSlug(null);
        return;
      }

      const res = await fetch(`/api/library/download/${doc.slug}?userId=${currentUser.id}&userRole=${encodeURIComponent(currentUser.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Lỗi khi tải file.');

      setDownloadMessage({
        text: `Đang tải tài liệu "${doc.title}". Lượt tải còn lại: ${quota.isUnlimited ? 'Vô hạn' : Math.max(0, quota.remainingQuota - 1) + '/5'}`,
        isError: false
      });

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.target = '_blank';
        link.download = result.fileName || `${doc.slug}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setDownloadMessage({
        text: err.message || 'Lỗi không xác định khi tải tài liệu.',
        isError: true
      });
    } finally {
      setDownloadingSlug(null);
    }
  };

  // Stats calculation
  const totalViews = docs.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
  const totalDownloads = docs.reduce((acc, curr) => acc + (curr.download_count || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 pb-20 font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── 1. HERO HEADER ── */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-serif italic">
            <Presentation className="w-3.5 h-3.5" />
            <span>Kho Học Liệu &amp; Bài Giảng Giáo Lý Mục Vụ</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] tracking-tight">
            Kho Tài Liệu &amp; Slide Bài Giảng
          </h1>

          <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Hệ thống giáo án điện tử PowerPoint, slide trình chiếu giáo lý 16:9, sổ tay huynh trưởng và văn kiện phụng vụ phục vụ công tác tông đồ.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[var(--text-muted)] font-serif">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-orange-500" />
              <strong className="text-[var(--text-main)]">{docs.length}</strong> Bộ Tài Liệu / Giáo Án
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-orange-500" />
              <strong className="text-[var(--text-main)]">{totalViews.toLocaleString()}</strong> Lượt Xem
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4 text-orange-500" />
              <strong className="text-[var(--text-main)]">{totalDownloads.toLocaleString()}</strong> Lượt Tải
            </span>
          </div>
        </section>

        {/* ── 2. CONTROLS BAR: SEARCH, FILTERS & VIEW MODE ── */}
        <section className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Tìm tài liệu, giáo án, người soạn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs sm:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Dual View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] self-end md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('shelf')}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 transition ${
                  viewMode === 'shelf'
                    ? 'bg-orange-500 text-slate-950 shadow font-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Xem dạng Kệ Trưng Bày 3D"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kệ 3D</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-slate-950 shadow font-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Xem dạng Danh Sách Thẻ Kính Màu"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Danh Sách Thẻ</span>
              </button>
            </div>

          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[var(--border-card)]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-slate-950 font-black shadow-sm'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </section>

        {/* Download Feedback Alert */}
        {downloadMessage && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            downloadMessage.isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}>
            {downloadMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{downloadMessage.text}</span>
          </div>
        )}

        {/* ── 3. DOCUMENTS DISPLAY (3D SHELF / EDITORIAL LIST) ── */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
            <p className="font-serif text-sm text-[var(--text-muted)] italic">Đang nạp kho tài liệu mục vụ...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-20 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
            <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <p className="font-serif text-sm text-[var(--text-muted)] font-bold">
              Không tìm thấy tài liệu nào phù hợp với bộ lọc.
            </p>
          </div>
        ) : viewMode === 'shelf' ? (
          <LibraryBookshelfGrid
            items={filteredDocs}
            itemType="document"
            onDownload={handleDownload}
            downloadingSlug={downloadingSlug}
          />
        ) : (
          <LibraryEditorialList
            items={filteredDocs}
            itemType="document"
            onDownload={handleDownload}
            downloadingSlug={downloadingSlug}
          />
        )}

      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setUser(getStoredUser());
          }}
        />
      )}

    </div>
  );
}
