/**
 * Utility: Bible Reference Parser for VERIDU
 * Chuyển đổi các định dạng trích dẫn Kinh Thánh Công giáo Việt Nam (NTT / CGKPV)
 * thành các liên kết điều hướng trực tiếp tới /doc-kinh-thanh/[bookSlug]/[chapter]
 */

export interface ParsedScripture {
  raw: string;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verseRange?: string;
  label: string;
  url: string;
  note?: string;
}

interface BibleBookMeta {
  code: string; // Database code / URL slug
  name: string;
  abbrs: string[];
}

export const CANONICAL_BIBLE_BOOKS: BibleBookMeta[] = [
  // Cựu Ước (Old Testament)
  { code: 'sang-the', name: 'Sáng Thế', abbrs: ['st', 'sáng thế', 'sang the', 'genesis', 'gen'] },
  { code: 'xuat-hanh', name: 'Xuất Hành', abbrs: ['xh', 'xuất hành', 'xuat hanh', 'exodus', 'ex'] },
  { code: 'le-vi', name: 'Lê-vi', abbrs: ['lv', 'lê vi', 'lê-vi', 'levi', 'leviticus'] },
  { code: 'dan-so', name: 'Dân Số', abbrs: ['ds', 'dân số', 'dan so', 'numbers', 'num'] },
  { code: 'de-nhi-luat', name: 'Đệ Nhị Luật', abbrs: ['đnl', 'dnl', 'đệ nhị luật', 'de nhi luat', 'deuteronomy', 'deut'] },
  { code: 'gio-sue', name: 'Giô-suê', abbrs: ['gs', 'giô-suê', 'gio sue', 'joshua', 'josh'] },
  { code: 'thu-lanh', name: 'Thủ Lãnh', abbrs: ['tl', 'thủ lãnh', 'thu lanh', 'judges', 'judg'] },
  { code: 'rut', name: 'Rút', abbrs: ['rt', 'rút', 'rut', 'sách rút', 'ruth'] },
  { code: '1-sa-mu-en', name: '1 Sa-mu-en', abbrs: ['1sm', '1 sm', '1 sa-mu-en', '1 samuel', '1sam'] },
  { code: '2-sa-mu-en', name: '2 Sa-mu-en', abbrs: ['2sm', '2 sm', '2 sa-mu-en', '2 samuel', '2sam'] },
  { code: '1-cac-vua', name: '1 Các Vua', abbrs: ['1v', '1 v', '1cv', '1 các vua', '1 cac vua', '1 kings', '1kgs'] },
  { code: '2-cac-vua', name: '2 Các Vua', abbrs: ['2v', '2 v', '2cv', '2 các vua', '2 cac vua', '2 kings', '2kgs'] },
  { code: '1-su-bien-nien', name: '1 Sử Biên Niên', abbrs: ['1sb', '1 sb', '1sbn', '1 sử biên niên', '1 su bien nien', '1 chronicles', '1chr'] },
  { code: '2-su-bien-nien', name: '2 Sử Biên Niên', abbrs: ['2sb', '2 sb', '2sbn', '2 sử biên niên', '2 su bien nien', '2 chronicles', '2chr'] },
  { code: 'et-ra', name: 'Ét-ra', abbrs: ['er', 'ét-ra', 'et-ra', 'etra', 'ezra'] },
  { code: 'ne-he-mi-a', name: 'Nê-hê-mi-a', abbrs: ['nkm', 'ne', 'nê-hê-mi-a', 'nehemia', 'nehemiah'] },
  { code: 'to-bi-a', name: 'Tô-bi-a', abbrs: ['tb', 'tô-bi-a', 'tobia', 'tobit'] },
  { code: 'giu-di-tha', name: 'Giu-đi-tha', abbrs: ['gđt', 'gdt', 'giu-đi-tha', 'giuditha', 'judith'] },
  { code: 'et-te', name: 'Ét-te', abbrs: ['et', 'ét-te', 'ette', 'esther'] },
  { code: '1-ma-ca-be', name: '1 Ma-ca-bê', abbrs: ['1mcb', '1 mcb', '1 ma-ca-bê', '1 macabe', '1 maccabees'] },
  { code: '2-ma-ca-be', name: '2 Ma-ca-bê', abbrs: ['2mcb', '2 mcb', '2 ma-ca-bê', '2 macabe', '2 maccabees'] },
  { code: 'giop', name: 'Gióp', abbrs: ['gp', 'gióp', 'giop', 'job'] },
  { code: 'thanh-vinh', name: 'Thánh Vịnh', abbrs: ['tv', 'thánh vịnh', 'thanh vinh', 'vịnh', 'psalm', 'psalms'] },
  { code: 'cham-ngon', name: 'Châm Ngôn', abbrs: ['cn', 'châm ngôn', 'cham ngon', 'proverbs', 'prov'] },
  { code: 'giang-vien', name: 'Giảng Viên', abbrs: ['gv', 'giảng viên', 'giang vien', 'ecclesiastes', 'qoh'] },
  { code: 'diem-ca', name: 'Diễm Ca', abbrs: ['dc', 'diễm ca', 'diem ca', 'song of songs', 'song of solomon'] },
  { code: 'khon-ngoan', name: 'Khôn Ngoan', abbrs: ['kn', 'khôn ngoan', 'khon ngoan', 'wisdom'] },
  { code: 'huan-ca', name: 'Huấn Ca', abbrs: ['hc', 'huấn ca', 'huan ca', 'sirach', 'ecclesiasticus'] },
  { code: 'i-sai-a', name: 'I-sai-a', abbrs: ['is', 'i-sai-a', 'isaia', 'isaiah'] },
  { code: 'gie-re-mi-a', name: 'Giê-rê-mi-a', abbrs: ['gr', 'giê-rê-mi-a', 'gieremia', 'jeremiah', 'jer'] },
  { code: 'ai-ca', name: 'Ai Ca', abbrs: ['ac', 'ai ca', 'lamentations', 'lam'] },
  { code: 'ba-ruc', name: 'Ba-rúc', abbrs: ['br', 'ba-rúc', 'baruc', 'baruch'] },
  { code: 'e-de-ki-en', name: 'Ê-dê-ki-en', abbrs: ['ed', 'ê-dê-ki-en', 'edekien', 'ezekiel', 'ez'] },
  { code: 'da-ni-en', name: 'Đa-ni-en', abbrs: ['đn', 'dn', 'đa-ni-en', 'danien', 'daniel'] },
  { code: 'ho-se', name: 'Hô-sê', abbrs: ['hs', 'hô-sê', 'hose', 'hosea'] },
  { code: 'gio-en', name: 'Giô-en', abbrs: ['ge', 'giô-en', 'gioen', 'joel'] },
  { code: 'a-mot', name: 'A-mốt', abbrs: ['am', 'a-mốt', 'amot', 'amos'] },
  { code: 'o-va-di-a', name: 'Ô-va-đi-a', abbrs: ['ôđ', 'od', 'ô-va-đi-a', 'ovadia', 'obadiah'] },
  { code: 'gio-na', name: 'Giô-na', abbrs: ['gn', 'giô-na', 'giona', 'jonah'] },
  { code: 'mi-kha', name: 'Mi-kha', abbrs: ['mk', 'mi-kha', 'mikha', 'micah'] },
  { code: 'na-khum', name: 'Na-khum', abbrs: ['nk', 'na-khum', 'nakhum', 'nahum'] },
  { code: 'kha-ba-cuc', name: 'Kha-ba-cúc', abbrs: ['kbc', 'kha-ba-cúc', 'khabacuc', 'habakkuk', 'hab'] },
  { code: 'xo-pho-ni-a', name: 'Xô-phô-ni-a', abbrs: ['xp', 'xô-phô-ni-a', 'xophonia', 'zephaniah'] },
  { code: 'khac-gai', name: 'Khác-gai', abbrs: ['kg', 'khác-gai', 'khacgai', 'haggai'] },
  { code: 'da-ca-ri-a', name: 'Da-ca-ri-a', abbrs: ['dcr', 'da-ca-ri-a', 'dacaria', 'zechariah', 'zech'] },
  { code: 'ma-la-khi', name: 'Ma-la-khi', abbrs: ['ml', 'ma-la-khi', 'malakhi', 'malachi'] },

  // Tân Ước (New Testament)
  { code: 'mat-theu', name: 'Mát-thêu', abbrs: ['mt', 'mát-thêu', 'mat-theu', 'mattheu', 'matthew', 'matt'] },
  { code: 'mac-co', name: 'Mác-cô', abbrs: ['mc', 'mác-cô', 'mac-co', 'macco', 'mark'] },
  { code: 'lu-ca', name: 'Lu-ca', abbrs: ['lc', 'lu-ca', 'luca', 'luke'] },
  { code: 'gio-an', name: 'Gio-an', abbrs: ['ga', 'tin mừng gioan', 'gio-an', 'gioan', 'john', 'jn'] },
  { code: 'cong-vu-tong-do', name: 'Công Vụ Tông Đồ', abbrs: ['cv', 'cvđ', 'cvd', 'công vụ tông đồ', 'công vụ', 'cong vu', 'acts'] },
  { code: 'ro-ma', name: 'Rô-ma', abbrs: ['rm', 'rô-ma', 'roma', 'romans', 'rom'] },
  { code: '1-co-rin-to', name: '1 Cô-rin-tô', abbrs: ['1cr', '1 cr', '1 cô-rin-tô', '1 corinto', '1 corinthians', '1cor'] },
  { code: '2-co-rin-to', name: '2 Cô-rin-tô', abbrs: ['2cr', '2 cr', '2 cô-rin-tô', '2 corinto', '2 corinthians', '2cor'] },
  { code: 'ga-lat', name: 'Ga-lát', abbrs: ['gl', 'ga-lát', 'galat', 'galatians', 'gal'] },
  { code: 'e-phe-xo', name: 'Ê-phê-xô', abbrs: ['ep', 'ê-phê-xô', 'ephexo', 'ephesians', 'eph'] },
  { code: 'phi-lip-phe', name: 'Phi-líp-phê', abbrs: ['pl', 'phi-líp-phê', 'philipphe', 'philippians', 'phil'] },
  { code: 'co-lo-xe', name: 'Cô-lô-xê', abbrs: ['cl', 'cô-lô-xê', 'coloxe', 'colossians', 'col'] },
  { code: '1-the-xa-lo-ni-ca', name: '1 Thê-xa-lô-ni-ca', abbrs: ['1tx', '1 tx', '1 thessalonians', '1thess'] },
  { code: '2-the-xa-lo-ni-ca', name: '2 Thê-xa-lô-ni-ca', abbrs: ['2tx', '2 tx', '2 thessalonians', '2thess'] },
  { code: '1-ti-mo-the', name: '1 Ti-mô-thê', abbrs: ['1tm', '1 tm', '1 ti-mô-thê', '1 timothe', '1 timothy', '1tim'] },
  { code: '2-ti-mo-the', name: '2 Ti-mô-thê', abbrs: ['2tm', '2 tm', '2 ti-mô-thê', '2 timothe', '2 timothy', '2tim'] },
  { code: 'ti-to', name: 'Ti-tô', abbrs: ['tt', 'ti-tô', 'tito', 'titus'] },
  { code: 'phi-le-mon', name: 'Phi-lê-môn', abbrs: ['plm', 'phi-lê-môn', 'philemon', 'phm'] },
  { code: 'hip-ri', name: 'Hip-ri', abbrs: ['dt', 'hípri', 'hipri', 'híp-ri', 'hip-ri', 'do thái', 'hebrews', 'heb'] },
  { code: 'gia-co-be', name: 'Gia-cô-bê', abbrs: ['gcb', 'gc', 'gia-cô-bê', 'giacobe', 'james', 'jas'] },
  { code: '1-phe-ro', name: '1 Phê-rô', abbrs: ['1pr', '1 pr', '1 phê-rô', '1 phero', '1 peter', '1pet'] },
  { code: '2-phe-ro', name: '2 Phê-rô', abbrs: ['2pr', '2 pr', '2 phê-rô', '2 phero', '2 peter', '2pet'] },
  { code: '1-gio-an', name: '1 Gio-an', abbrs: ['1ga', '1 ga', '1 gio-an', '1 gioan', '1 john', '1jn'] },
  { code: '2-gio-an', name: '2 Gio-an', abbrs: ['2ga', '2 ga', '2 gio-an', '2 gioan', '2 john', '2jn'] },
  { code: '3-gio-an', name: '3 Gio-an', abbrs: ['3ga', '3 ga', '3 gio-an', '3 gioan', '3 john', '3jn'] },
  { code: 'giu-da', name: 'Giu-đa', abbrs: ['gđ', 'gd', 'giu-đa', 'giuda', 'jude'] },
  { code: 'khai-huyen', name: 'Khải Huyền', abbrs: ['kh', 'khải huyền', 'khai huyen', 'revelation', 'rev'] }
];

