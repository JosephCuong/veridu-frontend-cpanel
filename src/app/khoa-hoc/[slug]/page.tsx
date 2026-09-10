'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Play, CheckCircle, Circle, BookOpen, Clock, 
  Video, Headphones, ChevronLeft, ChevronRight, Award, Loader2, Book,
  FileText, HelpCircle, Lock, Download, Maximize2, ShieldCheck,
  RotateCcw, Sparkles, Check, ChevronDown, Eye, PanelLeftClose, PanelLeft,
  AlertTriangle, RefreshCw, Volume2, ExternalLink, Settings
} from 'lucide-react';
import { 
  fetchCourseBySlug, 
  fetchUserCourseProgress, 
  saveUserSectionProgress, 
  CourseDetail, 
  Lesson, 
  LessonSection 
} from '@/lib/api';
import { getStoredUser, UserProfile } from '@/lib/auth';
import CourseCertificateModal, { CertificateData } from '@/components/CourseCertificateModal';

// ─── HELPER: MULTI-SOURCE VIDEO & MEDIA EMBED RESOLVER ───────────────────────
function resolveMediaEmbedUrl(url?: string): { 
  type: 'youtube' | 'facebook' | 'drive' | 'mp4' | 'direct' | 'none'; 
  embedUrl: string; 
  originalUrl: string;
} {
  if (!url || typeof url !== 'string') return { type: 'none', embedUrl: '', originalUrl: '' };
  const clean = url.trim();

  // 1. YouTube (Watch, Embed, Short, youtu.be)
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let videoId = '';
    if (clean.includes('embed/')) {
      videoId = clean.split('embed/')[1]?.split('?')[0] || '';
    } else if (clean.includes('watch?v=')) {
      videoId = clean.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (clean.includes('youtu.be/')) {
      videoId = clean.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (clean.includes('shorts/')) {
      videoId = clean.split('shorts/')[1]?.split('?')[0] || '';
    }
    return {
      type: 'youtube',
      embedUrl: videoId 
        ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1` 
        : clean,
      originalUrl: clean
    };
  }

  // 2. Facebook Video
  if (clean.includes('facebook.com') || clean.includes('fb.watch')) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=0&autoplay=0`,
      originalUrl: clean
    };
  }

  // 3. Google Drive (PDF or Video preview)
  if (clean.includes('drive.google.com')) {
    let fileId = '';
    const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
    return {
      type: 'drive',
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : clean,
      originalUrl: clean
    };
  }

  // 4. Direct Video Stream (MP4, WebM, OGG, M3U8)
  const isDirectVideo = /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(clean);
  if (isDirectVideo) {
    return {
      type: 'mp4',
      embedUrl: clean,
      originalUrl: clean
    };
  }

  return { type: 'direct', embedUrl: clean, originalUrl: clean };
}

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout State: Left Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Hierarchy Indices: Lesson -> Section (Single Page Unit)
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  // Progress Tracking
  const [completedSections, setCompletedSections] = useState<(number | string)[]>([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Certificate Modal State
  const [showCertificate, setShowCertificate] = useState(false);

  // ─── QUIZ DRIP-FEEDING STATE ───────────────────────────────────────────────
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Reset Quiz State when switching section or lesson
  useEffect(() => {
    setQuizQuestionIndex(0);
    setQuizSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
  }, [activeLessonIndex, activeSectionIndex]);

  // Load User & Course Data
  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchCourseBySlug(params.slug);
        if (!data) {
          setError('Không tìm thấy khóa học.');
          return;
        }
        setCourse(data);

        // Fetch user progress from Supabase / localStorage
        const progress = await fetchUserCourseProgress(data.id, currentUser?.id);
        if (progress?.completedSections && Array.isArray(progress.completedSections)) {
          setCompletedSections(progress.completedSections);
        }
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError('Đã có lỗi xảy ra khi tải khóa học.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.slug]);

  // ─── DERIVED CURRENT SECTION & STATS ───────────────────────────────────────
  const currentLessons = course?.lessons || [];
  const activeLesson = currentLessons[activeLessonIndex];
  const currentSections = activeLesson?.sections || [];
  const activeSection = currentSections[activeSectionIndex];

  // Total sections count across entire course
  const totalSectionsCount = useMemo(() => {
    if (!course?.lessons) return 0;
    return course.lessons.reduce((acc, l) => acc + (l.sections?.length || 0), 0);
  }, [course]);

  // Total Progress Percentage
  const progressPercent = useMemo(() => {
    if (totalSectionsCount === 0) return 0;
    const completedCount = completedSections.length;
    return Math.min(100, Math.round((completedCount / totalSectionsCount) * 100));
  }, [completedSections, totalSectionsCount]);

  // Check if a section is unlocked based on Drip-Feeding sequential rule
  const isSectionUnlocked = (lessonIdx: number, sectionIdx: number) => {
    // Section 1 of Lesson 1 is always unlocked
    if (lessonIdx === 0 && sectionIdx === 0) return true;

    // Flatten all sections in order
    let previousSectionId: number | string | null = null;
    let found = false;

    for (let l = 0; l < currentLessons.length; l++) {
      const les = currentLessons[l];
      if (!les.sections) continue;
      for (let s = 0; s < les.sections.length; s++) {
        const sec = les.sections[s];
        if (l === lessonIdx && s === sectionIdx) {
          found = true;
          break;
        }
        previousSectionId = sec.id;
      }
      if (found) break;
    }

    if (!previousSectionId) return true;
    return completedSections.includes(previousSectionId);
  };

  // Passing Threshold for Quiz (Default 80%)
  const quizPassingThreshold = useMemo(() => {
    if (activeSection?.sectionType !== 'quiz') return 80;
    return 80;
  }, [activeSection]);

  const isCurrentQuizPassed = useMemo(() => {
    if (activeSection?.sectionType !== 'quiz') return true;
    if (completedSections.includes(activeSection.id)) return true;
    if (!quizFinished) return false;
    const totalQ = activeSection.quizData?.length || 1;
    const pct = Math.round((quizScore / totalQ) * 100);
    return pct >= quizPassingThreshold;
  }, [activeSection, completedSections, quizFinished, quizScore, quizPassingThreshold]);

  // ─── ACTION: MARK SECTION COMPLETE & ADVANCE STEPPER ───────────────────────
  const handleCompleteAndNext = async () => {
    if (!course || !activeSection) return;

    // If quiz is not passed, block progress!
    if (activeSection.sectionType === 'quiz' && !isCurrentQuizPassed) {
      return;
    }

    // 1. Add to completed sections if not already there
    const updatedCompleted = completedSections.includes(activeSection.id)
      ? completedSections
      : [...completedSections, activeSection.id];

    setCompletedSections(updatedCompleted);

    // 2. Persist to Supabase & LocalStorage
    try {
      setSavingProgress(true);
      await saveUserSectionProgress({
        courseId: course.id,
        sectionId: activeSection.id,
        lessonId: activeLesson.id,
        totalSectionsCount,
        userId: user?.id
      });
      localStorage.setItem(`veridu_course_progress_${course.id}`, JSON.stringify(updatedCompleted));
    } catch (e) {
      console.warn('Could not persist progress:', e);
    } finally {
      setSavingProgress(false);
    }

    // 3. Check if Course Reached 100%
    if (updatedCompleted.length >= totalSectionsCount) {
      setShowCertificate(true);
      return;
    }

    // 4. Advance Stepper to next section or next lesson
    if (activeSectionIndex < currentSections.length - 1) {
      setActiveSectionIndex(prev => prev + 1);
    } else if (activeLessonIndex < course.lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
      setActiveSectionIndex(0);
    }
  };

  const handlePrevStep = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(prev => prev - 1);
    } else if (activeLessonIndex > 0 && course) {
      const prevLesson = course.lessons[activeLessonIndex - 1];
      const prevSectionsCount = prevLesson.sections?.length || 1;
      setActiveLessonIndex(activeLessonIndex - 1);
      setActiveSectionIndex(prevSectionsCount - 1);
    }
  };

  // Helper for Section Icons
  const getSectionIcon = (type: string, className = 'w-4 h-4') => {
    switch (type) {
      case 'video': return <Video className={className} />;
      case 'pdf': return <FileText className={className} />;
      case 'quiz': return <HelpCircle className={className} />;
      case 'audio': return <Headphones className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video Bài Giảng';
      case 'pdf': return 'Tài Liệu Chuyên Khảo PDF';
      case 'quiz': return 'Trắc Nghiệm Khảo Hạch';
      case 'audio': return 'Audio Suy Niệm';
      default: return 'Bài Đọc Khảo Cứu';
    }
  };

  // Certificate Data
  const certificateData: CertificateData | null = useMemo(() => {
    if (!course) return null;
    return {
      courseTitle: course.title,
      courseSlug: course.slug,
      recipientName: user?.fullName || user?.displayName || 'Học Viên VERIDU',
      christianName: user?.christianName || '',
      certificateCode: `VERIDU-LMS-${course.id}-${Math.floor(1000 + Math.random() * 9000)}`,
      issuedAt: new Date().toLocaleDateString('vi-VN'),
      instructorName: course.instructor_name || 'Ban Điều Hành Học Viện VERIDU'
    };
  }, [course, user]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="font-serif text-[var(--text-muted)] text-sm tracking-wide">
            Đang khởi tạo Trình học tập trung VERIDU LMS...
          </p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !course) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
          <h2 className="font-serif font-bold text-xl text-[var(--text-main)]">Không thể tải khóa học</h2>
          <p className="text-xs text-[var(--text-muted)] font-serif">{error || 'Khóa học không tồn tại hoặc đã bị ẩn.'}</p>
          <Link
            href="/khoa-hoc"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Về Danh Mục Khóa Học</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] font-sans transition-colors duration-300">
      
      {/* ── 1. STICKY TOP LMS TOOLBAR (FULL FOCUS MODE - 0 OFFSET) ── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-[var(--border-card)] shadow-md px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        
        {/* Left: Back + Toggle Sidebar + Breadcrumb & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            href="/khoa-hoc" 
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-500/50 transition shadow-sm shrink-0"
            title="Quay lại danh mục khóa học"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-500/50 transition shadow-sm shrink-0"
            title={isSidebarOpen ? 'Thu gọn thanh tiến trình' : 'Mở thanh tiến trình'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4 text-amber-500" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 font-serif">
              <span>{course.category}</span>
              <span>•</span>
              <span className="text-[var(--text-muted)]">{course.level}</span>
            </div>
            <h1 className="font-serif font-black text-xs sm:text-sm md:text-base text-[var(--text-main)] truncate max-w-xs sm:max-w-md lg:max-w-xl">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick Progress & Certificate Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-[var(--text-muted)] font-serif">Tiến độ:</span>
              <span className="font-black font-mono text-amber-500">{progressPercent}%</span>
            </div>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {progressPercent >= 100 && (
            <button
              onClick={() => setShowCertificate(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">Nhận Chứng Chỉ</span>
            </button>
          )}

          {/* Studio Quick Link */}
          <Link
            href="/admin/khoa-hoc"
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-500/50 transition shadow-xs shrink-0"
            title="Mở Studio Soạn Thảo & Quản Lý Khóa Học"
          >
            <Settings className="w-4 h-4 text-amber-500/80" />
          </Link>
        </div>
      </header>

      {/* ── 2. MAIN 2-COLUMN BODY (LEFT: CURRICULUM SIDEBAR | RIGHT: FOCUS CANVAS) ── */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-full overflow-hidden">

        {/* ── COLUMN A: PROGRESS & CURRICULUM SIDEBAR (LEFT) ── */}
        <aside 
          className={`${
            isSidebarOpen ? 'w-full md:w-80 lg:w-96 flex' : 'hidden'
          } bg-[var(--bg-card)]/80 border-r border-[var(--border-card)] flex-col shrink-0 custom-scrollbar overflow-y-auto max-h-[calc(100vh-60px)] transition-all duration-300 z-20`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[var(--border-card)] space-y-2">
            <div className="flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-main)]">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Giáo Trình Khóa Học
              </span>
              <span className="font-mono text-amber-500 font-black text-[11px]">
                {completedSections.length} / {totalSectionsCount} Hoàn Tất
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-500 rounded-full" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Lessons & Sections List */}
          <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {currentLessons.map((les, lIdx) => {
              const isLessonActive = lIdx === activeLessonIndex;
              const lessonSections = les.sections || [];
              const completedCountInLesson = lessonSections.filter(s => completedSections.includes(s.id)).length;
              const isLessonDone = lessonSections.length > 0 && completedCountInLesson === lessonSections.length;

              return (
                <div 
                  key={les.id} 
                  className={`rounded-2xl border transition-all ${
                    isLessonActive 
                      ? 'bg-[var(--bg-card)] border-amber-500/50 shadow-md ring-1 ring-amber-500/20' 
                      : 'bg-[var(--bg-main)]/50 border-[var(--border-card)]/70 hover:border-[var(--border-card)]'
                  }`}
                >
                  {/* Lesson Header */}
                  <div className="p-3 border-b border-[var(--border-card)]/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Bài {les.orderNumber || lIdx + 1}
                      </div>
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] line-clamp-1">
                        {les.title}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isLessonDone 
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {isLessonDone ? 'Đã xong ✓' : `${completedCountInLesson}/${lessonSections.length}`}
                    </span>
                  </div>

                  {/* Sections List */}
                  <div className="p-2 space-y-1">
                    {lessonSections.map((sec, sIdx) => {
                      const isSecDone = completedSections.includes(sec.id);
                      const isSecCurrent = isLessonActive && sIdx === activeSectionIndex;
                      const unlocked = isSectionUnlocked(lIdx, sIdx);

                      let stateClass = 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]';
                      if (isSecCurrent) {
                        stateClass = 'bg-amber-500/15 text-amber-500 font-bold border border-amber-500/40 shadow-xs';
                      } else if (isSecDone) {
                        stateClass = 'text-emerald-500/90 hover:bg-emerald-500/10';
                      } else if (!unlocked) {
                        stateClass = 'opacity-40 cursor-not-allowed hover:bg-transparent';
                      }

                      return (
                        <button
                          key={sec.id}
                          disabled={!unlocked}
                          onClick={() => {
                            setActiveLessonIndex(lIdx);
                            setActiveSectionIndex(sIdx);
                          }}
                          className={`w-full p-2 rounded-xl text-left text-xs font-serif flex items-center justify-between gap-2 transition cursor-pointer ${stateClass}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{getSectionIcon(sec.sectionType, 'w-3.5 h-3.5')}</span>
                            <span className="truncate">{sec.title}</span>
                          </div>
                          <span className="shrink-0">
                            {isSecDone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : !unlocked ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : isSecCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructor Footer Card */}
          {course.instructor_name && (
            <div className="p-3 border-t border-[var(--border-card)] bg-[var(--bg-main)]/40 flex items-center gap-3">
              {course.instructor_avatar ? (
                <Image 
                  src={course.instructor_avatar} 
                  alt={course.instructor_name} 
                  width={36} 
                  height={36} 
                  className="w-9 h-9 rounded-full object-cover border border-amber-500/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  {course.instructor_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--text-muted)] font-serif uppercase">Giảng Viên Phụ Trách</div>
                <div className="text-xs font-serif font-bold text-[var(--text-main)] truncate">{course.instructor_name}</div>
                {course.instructor_title && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate">{course.instructor_title}</div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── COLUMN B: SINGLE-PAGE FOCUS CONTENT CANVAS (RIGHT) ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 custom-scrollbar overflow-y-auto max-h-[calc(100vh-60px)] space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Stepper Tabs Bar for Active Lesson's Sections */}
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
                {currentSections.map((sec, sIdx) => {
                  const isDone = completedSections.includes(sec.id);
                  const isCurrent = sIdx === activeSectionIndex;
                  const unlocked = isSectionUnlocked(activeLessonIndex, sIdx);

                  let pillStyle = 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/40';
                  if (isCurrent) {
                    pillStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm';
                  } else if (isDone) {
                    pillStyle = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
                  } else if (!unlocked) {
                    pillStyle = 'opacity-50 cursor-not-allowed bg-[var(--bg-main)]';
                  }

                  return (
                    <button
                      key={sec.id}
                      disabled={!unlocked}
                      onClick={() => setActiveSectionIndex(sIdx)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-serif flex items-center gap-1.5 shrink-0 transition cursor-pointer ${pillStyle}`}
                    >
                      {getSectionIcon(sec.sectionType, 'w-3.5 h-3.5')}
                      <span>Phần {sIdx + 1}</span>
                      {isDone && <Check className="w-3 h-3" />}
                      {!unlocked && <Lock className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-serif text-[var(--text-muted)]">
                  Phần {activeSectionIndex + 1} / {currentSections.length}
                </span>
              </div>
            </div>

            {/* Single Section Container */}
            {activeSection ? (
              <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6">
                
                {/* Section Header */}
                <div className="border-b border-[var(--border-card)]/60 pb-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                      {getSectionIcon(activeSection.sectionType, 'w-3 h-3')}
                      <span>{getSectionTypeLabel(activeSection.sectionType)}</span>
                    </span>
                    {activeSection.durationMinutes && (
                      <span className="text-[11px] text-[var(--text-muted)] font-serif flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{activeSection.durationMinutes} phút</span>
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif font-black text-lg sm:text-2xl text-[var(--text-main)] leading-snug">
                    {activeSection.title}
                  </h2>
                </div>

                {/* ── 1. MULTI-SOURCE VIDEO RENDERER ── */}
                {activeSection.sectionType === 'video' && (
                  <div className="space-y-4">
                    {activeSection.mediaUrl ? (
                      (() => {
                        const parsed = resolveMediaEmbedUrl(activeSection.mediaUrl);
                        
                        if (parsed.type === 'mp4') {
                          return (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-[var(--border-card)] shadow-2xl">
                              <video 
                                src={parsed.embedUrl} 
                                controls 
                                className="w-full h-full object-contain"
                              >
                                Trình duyệt của bạn không hỗ trợ phát video HTML5.
                              </video>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-[var(--border-card)] shadow-2xl">
                              <iframe
                                src={parsed.embedUrl}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={activeSection.title}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-serif px-1">
                              <span>Nguồn video: {parsed.type.toUpperCase()} (Tự động thích ứng chất lượng cao)</span>
                              <a 
                                href={parsed.originalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-amber-500 hover:underline flex items-center gap-1"
                              >
                                <span>Mở tab mới</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-10 rounded-2xl bg-[var(--bg-main)] text-center space-y-3 border border-[var(--border-card)]">
                        <Video className="w-12 h-12 text-amber-500/50 mx-auto" />
                        <p className="font-serif text-sm text-[var(--text-muted)]">Video bài giảng đang được cập nhật.</p>
                      </div>
                    )}

                    {activeSection.contentHtml && (
                      <div 
                        className="prose prose-invert max-w-none font-serif text-[var(--text-main)] text-sm sm:text-base leading-relaxed pt-3 border-t border-[var(--border-card)]/50"
                        dangerouslySetInnerHTML={{ __html: activeSection.contentHtml }}
                      />
                    )}
                  </div>
                )}

                {/* ── 2. TEXT / WYSIWYG RENDERER ── */}
                {activeSection.sectionType === 'text' && (
                  <div className="space-y-4">
                    {activeSection.contentHtml ? (
                      <div 
                        className="prose prose-invert max-w-none font-serif text-[var(--text-main)] text-base sm:text-lg leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: activeSection.contentHtml }}
                      />
                    ) : (
                      <p className="font-serif italic text-[var(--text-muted)] text-sm">Nội dung bài khảo cứu đang được hoàn thiện.</p>
                    )}
                  </div>
                )}

                {/* ── 3. PDF DOCUMENT VIEWER ── */}
                {activeSection.sectionType === 'pdf' && (
                  <div className="space-y-4">
                    {activeSection.mediaUrl ? (
                      <div className="space-y-3">
                        {/* PDF Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                          <div className="flex items-center gap-2 text-xs font-serif text-[var(--text-main)]">
                            <FileText className="w-4 h-4 text-rose-500" />
                            <span className="font-bold">Tài Liệu Chuyên Khảo PDF</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <a
                              href={activeSection.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Mở Toàn Màn Hình</span>
                            </a>
                            <a
                              href={activeSection.mediaUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] font-bold text-xs flex items-center gap-1.5 hover:border-amber-500 transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Tải Về Máy</span>
                            </a>
                          </div>
                        </div>

                        {/* Frame */}
                        <div className="relative w-full h-[600px] sm:h-[750px] rounded-2xl overflow-hidden border border-[var(--border-card)] bg-slate-950 shadow-inner">
                          <iframe
                            src={resolveMediaEmbedUrl(activeSection.mediaUrl).embedUrl}
                            className="w-full h-full border-none"
                            title={activeSection.title}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 rounded-2xl bg-[var(--bg-main)] text-center space-y-3 border border-[var(--border-card)]">
                        <FileText className="w-12 h-12 text-rose-500/50 mx-auto" />
                        <p className="font-serif text-sm text-[var(--text-muted)]">Chưa có tệp PDF đính kèm cho phần này.</p>
                      </div>
                    )}

                    {activeSection.contentHtml && (
                      <div 
                        className="prose prose-invert max-w-none font-serif text-[var(--text-main)] text-sm leading-relaxed pt-2"
                        dangerouslySetInnerHTML={{ __html: activeSection.contentHtml }}
                      />
                    )}
                  </div>
                )}

                {/* ── 4. QUIZ DRIP-FEEDING & PASSING GATE (≥ 80%) ── */}
                {activeSection.sectionType === 'quiz' && (
                  <div className="space-y-6">
                    {activeSection.quizData && activeSection.quizData.length > 0 ? (
                      (() => {
                        const questions = activeSection.quizData;
                        const totalQ = questions.length;
                        const currentQ = questions[quizQuestionIndex];
                        const selectedAnswer = quizSelectedAnswers[quizQuestionIndex];
                        const isCurrentAnswered = selectedAnswer !== undefined;

                        // Normalize correct answer index (support correctAnswerIndex or correct)
                        const correctAnswer = currentQ.correctAnswerIndex ?? currentQ.correct ?? 0;
                        const explanation = currentQ.explanation ?? currentQ.explain ?? '';

                        // If Quiz Finished: Show Passing Gate Result Screen
                        if (quizFinished) {
                          const percent = Math.round((quizScore / totalQ) * 100);
                          const isPassed = percent >= quizPassingThreshold;

                          return (
                            <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-2xl transition-all ${
                              isPassed 
                                ? 'bg-emerald-950/40 border-emerald-500/60' 
                                : 'bg-rose-950/40 border-rose-500/60'
                            }`}>
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-md ${
                                isPassed 
                                  ? 'bg-emerald-500 text-slate-950' 
                                  : 'bg-rose-500 text-white'
                              }`}>
                                {isPassed ? <Check className="w-8 h-8 stroke-[3]" /> : <Lock className="w-8 h-8" />}
                              </div>

                              <div className="space-y-1">
                                <h3 className={`font-serif font-black text-xl sm:text-2xl ${
                                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {isPassed 
                                    ? `Xuất Sắc! Đạt ${percent}% (${quizScore}/${totalQ} Câu Đúng)` 
                                    : `Chưa Đạt Điểm Sàn (${percent}%)`}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-serif">
                                  {isPassed
                                    ? `Bạn đã vượt qua điểm sàn yêu cầu (≥ ${quizPassingThreshold}%). Phần học đã được ghi nhận hoàn thành vào tiến trình cá nhân!`
                                    : `Hệ thống yêu cầu điểm sàn tối thiểu ${quizPassingThreshold}% (đúng ít nhất ${Math.ceil((quizPassingThreshold / 100) * totalQ)}/${totalQ} câu) để đảm bảo chuẩn kiến thức thần học. Vui lòng bấm "Làm lại Quiz" để thử lại.`}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap justify-center gap-3 pt-3">
                                <button
                                  onClick={() => {
                                    setQuizQuestionIndex(0);
                                    setQuizSelectedAnswers({});
                                    setQuizFinished(false);
                                    setQuizScore(0);
                                  }}
                                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Làm Lại Bài Quiz</span>
                                </button>

                                {isPassed && (
                                  <button
                                    onClick={handleCompleteAndNext}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>Hoàn Thành & Sang Bài Kế Tiếp ✓</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // Stepper Question Card (Drip mode: 1 by 1)
                        return (
                          <div className="space-y-6 bg-[var(--bg-main)]/70 p-5 sm:p-7 rounded-3xl border border-[var(--border-card)] shadow-inner">
                            
                            {/* Stepper Progress Bar */}
                            <div className="flex items-center justify-between text-xs font-serif border-b border-[var(--border-card)]/50 pb-3">
                              <span className="text-amber-500 font-mono font-bold text-sm">
                                Câu {quizQuestionIndex + 1} / {totalQ}
                              </span>
                              <span className="text-[var(--text-muted)] text-[11px]">
                                Điểm sàn đỗ: ≥ {quizPassingThreshold}%
                              </span>
                            </div>

                            {/* Question Title */}
                            <h4 className="font-serif font-black text-base sm:text-lg text-[var(--text-main)] leading-relaxed">
                              {currentQ.question || currentQ.q}
                            </h4>

                            {/* Options List */}
                            <div className="space-y-2.5">
                              {currentQ.options.map((opt: string, optIdx: number) => {
                                const isSelected = selectedAnswer === optIdx;
                                const isCorrect = optIdx === correctAnswer;
                                const char = String.fromCharCode(65 + optIdx);

                                let optStyle = 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-main)] hover:border-amber-500/50 hover:bg-amber-500/5';
                                if (isCurrentAnswered) {
                                  if (isCorrect) {
                                    optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500/40';
                                  } else if (isSelected && !isCorrect) {
                                    optStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                                  } else {
                                    optStyle = 'opacity-40 border-transparent';
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isCurrentAnswered}
                                    onClick={() => {
                                      const isRight = optIdx === correctAnswer;
                                      setQuizSelectedAnswers(prev => ({ ...prev, [quizQuestionIndex]: optIdx }));
                                      if (isRight) setQuizScore(prev => prev + 1);
                                    }}
                                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-serif transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-amber-400">
                                      {char}
                                    </span>
                                    <span className="flex-1 leading-relaxed">{opt}</span>
                                    {isCurrentAnswered && isCorrect && (
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Instant Explanation Feedback */}
                            {isCurrentAnswered && (
                              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-serif leading-relaxed border animate-in fade-in-50 duration-200 ${
                                selectedAnswer === correctAnswer 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              }`}>
                                <div className="font-bold mb-1 flex items-center gap-1.5">
                                  {selectedAnswer === correctAnswer ? (
                                    <><span>✓</span><span>Chính xác!</span></>
                                  ) : (
                                    <><span>✗</span><span>Chưa chính xác!</span></>
                                  )}
                                </div>
                                <div>{explanation}</div>
                              </div>
                            )}

                            {/* Stepper Navigation Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-card)]/50">
                              <span className="text-[11px] text-[var(--text-muted)] font-serif italic">
                                {isCurrentAnswered ? 'Nhấn để tiếp tục câu kế tiếp' : 'Chọn đáp án để xem giải thích'}
                              </span>

                              <button
                                disabled={!isCurrentAnswered}
                                onClick={() => {
                                  if (quizQuestionIndex < totalQ - 1) {
                                    setQuizQuestionIndex(prev => prev + 1);
                                  } else {
                                    setQuizFinished(true);
                                  }
                                }}
                                className={`px-5 py-2.5 rounded-xl font-serif font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                                  isCurrentAnswered 
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20' 
                                    : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <span>{quizQuestionIndex < totalQ - 1 ? 'Câu Kế Tiếp →' : 'Xem Kết Quả Khảo Hạch ✓'}</span>
                              </button>
                            </div>

                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-10 rounded-2xl bg-[var(--bg-main)] text-center space-y-3 border border-[var(--border-card)]">
                        <HelpCircle className="w-12 h-12 text-amber-500/50 mx-auto" />
                        <p className="font-serif text-sm text-[var(--text-muted)]">Chưa có câu hỏi trắc nghiệm cho phần này.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── 5. AUDIO / PODCAST RENDERER ── */}
                {activeSection.sectionType === 'audio' && (
                  <div className="space-y-4">
                    {activeSection.mediaUrl ? (
                      <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4 text-center">
                        <Volume2 className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
                        <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Nghe Audio Lời Chúa & Suy Niệm</h4>
                        <audio src={activeSection.mediaUrl} controls className="w-full max-w-md mx-auto" />
                      </div>
                    ) : (
                      <div className="p-10 rounded-2xl bg-[var(--bg-main)] text-center space-y-3 border border-[var(--border-card)]">
                        <Headphones className="w-12 h-12 text-indigo-500/50 mx-auto" />
                        <p className="font-serif text-sm text-[var(--text-muted)]">Bản ghi âm đang được chuẩn bị.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── 6. BOTTOM NAVIGATION ACTIONS ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--border-card)]">
                  
                  {/* Previous Section */}
                  <button
                    onClick={handlePrevStep}
                    disabled={activeLessonIndex === 0 && activeSectionIndex === 0}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-amber-500/50 text-xs font-serif font-bold transition flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Phần Trước</span>
                  </button>

                  {/* Next / Complete Section */}
                  <div>
                    {activeSection.sectionType === 'quiz' && !isCurrentQuizPassed ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-xs font-serif font-bold cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Cần Vượt Qua Quiz (≥ 80%) 🔒</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleCompleteAndNext}
                        disabled={savingProgress}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {savingProgress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>
                          {activeLessonIndex === currentLessons.length - 1 && activeSectionIndex === currentSections.length - 1
                            ? 'Hoàn Tất Khóa Học & Nhận Chứng Chỉ ✓'
                            : 'Hoàn Thành & Sang Phần Kế Tiếp →'}
                        </span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            ) : null}

          </div>
        </main>

      </div>

      {/* ── 3. GRADUATION CERTIFICATE MODAL ── */}
      {showCertificate && (
        <CourseCertificateModal
          certificate={certificateData}
          onClose={() => setShowCertificate(false)}
        />
      )}

    </div>
  );
}
