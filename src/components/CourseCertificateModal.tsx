'use client';

import React, { useRef } from 'react';
import { X, Download, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

export interface CertificateData {
  id?: string;
  courseTitle: string;
  courseSlug?: string;
  recipientName: string;
  christianName?: string;
  certificateCode: string;
  issuedAt: string;
  instructorName?: string;
}

interface CourseCertificateModalProps {
  certificate: CertificateData | null;
  onClose: () => void;
}

export default function CourseCertificateModal({
  certificate,
  onClose
}: CourseCertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      
      <div className="relative w-full max-w-4xl bg-[#fbf9f4] text-[#1c1917] rounded-3xl border-8 border-[#d4af37]/80 shadow-2xl p-6 sm:p-12 overflow-hidden my-auto">
        
        {/* Action Controls Header */}
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden z-10">
          <button
            type="button"
            onClick={handlePrint}
            title="In hoặc Lưu PDF"
            className="p-2 rounded-xl bg-amber-900 text-amber-100 hover:bg-amber-800 transition flex items-center gap-1.5 text-xs font-serif font-bold shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">In / Tải PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SACRED PARCHMENT CERTIFICATE TEMPLATE ── */}
        <div 
          ref={printRef}
          className="relative border-4 border-double border-[#b8860b] p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#fffefc] to-[#f7f2e7] text-center space-y-6 shadow-inner"
        >
          
          {/* Header Tagline & Brand */}
          <div className="space-y-1.5 border-b-2 border-[#d4af37]/50 pb-4">
            <div className="font-serif text-[11px] tracking-[0.35em] uppercase font-bold text-[#8b6508]">
              VIA · VITA · VERITAS — HỌC VIỆN THÁNH KINH &amp; THẦN HỌC
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#3e2723] tracking-tight uppercase">
              CHỨNG CHỈ TỐT NGHIỆP
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-[#795548]">
              Chứng nhận hoàn thành trọn vẹn chương trình đào tạo đức tin trực tuyến
            </p>
          </div>

          {/* Recipient Section */}
          <div className="py-4 space-y-2">
            <p className="font-serif text-xs uppercase tracking-widest text-[#8d6e63]">
              Chứng chỉ này được long trọng trao tặng cho
            </p>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-[#b8860b] drop-shadow-xs">
              {certificate.christianName ? `${certificate.christianName} ` : ''}{certificate.recipientName}
            </h2>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto my-2" />
            <p className="font-serif text-sm sm:text-base text-[#4e342e] max-w-2xl mx-auto leading-relaxed">
              Đã hoàn thành xuất sắc tất cả các bài giảng, chuyên đề khảo cứu và vượt qua kỳ thẩm định tri thức của khóa học:
            </p>
            <h3 className="font-serif font-black text-lg sm:text-2xl text-[#2e1c0c] pt-1">
              « {certificate.courseTitle} »
            </h3>
          </div>

          {/* Footer: Seals & Signatures */}
          <div className="pt-6 border-t border-[#d4af37]/40 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs font-serif">
            
            {/* Left: Code & Date */}
            <div className="text-left space-y-1 text-[#5d4037]">
              <div><span className="font-bold">Mã Xác Thực:</span> <span className="font-mono">{certificate.certificateCode}</span></div>
              <div><span className="font-bold">Ngày Cấp:</span> {certificate.issuedAt}</div>
              <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đã Xác Thực Trên Hệ Thống</span>
              </div>
            </div>

            {/* Center: Red Wax Embossed Seal (Triện Đỏ VERIDU) */}
            <div className="flex justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#c62828] via-[#b71c1c] to-[#7f0000] border-4 border-[#ffcdd2] flex flex-col items-center justify-center text-white shadow-xl shadow-red-950/40 p-2 transform rotate-[-6deg]">
                <span className="text-[9px] font-serif uppercase tracking-widest font-black">VERIDU</span>
                <span className="text-xl sm:text-2xl font-serif">✝</span>
                <span className="text-[8px] font-serif uppercase font-bold tracking-tighter">TRIỆN CHỨNG THỰC</span>
              </div>
            </div>

            {/* Right: Signature */}
            <div className="text-right space-y-1 text-[#5d4037]">
              <div className="font-bold italic">Ban Điều Hành Học Viện VERIDU</div>
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic font-black text-sm text-[#8b0000] underline">Veridu Academica</span>
              </div>
              <div className="text-[11px] text-[#8d6e63]">Chủ Tịch Hội Đồng Đào Tạo</div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
