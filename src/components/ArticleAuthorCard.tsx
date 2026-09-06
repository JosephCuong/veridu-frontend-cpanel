import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthorProfile } from '@/lib/api';
import { Feather, ShieldCheck, ChevronRight, Church } from 'lucide-react';

interface ArticleAuthorCardProps {
  author: AuthorProfile;
  publishedDate?: string;
}

export default function ArticleAuthorCard({ author, publishedDate }: ArticleAuthorCardProps) {
  const displayName = author.christian_name 
    ? `${author.christian_name} ${author.full_name}` 
    : author.full_name;

  const profileHref = author.id ? `/tac-gia/${author.id}` : '/tac-gia';

  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : null;

  return (
    <section 
      aria-label="Thông tin tác giả"
      className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-card)] shadow-xl relative overflow-hidden space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <Feather className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)]">
            Thông Tin Tác Giả
          </h3>
        </div>

        <Link
          href={profileHref}
          className="inline-flex items-center gap-1 text-xs font-serif font-bold text-amber-700 dark:text-amber-400 hover:underline transition group"
        >
          <span>Hồ sơ tác giả</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Author Bio Row */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
        {/* Avatar */}
        <Link href={profileHref} className="relative group shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 shadow-lg relative overflow-hidden flex items-center justify-center group-hover:border-amber-500 transition-colors">
            {author.avatar_url ? (
              <Image 
                src={author.avatar_url} 
                alt={displayName} 
                fill 
                className="object-cover" 
                sizes="96px"
              />
            ) : (
              <span className="font-serif font-black text-2xl text-amber-700 dark:text-amber-400">
                {author.full_name ? author.full_name.charAt(0).toUpperCase() : 'V'}
              </span>
            )}
          </div>
        </Link>

        {/* Bio Details */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Link href={profileHref} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <h4 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)]">
                {displayName}
              </h4>
            </Link>

            {author.is_verified_author && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <ShieldCheck className="w-3 h-3 text-amber-500" />
                <span>{author.role || 'Tác Giả Xác Thực'}</span>
              </span>
            )}
          </div>

          {/* Diocese / Parish info if available */}
          {(author.diocese || author.parish) && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[var(--text-muted)] font-serif">
              <Church className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {author.parish ? `${author.parish}, ` : ''}
                {author.diocese || ''}
              </span>
            </div>
          )}

          {/* Bio text */}
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed line-clamp-4">
            {author.bio || 'Cộng tác viên nghiên cứu, khảo cứu thần học và linh đạo phụng vụ trên Mạng lưới Giáo lý VERIDU.'}
          </p>

          {formattedDate && (
            <p className="text-[11px] text-[var(--text-muted)] italic font-serif pt-1">
              Bài viết được biên soạn và công bố ngày {formattedDate}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
