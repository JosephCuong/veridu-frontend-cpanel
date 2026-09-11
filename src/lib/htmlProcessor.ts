/**
 * VERIDU HTML Post Processor Utility
 * 
 * Provides robust HTML parsing, body extraction, title/excerpt/image extraction,
 * sanitization, inline-style normalization, duplicate heading stripping,
 * and element class mapping for the VERIDU Catholic design system.
 */
import {
  parseScriptureReference,
  formatScriptureUrl,
  matchAllScriptureReferences,
} from '@/lib/bibleData';

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
 * Automatically detects and converts all Google Drive image URLs inside HTML
 * (both in <img src="..."> and in CSS/link tags) to Google's direct high-res CDN format
 * (https://lh3.googleusercontent.com/d/FILE_ID) and ensures referrerpolicy="no-referrer" is attached.
 */
export function convertGoogleDriveImagesInHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // 1. Strip wrapping <a> tags that point directly to Google Drive view/preview or Google CDN,
  // so clicking the image opens the in-app Lightbox modal instead of navigating away.
  let out = html.replace(
    /<a\s+[^>]*?href=["']https?:\/\/(?:(?:drive|docs)\.google\.com|lh3\.googleusercontent\.com\/d)[^"']*["'][^>]*>([\s\S]*?<img[\s\S]*?>[\s\S]*?)<\/a>/gi,
    '$1'
  );

  // 2. Convert all <img> src attributes pointing to Google Drive
  out = out.replace(/<img\s+([^>]*?)>/gi, (fullTag, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return fullTag;

    const originalSrc = srcMatch[1];
    let newSrc = originalSrc;
    let isDrive = false;

    if (originalSrc.includes('drive.google.com') || originalSrc.includes('docs.google.com')) {
      const match = originalSrc.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        || originalSrc.match(/[?&]id=([a-zA-Z0-9_-]+)/)
        || originalSrc.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        newSrc = `https://lh3.googleusercontent.com/d/${match[1]}`;
        isDrive = true;
      }
    } else if (originalSrc.includes('lh3.googleusercontent.com/d/')) {
      isDrive = true;
    }

    let updatedAttrs = attrs;
    if (newSrc !== originalSrc) {
      updatedAttrs = updatedAttrs.replace(/src=["'][^"']+["']/i, `src="${newSrc}"`);
    }

    if (isDrive) {
      if (!/referrerpolicy/i.test(updatedAttrs)) {
        updatedAttrs = `referrerpolicy="no-referrer" ${updatedAttrs}`;
      }
      if (!/data-lightbox/i.test(updatedAttrs)) {
        updatedAttrs = `${updatedAttrs} data-lightbox="true"`;
      }
      if (!/class=["'][^"']*rounded-2xl/i.test(updatedAttrs)) {
        if (/class=["']/i.test(updatedAttrs)) {
          updatedAttrs = updatedAttrs.replace(/class=["']([^"']*)["']/i, 'class="$1 max-w-full h-auto rounded-2xl shadow-2xl my-6 cursor-zoom-in hover:scale-[1.01] transition-all duration-300 mx-auto block"');
        } else {
          updatedAttrs = `class="max-w-full h-auto rounded-2xl shadow-2xl my-6 cursor-zoom-in hover:scale-[1.01] transition-all duration-300 mx-auto block" ${updatedAttrs}`;
        }
      }
    }

    return `<img ${updatedAttrs.trim()}>`;
  });

  return out;
}

/**
 * Automatically detects and converts Google Drive audio URLs inside HTML
 * (<source src="..."> or <audio src="...">) to direct high-speed audio streaming links.
 */
export function convertGoogleDriveAudioInHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html.replace(
    /(<(?:source|audio)\s+[^>]*?src=["'])(https?:\/\/(?:drive|docs)\.google\.com\/[^"']+)(["'][^>]*>)/gi,
    (match, prefix, driveUrl, suffix) => {
      const idMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                      driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                      driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return `${prefix}https://docs.google.com/uc?export=download&id=${idMatch[1]}${suffix}`;
      }
      return match;
    }
  );
}

