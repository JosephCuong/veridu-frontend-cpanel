'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Compass, Clock, Gamepad2, FileText, Users, Plus, 
  Trash2, Edit, Save, CheckCircle, AlertCircle, RefreshCw, Upload, Image as ImageIcon, Sparkles, Shield, Eye, Code, X, Bold, Italic, Heading, Quote, Link as LinkIcon
} from 'lucide-react';
import { 
  getAdminPosts, createPost, deletePost, uploadMediaFile,
  getAdminCourses, createCourse, createLesson, deleteCourse,
  getAdminMapLocations, createMapLocation, deleteMapLocation,
  getAdminTimelineEvents, createTimelineEvent, deleteTimelineEvent,
  getAdminQuizQuestions, createQuizQuestion, deleteQuizQuestion,
  getAdminProfiles, updateProfileRole
} from '@/lib/adminApi';
import { normalizeAndSyncHtml, extractTitleFromHtml } from '@/lib/htmlProcessor';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'courses' | 'map' | 'timeline' | 'quiz' | 'users'>('posts');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Data States
  const [posts, setPosts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    category: 'Bài Tương Tác HTML 3D',
    article_type: 'standard',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'published'
  });
  const [stripHtmlClasses, setStripHtmlClasses] = useState(true);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'Kinh Thánh',
    level: 'Cơ Bản',
    thumbnail: ''
  });

  // New Map Location Form State
  const [newMap, setNewMap] = useState({
    name: '',
    slug: '',
    latitude: 31.7683,
    longitude: 35.2137,
    description: '',
    image_url: ''
  });

  // New Timeline Form State
  const [newTimeline, setNewTimeline] = useState({
    year_label: '2000 TCN',
    order_year: -2000,
    title: '',
    description: '',
    image_url: ''
  });

  // New Quiz Form State
  const [newQuiz, setNewQuiz] = useState({
    question: '',
    opt0: '', opt1: '', opt2: '', opt3: '',
    correct_option: 0,
    explanation: '',
    category: 'Giáo Lý'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pData, cData, mData, tData, qData, profData] = await Promise.allSettled([
        getAdminPosts(),
        getAdminCourses(),
        getAdminMapLocations(),
        getAdminTimelineEvents(),
        getAdminQuizQuestions(),
        getAdminProfiles()
      ]);
      if (pData.status === 'fulfilled') setPosts(pData.value);
      if (cData.status === 'fulfilled') setCourses(cData.value);
      if (mData.status === 'fulfilled') setMapLocations(mData.value);
      if (tData.status === 'fulfilled') setTimelineEvents(tData.value);
      if (qData.status === 'fulfilled') setQuizQuestions(qData.value);
      if (profData.status === 'fulfilled') setProfiles(profData.value);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Import file .html 3D trực tiếp từ máy tính
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawHtml = event.target?.result as string;
      const extractedTitle = extractTitleFromHtml(rawHtml);
      const isInteractiveDoc = newPost.article_type === 'interactive' || /<!DOCTYPE\s+html/i.test(rawHtml) || /<html[\s>]/i.test(rawHtml);
      const normalizedHtml = normalizeAndSyncHtml(rawHtml, stripHtmlClasses, isInteractiveDoc);
      
      setNewPost(prev => ({
        ...prev,
        content: normalizedHtml,
        title: prev.title || extractedTitle || file.name.replace(/\.[^/.]+$/, ''),
        article_type: isInteractiveDoc ? 'interactive' : prev.article_type
      }));
      showMsg('Đã đọc, tự động phân tích và nạp mã HTML bài viết thành công!');
    };
    reader.readAsText(file);
  };

  // Tải ảnh trực tiếp từ máy tính làm Ảnh Đại Diện - Upload sang Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showMsg('Đang tải ảnh lên Supabase Storage...');
      const publicUrl = await uploadMediaFile(file);
      setNewPost(prev => ({ ...prev, featured_image: publicUrl }));
      showMsg('Đã tải ảnh lên Supabase Storage thành công!');
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err);
      showMsg('Lỗi tải ảnh lên Storage: ' + (err.message || 'Không thể upload'), 'error');
    }
  };

  // Chèn thẻ định dạng trực quan (Rich Text Tools)
  const insertFormatting = (tagOpen: string, tagClose: string = '') => {
    setNewPost(prev => ({
      ...prev,
      content: prev.content + `${tagOpen}nội dung${tagClose}`
    }));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return showMsg('Vui lòng nhập Tiêu đề và Nội dung bài viết!', 'error');
    try {
      const slug = newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const finalArticleType = (newPost.category === 'Bài Tương Tác HTML 3D' || newPost.article_type === 'interactive') ? 'interactive' : 'standard';
      await createPost({ ...newPost, slug, article_type: finalArticleType });
      showMsg('Đã xuất bản bài viết thành công!');
      setNewPost({ title: '', slug: '', category: 'Bài Tương Tác HTML 3D', article_type: 'standard', excerpt: '', content: '', featured_image: '', status: 'published' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lỗi đăng bài: ' + err.message, 'error');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title) return showMsg('Vui lòng nhập Tên khóa học!', 'error');
    try {
      const slug = newCourse.slug || newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await createCourse({ ...newCourse, slug });
      showMsg('Đã tạo Khóa học LMS thành công!');
      setNewCourse({ title: '', slug: '', description: '', category: 'Kinh Thánh', level: 'Cơ Bản', thumbnail: '' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lỗi tạo khóa học: ' + err.message, 'error');
    }
  };

  const handleCreateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMap.name) return showMsg('Vui lòng nhập Tên địa danh!', 'error');
    try {
      const slug = newMap.slug || newMap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await createMapLocation({ ...newMap, slug });
      showMsg('Đã thêm Địa danh 3D thành công!');
      setNewMap({ name: '', slug: '', latitude: 31.7683, longitude: 35.2137, description: '', image_url: '' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lỗi thêm địa danh: ' + err.message, 'error');
    }
  };

  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeline.title) return showMsg('Vui lòng nhập Tiêu đề sự kiện!', 'error');
    try {
      await createTimelineEvent(newTimeline);
      showMsg('Đã thêm mốc Dòng thời gian thành công!');
      setNewTimeline({ year_label: '2000 TCN', order_year: -2000, title: '', description: '', image_url: '' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lỗi thêm dòng thời gian: ' + err.message, 'error');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.question || !newQuiz.opt0 || !newQuiz.opt1) return showMsg('Vui lòng nhập câu hỏi và ít nhất 2 đáp án!', 'error');
    try {
      await createQuizQuestion({
        question: newQuiz.question,
        options: [newQuiz.opt0, newQuiz.opt1, newQuiz.opt2, newQuiz.opt3].filter(Boolean),
        correct_option: Number(newQuiz.correct_option),
        explanation: newQuiz.explanation,
        category: newQuiz.category
      });
      showMsg('Đã thêm câu hỏi Quiz thành công!');
      setNewQuiz({ question: '', opt0: '', opt1: '', opt2: '', opt3: '', correct_option: 0, explanation: '', category: 'Giáo Lý' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lỗi thêm câu hỏi Quiz: ' + err.message, 'error');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateProfileRole(userId, role);
      showMsg('Đã cập nhật phân quyền tài khoản!');
      loadAllData();
    } catch (err: any) {
      showMsg('Lỗi cập nhật phân quyền: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-4 sm:p-8 font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-[var(--border-card)]">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
            <Shield className="w-4 h-4" /> VERIDU VISUAL MANAGEMENT SYSTEM
          </div>
          <h1 className="text-3xl font-black text-[var(--text-main)] font-serif mt-1">Trang Quản Trị Hệ Thống</h1>
        </div>
        <button 
          onClick={loadAllData}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-card)] hover:bg-amber-500 hover:text-slate-950 font-bold text-xs rounded-xl border border-[var(--border-card)] shadow-lg transition-all"
        >
          <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} /> Làm mới dữ liệu
        </button>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div className={message.type === 'success' ? "max-w-7xl mx-auto my-4 p-4 rounded-xl flex items-center gap-3 border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold text-sm" : "max-w-7xl mx-auto my-4 p-4 rounded-xl flex items-center gap-3 border bg-red-500/10 border-red-500/30 text-red-400 font-bold text-sm"}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-6 gap-4 my-8">
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl">
          <div className="text-[var(--text-muted)] text-xs font-bold uppercase">Bài viết</div>
          <div className="text-3xl font-black text-amber-500 mt-1">{posts.length}</div>
        </div>
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl">
          <div className="text-[var(--text-muted)] text-xs font-bold uppercase">Khóa học LMS</div>
          <div className="text-3xl font-black text-indigo-500 mt-1">{courses.length}</div>
        </div>
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl">
          <div className="text-[var(--text-muted)] text-xs font-bold uppercase">Địa danh 3D</div>
          <div className="text-3xl font-black text-emerald-500 mt-1">{mapLocations.length}</div>
        </div>
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl">
          <div className="text-[var(--text-muted)] text-xs font-bold uppercase">Dòng thời gian</div>
          <div className="text-3xl font-black text-purple-500 mt-1">{timelineEvents.length}</div>
        </div>
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl">
          <div className="text-[var(--text-muted)] text-xs font-bold uppercase">Câu hỏi Quiz</div>
          <div className="text-3xl font-black text-rose-500 mt-1">{quizQuestions.length}</div>
        </div>
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl">
          <div className="text-[var(--text-muted)] text-xs font-bold uppercase">Tài khoản User</div>
          <div className="text-3xl font-black text-blue-500 mt-1">{profiles.length}</div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8 border-b border-[var(--border-card)] pb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={activeTab === 'posts' ? "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}
        >
          <FileText className="w-4 h-4" /> Đăng Bài Viết & HTML 3D
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={activeTab === 'courses' ? "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}
        >
          <BookOpen className="w-4 h-4" /> Khóa Học LMS
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={activeTab === 'map' ? "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}
        >
          <Compass className="w-4 h-4" /> Bản Đồ 3D
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={activeTab === 'timeline' ? "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}
        >
          <Clock className="w-4 h-4" /> Dòng Thời Gian
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={activeTab === 'quiz' ? "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}
        >
          <Gamepad2 className="w-4 h-4" /> Ngân Hàng Quiz
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}
        >
          <Users className="w-4 h-4" /> Quản Lý User & Phân Quyền
        </button>
      </div>

      {/* TAB 1: POSTS & HTML 3D WITH FILE UPLOAD & RICH TEXT TOOLBAR */}
      {activeTab === 'posts' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreatePost} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
              <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2 font-serif">
                <Plus className="w-5 h-5" /> Trình Soạn Thảo Bài Viết & Bài Tương Tác HTML 3D
              </h2>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all">
                  <Upload className="w-4 h-4" /> Import File .HTML 3D Từ Máy Tính
                  <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                </label>

                {newPost.content && (
                  <button 
                    type="button" 
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <Eye className="w-4 h-4" /> Xem Trước Trực Quan
                  </button>
                )}
              </div>
            </div>

            {/* STRIP CLASSES CHECKBOX */}
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="adminStripClasses" 
                checked={stripHtmlClasses}
                onChange={(e) => setStripHtmlClasses(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[var(--bg-main)] border-[var(--border-card)]"
              />
              <label htmlFor="adminStripClasses" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                Tự động xóa các class/style rác từ file Word/Docs (Khuyên dùng để đồng bộ giao diện, BỎ CHỌN nếu tải lên Bài 3D Tương Tác)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Tiêu đề bài viết</label>
                <input
                  type="text"
                  placeholder="VD: Thánh Phêrô Kim Ngôn hay Khám Phá Quy Điển 3D"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Thể Loại / Chuyên Mục</label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                >
                  <option value="Bài Tương Tác HTML 3D">Bài Tương Tác HTML 3D</option>
                  <option value="Các Thánh">Các Thánh</option>
                  <option value="Kinh Thánh">Kinh Thánh</option>
                  <option value="Giáo Lý">Giáo Lý</option>
                  <option value="Suy Niệm">Suy Niệm</option>
                </select>
              </div>
            </div>

            {/* FEATURED IMAGE WITH DIRECT FILE UPLOAD */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Ảnh Đại Diện Bài Viết</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="URL Ảnh đại diện (VD: https://media.thapgia.com/open-gospel.jpg)"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  value={newPost.featured_image}
                  onChange={e => setNewPost({...newPost, featured_image: e.target.value})}
                />
                <label className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all whitespace-nowrap">
                  <ImageIcon className="w-4 h-4" /> Tải Ảnh Từ Máy
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Tóm tắt ngắn (Excerpt)</label>
              <textarea
                rows={2}
                placeholder="Tóm tắt 1-2 câu về nội dung bài viết..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                value={newPost.excerpt}
                onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
              />
            </div>

            {/* RICH TEXT FORMATTING TOOLBAR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1.5">
                  <Code className="w-4 h-4" /> Khung Soạn Thảo Nội Dung (Văn Bản hoặc Mã HTML/CSS 3D)
                </label>

                {/* WORDPRESS STYLE FORMATTING BUTTONS */}
                <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-card)]">
                  <button type="button" onClick={() => insertFormatting('<b>', '</b>')} className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold" title="In Đậm"><b>B</b></button>
                  <button type="button" onClick={() => insertFormatting('<i>', '</i>')} className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-italic" title="In Nghiêng"><i>I</i></button>
                  <button type="button" onClick={() => insertFormatting('<h2>', '</h2>')} className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold" title="Tiêu đề H2">H2</button>
                  <button type="button" onClick={() => insertFormatting('<blockquote>', '</blockquote>')} className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs" title="Trích Dẫn">&quot;&quot;</button>
                  <button type="button" onClick={() => insertFormatting('<img src="', '" />')} className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs" title="Chèn Ảnh">🖼️</button>
                </div>
              </div>

              <textarea
                rows={12}
                placeholder="Nhập nội dung văn bản hoặc Bấm nút 'Import File .HTML 3D Từ Máy Tính' phía trên để nạp code..."
                className="w-full bg-slate-950 border border-[var(--border-card)] rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="submit" className="px-8 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                <Save className="w-4 h-4" /> Xuất Bản Bài Viết Này
              </button>
            </div>
          </form>

          {/* LIST POSTS */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-main)] font-serif">Danh Sách Bài Viết Đã Đăng ({posts.length})</h3>
            <div className="divide-y divide-[var(--border-card)]">
              {posts.map(p => (
                <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase mr-2">{p.category}</span>
                    <span className="font-bold text-sm text-[var(--text-main)]">{p.title}</span>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-1">{p.excerpt || p.slug}</p>
                  </div>
                  <button onClick={() => deletePost(p.id).then(loadAllData)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LMS COURSES */}
      {activeTab === 'courses' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreateCourse} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-indigo-500 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Tạo Khóa Học LMS Mới
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text" placeholder="Tên khóa học (VD: Nhập Môn Cựu Ước)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-indigo-500"
                value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})}
              />
              <input
                type="text" placeholder="URL Thumbnail (VD: https://media.thapgia.com/course-thumb.jpg)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-indigo-500"
                value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})}
              />
            </div>
            <textarea
              rows={3} placeholder="Mô tả tóm tắt nội dung khóa học LMS..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-indigo-500"
              value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Tạo Khóa Học
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">{c.category} • {c.level}</span>
                  <button onClick={() => deleteCourse(c.id).then(loadAllData)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">{c.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MAP 3D */}
      {activeTab === 'map' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreateMap} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-emerald-500 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Thêm Địa Danh Bản Đồ 3D Thánh Địa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text" placeholder="Tên địa danh (VD: Jerusalem, Bethlehem)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                value={newMap.name} onChange={e => setNewMap({...newMap, name: e.target.value})}
              />
              <input
                type="number" step="0.0001" placeholder="Vĩ độ (Latitude, VD: 31.7683)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                value={newMap.latitude} onChange={e => setNewMap({...newMap, latitude: Number(e.target.value)})}
              />
              <input
                type="number" step="0.0001" placeholder="Kinh độ (Longitude, VD: 35.2137)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                value={newMap.longitude} onChange={e => setNewMap({...newMap, longitude: Number(e.target.value)})}
              />
            </div>
            <textarea
              rows={2} placeholder="Mô tả ý nghĩa địa danh và tham chiếu Kinh Thánh..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
              value={newMap.description} onChange={e => setNewMap({...newMap, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> Thêm Địa Danh 3D
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mapLocations.map(m => (
              <div key={m.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-emerald-500">{m.name}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Tọa độ: {m.latitude}, {m.longitude}</p>
                </div>
                <button onClick={() => deleteMapLocation(m.id).then(loadAllData)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreateTimeline} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-purple-500 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Thêm Mốc Dòng Thời Gian Lịch Sử Cứu Độ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text" placeholder="Nhãn năm (VD: 2000 TCN, 33 SCN)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                value={newTimeline.year_label} onChange={e => setNewTimeline({...newTimeline, year_label: e.target.value})}
              />
              <input
                type="number" placeholder="Số năm để sắp xếp (VD: -2000 hoặc 33)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                value={newTimeline.order_year} onChange={e => setNewTimeline({...newTimeline, order_year: Number(e.target.value)})}
              />
              <input
                type="text" placeholder="Tên sự kiện (VD: Giao ước với Áp-ra-ham)"
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                value={newTimeline.title} onChange={e => setNewTimeline({...newTimeline, title: e.target.value})}
              />
            </div>
            <textarea
              rows={2} placeholder="Chi tiết lịch sử sự kiện..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
              value={newTimeline.description} onChange={e => setNewTimeline({...newTimeline, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> Thêm Sự Kiện
            </button>
          </form>

          <div className="space-y-3">
            {timelineEvents.map(t => (
              <div key={t.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl">{t.year_label}</span>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-main)]">{t.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-1">{t.description}</p>
                  </div>
                </div>
                <button onClick={() => deleteTimelineEvent(t.id).then(loadAllData)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreateQuiz} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-rose-500 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Thêm Câu Hỏi Đấu Trường Quiz Giáo Lý
            </h2>
            <textarea
              rows={2} placeholder="Nội dung câu hỏi..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
              value={newQuiz.question} onChange={e => setNewQuiz({...newQuiz, question: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Đáp án A" className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)]" value={newQuiz.opt0} onChange={e => setNewQuiz({...newQuiz, opt0: e.target.value})} />
              <input type="text" placeholder="Đáp án B" className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)]" value={newQuiz.opt1} onChange={e => setNewQuiz({...newQuiz, opt1: e.target.value})} />
              <input type="text" placeholder="Đáp án C" className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)]" value={newQuiz.opt2} onChange={e => setNewQuiz({...newQuiz, opt2: e.target.value})} />
              <input type="text" placeholder="Đáp án D" className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)]" value={newQuiz.opt3} onChange={e => setNewQuiz({...newQuiz, opt3: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-[var(--text-muted)]">Đáp án đúng:</label>
              <select
                className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-xs text-[var(--text-main)]"
                value={newQuiz.correct_option} onChange={e => setNewQuiz({...newQuiz, correct_option: Number(e.target.value)})}
              >
                <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
              </select>
            </div>
            <button type="submit" className="px-6 py-3 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> Thêm Câu Hỏi Quiz
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: USERS */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-main)] font-serif">Quản Lý Phân Quyền Người Dùng ({profiles.length})</h2>
          <div className="divide-y divide-[var(--border-card)]">
            {profiles.map(usr => (
              <div key={usr.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-[var(--text-main)]">{usr.full_name || usr.email}</div>
                  <div className="text-xs text-[var(--text-muted)]">{usr.email}</div>
                </div>
                <select
                  className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-xs text-amber-500 font-bold"
                  value={usr.role || 'student'}
                  onChange={e => handleRoleChange(usr.id, e.target.value)}
                >
                  <option value="student">Học Viên (student)</option>
                  <option value="teacher">Giáo Lý Viên (teacher)</option>
                  <option value="admin">Quản Trị Viên (admin)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL FOR 3D HTML POSTS */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col border border-[var(--border-card)] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[var(--border-card)] flex justify-between items-center bg-[var(--bg-main)]">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <Eye className="w-5 h-5" /> Xem Trước Trực Quan HTML 3D: <span className="text-[var(--text-main)]">{newPost.title || 'Bài Tương Tác'}</span>
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-rose-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 w-full h-full bg-slate-950">
              <iframe
                title="HTML Live Preview"
                srcDoc={newPost.content}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
