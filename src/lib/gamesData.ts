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
    subtitle: 'Đấu Trường 15 Nấc Thang Đức Tin & Tri Thức Công Giáo',
    cover_image: '/images/games/millionaire_faith.jpg',
    badge: 'Đấu Trường Đố Vui',
    category: 'Giáo Lý & Phụng Vụ',
    estimated_time: '5-10 phút',
    target_age: 'Mọi lứa tuổi',
    description: 'Chinh phục 15 nấc thang tri thức đức tin với đồng hồ đếm ngược 15 giây kịch tính và 4 quyền trợ giúp phụng vụ. Vượt qua các mốc an toàn để đạt các danh hiệu.',
    reward_xp: 20000,
    reward_manna: 50,
    total_stages: 15,
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
        explanation: 'Thiên Chúa phán với Môsê: "TA LÀ ĐẤNG TỰ HỮU" (x. Xh 3, 14).',
        reward_xp: 40,
        reward_manna: 20,
        x_percent: 12,
        y_percent: 78
      },
      {
        id: 2,
        zone_id: 1,
        title: 'Trạm 2: Đêm Vượt Qua',
        subtitle: 'Chiên Vượt Qua & Bánh Không Men',
        icon: '🐑',
        scripture_ref: 'Xh 12, 1-14',
        question: 'Để con đầu lòng được bảo toàn trong đêm Vượt Qua, người Do Thái phải lấy máu chiên bôi vào đâu?',
        options: [
          'Hai khung cửa và thanh ngang cửa nhà',
          'Trán của mọi người trong nhà',
          'Bàn ăn và chén đĩa',
          'Bờ tường xung quanh làng'
        ],
        answer_index: 0,
        explanation: 'Máu chiên bôi trên khung cửa là dấu hiệu cứu thoát trong đêm Vượt Qua (x. Xh 12, 7).',
        reward_xp: 45,
        reward_manna: 25,
        x_percent: 28,
        y_percent: 64
      },
      {
        id: 3,
        zone_id: 1,
        title: 'Trạm 3: Rẽ Nước Biển Đỏ',
        subtitle: 'Bàn tay uy quyền của Thiên Chúa',
        icon: '🌊',
        scripture_ref: 'Xh 14, 15-31',
        question: 'Khi Môsê giơ gậy trên Biển Đỏ theo lệnh Chúa, điều kỳ diệu gì đã xảy ra?',
        options: [
          'Biển Đỏ biến thành sa mạc cát',
          'Nước biển rẽ đôi tạo lối đi khô ráo cho dân',
          'Một cây cầu đá khổng lồ xuất hiện',
          'Tàu bè tự động trôi đến chở dân qua'
        ],
        answer_index: 1,
        explanation: 'Gió đông thổi mạnh suốt đêm làm rẽ nước biển ra hai bên, dân đi trên đất khô ráo (x. Xh 14, 21).',
        reward_xp: 50,
        reward_manna: 30,
        x_percent: 42,
        y_percent: 82
      }
    ]
  },
  {
    id: 2,
    title: 'Vùng 2: Sa Mạc Sinai & Lương Thực Từ Trời',
    subtitle: 'Nuôi dưỡng và thử thách lòng tin',
    description: 'Chúa ban bánh Manna và chim cút mỗi sớm mai, ban nước từ tảng đá để cứu sống dân Người.',
    background_theme: 'from-amber-900/60 to-yellow-950/80',
    stages: [
      {
        id: 4,
        zone_id: 2,
        title: 'Trạm 4: Bánh Manna Rơi Xuống',
        subtitle: 'Lương thực từ trời',
        icon: '🥖',
        scripture_ref: 'Xh 16, 1-36',
        question: 'Bánh Manna từ trời rơi xuống nuôi sống dân Do Thái trong sa mạc có vị ngọt giống như thứ gì?',
        options: [
          'Bánh bột mì nướng than',
          'Bánh ngọt tẩm mật ong',
          'Trái sung chín mọng',
          'Sữa tươi và phô mai'
        ],
        answer_index: 1,
        explanation: 'Manna trắng như hạt ngò và có vị như bánh tráng tẩm mật ong (x. Xh 16, 31).',
        reward_xp: 50,
        reward_manna: 30,
        x_percent: 58,
        y_percent: 55
      },
      {
        id: 5,
        zone_id: 2,
        title: 'Trạm 5: Nước Từ Tảng Đá Mas-xa',
        subtitle: 'Chúa giải khát cho dân',
        icon: '💧',
        scripture_ref: 'Xh 17, 1-7',
        question: 'Khi dân kêu khát ở Mêriba, Thiên Chúa bảo Môsê làm gì để có nước uống?',
        options: [
          'Đào giếng sâu 10 thước',
          'Dùng gậy đập vào tảng đá Khôrếp',
          'Cầu xin mưa lớn đổ xuống',
          'Tìm ốc đảo gần nhất'
        ],
        answer_index: 1,
        explanation: 'Môsê đập gậy vào tảng đá và dòng nước ngọt ngào tuôn trào cho toàn dân (x. Xh 17, 6).',
        reward_xp: 55,
        reward_manna: 30,
        x_percent: 72,
        y_percent: 68
      },
      {
        id: 6,
        zone_id: 2,
        title: 'Trạm 6: Chiến Thắng Đạo Binh Amalếch',
        subtitle: 'Cánh tay cầu nguyện không mỏi',
        icon: '⚔️',
        scripture_ref: 'Xh 17, 8-16',
        question: 'Ai đã nâng đỡ hai tay ông Môsê giơ cao cầu nguyện trên đỉnh đồi để Giôsuê thắng trận?',
        options: [
          'Aarôn và Khua',
          'Giôsuê và Calép',
          'Êlia và Êlisa',
          'Đavít và Giônathan'
        ],
        answer_index: 0,
        explanation: 'Ông Aarôn và ông Khua mỗi người một bên đã đỡ tay ông Môsê cho đến khi mặt trời lặn (x. Xh 17, 12).',
        reward_xp: 55,
        reward_manna: 35,
        x_percent: 85,
        y_percent: 45
      }
    ]
  },
  {
    id: 3,
    title: 'Vùng 3: Núi Thánh Sinai & Giao Ước Mười Điều Răn',
    subtitle: 'Lời Giao Ước vĩnh cửu',
    description: 'Thiên Chúa ban Hai Bia Đá Giao Ước chứa Mười Điều Răn làm kim chỉ nam đời sống thánh thiện.',
    background_theme: 'from-orange-950/70 to-stone-900',
    stages: [
      {
        id: 7,
        zone_id: 3,
        title: 'Trạm 7: Núi Sinai Bốc Khói',
        subtitle: 'Sự hiện diện oai phong của Chúa',
        icon: '⛰️',
        scripture_ref: 'Xh 19, 16-25',
        question: 'Trên đỉnh núi Sinai, Thiên Chúa đã truyền ban điều gì cho ông Môsê?',
        options: [
          'Mười Điều Răn trên 2 bia đá',
          'Một thanh gươm vàng khổng lồ',
          'Bản đồ toàn bộ thế giới',
          'Vương miện bằng vàng ròng'
        ],
        answer_index: 0,
        explanation: 'Chúa ban Hai Bia Đá Giao Ước chứa Mười Lời (Mười Điều Răn) do chính ngón tay Ngài khắc ghi (x. Xh 31, 18).',
        reward_xp: 60,
        reward_manna: 35,
        x_percent: 68,
        y_percent: 30
      },
      {
        id: 8,
        zone_id: 3,
        title: 'Trạm 8: Hòm Bia Giao Ước',
        subtitle: 'Nơi ngự của Lời Chúa',
        icon: '✨',
        scripture_ref: 'Xh 25, 10-22',
        question: 'Bên trong Hòm Bia Giao Ước bằng gỗ keo dát vàng chứa đựng những thánh vật nào?',
        options: [
          'Hai bia đá Mười Điều Răn, hũ Manna và cây gậy Aarôn',
          'Vương miện của vua Salomon',
          'Cuốn sách các Thánh Vịnh',
          'Áo choàng của các tư tế'
        ],
        answer_index: 0,
        explanation: 'Hòm Bia chứa 2 bia đá Giao Ước, hũ Manna và cây gậy trổ hoa của tư tế Aarôn (x. Dt 9, 4).',
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
    prize_xp: 10,
    prize_manna: 0
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
    prize_xp: 20,
    prize_manna: 0
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
    explanation: 'Vàng (Vương quyền), Nhũ hương (Thiên tính), Mộc dược (sự mai táng cứu chuộc).',
    scripture_hint: 'Mt 2, 11: "Họ mở bảo tráp, dâng tiến Người lễ vật là vàng, nhũ hương và mộc dược."',
    saint_advice: 'Thánh Gioan Kim Khẩu: Hãy dâng cho Chúa trái tim chân thành như vàng ròng vẹn sạch.',
    prize_xp: 50,
    prize_manna: 0
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
    prize_xp: 100,
    prize_manna: 0
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
    prize_xp: 200,
    prize_manna: 10,
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
    prize_xp: 400,
    prize_manna: 0
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
    prize_xp: 700,
    prize_manna: 0
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
    prize_xp: 1000,
    prize_manna: 0
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
    prize_xp: 1500,
    prize_manna: 0
  },
  {
    id: 10,
    level: 10,
    question: 'Năm Điều Răn Hội Thánh (Sáu Điều Răn theo bản dịch VN) có điều nào sau đây?',
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
    prize_xp: 2500,
    prize_manna: 20,
    is_safe_milestone: true
  },
  {
    id: 11,
    level: 11,
    question: 'Tín điều Đức Maria Hồn Xác Lên Trời được Đức Giáo Hoàng nào công bố năm 1950?',
    options: ['ĐGH Piô IX', 'ĐGH Piô XII', 'ĐGH Gioan XXIII', 'ĐGH Gioan Phaolô II'],
    answer_index: 1,
    explanation: 'Đức Giáo Hoàng Piô XII đã định tín Đức Maria Hồn Xác Lên Trời qua Tông hiến Munificentissimus Deus (1950).',
    scripture_hint: 'GLHTCG 966: Khi hoàn tất cuộc đời trần thế, Mẹ Maria được đưa lên trời cả hồn lẫn xác.',
    saint_advice: 'Thánh Bênađô: Hãy nhìn lên Ngôi Sao Biển, hãy kêu cầu Mẹ Maria.',
    prize_xp: 4000,
    prize_manna: 0
  },
  {
    id: 12,
    level: 12,
    question: 'Công đồng chung nào đã định tín Chúa Giêsu có hai bản tính (Thiên Chúa thật và người thật)?',
    options: ['Công đồng Nixêa (325)', 'Công đồng Êphêsô (431)', 'Công đồng Canchêđônia (451)', 'Công đồng Trentô (1545)'],
    answer_index: 2,
    explanation: 'Công đồng Canchêđônia (năm 451) định tín mầu nhiệm Ngôi Hiệp: 2 bản tính trong 1 Ngôi Vị.',
    scripture_hint: 'GLHTCG 467: Đức Kitô là Thiên Chúa thật và con người thật không chia cắt.',
    saint_advice: 'Thánh Lêô Cả: Sự cao cả của nhân loại được nâng lên trong sự nhập thể của Đức Con.',
    prize_xp: 6000,
    prize_manna: 0
  },
  {
    id: 13,
    level: 13,
    question: 'Trong số 117 Thánh Tử Đạo Việt Nam, vị Thánh nữ giáo dân duy nhất là ai?',
    options: ['Thánh Anê Lê Thị Thành', 'Thánh Maria Goretti', 'Thánh Têrêsa Avila', 'Thánh Catarina'],
    answer_index: 0,
    explanation: 'Thánh Anê Lê Thị Thành (Bà Đê) là vị nữ duy nhất trong 117 Thánh Tử Đạo Việt Nam được tôn phong năm 1988.',
    scripture_hint: 'Lịch sử Giáo hội VN: Bà Anê Thành can trường chịu đòn roi vì giữ vững đức tin vào Thập Giá Chúa.',
    saint_advice: 'Thánh Anê Thành: Tôi chỉ vâng phục Thiên Chúa và không bao giờ chối bỏ Thập Giá Người.',
    prize_xp: 8500,
    prize_manna: 0
  },
  {
    id: 14,
    level: 14,
    question: 'Hàng Giáo Phẩm Công Giáo Việt Nam được chính thức thiết lập vào năm nào?',
    options: ['Năm 1933', 'Năm 1954', 'Năm 1960', 'Năm 1975'],
    answer_index: 2,
    explanation: 'Ngày 24/11/1960, ĐGH Gioan XXIII ban Tông sắc Venerabilium Nostrorum thiết lập Hàng Giáo phẩm VN.',
    scripture_hint: 'Lịch sử GHCGVN: Năm 1960 đánh dấu sự trưởng thành trọn vẹn của Giáo hội Việt Nam với 3 Giáo tỉnh.',
    saint_advice: 'Thánh Phaolô: Hội Thánh là thân thể mầu nhiệm của Đức Kitô, mỗi tín hữu là một chi thể.',
    prize_xp: 12000,
    prize_manna: 0
  },
  {
    id: 15,
    level: 15,
    question: 'Đặc tính "Ơn Bất Khả Ngộ" (Infallibility) của Đức Giáo Hoàng được tuyên bố khi nào?',
    options: [
      'Trong mọi bài phát biểu hằng ngày',
      'Khi công bố ex cathedra một đạo lý về đức tin hoặc luân lý đòi buộc toàn thể Hội Thánh',
      'Khi ngài viết thư riêng cho các bạn trẻ',
      'Khi ngài tham gia các hội nghị chính trị thế giới'
    ],
    answer_index: 1,
    explanation: 'Theo GLHTCG 891: Đức Giáo Hoàng được ơn bất khả ngộ khi ngài tuyên bố với thẩm quyền tối cao (Ex Cathedra) một tín điều đức tin hay luân lý.',
    scripture_hint: 'Mt 16, 18: "Anh là Phêrô, nghĩa là Tảng Đá, trên tảng đá này Thầy sẽ xây Hội Thánh của Thầy..."',
    saint_advice: 'Thánh Tôma: Nơi nào có Phêrô, nơi đó có Hội Thánh; nơi nào có Hội Thánh, nơi đó có sự sống đời đời.',
    prize_xp: 20000,
    prize_manna: 50,
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
