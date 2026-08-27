import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCourses, getLibraryArticles } from '@/lib/api';
import { 
  BookOpen, 
  Cross, 
  Sun, 
  Shield, 
  Flame, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  BookMarked
} from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Giáo Lý Hội Thánh Công Giáo — Khảo Cứu & Học Hỏi Toàn Thư | VERIDU',
  description: 'Trung tâm khảo cứu Sách Giáo Lý Hội Thánh Công Giáo (CCC Toàn Thư 2865 số điều khoản) với 4 Trụ Cột Đức Tin, Trình đọc toàn văn, Thẻ lật ghi nhớ và Đấu trường Quiz.',
};

// 4 Pillars of Catholic Catechism (Classical Cathedral Pillar Aesthetic)
const CATHEDRAL_PILLARS = [
  {
    number: 1,
    roman: 'I',
    slug: 'phan-1',
    title: 'Tuyên Xưng Đức Tin',
    subtitle: 'Kinh Tin Kính Các Tông Đồ',
    range: 'CCC 1 – 1065',
    desc: 'Mầu nhiệm Thiên Chúa Ba Ngôi, Công trình Sáng Tạo, Ngôi Lời Nhập Thể, Ơn Cứu Chuộc & Mầu nhiệm Hội Thánh.',
    icon: Cross,
    accentColor: 'from-amber-500/20 to-amber-600/5',
    borderColor: 'border-amber-500/30 hover:border-amber-500/80',
    keyTopics: ['Thiên Chúa Ba Ngôi', 'Sáng Tạo & Sa Ngã', 'Đức Kitô Cứu Độ', 'Hội Thánh Công Giáo', 'Sự Sống Đời Đời']
  },
  {
    number: 2,
    roman: 'II',
    slug: 'phan-2',
    title: 'Cử Hành Mầu Nhiệm Kitô Giáo',
    subtitle: 'Phụng Vụ Thánh & Bảy Bí Tích',
    range: 'CCC 1066 – 1690',
    desc: 'Nhiệm cục Bí tích, Năm Phụng vụ, Bảy Bí Tích (Khai tâm, Chữa lành, Phục vụ sự hiệp thông) & Các Á Bí Tích.',
    icon: Sun,
    accentColor: 'from-rose-500/20 to-rose-600/5',
    borderColor: 'border-rose-500/30 hover:border-rose-500/80',
    keyTopics: ['Nhiệm Cục Bí Tích', 'Bí Tích Rửa Tội', 'Bí Tích Thánh Thể', 'Bí Tích Hòa Giải', 'Truyền Chức & Hôn Phối']
  },
  {
    number: 3,
    roman: 'III',
    slug: 'phan-3',
    title: 'Đời Sống Trong Đức Kitô',
    subtitle: 'Luân Lý & Mười Điều Răn',
    range: 'CCC 1691 – 2557',
    desc: 'Phẩm giá con người, ơn gọi nên thánh, Tám Mối Phúc, Lương tâm, Các Nhân đức và Mười Điều Răn của Thiên Chúa.',
    icon: Shield,
    accentColor: 'from-emerald-500/20 to-emerald-600/5',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/80',
    keyTopics: ['Phẩm Giá Con Người', 'Tám Mối Phúc Thật', 'Các Nhân Đức Trụ & Đối Thần', 'Mười Điều Răn', 'Công Bằng Xã Hội']
  },
  {
    number: 4,
    roman: 'IV',
    slug: 'phan-4',
    title: 'Kinh Nguyện Kitô Giáo',
    subtitle: 'Kinh Lạy Cha & Đời Sống Cầu Nguyện',
    range: 'CCC 2558 – 2865',
    desc: 'Bản chất kinh nguyện trong Cựu & Tân Ước, truyền thống cầu nguyện của Hội Thánh và 7 lời nguyện Kinh Lạy Cha.',
    icon: Flame,
    accentColor: 'from-indigo-500/20 to-indigo-600/5',
    borderColor: 'border-indigo-500/30 hover:border-indigo-500/80',
    keyTopics: ['Bản Chất Cầu Nguyện', '5 Hình Thức Kinh Nguyện', 'Mẫu Gương Cầu Nguyện', 'Kinh Lạy Cha (Pater Noster)', '7 Lời Cầu Xin Thánh Thiêng']
  }
];

