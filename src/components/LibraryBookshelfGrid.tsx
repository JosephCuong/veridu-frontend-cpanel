'use client';

import React from 'react';
import Link from 'next/link';
import { LibraryItem } from '@/lib/api';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  Zap,
  Clock,
  Presentation
} from 'lucide-react';

interface LibraryBookshelfGridProps {
  items: LibraryItem[];
  itemType: 'book' | 'document';
  onDownload: (item: LibraryItem) => void;
  downloadingSlug: string | null;
}

export default function LibraryBookshelfGrid({
  items,
  itemType,
  onDownload,
  downloadingSlug
}: LibraryBookshelfGridProps) {
  if (items.length === 0) return null;

  // Chunk items into rows of 4 (for desktop shelf visual grouping)
  const chunkSize = 4;
  const rows: LibraryItem[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    rows.push(items.slice(i, i + chunkSize));
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="relative">
          
          {/* ── 3D BOOKS ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-4 relative z-10">
            {row.map((item) => {
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
                  className="flex flex-col items-center group perspective-1000"
                >
                  
                  {/* 3D Realistic Book Model */}
                  <div className="relative w-full max-w-[240px] transition-all duration-300 transform group-hover:-translate-y-3 group-hover:scale-105">
                    
                    {/* Main Book Body (Cover & Spine) */}
                    <div className={`w-full ${isPresentation ? 'h-48' : 'h-72 sm:h-80'} rounded-r-2xl rounded-l-md bg-gradient-to-br ${item.cover_bg_gradient || 'from-amber-700 to-slate-950'} p-4 sm:p-5 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-y border-r border-white/20 border-l-4 border-l-black/70 relative overflow-hidden transition-all duration-300`}>
                      
                      {/* Spine Crease Shadow */}
                      <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none"></div>

                      {/* Right Edge Page Texture (Pages thickness) */}
                      <div className="absolute top-1 bottom-1 right-0 w-1 bg-gradient-to-b from-amber-100/40 via-amber-200/20 to-amber-100/40 rounded-r pointer-events-none"></div>

                      {/* Ambient Stained-Glass Reflection */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

                      {/* Top Header on Book */}
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/50 text-amber-300 font-mono border border-white/10 backdrop-blur-sm">
                            {item.format}
                          </span>
                          {item.pages_count > 0 && (
                            <span className="text-[10px] text-white/70 font-mono">
                              {item.pages_count}p
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Author on Book */}
                      <div className="space-y-1.5 relative z-10">
                        <span className="text-[10px] sm:text-[11px] text-amber-200/90 font-serif italic block truncate drop-shadow">
                          {item.author}
                        </span>
                        <h3 className="font-serif font-black text-sm sm:text-base text-white leading-snug drop-shadow-md line-clamp-3">
                          {item.title}
                        </h3>
                      </div>

                      {/* Bottom Spine Badge */}
                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/60 font-mono relative z-10">
                        <span className="truncate">{item.category}</span>
                        <span>{item.file_size_label}</span>
                      </div>

                      {/* ── HOVER ACTION OVERLAY ── */}
                      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col justify-between items-center z-20 text-center rounded-r-2xl rounded-l-md">
                        
                        <div className="space-y-1 pt-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 font-mono block">
                            {item.category}
                          </span>
                          <h4 className="font-serif font-bold text-xs text-white line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-white/60 font-serif italic line-clamp-2 pt-1">
                            &ldquo;{item.description}&rdquo;
                          </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="w-full space-y-2">
                          
                          {/* Quick Read (Instant Reader) */}
                          <Link
                            href={readUrl}
                            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                          >
                            {isPresentation ? (
                              <>
                                <Presentation className="w-3.5 h-3.5" />
                                <span>Chiếu Slide 16:9</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>Đọc Nhanh (A4)</span>
                              </>
                            )}
                          </Link>

                          {/* View Detail Profile */}
                          <Link
                            href={detailUrl}
                            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition border border-white/10"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Xem Giới Thiệu</span>
                          </Link>

                        </div>

                      </div>

                    </div>

                    {/* Realistic 3D Bottom Book Shadow on Shelf */}
                    <div className="w-4/5 mx-auto h-3 bg-black/60 blur-md rounded-full mt-1 transform group-hover:scale-110 transition-transform"></div>

                  </div>

                  {/* Book Metadata Below Shelf */}
                  <div className="w-full max-w-[240px] pt-3 text-center space-y-1">
                    <Link
                      href={detailUrl}
                      className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] hover:text-amber-500 transition line-clamp-1 block"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                    <p className="text-[11px] text-[var(--text-muted)] font-serif italic truncate">
                      {item.author}
                    </p>
                    
                    <div className="flex items-center justify-center gap-3 text-[10px] text-[var(--text-muted)] pt-0.5">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-amber-500/70" /> {item.view_count}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-amber-500/70" /> {item.download_count}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* ── 3D WOODEN / GLASS VATICAN SHELF RACK ── */}
          <div className="w-full h-5 rounded-md bg-gradient-to-b from-amber-900/60 via-amber-950/80 to-black border-t-2 border-amber-500/40 shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative -mt-3 sm:-mt-4">
            {/* Stained Glass Golden Edge */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"></div>
            {/* Shelf Depth Side Bevel */}
            <div className="absolute -bottom-2 left-0 right-0 h-2 bg-black/80 rounded-b-md shadow-inner"></div>
          </div>

        </div>
      ))}
    </div>
  );
}
