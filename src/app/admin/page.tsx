'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Compass, Clock, Gamepad2, FileText, Users, Plus, 
  Trash2, Edit, Save, CheckCircle, AlertCircle, RefreshCw, Upload, Image as ImageIcon, Sparkles, Shield
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
    category: 'BĂ i TÆ°Æ¡ng TĂ¡c HTML',
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
    category: 'Kinh ThĂ¡nh',
    level: 'CÆ¡ Báº£n',
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
    category: 'GiĂ¡o LĂ½'
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
    if (!newPost.title || !newPost.content) return showMsg('Vui lĂ²ng nháº­p TiĂªu Ä‘á» vĂ  Ná»™i dung!', 'error');
    try {
      const slug = newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await createPost({ ...newPost, slug });
      showMsg('ÄĂ£ Ä‘Äƒng bĂ i viáº¿t thĂ nh cĂ´ng!');
      setNewPost({ title: '', slug: '', category: 'BĂ i TÆ°Æ¡ng TĂ¡c HTML', excerpt: '', content: '', featured_image: '', status: 'published' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lá»—i Ä‘Äƒng bĂ i: ' + err.message, 'error');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title) return showMsg('Vui lĂ²ng nháº­p TĂªn khĂ³a há»c!', 'error');
    try {
      const slug = newCourse.slug || newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await createCourse({ ...newCourse, slug });
      showMsg('ÄĂ£ táº¡o KhĂ³a há»c LMS thĂ nh cĂ´ng!');
      setNewCourse({ title: '', slug: '', description: '', category: 'Kinh ThĂ¡nh', level: 'CÆ¡ Báº£n', thumbnail: '' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lá»—i táº¡o khĂ³a há»c: ' + err.message, 'error');
    }
  };

  const handleCreateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMap.name) return showMsg('Vui lĂ²ng nháº­p TĂªn Ä‘á»‹a danh!', 'error');
    try {
      const slug = newMap.slug || newMap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await createMapLocation({ ...newMap, slug });
      showMsg('ÄĂ£ thĂªm Äá»‹a danh 3D thĂ nh cĂ´ng!');
      setNewMap({ name: '', slug: '', latitude: 31.7683, longitude: 35.2137, description: '', image_url: '' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lá»—i thĂªm Ä‘á»‹a danh: ' + err.message, 'error');
    }
  };

  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeline.title) return showMsg('Vui lĂ²ng nháº­p TiĂªu Ä‘á» sá»± kiá»‡n!', 'error');
    try {
      await createTimelineEvent(newTimeline);
      showMsg('ÄĂ£ thĂªm má»‘c DĂ²ng thá»i gian thĂ nh cĂ´ng!');
      setNewTimeline({ year_label: '2000 TCN', order_year: -2000, title: '', description: '', image_url: '' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lá»—i thĂªm dĂ²ng thá»i gian: ' + err.message, 'error');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.question || !newQuiz.opt0 || !newQuiz.opt1) return showMsg('Vui lĂ²ng nháº­p cĂ¢u há»i vĂ  Ă­t nháº¥t 2 Ä‘Ă¡p Ă¡n!', 'error');
    try {
      await createQuizQuestion({
        question: newQuiz.question,
        options: [newQuiz.opt0, newQuiz.opt1, newQuiz.opt2, newQuiz.opt3].filter(Boolean),
        correct_option: Number(newQuiz.correct_option),
        explanation: newQuiz.explanation,
        category: newQuiz.category
      });
      showMsg('ÄĂ£ thĂªm cĂ¢u há»i Quiz thĂ nh cĂ´ng!');
      setNewQuiz({ question: '', opt0: '', opt1: '', opt2: '', opt3: '', correct_option: 0, explanation: '', category: 'GiĂ¡o LĂ½' });
      loadAllData();
    } catch (err: any) {
      showMsg('Lá»—i thĂªm cĂ¢u há»i Quiz: ' + err.message, 'error');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateProfileRole(userId, role);
      showMsg('ÄĂ£ cáº­p nháº­t phĂ¢n quyá»n tĂ i khoáº£n!');
      loadAllData();
    } catch (err: any) {
      showMsg('Lá»—i cáº­p nháº­t phĂ¢n quyá»n: ' + err.message, 'error');
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
          <h1 className="text-3xl font-black text-white font-serif mt-1">Trang Quáº£n Trá»‹ Há»‡ Thá»‘ng</h1>
        </div>
        <button 
          onClick={loadAllData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} /> LĂ m má»›i dá»¯ liá»‡u
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
          <div className="text-slate-400 text-xs font-semibold">BĂ i viáº¿t</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{posts.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">KhĂ³a há»c LMS</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{courses.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Äá»‹a danh 3D</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{mapLocations.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">DĂ²ng thá»i gian</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{timelineEvents.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">CĂ¢u há»i Quiz</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{quizQuestions.length}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">TĂ i khoáº£n User</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{profiles.length}</div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={activeTab === 'posts' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <FileText className="w-4 h-4" /> ÄÄƒng BĂ i Viáº¿t & HTML 3D
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={activeTab === 'courses' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <BookOpen className="w-4 h-4" /> KhĂ³a Há»c LMS
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={activeTab === 'map' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Compass className="w-4 h-4" /> Báº£n Äá»“ 3D
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={activeTab === 'timeline' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Clock className="w-4 h-4" /> DĂ²ng Thá»i Gian
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={activeTab === 'quiz' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Gamepad2 className="w-4 h-4" /> NgĂ¢n HĂ ng Quiz
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-900 text-slate-400 hover:text-white"}
        >
          <Users className="w-4 h-4" /> Quáº£n LĂ½ User & PhĂ¢n Quyá»n
        </button>
      </div>

      {/* TAB 1: POSTS & HTML 3D */}
      {activeTab === 'posts' && (
        <div className="max-w-7xl mx-auto space-y-8">
          <form onSubmit={handleCreatePost} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 font-serif">
              <Plus className="w-5 h-5" /> ÄÄƒng BĂ i Viáº¿t Má»›i / BĂ i TÆ°Æ¡ng TĂ¡c HTML 3D
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">TiĂªu Ä‘á» bĂ i viáº¿t</label>
                <input
                  type="text"
                  placeholder="VD: ThĂ¡nh PhĂªrĂ´ Kim NgĂ´n hay KhĂ¡m PhĂ¡ Quy Äiá»ƒn 3D"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thá»ƒ Loáº¡i / ChuyĂªn Má»¥c</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                >
                  <option value="BĂ i TÆ°Æ¡ng TĂ¡c HTML">BĂ i TÆ°Æ¡ng TĂ¡c HTML 3D</option>
                  <option value="CĂ¡c ThĂ¡nh">CĂ¡c ThĂ¡nh</option>
                  <option value="Kinh ThĂ¡nh">Kinh ThĂ¡nh</option>
                  <option value="GiĂ¡o LĂ½">GiĂ¡o LĂ½</option>
                  <option value="Suy Niá»‡m">Suy Niá»‡m</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">URL áº¢nh Äáº¡i Diá»‡n (Featured Image / CDN)</label>
              <input
                type="text"
                placeholder="VD: https://media.thapgia.com/open-gospel.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                value={newPost.featured_image}
                onChange={e => setNewPost({...newPost, featured_image: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">TĂ³m táº¯t ngáº¯n (Excerpt)</label>
              <textarea
                rows={2}
                placeholder="TĂ³m táº¯t 1-2 cĂ¢u vá» ná»™i dung bĂ i viáº¿t..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                value={newPost.excerpt}
                onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Ná»™i dung bĂ i viáº¿t (Cháº¥p nháº­n VÄƒn báº£n hoáº·c Code HTML 3D TÆ°Æ¡ng TĂ¡c)
              </label>
              <textarea
                rows={10}
                placeholder="Nháº­p ná»™i dung vÄƒn báº£n hoáº·c DĂN TOĂ€N Bá»˜ CODE HTML/CSS/JS 3D VĂ€O ÄĂ‚Y..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
              />
            </div>

            <button type="submit" className="px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Xuáº¥t Báº£n BĂ i Viáº¿t NĂ y
            </button>
          </form>

          {/* LIST POSTS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-serif">Danh SĂ¡ch BĂ i Viáº¿t ÄĂ£ ÄÄƒng ({posts.length})</h3>
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
              <Plus className="w-5 h-5" /> Táº¡o KhĂ³a Há»c LMS Má»›i
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text" placeholder="TĂªn khĂ³a há»c (VD: Nháº­p MĂ´n Cá»±u Æ¯á»›c)"
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
              rows={3} placeholder="MĂ´ táº£ tĂ³m táº¯t ná»™i dung khĂ³a há»c LMS..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Táº¡o KhĂ³a Há»c
            </button>
          </form>

          {/* LIST COURSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{c.category} â€¢ {c.level}</span>
                  <button onClick={() => deleteCourse(c.id).then(loadAllData)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-serif font-bold text-lg text-white">{c.title}</h3>
                <p className="text-xs text-slate-400">{c.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Sá»‘ bĂ i há»c: {c.lessons?.length || 0}</span>
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
              <Plus className="w-5 h-5" /> ThĂªm Äá»‹a Danh Báº£n Äá»“ 3D ThĂ¡nh Äá»‹a
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text" placeholder="TĂªn Ä‘á»‹a danh (VD: Jerusalem, Bethlehem)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newMap.name} onChange={e => setNewMap({...newMap, name: e.target.value})}
              />
              <input
                type="number" step="0.0001" placeholder="VÄ© Ä‘á»™ (Latitude, VD: 31.7683)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newMap.latitude} onChange={e => setNewMap({...newMap, latitude: Number(e.target.value)})}
              />
              <input
                type="number" step="0.0001" placeholder="Kinh Ä‘á»™ (Longitude, VD: 35.2137)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newMap.longitude} onChange={e => setNewMap({...newMap, longitude: Number(e.target.value)})}
              />
            </div>
            <textarea
              rows={2} placeholder="MĂ´ táº£ Ă½ nghÄ©a Ä‘á»‹a danh vĂ  tham chiáº¿u Kinh ThĂ¡nh..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              value={newMap.description} onChange={e => setNewMap({...newMap, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> ThĂªm Äá»‹a Danh 3D
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mapLocations.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">{m.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Tá»a Ä‘á»™: {m.latitude}, {m.longitude}</p>
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
              <Plus className="w-5 h-5" /> ThĂªm Má»‘c DĂ²ng Thá»i Gian Lá»‹ch Sá»­ Cá»©u Äá»™
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text" placeholder="NhĂ£n nÄƒm (VD: 2000 TCN, 33 SCN)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newTimeline.year_label} onChange={e => setNewTimeline({...newTimeline, year_label: e.target.value})}
              />
              <input
                type="number" placeholder="Sá»‘ nÄƒm Ä‘á»ƒ sáº¯p xáº¿p (VD: -2000 hoáº·c 33)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newTimeline.order_year} onChange={e => setNewTimeline({...newTimeline, order_year: Number(e.target.value)})}
              />
              <input
                type="text" placeholder="TĂªn sá»± kiá»‡n (VD: Giao Æ°á»›c vá»›i Ăp-ra-ham)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                value={newTimeline.title} onChange={e => setNewTimeline({...newTimeline, title: e.target.value})}
              />
            </div>
            <textarea
              rows={2} placeholder="Chi tiáº¿t lá»‹ch sá»­ sá»± kiá»‡n..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              value={newTimeline.description} onChange={e => setNewTimeline({...newTimeline, description: e.target.value})}
            />
            <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> ThĂªm Sá»± Kiá»‡n
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
              <Plus className="w-5 h-5" /> ThĂªm CĂ¢u Há»i Äáº¥u TrÆ°á»ng Quiz GiĂ¡o LĂ½
            </h2>
            <textarea
              rows={2} placeholder="Ná»™i dung cĂ¢u há»i..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
              value={newQuiz.question} onChange={e => setNewQuiz({...newQuiz, question: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="ÄĂ¡p Ă¡n A" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt0} onChange={e => setNewQuiz({...newQuiz, opt0: e.target.value})} />
              <input type="text" placeholder="ÄĂ¡p Ă¡n B" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt1} onChange={e => setNewQuiz({...newQuiz, opt1: e.target.value})} />
              <input type="text" placeholder="ÄĂ¡p Ă¡n C" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt2} onChange={e => setNewQuiz({...newQuiz, opt2: e.target.value})} />
              <input type="text" placeholder="ÄĂ¡p Ă¡n D" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newQuiz.opt3} onChange={e => setNewQuiz({...newQuiz, opt3: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-400">ÄĂ¡p Ă¡n Ä‘Ăºng:</label>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                value={newQuiz.correct_option} onChange={e => setNewQuiz({...newQuiz, correct_option: Number(e.target.value)})}
              >
                <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
              </select>
            </div>
            <button type="submit" className="px-6 py-3 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-500 flex items-center gap-2">
              <Save className="w-4 h-4" /> ThĂªm CĂ¢u Há»i Quiz
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: USERS */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white font-serif">Quáº£n LĂ½ PhĂ¢n Quyá»n NgÆ°á»i DĂ¹ng ({profiles.length})</h2>
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
                  <option value="student">Há»c ViĂªn (student)</option>
                  <option value="teacher">GiĂ¡o LĂ½ ViĂªn (teacher)</option>
                  <option value="admin">Quáº£n Trá»‹ ViĂªn (admin)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}