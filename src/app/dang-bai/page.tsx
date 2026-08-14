'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Upload, 
  FileCode, 
  Eye, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  LayoutGrid, 
  Settings, 
  Edit3, 
  Save, 
  ArrowLeft,
  Layers,
  HelpCircle,
  Plus
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';
import { extractTitleFromHtml, normalizeAndSyncHtml } from '@/lib/htmlProcessor';
import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import VeriduBlockEditor, { VeriduBlock, compileBlocksToHtml, parseHtmlToBlocks } from '@/components/editor/VeriduBlockEditor';

function slugifyVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function DangBaiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [user, setUser] = useState<UserProfile | null>(null);

  // Post State
  const [postId, setPostId] = useState<number | null>(editId ? parseInt(editId, 10) : null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Thần Học');
  const [articleType, setArticleType] = useState('theological');
  const [featuredImage, setFeaturedImage] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [blocks, setBlocks] = useState<VeriduBlock[]>([]);

  // UI Sidebar & Viewport Tabs
  const [sidebarTab, setSidebarTab] = useState<'widgets' | 'settings' | 'html'>('widgets');
  const [viewportMode, setViewportMode] = useState<'editor' | 'preview'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth
  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
  }, []);

  // Fetch post for edit mode if editId exists
  useEffect(() => {
    if (!editId) return;
    setIsLoadingPost(true);
    fetch(`/api/posts/get?id=${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          const p = data.post;
          setPostId(p.id);
          setTitle(p.title || '');
          setSlug(p.slug || '');
          setExcerpt(p.excerpt || '');
          setCategory(p.category || 'Thần Học');
          setArticleType(p.article_type || 'theological');
          setFeaturedImage(p.featured_image || '');
          const html = p.content || '';
          setContentHtml(html);
          const parsedBlocks = parseHtmlToBlocks(html);
          setBlocks(parsedBlocks);
          setMessage({ type: 'success', text: `Đã nạp thành công bài viết ID ${p.id} để chỉnh sửa!` });
        }
      })
      .catch((err) => {
        console.error('Error fetching post for edit:', err);
        setMessage({ type: 'error', text: 'Không thể nạp bài viết để chỉnh sửa.' });
      })
      .finally(() => setIsLoadingPost(false));
  }, [editId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugifyVietnamese(title)) {
      setSlug(slugifyVietnamese(val));
    }
  };

  const handleBlocksChange = (newBlocks: VeriduBlock[]) => {
    setBlocks(newBlocks);
    const compiled = compileBlocksToHtml(newBlocks);
    setContentHtml(compiled);
  };

  const handleHtmlChange = (newHtml: string) => {
    setContentHtml(newHtml);
    const parsed = parseHtmlToBlocks(newHtml);
    setBlocks(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (rawText) {
        const extractedTitle = extractTitleFromHtml(rawText);
        if (extractedTitle && !title) {
          setTitle(extractedTitle);
          setSlug(slugifyVietnamese(extractedTitle));
        }
        const clean = normalizeAndSyncHtml(rawText);
        handleHtmlChange(clean);
        setMessage({ type: 'success', text: `Đã nạp tệp ${file.name}` });
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết!' });
      return;
    }

    const finalHtml = compileBlocksToHtml(blocks) || contentHtml;
    if (!finalHtml.trim()) {
      setMessage({ type: 'error', text: 'Nội dung bài viết không được để trống!' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const finalSlug = slug.trim() || slugifyVietnamese(title);
      const isEdit = !!postId;

      const endpoint = isEdit ? '/api/posts/update' : '/api/posts/create';
      const payload: any = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        category,
        article_type: articleType,
        featured_image: featuredImage.trim(),
        content: finalHtml,
        author: user?.displayName || user?.username || 'VERIDU Team',
        status: 'published'
      };

      if (isEdit) payload.id = postId;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài viết');

      setMessage({ type: 'success', text: isEdit ? 'Đã cập nhật bài viết thành công!' : 'Đã xuất bản bài viết thành công!' });
      setTimeout(() => {
        router.push(`/${finalSlug}`);
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi lưu CSDL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen stained-glass-bg text-[var(--text-main)] flex flex-col">
      
      {/* ELEMENTOR WORKBENCH NAVBAR */}
      <header className="h-16 bg-[var(--bg-card)]/90 backdrop-blur-xl border-b border-[var(--border-card)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/thu-vien')}
            className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 transition cursor-pointer"
            title="Quay về Thư viện"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-black">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                VERIDU Elementor Studio
                {postId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ID #{postId}</span>}
              </h1>
              <p className="text-[10px] text-[var(--text-muted)]">Trình Soạn Thảo Khối Kéo-Thả Trực Quan</p>
            </div>
          </div>
        </div>

        {/* VIEWPORT MODE SWITCHER & PUBLISH BUTTON */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
            <button
              type="button"
              onClick={() => setViewportMode('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewportMode === 'editor' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-amber-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Canvas Soạn Thảo
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewportMode === 'preview' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-amber-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Xem Trước
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Đang Lưu...' : postId ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}
          </button>
        </div>
      </header>

      {/* NOTIFICATION BANNER */}
      {message && (
        <div className={`p-3 text-xs font-bold flex items-center justify-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-b border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ELEMENTOR 2-COLUMN SPLIT WORKBENCH */}
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        
        {/* ⬅️ LEFT SIDEBAR (360px WORKBENCH PANELS) */}
        <aside className="w-full md:w-96 shrink-0 bg-[var(--bg-card)]/90 backdrop-blur-xl border-r border-[var(--border-card)] flex flex-col h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
          
          {/* SIDEBAR TABS HEADER */}
          <div className="flex items-center border-b border-[var(--border-card)] bg-[var(--bg-main)] p-2 gap-1">
            <button
              type="button"
              onClick={() => setSidebarTab('widgets')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarTab === 'widgets' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-amber-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Thư Viện Khối
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('settings')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-amber-400'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Cài Đặt Bài
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('html')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarTab === 'html' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-amber-400'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Mã HTML
            </button>
          </div>

          {/* TAB 1: BLOCK ELEMENTS WIDGETS BOX */}
          {sidebarTab === 'widgets' && (
            <div className="p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Thêm Khối Vào Canvas
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Nhấp vào khối bên dưới để thêm vào khung soạn thảo hoặc kéo thả trên màn hình bên phải:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'heading', level: 'h2', content: 'Tiêu Đề Phân Đoạn Mới' };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-amber-500 block">H2 Tiêu Đề</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Phân đoạn bài</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: 'Nội dung đoạn văn...' };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-amber-500 block">Viết Đoạn Văn</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Văn bản Công giáo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'image', url: '', caption: '', align: 'center' };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-amber-500 block">Ảnh Google Drive</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Chèn ảnh + caption</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'pullquote', quoteText: 'Trích dẫn Kinh Thánh Công giáo...' };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-amber-500 block">Trích Kinh Thánh</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Khối viền vàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'alert', alertType: 'note', content: 'Lưu ý quan trọng...' };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-blue-500 hover:bg-blue-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-blue-400 block">Hộp Cảnh Báo</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Lưu ý / Cảnh báo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'gallery', images: [{ url: '', caption: 'Ảnh 1' }] };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-emerald-500 hover:bg-emerald-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-emerald-400 block">Gallery Grid</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Bộ sưu tập ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'video', url: '' };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-rose-500 hover:bg-rose-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-rose-400 block">Video Embed</span>
                  <span className="text-[10px] text-[var(--text-muted)]">YouTube & Drive</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'table', tableHeaders: ['Cột 1', 'Cột 2', 'Cột 3'], tableRows: [['1', '2', '3']] };
                    handleBlocksChange([...blocks, newB]);
                  }}
                  className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500 hover:bg-indigo-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                >
                  <span className="font-bold text-xs text-indigo-400 block">Bảng Dữ Liệu</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Bảng so sánh</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: POST METADATA SETTINGS */}
          {sidebarTab === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Thông Tin Bài Viết
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">Tiêu Đề <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Tiêu đề bài..."
                    className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">Slug SEO</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="phan-tich-kinh-cau..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] text-[var(--text-muted)] outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">Chuyên Mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
                  >
                    <option value="Thần Học">Thần Học & Tín Lý</option>
                    <option value="Kinh Thánh">Kinh Thánh & Chú Giải</option>
                    <option value="Suy Niệm">Suy Niệm Lời Chúa</option>
                    <option value="Các Thánh">Các Thánh & Phụng Vụ</option>
                    <option value="Lịch Sử">Lịch Sử Giáo Hội</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">Giao Diện (Template)</label>
                  <select
                    value={articleType}
                    onChange={(e) => setArticleType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
                  >
                    <option value="theological">Thần Học / Academic (Nền kính)</option>
                    <option value="meditation">Suy Niệm / Meditation (Ấm áp)</option>
                    <option value="wide">Tạp Chí / Wide Magazine (Trang rộng)</option>
                    <option value="standard">Tiêu Chuẩn (Standard)</option>
                    <option value="interactive">3D Tương Tác / Complete Takeover</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">Link Ảnh Bìa (Google Drive)</label>
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">Tóm Tắt Bài (Excerpt)</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                    placeholder="Tóm tắt ngắn..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500 resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAW HTML & FILE UPLOAD */}
          {sidebarTab === 'html' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Mã HTML Đã Biên Dịch</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Nạp file .html
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".html,.htm" className="hidden" />
              </div>

              <textarea
                value={contentHtml}
                onChange={(e) => handleHtmlChange(e.target.value)}
                rows={16}
                className="w-full p-3 rounded-xl bg-slate-950 border border-[var(--border-card)] font-mono text-[11px] text-amber-300 outline-none leading-relaxed"
              />
            </div>
          )}

        </aside>

        {/* ➡️ RIGHT VIEWPORT (CANVAS & REALTIME PREVIEW) */}
        <main className="flex-1 bg-[var(--bg-main)] p-4 sm:p-8 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {viewportMode === 'editor' ? (
              <div className="p-6 sm:p-10 rounded-3xl glass-panel space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Canvas Soạn Thảo Khối Kéo-Thả
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">Tổng số khối: {blocks.length}</span>
                </div>
                <VeriduBlockEditor blocks={blocks} onChange={handleBlocksChange} />
              </div>
            ) : (
              <div className="p-6 sm:p-12 rounded-3xl glass-panel space-y-6">
                <div className="border-b border-[var(--border-card)] pb-6 text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase">{category}</span>
                  <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[var(--text-main)]">{title || 'Tiêu Đề Bài Viết Xem Trước'}</h1>
                </div>
                <VisualArticleRenderer contentHtml={contentHtml} />
              </div>
            )}

          </div>
        </main>

      </div>

    </div>
  );
}

export default function DangBaiPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-amber-500">Đang tải Trình Soạn Thảo...</div>}>
      <DangBaiContent />
    </Suspense>
  );
}
