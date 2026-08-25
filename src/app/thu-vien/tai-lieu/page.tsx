'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Search, 
  FolderOpen, 
  Calendar, 
  HardDrive, 
  CheckCircle2, 
  BookOpen, 
  Eye, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { LibraryItem, fetchLibraryItems } from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';

export default function TaiLieuPage() {
  const [documents, setDocuments] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const CATEGORIES = [
    { id: 'all', name: 'Tất Cả Tài Liệu' },
    { id: 'giao-an', name: 'Giáo Án Giáo Lý' },
    { id: 'phung-vu', name: 'Nghi Thức & Phụng Vụ' },
    { id: 'van-kien', name: 'Văn Kiện & Thông Điệp' },
    { id: 'thanh-nhac', name: 'Thánh Nhạc & Ca Đoàn' }
  ];

  useEffect(() => {
    setUser(getStoredUser());

    async function loadDocuments() {
      setIsLoading(true);
      const data = await fetchLibraryItems('document');
      setDocuments(data);
      setIsLoading(false);
    }
    loadDocuments();
  }, []);

  const handleDownload = async (doc: LibraryItem) => {
    setDownloadMessage(null);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setDownloadingSlug(doc.slug);
    try {
      const res = await fetch(`/api/library/download/${doc.slug}?userId=${user.id}&userRole=${encodeURIComponent(user.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Không thể xử lý yêu cầu tải về.');
      }

      setDownloadMessage({ text: `Đang tải tài liệu "${doc.title}" về máy thành công!`, isError: false });

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
      setDownloadMessage({ text: err.message || 'Lỗi khi tải tài liệu.', isError: true });
    } finally {
      setDownloadingSlug(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchQuery = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-32 pb-24">
      
      {/* ── 1. HERO HEADER ── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-card)]">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-bold uppercase tracking-widest shadow-sm">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Kho Lưu Trữ Tư Liệu Mục Vụ</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-tight tracking-tight">
            Kho Tài Liệu Mục Vụ
          </h1>

          <p className="font-serif text-sm sm:text-lg text-[var(--text-muted)] leading-relaxed italic max-w-2xl mx-auto">
            &ldquo;Hệ thống giáo án giáo lý, nghi thức phụng vụ, thông điệp tòa thánh và tài liệu thánh nhạc dành cho Giáo Lý Viên, Huynh Trưởng và Cộng đoàn Dân Chúa.&rdquo;
          </p>

          {/* Quick Switch to Books */}
          <div className="pt-2">
            <Link
              href="/thu-vien/sach"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/40 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Chuyển sang Tủ Sách Nghiên Cứu &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. SEARCH & FILTER BAR ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm giáo án, nghi thức, văn kiện..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-indigo-500 transition shadow-inner"
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
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black'
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-indigo-500/40'
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

        {/* ── 3. DOCUMENTS LIST / TABLE ── */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="font-serif text-sm text-[var(--text-muted)] italic">Đang nạp kho tài liệu mục vụ...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-20 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
            <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <p className="font-serif text-sm text-[var(--text-muted)] font-bold">
              Không tìm thấy tài liệu nào phù hợp với từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-indigo-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group transition-all duration-300"
              >
                
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        {doc.format}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-semibold">
                        {doc.file_size_label}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        • {doc.pages_count > 0 ? `${doc.pages_count} trang` : ''}
                      </span>
                    </div>

                    <Link href={`/thu-vien/tai-lieu/${doc.slug}`} className="block group/title">
                      <h3 className="font-serif font-black text-base sm:text-lg text-[var(--text-main)] group-hover/title:text-indigo-400 transition leading-snug">
                        {doc.title}
                      </h3>
                    </Link>

                    <Link href={`/thu-vien/tai-lieu/${doc.slug}`} className="block group/desc">
                      <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-2 italic leading-relaxed group-hover/desc:text-[var(--text-main)] transition-colors">
                        &ldquo;{doc.description}&rdquo;
                      </p>
                    </Link>

                    <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] pt-1">
                      <span>Biên soạn: <strong className="text-[var(--text-main)]">{doc.author}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {doc.view_count} xem</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-indigo-400" /> {doc.download_count} tải</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-card)]">
                  
                  {/* View Detail & Presentation */}
                  <Link
                    href={`/thu-vien/tai-lieu/${doc.slug}`}
                    className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-serif font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-600/20"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem &amp; Chiếu Slide</span>
                  </Link>

                  {/* Download */}
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingSlug === doc.slug}
                    className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500/60 text-xs font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {downloadingSlug === doc.slug ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>Tải Về</span>
                  </button>

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
