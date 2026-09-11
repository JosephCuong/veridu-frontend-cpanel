/**
 * VERIDU Holy Scripture Data & Canonical Slug Registry
 * Maps abbreviations, traditional Vietnamese Catholic notations, and aliases
 * to the exact canonical slugs used in Supabase public.bible_books table.
 */

export interface BibleBookInfo {
  code: string;       // Canonical slug in Supabase (e.g. '1-sa-mu-en', 'sang-the')
  name: string;       // Full Vietnamese name (e.g. '1 Sa-mu-en', 'Sáng Thế')
  testament: 'Cựu Ước' | 'Tân Ước';
  aliases: string[];  // Common abbreviations & variants
}

export const CANONICAL_BIBLE_BOOKS: BibleBookInfo[] = [
  // ─── CỰU ƯỚC (OLD TESTAMENT - 46 BOOKS) ──────────────────────────────────
  {
    code: 'sang-the',
    name: 'Sáng Thế',
    testament: 'Cựu Ước',
    aliases: ['st', 'sang the', 'sang-the', 'genesis', 'gen', 'gn']
  },
  {
    code: 'xuat-hanh',
    name: 'Xuất Hành',
    testament: 'Cựu Ước',
    aliases: ['xh', 'xuat hanh', 'xuat-hanh', 'exodus', 'ex', 'exod']
  },
  {
    code: 'le-vi',
    name: 'Lê-vi',
    testament: 'Cựu Ước',
    aliases: ['lv', 'le vi', 'le-vi', 'leviticus', 'lev']
  },
  {
    code: 'dan-so',
    name: 'Dân Số',
    testament: 'Cựu Ước',
    aliases: ['ds', 'dan so', 'dan-so', 'numbers', 'num']
  },
  {
    code: 'de-nhi-luat',
    name: 'Đệ Nhị Luật',
    testament: 'Cựu Ước',
    aliases: ['dnl', 'de nhi luat', 'de-nhi-luat', 'deuteronomy', 'deut', 'dt']
  },
  {
    code: 'gio-sue',
    name: 'Giô-suê',
    testament: 'Cựu Ước',
    aliases: ['gs', 'gio sue', 'gio-sue', 'joshua', 'josh']
  },
  {
    code: 'thu-lanh',
    name: 'Thủ Lãnh',
    testament: 'Cựu Ước',
    aliases: ['tl', 'tp', 'thu lanh', 'thu-lanh', 'quan xet', 'judges', 'judg']
  },
  {
    code: 'rut',
    name: 'Rút',
    testament: 'Cựu Ước',
    aliases: ['rt', 'rut', 'ruth']
  },
  {
    code: '1-sa-mu-en',
    name: '1 Sa-mu-en',
    testament: 'Cựu Ước',
    aliases: ['1sm', '1-sm', '1 sm', 'sm', '1 sa-mu-en', '1 sa mu en', '1 samuel', '1samuel', '1sam', '1 sam']
  },
  {
    code: '2-sa-mu-en',
    name: '2 Sa-mu-en',
    testament: 'Cựu Ước',
    aliases: ['2sm', '2-sm', '2 sm', '2 sa-mu-en', '2 sa mu en', '2 samuel', '2samuel', '2sam', '2 sam']
  },
  {
    code: '1-cac-vua',
    name: '1 Các Vua',
    testament: 'Cựu Ước',
    aliases: ['1v', '1-v', '1 v', '1cv', '1 cv', '1 cac vua', '1-cac-vua', '1 kings', '1kgs']
  },
  {
    code: '2-cac-vua',
    name: '2 Các Vua',
    testament: 'Cựu Ước',
    aliases: ['2v', '2-v', '2 v', '2cv', '2 cv', '2 cac vua', '2-cac-vua', '2 kings', '2kgs']
  },
  {
    code: '1-su-bien-nien',
    name: '1 Sử Biên Niên',
    testament: 'Cựu Ước',
    aliases: ['1sb', '1-sb', '1 sb', '1sbn', '1 sbn', '1 su bien nien', '1-su-bien-nien', '1 chronicles', '1chr']
  },
  {
    code: '2-su-bien-nien',
    name: '2 Sử Biên Niên',
    testament: 'Cựu Ước',
    aliases: ['2sb', '2-sb', '2 sb', '2sbn', '2 sbn', '2 su bien nien', '2-su-bien-nien', '2 chronicles', '2chr']
  },
  {
    code: 'et-ra',
    name: 'Ét-ra',
    testament: 'Cựu Ước',
    aliases: ['er', 'ez', 'et-ra', 'et ra', 'ezra']
  },
  {
    code: 'ne-he-mi-a',
    name: 'Nê-hê-mi-a',
    testament: 'Cựu Ước',
    aliases: ['nh', 'ne-he-mi-a', 'ne he mi a', 'ne-khe-mi-a', 'nehemia', 'nehemiah', 'neh']
  },
  {
    code: 'to-bi-a',
    name: 'Tô-bi-a',
    testament: 'Cựu Ước',
    aliases: ['tb', 'to-bi-a', 'to bi a', 'tobia', 'tobit', 'tob']
  },
  {
    code: 'giu-di-tha',
    name: 'Giu-đi-tha',
    testament: 'Cựu Ước',
    aliases: ['gdt', 'giu-di-tha', 'giu di tha', 'giuditha', 'judith', 'jdt']
  },
  {
    code: 'et-te',
    name: 'Ét-te',
    testament: 'Cựu Ước',
    aliases: ['et', 'et-te', 'et te', 'esther', 'est']
  },
  {
    code: '1-ma-ca-be',
    name: '1 Ma-ca-bê',
    testament: 'Cựu Ước',
    aliases: ['1mcb', '1-mcb', '1 mcb', '1 ma-ca-be', '1 ma ca be', '1 maccabees', '1macc']
  },
  {
    code: '2-ma-ca-be',
    name: '2 Ma-ca-bê',
    testament: 'Cựu Ước',
    aliases: ['2mcb', '2-mcb', '2 mcb', '2 ma-ca-be', '2 ma ca be', '2 maccabees', '2macc']
  },
  {
    code: 'giop',
    name: 'Gióp',
    testament: 'Cựu Ước',
    aliases: ['g', 'giop', 'job']
  },
  {
    code: 'thanh-vinh',
    name: 'Thánh Vịnh',
    testament: 'Cựu Ước',
    aliases: ['tv', 'thanh vinh', 'thanh-vinh', 'psalms', 'psalm', 'ps']
  },
  {
    code: 'cham-ngon',
    name: 'Châm Ngôn',
    testament: 'Cựu Ước',
    aliases: ['cn', 'cham ngon', 'cham-ngon', 'proverbs', 'prov', 'prv']
  },
  {
    code: 'giang-vien',
    name: 'Giảng Viên',
    testament: 'Cựu Ước',
    aliases: ['gv', 'gl', 'giang vien', 'giang-vien', 'ecclesiastes', 'eccl', 'qoh']
  },
  {
    code: 'diem-ca',
    name: 'Diễm Ca',
    testament: 'Cựu Ước',
    aliases: ['dc', 'diem ca', 'diem-ca', 'song of songs', 'song of solomon', 'canticle', 'sg']
  },
  {
    code: 'khon-ngoan',
    name: 'Khôn Ngoan',
    testament: 'Cựu Ước',
    aliases: ['kn', 'khon ngoan', 'khon-ngoan', 'wisdom', 'wis']
  },
  {
    code: 'huan-ca',
    name: 'Huấn Ca',
    testament: 'Cựu Ước',
    aliases: ['hc', 'huan ca', 'huan-ca', 'sirach', 'ecclesiasticus', 'sir']
  },
  {
    code: 'i-sai-a',
    name: 'I-sai-a',
    testament: 'Cựu Ước',
    aliases: ['is', 'i-sai-a', 'i sai a', 'isaiah', 'isa']
  },
  {
    code: 'gie-re-mi-a',
    name: 'Giê-rê-mi-a',
    testament: 'Cựu Ước',
    aliases: ['gr', 'gie-re-mi-a', 'gie re mi a', 'jeremiah', 'jer']
  },
  {
    code: 'ai-ca',
    name: 'Ai Ca',
    testament: 'Cựu Ước',
    aliases: ['ac', 'tc', 'ai ca', 'ai-ca', 'ca thuong', 'lamentations', 'lam']
  },
  {
    code: 'ba-ruc',
    name: 'Ba-rúc',
    testament: 'Cựu Ước',
    aliases: ['br', 'ba-ruc', 'ba ruc', 'baruch', 'bar']
  },
  {
    code: 'e-de-ki-en',
    name: 'Ê-dê-ki-en',
    testament: 'Cựu Ước',
    aliases: ['ezk', 'ed', 'e-de-ki-en', 'e de ki en', 'ezekiel', 'ezek']
  },
  {
    code: 'da-ni-en',
    name: 'Đa-ni-en',
    testament: 'Cựu Ước',
    aliases: ['dn', 'da-ni-en', 'da ni en', 'daniel', 'dan']
  },
  {
    code: 'ho-se',
    name: 'Hô-sê',
    testament: 'Cựu Ước',
    aliases: ['hs', 'ho-se', 'ho se', 'hosea', 'hos']
  },
  {
    code: 'gio-en',
    name: 'Giô-en',
    testament: 'Cựu Ước',
    aliases: ['ge', 'gio-en', 'gio en', 'joel', 'jl']
  },
  {
    code: 'a-mot',
    name: 'A-mốt',
    testament: 'Cựu Ước',
    aliases: ['am', 'a-mot', 'a mot', 'amos']
  },
  {
    code: 'o-va-di-a',
    name: 'Ô-va-đi-a',
    testament: 'Cựu Ước',
    aliases: ['ob', 'ov', 'o-va-di-a', 'o va di a', 'obadiah', 'obad']
  },
  {
    code: 'gio-na',
    name: 'Giô-na',
    testament: 'Cựu Ước',
    aliases: ['gn', 'gio-na', 'gio na', 'jonah', 'jon']
  },
  {
    code: 'mi-kha',
    name: 'Mi-kha',
    testament: 'Cựu Ước',
    aliases: ['mi', 'mi-kha', 'mi kha', 'micah', 'mic']
  },
  {
    code: 'na-khum',
    name: 'Na-khum',
    testament: 'Cựu Ước',
    aliases: ['nhm', 'na-khum', 'na khum', 'nahum', 'nah']
  },
  {
    code: 'kha-ba-cuc',
    name: 'Kha-ba-cúc',
    testament: 'Cựu Ước',
    aliases: ['kbc', 'hc_ha', 'kha-ba-cuc', 'kha ba cuc', 'habakkuk', 'hab']
  },
  {
    code: 'xo-pho-ni-a',
    name: 'Xô-phô-ni-a',
    testament: 'Cựu Ước',
    aliases: ['xp', 'xo-pho-ni-a', 'xo pho ni a', 'zephaniah', 'zeph']
  },
  {
    code: 'khac-gai',
    name: 'Khác-gai',
    testament: 'Cựu Ước',
    aliases: ['khg', 'kg', 'khac-gai', 'khac gai', 'khat-gai', 'haggai', 'hag']
  },
  {
    code: 'da-ca-ri-a',
    name: 'Da-ca-ri-a',
    testament: 'Cựu Ước',
    aliases: ['zk', 'dc', 'da-ca-ri-a', 'da ca ri a', 'zechariah', 'zech']
  },
  {
    code: 'ma-la-khi',
    name: 'Ma-la-khi',
    testament: 'Cựu Ước',
    aliases: ['ml', 'ma-la-khi', 'ma la khi', 'malachi', 'mal']
  },

  // ─── TÂN ƯỚC (NEW TESTAMENT - 27 BOOKS) ──────────────────────────────────
  {
    code: 'mat-theu',
    name: 'Mát-thêu',
    testament: 'Tân Ước',
    aliases: ['mt', 'mat theu', 'mat-theu', 'mattheu', 'matthew', 'matt']
  },
  {
    code: 'mac-co',
    name: 'Mác-cô',
    testament: 'Tân Ước',
    aliases: ['mc', 'mac co', 'mac-co', 'macco', 'mark', 'mrk']
  },
  {
    code: 'lu-ca',
    name: 'Lu-ca',
    testament: 'Tân Ước',
    aliases: ['lc', 'lu ca', 'lu-ca', 'luca', 'luke', 'luk']
  },
  {
    code: 'gio-an',
    name: 'Gio-an',
    testament: 'Tân Ước',
    aliases: ['ga', 'gio an', 'gio-an', 'gioan', 'john', 'jhn']
  },
  {
    code: 'cong-vu-tong-do',
    name: 'Công Vụ Tông Đồ',
    testament: 'Tân Ước',
    aliases: ['cv', 'cvtd', 'cong vu', 'cong-vu', 'cong vu tong do', 'cong-vu-tong-do', 'acts']
  },
  {
    code: 'ro-ma',
    name: 'Rô-ma',
    testament: 'Tân Ước',
    aliases: ['rm', 'ro ma', 'ro-ma', 'roma', 'romans', 'rom']
  },
  {
    code: '1-co-rin-to',
    name: '1 Cô-rin-tô',
    testament: 'Tân Ước',
    aliases: ['1cr', '1-cr', '1 cr', '1cor', '1-co-rin-to', '1 co rin to', '1 corinthians']
  },
  {
    code: '2-co-rin-to',
    name: '2 Cô-rin-tô',
    testament: 'Tân Ước',
    aliases: ['2cr', '2-cr', '2 cr', '2cor', '2-co-rin-to', '2 co rin to', '2 corinthians']
  },
  {
    code: 'ga-lat',
    name: 'Ga-lát',
    testament: 'Tân Ước',
    aliases: ['gl', 'ga lat', 'ga-lat', 'galat', 'galatians', 'gal', 'gl_nt']
  },
  {
    code: 'e-phe-xo',
    name: 'Ê-phê-xô',
    testament: 'Tân Ước',
    aliases: ['ep', 'e phe xo', 'e-phe-xo', 'epheso', 'ephesians', 'eph']
  },
  {
    code: 'phi-lip-phe',
    name: 'Phi-líp-phê',
    testament: 'Tân Ước',
    aliases: ['pl', 'fl', 'phi lip phe', 'phi-lip-phe', 'philippians', 'phil', 'php']
  },
  {
    code: 'co-lo-xe',
    name: 'Cô-lô-xê',
    testament: 'Tân Ước',
    aliases: ['cl', 'co lo xe', 'co-lo-xe', 'colose', 'colossians', 'col']
  },
  {
    code: '1-the-xa-lo-ni-ca',
    name: '1 Thê-xa-lô-ni-ca',
    testament: 'Tân Ước',
    aliases: ['1ts', '1-ts', '1 ts', '1-the-xa-lo-ni-ca', '1 the xa lo ni ca', '1 thessalonians', '1thess']
  },
  {
    code: '2-the-xa-lo-ni-ca',
    name: '2 Thê-xa-lô-ni-ca',
    testament: 'Tân Ước',
    aliases: ['2ts', '2-ts', '2 ts', '2-the-xa-lo-ni-ca', '2 the xa lo ni ca', '2 thessalonians', '2thess']
  },
  {
    code: '1-ti-mo-the',
    name: '1 Ti-mô-thê',
    testament: 'Tân Ước',
    aliases: ['1tm', '1-tm', '1 tm', '1-ti-mo-the', '1 ti mo the', '1 timothy', '1tim']
  },
  {
    code: '2-ti-mo-the',
    name: '2 Ti-mô-thê',
    testament: 'Tân Ước',
    aliases: ['2tm', '2-tm', '2 tm', '2-ti-mo-the', '2 ti mo the', '2 timothy', '2tim']
  },
  {
    code: 'ti-to',
    name: 'Ti-tô',
    testament: 'Tân Ước',
    aliases: ['tt', 'ti to', 'ti-to', 'tito', 'titus', 'tit']
  },
  {
    code: 'phi-le-mon',
    name: 'Phi-lê-môn',
    testament: 'Tân Ước',
    aliases: ['prm', 'plm', 'phi le mon', 'phi-le-mon', 'philemon', 'phlm']
  },
  {
    code: 'hip-ri',
    name: 'Hip-ri',
    testament: 'Tân Ước',
    aliases: ['dt', 'hr', 'hip ri', 'hip-ri', 'do thai', 'hebrews', 'heb']
  },
  {
    code: 'gia-co-be',
    name: 'Gia-cô-bê',
    testament: 'Tân Ước',
    aliases: ['gc', 'gia co be', 'gia-co-be', 'giacobe', 'james', 'jas']
  },
  {
    code: '1-phe-ro',
    name: '1 Phê-rô',
    testament: 'Tân Ước',
    aliases: ['1pr', '1-pr', '1 pr', '1-phe-ro', '1 phe ro', '1 phere', '1 peter', '1pet']
  },
  {
    code: '2-phe-ro',
    name: '2 Phê-rô',
    testament: 'Tân Ước',
    aliases: ['2pr', '2-pr', '2 pr', '2-phe-ro', '2 phe ro', '2 phere', '2 peter', '2pet']
  },
  {
    code: '1-gio-an',
    name: '1 Gio-an',
    testament: 'Tân Ước',
    aliases: ['1ga', '1-ga', '1 ga', '1-gio-an', '1 gio an', '1 gioan', '1 john', '1jn']
  },
  {
    code: '2-gio-an',
    name: '2 Gio-an',
    testament: 'Tân Ước',
    aliases: ['2ga', '2-ga', '2 ga', '2-gio-an', '2 gio an', '2 gioan', '2 john', '2jn']
  },
  {
    code: '3-gio-an',
    name: '3 Gio-an',
    testament: 'Tân Ước',
    aliases: ['3ga', '3-ga', '3 ga', '3-gio-an', '3 gio an', '3 gioan', '3 john', '3jn']
  },
  {
    code: 'giu-da',
    name: 'Giu-đa',
    testament: 'Tân Ước',
    aliases: ['gd', 'giu da', 'giu-da', 'giuda', 'jude', 'jud']
  },
  {
    code: 'khai-huyen',
    name: 'Khải Huyền',
    testament: 'Tân Ước',
    aliases: ['kh', 'khai huyen', 'khai-huyen', 'revelation', 'rev', 'apocalypse']
  }
];

