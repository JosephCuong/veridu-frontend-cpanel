'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  Loader2,
  Music,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import {
  LITURGICAL_SEASONS,
  LITURGICAL_YEARS,
  MASS_PARTS,
  SEASON_ACCENT_MAP,
  SacredMusicItem,
  getYoutubeThumbnailUrl,
} from '@/lib/sacredMusic';
import { getStoredUser, UserProfile } from '@/lib/auth';

interface FormState {
  id?: number;
  title: string;
  title_en: string;
  slug: string;
  composer: string;
  lyricist: string;
  liturgical_season: string;
  mass_part: string;
  liturgical_year: string;
  psalm_number: string;
  musical_key: string;
  voicing: string;
  youtube_url: string;
  karaoke_youtube_url: string;
  audio_url: string;
  pdf_url: string;
  pdf_drive_id: string;
  thumbnail_url: string;
  scripture_ref: string;
  scripture_book_slug: string;
  scripture_chapter: string;
  related_post_slug: string;
  lyrics: string;
  description: string;
  status: 'published' | 'draft';
  is_featured: boolean;
}

const EMPTY_FORM: FormState = {
  title: '',
  title_en: '',
  slug: '',
  composer: 'Lm. Kim Long',
  lyricist: '',
  liturgical_season: 'Thường Niên',
  mass_part: 'Đáp Ca',
  liturgical_year: 'Chung',
  psalm_number: '',
  musical_key: '',
  voicing: 'Đơn ca / Cộng đoàn',
  youtube_url: '',
  karaoke_youtube_url: '',
  audio_url: '',
  pdf_url: '',
  pdf_drive_id: '',
  thumbnail_url: '',
  scripture_ref: '',
  scripture_book_slug: 'thanh-vinh',
  scripture_chapter: '',
  related_post_slug: '',
  lyrics: '',
  description: '',
  status: 'published',
  is_featured: false,
};

