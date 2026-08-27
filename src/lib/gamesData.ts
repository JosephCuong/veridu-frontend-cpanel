export interface GameItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  cover_image: string;
  badge: string;
  category: string;
  estimated_time: string;
  target_age: string;
  description: string;
  reward_xp: number;
  reward_manna: number;
  total_stages?: number;
  play_url: string;
}

export interface GameEvent {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  banner_image?: string;
  description: string;
  event_type: 'weekly_tournament' | 'seasonal_event' | 'news';
  reward_xp: number;
  reward_manna: number;
  reward_badge?: string;
  start_time?: string;
  end_time?: string;
  is_active: boolean;
}

export interface MapStage {
  id: number;
  zone_id: number;
  title: string;
  subtitle: string;
  icon: string;
  scripture_ref: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  reward_xp: number;
  reward_manna: number;
  x_percent: number;
  y_percent: number;
}

export interface MapZone {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  background_theme: string;
  stages: MapStage[];
}

export interface MillionaireQuestion {
  id: number;
  level: number;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  scripture_hint: string;
  saint_advice: string;
  prize_xp: number;
  prize_manna: number;
  is_safe_milestone?: boolean;
}

export const ARCADE_GAMES: GameItem[] = [
  {
    id: 'game_1',
    slug: 'hanh-trinh-dat-hua',
    title: 'Hành Trình Đất Hứa 2D',
    subtitle: 'Vượt Sa Mạc Sinai & Khám Phá 4 Vùng Đất Thánh Kinh',
    cover_image: '/images/games/exodus_quest.jpg',
    badge: 'Bản Đồ Chiến Đấu 2D',
    category: 'Phiêu Lưu Thánh Kinh',
    estimated_time: '10-15 phút',
    target_age: '6-14 tuổi',
    description: 'Đồng hành cùng dân Chúa trong hành trình Xuất Hành qua 4 vùng đất Kinh Thánh, vận dụng Khiên Lời Chúa để đánh bại thử thách và chinh phục Đất Hứa.',
    reward_xp: 500,
    reward_manna: 300,
    total_stages: 12,
    play_url: '/game/hanh-trinh-dat-hua'
  },
  {
    id: 'game_2',
    slug: 'trieu-phu-duc-tin',
    title: 'Chinh Phục Chân Lý',
    subtitle: 'Đấu Trường 10 Nấc Thang Đức Tin & Tri Thức Công Giáo',
    cover_image: '/images/games/millionaire_faith.jpg',
    badge: 'Đấu Trường Đố Vui',
    category: 'Giáo Lý & Phụng Vụ',
    estimated_time: '5-10 phút',
    target_age: 'Mọi lứa tuổi',
    description: 'Chinh phục 10 nấc thang tri thức đức tin với đồng hồ đếm ngược 30 giây kịch tính và 4 quyền trợ giúp phụng vụ. Vượt qua các mốc an toàn để đạt danh hiệu Tiến Sĩ Hội Thánh.',
    reward_xp: 1000,
    reward_manna: 500,
    play_url: '/game/trieu-phu-duc-tin'
  }
];

