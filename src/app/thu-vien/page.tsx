import React from 'react';
import { getLibraryArticles } from '@/lib/api';
import LibraryClient from '@/components/LibraryClient';

export const revalidate = 30; // Revalidate every 30s

export const metadata = {
  title: "Thư Viện Bài Viết & Suy Niệm Công Giáo | VERIDU",
  description: "Kho tàng các bài nghiên cứu Thần học, Giáo luật Phụng vụ, Suy niệm Lời Chúa và các bài viết giáo lý tương tác trực quan.",
};

export default async function LibraryPage() {
  const articles = await getLibraryArticles();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300">
      <LibraryClient initialArticles={articles} />
    </div>
  );
}