// Quick index mapping: lowercase normalized string -> Canonical Book Info
const BIBLE_ALIAS_MAP = new Map<string, BibleBookInfo>();

CANONICAL_BIBLE_BOOKS.forEach(book => {
  // Map canonical code itself
  BIBLE_ALIAS_MAP.set(book.code.toLowerCase(), book);
  BIBLE_ALIAS_MAP.set(book.code.replace(/-/g, ''), book);

  // Map lowercase full name
  BIBLE_ALIAS_MAP.set(book.name.toLowerCase(), book);
  BIBLE_ALIAS_MAP.set(removeVietnameseTones(book.name.toLowerCase()), book);

  // Map aliases
  book.aliases.forEach(alias => {
    const clean = alias.toLowerCase().trim();
    BIBLE_ALIAS_MAP.set(clean, book);
    BIBLE_ALIAS_MAP.set(clean.replace(/[-\s]+/g, ''), book);
    BIBLE_ALIAS_MAP.set(removeVietnameseTones(clean), book);
    BIBLE_ALIAS_MAP.set(removeVietnameseTones(clean).replace(/[-\s]+/g, ''), book);
  });
});

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

/**
 * Resolves any alias, code, or written name into the canonical DB slug
 * (e.g. '1-sm' -> '1-sa-mu-en', 'St' -> 'sang-the', 'Sm' -> '1-sa-mu-en')
 */
