'use client';

import React from 'react';
import Link from 'next/link';
import { LibraryItem } from '@/lib/api';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Layers, 
  Clock, 
  Paperclip,
  ChevronRight,
  Loader2,
  Presentation
} from 'lucide-react';

interface LibraryEditorialListProps {
  items: LibraryItem[];
  itemType: 'book' | 'document';
  onDownload: (item: LibraryItem) => void;
  downloadingSlug: string | null;
}

export default function LibraryEditorialList({
  items,
  itemType,
  onDownload,
  downloadingSlug
}: LibraryEditorialListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const detailUrl = itemType === 'book' 
          ? `/thu-vien/sach/${item.slug}` 
          : `/thu-vien/tai-lieu/${item.slug}`;
        const readUrl = `/thu-vien/doc/${item.slug}`;

        const isPresentation = 
          item.format?.toLowerCase().includes('pptx') || 
          item.format?.toLowerCase().includes('slide') || 
          !!(item.google_slide_id && item.google_slide_id.length > 3);

        return (
          <div
            key={item.id}
            className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group transition-all duration-300"
          >
            
            {/* Left: 3D Mini Book Cover & Details */}
            <div className="flex items-start gap-5 flex-1 min-w-0">
              
              {/* Mini 3D Cover */}
              <Link
                href={detailUrl}
                className={`w-20 sm:w-24 ${isPresentation ? 'h-16 sm:h-20' : 'h-28 sm:h-32'} rounded-xl bg-gradient-to-br ${item.cover_bg_gradient || 'from-amber-700 to-slate-950'} p-2.5 flex flex-col justify-between shadow-md border border-white/20 shrink-0 transform group-hover:scale-105 transition-transform overflow-hidden relative`}
              >
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-black/40 pointer-events-none"></div>
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-black/50 text-amber-300 font-mono self-start border border-white/10">
                  {item.format}
                </span>
                <span className="font-serif font-black text-[10px] text-white line-clamp-2 leading-tight drop-shadow">
                  {item.title}
                </span>
              </Link>

              {/* Information Block */}
              <div className="space-y-2 min-w-0 flex-1">
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono font-semibold">
                    {item.file_size_label}
                  </span>
                  {item.pages_count > 0 && (
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      • {item.pages_count} trang / slide
                    </span>
                  )}
                  {item.attachments && item.attachments.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> {item.attachments.length} file đính kèm
                    </span>
                  )}
                </div>

                <Link href={detailUrl} className="block group/title">
                  <h3 className="font-serif font-black text-base sm:text-lg text-[var(--text-main)] group-hover/title:text-amber-500 transition leading-snug">
                    {item.title}
                  </h3>
                </Link>

                <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-2 italic leading-relaxed">
                  &ldquo;{item.description}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-muted)] pt-0.5">
                  <span className="font-serif italic">
                    Tác giả / Biên soạn: <strong className="text-[var(--text-main)]">{item.author}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-500" /> {item.view_count.toLocaleString()} xem
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-amber-500" /> {item.download_count.toLocaleString()} tải
                  </span>
                </div>

              </div>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border-card)]">
              
              {/* Quick Read / Present Shortcut */}
              <Link
                href={readUrl}
                className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20"
                title={isPresentation ? 'Trình chiếu slide 16:9' : 'Đọc lật trang A4'}
              >
                {isPresentation ? (
                  <>
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Chiếu Slide</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Đọc Sách</span>
                  </>
                )}
              </Link>

              {/* View Detail Profile */}
              <Link
                href={detailUrl}
                className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Chi Tiết</span>
              </Link>

              {/* Download */}
              <button
                type="button"
                onClick={() => onDownload(item)}
                disabled={downloadingSlug === item.slug}
                className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 text-[var(--text-main)] hover:text-amber-500 transition disabled:opacity-50"
                title="Tải về tác phẩm"
              >
                {downloadingSlug === item.slug ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                ) : (
                  <Download className="w-4 h-4 text-amber-500" />
                )}
              </button>

            </div>

          </div>
        );
      })}
    </div>
  );
}
