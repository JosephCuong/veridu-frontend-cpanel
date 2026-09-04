'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthorCommunityNav from '@/components/AuthorCommunityNav';
import { 
  BookMarked, 
  ShieldCheck, 
  Scale, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  PenTool, 
  ChevronRight, 
  ScrollText, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  FileCode2,
  Eye
} from 'lucide-react';

interface SnippetItem {
  id: string;
  name: string;
  desc: string;
  category: string;
  code: string;
  previewHtml: string;
}

const SNIPPETS_DATA: SnippetItem[] = [
  {
    id: 'scripture',
    name: 'Khối Lời Chúa Soi Đường (Sacred Scripture Callout)',
    desc: 'Dùng để trích dẫn câu Lời Chúa cốt lõi của bài viết, có huy hiệu tra cứu và trích dẫn chuẩn phụng vụ.',
    category: 'Kinh Thánh',
    code: `<div class="sacred-scripture veridu-scripture-quote">
  <div class="scripture-badge">
    <span>✝ Lời Chúa</span>
    <a href="/kinh-thanh/ga/3" target="_blank" class="scripture-ref-link">Ga 3:30 ↗</a>
  </div>
  <blockquote class="scripture-verse">
    "Người phải lớn lên, còn thầy phải nhỏ lại."
  </blockquote>
  <p class="scripture-citation">Tin Mừng theo Thánh Gioan</p>
</div>`,
    previewHtml: `<div class="sacred-scripture veridu-scripture-quote my-3">
  <div class="scripture-badge">
    <span>✝ Lời Chúa</span>
    <span class="scripture-ref-link text-amber-500 font-bold">Ga 3:30 ↗</span>
  </div>
  <blockquote class="scripture-verse italic text-base my-2">
    "Người phải lớn lên, còn thầy phải nhỏ lại."
  </blockquote>
  <p class="scripture-citation text-xs text-[var(--text-muted)]">— Tin Mừng theo Thánh Gioan</p>
</div>`
  },
  {
    id: 'abstract',
    name: 'Bản Tóm Tắt Nghiên Cứu Thần Học (Abstract Research Card)',
    desc: 'Đặt ngay đầu bài viết dưới tiêu đề chính, nêu bật luận điểm và phạm vi khảo cứu (80 - 150 từ).',
    category: 'Cấu Trúc Bài',
    code: `<div class="abstract-research">
  <div class="abstract-header">
    <span class="abstract-tag">Tóm Tắt Nghiên Cứu (Abstract)</span>
  </div>
  <p class="abstract-content">
    Khảo cứu này làm sáng tỏ bối cảnh lịch sử của biến cố Gioan Tẩy Giả bị trảm quyết dưới góc nhìn chính trị - xã hội Do Thái thế kỷ I, luật hôn nhân Cựu Ước (Lv 18:16) và chứng tá tiên tri cho Đấng Mêxia.
  </p>
</div>`,
    previewHtml: `<div class="abstract-research p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 my-3">
  <div class="abstract-header mb-2">
    <span class="abstract-tag text-xs font-serif font-bold uppercase tracking-wider text-amber-500">✝ Tóm Tắt Nghiên Cứu (Abstract)</span>
  </div>
  <p class="abstract-content text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
    Khảo cứu này làm sáng tỏ bối cảnh lịch sử của biến cố Gioan Tẩy Giả bị trảm quyết dưới góc nhìn chính trị - xã hội Do Thái thế kỷ I, luật hôn nhân Cựu Ước (Lv 18:16) và chứng tá tiên tri cho Đấng Mêxia.
  </p>
</div>`
  },
  {
    id: 'footnotes',
    name: 'Khối Chú Thích Chân Trang (Footnotes & References)',
    desc: 'Được đặt ở cuối bài viết để ghi rõ nguồn trích dẫn học thuật, văn kiện Tòa Thánh hoặc số đoạn Sách Giáo Lý CCC.',
    category: 'Học Thuật',
    code: `<!-- Trong thân văn bản, chèn thẻ sup chỉ số: -->
Theo lời dạy của Công đồng Vatican II<sup><a href="#fn1" class="footnote-ref" data-footnote="1">[1]</a></sup>...

<!-- Ở cuối bài viết, chèn khối Chú Thích: -->
<div class="footnotes-section">
  <h4 class="footnotes-title">Chú Thích & Tài Liệu Tham Khảo</h4>
  <ol class="footnotes-list">
    <li id="fn1" class="footnote-item" data-footnote-number="1">
      <span class="footnote-num">1.</span> 
      Hiến chế Tín lý về Mặc khải <em>Dei Verbum</em>, số 12.
    </li>
    <li id="fn2" class="footnote-item" data-footnote-number="2">
      <span class="footnote-num">2.</span> 
      <em>Sách Giáo Lý Hội Thánh Công Giáo (CCC)</em>, triệt 1213.
    </li>
  </ol>
</div>`,
    previewHtml: `<div class="footnotes-section p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] my-3">
  <h4 class="footnotes-title font-serif font-bold text-xs uppercase tracking-wider text-amber-500 mb-2">Chú Thích & Tài Liệu Tham Khảo</h4>
  <ol class="footnotes-list space-y-1.5 text-xs text-[var(--text-muted)] font-serif">
    <li class="footnote-item flex items-start gap-2">
      <span class="footnote-num font-bold text-amber-500">1.</span> 
      <span>Hiến chế Tín lý về Mặc khải <em>Dei Verbum</em>, số 12.</span>
    </li>
    <li class="footnote-item flex items-start gap-2">
      <span class="footnote-num font-bold text-amber-500">2.</span> 
      <span><em>Sách Giáo Lý Hội Thánh Công Giáo (CCC)</em>, triệt 1213.</span>
    </li>
  </ol>
</div>`
  },
  {
    id: 'dictionary',
    name: 'Khối Thuật Ngữ Giáo Lý & Tín Lý (Theological Dictionary Block)',
    desc: 'Giải nghĩa các thuật ngữ tiếng Hí-pri, Hy Lạp, Latinh hoặc các tín điều Công giáo chuyên sâu.',
    category: 'Thần Học',
    code: `<div class="dictionary-meta">
  <div class="dict-title">Thuật Ngữ Tín Lý: Theotokos (Θεοτόκος)</div>
  <p class="dict-desc">
    Tiếng Hy Lạp nghĩa là "Đấng Cưu Mang Thiên Chúa" (Mẹ Thiên Chúa), tín điều được Công đồng Chung Êphêsô (năm 431) long trọng định tín nhằm khẳng định Đức Kitô vừa là Thiên Chúa thật, vừa là người thật.
  </p>
</div>`,
    previewHtml: `<div class="dictionary-meta p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 my-3">
  <div class="dict-title font-serif font-bold text-xs text-indigo-400 uppercase tracking-wider mb-1.5">Thuật Ngữ Tín Lý: Theotokos (Θεοτόκος)</div>
  <p class="dict-desc text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
    Tiếng Hy Lạp nghĩa là "Đấng Cưu Mang Thiên Chúa" (Mẹ Thiên Chúa), tín điều được Công đồng Chung Êphêsô (năm 431) long trọng định tín nhằm khẳng định Đức Kitô vừa là Thiên Chúa thật, vừa là người thật.
  </p>
</div>`
  },
  {
    id: 'callout',
    name: 'Hộp Lưu Ý Giáo Lý & Huấn Quyền (Catechetical Callout)',
    desc: 'Dùng để nhấn mạnh điểm lưu ý thần học quan trọng, mẹo ghi nhớ đức tin hoặc cảnh báo tránh các ngộ nhận.',
    category: 'Sư Phạm',
    code: `<div class="catechetical-callout callout-important">
  <div class="callout-icon">💡</div>
  <div class="callout-content">
    <div class="callout-title">Điểm Giáo Lý Cốt Lõi (CCC 84)</div>
    <p class="callout-body">
      "Kinh Thánh và Thánh Truyền họp thành một kho tàng duy nhất chứa đựng Lời Thiên Chúa được ủy thác cho Hội Thánh."
    </p>
  </div>
</div>`,
    previewHtml: `<div class="catechetical-callout p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 my-3 flex items-start gap-3">
  <span class="text-xl">💡</span>
  <div>
    <div class="callout-title font-serif font-bold text-xs text-amber-500 uppercase tracking-wider mb-1">Điểm Giáo Lý Cốt Lõi (CCC 84)</div>
    <p class="callout-body text-xs sm:text-sm text-[var(--text-muted)] font-serif italic">
      "Kinh Thánh và Thánh Truyền họp thành một kho tàng duy nhất chứa đựng Lời Thiên Chúa được ủy thác cho Hội Thánh."
    </p>
  </div>
</div>`
  }
];