export function getCanonicalBookSlug(aliasOrCode: string): string | null {
  if (!aliasOrCode) return null;
  const clean = aliasOrCode.toLowerCase().trim();
  const found = BIBLE_ALIAS_MAP.get(clean) 
    || BIBLE_ALIAS_MAP.get(clean.replace(/[-\s]+/g, ''))
    || BIBLE_ALIAS_MAP.get(removeVietnameseTones(clean))
    || BIBLE_ALIAS_MAP.get(removeVietnameseTones(clean).replace(/[-\s]+/g, ''));

  return found ? found.code : null;
}

export function getBookInfoBySlug(slug: string): BibleBookInfo | null {
  if (!slug) return null;
  const canonical = getCanonicalBookSlug(slug);
  if (!canonical) return null;
  return CANONICAL_BIBLE_BOOKS.find(b => b.code === canonical) || null;
}

export interface ParsedScriptureRef {
  bookSlug: string;
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  rawRef: string;
}

/**
 * Parses Vietnamese scripture citations:
 * Examples:
 * - "1 Sm 8:1-3" or "1 Sm 8, 1-3"
 * - "Sm 8:1" or "Sm 8, 1"
 * - "St 1:1-8" or "St 1, 1-8"
 * - "Ga 3:16" or "Ga 3, 16"
 * - "Mt 5, 3-12" or "Mt 5:3-12"
 * - "1-sa-mu-en/8"
 */
