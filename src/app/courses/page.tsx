import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCourses } from '@/lib/api';
import { BookOpen, PlayCircle, Filter, Search, ChevronRight, Sparkles, Award, GraduationCap } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Khóa Học Giáo Lý & Kinh Thánh Trực Tuyến | VERIDU',
  description: 'Hành trình khám phá Lời Chúa qua các lộ trình học tập chuyên sâu từ Nhập môn Cựu Ước, Tân Ước cho đến Thần học Phụng vụ và Giáo luật Công giáo.',
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; s?: string };
}) {
  const activeCategory = searchParams.category || 'all';
  const searchQuery = searchParams.s?.toLowerCase() || '';

  let courses = await fetchCourses();

  if (activeCategory !== 'all') {
    const term = activeCategory === 'cuu-uoc' ? 'cựu ước' 
               : activeCategory === 'tan-uoc' ? 'tân ước'
               : activeCategory === 'phung-vu' ? 'phụng vụ'
               : activeCategory === 'giao-ly' ? 'giáo lý' : '';
    if (term) {
      courses = courses.filter(c => c.category?.toLowerCase().includes(term));
    }
  }

  if (searchQuery) {
    courses = courses.filter(c => 
      c.title.toLowerCase().includes(searchQuery) || 
      c.description.toLowerCase().includes(searchQuery)
    );
  }

  const categories = [
    { id: 'all', name: 'Tất Cả Khóa Học' },
    { id: 'cuu-uoc', name: 'Kinh Thánh Cựu Ước' },
    { id: 'tan-uoc', name: 'Kinh Thánh Tân Ước' },
    { id: 'phung-vu', name: 'Thần Học Phụng Vụ' },
    { id: 'giao-ly', name: 'Giáo Lý Dự Tòng' },
  ];

  return (
    <div className="bg-[var(--bg-main)] text-[var(--text-main)] w-full font-sans transition-colors duration-300 pb-20">
      
      {/* ── 1. SACRED HERO SECTION (CLEAN PARCHMENT / LIGHT & DARK COMPLIANT) ── */}
      <section className="relative w-full pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/[0.04] via-transparent to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Khóa Học Giáo Lý{' '}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-300 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              &amp; Kinh Thánh Trực Tuyến
            </span>
          </h1>

          <p className="font-serif italic text-sm sm:text-base lg:text-lg text-[var(--text-muted)] max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Hành trình khám phá Lời Chúa qua các lộ trình học tập chuyên sâu từ Nhập môn Cựu Ước, Tân Ước cho đến Thần học Phụng vụ và Giáo luật Công giáo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-2 text-xs font-serif text-[var(--text-muted)] shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span><strong className="text-[var(--text-main)] font-mono">{courses.length}</strong> Khóa học chuẩn mực</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif text-[var(--text-muted)] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Tự Học Linh Hoạt</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-1.5 text-xs font-serif text-[var(--text-muted)] shadow-sm">
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cấp Chứng Nhận VERIDU</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN COURSE WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Pill Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-card)] shadow-lg">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/khoa-hoc?category=${cat.id}`}
                  className={`px-4 py-2 rounded-2xl text-xs font-serif font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          <form action="/khoa-hoc" method="GET" className="relative w-full md:w-72">
            <input
              type="text"
              name="s"
              defaultValue={searchQuery}
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-sans"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          </form>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="relative w-full aspect-video bg-slate-800">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  {course.category && (
                    <span className="absolute top-3 left-3 text-[10px] font-serif font-bold uppercase tracking-wider text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                      {course.category}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-sans">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/khoa-hoc/${course.slug}`}
                  className="w-full py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Tham Gia Học Ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