export default function StyleGuidePage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Community Sub-navigation */}
      <AuthorCommunityNav currentTab="style-guide" />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Quy Chuẩn Soạn Thảo & Phong Cách Học Thuật</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Hướng Dẫn Viết Bài VERIDU
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Quy chuẩn toàn diện nhằm bảo đảm mỗi tác phẩm đăng tải trên VERIDU đạt sự chuẩn mực cao nhất về Thần Học Công Giáo, tuân thủ Huấn Quyền Hội Thánh, chấp hành nghiêm túc Pháp luật Việt Nam và thể hiện vẻ đẹp của nghệ thuật Stained-Glass.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Section 1: Theological & Magisterial Principles */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                1. Tôn Chỉ Thần Học & Huấn Quyền Công Giáo
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                Mọi công trình biên soạn trên VERIDU phải luôn đặt nền tảng trên Chân Lý mạc khải.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-3">
              <h3 className="font-serif font-bold text-base text-amber-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Trung Thành Với Huấn Quyền</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-serif">
                Bài viết phải tuân phục sự giảng dạy chính thức của Huấn Quyền Hội Thánh (Magisterium), các định tín Công đồng Chung, thông điệp của các Đức Giáo Hoàng và Sách Giáo Lý Hội Thánh Công Giáo (CCC).
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-3">
              <h3 className="font-serif font-bold text-base text-amber-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bản Văn Kinh Thánh Chuẩn</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-serif">
                Chỉ sử dụng các bản dịch Kinh Thánh Công giáo được Hội đồng Giám mục phê chuẩn (Bản dịch Các Giờ Kinh Phụng Vụ, Bản dịch Cố Linh mục Nguyễn Thế Thuấn CSsR) hoặc các bản văn nguyên ngữ (Hí-pri, Hy Lạp, Latinh Vulgate).
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-3">
              <h3 className="font-serif font-bold text-base text-amber-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Quy Trình 6 Tầng Chú Giải</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-serif">
                Áp dụng tuần tự 6 tầng chú giải: 1. Ngữ nghĩa văn bản; 2. Bối cảnh lịch sử Cận Đông ANE; 3. Nghĩa thần học Kitô luận; 4. Nghĩa luân lý; 5. Nghĩa cánh chung; 6. Ứng dụng thiêng liêng.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300 font-serif leading-relaxed">
              <strong>Nghiêm Cấm Tuyệt Đối:</strong> Không truyền bá các quan điểm lạc thuyết, dị giáo, thuyết tương đối tôn giáo, tự tiện gán ghép các mặc khải tư chưa được Giáo Hội phê chuẩn, hoặc công kích các phẩm trật trong Hội Thánh.
            </p>
          </div>
        </section>

        {/* Section 2: Legal Compliance in Vietnam */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                2. Tuân Thủ Pháp Luật Việt Nam
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                Người Công giáo sống đức tin trọn vẹn giữa lòng dân tộc, tôn trọng pháp luật và tinh thần bác ái.
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Luật Tín Ngưỡng, Tôn Giáo (2016)</span>
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                  Mọi nội dung xuất bản phục vụ mục đích nghiên cứu học thuật, giáo dục đức tin, hoàn toàn phi chính trị, tôn trọng quyền tự do tín ngưỡng và củng cố khối đại đoàn kết toàn dân tộc.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Luật An Ninh Mạng & Sở Hữu Trí Tuệ</span>
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                  Tuyệt đối không đăng tải thông tin sai sự thật, không xuyên tạc lịch sử dân tộc, không kích động bạo lực hay thù hằn tôn giáo. Nghiêm cấm đạo văn và xâm phạm bản quyền hình ảnh, tư liệu của bên thứ ba.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-card)]">
              <p className="text-xs text-[var(--text-muted)] italic font-serif">
                "Người Công giáo tốt cũng là người công dân tốt; sống Phúc Âm giữa lòng dân tộc để phục vụ hạnh phúc của đồng bào." — Thư Chung 1980 của Hội đồng Giám mục Việt Nam.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Article Structure & Formatting Rules */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                3. Bộ Khung Cấu Trúc Bài Nghiên Cứu Chuẩn Mực
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                Độ dài tiêu chuẩn: 1.500 – 3.500 từ, được phân cấp đề mục khoa học và lôi cuốn.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
              <span className="text-xs font-mono font-bold text-amber-500">PHẦN 1</span>
              <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Tiêu Đề & Abstract</h4>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Tiêu đề học thuật, rõ ý. Bản tóm tắt nghiên cứu (80 - 150 từ) nêu bật luận điểm cốt lõi ngay đầu bài.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
              <span className="text-xs font-mono font-bold text-amber-500">PHẦN 2</span>
              <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Dẫn Nhập & Bối Cảnh</h4>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Giới thiệu hoàn cảnh lịch sử, địa lý, các nhân vật liên quan và vấn đề thần học được đặt ra.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
              <span className="text-xs font-mono font-bold text-amber-500">PHẦN 3</span>
              <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Luận Điểm & Chú Giải</h4>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Phân chia các tiểu mục H2, H3. Dẫn chứng nguyên ngữ, trích dẫn Kinh Thánh và giáo phụ song hành.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2">
              <span className="text-xs font-mono font-bold text-amber-500">PHẦN 4</span>
              <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Chú Thích & Tài Liệu</h4>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Khối chú thích chân trang số tự động và danh mục thư mục tài liệu tham khảo (Bibliography) minh bạch.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Generative UI - Live Catholic Blocks & Snippet Copy */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                4. Hệ Thống Khối Chuẩn VERIDU (Live Snippets)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                Bấm nút "Sao Chép Mã Mẫu" để dán trực tiếp vào Trình Soạn Thảo hoặc tệp HTML của bạn.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {SNIPPETS_DATA.map((item) => (
              <div 
                key={item.id}
                className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-card)] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                      {item.category}
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-serif mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(item.id, item.code)}
                    className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      copiedId === item.id
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Sao Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao Chép Mã HTML</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  {/* Visual Preview */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>Xem Trước Thực Tế (Live Preview):</span>
                    </span>
                    <div 
                      className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: item.previewHtml }}
                    />
                  </div>

                  {/* Code Snippet */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mã HTML Mẫu (HTML Source):</span>
                    </span>
                    <pre className="p-3.5 rounded-2xl bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-48">
                      <code>{item.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Action CTA */}
        <section className="text-center pt-8">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl">
            <div className="text-left">
              <h4 className="font-serif font-bold text-base text-[var(--text-main)]">
                Bạn đã nắm rõ quy chuẩn và sẵn sàng viết bài?
              </h4>
              <p className="text-xs text-[var(--text-muted)] font-serif">
                Mở ngay Phòng Soạn Thảo WYSIWYG hoặc xem các đề tài đang cần cộng tác viên.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/dang-bai"
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold transition"
              >
                Vào Phòng Soạn Thảo
              </Link>
              <Link
                href="/noi-dung-can-thiet"
                className="px-5 py-2.5 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] text-xs font-serif font-bold transition"
              >
                Đề Tài Cần Thiết
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
