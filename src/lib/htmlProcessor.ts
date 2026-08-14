/**
 * VERIDU HTML Post Processor Utility
 * 
 * Provides HTML parsing, title extraction, sanitization,
 * inline-style normalization for theme variable compatibility,
 * optional class stripping, and element class mapping for the VERIDU Tailwind design system.
 */

/**
 * Strips HTML tags and decodes common HTML entities to return clean plain text.
 */
function cleanText(rawText: string): string {
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
 * Uses DOMParser in browser environments and regex fallback in SSR environments.
 * Cleanly strips nested tags and returns trimmed text string or null.
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

  // 2. Regex Fallback (SSR / Node / DOMParser failure)
  // Priority 1: <h1>
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const cleaned = cleanText(h1Match[1]);
    if (cleaned) return cleaned;
  }

  // Priority 2: <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const cleaned = cleanText(titleMatch[1]);
    if (cleaned) return cleaned;
  }

  // Priority 3: <h2>
  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2Match && h2Match[1]) {
    const cleaned = cleanText(h2Match[1]);
    if (cleaned) return cleaned;
  }

  return null;
}

/**
 * Strips hardcoded inline text color and background color rules from style declarations
 * so native VERIDU theme variables (var(--bg-card), var(--text-main), etc.) work properly.
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

    // Strip text color rules that override dark/light theme variables
    if (prop === 'color' || prop === '-webkit-text-fill-color') {
      return false;
    }

    // Strip background and background-color rules that override dark/light theme variables
    if (prop === 'background' || prop === 'background-color') {
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
    case 'blockquote':
      if (!el.classList.contains('border-l-4')) {
        el.classList.add(
          'border-l-4',
          'border-amber-500/60',
          'pl-4',
          'py-1',
          'italic',
          'text-[var(--text-muted)]',
          'my-4'
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
        }
        if (!el.classList.contains('rounded-2xl')) {
          el.classList.add('max-w-full', 'h-auto', 'rounded-2xl', 'shadow-2xl', 'my-6', 'cursor-zoom-in', 'hover:scale-[1.01]', 'transition-all', 'duration-300', 'mx-auto', 'block');
        }
        el.setAttribute('data-lightbox', 'true');
      }
      break;

    case 'figure':
      if (!el.classList.contains('my-8')) {
        el.classList.add('my-8', 'text-center', 'mx-auto', 'group/figure');
      }
      break;

    case 'figcaption':
      if (!el.classList.contains('text-xs')) {
        el.classList.add('text-xs', 'italic', 'text-[var(--text-muted)]', 'mt-2.5', 'tracking-wide', 'font-sans', 'text-center');
      }
      break;


    case 'hr':
      if (!el.classList.contains('border-[var(--border-card)]')) {
        el.classList.add('border-[var(--border-card)]', 'my-8');
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
          'text-amber-400',
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
      if (!el.classList.contains('text-amber-800')) {
        el.classList.add('text-amber-800', 'dark:text-amber-400', 'font-bold', 'hover:text-amber-600', 'dark:hover:text-amber-300', 'underline', 'transition-colors');
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
    case 'h2':
      if (!el.classList.contains('font-serif')) {
        el.classList.add('font-serif', 'font-bold', 'text-2xl', 'text-amber-500', 'mt-8', 'mb-4', 'drop-shadow-sm');
      }
      break;
    case 'h3':
      if (!el.classList.contains('font-serif')) {
        el.classList.add('font-serif', 'font-bold', 'text-xl', 'text-[var(--text-main)]', 'mt-6', 'mb-3');
      }
      break;
    case 'p':
      // Don't add classes if it's already styled or inside a blockquote
      if (!el.className) {
        el.classList.add('mb-4', 'leading-relaxed');
      }
      break;
  }
}

/**
 * Regex fallback for normalization when DOMParser is unavailable.
 */
