'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  ChevronRight, 
  Sparkles, 
  BookmarkCheck,
  ShieldCheck,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LibraryItem, fetchLibraryItems, checkUserDownloadQuota } from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';

export default function TuSachPage() {
  const [books, setBooks] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const CATEGORIES = [
    { id: 'all', name: 'Tất Cả Sách' },
    { id: 'kinh-thanh', name: 'Nghiên Cứu Kinh Thánh' },
    { id: 'than-hoc', name: 'Thần Học & Tín Lý' },
    { id: 'linh-dao', name: 'Linh Đạo & Suy Niệm' },
    { id: 'giao-phu', name: 'Giáo Phụ & Lịch Sử' },
    { id: 'hanh-cac-thanh', name: 'Hạnh Các Thánh' }
  ];

  useEffect(() => {
    setUser(getStoredUser());

    async function loadBooks() {
      setIsLoading(true);
      const data = await fetchLibraryItems('book');
      setBooks(data);
      setIsLoading(false);
    }
    loadBooks();
  }, []);

  const handleDownload = async (book: LibraryItem) => {
    setDownloadMessage(null);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setDownloadingSlug(book.slug);
    try {
      const res = await fetch(`/api/library/download/${book.slug}?userId=${user.id}&userRole=${encodeURIComponent(user.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Không thể xử lý yêu cầu tải về.');
      }

      setDownloadMessage({ text: `Đang tải cuốn "${book.title}" về máy thành công!`, isError: false });

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
      setDownloadMessage({ text: err.message || 'Lỗi khi tải tài liệu.', isError: true });
    } finally {
      setDownloadingSlug(null);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchQuery = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-32 pb-24">
      
      {/* ── 1. HERO HEADER ── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-card)]">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Kho Tàng Văn Bản &amp; Tri Thức Công Giáo</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-tight tracking-tight">
            Tủ Sách Nghiên Cứu
          </h1>

          <p className="font-serif text-sm sm:text-lg text-[var(--text-muted)] leading-relaxed italic max-w-2xl mx-auto">
            &ldquo;Tuyển tập các tác phẩm kinh điển về Kinh Thánh, Thần Học, Giáo Phụ, Linh Đạo và Hạnh Các Thánh được số hóa phục vụ học tập và nghiên cứu đức tin.&rdquo;
          </p>

          {/* Quick Switch to Documents */}
          <div className="pt-2">
            <Link
              href="/thu-vien/tai-lieu"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/40 transition"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Chuyển sang Kho Tài Liệu Mục Vụ &amp; Giáo Án &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. SEARCH & FILTER BAR ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Search and Category Pills */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên sách, tác giả, chủ đề..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 transition shadow-inner"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-amber-500/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

        {/* Global Download Feedback Banner */}
        {downloadMessage && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            downloadMessage.isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}>
            {downloadMessage.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{downloadMessage.text}</span>
          </div>
        )}

        {/* ── 3. BOOKS GRID ── */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="font-serif text-sm text-[var(--text-muted)] italic">Đang tải tủ sách thư viện...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-20 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
            <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <p className="font-serif text-sm text-[var(--text-muted)] font-bold">
              Không tìm thấy cuốn sách nào phù hợp với bộ lọc.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-xl flex flex-col justify-between overflow-hidden group transition-all duration-300"
              >
                {/* Book Cover Header Banner */}
                <Link
                  href={`/thu-vien/sach/${book.slug}`}
                  className={`h-36 bg-gradient-to-br ${book.cover_bg_gradient || 'from-amber-700 to-slate-950'} p-5 flex flex-col justify-between relative overflow-hidden block group-hover:opacity-95 transition-opacity`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-amber-300 border border-white/10">
                      {book.format}
                    </span>
                    <span className="text-[11px] text-white/80 font-mono font-semibold">
                      {book.pages_count > 0 ? `${book.pages_count} trang` : ''} {book.file_size_label ? `• ${book.file_size_label}` : ''}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <span className="text-[11px] text-amber-200/90 font-serif italic block truncate">
                      {book.author}
                    </span>
                    <h3 className="font-serif font-black text-lg text-white leading-snug drop-shadow-md line-clamp-2">
                      {book.title}
                    </h3>
                  </div>
                </Link>

                {/* Book Content & Summary */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <Link href={`/thu-vien/sach/${book.slug}`} className="block group/desc">
                    <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed italic group-hover/desc:text-[var(--text-main)] transition-colors">
                      &ldquo;{book.description}&rdquo;
                    </p>
                  </Link>

                  <div className="space-y-3 pt-3 border-t border-[var(--border-card)]">
                    
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {book.view_count} đọc</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-amber-500" /> {book.download_count} tải</span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      
                      {/* View Detail & Read Online */}
                      <Link
                        href={`/thu-vien/sach/${book.slug}`}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-serif font-black text-xs flex items-center justify-center gap-1.5 hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Xem &amp; Đọc Sách</span>
                      </Link>

                      {/* Download File */}
                      <button
                        type="button"
                        onClick={() => handleDownload(book)}
                        disabled={downloadingSlug === book.slug}
                        className="py-2.5 px-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 text-[var(--text-main)] font-serif font-bold text-xs flex items-center justify-center gap-1.5 hover:text-amber-500 transition shadow-sm disabled:opacity-50"
                      >
                        {downloadingSlug === book.slug ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>Tải Về</span>
                      </button>

                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

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
