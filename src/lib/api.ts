// Updated api.ts with status = 'published' filter for public endpoints
import { supabase } from './supabaseClient';
import { formatImageUrl } from './htmlProcessor';
export { supabase };


export interface Article {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string;
  interactiveHtml?: string;
  content?: string;
  category?: string;
  featured_image?: string;
  thumbnail?: string;
  article_type?: string;
  scripture_quote?: string;
  prayer_text?: string;
  created_at?: string;
  updated_at?: string;
  author?: string;
  author_name?: string;
  readingTime?: string;
  reading_time?: string;
  views?: number;
  likes?: number;
  tags?: string[];
  seo?: any;
  seo_title?: string;
  seo_description?: string;
  scriptureQuote?: string;
  prayerText?: string;
  status?: string;
}

export interface Lesson {
  id: number | string;
  title: string;
  slug?: string;
  orderIndex?: number;
  orderNumber?: number;
  chapterTitle?: string;
  videoUrl?: string;
  audioUrl?: string;
  content?: string;
  contentHtml?: string;
  lessonType?: string;
  scripture?: string;
  prayer?: string;
  durationMinutes?: number;
  duration?: string;
  isCompleted?: boolean;
}

export interface Course {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  featured_image?: string;
  category?: string;
  level?: string;
  instructor?: string;
  duration?: string;
  lessonsCount?: number;
  totalLessons?: number;
  lessons?: Lesson[];
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
}

export interface CharacterScripture {
  reference: string;
  book_slug: string;
  chapter: number;
  note?: string;
  text: string;
}

export interface CharacterRelationship {
  name: string;
  role: string;
  slug?: string;
}

export interface Character {
  id: string | number;
  slug: string;
  name: string;
  original_name?: string;
  meaning?: string;
  testament: 'cuu-uoc' | 'tan-uoc' | string;
  role: string;
  era: string;
  feast_day?: string;
  avatar_url?: string;
  cover_image?: string;
  short_description?: string;
  biography?: string;
  scriptures?: CharacterScripture[];
  theology?: string;
  virtues?: string[];
  relationships?: CharacterRelationship[];
  timeline_order?: number;
  created_at?: string;
}

export interface TimelineEventScripture {
  reference: string;
  book_slug: string;
  chapter: number;
  note?: string;
  text: string;
}

export interface TimelineEventEntity {
  name: string;
  slug?: string;
}

export interface TimelineEventData {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  year_label: string;
  order_year: number;
  era_id: string;
  era_name: string;
  category: 'cuu-uoc' | 'tan-uoc' | 'giao-hoi' | string;
  image_url?: string;
  summary?: string;
  content?: string;
  theology?: string;
  key_figures?: TimelineEventEntity[];
  locations?: TimelineEventEntity[];
  scriptures?: TimelineEventScripture[];
  article_slug?: string;
  created_at?: string;
  // Compatibility aliases
  timePeriod?: string;
  eraId?: string;
  eraName?: string;
  thumbnail?: string;
  description?: string;
}

export interface MapLocationScripture {
  reference: string;
  book_slug: string;
  chapter: number;
  note?: string;
  text: string;
}

export interface MapLocation {
  id: string | number;
  slug: string;
  name: string;
  name_en?: string;
  name_original?: string;
  meaning?: string;
  region: string;
  testament: 'cuu-uoc' | 'tan-uoc' | 'ca-hai' | string;
  era: string;
  latitude: number;
  longitude: number;
  importance_level?: number;
  image_url?: string;
  summary?: string;
  description?: string;
  events?: string[];
  scriptures?: MapLocationScripture[];
  theology?: string;
  created_at?: string;
}

