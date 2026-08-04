export interface BibleBook {
  slug: string;
  nameVi: string;
  testament: 'Cựu Ước' | 'Tân Ước';
  totalChapters: number;
}

export interface BibleTranslation {
  slug: string;
  name: string;
}

export interface BibleVerse {
  id: number;
  verse: string;
  content: string;
  contentSec: string | null;
  heading: string | null;
  footnotes: string | null;
  chapter: number;
  bookSlug: string;
}

export interface ChapterCommentary {
  audioUrl: string | null;
  videoUrl: string | null;
  historicalContext: string | null;
  theologicalMeaning: string | null;
  practicalApplication: string | null;
}
