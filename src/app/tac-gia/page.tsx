'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Feather, 
  BookOpen, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Cross, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Send, 
  UserCheck, 
  ChevronRight, 
  Layers, 
  Users, 
  ArrowRight,
  Shield,
  HelpCircle,
  Clock,
  Sparkle
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';

const ROLES_INFO = [
  {
    role: 'Quản Trị Viên (Admin)',
    badge: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300',
    desc: 'Toàn quyền điều hành, phê duyệt bài viết, quản lý tài nguyên và phân quyền tác giả.',
    privileges: ['Kiểm duyệt bài viết & tài liệu', 'Cấp quyền tác giả & giáo lý viên', 'Quản trị cơ sở dữ liệu & Cài đặt hệ thống']
  },
  {
    role: 'Học Giả Thần Học (Scholar)',
    badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
    desc: 'Linh mục, tu sĩ, giảng viên thần học và chuyên gia được xác thực huy hiệu vàng.',
    privileges: ['Xuất bản bài viết & khảo cứu trực tiếp', 'Đăng tải sách và tài liệu chuyên sâu', 'Huy hiệu Học Giả Xác Thực']
  },
  {
    role: 'Tác Giả & Giáo Lý Viên (Author / Catechist)',
    badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    desc: 'Cộng tác viên biên soạn, giáo lý viên chia sẻ bài giảng, giáo án và tài nguyên đức tin.',
    privileges: ['Sử dụng VERIDU Creator Studio', 'Gửi bài viết & tài liệu (.pdf, .docx, slide)', 'Theo dõi lượt đọc & lượt tải tài nguyên']
  },
  {
    role: 'Học Viên & Giáo Dân (Member)',
    badge: 'bg-stone-500/15 border-stone-500/30 text-stone-700 dark:text-stone-300',
    desc: 'Thành viên cộng đồng học hỏi Kinh Thánh, Giáo Lý và tải tài nguyên miễn phí.',
    privileges: ['Khảo cứu Kinh Thánh & Giáo Lý', 'Tham gia Đấu Trường Quiz', 'Tải tài liệu & Nộp đơn làm tác giả']
  }
];

