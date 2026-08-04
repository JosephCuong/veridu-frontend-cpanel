const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Lesson {
  id: string | number;
  title: string;
  slug: string;
  chapterTitle?: string;
  chapterNumber?: number;
  orderNumber?: number;
  duration?: string;
  scriptureReference?: string;
  scripture?: string;
  isCompleted?: boolean;
  article_type?: 'standard' | 'meditation' | 'interactive' | string;
  contentHtml?: string;
  scriptureQuote?: string;
  interactiveHtml?: string;
  videoUrl?: string;
  audioUrl?: string;
  lessonType?: string;
  prayer?: string;
}

export const MOCK_LESSONS: Lesson[] = [];

export interface Course {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  lessonsCount: number;
  totalLessons?: number;
  thumbnail: string;
  instructor: string;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
}

export interface Article {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  category?: string;
  date?: string;
  thumbnail?: string;
  article_type?: string;
  contentHtml?: string;
  scriptureQuote?: string;
  interactiveHtml?: string;
  seo?: any;
}

// ─── Courses (LMS) ────────────────────────────────────────────────────────────

export async function fetchCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${WP_API_BASE}/courses`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('fetchCourses error:', e);
    return [];
  }
}

export async function fetchCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${WP_API_BASE}/courses/detail?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('fetchCourseBySlug error:', e);
    return null;
  }
}

export async function fetchLessonBySlug(slug: string): Promise<Lesson | null> {
  try {
    const res = await fetch(`${WP_API_BASE}/articles/detail?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('fetchLessonBySlug error:', e);
    return null;
  }
}

// ─── Library Articles ────────────────────────────────────────────────────────

export async function getLibraryArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${WP_API_BASE}/veridu_library?_embed=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('getLibraryArticles error:', e);
    return [];
  }
}

export async function getLibraryArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${WP_API_BASE}/veridu_library?slug=${encodeURIComponent(slug)}&_embed=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      return {
        id: item.id,
        title: item.title?.rendered || item.title || '',
        slug: item.slug,
        excerpt: item.excerpt?.rendered || item.excerpt || '',
        contentHtml: item.content?.rendered || item.contentHtml || '',
        article_type: item.article_type || 'standard'
      };
    }
    return null;
  } catch (e) {
    console.error('getLibraryArticleBySlug error:', e);
    return null;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  christianName: string;
  parish: string;
  diocese: string;
  role: string;
  streak: number;
  isAdmin: boolean;
}

export interface AuthResponse {
  status: string;
  token: string;
  user: AuthUser;
  message?: string;
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${WP_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Đăng nhập thất bại');
  }
  return res.json();
}

export async function registerUser(data: {
  email: string;
  password: string;
  displayName: string;
  christianName: string;
  parish: string;
  diocese: string;
  role: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${WP_API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Đăng ký thất bại');
  }
  return res.json();
}

export async function getProfile(token: string): Promise<AuthUser> {
  const res = await fetch(`${WP_API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải hồ sơ người dùng');
  return res.json();
}

// ─── Bible Reader ─────────────────────────────────────────────────────────────

export interface BibleVerse {
  id: number;
  verse: string;
  content: string;
  contentSecondary?: string;
  heading?: string;
}

export interface BibleChapterData {
  commentary: {
    bookName: string;
    chapter: number;
    authorNote?: string;
    audioUrl?: string;
    videoUrl?: string;
    historicalContext?: string;
    theologicalMeaning?: string;
    practicalApplication?: string;
  };
  verses: BibleVerse[];
}

export async function fetchBibleMetadata() {
  try {
    const res = await fetch(`${WP_API_BASE}/bible/metadata`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return { books: [], translations: [] };
    const data = await res.json();
    return {
      books: (data.books || []).map((b: any) => ({
        slug: b.slug,
        nameVi: b.name_vi,
        testament: b.testament,
        totalChapters: parseInt(b.total_chapters, 10)
      })),
      translations: data.translations || []
    };
  } catch (err) {
    console.error('fetchBibleMetadata error:', err);
    return { books: [], translations: [] };
  }
}

export async function fetchBibleChapter(translationSlug: string, bookSlug: string, chapter: number) {
  try {
    const res = await fetch(`${WP_API_BASE}/bible/chapter?translation=${translationSlug}&book=${bookSlug}&chapter=${chapter}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('fetchBibleChapter error:', err);
    return null;
  }
}

// ─── Character Fetcher ────────────────────────────────────────────────────────

export interface Character {
  id: string | number;
  name: string;
  biography: string;
  role: string;
  era: string;
  theology: string;
  avatar_url: string;
}

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const res = await fetch(`${WP_API_BASE}/characters`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhân vật từ API', error);
    return [];
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResults {
  courses: Course[];
  articles: Article[];
}

export async function fetchGlobalSearch(query: string): Promise<SearchResults> {
  if (!query) return { courses: [], articles: [] };
  try {
    const res = await fetch(`${WP_API_BASE}/search?q=${encodeURIComponent(query)}`, {
      cache: 'no-store'
    });
    if (!res.ok) return { courses: [], articles: [] };
    return await res.json();
  } catch (e) {
    console.error('fetchGlobalSearch error:', e);
    return { courses: [], articles: [] };
  }
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEventData {
  id: string;
  wpPostId?: number;
  eraId: string;
  eraName: string;
  title: string;
  timePeriod: string;
  icon: string;
  category: string;
  scripture: string;
  summary: string;
  contentHtml?: string;
  theologicalMeaning: string;
  articleSlug?: string;
  interactiveHtmlUrl?: string;
  thumbnail?: string;
}

export async function fetchTimelineEvents(): Promise<TimelineEventData[]> {
  try {
    const res = await fetch(`${WP_API_BASE}/timeline`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return [];
  }
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

export interface HomepageData {
  settings: {
    hero_image: string;
    youtube_url: string;
  };
  articles: Article[];
}

export async function fetchHomepageData(): Promise<HomepageData | null> {
  try {
    const res = await fetch(`${WP_API_BASE}/homepage`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null;
  }
}
