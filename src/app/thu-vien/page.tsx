import React from 'react';

import { getLibraryArticles } from '@/lib/api';
import LibraryClient from '@/components/LibraryClient';

export const revalidate = 30; // Revalidate every 30s

export default async function LibraryPage() {
  const articles = await getLibraryArticles();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <LibraryClient initialArticles={articles} />
      </main>
    </div>
  );
}
