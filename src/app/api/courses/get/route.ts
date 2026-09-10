import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Thiếu id hoặc slug khóa học' }, { status: 400 });
    }

    let query = supabase.from('courses').select('*, lessons(*, lesson_sections(*))');

    if (id) {
      query = query.eq('id', Number(id));
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: course, error } = await query.single();

    if (error || !course) {
      return NextResponse.json({ success: false, error: error?.message || 'Không tìm thấy khóa học' }, { status: 404 });
    }

    // Sort lessons and their sections
    const lessons = (course.lessons || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
    lessons.forEach((l: any) => {
      if (l.lesson_sections) {
        l.lesson_sections.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
      }
    });

    course.lessons = lessons;

    return NextResponse.json({
      success: true,
      course
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
