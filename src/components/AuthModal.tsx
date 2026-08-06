'use client';

import React, { useState } from 'react';
import { X, User, Lock, Cross, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [christianName, setChristianName] = useState('Giuse');
  const [displayName, setDisplayName] = useState('');
  const [parish, setParish] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const email = username.includes('@') ? username : `${username}@veridu.com`;

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          setErrorMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
        } else if (data.session) {
          // Xây dựng UserProfile từ metadata & Supabase profiles table
          const meta = data.user?.user_metadata || {};
          let userRole = meta.role || 'Người Hành Hương';
          const userEmail = (data.user?.email || '').toLowerCase();

          if (userEmail === 'veridu.net@gmail.com' || userRole === 'admin') {
            userRole = 'Quản Trị Viên';
          } else if (data.user?.id) {
            try {
              const { data: dbProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .maybeSingle();

              if (dbProfile?.role) {
                userRole = dbProfile.role;
              }
            } catch (e) {
              console.warn('AuthModal role fetch warning:', e);
            }
          }

          const userObj: UserProfile = {
            id: data.user?.id || '',
            username: username,
            email: data.user?.email || '',
            christianName: meta.christianName || null,
            displayName: meta.displayName || null,
            role: userRole,
            avatar: meta.avatar || null,
            parish: meta.parish || null,
            diocese: meta.diocese || null,
            streak: meta.streak || 0,
            points: meta.points || 0,
            badges: meta.badges || [],
            createdAt: data.user?.created_at || new Date().toISOString()
          };
          
          saveAuthSession(data.session.access_token, userObj);
          onSuccess(userObj);
          onClose();
        }
      } else {
        // Register Mode
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              displayName,
              christianName,
              parish,
              diocese: 'Giáo Phận Sài Gòn',
              role: 'Học Viên'
            }
          }
        });
        
        if (error) {
          setErrorMsg(error.message || 'Đăng ký thất bại. Tên đăng nhập này có thể đã tồn tại.');
        } else if (data.session) {
          const userObj: UserProfile = {
            id: data.user?.id || '',
            username: username,
            email: data.user?.email || '',
            christianName: christianName,
            displayName: displayName,
            role: 'Học Viên',
            avatar: '',
            parish: parish,
            diocese: 'Giáo Phận Sài Gòn',
            streak: 0,
            points: 0,
            badges: [],
            createdAt: data.user?.created_at || new Date().toISOString()
          };
          saveAuthSession(data.session.access_token, userObj);
          onSuccess(userObj);
          onClose();
        } else {
          // Confirm email required
          setErrorMsg('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        }
      }
    } catch (err) {
      setErrorMsg('Thao tác thất bại. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)] backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Cross className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">
            {mode === 'login' ? 'Đăng Nhập VERIDU' : 'Đăng Ký Tài Khoản Công Giáo'}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {mode === 'login' ? 'Nhập thông tin tài khoản của bạn để lưu tiến độ học tập' : 'Tạo hồ sơ Công giáo kèm Tên Thánh & Giáo Xứ của bạn'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl text-xs font-bold">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <LogIn className="w-3.5 h-3.5" /> Đăng Nhập
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Đăng Ký
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Tên Thánh</label>
                <select
                  value={christianName}
                  onChange={(e) => setChristianName(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 focus:outline-none focus:border-amber-500"
                >
                  <option value="Giuse">Giuse</option>
                  <option value="Maria">Maria</option>
                  <option value="Phêrô">Phêrô</option>
                  <option value="Têrêsa">Têrêsa</option>
                  <option value="Phaolô">Phaolô</option>
                  <option value="Gioan">Gioan</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Họ & Tên</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required={mode === 'register'}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Tên Đăng Nhập / Email</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="giuse_nguyen"
                required
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Mật Khẩu</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Giáo Xứ Tự Thuộc</label>
              <input
                type="text"
                value={parish}
                onChange={(e) => setParish(e.target.value)}
                placeholder="VD: Giáo Xứ Tân Định"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Xử Lý...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Ngay</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Khởi Tạo Tài Khoản</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[var(--border-card)] text-[11px] text-[var(--text-muted)]">
          Tài khoản bảo mật 100% kết nối với máy chủ Công giáo VERIDU
        </div>

      </div>
    </div>
  );
}
