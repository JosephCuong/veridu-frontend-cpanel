import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    const defaultSettings = {
      landing_bg_url: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1920&auto=format&fit=crop',
      millionaire_bg_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1920&auto=format&fit=crop',
      overlay_opacity: 0.85
    };

    if (error || !data) {
      return NextResponse.json({ success: true, settings: defaultSettings });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { landing_bg_url, millionaire_bg_url, overlay_opacity } = body;

    const { data, error } = await supabase
      .from('game_settings')
      .upsert({
        id: 'global',
        landing_bg_url: landing_bg_url || 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1920&auto=format&fit=crop',
        millionaire_bg_url: millionaire_bg_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1920&auto=format&fit=crop',
        overlay_opacity: typeof overlay_opacity === 'number' ? overlay_opacity : 0.85,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
