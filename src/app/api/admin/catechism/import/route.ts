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
        .eq('part_number', part)
        .range(0, 2000);

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
    // 1. Verify admin permissions or internal admin token
    const adminKey = req.headers.get('x-admin-key');
    const isValidAdminKey = adminKey === 'veridu-catechism-secure-seed-2026';

    if (!isValidAdminKey) {
      const authResult = await verifyApiAuth(req, 'admin');
      if (!authResult.authenticated) {
        return NextResponse.json({ 
          success: false, 
          error: 'Chưa được cấp quyền truy cập tính năng nạp cơ sở dữ liệu.' 
        }, { status: 401 });
      }
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

    // 3. Batch processing: Check existing to insert or update safely
    const BATCH_SIZE = 50;
    let totalInserted = 0;
    let totalUpdated = 0;

    for (let i = 0; i < formatted.length; i += BATCH_SIZE) {
      const batch = formatted.slice(i, i + BATCH_SIZE);
      const batchNums = batch
        .map((b: any) => b.paragraph_number)
        .filter((n: any) => typeof n === 'number' && !isNaN(n));

      // Query which paragraph numbers already exist in this batch
      const { data: existingData, error: queryError } = await supabase
        .from('catechism_paragraphs')
        .select('id, paragraph_number')
        .in('paragraph_number', batchNums);

      if (queryError) {
        console.error('Batch query error at index', i, queryError);
        return NextResponse.json({ 
          success: false, 
          error: queryError.message, 
          insertedSoFar: totalInserted 
        }, { status: 500 });
      }

      const existingMap = new Map((existingData || []).map((d: any) => [d.paragraph_number, d.id]));

      const toInsert = batch.filter((b: any) => !existingMap.has(b.paragraph_number));
      const toUpdate = batch.filter((b: any) => existingMap.has(b.paragraph_number));

      // Execute insertions
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('catechism_paragraphs')
          .insert(toInsert);

        if (insertError) {
          console.error('Batch insert error at index', i, insertError);
          return NextResponse.json({ 
            success: false, 
            error: insertError.message, 
            insertedSoFar: totalInserted 
          }, { status: 500 });
        }
        totalInserted += toInsert.length;
      }

      // Execute updates for existing records
      for (const item of toUpdate) {
        const existingId = existingMap.get(item.paragraph_number);
        if (existingId) {
          const { error: updateError } = await supabase
            .from('catechism_paragraphs')
            .update(item)
            .eq('id', existingId);

          if (!updateError) {
            totalUpdated += 1;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã nạp thành công ${totalInserted} điều khoản mới và cập nhật ${totalUpdated} điều khoản!`,
      inserted: totalInserted,
      updated: totalUpdated
    });
  } catch (error: any) {
    console.error('Catechism Import API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
