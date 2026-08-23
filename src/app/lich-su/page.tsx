import React from 'react';

import SalvationTimeline from '@/components/SalvationTimeline';
import { Clock, Sparkles } from 'lucide-react';

export default function SalvationTimelinePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-36 pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 flex-1 w-full">
        {/* Page Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Salvation History Visualization
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)]">
            Dòng Thời Gian Lịch Sử Cứu Độ
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Hành trình Lịch sử Cứu Độ qua 6 đại thời kỳ: Từ Khởi Nguyên Sáng Tạo, Thời Các Tổ Phụ, Xuất Hành, Các Vua & Ngôn Sứ đến Đấng Mê-si-a và Hội Thánh Sơ Khai.
          </p>
        </div>

        {/* Interactive Timeline Component */}
        <SalvationTimeline />

      </main>
    </div>
  );
}
