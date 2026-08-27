import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { resolveMediaUrl } from '@/lib/driveHelper';
import { DEFAULT_STORYBOOKS } from '@/lib/storybooksData';
import { 
  BookOpen, 
  Volume2, 
  Award, 
  Moon, 
  ArrowRight,
  Tv
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Sách Tranh Kinh Thánh Thiếu Nhi & Gia Đình | VERIDU',
  description: 'Kho sách tranh Kinh Thánh nghệ thuật tương tác dành cho thiếu nhi, giáo lý viên và gia đình. Tích hợp giọng đọc truyền cảm, nhạc nền du dương, lật sách 3D và câu đố đức tin vui nhộn.'
};

export default async function StorybooksLibraryPage() {
  let storybooks = DEFAULT_STORYBOOKS;

  try {
    const { data: dbBooks } = await supabase
      .from('storybooks')
      .select('*')
      .order('id', { ascending: true });

    if (dbBooks && dbBooks.length > 0) {
      storybooks = dbBooks;
    }
  } catch (e) {}

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* ── 1. KIDS SACRED HERO BANNER ── */}
      <section className="relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.03] to-[var(--bg-main)] dark:from-stone-950 dark:via-stone-900 dark:to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          
          

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] tracking-tight leading-tight">
            Chuyện Kinh Thánh{' '}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              Qua Tranh Vẽ Nghệ Thuật
            </span>
          </h1>

          <p className="text-slate-600 dark:text-stone-300 text-xs sm:text-base max-w-3xl mx-auto leading-relaxed font-serif italic">
            Mở ra thế giới Lời Chúa sống động và ngọt ngào qua từng trang sách tranh 3D lật trang chân thực, tích hợp giọng đọc truyền cảm, nhạc nền thánh thiêng và câu đố vui đức tin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-serif">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-amber-700 dark:text-amber-300">
              <Volume2 className="w-3.5 h-3.5 text-amber-500" /> Giọng Đọc Diễn Cảm (Listen)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-amber-700 dark:text-amber-300">
              <Moon className="w-3.5 h-3.5 text-indigo-500" /> Chế Độ Ru Ngủ (Bedtime Mode)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-amber-700 dark:text-amber-300">
              <Award className="w-3.5 h-3.5 text-emerald-500" /> Mini-Quiz &amp; Nhận Huy Hiệu
            </span>
          </div>

        </div>
      </section>

      {/* ── 2. STORYBOOKS GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Bộ Sưu Tập Truyện Tranh
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Danh Mục Sách Tranh Nổi Bật
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-serif text-[var(--text-muted)]">
              {storybooks.length} tác phẩm tuyển chọn
            </span>
            <Link
              href="/sach-tranh/studio"
              className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-xs font-serif font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Mở Studio Soạn Thảo & Đăng Tải Sách Tranh"
            >
              <span>Quản Trị Studio</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {storybooks.map((book) => (
            <div
              key={book.id}
              className="group rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-card)] hover:border-amber-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              <Link href={`/sach-tranh/${book.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900 block">
                <Image
                  src={resolveMediaUrl(book.cover_image || '/storybooks/cong-trinh-sang-tao/page_1.png', 'image')}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Audio
                  </span>
                  {(book.youtube_video_id || book.youtube_url) && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-600/80 backdrop-blur-md text-white border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                      <Tv className="w-3 h-3" /> Video
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" /> Quiz
                  </span>
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] shadow-md">
                    {book.target_age || '4-10 tuổi'}
                  </span>
                </div>
              </Link>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-serif">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                      {book.testament === 'old_testament' ? 'Cựu Ước' : 'Tân Ước'}
                    </span>
                    <span>• {book.total_pages || 10} trang tranh</span>
                    <span>• ~5 phút đọc</span>
                  </div>

                  <Link href={`/sach-tranh/${book.slug}`}>
                    <h3 className="font-serif font-black text-lg text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[var(--text-muted)] font-serif line-clamp-2 leading-relaxed">
                    {book.description || book.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between">
                  <span className="text-[11px] font-serif text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +50 Faith XP
                  </span>

                  <Link
                    href={`/sach-tranh/${book.slug}`}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all group-hover:scale-105"
                  >
                    <span>Đọc Ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
