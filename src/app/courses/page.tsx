import React from 'react';
import Link from 'next/link';
import { fetchCourses } from '@/lib/api';
import { BookOpen, PlayCircle, Filter, Search, ChevronRight } from 'lucide-react';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; s?: string };
}) {
  const activeCategory = searchParams.category || 'all';
  const searchQuery = searchParams.s?.toLowerCase() || '';

  // Fetch live courses from Supabase — falls back to mock if unreachable
  let courses = await fetchCourses();

  // Filter logic
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
    <div className="bg-[var(--bg-main)] text-[var(--text-main)] w-full font-sans transition-colors duration-300">
      
      {/* Page Title Header */}
      <div className="bg-[var(--header-bg)] border-b border-[var(--border-card)] pb-12 pt-16 px-4">
        <div className="max-w-7xl mx-auto space-y-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <BookOpen className="w-4 h-4" /> Nền Tảng Học Tập LMS Công Giáo
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-6xl text-[var(--text-main)] leading-tight tracking-tight">
            Khóa Học Giáo Lý &amp; Kinh Thánh
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed">
            Hành trình khám phá Lời Chúa qua các lộ trình học tập chuyên sâu từ Nhập môn Cựu Ước, Tân Ước cho đến Thần học Phụng vụ và Giáo luật Công giáo.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* SIDEBAR FILTER */}
          <aside className="w-full lg:w-72 shrink-0 space-y-8">
            
            {/* Search Box */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 shadow-lg backdrop-blur-xl">
              <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-[var(--accent-gold)]" /> Tìm Kiếm
              </h3>
              <form action="/courses" method="GET" className="relative">
                <input 
                  type="text" 
                  name="s"
                  defaultValue={searchQuery}
                  placeholder="Tên khóa học..." 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </form>
            </div>

            {/* Categories */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 shadow-lg backdrop-blur-xl sticky top-24">
              <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[var(--accent-gold)]" /> Thể Loại
              </h3>
              <div className="space-y-2">
                {categories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <Link 
                      key={cat.id} 
                      href={`/courses?category=${cat.id}${searchQuery ? `&s=${searchQuery}` : ''}`}
                      className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-[var(--accent-gold)] text-slate-950 shadow-md' 
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT GRID */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif font-bold text-2xl">
                {searchQuery ? `Kết quả cho "${searchQuery}"` : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <span className="text-sm font-bold text-[var(--text-muted)] bg-[var(--bg-card)] px-4 py-2 rounded-xl border border-[var(--border-card)]">
                {courses.length} Khóa học
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-serif text-xl">Không tìm thấy khóa học nào phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.map((course) => (
                  <Link 
                    href={`/courses/${course.slug}`}
                    key={course.id} 
                    className="group bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-[var(--accent-gold)]/50 transition-all flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full aspect-[16/10] bg-slate-800 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
                        <div className="absolute top-4 left-4">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-[var(--accent-gold)] px-3 py-1.5 rounded-full shadow-lg">
                             {course.category}
                           </span>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <PlayCircle className="w-4 h-4 text-[var(--accent-gold)]" /> {course.totalLessons} Bài Học
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <h3 className="font-serif font-bold text-xl text-[var(--text-main)] leading-snug line-clamp-2 group-hover:text-[var(--accent-gold)] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">{course.description}</p>
                        
                        {course.level && (
                          <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              {course.level}
                            </div>
                            <div>{course.duration}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