// Helper to normalize category names and determine layout type
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function determineArticleType(category?: string, dbArticleType?: string, contentHtml?: string): string {
  if (dbArticleType && ['interactive', 'magazine', 'wide', 'meditation', 'theological', 'standard'].includes(dbArticleType)) {
    return dbArticleType;
  }

  // Auto-detect interactive full-page HTML documents by content signature
  if (contentHtml && typeof contentHtml === 'string') {
    const lower = contentHtml.toLowerCase();
    if (
      lower.includes('<!doctype html') || 
      lower.includes('<html') || 
      (lower.includes('<script') && lower.includes('<style'))
    ) {
      return 'interactive';
    }
  }

  if (!category) return 'standard';
  const norm = normalizeText(category);
  if (
    norm.includes('tuong tac') ||
    norm.includes('interactive') ||
    norm.includes('html 3d')
  ) {
    return 'interactive';
  }
  if (norm.includes('suy niem')) {
    return 'meditation';
  }
  if (norm.includes('tap chi') || norm.includes('phong su') || norm.includes('magazine') || norm.includes('wide')) {
    return 'magazine';
  }
  if (norm.includes('than hoc') || norm.includes('theological')) {
    return 'theological';
  }
  return 'standard';
}

// ─── Library Articles (Supabase Integration) ───────────────────
export async function getLibraryArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Supabase getLibraryArticles error:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      contentHtml: item.content || '',
      interactiveHtml: item.content || '',
      category: item.category || 'Các Thánh',
      featured_image: item.featured_image || '',
      thumbnail: item.featured_image || '',
      article_type: determineArticleType(item.category, item.article_type, item.content),
      scripture_quote: item.scripture_quote || '',
      prayer_text: item.prayer_text || '',
      scriptureQuote: item.scripture_quote || '',
      prayerText: item.prayer_text || '',
      tags: item.tags || [],
      created_at: item.created_at,
      status: item.status,
      author: item.author_name || 'VERIDU Team',
      author_name: item.author_name || 'VERIDU Team',
      readingTime: item.reading_time || '5 phút',
      reading_time: item.reading_time || '5 phút',
      views: item.views || 0,
      likes: item.likes || 0,
    }));
  } catch (e) {
    console.error('getLibraryArticles error:', e);
    return [];
  }
}

export async function getLibraryArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      contentHtml: data.content || '',
      interactiveHtml: data.content || '',
      category: data.category || 'Các Thánh',
      featured_image: data.featured_image || '',
      thumbnail: data.featured_image || '',
      article_type: determineArticleType(data.category, data.article_type, data.content),
      scripture_quote: data.scripture_quote || '',
      prayer_text: data.prayer_text || '',
      scriptureQuote: data.scripture_quote || '',
      prayerText: data.prayer_text || '',
      tags: data.tags || [],
      created_at: data.created_at,
      status: data.status,
      author: data.author_name || 'VERIDU Team',
      author_name: data.author_name || 'VERIDU Team',
      readingTime: data.reading_time || '5 phút',
      reading_time: data.reading_time || '5 phút',
      views: data.views || 0,
      likes: data.likes || 0,
    };
  } catch (e) {
    console.error('getLibraryArticleBySlug error:', e);
    return null;
  }
}

// ─── LMS Courses Fetchers ──────────────────────────────────────
export async function fetchCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description || '',
      thumbnail: c.thumbnail || '',
      featured_image: c.thumbnail || '',
      category: c.category || 'Kinh Thánh',
      level: c.level || 'Cơ Bản',
      instructor: c.instructor || 'VERIDU Team',
      duration: c.duration || '12 Bài Học',
      lessonsCount: c.lessons?.length || 0,
      totalLessons: c.lessons?.length || 0
    }));
  } catch (e) {
    console.error('fetchCourses error:', e);
    return [];
  }
}

