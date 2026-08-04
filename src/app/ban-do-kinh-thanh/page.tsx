import React from 'react';

import BibleMap from '@/components/BibleMap';
import { Compass, Sparkles } from 'lucide-react';

export default function BibleMapPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1 w-full">
        
        {/* Page Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Interactive 3D Geography
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight">
            Bản Đồ Kinh Thánh & Địa Danh Cứu Độ
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Khám phá các địa danh lịch sử trong Cựu Ước, Tân Ước và hành trình truyền giáo của các Tông đồ.
          </p>
        </div>

        {/* Interactive Map Component */}
        <BibleMap />

      </main>
    </div>
  );
}
