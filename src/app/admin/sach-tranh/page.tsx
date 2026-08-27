'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  ArrowLeft, 
  Check, 
  Volume2, 
  Clock, 
  HelpCircle, 
  FileText, 
  Image as ImageIcon,
  Layers,
  Award,
  RotateCcw,
  UploadCloud,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getStoredUser } from '@/lib/auth';
import { resolveMediaUrl } from '@/lib/driveHelper';
import { DEFAULT_STORYBOOKS, StorybookItem, StorybookPage, StorybookQuizQuestion } from '@/lib/storybooksData';

export default function AdminStorybookStudioPage() {
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<StorybookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Editing Book
  const [activeBook, setActiveBook] = useState<StorybookItem>(DEFAULT_STORYBOOKS[0]);
  const [activeTab, setActiveTab] = useState<'info' | 'pages' | 'quiz' | 'guide'>('info');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    loadStorybooks();
  }, []);

  const loadStorybooks = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('storybooks')
        .select('*')
        .order('id', { ascending: true });

      if (data && data.length > 0) {
        setBooks(data);
        setActiveBook(data[0]);
      } else {
        setBooks(DEFAULT_STORYBOOKS);
        setActiveBook(DEFAULT_STORYBOOKS[0]);
      }
    } catch (e) {
      setBooks(DEFAULT_STORYBOOKS);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Auto-allocate timestamps based on word count
  const autoAllocateTimestamps = () => {
    const currentPages = activeBook.pages_data || [];
    let currentStart = 0;
    const newTimestamps: any[] = [];
    const updatedPages = currentPages.map((p, idx) => {
      const words = (p.text_script || '').trim().split(/\s+/).filter(Boolean).length;
      // ~3.2 words per second + 2s breathing pause
      const dur = Math.max(10, Math.round(words * 0.38) + 2);
      const end = currentStart + dur;
      
      const ts = {
        page: idx + 1,
        start: currentStart,
        end: end,
        duration: dur
      };
      newTimestamps.push(ts);

      const res = {
        ...p,
        page_number: idx + 1,
        start_time: currentStart,
        end_time: end,
        estimated_duration: dur
      };

      currentStart = end;
      return res;
    });

    setActiveBook(prev => ({
      ...prev,
      pages_data: updatedPages,
      audio_timestamps: newTimestamps,
      total_pages: updatedPages.length
    }));

    setStatusMsg({ type: 'success', text: `Đã tự động tính toán và phân bổ mốc thời gian (Timestamps) cho toàn bộ ${updatedPages.length} trang!` });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Save to Supabase
  const handleSaveBook = async () => {
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/storybooks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeBook)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Đã lưu và xuất bản sách tranh lên Supabase thành công!' });
        loadStorybooks();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Có lỗi xảy ra khi lưu vào Supabase.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Lỗi mạng khi kết nối tới Supabase.' });
    } finally {
      setSaving(false);
    }
  };

  // Page Operations
  const handleUpdatePageField = (idx: number, field: keyof StorybookPage, val: any) => {
    const updated = [...(activeBook.pages_data || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setActiveBook(prev => ({ ...prev, pages_data: updated }));
  };

  const handleAddPage = () => {
    const current = activeBook.pages_data || [];
    const newPageNum = current.length + 1;
    const newPage: StorybookPage = {
      page_number: newPageNum,
      image_url: `/storybooks/cong-trinh-sang-tao/page_${newPageNum}.png`,
      text_script: '',
      caption: `Trang ${newPageNum}`,
      estimated_duration: 15
    };
    setActiveBook(prev => ({
      ...prev,
      pages_data: [...current, newPage],
      total_pages: newPageNum
    }));
    setSelectedPageIndex(current.length);
  };

  const handleDeletePage = (idx: number) => {
    const current = activeBook.pages_data || [];
    if (current.length <= 1) {
      alert('Sách phải có ít nhất 1 trang!');
      return;
    }
    const updated = current.filter((_, i) => i !== idx).map((p, i) => ({ ...p, page_number: i + 1 }));
    setActiveBook(prev => ({
      ...prev,
      pages_data: updated,
      total_pages: updated.length
    }));
    setSelectedPageIndex(Math.max(0, idx - 1));
  };

  // Quiz Operations
  const handleUpdateQuizQuestion = (qIdx: number, field: keyof StorybookQuizQuestion, val: any) => {
    const updated = [...(activeBook.quiz_data || [])];
    updated[qIdx] = { ...updated[qIdx], [field]: val };
    setActiveBook(prev => ({ ...prev, quiz_data: updated }));
  };

  const handleUpdateQuizOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...(activeBook.quiz_data || [])];
    const opts = [...(updated[qIdx].options || [])];
    opts[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setActiveBook(prev => ({ ...prev, quiz_data: updated }));
  };

  const handleAddQuiz = () => {
    const current = activeBook.quiz_data || [];
    const newQ: StorybookQuizQuestion = {
      question: 'Câu hỏi đố vui mới?',
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      answer_index: 0,
      explanation: 'Lời giải thích ý nghĩa...'
    };
    setActiveBook(prev => ({ ...prev, quiz_data: [...current, newQ] }));
  };

  const handleDeleteQuiz = (qIdx: number) => {
    const current = activeBook.quiz_data || [];
    setActiveBook(prev => ({ ...prev, quiz_data: current.filter((_, i) => i !== qIdx) }));
  };

  const curPage = activeBook.pages_data?.[selectedPageIndex] || activeBook.pages_data?.[0];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-20">
      
      {/* ── 1. STUDIO HEADER BAR ── */}
      <div className="border-b border-[var(--border-card)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl border border-[var(--border-card)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-600 transition"
              title="Về Trang Quản Trị"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  Studio Quản Trị Sách Tranh
                </span>
              </div>
              <h1 className="font-serif font-black text-xl sm:text-2xl text-[var(--text-main)]">
                {activeBook.title || 'Soạn Thảo Sách Tranh'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/sach-tranh/${activeBook.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-main)] hover:text-amber-600 font-serif font-bold text-xs flex items-center gap-2 transition"
            >
              <Eye className="w-4 h-4" />
              <span>Xem Trực Tiếp</span>
            </Link>

            <button
              onClick={handleSaveBook}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang Lưu...' : 'Lưu Vào Supabase'}</span>
            </button>
          </div>

        </div>

        {/* Status Toast Message */}
        {statusMsg && (
          <div className={`mt-3 max-w-7xl mx-auto p-3 rounded-xl text-xs font-serif font-bold flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
          }`}>
            <Check className="w-4 h-4" />
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* ── 2. STUDIO NAVIGATION TABS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 w-full">
        <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl font-serif text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Thông Tin Tác Phẩm</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 rounded-xl font-serif text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pages'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Quản Lý {activeBook.pages_data?.length || 10} Trang Sách</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl font-serif text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Câu Đố Mini-Quiz ({activeBook.quiz_data?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl font-serif text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>4. Góc Phụ Huynh &amp; Giáo Lý Viên</span>
          </button>
        </div>
      </div>

      {/* ── 3. TAB 1: STORYBOOK METADATA ── */}
      {activeTab === 'info' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: General Form */}
            <div className="lg:col-span-2 space-y-6 p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg">
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
                Thông Tin Tác Phẩm
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Tiêu Đề Sách Tranh *</label>
                  <input
                    type="text"
                    value={activeBook.title}
                    onChange={e => setActiveBook(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-serif focus:border-amber-500 outline-none"
                    placeholder="VD: Công Trình Sáng Tạo Kỳ Diệu của Thiên Chúa"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Phụ Đề (Subtitle)</label>
                  <input
                    type="text"
                    value={activeBook.subtitle || ''}
                    onChange={e => setActiveBook(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-serif focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Đường Dẫn URL (Slug) *</label>
                  <input
                    type="text"
                    value={activeBook.slug}
                    onChange={e => setActiveBook(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Phân Loại Giao Ước</label>
                  <select
                    value={activeBook.testament}
                    onChange={e => setActiveBook(prev => ({ ...prev, testament: e.target.value as any }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-serif focus:border-amber-500 outline-none"
                  >
                    <option value="old_testament">Cựu Ước (Old Testament)</option>
                    <option value="new_testament">Tân Ước (New Testament)</option>
                    <option value="parables">Dụ Ngôn (Parables)</option>
                    <option value="saints">Hạnh Các Thánh (Saints)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Độ Tuổi Mục Tiêu</label>
                  <input
                    type="text"
                    value={activeBook.target_age || '4-10 tuổi'}
                    onChange={e => setActiveBook(prev => ({ ...prev, target_age: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-serif focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Tổng Số Trang</label>
                  <input
                    type="number"
                    value={activeBook.total_pages || 10}
                    onChange={e => setActiveBook(prev => ({ ...prev, total_pages: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-serif focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">File Audio Toàn Cuốn (Link .mp3, .wav, hoặc Google Drive)</label>
                  <input
                    type="text"
                    value={activeBook.full_audio_url || ''}
                    onChange={e => setActiveBook(prev => ({ ...prev, full_audio_url: e.target.value }))}
                    placeholder="https://drive.google.com/file/d/... hoặc /storybooks/audio.mp3"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono focus:border-amber-500 outline-none"
                  />
                  <p className="text-[11px] text-[var(--text-muted)]">
                    ✦ Hỗ trợ file .mp3, .wav, .m4a, .ogg hoặc liên kết chia sẻ Google Drive trực tiếp.
                  </p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Tóm Tắt Giới Thiệu (Description)</label>
                  <textarea
                    rows={3}
                    value={activeBook.description || ''}
                    onChange={e => setActiveBook(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Bài Học Đức Tin (Moral Lesson)</label>
                  <textarea
                    rows={2}
                    value={activeBook.moral_lesson || ''}
                    onChange={e => setActiveBook(prev => ({ ...prev, moral_lesson: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Right: Cover Preview */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-4">
                <h3 className="font-serif font-bold text-base text-[var(--text-main)] border-b border-[var(--border-card)] pb-2">
                  Ảnh Bìa Tác Phẩm
                </h3>

                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-900 border border-[var(--border-card)] relative">
                  <Image
                    src={resolveMediaUrl(activeBook.cover_image || '/storybooks/cong-trinh-sang-tao/page_1.png', 'image')}
                    alt="Ảnh bìa"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Đường dẫn ảnh bìa (Link hoặc Google Drive)</label>
                  <input
                    type="text"
                    value={activeBook.cover_image || ''}
                    onChange={e => setActiveBook(prev => ({ ...prev, cover_image: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono focus:border-amber-500 outline-none"
                    placeholder="/storybooks/cong-trinh-sang-tao/page_1.png"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── 4. TAB 2: VISUAL PAGE BUILDER ── */}
      {activeTab === 'pages' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-amber-600 dark:text-amber-400">
                Danh Sách Trang: {activeBook.pages_data?.length || 0} trang
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={autoAllocateTimestamps}
                className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-serif font-bold flex items-center gap-1.5 transition"
                title="Tự động đo số lượng từ để chia giây cho 10 trang"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tự Động Phân Bổ Timestamps</span>
              </button>

              <button
                onClick={handleAddPage}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-serif font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Trang Mới</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Thumbnail Strip */}
            <div className="lg:col-span-4 space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {(activeBook.pages_data || []).map((page, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    selectedPageIndex === idx
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-400'
                      : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/40'
                  }`}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-900 relative shrink-0">
                    <Image
                      src={resolveMediaUrl(page.image_url, 'image')}
                      alt={`Trang ${page.page_number}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)]">
                      <span>Trang {page.page_number}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        {page.estimated_duration || 15}s
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate font-serif">
                      {page.caption || page.text_script}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Page Editor Details */}
            {curPage && (
              <div className="lg:col-span-8 p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                  <h3 className="font-serif font-black text-lg text-[var(--text-main)]">
                    Chỉnh Sửa Trang {curPage.page_number} / {activeBook.pages_data?.length || 10}
                  </h3>

                  <button
                    onClick={() => handleDeletePage(selectedPageIndex)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                    title="Xóa trang này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Page Image Preview */}
                  <div className="space-y-3">
                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-900 border border-[var(--border-card)] relative">
                      <Image
                        src={resolveMediaUrl(curPage.image_url, 'image')}
                        alt={`Trang ${curPage.page_number}`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-muted)] font-serif">
                        Link Ảnh Trang (.png, .webp, .jpg hoặc Google Drive)
                      </label>
                      <input
                        type="text"
                        value={curPage.image_url}
                        onChange={e => handleUpdatePageField(selectedPageIndex, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Page Script & Timestamps */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Tiêu Đề Phân Đoạn (Caption)</label>
                      <input
                        type="text"
                        value={curPage.caption || ''}
                        onChange={e => handleUpdatePageField(selectedPageIndex, 'caption', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Lời Kể Kinh Thánh (Text Script) *</label>
                      <textarea
                        rows={6}
                        value={curPage.text_script || ''}
                        onChange={e => handleUpdatePageField(selectedPageIndex, 'text_script', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none leading-relaxed"
                        placeholder="Nội dung lời đọc cho trang này..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] font-serif">Bắt đầu (giây)</label>
                        <input
                          type="number"
                          value={curPage.start_time || 0}
                          onChange={e => handleUpdatePageField(selectedPageIndex, 'start_time', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] font-serif">Kết thúc (giây)</label>
                        <input
                          type="number"
                          value={curPage.end_time || 15}
                          onChange={e => handleUpdatePageField(selectedPageIndex, 'end_time', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] font-serif">Thời lượng (giây)</label>
                        <input
                          type="number"
                          value={curPage.estimated_duration || 15}
                          onChange={e => handleUpdatePageField(selectedPageIndex, 'estimated_duration', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 5. TAB 3: MINI QUIZ ── */}
      {activeTab === 'quiz' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
          <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)]">
            <span className="text-xs font-serif font-bold text-amber-600 dark:text-amber-400">
              Bộ Câu Đố Đố Vui Cuối Truyện ({activeBook.quiz_data?.length || 0} câu)
            </span>
            <button
              onClick={handleAddQuiz}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-serif font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Câu Hỏi</span>
            </button>
          </div>

          <div className="space-y-6">
            {(activeBook.quiz_data || []).map((q, qIdx) => (
              <div key={qIdx} className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                  <span className="font-serif font-bold text-sm text-[var(--text-main)]">
                    Câu Hỏi {qIdx + 1}
                  </span>
                  <button onClick={() => handleDeleteQuiz(qIdx)} className="text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Nội Dung Câu Hỏi</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => handleUpdateQuizQuestion(qIdx, 'question', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm font-serif focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)]">
                        <span>Phương án {String.fromCharCode(65 + optIdx)}</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.answer_index === optIdx}
                            onChange={() => handleUpdateQuizQuestion(qIdx, 'answer_index', optIdx)}
                          />
                          <span className="text-[10px] text-emerald-600 font-bold">Đáp án đúng</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => handleUpdateQuizOption(qIdx, optIdx, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Lời Giải Thích &amp; Ý Nghĩa</label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={e => handleUpdateQuizQuestion(qIdx, 'explanation', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. TAB 4: PARENT GUIDE ── */}
      {activeTab === 'guide' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 w-full">
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-5">
            <h3 className="font-serif font-bold text-lg text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
              Cẩm Nang Dành Cho Phụ Huynh &amp; Giáo Lý Viên
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Chủ Đề Suy Niệm Đức Tin</label>
                <input
                  type="text"
                  value={activeBook.parent_guide?.moral_theme || ''}
                  onChange={e => setActiveBook(prev => ({
                    ...prev,
                    parent_guide: { ...prev.parent_guide, moral_theme: e.target.value }
                  }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Gợi Ý 3 Câu Hỏi Trò Chuyện Cùng Bé (Mỗi dòng 1 câu)</label>
                <textarea
                  rows={4}
                  value={(activeBook.parent_guide?.reflection_questions || []).join('\n')}
                  onChange={e => setActiveBook(prev => ({
                    ...prev,
                    parent_guide: {
                      ...prev.parent_guide,
                      reflection_questions: e.target.value.split('\n').filter(Boolean)
                    }
                  }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] font-serif">Lời Nguyện Gia Đình Trước Giờ Ngủ</label>
                <textarea
                  rows={3}
                  value={activeBook.parent_guide?.family_prayer || ''}
                  onChange={e => setActiveBook(prev => ({
                    ...prev,
                    parent_guide: { ...prev.parent_guide, family_prayer: e.target.value }
                  }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif focus:border-amber-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
