'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  UploadCloud, 
  GraduationCap, 
  Gamepad2, 
  PenTool, 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  ArrowLeft, 
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  Church,
  BookOpen,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';

interface ModerationState {
  posts: any[];
  resources: any[];
  applications: any[];
  courses: any[];
}

export default function AdminHubPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'posts' | 'resources' | 'courses'>('applications');
  const [moderationData, setModerationData] = useState<ModerationState>({
    posts: [],
    resources: [],
    applications: [],
    courses: []
  });
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    if (currentUser) {
      loadModerationQueue();
    } else {
      setLoading(false);
    }
  }, []);

  const loadModerationQueue = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/moderation');
      if (res.ok) {
        const data = await res.json();
        setModerationData({
          posts: data.posts || [],
          resources: data.resources || [],
          applications: data.applications || [],
          courses: data.courses || []
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải hàng đợi kiểm duyệt:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleModerate = async (
    targetType: 'post' | 'resource' | 'application' | 'course',
    targetId: number | string,
    action: 'approve' | 'reject'
  ) => {
    setProcessingId(targetId);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          action,
          admin_id: user?.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const actionText = action === 'approve' ? 'Phê duyệt và cấp quyền thành công!' : 'Đã từ chối mục này.';
        setActionMessage({ type: 'success', text: actionText });

        // Update local state
        setModerationData(prev => ({
          ...prev,
          posts: targetType === 'post' ? prev.posts.filter(p => p.id !== targetId) : prev.posts,
          resources: targetType === 'resource' ? prev.resources.filter(r => r.id !== targetId) : prev.resources,
          applications: targetType === 'application' ? prev.applications.filter(a => a.id !== targetId) : prev.applications,
          courses: targetType === 'course' ? prev.courses.filter(c => c.id !== targetId) : prev.courses
        }));
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Thao tác thất bại.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Quản Trị Viên';
  const totalPending = 
    moderationData.applications.length + 
    moderationData.posts.length + 
    moderationData.resources.length + 
    moderationData.courses.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center pt-24 pb-20">
        <div className="flex flex-col items-center gap-3 text-amber-500 font-serif">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-bold">Đang tải Trung Tâm Quản Trị VERIDU...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 pt-24 pb-20">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">Truy Cập Bị Giới Hạn</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
            Khu vực này dành riêng cho Ban Quản Trị Hệ Thống VERIDU. Vui lòng đăng nhập với tài khoản được ủy quyền.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link
              href="/dang-nhap"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs hover:bg-amber-400 transition"
            >
              Đăng Nhập Quản Trị
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:text-amber-500 transition"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-20 md:pt-24 xl:pt-28">
      
      {/* ── TOP HERO HEADER ── */}
      <section className="relative w-full py-10 px-4 sm:px-6 lg:px-12 border-b border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-serif font-bold tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>TRUNG TÂM KIỂM DUYỆT &amp; ĐIỀU HÀNH HỆ THỐNG</span>
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
              Bảng Quản Trị VERIDU
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
              Xin chào Quản Trị Viên <strong className="text-amber-600 dark:text-amber-400">{user.christianName} {user.displayName}</strong>. 
              Hiện có <strong className="text-amber-500 font-mono text-sm">{totalPending}</strong> mục đang chờ phê duyệt.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadModerationQueue}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-xs font-serif font-bold text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Làm mới hàng đợi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
              <span>Làm Mới</span>
            </button>
            <Link
              href="/soan-bai"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 transition shadow-md hover:scale-105"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Phòng Soạn Thảo</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        
        {/* ── 1. STUDIO QUICK LAUNCHERS ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Các Phân Hệ Quản Trị Studio</span>
            </h2>
            <span className="text-[11px] font-serif text-[var(--text-muted)]">Truy cập trực tiếp</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Sách Tranh Studio */}
            <Link
              href="/admin/sach-tranh"
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 transition" />
              </div>
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-amber-500 transition">
                  Studio Sách Tranh
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                  Biên tập truyện tranh lật trang 3D &amp; Audio
                </p>
              </div>
            </Link>

            {/* Ngân Hàng Quiz */}
            <Link
              href="/admin/quiz-bank"
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition" />
              </div>
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-emerald-500 transition">
                  Ngân Hàng Câu Hỏi
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                  Quản lý ngân hàng đề &amp; Đấu trường Quiz
                </p>
              </div>
            </Link>

            {/* Khóa Học LMS Studio */}
            <Link
              href="/admin/khoa-hoc"
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-500 transition" />
              </div>
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-indigo-500 transition">
                  Khóa Học LMS Studio
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                  Soạn thảo bài học, chương mục &amp; lộ trình
                </p>
              </div>
            </Link>

            {/* Quản Lý Tác Giả & Hồ Sơ */}
            <Link
              href="/tac-gia/dashboard"
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-rose-500 transition" />
              </div>
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-rose-500 transition">
                  Bảng Tác Giả Cá Nhân
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                  Thống kê bài viết, lượt tải &amp; tài nguyên
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── 2. MODERATION HUB TABS ── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Tab 1: Ứng Tuyển Tác Giả */}
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'applications'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Đơn Ứng Tuyển Tác Giả</span>
                {moderationData.applications.length > 0 && (
                  <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-black ${
                    activeTab === 'applications' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {moderationData.applications.length}
                  </span>
                )}
              </button>

              {/* Tab 2: Bài Viết */}
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'posts'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài Viết</span>
                {moderationData.posts.length > 0 && (
                  <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-black ${
                    activeTab === 'posts' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {moderationData.posts.length}
                  </span>
                )}
              </button>

              {/* Tab 3: Tài Liệu */}
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'resources'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Tài Liệu Giáo Án</span>
                {moderationData.resources.length > 0 && (
                  <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-black ${
                    activeTab === 'resources' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {moderationData.resources.length}
                  </span>
                )}
              </button>

              {/* Tab 4: Khóa Học */}
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'courses'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Khóa Học LMS</span>
                {moderationData.courses.length > 0 && (
                  <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-black ${
                    activeTab === 'courses' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {moderationData.courses.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Action Message Toast */}
          {actionMessage && (
            <div className={`p-4 rounded-2xl border text-xs font-serif font-bold animate-in fade-in duration-200 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}>
              {actionMessage.text}
            </div>
          )}

          {/* ── TAB CONTENT 1: AUTHOR APPLICATIONS ── */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {moderationData.applications.length > 0 ? (
                moderationData.applications.map(app => (
                  <div 
                    key={app.id} 
                    className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 hover:border-amber-500/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-black text-lg text-[var(--text-main)]">
                            {app.christian_name ? `${app.christian_name} ` : ''}{app.full_name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-serif font-bold uppercase">
                            {app.role_applied === 'catechist' ? 'Giáo Lý Viên' : app.role_applied === 'instructor' ? 'Giảng Viên Thần Học' : 'Tác Giả / Học Giả'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] font-serif pt-1">
                          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                            <Mail className="w-3.5 h-3.5" />
                            <a href={`mailto:${app.email}`} className="hover:underline">{app.email}</a>
                          </span>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {app.phone}
                            </span>
                          )}
                          {(app.parish || app.diocese) && (
                            <span className="flex items-center gap-1">
                              <Church className="w-3.5 h-3.5" />
                              {[app.parish, app.diocese].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    {app.specialty && (
                      <div className="text-xs font-serif">
                        <strong className="text-amber-600 dark:text-amber-400">Chuyên môn: </strong>
                        <span className="text-[var(--text-main)]">{app.specialty}</span>
                      </div>
                    )}

                    {app.bio && (
                      <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif text-[var(--text-muted)] italic leading-relaxed">
                        &ldquo;{app.bio}&rdquo;
                      </div>
                    )}

                    {app.sample_work_url && (
                      <div className="text-xs font-serif flex items-center gap-1.5">
                        <span className="text-[var(--text-muted)]">Tác phẩm / Bài mẫu:</span>
                        <a
                          href={app.sample_work_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 dark:text-amber-400 underline flex items-center gap-1 font-mono text-[11px] hover:text-amber-300"
                        >
                          <span>{app.sample_work_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-card)]">
                      <button
                        onClick={() => handleModerate('application', app.id, 'reject')}
                        disabled={processingId === app.id}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ Chối</span>
                      </button>
                      
                      <button
                        onClick={() => handleModerate('application', app.id, 'approve')}
                        disabled={processingId === app.id}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md transition hover:scale-105 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{processingId === app.id ? 'Đang Xử Lý...' : 'Duyệt & Cấp Quyền Tác Giả'}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
                  <h4 className="font-serif font-bold text-base text-[var(--text-main)]">Không có đơn ứng tuyển nào chờ duyệt</h4>
                  <p className="text-xs font-serif text-[var(--text-muted)]">Tất cả các đơn đăng ký tác giả và giáo lý viên đã được xử lý hoàn tất.</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB CONTENT 2: PENDING POSTS ── */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {moderationData.posts.length > 0 ? (
                moderationData.posts.map(post => (
                  <div 
                    key={post.id} 
                    className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-serif font-bold text-[10px]">
                          {post.category || 'Bài Viết'}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[var(--text-main)] truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs font-mono text-[var(--text-muted)] truncate">
                        Slug: /{post.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1 transition"
                        title="Xem trước bài viết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-serif font-bold">Xem Thử</span>
                      </Link>
                      <button
                        onClick={() => handleModerate('post', post.id, 'reject')}
                        disabled={processingId === post.id}
                        className="p-2 sm:px-3 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                        title="Từ chối"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Từ Chối</span>
                      </button>
                      <button
                        onClick={() => handleModerate('post', post.id, 'approve')}
                        disabled={processingId === post.id}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-serif font-bold flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Xuất Bản</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                  <FileText className="w-10 h-10 text-amber-500 mx-auto opacity-70" />
                  <h4 className="font-serif font-bold text-base text-[var(--text-main)]">Không có bài viết nào chờ duyệt</h4>
                  <p className="text-xs font-serif text-[var(--text-muted)]">Tất cả bài viết đã được xuất bản hoặc kiểm tra.</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB CONTENT 3: PENDING RESOURCES ── */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {moderationData.resources.length > 0 ? (
                moderationData.resources.map(res => (
                  <div 
                    key={res.id} 
                    className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-serif font-bold text-[10px] uppercase">
                          {res.format || 'PDF'}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          Tác giả: {res.author || 'Cộng tác viên'}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[var(--text-main)] truncate">
                        {res.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {res.file_url && (
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-indigo-500 flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline font-serif font-bold">Mở Tệp</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleModerate('resource', res.id, 'reject')}
                        disabled={processingId === res.id}
                        className="p-2 sm:px-3 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Từ Chối</span>
                      </button>
                      <button
                        onClick={() => handleModerate('resource', res.id, 'approve')}
                        disabled={processingId === res.id}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-serif font-bold flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt Tài Liệu</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                  <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto opacity-70" />
                  <h4 className="font-serif font-bold text-base text-[var(--text-main)]">Không có tài liệu nào chờ duyệt</h4>
                  <p className="text-xs font-serif text-[var(--text-muted)]">Tất cả tài nguyên giáo án và sách điện tử đã được kiểm tra.</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB CONTENT 4: PENDING COURSES ── */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {moderationData.courses.length > 0 ? (
                moderationData.courses.map(course => (
                  <div 
                    key={course.id} 
                    className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 font-serif font-bold text-[10px]">
                          {course.category || 'Giáo Lý'}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          Giảng viên: {course.instructor_name || 'Học viện'}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[var(--text-main)] truncate">
                        {course.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/khoa-hoc?edit=${course.id}`}
                        className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-amber-600 dark:text-amber-400 hover:border-amber-500 flex items-center gap-1 transition"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-serif font-bold">Mở Studio</span>
                      </Link>
                      <button
                        onClick={() => handleModerate('course', course.id, 'reject')}
                        disabled={processingId === course.id}
                        className="p-2 sm:px-3 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Từ Chối</span>
                      </button>
                      <button
                        onClick={() => handleModerate('course', course.id, 'approve')}
                        disabled={processingId === course.id}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-serif font-bold flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt Khóa Học</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
                  <GraduationCap className="w-10 h-10 text-amber-500 mx-auto opacity-70" />
                  <h4 className="font-serif font-bold text-base text-[var(--text-main)]">Không có khóa học nào chờ duyệt</h4>
                  <p className="text-xs font-serif text-[var(--text-muted)]">Tất cả các khóa học LMS đã được phê duyệt hoặc đang soạn nháp.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
