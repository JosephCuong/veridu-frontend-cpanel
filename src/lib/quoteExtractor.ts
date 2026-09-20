/**
 * Utility: Sacred Scripture Block & Image Extractor for VERIDU
 * Bắt chính xác duy nhất Khối Lời Chúa Soi Đường chuẩn HTML (.sacred-scripture / .veridu-scripture-quote)
 * trong 9 khối chuẩn của VERIDU. Nếu không có khối này, để trống hoàn toàn để người dùng tự do nhập liệu.
 */

export interface SacredScriptureData {
  quote: string;
  source: string;
}

export interface ExtractedArticleMedia {
  sacredScripture: SacredScriptureData;
  images: string[];
}

/**
 * Trích xuất Khối Lời Chúa chuẩn và danh sách hình ảnh từ chuỗi HTML bài viết (Server-side)
 */
export function extractQuotesAndImagesFromHtml(
  htmlContent: string = '',
  metadata?: {
    title?: string;
    featured_image?: string;
    thumbnail?: string;
    excerpt?: string;
  }
): ExtractedArticleMedia {
  const images: string[] = [];
  const seenImages = new Set<string>();

  // 1. Thu thập hình ảnh bìa và hình ảnh trong bài viết
  if (metadata?.featured_image && isValidImageUrl(metadata.featured_image)) {
    images.push(metadata.featured_image);
    seenImages.add(metadata.featured_image);
  }
  if (metadata?.thumbnail && !seenImages.has(metadata.thumbnail) && isValidImageUrl(metadata.thumbnail)) {
    images.push(metadata.thumbnail);
    seenImages.add(metadata.thumbnail);
  }

  // Quét các thẻ <img> trong nội dung bài viết
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(htmlContent)) !== null) {
    const src = imgMatch[1];
    if (src && !seenImages.has(src) && isValidImageUrl(src)) {
      images.push(src);
      seenImages.add(src);
    }
  }

  // 2. Bắt DUY NHẤT Khối Lời Chúa Soi Đường (.sacred-scripture hoặc .veridu-scripture-quote)
  // Chỉ lấy khối đầu tiên tìm thấy trong bài viết
  let sacredScripture: SacredScriptureData = { quote: '', source: '' };

  const blockRegex = /<div[^>]*class=["'][^"']*(?:sacred-scripture|veridu-scripture-quote)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i;
  const blockMatch = blockRegex.exec(htmlContent);

  if (blockMatch) {
    const blockInner = blockMatch[1];

    // Trích xuất câu Kinh Thánh từ <blockquote class="scripture-verse"> hoặc <blockquote>
    const verseRegex = /<blockquote[^>]*class=["'][^"']*scripture-verse[^"']*["'][^>]*>([\s\S]*?)<\/blockquote>/i;
    const fallbackVerseRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i;
    const vMatch = verseRegex.exec(blockInner) || fallbackVerseRegex.exec(blockInner);

    if (vMatch) {
      const cleanVerse = cleanHtmlText(vMatch[1]);
      if (cleanVerse) {
        sacredScripture.quote = formatAsCatholicQuote(cleanVerse);
      }
    }

    // Trích xuất dẫn chứng từ scripture-ref-link hoặc data-raw-ref
    const refDataRegex = /<a[^>]*data-raw-ref=["']([^"']+)["']/i;
    const refLinkRegex = /<[a-z0-9]+[^>]*class=["'][^"']*scripture-ref-link[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/i;
    const citationRegex = /<p[^>]*class=["'][^"']*scripture-citation[^"']*["'][^>]*>([\s\S]*?)<\/p>/i;

    const dataRefMatch = refDataRegex.exec(blockInner);
    const linkMatch = refLinkRegex.exec(blockInner);
    const citeMatch = citationRegex.exec(blockInner);

    let rawRef = '';
    if (dataRefMatch) {
      rawRef = cleanHtmlText(dataRefMatch[1]);
    } else if (linkMatch) {
      // Loại bỏ mũi tên ↗ nếu có
      rawRef = cleanHtmlText(linkMatch[1]).replace(/[↗\s]+$/g, '').trim();
    }

    let rawCitation = citeMatch ? cleanHtmlText(citeMatch[1]).replace(/^[—\-\s]+|[—\-\s]+$/g, '').trim() : '';

    if (rawRef && rawCitation) {
      sacredScripture.source = `${rawRef} • ${rawCitation}`;
    } else if (rawRef) {
      sacredScripture.source = rawRef;
    } else if (rawCitation) {
      sacredScripture.source = rawCitation;
    }
  }

  return { sacredScripture, images };
}

/**
 * Trích xuất Khối Lời Chúa từ cây DOM trên trình duyệt (Client-side)
 */
export function extractMediaFromLiveDom(): ExtractedArticleMedia {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { sacredScripture: { quote: '', source: '' }, images: [] };
  }

  const images: string[] = [];
  const seenImages = new Set<string>();

  const articleEl = document.querySelector('article') || document.querySelector('.article-content') || document.body;
  if (!articleEl) {
    return { sacredScripture: { quote: '', source: '' }, images: [] };
  }

  // 1. Quét hình ảnh minh họa
  const imgEls = articleEl.querySelectorAll('img');
  imgEls.forEach(img => {
    const src = img.currentSrc || img.src;
    if (src && isValidImageUrl(src) && !seenImages.has(src)) {
      seenImages.add(src);
      images.push(src);
    }
  });

  // 2. Tìm chính xác Khối Lời Chúa đầu tiên trong DOM
  const scriptureBlock = articleEl.querySelector('.sacred-scripture, .veridu-scripture-quote');
  let sacredScripture: SacredScriptureData = { quote: '', source: '' };

  if (scriptureBlock) {
    const verseEl = scriptureBlock.querySelector('.scripture-verse') || scriptureBlock.querySelector('blockquote');
    if (verseEl) {
      const cleanText = (verseEl.textContent || '').trim();
      if (cleanText) {
        sacredScripture.quote = formatAsCatholicQuote(cleanText);
      }
    }

    const refLinkEl = scriptureBlock.querySelector('.scripture-ref-link');
    const citeEl = scriptureBlock.querySelector('.scripture-citation');

    const rawRef = refLinkEl?.getAttribute('data-raw-ref') || (refLinkEl?.textContent || '').replace(/[↗\s]+$/g, '').trim();
    const rawCite = (citeEl?.textContent || '').replace(/^[—\-\s]+|[—\-\s]+$/g, '').trim();

    if (rawRef && rawCite) {
      sacredScripture.source = `${rawRef} • ${rawCite}`;
    } else if (rawRef) {
      sacredScripture.source = rawRef;
    } else if (rawCite) {
      sacredScripture.source = rawCite;
    }
  }

  return { sacredScripture, images };
}

/**
 * Kiểm tra URL hình ảnh có hợp lệ và phù hợp làm hình nền không
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  if (lower.includes('default-og-image')) return false;
  if (lower.includes('avatar') || lower.includes('gravatar')) return false;
  if (lower.endsWith('.svg') || lower.includes('.svg?')) return false;
  if (lower.startsWith('data:image/svg')) return false;
  return true;
}

/**
 * Làm sạch văn bản HTML
 */
function cleanHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Chuẩn hóa dấu trích dẫn theo phong cách Công giáo Việt Nam „...“
 */
function formatAsCatholicQuote(text: string): string {
  let cleaned = text.trim();
  // Loại bỏ các dấu ngoặc kép ở hai đầu nếu đã có
  cleaned = cleaned.replace(/^[„"“«]+|[”"“»]+$/g, '').trim();
  return `„${cleaned}”`;
}
