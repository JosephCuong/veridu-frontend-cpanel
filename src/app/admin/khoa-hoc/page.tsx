'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  ExternalLink, 
  Layers, 
  Settings, 
  Sparkles, 
  Award, 
  GraduationCap, 
  Clock, 
  ArrowLeft, 
  Code, 
  Image as ImageIcon, 
  Headphones, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FolderPlus,
  BookMarked,
  Send,
  UploadCloud
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';
import FloatingFormatToolbar from '@/components/editor/FloatingFormatToolbar';
import CatholicBlockInserterModal from '@/components/editor/CatholicBlockInserterModal';
import QuizBankPickerModal from '@/components/editor/QuizBankPickerModal';

interface QuizItem {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface SectionItem {
  id?: number | string;
  title: string;
  section_type: 'video' | 'text' | 'pdf' | 'quiz' | 'audio';
  order_index: number;
  media_url?: string;
  content_html?: string;
  quiz_data?: QuizItem[];
  duration_minutes: number;
}

interface LessonItem {
  id?: number | string;
  title: string;
  slug?: string;
  description?: string;
  order_index: number;
  duration_minutes: number;
  sections: SectionItem[];
}

interface CourseItem {
  id?: number;
  author_id?: string;
  status?: 'draft' | 'pending' | 'published';
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  published: boolean;
  instructor_name: string;
  instructor_title: string;
  instructor_avatar: string;
  total_duration: string;
  certificate_enabled: boolean;
  lessons: LessonItem[];
}

const DEFAULT_NEW_COURSE: CourseItem = {
  title: 'Khóa Học Mới',
  slug: 'khoa-hoc-moi',
  status: 'draft',
  description: 'Mô tả tóm tắt nội dung và mục tiêu đào tạo của khóa học.',
  thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200&auto=format&fit=crop',
  category: 'Kinh Thánh Cựu Ước',
  level: 'Cơ Bản',
  published: false,
  instructor_name: 'Hội Đồng Khảo Cứu VERIDU',
  instructor_title: 'Giảng Viên Thần Học & Kinh Thánh',
  instructor_avatar: 'https://lh3.googleusercontent.com/d/1iRz6nIRhfEoV_fbxVTCwW0ApQ87IqHK5',
  total_duration: '4 Tuần Học',
  certificate_enabled: true,
  lessons: [
    {
      title: 'Bài 1: Khởi Đầu Hành Trình',
      slug: 'bai-1-khoi-dau',
      description: 'Tổng quan và các khái niệm nền tảng.',
      order_index: 1,
      duration_minutes: 20,
      sections: [
        {
          title: '1.1 Video Dẫn Nhập',
          section_type: 'video',
          order_index: 1,
          media_url: 'https://www.youtube.com/watch?v=VpbWbyx1008',
          duration_minutes: 10,
        },
        {
          title: '1.2 Văn Bản Chuyên Khảo',
          section_type: 'text',
          order_index: 2,
          content_html: `<p class="lead font-serif text-lg leading-relaxed text-[var(--text-main)]">
Nhấp trực tiếp vào đây để soạn thảo nội dung phần học. Bạn có thể sử dụng Sổ Tay 8 Khối Chuẩn Công Giáo để chèn trích dẫn Lời Chúa và lời chú giải.
</p>
<div class="sacred-scripture veridu-scripture-quote my-6 p-6 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 not-prose">
  <blockquote class="font-serif italic text-lg text-amber-100">
    “Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”
  </blockquote>
  <div class="mt-2 text-xs font-mono font-bold text-amber-300">Tv 119:105</div>
</div>`,
          duration_minutes: 10,
        }
      ]
    }
  ]
};

function resolveVideoEmbed(url?: string) {
  if (!url) return null;
  const clean = url.trim();

  // YouTube
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let videoId = '';
    if (clean.includes('youtu.be/')) {
      videoId = clean.split('youtu.be/')[1]?.split('?')[0] || '';
    } else {
      const match = clean.match(/[?&]v=([^&]+)/);
      if (match && match[1]) videoId = match[1];
    }
    if (videoId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
        id: videoId
      };
    }
  }

  // Google Drive
  if (clean.includes('drive.google.com')) {
    let fileId = '';
    const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
    return {
      type: 'drive',
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : clean,
      id: fileId
    };
  }

  // Direct Video
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(clean)) {
    return {
      type: 'mp4',
      embedUrl: clean
    };
  }

  return { type: 'link', embedUrl: clean };
}

function VisualCourseStudioContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const action = searchParams.get('action');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [coursesList, setCoursesList] = useState<Array<{ id: number; title: string; slug: string }>>([]);
  const [currentCourse, setCurrentCourse] = useState<CourseItem>(DEFAULT_NEW_COURSE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'Quản Trị Viên';
  const isInstructor = user?.role === 'instructor' || user?.role === 'Giảng Viên Thần Học' || user?.role === 'catechist' || user?.role === 'Giáo Lý Viên';

  // Selection state
  // 'course' | { type: 'lesson', lessonIndex: number } | { type: 'section', lessonIndex: number, sectionIndex: number }
  const [selectedNode, setSelectedNode] = useState<
    | { type: 'course' }
    | { type: 'lesson'; lessonIndex: number }
    | { type: 'section'; lessonIndex: number; sectionIndex: number }
  >({ type: 'course' });

  // Text Editor state for selected section
  const [textEditMode, setTextEditMode] = useState<'visual' | 'code'>('visual');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isQuizPickerOpen, setIsQuizPickerOpen] = useState(false);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Load courses list
  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadCourses() {
      try {
        setLoading(true);
        const res = await fetch('/api/courses/list');
        const data = await res.json();
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCoursesList(data.courses);
          if (editId) {
            loadCourseDetails(Number(editId));
          } else if (action === 'new') {
            setCurrentCourse({
              ...DEFAULT_NEW_COURSE,
              author_id: currentUser?.id ? String(currentUser.id) : undefined,
              status: 'draft',
              published: false
            });
            setSelectedNode({ type: 'course' });
            setLoading(false);
          } else {
            loadCourseDetails(data.courses[0].id);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching courses list:', err);
        setLoading(false);
      }
    }
    loadCourses();
  }, [editId, action]);

  const loadCourseDetails = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/get?id=${id}`);
      const data = await res.json();
      if (data.success && data.course) {
        const raw = data.course;
        const mappedLessons: LessonItem[] = (raw.lessons || []).map((l: any, lIdx: number) => ({
          id: l.id,
          title: l.title || `Bài học ${lIdx + 1}`,
          slug: l.slug || `bai-${lIdx + 1}`,
          description: l.description || '',
          order_index: l.order_index || lIdx + 1,
          duration_minutes: l.duration_minutes || 15,
          sections: (l.lesson_sections || []).map((s: any, sIdx: number) => ({
            id: s.id,
            title: s.title || `Phần ${sIdx + 1}`,
            section_type: s.section_type || 'text',
            order_index: s.order_index || sIdx + 1,
            media_url: s.media_url || '',
            content_html: s.content_html || '',
            quiz_data: Array.isArray(s.quiz_data) ? s.quiz_data : [],
            duration_minutes: s.duration_minutes || 10,
          }))
        }));

        setCurrentCourse({
          id: raw.id,
          author_id: raw.author_id,
          status: raw.status || (raw.published ? 'published' : 'draft'),
          title: raw.title || 'Khóa Học',
          slug: raw.slug || 'khoa-hoc',
          description: raw.description || '',
          thumbnail: raw.thumbnail || '',
          category: raw.category || 'Kinh Thánh Cựu Ước',
          level: raw.level || 'Cơ Bản',
          published: raw.status === 'published' || Boolean(raw.published),
          instructor_name: raw.instructor_name || 'VERIDU Team',
          instructor_title: raw.instructor_title || 'Hội Đồng Khảo Cứu Thần Học',
          instructor_avatar: raw.instructor_avatar || 'https://lh3.googleusercontent.com/d/1iRz6nIRhfEoV_fbxVTCwW0ApQ87IqHK5',
          total_duration: raw.total_duration || `${mappedLessons.length} Bài Học`,
          certificate_enabled: raw.certificate_enabled ?? true,
          lessons: mappedLessons
        });
        setSelectedNode({ type: 'course' });
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Error loading course details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync contentEditable with current section content_html
  useEffect(() => {
    if (selectedNode.type === 'section' && visualEditorRef.current) {
      const sec = currentCourse.lessons[selectedNode.lessonIndex]?.sections[selectedNode.sectionIndex];
      if (sec && sec.section_type === 'text') {
        visualEditorRef.current.innerHTML = sec.content_html || '';
      }
    }
  }, [selectedNode, currentCourse.lessons]);

  // Handle Save Course to Supabase
  const handleSaveCourse = async (overrideStatus?: 'draft' | 'pending' | 'published') => {
    try {
      setSaving(true);
      setStatusMessage(null);

      // Read current text content from contentEditable if active
      if (selectedNode.type === 'section' && visualEditorRef.current) {
        const sec = currentCourse.lessons[selectedNode.lessonIndex]?.sections[selectedNode.sectionIndex];
        if (sec && sec.section_type === 'text') {
          sec.content_html = visualEditorRef.current.innerHTML;
        }
      }

      const targetStatus = overrideStatus || currentCourse.status || (isAdmin ? 'published' : 'draft');
      const courseToSave = {
        ...currentCourse,
        author_id: currentCourse.author_id || (user?.id ? String(user.id) : undefined),
        status: targetStatus,
        published: targetStatus === 'published'
      };

      const res = await fetch('/api/courses/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseToSave })
      });

      const data = await res.json();
      if (data.success) {
        setHasUnsavedChanges(false);
        const msg = targetStatus === 'pending'
          ? 'Đã gửi khóa học lên Ban Quản Trị phê duyệt thành công!'
          : targetStatus === 'published'
          ? 'Đã lưu và xuất bản khóa học công khai thành công!'
          : 'Đã lưu bản nháp khóa học thành công!';
        setStatusMessage({ text: msg, type: 'success' });
        
        // Refresh courses list and reload
        const listRes = await fetch('/api/courses/list');
        const listData = await listRes.json();
        if (listData.success) {
          setCoursesList(listData.courses);
        }
        if (data.courseId) {
          loadCourseDetails(data.courseId);
        }
      } else {
        setStatusMessage({ text: data.error || 'Lỗi khi lưu khóa học', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Lỗi kết nối máy chủ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ─── CURRICULUM MUTATION ACTIONS ───────────────────────────────────────────
  const addLesson = () => {
    const newIdx = currentCourse.lessons.length + 1;
    const newLesson: LessonItem = {
      title: `Bài ${newIdx}: Tiêu đề bài học mới`,
      slug: `bai-${newIdx}`,
      description: '',
      order_index: newIdx,
      duration_minutes: 20,
      sections: [
        {
          title: `${newIdx}.1 Video Dẫn Nhập`,
          section_type: 'video',
          order_index: 1,
          media_url: '',
          duration_minutes: 10,
        }
      ]
    };
    setCurrentCourse(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
    setSelectedNode({ type: 'lesson', lessonIndex: currentCourse.lessons.length });
    setHasUnsavedChanges(true);
  };

  const removeLesson = (lIdx: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này cùng toàn bộ các phần con?')) return;
    setCurrentCourse(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, idx) => idx !== lIdx)
    }));
    setSelectedNode({ type: 'course' });
    setHasUnsavedChanges(true);
  };

  const moveLesson = (lIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? lIdx - 1 : lIdx + 1;
    if (targetIdx < 0 || targetIdx >= currentCourse.lessons.length) return;
    const newLessons = [...currentCourse.lessons];
    const temp = newLessons[lIdx];
    newLessons[lIdx] = newLessons[targetIdx];
    newLessons[targetIdx] = temp;
    newLessons.forEach((l, i) => { l.order_index = i + 1; });
    setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
    setSelectedNode({ type: 'lesson', lessonIndex: targetIdx });
    setHasUnsavedChanges(true);
  };

  const addSection = (lIdx: number, type: 'video' | 'text' | 'pdf' | 'quiz' | 'audio' = 'text') => {
    const lesson = currentCourse.lessons[lIdx];
    const newSecIdx = (lesson.sections?.length || 0) + 1;
    const typeNames: Record<string, string> = {
      video: 'Video Chuyên Đề',
      text: 'Văn Bản Chú Giải',
      quiz: 'Trắc Nghiệm Củng Cố',
      pdf: 'Tài Liệu Chuyên Khảo',
      audio: 'Nghe Bài Giảng'
    };

    const newSection: SectionItem = {
      title: `${lIdx + 1}.${newSecIdx} ${typeNames[type]}`,
      section_type: type,
      order_index: newSecIdx,
      duration_minutes: 10,
      content_html: type === 'text' ? '<p class="lead font-serif text-lg">Nhấp trực tiếp để soạn thảo nội dung phần học này.</p>' : '',
      media_url: '',
      quiz_data: type === 'quiz' ? [
        {
          id: Date.now(),
          question: 'Nhập câu hỏi trắc nghiệm tại đây...',
          options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
          correct_index: 0,
          explanation: 'Giải thích lý do lựa chọn này chính xác.'
        }
      ] : []
    };

    const newLessons = [...currentCourse.lessons];
    newLessons[lIdx].sections = [...(newLessons[lIdx].sections || []), newSection];
    setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
    setSelectedNode({ type: 'section', lessonIndex: lIdx, sectionIndex: newSecIdx - 1 });
    setHasUnsavedChanges(true);
  };

  const removeSection = (lIdx: number, sIdx: number) => {
    if (!confirm('Xóa phần học này?')) return;
    const newLessons = [...currentCourse.lessons];
    newLessons[lIdx].sections = newLessons[lIdx].sections.filter((_, idx) => idx !== sIdx);
    setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
    setSelectedNode({ type: 'lesson', lessonIndex: lIdx });
    setHasUnsavedChanges(true);
  };

  const moveSection = (lIdx: number, sIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? sIdx - 1 : sIdx + 1;
    const sections = currentCourse.lessons[lIdx].sections;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const newSecs = [...sections];
    const temp = newSecs[sIdx];
    newSecs[sIdx] = newSecs[targetIdx];
    newSecs[targetIdx] = temp;
    newSecs.forEach((s, i) => { s.order_index = i + 1; });
    const newLessons = [...currentCourse.lessons];
    newLessons[lIdx].sections = newSecs;
    setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
    setSelectedNode({ type: 'section', lessonIndex: lIdx, sectionIndex: targetIdx });
    setHasUnsavedChanges(true);
  };

  // ─── DERIVED CURRENT SELECTION ──────────────────────────────────────────────
  const activeLesson = selectedNode.type !== 'course' ? currentCourse.lessons[selectedNode.lessonIndex] : null;
  const activeSection = selectedNode.type === 'section' && activeLesson ? activeLesson.sections[selectedNode.sectionIndex] : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* ─── TOP MASTER STUDIO TOOLBAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 bg-stone-950/95 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 flex items-center justify-between shadow-lg shadow-black/40">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/admin"
            className="p-2 rounded-xl text-stone-400 hover:text-amber-400 hover:bg-stone-900 border border-stone-800 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Quay lại Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Admin</span>
          </Link>

          <div className="h-6 w-px bg-stone-800 hidden sm:block" />

          {/* Course Selector Dropdown */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-4 h-4" />
            </div>
            <select
              value={currentCourse.id || 'new'}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setCurrentCourse(DEFAULT_NEW_COURSE);
                  setSelectedNode({ type: 'course' });
                  setHasUnsavedChanges(true);
                } else {
                  loadCourseDetails(Number(e.target.value));
                }
              }}
              className="bg-stone-900/90 text-stone-100 font-serif font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-stone-700/80 focus:border-amber-500 focus:outline-hidden max-w-[200px] sm:max-w-xs md:max-w-md truncate"
            >
              {coursesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
              <option value="new">+ Soạn Khóa Học Mới...</option>
            </select>
          </div>

          {/* Changes badge */}
          {hasUnsavedChanges ? (
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
              ● Chưa lưu thay đổi
            </span>
          ) : (
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Check className="w-3 h-3" /> Đã đồng bộ Supabase
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status Badge */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            currentCourse.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : currentCourse.status === 'pending'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
              : 'bg-stone-800 text-stone-400 border border-stone-700'
          }`}>
            {currentCourse.status === 'published' ? '🟢 Đã Xuất Bản' : currentCourse.status === 'pending' ? '🟡 Chờ Phê Duyệt' : '⚪ Bản Nháp'}
          </span>

          <button
            onClick={() => {
              setCurrentCourse({
                ...DEFAULT_NEW_COURSE,
                author_id: user?.id ? String(user.id) : undefined,
                status: 'draft',
                published: false
              });
              setSelectedNode({ type: 'course' });
              setHasUnsavedChanges(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-semibold transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Khóa Mới</span>
          </button>

          {currentCourse.slug && (
            <Link
              href={`/khoa-hoc/${currentCourse.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all shadow-xs"
              title="Mở LMS Player xem thử như học viên"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xem Thực Tế</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          )}

          {/* Save Draft */}
          <button
            onClick={() => handleSaveCourse('draft')}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-bold transition-all"
            title="Lưu bản nháp khóa học"
          >
            Lưu Nháp
          </button>

          {/* Admin Publish vs Instructor Submit */}
          {isAdmin ? (
            <button
              onClick={() => handleSaveCourse('published')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu &amp; Xuất Bản</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleSaveCourse('pending')}
              disabled={saving || currentCourse.status === 'pending'}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              title="Gửi khóa học lên Ban Quản Trị phê duyệt"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{currentCourse.status === 'pending' ? 'Đã Gửi Duyệt' : 'Gửi Phê Duyệt'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Status Alert Toast */}
      {statusMessage && (
        <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
            : 'bg-red-950/80 border-red-800 text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ─── 2-COLUMN WORKSPACE ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* ─── LEFT COLUMN: CURRICULUM TREE & BUILDER (340px - 380px) ───────── */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 bg-stone-950/80 border-r border-stone-800/80 flex flex-col overflow-y-auto custom-scrollbar h-auto md:h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Giáo Trình Khóa Học
              </span>
              <span className="text-xs font-mono text-stone-400">
                {currentCourse.lessons.length} Bài • {currentCourse.lessons.reduce((acc, l) => acc + (l.sections?.length || 0), 0)} Phần
              </span>
            </div>

            {/* Root Course Node */}
            <button
              onClick={() => setSelectedNode({ type: 'course' })}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                selectedNode.type === 'course'
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-md shadow-amber-500/5'
                  : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-900 hover:border-stone-700'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-sm truncate">{currentCourse.title || 'Thông Tin Khóa Học'}</h4>
                <p className="text-[11px] text-stone-400">Cấu hình chung, giảng viên & chứng chỉ</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </button>

            <button
              onClick={addLesson}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-500/80 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bài Học Mới</span>
            </button>
          </div>

          {/* Lessons & Sections Accordion Tree */}
          <div className="flex-1 p-4 space-y-4">
            {currentCourse.lessons.map((lesson, lIdx) => {
              const isLessonSelected = selectedNode.type === 'lesson' && selectedNode.lessonIndex === lIdx;

              return (
                <div key={lIdx} className="rounded-2xl border border-stone-800/80 bg-stone-900/40 overflow-hidden">
                  
                  {/* Lesson Header */}
                  <div 
                    onClick={() => setSelectedNode({ type: 'lesson', lessonIndex: lIdx })}
                    className={`p-3 cursor-pointer flex items-center justify-between border-b transition-colors ${
                      isLessonSelected 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                        : 'border-stone-800/60 hover:bg-stone-900/80 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-stone-800 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-stone-700">
                        {lIdx + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="font-serif font-semibold text-xs sm:text-sm truncate">
                          {lesson.title}
                        </h5>
                        <p className="text-[11px] text-stone-400">
                          {lesson.sections?.length || 0} phần học • {lesson.duration_minutes || 15} phút
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => moveLesson(lIdx, 'up')}
                        disabled={lIdx === 0}
                        className="p-1 rounded text-stone-400 hover:text-stone-200 disabled:opacity-30"
                        title="Di chuyển lên"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveLesson(lIdx, 'down')}
                        disabled={lIdx === currentCourse.lessons.length - 1}
                        className="p-1 rounded text-stone-400 hover:text-stone-200 disabled:opacity-30"
                        title="Di chuyển xuống"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeLesson(lIdx)}
                        className="p-1 rounded text-stone-400 hover:text-red-400"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sections List */}
                  <div className="p-2 space-y-1.5 bg-stone-950/40">
                    {(lesson.sections || []).map((sec, sIdx) => {
                      const isSectionSelected = selectedNode.type === 'section' && 
                        selectedNode.lessonIndex === lIdx && 
                        selectedNode.sectionIndex === sIdx;

                      const typeIcons: Record<string, any> = {
                        video: <Video className="w-3.5 h-3.5 text-blue-400" />,
                        text: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
                        quiz: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />,
                        pdf: <BookOpen className="w-3.5 h-3.5 text-rose-400" />,
                        audio: <Headphones className="w-3.5 h-3.5 text-purple-400" />,
                      };

                      return (
                        <div
                          key={sIdx}
                          onClick={() => setSelectedNode({ type: 'section', lessonIndex: lIdx, sectionIndex: sIdx })}
                          className={`px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer border transition-all ${
                            isSectionSelected
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-100 font-semibold shadow-xs'
                              : 'bg-stone-900/40 border-stone-800/60 hover:bg-stone-900 text-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{typeIcons[sec.section_type] || <FileText className="w-3.5 h-3.5" />}</span>
                            <span className="truncate">{sec.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-mono text-stone-500 mr-1">{sec.duration_minutes || 10}p</span>
                            <button
                              onClick={() => moveSection(lIdx, sIdx, 'up')}
                              disabled={sIdx === 0}
                              className="p-0.5 rounded text-stone-400 hover:text-stone-200 disabled:opacity-20"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveSection(lIdx, sIdx, 'down')}
                              disabled={sIdx === lesson.sections.length - 1}
                              className="p-0.5 rounded text-stone-400 hover:text-stone-200 disabled:opacity-20"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeSection(lIdx, sIdx)}
                              className="p-0.5 rounded text-stone-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Section Buttons Bar */}
                    <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider pl-1">+ Thêm phần:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => addSection(lIdx, 'video')}
                          className="px-1.5 py-1 rounded-lg bg-stone-900 hover:bg-blue-500/20 text-stone-300 hover:text-blue-300 border border-stone-800 text-[10px] transition-colors"
                          title="Thêm Video"
                        >
                          🎬 Video
                        </button>
                        <button
                          onClick={() => addSection(lIdx, 'text')}
                          className="px-1.5 py-1 rounded-lg bg-stone-900 hover:bg-emerald-500/20 text-stone-300 hover:text-emerald-300 border border-stone-800 text-[10px] transition-colors"
                          title="Thêm Bài Đọc"
                        >
                          📖 Đọc
                        </button>
                        <button
                          onClick={() => addSection(lIdx, 'quiz')}
                          className="px-1.5 py-1 rounded-lg bg-stone-900 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-800 text-[10px] transition-colors"
                          title="Thêm Trắc Nghiệm"
                        >
                          ❓ Quiz
                        </button>
                        <button
                          onClick={() => addSection(lIdx, 'pdf')}
                          className="px-1.5 py-1 rounded-lg bg-stone-900 hover:bg-rose-500/20 text-stone-300 hover:text-rose-300 border border-stone-800 text-[10px] transition-colors"
                          title="Thêm Tài Liệu"
                        >
                          📑 PDF
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── RIGHT COLUMN: LIVE VISUAL CANVAS & INSPECTOR ─────────────────── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-stone-950/40">
          
          {/* 1. COURSE ROOT INSPECTOR */}
          {selectedNode.type === 'course' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2.5">
                    <GraduationCap className="w-6 h-6 text-amber-400" />
                    Cấu Hình Tổng Quan Khóa Học
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Thiết lập thông tin khóa học, giảng viên phụ trách, phân loại và chứng nhận.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Tiêu Đề Khóa Học *</label>
                  <input
                    type="text"
                    value={currentCourse.title}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, title: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="VD: Nhập Môn Kinh Thánh Cựu Ước: Khảo Luận Lịch Sử Cứu Độ"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-sm font-serif font-bold text-stone-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Đường Dẫn Slug *</label>
                  <input
                    type="text"
                    value={currentCourse.slug}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, slug: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="nhap-mon-cuu-uoc"
                    className="w-full px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs font-mono text-stone-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Chuyên Mục</label>
                  <select
                    value={currentCourse.category}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, category: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs text-stone-200"
                  >
                    <option value="Kinh Thánh Cựu Ước">Kinh Thánh Cựu Ước</option>
                    <option value="Kinh Thánh Tân Ước">Kinh Thánh Tân Ước</option>
                    <option value="Thần Học Phụng Vụ">Thần Học Phụng Vụ</option>
                    <option value="Giáo Lý Dự Tòng & Hôn Nhân">Giáo Lý Dự Tòng & Hôn Nhân</option>
                    <option value="Lịch Sử Giáo Hội">Lịch Sử Giáo Hội</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Cấp Độ Khóa Học</label>
                  <select
                    value={currentCourse.level}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, level: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs text-stone-200"
                  >
                    <option value="Cơ Bản">Cơ Bản</option>
                    <option value="Trung Cấp">Trung Cấp</option>
                    <option value="Nâng Cao & Học Thuật">Nâng Cao & Học Thuật</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Thời Lượng Dự Kiến</label>
                  <input
                    type="text"
                    value={currentCourse.total_duration}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, total_duration: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="VD: 4 Tuần • 12 Bài Học"
                    className="w-full px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs text-stone-200"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Mô Tả Tổng Quan Khóa Học</label>
                  <textarea
                    rows={3}
                    value={currentCourse.description}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, description: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Tóm tắt giá trị thần học, mục tiêu đạt được và đối tượng học viên..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs text-stone-200 leading-relaxed"
                  />
                </div>

                {/* Thumbnail Image */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Ảnh Bìa Khóa Học (Thumbnail URL)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="text"
                      value={currentCourse.thumbnail}
                      onChange={(e) => {
                        setCurrentCourse(prev => ({ ...prev, thumbnail: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://... hoặc ảnh Google Drive"
                      className="flex-1 px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs font-mono text-stone-200"
                    />
                    {currentCourse.thumbnail && (
                      <div className="w-32 h-20 rounded-xl overflow-hidden border border-stone-700 relative shrink-0 shadow-md">
                        <img src={currentCourse.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructor Details Card */}
                <div className="md:col-span-2 p-5 rounded-2xl border border-stone-800 bg-stone-900/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Thông Tin Giảng Viên / Hội Đồng
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-stone-400 font-medium">Tên Giảng Viên</label>
                      <input
                        type="text"
                        value={currentCourse.instructor_name}
                        onChange={(e) => {
                          setCurrentCourse(prev => ({ ...prev, instructor_name: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-stone-400 font-medium">Học Vị / Chức Danh</label>
                      <input
                        type="text"
                        value={currentCourse.instructor_title}
                        onChange={(e) => {
                          setCurrentCourse(prev => ({ ...prev, instructor_title: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] text-stone-400 font-medium">Avatar Giảng Viên (URL)</label>
                      <input
                        type="text"
                        value={currentCourse.instructor_avatar}
                        onChange={(e) => {
                          setCurrentCourse(prev => ({ ...prev, instructor_avatar: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Certificate Toggle */}
                <div className="md:col-span-2 flex items-center justify-between p-4 rounded-2xl border border-stone-800 bg-stone-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs sm:text-sm text-stone-100">Cấp Chứng Chỉ Hoàn Thành (Certificate)</h5>
                      <p className="text-[11px] text-stone-400">Tự động cấp chứng chỉ PDF/ảnh phụng vụ khi học viên hoàn thành 100% khóa học.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentCourse.certificate_enabled}
                    onChange={(e) => {
                      setCurrentCourse(prev => ({ ...prev, certificate_enabled: e.target.checked }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. LESSON LEVEL INSPECTOR */}
          {selectedNode.type === 'lesson' && activeLesson && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2.5">
                    <BookMarked className="w-6 h-6 text-amber-400" />
                    Biên Tập Bài Học #{selectedNode.lessonIndex + 1}
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Cấu hình tiêu đề, mục tiêu đào tạo và các phần học con thuộc bài học này.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Tiêu Đề Bài Học *</label>
                  <input
                    type="text"
                    value={activeLesson.title}
                    onChange={(e) => {
                      const newLessons = [...currentCourse.lessons];
                      newLessons[selectedNode.lessonIndex].title = e.target.value;
                      setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="VD: Ơn Gọi Áp-ra-ham: Hành Trình Bỏ Xứ Đi Theo Tiếng Chúa (Lekh-Lekha)"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-sm font-serif font-bold text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Mã Nhận Diện (Slug)</label>
                    <input
                      type="text"
                      value={activeLesson.slug || ''}
                      onChange={(e) => {
                        const newLessons = [...currentCourse.lessons];
                        newLessons[selectedNode.lessonIndex].slug = e.target.value;
                        setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs font-mono text-stone-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Thời Lượng Ước Tính (Phút)</label>
                    <input
                      type="number"
                      value={activeLesson.duration_minutes || 15}
                      onChange={(e) => {
                        const newLessons = [...currentCourse.lessons];
                        newLessons[selectedNode.lessonIndex].duration_minutes = Number(e.target.value);
                        setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs text-stone-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Tóm Tắt Mục Tiêu Bài Học</label>
                  <textarea
                    rows={3}
                    value={activeLesson.description || ''}
                    onChange={(e) => {
                      const newLessons = [...currentCourse.lessons];
                      newLessons[selectedNode.lessonIndex].description = e.target.value;
                      setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Mô tả mục tiêu người học cần nắm bắt sau khi hoàn thành bài này..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs text-stone-200 leading-relaxed"
                  />
                </div>

                {/* Sections Overview List */}
                <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                      Các Phần Học Trực Quan Thuộc Bài Này ({activeLesson.sections?.length || 0})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(activeLesson.sections || []).map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedNode({ type: 'section', lessonIndex: selectedNode.lessonIndex, sectionIndex: idx })}
                        className="p-3 rounded-xl border border-stone-800 bg-stone-950/60 hover:border-amber-500/50 hover:bg-stone-900 cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-amber-400 font-bold">{idx + 1}.</span>
                          <span className="truncate">{s.title}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 uppercase font-mono">
                          {s.section_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SECTION LEVEL INSPECTOR & VISUAL CANVAS */}
          {selectedNode.type === 'section' && activeSection && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              
              {/* Section Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-amber-500 font-mono mb-1">
                    <span>Bài {selectedNode.lessonIndex + 1}</span>
                    <span>•</span>
                    <span>Phần {selectedNode.sectionIndex + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) => {
                      const newLessons = [...currentCourse.lessons];
                      newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].title = e.target.value;
                      setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Tiêu đề phần học..."
                    className="w-full bg-transparent border-0 font-serif text-xl sm:text-2xl font-bold text-amber-100 focus:outline-hidden placeholder:text-stone-600"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <input
                      type="number"
                      value={activeSection.duration_minutes || 10}
                      onChange={(e) => {
                        const newLessons = [...currentCourse.lessons];
                        newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].duration_minutes = Number(e.target.value);
                        setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-10 bg-transparent text-center font-mono font-bold focus:outline-hidden"
                    />
                    <span>phút</span>
                  </div>
                </div>
              </div>

              {/* Section Type Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-stone-900/80 border border-stone-800">
                {[
                  { id: 'video', label: '🎬 Video', desc: 'YouTube, Facebook, Drive, MP4' },
                  { id: 'text', label: '📖 Bài Đọc / Text', desc: 'Live Visual Canvas WYSIWYG' },
                  { id: 'quiz', label: '❓ Trắc Nghiệm / Quiz', desc: 'Drip-Quiz & Ngân Hàng 230 Câu' },
                  { id: 'pdf', label: '📑 Tài Liệu / PDF', desc: 'Nhúng văn kiện & file Drive' },
                  { id: 'audio', label: '🎧 Âm Thanh / Audio', desc: 'Bài giảng & podcast' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const newLessons = [...currentCourse.lessons];
                      newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].section_type = tab.id as any;
                      setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center ${
                      activeSection.section_type === tab.id
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ─── SECTION TYPE: VIDEO ────────────────────────────────────── */}
              {activeSection.section_type === 'video' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Đường Dẫn Video (Hỗ trợ YouTube, Facebook, Google Drive, MP4)
                    </label>
                    <input
                      type="text"
                      value={activeSection.media_url || ''}
                      onChange={(e) => {
                        const newLessons = [...currentCourse.lessons];
                        newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].media_url = e.target.value;
                        setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://www.youtube.com/watch?v=... hoặc link Google Drive, MP4"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs font-mono text-stone-100"
                    />
                  </div>

                  {/* Live Video Preview Canvas */}
                  <div className="rounded-3xl border border-amber-500/20 bg-stone-950/80 overflow-hidden shadow-2xl">
                    <div className="px-4 py-2.5 border-b border-stone-800 bg-stone-900/50 flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1.5 font-mono text-amber-400">
                        <Video className="w-3.5 h-3.5" /> Khung Xem Trước Video Thực Tế (16:9)
                      </span>
                    </div>

                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      {(() => {
                        const resolved = resolveVideoEmbed(activeSection.media_url);
                        if (!resolved || !activeSection.media_url) {
                          return (
                            <div className="text-center text-stone-500 p-6">
                              <Video className="w-12 h-12 stroke-[1.5] mx-auto mb-2 opacity-50 text-stone-600" />
                              <p className="text-xs">Nhập link video ở trên để xem trước trực quan tại đây</p>
                            </div>
                          );
                        }

                        if (resolved.type === 'youtube' || resolved.type === 'drive') {
                          return (
                            <iframe
                              src={resolved.embedUrl}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        if (resolved.type === 'mp4') {
                          return (
                            <video src={resolved.embedUrl} controls className="w-full h-full object-contain" />
                          );
                        }

                        return (
                          <div className="p-4 text-center">
                            <p className="text-xs text-stone-400">Video Link: {activeSection.media_url}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── SECTION TYPE: TEXT / READING (LIVE VISUAL CANVAS) ───────── */}
              {activeSection.section_type === 'text' && (
                <div className="space-y-4">
                  {/* Text Toolbar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 p-2 rounded-2xl bg-stone-900/80 border border-stone-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-xl bg-stone-950 p-1 border border-stone-800">
                        <button
                          onClick={() => setTextEditMode('visual')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            textEditMode === 'visual'
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          👁️ Live Visual Canvas
                        </button>
                        <button
                          onClick={() => {
                            // Sync HTML from contentEditable
                            if (visualEditorRef.current) {
                              const newLessons = [...currentCourse.lessons];
                              newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].content_html = visualEditorRef.current.innerHTML;
                              setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                            }
                            setTextEditMode('code');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            textEditMode === 'code'
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          💻 Mã Nguồn HTML
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsBlockModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>📖 Sổ Tay 8 Khối Chuẩn Công Giáo</span>
                    </button>
                  </div>

                  {/* VISUAL MODE: CONTENTEDITABLE WITH FLOATING TOOLBAR */}
                  {textEditMode === 'visual' ? (
                    <div className="relative rounded-3xl border border-stone-800 bg-stone-900/40 p-6 sm:p-8 min-h-[400px] shadow-inner">
                      <FloatingFormatToolbar
                        editorRef={visualEditorRef as any}
                        onContentChange={() => {
                          if (visualEditorRef.current) {
                            const newLessons = [...currentCourse.lessons];
                            newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].content_html = visualEditorRef.current.innerHTML;
                            setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                            setHasUnsavedChanges(true);
                          }
                        }}
                      />

                      <div
                        ref={visualEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => {
                          if (visualEditorRef.current) {
                            const newLessons = [...currentCourse.lessons];
                            newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].content_html = visualEditorRef.current.innerHTML;
                            setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                            setHasUnsavedChanges(true);
                          }
                        }}
                        className="prose prose-invert prose-amber max-w-none focus:outline-hidden font-serif text-base sm:text-lg leading-relaxed text-stone-200 selection:bg-amber-500/30"
                      />
                    </div>
                  ) : (
                    /* CODE MODE: MONOSPACED RAW HTML */
                    <div className="rounded-3xl border border-stone-800 bg-stone-950 p-4">
                      <textarea
                        rows={16}
                        value={activeSection.content_html || ''}
                        onChange={(e) => {
                          const newLessons = [...currentCourse.lessons];
                          newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].content_html = e.target.value;
                          setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full h-full bg-transparent border-0 font-mono text-xs text-amber-200 leading-relaxed focus:outline-hidden resize-y"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ─── SECTION TYPE: QUIZ (DRIP-FEEDING BUILDER) ──────────────── */}
              {activeSection.section_type === 'quiz' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div>
                      <h4 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-amber-400" />
                        Trắc Nghiệm Nhỏ Giọt & Củng Cố Kiến Thức
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Học viên phải trả lời từng câu, đạt tối thiểu 80% để mở khóa bài học tiếp theo.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsQuizPickerOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>📚 Chọn Từ Ngân Hàng 230 Câu Giáo Lý</span>
                      </button>

                      <button
                        onClick={() => {
                          const newQuiz: QuizItem = {
                            id: Date.now(),
                            question: 'Nhập câu hỏi mới...',
                            options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
                            correct_index: 0,
                            explanation: 'Giải thích lý do lựa chọn này chính xác.'
                          };
                          const newLessons = [...currentCourse.lessons];
                          const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
                          newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = [...curQuiz, newQuiz];
                          setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                          setHasUnsavedChanges(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>+ Thêm Câu Tự Do</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Questions */}
                  <div className="space-y-4">
                    {(!activeSection.quiz_data || activeSection.quiz_data.length === 0) ? (
                      <div className="py-12 text-center rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 text-stone-500">
                        <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-stone-600" />
                        <p className="text-xs font-medium">Chưa có câu hỏi nào trong bài trắc nghiệm này.</p>
                        <p className="text-[11px] text-stone-600 mt-1">Bấm nút trên để chọn từ ngân hàng 230 câu hoặc thêm câu tự do.</p>
                      </div>
                    ) : (
                      activeSection.quiz_data.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="p-5 rounded-2xl border border-stone-800 bg-stone-900/50 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                              <span>Câu {qIdx + 1}</span>
                            </span>
                            <button
                              onClick={() => {
                                const newLessons = [...currentCourse.lessons];
                                const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
                                newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = curQuiz.filter((_, idx) => idx !== qIdx);
                                setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                                setHasUnsavedChanges(true);
                              }}
                              className="text-stone-400 hover:text-red-400 p-1 rounded"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Question Text */}
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              const newLessons = [...currentCourse.lessons];
                              const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
                              curQuiz[qIdx].question = e.target.value;
                              newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = curQuiz;
                              setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="Nội dung câu hỏi..."
                            className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700/80 text-xs sm:text-sm font-semibold text-stone-100 focus:border-amber-500 focus:outline-hidden"
                          />

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                  q.correct_index === oIdx
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'
                                    : 'bg-stone-950 border-stone-800 text-stone-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct_${q.id || qIdx}`}
                                  checked={q.correct_index === oIdx}
                                  onChange={() => {
                                    const newLessons = [...currentCourse.lessons];
                                    const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
                                    curQuiz[qIdx].correct_index = oIdx;
                                    newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = curQuiz;
                                    setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-4 h-4 accent-emerald-500 shrink-0 cursor-pointer"
                                />
                                <span className="font-mono font-bold text-xs">{String.fromCharCode(65 + oIdx)}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newLessons = [...currentCourse.lessons];
                                    const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
                                    curQuiz[qIdx].options[oIdx] = e.target.value;
                                    newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = curQuiz;
                                    setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="flex-1 bg-transparent border-0 text-xs focus:outline-hidden truncate"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Explanation */}
                          <div className="space-y-1">
                            <label className="text-[11px] text-stone-400 font-medium">💡 Chú giải thần học / Lý do đáp án đúng</label>
                            <input
                              type="text"
                              value={q.explanation || ''}
                              onChange={(e) => {
                                const newLessons = [...currentCourse.lessons];
                                const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
                                curQuiz[qIdx].explanation = e.target.value;
                                newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = curQuiz;
                                setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Trích dẫn Kinh Thánh hoặc giáo lý bổ trợ..."
                              className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 italic"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ─── SECTION TYPE: PDF / DOCUMENT ───────────────────────────── */}
              {activeSection.section_type === 'pdf' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Đường Dẫn Tài Liệu PDF (Link trực tiếp hoặc Google Drive)
                    </label>
                    <input
                      type="text"
                      value={activeSection.media_url || ''}
                      onChange={(e) => {
                        const newLessons = [...currentCourse.lessons];
                        newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].media_url = e.target.value;
                        setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://drive.google.com/file/d/... hoặc link file .pdf"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs font-mono text-stone-100"
                    />
                  </div>

                  {activeSection.media_url ? (
                    <div className="rounded-3xl border border-stone-800 bg-stone-950 overflow-hidden h-[500px]">
                      <iframe
                        src={(() => {
                          const clean = activeSection.media_url.trim();
                          if (clean.includes('drive.google.com')) {
                            const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
                            return match && match[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : clean;
                          }
                          return clean;
                        })()}
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="py-16 text-center rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 text-stone-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-rose-400" />
                      <p className="text-xs">Nhập link tài liệu PDF hoặc Google Drive ở trên để xem trước tại đây.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── SECTION TYPE: AUDIO ────────────────────────────────────── */}
              {activeSection.section_type === 'audio' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Đường Dẫn File Âm Thanh (MP3, WAV, Drive Stream)
                    </label>
                    <input
                      type="text"
                      value={activeSection.media_url || ''}
                      onChange={(e) => {
                        const newLessons = [...currentCourse.lessons];
                        newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].media_url = e.target.value;
                        setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://...link file mp3"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-xs font-mono text-stone-100"
                    />
                  </div>

                  {activeSection.media_url && (
                    <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 text-center">
                      <audio controls src={activeSection.media_url} className="w-full max-w-md mx-auto" />
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}
      {/* 8 Catholic Holy Blocks Styleguide Modal */}
      <CatholicBlockInserterModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onInsertHtml={(snippet) => {
          if (visualEditorRef.current) {
            visualEditorRef.current.focus();
            document.execCommand('insertHTML', false, snippet);
            const newLessons = [...currentCourse.lessons];
            if (selectedNode.type === 'section') {
              newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].content_html = visualEditorRef.current.innerHTML;
              setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
              setHasUnsavedChanges(true);
            }
          }
        }}
      />

      {/* Quiz Bank Picker Modal (230 questions) */}
      <QuizBankPickerModal
        isOpen={isQuizPickerOpen}
        onClose={() => setIsQuizPickerOpen(false)}
        onInsertQuestions={(importedQuestions) => {
          if (selectedNode.type === 'section') {
            const newLessons = [...currentCourse.lessons];
            const curQuiz = newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data || [];
            newLessons[selectedNode.lessonIndex].sections[selectedNode.sectionIndex].quiz_data = [...curQuiz, ...importedQuestions];
            setCurrentCourse(prev => ({ ...prev, lessons: newLessons }));
            setHasUnsavedChanges(true);
          }
        }}
      />

    </div>
  );
}

export default function VisualCourseStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VisualCourseStudioContent />
    </Suspense>
  );
}