// Lookup map for fast book resolution
const ABBR_TO_BOOK: Map<string, BibleBookMeta> = new Map();
CANONICAL_BIBLE_BOOKS.forEach(b => {
  ABBR_TO_BOOK.set(b.code.toLowerCase(), b);
  ABBR_TO_BOOK.set(b.name.toLowerCase(), b);
  b.abbrs.forEach(a => ABBR_TO_BOOK.set(a.toLowerCase(), b));
});

// Sort book names and abbreviations by length descending so multi-word titles (e.g. "1 Sử Biên Niên") match before single words
const SORTED_KEYS = Array.from(ABBR_TO_BOOK.keys()).sort((a, b) => b.length - a.length);

/**
 * Regex matching individual citation pattern:
 * e.g. "Lc 4:16-21", "St 12:1-7", "Tv 82", "2 V 22-23", "Lv 25:1-55", "Dt 9:11-28"
 */
export function parseSingleCitation(segment: string): ParsedScripture | null {
  const clean = segment.trim().replace(/^[\s\-–—:;,\.]+|[\s\-–—:;,\.]+$/g, '');
  if (!clean) return null;

  // Check for commentary / note (e.g. "Thánh Vịnh 136: Phụng vụ tạ ơn")
  let note: string | undefined = undefined;
  let textToParse = clean;
  if (clean.includes(':') && !/\d+:\d+/.test(clean)) {
    // Colon is separating title/reference from description
    const parts = clean.split(':');
    textToParse = parts[0].trim();
    note = parts.slice(1).join(':').trim();
  }

  // Regex pattern matching: (Book Name/Abbr) + (Chapter) + (:VerseRange or –ChapterRange)?
  // e.g.: "1 Sm 2:1-10", "Lc 4:16-21", "Tv 136", "Mt 5-7", "2 Sb 3:1-2"
  const match = textToParse.match(/^([1-3]?\s*[\p{L}\p{M}\-]+(?:\s+[\p{L}\p{M}\-]+)*)\s+(\d+)(?:[:,\.](\d+(?:[\-–—]\d+)?(?:[,\.]\d+)*)|(?:[\-–—](\d+)))?/iu);

  if (match) {
    const rawBook = match[1].trim().toLowerCase();
    const chapterNum = parseInt(match[2], 10);
    const verses = match[3] || (match[4] ? `chương ${match[4]}` : undefined);

    const book = ABBR_TO_BOOK.get(rawBook);
    if (book && chapterNum > 0) {
      const label = `${book.name} ${chapterNum}${verses ? `:${verses}` : ''}`;
      return {
        raw: clean,
        bookSlug: book.code,
        bookName: book.name,
        chapter: chapterNum,
        verseRange: verses,
        label,
        url: `/doc-kinh-thanh/${book.code}/${chapterNum}`,
        note
      };
    }
  }

  // Fallback: Check if any known abbr exists in text
  for (const key of SORTED_KEYS) {
    const regex = new RegExp(`(?:^|\\b)${key}\\.?\\s*(\\d+)(?:[:](\\d+(?:[\\-–—]\\d+)?))?`, 'i');
    const fMatch = textToParse.match(regex);
    if (fMatch) {
      const book = ABBR_TO_BOOK.get(key)!;
      const chNum = parseInt(fMatch[1], 10);
      const vRange = fMatch[2];
      if (chNum > 0) {
        return {
          raw: clean,
          bookSlug: book.code,
          bookName: book.name,
          chapter: chNum,
          verseRange: vRange,
          label: `${book.name} ${chNum}${vRange ? `:${vRange}` : ''}`,
          url: `/doc-kinh-thanh/${book.code}/${chNum}`,
          note
        };
      }
    }
  }

  return null;
}

/**
 * Parses raw scripture references into an array of structured links.
 * Handles single strings with separators (;, ,, newline), or string arrays.
 */
export function parseScriptureReferences(input: string | string[] | null | undefined): ParsedScripture[] {
  if (!input) return [];

  const rawList: string[] = Array.isArray(input) ? input : [input];
  const results: ParsedScripture[] = [];
  const seenUrls = new Set<string>();

  for (const item of rawList) {
    if (!item || typeof item !== 'string') continue;

    // Split multiple citations separated by ; or newline, or commas between distinct books
    const segments = item.split(/[;\n]/).flatMap(s => {
      // Split on comma only if followed by a book identifier or number+book
      return s.split(/,(?=\s*(?:[1-3]?\s*[A-ZÀ-Ỹa-zà-ỹ]{2,}))/);
    });

    for (const seg of segments) {
      const parsed = parseSingleCitation(seg);
      if (parsed) {
        const dedupeKey = `${parsed.bookSlug}-${parsed.chapter}-${parsed.verseRange || ''}`;
        if (!seenUrls.has(dedupeKey)) {
          seenUrls.add(dedupeKey);
          results.push(parsed);
        }
      }
    }
  }

  return results;
}
