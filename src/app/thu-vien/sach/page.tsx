'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Download, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LayoutGrid, 
  ListFilter,
  Eye,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { fetchLibraryItems, LibraryItem, checkUserDownloadQuota } from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import LibraryBookshelfGrid from '@/components/LibraryBookshelfGrid';
import LibraryEditorialList from '@/components/LibraryEditorialList';

const CATEGORIES = [
  { id: 'all', name: 'Tất Cả Tủ Sách' },
  { id: 'Kinh Thánh', name: 'Kinh Thánh' },
  { id: 'Thần Học', name: 'Thần Học & Giáo Lý' },
  { id: 'Linh Đạo', name: 'Linh Đạo & Tu Đức' },
  { id: 'Giáo Phụ', name: 'Giáo Phụ Triết Học' },
  { id: 'Hạnh Các Thánh', name: 'Hạnh Các Thánh' }
];

export default function BookLibraryPage() {
  const [books, setBooks] = useState<LibraryItem[]>([]);
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
    loadBooks();
  }, [selectedCategory]);

  const loadBooks = async () => {
    setIsLoading(true);
    const data = await fetchLibraryItems('book', selectedCategory);
    setBooks(data);
    setIsLoading(false);
  };

  const filteredBooks = books.filter((b) => {
    const matchSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const handleDownload = async (book: LibraryItem) => {
    setDownloadMessage(null);
    const currentUser = getStoredUser();

    if (!currentUser) {
      setUser(null);
      setShowAuthModal(true);
      return;
    }

    setDownloadingSlug(book.slug);

    try {
      const quota = await checkUserDownloadQuota(currentUser.id, currentUser.role);
      if (!quota.canDownload && !quota.isUnlimited) {
        setDownloadMessage({
          text: `Bạn đã sử dụng hết 5 lượt tải miễn phí trong hôm nay. Vui lòng thử lại sau 24h hoặc liên hệ Admin.`,
          isError: true
        });
        setDownloadingSlug(null);
        return;
      }

      const res = await fetch(`/api/library/download/${book.slug}?userId=${currentUser.id}&userRole=${encodeURIComponent(currentUser.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Lỗi khi tải file.');

      setDownloadMessage({
        text: `Đang tải tác phẩm "${book.title}". Lượt tải còn lại trong ngày: ${quota.isUnlimited ? 'Vô hạn' : Math.max(0, quota.remainingQuota - 1) + '/5'}`,
        isError: false
      });

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.target = '_blank';
        link.download = result.fileName || `${book.slug}.pdf`;
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
  const totalViews = books.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
  const totalDownloads = books.reduce((acc, curr) => acc + (curr.download_count || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 pb-20 font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── 1. HERO HEADER ── */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-serif italic">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Tàng Văn Khố &amp; Tri Thức Đức Tin Công Giáo</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] tracking-tight">
            Tủ Sách Nghiên Cứu Thần Học
          </h1>

          <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Tra cứu và thưởng thức các tác phẩm Kinh Thánh, Thông Điệp Tông Tòa, Giáo Phụ học và tác phẩm tu đức với Trình Đọc Lật Trang A4 nguyên bản.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[var(--text-muted)] font-serif">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <strong className="text-[var(--text-main)]">{books.length}</strong> Đầu Sách Nghiên Cứu
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-500" />
              <strong className="text-[var(--text-main)]">{totalViews.toLocaleString()}</strong> Lượt Đọc
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-500" />
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
                placeholder="Tìm theo tên sách, tác giả, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs sm:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Dual View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] self-end md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('shelf')}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 transition ${
                  viewMode === 'shelf'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Xem dạng Kệ Sách 3D Vatican"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kệ Sách 3D</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
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
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
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

        {/* ── 3. BOOKS DISPLAY (3D SHELF / EDITORIAL LIST) ── */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="font-serif text-sm text-[var(--text-muted)] italic">Đang sắp xếp tủ sách thư viện...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-20 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
            <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <p className="font-serif text-sm text-[var(--text-muted)] font-bold">
              Không tìm thấy cuốn sách nào phù hợp với bộ lọc.
            </p>
          </div>
        ) : viewMode === 'shelf' ? (
          <LibraryBookshelfGrid
            items={filteredBooks}
            itemType="book"
            onDownload={handleDownload}
            downloadingSlug={downloadingSlug}
          />
        ) : (
          <LibraryEditorialList
            items={filteredBooks}
            itemType="book"
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
