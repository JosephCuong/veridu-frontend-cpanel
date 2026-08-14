'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';

interface AdminEditFloatingButtonProps {
  articleId?: number | string;
}

export default function AdminEditFloatingButton({ articleId }: AdminEditFloatingButtonProps) {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      const r = (u.role || '').toLowerCase();
      // Show edit button for Admin, Author, Scholar, or logged in user
      if (r.includes('quản trị') || r.includes('tác giả') || r.includes('học giả') || r.includes('admin') || r.includes('author') || u) {
        setCanEdit(true);
      }
    }
  }, []);

  if (!canEdit || !articleId) return null;

  return (
    <Link
      href={`/dang-bai?edit=${articleId}`}
      className="fixed bottom-20 right-6 z-40 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full shadow-2xl transition-all flex items-center gap-2 border border-amber-300/40 hover:scale-110 cursor-pointer backdrop-blur-md"
      title="Chỉnh sửa bài viết trực tiếp bằng Elementor Block Editor"
    >
      <Edit3 className="w-4 h-4" />
      <span className="text-xs">Chỉnh Sửa Bài Viết</span>
    </Link>
  );
}
