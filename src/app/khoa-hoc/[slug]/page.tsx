'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Play, CheckCircle, Circle, BookOpen, Clock, 
  Video, Headphones, ChevronLeft, ChevronRight, Award, Loader2, Book,
  FileText, HelpCircle, Lock, Download, Maximize2, ShieldCheck,
  RotateCcw, Sparkles, Check, ChevronDown, Eye
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

// ─── HELPER: EMBED URL RESOLVER ───────────────────────────────────────────────
function resolveMediaEmbedUrl(url?: string): { type: 'youtube' | 'drive' | 'direct' | 'none'; embedUrl: string } {
  if (!url || typeof url !== 'string') return { type: 'none', embedUrl: '' };
  const clean = url.trim();

  // YouTube
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let videoId = '';
    if (clean.includes('embed/')) {
      videoId = clean.split('embed/')[1]?.split('?')[0] || '';
    } else if (clean.includes('watch?v=')) {
      videoId = clean.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (clean.includes('youtu.be/')) {
      videoId = clean.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return {
      type: 'youtube',
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : clean
    };
  }

  // Google Drive (PDF or Video)
  if (clean.includes('drive.google.com')) {
    let fileId = '';
    const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
    return {
      type: 'drive',
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : clean
    };
  }

  return { type: 'direct', embedUrl: clean };
}

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hierarchy Indices: Lesson -> Section (Single Page Unit)
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  // Progress Tracking
  const [completedSections, setCompletedSections] = useState<(number | string)[]>([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Certificate Modal State
  const [showCertificate, setShowCertificate] = useState(false);

  // Quiz Interaction State (for quiz sections)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  // 1. Initial Load & User Auth Fetch
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    async function loadCourse() {
      try {
        setLoading(true);
        const data = await fetchCourseBySlug(params.slug);
        if (!data) {
          setError('Không tìm thấy khóa học này trên hệ thống.');
          return;
        }
        setCourse(data);

        // Load saved progress from Supabase if user is logged in
        if (stored?.id) {
          const progress = await fetchUserCourseProgress(data.id, String(stored.id));
          if (progress?.completedSections && progress.completedSections.length > 0) {
            setCompletedSections(progress.completedSections);
          }
        } else {
          // Local fallback for guest
          try {
            const localSaved = localStorage.getItem(`veridu_course_progress_${data.id}`);
            if (localSaved) {
              setCompletedSections(JSON.parse(localSaved));
            }
          } catch (e) {}
        }
      } catch (e) {
        setError('Lỗi kết nối khi tải khóa học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params.slug]);

  // Reset quiz state when moving to a new section
  useEffect(() => {
    setSelectedAnswers({});
    setShowQuizFeedback(false);
  }, [activeLessonIndex, activeSectionIndex]);

  // ─── COMPUTED CURRICULUM DATA ───────────────────────────────────────────────
  const activeLesson: Lesson | null = useMemo(() => {
    if (!course || !course.lessons || course.lessons.length === 0) return null;
    return course.lessons[activeLessonIndex] || course.lessons[0] || null;
  }, [course, activeLessonIndex]);

  // Ensure every lesson has at least 1 section (fallback if DB has no sections)
  const currentSections: LessonSection[] = useMemo(() => {
    if (!activeLesson) return [];
    if (activeLesson.sections && activeLesson.sections.length > 0) {
      return activeLesson.sections;
    }
    // Fallback single section from lesson properties
    return [
      {
        id: `fallback-${activeLesson.id}`,
        lessonId: activeLesson.id,
        title: activeLesson.title,
        sectionType: (activeLesson.lessonType as any) || (activeLesson.videoUrl ? 'video' : 'text'),
        orderIndex: 1,
        mediaUrl: activeLesson.videoUrl || activeLesson.audioUrl || '',
        contentHtml: activeLesson.contentHtml || activeLesson.content || '',
        duration: activeLesson.duration || '15 phút',
        durationMinutes: activeLesson.durationMinutes || 15
      }
    ];
  }, [activeLesson]);

  const activeSection: LessonSection | null = useMemo(() => {
    if (!currentSections || currentSections.length === 0) return null;
    return currentSections[activeSectionIndex] || currentSections[0] || null;
  }, [currentSections, activeSectionIndex]);

  // Flatten all sections across the entire course to calculate exact % progress
  const allCourseSections: LessonSection[] = useMemo(() => {
    if (!course || !course.lessons) return [];
    return course.lessons.flatMap((l, lIdx) => {
      if (l.sections && l.sections.length > 0) return l.sections;
      return [
        {
          id: `fallback-${l.id || lIdx}`,
          lessonId: l.id,
          title: l.title,
          sectionType: 'text',
          orderIndex: 1
        } as LessonSection
      ];
    });
  }, [course]);

  const totalSectionsCount = allCourseSections.length;
  const progressPercent = totalSectionsCount > 0
    ? Math.min(100, Math.round((completedSections.length / totalSectionsCount) * 100))
    : 0;

  // ─── DRIP-FEEDING UNLOCK LOGIC ──────────────────────────────────────────────
  const isSectionUnlocked = (lessonIdx: number, sectionIdx: number): boolean => {
    if (lessonIdx === 0 && sectionIdx === 0) return true;
    
    // Find absolute index in allCourseSections
    let targetSection: LessonSection | null = null;
    let targetAbsIdx = 0;
    let currAbsIdx = 0;

    for (let i = 0; i < (course?.lessons?.length || 0); i++) {
      const les = course!.lessons[i];
      const secs = les.sections && les.sections.length > 0 ? les.sections : [{ id: `fallback-${les.id}` } as any];
      for (let s = 0; s < secs.length; s++) {
        if (i === lessonIdx && s === sectionIdx) {
          targetSection = secs[s];
          targetAbsIdx = currAbsIdx;
        }
        currAbsIdx++;
      }
    }

    if (!targetSection) return false;
    if (completedSections.includes(targetSection.id)) return true;

    // Check if the previous absolute section is completed
    if (targetAbsIdx > 0 && targetAbsIdx - 1 < allCourseSections.length) {
      const prevSection = allCourseSections[targetAbsIdx - 1];
      return completedSections.includes(prevSection.id);
    }

    return false;
  };

  const isCurrentSectionDone = activeSection ? completedSections.includes(activeSection.id) : false;

  // ─── STEP PROGRESSION ACTIONS ───────────────────────────────────────────────
  const handleCompleteAndNext = async () => {
    if (!activeSection || !activeLesson || !course) return;

    setSavingProgress(true);
    const sectionId = activeSection.id;

    // 1. Update state
    let updatedCompleted = completedSections;
    if (!completedSections.includes(sectionId)) {
      updatedCompleted = [...completedSections, sectionId];
      setCompletedSections(updatedCompleted);
    }

    // 2. Save to Supabase or LocalStorage
    try {
      if (user?.id) {
        await saveUserSectionProgress({
          userId: String(user.id),
          courseId: course.id,
          lessonId: activeLesson.id,
          sectionId: sectionId,
          totalSectionsCount: totalSectionsCount,
          isCompleted: true
        });
      } else {
        localStorage.setItem(`veridu_course_progress_${course.id}`, JSON.stringify(updatedCompleted));
      }
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
      setActiveSectionIndex((prev) => prev + 1);
    } else if (activeLessonIndex < course.lessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
      setActiveSectionIndex(0);
    }
  };

  const handlePrevStep = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex((prev) => prev - 1);
    } else if (activeLessonIndex > 0 && course) {
      const prevLesson = course.lessons[activeLessonIndex - 1];
      const prevSectionsCount = prevLesson.sections?.length || 1;
      setActiveLessonIndex(activeLessonIndex - 1);
      setActiveSectionIndex(prevSectionsCount - 1);
    }
  };

  // ─── SECTION TYPE ICONS ─────────────────────────────────────────────────────
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
      case 'pdf': return 'Tài Liệu PDF';
      case 'quiz': return 'Trắc Nghiệm Củng Cố';
      case 'audio': return 'Audio Suy Niệm';
      default: return 'Bài Đọc Khảo Cứu';
    }
  };

  // Certificate Data for Modal
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
        <div className="text-center space-y-4 max-w-md bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-card)] shadow-2xl">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-serif font-black text-xl text-[var(--text-main)]">
            {error || 'Khóa học không tồn tại'}
          </h2>
          <Link 
            href="/khoa-hoc" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-400 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Quay Lại Danh Sách Khóa Học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-20 sm:pt-24 pb-20 font-sans">
      
      {/* ── 1. COURSE TOP BAR & BREADCRUMB ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
          
          <div className="flex items-center gap-3">
            <Link 
              href="/khoa-hoc" 
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-amber-500/50 transition shadow-sm"
              title="Quay lại danh mục"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span>{course.category}</span>
                <span>•</span>
                <span>{course.level}</span>
              </div>
              <h1 className="font-serif font-black text-base sm:text-xl text-[var(--text-main)] leading-tight">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Quick Progress Header */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] text-[var(--text-muted)] font-serif">Tiến độ khóa học</span>
              <span className="text-xs font-black font-mono text-amber-500">{progressPercent}% Hoàn Thành</span>
            </div>

            {progressPercent >= 100 && (
              <button
                onClick={() => setShowCertificate(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Nhận Chứng Chỉ</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── 2. MAIN LMS GRID (SINGLE-PAGE SECTION CANVAS + CURRICULUM DRAWER) ── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: SINGLE-PAGE FOCUS SECTION CANVAS (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Stepper Navigation: Current Lesson's Sections */}
            <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-card)]/50 pb-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-bold text-[10px]">
                    Bài {activeLesson?.orderNumber || activeLessonIndex + 1}
                  </span>
                  <h2 className="font-serif font-black text-sm sm:text-base text-[var(--text-main)]">
                    {activeLesson?.title}
                  </h2>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-serif">
                  Phần {activeSectionIndex + 1} / {currentSections.length}
                </span>
              </div>

              {/* Horizontal Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentSections.map((sec, sIdx) => {
                  const isDone = completedSections.includes(sec.id);
                  const isCurrent = sIdx === activeSectionIndex;
                  const unlocked = isSectionUnlocked(activeLessonIndex, sIdx);

                  return (
                    <button
                      key={sec.id}
                      disabled={!unlocked}
                      onClick={() => setActiveSectionIndex(sIdx)}
                      className={`p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-2 border text-xs cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-md ring-1 ring-amber-500/40'
                          : isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50'
                          : unlocked
                          ? 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-main)] hover:border-amber-500/30'
                          : 'bg-[var(--bg-main)]/50 border-[var(--border-card)]/40 text-[var(--text-muted)] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {getSectionIcon(sec.sectionType, 'w-3.5 h-3.5 shrink-0')}
                        <span className="truncate text-[11px]">{sec.title}</span>
                      </div>
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : !unlocked ? (
                        <Lock className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                      ) : isCurrent ? (
                        <Play className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 3. SINGLE-PAGE SECTION CONTAINER ── */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl space-y-6 relative overflow-hidden">
              
              {activeSection && (
                <>
                  {/* Section Title & Type Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                        {getSectionIcon(activeSection.sectionType, 'w-3.5 h-3.5')}
                        <span>{getSectionTypeLabel(activeSection.sectionType)}</span>
                      </div>
                      <h3 className="font-serif font-black text-xl sm:text-2xl text-[var(--text-main)] pt-1">
                        {activeSection.title}
                      </h3>
                    </div>

                    <span className="text-xs font-serif text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{activeSection.duration || `${activeSection.durationMinutes || 10} phút`}</span>
                    </span>
                  </div>

                  {/* ── A. VIDEO SECTION SINGLE PAGE ── */}
                  {activeSection.sectionType === 'video' && (
                    <div className="space-y-6">
                      {activeSection.mediaUrl ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-[var(--border-card)] shadow-2xl">
                          {(() => {
                            const media = resolveMediaEmbedUrl(activeSection.mediaUrl);
                            return (
                              <iframe
                                src={media.embedUrl}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={activeSection.title}
                              />
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="p-10 rounded-2xl bg-[var(--bg-main)] text-center space-y-3 border border-[var(--border-card)]">
                          <Video className="w-12 h-12 text-amber-500/50 mx-auto" />
                          <p className="font-serif text-sm text-[var(--text-muted)]">Chưa có liên kết video cho bài giảng này.</p>
                        </div>
                      )}

                      {activeSection.contentHtml && (
                        <div 
                          className="prose prose-veridu-sanitized max-w-none font-serif text-[var(--text-main)] text-base leading-relaxed pt-2"
                          dangerouslySetInnerHTML={{ __html: activeSection.contentHtml }}
                        />
                      )}
                    </div>
                  )}

                  {/* ── B. TEXT/WYSIWYG SECTION SINGLE PAGE ── */}
                  {activeSection.sectionType === 'text' && (
                    <div className="space-y-6">
                      {activeSection.contentHtml ? (
                        <div 
                          className="prose prose-veridu-sanitized max-w-none font-serif text-[var(--text-main)] text-base sm:text-lg leading-relaxed space-y-4"
                          dangerouslySetInnerHTML={{ __html: activeSection.contentHtml }}
                        />
                      ) : (
                        <p className="font-serif italic text-[var(--text-muted)]">Nội dung bài học đang được cập nhật.</p>
                      )}
                    </div>
                  )}

                  {/* ── C. PDF DOCUMENT VIEWER SINGLE PAGE ── */}
                  {activeSection.sectionType === 'pdf' && (
                    <div className="space-y-6">
                      {activeSection.mediaUrl ? (
                        <div className="space-y-4">
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

                          {/* PDF Viewer Frame */}
                          <div className="relative w-full h-[600px] sm:h-[750px] rounded-2xl overflow-hidden border border-[var(--border-card)] bg-slate-900 shadow-inner">
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
                          <p className="font-serif text-sm text-[var(--text-muted)]">Chưa có tệp PDF đính kèm cho phần học này.</p>
                        </div>
                      )}

                      {activeSection.contentHtml && (
                        <div 
                          className="prose prose-veridu-sanitized max-w-none font-serif text-[var(--text-main)] text-base leading-relaxed pt-2"
                          dangerouslySetInnerHTML={{ __html: activeSection.contentHtml }}
                        />
                      )}
                    </div>
                  )}

                  {/* ── D. QUIZ TEST SECTION SINGLE PAGE ── */}
                  {activeSection.sectionType === 'quiz' && (
                    <div className="space-y-6">
                      {activeSection.quizData && activeSection.quizData.length > 0 ? (
                        <div className="space-y-8">
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                            <span className="font-serif font-bold text-amber-700 dark:text-amber-400">
                              Bài Tập Thẩm Định Tri Thức ({activeSection.quizData.length} Câu Hỏi)
                            </span>
                            <span className="text-[var(--text-muted)] font-serif">
                              Đạt từ 66% để hoàn thành phần học
                            </span>
                          </div>

                          {activeSection.quizData.map((q, qIdx) => {
                            const selected = selectedAnswers[qIdx];
                            const isAnswered = selected !== undefined;
                            const isCorrect = selected === q.correctAnswerIndex;

                            return (
                              <div key={q.id || qIdx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
                                    <span className="text-amber-500 font-mono mr-2">Câu {qIdx + 1}.</span>
                                    {q.question}
                                  </h4>
                                  {isAnswered && (
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                                      isCorrect ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                                    }`}>
                                      {isCorrect ? 'Chính Xác' : 'Chưa Đúng'}
                                    </span>
                                  )}
                                </div>

                                {/* Options */}
                                <div className="space-y-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isChosen = selected === oIdx;
                                    const isCorrectOption = oIdx === q.correctAnswerIndex;
                                    
                                    let optionStyle = 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-main)] hover:border-amber-500/50';
                                    if (isAnswered) {
                                      if (isCorrectOption) {
                                        optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                                      } else if (isChosen && !isCorrect) {
                                        optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 line-through';
                                      } else {
                                        optionStyle = 'opacity-50 border-transparent';
                                      }
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={isAnswered}
                                        onClick={() => {
                                          setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                                          setShowQuizFeedback(true);
                                        }}
                                        className={`w-full p-3 rounded-xl border text-left transition-all text-xs font-serif flex items-center justify-between gap-2 cursor-pointer ${optionStyle}`}
                                      >
                                        <span>{opt}</span>
                                        {isAnswered && isCorrectOption && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Explanation Banner */}
                                {isAnswered && (
                                  <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif space-y-1 mt-2">
                                    <div className="font-bold text-amber-600 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                                      {isCorrect ? '✓ Chú giải thần học:' : '✗ Lời giải thích đúng:'}
                                    </div>
                                    <p className="text-[var(--text-muted)] leading-relaxed">{q.explanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-10 rounded-2xl bg-[var(--bg-main)] text-center space-y-3 border border-[var(--border-card)]">
                          <HelpCircle className="w-12 h-12 text-indigo-500/50 mx-auto" />
                          <p className="font-serif text-sm text-[var(--text-muted)]">Chưa có câu hỏi trắc nghiệm cho phần học này.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── E. AUDIO/PODCAST SECTION SINGLE PAGE ── */}
                  {activeSection.sectionType === 'audio' && (
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-center space-y-4 border border-white/10">
                      <Headphones className="w-14 h-14 text-amber-500 drop-shadow-md mx-auto" />
                      <h4 className="font-serif font-bold text-lg text-white">Nghe Đọc &amp; Suy Niệm Lời Chúa</h4>
                      {activeSection.mediaUrl ? (
                        <audio controls className="w-full max-w-md mx-auto" src={activeSection.mediaUrl}>
                          Trình duyệt của bạn không hỗ trợ phát âm thanh.
                        </audio>
                      ) : (
                        <p className="text-xs text-slate-400">Đang cập nhật tệp audio bài giảng.</p>
                      )}
                    </div>
                  )}

                  {/* ── DRIP ACTION FOOTER ── */}
                  <div className="pt-6 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={handlePrevStep}
                      disabled={activeLessonIndex === 0 && activeSectionIndex === 0}
                      className="px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-amber-500/40 disabled:opacity-30 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Phần Trước</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {isCurrentSectionDone && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                          <CheckCircle className="w-4 h-4" />
                          <span>Đã hoàn thành phần này</span>
                        </span>
                      )}

                      <button
                        onClick={handleCompleteAndNext}
                        disabled={savingProgress}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition hover:scale-105 cursor-pointer disabled:opacity-50"
                      >
                        {savingProgress ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang Lưu...</span>
                          </>
                        ) : activeSectionIndex === currentSections.length - 1 && activeLessonIndex === course.lessons.length - 1 ? (
                          <>
                            <Award className="w-4 h-4" />
                            <span>Hoàn Tất Khóa Học</span>
                          </>
                        ) : (
                          <>
                            <span>Hoàn Thành &amp; Tiếp Tục</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* ── RIGHT COLUMN: CURRICULUM ACCORDION & PROGRESS SIDEBAR (4 Cols) ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Progress Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Tiến Độ Tổng Thể</span>
                </h3>
                <span className="text-sm font-black font-mono text-amber-500">{progressPercent}%</span>
              </div>

              <div className="w-full bg-[var(--bg-main)] h-2.5 rounded-full overflow-hidden border border-[var(--border-card)]">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-serif pt-1">
                <span>{completedSections.length} / {totalSectionsCount} phần học hoàn tất</span>
                {progressPercent >= 100 && (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đạt chuẩn</span>
                  </span>
                )}
              </div>
            </div>

            {/* Curriculum Accordion (Tutor LMS / LearnDash Style) */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 flex flex-col max-h-[75vh]">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                <h3 className="font-serif font-bold text-base text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Giáo Trình Khóa Học</span>
                </h3>
                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                  {course.lessons.length} Bài Học
                </span>
              </div>

              {/* Lesson List */}
              <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent flex-1">
                {course.lessons.map((les, lIdx) => {
                  const isCurrentLesson = lIdx === activeLessonIndex;
                  const sections = les.sections && les.sections.length > 0 ? les.sections : [{ id: `fallback-${les.id}`, title: les.title, sectionType: 'text' } as any];
                  const lessonDoneCount = sections.filter((s: any) => completedSections.includes(s.id)).length;
                  const isLessonDone = sections.length > 0 && lessonDoneCount === sections.length;

                  return (
                    <div 
                      key={les.id} 
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isCurrentLesson 
                          ? 'border-amber-500/50 bg-amber-500/[0.03] shadow-md' 
                          : 'border-[var(--border-card)] bg-[var(--bg-main)]/50'
                      }`}
                    >
                      {/* Lesson Accordion Header */}
                      <button
                        onClick={() => {
                          setActiveLessonIndex(lIdx);
                          setActiveSectionIndex(0);
                        }}
                        className="w-full p-3.5 text-left flex items-start justify-between gap-2 transition cursor-pointer hover:bg-amber-500/5"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                              Bài {lIdx + 1}
                            </span>
                            {isLessonDone && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-xs text-[var(--text-main)] line-clamp-2 leading-tight">
                            {les.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                          {lessonDoneCount}/{sections.length}
                        </span>
                      </button>

                      {/* Sections List under this Lesson */}
                      <div className="p-2 pt-0 space-y-1 border-t border-[var(--border-card)]/40">
                        {sections.map((sec: any, sIdx: number) => {
                          const isSecActive = isCurrentLesson && sIdx === activeSectionIndex;
                          const isSecDone = completedSections.includes(sec.id);
                          const isSecUnlocked = isSectionUnlocked(lIdx, sIdx);

                          return (
                            <button
                              key={sec.id}
                              disabled={!isSecUnlocked}
                              onClick={() => {
                                setActiveLessonIndex(lIdx);
                                setActiveSectionIndex(sIdx);
                              }}
                              className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 text-[11px] cursor-pointer ${
                                isSecActive
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                                  : isSecDone
                                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-[var(--bg-card)]'
                                  : isSecUnlocked
                                  ? 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                                  : 'text-[var(--text-muted)]/40 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {getSectionIcon(sec.sectionType, 'w-3 h-3 shrink-0')}
                                <span className="truncate">{sec.title}</span>
                              </div>
                              {isSecDone ? (
                                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              ) : !isSecUnlocked ? (
                                <Lock className="w-2.5 h-2.5 text-[var(--text-muted)] shrink-0" />
                              ) : isSecActive ? (
                                <Play className="w-2.5 h-2.5 text-amber-500 fill-current shrink-0" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instructor Card */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shrink-0 bg-amber-500/10">
                  <Image 
                    src={course.instructor_avatar || 'https://lh3.googleusercontent.com/d/1iRz6nIRhfEoV_fbxVTCwW0ApQ87IqHK5'}
                    alt={course.instructor_name || 'Giảng Viên'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h5 className="font-serif font-bold text-xs text-[var(--text-main)] truncate">
                    {course.instructor_name || 'Ban Biên Tập VERIDU'}
                  </h5>
                  <p className="text-[10px] text-[var(--text-muted)] truncate font-serif">
                    {course.instructor_title || 'Hội Đồng Khảo Cứu Thần Học'}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* ── 4. COURSE CERTIFICATE MODAL ── */}
      <CourseCertificateModal
        certificate={showCertificate ? certificateData : null}
        onClose={() => setShowCertificate(false)}
      />

    </div>
  );
}
