import React from 'react';

export interface VeriduIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * 1. VERIDU Emblem — Ngọn Lửa Chân Lý bao bọc Chìa Khóa & Sách Mở chữ V
 */
export function VeriduEmblemIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Sacred Flame */}
      <path d="M12 2.2C10.2 5.4 6.2 7.8 6.2 13.6c0 3.7 2.6 6.7 5.8 7.7 3.2-1 5.8-4 5.8-7.7 0-2.7-1.1-4.9-2.4-6.6-.4 1.3-1.2 2.1-2 2.4.7-2.2.3-4.9-1.4-7.2Z" />
      {/* Inner Key of Truth */}
      <circle cx="12" cy="11.4" r="1.4" />
      <path d="M12 12.8v4.3" />
      <path d="M12 15.2h1.4" />
      {/* Open V-Book Base */}
      <path d="M9.4 16.4 12 19.2l2.6-2.8" />
    </svg>
  );
}

/**
 * 2. Thánh Giá Phụng Vụ thanh mảnh (Liturgical Cross)
 */
export function VeriduCrossIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3v18" />
      <path d="M6.5 9h11" />
      <path d="M10.5 3h3" />
      <path d="M10.5 21h3" />
      <path d="M6.5 7.7v2.6" />
      <path d="M17.5 7.7v2.6" />
    </svg>
  );
}

/**
 * 3. Ánh Sao Bê-lem 4 cánh & vòng hào quang (Minimalist Bethlehem Star)
 */
export function VeriduStarIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="5.2" strokeOpacity="0.55" />
      <path d="M12 2.2 13.8 10.2 21.8 12 13.8 13.8 12 21.8 10.2 13.8 2.2 12 10.2 10.2 12 2.2Z" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * 4. Ngọn Nến Mùa Vọng tối giản (Advent Candle with lit state)
 */
export function VeriduCandleIcon({
  className = 'w-5 h-5',
  lit = true,
  flameClassName,
  ...props
}: VeriduIconProps & { lit?: boolean; flameClassName?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Flame */}
      {lit ? (
        <path
          d="M12 2.4c-1.3 1.7-2 2.9-2 4.1a2 2 0 1 0 4 0c0-1.2-.7-2.4-2-4.1Z"
          className={flameClassName}
          fill="currentColor"
          fillOpacity="0.25"
        />
      ) : (
        <path d="M12 6.8v1.7" strokeOpacity="0.6" />
      )}
      {/* Candle body */}
      <rect x="8.8" y="10" width="6.4" height="10.2" rx="1.2" />
      <path d="M8.8 12.6c1.1.7 2.2.7 3.2 0s2.1-.7 3.2 0" strokeOpacity="0.55" />
      {/* Base saucer */}
      <path d="M6.2 21h11.6" />
    </svg>
  );
}

/**
 * 5. Vương Miện Đức Kitô Vua (Minimalist Advent Crown)
 */
export function VeriduCrownIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4.2 17.8 3 8.8l5 3.6L12 6l4 6.4 5-3.6-1.2 9H4.2Z" />
      <path d="M4.5 20h15" />
      <circle cx="12" cy="14.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.2" cy="15" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="15" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * 6. Máng Cỏ Bê-lem tối giản (Minimalist Bethlehem Manger)
 */
export function VeriduMangerIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Hay / soft crown of manger */}
      <path d="M5.5 10.5c1.2-1.8 3-2.6 6.5-2.6s5.3.8 6.5 2.6" />
      <path d="M7.5 8.8 6.6 7.4M12 7.9V6.2M16.5 8.8l.9-1.4" strokeOpacity="0.75" />
      {/* Wooden cradle */}
      <path d="M4.5 10.5h15l-1.8 4.4H6.3l-1.8-4.4Z" />
      {/* Crossed legs */}
      <path d="M7.6 14.9 15.8 20.5" />
      <path d="M16.4 14.9 8.2 20.5" />
    </svg>
  );
}

/**
 * 7. Kinh Thánh Mở gắn Thánh Giá (Sacred Scripture)
 */