export function parseScriptureReference(ref: string): ParsedScriptureRef | null {
  if (!ref) return null;
  const clean = ref.replace(/[()]/g, '').trim();

  // Pattern A: standard citation: "1 Sm 8:1-3", "Sm 8, 1-5", "St 1:1", "1Ga 2:3"
  // Group 1: Book identifier (e.g. "1 Sm", "Sm", "St", "Ga", "1-sa-mu-en")
  // Group 2: Chapter number
  // Group 3: Verse range separator (: or ,)
  // Group 4: Verse start
  // Group 5: Verse end (optional)
  const citationRegex = /^([1-4]?\s*[A-Za-zÀ-ỹ\-_]+)\s+(\d+)(?:[\s,:\.]+\s*(?:[vV]\.?\s*)?(\d+)(?:[-–—](\d+))?)?$/;
  const match = clean.match(citationRegex);

  if (match) {
    const rawBook = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verseStart = match[3] ? parseInt(match[3], 10) : undefined;
    const verseEnd = match[4] ? parseInt(match[4], 10) : (verseStart ? verseStart : undefined);

    const canonicalSlug = getCanonicalBookSlug(rawBook);
    if (!canonicalSlug || isNaN(chapter)) return null;

    const bookInfo = getBookInfoBySlug(canonicalSlug);
    return {
      bookSlug: canonicalSlug,
      bookName: bookInfo ? bookInfo.name : rawBook,
      chapter,
      verseStart,
      verseEnd,
      rawRef: clean
    };
  }

  // Pattern B: URL path format: "1-sa-mu-en/8" or "1-sm/8"
  const urlPathMatch = clean.match(/^([a-z0-9\-_]+)\/(\d+)$/i);
  if (urlPathMatch) {
    const canonicalSlug = getCanonicalBookSlug(urlPathMatch[1]);
    const chapter = parseInt(urlPathMatch[2], 10);
    if (canonicalSlug && !isNaN(chapter)) {
      const bookInfo = getBookInfoBySlug(canonicalSlug);
      return {
        bookSlug: canonicalSlug,
        bookName: bookInfo ? bookInfo.name : canonicalSlug,
        chapter,
        rawRef: clean
      };
    }
  }

  return null;
}

