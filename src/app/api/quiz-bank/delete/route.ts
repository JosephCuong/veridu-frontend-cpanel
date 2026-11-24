import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(req, 'admin');
    if (!auth.authenticated) {
      return auth.response!;
    }
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID câu hỏi' }, { status: 400 });
    }

    const { error } = await supabase
      .from('catechism_quiz_bank')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa câu hỏi thành công' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
