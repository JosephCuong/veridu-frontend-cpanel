'use client';

import React, { useState, useEffect } from 'react';

import { 
  Play, CheckCircle, Circle, BookOpen, Clock, 
  Video, Headphones, ChevronLeft, ChevronRight, Award, Sparkles, Loader2, Book, Quote
} from 'lucide-react';
import Link from 'next/link';
import { fetchCourseBySlug, CourseDetail, Lesson } from '@/lib/api';

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<(number | string)[]>([]);

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        const data = await fetchCourseBySlug(resolvedParams.slug);
        if (!data) {
          setError('Không tìm thấy khóa học này.');
        } else {
          setCourse(data);
        }
      } catch (e) {
        setError('Không thể tải khóa học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [resolvedParams.slug]);

  const activeLesson: Lesson | null = course?.lessons?.[activeLessonIndex] ?? null;
  const progressPercent = course && course.lessons.length > 0
    ? Math.round((completedLessons.length / course.lessons.length) * 100)
    : 0;

  const toggleComplete = (lessonId: number | string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  // Group lessons by Chapter Title
  const lessonsByChapter: Record<string, Lesson[]> = {};
  if (course && course.lessons) {
    course.lessons.forEach(l => {
      const ch = l.chapterTitle || 'Chương chung';
      if (!lessonsByChapter[ch]) lessonsByChapter[ch] = [];
      lessonsByChapter[ch].push(l);
    });
  }

  const getLessonIcon = (type: string, className: string) => {
    if (type === 'video') return <Video className={className} />;
    if (type === 'audio') return <Headphones className={className} />;
    return <Book className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
            <p className="font-serif text-[var(--text-muted)]">Đang tải khóa học LMS...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <BookOpen className="w-12 h-12 text-amber-500/50 mx-auto" />
            <h2 className="font-serif font-bold text-xl text-[var(--text-main)]">
              {error || 'Khóa học không tồn tại'}
            </h2>
            <Link href="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm">
              <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 pb-20">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-card)] pb-4 gap-4">
          <Link href="/courses" className="inline-flex items-center text-xs font-bold text-[var(--accent-gold)] hover:underline hover:text-amber-400 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Quay Lại Khóa Học
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)]">
            <span className="px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 uppercase tracking-wider shadow-sm">{course.category}</span>
            <span>Khóa Học: <strong className="text-[var(--text-main)] drop-shadow-sm">{course.title}</strong></span>
          </div>
        </div>

        {/* Course Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Award className="w-5 h-5"/></div>
                <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Cấp Độ</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{course.level}</p>
                </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><BookOpen className="w-5 h-5"/></div>
                <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Giảng Viên</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{course.instructor || 'VERIDU Team'}</p>
                </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Clock className="w-5 h-5"/></div>
                <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Thời Lượng</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{course.duration}</p>
                </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Play className="w-5 h-5"/></div>
                <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Tổng Bài</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{course.lessons.length} Bài</p>
                </div>
            </div>
        </div>

        {/* LMS Player Grid: Video Player + Playlist Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Left Panel: Video Player & Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Media Player Container */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl">
              {activeLesson?.videoUrl ? (
                <iframe
                  src={activeLesson.videoUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeLesson?.title}
                />
              ) : activeLesson?.audioUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
                  <Headphones className="w-16 h-16 text-amber-500 drop-shadow-lg" />
                  <p className="font-serif text-lg font-bold text-white drop-shadow-md">
                    Nghe Đọc Bài Giảng
                  </p>
                  <audio controls className="w-full max-w-md mx-auto" src={activeLesson.audioUrl}>
                    Trình duyệt của bạn không hỗ trợ audio.
                  </audio>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <Book className="w-12 h-12 text-amber-400 opacity-60" />
                  <p className="font-serif text-sm font-bold text-[var(--text-muted)]">
                    Bài học văn bản suy niệm • Không có Video
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Title & Action Bar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-6">
              
              {activeLesson && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
                    <div>
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                        {getLessonIcon(activeLesson.lessonType || 'reading', 'w-4 h-4')}
                        {activeLesson.chapterTitle} • Bài {activeLesson.orderNumber}
                      </span>
                      <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)] mt-1">
                        {activeLesson.title}
                      </h1>
                    </div>

                    <button
                      onClick={() => toggleComplete(activeLesson.id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                        completedLessons.includes(activeLesson.id)
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                      }`}
                    >
                      {completedLessons.includes(activeLesson.id) ? (
                        <><CheckCircle className="w-4 h-4 text-emerald-400" /><span>Đã Hoàn Thành</span></>
                      ) : (
                        <><Circle className="w-4 h-4" /><span>Đánh Dấu Hoàn Thành</span></>
                      )}
                    </button>
                  </div>

                  {/* Scripture Reference block */}
                  {activeLesson.scripture && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 sm:p-6 rounded-2xl flex items-start gap-4">
                        <BookOpen className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-1">Lời Chúa</h4>
                            <p className="font-serif italic text-lg text-[var(--text-main)]">&quot;{activeLesson.scripture}&quot;</p>
                        </div>
                    </div>
                  )}

                  {/* Lesson Text Content */}
                  <div 
                    className="prose prose-veridu-sanitized prose-amber max-w-none font-serif text-[var(--text-main)] text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeLesson.contentHtml || '' }}
                  />

                  {/* Prayer block */}
                  {activeLesson.prayer && (
                    <div className="mt-8 bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <Quote className="absolute -top-4 -right-4 w-24 h-24 text-blue-500/10 rotate-12" />
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-3 text-sm uppercase tracking-wider">Cầu Nguyện</h4>
                        <p className="font-serif italic text-[var(--text-main)] whitespace-pre-line relative z-10 leading-relaxed">
                            {activeLesson.prayer}
                        </p>
                    </div>
                  )}

                  {/* Lesson Pagination Nav */}
                  <div className="pt-6 mt-8 border-t border-[var(--border-card)] flex items-center justify-between">
                    <button
                      disabled={activeLessonIndex <= 0}
                      onClick={() => setActiveLessonIndex((prev) => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-muted)] disabled:opacity-30 hover:text-amber-500 flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" /> Bài Trước
                    </button>

                    <button
                      disabled={activeLessonIndex >= course.lessons.length - 1}
                      onClick={() => setActiveLessonIndex((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-muted)] disabled:opacity-30 hover:text-amber-500 flex items-center gap-1.5"
                    >
                      Bài Tiếp Theo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar: Course Progress & Lesson Playlist */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Progress Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Tiến Độ Học Tập</span>
                </h3>
                <span className="text-sm font-black text-amber-500">{progressPercent}%</span>
              </div>

              <div className="w-full bg-[var(--bg-main)] h-2.5 rounded-full overflow-hidden border border-[var(--border-card)]">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] text-center">
                Hoàn thành <strong>{completedLessons.length}</strong> / <strong>{course.lessons.length}</strong> bài học LMS.
              </p>
            </div>

            {/* Playlist Card with Chapter Grouping */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-2xl flex flex-col max-h-[80vh]">
              <h3 className="font-serif font-bold text-base text-amber-500 flex items-center gap-2 pb-4 border-b border-[var(--border-card)] mb-4 shrink-0">
                <BookOpen className="w-4 h-4" />
                <span>Nội Dung Khóa Học</span>
              </h3>

              <div className="space-y-6 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                {Object.entries(lessonsByChapter).map(([chapterTitle, lessons], chIdx) => (
                  <div key={chIdx} className="space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider sticky top-0 bg-[var(--bg-card)]/90 backdrop-blur-sm py-1 z-10 border-l-2 border-amber-500 pl-2">
                        {chapterTitle}
                    </h4>
                    
                    <div className="space-y-2">
                        {lessons.map((les) => {
                        const originalIndex = course.lessons.findIndex(l => l.id === les.id);
                        const isActive = originalIndex === activeLessonIndex;
                        const isDone = completedLessons.includes(les.id);

                        return (
                            <button
                            key={les.id}
                            onClick={() => setActiveLessonIndex(originalIndex)}
                            className={`w-full p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between gap-3 border ${
                                isActive
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]'
                                : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500/30'
                            }`}
                            >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {isDone ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : isActive ? (
                                    <Play className="w-4 h-4 text-amber-500 fill-current shrink-0" />
                                ) : (
                                    getLessonIcon(les.lessonType || 'reading', "w-4 h-4 text-[var(--text-muted)] shrink-0")
                                )}
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-serif font-bold text-xs leading-tight line-clamp-2">
                                        Bài {les.orderNumber}: {les.title}
                                    </h5>
                                </div>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] shrink-0">{les.duration}</span>
                            </button>
                        );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
