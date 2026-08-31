'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getStoredUser, logout, saveAuthSession, getAuthToken, UserProfile, 
  getStoredQuizHistory, clearQuizHistory, QuizAttempt 
} from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { calculateLevelInfo, ALL_TITLES_CATALOG, TitleDefinition } from '@/lib/gamification';
import UserAvatarFrame from '@/components/UserAvatarFrame';
import CourseCertificateModal, { CertificateData } from '@/components/CourseCertificateModal';
import { 
  User, Mail, Church, Compass, Award, Flame, Shield, LogOut, 
  Settings, BookOpen, CheckCircle, Clock, Save, Phone, Image as ImageIcon,
  Heart, Calendar, Loader2, Trophy, Trash2, ArrowRight, PlayCircle, BarChart3, 
  AlertTriangle, Check, Plus, Eye, Cross, FileText, Zap, Droplets, Sparkles, Scroll
} from 'lucide-react';

import { 
  fetchUserQuizAttemptsFromSupabase, clearUserQuizAttemptsFromSupabase, 
  fetchUserCourseProgressFromSupabase, fetchCharacters, Character 
} from '@/lib/api';

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'certificates' | 'titles' | 'mana' | 'quiz' | 'posts' | 'settings'>('dashboard');
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

  // Certificates Modal State
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);

  // Quiz history & LMS courses state from Supabase
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Non-blocking transition state
  const [isPending, startTransition] = useTransition();

  // Selected Title state
  const [selectedTitle, setSelectedTitle] = useState<string>('NGƯỜI TÌM HIỂU');

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
      setSelectedTitle((current as any)?.selected_title || (current as any)?.current_title || 'NGƯỜI TÌM HIỂU');
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
      if (!user) return;

      const updatedUser: UserProfile = {
        ...user,
        christianName: formData.christianName,
        displayName: formData.displayName,
        phone: formData.phone,
        parish: formData.parish,
        diocese: formData.diocese,
        avatar: formData.avatar
      };

      saveAuthSession(updatedUser);
      setUser(updatedUser);

      if (user.id) {
        await supabase
          .from('profiles')
          .update({
            christian_name: formData.christianName,
            full_name: formData.displayName,
            phone: formData.phone,
            parish: formData.parish,
            diocese: formData.diocese,
            avatar_url: formData.avatar,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      window.dispatchEvent(new CustomEvent('veridu_user_updated', { detail: updatedUser }));
      setMessage({ text: 'Cập nhật thông tin hồ sơ thành công!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi lưu thông tin', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Change Selected Title Handler
  const handleSelectTitle = async (titleName: string) => {
    if (!user) return;
    setSelectedTitle(titleName);

    const updatedUser = {
      ...user,
      selected_title: titleName,
      current_title: titleName
    };

    saveAuthSession(updatedUser as any);
    setUser(updatedUser as any);

    if (user.id) {
      await supabase
        .from('profiles')
        .update({
          selected_title: titleName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }

    window.dispatchEvent(new CustomEvent('veridu_user_updated', { detail: updatedUser }));
    setMessage({ text: `Đã đổi danh hiệu thành: ${titleName}`, type: 'success' });
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif font-black mb-2">Vui Lòng Đăng Nhập</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 font-serif">Bạn cần đăng nhập để xem thông tin hồ sơ và tiến trình cá nhân.</p>
        <Link href="/dang-nhap" className="px-6 py-3 rounded-full bg-amber-500 text-slate-950 font-bold font-serif shadow-lg hover:bg-amber-400 transition">
          Đăng Nhập Ngay
        </Link>
      </div>
    );
  }

  const levelInfo = calculateLevelInfo(user.points || 100, selectedTitle);
  const currentMana = user.manna !== undefined ? user.manna : 100;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ========================================================================= */}
        {/* 🌟 2-COLUMN MAIN LAYOUT (LEFT PROFILE CARD + RIGHT DASHBOARD WORKSPACE)    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* 👤 LEFT COLUMN: USER AVATAR FRAME & STATS SUMMARY CARD                 */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
            
            {/* User Avatar with Metallic Frame & Pure Typography 3D Ribbon */}
            <div className="flex flex-col items-center">
              <UserAvatarFrame
                avatarUrl={user.avatar}
                christianName={user.christianName}
                displayName={user.displayName}
                points={user.points || 100}
                selectedTitle={selectedTitle}
                size="lg"
                showTitleRibbon={true}
                showProgressBar={true}
              />

              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="mt-3 text-[11px] font-serif font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Đổi ảnh đại diện Thánh
              </button>
            </div>

            {/* Core Identity Info */}
            <div className="text-center space-y-1 border-t border-[var(--border-card)] pt-4">
              <h3 className="text-xl font-serif font-black text-[var(--text-main)]">
                {user.christianName ? `${user.christianName} ` : ''}{user.displayName || 'Thành Viên'}
              </h3>
              <p className="text-xs font-mono text-[var(--text-muted)]">{user.email}</p>
            </div>

            {/* Quick Stats Grid: Streak, EXP, Mana */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-main)]/70 border border-[var(--border-card)] rounded-2xl text-center">
              <div className="space-y-0.5">
                <div className="text-[10px] font-serif uppercase tracking-wider text-[var(--text-muted)]">Chuỗi Ngày</div>
                <div className="font-serif font-black text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.streak || 1}</span>
                </div>
              </div>

              <div className="space-y-0.5 border-x border-[var(--border-card)]">
                <div className="text-[10px] font-serif uppercase tracking-wider text-[var(--text-muted)]">Kinh Nghiệm</div>
                <div className="font-serif font-black text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.points || 100}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-serif uppercase tracking-wider text-[var(--text-muted)]">Điểm Mana</div>
                <div className="font-serif font-black text-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                  <Droplets className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                  <span>{currentMana}</span>
                </div>
              </div>
            </div>

            {/* Parish & Diocese Information */}
            <div className="space-y-2.5 text-xs font-serif border-t border-[var(--border-card)] pt-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Giáo Xứ:</span>
                <span className="font-bold text-[var(--text-main)]">{user.parish || 'Tân Định'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Giáo Phận:</span>
                <span className="font-bold text-[var(--text-main)]">{user.diocese || 'Giáo Phận Sài Gòn'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Vai Trò:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{user.role || 'Thành Viên'}</span>
              </div>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--border-card)]">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <User className="w-4 h-4" /> Tổng Quan Hồ Sơ
              </button>

              <button
                onClick={() => setActiveTab('titles')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'titles' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <Award className="w-4 h-4" /> Danh Hiệu &amp; Cấp Bậc
              </button>

              <button
                onClick={() => setActiveTab('certificates')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'certificates' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <Scroll className="w-4 h-4" /> Chứng Chỉ Khóa Học
              </button>

              <button
                onClick={() => setActiveTab('mana')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'mana' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <Droplets className="w-4 h-4" /> Năng Lượng Mana
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'courses' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Khóa Học Đang Học
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'quiz' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <Trophy className="w-4 h-4" /> Lịch Sử Đấu Trường
              </button>

              {user.role === 'Quản Trị Viên' && (
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'posts' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Quản Lý Bài Viết ({userPosts.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                }`}
              >
                <Settings className="w-4 h-4" /> Cài Đặt Hồ Sơ
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-2 border-t border-[var(--border-card)]">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white text-xs font-serif font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Đăng Xuất
              </button>
            </div>

          </div>


          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* 📊 RIGHT COLUMN: DYNAMIC TABS WORKSPACE                                 */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {message && (
              <div className={`p-4 rounded-2xl text-xs font-serif font-bold flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
            {activeTab === 'dashboard' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Tổng Quan Tiến Trình</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
                    Theo dõi hành trình học hỏi Lời Chúa, tích lũy điểm kinh nghiệm và thăng cấp.
                  </p>
                </div>

                {/* Level Detail Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-serif uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold block">
                        Cấp Bậc Hiện Tại
                      </span>
                      <h3 className="font-serif font-black text-2xl text-[var(--text-main)]">
                        CẤP {levelInfo.level} · {levelInfo.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                        {levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP
                      </span>
                      <div className="text-[10px] font-serif text-[var(--text-muted)]">
                        {levelInfo.level >= 100 ? 'Đã đạt cấp tối đa' : `Cần ${levelInfo.nextLevelExp - levelInfo.currentExp} EXP để lên Cấp ${levelInfo.level + 1}`}
                      </div>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="w-full h-3 bg-[var(--bg-main)] border border-amber-500/30 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 6 Milestone Badges Overview (Pure Typography) */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    6 Cột Mốc Danh Hiệu Cấp Bậc
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { lvl: 1, name: 'NGƯỜI TÌM HIỂU', exp: 100, desc: 'Cấp 1 - 9' },
                      { lvl: 10, name: 'NGƯỜI NĂNG ĐỘNG', exp: 1000, desc: 'Cấp 10 - 24' },
                      { lvl: 25, name: 'MÔN ĐỆ TRUNG TÍN', exp: 5000, desc: 'Cấp 25 - 49' },
                      { lvl: 50, name: 'HIỆP SĨ PHÚC ÂM', exp: 15000, desc: 'Cấp 50 - 74' },
                      { lvl: 75, name: 'HỌC GIẢ UYÊN BÁC', exp: 35000, desc: 'Cấp 75 - 99' },
                      { lvl: 100, name: 'TÔNG ĐỒ ÁNH SÁNG', exp: 100000, desc: 'Cấp 100' },
                    ].map((m) => {
                      const isUnlocked = levelInfo.level >= m.lvl;
                      return (
                        <div
                          key={m.lvl}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isUnlocked
                              ? 'bg-amber-500/10 border-amber-500/40 text-[var(--text-main)] shadow-xs'
                              : 'bg-[var(--bg-main)]/50 border-[var(--border-card)] opacity-50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                            <span className="font-bold">{m.desc}</span>
                            <span>{m.exp} EXP</span>
                          </div>
                          <h5 className="font-serif font-bold text-xs uppercase tracking-wider truncate">
                            {m.name}
                          </h5>
                          <span className="text-[10px] font-serif text-[var(--text-muted)] mt-0.5 block">
                            {isUnlocked ? 'Đã Mở Khóa' : 'Chưa Đạt'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 2: TITLES MANAGEMENT (CHỌN DANH HIỆU GHIM) ── */}
            {activeTab === 'titles' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Kho Tàng Danh Hiệu</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
                    Chọn 1 danh hiệu bạn đã mở khóa để gắn hiển thị trên Bảng Nhãn dưới Avatar của mình.
                  </p>
                </div>

                <div className="space-y-4">
                  {ALL_TITLES_CATALOG.map((title) => {
                    const isUnlocked = (
                      title.category === 'level' ? levelInfo.level >= title.requiredValue :
                      title.category === 'author' ? userPosts.length >= title.requiredValue :
                      true // Game titles unlocked
                    );
                    const isSelected = selectedTitle === title.name;

                    return (
                      <div
                        key={title.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-md'
                            : isUnlocked
                            ? 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40'
                            : 'bg-[var(--bg-main)]/40 border-[var(--border-card)] opacity-40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)]">
                              {title.category === 'level' ? 'Cấp Độ' : title.category === 'author' ? 'Tác Giả' : 'Trò Chơi'}
                            </span>
                            <h4 className="font-serif font-black text-sm uppercase tracking-wider text-[var(--text-main)]">
                              {title.name}
                            </h4>
                          </div>
                          <p className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                            {title.description}
                          </p>
                        </div>

                        <div>
                          {isSelected ? (
                            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-black text-xs shadow-xs">
                              Đang Ghim
                            </span>
                          ) : isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => handleSelectTitle(title.name)}
                              className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-amber-500 hover:text-slate-950 border border-[var(--border-card)] font-serif font-bold text-xs transition cursor-pointer"
                            >
                              Ghim Danh Hiệu
                            </button>
                          ) : (
                            <span className="text-xs font-serif text-[var(--text-muted)] italic">
                              Chưa mở
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 3: COURSE CERTIFICATES ── */}
            {activeTab === 'certificates' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Chứng Chỉ Khóa Học Của Tôi</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
                    Các văn bằng và chứng chỉ hoàn thành khóa học được cấp chính thức từ Học Viện VERIDU.
                  </p>
                </div>

                {/* Demo / Real Certificates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      courseTitle: 'Nhập Môn Thần Học & Kinh Thánh Toàn Thư',
                      courseSlug: 'nhap-mon-than-hoc',
                      code: 'CERT-VERIDU-84920',
                      date: '15/08/2026'
                    },
                    {
                      courseTitle: 'Lịch Sử Cứu Độ & Các Giao Ước Thánh',
                      courseSlug: 'lich-su-cuu-do',
                      code: 'CERT-VERIDU-91834',
                      date: '28/08/2026'
                    }
                  ].map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-gradient-to-br from-[#fbf9f4] to-[#f4eee1] text-[#2e1c0c] border-2 border-[#d4af37]/60 shadow-md space-y-3 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-serif uppercase tracking-widest font-bold text-[#8b6508] bg-[#d4af37]/20 px-2 py-0.5 rounded-full border border-[#d4af37]/40">
                          Học Viện VERIDU
                        </span>
                        <span className="text-[10px] font-mono text-[#795548]">{cert.date}</span>
                      </div>

                      <div>
                        <h4 className="font-serif font-black text-base text-[#3e2723] line-clamp-2">
                          {cert.courseTitle}
                        </h4>
                        <p className="text-[11px] font-mono text-[#8d6e63] mt-1">Mã: {cert.code}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCertificate({
                          courseTitle: cert.courseTitle,
                          courseSlug: cert.courseSlug,
                          recipientName: user.displayName || 'Học Viên',
                          christianName: user.christianName || 'Giuse',
                          certificateCode: cert.code,
                          issuedAt: cert.date
                        })}
                        className="w-full py-2 rounded-xl bg-[#b8860b] hover:bg-[#996515] text-white font-serif font-bold text-xs transition shadow-sm cursor-pointer"
                      >
                        Xem &amp; In Chứng Chỉ Cổ Điển
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: MANA ECONOMY & TRANSACTIONS ── */}
            {activeTab === 'mana' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Năng Lượng Mana &amp; Đặc Quyền</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
                    Mana là vật phẩm tiêu hao dùng để mở khóa tài liệu độc quyền, giáo án và trợ giúp trong trò chơi.
                  </p>
                </div>

                {/* Mana Balance Box */}
                <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-serif uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-bold block">
                      Số Dư Năng Lượng Mana
                    </span>
                    <h3 className="font-serif font-black text-3xl text-[var(--text-main)] flex items-center gap-2">
                      <Droplets className="w-6 h-6 fill-indigo-500 text-indigo-500" />
                      <span>{currentMana} Mana</span>
                    </h3>
                  </div>

                  <div className="text-right text-xs font-serif text-[var(--text-muted)]">
                    <div>+20 Mana mỗi ngày đăng nhập</div>
                    <div>+30 Mana mỗi bài học hoàn tất</div>
                  </div>
                </div>

                {/* Mana Exchange Rules */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Quy Đổi &amp; Sử Dụng Mana
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
                    <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
                      <div className="font-bold text-[var(--text-main)]">Mở Bài Đọc Đặc Quyền</div>
                      <p className="text-[11px] text-[var(--text-muted)]">Tiêu hao 10 Mana cho mỗi chuyên luận thần học chuyên sâu.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
                      <div className="font-bold text-[var(--text-main)]">Tải Slide Giáo Án PDF</div>
                      <p className="text-[11px] text-[var(--text-muted)]">Tiêu hao 20 Mana cho mỗi bộ slide giáo án giáo lý hoàn chỉnh.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 5: COURSES ── */}
            {activeTab === 'courses' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Khóa Học Đang Theo Học</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">Các khóa đào tạo thần học và giáo lý trực tuyến của bạn.</p>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)] space-y-3">
                    <BookOpen className="w-10 h-10 mx-auto opacity-40" />
                    <p className="font-serif text-sm">Bạn chưa đăng ký khóa học nào.</p>
                    <Link href="/khoa-hoc" className="inline-block px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs font-serif">
                      Khám Phá Khóa Học
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrolledCourses.map((c, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex justify-between items-center">
                        <div>
                          <h4 className="font-serif font-bold text-sm">{c.course_title || c.title}</h4>
                          <span className="text-xs text-[var(--text-muted)] font-mono">Tiến độ: {c.progress_percent || 0}%</span>
                        </div>
                        <Link href={`/khoa-hoc/${c.course_slug || c.slug}`} className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 font-serif font-bold text-xs">
                          Tiếp Tục Học
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 6: QUIZ ── */}
            {activeTab === 'quiz' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Lịch Sử Đấu Trường Quiz</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">Kết quả và thành tích các lượt thi trắc nghiệm Lời Chúa.</p>
                </div>

                {quizHistory.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)] font-serif text-sm">
                    Chưa có lượt làm bài nào.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {quizHistory.map((q, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex justify-between items-center text-xs font-serif">
                        <div>
                          <div className="font-bold text-[var(--text-main)]">{q.title || (q as any).quizTitle || 'Bài Trắc Nghiệm'}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{q.date}</div>
                        </div>
                        <div className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                          {q.score}/{q.total || (q as any).totalQuestions || 10} ({Math.round((q.score / ((q.total || (q as any).totalQuestions || 10))) * 100)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 7: POSTS (ADMIN) ── */}
            {activeTab === 'posts' && user.role === 'Quản Trị Viên' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--border-card)] pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-black">Quản Lý Bài Viết ({userPosts.length})</h2>
                    <p className="text-xs text-[var(--text-muted)] font-serif mt-1">Danh sách bài viết đã xuất bản trên hệ thống VERIDU.</p>
                  </div>
                  <Link href="/dang-bai" className="px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md">
                    + Soạn Bài Viết Mới
                  </Link>
                </div>

                <div className="space-y-3">
                  {userPosts.map((post) => (
                    <div key={post.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase text-amber-600 font-bold">{post.category}</span>
                        <h4 className="font-serif font-bold text-sm truncate">{post.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/thu-vien/${post.slug}`} className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif font-bold hover:text-amber-500">
                          Xem
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 8: SETTINGS ── */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveProfile} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-black">Cài Đặt Thông Tin Cá Nhân</h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-1">Cập nhật Tên Thánh, Họ Tên, Giáo Xứ và Giáo Phận.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
                  <div>
                    <label className="font-bold block mb-1.5">Tên Thánh:</label>
                    <input
                      type="text"
                      value={formData.christianName}
                      onChange={(e) => setFormData({ ...formData, christianName: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1.5">Họ &amp; Tên:</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1.5">Giáo Xứ:</label>
                    <input
                      type="text"
                      value={formData.parish}
                      onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1.5">Giáo Phận:</label>
                    <input
                      type="text"
                      value={formData.diocese}
                      onChange={(e) => setFormData({ ...formData, diocese: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {isUpdating ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>

      {/* ── COURSE CERTIFICATE MODAL ── */}
      <CourseCertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      {/* ── AVATAR PICKER MODAL ── */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-card)] pb-3">
              <h3 className="font-serif font-bold text-sm">Chọn Ảnh Đại Diện Thánh</h3>
              <button onClick={() => setShowAvatarModal(false)} className="p-1 rounded-full bg-[var(--bg-main)]">✕</button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setFormData({ ...formData, avatar: ((c as any).imageUrl || (c as any).image || (c as any).avatarUrl || '') });
                    setShowAvatarModal(false);
                  }}
                  className="p-2 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 transition text-center space-y-1"
                >
                  <div className="relative w-12 h-12 mx-auto rounded-xl overflow-hidden">
                    <Image src={((c as any).imageUrl || (c as any).image || (c as any).avatarUrl || '')} alt={c.name || (c as any).nameVi || 'Thánh'} fill className="object-cover" />
                  </div>
                  <span className="text-[10px] font-serif block truncate">{c.name || (c as any).nameVi || 'Thánh'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
