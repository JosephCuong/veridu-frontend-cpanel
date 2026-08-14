'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Upload, 
  FileCode, 
  Eye, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  HelpCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Quote,
  LayoutGrid,
  FileText,
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

export default function DangBaiPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Post State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Thần Học');
  const [articleType, setArticleType] = useState('theological');
  const [featuredImage, setFeaturedImage] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [blocks, setBlocks] = useState<VeriduBlock[]>([]);

  // UI Tabs
  const [activeTab, setActiveTab] = useState<'blocks' | 'html' | 'preview'>('blocks');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth
  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
  }, []);

  // Auto slugify when title changes
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugifyVietnamese(title)) {
      setSlug(slugifyVietnamese(val));
    }
  };

  // Sync Blocks -> HTML
  const handleBlocksChange = (newBlocks: VeriduBlock[]) => {
    setBlocks(newBlocks);
    const compiled = compileBlocksToHtml(newBlocks);
    setContentHtml(compiled);
  };

  // Sync HTML -> Blocks
  const handleHtmlChange = (newHtml: string) => {
    setContentHtml(newHtml);
    const parsed = parseHtmlToBlocks(newHtml);
    setBlocks(parsed);
  };

  // Handle File Upload (.html)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (rawText) {
        // Auto extract title
        const extractedTitle = extractTitleFromHtml(rawText);
        if (extractedTitle && !title) {
          setTitle(extractedTitle);
          setSlug(slugifyVietnamese(extractedTitle));
        }

        // Clean & Sync HTML
        const clean = normalizeAndSyncHtml(rawText);
        handleHtmlChange(clean);
        setMessage({ type: 'success', text: `Đã nạp thành công tệp ${file.name}` });
      }
    };
    reader.readAsText(file);
  };

  // Submit to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết!' });
      return;
    }

    const finalHtml = activeTab === 'blocks' ? compileBlocksToHtml(blocks) : contentHtml;
    if (!finalHtml.trim()) {
      setMessage({ type: 'error', text: 'Nội dung bài viết không được để trống!' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const finalSlug = slug.trim() || slugifyVietnamese(title);
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          excerpt: excerpt.trim(),
          category,
          article_type: articleType,
          featured_image: featuredImage.trim(),
          content: finalHtml,
          author: user?.displayName || user?.username || 'VERIDU Team',
          status: 'published'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài viết');

      setMessage({ type: 'success', text: 'Đã xuất bản bài viết thành công!' });
      setTimeout(() => {
        router.push(`/${finalSlug}`);
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi kết nối CSDL.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen stained-glass-bg text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER TITLE */}
        <div className="text-center space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4" /> Trình Biên Tập Khối VERIDU Block Editor
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
            Soạn Thảo & Đăng Bài Trực Quan
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
            Hệ thống kéo-thả khối (Block Editor) chuyên dụng Công giáo. Nhập link ảnh Google Drive, chèn trích dẫn Kinh Thánh và xuất bản tức thì.
          </p>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* METADATA FORM BOX */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
            <h2 className="font-serif font-bold text-xl text-amber-500 flex items-center gap-2 border-b border-[var(--border-card)] pb-4">
              <BookOpen className="w-5 h-5 text-amber-500" /> Thông Tin Cơ Bản Bài Viết
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Tiêu Đề Bài Viết <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ví dụ: Phân Tích Kinh Cầu Đức Bà"
                  required
                  className="w-full p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-base font-bold text-[var(--text-main)] outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Slug & Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Đường Dẫn SEO (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="phan-tich-kinh-cau-duc-ba"
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs text-[var(--text-muted)] outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Chuyên Mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-bold text-[var(--text-main)] outline-none focus:border-amber-500 transition"
                >
                  <option value="Thần Học">Thần Học & Tín Lý</option>
                  <option value="Kinh Thánh">Kinh Thánh & Chú Giải</option>
                  <option value="Suy Niệm">Suy Niệm Lời Chúa</option>
                  <option value="Các Thánh">Các Thánh & Phụng Vụ</option>
                  <option value="Lịch Sử">Lịch Sử Giáo Hội</option>
                </select>
              </div>

              {/* Template & Featured Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Giao Diện Bài Viết (Template)
                </label>
                <select
                  value={articleType}
                  onChange={(e) => setArticleType(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-bold text-[var(--text-main)] outline-none focus:border-amber-500 transition"
                >
                  <option value="theological">Thần Học / Academic (Nền kính mờ)</option>
                  <option value="meditation">Suy Niệm / Meditation (Ấm áp)</option>
                  <option value="wide">Tạp Chí / Wide Magazine (Trang rộng)</option>
                  <option value="standard">Tiêu Chuẩn (Standard)</option>
                  <option value="interactive">3D Tương Tác / Complete Takeover</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Link Ảnh Đại Diện (Featured Image - Google Drive)
                </label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Excerpt */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Tóm Tắt Bài Viết (Excerpt)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="1 - 2 câu tóm tắt nội dung để hiển thị ở trang chủ và mạng xã hội..."
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm outline-none focus:border-amber-500 transition resize-y"
                />
              </div>

            </div>
          </div>

          {/* EDITOR SECTION WITH 3 TABS */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
            
            {/* TABS HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('blocks')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'blocks'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500/10 hover:text-amber-400'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> 🧩 Trình Soạn Khối (Block Canvas)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'html'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500/10 hover:text-amber-400'
                  }`}
                >
                  <FileCode className="w-4 h-4" /> 📄 Mã HTML
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500/10 hover:text-amber-400'
                  }`}
                >
                  <Eye className="w-4 h-4" /> 👁️ Xem Trước Thực Tế
                </button>
              </div>

              {/* FILE UPLOAD BUTTON (.HTML) */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".html,.htm"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-500" /> Tải Lên Tệp HTML
                </button>
              </div>
            </div>

            {/* TAB 1: BLOCK CANVAS EDITOR */}
            {activeTab === 'blocks' && (
              <VeriduBlockEditor blocks={blocks} onChange={handleBlocksChange} />
            )}

            {/* TAB 2: RAW HTML CODE VIEW */}
            {activeTab === 'html' && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-muted)]">
                  Mã HTML được biên dịch tự động từ các Khối. Bạn có thể chỉnh sửa trực tiếp mã HTML tại đây:
                </p>
                <textarea
                  value={contentHtml}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  rows={16}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-[var(--border-card)] font-mono text-xs text-amber-300 outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            )}

            {/* TAB 3: LIVE PREVIEW */}
            {activeTab === 'preview' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4 text-center">
                  <span className="text-xs font-bold text-amber-500 uppercase">{category}</span>
                  <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[var(--text-main)] mt-2">{title || 'Tiêu Đề Bài Viết Xem Trước'}</h1>
                </div>
                <VisualArticleRenderer contentHtml={contentHtml} />
              </div>
            )}

          </div>

          {/* MESSAGE NOTIFICATION */}
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg ${
              message.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-full text-base transition-all shadow-xl shadow-amber-500/20 hover:scale-105 disabled:opacity-50 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Send className="w-5 h-5" /> {isSubmitting ? 'Đang Xuất Bản...' : 'Xuất Bản Bài Viết Tới VERIDU'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
