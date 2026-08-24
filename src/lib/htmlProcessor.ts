/**
 * VERIDU HTML Post Processor Utility
 * 
 * Provides robust HTML parsing, body extraction, title/excerpt/image extraction,
 * sanitization, inline-style normalization, duplicate heading stripping,
 * and element class mapping for the VERIDU Catholic design system.
 */

/**
 * Strips HTML tags and decodes common HTML entities to return clean plain text.
 */
export function cleanText(rawText: string): string {
  if (!rawText) return '';
  const textWithoutTags = rawText.replace(/<[^>]*>/g, ' ');
  const decoded = textWithoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts title string from HTML with priority order: <h1> -> <title> -> <h2>.
 */
export function extractTitleFromHtml(html: string): string | null {
  if (!html || typeof html !== 'string' || !html.trim()) {
    return null;
  }

  // 1. DOMParser (Browser Environment)
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Priority 1: <h1> tag content
      const h1 = doc.querySelector('h1');
      if (h1 && h1.textContent) {
        const cleaned = cleanText(h1.textContent);
        if (cleaned) return cleaned;
      }

      // Priority 2: <title> tag content
      const titleTag = doc.querySelector('title');
      if (titleTag && titleTag.textContent) {
        const cleaned = cleanText(titleTag.textContent);
        if (cleaned) return cleaned;
      }

      // Priority 3: <h2> tag content
      const h2 = doc.querySelector('h2');
      if (h2 && h2.textContent) {
        const cleaned = cleanText(h2.textContent);
        if (cleaned) return cleaned;
      }
    } catch (err) {
      console.warn('DOMParser error in extractTitleFromHtml:', err);
    }
  }

  // 2. Regex Fallback
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const cleaned = cleanText(h1Match[1]);
    if (cleaned) return cleaned;
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const cleaned = cleanText(titleMatch[1]);
    if (cleaned) return cleaned;
  }

  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2Match && h2Match[1]) {
    const cleaned = cleanText(h2Match[1]);
    if (cleaned) return cleaned;
  }

  return null;
}

/**
 * Extracts a concise excerpt / summary string from HTML (meta description, lead paragraph, or first <p>).
 */
export function extractExcerptFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // 1. Check <meta name="description" content="...">
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) 
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  if (metaDescMatch && metaDescMatch[1]) {
    return cleanText(metaDescMatch[1]).slice(0, 220);
  }

  // 2. Check first paragraph <p> with meaningful text
  const pMatches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of pMatches) {
    const text = cleanText(match[1]);
    if (text && text.length > 25) {
      return text.slice(0, 220) + (text.length > 220 ? '...' : '');
    }
  }

  return '';
}

/**
 * Extracts the first prominent image URL from HTML (og:image or first <img> tag).
 */
export function extractFeaturedImageFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // 1. Check <meta property="og:image" content="...">
  const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  if (ogImgMatch && ogImgMatch[1]) {
    return ogImgMatch[1].trim();
  }

  // 2. Check first <img> tag
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const src = imgMatch[1].trim();
    if (!src.startsWith('data:image')) {
      const driveMatch = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || src.match(/id=([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
      }
      return src;
    }
  }

  return '';
}

/**
 * Strips layout-breaking inline styles (width, max-width, margins, absolute colors)
 */
function cleanInlineStyle(styleAttr: string): string {
  if (!styleAttr || !styleAttr.trim()) return '';
  const declarations = styleAttr.split(';');
  const cleanedDeclarations = declarations.filter((decl) => {
    const trimmed = decl.trim();
    if (!trimmed) return false;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return true;

    const prop = trimmed.slice(0, colonIdx).trim().toLowerCase();

    // Strip layout constrainers that squash the page
    if (
      prop === 'max-width' || 
      prop === 'min-width' || 
      prop === 'width' || 
      prop === 'margin' || 
      prop === 'margin-left' || 
      prop === 'margin-right' ||
      prop === 'color' || 
      prop === '-webkit-text-fill-color' ||
      prop === 'background' || 
      prop === 'background-color' ||
      prop === 'font-family'
    ) {
      return false;
    }

    return true;
  });

  return cleanedDeclarations.join('; ').trim();
}

