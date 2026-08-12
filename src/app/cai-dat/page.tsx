'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getStoredUser, getAuthToken, saveAuthSession, UserProfile } from '@/lib/auth';
import { fetchCharacters, Character } from '@/lib/api';
import { User, Mail, Phone, Church, Compass, Save, Loader2, Image as ImageIcon, Settings } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    christianName: '',
    displayName: '',
    email: '',
    phone: '',
    parish: '',
    diocese: '',
    avatar: ''
  });

  const [characters, setCharacters] = useState<Character[]>([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | { text: ''; type: '' }>({ text: '', type: '' });

  useEffect(() => {
    const current = getStoredUser();
    const currentToken = getAuthToken();
    setUser(current);
    setToken(currentToken);

    if (current) {
      setFormData({
        christianName: current.christianName || '',
        displayName: current.displayName || current.username || '',
        email: current.email || '',
        phone: current.phone || '',
        parish: current.parish || '',
        diocese: current.diocese || '',
        avatar: current.avatar || ''
      });
    }
  }, []);

  useEffect(() => {
    fetchCharacters().then(data => setCharacters(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      if (user) {
         const activeToken = token || 'sb_session_active';
         saveAuthSession(activeToken, { ...user, ...formData });
      }
      setMessage({ text: 'Đã cập nhật thông tin hồ sơ & lịch phụng vụ thành công!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4">
        <p className="text-sm font-bold text-[var(--text-muted)]">Vui lòng đăng nhập để cài đặt hồ sơ.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans">
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-serif font-black text-3xl mb-8 flex items-center gap-3">
          <Settings className="w-8 h-8 text-amber-500" /> Cài Đặt Hồ Sơ Tín Hữu
        </h1>

        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] p-8 shadow-2xl">
          {message.text && (
            <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-[var(--border-card)]">
              <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 overflow-hidden flex items-center justify-center bg-[var(--bg-main)] text-amber-500 text-3xl font-black shadow-inner relative">
                {formData.avatar ? (
                  <Image src={formData.avatar} alt="Avatar" fill className="object-cover" sizes="(max-width: 96px) 100vw, 96px" />
                ) : (
                  formData.christianName.charAt(0) || 'G'
                )}
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="font-bold text-lg">Ảnh Đại Diện</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm">Chọn hình ảnh các nhân vật Kinh Thánh làm đại diện để tạo không gian Học hỏi Giáo lý trang nghiêm.</p>
                <button type="button" onClick={() => setShowAvatarModal(true)} className="px-4 py-2 bg-slate-800 text-[var(--text-main)] rounded-lg text-xs font-bold hover:bg-slate-700 transition flex items-center gap-2 mx-auto sm:mx-0">
                  <ImageIcon className="w-4 h-4" /> Đổi Avatar Nhân Vật
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><User className="w-4 h-4"/> Tên Thánh</label>
                <input type="text" value={formData.christianName} onChange={(e)=>setFormData({...formData, christianName: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><User className="w-4 h-4"/> Họ & Tên</label>
                <input type="text" value={formData.displayName} onChange={(e)=>setFormData({...formData, displayName: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none text-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><Mail className="w-4 h-4"/> Email</label>
                <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none text-sm" disabled={!!user.email} />
                {user.email && <p className="text-xs text-[var(--text-muted)] italic">Email không thể tự thay đổi. Vui lòng liên hệ Admin.</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><Phone className="w-4 h-4"/> Số điện thoại</label>
                <input type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><Church className="w-4 h-4"/> Giáo Xứ</label>
                <input type="text" value={formData.parish} onChange={(e)=>setFormData({...formData, parish: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><Compass className="w-4 h-4"/> Giáo Phận</label>
                <input type="text" value={formData.diocese} onChange={(e)=>setFormData({...formData, diocese: e.target.value})} className="w-full p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] focus:border-amber-500 outline-none text-sm" />
              </div>
            </div>
            
            <div className="pt-6 border-t border-[var(--border-card)] flex justify-end">
              <button type="submit" disabled={isUpdating} className="px-8 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-amber-500/20">
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Lưu Cập Nhật
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-[var(--border-card)] shadow-2xl">
            <div className="p-6 border-b border-[var(--border-card)] flex justify-between items-center">
              <h2 className="font-serif font-black text-xl">Chọn Avatar Thánh Nhân</h2>
              <button onClick={() => setShowAvatarModal(false)} className="w-8 h-8 rounded-full bg-[var(--bg-main)] flex items-center justify-center hover:bg-red-500 hover:text-white transition">✕</button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {characters.filter(c => c.avatar_url).map(char => (
                <div key={char.id} onClick={() => { setFormData({...formData, avatar: char.avatar_url || ''}); setShowAvatarModal(false); }} className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${formData.avatar === char.avatar_url ? 'border-amber-500 shadow-lg shadow-amber-500/30' : 'border-transparent hover:border-amber-500/50'}`}>
                  <div className="relative w-full aspect-square bg-[var(--bg-main)]">
                    <Image src={char.avatar_url!} alt={char.name} fill className="object-cover" sizes="(max-width: 768px) 33vw, 20vw" />
                  </div>
                  <div className="p-2 text-center text-xs font-bold bg-[var(--bg-main)] truncate">{char.name}</div>
                </div>
              ))}
              {characters.length === 0 && <p className="col-span-full text-center py-10 text-[var(--text-muted)]">Chưa có dữ liệu avatar.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
