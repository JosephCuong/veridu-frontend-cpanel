import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Scale, 
  ShieldCheck, 
  BookOpen, 
  Copyright, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  PenTool,
  Compass,
  BookMarked,
  Shield,
  HeartHandshake
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thỏa Thuận & Điều Khoản Tác Giả | VERIDU',
  description: 'Quy định bản quyền, quyền sở hữu trí tuệ, cam kết chống đạo văn và trách nhiệm pháp lý dành cho tác giả cộng tác với nền tảng VERIDU.',
  alternates: {
    canonical: 'https://www.thapgia.com/dieu-khoan-tac-gia'
  }
};

export default function AuthorLegalTermsPage() {
  const SUMMARY_POINTS = [
    {
      icon: Copyright,
      title: 'Quyền Nhân Thân Thuộc Về Tác Giả',
      desc: 'Tác giả giữ 100% quyền đứng tên tác phẩm, tiểu sử và hình ảnh cá nhân. Tác giả được tự do xuất bản lại tác phẩm trên các ấn phẩm cá nhân khác.'
    },
    {
      icon: ShieldCheck,
      title: 'Giấy Phép Không Độc Quyền',
      desc: 'VERIDU được cấp quyền lưu trữ số hóa, định dạng giao diện Stained-Glass và phổ biến phi thương mại phục vụ cộng đoàn Dân Chúa.'
    },
    {
      icon: AlertCircle,
      title: 'Tuyệt Đối Không Đạo Văn',
      desc: 'Mọi đoạn trích dẫn, ý tưởng tham khảo phải được ghi rõ nguồn trong chú thích. Tác giả chịu trách nhiệm hoàn toàn về tính nguyên bản.'
    },
    {
      icon: Scale,
      title: 'Tuân Thủ Pháp Luật Việt Nam',
      desc: 'Chấp hành nghiêm chỉnh Luật Tín ngưỡng Tôn giáo 2016, Luật An ninh mạng, tôn trọng thuần phong mỹ tục và đoàn kết dân tộc.'
    }
  ];

  const SECTIONS = [
    {
      id: 'sec-1',
      title: 'Điều 1. Sứ Mạng Phi Lợi Nhuận & Tinh Thần Phục Vụ',
      desc: 'Nền tảng VERIDU được sáng lập và duy trì nhằm phục vụ công cuộc loan báo Tin Mừng, giáo dục đức tin và bảo tồn di sản tri thức Công giáo hoàn toàn phi lợi nhuận (Ad Majorem Dei Gloriam - Cho Vinh Quang Thiên Chúa Hơn). Mọi tài liệu và bài viết nghiên cứu được phổ biến miễn phí, công khai cho Cộng đoàn Dân Chúa khắp nơi nhằm mục đích học tập và suy niệm.'
    },
    {
      id: 'sec-2',
      title: 'Điều 2. Quyền Tác Giả & Giấy Phép Xuất Bản Phi Thương Mại',
      desc: 'Tác giả giữ toàn bộ quyền nhân thân đối với tác phẩm của mình (họ tên, bút danh, chức vị, tiểu sử và ảnh chân dung luôn được tôn trọng và hiển thị trang trọng trên bài viết). Bằng việc gửi bài lên VERIDU, tác giả cấp cho Ban Quản Trị giấy phép không độc quyền (non-exclusive), có phạm vi toàn cầu và vĩnh viễn để số hóa, tích hợp định dạng giao diện Stained-Glass, lưu trữ máy chủ và phân phối phi thương mại trên website cũng như các ứng dụng trực thuộc hệ sinh thái VERIDU.'
    },
    {
      id: 'sec-3',
      title: 'Điều 3. Cam Kết Tính Nguyên Bản & Tuyệt Đối Chống Đạo Văn',
      desc: 'Tác giả cam đoan bài viết là công trình do chính mình nghiên cứu, biên soạn hoặc chuyển ngữ hợp pháp. Mọi trích dẫn từ các tác phẩm thần học, giáo trình, bài báo khoa học hoặc văn kiện của Tòa Thánh phải được ghi rõ nguồn gốc trong phần Chú Thích Chân Trang (Footnotes) hoặc Tài Liệu Tham Khảo (Bibliography). VERIDU kiên quyết từ chối tiếp nhận và sẽ gỡ bỏ ngay lập tức bất kỳ bài viết nào có dấu hiệu sao chép, đạo văn trái phép.'
    },
    {
      id: 'sec-4',
      title: 'Điều 4. Sự Phù Hợp Tín Lý & Quyền Hiệu Đính Của Ban Biên Tập',
      desc: 'Mọi bài viết trước khi công bố chính thức đều trải qua quy trình thẩm định của Ban Biên Tập và Hội Đồng Thần Học VERIDU. Ban Biên Tập có quyền chỉnh sửa lỗi chính tả, ngắt câu, chuẩn hóa thuật ngữ giáo lý, định dạng các khối HTML chuẩn và tạo liên kết tra cứu Kinh Thánh. Ban Biên Tập có toàn quyền từ chối xuất bản hoặc gỡ bỏ bất kỳ bài viết nào đi ngược lại Huấn Quyền Hội Thánh (Magisterium), sai lệch Tín lý Công giáo hoặc có nguy cơ gây chia rẽ trong cộng đoàn.'
    },
    {
      id: 'sec-5',
      title: 'Điều 5. Tuân Thủ Pháp Luật Việt Nam & Trách Nhiệm Dân Sự',
      desc: 'Tác giả có nghĩa vụ tuân thủ nghiêm túc các quy định của Pháp luật Nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam, đặc biệt là Luật Tín ngưỡng, Tôn giáo (2016), Luật An ninh mạng (2018) và Luật Sở hữu trí tuệ. Tác giả tự chịu trách nhiệm pháp lý cá nhân về tính xác thực của các thông tin, tài liệu và phát ngôn của mình; bảo đảm không xâm phạm thuần phong mỹ tục, không kích động thù hằn tôn giáo hay phương hại đến an ninh quốc gia.'
    },
    {
      id: 'sec-6',
      title: 'Điều 6. Chính Sách Hình Ảnh, Media & Quyền Riêng Tư',
      desc: 'Hình ảnh, video, bản đồ hoặc sơ đồ nhúng trong bài viết phải thuộc phạm vi công cộng (Public Domain), do chính tác giả chụp/thiết kế, hoặc được cấp phép sử dụng phi thương mại có ghi rõ tác giả gốc. Không sử dụng hình ảnh mang tính thương mại hoặc xâm phạm quyền riêng tư của cá nhân khi chưa có sự đồng thuận.'
    }
  ];

  const FAQS = [
    {
      q: 'Tôi có thể đăng bài viết này ở nơi khác (blog cá nhân, tạp chí) sau khi đã đăng trên VERIDU không?',
      a: 'Hoàn toàn được. Bạn giữ quyền sở hữu trí tuệ cá nhân của mình. VERIDU chỉ giữ giấy phép không độc quyền để phổ biến tác phẩm. Chúng tôi khuyến khích bạn ghi chú thêm: "Tác phẩm đã được công bố trên Thư viện Công giáo VERIDU".'
    },
    {
      q: 'Bài viết của tôi sau khi gửi mất bao lâu để được xét duyệt?',
      a: 'Ban Biên Tập và Hội Đồng Thần Học thường thẩm định và hỗ trợ hiệu đính bài viết trong vòng 24 đến 48 giờ làm việc. Bạn có thể theo dõi trực tiếp trạng thái duyệt bài trong trang Hồ Sơ Tác Giả.'
    },
    {
      q: 'Nếu tôi muốn rút bài hoặc chỉnh sửa bài viết đã xuất bản thì làm thế nào?',
      a: 'Bạn có thể chỉnh sửa nội dung bất kỳ lúc nào thông qua nút "Chỉnh Sửa Bài Viết". Nếu muốn gỡ bỏ hoàn toàn bài viết, bạn chỉ cần gửi yêu cầu qua email ban biên tập veridu.net@gmail.com, chúng tôi sẽ xử lý trong vòng 48 giờ.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Thỏa Thuận Bản Quyền &amp; Trách Nhiệm Tác Quyền</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Điều Khoản &amp; Điều Kiện Tác Giả
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Quy định minh bạch về quyền tác giả, cam kết học thuật, tôn trọng Huấn Quyền Hội Thánh và chấp hành pháp luật hiện hành khi tham gia đóng góp cho VERIDU.
          </p>
        </div>
      </section>

      {/* Main 2-Column Content Layout (Sidebar 35% - Legal Text 65%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 35% (lg:col-span-5) - STICKY SUMMARY CARDS */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            {/* Quick Summary Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-amber-500/5 border border-amber-500/30 shadow-md space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-base text-[var(--text-main)]">
                  Tóm Tắt Nhanh Thỏa Thuận
                </h3>
              </div>

              <div className="space-y-4 pt-1">
                {SUMMARY_POINTS.map((point, idx) => {
                  const Icon = point.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] mb-0.5">
                          {point.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                          {point.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Author Moral Pledge Card */}
            <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <HeartHandshake className="w-4 h-4" />
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider">
                  Cam Kết Đạo Đức Tác Giả
                </h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif italic">
                &ldquo;Mọi tác phẩm biên soạn đều xuất phát từ lòng yêu mến Thiên Chúa, tinh thần phụng sự Giáo Hội và thiện chí xây dựng sự hiểu biết chân thật giữa mọi người.&rdquo;
              </p>
            </div>

            {/* Action Quick Links */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2.5">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                Tiếp Tục Hành Trình
              </span>

              <Link
                href="/dang-bai"
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Tôi Đã Hiểu &amp; Bắt Đầu Viết Bài</span>
              </Link>

              <Link
                href="/huong-dan-viet-bai"
                className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                <span>Xem Quy Chuẩn Soạn Thảo</span>
              </Link>

              <Link
                href="/noi-dung-can-thiet"
                className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-500" />
                <span>Xem Đề Tài Cần Thiết</span>
              </Link>
            </div>

          </aside>

          {/* RIGHT COLUMN: 65% (lg:col-span-7) - FULL LEGAL ARTICLES & FAQ */}
          <main className="lg:col-span-7 space-y-8">
            
            {/* 6 Legal Articles */}
            <div className="space-y-4">
              {SECTIONS.map((sec) => (
                <article 
                  key={sec.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2 hover:border-amber-500/30 transition-all"
                >
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] text-amber-600 dark:text-amber-400">
                    {sec.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
                    {sec.desc}
                  </p>
                </article>
              ))}
            </div>

            {/* Legal FAQs */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-7 space-y-5">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Giải Đáp Thắc Mắc Pháp Lý &amp; Tác Quyền</span>
              </h3>

              <div className="space-y-3 pt-1">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1.5">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">
                      {faq.q}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Confirmation Banner */}
            <div className="text-center p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
                Bạn Đã Đọc Kỹ Và Đồng Thuận Với Các Điều Khoản Trên?
              </h4>
              <p className="text-xs text-[var(--text-muted)] font-serif max-w-md mx-auto">
                Bằng cách gửi tác phẩm lên hệ thống, bạn xác nhận đã đọc, hiểu rõ và tự nguyện chấp hành các điều khoản này.
              </p>
              <div className="pt-2">
                <Link
                  href="/dang-bai"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Tiến Vào Phòng Soạn Thảo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </main>

        </div>
      </section>
    </div>
  );
}
