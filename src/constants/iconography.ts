/**
 * VERIDU ICONOGRAPHY DESIGN SYSTEM & GUIDELINES
 * 
 * Quy chuẩn thiết kế biểu tượng và quy tắc cấm kỵ (Anti-Patterns):
 * 1. TUYỆT ĐỐI KHÔNG sử dụng các biểu tượng phong cách Generic AI:
 *    - CẤM: Sparkles, Bot, Robot, Cpu, Wand, Zap, BrainCircuit (tạo cảm giác chatbot công nghệ tầm thường).
 * 2. TUYỆT ĐỐI KHÔNG sử dụng emoji làm icon UI chính trong navigation, buttons, cards (theo chuẩn uiux-designer).
 * 3. TẬP TRUNG 100% vào biểu tượng Công Giáo (Sacred Liturgy) và Khảo Cổ / Lịch Sử Cứu Độ (Biblical Archaeology).
 */

export const ICONOGRAPHY_STANDARDS = {
  // 1. Biểu tượng Phụng Vụ & Thần Học Công Giáo (Sacred Liturgy)
  SACRED_SYMBOLS: [
    'ChiRho',          // Biểu tượng PX Kitô giáo sơ khai
    'JerusalemCross',  // Thánh giá Jerusalem 5 dấu thánh
    'Cross',           // Thánh giá phụng vụ
    'ScriptureScroll', // Cuộn cổ thư Lời Chúa
    'BookOpen',        // Sách Kinh Thánh 73 cuốn
    'SacredChalice',   // Chén Thánh & Bánh Thánh
    'DoveSpirit',      // Chim bồ câu Chúa Thánh Thần
    'Ichthus',         // Mật mã con cá Kitô hữu sơ khai
    'AncientLamp',     // Ngọn đèn dầu cổ Catacomb
    'Church',          // Nhà thờ / Hội Thánh hiệp hành
    'Flame',           // Lửa Thánh Thần
    'Crown',           // Triều thiên Nước Trời
    'Feather',         // Bút lông tác giả Phúc Âm
  ],

  // 2. Biểu tượng Khảo Cổ Học & Dòng Thời Gian (Biblical Archaeology & History)
  ARCHAEOLOGY_SYMBOLS: [
    'PillarIonic',     // Cột đá Hy-La cổ thành
    'Compass',         // La bàn định hướng Thánh Địa
    'Landmark',        // Di chỉ cổ khảo cổ học
    'MapPin',          // Tọa độ địa lý Thánh Địa (Jerusalem, Galilee...)
    'Globe',           // Bản đồ thế giới cổ ANE
    'History',         // Dòng thời gian Lịch sử Cứu độ
    'Clock',           // Thời kỳ niên biểu
    'Scroll',          // Bản văn cổ ngữ Do-thái, Hy-lạp, La-tinh
    'Milestone',       // Cột mốc lịch sử
  ],

  // 3. DANH SÁCH CẤM KỴ (BANNED ANTI-PATTERNS)
  BANNED_AI_ICONS: [
    'Sparkles',        // Các ngôi sao 4 cánh lấp lánh kiểu AI magic
    'Bot',             // Robot hình đầu máy tròn
    'Robot',           // Người máy
    'Cpu',             // Chip máy tính
    'Wand',            // Đũa thần phép thuật
    'Zap',             // Tia sét công nghệ startup
    'BrainCircuit',    // Não bộ vi mạch
  ],

  // 4. Quy tắc UI/UX
  RULES: {
    NO_EMOJI_AS_UI_ICONS: true,
    FIXED_VIEWBOX_24X24: true,
    STROKE_WIDTH_DEFAULT: 2,
    COLOR_TRANSITION_SMOOTH: true,
  }
} as const;
