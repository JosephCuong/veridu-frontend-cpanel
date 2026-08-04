'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredUser, getAuthToken, UserProfile } from '@/lib/auth';
import { 
  Users, Search, Filter, ShieldAlert, Shield, 
  Edit, Trash2, Loader2, Save, X, MoreVertical, ShieldCheck, Flame, Trophy 
} from 'lucide-react';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://data.thapgia.com/wp-json/veridu/v1';

// WP Roles we want to allow assigning
const WP_ROLES = [
  { value: 'subscriber', label: 'Học Viên (Subscriber)' },
  { value: 'contributor', label: 'Người Đóng Góp (Contributor)' },
  { value: 'author', label: 'Học Giả VERIDU (Author)' },
  { value: 'editor', label: 'Giáo Lý Viên (Editor)' },
  { value: 'administrator', label: 'Quản Trị Viên (Administrator)' }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Edit Form State
  const [editRole, setEditRole] = useState('');
  const [editWpRole, setEditWpRole] = useState('subscriber');
  const [editPoints, setEditPoints] = useState(0);
  const [editStreak, setEditStreak] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser || storedUser.role !== 'Quản Trị Viên') {
      router.push('/');
    } else {
      setUser(storedUser);
      fetchUsers(1, '');
    }
  }, [router]);

  const fetchUsers = async (p: number, s: string) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${WP_API_BASE}/admin/users?page=${p}&per_page=20&search=${encodeURIComponent(s)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const openEditModal = (u: any) => {
    setSelectedUser(u);
    setEditRole(u.role || 'Học Viên');
    setEditWpRole(u.wp_roles && u.wp_roles.length > 0 ? u.wp_roles[0] : 'subscriber');
    setEditPoints(u.points || 0);
    setEditStreak(u.streak || 0);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${WP_API_BASE}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          role: editRole,
          wp_role: editWpRole,
          points: editPoints,
          streak: editStreak
        })
      });
      if (res.ok) {
        fetchUsers(page, search);
        setSelectedUser(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi cập nhật');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác!')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${WP_API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers(page, search);
      } else {
        alert('Lỗi khi xóa người dùng');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans">
      
      
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif font-black text-3xl flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-500" /> Bảng Quản Trị Hệ Thống
            </h1>
            <p className="text-[var(--text-muted)] mt-2">Quản lý người dùng, phân quyền và điểm số.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo Tên hoặc Email..." 
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </form>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-500/10 text-indigo-500 border-b border-[var(--border-card)]">
                <tr>
                  <th className="px-6 py-4 font-bold">Người Dùng</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Phân Quyền (VERIDU)</th>
                  <th className="px-6 py-4 font-bold text-center">Chuỗi Ngày</th>
                  <th className="px-6 py-4 font-bold text-center">Điểm Tích Lũy</th>
                  <th className="px-6 py-4 font-bold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-4" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">Không tìm thấy người dùng nào.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-main)]">{u.christianName} {u.displayName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{u.username}</div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-muted)]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.role === 'Quản Trị Viên' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : u.role === 'Giáo Lý Viên' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-amber-500">🔥 {u.streak}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-500">⭐ {u.points}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(u)} className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-[var(--border-card)] flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)]">Trang {page} / {totalPages || 1}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => { setPage(p=>p-1); fetchUsers(page-1, search); }}
                className="px-4 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => { setPage(p=>p+1); fetchUsers(page+1, search); }}
                className="px-4 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-lg border border-[var(--border-card)] shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-black text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-500" /> Sửa: {selectedUser.displayName}
              </h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-800 rounded-full transition"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">Vai trò WP Nền tảng (WP_Role)</label>
                <select value={editWpRole} onChange={e=>setEditWpRole(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] outline-none focus:border-indigo-500">
                  {WP_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Lưu ý: Bạn cần cài đặt Plugin "User Role Editor" để các Role này hoạt động hết công suất.</p>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">Danh xưng VERIDU (Hiển thị)</label>
                <select value={editRole} onChange={e=>setEditRole(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] outline-none focus:border-indigo-500">
                  <option value="Học Viên">Học Viên</option>
                  <option value="Người Đóng Góp">Người Đóng Góp</option>
                  <option value="Học Giả VERIDU">Học Giả VERIDU</option>
                  <option value="Giáo Lý Viên">Giáo Lý Viên</option>
                  <option value="Quản Trị Viên">Quản Trị Viên</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-amber-500 mb-1 flex items-center gap-1"><Flame className="w-4 h-4"/> Chuỗi Học (Streak)</label>
                  <input type="number" value={editStreak} onChange={e=>setEditStreak(Number(e.target.value))} className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-1"><Trophy className="w-4 h-4"/> Điểm số</label>
                  <input type="number" value={editPoints} onChange={e=>setEditPoints(Number(e.target.value))} className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-card)]">
              <button onClick={() => setSelectedUser(null)} className="px-6 py-2.5 rounded-xl border border-[var(--border-card)] text-sm font-bold hover:bg-slate-800 transition">Hủy</button>
              <button onClick={handleSaveUser} disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition flex items-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Lưu Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
