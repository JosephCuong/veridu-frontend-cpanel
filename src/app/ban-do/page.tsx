import React from 'react';
import { Metadata } from 'next';
import BibleMap from '@/components/BibleMap';
import { Compass, Sparkles, MapPin, Globe, Scroll } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bản Đồ Kinh Thánh & Địa Danh Thánh Địa | VERIDU',
  description: 'Khám phá bản đồ số tương tác về các địa danh lịch sử Cựu Ước, Tân Ước và hành trình truyền giáo của các Tông đồ trên Thánh Địa.',
  openGraph: {
    title: 'Bản Đồ Kinh Thánh Tương Tác | VERIDU',
    description: 'Trực quan hóa địa lý Thánh Địa với tọa độ GPS thực tế, bối cảnh khảo cổ học và trích đoạn Kinh Thánh.',
    images: [{ url: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1200' }]
  }
};

export default function BibleMapPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-32 pb-16">
      
      {/* ── Page Hero Header ── */}
      <section className="relative overflow-hidden py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-card)]/50 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
        
        {/* Subtle Ambient Halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Địa Lý Thánh &amp; Khảo Cổ Kinh Thánh</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Bản Đồ Kinh Thánh
          </h1>

          <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed italic">
            &ldquo;Khám phá không gian địa lý của các biến cố Cứu Độ: Từ Sa mạc Sinai, Đất Hứa Canaan, Thánh Đô Giê-ru-sa-lem đến Hành trình truyền giáo của các Tông Đồ.&rdquo;
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Tọa Độ GPS Thực Tế</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>3 Chế Độ Bản Đồ (Địa Hình &bull; Vệ Tinh &bull; Tiêu Chuẩn)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-card)] shadow-sm">
              <Scroll className="w-3.5 h-3.5 text-indigo-400" />
              <span>Liên Kết Trình Đọc Kinh Thánh</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Main Map Canvas Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <BibleMap />
      </main>

    </div>
  );
}
