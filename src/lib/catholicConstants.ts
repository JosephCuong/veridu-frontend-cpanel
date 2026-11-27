export const VIETNAM_DIOCESES: string[] = [
  'Tổng Giáo Phận Sài Gòn (TP.HCM)',
  'Tổng Giáo Phận Hà Nội',
  'Tổng Giáo Phận Huế',
  'Giáo Phận Bà Rịa',
  'Giáo Phận Bắc Ninh',
  'Giáo Phận Ban Mê Thuột',
  'Giáo Phận Bùi Chu',
  'Giáo Phận Cần Thơ',
  'Giáo Phận Đà Lạt',
  'Giáo Phận Đà Nẵng',
  'Giáo Phận Hà Tĩnh',
  'Giáo Phận Hải Phòng',
  'Giáo Phận Hưng Hóa',
  'Giáo Phận Kon Tum',
  'Giáo Phận Lạng Sơn - Cao Bằng',
  'Giáo Phận Long Xuyên',
  'Giáo Phận Mỹ Tho',
  'Giáo Phận Nha Trang',
  'Giáo Phận Phan Thiết',
  'Giáo Phận Phát Diệm',
  'Giáo Phận Phú Cường',
  'Giáo Phận Quy Nhơn',
  'Giáo Phận Thái Bình',
  'Giáo Phận Thanh Hóa',
  'Giáo Phận Vinh',
  'Giáo Phận Vĩnh Long',
  'Giáo Phận Xuân Lộc',
  'Hải Ngoại / Khác',
];

export const VOCATION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'layperson', label: 'Giáo dân / Tín hữu' },
  { value: 'catechist', label: 'Giáo lý viên / Huynh trưởng' },
  { value: 'seminarian', label: 'Chủng sinh / Ứng sinh' },
  { value: 'religious', label: 'Tu sĩ (Nam / Nữ)' },
  { value: 'priest', label: 'Linh mục / Phó tế' },
  { value: 'other', label: 'Người tìm hiểu / Khác' },
];

export const PAYMENT_METHOD_OPTIONS: Array<{ value: string; label: string; desc: string }> = [
  { value: 'vietqr', label: 'VietQR / Chuyển khoản nhanh 24/7', desc: 'Quét mã QR ngân hàng Việt Nam, kích hoạt tự động' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản thủ công theo mã đơn hàng' },
  { value: 'momo', label: 'Ví điện tử MoMo', desc: 'Thanh toán nhanh bằng ứng dụng MoMo' },
  { value: 'card', label: 'Thẻ Visa / Mastercard (Quốc tế)', desc: 'Phù hợp người dùng trong nước và hải ngoại' },
  { value: 'paypal', label: 'PayPal (Quốc tế)', desc: 'Thanh toán USD cho cộng đồng Việt kiều & quốc tế' },
];

export const COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'VN', label: 'Việt Nam' },
  { code: 'US', label: 'Hoa Kỳ (United States)' },
  { code: 'AU', label: 'Úc (Australia)' },
  { code: 'CA', label: 'Canada' },
  { code: 'FR', label: 'Pháp (France)' },
  { code: 'DE', label: 'Đức (Germany)' },
  { code: 'JP', label: 'Nhật Bản (Japan)' },
  { code: 'KR', label: 'Hàn Quốc (South Korea)' },
  { code: 'SG', label: 'Singapore' },
  { code: 'OTHER', label: 'Quốc gia khác' },
];

export function getVocationLabel(vocation?: string | null): string {
  const found = VOCATION_OPTIONS.find((v) => v.value === vocation);
  return found ? found.label : 'Giáo dân / Tín hữu';
}
