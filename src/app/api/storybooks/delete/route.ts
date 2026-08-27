import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { id, slug } = await req.json();

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Thiếu ID hoặc Slug của sách' }, { status: 400 });
    }

    let query = supabase.from('storybooks').delete();
    if (id) query = query.eq('id', id);
    else if (slug) query = query.eq('slug', slug);

    const { error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