export default function AdminSacredMusicPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<SacredMusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchItems = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/sacred-music/list?admin=1', {
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setErrorMsg(
          data?.error ||
            'Không thể tải danh sách Thánh Nhạc. Vui lòng đảm bảo bạn đang đăng nhập bằng tài khoản Quản Trị Viên.'
        );
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setErrorMsg('Lỗi kết nối khi tải danh sách Thánh Nhạc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getStoredUser());
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.title} ${item.composer} ${item.liturgical_season} ${item.mass_part} ${item.slug}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, searchQuery]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: SacredMusicItem) => {
    setForm({
      id: item.id,
      title: item.title || '',
      title_en: item.title_en || '',
      slug: item.slug || '',
      composer: item.composer || '',
      lyricist: item.lyricist || '',
      liturgical_season: item.liturgical_season || 'Thường Niên',
      mass_part: item.mass_part || 'Đáp Ca',
      liturgical_year: item.liturgical_year || 'Chung',
      psalm_number: item.psalm_number ? String(item.psalm_number) : '',
      musical_key: item.musical_key || '',
      voicing: item.voicing || 'Đơn ca / Cộng đoàn',
      youtube_url: item.youtube_url || '',
      karaoke_youtube_url: item.karaoke_youtube_url || '',
      audio_url: item.audio_url || '',
      pdf_url: item.pdf_url || '',
      pdf_drive_id: item.pdf_drive_id || '',
      thumbnail_url: item.thumbnail_url || '',
      scripture_ref: item.scripture_ref || '',
      scripture_book_slug: item.scripture_book_slug || '',
      scripture_chapter: item.scripture_chapter ? String(item.scripture_chapter) : '',
      related_post_slug: item.related_post_slug || '',
      lyrics: item.lyrics || '',
      description: item.description || '',
      status: item.status || 'published',
      is_featured: Boolean(item.is_featured),
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề bài Thánh Ca.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/sacred-music/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || 'Lưu bài Thánh Ca thất bại.');
        return;
      }

      setSuccessMsg(
        form.id ? 'Đã cập nhật bài Thánh Ca thành công!' : 'Đã thêm bài Thánh Ca mới thành công!'
      );
      setIsModalOpen(false);
      await fetchItems();
    } catch {
      setErrorMsg('Lỗi mạng khi lưu bài Thánh Ca.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SacredMusicItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài "${item.title}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    setDeletingId(item.id);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/sacred-music/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || 'Xóa bài Thánh Ca thất bại.');
        return;
      }
      setSuccessMsg(`Đã xóa bài "${item.title}".`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      setErrorMsg('Lỗi mạng khi xóa bài Thánh Ca.');
    } finally {
      setDeletingId(null);
    }
  };

  const previewThumb =
    form.thumbnail_url.trim() ||
    getYoutubeThumbnailUrl(form.youtube_url) ||
    getYoutubeThumbnailUrl(form.karaoke_youtube_url);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pb-20">
      {/* Header */}
      <div className="border-b border-[var(--border-card)] bg-[var(--bg-card)]/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Link href="/admin" className="inline-flex items-center gap-1 hover:text-amber-500">
                <ArrowLeft className="w-3.5 h-3.5" />
                Trung Tâm Quản Trị
              </Link>
              <span>/</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Studio Thánh Nhạc
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
              <Music className="w-6 h-6 text-purple-500" />
              <span>Quản Trị Thư Viện Thánh Nhạc</span>
            </h1>
            {user && (
              <p className="text-xs text-[var(--text-muted)]">
                Quản trị viên: <strong className="text-[var(--text-main)]">{user.email}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/thanh-nhac"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] hover:border-amber-500/50 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              Xem Trang Công Khai
            </Link>
            <button
              type="button"
              onClick={fetchItems}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-main)] hover:border-amber-500/50 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm Mới
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Thêm Bài Thánh Ca
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/35 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài Thánh Ca, nhạc sĩ, mùa lễ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
            />
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Tổng cộng: <strong className="text-[var(--text-main)]">{filteredItems.length}</strong>{' '}
            tác phẩm
          </div>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            <span className="text-sm">Đang tải danh sách Thánh Nhạc...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
            <Music className="w-10 h-10 text-amber-500/50 mx-auto" />
            <p className="text-sm text-[var(--text-muted)]">Chưa có bài Thánh Ca nào.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Thêm Bài Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredItems.map((item) => {
              const seasonStyle =
                SEASON_ACCENT_MAP[item.liturgical_season] || SEASON_ACCENT_MAP['Thường Niên'];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-24 h-14 rounded-xl overflow-hidden bg-stone-900 shrink-0 flex items-center justify-center border border-[var(--border-card)]">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-amber-400" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)] truncate">
                          {item.title}
                        </h2>
                        {item.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-500/20 text-stone-500">
                            Nháp
                          </span>
                        )}
                        {item.is_featured && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300">
                            <Sparkles className="w-2.5 h-2.5" /> Nổi bật
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="font-medium text-[var(--text-main)]/80">
                          {item.composer}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${seasonStyle.badge}`}
                        >
                          {item.liturgical_season}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-card)] text-[11px]">
                          {item.mass_part}
                        </span>
                        {item.youtube_url && (
                          <span className="inline-flex items-center gap-1 text-rose-500 text-[11px] font-medium">
                            <PlayCircle className="w-3.5 h-3.5" /> YouTube
                          </span>
                        )}
                        {item.has_pdf && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                            <FileText className="w-3.5 h-3.5" /> PDF ({item.downloads} tải)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Link
                      href={`/thanh-nhac/${item.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] hover:border-amber-500/50 text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Xem
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-semibold transition disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl">
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between">
              <h2 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-500" />
                <span>{form.id ? 'Chỉnh Sửa Bài Thánh Ca' : 'Thêm Bài Thánh Ca Mới'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Row 1: Title & EN Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Tiêu đề bài hát (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Vd: Đáp Ca Chúa Nhật I Mùa Vọng Năm B – TV 79"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Tiêu đề Tiếng Anh (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    placeholder="Vd: Responsorial Psalm - Psalm 79"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Composer, Lyricist, Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Nhạc sĩ / Tác giả
                  </label>
                  <input
                    type="text"
                    value={form.composer}
                    onChange={(e) => setForm({ ...form, composer: e.target.value })}
                    placeholder="Lm. Kim Long"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Lời ca (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={form.lyricist}
                    onChange={(e) => setForm({ ...form, lyricist: e.target.value })}
                    placeholder="Nhóm Phiên Dịch CGKPV"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Đường dẫn Slug (để trống tự tạo)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="dap-ca-thanh-vinh-79"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Liturgical Taxonomy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Mùa Phụng Vụ
                  </label>
                  <select
                    value={form.liturgical_season}
                    onChange={(e) => setForm({ ...form, liturgical_season: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  >
                    {LITURGICAL_SEASONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Phần Lễ / Thể Loại
                  </label>
                  <select
                    value={form.mass_part}
                    onChange={(e) => setForm({ ...form, mass_part: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  >
                    {MASS_PARTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Năm Phụng Vụ
                  </label>
                  <select
                    value={form.liturgical_year}
                    onChange={(e) => setForm({ ...form, liturgical_year: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  >
                    {LITURGICAL_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Psalm, Key, Voicing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Số Thánh Vịnh (nếu có)
                  </label>
                  <input
                    type="number"
                    value={form.psalm_number}
                    onChange={(e) => setForm({ ...form, psalm_number: e.target.value })}
                    placeholder="79"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Tone / Giọng
                  </label>
                  <input
                    type="text"
                    value={form.musical_key}
                    onChange={(e) => setForm({ ...form, musical_key: e.target.value })}
                    placeholder="Vd: F#m, Dm, C"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Bè / Trình bày
                  </label>
                  <input
                    type="text"
                    value={form.voicing}
                    onChange={(e) => setForm({ ...form, voicing: e.target.value })}
                    placeholder="Đơn ca / Hợp xướng 4 bè"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Row 5: Media Links */}
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Liên Kết YouTube &amp; Bản Nhạc PDF (Khóa Yêu Cầu Đăng Nhập)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Link YouTube (Bản hát mẫu)
                    </label>
                    <input
                      type="url"
                      value={form.youtube_url}
                      onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Link YouTube Karaoke / Đệm đàn (tùy chọn)
                    </label>
                    <input
                      type="url"
                      value={form.karaoke_youtube_url}
                      onChange={(e) => setForm({ ...form, karaoke_youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Link PDF Google Drive (hoặc URL PDF trực tiếp)
                    </label>
                    <input
                      type="text"
                      value={form.pdf_url}
                      onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Google Drive File ID (tự tách từ link nếu bỏ trống)
                    </label>
                    <input
                      type="text"
                      value={form.pdf_drive_id}
                      onChange={(e) => setForm({ ...form, pdf_drive_id: e.target.value })}
                      placeholder="1SUaxHYvimmHYJqGfTMmkclF1fpOvZbKt"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Ảnh bìa tùy chọn (tự lấy từ YouTube nếu trống)
                    </label>
                    <input
                      type="text"
                      value={form.thumbnail_url}
                      onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">
                      Link Audio MP3 trực tiếp (tùy chọn)
                    </label>
                    <input
                      type="url"
                      value={form.audio_url}
                      onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {previewThumb && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={previewThumb}
                      alt="Xem trước ảnh bìa"
                      className="w-28 h-16 rounded-lg object-cover border border-[var(--border-card)]"
                    />
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Ảnh bìa tự động nhận diện từ YouTube / URL tùy chỉnh
                    </span>
                  </div>
                )}
              </div>

              {/* Row 6: Cross-Links (Bible + Article) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Trích dẫn Kinh Thánh
                  </label>
                  <input
                    type="text"
                    value={form.scripture_ref}
                    onChange={(e) => setForm({ ...form, scripture_ref: e.target.value })}
                    placeholder="Tv 79:2-3, 15-19"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Slug sách Kinh Thánh
                  </label>
                  <input
                    type="text"
                    value={form.scripture_book_slug}
                    onChange={(e) => setForm({ ...form, scripture_book_slug: e.target.value })}
                    placeholder="thanh-vinh"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Chương Kinh Thánh
                  </label>
                  <input
                    type="number"
                    value={form.scripture_chapter}
                    onChange={(e) => setForm({ ...form, scripture_chapter: e.target.value })}
                    placeholder="79"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">
                    Slug bài viết liên quan
                  </label>
                  <input
                    type="text"
                    value={form.related_post_slug}
                    onChange={(e) => setForm({ ...form, related_post_slug: e.target.value })}
                    placeholder="slug-bai-viet"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Row 7: Description & Lyrics */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)]">
                  Giới thiệu &amp; Ghi chú phụng vụ
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn bối cảnh phụng vụ, gợi ý dùng trong Thánh lễ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)]">
                  Lời ca / Bản văn Đáp Ca
                </label>
                <textarea
                  rows={5}
                  value={form.lyrics}
                  onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
                  placeholder="Nhập lời đáp và các câu xướng..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:outline-none text-sm font-serif"
                />
              </div>

              {/* Row 8: Status & Featured */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border-card)]">
                <div className="flex items-center gap-5">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value === 'draft' ? 'draft' : 'published' })
                    }
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-semibold"
                  >
                    <option value="published">Công khai (Published)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>

                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="rounded border-[var(--border-card)] text-amber-600 focus:ring-amber-500"
                    />
                    <span>Ghim Nổi Bật</span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--border-card)] text-xs font-semibold hover:bg-[var(--bg-main)] transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-md transition"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{form.id ? 'Lưu Thay Đổi' : 'Xuất Bản Bài Hát'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
