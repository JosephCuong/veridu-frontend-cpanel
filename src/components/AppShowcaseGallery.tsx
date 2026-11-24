'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ScreenshotItem {
  src: string;
  title: string;
  caption: string;
}

const SCREENSHOTS: ScreenshotItem[] = [
  {
    src: '/images/app-v1/banner.webp',
    title: 'Tổng Quan VERIDU v1.1',
    caption: 'Phần mềm nghiên cứu Kinh Thánh Công Giáo đa khung, miễn phí & chạy hoàn toàn ngoại tuyến trên Windows.',
  },
  {
    src: '/images/app-v1/01-trang-chu.webp',
    title: 'Trang Chủ',
    caption: 'Lời Chúa hằng ngày, truy cập nhanh Kinh Thánh, Lịch Phụng Vụ, Thư Viện tài nguyên và Video học thuật.',
  },
  {
    src: '/images/app-v1/02-kinh-thanh-song-song.webp',
    title: 'Đọc Song Song 2 Khung',
    caption: 'Đối chiếu trực tiếp 2 bản dịch CGKPV và Lm. Nguyễn Thế Thuấn với đồng bộ cuộn theo Link Sets A/B/C.',
  },
  {
    src: '/images/app-v1/03-kinh-thanh-3-khung-giay-nga.webp',
    title: '3 Khung & Giấy Ngà',
    caption: 'Không gian 3 khung đọc Kinh Thánh kết hợp Sổ Tay ghi chú hoặc Giáo Lý trên nền Giấy Ngà dịu mắt.',
  },
  {
    src: '/images/app-v1/04-luoi-73-sach-nen-toi.webp',
    title: 'Lưới 73 Sách & Nền Tối',
    caption: 'Bảng lưới chọn nhanh trọn bộ 73 sách Cựu Ước & Tân Ước cùng giao diện Nền Tối bảo vệ mắt ban đêm.',
  },
  {
    src: '/images/app-v1/05-phung-vu-bai-doc.webp',
    title: 'Lịch Phụng Vụ Offline',
    caption: 'Tra cứu các Bài Đọc, Đáp Ca, Tin Mừng hằng ngày trọn văn ngay cả khi không có Internet.',
  },
  {
    src: '/images/app-v1/06-thu-vien-tai-nguyen.webp',
    title: 'Thư Viện Giáo Lý',
    caption: 'Đồng bộ và tra cứu Sách Giáo Lý Hội Thánh Công Giáo (2.865 số) cùng kho tài liệu mở rộng.',
  },
  {
    src: '/images/app-v1/07-thiep-loi-chua.webp',
    title: 'Thiệp Lời Chúa',
    caption: 'Tạo và xuất ảnh thiệp trích dẫn Kinh Thánh trang nhã chỉ bằng một cú nhấp chuột.',
  },
];

export default function AppShowcaseGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const current = SCREENSHOTS[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? SCREENSHOTS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === SCREENSHOTS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Preview Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-[var(--border-card)] shadow-2xl group">
        <div className="relative aspect-[16/10] w-full bg-slate-950 flex items-center justify-center">
          <img
            src={current.src}
            alt={current.title}
            className="w-full h-full object-contain transition-all duration-300"
          />
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Ảnh trước"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/15 flex items-center justify-center transition cursor-pointer shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Ảnh kế tiếp"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/15 flex items-center justify-center transition cursor-pointer shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Fullscreen Trigger */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Phóng to ảnh"
          className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/75 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/15 text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Phóng To</span>
        </button>

        {/* Caption Bar */}
        <div className="p-4 sm:px-6 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
          <div>
            <div className="font-serif font-bold text-sm text-amber-400">
              {activeIndex + 1}/{SCREENSHOTS.length} · {current.title}
            </div>
            <p className="text-xs text-slate-300 font-serif mt-0.5">{current.caption}</p>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SCREENSHOTS.map((item, idx) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer aspect-[16/10] bg-slate-900 ${
              idx === activeIndex
                ? 'border-amber-500 ring-2 ring-amber-500/30 scale-[1.02]'
                : 'border-[var(--border-card)] opacity-70 hover:opacity-100'
            }`}
            title={item.title}
          >
            <img src={item.src} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-6xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <div className="font-serif font-bold text-sm sm:text-base text-amber-400">
                {current.title} — <span className="text-slate-300 font-normal text-xs sm:text-sm">{current.caption}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={current.src}
              alt={current.title}
              className="w-full max-h-[82vh] object-contain rounded-2xl border border-white/15 bg-slate-950"
            />
          </div>
        </div>
      )}
    </div>
  );
}
