import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCourses, getLibraryArticles, fetchCatechismParagraphs } from '@/lib/api';
import CatechismExplorer from '@/components/CatechismExplorer';
import { 
  BookOpen, Cross, Shield, Flame, Award, ChevronRight, Download, FileText, CheckCircle2, ArrowRight, Sun, Sparkles
} from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Giáo Lý Hội Thánh Công Giáo — Khảo Cứu & Học Hỏi Toàn Thư | VERIDU',
  description: 'Hệ thống khảo cứu Sách Giáo Lý Hội Thánh Công Giáo (CCC Toàn Thư 2865 số) với 4 Trụ Cột Đức Tin, 5 chế độ đọc, thẻ lật ôn tập và tra cứu số đoạn tức thì.',
};

export default async function GiaoLyLandingPage() {
  // Fetch 400 initial Catechism Paragraphs (Total count: 1836 in DB)
  const { data: catechismParagraphs, count: totalCount } = await fetchCatechismParagraphs(undefined, undefined, undefined, 500, 0);
  const allCourses = await fetchCourses();
  const allArticles = await getLibraryArticles();

  // Filter items relevant to "Giáo Lý"
  const giaoLyCourses = allCourses.filter(c => 
    c.category?.toLowerCase().includes('giáo lý') || 
    c.title?.toLowerCase().includes('giáo lý') ||
    c.description?.toLowerCase().includes('giáo lý')
  );

  const giaoLyArticles = allArticles.filter(a => 
    a.category?.toLowerCase().includes('giáo lý') || 
    a.title?.toLowerCase().includes('giáo lý') ||
    a.excerpt?.toLowerCase().includes('giáo lý') ||
    a.category?.toLowerCase().includes('thần học')
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* 1. SACRED HERO BANNER */}
      <section className="relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-stone-950 via-stone-900 to-[var(--bg-main)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-serif font-bold tracking-wider backdrop-blur-md shadow-lg">
            <Cross className="w-3.5 h-3.5 text-amber-400" />
            <span>KHO TÀNG ĐỨC TIN HỘI THÁNH CÔNG GIÁO</span>
            <Cross className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight drop-shadow-md">
            Giáo Lý Hội Thánh Công Giáo
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-serif italic">
            Hệ thống hóa toàn diện 4 Trụ Cột Đức Tin, Bản Toát Yếu (Compendium), các bài khảo cứu tín lý và đề thi giáo lý chuẩn mực phục vụ đời sống Kitô hữu.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a
              href="#khao-cuu-giao-ly"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-amber-500/20 hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khảo Cứu Sách Giáo Lý Ngay</span>
            </a>

            <Link
              href="/quiz"
              className="px-6 py-3 rounded-2xl bg-black/40 hover:bg-white/10 text-stone-200 font-serif font-bold text-xs border border-white/15 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Đấu Trường Giáo Lý</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE CATECHISM EXPLORER (5 CHẾ ĐỘ ĐỌC & GAME HÓA) */}
      <section id="khao-cuu-giao-ly" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-6 scroll-mt-24">
        <div className="border-b border-amber-500/20 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
              Hệ Thống Khảo Cứu Toàn Thư (CCC 1 - 2865)
            </h2>
          </div>
          <span className="text-xs font-serif font-bold text-[var(--text-muted)] hidden sm:block">
            Tòa Thánh Vatican Ban Hành
          </span>
        </div>

        {/* Client Interactive Catechism Explorer */}
        <CatechismExplorer 
          initialParagraphs={catechismParagraphs} 
          totalCount={totalCount} 
        />
      </section>


      {/* 3. CÁC KHÓA HỌC GIÁO LÝ NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex justify-between items-end border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Đào Tạo &amp; Lớp Học
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Các Khóa Học Giáo Lý
            </h2>
          </div>
          <Link href="/khoa-hoc" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(giaoLyCourses.length > 0 ? giaoLyCourses : allCourses.slice(0, 3)).map((course) => (
            <div key={course.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="relative w-full aspect-video">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {course.category}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{course.description}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link 
                  href={`/khoa-hoc/${course.slug}`}
                  className="w-full py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Bắt Đầu Học</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BÀI VIẾT GIẢI THÍCH & SUY NIỆM GIÁO LÝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex justify-between items-end border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Khảo Luận &amp; Tín Lý
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Bài Viết &amp; Suy Niệm Giáo Lý
            </h2>
          </div>
          <Link href="/thu-vien" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            Xem toàn bộ bài viết &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(giaoLyArticles.length > 0 ? giaoLyArticles : allArticles.slice(0, 3)).map((article) => (
            <Link 
              key={article.id} 
              href={`/thu-vien/${article.slug}`}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {article.category || 'Giáo Lý'}
                </span>
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug group-hover:text-amber-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                  {article.excerpt || 'Đọc chi tiết bài viết giải thích và đào sâu giáo huấn Hội Thánh...'}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                <span>Đọc bài viết</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CTA BANNER ĐẤU TRƯỜNG GIÁO LÝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-rose-500/20 border border-amber-500/30 rounded-3xl p-8 sm:p-12 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
              Đấu Trường Tri Thức
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-main)]">
              Thử Thách Kiến Thức Giáo Lý
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Cùng tham gia các kỳ thi giáo lý trực tuyến, tích lũy điểm thưởng và vinh danh trên bảng vàng hiệp thông đức tin cùng cộng đoàn khắp nơi.
            </p>
          </div>

          <Link
            href="/quiz"
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 transition-all shadow-xl shadow-amber-500/30 shrink-0 hover:scale-105"
          >
            <Award className="w-5 h-5" />
            <span>Vào Đấu Trường Ngay</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
