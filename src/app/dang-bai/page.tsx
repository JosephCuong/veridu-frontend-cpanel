'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
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
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders,
  Sparkles,
  Code,
  Palette,
  Heart,
  ListChecks,
  Bookmark,
  Share2
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';
import { 
  extractTitleFromHtml, 
  extractExcerptFromHtml, 
  extractFeaturedImageFromHtml, 
  normalizeAndSyncHtml 
} from '@/lib/htmlProcessor';
import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import FloatingFormatToolbar from '@/components/editor/FloatingFormatToolbar';
import CatholicBlockInserterModal from '@/components/editor/CatholicBlockInserterModal';
import ResourceSubmissionModal from '@/components/ResourceSubmissionModal';

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

// Initial template for new articles
const DEFAULT_INITIAL_CONTENT = `<p class="lead font-serif text-lg leading-relaxed text-[var(--text-main)]">
  Nhấp trực tiếp vào đây để bắt đầu soạn thảo bài viết. Bạn có thể bôi đen bất kỳ đoạn chữ nào để sử dụng <strong>Thanh Định Dạng Nổi</strong> hoặc mở <strong>Sổ Tay 8 Khối Chuẩn</strong> để chèn các khối phụng vụ.
</p>

<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="/kinh-thanh/tv/119" target="_blank" rel="noopener noreferrer" title="Tra cứu Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>Tv 119:105</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>

<h2 id="dan-nhap-than-hoc" class="font-serif text-2xl font-bold text-amber-500 mt-8 mb-4">1. Dẫn Nhập Thần Học</h2>
<p class="font-serif text-base leading-relaxed text-[var(--text-main)] mb-4">
  Viết nội dung phân tích, luận giải tín lý hoặc suy niệm phụng vụ tại đây...
</p>`;

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
  const [articleType, setArticleType] = useState('standard');
  const [featuredImage, setFeaturedImage] = useState('');
  const [contentHtml, setContentHtml] = useState<string>(editId ? '' : DEFAULT_INITIAL_CONTENT);
  const [existingStatus, setExistingStatus] = useState<string>('published');

  // File Upload & Diagnostics Metadata State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [detectedFeatures, setDetectedFeatures] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // UI Studio Controls: 'visual' (Live Visual Canvas WYSIWYG) | 'code' (HTML Code Editor) | 'preview' (Reader View)
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'settings' | 'blocks' | 'tools'>('settings');
  const [canvasDevice, setCanvasDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);
  
  // Submission & Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Modals
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualCanvasRef = useRef<HTMLDivElement>(null);
  const isUpdatingDomFromState = useRef(false);

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
          setArticleType(p.article_type || 'standard');
          setFeaturedImage(p.featured_image || '');
          const html = p.content || '';
          setContentHtml(html);
          setExistingStatus(p.status || 'published');

          // Sync into DOM if visual editor is mounted
          if (visualCanvasRef.current) {
            visualCanvasRef.current.innerHTML = html;
          }

          setMessage({ type: 'success', text: `Đang chỉnh sửa bài viết #${p.id}: "${p.title}"` });
        } else {
          setMessage({ type: 'error', text: 'Không tìm thấy bài viết cần chỉnh sửa.' });
        }
      })
      .catch((err) => {
        console.error('Error fetching post for edit:', err);
        setMessage({ type: 'error', text: 'Không thể nạp bài viết để chỉnh sửa.' });
      })
      .finally(() => setIsLoadingPost(false));
  }, [editId]);

  // Sync contentHtml to visual canvas when switching tabs or when contentHtml changes externally
  useEffect(() => {
    if (activeTab === 'visual' && visualCanvasRef.current) {
      if (visualCanvasRef.current.innerHTML !== contentHtml && !isUpdatingDomFromState.current) {
        visualCanvasRef.current.innerHTML = contentHtml || '';
      }
    }
  }, [activeTab, contentHtml]);

  // Sync DOM changes back to contentHtml state
  const handleCanvasInput = useCallback(() => {
    if (visualCanvasRef.current) {
      isUpdatingDomFromState.current = true;
      const currentInnerHtml = visualCanvasRef.current.innerHTML;
      setContentHtml(currentInnerHtml);
      setTimeout(() => {
        isUpdatingDomFromState.current = false;
      }, 50);
    }
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugifyVietnamese(title)) {
      setSlug(slugifyVietnamese(val));
    }
  };

  // 1-Click Catholic Block Insertion Handler
  const handleInsertCatholicBlock = (htmlSnippet: string) => {
    if (activeTab === 'visual' && visualCanvasRef.current) {
      visualCanvasRef.current.focus();
      
      const selection = window.getSelection();
      let inserted = false;

      if (selection && selection.rangeCount > 0 && visualCanvasRef.current.contains(selection.anchorNode)) {
        try {
          document.execCommand('insertHTML', false, htmlSnippet + '<p><br></p>');
          inserted = true;
        } catch {
          inserted = false;
        }
      }

      if (!inserted) {
        // Append cleanly to end of canvas
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlSnippet;
        visualCanvasRef.current.appendChild(wrapper.firstChild || wrapper);
        
        const spacer = document.createElement('p');
        spacer.innerHTML = '<br>';
        visualCanvasRef.current.appendChild(spacer);
      }

      handleCanvasInput();
    } else {
      // In code mode or preview mode: append or update state directly
      const newHtml = contentHtml ? `${contentHtml}\n\n${htmlSnippet}` : htmlSnippet;
      setContentHtml(newHtml);
      if (visualCanvasRef.current) {
        visualCanvasRef.current.innerHTML = newHtml;
      }
    }

    setMessage({ type: 'success', text: 'Đã chèn khối Công giáo chuẩn tắc vào bài viết!' });
    setTimeout(() => setMessage(null), 3000);
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
      if (/sacred-scripture|veridu-scripture-quote/i.test(rawText)) features.push('Khối Lời Chúa');
      if (/prayer-block|poetry-block/i.test(rawText)) features.push('Thơ & Lời Nguyện');
      if (/abstract-research/i.test(rawText)) features.push('Tóm Tắt Nghiên Cứu');
      if (/scripture-meta/i.test(rawText)) features.push('Bằng Chứng Kinh Thánh');
      if (/dictionary-meta/i.test(rawText)) features.push('Thuật Ngữ Tín Lý');
      if (/catechetical-callout/i.test(rawText)) features.push('Hộp Lưu Ý Giáo Lý');
      if (/footnotes-section|footnote-ref|footnote-item|<sup/i.test(rawText)) features.push('Chú Thích Chân Trang');
      if (/<img/i.test(rawText)) features.push('Hình Ảnh');
      if (/<iframe|<video/i.test(rawText)) features.push('Media Nhúng');
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

      // 4. Clean HTML & Load into Canvas
      const cleanHtml = normalizeAndSyncHtml(rawText);
      setContentHtml(cleanHtml);
      if (visualCanvasRef.current) {
        visualCanvasRef.current.innerHTML = cleanHtml;
      }

      setAnalysisNotice(`Đã nạp file "${file.name}" (${(file.size / 1024).toFixed(1)} KB): Trích xuất tiêu đề, chuẩn hóa mã HTML và áp dụng phong cách Stained-Glass của VERIDU.`);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết!' });
      return;
    }

    // Get current HTML from canvas if in visual mode
    let finalHtml = contentHtml;
    if (activeTab === 'visual' && visualCanvasRef.current) {
      finalHtml = visualCanvasRef.current.innerHTML;
      setContentHtml(finalHtml);
    }

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

      const isPrivileged = user?.role === 'admin' || user?.role === 'scholar' || user?.role === 'Quản Trị Viên' || user?.role === 'Học Giả VERIDU';

      // Ensure status 'published' is preserved when editing already published articles
      const postStatus = isEdit ? (existingStatus || 'published') : (isPrivileged ? 'published' : 'pending');

      const payload: Record<string, any> = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        category,
        article_type: articleType,
        featured_image: featuredImage.trim(),
        content: finalHtml,
        status: postStatus
      };

      if (isEdit) {
        payload.id = postId;
      } else {
        payload.author_id = user?.id || 'eef94645-01fb-471f-9b10-cdd3fea35143';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài viết vào CSDL Supabase');

      const savedSlug = data.slug || data.post?.slug || finalSlug;
      setPublishedSlug(savedSlug);
      setShowSuccessModal(true);
      setMessage({ 
        type: 'success', 
        text: isEdit 
          ? 'Đã cập nhật bài viết thành công!' 
          : postStatus === 'published' 
            ? 'Đã xuất bản bài viết thành công!' 
            : 'Bài viết đã được gửi và đang chờ Ban Quản Trị phê duyệt!' 
      });

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi kết nối Supabase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Device Frame Width for Preview
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
      className={`w-full min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col pt-20 sm:pt-24 transition-colors duration-300 relative ${
        isDragging ? 'ring-4 ring-amber-500 ring-inset bg-amber-500/5' : ''
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-dashed border-amber-400 max-w-md w-full space-y-4 shadow-2xl">
            <Upload className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-2xl text-white">Thả Tệp .HTML Vào Đây</h3>
            <p className="text-sm text-amber-200/80">
              Hệ thống sẽ tự động phân tích tiêu đề, bố cục và chuyển hóa thành định dạng Stained-Glass của VERIDU.
            </p>
          </div>
        </div>
      )}

      {/* 🌟 WYSIWYG STUDIO TOP NAVBAR */}
      <header className="w-full bg-[var(--bg-card)] border-b border-[var(--border-card)] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-30 sticky top-16 sm:top-20">
        
        {/* Left: Back, Sidebar Toggle & Post Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/thu-vien')}
            className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer shrink-0"
            title="Quay về Thư viện"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer hidden lg:flex items-center shrink-0"
            title={sidebarCollapsed ? "Mở rộng thanh bên thiết lập" : "Thu gọn thanh bên thiết lập"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-black border border-amber-500/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-xs sm:text-sm md:text-base text-[var(--text-main)] flex items-center gap-2 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {title || 'Biên Tập Bài Viết VERIDU'}
                {postId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    ID #{postId}
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {activeTab === 'visual' ? '🎨 Soạn thảo trực quan (Live Canvas)' : activeTab === 'code' ? '💻 Mã nguồn HTML' : '👁️ Xem thử độc giả'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: TAB TOGGLE (Live Visual ⟷ HTML Code ⟷ Preview) */}
        <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'visual' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'text-[var(--text-muted)] hover:text-amber-500'
            }`}
            title="Chế độ Soạn Thảo Trực Quan (Live Visual Canvas WYSIWYG)"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trực Quan</span> (Canvas)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'code' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'text-[var(--text-muted)] hover:text-amber-500'
            }`}
            title="Chế độ Mã Nguồn (HTML Code Editor)"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mã Nguồn</span> (HTML)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'text-[var(--text-muted)] hover:text-amber-500'
            }`}
            title="Chế độ Xem Trước Độc Giả"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem Trước</span>
          </button>
        </div>

        {/* Right: Catholic Styleguide Modal Button + Save Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* 📖 Sổ Tay Khối Chuẩn Công Giáo Modal Button */}
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500 hover:to-amber-600 text-amber-900 dark:text-amber-300 hover:text-slate-950 font-bold rounded-2xl text-xs transition-all border border-amber-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 group"
            title="Mở Sổ Tay 8 Khối Chuẩn Công Giáo VERIDU (Xem mẫu và chèn nhanh 1-click)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500 group-hover:text-slate-950" />
            <span className="font-serif">📖 Sổ Tay Khối Chuẩn</span>
          </button>

          {/* Quick Upload .HTML Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white font-bold rounded-2xl text-xs transition-all border border-indigo-500/30 hidden md:flex items-center gap-1.5 cursor-pointer"
            title="Nạp tệp HTML để phân tích và chèn tự động"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>Nạp HTML</span>
          </button>

          {/* Resource Modal Button */}
          <button
            type="button"
            onClick={() => setShowResourceModal(true)}
            className="px-3 py-1.5 bg-[var(--bg-main)] hover:bg-indigo-500/10 text-[var(--text-muted)] hover:text-indigo-500 font-bold rounded-2xl text-xs border border-[var(--border-card)] hidden xl:flex items-center gap-1.5 transition"
            title="Gửi tài liệu, sách, giáo án đa định dạng (.pdf, .docx, slide)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Gửi Giáo Án</span>
          </button>

          {/* Publish / Update Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-4 sm:px-5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 border border-amber-400/50"
          >
            {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? 'Đang Lưu...' : postId ? 'Lưu Thay Đổi' : 'Xuất Bản'}</span>
          </button>

        </div>
      </header>

      {/* NOTIFICATION BANNER */}
      {message && (
        <div className={`p-2.5 text-xs font-bold flex items-center justify-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-b border-emerald-500/30' 
            : 'bg-red-500/20 text-red-500 dark:text-red-300 border-b border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🌟 2-COLUMN FULL-WIDTH WORKBENCH */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        
        {/* ⬅️ LEFT SIDEBAR (SETTINGS & METADATA & QUICK INSERTERS) */}
        {!sidebarCollapsed && (
          <aside className="w-full lg:w-96 shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-card)] flex flex-col h-auto lg:h-[calc(100vh-7.5rem)] overflow-y-auto z-20">
            
            {/* SIDEBAR TABS HEADER */}
            <div className="flex items-center border-b border-[var(--border-card)] bg-[var(--bg-main)] p-2 gap-1 sticky top-0 z-10">
              <button
                type="button"
                onClick={() => setSidebarTab('settings')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Thiết Lập Bài
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('blocks')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'blocks' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> 8 Khối Chuẩn
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('tools')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'tools' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Nạp File
              </button>
            </div>

            {/* TAB 1: POST SETTINGS & METADATA */}
            {sidebarTab === 'settings' && (
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Thông Tin Xuất Bản &amp; SEO
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">
                      Tiêu Đề Bài Viết <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Nhập tiêu đề bài viết..."
                      className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">
                      Đường Dẫn Định Danh (Slug)
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="tai-sao-gioan-tay-gia-bi-tram-quyet"
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] text-[var(--text-muted)] outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[var(--text-muted)] block mb-1">Chuyên Mục</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500 text-xs"
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
                      <label className="font-bold text-[var(--text-muted)] block mb-1">Giao Diện (Template)</label>
                      <select
                        value={articleType}
                        onChange={(e) => setArticleType(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500 text-xs"
                      >
                        <option value="standard">📖 Tiêu Chuẩn</option>
                        <option value="interactive">🚀 Tương Tác 3D</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">
                      Ảnh Bìa Đại Diện (Google Drive / URL)
                    </label>
                    <input
                      type="url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... hoặc Drive"
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] outline-none focus:border-amber-500"
                    />
                    {featuredImage && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border-card)] aspect-video relative max-h-32">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={featuredImage} 
                          alt="Preview Ảnh Bìa" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-muted)] block mb-1">
                      Tóm Tắt Ngắn (Excerpt SEO)
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      placeholder="Tóm tắt ngắn gọn nội dung cốt lõi của bài viết để hiển thị trên thẻ bài và kết quả tìm kiếm..."
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 8 CATHOLIC BLOCKS FAST ACCESS */}
            {sidebarTab === 'blocks' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 8 Khối Chuẩn Công Giáo
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(true)}
                    className="text-[10px] text-amber-500 hover:underline font-bold"
                  >
                    Xem Sổ Tay ↗
                  </button>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Nhấp vào bất kỳ khối nào bên dưới để chèn mẫu HTML chuẩn vào vị trí con trỏ:
                </p>

                <div className="space-y-2">
                  {[
                    {
                      name: '1. Lời Chúa Soi Đường',
                      desc: 'Trích dẫn Lời Chúa viền vàng & tra cứu Kinh Thánh',
                      icon: <BookOpen className="w-4 h-4 text-amber-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose"><div class="flex items-start gap-4"><div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div><div class="space-y-2.5 flex-1"><blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">“Ngài phải nổi bật lên, còn tôi phải lu mờ đi.”</blockquote><div class="flex items-center gap-2 pt-1"><a href="/kinh-thanh/ga/3" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group"><span>Ga 3:30</span><span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span></a></div></div></div></div>`)
                    },
                    {
                      name: '2. Thơ & Lời Nguyện Kính',
                      desc: 'Lời cầu nguyện sốt mến sắc tím & Amen',
                      icon: <Heart className="w-4 h-4 text-indigo-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="prayer-block my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 shadow-xl backdrop-blur-md not-prose"><div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif mb-3"><span>🕊️</span> LỜI NGUYỆN KÍNH PHỤNG VỤ</div><p class="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed m-0">“Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...”</p><div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">Amen.</div></div>`)
                    },
                    {
                      name: '3. Tóm Tắt Nghiên Cứu Thần Học',
                      desc: 'Thẻ tóm tắt học thuật VERIDU RESEARCH',
                      icon: <FileText className="w-4 h-4 text-indigo-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="abstract-research my-8 p-6 sm:p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 shadow-xl backdrop-blur-md space-y-4 not-prose"><div class="abstract-header flex items-center justify-between border-b border-indigo-500/20 pb-3"><span class="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif"><span>📖</span> TÓM TẮT NGHIÊN CỨU THẦN HỌC</span><span class="abstract-badge text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold font-mono">VERIDU RESEARCH</span></div><p class="font-serif text-sm sm:text-base leading-relaxed text-[var(--text-main)] m-0">Khảo luận chuyên sâu về nền tảng tín lý và bối cảnh lịch sử của Tín Điều Theotokos tại Công đồng Êphêsô (431), làm rõ sự hiệp nhất hai bản tính trong duy nhất một Ngôi Vị Thiên Chúa.</p><div class="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/10"><span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#Theotokos</span><span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#Epheso431</span></div></div>`)
                    },
                    {
                      name: '4. Bằng Chứng Thánh Kinh',
                      desc: 'Bảng danh mục luận điểm & câu đối chiếu',
                      icon: <ListChecks className="w-4 h-4 text-amber-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="scripture-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose"><div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3"><span>📜</span> DANH MỤC BẰNG CHỨNG THÁNH KINH</div><div class="space-y-3"><div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60"><span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Hòm Bia Giao Ước Mới:</span><span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">Xh 40,34-35; Lc 1,35; Kh 11,19</span></div><div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60"><span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Đấng Trung Gian Duy Nhất:</span><span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">1Tm 2,5; Dt 9,15</span></div></div></div>`)
                    },
                    {
                      name: '5. Thuật Ngữ Thần Học',
                      desc: 'Giải nghĩa thuật ngữ kèm từ nguyên Hy Lạp/Latin',
                      icon: <HelpCircle className="w-4 h-4 text-indigo-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="dictionary-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose"><div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3"><span>📚</span> THUẬT NGỮ GIÁO LÝ & THẦN HỌC</div><div class="space-y-3"><div class="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1"><div class="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2"><span>Theotokos</span><span class="text-[10px] font-mono text-[var(--text-muted)] font-normal">(Hy Lạp: Θεοτόκος)</span></div><p class="text-xs text-[var(--text-main)] leading-relaxed m-0">Tước hiệu Mẹ Thiên Chúa, được tuyên tín tại Công đồng Êphêsô (431) nhằm khẳng định Đức Kitô là Thiên Chúa thật và con người thật.</p></div></div></div>`)
                    },
                    {
                      name: '6. Hình Ảnh Nghệ Thuật Thánh',
                      desc: 'Ảnh kèm chú thích & hỗ trợ Lightbox phóng to',
                      icon: <ImageIcon className="w-4 h-4 text-emerald-500" />,
                      action: () => handleInsertCatholicBlock(`<figure class="veridu-image-block my-8 mx-auto text-center not-prose"><img src="https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80" alt="Nghệ Thuật Thánh Đường" data-lightbox="true" referrerpolicy="no-referrer" class="max-w-full h-auto rounded-3xl shadow-2xl mx-auto block cursor-zoom-in hover:scale-[1.01] transition-transform duration-300 border border-[var(--border-card)]" /><figcaption class="mt-3 text-xs italic text-[var(--text-muted)] font-serif max-w-xl mx-auto">Bích họa Nghệ Thuật Thánh Đường Công Giáo — Kiệt tác nghệ thuật phụng vụ.</figcaption></figure>`)
                    },
                    {
                      name: '7. Video Nhúng 16:9',
                      desc: 'Khung video YouTube/Vimeo tỷ lệ vàng 16:9',
                      icon: <Video className="w-4 h-4 text-rose-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="veridu-embed-video w-full aspect-video rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-8 bg-black relative z-10 not-prose"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" class="w-full h-full border-none" title="Video Phụng Vụ VERIDU" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`)
                    },
                    {
                      name: '8. Hộp Lưu Ý & Cảnh Báo',
                      desc: 'Hộp nhấn mạnh giáo lý 4 cấp phụng vụ',
                      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                      action: () => handleInsertCatholicBlock(`<div class="catechetical-callout callout-important my-6 p-5 sm:p-6 border-l-4 border-amber-500 rounded-r-2xl bg-amber-500/10 text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-md space-y-1.5 not-prose"><div class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><span>⭐</span> QUAN TRỌNG: TÍN LÝ HỘI THÁNH</div><div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">Tín điều về Bí tích Thánh Thể là trung tâm và tột đỉnh của toàn bộ đời sống Kitô hữu (Lumen Gentium, 11).</div></div>`)
                    }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={item.action}
                      className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition-all flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] group-hover:border-amber-500/30 shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[var(--text-main)] group-hover:text-amber-500 transition">
                          {item.name}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FILE IMPORT & DIAGNOSTICS */}
            {sidebarTab === 'tools' && (
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Nạp &amp; Chuyển Hóa Tệp .HTML
                </div>
                
                {uploadedFileName ? (
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
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

                    <div className="pt-2 text-[11px]">
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
                  <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-dashed border-[var(--border-card)] text-center space-y-3">
                    <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Kéo thả hoặc tải lên tệp <code className="px-1 py-0.5 rounded bg-[var(--bg-card)] font-mono text-[10px]">.html</code> để tự động trích xuất tiêu đề, hình ảnh và chuyển hóa thành định dạng Stained-Glass.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      Chọn Tệp .HTML Từ Máy Tính
                    </button>
                  </div>
                )}
              </div>
            )}

          </aside>
        )}

        {/* ➡️ RIGHT WORKBENCH: LIVE VISUAL CANVAS / CODE EDITOR / READER PREVIEW */}
        <main className="flex-1 bg-[var(--bg-main)] p-3 sm:p-6 lg:p-8 h-auto lg:h-[calc(100vh-7.5rem)] overflow-y-auto flex flex-col items-center">
          <div className={`w-full ${activeTab === 'preview' ? getDeviceWidthClass() : 'max-w-4xl'} transition-all duration-300 space-y-4`}>

            {/* Diagnostics Banner */}
            {analysisNotice && (
              <div className="w-full p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4 text-xs text-indigo-600 dark:text-indigo-300 font-medium animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
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

            {/* ══════════════════════════════════════════════════════════════════════════════
                MODE 1: 🎨 LIVE VISUAL CANVAS (DIRECT WYSIWYG IN-PLACE EDITING)
                ══════════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'visual' && (
              <div className="relative space-y-4">
                
                {/* Visual Canvas Info Bar */}
                <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-serif font-bold text-amber-500">Live Visual Canvas</span>
                    <span>— Nhấp trực tiếp vào chữ để sửa, bôi đen để định dạng.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(true)}
                    className="text-amber-500 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Chèn Khối Công Giáo</span>
                  </button>
                </div>

                {/* Stained-Glass Visual Editor Container */}
                <div className="relative rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl overflow-hidden p-6 sm:p-10 md:p-12 transition-all">
                  
                  {/* Article Category & Title Header in Canvas */}
                  <div className="border-b border-[var(--border-card)] pb-6 mb-8 text-center space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-serif text-xs font-black uppercase tracking-wider border border-amber-500/20">
                      {category}
                    </span>
                    <h1 
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const newT = e.currentTarget.textContent || '';
                        handleTitleChange(newT);
                      }}
                      className="font-serif font-black text-2xl sm:text-4xl md:text-5xl text-[var(--text-main)] outline-none focus:ring-2 focus:ring-amber-500/30 rounded-2xl p-2 transition-all leading-tight cursor-text"
                      title="Nhấp vào để đổi tiêu đề bài viết"
                    >
                      {title || 'Tiêu Đề Bài Viết...'}
                    </h1>
                  </div>

                  {/* DIRECT CONTENT EDITABLE CONTAINER */}
                  <div
                    ref={visualCanvasRef}
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={handleCanvasInput}
                    onBlur={handleCanvasInput}
                    className="veridu-article-body article-prose font-serif text-base sm:text-lg leading-relaxed text-[var(--text-main)] outline-none min-h-[500px] focus:ring-1 focus:ring-amber-500/20 rounded-2xl p-2 cursor-text select-text"
                    data-placeholder="Nhấp chuột vào đây để bắt đầu viết bài..."
                  />

                  {/* Selection-activated Floating Format Toolbar */}
                  <FloatingFormatToolbar 
                    editorRef={visualCanvasRef} 
                    onContentChange={handleCanvasInput} 
                  />

                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════
                MODE 2: 💻 HTML CODE EDITOR (DIRECT SOURCE CODE EDITING)
                ══════════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                {/* Code Editor Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                    <FileCode className="w-4 h-4" />
                    <span>Mã Nguồn HTML (Chỉnh sửa trực tiếp):</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => setShowBlockModal(true)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-900 dark:text-amber-300 hover:text-slate-950 rounded-lg font-bold transition-all border border-amber-500/30 cursor-pointer"
                    >
                      + Chèn Khối Chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cleaned = normalizeAndSyncHtml(contentHtml);
                        setContentHtml(cleaned);
                        setMessage({ type: 'success', text: 'Đã chuẩn hóa cấu trúc HTML!' });
                        setTimeout(() => setMessage(null), 2000);
                      }}
                      className="px-2.5 py-1 bg-[var(--bg-main)] hover:bg-indigo-500/20 text-[var(--text-muted)] hover:text-indigo-400 rounded-lg font-medium transition-all border border-[var(--border-card)] cursor-pointer"
                    >
                      ✨ Chuẩn Hóa
                    </button>
                  </div>
                </div>

                {/* Monospace Code Editor Area */}
                <div className="relative rounded-3xl overflow-hidden border border-[var(--border-card)] bg-slate-950 shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-white/10 text-xs font-mono text-slate-400">
                    <span>index.html ({contentHtml.length} ký tự)</span>
                    <span className="text-amber-400">Đồng bộ 1:1 với Live Canvas</span>
                  </div>
                  <textarea
                    value={contentHtml}
                    onChange={(e) => {
                      const newHtml = e.target.value;
                      setContentHtml(newHtml);
                      if (visualCanvasRef.current) {
                        visualCanvasRef.current.innerHTML = newHtml;
                      }
                    }}
                    rows={24}
                    placeholder="Nhập hoặc dán mã HTML tại đây..."
                    className="w-full p-5 bg-transparent font-mono text-xs sm:text-sm text-amber-300 outline-none leading-relaxed resize-y selection:bg-amber-500 selection:text-slate-950 custom-scrollbar"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════
                MODE 3: 👁️ READER PREVIEW (FULL STAINED-GLASS READING VIEW)
                ══════════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                
                {/* Device Switcher Bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md">
                  <div className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span>Xem Thử Độc Giả:</span>
                  </div>

                  <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-card)]">
                    <button
                      type="button"
                      onClick={() => setCanvasDevice('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        canvasDevice === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-[var(--text-muted)] hover:text-amber-500'
                      }`}
                      title="Xem màn hình Máy tính (100%)"
                    >
                      <Monitor className="w-3.5 h-3.5" /> <span className="text-[10px] hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasDevice('tablet')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        canvasDevice === 'tablet' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-[var(--text-muted)] hover:text-amber-500'
                      }`}
                      title="Xem màn hình Tablet (768px)"
                    >
                      <Tablet className="w-3.5 h-3.5" /> <span className="text-[10px] hidden sm:inline">Tablet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasDevice('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        canvasDevice === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-[var(--text-muted)] hover:text-amber-500'
                      }`}
                      title="Xem màn hình Điện thoại (375px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> <span className="text-[10px] hidden sm:inline">Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Stained-Glass Reader Article Card */}
                <div className="p-6 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl space-y-6">
                  <div className="border-b border-[var(--border-card)] pb-6 text-center space-y-3">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-serif font-black uppercase tracking-wider">
                      {category}
                    </span>
                    <h1 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[var(--text-main)] leading-tight">
                      {title || 'Tiêu Đề Bài Viết Xem Trước'}
                    </h1>
                    {excerpt && (
                      <p className="font-serif italic text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed pt-2">
                        {excerpt}
                      </p>
                    )}
                  </div>

                  <VisualArticleRenderer contentHtml={contentHtml} />
                </div>
              </div>
            )}

          </div>
        </main>

      </div>

      {/* 🌟 CATHOLIC BLOCK INSERTER MODAL */}
      <CatholicBlockInserterModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onInsertHtml={handleInsertCatholicBlock}
      />

      {/* 🌟 SUCCESS PUBLISH / UPDATE MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-lg w-full p-8 border border-amber-500/40 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">
                {postId ? 'Đã Cập Nhật Bài Viết Thành Công!' : 'Đã Xuất Bản Bài Viết Thành Công!'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                Bài viết &quot;<strong className="text-amber-500">{title}</strong>&quot; đã được lưu trữ an toàn vào CSDL Supabase với trạng thái <span className="font-bold text-emerald-500">Đã xuất bản (Published)</span>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono text-amber-600 dark:text-amber-400 truncate">
              https://www.thapgia.com/{publishedSlug}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/${publishedSlug}`}
                target="_blank"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Xem Bài Viết Trực Tuyến
              </Link>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-5 py-3 bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-main)] font-bold text-xs rounded-xl border border-[var(--border-card)] transition-all cursor-pointer"
              >
                Tiếp Tục Biên Tập
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

      {/* RESOURCE SUBMISSION MODAL */}
      <ResourceSubmissionModal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
      />

    </div>
  );
}

export default function DangBaiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-36 text-center text-amber-500 font-bold">Đang tải Trình Soạn Thảo VERIDU...</div>}>
      <DangBaiContent />
    </Suspense>
  );
}
