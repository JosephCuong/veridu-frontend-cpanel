import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      slug,
      title,
      subtitle,
      cover_image,
      testament,
      target_age,
      total_pages,
      description,
      moral_lesson,
      full_audio_url,
      music_bg_url,
      audio_timestamps,
      pages_data,
      quiz_data,
      parent_guide
    } = body;

    if (!slug || !title) {
      return NextResponse.json({ success: false, error: 'Thiếu slug hoặc tiêu đề sách tranh' }, { status: 400 });
    }

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      subtitle: subtitle || '',
      cover_image: cover_image || '/storybooks/cong-trinh-sang-tao/page_1.png',
      testament: testament || 'old_testament',
      target_age: target_age || '4-10 tuổi',
      total_pages: Number(total_pages) || (pages_data ? pages_data.length : 10),
      description: description || '',
      moral_lesson: moral_lesson || '',
      full_audio_url: full_audio_url || '',
      music_bg_url: music_bg_url || '',
      audio_timestamps: audio_timestamps || [],
      pages_data: pages_data || [],
      quiz_data: quiz_data || [],
      parent_guide: parent_guide || {},
      updated_at: new Date().toISOString()
    };

    // 1. Check if record exists by id or slug
    let query = supabase.from('storybooks').select('id');
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', payload.slug);
    }

    const { data: existingRows, error: findError } = await query;

    if (findError) {
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    let savedBook;

    if (existingRows && existingRows.length > 0) {
      // Update existing record
      const targetId = existingRows[0].id;
      const { data: updatedData, error: updateError } = await supabase
        .from('storybooks')
        .update(payload)
        .eq('id', targetId)
        .select();

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
      savedBook = updatedData?.[0] || { id: targetId, ...payload };
    } else {
      // Insert new record
      const { data: insertedData, error: insertError } = await supabase
        .from('storybooks')
        .insert({
          ...payload,
          created_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
      savedBook = insertedData?.[0] || payload;
    }

    return NextResponse.json({ success: true, book: savedBook });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
