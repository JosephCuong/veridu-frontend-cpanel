import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Scale, ArrowLeft, Clock, ShieldCheck, BookOpen, 
  AlertCircle, CheckCircle2, FileText, Cross, Users
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều Khoản Sử Dụng | VERIDU',
  description: 'Quy định và điều khoản sử dụng website riêng của Nhóm Nghiên Cứu Công Giáo, Kinh Thánh Và Loan Báo Tin Mừng theo pháp luật Việt Nam.',
};

export default function DieuKhoanSuDungPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 md:pt-36 pb-24 transition-colors duration-300">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline bg-[var(--bg-card)] px-3.5 py-1.5 rounded-full border border-[var(--border-card)] shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Trang Chủ
        </Link>

        {/* Page Header */}
        <header className="space-y-4 text-center sm:text-left border-b border-[var(--border-card)] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Quy Chế Hoạt Động &amp; Pháp Lý
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[var(--text-main)] leading-tight">
            Điều Khoản Sử Dụng
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-amber-800 dark:text-amber-300 leading-relaxed">
            VERIDU là website riêng của Nhóm Nghiên Cứu Công Giáo, Kinh Thánh Và Loan Báo Tin Mừng.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-serif">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Cập nhật lần cuối: Tháng 09/2026
            </span>
            <span>•</span>
            <span>Tuân thủ quy định pháp luật của Nước CHXHCN Việt Nam</span>
          </div>
        </header>

        {/* Content Body */}
        <article className="space-y-8 font-serif leading-relaxed text-sm sm:text-base">
          
          {/* Mục 1: Bản chất & Tôn chỉ */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black">1</span>
              <span>Bản Chất Website &amp; Tôn Chỉ Hoạt Động</span>
            </div>
            <div className="space-y-2.5 text-[var(--text-main)] leading-relaxed">
              <p>
                <strong>VERIDU (thapgia.com)</strong> là website học thuật phi thương mại, phi lợi nhuận, được lập ra như một kênh thông tin nội bộ và chia sẻ học liệu của <strong>Nhóm Nghiên Cứu Công Giáo, Kinh Thánh Và Loan Báo Tin Mừng</strong>.
              </p>
              <p className="text-[var(--text-muted)]">
                Mục đích duy nhất của website là phục vụ việc nghiên cứu văn bản Kinh Thánh, đào sâu Giáo lý Công giáo, tìm hiểu lịch sử cứu độ và hỗ trợ các hoạt động loan báo Tin Mừng. Website <strong>không hoạt động kinh doanh</strong>, không bán hàng và không cung cấp dịch vụ thương mại thu phí.
              </p>
            </div>
          </section>

          {/* Mục 2: Căn cứ Pháp lý Việt Nam */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black">2</span>
              <span>Căn Cứ Pháp Lý &amp; Trách Nhiệm Tuân Thủ</span>
            </div>
            <div className="space-y-2.5 text-[var(--text-main)] leading-relaxed">
              <p>
                Mọi cá nhân khi truy cập, tham khảo tài liệu hoặc tham gia sinh hoạt học tập trên website đều phải tuân thủ nghiêm túc các quy định pháp luật hiện hành của Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm text-[var(--text-muted)]">
                <li><strong>Luật An ninh mạng số 24/2018/QH14:</strong> Tuyệt đối nghiêm cấm việc lợi dụng website để đăng tải, phát tán các thông tin chống phá Nhà nước, tuyên truyền bạo lực, xúc phạm danh dự nhân phẩm của tổ chức, cá nhân hoặc gây chia rẽ khối đại đoàn kết toàn dân tộc.</li>
                <li><strong>Luật Giao dịch điện tử số 20/2023/QH15:</strong> Tuân thủ đầy đủ quy tắc văn hóa ứng xử trên không gian mạng và bảo đảm tính toàn vẹn của các dữ liệu số hóa.</li>
                <li><strong>Luật Tín ngưỡng, tôn giáo số 02/2016/QH14:</strong> Tôn trọng quyền tự do tín ngưỡng, giữ gìn sự hòa hợp tôn giáo và chuẩn mực đạo đức xã hội.</li>
              </ul>
            </div>
          </section>

          {/* Mục 3: Bản quyền & Trích dẫn học thuật */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black">3</span>
              <span>Quy Định Bản Quyền &amp; Trích Dẫn Tài Liệu Học Thuật</span>
            </div>
            <div className="space-y-2.5 text-[var(--text-main)] leading-relaxed">
              <p>
                Các bản văn Kinh Thánh, sách Thần học, Giáo lý Hội Thánh Công Giáo (CCC) và tài liệu nghiên cứu trên website được tổng hợp và số hóa nhằm phục vụ mục đích học tập, trích dẫn học thuật phi thương mại theo <em>Luật Sở hữu trí tuệ Việt Nam</em>:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm text-[var(--text-muted)]">
                <li>Các bài khảo cứu, suy niệm do thành viên nhóm tự biên soạn thuộc quyền tác giả của chính tác giả đó và được bảo vệ theo quy định pháp luật.</li>
                <li>Người dùng được phép tham khảo, tải về phục vụ học tập cá nhân, giảng dạy giáo lý xứ đoàn; nghiêm cấm sao chép, tái bản hoặc sử dụng dữ liệu từ website vào mục đích kinh doanh thương mại khi chưa có sự đồng ý bằng văn bản.</li>
              </ul>
            </div>
          </section>

          {/* Mục 4: Tuyên bố miễn trừ trách nhiệm */}
          <section className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 border border-amber-500/30 shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-amber-500/20 pb-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>4. Tuyên Bố Miễn Trừ Trách Nhiệm</span>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
              <p>
                Website được vận hành trên tinh thần tự nguyện của Nhóm Nghiên Cứu. Chúng tôi luôn nỗ lực đối chiếu độ chính xác của các bản văn, tuy nhiên:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-[var(--text-muted)]">
                <li>Các tài liệu học thuật, ý kiến thảo luận và góc nhìn thần học phản ánh quan điểm nghiên cứu của từng cá nhân tác giả, không thay thế cho các văn kiện chính thức của Giáo quyền hay phán quyết của cơ quan có thẩm quyền.</li>
                <li>Nhóm Nghiên Cứu không chịu trách nhiệm đối với các gián đoạn kỹ thuật bất khả kháng từ phía nhà cung cấp hạ tầng máy chủ hoặc đường truyền Internet.</li>
              </ul>
            </div>
          </section>

          {/* Mục 5: Thay đổi và hiệu lực */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black">5</span>
              <span>Hiệu Lực &amp; Sửa Đổi Quy Định</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Nhóm Nghiên Cứu có quyền cập nhật, bổ sung các điều khoản này khi cần thiết nhằm đảm bảo luôn phù hợp với các văn bản pháp luật mới của Nước CHXHCN Việt Nam. Các thay đổi sẽ được công bố trực tiếp trên trang này và có hiệu lực ngay khi đăng tải.
            </p>
          </section>

        </article>

      </div>

    </div>
  );
}
