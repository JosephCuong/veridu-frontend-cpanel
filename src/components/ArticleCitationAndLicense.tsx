'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Quote, 
  Copy, 
  Check, 
  Scale, 
  ShieldCheck, 
  ExternalLink,
  Info
} from 'lucide-react';

interface ArticleCitationAndLicenseProps {
  title: string;
  authorName: string;
  publishedDate?: string;
  url: string;
}

export default function ArticleCitationAndLicense({
  title,
  authorName,
  publishedDate,
  url
}: ArticleCitationAndLicenseProps) {
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  const cleanTitle = title.replace(/<[^>]+>/g, '').trim();
  const dateObj = publishedDate ? new Date(publishedDate) : new Date();
  
  const year = dateObj.getFullYear();
  const day = String(dateObj.getDate()).padStart(2, '0');
  const monthNamesVi = [
    'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
    'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
  ];
  const monthStr = monthNamesVi[dateObj.getMonth()];
  const formattedDateVi = `${day} ${monthStr}, ${year}`;

  // Name splitting for academic formats
  const nameParts = authorName.trim().split(' ');
  const lastName = nameParts[nameParts.length - 1] || authorName;
  const initials = nameParts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');

  // 3 International Academic Citation Standards
  const citations = [
    {
      id: 'apa',
      name: 'APA Style',
      text: `${lastName}, ${initials} (${year}, ${day} ${monthStr}). ${cleanTitle}. VERIDU - Mạng Lưới Giáo Lý & Thần Học Công Giáo. ${url}`
    },
    {
      id: 'chicago',
      name: 'Chicago Style',
      text: `${authorName}. "${cleanTitle}." VERIDU, ${day} ${monthStr} ${year}. ${url}.`
    },
    {
      id: 'mla',
      name: 'MLA Style',
      text: `${authorName}. "${cleanTitle}." VERIDU, ${day} ${monthStr} ${year}, ${url}.`
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStyle(id);
    setTimeout(() => {
      setCopiedStyle(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. CITE THIS WORK (TRÍCH DẪN BÀI VIẾT) ── */}
      <section 
        aria-label="Trích dẫn bài viết"
        className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-card)] shadow-xl relative overflow-hidden space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)]">
              Trích Dẫn Bài Viết (Cite This Work)
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-serif">
              Chuẩn trích dẫn học thuật dành cho nghiên cứu, giáo án và tham khảo thần học
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {citations.map((cite) => {
            const isCopied = copiedStyle === cite.id;

            return (
              <div 
                key={cite.id} 
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/40 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
                    {cite.name}
                  </span>

                  <button
                    onClick={() => handleCopy(cite.id, cite.text)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-serif font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/50'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Đã Sao Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sao Chép</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed select-all break-words">
                  {cite.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. LICENSE & COPYRIGHT (GIẤY PHÉP VÀ BẢN QUYỀN) ── */}
      <section 
        aria-label="Giấy phép và bản quyền"
        className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-card)] shadow-xl relative overflow-hidden space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)]">
            Giấy Phép &amp; Bản Quyền (License &amp; Copyright)
          </h3>
        </div>

        <div className="text-xs text-[var(--text-muted)] font-serif leading-relaxed space-y-3 pt-1">
          <p>
            Bài viết được biên soạn bởi <strong className="text-[var(--text-main)]">{authorName}</strong>, phát hành trên nền tảng VERIDU vào ngày <strong className="text-[var(--text-main)]">{formattedDateVi}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 text-[var(--text-main)] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Giấy Phép Creative Commons: CC BY-NC-SA 4.0</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Nội dung này được phân phối theo giấy phép <strong className="text-[var(--text-main)]">Ghi nhận công của tác giả - Phi thương mại - Chia sẻ tương tự 4.0 Quốc tế</strong>. Quý độc giả và giáo lý viên được tự do sao chép, trích dẫn và phân phối lại cho mục đích học tập, phụng vụ hoặc nghiên cứu phi thương mại, với điều kiện phải ghi rõ nguồn tác giả và đặt liên kết dẫn trực tiếp về bài viết gốc trên VERIDU.
            </p>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] italic">
            Mọi yêu cầu xuất bản ấn phẩm thương mại hoặc in ấn số lượng lớn, xin vui lòng xem thêm tại{' '}
            <Link href="/dieu-khoan-tac-gia" className="text-amber-600 dark:text-amber-400 underline hover:text-amber-500">
              Điều Khoản Tác Giả &amp; Bản Quyền
            </Link>{' '}
            hoặc liên hệ Ban Biên Tập VERIDU.
          </p>
        </div>
      </section>
    </div>
  );
}
