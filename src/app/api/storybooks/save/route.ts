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

    let result;
    if (id) {
      // Update existing
      result = await supabase
        .from('storybooks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Check if slug exists
      const { data: existing } = await supabase
        .from('storybooks')
        .select('id')
        .eq('slug', payload.slug)
        .single();

      if (existing) {
        result = await supabase
          .from('storybooks')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('storybooks')
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
      }
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, book: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
