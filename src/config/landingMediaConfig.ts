/**
 * ============================================================================
 * ⛪ CẤU HÌNH HÌNH ẢNH TOÀN DIỆN CHO LANDING PAGE VERIDU (HỖ TRỢ GOOGLE DRIVE)
 * ============================================================================
 * 
 * 📖 HƯỚNG DẪN NHẬP LINK GOOGLE DRIVE:
 * 1. Tải ảnh lên Google Drive của bạn.
 * 2. Chuột phải vào ảnh ➔ Chọn "Chia sẻ" (Share).
 * 3. Chuyển quyền sang: "Bất kỳ ai có đường liên kết đều có thể xem" (Anyone with the link can view).
 * 4. Dán đường link (dạng https://drive.google.com/file/d/MÃ_FILE/view?usp=sharing)
 *    hoặc chỉ cần mã FILE_ID vào bất kỳ mục nào dưới đây.
 * 5. Hệ thống sẽ tự động chuyển đổi sang CDN siêu tốc của Google để tải ảnh mượt mà!
 */

export interface PillarCardConfig {
  id: string;
  pillarName: string;
  subtitle: string;
  description: string;
  href: string;
  ctaText: string;
  imageUrl: string; // Hỗ trợ link Google Drive hoặc đường dẫn nội bộ
  iconName: 'book' | 'graduation' | 'shield' | 'library';
}

export interface FaithBadgeConfig {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'cross' | 'book' | 'award' | 'church' | 'user';
}

export interface TrainingTrackConfig {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  levelTag: string;
  features: string[];
  href: string;
  ctaText: string;
  imageUrl: string; // Hỗ trợ link Google Drive hoặc đường dẫn nội bộ
}