/**
 * Maps standard HTML elements to VERIDU Tailwind design system classes.
 */
function mapElementClasses(el: Element): void {
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'h1':
    case 'h2':
      if (!el.classList.contains('font-serif')) {
        el.classList.add('font-serif', 'font-black', 'text-2xl', 'sm:text-3xl', 'text-[var(--text-main)]', 'mt-10', 'mb-4', 'leading-tight', 'border-b', 'border-[var(--border-card)]', 'pb-2');
      }
      break;
    case 'h3':
      if (!el.classList.contains('font-serif')) {
        el.classList.add('font-serif', 'font-bold', 'text-xl', 'sm:text-2xl', 'text-[var(--text-main)]', 'mt-8', 'mb-3', 'leading-snug');
      }
      break;
    case 'h4':
      if (!el.classList.contains('font-serif')) {
        el.classList.add('font-serif', 'font-bold', 'text-lg', 'text-amber-600', 'dark:text-amber-400', 'mt-6', 'mb-2');
      }
      break;
    case 'p':
      if (!el.classList.contains('leading-relaxed')) {
        el.classList.add('leading-relaxed', 'my-4', 'text-[var(--text-main)]', 'text-base', 'sm:text-lg');
      }
      break;
    case 'blockquote':
      if (!el.classList.contains('border-l-4')) {
        el.classList.add(
          'border-l-4',
          'border-amber-500/80',
          'bg-amber-500/5',
          'p-4',
          'rounded-r-2xl',
          'italic',
          'text-[var(--text-main)]',
          'my-6'
        );
      }
      break;
    case 'img':
      {
        const src = el.getAttribute('src');
        if (src) {
          const driveMatch = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || src.match(/id=([a-zA-Z0-9_-]+)/);
          if (driveMatch && driveMatch[1]) {
            el.setAttribute('src', `https://lh3.googleusercontent.com/d/${driveMatch[1]}`);
          }
          el.setAttribute('referrerpolicy', 'no-referrer');
        }
        if (!el.classList.contains('rounded-2xl')) {
          el.classList.add('max-w-full', 'h-auto', 'rounded-2xl', 'shadow-2xl', 'my-6', 'cursor-zoom-in', 'hover:scale-[1.01]', 'transition-all', 'duration-300', 'mx-auto', 'block');
        }
        el.setAttribute('data-lightbox', 'true');
      }
      break;
    case 'table':
      if (!el.classList.contains('border-collapse')) {
        el.classList.add(
          'w-full',
          'my-6',
          'text-left',
          'border-collapse',
          'border',
          'border-[var(--border-card)]'
        );
      }
      break;
    case 'th':
      if (!el.classList.contains('bg-amber-500/10')) {
        el.classList.add(
          'p-3',
          'font-bold',
          'bg-amber-500/10',
          'text-amber-500',
          'border',
          'border-[var(--border-card)]'
        );
      }
      break;
    case 'td':
      if (!el.classList.contains('border-[var(--border-card)]')) {
        el.classList.add('p-3', 'border', 'border-[var(--border-card)]');
      }
      break;
    case 'a':
      if (!el.classList.contains('text-amber-600')) {
        el.classList.add('text-amber-600', 'dark:text-amber-400', 'font-bold', 'hover:underline', 'transition-colors');
      }
      break;
    case 'ul':
      if (!el.classList.contains('list-disc')) {
        el.classList.add('list-disc', 'list-inside', 'my-4', 'space-y-2', 'text-[var(--text-main)]');
      }
      break;
    case 'ol':
      if (!el.classList.contains('list-decimal')) {
        el.classList.add('list-decimal', 'list-inside', 'my-4', 'space-y-2', 'text-[var(--text-main)]');
      }
      break;
  }
}

/**
 * Robust Normalizer & Sanitizer:
 * Extracts inner <body> HTML, strips document wrappers, strips intrusive <style>/<script>,
 * removes duplicate <h1> matching the main title, cleans inline styles, and maps design classes.
 */