function normalizeAndSyncHtmlFallback(html: string, stripClasses: boolean = false): string {
  let result = html;

  // Extract inner HTML of <body> if full document format
  const bodyMatch = result.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    result = bodyMatch[1];
  } else {
    result = result.replace(/<!DOCTYPE[^>]*>/gi, '');
    result = result.replace(/<html[^>]*>|<\/html>/gi, '');
    result = result.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  }

  // Strip <script> and <style> tags
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Strip embedded TOC elements from imported HTML files
  result = result.replace(/<(div|nav|aside|section)[^>]*?(class|id)=["'][^"']*\btoc\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, '');

  // Strip <iframe> unless trusted embed
  const trustedIframeRegex = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|soundcloud\.com|google\.com\/maps|spotify\.com)/i;
  result = result.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, (match) => {
    if (trustedIframeRegex.test(match)) {
      return match;
    }
    return '';
  });

  // Strip inline event attributes (onload, onerror, onclick, etc.)
  result = result.replace(/\s*on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Neutralize javascript: URIs
  result = result.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  result = result.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');

  // Clean inline styles
  result = result.replace(/style\s*=\s*["']([^"']*)["']/gi, (_match, styleContent) => {
    const cleaned = cleanInlineStyle(styleContent);
    return cleaned ? `style="${cleaned}"` : '';
  });

  if (stripClasses) {
    result = result.replace(/class\s*=\s*["'][^"']*["']/gi, '');
  }

  return result;
}

/**
 * Normalizes and sanitizes raw HTML:
 * - Extracts inner HTML of <body> if full document (<html>...<body>...</body></html>)
 * - Sanitizes content by stripping <script>, <style>, untrusted <iframe>, and inline event attributes
 * - Strips hardcoded inline text/background colors to work natively with VERIDU CSS variables
 * - Optionally strips all original classes from elements (except allowed embeds)
 * - Maps standard HTML elements to VERIDU Tailwind design system classes
 */
export function normalizeAndSyncHtml(
  html: string, 
  stripClasses: boolean = false, 
  isInteractiveDoc: boolean = false
): string {
  if (!html || typeof html !== 'string') return '';

  // If it's a full interactive document (starts with <!DOCTYPE html> or <html> or explicitly marked),
  // preserve the full document intact so 3D scripts, styles, and controls function inside the iframe.
  const isFullDoc = isInteractiveDoc || /<!DOCTYPE\s+html/i.test(html) || /<html[\s>]/i.test(html);
  if (isFullDoc) {
    return html.trim();
  }

  let cleanHtml = html;

  // DOMParser path (Browser Environment)
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');

      // 1. Remove <script> tags
      const scripts = doc.querySelectorAll('script');
      scripts.forEach((s) => s.remove());

      // 2. Remove <style> tags
      const styles = doc.querySelectorAll('style');
      styles.forEach((s) => s.remove());

      // 2b. Remove embedded TOC containers
      const tocs = doc.querySelectorAll('.toc, #toc, [class*="toc-"], [id*="toc-"]');
      tocs.forEach((t) => t.remove());

      // 3. Filter & style <iframe> embeds (YouTube, Vimeo, Google Drive Video, Maps, Spotify)
      const iframes = doc.querySelectorAll('iframe');
      const trustedIframeRegex = /(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|soundcloud\.com|google\.com\/maps|spotify\.com|drive\.google\.com)/i;
      iframes.forEach((iframe) => {
        let src = iframe.getAttribute('src') || '';
        if (!trustedIframeRegex.test(src)) {
          iframe.remove();
        } else {
          // Auto-convert Google Drive Video links to embed preview URL
          if (/drive\.google\.com/i.test(src)) {
            const match = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || src.match(/id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
              src = `https://drive.google.com/file/d/${match[1]}/preview`;
              iframe.setAttribute('src', src);
            }
          }
          iframe.classList.add('w-full', 'h-full', 'border-none', 'rounded-2xl');
          
          // Wrap iframe in responsive 16:9 glassmorphic container if not already wrapped
          const parent = iframe.parentElement;
          if (parent && !parent.classList.contains('aspect-video')) {
            const wrapper = doc.createElement('div');
            wrapper.className = 'w-full aspect-video rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-6 bg-black relative z-10';
            parent.insertBefore(wrapper, iframe);
            wrapper.appendChild(iframe);
          }
        }
      });


      // 4. Sanitize attributes, inline styles, and map element classes
      const allElements = doc.querySelectorAll('*');
      allElements.forEach((el) => {
        // Remove event handlers (onload, onerror, onclick, etc.)
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

        // Optionally strip all custom classes (unless it's our iframe embed we just styled)
        if (stripClasses && el.tagName.toLowerCase() !== 'iframe') {
          el.removeAttribute('class');
        }

        // Map design system classes
        mapElementClasses(el);
      });

      cleanHtml = doc.body.innerHTML;
    } catch (err) {
      console.warn('DOMParser failed in normalizeAndSyncHtml, using fallback:', err);
      cleanHtml = normalizeAndSyncHtmlFallback(cleanHtml, stripClasses);
    }
  } else {
    cleanHtml = normalizeAndSyncHtmlFallback(cleanHtml, stripClasses);
  }

  return cleanHtml.trim();
}
