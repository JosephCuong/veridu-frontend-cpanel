// VERIDU Gamification Core Logic (1 - 100 Levels, Pure Typography, Mana Economy, Multi-track Titles)

export interface LevelInfo {
  level: number;
  currentExp: number;
  minExp: number;
  nextLevelExp: number;
  progressPercent: number;
  title: string;
  tierColor: 'bronze' | 'bronze-bright' | 'silver' | 'gold' | 'platinum' | 'aureole';
}

export interface TitleDefinition {
  id: string;
  name: string;
  category: 'level' | 'author' | 'game' | 'special';
  description: string;
  requiredValue: number;
}

// ── EXP FORMULA FOR 100 LEVELS ──
// Required EXP for Level L: Math.floor(100 * (L ^ 1.45))
export function getExpForLevel(level: number): number {
  if (level <= 1) return 100;
  if (level >= 100) return 100000;
  return Math.floor(100 * Math.pow(level, 1.45));
}

// Calculate current level and progress from total EXP
export function calculateLevelInfo(totalExp: number = 100, customTitle?: string): LevelInfo {
  const safeExp = Math.max(100, totalExp || 100);
  let currentLevel = 1;

  for (let lvl = 1; lvl <= 100; lvl++) {
    if (safeExp >= getExpForLevel(lvl)) {
      currentLevel = lvl;
    } else {
      break;
    }
  }

  const minExp = getExpForLevel(currentLevel);
  const nextLevelExp = currentLevel >= 100 ? minExp : getExpForLevel(currentLevel + 1);
  const expDiff = nextLevelExp - minExp;
  const progressPercent = currentLevel >= 100 ? 100 : Math.min(100, Math.max(0, Math.round(((safeExp - minExp) / (expDiff || 1)) * 100)));

  // Milestone Title based on level
  let milestoneTitle = 'NGƯỜI TÌM HIỂU';
  let tierColor: LevelInfo['tierColor'] = 'bronze';

  if (currentLevel >= 100) {
    milestoneTitle = 'TÔNG ĐỒ ÁNH SÁNG';
    tierColor = 'aureole';
  } else if (currentLevel >= 75) {
    milestoneTitle = 'HỌC GIẢ UYÊN BÁC';
    tierColor = 'platinum';
  } else if (currentLevel >= 50) {
    milestoneTitle = 'HIỆP SĨ PHÚC ÂM';
    tierColor = 'gold';
  } else if (currentLevel >= 25) {
    milestoneTitle = 'MÔN ĐỆ TRUNG TÍN';
    tierColor = 'silver';
  } else if (currentLevel >= 10) {
    milestoneTitle = 'NGƯỜI NĂNG ĐỘNG';
    tierColor = 'bronze-bright';
  } else {
    milestoneTitle = 'NGƯỜI TÌM HIỂU';
    tierColor = 'bronze';
  }

  return {
    level: currentLevel,
    currentExp: safeExp,
    minExp,
    nextLevelExp,
    progressPercent,
    title: (customTitle && !['Tân Tòng', 'tan_tong', 'Tân tòng', 'Học Viên', 'hoc_vien'].includes(customTitle.trim()))
      ? customTitle
      : milestoneTitle,
    tierColor
  };
}

// ── MULTI-TRACK TITLES CATALOG ──
export const ALL_TITLES_CATALOG: TitleDefinition[] = [
  // Level Titles
  { id: 'level_1', name: 'NGƯỜI TÌM HIỂU', category: 'level', description: 'Đạt Cấp 1 trên hành trình đức tin', requiredValue: 1 },
  { id: 'level_10', name: 'NGƯỜI NĂNG ĐỘNG', category: 'level', description: 'Đạt Cấp 10 với tinh thần hăng say học hỏi', requiredValue: 10 },
  { id: 'level_25', name: 'MÔN ĐỆ TRUNG TÍN', category: 'level', description: 'Đạt Cấp 25 kiên trì theo Thầy Chí Thánh', requiredValue: 25 },
  { id: 'level_50', name: 'HIỆP SĨ PHÚC ÂM', category: 'level', description: 'Đạt Cấp 50 dũng cảm sống và bảo vệ chân lý', requiredValue: 50 },
  { id: 'level_75', name: 'HỌC GIẢ UYÊN BÁC', category: 'level', description: 'Đạt Cấp 75 thấu hiểu sâu sắc kho tàng Kinh Thánh', requiredValue: 75 },
  { id: 'level_100', name: 'TÔNG ĐỒ ÁNH SÁNG', category: 'level', description: 'Đạt Cấp 100 cao quý nhất toàn hệ thống', requiredValue: 100 },

  // Author Titles
  { id: 'author_1', name: 'CỘNG TÁC VIÊN KHỞI SỰ', category: 'author', description: 'Đã xuất bản thành công 1 bài viết trên VERIDU', requiredValue: 1 },
  { id: 'author_5', name: 'CÂY BÚT ĐẠO ĐỨC', category: 'author', description: 'Đã đóng góp 5 bài viết suy niệm thần học', requiredValue: 5 },
  { id: 'author_10', name: 'TÁC GIẢ UY TÍN', category: 'author', description: 'Đã xuất bản 10 bài viết có giá trị học thuật', requiredValue: 10 },
  { id: 'author_25', name: 'CHỦ BIÊN THẦN HỌC', category: 'author', description: 'Đã đóng góp 25 bài viết chuyên sâu', requiredValue: 25 },

  // Game Trophies
  { id: 'game_millionaire', name: 'NHÀ THÔNG THÁI ĐỨC TIN', category: 'game', description: 'Vượt qua câu 15 game Triệu Phú Đức Tin', requiredValue: 15 },
  { id: 'game_promised_land', name: 'CHIẾN BINH ĐẤT HỨA', category: 'game', description: 'Hoàn thành 40 chặng Hành Trình Đất Hứa', requiredValue: 40 },
  { id: 'game_quiz_champ', name: 'QUÁN QUÂN ĐẤU TRƯỜNG', category: 'game', description: 'Đoạt Top 1 trong phòng thi Đấu Trường Quiz', requiredValue: 1 }
];

// Mana Action Definitions
export const MANA_RULES = {
  INITIAL_MANA: 100,
  DAILY_STREAK_REWARD: 20,
  LESSON_COMPLETE_REWARD: 30,
  QUIZ_WIN_REWARD: 25,
  ARTICLE_PUBLISHED_REWARD: 100,
  UNLOCK_ARTICLE_COST: 10,
  DOWNLOAD_DOCUMENT_COST: 20,
  QUIZ_ROOM_ENTRY_COST: 15,
  GAME_LIFELINE_COST: 10
};
