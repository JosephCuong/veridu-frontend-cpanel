import Cookies from 'js-cookie';

export interface UserProfile {
  id: number;
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
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = Cookies.get('veridu_user');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('veridu_token') || null;
}

export function saveAuthSession(token: string, user: UserProfile, remember: boolean = true) {
  if (typeof window !== 'undefined') {
    if (remember) {
      Cookies.set('veridu_token', token, { expires: 30, path: '/' });
      Cookies.set('veridu_user', JSON.stringify(user), { expires: 30, path: '/' });
    } else {
      Cookies.set('veridu_token', token, { path: '/' });
      Cookies.set('veridu_user', JSON.stringify(user), { path: '/' });
    }
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    Cookies.remove('veridu_token', { path: '/' });
    Cookies.remove('veridu_user', { path: '/' });
    window.location.href = '/dang-nhap';
  }
}
