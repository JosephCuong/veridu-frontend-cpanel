/**
 * Universal URL Slug Generator for Vietnamese & English (International SEO)
 */
export function slugify(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')     // Remove special characters, punctuation, colons
    .trim()
    .replace(/\s+/g, '-')             // Replace whitespace with hyphens
    .replace(/-+/g, '-');             // Remove duplicate hyphens
}

/**
 * Returns the canonical English SEO slug for an article if available,
 * falling back to the primary slug.
 */
export function getArticleEnSlug(article: { title_en?: string | null; slug?: string }): string {
  if (article.title_en && article.title_en.trim()) {
    const candidate = slugify(article.title_en);
    if (candidate) return candidate;
  }
  return article.slug || '';
}
