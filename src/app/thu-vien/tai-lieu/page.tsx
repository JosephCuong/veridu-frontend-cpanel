'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, Search, FolderOpen, Calendar, HardDrive, CheckCircle2
} from 'lucide-react';

export default function TaiLieuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { id: 'all', name: 'Tất Cả Tài Liệu' },
    { id: 'giao-an', name: 'Giáo Án Giáo Lý' },
    { id: 'phung-vu', name: 'Nghi Thức & Phụng Vụ' },
    { id: 'van-kien', name: 'Văn Kiện & Thông Điệp' },
    { id: 'thanh-nhac', name: 'Thánh Nhạc & Ca Đoàn' }
  ];

  const DOCUMENTS = [
    {
      id: 1,
      title: 'Giáo Án Giáo Lý Khai Tâm (Trọn Bộ 30 Bài Học)',
      category: 'giao-an',
      categoryName: 'Giáo Án Giáo Lý',
      format: 'DOCX / PDF',
      size: '8.4 MB',
      updatedAt: '2026-08-15',
      author: 'Ban Giáo Lý Tổng Giáo Phận',
      downloads: 1420
    },
    {
      id: 2,
      title: 'Giáo Án Giáo Lý Thêm Sức & Bao Đồng (Kèm Slide PowerPoint)',
      category: 'giao-an',
      categoryName: 'Giáo Án Giáo Lý',
      format: 'PPTX / DOCX',
      size: '34.2 MB',
      updatedAt: '2026-08-10',
      author: 'Ủy Ban Thiếu Nhi Thánh Thể',
      downloads: 2150
    },
    {
      id: 3,
      title: 'Sách Nghi Thức Thánh Lễ Bằng Tiếng Việt & Latinh',
      category: 'phung-vu',
      categoryName: 'Nghi Thức & Phụng Vụ',
      format: 'PDF',
      size: '5.1 MB',
      updatedAt: '2026-07-28',
      author: 'Ủy Ban Phụng Tự Hội Đồng Giám Mục',
      downloads: 980
    },
    {
      id: 4,
      title: 'Thông Điệp Laudato Si’ — Chăm Sóc Ngôi Nhà Chung',
      category: 'van-kien',
      categoryName: 'Văn Kiện & Thông Điệp',
      format: 'PDF / Word',
      size: '3.8 MB',
      updatedAt: '2026-06-12',
      author: 'Đức Thánh Cha Phanxicô',
      downloads: 1760
    },
    {
      id: 5,
      title: 'Tuyển Tập 100 Bài Hát Nhập Lễ & Hiệp Lễ Mùa Thường Niên',
      category: 'thanh-nhac',
      categoryName: 'Thánh Nhạc & Ca Đoàn',
      format: 'PDF (Bản Nhạc)',
      size: '14.5 MB',
      updatedAt: '2026-08-02',
      author: 'Ban Thánh Nhạc Giáo Phận',
      downloads: 3200
    },
    {
      id: 6,
      title: 'Văn Kiện Công Đồng Vatican II (Bản Dịch Đối Chiếu)',
      category: 'van-kien',
      categoryName: 'Văn Kiện & Thông Điệp',
      format: 'PDF',
      size: '19.0 MB',
      updatedAt: '2026-05-20',
      author: 'Công Đồng Chung Vatican II',
      downloads: 1290
    }
  ];

  const filteredDocs = DOCUMENTS.filter((doc) => {
    const matchCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchQuery = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       doc.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24">
      
      {/* 1. HERO HEADER */}
      <section className="relative w-full py-16 px-4 sm:px-6 lg:px-12 border-b border-[var(--border-card)] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wider backdrop-blur-md">
            <span>✦</span>
            <span>KHO TÀI LIỆU & GIÁO ÁN CÔNG GIÁO</span>
            <span>✦</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] tracking-tight">
            Tài Liệu, Giáo Án & Văn Kiện
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Hệ thống lưu trữ và chia sẻ giáo án Giáo lý, nghi thức Phụng vụ, văn kiện Hội Thánh và tuyển tập Thánh nhạc định dạng Word, PowerPoint và PDF.
          </p>
        </div>
      </section>

      {/* 2. CONTROLS: SEARCH & CATEGORIES */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tài liệu, giáo án, văn kiện..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 transition-all shadow-sm"
            />
          </div>

          <div className="text-xs text-[var(--text-muted)] font-semibold">
            Có sẵn <span className="text-indigo-500 font-bold">{filteredDocs.length}</span> tệp tài liệu
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. DOCUMENTS TABLE / LIST */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl divide-y divide-[var(--border-card)]">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[var(--bg-main)]/50 transition-colors group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {doc.categoryName}
                    </span>
                    <span className="text-[11px] font-bold text-amber-500">
                      {doc.format}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[var(--text-main)] group-hover:text-indigo-500 transition-colors leading-snug">
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-medium flex-wrap pt-0.5">
                    <span>Tác giả / Đơn vị: {doc.author}</span>
                    <span>•</span>
                    <span>Dung lượng: {doc.size}</span>
                    <span>•</span>
                    <span>Lượt tải: {doc.downloads}</span>
                  </div>
                </div>
              </div>

              {/* Download Action Button */}
              <button
                onClick={() => alert(`Đang chuẩn bị tải tài liệu: ${doc.title}`)}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Tài Liệu</span>
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
