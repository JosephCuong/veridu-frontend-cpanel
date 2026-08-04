'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Compass, Clock, Gamepad2, FileText, Users, Plus, 
  Trash2, Edit, Save, CheckCircle, AlertCircle, RefreshCw, Upload, Image as ImageIcon, LayerGroup, Sparkles, Shield
} from 'lucide-react';
import { 
  getAdminPosts, createPost, deletePost,
  getAdminCourses, createCourse, createLesson, deleteCourse,
  getAdminMapLocations, createMapLocation, deleteMapLocation,
  getAdminTimelineEvents, createTimelineEvent, deleteTimelineEvent,
  getAdminQuizQuestions, createQuizQuestion, deleteQuizQuestion,
  getAdminProfiles, updateProfileRole
} from '@/lib/adminApi';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'courses' | 'map' | 'timeline' | 'quiz' | 'users'>('posts');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
    category: 'Bài Tương Tác HTML',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'published'
  });

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

  // --- SUBMIT HANDLERS ---
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return showMsg('Vui lòng nhập Tiêu đề và Nội dung!', 'error');
    try {
      const slug = newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await createPost({ ...newPost, slug });
      showMsg('Đã đăng bài viết thành công!');
      setNewPost({ title: '', slug: '', category: 'Bài Tương Tác HTML', excerpt: '', content: '', featured_image: '', status: 'published' });
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
            <Shield className="w-4 h-4" /> VERIDU VISUAL MANAGEMENT SYSTEM
          </div>
          <h1 className="text-3xl font-black text-white font-serif mt-1">Trang Quản Trị Hệ Thống</h1>
        </div>
        <button 
          onClick={loadAllData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} /> Làm mới dữ liệu
        </button>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div className={message.type === 'success' ? "max-w-7xl mx-auto my-4 p-4 rounded-xl flex items-center gap-3 border bg-emerald-950/80 border-emerald-500/40 text-emerald-300" : "max-w-7xl mx-auto my-4 p-4 rounded-xl flex items-center gap-3 border bg-rose-950/80 border-rose-500/40 text-rose-300"}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-6 gap-4 my-8">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Bài viết</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{posts.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Khóa học LMS</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{courses.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Địa danh 3D</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{mapLocations.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Dòng thời gian</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{timelineEvents.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Câu hỏi Quiz</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{quizQuestions.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Tài khoản User</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{profiles.length}</div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={activeTab === 'posts' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <FileText className="w-4 h-4" /> Đăng Bài Viết & HTML 3D
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={activeTab === 'courses' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <BookOpen className="w-4 h-4" /> Khóa Học LMS
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={activeTab === 'map' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Compass className="w-4 h-4" /> Bản Đồ 3D
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={activeTab === 'timeline' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Clock className="w-4 h-4" /> Dòng Thời Gian
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={activeTab === 'quiz' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Gamepad2 className="w-4 h-4" /> Ngân Hàng Quiz
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Users className="w-4 h-4" /> Quản Lý User & Phân Quyền
        </button>
      </div>

      {/* TAB 1: POSTS & HTML 3D */}
      {activeTab === 'posts' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreatePost} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Đăng Bài Viết Mới / Bài Tương Tác HTML 3D
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tiêu đề bài viết</label>
                <input
                  type="text"
                  placeholder="VD: Thánh Phêrô Kim Ngôn hay Khám Phá Quy Điển 3D"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thể Loại / Chuyên Mục</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                >
                  <option value="Bài Tương Tác HTML">Bài Tương Tác HTML 3D</option>
                  <option value="Các Thánh">Các Thánh</option>
                  <option value="Kinh Thánh">Kinh Thánh</option>
                  <option value="Giáo Lý">Giáo Lý</option>
                  <option value="Suy Niệm">Suy Niệm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">URL Ảnh Đại Diện (Featured Image / CDN)</label>
              <input
                type="text"
                placeholder="VD: https://media.thapgia.com/open-gospel.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                value={newPost.featured_image}
                onChange={e => setNewPost({...newPost, featured_image: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tóm tắt ngắn (Excerpt)</label>
              <textarea
                rows={2}
                placeholder="Tóm tắt 1-2 câu về nội dung bài viết..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                value={newPost.excerpt}
                onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Nội dung bài viết (Chấp nhận Văn bản hoặc Code HTML 3D Tương Tác)
              </label>
              <textarea
                rows={10}
                placeholder="Nhập nội dung văn bản hoặc DÁN TOÀN BỘ CODE HTML/CSS/JS 3D VÀO ĐÂY..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
              />
            </div>

            <button type="submit" className="px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Xuất Bản Bài Viết Này
            </button>
          </form>

          {/* LIST POSTS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-serif">Danh Sách Bài Viết Đã Đăng ({posts.length})</h3>
            <div className="divide-y divide-slate-800">
              {posts.map(p => (
                <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase mr-2">{p.category}</span>
                    <span className="font-bold text-sm text-white">{p.title}</span>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{p.excerpt || p.slug}</p>
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
          <form onSubmit={handleCreateCourse} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Tạo Khóa Học LMS Mới
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text" placeholder="Tên khóa học (VD: Nhập Môn Cựu Ước)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})}
              />
              <input
                type="text" placeholder="URL Thumbnail (VD: https://media.thapgia.com/course-thumb.jpg)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})}
              />
            </div>
            <textarea
              rows={3} placeholder="Mô tả tóm tắt nội dung khóa học LMS..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Tạo Khóa Học
            </button>
          </form>

          {/* LIST COURSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{c.category} • {c.level}</span>
                  <button onClick={() => deleteCourse(c.id).then(loadAllData)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-serif font-bold text-lg text-white">{c.title}</h3>
                <p className="text-xs text-slate-400">{c.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Số bài học: {c.lessons?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MAP 3D */}
      {activeTab === 'map' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreateMap} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Thêm Địa Danh Bản Đồ 3D Thánh Địa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text" placeholder="Tên địa danh (VD: Jerusalem, Bethlehem)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newMap.name} onChange={e => setNewMap({...newMap, name: e.target.value})}
              />
              <input
                type="number" step="0.0001" placeholder="Vĩ độ (Latitude, VD: 31.7683)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newMap.latitude} onChange={e => setNewMap({...newMap, latitude: Number(e.target.value)})}
              />
              <input
                type="number" step="0.0001" placeholder="Kinh độ (Longitude, VD: 35.2137)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newMap.longitude} onChange={e => setNewMap({...newMap, longitude: Number(e.target.value)})}
              />
            </div>
            <textarea
              rows={2} placeholder="Mô tả ý nghĩa địa danh và tham chiếu Kinh Thánh..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              value={newMap.description} onChange={e => setNewMap({...newMap, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> Thêm Địa Danh 3D
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mapLocations.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">{m.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Tọa độ: {m.latitude}, {m.longitude}</p>
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
          <form onSubmit={handleCreateTimeline} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Thêm Mốc Dòng Thời Gian Lịch Sử Cứu Độ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text" placeholder="Nhãn năm (VD: 2000 TCN, 33 SCN)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newTimeline.year_label} onChange={e => setNewTimeline({...newTimeline, year_label: e.target.value})}
              />
              <input
                type="number" placeholder="Số năm để sắp xếp (VD: -2000 hoặc 33)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newTimeline.order_year} onChange={e => setNewTimeline({...newTimeline, order_year: Number(e.target.value)})}
              />
              <input
                type="text" placeholder="Tên sự kiện (VD: Giao ước với Áp-ra-ham)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newTimeline.title} onChange={e => setNewTimeline({...newTimeline, title: e.target.value})}
              />
            </div>
            <textarea
              rows={2} placeholder="Chi tiết lịch sử sự kiện..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              value={newTimeline.description} onChange={e => setNewTimeline({...newTimeline, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> Thêm Sự Kiện
            </button>
          </form>

          <div className="space-y-3">
            {timelineEvents.map(t => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs rounded-xl">{t.year_label}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
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
          <form onSubmit={handleCreateQuiz} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-rose-400 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> Thêm Câu Hỏi Đấu Trường Quiz Giáo Lý
            </h2>
            <textarea
              rows={2} placeholder="Nội dung câu hỏi..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              value={newQuiz.question} onChange={e => setNewQuiz({...newQuiz, question: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Đáp án A" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt0} onChange={e => setNewQuiz({...newQuiz, opt0: e.target.value})} />
              <input type="text" placeholder="Đáp án B" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt1} onChange={e => setNewQuiz({...newQuiz, opt1: e.target.value})} />
              <input type="text" placeholder="Đáp án C" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt2} onChange={e => setNewQuiz({...newQuiz, opt2: e.target.value})} />
              <input type="text" placeholder="Đáp án D" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt3} onChange={e => setNewQuiz({...newQuiz, opt3: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-400">Đáp án đúng:</label>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
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
        <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white font-serif">Quản Lý Phân Quyền Người Dùng ({profiles.length})</h2>
          <div className="divide-y divide-slate-800">
            {profiles.map(usr => (
              <div key={usr.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-white">{usr.full_name || usr.email}</div>
                  <div className="text-xs text-slate-400">{usr.email}</div>
                </div>
                <select
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold"
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
    </div>
  );
}