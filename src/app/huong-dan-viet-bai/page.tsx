'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  ShieldCheck, 
  Scale, 
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
  Eye,
  ListChecks,
  Compass,
  ArrowRight,
  Bookmark,
  ExternalLink,
  Sparkles
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
    id: 'wrapper',
    name: '1. Thẻ Bọc Thân Bài Học Thuật (Article Wrapper)',
    desc: 'Bắt buộc bọc toàn bộ nội dung thân bài trong thẻ duy nhất này. Không chèn H1, Cover Image, TOC vì hệ thống tự kết xuất.',
    category: 'Bộ Khung Cốt Lõi',
    code: `<article class="veridu-scholarly-article">
  <!-- Toàn bộ nội dung thân bài gồm 8 khối và 4 khối kết thúc học thuật đặt tại đây -->
</article>`,
    previewHtml: `<div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-600 dark:text-amber-400">
  &lt;article class="veridu-scholarly-article"&gt;<br/>
  &nbsp;&nbsp;<span class="text-[var(--text-muted)] font-serif italic">// Nội dung thân bài học thuật chuẩn mực...</span><br/>
  &lt;/article&gt;
</div>`
  },
  {
    id: 'abstract',
    name: '2. Bản Tóm Tắt Nghiên Cứu Thần Học (Abstract Research Card)',
    desc: 'Đặt ngay đầu bài viết, nêu bật câu hỏi nghiên cứu, luận điểm cốt lõi và phương pháp luận (80 - 150 từ).',
    category: 'Cấu Trúc',
    code: `<div class="abstract-research">
  <div class="abstract-header">
    <span class="abstract-title">
      <span>📖</span> TÓM TẮT NGHIÊN CỨU THẦN HỌC
    </span>
    <span class="abstract-badge">VERIDU RESEARCH</span>
  </div>
  <p class="abstract-body leading-relaxed my-4 text-[var(--text-main)] text-base sm:text-lg">
    Khảo cứu này làm sáng tỏ bối cảnh lịch sử của biến cố dưới góc nhìn khảo cổ học Cận Đông cổ đại, đối chiếu bản văn Kinh Thánh theo bản dịch Cố Lm. Nguyễn Thế Thuấn và khai mở chiều kích thần học cứu độ.
  </p>
</div>`,
    previewHtml: `<div class="abstract-research p-4 rounded-2xl bg-[var(--bg-main)] border border-amber-500/30 my-2 space-y-2">
  <div class="abstract-header flex items-center justify-between border-b border-amber-500/20 pb-2">
    <span class="abstract-title text-xs font-serif font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
      <span>📖</span> TÓM TẮT NGHIÊN CỨU THẦN HỌC
    </span>
    <span class="abstract-badge px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">VERIDU RESEARCH</span>
  </div>
  <p class="abstract-body text-xs text-[var(--text-muted)] font-serif leading-relaxed italic">
    Khảo cứu này làm sáng tỏ bối cảnh lịch sử của biến cố dưới góc nhìn khảo cổ học Cận Đông cổ đại, đối chiếu bản văn Kinh Thánh theo bản dịch Cố Lm. Nguyễn Thế Thuấn và khai mở chiều kích thần học cứu độ.
  </p>
</div>`
  },
  {
    id: 'heading-roman',
    name: '3. Đề Mục Phân Đoạn La Mã (Roman Headings)',
    desc: 'Phân đoạn các đề mục chính trong bài viết bằng số La Mã (I, II, III...), font serif trang trọng, có viền chân vàng nhạt.',
    category: 'Bố Cục',
    code: `<h2 id="i-boi-canh-khao-co" class="veridu-heading-roman font-serif text-2xl md:text-3xl font-bold text-amber-500/90 mt-10 mb-4 pb-2 border-b border-amber-500/20">
  I. Bối Cảnh Lịch Sử &amp; Di Chỉ Khảo Cổ Cận Đông
</h2>`,
    previewHtml: `<div class="my-2">
  <h2 class="font-serif text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 pb-1 border-b border-amber-500/20">
    I. Bối Cảnh Lịch Sử &amp; Di Chỉ Khảo Cổ Cận Đông
  </h2>
</div>`
  },
  {
    id: 'scripture',
    name: '4. Khối Lời Chúa Soi Đường (Sacred Scripture Callout)',
    desc: 'Trích dẫn Lời Chúa theo bản dịch Cố Lm. Nguyễn Thế Thuấn, CSsR, có huy hiệu tra cứu chuẩn phụng vụ.',
    category: 'Kinh Thánh',
    code: `<div class="sacred-scripture">
  <div class="scripture-badge">
    <span>Ga 3:30</span>
    <span class="text-xs opacity-75 font-sans">Bản dịch Cố Lm. Nguyễn Thế Thuấn, CSsR</span>
  </div>
  <div class="scripture-content font-serif text-lg leading-relaxed italic text-amber-200/90">
    "Người phải lớn lên, còn tôi phải nhỏ lại."
  </div>
</div>`,
    previewHtml: `<div class="sacred-scripture my-2 p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-2">
  <div class="scripture-badge flex items-center justify-between text-xs font-serif font-bold text-amber-600 dark:text-amber-400">
    <span>✝ Ga 3:30</span>
    <span class="text-[10px] text-[var(--text-muted)] font-sans">Bản dịch Cố Lm. Nguyễn Thế Thuấn, CSsR</span>
  </div>
  <div class="scripture-content italic text-xs font-serif text-[var(--text-main)]">
    "Người phải lớn lên, còn tôi phải nhỏ lại."
  </div>
</div>`
  },
  {
    id: 'callout',
    name: '5. Hộp Lưu Ý Giáo Lý & Huấn Quyền (Catechetical Callout)',
    desc: 'Nhấn mạnh điểm giáo lý cốt lõi, trích dẫn Sách Giáo Lý Hội Thánh Công Giáo (CCC) hoặc văn kiện Tòa Thánh.',
    category: 'Huấn Quyền',
    code: `<div class="catechetical-callout catechetical-important">
  <div class="callout-header">
    <span class="callout-icon">⛪</span>
    <span class="callout-title">Ý NGHĨA GIÁO LÝ &amp; HUẤN QUYỀN HỘI THÁNH</span>
  </div>
  <div class="callout-content">
    <p class="mb-2">Kinh Thánh và Thánh Truyền họp thành một kho tàng duy nhất chứa đựng Lời Thiên Chúa được ủy thác cho Hội Thánh.</p>
    <div class="callout-ref">Sách Giáo Lý Hội Thánh Công Giáo (CCC) #84; Hiến chế Dei Verbum #9.</div>
  </div>
</div>`,
    previewHtml: `<div class="catechetical-callout p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 my-2 space-y-1.5">
  <div class="flex items-center gap-2">
    <span class="text-sm">⛪</span>
    <span class="font-serif font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">Ý NGHĨA GIÁO LÝ &amp; HUẤN QUYỀN HỘI THÁNH</span>
  </div>
  <p class="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
    Kinh Thánh và Thánh Truyền họp thành một kho tàng duy nhất chứa đựng Lời Thiên Chúa được ủy thác cho Hội Thánh.
  </p>
  <div class="text-[10px] font-mono text-amber-600/80 dark:text-amber-400/80">CCC #84; Hiến chế Dei Verbum #9.</div>
</div>`
  },
  {
    id: 'image-lightbox',
    name: '6. Hình Ảnh Khảo Cổ Phụng Vụ Có Lightbox (Image Block)',
    desc: 'Hình ảnh khảo cổ/thánh tích có thuộc tính data-lightbox="true" để phóng to và chú thích học thuật.',
    category: 'Khảo Cổ',
    code: `<figure class="wp-block-image veridu-image-block my-8 text-center" data-lightbox="true">
  <img src="https://example.com/anh-khao-co.jpg" alt="Mô tả di chỉ khảo cổ" class="rounded-xl shadow-2xl mx-auto border border-amber-500/20 max-w-full h-auto" loading="lazy" />
  <figcaption class="mt-3 text-sm text-[var(--text-muted)] italic font-serif">Di chỉ thành cổ thời kỳ Đệ Nhất Đền Thờ. Nguồn: Viện Khảo cổ học Israel.</figcaption>
</figure>`,
    previewHtml: `<div class="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-center my-2">
  <div class="h-20 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-serif text-amber-600 dark:text-amber-400 font-bold mb-1.5">
    🖼️ Ảnh Khảo Cổ (Hỗ trợ Lightbox 🔍)
  </div>
  <p class="text-[11px] text-[var(--text-muted)] font-serif italic">
    Di chỉ thành cổ thời kỳ Đệ Nhất Đền Thờ. Nguồn: Viện Khảo cổ học Israel.
  </p>
</div>`
  },
  {
    id: 'prayer-block',
    name: '7. Khối Lời Nguyện Chiêm Niệm (Prayer Block)',
    desc: 'Đóng khung phụng vụ trang trọng ở phần kết thúc bài viết, đúc kết bài học hiện sinh cho đời sống cầu nguyện.',
    category: 'Linh Đạo',
    code: `<div class="prayer-block">
  <div class="prayer-header">
    <span class="prayer-cross">✝</span>
    <span class="prayer-title">LỜI NGUYỆN SUY NIỆM</span>
  </div>
  <p class="prayer-verse">
    Lạy Chúa, xin ban cho chúng con một đức tin kiên vững dẫu giữa muôn vàn phong ba bão táp của cuộc đời. Amen.
  </p>
</div>`,
    previewHtml: `<div class="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center my-2 space-y-1">
  <div class="text-xs font-serif font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1">
    <span>✝</span> LỜI NGUYỆN SUY NIỆM
  </div>
  <p class="text-xs italic font-serif text-[var(--text-muted)] leading-relaxed">
    Lạy Chúa, xin ban cho chúng con một đức tin kiên vững dẫu giữa muôn vàn phong ba bão táp của cuộc đời. Amen.
  </p>
</div>`
  },
  {
    id: 'ending-metas',
    name: '8. Bộ 4 Khối Kết Thúc Học Thuật Bắt Buộc (Concluding Metas)',
    desc: 'Bao gồm Chú thích 2 chiều, Bảng đối chiếu Kinh Thánh, Từ điển thuật ngữ, và Thư mục tài liệu chuẩn mực.',
    category: 'Học Thuật',
    code: `<!-- 1. CHÚ THÍCH HỌC THUẬT (FOOTNOTES) -->
<div class="veridu-footnotes">
  <h4 id="chu-thich" class="font-serif font-bold text-lg text-amber-600 dark:text-amber-400 mt-6 mb-2">Chú Thích Học Thuật</h4>
  <ol class="list-decimal list-inside space-y-2 text-sm text-[var(--text-muted)] font-serif">
    <li id="fn-1"><a href="#fnref-1" class="text-amber-500 hover:underline mr-1">↩</a> Nguồn tài liệu khảo cứu [1]...</li>
  </ol>
</div>

<!-- 2. ĐỐI CHIẾU KINH THÁNH (SCRIPTURE META) -->
<div class="scripture-meta">
  <h3 id="tham-chieu" class="font-serif font-bold text-xl text-[var(--text-main)] mt-8 mb-3">Tham Chiếu Bản Văn Thánh Kinh</h3>
  <div class="scripture-item">
    <div class="scripture-claim">Luận điểm nghiên cứu đối chiếu</div>
    <div class="scripture-ref"><a href="/kinh-thanh" class="text-amber-500 hover:underline">St 12:1-4</a></div>
  </div>
</div>

<!-- 3. TỪ ĐIỂN THUẬT NGỮ (DICTIONARY META) -->
<div class="dictionary-meta">
  <div class="dictionary-title" id="bang-thuat-ngu">TRA CỨU THUẬT NGỮ THẦN HỌC &amp; KHẢO CỔ HỌC</div>
  <div class="dictionary-entry">
    <span class="dictionary-term">Berît (בְּרִית):</span>
    <span class="dictionary-def">(Tiếng Híp-ri) "Giao ước" – mối tương quan thiêng liêng ràng buộc giữa Thiên Chúa và dân tộc tuyển chọn.</span>
  </div>
</div>

<!-- 4. THƯ MỤC TÀI LIỆU THAM KHẢO (BIBLIOGRAPHY) -->
<div class="bibliography">
  <h3 id="thu-muc-tai-lieu" class="font-serif font-bold text-xl text-[var(--text-main)] mt-8 mb-3">Thư Mục Tài Liệu Tham Khảo Chuẩn Mực</h3>
  <p class="leading-relaxed my-3 text-[var(--text-main)] text-base">Vaux, Roland de. <em>Ancient Israel: Its Life and Institutions</em>. London: Darton, Longman &amp; Todd, 1961.</p>
</div>`,
    previewHtml: `<div class="p-3 rounded-2xl bg-[var(--bg-main)] border border-amber-500/30 my-2 space-y-1.5 text-xs font-serif">
  <div class="font-bold text-amber-600 dark:text-amber-400">📚 Bộ 4 Khối Học Thuật Kết Bài:</div>
  <ul class="list-disc list-inside text-[var(--text-muted)] space-y-0.5 text-[11px]">
    <li><code>.veridu-footnotes</code>: Chú thích liên kết 2 chiều</li>
    <li><code>.scripture-meta</code>: Bảng đối chiếu bản văn Kinh Thánh</li>
    <li><code>.dictionary-meta</code>: Từ điển thuật ngữ Thần học &amp; Khảo cổ</li>
    <li><code>.bibliography</code>: Thư mục tài liệu tham khảo học thuật</li>
  </ul>
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

  const TOC_ITEMS = [
    { id: 'bai-mau', label: '⭐ Bài Viết Mẫu Chuẩn Mực (ID #48)' },
    { id: 'ton-chi', label: '1. Tôn Chỉ Huấn Quyền' },
    { id: 'phap-luat', label: '2. Tuân Thủ Pháp Luật' },
    { id: 'cau-truc', label: '3. Bộ Khung Cấu Trúc Bài' },
    { id: 'khoi-html', label: '4. 8 Khối HTML Chuẩn Mẫu' },
    { id: 'trich-dan', label: '5. Quy Định Trích Dẫn' },
  ];

  const CHECKLIST_ITEMS = [
    'Bọc toàn bộ thân bài trong <article class="veridu-scholarly-article">',
    'Có khối Abstract Research Card (.abstract-research) với header và badge',
    'Trích dẫn Kinh Thánh theo bản dịch Cố Lm. Nguyễn Thế Thuấn, CSsR',
    'Hình ảnh khảo cổ dùng figure.veridu-image-block có data-lightbox="true"',
    'Đủ 4 khối kết thúc: Footnotes, Scripture Meta, Dictionary, Bibliography',
    'Không chèn trùng lặp Tiêu đề H1, Ảnh bìa, TOC (do template tự kết xuất)',
    'Tín lý & giáo huấn chuẩn xác theo Sách Giáo Lý CCC và Huấn Quyền',
    'Nghiêm cấm đạo văn; chấp hành nghiêm túc Pháp luật Việt Nam'
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] pt-24 sm:pt-28 xl:pt-36 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Quy Chuẩn Soạn Thảo &amp; Phong Cách Học Thuật VERIDU</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Hướng Dẫn Viết Bài Chuẩn Mực
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Cẩm nang quy chuẩn toàn diện nhằm bảo đảm mỗi công trình nghiên cứu trên VERIDU (Crux Veritatis) đạt tính chuẩn mực cao nhất về Thần Học Công Giáo, tuân phục Huấn Quyền Hội Thánh, chấp hành nghiêm túc Pháp luật Việt Nam và thể hiện thẩm mỹ Stained-Glass thanh nhã.
          </p>
        </div>
      </section>

      {/* Main 2-Column Content Layout (Left 70% - Right 30%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 70% (lg:col-span-8) - MAIN GUIDELINES & LIVE SNIPPETS */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* SPECIAL SECTION: GOLDEN STANDARD ARTICLE */}
            <section id="bai-mau" className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[var(--bg-card)] to-amber-500/5 border-2 border-amber-500/40 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg">
                    ⭐
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      BÀI MẪU CHUẨN MỰC HỆ THỐNG (GOLDEN STANDARD)
                    </span>
                    <h2 className="font-serif font-black text-xl sm:text-2xl text-[var(--text-main)]">
                      Vương Quốc Israel Cổ Đại (Bài Viết ID #48)
                    </h2>
                  </div>
                </div>

                <a 
                  href="/vuong-quoc-israel-co-dai-khao-co-hoc-can-dong-buoc-ngoat-lich-su-va-hanh-trinh-duc-tin-doc-than"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs transition shadow-md shrink-0"
                >
                  <span>Mở Xem Bài Mẫu Thực Tế</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
                Bài viết này là khuôn mẫu chuẩn mực định nghĩa cấu trúc toàn diện cho tất cả các bài nghiên cứu trên VERIDU. Toàn bộ 25 bài viết tiêu chuẩn trong hệ thống CSDL đã được đồng bộ hóa thống nhất theo kiến trúc này.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
                  <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Khung Hệ Thống (System Frame)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Header, Breadcrumb, Tiêu đề H1, Cover Image, Sticky TOC, Metadata, Author Card, Chân trang bản quyền. <em>(Hệ thống tự động hiển thị, không viết vào HTML)</em>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
                  <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Thân Bài HTML (Article Body)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Bắt buộc bọc trong <code>&lt;article class="veridu-scholarly-article"&gt;</code>, gồm Abstract Card, các đề mục La Mã, Lời Chúa NTT, và 4 khối kết thúc học thuật.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 1: Theological & Magisterial Principles */}
            <section id="ton-chi" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                    1. Tôn Chỉ Thần Học &amp; Huấn Quyền Công Giáo
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Mọi công trình biên soạn trên VERIDU phải luôn đặt nền tảng trên Chân Lý mạc khải.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 space-y-2">
                  <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Trung Thành Huấn Quyền</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                    Tuân phục sự giảng dạy chính thức của Huấn Quyền (Magisterium), các định tín Công đồng Chung, thông điệp Tòa Thánh và Sách Giáo Lý CCC.
                  </p>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 space-y-2">
                  <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bản Văn Kinh Thánh Chuẩn</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                    Ưu tiên sử dụng bản dịch của Cố Lm. Nguyễn Thế Thuấn, CSsR cho các phân tích chú giải ngữ nghĩa và đối chiếu nguyên ngữ Híp-ri / Hy Lạp.
                  </p>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 space-y-2">
                  <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Quy Trình 6 Tầng Chú Giải</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                    Tuân thủ 6 tầng chú giải: Ngữ nghĩa văn bản, Bối cảnh ANE, Thần học Kitô luận, Luân lý, Cánh chung và Ứng dụng thiêng liêng.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300 font-serif leading-relaxed">
                  <strong>Nghiêm Cấm Tuyệt Đối:</strong> Không truyền bá các quan điểm dị giáo, thuyết tương đối tôn giáo, tự tiện gán ghép mặc khải tư chưa được Giáo Hội công nhận, hoặc công kích hàng giáo phẩm.
                </p>
              </div>
            </section>

            {/* Section 2: Legal Compliance in Vietnam */}
            <section id="phap-luat" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                    2. Tuân Thủ Pháp Luật Việt Nam
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Sống đức tin trọn vẹn giữa lòng dân tộc, tôn trọng pháp luật và tinh thần bác ái.
                  </p>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Luật Tín Ngưỡng, Tôn Giáo (2016)</span>
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                      Nội dung xuất bản phục vụ nghiên cứu học thuật, thuần túy tôn giáo, phi chính trị, tôn trọng khối đại đoàn kết toàn dân tộc.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Luật An Ninh Mạng &amp; Bản Quyền</span>
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                      Không đăng tin sai sự thật, không xuyên tạc lịch sử, không vi phạm thuần phong mỹ tục. Nghiêm cấm xâm phạm quyền tác giả của bên thứ ba.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-card)]">
                  <p className="text-xs text-[var(--text-muted)] italic font-serif">
                    &ldquo;Người Công giáo tốt cũng là người công dân tốt; sống Phúc Âm giữa lòng dân tộc để phục vụ hạnh phúc của đồng bào.&rdquo; — Thư Chung 1980 của HĐGMVN.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Article Structure */}
            <section id="cau-truc" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                    3. Bộ Khung Cấu Trúc Bài Nghiên Cứu Chuẩn Mực
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Độ dài tiêu chuẩn: 1.500 – 3.500 từ, được phân cấp đề mục mạch lạc.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 1</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Thẻ Bọc &amp; Abstract</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Thẻ bọc &lt;article&gt;, kèm bản tóm tắt luận điểm nghiên cứu (.abstract-research) ngay đầu bài.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 2</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Dẫn Nhập &amp; Khảo Cổ</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Giới thiệu hoàn cảnh lịch sử, bối cảnh Cận Đông Cổ Đại (ANE) và các di chỉ khảo cổ liên hệ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 3</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Luận Điểm &amp; Chú Giải</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Chia nhỏ bằng các đề mục La Mã H2. Khối Lời Chúa NTT, hộp giáo lý và hình ảnh lightbox.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 4</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Bộ 4 Khối Kết Thúc</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Bắt buộc đủ 4 khối: Chú thích cuối trang, Đối chiếu Kinh Thánh, Từ điển, và Thư mục tham khảo.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: 8 Catholic HTML Blocks */}
            <section id="khoi-html" className="space-y-6 scroll-mt-24">
              <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                    4. Hệ Thống 8 Khối Chuẩn Mẫu (Live HTML Snippets)
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Bấm &ldquo;Sao Chép Mã&rdquo; để dán vào trình soạn thảo hoặc file HTML của bạn.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {SNIPPETS_DATA.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-card)] pb-2.5">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                          {item.category}
                        </span>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] font-serif mt-0.5">
                          {item.desc}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopy(item.id, item.code)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
                            <span>Sao Chép Mã</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
                      {/* Visual Preview */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                          <Eye className="w-3 h-3 text-amber-500" />
                          <span>Xem Trước Thực Tế:</span>
                        </span>
                        <div 
                          className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] overflow-hidden text-xs"
                          dangerouslySetInnerHTML={{ __html: item.previewHtml }}
                        />
                      </div>

                      {/* Code Snippet */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                          <FileCode2 className="w-3 h-3 text-indigo-400" />
                          <span>Mã Nguồn HTML:</span>
                        </span>
                        <pre className="p-3 rounded-xl bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-48">
                          <code>{item.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Citation Guidelines */}
            <section id="trich-dan" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                    5. Quy Định Trích Dẫn &amp; Viết Tắt Thánh Kinh
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Quy chuẩn viết tắt tên sách và số chương câu thống nhất trên toàn hệ thống.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
                <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                  Khi trích dẫn Kinh Thánh, tác giả sử dụng dấu hai chấm giữa chương và câu (ví dụ: <code className="text-amber-500 font-mono font-bold">Ga 3:16</code> hoặc <code className="text-amber-500 font-mono font-bold">St 1:1-3</code>). Đối với Sách Giáo Lý Hội Thánh Công Giáo, dùng từ viết tắt <code className="text-amber-500 font-mono font-bold">CCC</code> kèm số triệt (ví dụ: <code className="text-amber-500 font-mono font-bold">CCC 1213</code>).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">St = Sáng Thế</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Xh = Xuất Hành</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Tv = Thánh Vịnh</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Is = Isaia</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Mt = Mát-thêu</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Mc = Mác-cô</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Lc = Lu-ca</div>
                  <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)]">Ga = Gio-an</div>
                </div>
              </div>
            </section>

          </main>

          {/* RIGHT COLUMN: 30% (lg:col-span-4) - STICKY TOC & CHECKLIST */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 xl:top-32">
            
            {/* Table of Contents (TOC) */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-3">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <ScrollText className="w-4 h-4 text-amber-500" />
                <span>Mục Lục Quy Chuẩn</span>
              </span>

              <nav className="space-y-1">
                {TOC_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block px-3 py-2 rounded-xl text-xs font-serif text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--bg-main)] transition"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Author Self-Checklist */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-amber-500/5 border border-amber-500/30 shadow-md space-y-3">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4" />
                <span>Checklist 8 Điểm Chuẩn Mực</span>
              </span>

              <div className="space-y-2 pt-1">
                {CHECKLIST_ITEMS.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-serif text-[var(--text-main)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-2.5">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Thao Tác Nhanh
              </h4>

              <Link
                href="/soan-bai"
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Vào Phòng Soạn Thảo</span>
              </Link>

              <a
                href="/vuong-quoc-israel-co-dai-khao-co-hoc-can-dong-buoc-ngoat-lich-su-va-hanh-trinh-duc-tin-doc-than"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Xem Bài Mẫu ID #48</span>
              </a>

              <Link
                href="/noi-dung-can-thiet"
                className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Xem Đề Tài Cần Thiết</span>
              </Link>

              <Link
                href="/dieu-khoan-tac-gia"
                className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Scale className="w-3.5 h-3.5 text-rose-400" />
                <span>Xem Điều Khoản Tác Giả</span>
              </Link>
            </div>

          </aside>

        </div>
      </section>
    </div>
  );
}
