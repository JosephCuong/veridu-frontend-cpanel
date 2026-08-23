import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCourses, fetchGlobalSearch, Course, Article } from '@/lib/api';
import { Search, BookOpen, Book, FileText, PlayCircle, Calendar } from 'lucide-react';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string };
}) {
  const query = searchParams.q || '';
  const activeTab = searchParams.tab || 'courses';

  let courses: Course[] = [];
  let articles: Article[] = [];

  if (query) {
    const results = await fetchGlobalSearch(query);
    courses = results.courses || [];
    articles = results.articles || [];
  } else {
    courses = await fetchCourses();
  }

  const tabs = [
    { id: 'courses', name: 'Khóa Học LMS', icon: <BookOpen className="w-4 h-4" />, count: courses.length },
    { id: 'bible', name: 'Kinh Thánh', icon: <Book className="w-4 h-4" />, count: 0 },
    { id: 'library', name: 'Thư Viện Bài Viết', icon: <FileText className="w-4 h-4" />, count: articles.length },
  ];

  return (
    <div className="bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen w-full font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-[var(--header-bg)] border-b border-[var(--border-card)] pb-12 pt-28 md:pt-36 px-4">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-xs font-bold uppercase tracking-wider">
            <Search className="w-4 h-4" /> Kết quả tìm kiếm toàn cục
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-[var(--text-main)] leading-tight tracking-tight">
            {query ? `Tìm thấy ${courses.length} kết quả cho "${query}"` : "Nhập từ khóa để tìm kiếm"}
          </h1>
          
          {/* Main Search Input */}
          <form action="/search" method="GET" className="max-w-2xl mx-auto relative mt-8">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Tra cứu bài học, câu Kinh Thánh, chủ đề..." 
              className="w-full bg-[var(--bg-card)] border-2 border-[var(--border-card)] rounded-full pl-6 pr-16 py-4 text-lg focus:outline-none focus:border-[var(--accent-gold)] shadow-lg transition-all"
              autoFocus
            />
            <button type="submit" className="absolute right-3 top-3 p-2 bg-[var(--accent-gold)] text-slate-950 rounded-full hover:bg-amber-400 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Link 
                key={tab.id}
                href={`/search?q=${encodeURIComponent(query)}&tab=${tab.id}`}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm border ${
                  isActive 
                    ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-slate-950' 
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-[var(--accent-gold)] hover:text-[var(--text-main)]'
                }`}
              >
                {tab.icon}
                {tab.name}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-slate-950/20' : 'bg-[var(--border-card)]'}`}>
                  {tab.id === 'courses' ? courses.length : '?'}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'courses' && (
            <div>
              {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl">
                  <Search className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-serif text-xl">Không có khóa học nào khớp với từ khóa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => (
                    <Link 
                      href={`/courses/${course.slug}`}
                      key={course.id} 
                      className="group bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-[var(--accent-gold)] transition-all flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden aspect-[16/10]">
                        {course.thumbnail ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={course.thumbnail} 
                              alt={course.title} 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500" 
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-[var(--accent-gold)] px-2 py-1 rounded-full">
                             {course.category}
                           </span>
                           <span className="text-white text-xs font-bold flex items-center gap-1">
                             <PlayCircle className="w-4 h-4 text-[var(--accent-gold)]" /> {course.totalLessons}
                           </span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-lg text-[var(--text-main)] line-clamp-2 group-hover:text-[var(--accent-gold)] transition-colors mb-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4 flex-1">
                          {course.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bible' && (
            <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl">
              <Book className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="font-serif text-2xl font-bold text-[var(--text-main)] mb-2">Tra Cứu Kinh Thánh</h3>
              <p className="text-sm max-w-md text-center">Tính năng tìm kiếm chi tiết các câu Kinh Thánh và bản dịch đang được xây dựng. Vui lòng quay lại sau!</p>
            </div>
          )}

          {activeTab === 'library' && (
            <div>
              {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl">
                  <Search className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-serif text-xl">Không có bài viết nào khớp với từ khóa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article) => (
                    <Link 
                      href={`/library/${article.slug}`}
                      key={article.id} 
                      className="group bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-[var(--accent-gold)] transition-all flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden aspect-[16/10]">
                        {article.thumbnail ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={article.thumbnail} 
                              alt={article.title} 
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500" 
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-[var(--accent-gold)] px-2 py-1 rounded-full">
                             {article.category}
                           </span>
                           {article.created_at && (
                             <span className="text-white text-xs font-bold flex items-center gap-1">
                               <Calendar className="w-3 h-3 text-[var(--accent-gold)]" /> {article.created_at}
                             </span>
                           )}
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-lg text-[var(--text-main)] line-clamp-2 group-hover:text-[var(--accent-gold)] transition-colors mb-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed mb-4 flex-1" dangerouslySetInnerHTML={{ __html: article.excerpt || '' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
