import React from 'react';

export interface LiturgicalIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Biểu tượng Chi-Rho (PX Monogram) — Biểu tượng Kitô giáo cổ đại thiêng liêng nhất thời các Tông Đồ
 */
export function ChiRhoIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* P (Rho) vertical shaft */}
      <line x1="12" y1="2" x2="12" y2="22" />
      {/* P (Rho) loop */}
      <path d="M12 2h3.5a4 4 0 0 1 0 8H12" />
      {/* X (Chi) diagonal cross */}
      <line x1="5" y1="7" x2="19" y2="17" />
      <line x1="19" y1="7" x2="5" y2="17" />
      {/* Alpha & Omega anchors */}
      <path d="M6 20h2M7 18v2" strokeWidth="1.5" />
      <path d="M16 20h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-2" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Thánh Giá Jerusalem (Jerusalem Cross) — Biểu tượng Thánh Địa & 5 Vết Thương Chúa
 */
export function JerusalemCrossIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Main Cross */}
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      {/* Main Cross crossbars */}
      <line x1="9" y1="2" x2="15" y2="2" />
      <line x1="9" y1="22" x2="15" y2="22" />
      <line x1="2" y1="9" x2="2" y2="15" />
      <line x1="22" y1="9" x2="22" y2="15" />
      {/* 4 Little Crosses in Quadrants */}
      <path d="M6 5v2M5 6h2" strokeWidth="1.5" />
      <path d="M18 5v2M17 6h2" strokeWidth="1.5" />
      <path d="M6 17v2M5 18h2" strokeWidth="1.5" />
      <path d="M18 17v2M17 18h2" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Cuộn Cổ Thư Thánh Kinh (Scripture Scroll) — Biểu tượng Khảo cổ Cổ thư Biển Chết & Bản văn Cổ ngữ
 */
export function ScriptureScrollIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h11a2 2 0 0 0 2-2v-2H6" />
      <path d="M4 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4Z" />
      <line x1="7" y1="9" x2="15" y2="9" strokeWidth="1.5" />
      <line x1="7" y1="13" x2="13" y2="13" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Ngọn Đèn Dầu Cổ (Ancient Oil Lamp) — Biểu tượng Lời Chúa là ngọn đèn soi bước (Tv 119:105) & Hang Toại Đạo
 */
export function AncientLampIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Lamp Body */}
      <path d="M3 13c0 4 3.5 7 9 7s9-3 9-7c0-2-2-4-5-4H8c-3 0-5 2-5 4z" />
      {/* Handle */}
      <path d="M19 12c2.5 0 4-1.5 4-3.5S21.5 5 19 6" />
      {/* Spout / Wick hole */}
      <path d="M4 12V9c0-1 1-2 2-2h1" />
      {/* Sacred Flame */}
      <path d="M6 3c1 1.5 1 2.5 0 4-1-1.5-1-2.5 0-4z" fill="currentColor" fillOpacity="0.3" />
      {/* Base */}
      <path d="M9 20h6" />
    </svg>
  );
}

/**
 * Cột Đá Hy-La Cổ Đại (Ionic Pillar) — Biểu tượng Khảo Cổ Học, Cổ Thành Thánh Địa & Nền Tảng Chân Lý
 */
export function PillarIonicIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Capital Scrolls (Volutes) */}
      <path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4V4z" />
      <circle cx="5" cy="5" r="1" />
      <circle cx="19" cy="5" r="1" />
      {/* Shaft Flutes */}
      <line x1="7" y1="6" x2="7" y2="18" />
      <line x1="10" y1="6" x2="10" y2="18" />
      <line x1="14" y1="6" x2="14" y2="18" />
      <line x1="17" y1="6" x2="17" y2="18" />
      {/* Base */}
      <path d="M3 18h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z" />
    </svg>
  );
}

/**
 * Chén Thánh Phụng Vụ (Sacred Chalice) — Biểu tượng Bí Tích Thánh Thể & Giao Ước Mới
 */
export function SacredChaliceIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cup */}
      <path d="M6 3h12v4a6 6 0 0 1-12 0V3z" />
      {/* Host / Bread above */}
      <circle cx="12" cy="3" r="2.5" strokeDasharray="1 1" />
      {/* Stem */}
      <line x1="12" y1="13" x2="12" y2="19" />
      {/* Node / Knob */}
      <circle cx="12" cy="15" r="1.5" />
      {/* Base */}
      <path d="M7 21h10a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2z" />
    </svg>
  );
}

/**
 * Con Cá Kitô Giáo (Ichthus) — Biểu tượng Mật Mã Đức Tin Hội Thánh Sơ Khai (ΙΧΘΥΣ)
 */
export function IchthusIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Upper Arch extending to tail */}
      <path d="M2 12c5-7 14-7 20 6" />
      {/* Lower Arch extending to tail */}
      <path d="M2 12c5 7 14 7 20-6" />
      {/* Eye */}
      <circle cx="7" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Chim Bồ Câu Thánh Thần (Dove of Peace) — Biểu tượng Chúa Thánh Thần & Lời Hứa Bình An
 */
export function DoveSpiritIcon({ size = 24, className = 'w-6 h-6', ...props }: LiturgicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 8c1.5 0 3-1 3-2.5S19.5 3 18 3c-2 0-3.5 1.5-4 3L11 8" />
      <path d="M11 8c-3 0-6 2-7 5 3 0 5-1 7-2" />
      <path d="M11 8l-2 9c3-1 6-4 7-7" />
      <path d="M16 10c2 2 4 3 6 3" />
      {/* Olive leaf in beak */}
      <path d="M21 4.5c1 .5 2 0 2-1" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Bộ Icon Tuyển Chọn Tích Hợp Tiện Lợi (LiturgicalIcon dispatcher)
 */
export type LiturgicalIconName = 
  | 'chi-rho'
  | 'jerusalem-cross'
  | 'scripture-scroll'
  | 'ancient-lamp'
  | 'pillar-ionic'
  | 'chalice'
  | 'ichthus'
  | 'dove-spirit';

export function LiturgicalIcon({
  name,
  size = 20,
  className = 'w-5 h-5',
  ...props
}: { name: LiturgicalIconName } & LiturgicalIconProps) {
  switch (name) {
    case 'chi-rho':
      return <ChiRhoIcon size={size} className={className} {...props} />;
    case 'jerusalem-cross':
      return <JerusalemCrossIcon size={size} className={className} {...props} />;
    case 'scripture-scroll':
      return <ScriptureScrollIcon size={size} className={className} {...props} />;
    case 'ancient-lamp':
      return <AncientLampIcon size={size} className={className} {...props} />;
    case 'pillar-ionic':
      return <PillarIonicIcon size={size} className={className} {...props} />;
    case 'chalice':
      return <SacredChaliceIcon size={size} className={className} {...props} />;
    case 'ichthus':
      return <IchthusIcon size={size} className={className} {...props} />;
    case 'dove-spirit':
      return <DoveSpiritIcon size={size} className={className} {...props} />;
    default:
      return <ScriptureScrollIcon size={size} className={className} {...props} />;
  }
}
