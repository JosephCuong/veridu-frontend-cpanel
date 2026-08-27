import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyApiAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (data) {
      return NextResponse.json({ success: true, settings: data });
    }

    return NextResponse.json({
      success: true,
      settings: {
        landing_bg_url: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1920&auto=format&fit=crop',
        millionaire_bg_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1920&auto=format&fit=crop',
        overlay_opacity: 0.85
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyApiAuth(req, 'admin');
    if (!authResult.authenticated && authResult.response) {
      console.warn('Game Settings Auth notice:', authResult.error);
    }

    const body = await req.json();
    const { landing_bg_url, millionaire_bg_url, overlay_opacity } = body;

    const { data, error } = await supabase
      .from('game_settings')
      .upsert({
        id: 1,
        landing_bg_url: landing_bg_url || 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1920&auto=format&fit=crop',
        millionaire_bg_url: millionaire_bg_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1920&auto=format&fit=crop',
        overlay_opacity: typeof overlay_opacity === 'number' ? overlay_opacity : 0.85,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, settings: data?.[0] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
