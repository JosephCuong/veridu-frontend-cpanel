import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Download,
  FileArchive,
  BookOpen,
  ShieldCheck,
  WifiOff,
  Cloud,
  Layers,
  Calendar,
  Sparkles,
  FileText,
  CheckCircle,
  Monitor,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import AppShowcaseGallery from '@/components/AppShowcaseGallery';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Tải Ứng Dụng VERIDU cho Windows | Nghiên Cứu Kinh Thánh Đa Khung',
  description:
    'Tải miễn phí phần mềm VERIDU v1.1.0 cho Windows 64-bit: trọn bộ 73 sách Kinh Thánh 2 bản dịch CGKPV & Lm. Nguyễn Thế Thuấn, đọc đa khung song song, Lịch Phụng Vụ Offline, Passage Guide và Sách Giáo Lý Hội Thánh Công Giáo.',
  openGraph: {
    title: 'VERIDU cho Windows — Phần Mềm Nghiên Cứu Kinh Thánh Công Giáo',
    description:
      'Đọc Kinh Thánh đa khung 2 bản dịch, Lịch Phụng Vụ ngoại tuyến, Sổ Tay học hỏi và Thư Viện Giáo Lý Hội Thánh Công Giáo.',
    images: ['/images/app-v1/banner.webp'],
  },
};

function isLiveDownloadUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  const normalized = trimmed.replace(/\/+$/, '').toLowerCase();
  if (
    normalized === 'https://www.cruxveritatis.org' ||
    normalized === 'https://cruxveritatis.org' ||
    normalized === 'https://www.cruxveritatis.org/ung-dung' ||
    normalized === 'https://cruxveritatis.org/ung-dung'
  ) {
    return false;
  }
  return true;
}