export async function fetchCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*)')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      featured_image: data.thumbnail || '',
      category: data.category || 'Kinh Thánh',
      level: data.level || 'Cơ Bản',
      instructor: data.instructor || 'VERIDU Team',
      duration: data.duration || '12 Bài Học',
      lessonsCount: data.lessons?.length || 0,
      totalLessons: data.lessons?.length || 0,
      lessons: (data.lessons || []).map((l: any, idx: number) => ({
        id: l.id,
        title: l.title,
        slug: l.slug || `bai-${idx + 1}`,
        orderIndex: l.order_index || idx + 1,
        orderNumber: l.order_number || l.order_index || idx + 1,
        chapterTitle: l.chapter_title || 'Chương chung',
        videoUrl: l.video_url || '',
        audioUrl: l.audio_url || '',
        content: l.content || '',
        contentHtml: l.content || '',
        lessonType: l.lesson_type || 'reading',
        scripture: l.scripture || '',
        prayer: l.prayer || '',
        durationMinutes: l.duration_minutes || 15,
        duration: l.duration || `${l.duration_minutes || 15} phút`
      }))
    };
  } catch (e) {
    console.error('fetchCourseBySlug error:', e);
    return null;
  }
}

// ─── Search Fetcher ───────────────────────────────────────────
export async function fetchGlobalSearch(query: string) {
  if (!query) return { courses: [], articles: [] };
  try {
    const articles = await getLibraryArticles();
    const courses = await fetchCourses();
    const q = query.toLowerCase();
    return {
      courses: courses.filter(c => c.title.toLowerCase().includes(q)),
      articles: articles.filter(a => a.title.toLowerCase().includes(q))
    };
  } catch (e) {
    return { courses: [], articles: [] };
  }
}

// ─── Homepage Data Fetcher ─────────────────────────────────────
export async function fetchHomepageData() {
  try {
    const articles = await getLibraryArticles();
    return {
      settings: { hero_image: '', youtube_url: '' },
      articles: articles
    };
  } catch (e) {
    return null;
  }
}

// ─── Timeline Events (Supabase Integration) ─────────────────────
export async function fetchTimelineEvents(): Promise<TimelineEventData[]> {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('order_year', { ascending: true });

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      slug: t.slug || `event-${t.id}`,
      title: t.title,
      subtitle: t.subtitle || '',
      year_label: t.year_label,
      order_year: Number(t.order_year),
      era_id: t.era_id || 'era-1',
      era_name: t.era_name || 'Khởi Nguyên & Thời Các Tổ Phụ',
      category: t.category || 'cuu-uoc',
      image_url: t.image_url || '',
      summary: t.summary || '',
      content: t.content || '',
      theology: t.theology || '',
      key_figures: t.key_figures || [],
      locations: t.locations || [],
      scriptures: t.scriptures || [],
      article_slug: t.article_slug || '',
      created_at: t.created_at,
      // Compatibility aliases
      timePeriod: t.year_label,
      eraId: t.era_id,
      eraName: t.era_name,
      thumbnail: t.image_url,
      description: t.description || t.summary
    }));
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return [];
  }
}

export async function fetchTimelineEventBySlug(slug: string): Promise<TimelineEventData | null> {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      slug: data.slug || `event-${data.id}`,
      title: data.title,
      subtitle: data.subtitle || '',
      year_label: data.year_label,
      order_year: Number(data.order_year),
      era_id: data.era_id || 'era-1',
      era_name: data.era_name || 'Khởi Nguyên & Thời Các Tổ Phụ',
      category: data.category || 'cuu-uoc',
      image_url: data.image_url || '',
      summary: data.summary || '',
      content: data.content || '',
      theology: data.theology || '',
      key_figures: data.key_figures || [],
      locations: data.locations || [],
      scriptures: data.scriptures || [],
      article_slug: data.article_slug || '',
      created_at: data.created_at,
      timePeriod: data.year_label,
      eraId: data.era_id,
      eraName: data.era_name,
      thumbnail: data.image_url,
      description: data.description || data.summary
    };
  } catch (error) {
    console.error(`Lỗi khi tải biến cố [${slug}] từ Supabase:`, error);
    return null;
  }
}

