'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  UploadCloud, 
  Eye, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Settings, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Award,
  Check,
  X
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';

export default function AuthorDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin moderation queue state
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [pendingResources, setPendingResources] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my_content' | 'admin_moderation'>('my_content');
  const [modMessage, setModMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) {
      window.location.href = '/dang-nhap';
      return;
    }
    setUser(current);

    // Fetch author's own content
    fetch(`/api/authors/my-content?userId=${current.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.posts) setPosts(data.posts);
        if (data.resources) setResources(data.resources);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // If admin, fetch moderation queue
    if (current.role === 'admin' || current.role === 'Quản Trị Viên') {
      fetch('/api/admin/moderation')
        .then(res => res.json())
        .then(data => {
          if (data.posts) setPendingPosts(data.posts);
          if (data.resources) setPendingResources(data.resources);
          if (data.applications) setPendingApplications(data.applications);
        })
        .catch(() => {});
    }
  }, []);

  const handleModerate = async (targetType: 'post' | 'resource' | 'application', targetId: number | string, action: 'approve' | 'reject') => {
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
        setModMessage(`Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} thành công!`);
        setTimeout(() => setModMessage(null), 3000);
        
        // Remove from pending state
        if (targetType === 'post') setPendingPosts(prev => prev.filter(p => p.id !== targetId));
        if (targetType === 'resource') setPendingResources(prev => prev.filter(r => r.id !== targetId));
        if (targetType === 'application') setPendingApplications(prev => prev.filter(a => a.id !== targetId));
      }
    } catch (e) {}
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Quản Trị Viên';
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0) + resources.reduce((sum, r) => sum + (r.view_count || 0), 0);
  const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* Top Header Bar */}
      <div className="w-full border-b border-[var(--border-card)] bg-[var(--bg-card)]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tac-gia"
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trang Tác Giả</span>
            </Link>
            <div className="h-4 w-[1px] bg-[var(--border-card)] hidden sm:block" />
            <div className="text-xs font-serif">
              <span className="text-[var(--text-muted)]">Bảng Điều Khiển Tác Giả › </span>
              <strong className="text-amber-600 dark:text-amber-400">{user?.displayName || user?.username}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dang-bai"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-400 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Bài / Gửi Tài Liệu Mới</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 w-full space-y-8">
        
        {/* Author Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold font-serif">Bài Viết Của Tôi</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-serif font-black text-2xl text-[var(--text-main)]">{posts.length}</div>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold font-serif">Tài Nguyên Đã Gửi</span>
              <UploadCloud className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="font-serif font-black text-2xl text-[var(--text-main)]">{resources.length}</div>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold font-serif">Tổng Lượt Xem</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-serif font-black text-2xl text-[var(--text-main)]">{totalViews}</div>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold font-serif">Tổng Lượt Tải</span>
              <Download className="w-4 h-4 text-rose-500" />
            </div>
            <div className="font-serif font-black text-2xl text-[var(--text-main)]">{totalDownloads}</div>
          </div>
        </div>

        {/* Tab Navigation if Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
            <button
              onClick={() => setActiveTab('my_content')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition ${
                activeTab === 'my_content' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              Tác Phẩm Của Tôi
            </button>
            <button
              onClick={() => setActiveTab('admin_moderation')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition ${
                activeTab === 'admin_moderation' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Hàng Đợi Duyệt Bài ({pendingPosts.length + pendingResources.length + pendingApplications.length})</span>
            </button>
          </div>
        )}

        {modMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-serif font-bold">
            {modMessage}
          </div>
        )}

        {/* ── TAB 1: MY CONTENT ── */}
        {activeTab === 'my_content' && (
          <div className="space-y-8">
            
            {/* My Posts Section */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Bài Viết &amp; Khảo Cứu ({posts.length})</span>
                </h3>
                <Link href="/dang-bai" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  + Viết bài mới
                </Link>
              </div>

              {posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <Link href={`/${p.slug}`} className="font-serif font-bold text-sm text-[var(--text-main)] hover:text-amber-500 transition">
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold">{p.category}</span>
                          <span>• {p.views || 0} lượt xem</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          p.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        }`}>
                          {p.status === 'published' ? 'Đã Xuất Bản' : 'Đang Chờ Duyệt'}
                        </span>
                        <Link href={`/dang-bai?edit=${p.id}`} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] hover:text-amber-500">
                          Sửa
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Bạn chưa có bài viết nào.</p>
              )}
            </div>

            {/* My Resources Section */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-500" />
                  <span>Sách &amp; Tài Liệu Đã Chia Sẻ ({resources.length})</span>
                </h3>
                <Link href="/dang-bai" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  + Gửi tài liệu mới
                </Link>
              </div>

              {resources.length > 0 ? (
                <div className="space-y-3">
                  {resources.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-sm text-[var(--text-main)]">
                          {r.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 font-bold">{r.format || 'PDF'}</span>
                          <span>• {r.view_count || 0} xem • {r.download_count || 0} tải</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        r.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                      }`}>
                        {r.status === 'published' ? 'Đã Xuất Bản' : 'Đang Chờ Duyệt'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Bạn chưa chia sẻ tài liệu nào.</p>
              )}
            </div>

          </div>
        )}

        {/* ── TAB 2: ADMIN MODERATION QUEUE ── */}
        {isAdmin && activeTab === 'admin_moderation' && (
          <div className="space-y-8">
            
            {/* Pending Applications */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Đơn Ứng Tuyển Tác Giả / Giáo Lý Viên ({pendingApplications.length})</span>
              </h3>

              {pendingApplications.length > 0 ? (
                <div className="space-y-4">
                  {pendingApplications.map(app => (
                    <div key={app.id} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-base text-[var(--text-main)]">
                            {app.christian_name} {app.full_name}
                          </h4>
                          <div className="text-xs text-[var(--text-muted)] font-serif">
                            <span>{app.email} • {app.phone || 'Chưa có SĐT'}</span>
                            <span className="block">{app.diocese} • {app.parish}</span>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold border border-amber-500/30">
                          Ứng tuyển: {app.role_applied}
                        </span>
                      </div>

                      {app.bio && (
                        <p className="text-xs font-serif text-[var(--text-muted)] bg-[var(--bg-card)] p-3 rounded-xl">
                          "{app.bio}"
                        </p>
                      )}

                      {app.sample_work_url && (
                        <div className="text-xs font-serif">
                          <span className="text-stone-500">Bài mẫu: </span>
                          <a href={app.sample_work_url} target="_blank" rel="noreferrer" className="text-amber-500 underline font-mono text-[11px]">
                            {app.sample_work_url}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-card)]">
                        <button
                          onClick={() => handleModerate('application', app.id, 'reject')}
                          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Từ chối
                        </button>
                        <button
                          onClick={() => handleModerate('application', app.id, 'approve')}
                          className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold flex items-center gap-1 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" /> Duyệt &amp; Cấp Quyền Tác Giả
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Không có đơn ứng tuyển nào đang chờ duyệt.</p>
              )}
            </div>

            {/* Pending Posts */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Bài Viết Đang Chờ Duyệt ({pendingPosts.length})</span>
              </h3>

              {pendingPosts.length > 0 ? (
                <div className="space-y-3">
                  {pendingPosts.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-sm text-[var(--text-main)]">{p.title}</span>
                        <div className="text-xs text-[var(--text-muted)]">{p.category}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleModerate('post', p.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold">
                          Từ chối
                        </button>
                        <button onClick={() => handleModerate('post', p.id, 'approve')} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold">
                          Phê duyệt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Không có bài viết nào chờ duyệt.</p>
              )}
            </div>

            {/* Pending Resources */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
                <UploadCloud className="w-4 h-4 text-indigo-500" />
                <span>Tài Nguyên &amp; Giáo Án Chờ Duyệt ({pendingResources.length})</span>
              </h3>

              {pendingResources.length > 0 ? (
                <div className="space-y-3">
                  {pendingResources.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-sm text-[var(--text-main)]">{r.title}</span>
                        <div className="text-xs text-[var(--text-muted)]">{r.author} • {r.format}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleModerate('resource', r.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold">
                          Từ chối
                        </button>
                        <button onClick={() => handleModerate('resource', r.id, 'approve')} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold">
                          Phê duyệt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Không có tài nguyên nào chờ duyệt.</p>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
