export type ActiveLiturgicalSeason = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary';

/**
 * Toggle liturgical homepage highlight in 1 line when seasons change.
 */
export const ACTIVE_LITURGICAL_SEASON: ActiveLiturgicalSeason = 'advent';

export interface AdventWeekConfig {
  week: 1 | 2 | 3 | 4;
  roman: string;
  label: string;
  theme: string;
  latinTag: string;
  candleColor: 'purple' | 'rose';
  candleLabel: string;
  scriptureQuote: string;
  scriptureRef: string;
  scriptureHref: string;
  summary: string;
}

export const ADVENT_WEEKS: AdventWeekConfig[] = [
  {
    week: 1,
    roman: 'I',
    label: 'Chúa Nhật I Mùa Vọng',
    theme: 'Tỉnh Thức & Hy Vọng',
    latinTag: 'SPES · HY VỌNG',
    candleColor: 'purple',
    candleLabel: 'Nến Tím — Nến Tiên Tri',
    scriptureQuote: '“Lạy Chúa, xin tỏ nhan Thánh Chúa, xin cứu độ chúng con.”',
    scriptureRef: 'Tv 79,4',
    scriptureHref: '/kinh-thanh/thanh-vinh/79',
    summary:
      'Khởi đầu Năm Phụng Vụ mới bằng lời mời gọi tỉnh thức, hướng tâm hồn về Đức Kitô – Ánh Sáng đang đến chiếu soi nhân loại.',
  },
  {
    week: 2,
    roman: 'II',
    label: 'Chúa Nhật II Mùa Vọng',
    theme: 'Dọn Đường & Bình An',
    latinTag: 'PAX · BÌNH AN',
    candleColor: 'purple',
    candleLabel: 'Nến Tím — Nến Bê-lem',
    scriptureQuote: '“Hãy dọn sẵn con đường của Đức Chúa, sửa lối cho thẳng để Người đi.”',
    scriptureRef: 'Is 40,3',
    scriptureHref: '/kinh-thanh/isaia/40',
    summary:
      'Tiếng hô của ngôn sứ Isaia và Thánh Gioan Tẩy Giả mời gọi hoán cải nội tâm, san bằng mọi đồi núi kiêu căng để đón Đấng Cứu Độ.',
  },
  {
    week: 3,
    roman: 'III',
    label: 'Chúa Nhật III — Gaudete',
    theme: 'Hoan Lạc Trong Chúa',
    latinTag: 'GAUDETE · HOAN LẠC',
    candleColor: 'rose',
    candleLabel: 'Nến Hồng — Nến Mục Đồng',
    scriptureQuote: '“Anh em hãy vui luôn trong niềm vui của Chúa, vì Chúa đã gần đến.”',
    scriptureRef: 'Pl 4,4-5',
    scriptureHref: '/kinh-thanh/philipphe/4',
    summary:
      'Ngọn nến hồng Gaudete bừng sáng giữa Mùa Vọng, loan báo niềm vui cứu độ cận kề cho những tâm hồn khiêm nhu và trông đợi.',
  },
  {
    week: 4,
    roman: 'IV',
    label: 'Chúa Nhật IV Mùa Vọng',
    theme: 'Tình Yêu & Nhập Thể',
    latinTag: 'CARITAS · TÌNH YÊU',
    candleColor: 'purple',
    candleLabel: 'Nến Tím — Nến Thiên Thần',
    scriptureQuote: '“Vâng, tôi đây là nữ tỳ của Chúa, xin Chúa cứ làm cho tôi như lời sứ thần nói.”',
    scriptureRef: 'Lc 1,38',
    scriptureHref: '/kinh-thanh/luca/1',
    summary:
      'Cùng Đức Trinh Nữ Maria chiêm ngắm mầu nhiệm Ngôi Lời Nhập Thể, chuẩn bị tâm hồn thành máng cỏ đơn sơ đón Chúa Giáng Sinh.',
  },
];

/**
 * Curated priority slugs for the Advent slider (merged automatically with any
 * newly published Advent posts or Sacred Music items from Supabase).
 */
export const ADVENT_CURATED_POST_SLUGS = [
  'ngai-den-the-gian-dang-toan-nang-tren-doi-so',
  'tin-mung-cuu-chuoc-hay-luat-phong-ngua',
  'hom-bia-giao-uoc-diem-hen-than-linh-trong-kinh-thanh',
];

export interface AdventShowcaseItem {
  id: string;
  kind: 'article' | 'music';
  badge: string;
  title: string;
  excerpt: string;
  href: string;
  thumbnailUrl?: string | null;
  meta?: string;
}