// ─── Characters Fetcher (Supabase Integration) ─────────────────
export async function fetchCharacters(): Promise<Character[]> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('timeline_order', { ascending: true });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      slug: p.slug || '',
      name: p.name,
      original_name: p.original_name || '',
      meaning: p.meaning || '',
      testament: p.testament || 'cuu-uoc',
      role: p.role || '',
      era: p.era || '',
      feast_day: p.feast_day || '',
      avatar_url: formatImageUrl(p.avatar_url, 'avatar'),
      cover_image: formatImageUrl(p.cover_image, 'cover'),
      short_description: p.short_description || '',
      biography: p.biography || '',
      scriptures: p.scriptures || [],
      theology: p.theology || '',
      virtues: p.virtues || [],
      relationships: p.relationships || [],
      timeline_order: p.timeline_order || 100,
      created_at: p.created_at
    }));
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhân vật từ Supabase', error);
    return [];
  }
}

export async function fetchCharacterBySlug(slug: string): Promise<Character | null> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      slug: data.slug || '',
      name: data.name,
      original_name: data.original_name || '',
      meaning: data.meaning || '',
      testament: data.testament || 'cuu-uoc',
      role: data.role || '',
      era: data.era || '',
      feast_day: data.feast_day || '',
      avatar_url: formatImageUrl(data.avatar_url, 'avatar'),
      cover_image: formatImageUrl(data.cover_image, 'cover'),
      short_description: data.short_description || '',
      biography: data.biography || '',
      scriptures: data.scriptures || [],
      theology: data.theology || '',
      virtues: data.virtues || [],
      relationships: data.relationships || [],
      timeline_order: data.timeline_order || 100,
      created_at: data.created_at
    };
  } catch (error) {
    console.error(`Lỗi khi tải nhân vật [${slug}] từ Supabase:`, error);
    return null;
  }
}

// ─── Map Locations Fetcher (Supabase Integration) ───────────────
export async function fetchMapLocations(): Promise<MapLocation[]> {
  try {
    const { data, error } = await supabase
      .from('map_locations')
      .select('*')
      .order('importance_level', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      slug: item.slug || '',
      name: item.name,
      name_en: item.name_en || '',
      name_original: item.name_original || '',
      meaning: item.meaning || '',
      region: item.region || 'Giu-đê (Judea)',
      testament: item.testament || 'tan-uoc',
      era: item.era || 'Tân Ước',
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      importance_level: item.importance_level || 1,
      image_url: item.image_url || '',
      summary: item.summary || '',
      description: item.description || '',
      events: item.events || [],
      scriptures: item.scriptures || [],
      theology: item.theology || '',
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Lỗi khi tải danh sách địa danh bản đồ từ Supabase:', error);
    return [];
  }
}

export async function fetchMapLocationBySlug(slug: string): Promise<MapLocation | null> {
  try {
    const { data, error } = await supabase
      .from('map_locations')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      slug: data.slug || '',
      name: data.name,
      name_en: data.name_en || '',
      name_original: data.name_original || '',
      meaning: data.meaning || '',
      region: data.region || 'Giu-đê (Judea)',
      testament: data.testament || 'tan-uoc',
      era: data.era || 'Tân Ước',
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      importance_level: data.importance_level || 1,
      image_url: data.image_url || '',
      summary: data.summary || '',
      description: data.description || '',
      events: data.events || [],
      scriptures: data.scriptures || [],
      theology: data.theology || '',
      created_at: data.created_at
    };
  } catch (error) {
    console.error(`Lỗi khi tải địa danh [${slug}] từ Supabase:`, error);
    return null;
  }
}

// ─── Bible Reader Metadata ────────────────────────────────────────────────────
export async function fetchBibleMetadata() {
  try {
    const [booksRes, transRes] = await Promise.all([
      supabase
        .from('bible_books')
        .select('*')
        .order('order_index', { ascending: true }),
      supabase
        .from('bible_translations')
        .select('id, slug, name')
        .order('id', { ascending: true })
    ]);

    if (booksRes.error || !booksRes.data) return { books: [], translations: [] };

    // If translations table is empty or errored, fallback to default
    const translationsData = (!transRes.error && transRes.data && transRes.data.length > 0)
      ? transRes.data.map((t: any) => ({ slug: t.slug, name: t.name }))
      : [{ slug: 'vi_pdv', name: 'Bản dịch Phụng Vụ KTCG' }];

    return {
      books: booksRes.data.map((b: any) => ({
        slug: b.code,
        nameVi: b.name,
        testament: b.testament,
        totalChapters: b.chapters_count
      })),
      translations: translationsData
    };
  } catch (err) {
    console.error('fetchBibleMetadata error:', err);
    return { books: [], translations: [] };
  }
}

