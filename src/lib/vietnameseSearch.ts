/**
 * Module tiện ích chuẩn hóa và tìm kiếm mềm dẻo tiếng Việt không dấu
 * Hỗ trợ tra cứu địa danh, nhân vật, thuật ngữ Kinh Thánh không phân biệt dấu thanh, chữ hoa/thường,
 * khoảng trắng hay dấu gạch nối (Ví dụ: "gierusalem" vẫn khớp "Giê-ru-sa-lem", "belem" khớp "Bê-lem").
 */

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));
}

export function normalizeSearchQuery(str: string): string {
  if (!str) return '';
  return removeVietnameseTones(str)
    .toLowerCase()
    .replace(/[-_.,;:!?'"()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kiểm tra xem query có khớp với các trường văn bản mục tiêu hay không.
 * Khớp cả khi gõ có dấu, không dấu, liền chữ (unspaced), hoặc từng từ rời rạc.
 */
export function matchesSearch(fields: (string | undefined | null)[], query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawQuery = query.toLowerCase().trim();
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return true;

  const unspacedQuery = normalizedQuery.replace(/\s+/g, '');
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  // Ghép toàn bộ các trường mục tiêu lại thành một chuỗi văn bản đã chuẩn hóa
  const combinedRaw = fields.filter(Boolean).join(' ');
  const targetRaw = combinedRaw.toLowerCase();
  const normalizedTarget = normalizeSearchQuery(combinedRaw);
  const unspacedTarget = normalizedTarget.replace(/\s+/g, '');

  // 1. Khớp nguyên bản trực tiếp
  if (targetRaw.includes(rawQuery)) return true;

  // 2. Khớp chuỗi đã chuẩn hóa (có khoảng trắng)
  if (normalizedTarget.includes(normalizedQuery)) return true;

  // 3. Khớp liền chữ không dấu (ví dụ: gierusalem -> gierusalem, belem -> belem)
  if (unspacedQuery.length >= 2 && unspacedTarget.includes(unspacedQuery)) return true;

  // 4. Khớp từng token (tất cả các từ trong query phải có mặt trong target)
  return queryTokens.every((token) => normalizedTarget.includes(token));
}