export function normalizeAndSyncHtml(
  html: string, 
  stripClasses: boolean = false, 
  isInteractiveDoc: boolean = false
): string {
  if (!html || typeof html !== 'string') return '';

  if (isInteractiveDoc) {
    return html.trim();
  }

  let cleanHtml = html;

  // DOMParser path (Browser Environment)
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');

      // 1. Extract only the inner body if full document
      const body = doc.body;

      // 2. Remove <script> tags (except mermaid scripts)
      const scripts = doc.querySelectorAll('script');
      scripts.forEach((s) => {
        if (!s.textContent?.includes('mermaid')) {
          s.remove();
        }
      });

      // 3. Remove all intrusive <style> and <link> tags
      const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach((s) => s.remove());

      // 4. Remove embedded TOC containers
      const tocs = doc.querySelectorAll('.toc, #toc, [class*="toc-"], [id*="toc-"], nav#table-of-contents');
      tocs.forEach((t) => t.remove());

      // 5. Remove duplicate main <h1> tag inside body (since page header already renders it)
      const firstH1 = body.querySelector('h1');
      if (firstH1) {
        firstH1.remove();
      }

      // 6. Style <iframe> embeds
      const iframes = doc.querySelectorAll('iframe');
      const trustedIframeRegex = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|soundcloud\.com|google\.com\/maps|spotify\.com|drive\.google\.com)/i;
      iframes.forEach((iframe) => {
        let src = iframe.getAttribute('src') || '';
        if (!trustedIframeRegex.test(src)) {
          iframe.remove();
        } else {
          if (/drive\.google\.com/i.test(src)) {
            const match = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || src.match(/id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
              src = `https://drive.google.com/file/d/${match[1]}/preview`;
              iframe.setAttribute('src', src);
            }
          }
          iframe.classList.add('w-full', 'h-full', 'border-none', 'rounded-2xl');
          
          const parent = iframe.parentElement;
          if (parent && !parent.classList.contains('aspect-video')) {
            const wrapper = doc.createElement('div');
            wrapper.className = 'w-full aspect-video rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-6 bg-black relative z-10';
            parent.insertBefore(wrapper, iframe);
            wrapper.appendChild(iframe);
          }
        }
      });

      // 7. Sanitize attributes, inline styles, and map element classes
      const allElements = body.querySelectorAll('*');
      allElements.forEach((el) => {
        // Remove event handlers
        Array.from(el.attributes).forEach((attr) => {
          if (attr.name.toLowerCase().startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });

        // Neutralize javascript: URIs
        const href = el.getAttribute('href');
        if (href && /^javascript:/i.test(href.trim())) {
          el.setAttribute('href', '#');
        }
        const src = el.getAttribute('src');
        if (src && /^javascript:/i.test(src.trim()) && el.tagName.toLowerCase() !== 'iframe') {
          el.removeAttribute('src');
        }

        // Clean hardcoded inline styles
        if (el.hasAttribute('style')) {
          const styleAttr = el.getAttribute('style') || '';
          const cleanedStyle = cleanInlineStyle(styleAttr);
          if (cleanedStyle) {
            el.setAttribute('style', cleanedStyle);
          } else {
            el.removeAttribute('style');
          }
        }

        if (stripClasses && el.tagName.toLowerCase() !== 'iframe') {
          el.removeAttribute('class');
        }

        mapElementClasses(el);
      });

      cleanHtml = body.innerHTML;
    } catch (err) {
      console.warn('DOMParser failed in normalizeAndSyncHtml, using fallback:', err);
    }
  }

  // Fallback Regex Cleaners (if DOMParser not available or SSR)
  cleanHtml = cleanHtml
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<html[\s\S]*?>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, (m) => m.includes('mermaid') ? m : '')
    .replace(/<div\s+class=["'][^"']*toc[^"']*["'][\s\S]*?<\/div>/gi, '');

  return cleanHtml.trim();
}
