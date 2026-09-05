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
    for (const rawLoc of locations as any[]) {
      const locName = rawLoc.name || rawLoc.title;
      const lat = typeof rawLoc.latitude === 'number' ? rawLoc.latitude : Number(rawLoc.lat);
      const lng = typeof rawLoc.longitude === 'number' ? rawLoc.longitude : Number(rawLoc.lng ?? rawLoc.lon);

      if (!locName || isNaN(lat) || isNaN(lng)) {
        continue;
      }

      const biblicalRefs = Array.isArray(rawLoc.biblical_references) 
        ? rawLoc.biblical_references 
        : Array.isArray(rawLoc.bible_references) 
          ? rawLoc.bible_references 
          : rawLoc.scripture_or_history 
            ? [rawLoc.scripture_or_history] 
            : [];

      const description = rawLoc.description || rawLoc.summary || '';
      const ancientName = rawLoc.ancient_name || rawLoc.name_original || '';
      const historicalPeriod = rawLoc.historical_period || rawLoc.period || rawLoc.era || '';
      const archEvidence = rawLoc.archaeological_evidence || rawLoc.archaeology || '';

      // Tìm xem địa danh đã tồn tại chưa:
      // Tiêu chí 1: Trùng tọa độ trong bán kính ~1.5km (sai số 0.015 độ)
      // Tiêu chí 2: Trùng slug hoặc tên
      const { data: existingList } = await supabase
        .from('map_locations')
        .select('*');

      let matchedLoc = null;
      if (existingList && existingList.length > 0) {
        matchedLoc = existingList.find((dbItem: any) => {
          const latDiff = Math.abs(Number(dbItem.latitude) - lat);
          const lngDiff = Math.abs(Number(dbItem.longitude) - lng);
          const isCoordClose = latDiff < 0.02 && lngDiff < 0.02;
          const isSlugMatch = rawLoc.id && dbItem.slug === rawLoc.id;
          const isNameMatch = dbItem.name && dbItem.name.toLowerCase().includes(locName.toLowerCase().split(' ')[0]);
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
        const mergedRefs = Array.from(new Set([...currentRefs, ...biblicalRefs]));

        const updatePayload: any = {
          article_slugs: currentSlugs,
          bible_references: mergedRefs,
        };

        if (ancientName && !matchedLoc.ancient_name) updatePayload.ancient_name = ancientName;
        if (historicalPeriod && !matchedLoc.historical_period) updatePayload.historical_period = historicalPeriod;
        if (archEvidence) {
          updatePayload.archaeological_evidence = matchedLoc.archaeological_evidence 
            ? `${matchedLoc.archaeological_evidence} | ${archEvidence}`
            : archEvidence;
        }

        await supabase
          .from('map_locations')
          .update(updatePayload)
          .eq('id', matchedLoc.id);

        processedLocations.push({ id: matchedLoc.id, action: 'merged', name: matchedLoc.name });
      } else {
        // CREATE NEW LOCATION
        const insertPayload: any = {
          slug: rawLoc.id || rawLoc.slug || `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: locName,
          ancient_name: ancientName,
          latitude: lat,
          longitude: lng,
          bible_references: biblicalRefs,
          historical_period: historicalPeriod,
          archaeological_evidence: archEvidence,
          description: description,
          summary: description,
          article_slugs: [article_slug],
          importance_level: 2,
          region: rawLoc.region || 'Thánh Địa (Holy Land)',
          testament: rawLoc.testament || (lat < 30 ? 'cuu-uoc' : 'tan-uoc'),
          era: historicalPeriod || 'Kinh Thánh'
        };

        const { data: newLoc } = await supabase
          .from('map_locations')
          .insert(insertPayload)
          .select()
          .maybeSingle();

        processedLocations.push({ id: newLoc?.id || 'new', action: 'created', name: locName });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. XỬ LÝ DÒNG THỜI GIAN (TIMELINE EVENTS)
    // ─────────────────────────────────────────────────────────────
    for (const rawEvt of timeline_events as any[]) {
      const title = rawEvt.event_title || rawEvt.title;
      const year = typeof rawEvt.year_bce_ce === 'number' 
        ? rawEvt.year_bce_ce 
        : typeof rawEvt.order_year === 'number' 
          ? rawEvt.order_year 
          : typeof rawEvt.year === 'number' 
            ? rawEvt.year 
            : undefined;

      if (!title || typeof year !== 'number' || isNaN(year)) {
        continue;
      }

      const eraInfo = determineEraAndCategory(year);
      const eraName = rawEvt.era_name || rawEvt.period || eraInfo.era_name;
      const eventSlug = rawEvt.id || rawEvt.slug || `evt-${Math.abs(year)}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;

      const displayDate = rawEvt.display_date || rawEvt.year_label || (year < 0 ? `${Math.abs(year)} TCN` : `${year} SCN`);
      const biblicalAnchor = rawEvt.biblical_anchor || rawEvt.scripture || '';
      const archAnchor = rawEvt.archaeological_anchor || rawEvt.archaeology || '';
      const significance = rawEvt.significance || rawEvt.theology || rawEvt.summary || '';
      const description = rawEvt.description || archAnchor || significance || '';

      // Kiểm tra xem sự kiện đã có chưa (theo slug hoặc cùng bài viết + năm)
      const { data: existingEvt } = await supabase
        .from('timeline_events')
        .select('id, slug')
        .eq('slug', eventSlug)
        .maybeSingle();

      const timelinePayload: any = {
        slug: eventSlug,
        order_year: year,
        year_label: displayDate,
        title: title,
        subtitle: rawEvt.subtitle || biblicalAnchor || '',
        biblical_anchor: biblicalAnchor,
        archaeological_anchor: archAnchor,
        significance: significance,
        summary: significance || title,
        description: description,
        content: significance || description,
        theology: rawEvt.theology || significance,
        article_slug: article_slug,
        era_id: eraInfo.era_id,
        era_name: eraName,
        category: rawEvt.category || eraInfo.category,
      };

      if (existingEvt) {
        await supabase
          .from('timeline_events')
          .update(timelinePayload)
          .eq('id', existingEvt.id);
        processedTimeline.push({ id: existingEvt.id, action: 'updated', title });
      } else {
        const { data: newEvt } = await supabase
          .from('timeline_events')
          .insert(timelinePayload)
          .select()
          .maybeSingle();
        processedTimeline.push({ id: newEvt?.id || 'new', action: 'created', title });
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
