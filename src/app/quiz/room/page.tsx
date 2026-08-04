export const dynamic = 'force-dynamic';
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import QuizArena from '@/components/QuizArena';
import Link from 'next/link';

function LiveRoomContent() {
  const searchParams = useSearchParams();
  const pin = searchParams?.get('pin') || '789012';
  const mode = (searchParams?.get('mode') as 'solo' | 'live') || 'live';
  const category = searchParams?.get('category') || 'all';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/quiz" className="text-xs font-bold text-amber-400 hover:underline">
          &larr; Rời Phòng Thi
        </Link>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold inline-block">
          {mode === 'solo' ? 'Luyện Tập Cá Nhân' : `Phòng Live PIN: ${pin}`}
        </div>
      </div>

      <QuizArena mode={mode} roomPin={pin} category={category} />
    </div>
  );
}

export default function LiveRoomPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense fallback={<div className="text-center py-20 text-[var(--text-muted)] font-medium">Đang tải phòng thi Live...</div>}>
          <LiveRoomContent />
        </Suspense>
      </main>
    </div>
  );
}

