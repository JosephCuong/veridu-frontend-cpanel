import React from 'react';
import Image from 'next/image';
import { fetchCharacters } from '@/lib/api';
import { BookOpen, Sparkles, User, BookMarked, Target } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // Cache for 1 hour

export default async function CharactersPage() {
  const characters = await fetchCharacters();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 flex flex-col font-sans pt-24 sm:pt-28 md:pt-36 pb-16">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hệ Thống Nhân Vật
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)]">
            Nhân Vật Kinh Thánh
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Khám phá tiểu sử, vai trò và ý nghĩa thần học của các nhân vật quan trọng trong Lịch sử Cứu Độ.
          </p>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)]">
            <User className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-muted)]">Chưa có dữ liệu nhân vật. Vui lòng cập nhật từ hệ thống.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <div key={char.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 hover:border-amber-500/50 hover:shadow-xl transition-all flex flex-col h-full space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-amber-500 relative">
                    {char.avatar_url ? (
                      <Image src={char.avatar_url} alt={char.name} fill className="object-cover" sizes="(max-width: 64px) 100vw, 64px" />
                    ) : (
                      <User className="w-8 h-8 opacity-50" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">{char.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {char.role && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-wider">{char.role}</span>}
                      {char.era && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">{char.era}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: char.biography || '' }} />

                {char.theology && (
                  <div className="pt-4 border-t border-[var(--border-card)]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                      <Target className="w-3.5 h-3.5" /> Bài Học Thần Học
                    </div>
                    <p className="text-sm italic text-[var(--text-main)] line-clamp-2">{char.theology}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
