// Updated api.ts with status = 'published' filter for public endpoints
import { supabase } from './supabaseClient';

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

export interface Character {
  id: string | number;
  name: string;
  biography?: string;
  role?: string;
  era?: string;
  theology?: string;
  avatar_url?: string;
  slug?: string;
  description?: string;
}

export interface TimelineEventData {
  id: string | number;
  eraId?: string;
  eraName?: string;
  title: string;
  timePeriod?: string;
  icon?: string;
  category?: string;
  articleSlug?: string;
  interactiveHtmlUrl?: string;
  thumbnail?: string;
  description?: string;
  year_label?: string;
  order_year?: number;
  summary?: string;
  theologicalMeaning?: string;
  scripture?: string;
  contentHtml?: string;
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
      title: t.title,
      timePeriod: t.year_label,
      year_label: t.year_label,
      order_year: t.order_year,
      description: t.description,
      category: t.category || 'Lịch Sử Cứu Độ',
      thumbnail: t.image_url,
      eraId: 'salvation_history',
      eraName: 'Lịch Sử Cứu Độ'
    }));
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return [];
  }
}

// ─── Characters Fetcher (Supabase Integration) ─────────────────
export async function fetchCharacters(): Promise<Character[]> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      biography: p.biography || '',
      role: p.role || '',
      era: p.era || '',
      theology: p.theology || '',
      avatar_url: p.avatar_url || ''
    }));
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhân vật từ Supabase', error);
    return [];
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

    let { data: verses } = await primaryQuery.order('verse', { ascending: true });

    if (primaryTranslationId && (!verses || verses.length === 0)) {
      const { data: fallbackVerses } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_id', book.id)
        .eq('chapter', chapter)
        .order('verse', { ascending: true });
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
      verses: (verses || [])
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
        }),
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
