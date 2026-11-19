import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_STORYBOOKS } from '@/lib/storybooksData';
import StorybookReaderClient from '@/components/StorybookReaderClient';

export const revalidate = 3600; // ISR 1h cache + on-demand revalidatePath on storybook save/delete

export async function generateStaticParams() {
  return DEFAULT_STORYBOOKS.map(book => ({
    slug: book.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = DEFAULT_STORYBOOKS.find(b => b.slug === slug);

  try {
    const { data: dbBook } = await supabase
      .from('storybooks')
      .select('title, subtitle, description')
      .eq('slug', slug)
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

export default async function StorybookReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = DEFAULT_STORYBOOKS.find(b => b.slug === slug);

  let book = fallback;

  try {
    const { data: dbBook } = await supabase
      .from('storybooks')
      .select('*')
      .eq('slug', slug)
      .single();

    if (dbBook) {
      book = dbBook;
    }
  } catch (e) {}

  if (!book) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';
  const pageUrl = `${siteUrl}/sach-tranh/${slug}`;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none">
      <StorybookReaderClient book={book} />
    </div>
  );
}