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
  fullName?: string;
  christianName: string;
  parish: string;
  diocese: string;
  role: 'Học Viên' | 'Giáo Lý Viên' | 'Quản Trị Viên' | 'Người Đóng Góp' | 'Học Giả VERIDU' | string;
  streak: number;
  points?: number;
  manna?: number;
  level?: number;
  selected_title?: string;
  unlocked_titles?: string[];
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
    currentStreak = Math.max(currentStreak, 1);
    localStorage.setItem(lastActiveKey, today);
  } else if (lastActiveDate !== today) {
    const lastDate = new Date(lastActiveDate);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    localStorage.setItem(lastActiveKey, today);
  }

  const updatedUser: UserProfile = { 
    ...user, 
    streak: currentStreak,
    points: Math.max(100, user.points !== undefined ? user.points : 100),
    manna: Math.max(0, user.manna !== undefined ? user.manna : 100)
  };

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

export const AUTH_EXPIRY_KEY = 'veridu_auth_expires_at';
export const MAX_REMEMBER_DAYS = 3; // 72 hours
export const MAX_REMEMBER_MS = 72 * 60 * 60 * 1000; // 259,200,000 ms

export function clearAuthData() {
  if (typeof window === 'undefined') return;
  Cookies.remove('veridu_token', { path: '/' });
  Cookies.remove('veridu_user', { path: '/' });
  
  localStorage.removeItem('veridu_token');
  localStorage.removeItem('veridu_user_profile');
  localStorage.removeItem(AUTH_EXPIRY_KEY);

  sessionStorage.removeItem('veridu_token');
  sessionStorage.removeItem('veridu_user_profile');
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  // 1. Verify 72-hour expiration if remember-me was set
  const expiresAtStr = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!isNaN(expiresAt) && Date.now() > expiresAt) {
      clearAuthData();
      return null;
    }
  }

  // 2. Read from Cookie
  const data = Cookies.get('veridu_user');
  if (data) {
    try {
      const decoded = data.includes('%') ? decodeURIComponent(data) : data;
      const parsed: UserProfile = JSON.parse(decoded);
      
      if (parsed.diocese && parsed.diocese.includes('?')) parsed.diocese = 'Giáo Phận Sài Gòn';
      if (parsed.parish && parsed.parish.includes('?')) parsed.parish = 'Tân Định';

      // Migration safeguard: if cookie exists with remember-me in localStorage but missing expiry key, cap it at 72h
      if (localStorage.getItem('veridu_user_profile') && !expiresAtStr) {
        localStorage.setItem(AUTH_EXPIRY_KEY, (Date.now() + MAX_REMEMBER_MS).toString());
      }

      return syncDailyStreak(parsed);
    } catch (e) {
      // Cookie parse error, continue to storage checks
    }
  }

  // 3. Check sessionStorage (active session tab)
  const sessionUser = sessionStorage.getItem('veridu_user_profile');
  if (sessionUser) {
    try {
      const parsed: UserProfile = JSON.parse(sessionUser);
      return syncDailyStreak(parsed);
    } catch (err) {}
  }
  
  // 4. Fallback to localStorage ONLY IF remember-me is active and valid (capped at 72 hours)
  if (expiresAtStr) {
    const local = localStorage.getItem('veridu_user_profile');
    if (local) {
      try { return syncDailyStreak(JSON.parse(local)); } catch (err) {}
    }
  }

  return null;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Verify 72-hour expiration if remember-me was set
  const expiresAtStr = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!isNaN(expiresAt) && Date.now() > expiresAt) {
      clearAuthData();
      return null;
    }
  }

  // 2. Cookie token
  const cookieToken = Cookies.get('veridu_token');
  if (cookieToken) return cookieToken;

  // 3. SessionStorage token (for session-only active tabs)
  const sessionToken = sessionStorage.getItem('veridu_token');
  if (sessionToken) return sessionToken;

  // 4. LocalStorage token ONLY if remember-me is active and valid
  if (expiresAtStr) {
    return localStorage.getItem('veridu_token') || null;
  }

  return null;
}

