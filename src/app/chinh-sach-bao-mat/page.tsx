import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Shield, Lock, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Clock, ShieldAlert, Key, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật | VERIDU',
  description: 'Chính sách bảo mật quyền riêng tư và bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP của nền tảng VERIDU.',
};

export default function ChinhSachBaoMatPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 sm:pt-28 md:pt-36 pb-20 transition-colors duration-300">
      
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Bảo Vệ Dữ Liệu Cá Nhân
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[var(--text-main)] leading-tight">
            Chính Sách Bảo Mật Quyền Riêng Tư
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Cập nhật lần cuối: 24/08/2026
            </span>
            <span>•</span>
            <span>Tuân thủ Nghị định số 13/2023/NĐ-CP &amp; Luật An toàn thông tin mạng</span>
          </div>
        </header>

        {/* Content Body */}
        <article className="prose dark:prose-invert prose-amber max-w-none font-serif text-[var(--text-main)] leading-relaxed space-y-8 text-base sm:text-lg">
          
          {/* Section 1 - Core Non-Sensitive Data Statement */}
          <section className="p-6 sm:p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/30 shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-serif font-bold text-xl">
              <EyeOff className="w-6 h-6 text-emerald-500" />
              <span>1. Cam Kết Không Thu Thập Dữ Liệu Nhạy Cảm</span>
            </div>
            <div className="space-y-3 text-sm text-[var(--text-main)] leading-relaxed">
              <p>
                <strong>VERIDU TUYỆT ĐỐI KHÔNG THU THẬP, LƯU TRỮ HOẶC KHAI THÁC CÁC DỮ LIỆU CÁ NHÂN NHẠY CẢM</strong> theo quy định tại Điều 2 Nghị định 13/2023/NĐ-CP, bao gồm nhưng không giới hạn:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-1">
                <li className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Không thu thập quan điểm chính trị</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Không thu thập dữ liệu y tế, sức khỏe</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Không thu thập thông tin tài chính, ngân hàng</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Không định vị GPS thời gian thực</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Không thu thập dữ liệu sinh trắc học</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Không thương mại hóa dữ liệu cá nhân</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 - Disclaimer on Data Processing Liability */}
          <section className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 border border-amber-500/30 shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              <span>2. Tuyên Bố Miễn Trừ Trách Nhiệm Xử Lý Dữ Liệu</span>
            </div>
            <div className="space-y-3 text-sm text-[var(--text-main)] leading-relaxed">
              <p>
                <strong>VERIDU HOẠT ĐỘNG NHƯ NỀN TẢNG CHIA SẺ TRI THỨC MỤC VỤ VÀ KHÔNG CHỊU TRÁCH NHIỆM XỬ LÝ DỮ LIỆU CỦA BÊN THỨ BA:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5 text-xs text-[var(--text-muted)] leading-relaxed">
                <li>
                  Nền tảng được cung cấp trên cơ sở nguyên trạng (&ldquo;as is&rdquo;) nhằm phục vụ học tập đức tin Công giáo. Ban điều hành không chịu trách nhiệm pháp lý đối với bất kỳ sự cố rò rỉ dữ liệu nào xuất phát từ việc người dùng tự chia sẻ thông tin cá nhân của mình trên các diễn đàn công cộng hoặc do thiết bị đầu cuối của người dùng bị xâm nhập.
                </li>
                <li>
                  VERIDU không kiểm soát và không chịu trách nhiệm về chính sách bảo mật của các trang web liên kết bên ngoài (như YouTube, Google Drive, Facebook).
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 - What data is processed */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm font-black">3</span>
              <span>Dữ Liệu Kỹ Thuật Cơ Bản Được Thu Thập</span>
            </div>
            <div className="space-y-2.5 text-sm text-[var(--text-main)] leading-relaxed">
              <p>Nền tảng chỉ ghi nhận những thông tin kỹ thuật tối thiểu do bạn tự nguyện cung cấp để phục vụ trải nghiệm học tập:</p>
              <ul className="space-y-2 list-disc pl-5 text-xs text-[var(--text-muted)]">
                <li><strong>Thông tin tài khoản:</strong> Địa chỉ Email, Họ và tên / Tên Thánh hiển thị tự nguyện (dùng để đăng nhập và lưu tiến độ học tập).</li>
                <li><strong>Cấu hình giao diện:</strong> Tùy chọn Chế độ Sáng / Tối (lưu trữ trên trình duyệt của bạn qua LocalStorage).</li>
                <li><strong>Tiến trình học tập &amp; Điểm Quiz:</strong> Lưu trữ số điểm bài kiểm tra Giáo lý để hiển thị bảng xếp hạng học tập nội bộ.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 - Security Technologies */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <Lock className="w-6 h-6 text-amber-500" />
              <span>4. Biện Pháp An Toàn &amp; Bảo Mật Kỹ Thuật</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--text-muted)] list-disc pl-5 leading-relaxed">
              <li><strong>Mã hóa đầu cuối:</strong> 100% kết nối giữa người dùng và máy chủ VERIDU được mã hóa bằng chuẩn TLS 1.3 / HTTPS tiêu chuẩn cao.</li>
              <li><strong>Phân quyền CSDL cấp hàng (Row Level Security - RLS):</strong> Dữ liệu người dùng được bảo vệ nghiêm ngặt trên nền tảng Supabase, ngăn chặn truy cập trái phép.</li>
              <li><strong>Không sử dụng Cookie theo dõi quảng cáo:</strong> Nền tảng không chèn mã theo dõi hành vi quảng cáo của các bên thứ ba.</li>
            </ul>
          </section>

          {/* Section 5 - Data Subject Rights */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose font-sans">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">
              <UserCheck className="w-6 h-6 text-amber-500" />
              <span>5. Quyền Của Bạn Đối Với Dữ Liệu Cá Nhân</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Theo quy định của pháp luật Việt Nam, bạn có toàn quyền:
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--text-muted)] list-disc pl-5">
              <li>Xem, chỉnh sửa hoặc bổ sung thông tin tài khoản tại trang <Link href="/ho-so" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Hồ Sơ Cá Nhân</Link>.</li>
              <li>Yêu cầu xóa vĩnh viễn tài khoản và toàn bộ lịch sử học tập của bạn khỏi hệ thống bất kỳ lúc nào bằng cách gửi thư về email quản trị.</li>
            </ul>
          </section>

        </article>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-[var(--text-muted)]">
          <Link href="/dieu-khoan-su-dung" className="text-amber-600 dark:text-amber-400 hover:underline">
            → Xem Điều Khoản Sử Dụng Dịch Vụ
          </Link>
          <Link href="/" className="hover:text-[var(--text-main)]">
            Về Trang Chủ VERIDU
          </Link>
        </div>

      </div>
    </div>
  );
}
