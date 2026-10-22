/**
 * BILINGUAL MEDIA SYNC & SMART ASSET WEAVING ENGINE
 * 
 * Provides automated, lossless media synchronization between Vietnamese (original)
 * and English (translation) articles.
 * - Silent Auto-Sync: Updates media URLs, alignments, Stained-Glass styling without overwriting English text/captions.
 * - Smart Asset Weaving: Injects high-res Google Drive CDN media from Vietnamese into uploaded external English HTML.
 * - Base64 Bloat Protection: Prevents database overflow and payload limits.
 */

export interface MediaBlockInfo {
  index: number;
  type: 'image' | 'video' | 'audio';
  outerHtml: string;
  sourceUrl: string;
  align: 'center' | 'left' | 'right';
  caption: string;
  author?: string;
  license?: string;
  precedingHeadingText?: string;
  precedingHeadingLevel?: number;
  precedingHeadingIndex?: number;
}

/**
 * Normalizes text for loose heading comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

/**
 * Extracts all media blocks (images, videos, audios) from an HTML document.
 */
export function extractMediaBlocksFromHtml(html: string): MediaBlockInfo[] {
  if (!html || typeof html !== 'string') return [];

  const blocks: MediaBlockInfo[] = [];

  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const allElements = Array.from(doc.body.querySelectorAll('*'));

      let currentHeadingText = '';
      let currentHeadingLevel = 2;
      let headingCount = 0;

      // Track elements
      const mediaElements = doc.body.querySelectorAll(
        'figure.veridu-image-block, figure.wp-block-image, .veridu-embed-video, .veridu-audio-player, figure:has(img)'
      );

      mediaElements.forEach((el, idx) => {
        // Find preceding heading
        let prev = el.previousElementSibling;
        let foundHeading = '';
        let foundLevel = 2;
        let foundIndex = 0;

        while (prev) {
          const tag = prev.tagName.toLowerCase();
          if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
            foundHeading = prev.textContent?.trim() || '';
            foundLevel = parseInt(tag.substring(1), 10);
            foundIndex = headingCount;
            break;
          }
          prev = prev.previousElementSibling;
        }

        // Determine media type & source
        let type: 'image' | 'video' | 'audio' = 'image';
        let sourceUrl = '';
        let align: 'center' | 'left' | 'right' = 'center';
        let caption = '';
        let author = el.getAttribute('data-author') || undefined;
        let license = el.getAttribute('data-license') || undefined;

        if (el.classList.contains('veridu-embed-video') || el.querySelector('iframe')) {
          type = 'video';
          const iframe = el.querySelector('iframe');
          sourceUrl = iframe?.getAttribute('src') || el.getAttribute('data-video-url') || '';
        } else if (el.classList.contains('veridu-audio-player') || el.querySelector('audio')) {
          type = 'audio';
          const audio = el.querySelector('audio, source');
          sourceUrl = audio?.getAttribute('src') || el.getAttribute('data-audio-url') || '';
        } else {
          type = 'image';
          const img = el.querySelector('img');
          sourceUrl = img?.getAttribute('src') || el.getAttribute('data-image-url') || '';
        }

        const figcap = el.querySelector('figcaption');
        if (figcap) {
          caption = figcap.textContent?.trim() || '';
        } else {
          caption = el.getAttribute('data-caption') || '';
        }

        const dataAlign = el.getAttribute('data-align');
        if (dataAlign === 'left' || dataAlign === 'right') {
          align = dataAlign;
        } else if (el.classList.contains('float-left')) {
          align = 'left';
        } else if (el.classList.contains('float-right')) {
          align = 'right';
        }

        blocks.push({
          index: idx,
          type,
          outerHtml: el.outerHTML,
          sourceUrl,
          align,
          caption,
          author,
          license,
          precedingHeadingText: foundHeading,
          precedingHeadingLevel: foundLevel,
          precedingHeadingIndex: foundIndex
        });
      });

      return blocks;
    } catch (e) {
      console.warn('DOMParser failed in extractMediaBlocksFromHtml, falling back to regex:', e);
    }
  }

  // Fallback regex extractor
  const figureRegex = /<figure[^>]*class=["'][^"']*(?:veridu-image-block|wp-block-image)[^"']*["'][^>]*>[\s\S]*?<\/figure>/gi;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = figureRegex.exec(html)) !== null) {
    const outerHtml = match[0];
    const srcMatch = outerHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    const capMatch = outerHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    blocks.push({
      index: idx++,
      type: 'image',
      outerHtml,
      sourceUrl: srcMatch ? srcMatch[1] : '',
      align: outerHtml.includes('float-left') ? 'left' : (outerHtml.includes('float-right') ? 'right' : 'center'),
      caption: capMatch ? capMatch[1].replace(/<[^>]+>/g, '').trim() : ''
    });
  }

  return blocks;
}

