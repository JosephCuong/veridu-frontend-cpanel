'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser, logout, saveAuthSession, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, Mail, Church, Compass, Award, Flame, Shield, LogOut, 
  Settings, BookOpen, CheckCircle, Clock, Save, Phone, Image as ImageIcon,
  Heart, Calendar, Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State for Profile Settings
  const [formData, setFormData] = useState({
    christianName: '',
    displayName: '',
    email: '',
    phone: '',
    parish: '',
    diocese: '',
    feastDay: '19/03 (Thánh Giuse)',
    bio: ''
  });

  useEffect(() => {
    const current = getStoredUser();
    if (current) {
      setUser(current);
      setFormData({
        christianName: current.christianName || 'Giuse',
        displayName: current.displayName || '',
        email: current.email || '',
        phone: current.phone || '',
        parish: current.parish || 'Tân Định',
        diocese: current.diocese || 'Giáo Phận Sài Gòn',
        feastDay: '19/03 (Thánh Giuse)',
        bio: 'Nguyện xin Lời Chúa là ngọn đèn soi cho con bước.'
      });
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      if (user?.id) {
        // Update Supabase profile table
        await supabase
          .from('profiles')
          .update({
            full_name: formData.displayName,
            role: user.role
          })
          .eq('id', user.id);
      }

      // Update local storage session
      const updatedUser: UserProfile = {
        ...user!,
        christianName: formData.christianName,
        displayName: formData.displayName,
        phone: formData.phone,
        parish: formData.parish,
        diocese: formData.diocese
      };

      saveAuthSession('active_token', updatedUser);
      setUser(updatedUser);
      setMessage({ text: 'Đã cập nhật hồ sơ cá nhân thành công!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Lỗi cập nhật: ' + err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Bạn chưa đăng nhập.</p>
          <Link href="/dang-nhap" className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl">
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Card Header */}
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl font-serif font-black shadow-xl">
              {user.christianName ? user.christianName[0] : (user.displayName ? user.displayName[0] : 'V')}
            </div>
            
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-amber-400 font-serif font-bold text-xs uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  ✝ {user.christianName || 'Tín Hữu'}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {user.role || 'Học Viên'}
                </span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[var(--text-main)]">{user.displayName || user.email}</h1>
              <p className="text-sm text-[var(--text-muted)] flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(user.role === 'Quản Trị Viên' || user.role === 'admin') && (
                <Link href="/admin" className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20">
                  <Shield className="w-4 h-4" /> Trang Admin
                </Link>
              )}
              <button onClick={logout} className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                <LogOut className="w-4 h-4" /> Đăng Xuất
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-[var(--border-card)] pb-4">
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'info' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <User className="w-4 h-4" /> Tổng Quan Hồ Sơ
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <Settings className="w-4 h-4" /> Cài Đặt Thông Tin & Phân Quyền
          </button>
        </div>

        {/* TAB 1: OVERVIEW INFO */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
              <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                <Church className="w-5 h-5" /> Thông Tin Sinh Hoạt Giáo Xứ
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)]">Tên Thánh:</span>
                  <span className="font-bold text-amber-400">{user.christianName || 'Giuse'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)]">Giáo Xứ:</span>
                  <span className="font-bold">{user.parish || 'Tân Định'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)]">Giáo Phận:</span>
                  <span className="font-bold">{user.diocese || 'Giáo Phận Sài Gòn'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
              <h3 className="font-serif font-bold text-lg text-amber-400 flex items-center gap-2">
                <Flame className="w-5 h-5" /> Tiến Trình Học Tập & Đạo Đức
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)]">Chuỗi Học Tập (Streak):</span>
                  <span className="font-bold text-amber-400">🔥 1 Ngày Liên Tục</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)]">Vai Trò Hệ Thống:</span>
                  <span className="font-bold text-emerald-400">{user.role || 'Học Viên'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE SETTINGS FORM */}
        {activeTab === 'settings' && (
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6">
            <h2 className="font-serif font-bold text-xl text-amber-400 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Cài Đặt Chi Tiết Hồ Sơ Cá Nhân
            </h2>

            {message && (
              <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                <CheckCircle className="w-4 h-4" /> {message.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <span className="text-amber-400 font-serif font-black">✝</span> Tên Thánh
                  </label>
                  <input 
                    type="text" 
                    value={formData.christianName} 
                    onChange={e => setFormData({...formData, christianName: e.target.value})}
                    placeholder="Giuse, Maria, Têrêsa..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <User className="w-4 h-4" /> Họ và Tên
                  </label>
                  <input 
                    type="text" 
                    value={formData.displayName} 
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Số Điện Thoại
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="0901234567"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <Church className="w-4 h-4" /> Giáo Xứ
                  </label>
                  <input 
                    type="text" 
                    value={formData.parish} 
                    onChange={e => setFormData({...formData, parish: e.target.value})}
                    placeholder="Giáo Xứ Tân Định, Ba Chuông..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Giáo Phận
                  </label>
                  <select 
                    value={formData.diocese} 
                    onChange={e => setFormData({...formData, diocese: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Giáo Phận Sài Gòn">Giáo Phận Sài Gòn</option>
                    <option value="Giáo Phận Xuân Lộc">Giáo Phận Xuân Lộc</option>
                    <option value="Giáo Phận Phú Cường">Giáo Phận Phú Cường</option>
                    <option value="Giáo Phận Hà Nội">Giáo Phận Hà Nội</option>
                    <option value="Giáo Phận Huế">Giáo Phận Huế</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Ngày Bổn Mạng Quan Thầy
                  </label>
                  <input 
                    type="text" 
                    value={formData.feastDay} 
                    onChange={e => setFormData({...formData, feastDay: e.target.value})}
                    placeholder="19/03 (Thánh Giuse)"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-card)] flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-70"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu Cập Nhật Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
