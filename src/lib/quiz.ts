export interface QuizQuestion {
  id: string;
  category: 'Cựu Ước' | 'Tân Ước' | 'Giáo Lý' | 'Phụng Vụ' | string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  scriptureRef?: string;
}

export interface QuizRoom {
  roomPin: string;
  title: string;
  hostName: string;
  status: 'waiting' | 'live' | 'ended';
  totalQuestions: number;
  timePerQuestionSeconds: number;
}

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    category: 'Cựu Ước',
    questionText: 'Thiên Chúa đã ban Mười Điều Rút (Thập Giới) cho ai và tại ngọn núi nào?',
    options: [
      'Mô-sê tại Núi Si-nai',
      'Áp-ra-ham tại Núi Mo-ri-yah',
      'Đa-vít tại Núi Si-on',
      'Ê-li-a tại Núi Ca-me-lo'
    ],
    correctAnswerIndex: 0,
    scriptureRef: 'Xn 20, 1-17',
    explanation: 'Ông Mô-sê là người được Thiên Chúa trao ban Thập Giới trên đỉnh núi Si-nai trong hành trình Xuất Hành dắt Dân Is-ra-en về Đất Hứa.'
  },
  {
    id: 'q-2',
    category: 'Tân Ước',
    questionText: 'Câu Kinh Thánh nào được gọi là "Tóm tắt của toàn bộ Tin Mừng"?',
    options: [
      'Ga 3, 16: "Thiên Chúa yêu thế gian đến nỗi đã ban Con Một..."',
      'Ga 14, 6: "Thầy là đường, là sự thật và là sự sống..."',
      'Mt 28, 19: "Anh em hãy đi giảng dạy cho muôn dân..."',
      'Lc 1, 38: "Vâng, tôi đây là nữ tỳ của Chúa..."'
    ],
    correctAnswerIndex: 0,
    scriptureRef: 'Ga 3, 16',
    explanation: 'Ga 3, 16 nêu bật Tình Yêu Vô Biên của Thiên Chúa Cha đối với thế gian qua việc trao ban Con Một là Đức Giêsu Ki-tô.'
  },
  {
    id: 'q-3',
    category: 'Giáo Lý',
    questionText: 'Bí tích nào là "Nguồn gốc và Đỉnh cao của toàn bộ đời sống Kitô giáo"?',
    options: [
      'Bí tích Thánh Thể',
      'Bí tích Rửa Tội',
      'Bí tích Thêm Sức',
      'Bí tích Hòa Giải'
    ],
    correctAnswerIndex: 0,
    scriptureRef: 'LG 11 / CATECHISM 1324',
    explanation: 'Hiến chế Lumen Gentium (số 11) khẳng định Bí tích Thánh Thể chính là Nguồn gốc và Đỉnh cao của đời sống Kitô hữu.'
  }
];

export async function fetchQuizQuestions(category?: string, limit: number = 50): Promise<QuizQuestion[]> {
  try {
    const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';
    let url = `${WP_API_BASE}/quiz/questions?limit=${limit}`;
    if (category && category !== 'all' && category !== 'Tất cả') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.error('Lỗi khi tải câu hỏi quiz:', e);
    // Ném lỗi để component có thể xử lý
    throw new Error('Không thể tải dữ liệu câu hỏi từ máy chủ.');
  }
  // Nếu API trả về mảng rỗng, trả về mảng rỗng thay vì dữ liệu giả
  return [];
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculateSpeedBonus(secondsRemaining: number, maxSeconds: number = 20): number {
  const baseScore = 1000;
  const speedBonus = Math.round((secondsRemaining / maxSeconds) * 500);
  return baseScore + speedBonus;
}