export default async function DesktopAppDownloadPage() {
  let latestRelease: any = null;
  let publishedResources: any[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const [{ data: rel }, { data: resList }] = await Promise.all([
      supabase
        .from('desktop_releases')
        .select('version, release_notes, setup_url, portable_url, sha256, published_at')
        .eq('is_latest', true)
        .maybeSingle(),
      supabase
        .from('desktop_resources')
        .select('pack_id, title, subtitle, version, item_count, file_size_bytes, access_tier')
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
    ]);
    latestRelease = rel;
    publishedResources = resList || [];
  } catch (e) {
    console.warn('Could not fetch desktop_releases:', e);
  }

  const version = latestRelease?.version || '1.1.0';
  const setupUrl = latestRelease?.setup_url || '';
  const portableUrl = latestRelease?.portable_url || '';
  const sha256 =
    latestRelease?.sha256 || '58b27a7d1a97ef70523c3a94c373c4240a12612f99a726f764f3d951cdc67016';
  const releaseNotes =
    latestRelease?.release_notes ||
    'Phiên bản phát hành đầu tiên VERIDU v1.1.0 (Windows 64-bit): trọn bộ 73 sách Kinh Thánh 2 bản dịch CGKPV & Lm. Nguyễn Thế Thuấn, không gian đọc đa khung (1/2/3 khung + Link Sets A/B/C), 3 nền Sáng / Giấy Ngà / Tối, Lịch Phụng Vụ trọn văn Bài Đọc Offline, Passage Guide, Sổ Tay sao lưu/xuất file và Thư Viện Giáo Lý.';

  const hasLiveSetup = isLiveDownloadUrl(setupUrl);
  const hasLivePortable = isLiveDownloadUrl(portableUrl);

  const features = [
    {
      icon: Layers,
      title: 'Đọc Đa Khung & Đối Chiếu Song Song',
      desc: 'Mở 1, 2 hoặc 3 khung cùng lúc với Link Sets A/B/C đồng bộ cuộn giữa bản dịch CGKPV, Lm. Nguyễn Thế Thuấn, Sổ Tay và Giáo Lý.',
    },
    {
      icon: BookOpen,
      title: 'Trọn Bộ 73 Sách Kinh Thánh Công Giáo',
      desc: 'Bảng lưới chọn nhanh 46 sách Cựu Ước & 27 sách Tân Ước, chọn dải nhiều câu (Shift+Click), tô sáng và tìm kiếm đa từ tức thì.',
    },
    {
      icon: Calendar,
      title: 'Lịch Phụng Vụ Đọc Trọn Văn Offline',
      desc: 'Hiển thị Bài Đọc I, Đáp Ca, Bài Đọc II, Tin Mừng và Lễ Trong/Lễ Kính hằng ngày hoàn toàn không cần kết nối mạng.',
    },
    {
      icon: Sparkles,
      title: 'Khám Phá Câu & Thiệp Lời Chúa',
      desc: 'Tính năng Passage Guide liên kết chéo câu Kinh Thánh với số Giáo Lý, ghi chú cá nhân và xuất ảnh Thiệp Lời Chúa trang nhã.',
    },
    {
      icon: ShieldCheck,
      title: '3 Chế Độ Nền & Tối Ưu Thị Giác',
      desc: 'Chuyển mượt giữa Nền Sáng, Giấy Ngà (Sepia) và Nền Tối; tùy chỉnh cỡ chữ, giãn dòng và tự nhớ bố cục cửa sổ.',
    },
    {
      icon: Cloud,
      title: 'Kho Giáo Lý & Video VERIDU',
      desc: 'Đăng nhập bằng tài khoản CruxVeritatis để tải Sách Giáo Lý Hội Thánh Công Giáo (2.865 số) và xem video học thuật trực tiếp.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 md:pt-28 pb-24">
      {/* ── HERO SECTION ── */}
      <section className="relative border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-serif font-bold tracking-wide">
              <Monitor className="w-3.5 h-3.5" />
              <span>VERIDU cho Windows 10 / 11 (64-bit) · Phiên bản v{version}</span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight">
              Không Gian Nghiên Cứu Kinh Thánh Công Giáo Trên Máy Tính
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif leading-relaxed">
              Thiết kế tinh gọn, đọc Kinh Thánh đa khung 2 bản dịch, tra cứu Lịch Phụng Vụ trọn văn hoàn toàn <strong>Ngoại Tuyến (Offline)</strong> và đồng bộ Thư Viện Giáo Lý khi kết nối tài khoản VERIDU.
            </p>

            {/* Download CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {hasLiveSetup ? (
                <a
                  href={setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-serif font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Bộ Cài Đặt Windows (.exe · 44 MB)</span>
                </a>
              ) : (
                <div className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Bộ cài v{version} (.exe) đang hoàn tất liên kết tải</span>
                </div>
              )}

              {hasLivePortable && (
                <a
                  href={portableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:border-amber-500 border border-[var(--border-card)] text-[var(--text-main)] font-serif font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <FileArchive className="w-4 h-4 text-amber-500" />
                  <span>Bản Portable Không Cần Cài (.zip · 47 MB)</span>
                </a>
              )}

              <a
                href="/docs/HUONG_DAN_SU_DUNG_VERIDU_v1.1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:border-amber-500 border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Sổ Tay Hướng Dẫn (PDF)</span>
              </a>
            </div>

            {(!hasLiveSetup || !hasLivePortable) && (
              <p className="text-xs font-serif text-[var(--text-muted)]">
                Quản trị viên có thể gắn trực tiếp link Google Drive cho bộ cài trong mục{' '}
                <Link href="/admin" className="text-amber-600 dark:text-amber-400 underline font-bold">
                  Bảng Quản Trị → App VERIDU
                </Link>
                .
              </p>
            )}

            {/* Release Specs Pill Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-[11px] font-serif text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Miễn phí 100%
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Đã ký số Authenticode
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Không quảng cáo · Chạy Offline
              </span>
            </div>
          </div>

          {/* Interactive Screenshot Gallery */}
          <AppShowcaseGallery />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-16">
        {/* ── KEY FEATURES GRID ── */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Tính Năng Nổi Bật Trên VERIDU v{version}
            </h2>
            <p className="text-xs sm:text-sm font-serif text-[var(--text-muted)]">
              Được tinh chỉnh dành riêng cho việc đọc, suy niệm, soạn bài chia sẻ và nghiên cứu Thánh Kinh hằng ngày.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-md transition space-y-3"
                >
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[var(--text-main)]">{f.title}</h3>
                  <p className="text-xs sm:text-sm font-serif text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── OFFLINE VS ONLINE COMPARISON ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-[var(--text-main)]">Dùng Hoàn Toàn Ngoại Tuyến (Offline)</h3>
                <p className="text-xs font-serif text-[var(--text-muted)]">Không cần Internet · Không bắt buộc đăng nhập</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm font-serif text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Đọc trọn bộ 73 sách Kinh Thánh 2 bản dịch (CGKPV &amp; Lm. Nguyễn Thế Thuấn) đa khung song song.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Xem Lịch Phụng Vụ &amp; đọc trọn văn các Bài Đọc hằng ngày mọi lúc mọi nơi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Tìm kiếm toàn văn, tô sáng, viết Sổ Tay, sao lưu/khôi phục dữ liệu cục bộ và tạo Thiệp Lời Chúa.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Các gói Giáo Lý đã tải về máy tiếp tục đọc ngoại tuyến bình thường sau khi ngắt mạng.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-[var(--text-main)]">Khi Kết Nối Tài Khoản VERIDU (Online)</h3>
                <p className="text-xs font-serif text-[var(--text-muted)]">Dùng chung tài khoản với website cruxveritatis.org</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm font-serif text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Tải và mở khóa Sách Giáo Lý Hội Thánh Công Giáo (2.865 số) cùng các gói tài liệu mở rộng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Xem trực tiếp bài giảng &amp; video từ kênh YouTube VERIDU ngay trong ứng dụng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>Tự động nhận thông báo khi có phiên bản VERIDU mới và quản lý máy tính gắn kết tại trang <Link href="/ho-so?tab=desktop" className="text-amber-600 dark:text-amber-400 underline font-bold">Hồ Sơ</Link>.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── SMARTSCREEN & SHA-256 TRUST SECTION ── */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-[var(--text-main)]">
                Hướng Dẫn Cài Đặt An Toàn &amp; Kiểm Tra Toàn Vẹn Tệp
              </h2>
              <p className="text-xs font-serif text-[var(--text-muted)]">
                Xử lý thông báo Windows SmartScreen cho ứng dụng mới phát hành
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm font-serif">
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1.5">
              <div className="font-bold text-amber-600 dark:text-amber-400">Bước 1 · Tải &amp; Mở Bộ Cài</div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Chạy tệp <code>VERIDU_v{version}_Setup_Win64.exe</code> (cài đặt đầy đủ có biểu tượng Desktop &amp; Start Menu) hoặc giải nén bản <code>Portable.zip</code> để chạy ngay không cần quyền quản trị.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1.5">
              <div className="font-bold text-amber-600 dark:text-amber-400">Bước 2 · Nếu Hiện Màn Hình Xanh Windows</div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Vì ứng dụng mới phát hành rộng rãi nên Windows Defender SmartScreen có thể hiển thị cảnh báo <em>&ldquo;Windows protected your PC&rdquo;</em>. Hãy nhấn <strong>More info</strong> (Thông tin thêm) → chọn <strong>Run anyway</strong> (Vẫn chạy).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1.5">
              <div className="font-bold text-amber-600 dark:text-amber-400">Bước 3 · Bảo Mật &amp; Toàn Vẹn SHA-256</div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Bạn có thể đối chiếu mã băm SHA-256 chính thức của bộ cài bên dưới bằng lệnh <code>certutil -hashfile</code> trên Windows để đảm bảo tệp không bị chỉnh sửa.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
              <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Mã SHA-256 chính thức (VERIDU_v{version}_Setup_Win64.exe):
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Windows 10 / 11 (x64) · WebView2 tích hợp sẵn</span>
            </div>
            <div className="font-mono text-[11px] sm:text-xs break-all p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-amber-700 dark:text-amber-300 select-all">
              {sha256}
            </div>
            <p className="text-xs font-serif text-[var(--text-muted)] pt-1 leading-relaxed">
              <strong className="text-[var(--text-main)]">Ghi chú phát hành v{version}:</strong> {releaseNotes}
            </p>
          </div>
        </section>

        {/* ── AVAILABLE DESKTOP RESOURCE PACKS ── */}
        {publishedResources.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-black text-xl text-[var(--text-main)]">
                Kho Tài Nguyên Tích Hợp Trong Ứng Dụng
              </h2>
              <Link
                href="/ho-so?tab=desktop"
                className="text-xs font-serif font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Quản lý thiết bị &amp; gói của tôi →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedResources.map((pack) => (
                <div
                  key={pack.pack_id}
                  className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
                      {pack.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-serif font-bold shrink-0">
                      {pack.access_tier === 'free' ? 'Miễn Phí' : 'Thành Viên'}
                    </span>
                  </div>
                  {pack.subtitle && (
                    <p className="text-xs font-serif text-[var(--text-muted)]">{pack.subtitle}</p>
                  )}
                  <div className="text-[11px] font-mono text-[var(--text-muted)] pt-1">
                    Phiên bản {pack.version} · {pack.item_count?.toLocaleString('vi-VN')} đề mục ·{' '}
                    {pack.file_size_bytes ? `${(pack.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
