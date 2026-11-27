'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Legacy compatibility alias for old recovery emails pointing to /update-password.
 * Preserves both query string (?code=...) and URL hash (#access_token=...).
 */
export default function LegacyUpdatePasswordRedirect() {
  useEffect(() => {
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    window.location.replace(`/dat-lai-mat-khau${search}${hash}`);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );
}
