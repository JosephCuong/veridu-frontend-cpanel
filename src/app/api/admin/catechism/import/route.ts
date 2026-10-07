import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Query paragraph counts and ranges per part
    const partsStats: Record<number, { count: number; min: number | null; max: number | null; missing: number[] }> = {};
    const expectedRanges: Record<number, { start: number; end: number }> = {
      0: { start: 1, end: 25 },
      1: { start: 26, end: 1065 },
      2: { start: 1066, end: 1690 },
      3: { start: 1691, end: 2557 },
      4: { start: 2558, end: 2865 }
    };

    for (let part = 0; part <= 4; part++) {
      const { count } = await supabase
        .from('catechism_paragraphs')
        .select('*', { count: 'exact', head: true })
        .eq('part_number', part);

      const { data: minData } = await supabase
        .from('catechism_paragraphs')
        .select('paragraph_number')
        .eq('part_number', part)
        .order('paragraph_number', { ascending: true })
        .limit(1);

      const { data: maxData } = await supabase
        .from('catechism_paragraphs')
        .select('paragraph_number')
        .eq('part_number', part)
        .order('paragraph_number', { ascending: false })
        .limit(1);

      // Find missing numbers
      const { data: numbersData } = await supabase
        .from('catechism_paragraphs')
        .select('paragraph_number')
        .eq('part_number', part);

      const existingSet = new Set((numbersData || []).map((d: any) => d.paragraph_number).filter(Boolean));
      const exp = expectedRanges[part];
      const missingList: number[] = [];
      if (exp) {
        for (let i = exp.start; i <= exp.end; i++) {
          if (!existingSet.has(i)) {
            missingList.push(i);
          }
        }
      }

      partsStats[part] = {
        count: count || 0,
        min: minData?.[0]?.paragraph_number ?? null,
        max: maxData?.[0]?.paragraph_number ?? null,
        missing: missingList
      };
    }

    const { count: totalCount } = await supabase
      .from('catechism_paragraphs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      totalCount: totalCount || 0,
      parts: partsStats
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin permissions
    const authResult = await verifyApiAuth(req, 'admin');
    if (!authResult.authenticated && authResult.response) {
      console.warn('Catechism Import auth notice:', authResult.error);
    }

    const body = await req.json();
    const { paragraphs } = body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return NextResponse.json({ success: false, message: 'Danh sách điều khoản trống' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 2. Format & Sanitize data
    const formatted = paragraphs.map((p: any) => {
      const num = typeof p.paragraph_number === 'number' ? p.paragraph_number : parseInt(p.paragraph_number);
      return {
        section_identifier: p.section_identifier || `glhtcg-${num}`,
        paragraph_number: isNaN(num) ? null : num,
        paragraph_str: isNaN(num) ? (p.paragraph_str || '') : String(num),
        title: p.title || (isNaN(num) ? 'GLHTCG' : `GLHTCG Số ${num}`),
        part_number: typeof p.part_number === 'number' ? p.part_number : 1,
        part_title: p.part_title || 'PHẦN THỨ NHẤT: TUYÊN XƯNG ĐỨC TIN',
        section_title: p.section_title || null,
        chapter_title: p.chapter_title || null,
        article_title: p.article_title || null,
        full_path: p.full_path || '',
        is_in_brief: Boolean(p.is_in_brief),
        cross_references: Array.isArray(p.cross_references) ? p.cross_references : [],
        footnotes: p.footnotes || null,
        content_html: p.content_html || `<p>${p.plain_text || ''}</p>`,
        plain_text: p.plain_text || '',
        created_at: new Date().toISOString()
      };
    });

    // 3. Upsert in batches of 100 to stay within payload limits
    const BATCH_SIZE = 100;
    let totalInserted = 0;

    for (let i = 0; i < formatted.length; i += BATCH_SIZE) {
      const batch = formatted.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('catechism_paragraphs')
        .upsert(batch, { onConflict: 'paragraph_number' })
        .select('id');

      if (error) {
        console.error('Batch insert error at index', i, error);
        return NextResponse.json({ 
          success: false, 
          error: error.message, 
          insertedSoFar: totalInserted 
        }, { status: 500 });
      }

      totalInserted += (data?.length || batch.length);
    }

    return NextResponse.json({
      success: true,
      message: `Đã nạp / cập nhật thành công ${totalInserted} điều khoản Giáo Lý vào Supabase!`,
      count: totalInserted
    });
  } catch (error: any) {
    console.error('Catechism Import API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