/**
 * Builds the canonical VERIDU Holy Scripture Reader URL
 * (e.g. "/kinh-thanh/1-sa-mu-en/8?t=ntt#v1")
 */
export function formatScriptureUrl(
  bookSlug: string,
  chapter: number,
  verseStart?: number,
  translation: string = 'ntt'
): string {
  const canonical = getCanonicalBookSlug(bookSlug) || bookSlug;
  const base = `/kinh-thanh/${canonical}/${chapter}?t=${translation}`;
  if (verseStart) {
    return `${base}#v${verseStart}`;
  }
  return base;
}

export interface ScriptureMatch {
  fullMatch: string;
  startIndex: number;
  endIndex: number;
  parsed: ParsedScriptureRef;
  url: string;
}

/**
 * Safely extracts all valid Scripture references from raw plain text,
 * validating book abbreviations against the canonical 73 Catholic books.
 */
export function matchAllScriptureReferences(text: string): ScriptureMatch[] {
  if (!text || typeof text !== 'string') return [];

  // Match e.g. "1 Sm 8:1-3", "Sm 8, 1", "St 1:1-8", "Ga 3:16", "Mt 5, 3-12", "Rm 8:28"
  const regex = /\b(?:([1-4])\s*)?([A-Za-zÀ-ỹ]+)\s+(\d+)[\s,:\.]+\s*(?:[vV]\.?\s*)?(\d+)(?:[-–—](\d+))?\b/g;
  const results: ScriptureMatch[] = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    const prefix = m[1] ? m[1].trim() + ' ' : '';
    const bookWord = m[2].trim();
    const rawBook = (prefix + bookWord).trim();
    const canonicalSlug = getCanonicalBookSlug(rawBook);
    if (!canonicalSlug) continue;

    // Filter out potential common word false positives
    const lowerRaw = rawBook.toLowerCase();
    if (lowerRaw === 'a' || lowerRaw === 'va' || lowerRaw === 'o' || lowerRaw === 'trong' || lowerRaw === 'va lai') {
      continue;
    }

    const chapter = parseInt(m[3], 10);
    const verseStart = m[4] ? parseInt(m[4], 10) : undefined;
    const verseEnd = m[5] ? parseInt(m[5], 10) : (verseStart ? verseStart : undefined);
    const bookInfo = getBookInfoBySlug(canonicalSlug);

    const parsed: ParsedScriptureRef = {
      bookSlug: canonicalSlug,
      bookName: bookInfo ? bookInfo.name : rawBook,
      chapter,
      verseStart,
      verseEnd,
      rawRef: m[0]
    };

    results.push({
      fullMatch: m[0],
      startIndex: m.index,
      endIndex: m.index + m[0].length,
      parsed,
      url: formatScriptureUrl(canonicalSlug, chapter, verseStart, 'ntt')
    });
  }

  return results;
}

