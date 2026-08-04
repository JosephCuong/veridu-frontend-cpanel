import { supabase } from './supabaseClient';

export interface Article {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  category?: string;
  featured_image?: string;
  article_type?: string;
  created_at?: string;
}

export interface Character {
  id: string | number;
  name: string;
  biography: string;
  role: string;
  era: string;
  theology: string;
  avatar_url: string;
}

export interface TimelineEventData {
  id: string | number;
  eraId?: string;
  eraName?: string;
  title: string;
  timePeriod: string;
  icon?: string;
  category?: string;
  articleSlug?: string;
  interactiveHtmlUrl?: string;
  thumbnail?: string;
  description?: string;
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
      category: item.category || 'Các Thánh',
      featured_image: item.featured_image || '',
      article_type: (item.category === 'Bài Tương Tác HTML 3D' || item.category === 'Tương Tác 3D') ? 'interactive' : (item.category === 'Suy Niệm' ? 'meditation' : 'standard'),
      created_at: item.created_at
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
      category: data.category || 'Các Thánh',
      featured_image: data.featured_image || '',
      article_type: (data.category === 'Bài Tương Tác HTML 3D' || data.category === 'Tương Tác 3D') ? 'interactive' : (data.category === 'Suy Niệm' ? 'meditation' : 'standard'),
      created_at: data.created_at
    };
  } catch (e) {
    console.error('getLibraryArticleBySlug error:', e);
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
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      name: p.full_name || p.email,
      biography: `Tín hữu ${p.full_name || p.email}`,
      role: p.role || 'Học Viên',
      era: 'Hiện đại',
      theology: 'Công Giáo',
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
        footnote: v.footnote
      }))
    };
  } catch (err) {
    console.error('fetchBibleChapter error:', err);
    return null;
  }
}
