import Cookies from 'js-cookie';

export interface QuizAttempt {
  id: string;
  title: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export interface UserProfile {
  id: string | number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  displayName: string;
  christianName: string;
  parish: string;
  diocese: string;
  role: 'Học Viên' | 'Giáo Lý Viên' | 'Quản Trị Viên' | 'Người Đóng Góp' | 'Học Giả VERIDU' | string;
  streak: number;
  points?: number;
  badges?: string[];
  createdAt?: string;
  quizHistory?: QuizAttempt[];
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = Cookies.get('veridu_user');
  if (data) {
    try {
      const decoded = data.includes('%') ? decodeURIComponent(data) : data;
      const parsed: UserProfile = JSON.parse(decoded);
      
      // Auto-sanitize corrupted legacy UTF-8 text
      if (parsed.diocese && parsed.diocese.includes('?')) {
        parsed.diocese = 'Giáo Phận Sài Gòn';
      }
      if (parsed.parish && parsed.parish.includes('?')) {
        parsed.parish = 'Tân Định';
      }
      return parsed;
    } catch (e) {
      const local = localStorage.getItem('veridu_user_profile');
      if (local) {
        try { return JSON.parse(local); } catch (err) {}
      }
      return null;
    }
  }
  
  const local = localStorage.getItem('veridu_user_profile');
  if (local) {
    try { return JSON.parse(local); } catch (err) {}
  }
  return null;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('veridu_token') || localStorage.getItem('veridu_token') || null;
}

export function saveAuthSession(token: string, user: UserProfile, remember: boolean = true) {
  if (typeof window !== 'undefined') {
    const jsonString = JSON.stringify(user);
    const encodedUser = encodeURIComponent(jsonString);

    if (remember) {
      Cookies.set('veridu_token', token, { expires: 30, path: '/' });
      Cookies.set('veridu_user', encodedUser, { expires: 30, path: '/' });
    } else {
      Cookies.set('veridu_token', token, { path: '/' });
      Cookies.set('veridu_user', encodedUser, { path: '/' });
    }

    localStorage.setItem('veridu_token', token);
    localStorage.setItem('veridu_user_profile', jsonString);
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    Cookies.remove('veridu_token', { path: '/' });
    Cookies.remove('veridu_user', { path: '/' });
    localStorage.removeItem('veridu_token');
    localStorage.removeItem('veridu_user_profile');
    window.location.href = '/dang-nhap';
  }
}

// 🏆 Quiz Practice History Helpers (Max 10 items)
export function getStoredQuizHistory(): QuizAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('veridu_quiz_history');
    if (data) return JSON.parse(data).slice(0, 10);
  } catch (e) {}
  return [
    { id: 'q1', title: 'Giáo Lý Dự Tòng - Bài 1: Thiên Chúa Sáng Tạo', score: 10, total: 10, percentage: 100, date: '12/08/2026 10:30' },
    { id: 'q2', title: 'Kinh Thánh Cựu Ước - Sách Sáng Thế', score: 8, total: 10, percentage: 80, date: '11/08/2026 15:20' },
    { id: 'q3', title: 'Thần Học Phụng Vụ - Các Mùa Phụng Vụ', score: 9, total: 10, percentage: 90, date: '10/08/2026 20:15' }
  ];
}

export function addQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'date'>) {
  if (typeof window === 'undefined') return;
  const history = getStoredQuizHistory();
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: 'quiz_' + Date.now(),
    date: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  const updated = [newAttempt, ...history].slice(0, 10);
  localStorage.setItem('veridu_quiz_history', JSON.stringify(updated));
}

export function clearQuizHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('veridu_quiz_history');
}
