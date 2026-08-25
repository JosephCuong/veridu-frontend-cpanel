import React from 'react';
import { Metadata } from 'next';
import SalvationTimeline from '@/components/SalvationTimeline';
import { Clock, Sparkles, Scroll, Cross, Church } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dòng Thời Gian Lịch Sử Cứu Độ & Giáo Hội | VERIDU',
  description: 'Toàn cảnh tiến trình Lịch Sử Cứu Độ qua 7 Đại Kỷ Nguyên: Từ Khởi Nguyên Sáng Tạo, Xuất Hành, Vương Quốc, Mầu Nhiệm Đức Kitô đến 2000 Năm Lịch Sử Giáo Hội Công Giáo.',
  openGraph: {
    title: 'Dòng Thời Gian Lịch Sử Cứu Độ & Giáo Hội | VERIDU',
    description: 'Trực quan hóa tiến trình Lịch Sử Cứu Độ và Lịch Sử Giáo Hội Công Giáo qua 7 Đại Kỷ Nguyên với liên kết Kinh Thánh, Nhân Vật và Bản Đồ.',
    images: [{ url: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1200' }]
  }
};

export default function SalvationTimelinePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-32 pb-20">
      
      {/* ── Page Hero Header ── */}
      <section className="relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-card)]/50 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
        
        {/* Subtle Ambient Halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto text-center space-y-5">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Tiến Trình 7 Đại Kỷ Nguyên Cứu Chuộc (Heilsgeschichte)</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Dòng Thời Gian Lịch Sử
          </h1>

          <p className="font-serif text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed italic">
            &ldquo;Hành trình Đức Tin xuyên suốt chiều dài lịch sử: Từ thuở Khởi Nguyên Sáng Tạo, Giao Ước Các Tổ Phụ, Biến Cố Nhập Thể của Đức Kitô đến 2000 Năm Sứ Vụ Hội Thánh.&rdquo;
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Scroll className="w-3.5 h-3.5 text-amber-500" />
              <span>Cựu Ước &bull; Lịch Sử Dân Tuyển Chọn</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Cross className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tân Ước &bull; Mầu Nhiệm Đức Kitô</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Church className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lịch Sử Giáo Hội &amp; Các Công Đồng</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Main Interactive Timeline Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <SalvationTimeline />
      </main>

    </div>
  );
}
