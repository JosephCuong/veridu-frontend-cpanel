'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Lock,
  LogIn,
  Mic2,
  Music,
  Play,
  Cross,
  User,
  PlayCircle,
  Loader2,
  ChevronRight,
  ScrollText,
} from 'lucide-react';
import {
  SEASON_ACCENT_MAP,
  SacredMusicItem,
  getYoutubeEmbedUrl,
} from '@/lib/sacredMusic';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { VeriduCrossIcon, VeriduLyreIcon } from '@/components/icons/VeriduIcons';
import VeriduPlaceholder from '@/components/VeriduPlaceholder';

interface RelatedPostSummary {
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
}

interface SacredMusicDetailClientProps {
  item: SacredMusicItem;
  relatedPost: RelatedPostSummary | null;
  relatedHymns: SacredMusicItem[];
}

export default function SacredMusicDetailClient({
  item,
  relatedPost,
  relatedHymns,
}: SacredMusicDetailClientProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [pendingAction, setPendingAction] = useState<'download' | 'preview' | null>(null);

  const [activeVideoTab, setActiveVideoTab] = useState<'main' | 'karaoke'>('main');
  const [pdfLoading, setPdfLoading] = useState<'download' | 'preview' | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadsCount, setDownloadsCount] = useState<number>(item.downloads || 0);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    const onUserUpdate = (e: Event) => {
      const custom = e as CustomEvent<UserProfile | null>;
      setUser(custom.detail ?? getStoredUser());
    };
    window.addEventListener('veridu_user_updated', onUserUpdate);
    return () => window.removeEventListener('veridu_user_updated', onUserUpdate);
  }, []);

  const mainEmbedUrl = getYoutubeEmbedUrl(item.youtube_url);
  const karaokeEmbedUrl = getYoutubeEmbedUrl(item.karaoke_youtube_url);
  const hasSeparateKaraoke =
    Boolean(karaokeEmbedUrl) && karaokeEmbedUrl !== mainEmbedUrl;

  const currentEmbedUrl =
    activeVideoTab === 'karaoke' && karaokeEmbedUrl ? karaokeEmbedUrl : mainEmbedUrl;

  const seasonStyle =
    SEASON_ACCENT_MAP[item.liturgical_season] || SEASON_ACCENT_MAP['Thường Niên'];

  const requestPdfAccess = async (mode: 'download' | 'preview', skipClientUserCheck = false) => {
    setPdfError('');

    if (!skipClientUserCheck && !user) {
      setPendingAction(mode);
      setAuthNotice(
        'Vui lòng đăng nhập hoặc tạo tài khoản VERIDU miễn phí để tải về và xem trước bản nhạc PDF.'
      );
      setIsAuthOpen(true);
      return;
    }

    setPdfLoading(mode);
    try {
      const res = await fetch(
        `/api/sacred-music/download/${encodeURIComponent(item.slug)}?mode=${mode}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || data?.requiresAuth) {
        setPendingAction(mode);
        setAuthNotice(
          data?.error ||
            'Phiên đăng nhập chưa hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập tài khoản VERIDU để tải bản nhạc PDF.'
        );
        setIsAuthOpen(true);
        return;
      }

      if (!res.ok || !data?.success) {
        setPdfError(data?.error || 'Không thể mở bản nhạc PDF lúc này. Vui lòng thử lại sau.');
        return;
      }

      if (mode === 'preview') {
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        } else if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        if (typeof data.downloads === 'number') {
          setDownloadsCount(data.downloads);
        } else {
          setDownloadsCount((c) => c + 1);
        }
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      setPdfError('Lỗi kết nối mạng khi yêu cầu tải bản nhạc PDF.');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleAuthSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setAuthNotice('');
    setIsAuthOpen(false);
    if (pendingAction) {
      const nextAction = pendingAction;
      setPendingAction(null);
      // Slight delay to ensure cookie/session is settled
      setTimeout(() => {
        requestPdfAccess(nextAction, true);
      }, 250);
    }
  };

  const handleCopyLyrics = async () => {
    if (!item.lyrics) return;
    try {
      await navigator.clipboard.writeText(item.lyrics);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2200);
    } catch {
      // Fallback ignored
    }
  };

  const scriptureHref =
    item.scripture_book_slug && item.scripture_chapter
      ? `/kinh-thanh/${item.scripture_book_slug}/${item.scripture_chapter}`
      : item.psalm_number
      ? `/kinh-thanh/thanh-vinh/${item.psalm_number}`
      : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-[98px] sm:pt-[106px] pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[var(--border-card)] bg-[var(--bg-card)]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/thanh-nhac"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thư Viện Thánh Nhạc</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${seasonStyle.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${seasonStyle.dot}`} />
              {item.liturgical_season}
            </span>
            <span className="px-2.5 py-1 rounded-full font-semibold bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)]">
              {item.mass_part}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT MAIN COLUMN (8 cols) ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Title */}
            <header className="space-y-3">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-main)] leading-tight">
                {item.title}
              </h1>
              {item.title_en && (
                <p className="font-serif italic text-sm sm:text-base text-[var(--text-muted)]">
                  {item.title_en}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[var(--text-muted)] pt-1">
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-main)]">
                  <User className="w-4 h-4 text-amber-500" />
                  Nhạc sĩ: {item.composer}
                </span>
                {item.musical_key && (
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-xs">
                    Tone: {item.musical_key}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {item.views} lượt xem
                </span>
                {item.has_pdf && (
                  <span className="inline-flex items-center gap-1">
                    <Download className="w-4 h-4" /> {downloadsCount} lượt tải PDF
                  </span>
                )}
              </div>
            </header>

            {/* YouTube / Audio Player Card */}
            {(currentEmbedUrl || item.audio_url) && (
              <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md">
                {hasSeparateKaraoke && (
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-card)] bg-[var(--bg-main)]/50">
                    <button
                      type="button"
                      onClick={() => setActiveVideoTab('main')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeVideoTab === 'main'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Bản Hát Mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveVideoTab('karaoke')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeVideoTab === 'karaoke'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Mic2 className="w-3.5 h-3.5" />
                      Karaoke / Đệm Đàn
                    </button>
                  </div>
                )}

                {currentEmbedUrl && (
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={currentEmbedUrl}
                      title={item.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {item.audio_url && (
                  <div className="p-4 border-t border-[var(--border-card)] bg-[var(--bg-main)]/40">
                    <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-500" />
                      Bản Thu Âm MP3 / Audio
                    </div>
                    <audio controls className="w-full" src={item.audio_url} />
                  </div>
                )}

                {item.youtube_url && (
                  <div className="px-4 py-3 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[var(--text-muted)]">
                      Phát trực tiếp từ kênh Thánh Nhạc VERIDU trên YouTube
                    </span>
                    <a
                      href={item.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Mở trên YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ── LOGIN-GATED SHEET MUSIC PDF CARD ── */}
            {item.has_pdf && (
              <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-amber-500/[0.09] via-[var(--bg-card)] to-[var(--bg-card)] border border-amber-500/35 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      {user ? <FileText className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-lg font-bold text-[var(--text-main)]">
                          Bản Nhạc Sheet PDF Chuẩn Phụng Vụ
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {user ? 'Đã mở khóa' : 'Dành cho thành viên'}
                        </span>
                      </div>

                      {user ? (
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                          Xin chào <strong className="text-[var(--text-main)]">{user.displayName || user.email}</strong>! Bạn có thể xem trực tiếp hoặc tải về bản nhạc PDF chất lượng cao để phục vụ ca đoàn.
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                          Bản nhạc PDF chất lượng cao được chia sẻ hoàn toàn miễn phí cho thành viên
                          VERIDU. <strong className="text-[var(--text-main)]">Mời bạn đăng nhập hoặc đăng ký tài khoản</strong> để xem trước và tải sheet nhạc về máy.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {authNotice && !user && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    {authNotice}
                  </div>
                )}

                {pdfError && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-700 dark:text-rose-300 font-medium">
                    {pdfError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {user ? (
                    <>
                      <button
                        type="button"
                        disabled={pdfLoading !== null}
                        onClick={() => requestPdfAccess('download')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md transition"
                      >
                        {pdfLoading === 'download' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Tải Bản Nhạc PDF</span>
                      </button>

                      <button
                        type="button"
                        disabled={pdfLoading !== null}
                        onClick={() => {
                          if (previewUrl) {
                            setPreviewUrl(null);
                          } else {
                            requestPdfAccess('preview');
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-main)] hover:border-amber-500/60 border border-[var(--border-card)] text-[var(--text-main)] font-semibold text-xs sm:text-sm transition"
                      >
                        {pdfLoading === 'preview' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{previewUrl ? 'Ẩn Xem Trước PDF' : 'Xem Trước PDF Trực Tiếp'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => requestPdfAccess('download')}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập / Đăng Ký Để Tải PDF</span>
                    </button>
                  )}
                </div>

                {/* Embedded PDF Preview (Only loaded after authenticated API returns previewUrl) */}
                {previewUrl && user && (
                  <div className="pt-3 border-t border-[var(--border-card)] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-main)]">
                        Xem trước trực tuyến bản nhạc PDF
                      </span>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-medium"
                      >
                        Mở toàn màn hình <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="w-full h-[540px] sm:h-[680px] rounded-xl overflow-hidden border border-[var(--border-card)] bg-stone-900">
                      <iframe
                        src={previewUrl}
                        title={`Xem trước bản nhạc ${item.title}`}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description / Liturgical Notes */}
            {item.description && (
              <div className="rounded-2xl p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                <h2 className="font-serif text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                  <VeriduCrossIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Giới Thiệu &amp; Ghi Chú Phụng Vụ</span>
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            )}

            {/* Lyrics Card */}
            {item.lyrics && (
              <div className="rounded-2xl p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-serif text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-amber-500" />
                    <span>Lời Ca / Bản Văn Đáp Ca</span>
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyLyrics}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                  >
                    {copiedLyrics ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép lời</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif text-sm sm:text-base leading-relaxed whitespace-pre-line text-[var(--text-main)]">
                  {item.lyrics}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR (4 cols) ── */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Liturgical Metadata Box */}
            <div className="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
              <h3 className="font-serif text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                <VeriduLyreIcon className="w-4 h-4 text-amber-500" />
                <span>Thông Tin Tác Phẩm</span>
              </h3>
              <dl className="divide-y divide-[var(--border-card)] text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Tác giả / Nhạc sĩ</dt>
                  <dd className="font-semibold text-right text-[var(--text-main)]">
                    {item.composer}
                  </dd>
                </div>
                {item.lyricist && (
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--text-muted)]">Lời ca</dt>
                    <dd className="font-semibold text-right text-[var(--text-main)]">
                      {item.lyricist}
                    </dd>
                  </div>
                )}
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Mùa Phụng Vụ</dt>
                  <dd className="font-semibold text-right text-[var(--text-main)]">
                    {item.liturgical_season}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Phần Lễ</dt>
                  <dd className="font-semibold text-right text-[var(--text-main)]">
                    {item.mass_part}
                  </dd>
                </div>
                {item.liturgical_year && (
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--text-muted)]">Năm Phụng Vụ</dt>
                    <dd className="font-semibold text-right text-[var(--text-main)]">
                      {item.liturgical_year}
                    </dd>
                  </div>
                )}
                {item.musical_key && (
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--text-muted)]">Giọng / Tone</dt>
                    <dd className="font-mono font-semibold text-right text-[var(--text-main)]">
                      {item.musical_key}
                    </dd>
                  </div>
                )}
                {item.voicing && (
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-[var(--text-muted)]">Bè / Trình bày</dt>
                    <dd className="font-semibold text-right text-[var(--text-main)]">
                      {item.voicing}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Scripture Cross-Link Card */}
            {scriptureHref && (
              <Link
                href={scriptureHref}
                className="block rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 to-[var(--bg-card)] border border-amber-500/30 hover:border-amber-500/60 transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Kinh Thánh Liên Kết</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-serif font-bold text-base text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  {item.scripture_ref || `Thánh Vịnh ${item.psalm_number}`}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Đọc trọn vẹn bản văn Kinh Thánh gốc kèm chú giải ngay trên VERIDU.
                </p>
              </Link>
            )}

            {/* Related Theological Article Card */}
            {relatedPost && (
              <Link
                href={`/${relatedPost.slug}`}
                className="block rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 transition group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Bài Viết Suy Niệm Cùng Chủ Đề
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 transition" />
                </div>
                <div className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">
                  {relatedPost.title}
                </div>
                {relatedPost.excerpt && (
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                )}
              </Link>
            )}

            {/* Related Hymns */}
            {relatedHymns.length > 0 && (
              <div className="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
                <h3 className="font-serif text-base font-bold text-[var(--text-main)]">
                  Thánh Ca Liên Quan
                </h3>
                <div className="space-y-3">
                  {relatedHymns.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/thanh-nhac/${rel.slug}`}
                      className="flex items-start gap-3 p-2.5 -mx-2 rounded-xl hover:bg-[var(--bg-main)] transition group"
                    >
                      <div className="w-16 h-11 rounded-lg overflow-hidden bg-stone-900 shrink-0 flex items-center justify-center">
                        {rel.thumbnail_url ? (
                          <img
                            src={rel.thumbnail_url}
                            alt={rel.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <VeriduPlaceholder variant="music" alt={rel.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-semibold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2 leading-snug">
                          {rel.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {rel.composer} • {rel.mass_part}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* In-place Auth Modal for PDF Download / Preview */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
