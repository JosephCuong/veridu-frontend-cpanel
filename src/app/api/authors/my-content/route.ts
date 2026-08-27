import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Fetch posts by this author
    const { data: posts } = await supabase
      .from('posts')
      .select('id, slug, title, category, status, views, created_at, article_type')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    // Fetch library items by this author
    const { data: resources } = await supabase
      .from('library_items')
      .select('id, slug, title, category, item_type, format, status, view_count, download_count, created_at')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      posts: posts || [],
      resources: resources || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
