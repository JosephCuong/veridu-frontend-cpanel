import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, gameSlug, zoneId, stageId, stars, highScore, addXp, addManna } = body;

    if (!userId || !gameSlug) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin người chơi' }, { status: 400 });
    }

    // 1. Update Game Progress
    if (zoneId && stageId) {
      await supabase
        .from('game_progress')
        .upsert({
          user_id: userId,
          game_slug: gameSlug,
          zone_id: zoneId,
          stage_id: stageId,
          stars: stars || 3,
          high_score: highScore || 0,
          is_unlocked: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,game_slug,zone_id,stage_id' });
    }

    // 2. Update User Profile XP and Manna
    if (addXp || addManna) {
      const { data: existingProfile } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const curXp = (existingProfile?.total_xp || 0) + (addXp || 0);
      const curManna = (existingProfile?.manna || 100) + (addManna || 0);
      const calculatedLevel = Math.floor(curXp / 500) + 1;

      let title = 'Tân Tòng Nhỏ';
      if (calculatedLevel >= 10) title = 'Tiến Sĩ Hội Thánh';
      else if (calculatedLevel >= 6) title = 'Giáo Lý Viên';
      else if (calculatedLevel >= 3) title = 'Lễ Sinh Siêng Năng';
      else if (calculatedLevel >= 2) title = 'Tông Đồ Nhí';

      await supabase
        .from('game_profiles')
        .upsert({
          user_id: userId,
          level: calculatedLevel,
          total_xp: curXp,
          manna: curManna,
          current_title: title,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
