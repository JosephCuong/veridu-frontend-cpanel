/**
 * Utility: Quote & Image Extractor for VERIDU Catholic Articles
 * Tự động trích xuất các câu Lời Chúa, trích dẫn thần học và hình ảnh từ bài viết
 * phục vụ tính năng tạo Thẻ Ảnh Lời Chúa (Quote Card Generator).
 */

export interface ExtractedQuote {
  text: string;
  source: string;
}

export interface ExtractedArticleMedia {
  quotes: ExtractedQuote[];
  images: string[];
}

/**
 * Trích xuất các câu trích dẫn và hình ảnh từ chuỗi HTML bài viết (Server & Client)
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
  const quotes: ExtractedQuote[] = [];
  const images: string[] = [];
  const seenQuotes = new Set<string>();
  const seenImages = new Set<string>();

  // 1. Thu thập hình ảnh tiêu biểu
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

  // 2. Trích xuất các khối <blockquote> (thường là câu Lời Chúa hoặc trích dẫn Giáo phụ quan trọng)
  const blockquoteRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let bqMatch;
  while ((bqMatch = blockquoteRegex.exec(htmlContent)) !== null) {
    const rawInner = bqMatch[1];
    // Tìm cite nếu có
    const citeMatch = rawInner.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i);
    let source = citeMatch ? cleanHtmlText(citeMatch[1]) : (metadata?.title || 'Trích đoạn bài viết');
    const cleanContent = cleanHtmlText(rawInner.replace(/<cite[^>]*>[\s\S]*?<\/cite>/gi, ''));

    if (cleanContent.length >= 15 && cleanContent.length <= 450) {
      const quoteText = formatAsCatholicQuote(cleanContent);
      const key = quoteText.substring(0, 50);
      if (!seenQuotes.has(key)) {
        seenQuotes.add(key);
        quotes.push({
          text: quoteText,
          source: source
        });
      }
    }
  }

  // 3. Trích xuất các câu trong dấu ngoặc kép Công giáo: „...“ hoặc “...” hoặc "..."
  const quoteMarkRegex = /[„"“]([^"”\n]{25,280})["”]/g;
  let qmMatch;
  while ((qmMatch = quoteMarkRegex.exec(htmlContent)) !== null) {
    const rawQuote = cleanHtmlText(qmMatch[1]);
    if (rawQuote.length >= 25) {
      const formatted = formatAsCatholicQuote(rawQuote);
      const key = formatted.substring(0, 50);
      if (!seenQuotes.has(key)) {
        seenQuotes.add(key);
        quotes.push({
          text: formatted,
          source: metadata?.title || 'Lời Chúa & Châm ngôn'
        });
      }
    }
  }

  // 4. Trích xuất các câu có dẫn chứng Kinh Thánh: (Ga 8, 32), (Mt 5, 3-12), (Tv 23, 1), etc.
  const scriptureSentenceRegex = /([^.?!;:\n]{15,260}?\((?:[1-3]\s+)?[A-ZÀ-Ỹa-zà-ỹ]{1,8}\s+\d+[^)]*\))/gi;
  let scMatch;
  while ((scMatch = scriptureSentenceRegex.exec(htmlContent)) !== null) {
    const rawSentence = cleanHtmlText(scMatch[1]);
    const citeExtract = rawSentence.match(/\(([^)]+)\)$/);
    if (citeExtract) {
      const citation = citeExtract[1].trim();
      const verseText = rawSentence.replace(/\([^)]+\)$/, '').trim();
      if (verseText.length >= 18) {
        const formatted = formatAsCatholicQuote(verseText);
        const key = formatted.substring(0, 50);
        if (!seenQuotes.has(key)) {
          seenQuotes.add(key);
          quotes.push({
            text: formatted,
            source: citation
          });
        }
      }
    }
  }

  // 5. Nếu chưa có câu nào hoặc chỉ có 1 câu, thêm câu trích từ Excerpt hoặc Title
  if (quotes.length === 0 && metadata?.excerpt) {
    const cleanExcerpt = cleanHtmlText(metadata.excerpt);
    if (cleanExcerpt.length >= 20) {
      quotes.push({
        text: formatAsCatholicQuote(cleanExcerpt.substring(0, 200) + (cleanExcerpt.length > 200 ? '...' : '')),
        source: metadata.title || 'VERIDU'
      });
    }
  }

  return { quotes, images };
}

/**
 * Trích xuất từ cây DOM trên trình duyệt (dành cho Client Component khi bài viết đã được render)
 */
export function extractMediaFromLiveDom(): ExtractedArticleMedia {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { quotes: [], images: [] };
  }

  const quotes: ExtractedQuote[] = [];
  const images: string[] = [];
  const seenQuotes = new Set<string>();
  const seenImages = new Set<string>();

  const articleEl = document.querySelector('article') || document.querySelector('.article-content') || document.body;
  if (!articleEl) return { quotes, images };

  // 1. Quét hình ảnh
  const imgEls = articleEl.querySelectorAll('img');
  imgEls.forEach(img => {
    const src = img.currentSrc || img.src;
    if (src && isValidImageUrl(src) && !seenImages.has(src)) {
      seenImages.add(src);
      images.push(src);
    }
  });

  // 2. Quét blockquote
  const bqEls = articleEl.querySelectorAll('blockquote');
  bqEls.forEach(bq => {
    const text = (bq.textContent || '').trim();
    if (text.length >= 15 && text.length <= 400) {
      const formatted = formatAsCatholicQuote(text);
      const key = formatted.substring(0, 50);
      if (!seenQuotes.has(key)) {
        seenQuotes.add(key);
        quotes.push({
          text: formatted,
          source: 'Trích dẫn bài viết'
        });
      }
    }
  });

  // 3. Quét các thẻ câu Kinh Thánh đặc thù nếu có (như class .verse hoặc [data-verse])
  const verseEls = articleEl.querySelectorAll('.verse, [data-verse]');
  verseEls.forEach(v => {
    const text = (v.textContent || '').trim();
    if (text.length >= 10 && text.length <= 350) {
      const formatted = formatAsCatholicQuote(text);
      const key = formatted.substring(0, 50);
      if (!seenQuotes.has(key)) {
        seenQuotes.add(key);
        quotes.push({
          text: formatted,
          source: v.getAttribute('data-verse') || 'Kinh Thánh'
        });
      }
    }
  });

  return { quotes, images };
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
