'use client';

import React, { Suspense } from 'react';
import DangBaiStudio from '@/components/editor/DangBaiStudio';

export default function DangBaiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-36 text-center text-amber-500 font-bold">Đang tải Trình Soạn Thảo VERIDU Studio...</div>}>
      <DangBaiStudio />
    </Suspense>
  );
}