export const MAP_ZONES: MapZone[] = [
  {
    id: 1,
    title: 'Vùng 1: Xuất Hành Ai Cập & Vượt Biển Đỏ',
    subtitle: 'Khởi đầu hành trình giải thoát',
    description: 'Dân Chúa rời khỏi ách nô lệ Ai Cập dưới sự dẫn dắt của ông Môsê và quyền năng Thiên Chúa.',
    background_theme: 'from-amber-950/60 to-stone-900',
    stages: [
      {
        id: 1,
        zone_id: 1,
        title: 'Trạm 1: Bụi Cây Bốc Cháy',
        subtitle: 'Thiên Chúa gọi ông Môsê',
        icon: '🔥',
        scripture_ref: 'Xh 3, 1-14',
        question: 'Khi hiện ra trong bụi cây cháy mà không tàn, Thiên Chúa đã xưng Danh Ngài với ông Môsê là gì?',
        options: [
          'Đấng Sáng Tạo Muôn Loài',
          'TA LÀ ĐẤNG TỰ HỮU (YAHWEH)',
          'Vua Các Vua',
          'Thiên Thần Bình An'
        ],
        answer_index: 1,
        explanation: 'Thiên Chúa phán với ông Môsê: "TA LÀ ĐẤNG TỰ HỮU" (x. Xh 3, 14).',
        reward_xp: 40,
        reward_manna: 20,
        x_percent: 15,
        y_percent: 75
      },
      {
        id: 2,
        zone_id: 1,
        title: 'Trạm 2: Đêm Vượt Qua',
        subtitle: 'Chiên Thiên Chúa cứu thoát',
        icon: '🐑',
        scripture_ref: 'Xh 12, 1-14',
        question: 'Dân Israel đã bôi máu con vật nào lên khung cửa để thoát khỏi thiên thần hủy diệt?',
        options: [
          'Máu chim bồ câu',
          'Máu con bê vàng',
          'Máu con chiên vẹn toàn',
          'Máu con hươu'
        ],
        answer_index: 2,
        explanation: 'Máu chiên bôi trên cửa là dấu hiệu cứu thoát dân Chúa, hình bóng của Chúa Giêsu - Chiên Thiên Chúa.',
        reward_xp: 40,
        reward_manna: 20,
        x_percent: 32,
        y_percent: 60
      },
      {
        id: 3,
        zone_id: 1,
        title: 'Trạm 3: Rẽ Nước Biển Đỏ',
        subtitle: 'Vượt qua biển sâu an bình',
        icon: '🌊',
        scripture_ref: 'Xh 14, 15-31',
        question: 'Khi ông Môsê giơ gậy trên biển theo lệnh Chúa, điều gì đã xảy ra?',
        options: [
          'Nước biến thành rượu',
          'Nước rẽ đôi thành bức tường hai bên cho dân đi qua',
          'Biển đóng băng thành cây cầu',
          'Xuất hiện đàn thuyền lớn'
        ],
        answer_index: 1,
        explanation: 'Thiên Chúa thổi gió đông mạnh rẽ nước biển thành lối đi khô ráo cho dân Ngài (x. Xh 14, 21).',
        reward_xp: 50,
        reward_manna: 30,
        x_percent: 48,
        y_percent: 72
      }
    ]
  },
  {
    id: 2,
    title: 'Vùng 2: Núi Sinai & Mười Điều Răn',
    subtitle: 'Giao ước thánh thiêng',
    description: 'Thiên Chúa ban hành Lề Luật Giao Ước trên đỉnh núi Sinai rực lửa sấm sét.',
    background_theme: 'from-orange-950/60 to-stone-900',
    stages: [
      {
        id: 4,
        zone_id: 2,
        title: 'Trạm 4: Bánh Manna & Nước Từ Tảng Đá',
        subtitle: 'Chúa nuôi dưỡng trong hoang địa',
        icon: '🍞',
        scripture_ref: 'Xh 16, 1-36',
        question: 'Thức ăn màu trắng như hạt ngò rơi xuống mỗi buổi sáng nuôi dân Chúa gọi là gì?',
        options: [
          'Bánh Manna',
          'Quả Ô-liu',
          'Lúa mì Địa Đàng',
          'Bánh men'
        ],
        answer_index: 0,
        explanation: 'Thiên Chúa đã ban Manna - bánh từ trời - nuôi sống dân Israel suốt 40 năm.',
        reward_xp: 40,
        reward_manna: 20,
        x_percent: 65,
        y_percent: 55
      },
      {
        id: 5,
        zone_id: 2,
        title: 'Trạm 5: Đỉnh Núi Sinai Sấm Sét',
        subtitle: 'Mười Điều Răn Chúa truyền',
        icon: '📜',
        scripture_ref: 'Xh 20, 1-17',
        question: 'Điều Răn Thứ Nhất trong Mười Điều Răn dạy chúng ta điều gì?',
        options: [
          'Thảo kính cha mẹ',
          'Thờ phượng một mình Thiên Chúa và kính mến Ngài trên hết mọi sự',
          'Giữ ngày Chúa Nhật',
          'Chớ giết người'
        ],
        answer_index: 1,
        explanation: 'Điều răn thứ nhất: Thờ phượng và kính mến một mình Thiên Chúa trên hết mọi sự.',
        reward_xp: 50,
        reward_manna: 30,
        x_percent: 78,
        y_percent: 38
      },
      {
        id: 6,
        zone_id: 2,
        title: 'Trạm 6: Hòm Bia Giao Ước',
        subtitle: 'Sự hiện diện của Đấng Tối Cao',
        icon: '⚱️',
        scripture_ref: 'Xh 25, 10-22',
        question: 'Bên trong Hòm Bia Giao Ước cất giữ những thánh vật nào?',
        options: [
          'Hai bia đá Thập Giới, bình đựng Manna và cây gậy ông A-rôn',
          'Vương miện của vua Salomon',
          'Cuốn sách các Thánh Vịnh',
          'Áo choàng của các tư tế'
        ],
        answer_index: 0,
        explanation: 'Hòm Bia chứa 2 bia đá Giao Ước, hũ Manna và cây gậy trổ hoa của tư tế A-rôn (x. Dt 9, 4).',
        reward_xp: 60,
        reward_manna: 35,
        x_percent: 88,
        y_percent: 22
      }
    ]
  }
];

