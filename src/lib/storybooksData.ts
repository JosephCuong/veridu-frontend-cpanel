export interface StorybookPage {
  page_number: number;
  image_url: string;
  text_script: string;
  caption?: string;
  audio_url?: string;
  start_time?: number;
  end_time?: number;
  estimated_duration?: number;
}

export interface StorybookTimestamp {
  page: number;
  start: number;
  end: number;
  duration: number;
}

export interface StorybookQuizQuestion {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface StorybookParentGuide {
  moral_theme?: string;
  reflection_questions?: string[];
  family_prayer?: string;
}

export interface StorybookItem {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  cover_image: string;
  testament: 'old_testament' | 'new_testament' | 'parables' | 'saints';
  target_age: string;
  total_pages: number;
  description: string;
  moral_lesson: string;
  full_audio_url?: string;
  music_bg_url?: string;
  youtube_video_id?: string;
  youtube_url?: string;
  audio_timestamps?: StorybookTimestamp[];
  pages_data: StorybookPage[];
  quiz_data: StorybookQuizQuestion[];
  parent_guide: StorybookParentGuide;
  view_count: number;
  read_count: number;
}

export const DEFAULT_STORYBOOKS: StorybookItem[] = [
  {
    id: 1,
    slug: 'cong-trinh-sang-tao-ky-dieu',
    title: 'Công Trình Sáng Tạo Kỳ Diệu của Thiên Chúa',
    subtitle: 'Hành trình 7 ngày sáng tạo thế giới qua những bức tranh nghệ thuật đầy cảm xúc',
    cover_image: '/storybooks/cong-trinh-sang-tao/page_1.png',
    testament: 'old_testament',
    target_age: '4-10 tuổi',
    total_pages: 10,
    description: 'Cuốn sách tranh thiếu nhi đưa các em nhỏ bước vào buổi bình minh của nhân loại, chiêm ngưỡng quyền năng và tình yêu vô biên của Thiên Chúa qua 7 ngày sáng tạo trời đất, muôn loài và con người.',
    moral_lesson: 'Khắc sâu lòng biết ơn Đấng Sáng Tạo, biết nâng niu vạn vật và nhận thức phẩm giá cao quý của mỗi con người.',
    full_audio_url: '',
    music_bg_url: '',
    youtube_video_id: '',
    youtube_url: '',
    audio_timestamps: [
      { page: 1, start: 0, end: 15, duration: 15 },
      { page: 2, start: 15, end: 32, duration: 17 },
      { page: 3, start: 32, end: 54, duration: 22 },
      { page: 4, start: 54, end: 72, duration: 18 },
      { page: 5, start: 72, end: 90, duration: 18 },
      { page: 6, start: 90, end: 108, duration: 18 },
      { page: 7, start: 108, end: 130, duration: 22 },
      { page: 8, start: 130, end: 148, duration: 18 },
      { page: 9, start: 148, end: 168, duration: 20 },
      { page: 10, start: 168, end: 188, duration: 20 }
    ],
    pages_data: [
      {
        page_number: 1,
        image_url: '/storybooks/cong-trinh-sang-tao/page_1.png',
        text_script: 'Khởi đầu, khi vũ trụ còn là một khoảng không tĩnh lặng và bao la, Thần Khí Thiên Chúa bay lượn trên mặt nước. Bằng tình yêu vô biên, Ngài bắt đầu kiến tạo nên một thế giới diệu kỳ.',
        caption: 'Khởi đầu công trình sáng tạo',
        start_time: 0,
        end_time: 15,
        estimated_duration: 15
      },
      {
        page_number: 2,
        image_url: '/storybooks/cong-trinh-sang-tao/page_2.png',
        text_script: 'Ngày thứ nhất, Thiên Chúa phán: "Hãy có ánh sáng!" Tức thì, ánh sáng rực rỡ bừng lên, xua tan bóng tối mịt mù. Thiên Chúa gọi ánh sáng là "Ngày" và bóng tối là "Đêm".',
        caption: 'Ngày thứ nhất: Ánh sáng bừng nở',
        start_time: 15,
        end_time: 32,
        estimated_duration: 17
      },
      {
        page_number: 3,
        image_url: '/storybooks/cong-trinh-sang-tao/page_3.png',
        text_script: 'Ngày thứ ba, Thiên Chúa phán: "Nước dưới trời phải tụ lại một nơi để đất khô hiện ra." Khi nước rút đi, những vùng đất vững chãi vươn mình lên khỏi mặt biển. Thiên Chúa gọi đất khô là "Đất" và khối nước tụ lại là "Biển". Nhìn ngắm những hòn đảo, những lục địa và đại dương bao la, Thiên Chúa thấy mọi sự thật tốt đẹp.',
        caption: 'Ngày thứ ba: Biển cả và đất liền',
        start_time: 32,
        end_time: 54,
        estimated_duration: 22
      },
      {
        page_number: 4,
        image_url: '/storybooks/cong-trinh-sang-tao/page_4.png',
        text_script: 'Mặt đất bắt đầu đâm chồi nảy lộc với muôn vàn cỏ cây hoa trái tốt tươi. Những cánh rừng xanh ngút ngàn và những thảm cỏ mềm mại bao phủ địa cầu trong sự tươi mới tinh khôi.',
        caption: 'Ngày thứ ba: Cỏ cây hoa trái tốt tươi',
        start_time: 54,
        end_time: 72,
        estimated_duration: 18
      },
      {
        page_number: 5,
        image_url: '/storybooks/cong-trinh-sang-tao/page_5.png',
        text_script: 'Ngày thứ tư, Thiên Chúa đặt trên bầu trời hai vầng sáng lớn: Mặt trời rực rỡ dẫn lối ban ngày, Mặt trăng êm đềm và muôn triệu vì sao lấp lánh thắp sáng màn đêm.',
        caption: 'Ngày thứ tư: Mặt trời, mặt trăng và tinh tú',
        start_time: 72,
        end_time: 90,
        estimated_duration: 18
      },
      {
        page_number: 6,
        image_url: '/storybooks/cong-trinh-sang-tao/page_6.png',
        text_script: 'Ngày thứ năm, biển sâu rộn rã với muôn loài cá tung tăng bơi lội, trên không trung ríu rít tiếng hót của các loài chim trời chao lượn. Thiên Chúa chúc phúc cho chúng sinh sôi nảy nở thật nhiều.',
        caption: 'Ngày thứ năm: Cá biển và chim trời',
        start_time: 90,
        end_time: 108,
        estimated_duration: 18
      },
      {
        page_number: 7,
        image_url: '/storybooks/cong-trinh-sang-tao/page_7.png',
        text_script: 'Ngày thứ sáu, Thiên Chúa tạo nên muôn thú trên mặt đất. Và trong giờ phút linh thiêng nhất, Ngài phán: "Chúng ta hãy tạo nên con người theo hình ảnh chúng ta." Ngài dựng nên người nam và người nữ, ban cho họ hơi thở sự sống.',
        caption: 'Ngày thứ sáu: Muông thú và Con Người',
        start_time: 108,
        end_time: 130,
        estimated_duration: 22
      },
      {
        page_number: 8,
        image_url: '/storybooks/cong-trinh-sang-tao/page_8.png',
        text_script: 'Thiên Chúa đặt A-đam và E-và trong Vườn Địa Đàng tuyệt đẹp, tràn đầy hoa thơm trái ngọt. Ngài trao cho con người sứ mạng yêu thương, săn sóc và gìn giữ ngôi nhà chung của muôn loài.',
        caption: 'Vườn Địa Đàng chan hòa hạnh phúc',
        start_time: 130,
        end_time: 148,
        estimated_duration: 18
      },
      {
        page_number: 9,
        image_url: '/storybooks/cong-trinh-sang-tao/page_9.png',
        text_script: 'Ngày thứ bảy, khi mọi công trình sáng tạo đã hoàn tất trong sự hoàn mỹ khôn tả, Thiên Chúa nghỉ ngơi. Ngài chúc lành và thánh hóa ngày thứ bảy thành ngày của niềm vui và tạ ơn.',
        caption: 'Ngày thứ bảy: Ngày nghỉ ngơi và thánh hóa',
        start_time: 148,
        end_time: 168,
        estimated_duration: 20
      },
      {
        page_number: 10,
        image_url: '/storybooks/cong-trinh-sang-tao/page_10.png',
        text_script: 'Nhìn ngắm toàn thể công trình sáng tạo, Thiên Chúa thấy mọi sự thật tốt đẹp. Các bé ơi, mỗi chúng ta đều là kiệt tác quý giá trong tình yêu của Thiên Chúa!',
        caption: 'Tình yêu bao la của Đấng Tạo Hóa',
        start_time: 168,
        end_time: 188,
        estimated_duration: 20
      }
    ],
    quiz_data: [
      {
        question: 'Thiên Chúa phán câu gì vào Ngày thứ nhất của công trình sáng tạo?',
        options: [
          'Hãy có ánh sáng!',
          'Hãy có mưa rào!',
          'Hãy có cây cối!',
          'Hãy có mặt trăng!'
        ],
        answer_index: 0,
        explanation: 'Vào Ngày thứ nhất, Thiên Chúa phán: "Hãy có ánh sáng!", và ánh sáng rực rỡ bừng lên xua tan bóng tối.'
      },
      {
        question: 'Vào Ngày thứ mấy Thiên Chúa tạo dựng nên con người?',
        options: [
          'Ngày thứ ba',
          'Ngày thứ năm',
          'Ngày thứ sáu',
          'Ngày thứ bảy'
        ],
        answer_index: 2,
        explanation: 'Vào Ngày thứ sáu, sau khi tạo dựng muông thú, Thiên Chúa đã tạo dựng con người theo hình ảnh của Ngài.'
      },
      {
        question: 'Thiên Chúa đã làm gì vào Ngày thứ bảy?',
        options: [
          'Tạo thêm mặt trời',
          'Nghỉ ngơi và chúc lành cho ngày này',
          'Xây dựng thành phố',
          'Trồng thêm cây xanh'
        ],
        answer_index: 1,
        explanation: 'Vào Ngày thứ bảy, Thiên Chúa nghỉ ngơi và thánh hóa ngày này thành ngày của niềm vui và tạ ơn.'
      }
    ],
    parent_guide: {
      moral_theme: 'Lòng biết ơn Đấng Tạo Hóa và ý thức bảo vệ thiên nhiên tươi đẹp.',
      reflection_questions: [
        'Con yêu thích nhất loài thụ tạo nào mà Chúa đã dựng nên (hoa, bướm, đại dương, hay các vì sao)?',
        'Hằng ngày, con có thể làm gì để chăm sóc và giữ gìn thiên nhiên xung quanh mình luôn sạch đẹp?',
        'Tại sao Chúa lại xem con là kiệt tác quý giá nhất của Ngài?'
      ],
      family_prayer: 'Lạy Chúa là Đấng Tạo Hóa giàu lòng xót thương, chúng con cảm tạ Chúa vì đã dựng nên một thế giới muôn màu rực rỡ cho chúng con sinh sống. Xin dạy chúng con luôn biết yêu mến thiên nhiên, gìn giữ môi trường và yêu thương mọi người chung quanh. Amen.'
    },
    view_count: 128,
    read_count: 95
  }
];
