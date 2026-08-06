'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredUser, getAuthToken, UserProfile } from '@/lib/auth';
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
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SubmitPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [articleType, setArticleType] = useState('standard');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [stripHtmlClasses, setStripHtmlClasses] = useState(true);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserPermission() {
      const storedUser = getStoredUser();
      if (!storedUser) {
        router.push('/dang-nhap');
        return;
      }

      setUser(storedUser);

      let role = String(storedUser.role || '').toLowerCase();

      // Fetch real role from Supabase profiles table
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
  }, [router]);

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
        // Auto-extract title from H1/Title/H2
        const extractedTitle = extractTitleFromHtml(rawHtml);
        if (extractedTitle) {
          setTitle(extractedTitle);
        }

        const isInteractiveDoc = articleType === 'interactive' || /<!DOCTYPE\s+html/i.test(rawHtml) || /<html[\s>]/i.test(rawHtml);
        if (isInteractiveDoc) {
          setArticleType('interactive');
        }

        // Auto-normalize HTML structure & styling (pass stripHtmlClasses & isInteractiveDoc parameters)
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

  // Manual Trigger for Title Extraction & HTML Normalization
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

    // Map articleType → category nếu cần
    const categoryMap: Record<string, string> = {
      interactive: 'Bài Tương Tác HTML 3D',
      meditation: 'Suy Niệm',
      theological: 'Thần Học',
      magazine: 'Tạp Chí / Phóng Sự',
    };
    const finalCategory = categoryMap[finalArticleType] || finalArticleType;

    setStatus('loading');
    try {
      const { error } = await supabase.from('posts').insert([{
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: finalContent,
        author_id: user.id,
        status: 'draft',
        article_type: finalArticleType,
        category: finalCategory,
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
      }]);

      if (error) throw new Error(error.message || 'Lỗi khi đăng bài');
      
      setStatus('success');
      setTitle('');
      setExcerpt('');
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
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Banner */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <PenTool className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-serif font-black text-3xl">Đóng Góp Bài Viết</h1>
              <p className="text-[var(--text-muted)] text-sm">Chia sẻ kiến thức thần học, bài viết HTML và suy niệm Lời Chúa với cộng đồng.</p>
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
            <h3 className="font-bold text-2xl text-emerald-500">Gửi Bài Thành Công!</h3>
            <p className="text-[var(--text-muted)]">Bài viết của bạn đang chờ Ban Quản Trị duyệt. Bạn sẽ nhận được <strong>+50 Điểm</strong> khi bài viết được xuất bản.</p>
            <button 
              onClick={() => setStatus('idle')} 
              className="mt-6 px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl text-sm font-bold hover:border-amber-500 transition cursor-pointer"
            >
              Đóng góp bài khác
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Edit3 className="w-4 h-4" /> 📝 Soạn thảo & Upload
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
                <Eye className="w-4 h-4" /> 👁️ Xem trước (Preview)
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

            {/* Tab 1: Editor & Upload */}
            {activeTab === 'editor' && (
              <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-card)] border border-[var(--border-card)] p-6 sm:p-8 rounded-3xl shadow-xl">
                
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
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px]">Đã tự động chuẩn hóa</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 px-1">
                    <input 
                      type="checkbox" 
                      id="stripClasses" 
                      checked={stripHtmlClasses}
                      onChange={(e) => setStripHtmlClasses(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[var(--bg-main)] border-[var(--border-card)]"
                    />
                    <label htmlFor="stripClasses" className="text-xs text-[var(--text-muted)] cursor-pointer select-none leading-relaxed">
                      Tự động xóa các class/style rác từ file Word/Docs (Khuyên dùng để đồng bộ giao diện)
                    </label>
                  </div>
                </div>

                {/* Article Title */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)]">Tiêu đề bài viết</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-bold text-lg" 
                    placeholder="Ví dụ: Suy tư về Mười Điều Răn" 
                    required 
                  />
                </div>

                {/* Article Excerpt */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)]">Tóm tắt ngắn (Excerpt)</label>
                  <textarea 
                    value={excerpt} 
                    onChange={e => setExcerpt(e.target.value)} 
                    rows={3} 
                    className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none leading-relaxed resize-y font-sans text-sm text-[var(--text-main)]" 
                    placeholder="Tóm tắt 1-2 câu về nội dung bài viết..." 
                  />
                </div>

                {/* Article Template Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)]">Giao diện Bài viết (Template)</label>
                  <select 
                    value={articleType} 
                    onChange={e => setArticleType(e.target.value)} 
                    className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-medium text-sm text-[var(--text-main)]"
                  >
                    <option value="standard">Tiêu chuẩn (Standard) - Phù hợp bài viết chung</option>
                    <option value="magazine">Tạp chí (Wide/Magazine) - Giao diện ảnh lớn, toàn màn hình</option>
                    <option value="meditation">Suy niệm Lời Chúa (Meditation) - Giao diện có trích dẫn Kinh Thánh</option>
                    <option value="theological">Thần học (Theological) - Phù hợp chuyên đề, tài liệu</option>
                    <option value="interactive">Tương tác (Interactive) - HTML chiếm toàn màn hình (Dành cho nội dung nhúng)</option>
                  </select>
                </div>

                {/* Article HTML Content & Action Bar */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-bold text-[var(--text-muted)]">
                      Nội dung chi tiết (HTML hoặc Văn bản)
                    </label>
                    <button
                      type="button"
                      onClick={handleExtractAndNormalize}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Trích xuất tiêu đề từ H1/Title và chuẩn hóa inline CSS"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Trích xuất Tiêu đề & Chuẩn hóa HTML
                    </button>
                  </div>

                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    rows={15} 
                    className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none leading-relaxed resize-y font-mono text-sm" 
                    placeholder="Nhập hoặc dán mã HTML/nội dung bài viết tại đây..." 
                    required 
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-[var(--border-card)]">
                  <div className="text-xs text-amber-500 font-medium italic">
                    Thưởng: +50 Điểm khi bài viết được Ban Quản Trị duyệt
                  </div>
                  <button 
                    type="submit" 
                    disabled={status === 'loading'} 
                    className="px-8 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition flex items-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-70 cursor-pointer"
                  >
                    {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Gửi Bài Chờ Duyệt
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Visual Preview */}
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
                    onClick={() => setActiveTab('editor')}
                    className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 rounded-xl text-xs font-bold flex items-center gap-2 transition"
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
                    <p className="text-xs text-[var(--text-muted)]">Hãy nhập hoặc kéo thả tệp HTML ở tab Soạn thảo.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
