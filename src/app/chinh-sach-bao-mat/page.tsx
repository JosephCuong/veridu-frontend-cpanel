import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Shield, ArrowLeft, Clock, EyeOff, Lock, 
  CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Key
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật | VERIDU',
  description: 'Chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP của website riêng Nhóm Nghiên Cứu Công Giáo, Kinh Thánh Và Loan Báo Tin Mừng VERIDU.',
};

export default function ChinhSachBaoMatPage() {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-serif font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Bảo Vệ Dữ Liệu Cá Nhân
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[var(--text-main)] leading-tight">
            Chính Sách Bảo Mật Quyền Riêng Tư
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-amber-800 dark:text-amber-300 leading-relaxed">
            VERIDU là website riêng của Nhóm Nghiên Cứu Công Giáo, Kinh Thánh Và Loan Báo Tin Mừng.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-serif">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Cập nhật lần cuối: Tháng 09/2026
            </span>
            <span>•</span>
            <span>Tuân thủ Nghị định số 13/2023/NĐ-CP &amp; Luật An toàn thông tin mạng</span>
          </div>
        </header>

        {/* Content Body */}
        <article className="space-y-8 font-serif leading-relaxed text-sm sm:text-base">
          
          {/* Mục 1: Cam kết không thu thập dữ liệu nhạy cảm */}
          <section className="p-6 sm:p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/30 shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-serif font-black text-lg sm:text-xl border-b border-emerald-500/20 pb-2">
              <EyeOff className="w-5 h-5 text-emerald-500" />
              <span>1. Cam Kết Không Thu Thập Dữ Liệu Cá Nhân Nhạy Cảm</span>
            </div>
            <div className="space-y-3 text-[var(--text-main)]">
              <p>
                Căn cứ theo <strong>Điều 2 Nghị định số 13/2023/NĐ-CP</strong> của Chính phủ Nước CHXHCN Việt Nam về Bảo vệ dữ liệu cá nhân, <strong>VERIDU cam kết TUYỆT ĐỐI KHÔNG thu thập, không phân tích, không lưu trữ và không thương mại hóa</strong> bất kỳ thông tin nhạy cảm nào sau đây:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Không thu thập quan điểm chính trị</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Không thu thập thông tin y tế, bệnh án</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Không thu thập tài khoản ngân hàng, tài chính</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Không thu thập định vị vị trí thời gian thực (GPS)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Không thu thập dữ liệu sinh trắc học cá nhân</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Không bán hoặc trao đổi dữ liệu cho bên thứ ba</span>
                </div>
              </div>
            </div>
          </section>

          {/* Mục 2: Dữ liệu kỹ thuật tối thiểu được ghi nhận */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black">2</span>
              <span>Dữ Liệu Kỹ Thuật Tối Thiểu Do Người Dùng Tự Nguyện Cung Cấp</span>
            </div>
            <div className="space-y-2.5 text-[var(--text-main)] leading-relaxed">
              <p>
                Website chỉ lưu trữ các thông tin kỹ thuật cơ bản do chính người dùng tự nguyện nhập khi tạo tài khoản học tập:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm text-[var(--text-muted)]">
                <li><strong>Địa chỉ Email:</strong> Dùng để xác thực quyền đăng nhập tài khoản và khôi phục mật khẩu.</li>
                <li><strong>Tên hiển thị &amp; Tên Thánh:</strong> Dùng để xưng hô trang trọng và in lên Chứng Chỉ Khóa Học khi hoàn thành bài học.</li>
                <li><strong>Giáo xứ &amp; Giáo phận (Tự chọn):</strong> Giúp cá nhân hóa trải nghiệm sinh hoạt tôn giáo địa phương.</li>
                <li><strong>Tiến trình học tập &amp; Điểm EXP/Mana:</strong> Lưu trữ số điểm bài kiểm tra Giáo lý và tiến độ đọc Kinh Thánh phục vụ cá nhân theo dõi sự tiến bộ của bản thân.</li>
              </ul>
            </div>
          </section>

          {/* Mục 3: Quyền của Chủ Thể Dữ Liệu */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black">3</span>
              <span>Quyền Của Chủ Thể Dữ Liệu (Theo Điều 9 Nghị Định 13/2023)</span>
            </div>
            <div className="space-y-2.5 text-[var(--text-main)] leading-relaxed">
              <p>
                Người dùng hoàn toàn có toàn quyền kiểm soát dữ liệu cá nhân của mình trên hệ thống:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm text-[var(--text-muted)]">
                <li><strong>Quyền xem và chỉnh sửa:</strong> Bạn có thể chủ động thay đổi Tên Thánh, Họ Tên, Giáo xứ hoặc Ảnh đại diện bất kỳ lúc nào tại trang <Link href="/ho-so" className="text-amber-600 font-bold underline">Hồ Sơ Cá Nhân</Link>.</li>
                <li><strong>Quyền yêu cầu xóa bỏ dữ liệu:</strong> Bạn có quyền yêu cầu xóa hoàn toàn tài khoản và lịch sử học tập khỏi cơ sở dữ liệu của chúng tôi.</li>
                <li><strong>Quyền phản đối xử lý dữ liệu:</strong> Bạn có thể ngừng sử dụng dịch vụ hoặc hủy đăng ký nhận email bản tin bất kỳ lúc nào.</li>
              </ul>
            </div>
          </section>

          {/* Mục 4: Bảo đảm an toàn an ninh mạng */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg space-y-3.5">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-[var(--border-card)] pb-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <span>4. Biện Pháp Bảo Đảm An Toàn Thông Tin</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Hệ thống áp dụng các tiêu chuẩn mã hóa SSL/TLS 256-bit trong mọi giao dịch truyền nhận dữ liệu, mật khẩu được băm (hashing) bảo mật qua cơ chế của Supabase Auth, và thiết lập tường lửa ngăn chặn các cuộc tấn công mạng nhằm bảo vệ an toàn thông tin theo <em>Luật An toàn thông tin mạng số 86/2015/QH13</em>.
            </p>
          </section>

          {/* Mục 5: Thông tin liên hệ */}
          <section className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 border border-amber-500/30 shadow-lg space-y-3">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-serif font-black text-lg sm:text-xl border-b border-amber-500/20 pb-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>5. Thông Tin Liên Hệ Nhóm Nghiên Cứu</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
              Mọi câu hỏi, yêu cầu tra soát hoặc khiếu nại liên quan đến chính sách bảo vệ dữ liệu cá nhân, vui lòng liên hệ với Ban Điều Hành <strong>Nhóm Nghiên Cứu Công Giáo, Kinh Thánh Và Loan Báo Tin Mừng VERIDU</strong> qua hòm thư điện tử: <span className="font-mono font-bold text-amber-700 dark:text-amber-400">veridu.net@gmail.com</span>.
            </p>
          </section>

        </article>

      </div>

    </div>
  );
}
