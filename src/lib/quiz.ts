import { supabase } from './supabaseClient';

export interface QuizQuestion {
  id: string;
  category: 'Cựu Ước' | 'Tân Ước' | 'Giáo Lý' | 'Phụng Vụ' | string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  scriptureRef?: string;
  difficulty?: string;
}

export interface QuizRoom {
  id?: string;
  roomPin: string;
  title: string;
  hostId?: string | number;
  hostName: string;
  status: 'waiting' | 'live' | 'showing_answer' | 'leaderboard' | 'ended';
  progressionMode: 'host_manual' | 'auto_timer';
  timePerQuestionSeconds: number;
  maxParticipants: number;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  leaderboard?: ParticipantState[];
  created_at?: string;
}

export interface ParticipantState {
  id: string;
  userId?: string;
  name: string;
  avatarUrl?: string;
  characterSlug?: string;
  characterName?: string;
  score: number;
  streak: number;
  lastAnswerIndex?: number | null;
  lastAnswerTime?: number;
  isCorrect?: boolean;
  isFlagged?: boolean;
}

export interface BiblicalAvatar {
  id: string;
  name: string;
  title: string;
  testament: 'Cựu Ước' | 'Tân Ước';
  avatarUrl: string;
}

export const BIBLICAL_AVATARS: BiblicalAvatar[] = [
  {
    id: 'mo-se',
    name: 'Môsê',
    title: 'Người Ban Luật',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'ap-ra-ham',
    name: 'Áp-ra-ham',
    title: 'Cha Các Kẻ Tin',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'vua-da-vit',
    name: 'Vua Đavít',
    title: 'Dũng Tướng Thánh Vịnh',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'vua-sa-lo-mon',
    name: 'Vua Salômôn',
    title: 'Bậc Thầy Khôn Ngoan',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'tien-tri-e-li-a',
    name: 'Tiên tri Ê-li-a',
    title: 'Ngọn Lửa Đức Tin',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'tien-tri-i-sai-a',
    name: 'Tiên tri Isaia',
    title: 'Ngôn Sứ Cứu Chuộc',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'duc-maria',
    name: 'Đức Maria',
    title: 'Nữ Vương Hoà Bình',
    testament: 'Tân Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'thanh-giu-se',
    name: 'Thánh Giuse',
    title: 'Đấng Công Chính',
    testament: 'Tân Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1549471013-3364d7220b75?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'thanh-gioan-tay-gia',
    name: 'Gioan Tẩy Giả',
    title: 'Tiếng Kêu Hoang Địa',
    testament: 'Tân Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'thanh-phe-ro',
    name: 'Thánh Phêrô',
    title: 'Tảng Đá Đức Tin',
    testament: 'Tân Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'thanh-phao-lo',
    name: 'Thánh Phaolô',
    title: 'Tông Đồ Dân Ngoại',
    testament: 'Tân Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'a-dam-va-e-va',
    name: 'A-đam & E-va',
    title: 'Khởi Nguyên Nhân Loại',
    testament: 'Cựu Ước',
    avatarUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop'
  }
];

export async function fetchQuizQuestions(category?: string, limit: number = 50): Promise<QuizQuestion[]> {
  try {
    // 1. Try fetching from catechism_quiz_bank first
    let bankQuery = supabase.from('catechism_quiz_bank').select('*').limit(limit);
    
    if (category && category !== 'all' && category !== 'Tất cả') {
      bankQuery = bankQuery.or(`subject.ilike.%${category}%,grade_level.ilike.%${category}%,difficulty.ilike.%${category}%`);
    }
    
    const { data: bankData, error: bankError } = await bankQuery;
    
    if (!bankError && bankData && bankData.length > 0) {
      return bankData.map((item: any) => ({
        id: item.id.toString(),
        category: item.subject || item.grade_level || 'Giáo Lý',
        questionText: item.title || item.question,
        options: Array.isArray(item.options) ? item.options : [],
        correctAnswerIndex: typeof item.answer_index === 'number' ? item.answer_index : (item.correct_option || 0),
        explanation: item.explanation || '',
        scriptureRef: item.hint || item.bible_book || '',
        difficulty: item.difficulty || 'Dễ'
      }));
    }

    // 2. Fallback to quiz_questions if catechism_quiz_bank is empty
    let query = supabase.from('quiz_questions').select('*').limit(limit);
    if (category && category !== 'all' && category !== 'Tất cả') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id.toString(),
        category: item.category || 'Giáo Lý',
        questionText: item.question || item.title,
        options: item.options || [],
        correctAnswerIndex: item.correct_option || 0,
        explanation: item.explanation || '',
        scriptureRef: item.scripture_ref || '',
        difficulty: item.difficulty || 'Dễ'
      }));
    }
  } catch (e) {
    console.error('Lỗi khi tải câu hỏi quiz từ Supabase:', e);
  }
  return [];
}