/**
 * Extracts the primary audio URL from HTML (<source src="..."> or <audio src="...">).
 */
export function extractAudioUrlFromHtml(html: string): string | null {
  if (!html || typeof html !== 'string') return null;
  const match = html.match(/<(?:source|audio)\s+[^>]*?src=["']([^"']+)["']/i);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * Extracts the primary video URL from HTML (<iframe>, <video>, or .mp4/.webm sources).
 */
export function extractVideoUrlFromHtml(html: string): string | null {
  if (!html || typeof html !== 'string') return null;
  const match = html.match(/<iframe\s+[^>]*?src=["']([^"']+)["']/i) ||
                html.match(/<video\s+[^>]*?src=["']([^"']+)["']/i) ||
                html.match(/<source\s+[^>]*?src=["']([^"']+\.(?:mp4|webm))["']/i);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * Safely replaces all occurrences of a specific audio source in HTML with a new URL.
 */
export function replaceAudioSrcInHtml(html: string, oldSrc: string, newSrc: string): string {
  if (!html || !oldSrc || !newSrc) return html;
  const escaped = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(<(?:source|audio)\\s+[^>]*?src=["'])${escaped}(["'])`, 'gi');
  return html.replace(regex, `$1${newSrc}$2`);
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
      {
        const href = el.getAttribute('href') || '';
        // Footnote in-text reference
        if (/#(?:fn|footnote)(?!ref)/i.test(href) || el.classList.contains('footnote-ref')) {
          el.classList.add('footnote-ref');
          el.classList.remove('text-amber-600', 'text-amber-500', 'text-amber-400', 'dark:text-amber-400', 'hover:underline');
          break;
        }
        // Footnote backref return button
        if (/#fnref/i.test(href) || el.classList.contains('footnote-backref') || el.classList.contains('footnote-back')) {
          el.classList.add('footnote-backref');
          el.classList.remove('text-amber-600', 'text-amber-500', 'text-amber-400', 'dark:text-amber-400', 'hover:underline');
          el.removeAttribute('aria-label'); // Fix WCAG 2.5.3 (Label in Name)
          const numMatch = href.match(/#fnref[-_:]?(\d+)/i);
          const num = numMatch ? numMatch[1] : '';
          const labelText = num ? `Quay lại vị trí vừa đọc [${num}]` : 'Quay lại vị trí vừa đọc';
          el.setAttribute('title', labelText);
          if (!el.innerHTML.includes('sr-only')) {
            el.innerHTML = `<span aria-hidden="true">&#x21A9;&#xFE0E;</span><span class="sr-only">${labelText}</span>`;
          }
          break;
        }
        if (!el.classList.contains('text-amber-600')) {
          el.classList.add('text-amber-600', 'dark:text-amber-400', 'font-bold', 'hover:underline', 'transition-colors');
        }
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

  // Universally convert Google Drive image & audio links and ensure styling tokens before DOMParser or SSR regex cleaners
  let cleanHtml = convertGoogleDriveAudioInHtml(convertGoogleDriveImagesInHtml(html));

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

      // 6b. Style & Normalize <audio> embeds
      const audioElements = doc.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        if (!audio.hasAttribute('controls')) {
          audio.setAttribute('controls', '');
        }
        audio.classList.add('w-full', 'rounded-lg');

        const parent = audio.parentElement;
        const hasAudioWrapper = parent && (
          parent.classList.contains('veridu-embed-audio') || 
          parent.closest('.veridu-embed-audio')
        );

        if (!hasAudioWrapper && parent) {
          const wrapper = doc.createElement('div');
          wrapper.className = 'veridu-embed-audio my-8 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl not-prose';
          parent.insertBefore(wrapper, audio);
          wrapper.appendChild(audio);
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

  // 🌟 Automatically transform and enhance Footnote In-text refs & Backref return links
  cleanHtml = normalizeFootnotesInHtml(cleanHtml);

  // 🌟 Automatically turn Scripture references into interactive Superlinks with modal query
  cleanHtml = autoLinkScriptureReferences(cleanHtml);

  return cleanHtml.trim();
}

/**
 * Automatically normalizes footnote references in text and inserts return backrefs (↩)
 * into footnote definitions in the article footer.
 */
export function normalizeFootnotesInHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // 1. Normalize in-text footnote links (e.g. <a href="#fn1">[1]</a>)
  // Strips brackets: [1] -> 1, adds id="fnref-1" and class="footnote-ref"
  let out = html.replace(
    /<a\s+([^>]*?)href=["']#(?:fn|footnote)[-_:]?(\d+)["']([^>]*?)>([\s\S]*?)<\/a>/gi,
    (match, pre, num, post, inner) => {
      let attrs = `${pre} ${post}`.trim();
      attrs = attrs.replace(/\bclass=["'][^"']*["']/gi, '');
      if (!attrs.includes('id=')) {
        attrs = `id="fnref-${num}" ` + attrs;
      }
      return `<a href="#fn${num}" ${attrs.trim()} class="footnote-ref" title="Xem chú thích ${num}" aria-label="Xem chú thích ${num}">${num}</a>`;
    }
  );

  // 2. Footnote definitions in <p id="fn1">...</p>
  out = out.replace(
    /<p(\s+[^>]*?id=["'](?:fn|footnote)[-_:]?(\d+)["'][^>]*?)>([\s\S]*?)<\/p>/gi,
    (match, attrs, num, body) => {
      // Strip any previous backref to prevent duplication or stale text
      let cleanBody = body.replace(/<a\s+[^>]*class=["'][^"']*footnote-backref[^"']*["'][\s\S]*?<\/a>/gi, '').trim();
      
      // Cleanly style the leading [num] if present and not already wrapped
      if (!cleanBody.includes('class="footnote-num"') && /^\s*\[\d+\]/.test(cleanBody)) {
        cleanBody = cleanBody.replace(/^\s*\[(\d+)\]/, '<span class="footnote-num font-mono font-bold mr-2">[$1]</span>');
      }

      const backref = `<a href="#fnref-${num}" class="footnote-backref" title="Quay lại vị trí vừa đọc [${num}]"><span aria-hidden="true">&#x21A9;&#xFE0E;</span><span class="sr-only">Quay lại vị trí vừa đọc [${num}]</span></a>`;
      return `<p${attrs}>${cleanBody} ${backref}</p>`;
    }
  );

  // 3. Footnote definitions in <li id="fn1">...</li> or <li id="fn-1">...</li>
  out = out.replace(
    /<li(\s+[^>]*?id=["'](?:fn|footnote)[-_:]?(\d+)["'][^>]*?)>([\s\S]*?)<\/li>/gi,
    (match, attrs, num, body) => {
      // Strip any previous backref
      let cleanBody = body.replace(/<a\s+[^>]*class=["'][^"']*footnote-backref[^"']*["'][\s\S]*?<\/a>/gi, '').trim();

      if (!cleanBody.includes('class="footnote-num"') && /^\s*\[\d+\]/.test(cleanBody)) {
        cleanBody = cleanBody.replace(/^\s*\[(\d+)\]/, '<span class="footnote-num font-mono font-bold mr-2">[$1]</span>');
      }

      const backref = `<a href="#fnref-${num}" class="footnote-backref" title="Quay lại vị trí vừa đọc [${num}]"><span aria-hidden="true">&#x21A9;&#xFE0E;</span><span class="sr-only">Quay lại vị trí vừa đọc [${num}]</span></a>`;
      return `<li${attrs}>${cleanBody} ${backref}</li>`;
    }
  );

  return out;
}


// ─── SMART SCRIPTURE QUOTE AUTO-DETECTOR & TRANSFORMER ────────────────────────

export function resolveBibleLink(ref: string): {
  slug: string;
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  rawRef: string;
  url: string;
} | null {
  if (!ref) return null;
  const parsed = parseScriptureReference(ref);
  if (!parsed) return null;
  return {
    slug: parsed.bookSlug,
    bookName: parsed.bookName,
    chapter: parsed.chapter,
    verseStart: parsed.verseStart,
    verseEnd: parsed.verseEnd,
    rawRef: parsed.rawRef,
    url: formatScriptureUrl(parsed.bookSlug, parsed.chapter, parsed.verseStart, 'ntt')
  };
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
    const bibleLink = linkInfo ? linkInfo.url : `/kinh-thanh`;
    const dataAttrs = linkInfo
      ? `data-book="${linkInfo.slug}" data-book-name="${linkInfo.bookName}" data-chapter="${linkInfo.chapter}" data-verse="${linkInfo.verseStart || 1}" data-verse-end="${linkInfo.verseEnd || linkInfo.verseStart || 1}" data-raw-ref="${trimmedRef}"`
      : '';

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
        <a href="${bibleLink}" target="_blank" rel="noopener noreferrer" ${dataAttrs} title="Tra cứu Lời Chúa: ${trimmedRef}" class="scripture-superlink scripture-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group cursor-pointer">
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
    const bibleLink = linkInfo ? linkInfo.url : `/kinh-thanh`;
    const dataAttrs = linkInfo
      ? `data-book="${linkInfo.slug}" data-book-name="${linkInfo.bookName}" data-chapter="${linkInfo.chapter}" data-verse="${linkInfo.verseStart || 1}" data-verse-end="${linkInfo.verseEnd || linkInfo.verseStart || 1}" data-raw-ref="${trimmedRef}"`
      : '';

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
        <a href="${bibleLink}" target="_blank" rel="noopener noreferrer" ${dataAttrs} title="Tra cứu Lời Chúa: ${trimmedRef}" class="scripture-superlink scripture-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group cursor-pointer">
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

/**
 * Scans article HTML and transforms prose Scripture citations (e.g. "St 1:1-8", "Sm 8, 1", "Ga 3:16")
 * into interactive Scripture Superlinks with modal popover attributes.
 * Safely preserves existing <a> tags, <pre>, <code>, <script>, <style>, <button>, <svg>, <math>, etc.
 */
export function autoLinkScriptureReferences(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Tokenize HTML into tags (<...>) and text content
  const tokens = html.split(/(<[^>]+>)/g);
  let skipDepth = 0;
  const skipTagRegex = /^<\/?(a|button|pre|code|script|style|svg|audio|video|math)\b/i;
  const isStartTag = /^<([a-z0-9]+)\b[^>]*>/i;
  const isEndTag = /^<\/([a-z0-9]+)>/i;

  const result: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token.startsWith('<') && token.endsWith('>')) {
      const startMatch = token.match(isStartTag);
      const endMatch = token.match(isEndTag);

      if (startMatch && skipTagRegex.test(token)) {
        if (!token.endsWith('/>')) {
          skipDepth++;
        }
      } else if (endMatch && skipTagRegex.test(token)) {
        skipDepth = Math.max(0, skipDepth - 1);
      }

      result.push(token);
    } else {
      if (skipDepth === 0 && token.trim().length > 0) {
        const matches = matchAllScriptureReferences(token);
        if (matches.length > 0) {
          let replacedText = token;
          for (let j = matches.length - 1; j >= 0; j--) {
            const m = matches[j];
            const linkTag = `<a href="${m.url}" class="scripture-superlink" data-book="${m.parsed.bookSlug}" data-book-name="${m.parsed.bookName}" data-chapter="${m.parsed.chapter}" data-verse="${m.parsed.verseStart || 1}" data-verse-end="${m.parsed.verseEnd || m.parsed.verseStart || 1}" data-raw-ref="${m.fullMatch}" title="Tra cứu ${m.parsed.bookName} ${m.parsed.chapter}:${m.parsed.verseStart || 1}">${m.fullMatch}</a>`;
            replacedText =
              replacedText.slice(0, m.startIndex) +
              linkTag +
              replacedText.slice(m.endIndex);
          }
          result.push(replacedText);
        } else {
          result.push(token);
        }
      } else {
        result.push(token);
      }
    }
  }

  return result.join('');
}