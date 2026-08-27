import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCourses } from '@/lib/api';
import AdBanner from '@/components/AdBanner';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Award, 
  GraduationCap, 
  Clock, 
  Layers, 
  CheckCircle2, 
  SlidersHorizontal,
  X,
  BookMarked,
  Gamepad2,
  Library
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Khóa Học Giáo Lý & Kinh Thánh Trực Tuyến | VERIDU',
  description: 'Hành trình khám phá Lời Chúa qua các lộ trình học tập chuyên sâu từ Nhập môn Cựu Ước, Tân Ước cho đến Thần học Phụng vụ và Giáo luật Công giáo.',
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; s?: string; sort?: string };
}) {
  const activeCategory = searchParams.category || 'all';
  const searchQuery = searchParams.s?.toLowerCase() || '';
  const sortOrder = searchParams.sort || 'newest';

  // Fetch all raw courses
  const allCourses = await fetchCourses();

  // Category counts calculation
  const getCategoryCount = (term: string) => {
    if (!term || term === 'all') return allCourses.length;
    return allCourses.filter(c => c.category?.toLowerCase().includes(term.toLowerCase())).length;
  };

  const categories = [
    { id: 'all', name: 'Tất Cả Khóa Học', count: getCategoryCount('all'), term: '' },
    { id: 'cuu-uoc', name: 'Kinh Thánh Cựu Ước', count: getCategoryCount('cựu ước'), term: 'cựu ước' },
    { id: 'tan-uoc', name: 'Kinh Thánh Tân Ước', count: getCategoryCount('tân ước'), term: 'tân ước' },
    { id: 'phung-vu', name: 'Thần Học Phụng Vụ', count: getCategoryCount('phụng vụ'), term: 'phụng vụ' },
    { id: 'giao-ly', name: 'Giáo Lý Dự Tòng & Hôn Nhân', count: getCategoryCount('giáo lý'), term: 'giáo lý' },
  ];

  // Filtering
  let filteredCourses = [...allCourses];

  if (activeCategory !== 'all') {
    const selectedCat = categories.find(c => c.id === activeCategory);
    if (selectedCat && selectedCat.term) {
      filteredCourses = filteredCourses.filter(c => 
        c.category?.toLowerCase().includes(selectedCat.term)
      );
    }
  }

  if (searchQuery) {
    filteredCourses = filteredCourses.filter(c => 
      c.title.toLowerCase().includes(searchQuery) || 
      c.description.toLowerCase().includes(searchQuery)
    );
  }

  // Sorting
  if (sortOrder === 'oldest') {
    filteredCourses.reverse();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] w-full font-sans transition-colors duration-300 pb-24">
      
      {/* ── 1. SACRED HERO SECTION (CLEAN PARCHMENT / LIGHT & DARK COMPLIANT) ── */}
      <section className="relative w-full pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/[0.04] via-transparent to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

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
              <span><strong className="text-[var(--text-main)] font-mono">{allCourses.length}</strong> Khóa học chuẩn mực</span>
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

      {/* ── 2. TWO-COLUMN WORKSPACE: 70% COURSES + 30% STICKY SIDEBAR ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ══════════════════════════════════════════════════════════════════
              LEFT COLUMN: COURSE CARDS & TOOLBAR (70% - 8/12 COLUMNS)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Toolbar: Results Info & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-serif text-[var(--text-muted)]">
                  Tìm thấy <strong className="text-[var(--text-main)] font-mono">{filteredCourses.length}</strong> khóa học
                </span>

                {(activeCategory !== 'all' || searchQuery) && (
                  <Link
                    href="/khoa-hoc"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-serif transition"
                  >
                    <span>Xóa bộ lọc</span>
                    <X className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Sort Switcher */}
              <div className="flex items-center gap-2 text-xs font-serif text-[var(--text-muted)]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>Sắp xếp:</span>
                <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
                  <Link
                    href={`/khoa-hoc?category=${activeCategory}&s=${searchQuery}&sort=newest`}
                    className={`px-3 py-1 rounded-xl transition ${
                      sortOrder === 'newest'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    Mới nhất
                  </Link>
                  <Link
                    href={`/khoa-hoc?category=${activeCategory}&s=${searchQuery}&sort=oldest`}
                    className={`px-3 py-1 rounded-xl transition ${
                      sortOrder === 'oldest'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    Cũ nhất
                  </Link>
                </div>
              </div>
            </div>

            {/* Courses Grid: 2 Columns */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course: any) => (
                  <div
                    key={course.id}
                    className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl group"
                  >
                    <div>
                      {/* Course Thumbnail */}
                      <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-slate-900">
                            <BookOpen className="w-12 h-12 text-amber-500/40" />
                          </div>
                        )}

                        {/* Category Badge */}
                        {course.category && (
                          <span className="absolute top-3 left-3 text-[10px] font-serif font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-white/90 dark:bg-slate-950/85 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md shadow-sm">
                            {course.category}
                          </span>
                        )}

                        {/* Lessons / Duration badge if available */}
                        <span className="absolute bottom-3 right-3 text-[10px] font-mono text-stone-200 bg-slate-950/80 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Tự Học</span>
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="p-6 space-y-3">
                        <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed font-sans">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom CTA Action Button */}
                    <div className="p-6 pt-0">
                      <Link
                        href={`/khoa-hoc/${course.slug}`}
                        className="w-full py-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                      >
                        <span>Tham Gia Học Ngay</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] text-center space-y-4">
                <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  Không tìm thấy khóa học phù hợp
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-serif max-w-md mx-auto">
                  Vui lòng thử chọn chuyên mục khác hoặc xóa từ khóa tìm kiếm để khám phá các khóa học sẵn có.
                </p>
                <Link
                  href="/khoa-hoc"
                  className="inline-block px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md"
                >
                  Xem Tất Cả Khóa Học
                </Link>
              </div>
            )}

            {/* In-Feed Native Free Ad Space / AdSense */}
            <div className="pt-4">
              <AdBanner
                slotId="khoa-hoc-infeed"
                format="horizontal"
                customTitle="Ủng Hộ Dự Án Giáo Dục Đức Tin VERIDU"
                customSubtitle="Cùng chung tay số hóa tài liệu, giáo án và xây dựng nền tảng học tập trực tuyến phụng sự cộng đồng Dân Chúa."
                customLink="/thu-vien/dang-bai"
              />
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: STICKY SIDEBAR (30% - 4/12 COLUMNS)
             ══════════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Block 1: Search Widget */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Tìm Kiếm Khóa Học</span>
              </h4>
              
              <form action="/khoa-hoc" method="GET" className="relative w-full">
                {activeCategory !== 'all' && (
                  <input type="hidden" name="category" value={activeCategory} />
                )}
                <input
                  type="text"
                  name="s"
                  defaultValue={searchQuery}
                  placeholder="Nhập tên khóa học, chủ đề..."
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-sans shadow-inner"
                />
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
                {searchQuery && (
                  <Link
                    href={`/khoa-hoc?category=${activeCategory}`}
                    className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </Link>
                )}
              </form>
            </div>

            {/* Block 2: Category Filter List (Vertical Pill Menu) */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Chuyên Mục Đào Tạo</span>
              </h4>

              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={`/khoa-hoc?category=${cat.id}${searchQuery ? `&s=${searchQuery}` : ''}`}
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs font-serif flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-slate-950/20 text-slate-950 font-bold' 
                          : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-card)]'
                      }`}>
                        {cat.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Block 3: Free Advertisement / Google AdSense Sidebar Box */}
            <AdBanner
              slotId="khoa-hoc-sidebar"
              format="rectangle"
              customTitle="Tủ Sách Điện Tử & Học Liệu VERIDU"
              customSubtitle="Kho sách số hóa chất lượng cao định dạng PDF phục vụ nghiên cứu Thần học, Giáo luật và Linh đạo Công giáo."
              customLink="/thu-vien/sach"
            />

            {/* Block 4: Quick Educational Shortcuts */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Học Tập &amp; Khảo Cứu Mở Rộng</span>
              </h4>

              <div className="space-y-2">
                <Link
                  href="/giao-ly"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Giáo Lý Toàn Thư CCC
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">2.865 số điều khoản chuẩn mực</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/quiz"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Đấu Trường Quiz
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Thi đấu tri thức thời gian thực</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/thu-vien/tai-lieu"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Library className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-xs text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Kho Slide &amp; Giáo Án PDF
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] font-serif truncate">Học liệu mục vụ miễn phí</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </aside>

        </div>
      </main>

    </div>
  );
}
