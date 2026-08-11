export interface LiturgicalSeason {
  id: 'ordinary' | 'advent' | 'christmas' | 'lent' | 'easter' | 'pentecost';
  nameVi: string;
  nameEn: string;
  colorHex: string;
  darkTextColorHex: string;
  glowHex: string;
  badgeBg: string;
  icon: string;
}

/**
 * Returns the current Catholic Liturgical Season based on calendar date.
 */
export function getLiturgicalSeasonInfo(date: Date = new Date()): LiturgicalSeason {
  const month = date.getMonth() + 1; // 1 - 12
  const day = date.getDate();

  if (month === 12) {
    if (day >= 25) {
      return {
        id: 'christmas',
        nameVi: 'Mùa Giáng Sinh',
        nameEn: 'Christmas Season',
        colorHex: '#F5C518',
        darkTextColorHex: '#92400e',
        glowHex: 'rgba(245, 197, 24, 0.4)',
        badgeBg: 'rgba(245, 197, 24, 0.15)',
        icon: '⚪'
      };
    }
    return {
      id: 'advent',
      nameVi: 'Mùa Vọng',
      nameEn: 'Advent Season',
      colorHex: '#A855F7',
      darkTextColorHex: '#6b21a8',
      glowHex: 'rgba(168, 85, 247, 0.4)',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      icon: '🟣'
    };
  }

  if (month === 3 || month === 4) {
    if (month === 4 && day >= 15) {
      return {
        id: 'easter',
        nameVi: 'Mùa Phục Sinh',
        nameEn: 'Easter Season',
        colorHex: '#EAB308',
        darkTextColorHex: '#854d0e',
        glowHex: 'rgba(234, 179, 8, 0.4)',
        badgeBg: 'rgba(234, 179, 8, 0.15)',
        icon: '⚪'
      };
    }
    return {
      id: 'lent',
      nameVi: 'Mùa Chay',
      nameEn: 'Lenten Season',
      colorHex: '#9333EA',
      darkTextColorHex: '#581c87',
      glowHex: 'rgba(147, 51, 234, 0.4)',
      badgeBg: 'rgba(147, 51, 234, 0.15)',
      icon: '🟣'
    };
  }

  if (month === 6 || month === 11) {
    return {
      id: 'pentecost',
      nameVi: 'Mùa Ngũ Tuần & Các Thánh Tử Đạo',
      nameEn: 'Pentecost & Martyrs',
      colorHex: '#EF4444',
      darkTextColorHex: '#991b1b',
      glowHex: 'rgba(239, 68, 68, 0.4)',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      icon: '🔴'
    };
  }

  // Default: Ordinary Time (Green)
  return {
    id: 'ordinary',
    nameVi: 'Mùa Thường Niên',
    nameEn: 'Ordinary Time',
    colorHex: '#10B981',
    darkTextColorHex: '#047857',
    glowHex: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    icon: '🟢'
  };
}
