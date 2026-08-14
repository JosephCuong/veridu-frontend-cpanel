'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredUser, UserProfile } from '@/lib/auth';
import { extractTitleFromHtml, normalizeAndSyncHtml } from '@/lib/htmlProcessor';
import VisualArticleRenderer from '@/components/VisualArticleRenderer';

import { 
  PenTool, 
  Send, 
  AlertTriangle, 
  Loader2, 
  Upload, 
  FileCode, 
  Sparkles, 
  Eye, 
  Edit3, 
  CheckCircle2,
  X,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  Image as ImageIcon,
  Video as VideoIcon,
  Code
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

function convertGoogleDriveVideoUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return trimmed;
}

export default function SubmitPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [articleType, setArticleType] = useState('standard');
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [stripHtmlClasses, setStripHtmlClasses] = useState(true);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Dialog Modals for Visual Editor
  const [showImageModal, setShowImageModal] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  useEffect(() => {
    async function checkUserPermission() {
      const storedUser = getStoredUser();
      if (!storedUser) {
        router.push('/dang-nhap');
        return;
      }

      setUser(storedUser);

      let role = String(storedUser.role || '').toLowerCase();

      try {
        if (storedUser.id || storedUser.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .or(`id.eq.${storedUser.id},email.eq.${storedUser.email}`)
            .maybeSingle();

          if (profile?.role) {
            role = String(profile.role).toLowerCase();
          }
        }
      } catch (err) {
        console.warn('Role fetch warning:', err);
      }

      const isAllowed = 
        role.includes('admin') ||
        role.includes('quản trị') ||
        role.includes('teacher') ||
        role.includes('giáo lý') ||
        role.includes('đóng góp') ||
        role.includes('học giả') ||
        role.includes('contributor') ||
        role.includes('scholar');

      if (!isAllowed) {
        setStatus('error');
        setErrorMsg('Tài khoản của bạn chưa được cấp quyền đăng bài. Quyền đăng bài yêu cầu tài khoản Quản Trị Viên (admin/teacher), Học Giả VERIDU hoặc Người Đóng Góp.');
      } else if (status === 'error') {
        setStatus('idle');
        setErrorMsg('');
      }
    }

    checkUserPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Sync content with contentEditable when switching to visual tab
  useEffect(() => {
    if (activeTab === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [activeTab, content]);

  // Visual Editor Command Execution
  const execCmd = (cmd: string, val: string = '') => {
    if (typeof document !== 'undefined') {
      document.execCommand(cmd, false, val);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleInsertImage = () => {
    if (!imgUrlInput.trim()) return;
    const finalUrl = convertGoogleDriveUrl(imgUrlInput);
    const captionHtml = imgCaptionInput.trim() ? `<figcaption class="text-center text-xs italic text-[var(--text-muted)] mt-2">${imgCaptionInput.trim()}</figcaption>` : '';
    const figureHtml = `<figure class="my-6 text-center"><img src="${finalUrl}" alt="${imgCaptionInput.trim() || 'Hình ảnh'}" referrerpolicy="no-referrer" data-lightbox="true" class="max-w-full h-auto rounded-2xl shadow-2xl my-4 mx-auto block cursor-zoom-in">${captionHtml}</figure><p><br></p>`;
    
    if (activeTab === 'visual' && editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, figureHtml);
      setContent(editorRef.current.innerHTML);
    } else {
      setContent(prev => prev + '\n' + figureHtml);
    }

    setImgUrlInput('');
    setImgCaptionInput('');
    setShowImageModal(false);
  };

  const handleInsertVideo = () => {
    if (!videoUrlInput.trim()) return;
    let embedUrl = videoUrlInput.trim();
    if (embedUrl.includes('youtube.com/watch')) {
      embedUrl = embedUrl.replace('watch?v=', 'embed/');
    } else if (embedUrl.includes('youtu.be/')) {
      embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
    } else if (embedUrl.includes('drive.google.com')) {
      embedUrl = convertGoogleDriveVideoUrl(embedUrl);
    }

    const videoHtml = `<div class="w-full aspect-video rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-6 bg-black relative z-10"><iframe src="${embedUrl}" class="w-full h-full border-none rounded-2xl" allowfullscreen></iframe></div><p><br></p>`;
    
    if (activeTab === 'visual' && editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, videoHtml);
      setContent(editorRef.current.innerHTML);
    } else {
      setContent(prev => prev + '\n' + videoHtml);
    }

    setVideoUrlInput('');
    setShowVideoModal(false);
  };

  // Handle HTML File Upload (Drag & Drop or File Selector)
  const processHtmlFile = (file: File) => {
    if (!file.name.match(/\.(html|htm)$/i)) {
      setErrorMsg('Vui lòng chọn hoặc kéo thả tệp định dạng HTML (.html hoặc .htm)');
      setStatus('error');
      return;
    }

    setErrorMsg('');
    if (status === 'error') setStatus('idle');

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawHtml = e.target?.result as string;
      if (rawHtml) {
        const extractedTitle = extractTitleFromHtml(rawHtml);
        if (extractedTitle) {
          setTitle(extractedTitle);
        }

        const isInteractiveDoc = articleType === 'interactive' || /<!DOCTYPE\s+html/i.test(rawHtml) || /<html[\s>]/i.test(rawHtml);
        if (isInteractiveDoc) {
          setArticleType('interactive');
        }

        const normalizedHtml = normalizeAndSyncHtml(rawHtml, stripHtmlClasses, isInteractiveDoc);
        setContent(normalizedHtml);

        setUploadedFileName(file.name);
        setSyncNotice(
          extractedTitle
            ? `Tải tệp "${file.name}" thành công! Đã tự động trích xuất tiêu đề "${extractedTitle}".`
            : `Tải tệp "${file.name}" thành công! Đã nạp nội dung bài viết.`
        );
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processHtmlFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processHtmlFile(e.target.files[0]);
    }
  };

  const handleExtractAndNormalize = () => {
    if (!content.trim()) {
      setSyncNotice('Vui lòng nhập hoặc dán nội dung HTML trước khi chuẩn hóa.');
      return;
    }

    const extractedTitle = extractTitleFromHtml(content);
    if (extractedTitle) {
      setTitle(extractedTitle);
    }

    const isInteractiveDoc = articleType === 'interactive' || /<!DOCTYPE\s+html/i.test(content) || /<html[\s>]/i.test(content);
    const normalizedHtml = normalizeAndSyncHtml(content, false, isInteractiveDoc);
    setContent(normalizedHtml);

    setSyncNotice(
      extractedTitle
        ? `Đã trích xuất tiêu đề: "${extractedTitle}" và chuẩn hóa HTML.`
        : 'Đã chuẩn hóa HTML tương thích với giao diện VERIDU.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    const isInteractiveDoc = articleType === 'interactive' || /<!DOCTYPE\s+html/i.test(content) || /<html[\s>]/i.test(content);
    const finalArticleType = isInteractiveDoc ? 'interactive' : articleType;
    const finalContent = normalizeAndSyncHtml(content, false, isInteractiveDoc);

    const categoryMap: Record<string, string> = {
      interactive: 'Bài Tương Tác HTML 3D',
      meditation: 'Suy Niệm',
      theological: 'Thần Học',
      magazine: 'Tạp Chí / Phóng Sự',
    };
    const finalCategory = categoryMap[finalArticleType] || finalArticleType;

    const finalFeaturedImage = convertGoogleDriveUrl(featuredImage);

    setStatus('loading');
    try {
      const { error } = await supabase.from('posts').insert([{
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: finalContent,
        featured_image: finalFeaturedImage || null,
        author_id: user.id,
        status: 'published',
        article_type: finalArticleType,
        category: finalCategory,
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
      }]);

      if (error) throw new Error(error.message || 'Lỗi khi đăng bài');
      
      setStatus('success');
      setTitle('');
      setExcerpt('');
      setFeaturedImage('');
      setContent('');
      setUploadedFileName(null);
      setSyncNotice(null);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors">
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header Banner */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <PenTool className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-serif font-black text-3xl">Đóng Góp Bài Viết VERIDU</h1>
              <p className="text-[var(--text-muted)] text-sm">Soạn thảo bài viết trực quan như Word, chèn ảnh/video Google Drive hoặc tải tệp HTML.</p>
            </div>
          </div>
        </div>

        {status === 'error' && errorMsg.includes('chưa được cấp quyền') ? (
          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-bold text-xl">Tính năng đang khóa</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">{errorMsg}</p>
          </div>
        ) : status === 'success' ? (
          <div className="p-12 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl font-black mb-4">✓</div>
            <h3 className="font-bold text-2xl text-emerald-500">Đăng Bài Thành Công!</h3>
            <p className="text-[var(--text-muted)]">Bài viết của bạn đã được lưu vào hệ thống Thư Viện VERIDU.</p>
            <button 
              onClick={() => setStatus('idle')} 
              className="mt-6 px-6 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold shadow-lg hover:bg-amber-400 transition cursor-pointer"
            >
              Soạn bài tiếp theo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl w-fit flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Edit3 className="w-4 h-4" /> ✍️ Soạn Thảo Trực Quan (WYSIWYG - Như Word)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Code className="w-4 h-4" /> 📄 Dán Mã HTML / Upload Tệp
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Eye className="w-4 h-4" /> 👁️ Xem Trước (Preview)
              </button>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={() => setStatus('idle')} className="text-red-400 hover:text-red-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Sync / Extraction Notification */}
            {syncNotice && (
              <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-medium flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{syncNotice}</span>
                </div>
                <button onClick={() => setSyncNotice(null)} className="text-amber-400/70 hover:text-amber-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* FORM CONTAINER */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-card)] border border-[var(--border-card)] p-6 sm:p-8 rounded-3xl shadow-xl">
              
              {/* Common Fields: Title, Excerpt, Featured Image, Template */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Article Title */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-[var(--text-muted)]">Tiêu đề bài viết</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-bold text-lg" 
                    placeholder="Ví dụ: Phân Tích Kinh Cầu Đức Bà" 
                    required 
                  />
                </div>

                {/* Article Excerpt */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-[var(--text-muted)]">Tóm tắt ngắn (Excerpt)</label>
                  <textarea 
                    value={excerpt} 
                    onChange={e => setExcerpt(e.target.value)} 
                    rows={2} 
                    className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none leading-relaxed resize-y font-sans text-sm text-[var(--text-main)]" 
                    placeholder="Tóm tắt 1-2 câu về nội dung bài viết..." 
                  />
                </div>

                {/* Featured Image URL (Supports Google Drive Links) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] flex items-center justify-between">
                    <span>🖼️ Link Ảnh Đại Diện (Featured Image)</span>
                    <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">Hỗ trợ Google Drive</span>
                  </label>
                  <input 
                    type="url" 
                    value={featuredImage} 
                    onChange={e => setFeaturedImage(e.target.value)}
                    onBlur={e => setFeaturedImage(convertGoogleDriveUrl(e.target.value))}
                    className="w-full p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none font-mono text-xs text-[var(--text-main)]" 
                    placeholder="Dán link ảnh (https://... hoặc link Google Drive: https://drive.google.com/file/d/...)" 
                  />
                  {featuredImage && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl">
                      <div className="w-12 h-10 relative rounded-lg overflow-hidden bg-slate-900 border border-[var(--border-card)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={convertGoogleDriveUrl(featuredImage)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate flex-1">
                        <span className="font-bold text-amber-500">Xem trước ảnh đại diện</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Article Template Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)]">Giao diện Bài viết (Template)</label>
                  <select 
                    value={articleType} 
                    onChange={e => setArticleType(e.target.value)} 
                    className="w-full p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-medium text-sm text-[var(--text-main)]"
                  >
                    <option value="standard">Tiêu chuẩn (Standard) - Phù hợp bài viết chung</option>
                    <option value="magazine">Tạp chí (Wide/Magazine) - Giao diện ảnh lớn, toàn màn hình</option>
                    <option value="meditation">Suy niệm Lời Chúa (Meditation) - Giao diện có trích dẫn Kinh Thánh</option>
                    <option value="theological">Thần học (Theological) - Phù hợp chuyên đề, tài liệu</option>
                    <option value="interactive">Tương tác (Interactive) - HTML chiếm toàn màn hình (Dành cho nội dung nhúng)</option>
                  </select>
                </div>

              </div>


              {/* MODE 1: VISUAL WYSIWYG EDITOR (SOẠN THẢO TRỰC QUAN NHƯ WORD) */}
              {activeTab === 'visual' && (
                <div className="space-y-3 pt-4 border-t border-[var(--border-card)] animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Nội dung bài viết (Gõ chữ & Chèn ảnh/video như Word - Không cần mã HTML)</span>
                    </label>
                  </div>

                  {/* VISUAL TOOLBAR */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl shadow-sm">
                    <button type="button" onClick={() => execCmd('bold')} title="In đậm" className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] transition cursor-pointer"><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={() => execCmd('italic')} title="In nghiêng" className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] transition cursor-pointer"><Italic className="w-4 h-4" /></button>
                    <button type="button" onClick={() => execCmd('underline')} title="Gạch chân" className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] transition cursor-pointer"><Underline className="w-4 h-4" /></button>
                    
                    <div className="h-5 w-px bg-[var(--border-card)] mx-1"></div>

                    <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} title="Tiêu đề chính (H2)" className="px-2.5 py-1.5 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] font-bold text-xs transition cursor-pointer">H2</button>
                    <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} title="Tiêu đề phụ (H3)" className="px-2.5 py-1.5 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] font-bold text-xs transition cursor-pointer">H3</button>

                    <div className="h-5 w-px bg-[var(--border-card)] mx-1"></div>

                    <button type="button" onClick={() => execCmd('formatBlock', '<blockquote>')} title="Trích dẫn" className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] transition cursor-pointer"><Quote className="w-4 h-4" /></button>
                    <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Danh sách" className="p-2 rounded-xl hover:bg-amber-500/20 text-[var(--text-main)] transition cursor-pointer"><List className="w-4 h-4" /></button>

                    <div className="h-5 w-px bg-[var(--border-card)] mx-1"></div>

                    <button 
                      type="button" 
                      onClick={() => setShowImageModal(true)} 
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-amber-500" /> 🖼️ Chèn Ảnh (Google Drive)
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setShowVideoModal(true)} 
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <VideoIcon className="w-4 h-4 text-rose-500" /> 🎬 Chèn Video
                    </button>
                  </div>

                  {/* CONTENT EDITABLE INTERACTIVE AREA */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={() => {
                      if (editorRef.current) {
                        setContent(editorRef.current.innerHTML);
                      }
                    }}
                    className="prose dark:prose-invert max-w-none font-serif text-[var(--text-main)] bg-[var(--bg-main)] border border-[var(--border-card)] p-6 sm:p-8 rounded-2xl min-h-[450px] outline-none focus:ring-2 focus:ring-amber-500/50 leading-relaxed text-base sm:text-lg overflow-y-auto"
                  />
                </div>
              )}


              {/* MODE 2: CODE EDITOR / HTML FILE UPLOAD */}
              {activeTab === 'code' && (
                <div className="space-y-6 pt-4 border-t border-[var(--border-card)] animate-fadeIn">
                  {/* HTML File Drag and Drop Zone */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-500" />
                      <span>Tải lên tệp HTML bài viết</span>
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                        isDragging
                          ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                          : 'border-[var(--border-card)] bg-[var(--bg-main)] hover:border-amber-500/50 hover:bg-amber-500/5'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--text-main)]">
                          Kéo & thả file bài viết (.html, .htm) vào đây
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          hoặc click để chọn tệp từ máy tính của bạn
                        </p>
                      </div>

                      {uploadedFileName && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã tải lên: {uploadedFileName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 px-1">
                      <input 
                        type="checkbox" 
                        id="stripClasses" 
                        checked={stripHtmlClasses}
                        onChange={(e) => setStripHtmlClasses(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[var(--bg-main)] border-[var(--border-card)]"
                      />
                      <label htmlFor="stripClasses" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                        Tự động xóa các class/style rác từ file Word/Docs (Khuyên dùng)
                      </label>
                    </div>
                  </div>

                  {/* RAW HTML TEXTAREA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[var(--text-muted)]">
                        Mã nguồn HTML Chi Tiết
                      </label>
                      <button
                        type="button"
                        onClick={handleExtractAndNormalize}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Trích xuất Tiêu đề & Chuẩn hóa HTML
                      </button>
                    </div>

                    <textarea 
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      rows={14} 
                      className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none leading-relaxed resize-y font-mono text-xs" 
                      placeholder="Dán mã HTML bài viết tại đây..." 
                      required 
                    />
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-[var(--border-card)]">
                <div className="text-xs text-amber-500 font-medium italic">
                  Thưởng: +50 Điểm đóng góp bài viết Công Giáo
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'loading'} 
                  className="px-8 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition flex items-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-70 cursor-pointer"
                >
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Xuất Bản Bài Viết
                </button>
              </div>

            </form>

            {/* MODE 3: VISUAL PREVIEW */}
            {activeTab === 'preview' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-6 sm:p-10 rounded-3xl space-y-8 animate-fadeIn shadow-2xl">
                <div className="border-b border-[var(--border-card)] pb-6 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-3">
                      👁️ Giao diện bài viết trên VERIDU
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-serif text-[var(--text-main)]">
                      {title || 'Tiêu đề bài viết chưa có...'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('visual')}
                    className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" /> Quay lại Soạn thảo
                  </button>
                </div>

                {content ? (
                  <VisualArticleRenderer contentHtml={content} />
                ) : (
                  <div className="text-center py-16 text-[var(--text-muted)] italic space-y-3">
                    <FileCode className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-50" />
                    <p>Chưa có nội dung bài viết để xem trước.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* 🖼️ DIALOG POPUP: CHÈN ẢNH GOOGLE DRIVE */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <h3 className="font-bold text-lg text-amber-500 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" /> Chèn Ảnh Bài Viết
              </h3>
              <button onClick={() => setShowImageModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">Link Ảnh (Hỗ trợ Google Drive)</label>
                <input 
                  type="url" 
                  value={imgUrlInput}
                  onChange={(e) => setImgUrlInput(e.target.value)}
                  placeholder="Dán link (https://... hoặc https://drive.google.com/file/d/...)"
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">Chú thích ảnh (Caption - Không bắt buộc)</label>
                <input 
                  type="text" 
                  value={imgCaptionInput}
                  onChange={(e) => setImgCaptionInput(e.target.value)}
                  placeholder="Ví dụ: Bản thảo cổ Kinh Cầu Loreto..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-card)]">
              <button onClick={() => setShowImageModal(false)} className="px-4 py-2 rounded-xl bg-[var(--bg-main)] text-xs font-bold cursor-pointer">Hủy</button>
              <button onClick={handleInsertImage} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400 transition cursor-pointer">Chèn Vào Bài Viết</button>
            </div>
          </div>
        </div>
      )}

      {/* 🎬 DIALOG POPUP: CHÈN VIDEO */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <h3 className="font-bold text-lg text-rose-500 flex items-center gap-2">
                <VideoIcon className="w-5 h-5" /> Chèn Video Bài Viết
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">Link Video (YouTube hoặc Google Drive Video)</label>
                <input 
                  type="url" 
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="Dán link (https://www.youtube.com/watch?v=... hoặc Google Drive Video)"
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-rose-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-card)]">
              <button onClick={() => setShowVideoModal(false)} className="px-4 py-2 rounded-xl bg-[var(--bg-main)] text-xs font-bold cursor-pointer">Hủy</button>
              <button onClick={handleInsertVideo} className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md hover:bg-rose-400 transition cursor-pointer">Chèn Video</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
