import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCourses, getLibraryArticles } from '@/lib/api';
import { 
  BookOpen, Cross, Shield, Flame, Award, ChevronRight, Download, FileText, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';

export const metadata = {
  title: 'Giáo Lý Hội Thánh Công Giáo — Học Hỏi & Nghiên Cứu | VERIDU',
  description: 'Trung tâm tổng hợp các khóa học, bài viết suy niệm, đề thi và tài liệu Giáo Lý Hội Thánh Công Giáo (CCC / Youcat).',
};

export default async function GiaoLyLandingPage() {
  // Fetch courses and articles
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

  // 4 Pillars of Catholic Catechism
  const PILLARS = [
    {
      number: 'I',
      title: 'Tuyên Xưng Đức Tin',
      subtitle: 'Kinh Tin Kính của các Tông Đồ',
      description: 'Mầu nhiệm Một Thiên Chúa Ba Ngôi, Công Trình Tạo Dựng, Nhập Thể, Cứu Chuộc và Hội Thánh Duy Nhất, Thánh Thiện, Công Giáo và Tông Truyền.',
      icon: '✝️',
      color: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30'
    },
    {
      number: 'II',
      title: 'Cử Hành Mầu Nhiệm Kitô Giáo',
      subtitle: 'Bảy Bí Tích & Phụng Vụ',
      description: 'Ân sủng cứu độ được trao ban qua Phụng vụ Thánh Thể, các Bí tích Khai tâm, Bí tích Chữa lành và Bí tích Phục vụ sự hiệp thông.',
      icon: '🥖',
      color: 'from-rose-500/20 to-rose-600/5',
      borderColor: 'border-rose-500/30'
    },
    {
      number: 'III',
      title: 'Đời Sống Trong Đức Kitô',
      subtitle: 'Mười Điều Răn & Tám Mối Phúc',
      description: 'Phẩm giá con người được dựng nên theo hình ảnh Thiên Chúa, ơn gọi nên thánh và luật yêu thương trong đời sống luân lý Kitô giáo.',
      icon: '🕊️',
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30'
    },
    {
      number: 'IV',
      title: 'Kinh Nguyện Kitô Giáo',
      subtitle: 'Kinh Lạy Cha & Đời Sống Cầu Nguyện',
      description: 'Ý nghĩa của việc cầu nguyện trong đời sống đức tin, lời kinh Chúa Giêsu truyền dạy và tâm tình hiệp thông cùng Mẹ Maria và các Thánh.',
      icon: '🕯️',
      color: 'from-indigo-500/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24">
      
      {/* 1. SACRED HERO SECTION */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-[var(--border-card)]">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wider backdrop-blur-md">
            <span>✦</span>
            <span>KHO TÀNG ĐỨC TIN HỘI THÁNH CÔNG GIÁO</span>
            <span>✦</span>
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Giáo Lý Hội Thánh Công Giáo
          </h1>

          <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Hệ thống hóa toàn bộ giáo huấn nền tảng, các lớp học đức tin, bài viết giải thích tín lý và đề thi giáo lý chuẩn mực dành cho mọi Kitô hữu.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/quiz"
              className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              <span>Thi Đấu Trường Giáo Lý</span>
            </Link>

            <Link
              href="/khoa-hoc"
              className="px-7 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card)]/80 text-[var(--text-main)] font-bold text-xs border border-[var(--border-card)] backdrop-blur-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Xem Khóa Học Giáo Lý</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4 TRỤ CỘT GIÁO LÝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
            Bản Tóm Lược
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
            Bốn Trụ Cột Giáo Lý Hội Thánh (CCC)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p) => (
            <div 
              key={p.number}
              className={`p-6 rounded-3xl bg-[var(--bg-card)] border ${p.borderColor} backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="font-serif font-black text-xs text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Phần {p.number}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {p.subtitle}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Hội Thánh Công Giáo</span>
                <span className="text-amber-500 font-bold">Tìm hiểu &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CÁC KHÓA HỌC GIÁO LÝ NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex justify-between items-end border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Đào Tạo & Lớp Học
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
                    {course.category || 'Giáo Lý'}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{course.description}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link 
                  href={`/khoa-hoc/${course.slug}`}
                  className="w-full py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  Vào Lớp Học &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BÀI VIẾT & SUY NIỆM GIÁO LÝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex justify-between items-end border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Khảo Luận & Chia Sẻ
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Bài Viết & Chuyên Đề Giáo Lý
            </h2>
          </div>
          <Link href="/thu-vien" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            Xem toàn bộ bài viết &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(giaoLyArticles.length > 0 ? giaoLyArticles.slice(0, 3) : allArticles.slice(0, 3)).map((art) => (
            <Link 
              key={art.id} 
              href={`/thu-vien/${art.slug}`}
              className="group p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {art.category || 'Giáo Lý'}
                </span>
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)] group-hover:text-amber-500 transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                  {art.excerpt || 'Đọc bài viết suy niệm và tìm hiểu giáo huấn sâu sắc của Hội Thánh.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs font-bold text-amber-500">
                <span>Đọc bài viết</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. BANNER ĐẤU TRƯỜNG QUIZ GIÁO LÝ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-indigo-500/20 border border-amber-500/40 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Đấu Trường Giáo Lý 6 Số</span>
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Ôn Luyện & Thi Đua Giáo Lý Trực Tuyến
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Tạo phòng thi đấu trực tiếp cùng các em thiếu nhi và huynh trưởng giáo xứ, xếp hạng và tích lũy điểm thưởng linh đạo.
            </p>
          </div>

          <Link
            href="/quiz"
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 transition-all shadow-xl shadow-amber-500/30 hover:scale-105 shrink-0"
          >
            <span>Vào Đấu Trường Ngay</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
