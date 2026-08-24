import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, FileText, Scale, ArrowLeft, Cross, CheckCircle2, AlertTriangle, BookOpen, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều Khoản Sử Dụng | VERIDU',
  description: 'Điều khoản dịch vụ và quy định sử dụng nền tảng học tập, nghiên cứu Công giáo VERIDU theo pháp luật Việt Nam.',
};

export default function DieuKhoanSuDungPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 md:pt-36 pb-20 transition-colors duration-300">
      
      {/* Decorative Glow */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline bg-[var(--bg-card)] px-3.5 py-1.5 rounded-full border border-[var(--border-card)] shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Trang Chủ
        </Link>

        {/* Page Header */}
        <header className="space-y-4 text-center sm:text-left border-b border-[var(--border-card)] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Quy Định &amp; Pháp Lý Nền Tảng
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[var(--text-main)] leading-tight">
            Điều Khoản Sử Dụng Dịch Vụ
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Cập nhật lần cuối: 24/08/2026
            </span>
            <span>•</span>
            <span>Áp dụng theo pháp luật hiện hành của Nước CHXHCN Việt Nam</span>
          </div>
        </header>

        {/* Content Body */}
        <article className="prose dark:prose-invert prose-amber max-w-none font-serif text-[var(--text-main)] leading-relaxed space-y-8 text-base sm:text-lg">
          
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm font-black">1</span>
              <span>Giới Thiệu &amp; Mục Đích Nền Tảng</span>
            </div>
            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              <strong>VERIDU (thapgia.com)</strong> là một nền tảng số hóa phi thương mại, được xây dựng nhằm phục vụ mục đích nghiên cứu, học tập, tra cứu Kinh Thánh, Thần học, Lịch sử Giáo hội và Giáo lý Công giáo. Khi truy cập hoặc sử dụng bất kỳ tính năng nào trên nền tảng, bạn đồng ý tuân thủ toàn bộ các điều khoản và quy định được nêu tại văn bản này.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm font-black">2</span>
              <span>Quyền &amp; Nghĩa Vụ Của Người Dùng</span>
            </div>
            <ul className="space-y-2.5 text-sm text-[var(--text-main)] list-disc pl-5 leading-relaxed">
              <li>
                <strong>Tuân thủ pháp luật:</strong> Người dùng cam kết sử dụng nền tảng đúng quy định của <em>Luật An ninh mạng số 24/2018/QH14</em>, <em>Luật Giao dịch điện tử số 20/2023/QH15</em> và các văn bản pháp luật hiện hành của Việt Nam.
              </li>
              <li>
                <strong>Chuẩn mực đạo đức:</strong> Nghiêm cấm mọi hành vi lợi dụng nền tảng để đăng tải, phát tán các nội dung chống phá, xuyên tạc tôn giáo, kích động bạo lực, chia rẽ đoàn kết dân tộc hoặc vi phạm thuần phong mỹ tục.
              </li>
              <li>
                <strong>Bảo mật tài khoản:</strong> Bạn có trách nhiệm tự bảo quản thông tin đăng nhập cá nhân và chịu trách nhiệm cho các hoạt động phát sinh từ tài khoản của mình.
              </li>
            </ul>
          </section>

          {/* Section 3 - Core Disclaimer */}
          <section className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 border border-amber-500/30 shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <span>Tuyên Bố Miễn Trừ Trách Nhiệm Xử Lý Dữ Liệu</span>
            </div>
            <div className="space-y-3 text-sm text-[var(--text-main)] leading-relaxed">
              <p>
                <strong>VERIDU KHÔNG THU THẬP DỮ LIỆU NHẠY CẢM VÀ KHÔNG CHỊU TRÁCH NHIỆM XỬ LÝ DỮ LIỆU:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5 text-[var(--text-muted)]">
                <li>VERIDU là nền tảng mở chia sẻ tài nguyên học tập cộng đồng. Ban quản trị không đóng vai trò là cơ quan xử lý dữ liệu thương mại hay cung cấp dịch vụ viễn thông công cộng.</li>
                <li>Nền tảng tuyệt đối <strong>không thu thập, không phân tích và không thương mại hóa</strong> bất kỳ thông tin cá nhân nhạy cảm nào của người dùng.</li>
                <li>Mọi dữ liệu hoặc tệp tin do người dùng tự nguyện tải lên (bao gồm file HTML, hình ảnh minh họa) hoàn toàn do người dùng chịu trách nhiệm về bản quyền và tính hợp pháp.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm font-black">4</span>
              <span>Quyền Sở Hữu Trí Tuệ &amp; Bản Quyền</span>
            </div>
            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              Các bản dịch Kinh Thánh, văn kiện Huấn Quyền Giáo Hội, bài giảng và tài liệu học tập được chia sẻ trên VERIDU nhằm mục đích học hỏi đức tin và truyền bá Tin Mừng phi lợi nhuận. Người dùng khi trích dẫn tài liệu cần nêu rõ nguồn gốc hoặc tôn trọng quyền tác giả của các dịch giả/nhà xuất bản tương ứng.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm font-black">5</span>
              <span>Sửa Đổi &amp; Liên Hệ Giải Quyết Khiếu Nại</span>
            </div>
            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              VERIDU có quyền cập nhật, sửa đổi các điều khoản này vào bất kỳ lúc nào để phù hợp với quy định pháp luật và hoạt động của nền tảng. Mọi ý kiến đóng góp hoặc thắc mắc pháp lý xin vui lòng gửi về hòm thư điện tử: <strong className="text-amber-600 dark:text-amber-400">lienhe@thapgia.com</strong> hoặc <strong className="text-amber-600 dark:text-amber-400">veridu.net@gmail.com</strong>.
            </p>
          </section>

        </article>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-[var(--text-muted)]">
          <Link href="/chinh-sach-bao-mat" className="text-amber-600 dark:text-amber-400 hover:underline">
            → Xem Chính Sách Bảo Mật Quyền Riêng Tư
          </Link>
          <Link href="/" className="hover:text-[var(--text-main)]">
            Về Trang Chủ VERIDU
          </Link>
        </div>

      </div>
    </div>
  );
}
