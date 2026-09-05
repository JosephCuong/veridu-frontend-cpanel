import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

interface LocationPayload {
  id: string;
  name: string;
  ancient_name?: string;
  latitude: number;
  longitude: number;
  biblical_references?: string[];
  historical_period?: string;
  archaeological_evidence?: string;
  description?: string;
}

interface TimelinePayload {
  id: string;
  year_bce_ce: number;
  display_date: string;
  event_title: string;
  biblical_anchor?: string;
  archaeological_anchor?: string;
  significance?: string;
}

function determineEraAndCategory(year: number): { era_id: string; era_name: string; category: string } {
  if (year <= -2000) {
    return { era_id: 'era-1', era_name: 'Khởi Nguyên Sáng Tạo & Tiền Lịch Sử', category: 'cuu-uoc' };
  } else if (year <= -1300) {
    return { era_id: 'era-2', era_name: 'Thời Kỳ Các Tổ Phụ & Xuất Hành', category: 'cuu-uoc' };
  } else if (year <= -1000) {
    return { era_id: 'era-3', era_name: 'Thời Kỳ Thủ Lãnh & Lập Quốc', category: 'cuu-uoc' };
  } else if (year <= -586) {
    return { era_id: 'era-4', era_name: 'Thời Kỳ Các Vua & Ngôn Sứ', category: 'cuu-uoc' };
  } else if (year < 0) {
    return { era_id: 'era-5', era_name: 'Lưu Đày & Thời Kỳ Giữa Hai Giao Ước (Second Temple)', category: 'cuu-uoc' };
  } else if (year <= 100) {
    return { era_id: 'era-6', era_name: 'Thời Đại Đức Giêsu Kitô & Các Tông Đồ', category: 'tan-uoc' };
  } else {
    return { era_id: 'era-7', era_name: 'Lịch Sử Hội Thánh & Năm Thánh Toàn Cầu', category: 'giao-hoi' };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { article_slug, locations = [], timeline_events = [] } = body;

    if (!article_slug || typeof article_slug !== 'string') {
      return NextResponse.json({ error: 'Thiếu hoặc sai định dạng article_slug' }, { status: 400 });
    }

    const processedLocations: any[] = [];
    const processedTimeline: any[] = [];

    // ─────────────────────────────────────────────────────────────
    // 1. XỬ LÝ ĐỊA DANH (MAP LOCATIONS) VỚI SMART MERGE
    // ─────────────────────────────────────────────────────────────
    for (const loc of locations as LocationPayload[]) {
      if (!loc.name || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
        continue;
      }

      // Tìm xem địa danh đã tồn tại chưa:
      // Tiêu chí 1: Trùng tọa độ trong bán kính ~1.5km (sai số 0.015 độ)
      // Tiêu chí 2: Trùng slug hoặc tên
      const { data: existingList } = await supabase
        .from('map_locations')
        .select('*');

      let matchedLoc = null;
      if (existingList && existingList.length > 0) {
        matchedLoc = existingList.find((dbItem: any) => {
          const latDiff = Math.abs(Number(dbItem.latitude) - loc.latitude);
          const lngDiff = Math.abs(Number(dbItem.longitude) - loc.longitude);
          const isCoordClose = latDiff < 0.015 && lngDiff < 0.015;
          const isSlugMatch = dbItem.slug === loc.id;
          const isNameMatch = dbItem.name && dbItem.name.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]);
          return isCoordClose || isSlugMatch || (isNameMatch && latDiff < 0.05 && lngDiff < 0.05);
        });
      }

      if (matchedLoc) {
        // SMART MERGE: Địa danh đã tồn tại -> Gộp thêm article_slug và biblical_references
        const currentSlugs: string[] = Array.isArray(matchedLoc.article_slugs) ? matchedLoc.article_slugs : [];
        if (!currentSlugs.includes(article_slug)) {
          currentSlugs.push(article_slug);
        }

        const currentRefs: string[] = Array.isArray(matchedLoc.bible_references) ? matchedLoc.bible_references : [];
        const newRefs = loc.biblical_references || [];
        const mergedRefs = Array.from(new Set([...currentRefs, ...newRefs]));

        const updatePayload: any = {
          article_slugs: currentSlugs,
          bible_references: mergedRefs,
        };

        if (loc.ancient_name && !matchedLoc.ancient_name) updatePayload.ancient_name = loc.ancient_name;
        if (loc.historical_period && !matchedLoc.historical_period) updatePayload.historical_period = loc.historical_period;
        if (loc.archaeological_evidence) {
          updatePayload.archaeological_evidence = matchedLoc.archaeological_evidence 
            ? `${matchedLoc.archaeological_evidence} | ${loc.archaeological_evidence}`
            : loc.archaeological_evidence;
        }

        await supabase
          .from('map_locations')
          .update(updatePayload)
          .eq('id', matchedLoc.id);

        processedLocations.push({ id: matchedLoc.id, action: 'merged', name: matchedLoc.name });
      } else {
        // CREATE NEW LOCATION
        const insertPayload: any = {
          slug: loc.id || `loc-${Date.now()}`,
          name: loc.name,
          ancient_name: loc.ancient_name || '',
          latitude: loc.latitude,
          longitude: loc.longitude,
          bible_references: loc.biblical_references || [],
          historical_period: loc.historical_period || '',
          archaeological_evidence: loc.archaeological_evidence || '',
          description: loc.description || '',
          summary: loc.description || '',
          article_slugs: [article_slug],
          importance_level: 2,
          region: 'Thánh Địa (Holy Land)',
          testament: loc.latitude < 30 ? 'cuu-uoc' : 'tan-uoc',
          era: loc.historical_period || 'Kinh Thánh'
        };

        const { data: newLoc } = await supabase
          .from('map_locations')
          .insert(insertPayload)
          .select()
          .maybeSingle();

        processedLocations.push({ id: newLoc?.id || 'new', action: 'created', name: loc.name });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. XỬ LÝ DÒNG THỜI GIAN (TIMELINE EVENTS)
    // ─────────────────────────────────────────────────────────────
    for (const evt of timeline_events as TimelinePayload[]) {
      if (!evt.event_title || typeof evt.year_bce_ce !== 'number') {
        continue;
      }

      const eraInfo = determineEraAndCategory(evt.year_bce_ce);
      const eventSlug = evt.id || `evt-${Date.now()}-${Math.abs(evt.year_bce_ce)}`;

      // Kiểm tra xem sự kiện của bài viết này đã có chưa
      const { data: existingEvt } = await supabase
        .from('timeline_events')
        .select('id, slug')
        .eq('slug', eventSlug)
        .maybeSingle();

      const timelinePayload: any = {
        slug: eventSlug,
        order_year: evt.year_bce_ce,
        year_label: evt.display_date || (evt.year_bce_ce < 0 ? `${Math.abs(evt.year_bce_ce)} TCN` : `${evt.year_bce_ce} SCN`),
        title: evt.event_title,
        subtitle: evt.biblical_anchor || '',
        biblical_anchor: evt.biblical_anchor || '',
        archaeological_anchor: evt.archaeological_anchor || '',
        significance: evt.significance || '',
        summary: evt.significance || evt.event_title,
        description: evt.archaeological_anchor || '',
        content: evt.significance || '',
        theology: evt.significance || '',
        article_slug: article_slug,
        era_id: eraInfo.era_id,
        era_name: eraInfo.era_name,
        category: eraInfo.category,
      };

      if (existingEvt) {
        await supabase
          .from('timeline_events')
          .update(timelinePayload)
          .eq('id', existingEvt.id);
        processedTimeline.push({ id: existingEvt.id, action: 'updated', title: evt.event_title });
      } else {
        const { data: newEvt } = await supabase
          .from('timeline_events')
          .insert(timelinePayload)
          .select()
          .maybeSingle();
        processedTimeline.push({ id: newEvt?.id || 'new', action: 'created', title: evt.event_title });
      }
    }

    return NextResponse.json({
      success: true,
      article_slug,
      processedLocations,
      processedTimeline
    });

  } catch (error: any) {
    console.error('Lỗi khi gắn dữ liệu Bản đồ & Dòng thời gian:', error);
    return NextResponse.json({ error: error.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