export default async function GiaoLyLandingPage() {
  const allCourses = await fetchCourses();
  const allArticles = await getLibraryArticles();

  // Filter items relevant to "Giáo Lý"
  const giaoLyCourses = allCourses.filter(c => 
    c.category?.toLowerCase().includes('giáo lý') || 
    c.title?.toLowerCase().includes('giáo lý') ||
    c.description?.toLowerCase().includes('giáo lý')
  );

  const giaoLyArticles = allArticles.filter(a => 
    a.category?.toLowerCase().includes('giáo lý') || 
    a.title?.toLowerCase().includes('giáo lý') ||
    a.excerpt?.toLowerCase().includes('giáo lý') ||
    a.category?.toLowerCase().includes('thần học')
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* ── 1. SACRED HERO BANNER (COHESIVE LIGHT/DARK CONTRAST) ── */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.03] to-[var(--bg-main)] dark:from-stone-950 dark:via-stone-900 dark:to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-serif font-bold tracking-wider backdrop-blur-md shadow-sm">
            <Cross className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>KHO TÀNG ĐỨC TIN HỘI THÁNH CÔNG GIÁO</span>
            <Cross className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-6xl text-[var(--text-main)] tracking-tight leading-tight drop-shadow-sm">
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              Giáo Lý Hội Thánh Công Giáo
            </span>
          </h1>

          <p className="text-slate-600 dark:text-stone-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-serif italic">
            Tổng hợp toàn văn 2.865 số điều khoản chuẩn mực, phân cấp theo 4 Trụ Cột Đức Tin, cùng hệ thống Thẻ Lật Ghi Nhớ Tín Lý và Đấu Trường Quiz tương tác.
          </p>

          {/* Quick Hub Navigation Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/giao-ly/doc/phan-1"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khảo Cứu Toàn Văn (CCC 1 - 2865)</span>
            </Link>

            <Link
              href="/giao-ly/the-lat"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-serif font-bold text-xs border-2 border-amber-500/30 hover:border-amber-500 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Trung Tâm Thẻ Lật</span>
            </Link>

            <Link
              href="/quiz"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-rose-500/10 text-rose-800 dark:text-rose-300 font-serif font-bold text-xs border-2 border-rose-500/30 hover:border-rose-500 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105 shadow-md"
            >
              <Award className="w-4 h-4 text-rose-500" />
              <span>Đấu Trường Giáo Lý</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── 2. LỜI MỞ ĐẦU BANNER (PROLOGUE) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 w-full">
        <Link 
          href="/giao-ly/doc/loi-mo-dau"
          className="block p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 hover:border-amber-500 shadow-xl transition-all group backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Lời Tựa Khởi Đầu</span>
                  <span className="text-xs text-[var(--text-muted)] font-serif">• CCC 1 – 25</span>
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Lời Mở Đầu: Sự Sống Của Con Người Là Nhận Biết &amp; Yêu Mến Thiên Chúa
                </h3>
              </div>
            </div>

            <span className="text-xs font-serif font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end sm:self-center">
              <span>Đọc Lời Mở Đầu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── 3. FOUR CATHEDRAL PILLARS (BỐ CỤC 4 CỘT TRỤ ĐỨNG THÁNH ĐƯỜNG) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-10">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
            Kiến Trúc Nền Móng Tông Truyền
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
            Bốn Trụ Cột Giáo Lý Hội Thánh
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-serif">
            Được Thánh Giáo Hoàng Gioan Phaolô II ban hành, phân định trọn vẹn đức tin người tín hữu qua 4 chiều kích thiêng liêng.
          </p>
        </div>

        {/* 4 Standing Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {CATHEDRAL_PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;

            return (
              <div
                key={pillar.number}
                className={`p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 ${pillar.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:-translate-y-1`}
              >
                {/* Subtle Pillar Header Arch Effect */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                
                <div className="space-y-4">
                  {/* Pillar Top Icon & Roman Number */}
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-inner">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="font-serif font-black text-sm px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                      Cột Trụ {pillar.roman}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                      {pillar.range}
                    </span>
                    <h3 className="font-serif font-black text-xl text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="font-serif font-bold text-xs text-amber-700 dark:text-amber-400">
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif pt-1">
                    {pillar.desc}
                  </p>

                  {/* Key Topics Checklist */}
                  <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                      Chủ đề cốt lõi:
                    </span>
                    <ul className="space-y-1 text-xs font-serif text-[var(--text-main)]">
                      {pillar.keyTopics.map((topic, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span className="truncate">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Direct Action Link */}
                <Link
                  href={`/giao-ly/doc/${pillar.slug}`}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-amber-500/20"
                >
                  <span>Khảo Cứu Phần {pillar.roman}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

              </div>
            );
          })}
        </div>

      </section>

      {/* ── 4. PHÂN HỆ HỌC TẬP & ĐẤU TRƯỜNG QUIZ ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Flashcard Learning Hub Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-amber-500/10 border-2 border-amber-500/30 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-2xl text-[var(--text-main)]">
                Trung Tâm Thẻ Lật Ghi Nhớ Tín Lý
              </h3>
              <p className="text-xs sm:text-sm font-serif text-[var(--text-muted)] leading-relaxed">
                Hệ thống Flashcards 3D tương tác giúp ôn tập nhanh các chân lý đức tin, định nghĩa bí tích, 10 điều răn và kinh nguyện, tích lũy điểm thưởng Faith XP.
              </p>
            </div>

            <Link
              href="/giao-ly/the-lat"
              className="py-3 px-6 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition shadow-lg self-start"
            >
              <span>Vào Học Thẻ Lật Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quiz Arena Hub Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-rose-500/10 border-2 border-rose-500/30 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-2xl text-[var(--text-main)]">
                Đấu Trường Trắc Nghiệm Giáo Lý
              </h3>
              <p className="text-xs sm:text-sm font-serif text-[var(--text-muted)] leading-relaxed">
                Thi đấu đối kháng thời gian thực, thi thử theo chủ đề và xem dẫn giải chi tiết trực tiếp từ các số điều khoản của Sách Giáo Lý Hội Thánh Công Giáo.
              </p>
            </div>

            <Link
              href="/quiz"
              className="py-3 px-6 rounded-2xl bg-rose-500 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-600 transition shadow-lg self-start"
            >
              <span>Tham Gia Đấu Trường Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── 5. CÁC KHÓA HỌC GIÁO LÝ NỔI BẬT ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Học Tập Có Lộ Trình
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Khóa Học Giáo Lý Trực Tuyến
            </h2>
          </div>
          <Link 
            href="/khoa-hoc"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Xem tất cả khóa học</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {giaoLyCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giaoLyCourses.slice(0, 3).map((course) => (
              <div 
                key={course.id}
                className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden shadow-md hover:border-amber-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-800">
                    {course.thumbnail ? (
                      <Image 
                        src={course.thumbnail} 
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-600 font-serif font-bold text-xl">
                        VERIDU
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      {course.category || 'Giáo Lý'}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-serif font-bold text-lg text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-serif">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[var(--border-card)]/50 mt-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    {course.level || 'Khóa Học Giáo Lý'}
                  </span>
                  <Link 
                    href={`/khoa-hoc/${course.slug}`}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500 hover:text-slate-950 border border-[var(--border-card)] font-bold transition flex items-center gap-1"
                  >
                    <span>Vào Lớp</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
            <BookOpen className="w-10 h-10 text-amber-500 mx-auto opacity-40" />
            <p className="text-sm font-serif text-[var(--text-muted)]">Các khóa học Giáo Lý chuyên sâu đang được chuẩn bị và cập nhật liên tục.</p>
          </div>
        )}
      </section>

      {/* ── 6. BÀI VIẾT KHẢO CỨU TÍN LÝ & GIÁO LÝ ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Khảo Cứu &amp; Suy Niệm
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Bài Viết Giáo Lý &amp; Tín Lý
            </h2>
          </div>
          <Link 
            href="/thu-vien"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Khám phá Thư Viện</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {giaoLyArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giaoLyArticles.slice(0, 3).map((article) => (
              <Link 
                key={article.id}
                href={`/thu-vien/${article.slug}`}
                className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                      {article.category || 'Tín Lý'}
                    </span>
                    <span>{article.reading_time || '5 phút đọc'}</span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed font-serif">
                    {article.excerpt || 'Đọc bài viết suy niệm giáo lý chuyên sâu...'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-card)]/60 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span>Đọc chuyên khảo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] text-xs text-[var(--text-muted)] font-serif">
            Chưa có bài viết nào trong chuyên mục này.
          </div>
        )}
      </section>

    </div>
  );
}
