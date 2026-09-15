'use client';

import React, { Suspense } from 'react';
import DangBaiStudio from '@/components/editor/DangBaiStudio';

export default function SoanBaiPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif font-bold text-amber-500">
            Đang khởi tạo Trình Soạn Thảo Khối Trực Quan VERIDU Studio...
          </p>
        </div>
      }
    >
      <DangBaiStudio />
    </Suspense>
  );
}
