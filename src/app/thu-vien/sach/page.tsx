'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Download, FileText, Search, Filter, Eye, ChevronRight, Sparkles, BookmarkCheck
} from 'lucide-react';

export default function TuSachPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { id: 'all', name: 'Tất Cả Sách' },
    { id: 'kinh-thanh', name: 'Nghiên Cứu Kinh Thánh' },
    { id: 'than-hoc', name: 'Thần Học & Tín Lý' },
    { id: 'linh-dao', name: 'Linh Đạo & Suy Niệm' },
    { id: 'giao-phu', name: 'Giáo Phụ & Lịch Sử' },
    { id: 'hanh-cac-thanh', name: 'Hạnh Các Thánh' }
  ];

  const BOOKS = [
    {
      id: 1,
      title: 'Kinh Thánh Trọn Bộ Cựu Ước & Tân Ước (Có Chú Giải)',
      author: 'Cố LM. Giuse Nguyễn Thế Thuấn, CSsR',
      category: 'kinh-thanh',
      categoryName: 'Nghiên Cứu Kinh Thánh',
      format: 'PDF',
      pages: 2840,
      size: '45.2 MB',
      description: 'Bản dịch Kinh Thánh chuẩn mực chú giải sâu sắc thần học và văn bản cổ Hy Lạp / Hípri của Cố Giáo sư Nguyễn Thế Thuấn.',
      coverBg: 'from-amber-600 to-amber-900',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Giáo Lý Hội Thánh Công Giáo (CCC)',
      author: 'Hội Thánh Công Giáo',
      category: 'than-hoc',
      categoryName: 'Thần Học & Tín Lý',
      format: 'PDF / EPUB',
      pages: 1024,
      size: '18.6 MB',
      description: 'Bộ Toàn Yếu Giáo Lý Hội Thánh Công Giáo đúc kết toàn bộ đức tin và luân lý Kitô giáo.',
      coverBg: 'from-blue-600 to-indigo-950',
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Gương Chúa Giêsu (Imitatio Christi)',
      author: 'Thomas à Kempis',
      category: 'linh-dao',
      categoryName: 'Linh Đạo & Suy Niệm',
      format: 'PDF',
      pages: 412,
      size: '6.4 MB',
      description: 'Tác phẩm linh đạo bất hủ chỉ đường nhân đức và sự từ bỏ để kết hiệp sâu thẳm cùng Đức Kitô.',
      coverBg: 'from-rose-600 to-rose-950',
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Tự Thuật (Confessiones)',
      author: 'Thánh Augustinô',
      category: 'giao-phu',
      categoryName: 'Giáo Phụ & Lịch Sử',
      format: 'PDF / Word',
      pages: 580,
      size: '12.1 MB',
      description: 'Hành trình từ bóng tối lầm lạc trở về với ánh sáng Chân Lý và Tình Yêu của Đại Thánh Tiến Sĩ Augustinô.',
      coverBg: 'from-purple-600 to-purple-950',
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'Hạnh Các Thánh (365 Ngày Nên Thánh)',
      author: 'Tòa Tổng Giám Mục',
      category: 'hanh-cac-thanh',
      categoryName: 'Hạnh Các Thánh',
      format: 'PDF',
      pages: 820,
      size: '22.0 MB',
      description: 'Tiểu sử, gương sáng đức tin và những bài học nhân đức của các Thánh trong dòng lịch sử Hội Thánh.',
      coverBg: 'from-emerald-600 to-emerald-950',
      downloadUrl: '#'
    },
    {
      id: 6,
      title: 'Tổng Luận Thần Học Tóm Lược (Summa Theologiae)',
      author: 'Thánh Tôma Aquinô',
      category: 'than-hoc',
      categoryName: 'Thần Học & Tín Lý',
      format: 'PDF',
      pages: 940,
      size: '28.5 MB',
      description: 'Đỉnh cao triết học kinh viện và thần học tín lý Kitô giáo của Thánh Tôma Aquinô.',
      coverBg: 'from-amber-700 to-slate-950',
      downloadUrl: '#'
    }
  ];

  const filteredBooks = BOOKS.filter((book) => {
    const matchCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchQuery = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24">
      
      {/* 1. HERO HEADER */}
      <section className="relative w-full py-16 px-4 sm:px-6 lg:px-12 border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wider backdrop-blur-md">
            <span>✦</span>
            <span>TỦ SÁCH ĐIỆN TỬ CÔNG GIÁO</span>
            <span>✦</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] tracking-tight">
            Tủ Sách Nghiên Cứu & Linh Đạo
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Kho lưu trữ các tác phẩm Thánh Kinh, Thần học, Hạnh các Thánh và Linh đạo Công Giáo chuẩn mực định dạng PDF, Word và EPUB.
          </p>
        </div>
      </section>

      {/* 2. CONTROLS: SEARCH & CATEGORY FILTER */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sách, tác giả..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 transition-all shadow-sm"
            />
          </div>

          {/* Book Count Tag */}
          <div className="text-xs text-[var(--text-muted)] font-semibold">
            Hiển thị <span className="text-amber-500 font-bold">{filteredBooks.length}</span> tác phẩm
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
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. BOOKS GRID */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div 
              key={book.id}
              className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                {/* Book Header with simulated cover thumbnail */}
                <div className="flex items-start gap-4">
                  <div className={`w-20 h-28 rounded-xl bg-gradient-to-br ${book.coverBg} border border-white/10 p-2.5 flex flex-col justify-between shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                    <BookmarkCheck className="w-4 h-4 text-amber-300" />
                    <span className="font-serif text-[8px] font-bold text-white leading-tight line-clamp-2">
                      {book.title}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {book.categoryName}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[var(--text-main)] group-hover:text-amber-500 transition-colors leading-snug line-clamp-2 pt-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {book.author}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                  {book.description}
                </p>

                {/* Metadata tags */}
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-medium pt-2 border-t border-[var(--border-card)]">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-amber-500" /> {book.pages} trang</span>
                  <span>•</span>
                  <span>{book.size}</span>
                  <span>•</span>
                  <span className="font-bold text-amber-500">{book.format}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => alert(`Đang chuẩn bị tải file: ${book.title}`)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Sách</span>
                </button>
                <button
                  onClick={() => alert(`Tính năng đọc trực tuyến sách: ${book.title}`)}
                  className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-main)] font-semibold text-xs flex items-center gap-1.5 transition-all"
                  title="Đọc trực tuyến"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