export function parseVerseSortKey(verseStr: string | number): { num: number; sub: string } {
  const s = String(verseStr || '').trim();
  const match = s.match(/^(\d+)(.*)$/);
  if (!match) return { num: 99999, sub: s };
  return { num: parseInt(match[1], 10), sub: match[2] };
}

export function sortBibleVerses<T extends { verse: string | number }>(verses: T[]): T[] {
  return [...verses].sort((a, b) => {
    const keyA = parseVerseSortKey(a.verse);
    const keyB = parseVerseSortKey(b.verse);
    if (keyA.num !== keyB.num) return keyA.num - keyB.num;
    return keyA.sub.localeCompare(keyB.sub);
  });
}

export async function fetchBibleChapter(
  translationSlug: string,
  bookSlug: string,
  chapter: number,
  secondTranslationSlug?: string
) {
  try {
    const { data: book } = await supabase
      .from('bible_books')
      .select('id, name')
      .eq('code', bookSlug)
      .single();

    if (!book) return null;

    const knownSlugMap: Record<string, string> = {
      'vi_rvv': 'vi_rvv',
      'vi_btt': 'vi_btt',
      'en_kjv': 'en_kjv',
      'vi_pdv': 'vi_pdv',
      'ntt': 'ntt',
    };

    let primaryTranslationId: any = null;
    if (translationSlug) {
      const { data: trans } = await supabase
        .from('bible_translations')
        .select('id, slug')
        .eq('slug', translationSlug)
        .maybeSingle();

      if (trans?.id) {
        primaryTranslationId = trans.id;
      } else if (knownSlugMap[translationSlug]) {
        primaryTranslationId = knownSlugMap[translationSlug];
      }
    }

    let primaryQuery = supabase
      .from('bible_verses')
      .select('*')
      .eq('book_id', book.id)
      .eq('chapter', chapter);


    if (primaryTranslationId) {
      primaryQuery = primaryQuery.eq('translation_id', primaryTranslationId);
    }

    let { data: verses } = await primaryQuery;

    if (primaryTranslationId && (!verses || verses.length === 0)) {
      const { data: fallbackVerses } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_id', book.id)
        .eq('chapter', chapter);
      verses = fallbackVerses;
    }


    let secondVersesMap: Record<string, string> = {};
    if (secondTranslationSlug) {
      let secTranslationId: any = null;
      const { data: secTrans } = await supabase
        .from('bible_translations')
        .select('id, slug')
        .eq('slug', secondTranslationSlug)
        .maybeSingle();

      if (secTrans?.id) {
        secTranslationId = secTrans.id;
      } else if (knownSlugMap[secondTranslationSlug]) {
        secTranslationId = knownSlugMap[secondTranslationSlug];
      }

      let secQuery = supabase
        .from('bible_verses')
        .select('*')
        .eq('book_id', book.id)
        .eq('chapter', chapter);

      if (secTranslationId) {
        secQuery = secQuery.eq('translation_id', secTranslationId);
      }

      const { data: secVerses } = await secQuery.order('verse', { ascending: true });

      if (secVerses && secVerses.length > 0) {
        secVerses.forEach((v: any) => {
          const vStr = String(v.verse || '');
          secondVersesMap[vStr] = v.text || v.content || '';
        });
      }
    }

    // Query commentary for this chapter
    const { data: commentaryData } = await supabase
      .from('bible_commentary')
      .select('*')
      .eq('book_id', book.id)
      .eq('chapter', chapter)
      .maybeSingle();

    const commentary = commentaryData ? {
      videoUrl: commentaryData.video_url || null,
      audioUrl: commentaryData.audio_url || null,
      historicalContext: commentaryData.historical_context || null,
      theologicalMeaning: commentaryData.theological_meaning || null,
      practicalApplication: commentaryData.practical_application || null,
    } : null;

    return {
      bookName: book.name,
      chapter: chapter,
      verses: sortBibleVerses(
        (verses || [])
          .filter((v: any) => v.verse != null)  // Safe guard: skip rows with NULL verse
          .map((v: any) => {
            const verseStr = String(v.verse || '');
            return {
              id: v.id,
              verse: verseStr,
              content: v.text || v.content || '',
              contentSec: secondTranslationSlug ? (secondVersesMap[verseStr] || null) : null,
              heading: v.heading || null,
              footnotes: v.footnote || v.footnotes || null,
              chapter: chapter,
              bookSlug: bookSlug
            };
          })
      ),
      commentary
    };

  } catch (err) {
    console.error('fetchBibleChapter error:', err);
    return null;
  }
}

