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
  created_at?: string;
  updated_at?: string;
  author?: string;
  readingTime?: string;
  reading_time?: string;
  views?: number;
  likes?: number;
  seo?: any;
  scriptureQuote?: string;
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

export function determineArticleType(category?: string, dbArticleType?: string): string {
  if (dbArticleType && ['interactive', 'magazine', 'wide', 'meditation', 'theological', 'standard'].includes(dbArticleType)) {
    return dbArticleType;
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
      article_type: determineArticleType(item.category, item.article_type),
      created_at: item.created_at,
      author: 'VERIDU Team',
      readingTime: '5 phút',
      reading_time: '5 phút'
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
      article_type: determineArticleType(data.category, data.article_type),
      created_at: data.created_at,
      author: 'VERIDU Team',
      readingTime: '5 phút',
      reading_time: '5 phút'
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

// ─── Bible Reader Metadata ─────────────────────────────────────
export async function fetchBibleMetadata() {
  try {
    const { data, error } = await supabase
      .from('bible_books')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data) return { books: [], translations: [] };

    return {
      books: data.map((b: any) => ({
        slug: b.code,
        nameVi: b.name,
        testament: b.testament,
        totalChapters: b.chapters_count
      })),
      translations: [{ slug: 'vi_pdv', name: 'Bản dịch Phụng Vụ KTCG' }]
    };
  } catch (err) {
    console.error('fetchBibleMetadata error:', err);
    return { books: [], translations: [] };
  }
}

export async function fetchBibleChapter(translationSlug: string, bookSlug: string, chapter: number) {
  try {
    const { data: book } = await supabase
      .from('bible_books')
      .select('id, name')
      .eq('code', bookSlug)
      .single();

    if (!book) return null;

    const { data: verses } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book_id', book.id)
      .eq('chapter', chapter)
      .order('verse', { ascending: true });

    return {
      bookName: book.name,
      chapter: chapter,
      verses: (verses || []).map((v: any) => ({
        id: v.id,
        verse: v.verse.toString(),
        content: v.text,
        contentSec: null,
        heading: v.heading || null,
        footnotes: v.footnote || null,
        chapter: chapter,
        bookSlug: bookSlug
      })),
      commentary: null
    };
  } catch (err) {
    console.error('fetchBibleChapter error:', err);
    return null;
  }
}
