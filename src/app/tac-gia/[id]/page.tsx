import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Feather, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  UploadCloud, 
  ArrowLeft, 
  Eye, 
  Download, 
  ChevronRight,
  Cross
} from 'lucide-react';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, christian_name, role, specialty, bio')
    .eq('id', params.id)
    .single();

  if (!profile) return { title: 'Tác Giả VERIDU' };
  const name = profile.christian_name ? `${profile.christian_name} ${profile.full_name}` : (profile.full_name || 'Tác Giả');
  return {
    title: `${name} — Tác Giả & Học Giả | VERIDU`,
    description: profile.bio || `Hồ sơ tác giả ${name} trên Mạng lưới Giáo lý & Thần học VERIDU.`
  };
}

export default async function AuthorProfilePage({ params }: { params: { id: string } }) {
  // Fetch author profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch author published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, category, created_at, views')
    .eq('author_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Fetch author published resources
  const { data: resources } = await supabase
    .from('library_items')
    .select('id, slug, title, category, item_type, format, view_count, download_count, created_at')
    .eq('author_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const authorName = profile.christian_name ? `${profile.christian_name} ${profile.full_name}` : (profile.full_name || 'Tác Giả');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* Top Breadcrumb */}
      <div className="w-full border-b border-[var(--border-card)] bg-[var(--bg-card)]/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/tac-gia"
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mạng Lưới Tác Giả</span>
          </Link>

          <div className="text-xs font-serif">
            <span className="text-[var(--text-muted)]">Hồ Sơ Tác Giả › </span>
            <strong className="text-amber-500">{authorName}</strong>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 w-full space-y-8">
        
        {/* Author Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left backdrop-blur-xl">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 font-serif font-black text-3xl shrink-0 overflow-hidden relative shadow-lg">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={authorName} fill className="object-cover" />
            ) : (
              <span>{authorName[0]}</span>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                {authorName}
              </h1>
              {profile.is_verified_author && (
                <span title="Tác giả được xác thực">
                  <ShieldCheck className="w-6 h-6 text-amber-500" />
                </span>
              )}

            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                {profile.specialty || profile.role || 'Cộng Tác Viên'}
              </span>
              {profile.diocese && (
                <span className="text-[var(--text-muted)] font-serif">
                  {profile.diocese} {profile.parish ? `• ${profile.parish}` : ''}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm font-serif text-[var(--text-muted)] leading-relaxed max-w-3xl pt-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Author Works Grid (Posts & Resources) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Published Articles */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>Bài Viết &amp; Chuyên Khảo ({posts?.length || 0})</span>
              </h3>
            </div>

            {posts && posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map(p => (
                  <Link
                    key={p.id}
                    href={`/${p.slug}`}
                    className="block p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/50 transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold">{p.category}</span>
                      <span className="text-[var(--text-muted)]">{p.views || 0} lượt xem</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[var(--text-main)] group-hover:text-amber-500 transition-colors line-clamp-2">
                      {p.title}
                    </h4>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Tác giả chưa xuất bản bài viết nào.</p>
            )}
          </div>

          {/* Shared Resources */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-500" />
                <span>Sách &amp; Giáo Án Chia Sẻ ({resources?.length || 0})</span>
              </h3>
            </div>

            {resources && resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map(r => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-serif font-bold text-sm text-[var(--text-main)] block">
                        {r.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 font-bold">{r.format || 'PDF'}</span>
                        <span>• {r.download_count || 0} lượt tải</span>
                      </div>
                    </div>

                    <Link
                      href={`/thu-vien/${r.item_type === 'sach' ? 'sach' : 'tai-lieu'}/${r.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Xem</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-serif text-[var(--text-muted)] py-4 text-center">Tác giả chưa chia sẻ tài liệu nào.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
