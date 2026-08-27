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

export function syncDailyStreak(user: UserProfile): UserProfile {
  if (typeof window === 'undefined' || !user) return user;

  const today = new Date().toISOString().split('T')[0];
  const lastActiveKey = `veridu_last_active_${user.id}`;
  const lastActiveDate = localStorage.getItem(lastActiveKey);

  let currentStreak = user.streak || 1;

  if (!lastActiveDate) {
    // First time tracking or reset
    currentStreak = Math.max(currentStreak, 1);
    localStorage.setItem(lastActiveKey, today);
  } else if (lastActiveDate !== today) {
    const lastDate = new Date(lastActiveDate);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive active day: increment streak
      currentStreak += 1;
    } else if (diffDays > 1) {
      // Inactive for more than 1 day: reset streak to 1
      currentStreak = 1;
    }
    localStorage.setItem(lastActiveKey, today);
  }

  const updatedUser = { ...user, streak: currentStreak };

  // Sync to Supabase in background if user.id is valid
  if (user.id && typeof user.id === 'string' && user.id.includes('-')) {
    import('./supabaseClient').then(async ({ supabase }) => {
      try {
        await supabase.from('profiles').update({
          streak: currentStreak,
          last_active_date: today,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (err) {}
    });
  }

  return updatedUser;
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = Cookies.get('veridu_user');
  if (data) {
    try {
      const decoded = data.includes('%') ? decodeURIComponent(data) : data;
      const parsed: UserProfile = JSON.parse(decoded);
      
      // Auto-sanitize legacy UTF-8 text
      if (parsed.diocese && parsed.diocese.includes('?')) parsed.diocese = 'Giáo Phận Sài Gòn';
      if (parsed.parish && parsed.parish.includes('?')) parsed.parish = 'Tân Định';

      return syncDailyStreak(parsed);
    } catch (e) {
      const local = localStorage.getItem('veridu_user_profile');
      if (local) {
        try { return syncDailyStreak(JSON.parse(local)); } catch (err) {}
      }
      return null;
    }
  }
  
  const local = localStorage.getItem('veridu_user_profile');
  if (local) {
    try { return syncDailyStreak(JSON.parse(local)); } catch (err) {}
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
  return [];
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

export function addFaithPoints(points: number, reason?: string) {
  if (typeof window === 'undefined') return;
  const current = getStoredUser();
  if (current) {
    const newPoints = (current.points || 0) + points;
    const updated = { ...current, points: newPoints };
    saveAuthSession(getAuthToken() || '', updated, true);
    
    // Background update to Supabase
    if (current.id && typeof current.id === 'string' && current.id.includes('-')) {
      import('./supabaseClient').then(async ({ supabase }) => {
        try {
          await supabase.from('profiles').update({
            points: newPoints,
            updated_at: new Date().toISOString()
          }).eq('id', current.id);
        } catch (err) {}
      });
    }
  }
}

