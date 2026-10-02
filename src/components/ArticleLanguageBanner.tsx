'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Feather, Globe, X, CheckCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScriptureScrollIcon, ChiRhoIcon } from '@/components/icons/LiturgicalIcons';
import { useTranslation } from '@/context/LanguageContext';
import { getStoredUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface ArticleLanguageBannerProps {
  articleId?: number | string;
  articleSlug?: string;
  articleTitle?: string;
  hasManualEnglish: boolean;
  titleEn?: string | null;
  contentEn?: string | null;
  excerptEn?: string | null;
  activeLocale?: 'vi' | 'en' | 'la';
}

export default function ArticleLanguageBanner({
  articleId,
  articleSlug,
  articleTitle,
  hasManualEnglish,
  titleEn,
  contentEn,
  excerptEn,
  activeLocale,
}: ArticleLanguageBannerProps) {
  const { locale, t } = useTranslation();
  const effectiveLocale = activeLocale || locale;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Admin Quick Translate Form State
  const [adminTitleEn, setAdminTitleEn] = useState(titleEn || '');
  const [adminExcerptEn, setAdminExcerptEn] = useState(excerptEn || '');
  const [adminContentEn, setAdminContentEn] = useState(contentEn || '');
  const [isAdminSaving, setIsAdminSaving] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  // Scholar Contribution Form State
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [userTitleEn, setUserTitleEn] = useState('');
  const [userContentEn, setUserContentEn] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Check if current user is admin/author
  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      const r = (u.role || '').toLowerCase();
      if (
        r.includes('quản trị') || 
        r.includes('admin') || 
        r.includes('học giả') || 
        r.includes('tác giả') || 
        r.includes('author') || 
        r.includes('scholar')
      ) {
        setIsAdmin(true);
      }
      if (u.fullName || u.displayName) {
        setContributorName(u.fullName || u.displayName || '');
      }
      if (u.email) {
        setContributorEmail(u.email);
      }
    }
  }, []);

  // Update initial form state when props change
  useEffect(() => {
    if (titleEn) setAdminTitleEn(titleEn);
    if (excerptEn) setAdminExcerptEn(excerptEn);
    if (contentEn) setAdminContentEn(contentEn);
  }, [titleEn, excerptEn, contentEn]);

  // Only display banner when reader is browsing in English or Latin mode
  if (effectiveLocale === 'vi') return null;

  // Handle Admin Quick Translation Save
  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return;
    if (!adminTitleEn.trim() || !adminContentEn.trim()) {
      setAdminErrorMsg('Vui lòng nhập cả Tiêu đề tiếng Anh và Nội dung bản dịch.');
      return;
    }

    setIsAdminSaving(true);
    setAdminErrorMsg('');
    setAdminSuccessMsg('');

    try {
      let authToken: string | undefined;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        authToken = sessionData?.session?.access_token;
      } catch (e) {}

      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        reqHeaders['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/posts/update', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          id: articleId,
          title_en: adminTitleEn.trim(),
          excerpt_en: adminExcerptEn.trim(),
          content_en: adminContentEn,
          available_languages: ['vi', 'en'],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi khi cập nhật bản dịch.');
      }

      setAdminSuccessMsg('Xuất bản bản dịch tiếng Anh thành công!');
      setTimeout(() => {
        setShowAdminModal(false);
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setAdminErrorMsg(err.message || 'Lỗi khi lưu bản dịch.');
    } finally {
      setIsAdminSaving(false);
    }
  };

  // Handle Scholar Contribution Submission
  const handleScholarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName.trim() || !contributorEmail.trim()) {
      setSubmitError('Vui lòng điền Họ tên và Email liên hệ.');
      return;
    }
    if (!userTitleEn.trim() || !userContentEn.trim()) {
      setSubmitError('Vui lòng nhập Tiêu đề và Nội dung bản dịch.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/translations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          article_slug: articleSlug,
          article_title_vi: articleTitle,
          contributor_name: contributorName.trim(),
          contributor_email: contributorEmail.trim(),
          title_en: userTitleEn.trim(),
          content_en: userContentEn,
          notes: userNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi khi gửi bản dịch.');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi khi gửi bản dịch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {hasManualEnglish ? (
        /* TRƯỜNG HỢP 1: BÀI ĐÃ CÓ BẢN DỊCH TIẾNG ANH HỌC THUẬT */
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-serif font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('article.manual_en_available', 'Scholarly English Translation')}</span>
              </div>
              <div className="text-xs text-slate-300 font-sans mt-0.5">
                {titleEn ? `“${titleEn}”` : 'Canonical translation authorized by the VERIDU Editorial Board.'}
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Cập nhật nhanh bản dịch tiếng Anh"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Chỉnh Sửa Bản Dịch</span>
            </button>
          )}
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: BÀI CHƯA CÓ BẢN DỊCH TIẾNG ANH */
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
              <ScriptureScrollIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ChiRhoIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('article.scholarly_edition', 'Original Vietnamese Edition')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-xl">
                An official scholarly English translation for this treatise is currently in preparation. The text below is presented in its original Vietnamese scholarly formulation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto pt-2 md:pt-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>✍️ Cung Cấp Bản Dịch Tiếng Anh</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowContributeModal(true);
                  setSubmitSuccess(false);
                  setSubmitError('');
                }}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <ScriptureScrollIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Đóng Góp Bản Dịch Học Thuật</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: ADMIN QUICK TRANSLATE MODAL ───────────────────────── */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Biên Dịch Tiếng Anh Cho Bài Viết #{articleId}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Bản gốc: {articleTitle || 'Bài viết'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{adminSuccessMsg}</span>
              </div>
            )}

            {adminErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {adminErrorMsg}
              </div>
            )}

            <form onSubmit={handleAdminSave} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  Tiêu Đề Tiếng Anh (English Title) *
                </label>
                <input
                  type="text"
                  required
                  value={adminTitleEn}
                  onChange={(e) => setAdminTitleEn(e.target.value)}
                  placeholder="e.g. Who Was Saint Augustine of Hippo?"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  Tóm Tắt Tiếng Anh (English Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={adminExcerptEn}
                  onChange={(e) => setAdminExcerptEn(e.target.value)}
                  placeholder="A concise scholarly overview of this treatise in English..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  Nội Dung Tiếng Anh (English Content - HTML / Markdown) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={adminContentEn}
                  onChange={(e) => setAdminContentEn(e.target.value)}
                  placeholder="Paste or write the scholarly English translation here..."
                  className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white font-mono text-xs outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  disabled={isAdminSaving}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-serif transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAdminSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAdminSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Feather className="w-4 h-4" />}
                  <span>Lưu & Xuất Bản Bản Dịch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: SCHOLAR CONTRIBUTION MODAL ───────────────────────── */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <ScriptureScrollIcon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Đóng Góp Bản Dịch Tiếng Anh
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Bài viết: {articleTitle || 'Bài viết VERIDU'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContributeModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-xl text-white">
                  Đã Gửi Bản Dịch Thành Công!
                </h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Chân thành cảm ơn đóng góp học thuật quý báu của bạn. Ban Học Vụ và Biên Tập VERIDU sẽ tiến hành thẩm định và xuất bản bản dịch tiếng Anh cho bài viết này trong thời gian sớm nhất.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContributeModal(false)}
                    className="px-6 py-2.5 rounded-full bg-amber-500 text-slate-950 font-serif font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    Đóng Hộp Thoại
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleScholarSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1.5">
                      Họ Tên / Bút Danh Người Dịch *
                    </label>
                    <input
                      type="text"
                      required
                      value={contributorName}
                      onChange={(e) => setContributorName(e.target.value)}
                      placeholder="e.g. John Doe / Maria Nguyen"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1.5">
                      Email Liên Hệ *
                    </label>
                    <input
                      type="email"
                      required
                      value={contributorEmail}
                      onChange={(e) => setContributorEmail(e.target.value)}
                      placeholder="e.g. scholar@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-300 mb-1.5">
                    Tiêu Đề Bản Dịch Tiếng Anh *
                  </label>
                  <input
                    type="text"
                    required
                    value={userTitleEn}
                    onChange={(e) => setUserTitleEn(e.target.value)}
                    placeholder="e.g. The Historical Reality of the Resurrection of Christ"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-300 mb-1.5">
                    Nội Dung Bản Dịch Tiếng Anh (English Content) *
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={userContentEn}
                    onChange={(e) => setUserContentEn(e.target.value)}
                    placeholder="Dán hoặc viết bản dịch tiếng Anh của bạn tại đây..."
                    className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-300 mb-1.5">
                    Ghi Chú Học Thuật / Nguồn Tham Chiếu (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. Bản dịch đối chiếu theo bản NABRE / RSV-CE và Chú giải Navarre"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContributeModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-serif transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Feather className="w-4 h-4" />}
                    <span>Gửi Ban Biên Tập Thẩm Định</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
