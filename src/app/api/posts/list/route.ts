import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, category, article_type, featured_image, created_at, status, views, author_id')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase list posts error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (err: any) {
    console.error('API /api/posts/list error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
