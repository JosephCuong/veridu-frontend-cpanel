import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    try {
      revalidatePath('/sach-tranh');
      if (slug) revalidatePath(`/sach-tranh/${slug}`);
    } catch (e) {
      console.warn('Storybook delete cache revalidation warning:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
