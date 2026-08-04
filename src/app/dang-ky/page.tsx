'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient'; // Giả sử tệp này tồn tại
import { UserPlus, Lock, Mail, User, Church, Compass, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [christianName, setChristianName] = useState('Giuse');
  const [parish, setParish] = useState('');
  const [diocese, setDiocese] = useState('Giáo Phận Sài Gòn');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            christian_name: christianName,
            parish,
            diocese,
            role: 'student'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại.');
      } else {
        const userProfile: UserProfile = {
          id: data.user?.id || '1',
          username: email.split('@')[0],
          email: email,
          displayName: displayName || email,
          christianName: christianName,
          parish: parish,
          diocese: diocese,
          role: 'Học Viên',
          streak: 1
        };

        saveAuthSession(data.session?.access_token || 'sb_session_active', userProfile);

        if (data.session) {
          setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
          setTimeout(() => { router.push('/ho-so'); }, 1000);
        } else {
          setSuccessMsg('Đã khởi tạo tài khoản! Vui lòng kiểm tra Email để xác nhận (hoặc đăng nhập ngay nếu đã tắt Confirm Email).');
        }
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMsg(err.message || 'Không thể kết nối dịch vụ Supabase. Kiểm tra lại API Keys.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      <main className="max-w-xl mx-auto px-4 py-16 relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)]/80 border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="space-y-3 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-black text-3xl text-amber-400">Tạo Tài Khoản Công Giáo</h1>
            <p className="text-sm text-[var(--text-muted)]">Tham gia cộng đồng học tập & suy niệm Lời Chúa VERIDU</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <span className="text-amber-400 font-serif mr-1.5 font-black">✝</span> Tên Thánh
                </label>
                <input 
                  type="text" required value={christianName} onChange={(e) => setChristianName(e.target.value)}
                  placeholder="Giuse, Maria..."
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <User className="w-3 h-3 mr-1.5" /> Họ và Tên
                </label>
                <input 
                  type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Mail className="w-3 h-3 mr-1.5" /> Địa Chỉ Email
                </label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@thapgia.com"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Lock className="w-3 h-3 mr-1.5" /> Mật Khẩu
                </label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Church className="w-3 h-3 mr-1.5" /> Giáo Xứ
                </label>
                <input 
                  type="text" required value={parish} onChange={(e) => setParish(e.target.value)}
                  placeholder="Tân Định"
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center">
                  <Compass className="w-3 h-3 mr-1.5" /> Giáo Phận
                </label>
                <select 
                  value={diocese} onChange={(e) => setDiocese(e.target.value)}
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)]"
                >
                  <option value="Giáo Phận Sài Gòn">Giáo Phận Sài Gòn</option>
                  <option value="Giáo Phận Xuân Lộc">Giáo Phận Xuân Lộc</option>
                  <option value="Giáo Phận Phú Cường">Giáo Phận Phú Cường</option>
                  <option value="Giáo Phận Hà Nội">Giáo Phận Hà Nội</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 px-4 shadow-lg transition-all flex items-center justify-center mt-4"
            >
              {isLoading ? 'Đang xử lý...' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>

          <div className="text-center pt-5 border-t border-[var(--border-card)]/50">
            <p className="text-sm text-[var(--text-muted)]">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="text-amber-400 font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}