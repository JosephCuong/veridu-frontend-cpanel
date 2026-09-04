import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AuthorCommunityNav from '@/components/AuthorCommunityNav';
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
  Cross
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đóng Góp Bài Viết & Tri Thức Công Giáo | VERIDU',
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
      desc: 'Tác giả sở hữu trang cá nhân riêng, được ghi nhận tác quyền, tích lũy điểm Manna và cấp huy hiệu Học Giả Xác Thực.'
    }
  ];

  const PROCESS_STEPS = [
    {
      step: '01',
      title: 'Chọn Đề Tài Hoặc Tự Khởi Tạo',
      desc: 'Bạn có thể chọn một đề tài từ Danh Mục Nội Dung Cần Thiết hoặc tự do phát triển một công trình nghiên cứu thần học, suy niệm Lời Chúa của riêng mình.'
    },
    {
      step: '02',
      title: 'Soạn Thảo Trực Quan & Nạp File',
      desc: 'Sử dụng Trình Soạn Thảo WYSIWYG trực quan của VERIDU, hoặc nạp file .html có sẵn. Hệ thống tự động trích xuất khối Lời Chúa, chú thích và tiêu đề.'
    },
    {
      step: '03',
      title: 'Thẩm Định Đức Tin & Bản Văn',
      desc: 'Ban Biên Tập cùng Hội Đồng Thần Học thẩm định tính chuẩn xác của trích dẫn Thánh Kinh, giáo lý CCC và quy chuẩn học thuật.'
    },
    {
      step: '04',
      title: 'Xuất Bản & Chia Sẻ Toàn Cầu',
      desc: 'Bài viết được gắn phong cách Stained-Glass lộng lẫy, tối ưu hóa công cụ tìm kiếm (Google SEO) và đưa vào thư viện vĩnh viễn.'
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
      title: 'Tín Hữu & Nhà Nghiên Cứu Độc Lập',
      desc: 'Chia sẻ kiến thức khảo cổ học Kinh Thánh, bối cảnh Cận Đông cổ đại, nghệ thuật thánh và lịch sử các thánh tích.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Community Sub-navigation */}
      <AuthorCommunityNav currentTab="contribute" />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-6">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Chương Trình Cộng Tác Tác Giả VERIDU</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-tight mb-6">
            Cùng Nhau Xây Dựng <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Kho Tàng Tri Thức Công Giáo
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed mb-10">
            VERIDU kính mời các Linh mục, Tu sĩ, Học giả, Giáo lý viên và toàn thể Cộng đoàn Dân Chúa cùng tham gia biên soạn, đóng góp những bài viết nghiên cứu, khảo cổ và chú giải Kinh Thánh chất lượng cao vì vinh danh Chúa và mưu ích các linh hồn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dang-bai"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2.5 hover:scale-105 active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span>Bắt Đầu Viết Bài Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/noi-dung-can-thiet"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/50 font-serif font-bold text-sm sm:text-base transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Xem Đề Tài Cần Viết</span>
            </Link>

            <Link
              href="/huong-dan-viet-bai"
              className="px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-card)] hover:border-amber-500/50 font-serif font-bold text-sm sm:text-base transition-all flex items-center gap-2"
            >
              <BookMarked className="w-4 h-4 text-amber-500" />
              <span>Quy Chuẩn Soạn Thảo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)] mb-3">
            Tại Sao Nên Viết Bài Cho VERIDU?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
            Nền tảng tri thức Công giáo độc lập, kết hợp công nghệ hiện đại với đức tin ngàn năm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 shadow-md hover:border-amber-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[var(--text-main)] mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Process */}
      <section className="border-y border-[var(--border-card)] bg-[var(--bg-card)]/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-amber-500 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quy Trình Nghiêm Ngặt</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              4 Bước Xuất Bản Bài Viết
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif mt-2">
              Mỗi tác phẩm đều được chăm chút kỹ lưỡng để đảm bảo chuẩn mực giáo lý và thẩm mỹ cao nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {PROCESS_STEPS.map((item, idx) => (
              <div key={idx} className="relative flex flex-col">
                <span className="font-serif font-black text-4xl sm:text-5xl text-amber-500/20 mb-3">
                  {item.step}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Contribute */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)] mb-3">
            Ai Có Thể Đóng Góp Bài Viết?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
            VERIDU đón nhận bài viết từ mọi thành phần Dân Chúa mang trong mình tinh thần phục vụ và tình yêu chân lý.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role, idx) => (
            <div 
              key={idx}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--text-main)] mb-2">
                  {role.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {role.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Legal & Theological Guarantee Banner */}
        <div className="mt-14 bg-gradient-to-r from-amber-500/10 via-[var(--bg-card)] to-indigo-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif font-bold text-xl text-[var(--text-main)] flex items-center justify-center md:justify-start gap-2">
              <Scale className="w-5 h-5 text-amber-500" />
              <span>Cam Kết Tác Quyền & Tuân Thủ Pháp Luật</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif max-w-2xl leading-relaxed">
              Mọi tác phẩm đăng tải trên VERIDU được bảo vệ bản quyền tác giả cá nhân, cấp phép lưu trữ phi thương mại, tuân thủ nghiêm ngặt Luật Tín ngưỡng Tôn giáo 2016 và Luật An ninh mạng Việt Nam.
            </p>
          </div>

          <Link
            href="/dieu-khoan-tac-gia"
            className="px-5 py-2.5 rounded-2xl bg-[var(--bg-main)] hover:border-amber-500 border border-[var(--border-card)] text-xs sm:text-sm font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition shrink-0 flex items-center gap-1.5"
          >
            <span>Đọc Điều Khoản Tác Giả</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick Action Footer Bar */}
      <section className="max-w-4xl mx-auto px-4 text-center mt-6">
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-2xl text-[var(--text-main)]">
            Bạn Đã Sẵn Sàng Chia Sẻ Tri Thức?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif max-w-xl mx-auto">
            Hãy bắt tay vào viết bài đầu tiên của bạn hoặc tham khảo danh mục các chủ đề đang rất cần sự đóng góp từ cộng đồng.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/dang-bai"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-serif font-bold shadow-lg shadow-amber-500/20 transition hover:scale-105"
            >
              Viết Bài Ngay
            </Link>
            <Link
              href="/noi-dung-can-thiet"
              className="px-6 py-3 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] text-sm font-serif font-bold transition"
            >
              Danh Mục Cần Thiết
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
