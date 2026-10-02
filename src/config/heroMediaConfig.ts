/**
 * ============================================================================
 * ⛪ CẤU HÌNH HÌNH ẢNH HERO SECTION & THẺ 3D PARALLAX (HỖ TRỢ GOOGLE DRIVE)
 * ============================================================================
 * 
 * Hướng dẫn dành cho Người quản trị / Soạn thảo:
 * 1. Bạn có thể dán trực tiếp link chia sẻ Google Drive của ảnh vào đây:
 *    Ví dụ: 'https://drive.google.com/file/d/1ABCxyz123.../view?usp=sharing'
 *    Hệ thống sẽ tự động chuyển đổi sang CDN tốc độ cao của Google để hiển thị mượt mà.
 * 2. Bạn cũng có thể dùng ảnh nội bộ trong thư mục public:
 *    Ví dụ: '/images/sacred_cathedral.jpg'
 * 3. Hoặc link ảnh từ bất kỳ trang web nào (https://...)
 */

export interface HeroBackgroundSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  alt: string;
}

export interface HeroCardThemeMedia {
  themeId: 'gold' | 'emerald' | 'purple' | 'crimson';
  imageUrl: string;
  alt: string;
  badgeTitle?: string;
}

/**
 * 🌟 DANH SÁCH ẢNH NỀN CAROUSEL / SLIDER CHO HERO SECTION
 * Tự động chuyển slide sau mỗi 7 giây (hoặc bấm chọn nút tròn)
 */
export const HERO_BACKGROUND_SLIDES: HeroBackgroundSlide[] = [
  {
    id: 'slide-cathedral',
    title: 'Thánh Đường Ánh Sáng & Khảo Cứu Đức Tin',
    subtitle: 'Nơi tri thức Thần học hội tụ cùng vẻ đẹp Phụng vụ muôn đời',
    imageUrl: '/images/sacred_cathedral.jpg', // Dán link Google Drive vào đây nếu muốn
    alt: 'Thánh đường Công giáo cổ kính với ánh sáng thiên đình',
  },
  {
    id: 'slide-christ',
    title: 'Đức Kitô Phục Sinh — Ánh Sáng Muôn Dân',
    subtitle: 'Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi',
    imageUrl: '/images/stained_glass_christ.jpg', // Dán link Google Drive vào đây nếu muốn
    alt: 'Cửa sổ kính màu Đức Kitô Phục Sinh rạng ngời',
  },
  {
    id: 'slide-marian',
    title: 'Đức Maria — Mẹ Hội Thánh & Ngai Tòa Lòng Thương Xót',
    subtitle: 'Suy niệm các mầu nhiệm cứu độ cùng Đức Trinh Nữ',
    imageUrl: '/images/sacred_marian.jpg', // Dán link Google Drive vào đây nếu muốn
    alt: 'Tranh thánh Đức Mẹ Maria',
  },
  {
    id: 'slide-peter',
    title: 'Tông Truyền Vững Bền — Đá Tảng Đức Tin',
    subtitle: 'Trải qua 2000 năm lịch sử Giáo hội duy nhất, thánh thiện, công giáo và tông truyền',
    imageUrl: '/images/sacred_peter.jpg', // Dán link Google Drive vào đây nếu muốn
    alt: 'Thánh Phêrô và nền móng Tông Truyền',
  },
];

/**
 * ⛪ HÌNH ẢNH TRONG KHUNG THẺ KÍNH MÀU 3D PARALLAX CHO TỪNG CHỦ ĐỀ
 * Khi người dùng bấm chuyển đổi 4 chủ đề (Kinh Thánh, Khảo Cổ, Lịch Sử, Đấu Trường),
 * ảnh trong khung vòm Thánh Đường sẽ tự động đổi tương ứng.
 */
export const HERO_CARD_IMAGES: Record<string, HeroCardThemeMedia> = {
  gold: {
    themeId: 'gold',
    imageUrl: '/images/stained_glass_christ.jpg', // Dán link Google Drive ảnh Kinh Thánh / Chúa Kitô vào đây
    alt: 'Đức Kitô Phục Sinh — Cửa Sổ Kính Màu Nhà Thờ',
    badgeTitle: '✦ LUX CHRISTI ✦',
  },
  emerald: {
    themeId: 'emerald',
    imageUrl: '/images/sacred_cathedral.jpg', // Dán link Google Drive ảnh Khảo Cổ / Thánh Địa vào đây
    alt: 'Thánh Địa Jerusalem & Khảo Cổ Địa Lý 3D',
    badgeTitle: '✦ TERRA SANCTA ✦',
  },
  purple: {
    themeId: 'purple',
    imageUrl: '/images/sacred_peter.jpg', // Dán link Google Drive ảnh Lịch Sử Cứu Độ vào đây
    alt: 'Tiến Trình 4000 Năm Lịch Sử Cứu Độ',
    badgeTitle: '✦ HISTORIA SALUTIS ✦',
  },
  crimson: {
    themeId: 'crimson',
    imageUrl: '/images/sacred_saints.jpg', // Dán link Google Drive ảnh Đấu Trường / Các Thánh vào đây
    alt: 'Đấu Trường Giáo Lý & Vinh Danh Đức Tin',
    badgeTitle: '✦ FIDES ET RATIO ✦',
  },
};
