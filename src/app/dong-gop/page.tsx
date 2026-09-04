import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  HeartHandshake, 
  PenTool, 
  Compass, 
  BookMarked, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Award, 
  BookOpen, 
  Globe2, 
  FileText, 
  ChevronRight,
  ArrowRight,
  Mail,
  Zap,
  HelpCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sứ Mạng Đóng Góp Bài Viết & Tri Thức Công Giáo | VERIDU',
  description: 'Gia nhập đội ngũ tác giả, học giả và giáo lý viên VERIDU. Cùng lan tỏa tri thức Thần học, Kinh Thánh và di sản văn hóa Công giáo đến hàng vạn độc giả.',
  alternates: {
    canonical: 'https://www.thapgia.com/dong-gop'
  }
};

export default function ContributePage() {
  const PILLARS = [
    {
      icon: BookOpen,
      title: 'Kho Tàng Chân Lý',
      desc: 'Mỗi bài viết là một đóng góp quý báu vào kho tàng tri thức Công giáo tiếng Việt, được biên soạn công phu và tra cứu chuẩn mực.'
    },
    {
      icon: ShieldCheck,
      title: 'Trung Thành Huấn Quyền',
      desc: 'Mọi tài liệu đều tuân thủ sự dẫn dắt của Huấn Quyền Hội Thánh (Magisterium), Sách Giáo Lý CCC và bản văn Kinh Thánh Công giáo chuẩn.'
    },
    {
      icon: Globe2,
      title: 'Lan Tỏa Không Giới Hạn',
      desc: 'Tiếp cận hàng vạn độc giả, giáo lý viên, học viên thần học và giới trẻ Công giáo tại Việt Nam cũng như hải ngoại.'
    },
    {
      icon: Award,
      title: 'Vinh Danh & Tác Quyền',
      desc: 'Tác giả sở hữu trang cá nhân riêng, được ghi nhận tác quyền, tích lũy điểm cống hiến và cấp huy hiệu Học Giả Xác Thực.'
    }
  ];

  const PROCESS_STEPS = [
    {
      step: '01',
      title: 'Chọn Đề Tài Hoặc Tự Khởi Tạo',
      desc: 'Bạn có thể chọn một đề tài từ Danh Mục Cần Thiết hoặc tự do khởi tạo một công trình nghiên cứu thần học, khảo cổ, suy niệm của riêng mình.'
    },
    {
      step: '02',
      title: 'Soạn Thảo Trực Quan Hoặc Nhập File',
      desc: 'Sử dụng Phòng Soạn Thảo WYSIWYG trực quan hoặc dán file HTML có sẵn. Hệ thống tự động tối ưu hóa hiển thị chuẩn Stained-Glass lộng lẫy.'
    },
    {
      step: '03',
      title: 'Thẩm Định Đức Tin & Bản Văn',
      desc: 'Ban Biên Tập đồng hành thẩm định tính chuẩn xác của trích dẫn Thánh Kinh, giáo lý CCC và hỗ trợ hiệu đính hoàn thiện.'
    },
    {
      step: '04',
      title: 'Xuất Bản & Chia Sẻ Toàn Cầu',
      desc: 'Bài viết được công bố chính thức, tối ưu hóa công cụ tìm kiếm (SEO Google) và lưu giữ vĩnh viễn trong Thư viện Tri thức VERIDU.'
    }
  ];

  const ROLES = [
    {
      title: 'Linh Mục & Tu Sĩ',
      desc: 'Chia sẻ các suy niệm phụng vụ, bài giảng lễ, giáo huấn luân lý và hướng dẫn đời sống thiêng liêng.'
    },
    {
      title: 'Học Giả & Giảng Viên Thần Học',
      desc: 'Đăng tải các khảo cứu chuyên sâu, chú giải bản văn Kinh Thánh, giáo phụ học và lịch sử công đồng.'
    },
    {
      title: 'Giáo Lý Viên & Huynh Trưởng',
      desc: 'Đóng góp giáo án giáo lý, truyện tranh Kinh Thánh, câu hỏi trắc nghiệm Quiz và phương pháp sư phạm đức tin.'
    },
    {
      title: 'Tín Hữu & Nhà Nghiên Cứu',
      desc: 'Chia sẻ kiến thức khảo cổ học Kinh Thánh, bối cảnh Cận Đông cổ đại, nghệ thuật thánh và lịch sử cứu độ.'
    }
  ];

  const PRIVILEGES = [
    'Hồ sơ tác giả chuyên nghiệp với danh mục công trình đã công bố',
    'Tích lũy điểm cống hiến Manna và nâng cấp huy hiệu Tác Giả',
    'Lan tỏa bài viết tới hàng chục ngàn độc giả trên toàn quốc và hải ngoại',
    'Bảo lưu 100% quyền nhân thân và quyền sở hữu trí tuệ',
    'Hỗ trợ công cụ nhúng Bản đồ 3D, Dòng thời gian và Thước đo lịch sử',
    'Nhận Giấy chứng nhận Đóng góp Tri thức từ Ban Quản Trị VERIDU'
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-5">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Chương Trình Đóng Góp Tri Thức VERIDU</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-tight mb-5">
            Cùng Nhau Xây Dựng <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Kho Tàng Tri Thức Công Giáo
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed mb-8">
            VERIDU kính mời các Linh mục, Tu sĩ, Học giả, Giáo lý viên và toàn thể Cộng đoàn Dân Chúa cùng tham gia biên soạn, đóng góp những bài viết nghiên cứu, khảo cổ và chú giải Kinh Thánh chất lượng cao vì vinh danh Chúa và mưu ích các linh hồn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dang-bai"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span>Bắt Đầu Viết Bài Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/noi-dung-can-thiet"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/50 font-serif font-bold text-sm transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Xem Đề Tài Cần Thiết</span>
            </Link>

            <Link
              href="/huong-dan-viet-bai"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/50 font-serif font-bold text-sm transition-all flex items-center gap-2"
            >
              <BookMarked className="w-4 h-4 text-amber-500" />
              <span>Quy Chuẩn Soạn Thảo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content Layout (Left 60% - Right 40%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: 60% (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. Sứ Mạng & 4 Trụ Cột */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500">
                  Tầm Nhìn &amp; Định Hướng
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)] mt-1">
                  Tại Sao Bạn Nên Đóng Góp Bài Viết?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif mt-2">
                  VERIDU là không gian nghiên cứu Công giáo độc lập, kết hợp công nghệ hiện đại với đức tin ngàn năm.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PILLARS.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-xs hover:border-amber-500/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3.5 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-base text-[var(--text-main)] mb-1.5">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Quy Trình 4 Bước Đóng Góp */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)]/60 border border-[var(--border-card)] space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                  Quy Trình 4 Bước Xuất Bản Bài Viết
                </h2>
              </div>

              <div className="space-y-4">
                {PROCESS_STEPS.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-start gap-4 transition-all hover:border-amber-500/30"
                  >
                    <div className="font-serif font-black text-2xl text-amber-500/40 shrink-0 w-8">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)] mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Đối Tượng Phù Hợp Đóng Góp */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500">
                  Cộng Đoàn Tác Giả
                </span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] mt-1">
                  Ai Có Thể Tham Gia?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif mt-1">
                  Mọi thành phần Dân Chúa mang trong mình lòng mến Chúa và tình yêu chân lý đều được chào đón.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map((role, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[var(--text-main)] mb-1">
                        {role.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 40% (lg:col-span-5) - STICKY ACTION PANEL */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            {/* Card 1: Author Privileges */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-amber-500/5 border border-amber-500/30 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                    Quyền Lợi Của Tác Giả
                  </h3>
                  <p className="text-[11px] text-amber-500 font-serif">
                    Được ghi nhận &amp; vinh danh xứng đáng
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {PRIVILEGES.map((priv, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-main)]">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{priv}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--border-card)] space-y-2.5">
                <Link
                  href="/dang-bai"
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Vào Phòng Soạn Thảo Ngay</span>
                </Link>

                <Link
                  href="/noi-dung-can-thiet"
                  className="w-full py-3 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/40 font-serif font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>Xem 8 Chuyên Mục Cần Bài Viết</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Quick Navigation Links */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Tài Liệu Cần Tham Khảo
              </h4>
              <div className="space-y-1.5">
                <Link
                  href="/huong-dan-viet-bai"
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-main)] hover:border-amber-500/50 border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-indigo-400" />
                    <span>Quy Chuẩn Soạn Thảo &amp; Khối HTML</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dieu-khoan-tac-gia"
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-main)] hover:border-amber-500/50 border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-4 h-4 text-rose-400" />
                    <span>Thỏa Thuận &amp; Điều Khoản Tác Giả</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 3: Editorial Contact / Support */}
            <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-500">
                <Mail className="w-4 h-4" />
                <span className="font-serif font-bold text-xs uppercase tracking-wider">Hỗ Trợ Ban Biên Tập</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Bạn có ý tưởng đề tài mới hoặc cần hỗ trợ chuyển đổi bản thảo Word/PDF sang HTML? Ban Biên Tập luôn sẵn sàng đồng hành:
              </p>
              <div className="pt-1">
                <a 
                  href="mailto:veridu.net@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 hover:underline"
                >
                  <span>veridu.net@gmail.com</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