export const LANDING_MEDIA_CONFIG = {
  // ── 1. KHỐI HERO CHÍNH (TYPOGRAPHY KHỔNG LỒ) ──────────────────────────────
  hero: {
    giantWord: 'VERIDU',
    subMottoLeft: [
      'LỜI CHÚA LÀ ÁNH SÁNG.',
      'ĐỨC TIN LÀ NỀN TẢNG.',
      'CHÂN LÝ LÀ SỰ SỐNG.'
    ],
    primaryCta: {
      text: 'Khám Phá Kinh Thánh',
      href: '/kinh-thanh',
    },
    secondaryCta: {
      text: 'Xem Lịch Sử Cứu Độ',
      href: '/lich-su',
    },
    editionTag: 'ẤN BẢN TRỰC TUYẾN 2026',
    // Ảnh nhân vật/biểu tượng cắt bóng ở tiền cảnh (Chúa Kitô / Thánh Giá / Đức Mẹ)
    foregroundCutoutUrl: '/images/stained_glass_christ.jpg', // Dán link Google Drive vào đây
    // Ảnh nền thánh đường mờ ảo phía sau
    backgroundAtmosphereUrl: '/images/sacred_cathedral.jpg', // Dán link Google Drive vào đây
  },

  // ── 2. KHỐI 4 TRỤ CỘT ĐIỆN ẢNH (CINEMATIC 4-COLUMN STRIP) ─────────────────
  pillars: [
    {
      id: 'scripture',
      pillarName: 'Kinh Thánh',
      subtitle: '73 Sách Thánh Kinh',
      description: 'Nghiên cứu trọn bộ Cựu & Tân Ước cùng bản dịch chú giải Cố LM. Nguyễn Thế Thuấn.',
      href: '/kinh-thanh',
      ctaText: 'ĐỌC BẢN VĂN',
      imageUrl: '/images/stained_glass_christ.jpg', // Dán link Google Drive
      iconName: 'book',
    },
    {
      id: 'courses',
      pillarName: 'Khóa Học',
      subtitle: 'Đào Tạo Đức Tin',
      description: 'Lộ trình học tập trực tuyến từ Giáo lý Khai tâm đến Thần học Phụng vụ và Kinh viện.',
      href: '/khoa-hoc',
      ctaText: 'XEM CÁC LỚP',
      imageUrl: '/images/sacred_cathedral.jpg', // Dán link Google Drive
      iconName: 'graduation',
    },
    {
      id: 'catechism',
      pillarName: 'Giáo Lý',
      subtitle: 'Hội Thánh Công Giáo',
      description: 'Khảo cứu 4 Trụ Cột Đức Tin, 2865 điều khoản CCC và hệ thống thẻ lật tương tác.',
      href: '/giao-ly',
      ctaText: 'KHẢO CỨU GIÁO LÝ',
      imageUrl: '/images/sacred_peter.jpg', // Dán link Google Drive
      iconName: 'shield',
    },
    {
      id: 'library',
      pillarName: 'Thư Viện',
      subtitle: 'Kho Tàng Học Thuật',
      description: 'Hàng ngàn bài khảo cứu Thần học, văn kiện Huấn Quyền và tủ sách kinh điển Công giáo.',
      href: '/thu-vien',
      ctaText: 'VÀO THƯ VIỆN',
      imageUrl: '/images/sacred_saints.jpg', // Dán link Google Drive
      iconName: 'library',
    },
  ] as PillarCardConfig[],

  // ── 3. KHỐI STORY ĐẬM CHẤT EDITORIAL (VIA - VITA - VERITAS) ───────────────
  story: {
    categoryTag: 'LỊCH SỬ CỨU ĐỘ & HUẤN QUYỀN',
    threeWords: ['VIA.', 'VITA.', 'VERITAS.'],
    translationText: 'CON ĐƯỜNG · SỰ THẬT · SỰ SỐNG',
    scriptureQuote: '“Thầy là Con Đường, là Sự Thật và là Sự Sống. Chẳng ai đến được với Chúa Cha mà không qua Thầy.”',
    scriptureRef: '— Phúc Âm theo Thánh Gioan 14, 6',
    narrativeParagraph: 'Từ thuở tạo thiên lập địa, qua các giao ước thời các Tổ Phụ và tiếng kêu của các Ngôn sứ, cho đến tột đỉnh tình yêu nơi Thập Giá và vinh quang Phục Sinh của Đức Kitô — VERIDU phụng sự sứ mạng đưa mọi tín hữu khám phá chiều sâu mầu nhiệm cứu độ.',
    cta: {
      text: 'Khám Phá Tiến Trình Cứu Độ',
      href: '/lich-su',
    },
    // Hình ảnh nghệ thuật thánh thiêng khổ lớn bên phải
    imageUrl: '/images/sacred_marian.jpg', // Dán link Google Drive vào đây
    imageAlt: 'Đức Maria và Mầu Nhiệm Nhập Thể Cứu Chuộc',
  },

  // ── 4. DẢI 5 HUY HIỆU ĐỨC TIN (TRUST & FAITH BADGES) ──────────────────────
  faithBadges: [
    {
      id: 'daily-verse',
      title: 'Lời Chúa Mỗi Ngày',
      subtitle: 'Suy niệm Tin Mừng & Câu Kinh Thánh hôm nay',
      iconName: 'cross',
    },
    {
      id: 'scholarly-library',
      title: 'Thư Viện Chuyên Khảo',
      subtitle: 'Hàng ngàn bài khảo cứu Thần học & Lịch sử',
      iconName: 'book',
    },
    {
      id: 'quiz-arena',
      title: 'Đấu Trường Giáo Lý',
      subtitle: 'Đố vui & thi trắc nghiệm trực tuyến cùng cộng đoàn',
      iconName: 'award',
    },
    {
      id: 'orthodoxy',
      title: 'Tín Lý Chuẩn Xác',
      subtitle: 'Hiệp thông trọn vẹn cùng Huấn Quyền Hội Thánh',
      iconName: 'church',
    },
    {
      id: 'faith-account',
      title: 'Tài Khoản Đức Tin',
      subtitle: 'Theo dõi tiến trình học tập & chuỗi chuyên cần',
      iconName: 'user',
    },
  ] as FaithBadgeConfig[],

  // ── 5. KHỐI LỘ TRÌNH ĐÀO TẠO ĐỨC TIN (CHOOSE YOUR TRACK) ──────────────────
  trainingTracks: [
    {
      id: 'track-catechism',
      title: 'Giáo Lý Dự Tòng & Hôn Nhân',
      subtitle: 'Khai tâm đức tin và nền tảng gia đình Kitô giáo',
      levelTag: 'KHỞI ĐẦU',
      features: [
        'Trọn bộ 24 bài giảng nền tảng đức tin',
        'Giáo án chuẩn Hội Đồng Giám Mục',
        'Thẻ ghi nhớ & bài tập trắc nghiệm',
      ],
      href: '/khoa-hoc?category=giao-ly',
      ctaText: 'KHẢO CỨU NGAY',
      imageUrl: '/images/sacred_cathedral.jpg', // Dán link Google Drive
    },
    {
      id: 'track-scripture',
      title: 'Khảo Cứu Cựu Ước & Tân Ước',
      subtitle: 'Nghiên cứu 73 Sách Thánh Kinh cùng chú giải học thuật',
      badge: 'ĐẶC TUYỂN', // Highlighted badge
      levelTag: 'TOÀN DIỆN',
      features: [
        'Văn bản đối chiếu Cựu Ước & Tân Ước',
        'Bản đồ 3D khảo cổ địa lý Thánh Kinh',
        'Phân tích mạch văn & ngữ nghĩa nguyên tác',
      ],
      href: '/khoa-hoc?category=cuu-uoc',
      ctaText: 'VÀO HỌC NGAY',
      imageUrl: '/images/stained_glass_christ.jpg', // Dán link Google Drive
    },
    {
      id: 'track-liturgy',
      title: 'Thần Học Phụng Vụ & Bí Tích',
      subtitle: 'Mầu nhiệm Thánh Thể, Phụng Vụ Thánh và 7 Bí Tích',
      levelTag: 'THIÊNG LIÊNG',
      features: [
        'Nhiệm cục Bí Tích & Năm Phụng Vụ',
        'Giải mã biểu tượng & lễ phục thánh đường',
        'Linh đạo phụng vụ trong đời sống thường ngày',
      ],
      href: '/khoa-hoc?category=phung-vu',
      ctaText: 'KHÁM PHÁ',
      imageUrl: '/images/sacred_peter.jpg', // Dán link Google Drive
    },
    {
      id: 'track-theology',
      title: 'Triết Học & Giáo Phụ Học',
      subtitle: 'Nền tảng thần học kinh viện và các Thánh Tiến sĩ',
      levelTag: 'HỌC THUẬT',
      features: [
        'Tư tưởng triết học Thánh Tôma Aquinô',
        'Di sản các Giáo phụ tiên khởi (Patristics)',
        'Biện giáo, tương quan Đức tin và Lý trí',
      ],
      href: '/khoa-hoc?category=triet-hoc',
      ctaText: 'NGHIÊN CỨU',
      imageUrl: '/images/sacred_saints.jpg', // Dán link Google Drive
    },
  ] as TrainingTrackConfig[],
};
