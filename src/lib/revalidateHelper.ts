import { revalidatePath } from 'next/cache';
import { getArticleEnSlug } from '@/lib/slugHelper';

/**
 * Targeted ISR cache invalidation for article mutations.
 * Avoids `revalidatePath('/', 'layout')` which would unnecessarily purge every Bible,
 * Catechism, and unrelated article cache entry on a single post edit.
 */
export function revalidatePostPaths(options?: {
  slug?: string | null;
  previousSlug?: string | null;
  titleEn?: string | null;
  previousTitleEn?: string | null;
}) {
  try {
    revalidatePath('/');
    revalidatePath('/thu-vien');
    revalidatePath('/en');
    revalidatePath('/sitemap.xml');

    const slugs = new Set<string>();
    if (options?.slug) slugs.add(options.slug);
    if (options?.previousSlug) slugs.add(options.previousSlug);

    for (const s of slugs) {
      revalidatePath(`/${s}`);
      revalidatePath(`/en/${s}`);
      revalidatePath(`/thu-vien/${s}`);
    }

    if (options?.titleEn) {
      const enSlug = getArticleEnSlug({ title_en: options.titleEn, slug: options.slug || undefined });
      if (enSlug) revalidatePath(`/en/${enSlug}`);
    }
    if (options?.previousTitleEn) {
      const prevEnSlug = getArticleEnSlug({ title_en: options.previousTitleEn, slug: options.previousSlug || undefined });
      if (prevEnSlug) revalidatePath(`/en/${prevEnSlug}`);
    }
  } catch (err) {
    console.warn('Targeted post cache revalidation warning:', err);
  }
}
