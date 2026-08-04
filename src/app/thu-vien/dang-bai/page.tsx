'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredUser, getAuthToken, UserProfile } from '@/lib/auth';
import { PenTool, Send, AlertTriangle, Loader2 } from 'lucide-react';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';

export default function SubmitPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/dang-nhap');
    } else {
      const allowedRoles = ['Người Đóng Góp', 'Học Giả VERIDU', 'Giáo Lý Viên', 'Quản Trị Viên'];
      if (!allowedRoles.includes(storedUser.role)) {
        setStatus('error');
        setErrorMsg('Tài khoản của bạn chưa được cấp quyền đăng bài. Hãy tích cực học tập để mở khóa Danh hiệu Học Giả!');
      }
      setUser(storedUser);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setStatus('loading');
    try {
      const token = getAuthToken();
      const res = await fetch(`${WP_API_BASE}/ugc/submit-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi đăng bài');
      
      setStatus('success');
      setTitle('');
      setContent('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <PenTool className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif font-black text-3xl">Đóng Góp Bài Viết</h1>
            <p className="text-[var(--text-muted)] text-sm">Chia sẻ kiến thức thần học và suy niệm Lời Chúa với cộng đồng.</p>
          </div>
        </div>

        {status === 'error' && errorMsg.includes('chưa được cấp quyền') ? (
          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-bold text-xl">Tính năng đang khóa</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">{errorMsg}</p>
          </div>
        ) : status === 'success' ? (
          <div className="p-12 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl font-black mb-4">✓</div>
            <h3 className="font-bold text-2xl text-emerald-500">Gửi Bài Thành Công!</h3>
            <p className="text-[var(--text-muted)]">Bài viết của bạn đang chờ Ban Quản Trị duyệt. Bạn sẽ nhận được <strong>+50 Điểm</strong> khi bài viết được xuất bản.</p>
            <button onClick={() => setStatus('idle')} className="mt-6 px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl text-sm font-bold hover:border-amber-500 transition">Đóng góp bài khác</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-card)] border border-[var(--border-card)] p-8 rounded-3xl">
            {status === 'error' && <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold">{errorMsg}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-muted)]">Tiêu đề bài viết</label>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-bold text-lg" placeholder="Ví dụ: Suy tư về Mười Điều Răn" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-muted)] flex justify-between">
                <span>Nội dung chi tiết (Có thể dùng thẻ HTML cơ bản)</span>
                <span className="text-amber-500 italic">Thưởng: +50 Điểm khi duyệt</span>
              </label>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={15} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none leading-relaxed resize-y" placeholder="Nhập nội dung bài viết của bạn tại đây..." required></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={status === 'loading'} className="px-8 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition flex items-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-70">
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Gửi Bài Chờ Duyệt
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