export function VeriduScriptureIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 6.8c-2.2-1.7-5.4-2.1-8.5-1.5v12.8c3.1-.6 6.3-.2 8.5 1.5" />
      <path d="M12 6.8c2.2-1.7 5.4-2.1 8.5-1.5v12.8c-3.1-.6-6.3-.2-8.5 1.5" />
      <path d="M12 6.8v12.8" />
      {/* Subtle cross above open book */}
      <path d="M12 2.2v3.1" />
      <path d="M10.6 3.5h2.8" />
    </svg>
  );
}

/**
 * 8. Chén Thánh & Thánh Thể (Liturgy / Formation)
 */
export function VeriduChaliceIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Host above chalice */}
      <circle cx="12" cy="5.3" r="2.6" />
      <path d="M12 4v2.6M10.8 5.3h2.4" strokeWidth={1.2} />
      {/* Chalice cup */}
      <path d="M7.2 9.5h9.6c0 3.6-2.1 6-4.8 6s-4.8-2.4-4.8-6Z" />
      {/* Stem & foot */}
      <path d="M12 15.5v4.5" />
      <circle cx="12" cy="17.7" r="0.8" fill="currentColor" stroke="none" />
      <path d="M8 20.8c1.1-.8 2.5-1.1 4-1.1s2.9.3 4 1.1H8Z" />
    </svg>
  );
}

/**
 * 9. Đàn Hạc Thánh Nhạc (Sacred Music Lyre)
 */
export function VeriduLyreIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Crossbar */}
      <path d="M6.2 5.2h11.6" />
      {/* Graceful arms */}
      <path d="M7.2 5.2C5.2 9.5 6.4 15.2 9.4 17.5" />
      <path d="M16.8 5.2c2 4.3.8 10-2.2 12.3" />
      {/* Strings */}
      <path d="M10 5.2v12M12 5.2v12M14 5.2v12" strokeOpacity="0.65" />
      {/* Soundbox base */}
      <path d="M8.4 17.5h7.2l-.9 3.2H9.3l-.9-3.2Z" />
    </svg>
  );
}

/**
 * 10. Cuộn Thư Thánh Kinh & Lịch Sử (Scholarly Scroll)
 */
export function VeriduScrollIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 4.2h10.8a2 2 0 0 1 2 2v1.3a2 2 0 0 1-2 2H17" />
      <path d="M7 4.2a2.2 2.2 0 0 0-2.2 2.2v11.2a2.2 2.2 0 0 0 2.2 2.2h9.2a2.2 2.2 0 0 0 2.2-2.2V9.5" />
      <path d="M7 4.2a2.2 2.2 0 0 1 2.2 2.2v11.2a2.2 2.2 0 0 1-2.2 2.2" />
      <path d="M11.6 10.5h4.2M11.6 13.8h4.2M11.6 17h2.6" strokeOpacity="0.7" />
    </svg>
  );
}

/**
 * 11. Biểu tượng Kitô giáo cổ điển Chi-Rho (☧)
 */
export function VeriduChiRhoIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Rho (P) */}
      <path d="M12 3.2v17.6" />
      <path d="M12 3.6h2.8a3.2 3.2 0 0 1 0 6.4H12" />
      {/* Chi (X) */}
      <path d="M6.8 9.2 17.2 18.8" />
      <path d="M17.2 9.2 6.8 18.8" />
    </svg>
  );
}

/**
 * 12. Chìa Khóa Huấn Quyền & Giáo Lý (Magisterium Keys)
 */
export function VeriduKeysIcon({ className = 'w-5 h-5', ...props }: VeriduIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="8.2" cy="8.2" r="3.4" />
      <path d="M10.7 10.7 19 19" />
      <path d="M16.2 16.2 18 14.4M17.8 17.8l1.8-1.8" />
      <circle cx="15.8" cy="8.2" r="3.4" strokeOpacity="0.65" />
      <path d="M13.3 10.7 5 19" strokeOpacity="0.65" />
      <path d="M7.8 16.2 6 14.4" strokeOpacity="0.65" />
    </svg>
  );
}