/**
 * SILENT AUTO-SYNC:
 * Synchronizes all media blocks (images, videos) from Vietnamese to English HTML.
 * - Updates media URLs, CDN formatting, alignments, attributes.
 * - Preserves existing English translations in <figcaption> if present.
 * - Adds newly added Vietnamese media into English.
 * - Removes media in English if deleted in Vietnamese.
 */
export function silentSyncMediaViToEn(viHtml: string, enHtml: string): string {
  if (!viHtml || !viHtml.trim()) return enHtml;
  if (!enHtml || !enHtml.trim()) return enHtml;

  if (typeof window === 'undefined' || !window.DOMParser) {
    return enHtml; // SSR safety
  }

  try {
    const parser = new DOMParser();
    const viDoc = parser.parseFromString(viHtml, 'text/html');
    const enDoc = parser.parseFromString(enHtml, 'text/html');

    const viMedia = Array.from(
      viDoc.body.querySelectorAll('figure.veridu-image-block, figure.wp-block-image, .veridu-embed-video, .veridu-audio-player')
    );
    const enMedia = Array.from(
      enDoc.body.querySelectorAll('figure.veridu-image-block, figure.wp-block-image, .veridu-embed-video, .veridu-audio-player')
    );

    // 1. If VI has media but EN has none at all, inject all VI media into EN
    if (viMedia.length > 0 && enMedia.length === 0) {
      return weaveMediaIntoEnglishHtml(enHtml, viHtml);
    }

    // 2. Sync corresponding media elements 1-to-1
    viMedia.forEach((viEl, idx) => {
      if (idx < enMedia.length) {
        const enEl = enMedia[idx];

        // Capture existing English caption if present
        const enCaptionEl = enEl.querySelector('figcaption');
        const enCaptionText = enCaptionEl?.textContent?.trim() || '';
        const enCaptionHtml = enCaptionEl?.innerHTML || '';

        // Clone the VI element with pristine Stained-Glass structure & CDN URL
        const updatedEnEl = viEl.cloneNode(true) as HTMLElement;

        // If English already had a translated caption, preserve it!
        if (enCaptionText && enCaptionText.length > 0 && enCaptionText !== viEl.querySelector('figcaption')?.textContent?.trim()) {
          const newCaptionEl = updatedEnEl.querySelector('figcaption');
          if (newCaptionEl) {
            newCaptionEl.innerHTML = enCaptionHtml;
          }
        } else {
          // Check if VI block has a pre-defined data-caption-en attribute
          const rawCaptionEn = viEl.getAttribute('data-caption-en');
          if (rawCaptionEn) {
            try {
              const decodedCapEn = decodeURIComponent(rawCaptionEn);
              if (decodedCapEn.trim()) {
                let newCaptionEl = updatedEnEl.querySelector('figcaption');
                if (!newCaptionEl) {
                  newCaptionEl = document.createElement('figcaption');
                  newCaptionEl.className = 'mt-3 text-center text-xs font-serif text-[var(--text-muted)] italic';
                  updatedEnEl.appendChild(newCaptionEl);
                }
                const captionSpan = newCaptionEl.querySelector('span');
                if (captionSpan) {
                  captionSpan.textContent = decodedCapEn;
                } else {
                  newCaptionEl.textContent = decodedCapEn;
                }
              }
            } catch (e) {
              console.warn('Failed to decode data-caption-en:', e);
            }
          }
        }

        // Replace EN element in place
        enEl.parentNode?.replaceChild(updatedEnEl, enEl);
      } else {
        // VI has an extra media item added at the end or newly inserted
        const newMediaEl = viEl.cloneNode(true) as HTMLElement;
        enDoc.body.appendChild(newMediaEl);
      }
    });

    // 3. If EN has more media than VI (VI deleted some), remove excess
    if (enMedia.length > viMedia.length) {
      for (let i = viMedia.length; i < enMedia.length; i++) {
        enMedia[i].remove();
      }
    }

    return enDoc.body.innerHTML;
  } catch (err) {
    console.error('Error in silentSyncMediaViToEn:', err);
    return enHtml;
  }
}

