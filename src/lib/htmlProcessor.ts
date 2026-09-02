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

export type ImageSizeOption = 'avatar' | 'cover' | 'thumb' | 'raw';

/**
 * Formats any image URL, converting Google Drive preview links into high-speed direct CDN links with dynamic resizing.
 */
export function formatImageUrl(url?: string | null, size: ImageSizeOption = 'raw'): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();

  // 1. Extract Google Drive file ID if present
  let fileId: string | null = null;
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) 
      || trimmed.match(/id=([a-zA-Z0-9_-]+)/)
      || trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
  } else if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    const match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
  }

  // 2. Return optimized size variant if it's a Google CDN image
  if (fileId) {
    switch (size) {
      case 'avatar':
      case 'thumb':
        return `https://lh3.googleusercontent.com/d/${fileId}=w400-h400-c`;
      case 'cover':
        return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
      default:
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  return trimmed;
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
    return formatImageUrl(ogImgMatch[1]);
  }

  // 2. Check first <img> tag
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const src = imgMatch[1].trim();
    if (!src.startsWith('data:image')) {
      return formatImageUrl(src);
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

  // 🌟 Automatically transform all Scripture Quotes & Poetry Blocks to Sacred Scripture Callouts
  cleanHtml = transformScriptureQuotesInHtml(cleanHtml);

  return cleanHtml.trim();
}


// ─── SMART SCRIPTURE QUOTE AUTO-DETECTOR & TRANSFORMER ────────────────────────
const BIBLE_BOOK_MAP: Record<string, string> = {
  'st': 'st', 'sang the': 'st',
  'xh': 'xh', 'xuat hanh': 'xh',
  'lv': 'lv', 'le vi': 'lv',
  'ds': 'ds', 'dan so': 'ds',
  'dnl': 'dnl', 'de nhi luat': 'dnl',
  'gs': 'gs', 'gie-su': 'gs',
  'tp': 'tp', 'thu lanh': 'tp',
  'rt': 'rt', 'rut': 'rt',
  '1sm': '1sm', '1 sm': '1sm',
  '2sm': '2sm', '2 sm': '2sm',
  '1v': '1v', '1 v': '1v',
  '2v': '2v', '2 v': '2v',
  '1sb': '1sb', '1 sb': '1sb',
  '2sb': '2sb', '2 sb': '2sb',
  'ez': 'ez', 'et-ra': 'ez',
  'nh': 'nh', 'ne-khe-mi-a': 'nh',
  'tb': 'tb', 'to-bi-a': 'tb',
  'gdt': 'gdt', 'Giu-di-tha': 'gdt',
  'et': 'et', 'Et-te': 'et',
  '1mcb': '1mcb', '1 mcb': '1mcb',
  '2mcb': '2mcb', '2 mcb': '2mcb',
  'g': 'g', 'giop': 'g',
  'tv': 'tv', 'thanh vinh': 'tv',
  'cn': 'cn', 'cham ngon': 'cn',
  'gl': 'gl', 'giang vien': 'gl',
  'dc': 'dc', 'diem ca': 'dc',
  'kn': 'kn', 'khon ngoan': 'kn',
  'hc': 'hc', 'huan ca': 'hc',
  'is': 'is', 'i-sai-a': 'is',
  'gr': 'gr', 'gie-re-mi-a': 'gr',
  'tc': 'tc', 'ca thuong': 'tc',
  'br': 'br', 'ba-ruc': 'br',
  'ezk': 'ezk', 'e-de-ki-en': 'ezk',
  'dn': 'dn', 'da-ni-en': 'dn',
  'hs': 'hs', 'ho-se': 'hs',
  'ge': 'ge', 'gio-en': 'ge',
  'am': 'am', 'a-mot': 'am',
  'ob': 'ob', 'o-va-di-a': 'ob',
  'gn': 'gn', 'gio-na': 'gn',
  'mi': 'mi', 'mi-kha': 'mi',
  'nhm': 'nhm', 'na-khum': 'nhm',
  'hc_ha': 'hc_ha', 'kha-ba-cuc': 'hc_ha',
  'xp': 'xp', 'xo-pho-ni-a': 'xp',
  'khg': 'khg', 'khat-gai': 'khg',
  'zk': 'zk', 'da-ca-ri-a': 'zk',
  'ml': 'ml', 'ma-la-khi': 'ml',
  // Tan Uoc
  'mt': 'mt', 'mat-theu': 'mt', 'mattheu': 'mt',
  'mc': 'mc', 'mac-co': 'mc', 'macco': 'mc',
  'lc': 'lc', 'lu-ca': 'lc', 'luca': 'lc',
  'ga': 'ga', 'gioan': 'ga', 'gio-an': 'ga',
  'cv': 'cv', 'cong vu': 'cv',
  'rm': 'rm', 'ro-ma': 'rm',
  '1cr': '1cr', '1 cr': '1cr',
  '2cr': '2cr', '2 cr': '2cr',
  'gl_nt': 'gl_nt', 'ga-lat': 'gl_nt',
  'ep': 'ep', 'e-phe-so': 'ep',
  'pl': 'pl', 'phi-lip-phe': 'pl',
  'cl': 'cl', 'co-lo-se': 'cl',
  '1ts': '1ts', '1 ts': '1ts',
  '2ts': '2ts', '2 ts': '2ts',
  '1tm': '1tm', '1 tm': '1tm',
  '2tm': '2tm', '2 tm': '2tm',
  'tt': 'tt', 'ti-to': 'tt',
  'prm': 'prm', 'phi-le-mon': 'prm',
  'dt': 'dt', 'do thai': 'dt', 'hip-ri': 'dt',
  'gc': 'gc', 'gia-co-be': 'gc',
  '1pr': '1pr', '1 pr': '1pr',
  '2pr': '2pr', '2 pr': '2pr',
  '1ga': '1ga', '1 ga': '1ga',
  '2ga': '2ga', '2 ga': '2ga',
  '3ga': '3ga', '3 ga': '3ga',
  'gd': 'gd', 'giu-da': 'gd',
  'kh': 'kh', 'khai huyen': 'kh'
};

function resolveBibleLink(ref: string): { slug: string; chapter: number } | null {
  if (!ref) return null;
  const clean = ref.replace(/[()]/g, '').trim();
  const match = clean.match(/^([1-4]?\s*[A-Za-zÀ-ỹ]+)\s+(\d+)(?:[.,:]\s*\d+.*)?$/);
  if (!match) return null;

  const bookName = match[1].toLowerCase().replace(/\s+/g, ' ').trim();
  const chapter = parseInt(match[2], 10);
  const slug = BIBLE_BOOK_MAP[bookName] || BIBLE_BOOK_MAP[bookName.replace(/\s+/g, '')];

  if (slug && !isNaN(chapter)) {
    return { slug, chapter };
  }
  return null;
}

export function transformScriptureQuotesInHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // 1. Transform poetry blocks & verse divs:
  // e.g. <div class="poetry-block"><div class="poetry-verse">"Ngài phải nổi bật lên, còn tôi phải lu mờ đi." (Ga 3:30)</div></div>
  const poetryBlockRegex = /<div[^>]*class=["'][^"']*poetry-(?:block|verse)[^"']*["'][^>]*>(?:[\s\S]*?<div[^>]*class=["'][^"']*poetry-verse[^"']*["'][^>]*>)?\s*["“]([^"”]+)["”]\s*\((?:x\.\s*)?([1-4]?\s*[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)?\s+\d+(?:[.,:]\s*\d+(?:-\d+)?)?)\)\s*(?:<\/div>)?\s*<\/div>/gi;

  let processed = html.replace(poetryBlockRegex, (match, quoteText, refText) => {
    const trimmedQuote = quoteText.trim();
    const trimmedRef = refText.trim();
    const linkInfo = resolveBibleLink(trimmedRef);
    const bibleLink = linkInfo ? `/kinh-thanh/${linkInfo.slug}/${linkInfo.chapter}` : `/kinh-thanh`;

    return `
<div class="veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “${trimmedQuote}”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="${bibleLink}" target="_blank" title="Tra cứu Lời Chúa trong Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>${trimmedRef}</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>`;
  });

  // 2. Transform standalone paragraph / blockquote scripture quotes:
  // e.g. <p>"Ngài phải nổi bật lên, còn tôi phải lu mờ đi." (Ga 3:30)</p>
  const scriptureParaRegex = /<(?:p|blockquote)[^>]*>\s*["“]([^"”]+)["”]\s*\((?:x\.\s*)?([1-4]?\s*[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)?\s+\d+(?:[.,:]\s*\d+(?:-\d+)?)?)\)\s*<\/(?:p|blockquote)>/gi;

  processed = processed.replace(scriptureParaRegex, (match, quoteText, refText) => {
    const trimmedQuote = quoteText.trim();
    const trimmedRef = refText.trim();
    const linkInfo = resolveBibleLink(trimmedRef);
    const bibleLink = linkInfo ? `/kinh-thanh/${linkInfo.slug}/${linkInfo.chapter}` : `/kinh-thanh`;

    return `
<div class="veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “${trimmedQuote}”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="${bibleLink}" target="_blank" title="Tra cứu Lời Chúa trong Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>${trimmedRef}</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>`;
  });

  return processed;
}