import { redirect } from 'next/navigation';

export default function DangBaiPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const query = new URLSearchParams();
  Object.entries(searchParams || {}).forEach(([key, val]) => {
    if (typeof val === 'string') query.set(key, val);
  });
  const qs = query.toString();
  redirect(qs ? `/soan-bai?${qs}` : '/soan-bai');
}
