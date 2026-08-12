'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getStoredUser, logout, saveAuthSession, UserProfile, 
  getStoredQuizHistory, clearQuizHistory, QuizAttempt 
} from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, Mail, Church, Compass, Award, Flame, Shield, LogOut, 
  Settings, BookOpen, CheckCircle, Clock, Save, Phone, Image as ImageIcon,
  Heart, Calendar, Loader2, Trophy, Trash2, ArrowRight, PlayCircle, BarChart3
} from 'lucide-react';

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'quiz' | 'settings'>('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Quiz history state
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);

  // Form State for Profile Settings
  const [formData, setFormData] = useState({
    christianName: '',
    displayName: '',
    email: '',
    phone: '',
    parish: '',
    diocese: '',
    feastDay: '19/03 (Thánh Giuse)',
    bio: ''
  });

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
        bio: 'Nguyện xin Lời Chúa là ngọn đèn soi cho con bước.'
      });
    }

    setQuizHistory(getStoredQuizHistory());
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      if (user?.id) {
        // Update Supabase profile table
        await supabase
          .from('profiles')
          .update({
            full_name: formData.displayName,
            role: user.role
          })
          .eq('id', user.id);
      }

      // Update local storage & cookie session
      const updatedUser: UserProfile = {
        ...user!,
        christianName: formData.christianName,
        displayName: formData.displayName,
        phone: formData.phone,
        parish: formData.parish,
        diocese: formData.diocese
      };

      saveAuthSession('sb_session_active', updatedUser);
      setUser(updatedUser);
      setMessage({ text: 'Đã cập nhật hồ sơ cá nhân thành công!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Lỗi cập nhật: ' + err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử 10 bài luyện thi Quiz không?')) {
      clearQuizHistory();
      setQuizHistory([]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
            V
          </div>
          <p className="text-slate-400 font-medium text-sm">Bạn chưa đăng nhập vào hệ thống VERIDU.</p>
          <Link href="/dang-nhap" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  // Demo LMS Enrolled Courses
  const enrolledCourses = [
    { id: 'cuu-uoc-1', title: 'Nhập Môn Kinh Thánh Cựu Ước', progress: 75, totalLessons: 12, completedLessons: 9, slug: 'cuu-uoc-1', icon: '📜' },
    { id: 'tan-uoc-1', title: 'Tin Mừng Theo Thánh Mát-thêu', progress: 40, totalLessons: 10, completedLessons: 4, slug: 'tan-uoc-1', icon: '✝️' },
    { id: 'phung-vu-1', title: 'Ý Nghĩa Các Mùa Phụng Vụ', progress: 100, totalLessons: 5, completedLessons: 5, slug: 'phung-vu-1', icon: '🕯️' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-8 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card Header (App Dashboard Hero) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl font-serif font-black shadow-xl shrink-0">
                {user.christianName ? user.christianName[0] : (user.displayName ? user.displayName[0] : 'V')}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-amber-400 font-serif font-bold text-xs uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1">
                    <span>✝</span>
                    <span>{user.christianName || 'Tín Hữu'}</span>
                  </span>
                  <span className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
                    {user.role || 'Học Viên'}
                  </span>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>🔥 {user.streak || 1} Ngày Liên Tục</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">{user.displayName || user.email}</h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                  <span className="text-slate-600">•</span>
                  <Church className="w-3.5 h-3.5 text-amber-500" /> {user.parish || 'Tân Định'} ({user.diocese || 'Giáo Phận Sài Gòn'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {(user.role === 'Quản Trị Viên' || user.role === 'admin') && (
                <Link href="/admin" className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20">
                  <Shield className="w-4 h-4" /> Trang Admin
                </Link>
              )}
              <Link href="/cai-dat" className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-main)] hover:bg-amber-500/10 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                <Settings className="w-4 h-4 text-amber-500" /> Cài Đặt
              </Link>
              <button onClick={logout} className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                <LogOut className="w-4 h-4" /> Đăng Xuất
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-card)]">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Tổng Quan Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'courses' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Khóa Học Đang Học ({enrolledCourses.length})
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'quiz' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
            }`}
          >
            <Trophy className="w-4 h-4" /> Lịch Sử Quiz ({quizHistory.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'settings' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
            }`}
          >
            <Settings className="w-4 h-4" /> Thống Kê & Cài Đặt
          </button>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between text-amber-500">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Tiến Trình Học</span>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black font-serif text-[var(--text-main)]">71.6%</div>
                <p className="text-[11px] text-[var(--text-muted)]">3 Khóa học đang đăng ký</p>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Điểm Quiz TB</span>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black font-serif text-[var(--text-main)]">90.0%</div>
                <p className="text-[11px] text-[var(--text-muted)]">{quizHistory.length} Lượt tự luyện thi</p>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Chuỗi Học Tập</span>
                  <Flame className="w-5 h-5 fill-amber-400" />
                </div>
                <div className="text-2xl font-black font-serif text-amber-400">1 Ngày</div>
                <p className="text-[11px] text-[var(--text-muted)]">Giữ vững phong độ hằng ngày</p>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Danh Hiệu</span>
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xl font-black font-serif text-emerald-400">Tín Hữu Chăm Chỉ</div>
                <p className="text-[11px] text-[var(--text-muted)]">Đã hoàn thành 18 bài học</p>
              </div>

            </div>

            {/* Middle Section: LMS Progress & Quiz History Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LMS Progress Widget */}
              <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Khóa Học Đang Theo Đuổi
                  </h3>
                  <button onClick={() => setActiveTab('courses')} className="text-xs font-bold text-amber-500 hover:underline">
                    Xem tất cả ➔
                  </button>
                </div>

                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 font-bold text-sm">
                          <span className="text-lg">{course.icon}</span>
                          <span className="text-[var(--text-main)]">{course.title}</span>
                        </div>
                        <span className="text-xs font-black text-amber-500">{course.progress}%</span>
                      </div>

                      <div className="w-full bg-[var(--border-card)] rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                        <span>Đã học {course.completedLessons}/{course.totalLessons} bài</span>
                        <Link href={`/khoa-hoc/${course.slug}`} className="text-amber-500 font-bold flex items-center gap-1 hover:underline">
                          Học Tiếp <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz History Widget (Max 10 Items + Auto Clear History) */}
              <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> Bảng Điểm Quiz (10 Lượt Gần Nhất)
                  </h3>

                  {quizHistory.length > 0 && (
                    <button 
                      onClick={handleClearHistory}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 transition-all"
                      title="Xóa lịch sử tự luyện cũ"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa Lịch Sử
                    </button>
                  )}
                </div>

                {quizHistory.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-muted)] space-y-3">
                    <Trophy className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-xs">Chưa có lịch sử làm bài Quiz tự luyện nào.</p>
                    <Link href="/quiz" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                      Luyện Thi Ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--border-card)]">
                    {quizHistory.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-[var(--text-main)] line-clamp-1">{item.title}</div>
                          <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {item.date}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-1 rounded-xl font-black text-xs inline-block ${
                            item.percentage >= 80 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                              : item.percentage >= 50
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
              <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                <Church className="w-5 h-5" /> Thông Tin Sinh Hoạt Giáo Xứ &amp; Giáo Phận (Đã Chuẩn Hóa UTF-8)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <div className="text-[var(--text-muted)] mb-1">Tên Thánh Bổn Mạng</div>
                  <div className="text-amber-400 font-bold text-sm">✝ {user.christianName || 'Giuse'}</div>
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
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200">
            <h2 className="font-serif font-bold text-xl text-amber-400 flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> Danh Sách Khóa Học LMS Đang Đăng Ký
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <div key={course.id} className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-2xl flex items-center justify-center">
                      {course.icon}
                    </div>
                    <h3 className="font-serif font-bold text-base text-[var(--text-main)]">{course.title}</h3>
                    <div className="w-full bg-[var(--border-card)] rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] font-bold">
                      <span>Đã học: {course.completedLessons}/{course.totalLessons} bài</span>
                      <span className="text-amber-500">{course.progress}%</span>
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
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-serif font-bold text-xl text-amber-400 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" /> Bảng Điểm &amp; Lịch Sử Luyện Thi Quiz
              </h2>
              {quizHistory.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-rose-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Xóa Toàn Bộ Lịch Sử 10 Bài
                </button>
              )}
            </div>

            {quizHistory.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)] space-y-4">
                <Trophy className="w-12 h-12 mx-auto opacity-30" />
                <p className="font-serif text-sm">Chưa có kết quả bài tập tự luyện nào trong lịch sử.</p>
                <Link href="/quiz" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Bắt Đầu Luyện Thi Quiz Ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {quizHistory.map((item, index) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[var(--text-main)]">{item.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5" /> Thời gian làm bài: {item.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)] font-bold">Số câu đúng</div>
                        <div className="font-black text-amber-500 text-base">{item.score} / {item.total}</div>
                      </div>

                      <span className={`px-4 py-2 rounded-xl font-black text-sm ${
                        item.percentage >= 80 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : item.percentage >= 50
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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

        {/* TAB 4: SETTINGS FORM */}
        {activeTab === 'settings' && (
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6 animate-in fade-in duration-200">
            <h2 className="font-serif font-bold text-xl text-amber-400 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Cài Đặt Chi Tiết Hồ Sơ &amp; Sinh Hoạt Giáo Xứ
            </h2>

            {message && (
              <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                <CheckCircle className="w-4 h-4" /> {message.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <span className="text-amber-400 font-serif font-black">✝</span> Tên Thánh
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
                    <User className="w-4 h-4" /> Họ và Tên
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
                    <Phone className="w-4 h-4" /> Số Điện Thoại
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
                    <Church className="w-4 h-4" /> Giáo Xứ
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
                    <Compass className="w-4 h-4" /> Giáo Phận
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
                    <Calendar className="w-4 h-4" /> Ngày Lễ Bổn Mạng
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

      </div>
    </div>
  );
}
