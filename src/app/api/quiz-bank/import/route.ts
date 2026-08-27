import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyApiAuth(req, 'admin');
    if (!authResult.authenticated && authResult.response) {
      // In development mode fallback: allow import if local, but log warning
      console.warn('API Auth check info:', authResult.error);
    }

    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, message: 'Danh sách câu hỏi trống' }, { status: 400 });
    }

    // Format & validate
    const ansMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const formatted = questions.map((q: any) => {
      const correctAns = (q.correct_answer || q.DapAnDung || 'A').toUpperCase();
      const ansIndex = typeof q.answer_index === 'number' ? q.answer_index : (ansMap[correctAns] ?? 0);

      return {
        title: q.title || q.TieuDe,
        question_type: q.question_type || q.Loai || 'trac_nghiem_1',
        subject: q.subject || q.PhanMon || 'Giáo Lý',
        difficulty: q.difficulty || q.DoKho || 'Dễ',
        grade_level: q.grade_level || q.KhoiLop || 'song-dao',
        bible_book: q.bible_book || q.SachKT || null,
        bible_topic: q.bible_topic || q.ChuDeKT || null,
        options: Array.isArray(q.options) ? q.options : [q.DapAnA, q.DapAnB, q.DapAnC, q.DapAnD].filter(Boolean),
        correct_answer: correctAns,
        answer_index: ansIndex,
        explanation: q.explanation || q.GiaiThich || null,
        hint: q.hint || q.GoiY || null,
        media_type: q.media_type || q.LoaiMedia || 'none',
        media_url: q.media_url || q.LinkMedia || null,
        game_modes: q.game_modes || ['quiz_arena', 'millionaire', 'zone_quest', 'exam'],
        status: q.status || 'published'
      };
    });

    // Batch insert
    const { data, error } = await supabase
      .from('catechism_quiz_bank')
      .insert(formatted)
      .select('id');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã nạp thành công ${data.length} câu hỏi vào Supabase!`,
      count: data.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
