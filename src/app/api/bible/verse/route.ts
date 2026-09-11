import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/api';
import { getCanonicalBookSlug, getBookInfoBySlug, formatScriptureUrl } from '@/lib/bibleData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawBook = searchParams.get('book') || '';
    const chapterStr = searchParams.get('chapter') || '1';
    const verseStartStr = searchParams.get('verse') || searchParams.get('v') || '1';
    const verseEndStr = searchParams.get('verseEnd') || searchParams.get('ve') || verseStartStr;
    const translationSlug = searchParams.get('t') || 'ntt';

    if (!rawBook) {
      return NextResponse.json({ error: 'Thiếu tham số sách (book)' }, { status: 400 });
    }

    const canonicalSlug = getCanonicalBookSlug(rawBook);
    if (!canonicalSlug) {
      return NextResponse.json({ error: `Không tìm thấy sách: "${rawBook}"` }, { status: 404 });
    }

    const chapter = parseInt(chapterStr, 10) || 1;
    const vStart = parseInt(verseStartStr, 10) || 1;
    const vEnd = Math.max(vStart, parseInt(verseEndStr, 10) || vStart);
    const bookInfo = getBookInfoBySlug(canonicalSlug);

    // 1. Resolve translation ID from bible_translations table
    const { data: transData } = await supabase
      .from('bible_translations')
      .select('id, name, slug')
      .eq('slug', translationSlug)
      .maybeSingle();

    const translationId = transData?.id || 1;
    const translationName = transData?.name || 'Bản dịch Linh mục Nguyễn Thế Thuấn';

    // 2. Query verses from bible_verses table
    const { data: versesData, error: versesError } = await supabase
      .from('bible_verses')
      .select('id, chapter, verse, text, heading, footnote, is_paragraph, is_poetry')
      .eq('book_slug', canonicalSlug)
      .eq('chapter', chapter)
      .eq('translation_id', translationId)
      .order('id', { ascending: true });

    if (versesError || !versesData || versesData.length === 0) {
      // Fallback: try querying without book_slug if bible_books join is needed
      const { data: bookRecord } = await supabase
        .from('bible_books')
        .select('id')
        .eq('code', canonicalSlug)
        .maybeSingle();

      if (bookRecord) {
        const { data: retryVerses } = await supabase
          .from('bible_verses')
          .select('id, chapter, verse, text, heading, footnote, is_paragraph, is_poetry')
          .eq('book_id', bookRecord.id)
          .eq('chapter', chapter)
          .eq('translation_id', translationId)
          .order('id', { ascending: true });

        if (retryVerses && retryVerses.length > 0) {
          return formatVerseResponse(retryVerses, bookInfo, canonicalSlug, chapter, vStart, vEnd, translationSlug, translationName);
        }
      }

      return NextResponse.json({
        error: 'Không tìm thấy dữ liệu câu Kinh Thánh cho đoạn này',
        canonicalSlug,
        chapter
      }, { status: 404 });
    }

    return formatVerseResponse(versesData, bookInfo, canonicalSlug, chapter, vStart, vEnd, translationSlug, translationName);
  } catch (err: any) {
    console.error('Error fetching bible verse:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ khi truy vấn Kinh Thánh', details: err?.message }, { status: 500 });
  }
}

function parseVerseNum(v: string | number): number {
  const match = String(v || '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function formatVerseResponse(
  allVersesInChapter: any[],
  bookInfo: any,
  canonicalSlug: string,
  chapter: number,
  vStart: number,
  vEnd: number,
  translationSlug: string,
  translationName: string
) {
  // Filter verses belonging to the requested range [vStart, vEnd]
  const matchedVerses = allVersesInChapter.filter(v => {
    const num = parseVerseNum(v.verse);
    return num >= vStart && num <= vEnd;
  });

  // If no exact match (e.g. range out of bounds), fallback to the first 3 verses of the chapter
  const inRange = matchedVerses.length > 0 ? matchedVerses : allVersesInChapter.slice(0, 3);
  const totalInRange = inRange.length;

  // Maximum 3 verses in quick peek popover as requested
  const displayVerses = inRange.slice(0, 3).map(v => ({
    verse: v.verse,
    text: v.text,
    heading: v.heading || null
  }));

  const remainingCount = Math.max(0, totalInRange - 3);
  const hasMore = remainingCount > 0;

  const readerUrl = formatScriptureUrl(canonicalSlug, chapter, vStart, translationSlug);

  return NextResponse.json({
    success: true,
    book: {
      code: canonicalSlug,
      name: bookInfo ? bookInfo.name : canonicalSlug,
      testament: bookInfo ? bookInfo.testament : 'Kinh Thánh'
    },
    chapter,
    verseStart: vStart,
    verseEnd: vEnd,
    translation: {
      slug: translationSlug,
      name: translationName
    },
    verses: displayVerses,
    totalInRange,
    remainingCount,
    hasMore,
    readerUrl
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