// 🏆 Real Supabase Quiz Attempts API
export async function fetchUserQuizAttemptsFromSupabase(userId?: string) {
  try {
    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        score: item.score,
        total: item.total,
        percentage: item.percentage,
        date: new Date(item.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));
    }
  } catch (err) {
    console.warn('fetchUserQuizAttemptsFromSupabase warning:', err);
  }
  return [];
}

export async function saveQuizAttemptToSupabase(attempt: { title: string; score: number; total: number; percentage: number; user_id?: string }) {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([attempt])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('saveQuizAttemptToSupabase warning:', err);
    return null;
  }
}

export async function clearUserQuizAttemptsFromSupabase(userId?: string) {
  try {
    let query = supabase.from('quiz_attempts').delete();
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }
    await query;
  } catch (err) {
    console.warn('clearUserQuizAttemptsFromSupabase warning:', err);
  }
}

// 🎓 Real Supabase LMS User Course Progress API
export async function fetchUserCourseProgressFromSupabase(userId?: string) {
  try {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*, courses(*)')
      .order('last_accessed_at', { ascending: false });

    if (error) throw error;
    if (data) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.courses?.title || 'Khóa học Giáo lý',
        slug: item.courses?.slug || 'khoa-hoc',
        progress: item.progress_percent || 0,
        completedLessons: item.completed_lessons || 0,
        totalLessons: item.total_lessons || 10,
        icon: item.courses?.category === 'cuu-uoc' ? '📜' : item.courses?.category === 'tan-uoc' ? '✝️' : '🕯️'
      }));
    }
  } catch (err) {
    console.warn('fetchUserCourseProgressFromSupabase warning:', err);
  }
  return [];
}

// 📚 ==========================================
// 📚 THƯ VIỆN SÁCH & TÀI LIỆU (LIBRARY ITEMS & SANDBOX READER)
// 📚 ==========================================

export interface LibraryItemToc {
  title: string;
  page?: number;
}

export interface LibraryAttachment {
  name: string;
  url: string;
  file_type: string;
  size_label?: string;
  description?: string;
}

export interface LibraryItem {
  id: number;
  slug: string;
  title: string;
  author: string;
  category: string;
  item_type: 'book' | 'document';
  format: string;
  pages_count: number;
  file_size_label: string;
  file_url?: string;
  drive_file_id?: string;
  google_slide_id?: string;
  cover_image_url?: string;
  cover_bg_gradient?: string;
  description?: string;
  full_summary_html?: string;
  attachments?: LibraryAttachment[];
  table_of_contents: LibraryItemToc[];
  allow_read_online: boolean;
  download_permission_level: 'public' | 'member' | 'privileged' | 'admin';
  view_count: number;
  download_count: number;
  created_at?: string;
}

