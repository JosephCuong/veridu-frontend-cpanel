'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Upload, 
  FileCode, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  LayoutGrid, 
  Settings, 
  Edit3, 
  Save, 
  ArrowLeft,
  Layers,
  FileText,
  HelpCircle,
  Plus,
  Heading,
  Type,
  ImageIcon,
  Quote,
  AlertTriangle,
  Grid,
  Video,
  Table,
  ExternalLink,
  RefreshCw,
  Trash2,
  FileUp,
  Check,
  Zap,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';
import { 
  extractTitleFromHtml, 
  extractExcerptFromHtml, 
  extractFeaturedImageFromHtml, 
  normalizeAndSyncHtml 
} from '@/lib/htmlProcessor';
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

  // File Upload & Diagnostics Metadata State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [detectedFeatures, setDetectedFeatures] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // UI Studio Controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'settings' | 'widgets' | 'html'>('settings');
  const [viewportMode, setViewportMode] = useState<'editor' | 'preview'>('editor');
  const [canvasDevice, setCanvasDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [renderEngine, setRenderEngine] = useState<'blocks' | 'code'>('blocks');
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);
  
  // Submission & Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Success Modal State
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

          setMessage({ type: 'success', text: `Đã nạp thành công bài viết ID #${p.id} để chỉnh sửa!` });
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

  // Process Uploaded HTML File with Full Clean Ingestion
  const processHtmlFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText || !rawText.trim()) {
        setMessage({ type: 'error', text: 'Tệp tải lên rỗng hoặc không hợp lệ.' });
        return;
      }

      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

      // Detect Features
      const features: string[] = [];
      if (/<!DOCTYPE\s+html/i.test(rawText) || /<html[\s>]/i.test(rawText)) features.push('Tài liệu HTML');
      if (/mermaid/i.test(rawText)) features.push('Sơ Đồ Mermaid');
      if (/<table/i.test(rawText)) features.push('Bảng Dữ Liệu');
      if (/<blockquote/i.test(rawText) || /Tv\s+\d+|Ga\s+\d+|Mt\s+\d+/i.test(rawText)) features.push('Trích Dẫn Lời Chúa');
      if (/<img/i.test(rawText)) features.push('Ảnh Media');
      setDetectedFeatures(features);

      // 1. Auto-extract Title
      const extractedTitle = extractTitleFromHtml(rawText);
      if (extractedTitle) {
        setTitle(extractedTitle);
        setSlug(slugifyVietnamese(extractedTitle));
      }

      // 2. Auto-extract Excerpt
      const extractedDesc = extractExcerptFromHtml(rawText);
      if (extractedDesc && !excerpt) {
        setExcerpt(extractedDesc);
      }

      // 3. Auto-extract Image
      const extractedImg = extractFeaturedImageFromHtml(rawText);
      if (extractedImg && !featuredImage) {
        setFeaturedImage(extractedImg);
      }

      // 4. Clean HTML & Parse into Veridu Blocks
      const cleanHtml = normalizeAndSyncHtml(rawText);
      const parsedBlocks = parseHtmlToBlocks(cleanHtml);
      
      setBlocks(parsedBlocks);
      setContentHtml(cleanHtml);
      setRenderEngine('blocks');
      setAnalysisNotice(`Đã nạp file "${file.name}" (${(file.size / 1024).toFixed(1)} KB): Tự động trích xuất tiêu đề, loại bỏ mã CSS thừa và chuyển hóa thành ${parsedBlocks.length} khối trực quan Công giáo.`);

      setMessage({ type: 'success', text: `Nạp thành công tệp: ${file.name}` });
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processHtmlFile(file);
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm') || file.name.endsWith('.txt'))) {
      processHtmlFile(file);
    } else {
      setMessage({ type: 'error', text: 'Vui lòng kéo thả file có định dạng .html hoặc .htm' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết!' });
      return;
    }

    const finalHtml = renderEngine === 'blocks' ? (compileBlocksToHtml(blocks) || contentHtml) : contentHtml;
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
        author_id: user?.id || 'eef94645-01fb-471f-9b10-cdd3fea35143',
        status: 'published'
      };

      if (isEdit) payload.id = postId;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài viết vào CSDL Supabase');

      const savedSlug = data.slug || finalSlug;
      setPublishedSlug(savedSlug);
      setShowSuccessModal(true);
      setMessage({ type: 'success', text: isEdit ? 'Đã cập nhật bài viết thành công!' : 'Đã xuất bản bài viết thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi kết nối Supabase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Device Frame Width
  const getDeviceWidthClass = () => {
    if (canvasDevice === 'mobile') return 'max-w-[375px]';
    if (canvasDevice === 'tablet') return 'max-w-[768px]';
    return 'w-full max-w-4xl';
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col pt-24 sm:pt-28 md:pt-32 transition-colors duration-300 relative ${
        isDragging ? 'ring-4 ring-indigo-500 ring-inset bg-indigo-500/5' : ''
      }`}
    >
      
      {/* Hidden Global File Input for .HTML Files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".html,.htm,.txt" 
        className="hidden" 
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="p-8 rounded-3xl bg-indigo-900/90 border-2 border-dashed border-indigo-400 max-w-md w-full space-y-4 shadow-2xl">
            <Upload className="w-16 h-16 text-indigo-300 mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-2xl text-white">Thả Tệp .HTML Vào Đây</h3>
            <p className="text-sm text-indigo-200">
              Hệ thống sẽ tự động phân tích tiêu đề, bố cục và chuyển hóa thành các khối trực quan Công giáo.
            </p>
          </div>
        </div>
      )}

      {/* 🌟 ELEMENTOR WORKBENCH TOP NAVBAR */}
      <header className="w-full bg-[var(--bg-card)] border-b border-[var(--border-card)] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-30">
        
        {/* Left: Back, Sidebar Toggle & Post Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/thu-vien')}
            className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer"
            title="Quay về Thư viện"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer hidden lg:flex items-center"
            title={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-black border border-amber-500/20">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h1 className="font-serif font-bold text-xs sm:text-sm md:text-base text-[var(--text-main)] flex items-center gap-2 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {title || 'Soạn Thảo & Đăng Bài VERIDU'}
                {postId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">ID #{postId}</span>}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)]">
                {blocks.length > 0 ? `${blocks.length} khối nội dung trực quan` : 'Trình soạn thảo khối & Nạp file .HTML'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Device Switcher for Preview */}
        <div className="hidden md:flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
          <button
            type="button"
            onClick={() => setCanvasDevice('desktop')}
            className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              canvasDevice === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-[var(--text-muted)] hover:text-amber-500'
            }`}
            title="Xem chuẩn Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCanvasDevice('tablet')}
            className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              canvasDevice === 'tablet' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-[var(--text-muted)] hover:text-amber-500'
            }`}
            title="Xem chuẩn Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCanvasDevice('mobile')}
            className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              canvasDevice === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-[var(--text-muted)] hover:text-amber-500'
            }`}
            title="Xem chuẩn Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Viewport Mode Switcher, Nạp File .HTML Button & Publish Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
            <button
              type="button"
              onClick={() => setViewportMode('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewportMode === 'editor' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Soạn Thảo
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewportMode === 'preview' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Xem Trước
            </button>
          </div>

          {/* Nạp File .HTML Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Tải lên tệp .html hoặc .htm để tự động trích xuất nội dung"
          >
            <Upload className="w-3.5 h-3.5" /> Nạp File .HTML
          </button>

          {/* Publish / Update Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 sm:px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? 'Đang Lưu...' : postId ? 'Cập Nhật' : 'Xuất Bản'}</span>
          </button>

        </div>
      </header>

      {/* NOTIFICATION BANNER */}
      {message && (
        <div className={`p-2.5 text-xs font-bold flex items-center justify-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-b border-emerald-500/30' : 'bg-red-500/20 text-red-500 dark:text-red-300 border-b border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🌟 2-COLUMN FULL-WIDTH WORKBENCH */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        
        {/* ⬅️ LEFT SIDEBAR (WORKBENCH PANELS) */}
        {!sidebarCollapsed && (
          <aside className="w-full lg:w-96 shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-card)] flex flex-col h-auto lg:h-[calc(100vh-8.5rem)] overflow-y-auto z-20">
            
            {/* 🌟 QUICK IMPORT & FILE STATUS BANNER */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent border-b border-[var(--border-card)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Nạp &amp; Chuyển Hóa Tệp .HTML
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                  Tự động hóa
                </span>
              </div>
              
              {uploadedFileName ? (
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-300">
                    <span className="truncate flex items-center gap-1">
                      <FileCode className="w-4 h-4 shrink-0" /> {uploadedFileName}
                    </span>
                    <span className="text-[10px] opacity-80 shrink-0">{uploadedFileSize}</span>
                  </div>

                  {detectedFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {detectedFeatures.map((f, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-200 border border-indigo-500/20">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Nạp tệp khác
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Kéo thả hoặc tải lên tệp <code className="px-1 py-0.5 rounded bg-[var(--bg-main)] font-mono text-[10px]">.html</code> để tự động chuyển hóa thành các khối trực quan.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white rounded-xl text-xs font-bold border border-indigo-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <Upload className="w-3.5 h-3.5" /> Chọn File .HTML Từ Máy Tính
                  </button>
                </>
              )}
            </div>

            {/* SIDEBAR TABS HEADER */}
            <div className="flex items-center border-b border-[var(--border-card)] bg-[var(--bg-main)] p-2 gap-1">
              <button
                type="button"
                onClick={() => setSidebarTab('settings')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Cài Đặt Bài
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('widgets')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'widgets' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Thư Viện Khối
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('html')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'html' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" /> Mã Nguồn
              </button>
            </div>

            {/* TAB 1: POST SETTINGS & METADATA */}
            {sidebarTab === 'settings' && (
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Thông Tin Bài Viết
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">Tiêu Đề Bài Viết <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Nhập tiêu đề bài viết..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">Đường Dẫn SEO (Slug)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="phan-tich-theotokos..."
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
                      <option value="Thần Học">Thần Học &amp; Tín Lý</option>
                      <option value="Kinh Thánh">Kinh Thánh &amp; Chú Giải</option>
                      <option value="Suy Niệm">Suy Niệm Lời Chúa</option>
                      <option value="Các Thánh">Các Thánh &amp; Phụng Vụ</option>
                      <option value="Lịch Sử">Lịch Sử Giáo Hội</option>
                      <option value="Giáo Lý">Giáo Lý Công Giáo</option>
                      <option value="Bài Tương Tác HTML 3D">Bài Tương Tác HTML 3D</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">Giao Diện Hiển Thị (Template)</label>
                    <select
                      value={articleType}
                      onChange={(e) => setArticleType(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
                    >
                      <option value="theological">Thần Học / Nghiên Cứu (Nền Kính Phụng Vụ)</option>
                      <option value="meditation">Suy Niệm / Chiêm Niệm (Ấm áp, Trầm lắng)</option>
                      <option value="wide">Tạp Chí / Wide Magazine (Trang rộng)</option>
                      <option value="standard">Tiêu Chuẩn (Standard)</option>
                      <option value="interactive">3D Tương Tác / Complete Takeover (Toàn Màn Hình)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">Link Ảnh Bìa (Google Drive / Direct URL)</label>
                    <input
                      type="url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">Tóm Tắt Ngắn (Excerpt SEO)</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      placeholder="Tóm tắt ngắn gọn nội dung cốt lõi của bài viết..."
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BLOCK ELEMENTS WIDGETS BOX */}
            {sidebarTab === 'widgets' && (
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Thêm Khối Vào Canvas
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Nhấp vào khối bên dưới để chèn vào bài viết:
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'heading', level: 'h2', content: 'Tiêu Đề Phân Đoạn...' };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      <Heading className="w-3.5 h-3.5" /> Tiêu Đề H2/H3
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Phân đoạn bài</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: 'Nội dung đoạn văn Công giáo...' };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[var(--text-main)] font-bold text-xs">
                      <Type className="w-3.5 h-3.5 text-amber-500" /> Viết Đoạn Văn
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Văn bản Công giáo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'image', url: '', caption: 'Chú thích ảnh...' };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[var(--text-main)] font-bold text-xs">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Ảnh / Media
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Chèn ảnh + chú thích</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'scripture', content: 'Lời Chúa là ngọn đèn soi cho con bước...', quoteAuthor: 'Tv 119:105' };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      <Quote className="w-3.5 h-3.5" /> Trích Kinh Thánh
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Khối viền vàng kim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'alert', alertType: 'note', content: 'Lưu ý quan trọng...' };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-blue-500 hover:bg-blue-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-blue-500 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> Hộp Cảnh Báo
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Lưu ý / Hướng dẫn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'gallery', images: [{ url: '', caption: 'Ảnh 1' }] };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-emerald-500 hover:bg-emerald-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                      <Grid className="w-3.5 h-3.5" /> Gallery Ảnh
                    </div>
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
                    <div className="flex items-center gap-1 text-rose-500 font-bold text-xs">
                      <Video className="w-3.5 h-3.5" /> Nhúng Video
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">YouTube &amp; Drive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newB: VeriduBlock = { id: `b-${Date.now()}`, type: 'table', tableHeaders: ['Cột 1', 'Cột 2', 'Cột 3'], tableRows: [['1', '2', '3']] };
                      handleBlocksChange([...blocks, newB]);
                    }}
                    className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500 hover:bg-indigo-500/10 rounded-2xl text-left transition space-y-1 group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-indigo-500 font-bold text-xs">
                      <Table className="w-3.5 h-3.5" /> Bảng Dữ Liệu
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Bảng Giáo luật &amp; So sánh</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: RAW HTML CODE EDITOR */}
            {sidebarTab === 'html' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Mã Nguồn HTML</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Upload className="w-3 h-3" /> Nạp file .html
                  </button>
                </div>

                <textarea
                  value={contentHtml}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  rows={18}
                  placeholder="Dán hoặc chỉnh sửa mã HTML tại đây..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-[var(--border-card)] font-mono text-[11px] text-amber-400 outline-none leading-relaxed"
                />
              </div>
            )}

          </aside>
        )}

        {/* ➡️ RIGHT VIEWPORT (CANVAS & REALTIME SEAMLESS PREVIEW) */}
        <main className="flex-1 bg-[var(--bg-main)] p-4 sm:p-6 lg:p-8 h-auto lg:h-[calc(100vh-8.5rem)] overflow-y-auto flex flex-col items-center">
          <div className={`w-full ${getDeviceWidthClass()} transition-all duration-300 space-y-6`}>

            {/* 🤖 SMART ANALYSIS NOTICE BANNER */}
            {analysisNotice && (
              <div className="w-full p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4 text-xs text-indigo-600 dark:text-indigo-300 font-medium animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{analysisNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalysisNotice(null)}
                  className="text-indigo-500 hover:text-indigo-700 dark:hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* MODE SWITCHER: SOẠN KHỐI VS XEM TRƯỚC */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Mô Hình Làm Việc:</span>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRenderEngine('blocks')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    renderEngine === 'blocks'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Soạn Khối Trực Quan ({blocks.length} khối)
                </button>

                {/* Direct quick upload button inside canvas */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Nạp tệp HTML từ máy tính"
                >
                  <Upload className="w-3.5 h-3.5" /> Nạp File .HTML
                </button>
              </div>
            </div>
            
            {/* VIEWPORT BODY */}
            {viewportMode === 'editor' ? (
              <div className="w-full p-4 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Canvas Soạn Thảo Khối Kéo-Thả VERIDU
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {blocks.length > 0 ? `Đang có ${blocks.length} khối` : 'Nhấp thêm khối từ thanh bên hoặc nạp file .HTML'}
                  </span>
                </div>

                <VeriduBlockEditor blocks={blocks} onChange={handleBlocksChange} />
              </div>
            ) : (
              <div className="w-full p-6 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6">
                <div className="border-b border-[var(--border-card)] pb-6 text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">{category}</span>
                  <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-[var(--text-main)]">{title || 'Tiêu Đề Bài Viết Xem Trước'}</h1>
                </div>
                <VisualArticleRenderer contentHtml={contentHtml} />
              </div>
            )}

          </div>
        </main>

      </div>

      {/* 🌟 SUCCESS PUBLISH MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-lg w-full p-8 border border-[var(--border-card)] shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">
                {postId ? 'Đã Cập Nhật Bài Viết Thành Công!' : 'Đã Xuất Bản Bài Viết Thành Công!'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Bài viết &quot;<strong className="text-[var(--text-main)]">{title}</strong>&quot; đã được lưu trữ an toàn vào CSDL Supabase và sẵn sàng phục vụ cộng đồng.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono text-amber-600 dark:text-amber-400 truncate">
              https://www.thapgia.com/{publishedSlug}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/${publishedSlug}`}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <ExternalLink className="w-4 h-4" /> Xem Bài Viết Trực Tuyến
              </Link>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-5 py-3 bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-main)] font-bold text-xs rounded-xl border border-[var(--border-card)] transition-all cursor-pointer"
              >
                Tiếp Tục Chỉnh Sửa
              </button>

              <Link
                href="/thu-vien"
                className="w-full sm:w-auto px-5 py-3 bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-main)] font-bold text-xs rounded-xl border border-[var(--border-card)] transition-all"
              >
                Về Thư Viện
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DangBaiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-36 text-center text-amber-500 font-bold">Đang tải Trình Soạn Thảo...</div>}>
      <DangBaiContent />
    </Suspense>
  );
}
