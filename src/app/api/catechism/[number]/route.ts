import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';



export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const num = parseInt(params.number);
    if (isNaN(num)) {
      return NextResponse.json({ error: 'Invalid number' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catechism_paragraphs')
      .select('*')
      .eq('paragraph_number', num)
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