export async function fetchLibraryItems(itemType?: 'book' | 'document', category?: string): Promise<LibraryItem[]> {
  try {
    let query = supabase
      .from('library_items')
      .select('*')
      .order('download_count', { ascending: false });

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        author: item.author,
        category: item.category,
        item_type: item.item_type || 'book',
        format: item.format || 'PDF',
        pages_count: item.pages_count || 0,
        file_size_label: item.file_size_label || '',
        file_url: item.file_url || '',
        drive_file_id: item.drive_file_id || '',
        google_slide_id: item.google_slide_id || '',
        cover_image_url: item.cover_image_url || '',
        cover_bg_gradient: item.cover_bg_gradient || 'from-amber-600 to-amber-950',
        description: item.description || '',
        full_summary_html: item.full_summary_html || '',
        attachments: item.attachments || [],
        table_of_contents: item.table_of_contents || [],
        allow_read_online: item.allow_read_online !== false,
        download_permission_level: item.download_permission_level || 'member',
        view_count: item.view_count || 0,
        download_count: item.download_count || 0,
        created_at: item.created_at
      }));
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách sách/tài liệu từ Supabase:', err);
  }
  return [];
}

export async function fetchLibraryItemBySlug(slug: string): Promise<LibraryItem | null> {
  try {
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;

    // Tăng lượt xem (view_count) không đồng bộ
    try {
      await supabase
        .from('library_items')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
    } catch (_) {}

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      author: data.author,
      category: data.category,
      item_type: data.item_type || 'book',
      format: data.format || 'PDF',
      pages_count: data.pages_count || 0,
      file_size_label: data.file_size_label || '',
      file_url: data.file_url || '',
      drive_file_id: data.drive_file_id || '',
      google_slide_id: data.google_slide_id || '',
      cover_image_url: data.cover_image_url || '',
      cover_bg_gradient: data.cover_bg_gradient || 'from-amber-600 to-amber-950',
      description: data.description || '',
      full_summary_html: data.full_summary_html || '',
      attachments: data.attachments || [],
      table_of_contents: data.table_of_contents || [],
      allow_read_online: data.allow_read_online !== false,
      download_permission_level: data.download_permission_level || 'member',
      view_count: (data.view_count || 0) + 1,
      download_count: data.download_count || 0,
      created_at: data.created_at
    };
  } catch (err) {
    console.error('Lỗi khi tải chi tiết sách/tài liệu:', err);
    return null;
  }
}

export async function checkUserDownloadQuota(userId?: string | number, userRole?: string): Promise<{
  canDownload: boolean;
  remainingQuota: number;
  maxQuota: number;
  isUnlimited: boolean;
}> {
  if (!userId) {
    return { canDownload: false, remainingQuota: 0, maxQuota: 0, isUnlimited: false };
  }

  // GLV, Học Giả, Admin được tải không giới hạn
  const isPrivileged = userRole === 'Giáo Lý Viên' || 
                       userRole === 'Quản Trị Viên' || 
                       userRole === 'Học Giả VERIDU' || 
                       userRole === 'admin';

  if (isPrivileged) {
    return { canDownload: true, remainingQuota: 999, maxQuota: 999, isUnlimited: true };
  }

  const maxQuota = 5; // Học viên tiêu chuẩn: 5 lượt/ngày
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Đếm số lượt tải trong 24h qua từ bảng download_logs hoặc localStorage fallback
    const { count, error } = await supabase
      .from('download_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', String(userId))
      .gte('downloaded_at', oneDayAgo);

    const downloadsToday = (!error && typeof count === 'number') ? count : 0;
    const remaining = Math.max(0, maxQuota - downloadsToday);

    return {
      canDownload: remaining > 0,
      remainingQuota: remaining,
      maxQuota: maxQuota,
      isUnlimited: false
    };
  } catch (e) {
    return { canDownload: true, remainingQuota: maxQuota, maxQuota: maxQuota, isUnlimited: false };
  }
}

export async function recordDownloadItem(itemId: number, itemSlug: string, userId?: string | number) {
  try {
    // 1. Ghi log tải về
    if (userId) {
      await supabase.from('download_logs').insert({
        user_id: String(userId),
        item_id: itemId,
        item_slug: itemSlug
      });
    }

    // 2. Tăng số lượt tải của item
    const { data } = await supabase
      .from('library_items')
      .select('download_count')
      .eq('id', itemId)
      .single();

    if (data) {
      await supabase
        .from('library_items')
        .update({ download_count: (data.download_count || 0) + 1 })
        .eq('id', itemId);
    }
  } catch (err) {
    console.error('Lỗi khi ghi nhận lượt tải:', err);
  }
}

