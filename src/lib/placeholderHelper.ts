export type VeriduPlaceholderVariant =
  | 'article'
  | 'scripture'
  | 'course'
  | 'music'
  | 'advent';

export const VERIDU_PLACEHOLDER_MAP: Record<VeriduPlaceholderVariant, string> = {
  article: '/images/placeholders/veridu-article.svg',
  scripture: '/images/placeholders/veridu-scripture.svg',
  course: '/images/placeholders/veridu-course.svg',
  music: '/images/placeholders/veridu-music.svg',
  advent: '/images/placeholders/veridu-advent.svg',
};

export function resolveVeriduPlaceholderVariant(hint?: string | null): VeriduPlaceholderVariant {
  if (!hint) return 'article';
  const normalized = hint.toLowerCase();

  if (
    normalized.includes('vọng') ||
    normalized.includes('advent') ||
    normalized.includes('giáng sinh') ||
    normalized.includes('o adonai')
  ) {
    return 'advent';
  }
  if (
    normalized.includes('nhạc') ||
    normalized.includes('đáp ca') ||
    normalized.includes('thánh ca') ||
    normalized.includes('music')
  ) {
    return 'music';
  }
  if (
    normalized.includes('khóa học') ||
    normalized.includes('course') ||
    normalized.includes('đào tạo') ||
    normalized.includes('lms')
  ) {
    return 'course';
  }
  if (
    normalized.includes('kinh thánh') ||
    normalized.includes('scripture') ||
    normalized.includes('cựu ước') ||
    normalized.includes('tân ước') ||
    normalized.includes('thánh vịnh')
  ) {
    return 'scripture';
  }
  return 'article';
}

export function getVeriduPlaceholderUrl(hint?: string | null): string {
  const variant = resolveVeriduPlaceholderVariant(hint);
  return VERIDU_PLACEHOLDER_MAP[variant];
}
