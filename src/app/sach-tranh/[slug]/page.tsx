import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import StorybookReaderClient from '@/components/StorybookReaderClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: book } = await supabase
    .from('storybooks')
    .select('title, subtitle, description')
    .eq('slug', params.slug)
    .single();

  if (!book) return { title: 'Sách Tranh Kinh Thánh | VERIDU' };

  return {
    title: `${book.title} — Sách Tranh Kinh Thánh Thiếu Nhi | VERIDU`,
    description: book.description || book.subtitle
  };
}

export default async function StorybookReaderPage({ params }: { params: { slug: string } }) {
  const { data: book } = await supabase
    .from('storybooks')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none">
      <StorybookReaderClient book={book} />
    </div>
  );
}
