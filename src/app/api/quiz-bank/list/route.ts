import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const gradeLevel = searchParams.get('grade_level');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('catechism_quiz_bank')
      .select('*', { count: 'exact' });

    if (subject && subject !== 'all') {
      query = query.eq('subject', subject);
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    if (gradeLevel && gradeLevel !== 'all') {
      query = query.eq('grade_level', gradeLevel);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('id', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      questions: data || [],
      total: count || 0,
      page,
      limit
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
