'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ho-so');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4 font-sans">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-[var(--text-muted)]">Đang chuyển hướng về Dashboard Hồ Sơ...</p>
      </div>
    </div>
  );
}
