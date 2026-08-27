import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({
      success: true,
      profile: {
        level: 1,
        total_xp: 0,
        manna: 100,
        current_title: 'Tân Tòng Nhỏ',
        badges: ['tan_tong'],
        unlocked_items: []
      }
    });
  }

  try {
    const { data, error } = await supabase
      .from('game_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return default profile
      return NextResponse.json({
        success: true,
        profile: {
          user_id: userId,
          level: 1,
          total_xp: 0,
          manna: 100,
          current_title: 'Tân Tòng Nhỏ',
          badges: ['tan_tong'],
          unlocked_items: []
        }
      });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