export function saveAuthSession(
  tokenOrUser: string | UserProfile, 
  userOrRemember?: UserProfile | boolean, 
  remember: boolean = false
) {
  if (typeof window === 'undefined') return;

  let token = 'veridu_active_session';
  let user: UserProfile;
  let isRemember = false;

  if (typeof tokenOrUser === 'string') {
    token = tokenOrUser;
    user = userOrRemember as UserProfile;
    isRemember = Boolean(remember);
  } else {
    user = tokenOrUser;
    token = getAuthToken() || 'veridu_active_session';
    if (typeof userOrRemember === 'boolean') {
      isRemember = userOrRemember;
    } else {
      // Preserve existing remember-me preference if active and not expired
      const existingExpiry = localStorage.getItem(AUTH_EXPIRY_KEY);
      isRemember = Boolean(existingExpiry && Number(existingExpiry) > Date.now());
    }
  }

  if (!user) return;

  // Ensure 100 EXP and 100 Mana minimum
  if (user.points === undefined || user.points < 100) user.points = 100;
  if (user.manna === undefined) user.manna = 100;

  const jsonString = JSON.stringify(user);
  const encodedUser = encodeURIComponent(jsonString);
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (isRemember) {
    // 72 Hours (3 days) max persistence
    const expiresAt = Date.now() + MAX_REMEMBER_MS;
    const cookieOptions: Cookies.CookieAttributes = {
      path: '/',
      sameSite: 'lax',
      secure: isHttps,
      expires: MAX_REMEMBER_DAYS, // 3 days in js-cookie
    };

    Cookies.set('veridu_token', token, cookieOptions);
    Cookies.set('veridu_user', encodedUser, cookieOptions);

    localStorage.setItem('veridu_token', token);
    localStorage.setItem('veridu_user_profile', jsonString);
    localStorage.setItem(AUTH_EXPIRY_KEY, expiresAt.toString());

    sessionStorage.setItem('veridu_token', token);
    sessionStorage.setItem('veridu_user_profile', jsonString);
  } else {
    // Session-only: No 'expires' option creates a browser session cookie (cleared on browser exit)
    const sessionCookieOptions: Cookies.CookieAttributes = {
      path: '/',
      sameSite: 'lax',
      secure: isHttps,
    };

    Cookies.set('veridu_token', token, sessionCookieOptions);
    Cookies.set('veridu_user', encodedUser, sessionCookieOptions);

    // Save in sessionStorage for the active tab/window
    sessionStorage.setItem('veridu_token', token);
    sessionStorage.setItem('veridu_user_profile', jsonString);

    // Clear persistent storage keys so session never revives after browser closure
    localStorage.removeItem('veridu_token');
    localStorage.removeItem('veridu_user_profile');
    localStorage.removeItem(AUTH_EXPIRY_KEY);
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    clearAuthData();

    import('./supabaseClient').then(async ({ supabase }) => {
      try {
        await supabase.auth.signOut();
      } catch (err) {}
    }).finally(() => {
      window.location.href = '/dang-nhap';
    });
  }
}

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

export function addFaithPoints(points: number, mannaOrReason?: number | string, newTitle?: string, newBadge?: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const current = getStoredUser() || {
    id: 'guest_' + Date.now(),
    username: 'khach_hanh_huong',
    email: '',
    displayName: 'Khách Hành Hương',
    christianName: '',
    parish: '',
    diocese: '',
    role: 'Học Viên',
    streak: 1,
    points: 100,
    manna: 100,
    badges: ['tan_tong']
  };

  const newPoints = Math.max(100, (current.points || 100) + points);
  const mannaDelta = typeof mannaOrReason === 'number' ? mannaOrReason : 0;
  const newManna = Math.max(0, (current.manna !== undefined ? current.manna : 100) + mannaDelta);

  const existingBadges = Array.isArray(current.badges) ? [...current.badges] : ['tan_tong'];
  if (newBadge && !existingBadges.includes(newBadge)) {
    existingBadges.push(newBadge);
  }

  const updated: UserProfile = { 
    ...current, 
    points: newPoints,
    manna: newManna,
    badges: existingBadges,
    selected_title: newTitle || current.selected_title || (current as any).current_title || 'NGƯỜI TÌM HIỂU'
  };

  saveAuthSession(updated);
  window.dispatchEvent(new CustomEvent('veridu_user_updated', { detail: updated }));

  if (current.id && typeof current.id === 'string' && current.id.includes('-')) {
    import('./supabaseClient').then(async ({ supabase }) => {
      try {
        await supabase.from('profiles').update({
          points: newPoints,
          manna: newManna,
          badges: existingBadges,
          selected_title: updated.selected_title,
          updated_at: new Date().toISOString()
        }).eq('id', current.id);

        await supabase.from('game_profiles').upsert({
          user_id: current.id,
          username: current.username || current.email,
          display_name: current.displayName,
          total_xp: newPoints,
          manna: newManna,
          badges: existingBadges,
          current_title: updated.selected_title,
          updated_at: new Date().toISOString()
        });
      } catch (err) {}
    });
  }

  return updated;
}
