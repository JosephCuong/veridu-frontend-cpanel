import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(req, 'author');
    if (!auth.authenticated) {
      return auth.response!;
    }
    const supabase = getSupabaseServerClient();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID câu hỏi' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catechism_quiz_bank')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, question: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
