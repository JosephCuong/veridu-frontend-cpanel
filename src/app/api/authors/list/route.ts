import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, christian_name, avatar_url, role, diocese, parish, bio, specialty, is_verified_author, created_at')
      .or('is_verified_author.eq.true,role.in.(admin,scholar,author,catechist,"Giáo Lý Viên","Học Giả VERIDU","Quản Trị Viên")')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