/**
 * SMART ASSET WEAVING:
 * When an author uploads an English HTML file (translated externally via Word/Docs/AI),
 * this function parses both documents, strips broken/local dummy images in the English file,
 * and seamlessly weaves the high-res Google Drive CDN media blocks from the Vietnamese article
 * into the matching H2-H4 sections and paragraphs of the English article.
 */
export function weaveMediaIntoEnglishHtml(enRawHtml: string, viHtml: string): string {
  if (!enRawHtml || !enRawHtml.trim()) return enRawHtml;
  if (!viHtml || !viHtml.trim()) return enRawHtml;

  if (typeof window === 'undefined' || !window.DOMParser) {
    return enRawHtml;
  }

  try {
    const parser = new DOMParser();
    const viDoc = parser.parseFromString(viHtml, 'text/html');
    const enDoc = parser.parseFromString(enRawHtml, 'text/html');

    // 1. Strip local, dummy or broken images in uploaded English HTML (e.g. file://, blob:, local rel paths)
    const enExistingImgs = enDoc.body.querySelectorAll('img');
    enExistingImgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      // If it's a dummy local image or base64, remove or clean
      if (src.startsWith('file:') || src.startsWith('blob:') || (!src.startsWith('http') && !src.startsWith('/'))) {
        const parentFigure = img.closest('figure');
        if (parentFigure) {
          parentFigure.remove();
        } else {
          img.remove();
        }
      }
    });

    // 2. Extract media from VI with their section positions
    const viMediaElements = Array.from(
      viDoc.body.querySelectorAll('figure.veridu-image-block, figure.wp-block-image, .veridu-embed-video, .veridu-audio-player')
    );

    if (viMediaElements.length === 0) {
      return enDoc.body.innerHTML;
    }

    // Map each VI media item to its relative location (heading index or paragraph index)
    const viHeadings = Array.from(viDoc.body.querySelectorAll('h1, h2, h3, h4'));
    const enHeadings = Array.from(enDoc.body.querySelectorAll('h1, h2, h3, h4'));
    const enParagraphs = Array.from(enDoc.body.querySelectorAll('p'));

    viMediaElements.forEach((viMedia, mediaIdx) => {
      // Find which heading precedes this media element in VI
      let prev = viMedia.previousElementSibling;
      let headingIndex = -1;

      while (prev) {
        const foundIdx = viHeadings.indexOf(prev as Element);
        if (foundIdx !== -1) {
          headingIndex = foundIdx;
          break;
        }
        prev = prev.previousElementSibling;
      }

      const mediaClone = viMedia.cloneNode(true) as HTMLElement;

      // Case A: Preceding heading matches by index in EN
      if (headingIndex !== -1 && headingIndex < enHeadings.length) {
        const targetHeading = enHeadings[headingIndex];
        // Insert after heading or after the next paragraph under this heading
        const nextP = targetHeading.nextElementSibling;
        if (nextP && nextP.tagName.toLowerCase() === 'p') {
          nextP.after(mediaClone);
        } else {
          targetHeading.after(mediaClone);
        }
      } 
      // Case B: Distributed evenly across English paragraphs
      else if (enParagraphs.length > 0) {
        const step = Math.max(1, Math.floor(enParagraphs.length / (viMediaElements.length + 1)));
        const targetPIndex = Math.min((mediaIdx + 1) * step, enParagraphs.length - 1);
        enParagraphs[targetPIndex].after(mediaClone);
      } 
      // Case C: Append to end of body
      else {
        enDoc.body.appendChild(mediaClone);
      }
    });

    return enDoc.body.innerHTML;
  } catch (err) {
    console.error('Error in weaveMediaIntoEnglishHtml:', err);
    return enRawHtml;
  }
}

/**
 * BASE64 ANTI-BLOAT GUARDIAN:
 * Checks for oversized base64 data URLs in HTML that cause database payload bloat.
 */
export function checkBase64Bloat(html: string, thresholdBytes: number = 30000): {
  hasBloat: boolean;
  bloatCount: number;
  totalBloatSizeKb: number;
} {
  if (!html) return { hasBloat: false, bloatCount: 0, totalBloatSizeKb: 0 };

  const matches = html.match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]{1000,}/gi);
  if (!matches || matches.length === 0) {
    return { hasBloat: false, bloatCount: 0, totalBloatSizeKb: 0 };
  }

  let totalLength = 0;
  let count = 0;

  for (const match of matches) {
    if (match.length > thresholdBytes) {
      count++;
      totalLength += match.length;
    }
  }

  return {
    hasBloat: count > 0,
    bloatCount: count,
    totalBloatSizeKb: Math.round(totalLength / 1024)
  };
}