export async function createQuizRoom(room: {
  roomPin: string;
  title: string;
  hostId?: string | number;
  hostName: string;
  progressionMode: 'host_manual' | 'auto_timer';
  timePerQuestionSeconds: number;
  maxParticipants: number;
  questions: QuizQuestion[];
}): Promise<QuizRoom | null> {
  try {
    const { data, error } = await supabase
      .from('quiz_rooms')
      .insert({
        room_code: room.roomPin,
        title: room.title,
        host_id: room.hostId || null,
        host_name: room.hostName,
        status: 'waiting',
        progression_mode: room.progressionMode,
        time_per_question: room.timePerQuestionSeconds,
        max_participants: room.maxParticipants,
        current_question_index: 0,
        questions: room.questions,
        leaderboard: []
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      roomPin: data.room_code,
      title: data.title,
      hostId: data.host_id,
      hostName: data.host_name,
      status: data.status,
      progressionMode: data.progression_mode,
      timePerQuestionSeconds: data.time_per_question,
      maxParticipants: data.max_participants,
      currentQuestionIndex: data.current_question_index,
      questions: data.questions || [],
      leaderboard: data.leaderboard || []
    };
  } catch (err) {
    console.error('Lỗi khi tạo phòng thi quiz:', err);
    return null;
  }
}

export async function fetchQuizRoomByPin(roomPin: string): Promise<QuizRoom | null> {
  try {
    const { data, error } = await supabase
      .from('quiz_rooms')
      .select('*')
      .eq('room_code', roomPin)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      roomPin: data.room_code,
      title: data.title,
      hostId: data.host_id,
      hostName: data.host_name,
      status: data.status,
      progressionMode: data.progression_mode || 'host_manual',
      timePerQuestionSeconds: data.time_per_question || 20,
      maxParticipants: data.max_participants || 50,
      currentQuestionIndex: data.current_question_index || 0,
      questions: data.questions || [],
      leaderboard: data.leaderboard || []
    };
  } catch (err) {
    console.error('Lỗi khi tải thông tin phòng thi:', err);
    return null;
  }
}

export async function updateQuizRoom(roomPin: string, updates: Partial<{
  status: 'waiting' | 'live' | 'showing_answer' | 'leaderboard' | 'ended';
  current_question_index: number;
  leaderboard: ParticipantState[];
}>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_rooms')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('room_code', roomPin);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi cập nhật phòng thi:', err);
    return false;
  }
}

export async function recordQuizAttempt(attempt: {
  userId?: string | number;
  userName: string;
  characterAvatar?: string;
  title: string;
  score: number;
  total: number;
  percentage: number;
  category?: string;
  roomCode?: string;
}) {
  try {
    await supabase.from('quiz_attempts').insert({
      user_id: attempt.userId ? String(attempt.userId) : null,
      user_name: attempt.userName,
      character_avatar: attempt.characterAvatar,
      title: attempt.title,
      score: attempt.score,
      total: attempt.total,
      percentage: attempt.percentage,
      category: attempt.category || 'Tất cả',
      room_code: attempt.roomCode || null
    });
  } catch (e) {
    console.error('Lỗi khi lưu kết quả quiz:', e);
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculateSpeedBonus(timeLeft: number, maxTime: number = 20, streak: number = 0): number {
  // Điểm cơ bản cho câu đúng: 1000 điểm
  // Điểm tốc độ: tối đa 500 điểm dựa trên tỉ lệ thời gian còn lại
  // Điểm chuỗi đúng (streak bonus): +100 điểm mỗi cấp độ streak (tối đa 500 điểm)
  const baseScore = 1000;
  const timeRatio = Math.max(0, timeLeft / maxTime);
  const speedBonus = Math.round(500 * timeRatio);
  const streakBonus = Math.min(500, streak * 100);
  return baseScore + speedBonus + streakBonus;
}
