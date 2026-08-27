import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_STORYBOOKS } from '@/lib/storybooksData';
import StorybookReaderClient from '@/components/StorybookReaderClient';

export const revalidate = 60;

export async function generateStaticParams() {
  return DEFAULT_STORYBOOKS.map(book => ({
    slug: book.slug
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const fallback = DEFAULT_STORYBOOKS.find(b => b.slug === params.slug);

  try {
    const { data: dbBook } = await supabase
      .from('storybooks')
      .select('title, subtitle, description')
      .eq('slug', params.slug)
      .single();

    const book = dbBook || fallback;
    if (!book) return { title: 'Sách Tranh Kinh Thánh | VERIDU' };

    return {
      title: `${book.title} — Sách Tranh Kinh Thánh Thiếu Nhi | VERIDU`,
      description: book.description || book.subtitle
    };
  } catch (e) {
    if (!fallback) return { title: 'Sách Tranh Kinh Thánh | VERIDU' };
    return {
      title: `${fallback.title} — Sách Tranh Kinh Thánh Thiếu Nhi | VERIDU`,
      description: fallback.description || fallback.subtitle
    };
  }
}

export default async function StorybookReaderPage({ params }: { params: { slug: string } }) {
  const fallback = DEFAULT_STORYBOOKS.find(b => b.slug === params.slug);

  let book = fallback;

  try {
    const { data: dbBook } = await supabase
      .from('storybooks')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (dbBook) {
      book = dbBook;
    }
  } catch (e) {}

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none">
      <StorybookReaderClient book={book} />
    </div>
  );
}