export const MILLIONAIRE_QUESTIONS: MillionaireQuestion[] = [
  {
    id: 1,
    level: 1,
    question: 'Kinh nào là kinh nguyện hoàn hảo nhất do chính Chúa Giêsu dạy chúng ta cầu nguyện?',
    options: ['Kinh Lạy Cha', 'Kinh Kính Mừng', 'Kinh Sáng Soi', 'Kinh Tin Kính'],
    answer_index: 0,
    explanation: 'Chúa Giêsu đã đích thân dạy các môn đệ Kinh Lạy Cha (x. Mt 6, 9-13).',
    scripture_hint: 'Mt 6, 9: "Lạy Cha chúng con ở trên trời, chúng con nguyện Danh Cha cả sáng..."',
    saint_advice: 'Thánh Têrêsa: Kinh Lạy Cha chứa đựng tất cả ước nguyện cao quý nhất của một người con thảo.',
    prize_xp: 1000,
    prize_manna: 50
  },
  {
    id: 2,
    level: 2,
    question: 'Công trình Sáng Tạo của Thiên Chúa được hoàn tất trong bao nhiêu ngày?',
    options: ['3 ngày', '6 ngày (và nghỉ ngơi ngày thứ 7)', '10 ngày', '40 ngày'],
    answer_index: 1,
    explanation: 'Thiên Chúa sáng tạo thế giới trong 6 ngày và ngày thứ bảy Ngài nghỉ ngơi thánh hóa (x. St 1).',
    scripture_hint: 'St 2, 2: "Ngày thứ bảy, Thiên Chúa hoàn tất công việc Ngài đã làm..."',
    saint_advice: 'Thánh Augustinô: Mọi thụ tạo đều phản chiếu vẻ đẹp rạng ngời của Thiên Chúa.',
    prize_xp: 2000,
    prize_manna: 100
  },
  {
    id: 3,
    level: 3,
    question: 'Ba nhà đạo sĩ phương Đông đã dâng tiến Chúa Hài Nhi những lễ vật nào?',
    options: [
      'Vàng, Nhũ hương và Mộc dược',
      'Bạc, Lụa là và Đá quý',
      'Bánh mì, Nước ngọt và Rượu vang',
      'Hoa hồng, Trầm hương và Dầu thơm'
    ],
    answer_index: 0,
    explanation: 'Vàng (tượng trưng Vương quyền), Nhũ hương (Thiên tính), Mộc dược (sự mai táng cứu chuộc).',
    scripture_hint: 'Mt 2, 11: "Họ mở bảo tráp, dâng tiến Người lễ vật là vàng, nhũ hương và mộc dược."',
    saint_advice: 'Thánh Gioan Kim Khẩu: Hãy dâng cho Chúa trái tim chân thành như vàng ròng vẹn sạch.',
    prize_xp: 3000,
    prize_manna: 150
  },
  {
    id: 4,
    level: 4,
    question: 'Điều Răn Trọng Nhất mà Chúa Giêsu tóm tắt là gì?',
    options: [
      'Ăn chay mỗi tuần hai lần',
      'Kính mến Thiên Chúa hết lòng và yêu thương người thân cận như chính mình',
      'Đi hành hương Đất Thánh',
      'Đọc kinh mỗi ngày năm lần'
    ],
    answer_index: 1,
    explanation: 'Chúa Giêsu dạy: Kính Chúa và Yêu Người là cốt lõi của toàn bộ Lề Luật và các Ngôn Sứ.',
    scripture_hint: 'Mc 12, 30-31: "Ngươi phải yêu mến Đức Chúa là Thiên Chúa ngươi... và yêu người thân cận..."',
    saint_advice: 'Thánh Phanxicô Salêsiô: Thước đo của tình yêu là yêu không ngơi nghỉ.',
    prize_xp: 5000,
    prize_manna: 200
  },
  {
    id: 5,
    level: 5,
    question: 'Hội Thánh Công Giáo có bao nhiêu Bí Tích do Chúa Giêsu thiết lập?',
    options: ['3 Bí Tích', '5 Bí Tích', '7 Bí Tích', '10 Bí Tích'],
    answer_index: 2,
    explanation: '7 Bí Tích: Rửa Tội, Thêm Sức, Thánh Thể, Hòa Giải, Xức Dầu Bệnh Nhân, Truyền Chức Thánh, Hôn Phối.',
    scripture_hint: 'GLHTCG 1113: Bảy Bí Tích chạm đến mọi giai đoạn và thời điểm quan trọng của đời sống Kitô hữu.',
    saint_advice: 'Thánh Tôma Aquinô: Các Bí Tích là những kênh dẫn tuôn đổ muôn ơn cứu chuộc của Chúa Kitô.',
    prize_xp: 10000,
    prize_manna: 300,
    is_safe_milestone: true
  },
  {
    id: 6,
    level: 6,
    question: 'Bí Tích nào là "nguồn mạch và chóp đỉnh" của toàn bộ đời sống Kitô hữu?',
    options: ['Bí Tích Rửa Tội', 'Bí Tích Thánh Thể', 'Bí Tích Thêm Sức', 'Bí Tích Hòa Giải'],
    answer_index: 1,
    explanation: 'Bí Tích Thánh Thể chứa đựng chính Mình và Máu Chúa Kitô, là trung tâm đức tin (x. GLHTCG 1324).',
    scripture_hint: 'Ga 6, 54: "Ai ăn thịt Tôi và uống máu Tôi, thì có sự sống đời đời..."',
    saint_advice: 'Thánh Piô Năm Dấu: Tham dự một Thánh Lễ sốt sắng có giá trị hơn mọi công phúc trần gian cộng lại.',
    prize_xp: 20000,
    prize_manna: 400
  },
  {
    id: 7,
    level: 7,
    question: 'Có bao nhiêu Ơn Đức Chúa Thánh Thần?',
    options: ['3 Ơn', '7 Ơn', '9 Ơn', '12 Ơn'],
    answer_index: 1,
    explanation: '7 Ơn: Khôn Ngoan, Hiểu Biết, Lo Liệu, Sức Mạnh, Thông Minh, Đạo Đức, Kính Sợ Thiên Chúa.',
    scripture_hint: 'Is 11, 2: "Thần khí Đức Chúa sẽ ngự trên Người: thần khí khôn ngoan và hiểu biết..."',
    saint_advice: 'Thánh Phaolô: Hãy để Thần Khí Chúa hướng dẫn mọi bước đường đời sống của bạn.',
    prize_xp: 40000,
    prize_manna: 500
  },
  {
    id: 8,
    level: 8,
    question: 'Bốn tác giả viết 4 sách Tin Mừng (Phúc Âm) quy điển là ai?',
    options: [
      'Phêrô, Phaolô, Gioan và Giacôbê',
      'Mátthêu, Máccô, Luca và Gioan',
      'Môsê, Đavít, Isaia và Giêrêmia',
      'Augustinô, Tôma, Têrêsa và Phanxicô'
    ],
    answer_index: 1,
    explanation: '4 Thánh Sử: Mátthêu, Máccô, Luca và Gioan.',
    scripture_hint: 'GLHTCG 125: Bốn sách Tin Mừng là trái tim của toàn bộ Kinh Thánh.',
    saint_advice: 'Thánh Giêrônimô: Không biết Kinh Thánh là không biết Chúa Kitô.',
    prize_xp: 70000,
    prize_manna: 600
  },
  {
    id: 9,
    level: 9,
    question: 'Đức Mẹ Maria đã hiện ra với ba trẻ chăn chiên tại Fátima vào năm nào?',
    options: ['1858', '1917', '1931', '2000'],
    answer_index: 1,
    explanation: 'Đức Mẹ hiện ra tại Fátima (Bồ Đào Nha) năm 1917 với Lucia, Phanxicô và Giaxinta.',
    scripture_hint: 'Thông điệp Fátima: Hãy lần hạt Mân Côi mỗi ngày và siêng năng đền tạ Trái Tim Vô Nhiễm Mẹ.',
    saint_advice: 'Thánh Giáo Hoàng Gioan Phaolô II: Đức Mẹ là người mẹ hằng luôn che chở đoàn con trong mọi cơn thử thách.',
    prize_xp: 100000,
    prize_manna: 800
  },
  {
    id: 10,
    level: 10,
    question: 'Năm Điều Răn Hội Thánh (Sáu Điều Răn theo bản dịch cũ) có điều nào sau đây?',
    options: [
      'Dự lễ ngày Chúa Nhật và các ngày Lễ Buộc',
      'Mỗi ngày lần một chuỗi Mân Côi',
      'Đi làm việc bác ái mỗi tuần',
      'Xây dựng nhà thờ giáo xứ'
    ],
    answer_index: 0,
    explanation: 'Điều răn thứ nhất của Hội Thánh: Dự lễ các ngày Chúa Nhật và các ngày Lễ Buộc.',
    scripture_hint: 'GLHTCG 2042: Tham dự Thánh Lễ ngày Chúa Nhật là nghĩa vụ căn bản nuôi dưỡng đức tin.',
    saint_advice: 'Thánh Gioan Vianney: Không có Thánh Lễ, thế giới này sẽ chìm trong tăm tối.',
    prize_xp: 200000,
    prize_manna: 1000,
    is_safe_milestone: true
  }
];

export const MANNA_STORE_ITEMS = [
  {
    id: 'badge_star',
    name: 'Huy Hiệu Ngôi Sao Đất Hứa',
    cost: 150,
    type: 'badge',
    icon: '🌟',
    description: 'Huy hiệu vinh danh dành cho nhà thám hiểm Kinh Thánh.'
  },
  {
    id: 'pdf_coloring_1',
    name: 'Trọn Bộ 10 Tranh Tô Màu Kinh Thánh PDF',
    cost: 200,
    type: 'pdf',
    icon: '🎨',
    description: 'File PDF chất lượng cao in ra giấy cho bé tô màu 7 ngày Sáng Tạo.'
  },
  {
    id: 'avatar_halo',
    name: 'Khung Avatar Ánh Sáng Thánh',
    cost: 300,
    type: 'frame',
    icon: '✨',
    description: 'Hiệu ứng hào quang vàng kim lấp lánh trên ảnh đại diện của bé.'
  }
];