// ─── Catechism Entries (Supabase Integration) ─────────────────
export interface ScriptureRef {
  reference: string;
  book_slug: string;
  chapter: number;
  text: string;
}

export interface CatechismEntry {
  id: number;
  part_number: number;
  part_title: string;
  section_title?: string;
  chapter_title?: string;
  article_number?: number;
  paragraph_start: number;
  paragraph_end: number;
  ccc_number_range: string;
  compendium_number?: number;
  question?: string;
  title: string;
  summary?: string;
  content_html: string;
  scripture_references?: ScriptureRef[];
  cross_references?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export async function fetchCatechismEntries(partNumber?: number, searchQuery?: string): Promise<CatechismEntry[]> {
  try {
    let query = supabase
      .from('catechism_entries')
      .select('*')
      .order('part_number', { ascending: true })
      .order('paragraph_start', { ascending: true });

    if (partNumber && partNumber > 0) {
      query = query.eq('part_number', partNumber);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      const numMatch = q.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0]);
        query = query.or(`paragraph_start.lte.${num},paragraph_end.gte.${num},compendium_number.eq.${num},title.ilike.%${q}%,summary.ilike.%${q}%`);
      } else {
        query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,section_title.ilike.%${q}%,chapter_title.ilike.%${q}%,content_html.ilike.%${q}%`);
      }
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as CatechismEntry[];
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu Giáo Lý từ Supabase:', error);
    return [];
  }
}

// ─── Catechism Paragraphs (Full 1827+ CSV Ingestion) ───────────
export interface CatechismParagraph {
  id: number;
  section_identifier: string;
  paragraph_number?: number;
  paragraph_str: string;
  title: string;
  part_number: number;
  part_title: string;
  section_title?: string;
  chapter_title?: string;
  article_title?: string;
  full_path?: string;
  is_in_brief: boolean;
  cross_references?: number[];
  footnotes?: string;
  content_html: string;
  plain_text?: string;
  created_at?: string;
}

export async function fetchCatechismParagraphs(
  partNumber?: number,
  searchQuery?: string,
  inBriefOnly?: boolean,
  limit: number = 300,
  offset: number = 0
): Promise<{ data: CatechismParagraph[]; count: number }> {
  try {
    let query = supabase
      .from('catechism_paragraphs')
      .select('*', { count: 'exact' })
      .order('part_number', { ascending: true })
      .order('paragraph_number', { ascending: true, nullsFirst: false });

    if (partNumber !== undefined && partNumber !== null && partNumber >= 0) {
      query = query.eq('part_number', partNumber);
    }

    if (inBriefOnly) {
      query = query.eq('is_in_brief', true);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      const numMatch = q.match(/^\d+$/);
      if (numMatch) {
        const num = parseInt(numMatch[0]);
        query = query.or(`paragraph_number.eq.${num},title.ilike.%Số ${num}%`);
      } else {
        query = query.or(`title.ilike.%${q}%,plain_text.ilike.%${q}%,full_path.ilike.%${q}%`);
      }
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) return { data: [], count: 0 };
    return { data: data as CatechismParagraph[], count: count || 0 };
  } catch (error) {
    console.error('Lỗi khi tải danh sách đoạn Giáo Lý:', error);
    return { data: [], count: 0 };
  }
}

export async function fetchCatechismParagraphByNumber(num: number): Promise<CatechismParagraph | null> {
  try {
    const { data, error } = await supabase
      .from('catechism_paragraphs')
      .select('*')
      .eq('paragraph_number', num)
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as CatechismParagraph;
  } catch (error) {
    console.error(`Lỗi khi tải số giáo lý ${num}:`, error);
    return null;
  }
}


