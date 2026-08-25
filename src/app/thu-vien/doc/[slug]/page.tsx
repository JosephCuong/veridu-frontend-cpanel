'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LibraryItem, fetchLibraryItemBySlug } from '@/lib/api';
import BookFlipReader from '@/components/BookFlipReader';
import { Loader2, AlertCircle } from 'lucide-react';

export default function DocumentDedicatedReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setIsLoading(true);
      const data = await fetchLibraryItemBySlug(slug);
      if (data) {
        setItem(data);
      }
      setIsLoading(false);
    }
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm text-amber-400/80 italic animate-pulse">
          Đang khởi tạo không gian đọc sách A4 Stained-Glass &amp; nạp tác phẩm...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-serif font-black text-2xl">Không Tìm Thấy Tác Phẩm</h1>
          <p className="text-sm text-slate-400">
            Tài liệu hoặc sách bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn mới.
          </p>
        </div>
        <Link
          href="/thu-vien/sach"
          className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
        >
          &larr; Về Tủ Sách Thư Viện
        </Link>
      </div>
    );
  }

  // Resolve optimized stream URL
  const getStreamUrl = () => {
    if (item.drive_file_id && item.drive_file_id.length > 5 && !item.drive_file_id.startsWith('http')) {
      return `/api/library/proxy-drive/${item.drive_file_id}`;
    }
    return item.file_url || '';
  };

  return <BookFlipReader item={item} streamUrl={getStreamUrl()} />;
}
