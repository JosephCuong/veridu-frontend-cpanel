'use client';

import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  HelpCircle,
  FileCode,
  Video,
  Music,
  Presentation
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';

interface ResourceSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  'Giáo Lý Hội Thánh',
  'Giáo Án Xứ Đoàn & Thiếu Nhi',
  'Thần Học & Tín Lý',
  'Kinh Thánh & Cựu / Tân Ước',
  'Phụng Vụ & Bí Tích',
  'Lịch Sử Giáo Hội & Thánh Nhân',
  'Thánh Nhạc & Ca Đoàn',
  'Tài Liệu Tông Tòa Vatican'
];

const FORMATS = [
  { id: 'PDF', label: 'Tệp PDF (.pdf)', icon: FileText },
  { id: 'DOCX', label: 'Tệp Word (.docx, .doc)', icon: FileCode },
  { id: 'PPTX', label: 'Bài Giảng PowerPoint (.pptx, .ppt)', icon: Presentation },
  { id: 'SLIDES', label: 'Google Slides / Canva Trực Tuyến', icon: Presentation },
  { id: 'EPUB', label: 'Sách Điện Tử (.epub, .mobi)', icon: BookOpen },
  { id: 'AUDIO', label: 'Âm Thanh / Podcast (.mp3, .wav)', icon: Music },
  { id: 'VIDEO', label: 'Video Bài Giảng (.mp4, YouTube)', icon: Video }
];

export default function ResourceSubmissionModal({ isOpen, onClose, onSuccess }: ResourceSubmissionModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [itemType, setItemType] = useState<'tai-lieu' | 'sach'>('tai-lieu');
  const [format, setFormat] = useState('PDF');
  const [fileUrl, setFileUrl] = useState('');
  const [driveFileId, setDriveFileId] = useState('');
  const [googleSlideId, setGoogleSlideId] = useState('');
  const [pagesCount, setPagesCount] = useState('');
  const [fileSizeLabel, setFileSizeLabel] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fullSummaryHtml, setFullSummaryHtml] = useState('');
  const [allowReadOnline, setAllowReadOnline] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (current) {
      setUser(current);
      setAuthor(current.christianName ? `${current.christianName} ${current.displayName || current.username}` : (current.displayName || current.username));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập tên sách hoặc tài liệu!' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/resources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          author_id: user?.id,
          category,
          item_type: itemType,
          format,
          pages_count: pagesCount ? parseInt(pagesCount) : null,
          file_size_label: fileSizeLabel,
          file_url: fileUrl,
          drive_file_id: driveFileId,
          google_slide_id: googleSlideId,
          cover_image_url: coverImageUrl,
          description,
          full_summary_html: fullSummaryHtml,
          allow_read_online: allowReadOnline,
          user_role: user?.role || 'author'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra khi gửi tài liệu.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/40 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Gửi Tài Liệu, Sách &amp; Giáo Án Mới
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Chia sẻ tài nguyên học tập đức tin đa định dạng (.pdf, .docx, .pptx, slide, video, audio)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-stone-500/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-2xl text-xs font-serif flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Tên Sách / Tài Liệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Giáo Án Xứ Đoàn TNTT Cấp 1..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Tác Giả / Nguồn Soạn Thảo
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Ban Giáo Lý Giáo Phận, Lm. Antôn..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category & Item Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Chuyên Mục Giáo Lý / Thần Học
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Phân Loại Tài Nguyên
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setItemType('tai-lieu')}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    itemType === 'tai-lieu' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                  }`}
                >
                  Tài Liệu / Giáo Án
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('sach')}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    itemType === 'sach' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                  }`}
                >
                  Sách Điện Tử (Ebook)
                </button>
              </div>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
              Định Dạng File
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FORMATS.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`p-2 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition ${
                      format === f.id ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{f.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Link / Google Drive ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Đường Dẫn Tệp Trực Tiếp (Direct URL hoặc Link Tải)
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://...file.pdf"
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Google Drive ID (Nếu lưu trên Drive)
              </label>
              <input
                type="text"
                value={driveFileId}
                onChange={(e) => setDriveFileId(e.target.value)}
                placeholder="VD: 1a2b3c4d5e..."
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Pages & File Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Số Trang (Ước lượng)
              </label>
              <input
                type="number"
                value={pagesCount}
                onChange={(e) => setPagesCount(e.target.value)}
                placeholder="VD: 45"
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Dung Lượng File
              </label>
              <input
                type="text"
                value={fileSizeLabel}
                onChange={(e) => setFileSizeLabel(e.target.value)}
                placeholder="VD: 4.2 MB"
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                Ảnh Bìa (URL)
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://...cover.jpg"
                className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
              Mô Tả &amp; Hướng Dẫn Sử Dụng
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu tóm lược nội dung giáo án, tài liệu hoặc đối tượng học viên phù hợp..."
              className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 font-serif leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between">
            <span className="text-[11px] font-serif text-[var(--text-muted)] italic">
              {user?.role === 'admin' || user?.role === 'scholar' 
                ? '✦ Quyền Học Giả: Tài liệu sẽ được xuất bản ngay lập tức.' 
                : '✦ Tài liệu sẽ được chuyển đến Ban Quản Trị để phê duyệt trước khi hiển thị.'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <span>Đang gửi...</span>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Gửi Tài Liệu Vào Thư Viện</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
