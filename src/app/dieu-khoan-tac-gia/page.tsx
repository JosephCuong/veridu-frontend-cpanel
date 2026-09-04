import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AuthorCommunityNav from '@/components/AuthorCommunityNav';
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
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều Khoản & Thỏa Thuận Tác Giả | VERIDU',
  description: 'Quy định bản quyền, quyền sở hữu trí tuệ, cam kết chống đạo văn và trách nhiệm pháp lý dành cho tác giả cộng tác với nền tảng VERIDU.',
  alternates: {
    canonical: 'https://www.thapgia.com/dieu-khoan-tac-gia'
  }
};

export default function AuthorLegalTermsPage() {
  const SECTIONS = [
    {
      id: 'sec-1',
      title: '1. Sứ Mạng Phi Lợi Nhuận & Tinh Thần Phục Vụ',
      desc: 'Nền tảng VERIDU được xây dựng nhằm phục vụ công cuộc loan báo Tin Mừng, giáo dục đức tin và bảo tồn di sản tri thức Công giáo hoàn toàn phi lợi nhuận (Ad Majorem Dei Gloriam - Cho Vinh Quang Thiên Chúa Hơn). Mọi tài liệu và bài viết được phổ biến miễn phí cho Cộng đoàn Dân Chúa khắp nơi.'
    },
    {
      id: 'sec-2',
      title: '2. Quyền Tác Giả & Giấy Phép Xuất Bản',
      desc: 'Tác giả giữ toàn bộ quyền nhân thân đối với tác phẩm của mình (tên tác giả, tiểu sử và hình ảnh luôn được tôn trọng và hiển thị trang trọng trên bài viết). Khi gửi bài lên VERIDU, tác giả cấp cho nền tảng giấy phép không độc quyền (non-exclusive), toàn cầu và vĩnh viễn để số hóa, định dạng giao diện Stained-Glass, lưu trữ máy chủ và phân phối phi thương mại trên website cũng như các ứng dụng trực thuộc VERIDU.'
    },
    {
      id: 'sec-3',
      title: '3. Cam Kết Tính Nguyên Bản & Tuyệt Đối Không Đạo Văn',
      desc: 'Tác giả cam kết bài viết là công trình do chính mình nghiên cứu, biên soạn hoặc dịch thuật hợp pháp. Mọi trích dẫn từ các tác phẩm thần học, sách xuất bản, bài báo khoa học hoặc văn kiện của Tòa Thánh phải được ghi rõ nguồn trong phần Chú Thích Chân Trang (Footnotes) hoặc Tài Liệu Tham Khảo (Bibliography). VERIDU kiên quyết từ chối và gỡ bỏ mọi bài viết có hành vi sao chép trái phép.'
    },
    {
      id: 'sec-4',
      title: '4. Sự Phù Hợp Tín Lý & Quyền Hiệu Đính Của Ban Biên Tập',
      desc: 'Mọi bài viết trước khi xuất bản chính thức phải trải qua quy trình thẩm định của Ban Biên Tập và Hội Đồng Thần Học VERIDU. Ban Biên Tập có quyền chỉnh sửa lỗi chính tả, chuẩn hóa văn phong, định dạng lại các thẻ HTML và chèn liên kết đối chiếu Kinh Thánh. Ban Biên Tập có toàn quyền từ chối xuất bản hoặc gỡ bỏ bất kỳ nội dung nào đi ngược lại Huấn Quyền Hội Thánh (Magisterium), sai lệch Tín điều hoặc gây chia rẽ trong Giáo Hội.'
    },
    {
      id: 'sec-5',
      title: '5. Tuân Thủ Pháp Luật Việt Nam & An Ninh Thông Tin',
      desc: 'Tác giả có trách nhiệm tuân thủ nghiêm túc các quy định của Pháp luật Nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam, đặc biệt là Luật Tín ngưỡng, Tôn giáo (2016), Luật An ninh mạng (2018) và Luật Sở hữu trí tuệ. Tác giả tự chịu trách nhiệm pháp lý cá nhân về tính xác thực của các dữ liệu, tài liệu và phát ngôn của mình; bảo đảm không xâm phạm thuần phong mỹ tục, không kích động thù hằn tôn giáo hay phương hại đến an ninh quốc gia.'
    },
    {
      id: 'sec-6',
      title: '6. Chính Sách Hình Ảnh & Tài Liệu Đính Kèm',
      desc: 'Hình ảnh, video, bản đồ hoặc sơ đồ nhúng trong bài viết phải thuộc phạm vi công cộng (Public Domain), do chính tác giả chụp/thiết kế, hoặc được cấp phép sử dụng phi thương mại có ghi rõ tác giả gốc. Tránh sử dụng hình ảnh thương mại có bản quyền nghiêm ngặt mà chưa được cấp phép.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Community Sub-navigation */}
      <AuthorCommunityNav currentTab="legal-terms" />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Thỏa Thuận Bản Quyền & Trách Nhiệm Tác Quyền</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Điều Khoản & Điều Kiện Tác Giả
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Quy định rõ ràng về quyền tác giả, cam kết học thuật, tôn trọng Huấn Quyền Hội Thánh và tuân thủ pháp luật hiện hành khi tham gia đóng góp cho VERIDU.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Core Principles Callout */}
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-amber-500">
              Nguyên Tắc Cốt Lõi: Tôn Trọng Tác Quyền & Đồng Hành Cùng Giáo Hội
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
              VERIDU tôn vinh công sức nghiên cứu của mỗi cộng tác viên, đồng thời giữ vững trách nhiệm bảo vệ sự tinh tuyền của Đức Tin Công giáo và sự thượng tôn pháp luật.
            </p>
          </div>
        </div>

        {/* 6 Legal Sections */}
        <div className="space-y-6">
          {SECTIONS.map((sec) => (
            <div 
              key={sec.id}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3"
            >
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                {sec.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
                {sec.desc}
              </p>
            </div>
          ))}
        </div>

        {/* FAQ Quick Notes */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <span>Câu Hỏi Thường Gặp Của Tác Giả</span>
          </h3>

          <div className="space-y-3 pt-2 text-xs sm:text-sm font-serif text-[var(--text-muted)]">
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
              <strong className="text-[var(--text-main)] block mb-1">
                Tôi có thể đăng bài viết này ở nơi khác (blog cá nhân, tạp chí) sau khi đã đăng trên VERIDU không?
              </strong>
              <span>
                Hoàn toàn được. Bạn giữ quyền tác giả cá nhân của mình. VERIDU chỉ giữ quyền không độc quyền để phổ biến tác phẩm. Chúng tôi khuyến khích bạn ghi chú thêm: "Tác phẩm đã được xuất bản trên Thư viện Công giáo VERIDU".
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
              <strong className="text-[var(--text-main)] block mb-1">
                Bài viết của tôi sau khi gửi mất bao lâu để được xét duyệt?
              </strong>
              <span>
                Ban Biên Tập và Hội Đồng Thần Học thường thẩm định bài viết trong vòng 24 đến 48 giờ làm việc. Bạn có thể theo dõi tiến độ duyệt bài trực tiếp trong trang Dashboard Tác Giả (/tac-gia/dashboard).
              </span>
            </div>
          </div>
        </div>

        {/* Footer Navigation CTA */}
        <div className="text-center pt-6">
          <Link
            href="/dang-bai"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs sm:text-sm shadow-md transition"
          >
            <span>Tôi Đã Hiểu & Muốn Bắt Đầu Viết Bài</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
