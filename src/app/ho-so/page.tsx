'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getStoredUser, logout, saveAuthSession, getAuthToken, UserProfile, 
  getStoredQuizHistory, clearQuizHistory, QuizAttempt 
} from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, Mail, Church, Compass, Award, Flame, Shield, LogOut, 
  Settings, BookOpen, CheckCircle, Clock, Save, Phone, Image as ImageIcon,
  Heart, Calendar, Loader2, Trophy, Trash2, ArrowRight, PlayCircle, BarChart3, AlertTriangle, Check, Sparkles, Plus, Eye, Cross
} from 'lucide-react';

import { 
  fetchUserQuizAttemptsFromSupabase, clearUserQuizAttemptsFromSupabase, 
  fetchUserCourseProgressFromSupabase, fetchCharacters, Character 
} from '@/lib/api';

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'quiz' | 'posts' | 'settings'>('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Admin Post Management State
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any | null>(null);

  // Avatar & Confirmation State
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Quiz history & LMS courses state from Supabase
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Non-blocking transition state for lightning-fast INP (<50ms)
  const [isPending, startTransition] = useTransition();

  // Form State for Profile Settings
  const [formData, setFormData] = useState({
    christianName: '',
    displayName: '',
    email: '',
    phone: '',
    parish: '',
    diocese: '',
    feastDay: '19/03 (Thánh Giuse)',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    fetchCharacters().then(data => setCharacters(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const current = getStoredUser();
    if (current) {
      setUser(current);
      setFormData({
        christianName: current.christianName || 'Giuse',
        displayName: current.displayName || '',
        email: current.email || '',
        phone: current.phone || '',
        parish: current.parish || 'Tân Định',
        diocese: current.diocese || 'Giáo Phận Sài Gòn',
        feastDay: '19/03 (Thánh Giuse)',
        bio: 'Nguyện xin Lời Chúa là ngọn đèn soi cho con bước.',
        avatar: current.avatar || ''
      });

      // Query Real Database from Supabase first, fallback to local storage
      const userIdStr = typeof current.id === 'string' ? current.id : undefined;
      
      Promise.all([
        fetchUserQuizAttemptsFromSupabase(userIdStr),
        fetchUserCourseProgressFromSupabase(userIdStr)
      ]).then(([dbQuiz, dbCourses]) => {
        if (dbQuiz && dbQuiz.length > 0) {
          setQuizHistory(dbQuiz);
        } else {
          setQuizHistory(getStoredQuizHistory());
        }
        setEnrolledCourses(dbCourses || []);
        setIsLoadingDb(false);
      }).catch(() => {
        setQuizHistory(getStoredQuizHistory());
        setEnrolledCourses([]);
        setIsLoadingDb(false);
      });

      // Load user authored posts from Supabase
      setIsLoadingPosts(true);
      (async () => {
        try {
          const { data } = await supabase
            .from('posts')
            .select('id, title, slug, category, created_at, status')
            .order('created_at', { ascending: false })
            .limit(20);
          if (data) setUserPosts(data);
        } catch (err) {
          console.warn('Load posts error:', err);
        } finally {
          setIsLoadingPosts(false);
        }
      })();
    }
  }, []);

  // Update Profile Submit Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({
            display_name: formData.displayName,
            christian_name: formData.christianName,
            phone: formData.phone,
            parish: formData.parish,
            diocese: formData.diocese,
            avatar_url: formData.avatar
          })
          .eq('id', user.id);
      }

      const updatedUser: UserProfile = {
        ...user!,
        displayName: formData.displayName,
        christianName: formData.christianName,
        phone: formData.phone,
        parish: formData.parish,
        diocese: formData.diocese,
        avatar: formData.avatar
      };

      const token = getAuthToken() || 'veridu_session';
      saveAuthSession(token, updatedUser);
      setUser(updatedUser);
      setMessage({ text: 'Cập nhật thông tin hồ sơ thành công!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi cập nhật hồ sơ.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Instant Non-blocking Clear Quiz History
  const executeClearHistory = () => {
    startTransition(() => {
      setQuizHistory([]);
      setShowConfirmDelete(false);
    });

    clearQuizHistory();
    const userIdStr = typeof user?.id === 'string' ? user.id : undefined;
    clearUserQuizAttemptsFromSupabase(userIdStr).catch(err => {
      console.warn('Background clear DB quiz warning:', err);
    });
  };

  // Delete Post Handler
  const handleDeletePost = async (postId: number | string) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setUserPosts(prev => prev.filter(p => p.id !== postId));
      setPostToDelete(null);
    } catch (err: any) {
      alert('Không thể xóa bài viết: ' + (err.message || 'Lỗi kết nối CSDL'));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 text-center font-sans pt-32">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-2xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif font-black text-2xl text-[var(--text-main)]">Hồ Sơ Tín Hữu VERIDU</h1>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Vui lòng đăng nhập để xem tiến trình học hỏi Kinh Thánh, bảng điểm bài thi và quản lý thông tin giáo xứ.
            </p>
          </div>
          <Link
            href="/dang-nhap"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl transition-all block shadow-lg shadow-amber-500/20"
          >
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="sr-only">Hồ Sơ Tín Hữu VERIDU</h1>
        
        {/* 🌟 2-COLUMN DASHBOARD LAYOUT WITH FIXED TOP HEADER SPACING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 📌 CỘT TRÁI CỐ ĐỊNH (STICKY LEFT SIDEBAR NAVIGATION) */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-36 space-y-6">
            
            {/* User Profile Card Widget */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-2xl shadow-xl space-y-5 text-center relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

              {/* Avatar Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 text-3xl font-serif font-black shadow-xl mx-auto relative z-10 overflow-hidden">
                {user.avatar ? (
                  <Image src={user.avatar} alt="Avatar" fill className="object-cover" sizes="80px" />
                ) : (
                  user.christianName ? user.christianName[0] : (user.displayName ? user.displayName[0] : 'V')
                )}
              </div>

              {/* User Names & Badges */}
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-serif font-bold text-xs">
                  <Cross className="w-3 h-3 text-amber-500" />
                  <span>{user.christianName || 'Tín Hữu'}</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-[var(--text-main)] line-clamp-1">{user.displayName || user.email}</h2>
                <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
              </div>

              {/* Parish & Streak Badges */}
              <div className="pt-3 border-t border-[var(--border-card)] space-y-2 text-xs font-semibold relative z-10">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>Giáo Xứ:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{user.parish || 'Tân Định'}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>Giáo Phận:</span>
                  <span className="text-[var(--text-main)]">{user.diocese || 'Giáo Phận Sài Gòn'}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-muted)] pt-1">
                  <span>Chuỗi Ngày:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {user.streak || 1} Ngày
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="p-3 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-1.5">
              <button 
                onClick={() => startTransition(() => setActiveTab('dashboard'))}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Tổng Quan Hồ Sơ</span>
                </div>
                {activeTab === 'dashboard' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </button>

              <button 
                onClick={() => startTransition(() => setActiveTab('courses'))}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'courses' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Khóa Học Đã Đăng Ký</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'courses' ? 'bg-slate-950 text-amber-400' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}`}>
                  {enrolledCourses.length}
                </span>
              </button>

              <button 
                onClick={() => startTransition(() => setActiveTab('quiz'))}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'quiz' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4" />
                  <span>Kết Quả Đấu Trường</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'quiz' ? 'bg-slate-950 text-amber-400' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}`}>
                  {quizHistory.length}
                </span>
              </button>

              <button 
                onClick={() => startTransition(() => setActiveTab('posts'))}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'posts' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Quản Lý Bài Viết</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'posts' ? 'bg-slate-950 text-amber-400' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}`}>
                  {userPosts.length}
                </span>
              </button>

              <button 
                onClick={() => startTransition(() => setActiveTab('settings'))}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Cài Đặt Hồ Sơ</span>
                </div>
                {activeTab === 'settings' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </button>
            </div>

            {/* Logout Action Button */}
            <button 
              onClick={logout} 
              className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất Tài Khoản</span>
            </button>

          </aside>

          {/* 📖 KHÔNG GIAN CHÍNH (MAIN DASHBOARD CONTENT PANE) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-amber-500">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Tiến Trình Học</span>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black font-serif text-[var(--text-main)]">71.6%</div>
                    <p className="text-[11px] text-[var(--text-muted)]">3 Khóa học đang theo dõi</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-indigo-500">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Điểm Đấu Trường</span>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black font-serif text-[var(--text-main)]">90.0%</div>
                    <p className="text-[11px] text-[var(--text-muted)]">{quizHistory.length} Lượt tự luyện thi</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-amber-500">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Chuỗi Học Tập</span>
                      <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black font-serif text-amber-600 dark:text-amber-400">1 Ngày</div>
                    <p className="text-[11px] text-[var(--text-muted)]">Giữ vững phong độ hằng ngày</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-emerald-500">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Danh Hiệu</span>
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-black font-serif text-emerald-600 dark:text-emerald-400">Tín Hữu Chăm Chỉ</div>
                    <p className="text-[11px] text-[var(--text-muted)]">Đã hoàn thành 18 bài học</p>
                  </div>

                </div>

                {/* Middle Section: LMS Progress & Quiz History Side-by-Side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* LMS Progress Widget */}
                  <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-500" /> Khóa Học Đang Theo Đuổi
                      </h3>
                      <button onClick={() => startTransition(() => setActiveTab('courses'))} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                        Xem tất cả ➔
                      </button>
                    </div>

                    <div className="space-y-4">
                      {enrolledCourses.map(course => (
                        <div key={course.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3 hover:border-amber-500/30 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 font-bold text-sm">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="text-[var(--text-main)]">{course.title}</span>
                            </div>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">{course.progress}%</span>
                          </div>

                          <div className="w-full bg-[var(--border-card)] rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
                          </div>

                          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                            <span>Đã học {course.completedLessons}/{course.totalLessons} bài</span>
                            <Link href={`/khoa-hoc/${course.slug}`} className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline">
                              Học Tiếp <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz History Widget */}
                  <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" /> Bảng Điểm Đấu Trường (10 Lượt Gần Nhất)
                      </h3>

                      {quizHistory.length > 0 && !showConfirmDelete && (
                        <button 
                          onClick={() => setShowConfirmDelete(true)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 transition-all active:scale-95"
                          title="Xóa lịch sử tự luyện cũ"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa Lịch Sử
                        </button>
                      )}
                    </div>

                    {/* Inline Instant Confirmation Bar */}
                    {showConfirmDelete && (
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs font-bold text-rose-500 animate-in fade-in">
                        <span>Xác nhận xóa 10 bài luyện thi?</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={executeClearHistory}
                            className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold"
                          >
                            Xóa
                          </button>
                          <button 
                            onClick={() => setShowConfirmDelete(false)}
                            className="px-3 py-1 bg-[var(--bg-main)] text-[var(--text-main)] rounded-lg hover:bg-[var(--border-card)] font-bold"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {quizHistory.length === 0 ? (
                      <div className="text-center py-10 text-[var(--text-muted)] space-y-3">
                        <Trophy className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
                        <p className="text-xs font-serif">Chưa có kết quả bài tập tự luyện nào.</p>
                        <Link href="/quiz" className="inline-block px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shadow-md">
                          Luyện Thi Ngay
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {quizHistory.map(item => (
                          <div key={item.id} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4">
                            <div className="space-y-0.5 overflow-hidden">
                              <h4 className="font-bold text-xs text-[var(--text-main)] truncate">{item.title}</h4>
                              <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500" /> {item.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                item.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}>
                                {item.score}/{item.total} ({item.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Parish Info Widget */}
                <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
                  <h3 className="font-serif font-bold text-lg text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Church className="w-5 h-5 text-amber-500" /> Thông Tin Sinh Hoạt Giáo Xứ &amp; Giáo Phận
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                      <div className="text-[var(--text-muted)] mb-1">Tên Thánh Bổn Mạng</div>
                      <div className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-1.5">
                        <Cross className="w-3.5 h-3.5 text-amber-500" /> {user.christianName || 'Giuse'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                      <div className="text-[var(--text-muted)] mb-1">Giáo Xứ Trực Thuộc</div>
                      <div className="text-[var(--text-main)] font-bold text-sm">{user.parish || 'Tân Định'}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                      <div className="text-[var(--text-muted)] mb-1">Giáo Phận</div>
                      <div className="text-[var(--text-main)] font-bold text-sm">{user.diocese || 'Giáo Phận Sài Gòn'}</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ENROLLED COURSES */}
            {activeTab === 'courses' && (
              <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200 shadow-xl">
                <h2 className="font-serif font-bold text-xl text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-500" /> Danh Sách Khóa Học Đang Đăng Ký
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif font-bold text-base text-[var(--text-main)]">{course.title}</h3>
                        <div className="w-full bg-[var(--border-card)] rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-muted)] font-bold">
                          <span>Đã học: {course.completedLessons}/{course.totalLessons} bài</span>
                          <span className="text-amber-600 dark:text-amber-400">{course.progress}%</span>
                        </div>
                      </div>

                      <Link href={`/khoa-hoc/${course.slug}`} className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all">
                        <PlayCircle className="w-4 h-4" /> Tiếp Tục Bài Học
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: QUIZ SCOREBOARD & HISTORY */}
            {activeTab === 'quiz' && (
              <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="font-serif font-bold text-xl text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" /> Bảng Điểm &amp; Lịch Sử Luyện Thi Đấu Trường
                  </h2>
                  {quizHistory.length > 0 && !showConfirmDelete && (
                    <button 
                      onClick={() => setShowConfirmDelete(true)}
                      className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa Toàn Bộ Lịch Sử
                    </button>
                  )}
                </div>

                {/* Inline Instant Confirmation Bar */}
                {showConfirmDelete && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs font-bold text-rose-500 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Bạn có chắc chắn muốn xóa toàn bộ lịch sử 10 bài luyện thi không?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={executeClearHistory}
                        className="px-4 py-1.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all font-bold shadow-sm"
                      >
                        Xác Nhận Xóa
                      </button>
                      <button 
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-4 py-1.5 bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl hover:bg-[var(--border-card)] transition-all font-bold"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {quizHistory.length === 0 ? (
                  <div className="text-center py-16 text-[var(--text-muted)] space-y-4">
                    <Trophy className="w-12 h-12 mx-auto opacity-30 text-amber-500" />
                    <p className="font-serif text-sm">Chưa có kết quả bài tập tự luyện nào trong lịch sử.</p>
                    <Link href="/quiz" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                      Bắt Đầu Luyện Thi Ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizHistory.map((item, index) => (
                      <div key={item.id} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[var(--text-main)]">{item.title}</h4>
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Thời gian làm bài: {item.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] font-bold">Số câu đúng</div>
                            <div className="font-black text-amber-600 dark:text-amber-400 text-base">{item.score} / {item.total}</div>
                          </div>

                          <span className={`px-4 py-2 rounded-xl font-black text-sm ${
                            item.percentage >= 80 
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                              : item.percentage >= 50
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                          }`}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: POST MANAGEMENT DASHBOARD */}
            {activeTab === 'posts' && (
              <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--border-card)] pb-4">
                  <div>
                    <h2 className="font-serif font-bold text-xl text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-500" /> Quản Lý Bài Viết ({userPosts.length})
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Danh sách bài viết đã xuất bản trên VERIDU. Bạn có thể xem và quản lý trực tiếp.
                    </p>
                  </div>
                  <Link
                    href="/dang-bai"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Soạn Bài Viết Mới
                  </Link>
                </div>

                {/* Confirm Delete Post Modal */}
                {postToDelete && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs font-bold text-rose-500 animate-in fade-in">
                    <span>Xác nhận xóa bài viết &quot;{postToDelete.title}&quot;? Thao tác này không thể hoàn tác.</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeletePost(postToDelete.id)}
                        className="px-4 py-1.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-bold"
                      >
                        Xác Nhận Xóa
                      </button>
                      <button
                        onClick={() => setPostToDelete(null)}
                        className="px-4 py-1.5 bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl font-bold"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {isLoadingPosts ? (
                  <div className="py-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Đang tải danh sách bài viết...
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)] space-y-3">
                    <BookOpen className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
                    <p className="text-xs font-serif">Chưa có bài viết nào được tìm thấy trong CSDL.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 font-bold text-amber-600 dark:text-amber-400 text-xs flex items-center justify-center shrink-0">
                            #{post.id}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif font-bold text-sm text-[var(--text-main)] hover:text-amber-500 transition-colors">
                              <Link href={`/${post.slug}`}>{post.title}</Link>
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">{post.category || 'Thần Học'}</span>
                              <span className="font-mono">/{post.slug}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Link
                            href={`/${post.slug}`}
                            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 transition text-xs font-bold flex items-center gap-1"
                            title="Xem bài viết thực tế"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem
                          </Link>

                          <Link
                            href={`/dang-bai?edit=${post.id}`}
                            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition text-xs font-bold flex items-center gap-1"
                            title="Chỉnh sửa bài"
                          >
                            <Settings className="w-3.5 h-3.5" /> Sửa
                          </Link>

                          <button
                            type="button"
                            onClick={() => setPostToDelete(post)}
                            className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition text-xs font-bold"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SETTINGS FORM */}
            {activeTab === 'settings' && (
              <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200 shadow-xl">
                <h2 className="font-serif font-bold text-xl text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" /> Cài Đặt Hồ Sơ &amp; Sinh Hoạt Giáo Xứ
                </h2>

                {message && (
                  <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                    <CheckCircle className="w-4 h-4" /> {message.text}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Change Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[var(--border-card)]">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-500/40 overflow-hidden flex items-center justify-center bg-[var(--bg-main)] text-amber-500 text-2xl font-black relative shrink-0 shadow-lg">
                      {formData.avatar ? (
                        <Image src={formData.avatar} alt="Avatar" fill className="object-cover" sizes="80px" />
                      ) : (
                        formData.christianName.charAt(0) || 'G'
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <h3 className="font-bold text-sm text-[var(--text-main)]">Ảnh Đại Diện Tín Hữu</h3>
                      <p className="text-xs text-[var(--text-muted)] max-w-md">Chọn hình ảnh các nhân vật Kinh Thánh làm avatar đại diện trong không gian học tập Giáo lý.</p>
                      <button 
                        type="button" 
                        onClick={() => setShowAvatarModal(true)} 
                        className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition flex items-center gap-1.5 mx-auto sm:mx-0"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Đổi Avatar Nhân Vật
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                        <Cross className="w-3.5 h-3.5 text-amber-500" /> Tên Thánh
                      </label>
                      <input 
                        type="text" 
                        value={formData.christianName} 
                        onChange={e => setFormData({...formData, christianName: e.target.value})}
                        placeholder="Giuse, Maria, Têrêsa..."
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-500" /> Họ và Tên
                      </label>
                      <input 
                        type="text" 
                        value={formData.displayName} 
                        onChange={e => setFormData({...formData, displayName: e.target.value})}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-500" /> Số Điện Thoại
                      </label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="0901234567"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                        <Church className="w-4 h-4 text-amber-500" /> Giáo Xứ
                      </label>
                      <input 
                        type="text" 
                        value={formData.parish} 
                        onChange={e => setFormData({...formData, parish: e.target.value})}
                        placeholder="Tân Định, Đức Bà..."
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-500" /> Giáo Phận
                      </label>
                      <input 
                        type="text" 
                        value={formData.diocese} 
                        onChange={e => setFormData({...formData, diocese: e.target.value})}
                        placeholder="Giáo Phận Sài Gòn"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" /> Ngày Lễ Bổn Mạng
                      </label>
                      <input 
                        type="text" 
                        value={formData.feastDay} 
                        onChange={e => setFormData({...formData, feastDay: e.target.value})}
                        placeholder="19/03 (Thánh Giuse)"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[var(--border-card)]">
                    <button 
                      type="submit" 
                      disabled={isUpdating}
                      className="px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Lưu Cập Nhật Hồ Sơ</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Avatar Selector Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-[var(--border-card)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border-card)] flex justify-between items-center">
              <h2 className="font-serif font-black text-xl text-[var(--text-main)]">Chọn Avatar Thánh Nhân Nhân Vật Kinh Thánh</h2>
              <button 
                onClick={() => setShowAvatarModal(false)} 
                className="w-8 h-8 rounded-full bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center hover:bg-red-500 hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 custom-scrollbar">
              {characters.filter(c => c.avatar_url).map(char => (
                <div 
                  key={char.id} 
                  onClick={() => { setFormData({...formData, avatar: char.avatar_url || ''}); setShowAvatarModal(false); }} 
                  className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-[var(--bg-main)] p-2 text-center group ${formData.avatar === char.avatar_url ? 'border-amber-500 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/50' : 'border-transparent hover:border-amber-500/50'}`}
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2">
                    <Image src={char.avatar_url!} alt={char.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 33vw, 20vw" />
                  </div>
                  <div className="text-xs font-bold text-[var(--text-main)] truncate">{char.name}</div>
                </div>
              ))}
              {characters.length === 0 && <p className="col-span-full text-center py-10 text-[var(--text-muted)] font-medium">Chưa có dữ liệu avatar nhân vật Kinh Thánh.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