export default function AuthorsLandingPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authorsList, setAuthorsList] = useState<any[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [christianName, setChristianName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [diocese, setDiocese] = useState('Tổng Giáo Phận Sài Gòn');
  const [parish, setParish] = useState('');
  const [roleApplied, setRoleApplied] = useState('catechist');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sampleWorkUrl, setSampleWorkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      setFullName(user.displayName || user.username || '');
      setChristianName(user.christianName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.diocese) setDiocese(user.diocese);
      if (user.parish) setParish(user.parish);
    }

    // Fetch Authors
    fetch('/api/authors/list')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAuthorsList(data);
      })
      .catch(() => {})
      .finally(() => setLoadingAuthors(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng điền đầy đủ họ tên và email!' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/authors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id,
          full_name: fullName,
          christian_name: christianName,
          email,
          phone,
          diocese,
          parish,
          role_applied: roleApplied,
          bio,
          specialty,
          sample_work_url: sampleWorkUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setBio('');
        setSpecialty('');
        setSampleWorkUrl('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra khi nộp đơn.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* ── 1. SACRED HERO BANNER ── */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.03] to-[var(--bg-main)] dark:from-stone-950 dark:via-stone-900 dark:to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-serif font-bold tracking-wider backdrop-blur-md shadow-sm">
            <Feather className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>SỨ VỤ TÔNG ĐỒ TRUYỀN THÔNG CÔNG GIÁO</span>
            <Feather className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-6xl text-[var(--text-main)] tracking-tight leading-tight drop-shadow-sm">
            Tác Giả &amp; Giáo Lý Viên{' '}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              VERIDU
            </span>
          </h1>

          <p className="text-slate-600 dark:text-stone-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-serif italic">
            Mạng lưới các Linh mục, Tu sĩ, Giáo lý viên, Giảng viên Thần học và Người làm truyền thông Công giáo cùng chung tay kiến tạo và lan tỏa kho tàng tri thức đức tin chuẩn mực.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a
              href="#form-dang-ky"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span>Đăng Ký Trở Thành Tác Giả / Giáo Lý Viên</span>
            </a>

            <Link
              href="/dang-bai"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-serif font-bold text-xs border-2 border-amber-500/30 hover:border-amber-500 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105 shadow-md"
            >
              <UploadCloud className="w-4 h-4 text-amber-500" />
              <span>Vào Creator Studio Đăng Bài</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── 2. HỆ THỐNG PHÂN QUYỀN 4 CẤP (RBAC MATRIX) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-10">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
            Hệ Thống Phân Quyền &amp; Kiểm Duyệt
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
            Cơ Chế Phân Cấp Tác Giả Chuẩn Mực
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-serif">
            Mọi bài viết, giáo án và tài nguyên học tập đều được thẩm định cẩn trọng nhằm bảo đảm tính chính xác tín lý và tinh thần Hội Thánh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {ROLES_INFO.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-card)] hover:border-amber-500/40 shadow-xl transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <span className={`text-[11px] font-serif font-bold px-3 py-1 rounded-full border inline-block ${item.badge}`}>
                  {item.role}
                </span>
                <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                  {item.desc}
                </p>
                <div className="pt-3 border-t border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    Quyền hạn chính:
                  </span>
                  <ul className="space-y-1 text-xs font-serif text-[var(--text-main)]">
                    {item.privileges.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-stone-500 font-serif italic text-right">
                Cấp độ {idx + 1}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── 3. DANH SÁCH TÁC GIẢ & BAN BIÊN TẬP TIÊU BIỂU ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Đồng Đội Tông Đồ
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Ban Biên Tập &amp; Tác Giả Tiêu Biểu
            </h2>
          </div>
          <span className="text-xs font-serif text-[var(--text-muted)]">
            {authorsList.length} Học giả &amp; Giáo lý viên xác thực
          </span>
        </div>

        {loadingAuthors ? (
          <div className="py-12 text-center text-xs font-serif text-amber-500 animate-pulse">
            Đang tải danh sách tác giả...
          </div>
        ) : authorsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorsList.map((author) => (
              <div
                key={author.id}
                className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 font-serif font-black text-lg overflow-hidden relative shadow-inner">
                    {author.avatar_url ? (
                      <Image src={author.avatar_url} alt={author.display_name || author.full_name} fill className="object-cover" />
                    ) : (
                      <span>{(author.christian_name || author.full_name || 'V')[0]}</span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-serif font-bold text-base text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {author.christian_name ? `${author.christian_name} ${author.display_name || author.full_name}` : (author.display_name || author.full_name)}
                      </h3>
                      {author.is_verified_author && (
                        <span title="Tác giả được xác thực">
                          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                        </span>
                      )}

                    </div>
                    <span className="text-[11px] font-sans font-bold text-amber-700 dark:text-amber-400 block">
                      {author.specialty || author.role || 'Cộng Tác Viên VERIDU'}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-serif block">
                      {author.diocese ? `${author.diocese}${author.parish ? ` • ${author.parish}` : ''}` : 'VERIDU Network'}
                    </span>
                  </div>
                </div>

                {author.bio && (
                  <p className="text-xs font-serif text-[var(--text-muted)] line-clamp-3 leading-relaxed border-t border-[var(--border-card)]/60 pt-3">
                    {author.bio}
                  </p>
                )}

                <div className="pt-2 border-t border-[var(--border-card)]/50 flex items-center justify-between text-xs">
                  <Link
                    href={`/tac-gia/${author.id}`}
                    className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Xem Hồ Sơ &amp; Tác Phẩm</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] text-xs text-[var(--text-muted)] font-serif">
            Chưa có tác giả nào trong danh sách. Hãy là người đầu tiên đăng ký cộng tác!
          </div>
        )}

      </section>

      {/* ── 4. FORM ĐĂNG KÝ TRỞ THÀNH TÁC GIẢ / GIÁO LÝ VIÊN ── */}
      <section id="form-dang-ky" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full scroll-mt-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/30 shadow-2xl space-y-8 backdrop-blur-xl">
          
          <div className="text-center space-y-2 border-b border-[var(--border-card)] pb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
              <Feather className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Đơn Đăng Ký Trở Thành Tác Giả &amp; Giáo Lý Viên
            </h2>
            <p className="text-xs sm:text-sm font-serif text-[var(--text-muted)] max-w-xl mx-auto">
              Điền thông tin của bạn để Ban Quản Trị VERIDU xét duyệt và cấp quyền truy cập Creator Studio đăng bài &amp; gửi tài liệu.
            </p>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-2xl text-xs font-serif flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Shield className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                  Tên Thánh (Bổn Mạng)
                </label>
                <input
                  type="text"
                  value={christianName}
                  onChange={(e) => setChristianName(e.target.value)}
                  placeholder="VD: Phêrô, Têrêsa, Giuse..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                  Họ và Tên Đầy Đủ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                  Email Liên Lạc <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                  Số Điện Thoại / Zalo
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                  Giáo Phận
                </label>
                <input
                  type="text"
                  value={diocese}
                  onChange={(e) => setDiocese(e.target.value)}
                  placeholder="VD: Tổng Giáo Phận Sài Gòn, Hà Nội, Huế, Xuân Lộc..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                  Giáo Xứ / Dòng Tu
                </label>
                <input
                  type="text"
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  placeholder="VD: Giáo xứ Tân Định, Dòng Tên, Dòng Đa Minh..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                Vai Trò / Chuyên Môn Ứng Tuyển
              </label>
              <select
                value={roleApplied}
                onChange={(e) => setRoleApplied(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
              >
                <option value="catechist">Giáo Lý Viên (Soạn bài giảng, giáo án, tài nguyên giáo lý)</option>
                <option value="author">Tác Giả / Người Viết Khảo Cứu (Biên soạn bài viết thần học, phụng vụ, suy niệm)</option>
                <option value="scholar">Linh Mục / Tu Sĩ / Học Giả Thần Học (Hội đồng biên soạn &amp; Cố vấn học thuật)</option>
                <option value="translator">Dịch Giả / Biên Tập Ngôn Ngữ (Dịch thuật tài liệu Vatican, Kinh Thánh)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                Chuyên Môn &amp; Lĩnh Vực Đóng Góp
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="VD: Thần học Tín lý, Giáo lý Tân Tòng, Thánh Nhạc, Lịch sử Hội Thánh..."
                className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                Giới Thiệu Bản Thân &amp; Quá Trình Mục Vụ
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ đôi nét về quá trình phục vụ giáo xứ, chuyên môn đào tạo thần học, hoặc kinh nghiệm dạy giáo lý của bạn..."
                className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 leading-relaxed font-serif"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">
                Đường Dẫn Bài Viết Mẫu Hoặc Tài Liệu (Google Drive / Website / Bài báo)
              </label>
              <input
                type="url"
                value={sampleWorkUrl}
                onChange={(e) => setSampleWorkUrl(e.target.value)}
                placeholder="https://drive.google.com/... hoặc https://..."
                className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>

            <div className="pt-4 border-t border-[var(--border-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-serif text-[var(--text-muted)] italic">
                * Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích xác thực tác giả.
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition disabled:opacity-50"
              >
                {submitting ? (
                  <span>Đang gửi hồ sơ...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Nộp Đơn Ứng Tuyển Tác Giả</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </section>

    </div>
  );
}
