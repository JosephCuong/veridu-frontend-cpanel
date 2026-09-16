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

function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeSearchText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function areNamesSimilar(nameA: string, nameB: string): boolean {
  const a = normalizeSearchText(nameA);
  const b = normalizeSearchText(nameB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
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
    // 1. XỬ LÝ ĐỊA DANH (MAP LOCATIONS) VỚI SMART HAVERSINE DEDUPLICATION
    // ─────────────────────────────────────────────────────────────
    const { data: existingLocationsData } = await supabase
      .from('map_locations')
      .select('*');

    const existingLocations: any[] = existingLocationsData || [];

    for (const rawLoc of locations as any[]) {
      const locName = rawLoc.name || rawLoc.title;
      const lat = typeof rawLoc.latitude === 'number' ? rawLoc.latitude : Number(rawLoc.lat);
      const lng = typeof rawLoc.longitude === 'number' ? rawLoc.longitude : Number(rawLoc.lng ?? rawLoc.lon);

      if (!locName || isNaN(lat) || isNaN(lng)) {
        continue;
      }

      const biblicalRefs: string[] = Array.isArray(rawLoc.biblical_references) 
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
      // Tiêu chí 1: Khoảng cách Haversine < 3km (cùng tọa độ địa lý đồi/thành cổ)
      // Tiêu chí 2: Trùng slug
      // Tiêu chí 3: Trùng tên/cổ danh/bí danh (aliases) trong phạm vi < 20km
      const matchedLoc = existingLocations.find((dbItem: any) => {
        const distKm = calculateHaversineDistanceKm(Number(dbItem.latitude), Number(dbItem.longitude), lat, lng);
        if (distKm < 3.0) return true;

        const isSlugMatch = rawLoc.id && dbItem.slug === rawLoc.id;
        if (isSlugMatch) return true;

        const aliasList: string[] = Array.isArray(dbItem.aliases) ? dbItem.aliases : [];
        const allNames = [dbItem.name, dbItem.name_en, dbItem.ancient_name, ...aliasList].filter(Boolean);
        const nameMatched = allNames.some(n => areNamesSimilar(n, locName));
        if (nameMatched && distKm < 20.0) return true;

        return false;
      });

      if (matchedLoc) {
        // SMART MERGE: Địa danh đã tồn tại -> Gộp thêm article_slug và biblical_references
        const currentSlugs: string[] = Array.isArray(matchedLoc.article_slugs) ? matchedLoc.article_slugs : [];
        const updatedSlugs = Array.from(new Set([...currentSlugs, article_slug])).filter(Boolean);

        const currentRefs: string[] = Array.isArray(matchedLoc.bible_references) ? matchedLoc.bible_references : [];
        const mergedRefs = Array.from(new Set([...currentRefs, ...biblicalRefs])).filter(Boolean);

        const currentAliases: string[] = Array.isArray(matchedLoc.aliases) ? matchedLoc.aliases : [];
        const updatedAliases = Array.from(new Set([...currentAliases, locName])).filter(Boolean);

        const updatePayload: any = {
          article_slugs: updatedSlugs,
          bible_references: mergedRefs,
          aliases: updatedAliases
        };

        if (ancientName && !matchedLoc.ancient_name) updatePayload.ancient_name = ancientName;
        if (historicalPeriod && !matchedLoc.historical_period) updatePayload.historical_period = historicalPeriod;
        if (archEvidence) {
          updatePayload.archaeological_evidence = matchedLoc.archaeological_evidence 
            ? `${matchedLoc.archaeological_evidence} | ${archEvidence}`
            : archEvidence;
        }
        if (description && (!matchedLoc.description || description.length > matchedLoc.description.length)) {
          updatePayload.description = description;
        }

        await supabase
          .from('map_locations')
          .update(updatePayload)
          .eq('id', matchedLoc.id);

        // Update local cache
        Object.assign(matchedLoc, updatePayload);
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
          aliases: [locName],
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

        if (newLoc) {
          existingLocations.push(newLoc);
        }
        processedLocations.push({ id: newLoc?.id || 'new', action: 'created', name: locName });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. XỬ LÝ DÒNG THỜI GIAN (TIMELINE EVENTS) VỚI SMART DEDUPLICATION
    // ─────────────────────────────────────────────────────────────
    const { data: existingEventsData } = await supabase
      .from('timeline_events')
      .select('*');

    const existingEvents: any[] = existingEventsData || [];

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
      const eventSlug = rawEvt.id || rawEvt.slug || `evt-${Math.abs(year)}-${normalizeSearchText(title).slice(0, 30)}`;

      const displayDate = rawEvt.display_date || rawEvt.year_label || (year < 0 ? `${Math.abs(year)} TCN` : `${year} SCN`);
      const biblicalAnchor = rawEvt.biblical_anchor || rawEvt.scripture || '';
      const archAnchor = rawEvt.archaeological_anchor || rawEvt.archaeology || '';
      const significance = rawEvt.significance || rawEvt.theology || rawEvt.summary || '';
      const description = rawEvt.description || archAnchor || significance || '';

      // Kiểm tra sự kiện đã tồn tại chưa:
      // Tiêu chí 1: Trùng slug
      // Tiêu chí 2: Trùng năm (±2 năm nếu Cựu Ước/BCE, chính xác nếu Tân Ước/SCN) VÀ Tiêu đề tương đồng
      const matchedEvt = existingEvents.find((dbItem: any) => {
        if (rawEvt.id && dbItem.slug === rawEvt.id) return true;
        if (eventSlug && dbItem.slug === eventSlug) return true;

        const dbYear = Number(dbItem.order_year);
        const isBce = year < 0;
        const isYearMatch = isBce ? Math.abs(dbYear - year) <= 2 : dbYear === year;

        if (isYearMatch) {
          if (areNamesSimilar(dbItem.title, title)) return true;
          if (biblicalAnchor && dbItem.biblical_anchor && areNamesSimilar(dbItem.biblical_anchor, biblicalAnchor)) return true;
        }

        return false;
      });

      if (matchedEvt) {
        // SMART MERGE: Gộp article_slugs và bible_references
        const currentSlugs: string[] = Array.isArray(matchedEvt.article_slugs) ? matchedEvt.article_slugs : [];
        if (matchedEvt.article_slug) currentSlugs.push(matchedEvt.article_slug);
        const updatedSlugs = Array.from(new Set([...currentSlugs, article_slug])).filter(Boolean);

        const currentRefs: string[] = Array.isArray(matchedEvt.bible_references) ? matchedEvt.bible_references : [];
        if (biblicalAnchor && !currentRefs.includes(biblicalAnchor)) {
          currentRefs.push(biblicalAnchor);
        }
        const updatedRefs = Array.from(new Set(currentRefs)).filter(Boolean);

        const updatePayload: any = {
          article_slugs: updatedSlugs,
          bible_references: updatedRefs
        };

        if (biblicalAnchor && (!matchedEvt.biblical_anchor || matchedEvt.biblical_anchor === '')) {
          updatePayload.biblical_anchor = biblicalAnchor;
        }
        if (archAnchor && (!matchedEvt.archaeological_anchor || matchedEvt.archaeological_anchor === '')) {
          updatePayload.archaeological_anchor = archAnchor;
        }
        if (significance && (!matchedEvt.significance || significance.length > matchedEvt.significance.length)) {
          updatePayload.significance = significance;
        }
        if (description && (!matchedEvt.description || description.length > matchedEvt.description.length)) {
          updatePayload.description = description;
          updatePayload.content = description;
        }

        await supabase
          .from('timeline_events')
          .update(updatePayload)
          .eq('id', matchedEvt.id);

        Object.assign(matchedEvt, updatePayload);
        processedTimeline.push({ id: matchedEvt.id, action: 'merged', title: matchedEvt.title });
      } else {
        // CREATE NEW TIMELINE EVENT
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
          article_slugs: [article_slug],
          bible_references: biblicalAnchor ? [biblicalAnchor] : [],
          aliases: [title],
          era_id: eraInfo.era_id,
          era_name: eraName,
          category: rawEvt.category || eraInfo.category,
        };

        const { data: newEvt } = await supabase
          .from('timeline_events')
          .insert(timelinePayload)
          .select()
          .maybeSingle();

        if (newEvt) {
          existingEvents.push(newEvt);
        }
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
