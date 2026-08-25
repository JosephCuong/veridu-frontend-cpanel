'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Download, 
  Play, 
  Pause, 
  RotateCw, 
  Paperclip, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Tv,
  Sparkles,
  Share2,
  Layers,
  X
} from 'lucide-react';
import { LibraryItem, checkUserDownloadQuota } from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';

interface SlidePresentationPlayerProps {
  item: LibraryItem;
  streamUrl: string;
}

export default function SlidePresentationPlayer({ item, streamUrl }: SlidePresentationPlayerProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAttachmentsDrawer, setShowAttachmentsDrawer] = useState(false);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);

  // Quota & Download
  const [quotaInfo, setQuotaInfo] = useState<{
    canDownload: boolean;
    remainingQuota: number;
    maxQuota: number;
    isUnlimited: boolean;
  }>({ canDownload: true, remainingQuota: 5, maxQuota: 5, isUnlimited: false });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored) {
      checkUserDownloadQuota(stored.id, stored.role).then(setQuotaInfo);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async (fileUrlOverride?: string, fileNameOverride?: string) => {
    setDownloadError('');
    setDownloadSuccess(false);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!quotaInfo.canDownload && !quotaInfo.isUnlimited) {
      setDownloadError('Bạn đã sử dụng hết 5 lượt tải miễn phí trong ngày.');
      return;
    }

    setIsDownloading(true);
    try {
      if (fileUrlOverride) {
        const link = document.createElement('a');
        link.href = fileUrlOverride;
        link.target = '_blank';
        link.download = fileNameOverride || `${item.slug}.pptx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadSuccess(true);
        return;
      }

      const res = await fetch(`/api/library/download/${item.slug}?userId=${user.id}&userRole=${encodeURIComponent(user.role || 'Học Viên')}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Lỗi khi tải tệp.');

      setDownloadSuccess(true);
      const newQuota = await checkUserDownloadQuota(user.id, user.role);
      setQuotaInfo(newQuota);

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.target = '_blank';
        link.download = result.fileName || `${item.slug}.pptx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Lỗi tải tệp slide.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Resolve presentation embed URL
  const getPresentationEmbedUrl = () => {
    // If Google Slide ID is specified
    if (item.google_slide_id && item.google_slide_id.length > 5 && !item.google_slide_id.startsWith('http')) {
      return `https://docs.google.com/presentation/d/${item.google_slide_id}/embed?start=false&loop=false&delayms=3000`;
    }

    // If Google Drive file ID
    if (item.drive_file_id && item.drive_file_id.length > 5 && !item.drive_file_id.startsWith('http')) {
      return `https://drive.google.com/file/d/${item.drive_file_id}/preview`;
    }

    // Default Stream URL
    if (streamUrl) {
      return streamUrl;
    }

    return `https://docs.google.com/viewer?url=${encodeURIComponent(item.file_url || '')}&embedded=true`;
  };

  const backLink = `/thu-vien/tai-lieu/${item.slug}`;

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-[#070a11] text-[#e2e8f0] flex flex-col justify-between select-none relative font-sans"
    >
      
      {/* ── TOP PRESENTATION BAR ── */}
      <header className="w-full z-30 px-4 py-3 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-white/10">
        
        {/* Back Link & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backLink}
            className="p-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition shrink-0 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Giới Thiệu Bài Giảng</span>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40">
                {item.format || 'PPTX SLIDE'}
              </span>
              <span className="text-xs text-white/50 hidden sm:inline">
                {item.pages_count > 0 ? `${item.pages_count} Slide` : 'Bài giảng điện tử'}
              </span>
            </div>
            <h1 className="font-serif font-black text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
              {item.title}
            </h1>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          
          {/* Attachments Drawer Button */}
          {item.attachments && item.attachments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAttachmentsDrawer(!showAttachmentsDrawer)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition"
              title="Tệp đính kèm bài giảng"
            >
              <Paperclip className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Tệp Đính Kèm ({item.attachments.length})</span>
            </button>
          )}

          {/* Fullscreen Mode */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title={isFullscreen ? 'Thu nhỏ (F)' : 'Toàn màn hình trình chiếu (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={() => handleDownload()}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-black text-xs flex items-center gap-1 hover:bg-amber-400 transition shadow-lg disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Tải File PPTX</span>
            {user && !quotaInfo.isUnlimited && (
              <span className="text-[10px] bg-slate-950/20 px-1 rounded font-mono">
                {quotaInfo.remainingQuota}/{quotaInfo.maxQuota}
              </span>
            )}
          </button>

        </div>

      </header>

      {/* Status Alerts */}
      {downloadSuccess && (
        <div className="bg-emerald-500 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Tệp trình chiếu đang được tải về thành công!
        </div>
      )}
      {downloadError && (
        <div className="bg-red-500 text-white font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {downloadError}
        </div>
      )}

      {/* ── 16:9 PRESENTATION SCREEN STAGE ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-6 flex flex-col items-center justify-center">
        
        {/* 16:9 Presentation Frame */}
        <div className="w-full aspect-video max-h-[82vh] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-2 border-amber-500/30 bg-black relative flex flex-col">
          
          <iframe
            src={getPresentationEmbedUrl()}
            title={item.title}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

        </div>

      </main>

      {/* ── BOTTOM PRESENTATION BAR ── */}
      <footer className="w-full z-30 px-4 sm:px-6 py-2.5 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between">
        
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Tv className="w-4 h-4 text-orange-400" />
          <span className="font-serif italic">{item.author}</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/thu-vien/tai-lieu/${item.slug}`}
            className="text-xs text-amber-400 hover:underline font-bold"
          >
            Xem Tóm Tắt &amp; Giáo Án Đầy Đủ &rarr;
          </Link>
        </div>

      </footer>

      {/* ── ATTACHMENTS DRAWER ── */}
      {showAttachmentsDrawer && item.attachments && (
        <aside className="fixed top-0 right-0 z-50 w-full sm:w-96 h-full bg-[#101726] border-l border-amber-500/30 shadow-2xl p-6 flex flex-col justify-between animate-slideLeft backdrop-blur-2xl text-white">
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-black text-lg text-white">Tệp Đính Kèm</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachmentsDrawer(false)}
                className="p-1.5 rounded-xl bg-white/10 text-white/60 hover:text-red-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 font-serif italic">
              Tải các tài liệu bổ trợ, phiếu bài tập hoặc slide PPTX gốc để phục vụ công tác giảng dạy:
            </p>

            <div className="space-y-2.5 pt-2">
              {item.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 flex items-center justify-between gap-3 transition group"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {att.file_type}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-white truncate group-hover:text-amber-400 transition">
                      {att.name}
                    </h4>
                    {att.size_label && (
                      <span className="text-[10px] text-white/40 block font-mono">{att.size_label}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(att.url, att.name)}
                    className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow shrink-0"
                    title={`Tải ${att.name}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

          <div className="pt-4 border-t border-white/10 text-center text-[11px] text-white/50 italic">
            Tài liệu mục vụ dành cho Giáo Lý Viên &amp; Huynh Trưởng VERIDU.
          </div>
        </aside>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            const u = getStoredUser();
            setUser(u);
            if (u) {
              checkUserDownloadQuota(u.id, u.role).then(setQuotaInfo);
            }
          }}
        />
      )}

    </div>
  );
}
