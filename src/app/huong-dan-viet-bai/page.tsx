'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Eye,
  ListChecks,
  Compass,
  ArrowRight,
  Bookmark
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
    name: '1. Khối Lời Chúa Soi Đường (Sacred Scripture Callout)',
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
    previewHtml: `<div class="sacred-scripture veridu-scripture-quote my-2 p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500">
  <div class="scripture-badge flex items-center justify-between text-xs font-serif font-bold text-amber-500 mb-1">
    <span>✝ Lời Chúa</span>
    <span class="scripture-ref-link text-amber-500 font-mono font-bold">Ga 3:30 ↗</span>
  </div>
  <blockquote class="scripture-verse italic text-sm font-serif text-[var(--text-main)] my-1.5">
    "Người phải lớn lên, còn thầy phải nhỏ lại."
  </blockquote>
  <p class="scripture-citation text-[11px] text-[var(--text-muted)] font-serif">— Tin Mừng theo Thánh Gioan</p>
</div>`
  },
  {
    id: 'abstract',
    name: '2. Bản Tóm Tắt Nghiên Cứu Thần Học (Abstract Card)',
    desc: 'Đặt ngay đầu bài viết dưới tiêu đề chính, nêu bật luận điểm và phạm vi khảo cứu (80 - 150 từ).',
    category: 'Cấu Trúc',
    code: `<div class="abstract-research">
  <div class="abstract-header">
    <span class="abstract-tag">Tóm Tắt Nghiên Cứu (Abstract)</span>
  </div>
  <p class="abstract-content">
    Khảo cứu này làm sáng tỏ bối cảnh lịch sử của biến cố Gioan Tẩy Giả bị trảm quyết dưới góc nhìn chính trị - xã hội Do Thái thế kỷ I, luật hôn nhân Cựu Ước (Lv 18:16) và chứng tá tiên tri cho Đấng Mêxia.
  </p>
</div>`,
    previewHtml: `<div class="abstract-research p-4 rounded-2xl bg-[var(--bg-main)] border border-amber-500/30 my-2">
  <div class="abstract-header mb-1.5">
    <span class="abstract-tag text-xs font-serif font-bold uppercase tracking-wider text-amber-500">✝ Tóm Tắt Nghiên Cứu (Abstract)</span>
  </div>
  <p class="abstract-content text-xs text-[var(--text-muted)] font-serif leading-relaxed">
    Khảo cứu này làm sáng tỏ bối cảnh lịch sử của biến cố Gioan Tẩy Giả bị trảm quyết dưới góc nhìn chính trị - xã hội Do Thái thế kỷ I, luật hôn nhân Cựu Ước (Lv 18:16) và chứng tá tiên tri cho Đấng Mêxia.
  </p>
</div>`
  },
  {
    id: 'scripture-meta',
    name: '3. Bảng Danh Mục Bằng Chứng Thánh Kinh (Scripture Meta Claims)',
    desc: 'Liệt kê các đối chiếu chương câu Kinh Thánh củng cố cho luận điểm nghiên cứu thần học.',
    category: 'Đối Chiếu',
    code: `<div class="scripture-meta">
  <div class="meta-title">Đối Chiếu Thánh Kinh Liên Hệ</div>
  <div class="scripture-list">
    <div class="scripture-item">
      <span class="ref-badge">Mt 14:3-12</span>
      <span class="ref-desc">Bản tường thuật của Mát-thêu về cái chết của Gioan Tẩy Giả.</span>
    </div>
    <div class="scripture-item">
      <span class="ref-badge">Mc 6:17-29</span>
      <span class="ref-desc">Chi tiết tiệc sinh nhật vua Hê-rô-đê và vũ điệu của Hê-rô-đia.</span>
    </div>
  </div>
</div>`,
    previewHtml: `<div class="scripture-meta p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] my-2 space-y-2">
  <div class="meta-title text-xs font-serif font-bold text-amber-500 uppercase tracking-wider">Đối Chiếu Thánh Kinh Liên Hệ</div>
  <div class="space-y-1.5">
    <div class="flex items-center gap-2 text-xs font-serif">
      <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-mono font-bold text-[10px]">Mt 14:3-12</span>
      <span class="text-[var(--text-muted)]">Bản tường thuật của Mát-thêu về cuộc trảm quyết.</span>
    </div>
    <div class="flex items-center gap-2 text-xs font-serif">
      <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-mono font-bold text-[10px]">Mc 6:17-29</span>
      <span class="text-[var(--text-muted)]">Chi tiết tiệc sinh nhật vua Hê-rô-đê và vũ điệu Hê-rô-đia.</span>
    </div>
  </div>
</div>`
  },
  {
    id: 'poetry-prayer',
    name: '4. Khối Thơ & Lời Nguyện Kính (Poetry & Prayer Block)',
    desc: 'Được định dạng canh lề trang trọng, dùng cho các bài thánh thi, thơ ca tụng hoặc lời nguyện kết bài.',
    category: 'Linh Đạo',
    code: `<div class="prayer-block">
  <div class="prayer-cross">✝</div>
  <div class="prayer-title">Lời Nguyện Suy Niệm</div>
  <div class="prayer-content">
    Lạy Chúa Giêsu, xin cho con biết can đảm làm chứng cho Chân Lý<br/>
    Dẫu giữa muôn vàn gian nan và thử thách của thế gian.<br/>
    Amen.
  </div>
</div>`,
    previewHtml: `<div class="prayer-block p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center my-2 space-y-1">
  <div class="text-indigo-400 font-serif text-sm">✝</div>
  <div class="text-xs font-serif font-bold text-indigo-400 uppercase tracking-wider">Lời Nguyện Suy Niệm</div>
  <p class="text-xs italic font-serif text-[var(--text-muted)] leading-relaxed pt-1">
    Lạy Chúa Giêsu, xin cho con biết can đảm làm chứng cho Chân Lý<br/>
    Dẫu giữa muôn vàn gian nan và thử thách của thế gian.<br/>
    <strong>Amen.</strong>
  </p>
</div>`
  },
  {
    id: 'dictionary',
    name: '5. Khối Thuật Ngữ Giáo Lý & Tín Lý (Theological Dictionary Block)',
    desc: 'Giải nghĩa các thuật ngữ tiếng Hí-pri, Hy Lạp, Latinh hoặc các tín điều Công giáo chuyên sâu.',
    category: 'Thần Học',
    code: `<div class="dictionary-meta">
  <div class="dict-title">Thuật Ngữ Tín Lý: Theotokos (Θεοτόκος)</div>
  <p class="dict-desc">
    Tiếng Hy Lạp nghĩa là "Đấng Cưu Mang Thiên Chúa" (Mẹ Thiên Chúa), tín điều được Công đồng Chung Êphêsô (năm 431) long trọng định tín nhằm khẳng định Đức Kitô vừa là Thiên Chúa thật, vừa là người thật.
  </p>
</div>`,
    previewHtml: `<div class="dictionary-meta p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 my-2">
  <div class="dict-title font-serif font-bold text-xs text-indigo-400 uppercase tracking-wider mb-1">Thuật Ngữ Tín Lý: Theotokos (Θεοτόκος)</div>
  <p class="dict-desc text-xs text-[var(--text-muted)] font-serif leading-relaxed">
    Tiếng Hy Lạp nghĩa là "Đấng Cưu Mang Thiên Chúa" (Mẹ Thiên Chúa), tín điều được Công đồng Chung Êphêsô (năm 431) long trọng định tín khẳng định thiên tính và nhân tính của Đức Kitô.
  </p>
</div>`
  },
  {
    id: 'footnotes',
    name: '6. Khối Chú Thích Chân Trang (Footnotes & References)',
    desc: 'Được đặt ở cuối bài viết để ghi rõ nguồn trích dẫn học thuật, văn kiện Tòa Thánh hoặc số đoạn Sách Giáo Lý CCC.',
    category: 'Học Thuật',
    code: `<!-- Trong thân bài viết, chèn thẻ sup liên kết: -->
Theo lời dạy của Công đồng Vatican II<sup><a href="#fn1" class="footnote-ref">[1]</a></sup>...

<!-- Ở cuối bài viết, chèn khối Chú Thích: -->
<div class="footnotes-section">
  <h4 class="footnotes-title">Chú Thích & Tài Liệu Tham Khảo</h4>
  <ol class="footnotes-list">
    <li id="fn1" class="footnote-item">
      <span class="footnote-num">1.</span> 
      Hiến chế Tín lý về Mặc khải <em>Dei Verbum</em>, số 12.
    </li>
    <li id="fn2" class="footnote-item">
      <span class="footnote-num">2.</span> 
      <em>Sách Giáo Lý Hội Thánh Công Giáo (CCC)</em>, triệt 1213.
    </li>
  </ol>
</div>`,
    previewHtml: `<div class="footnotes-section p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] my-2">
  <h4 class="footnotes-title font-serif font-bold text-xs uppercase tracking-wider text-amber-500 mb-2">Chú Thích & Tài Liệu Tham Khảo</h4>
  <ol class="footnotes-list space-y-1 text-xs text-[var(--text-muted)] font-serif">
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
    id: 'liturgical-image',
    name: '7. Khung Hình Ảnh Phụng Vụ Kèm Chú Thích (Image Box)',
    desc: 'Định dạng hình ảnh thánh thiêng chuẩn tỷ lệ, có chú thích niên đại, địa danh khảo cổ hoặc tác giả.',
    category: 'Hình Ảnh',
    code: `<figure class="liturgical-image-box">
  <img src="https://example.com/anh-khao-co.jpg" alt="Bia đá Tel Dan" loading="lazy" />
  <figcaption>
    Bia đá Tel Dan (thế kỷ IX TCN) với dòng chữ khắc Aram nhắc đến "Nhà Đa-vít". Hiện lưu giữ tại Bảo tàng Israel.
  </figcaption>
</figure>`,
    previewHtml: `<div class="liturgical-image-box p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-center my-2">
  <div class="h-24 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-serif text-amber-500 font-bold mb-2">
    🖼️ Khung Ảnh Phụng Vụ / Khảo Cổ
  </div>
  <p class="text-[11px] text-[var(--text-muted)] font-serif italic">
    Bia đá Tel Dan (thế kỷ IX TCN) với dòng chữ khắc Aram nhắc đến "Nhà Đa-vít". Hiện lưu giữ tại Bảo tàng Israel.
  </p>
</div>`
  },
  {
    id: 'callout',
    name: '8. Hộp Lưu Ý Giáo Lý & Huấn Quyền (Catechetical Callout)',
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
    previewHtml: `<div class="catechetical-callout p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 my-2 flex items-start gap-3">
  <span class="text-lg">💡</span>
  <div>
    <div class="callout-title font-serif font-bold text-xs text-amber-500 uppercase tracking-wider mb-0.5">Điểm Giáo Lý Cốt Lõi (CCC 84)</div>
    <p class="callout-body text-xs text-[var(--text-muted)] font-serif italic">
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

  const TOC_ITEMS = [
    { id: 'ton-chi', label: '1. Tôn Chỉ Huấn Quyền' },
    { id: 'phap-luat', label: '2. Tuân Thủ Pháp Luật' },
    { id: 'cau-truc', label: '3. Bộ Khung Cấu Trúc Bài' },
    { id: 'khoi-html', label: '4. 8 Khối HTML Chuẩn Mẫu' },
    { id: 'trich-dan', label: '5. Quy Định Trích Dẫn' },
  ];

  const CHECKLIST_ITEMS = [
    'Trích dẫn Kinh Thánh đúng chương/câu từ bản dịch Công giáo chuẩn',
    'Tín lý & giáo huấn chuẩn xác theo Sách Giáo Lý CCC',
    'Nghiêm cấm đạo văn và sao chép nội dung trái phép',
    'Chấp hành Luật Tôn giáo 2016 & Luật An ninh mạng Việt Nam',
    'Bài viết có cấu trúc rõ ràng: Abstract, Đề mục H2-H3, Chú thích',
    'Đã soát lỗi chính tả tiếng Việt và tính mỹ thuật bố cục'
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Quy Chuẩn Soạn Thảo &amp; Phong Cách Học Thuật</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Hướng Dẫn Viết Bài VERIDU
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Quy chuẩn toàn diện nhằm bảo đảm mỗi tác phẩm đạt tính chuẩn mực cao nhất về Thần Học Công Giáo, tuân thủ Huấn Quyền Hội Thánh, chấp hành nghiêm túc Pháp luật Việt Nam và thể hiện vẻ đẹp của thiết kế Stained-Glass.
          </p>
        </div>
      </section>

      {/* Main 2-Column Content Layout (Left 70% - Right 30%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 70% (lg:col-span-8) - MAIN GUIDELINES & LIVE SNIPPETS */}
          <main className="lg:col-span-8 space-y-12">
            
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
                    Sử dụng các bản dịch Kinh Thánh Công giáo được Hội đồng Giám mục phê chuẩn (NPDCTK, Lm. Nguyễn Thế Thuấn) hoặc nguyên ngữ Hy Lạp/Do Thái.
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
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Tiêu Đề &amp; Abstract</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Tiêu đề học thuật rõ ý. Bản tóm tắt luận điểm nghiên cứu (80 - 150 từ) ngay đầu bài.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 2</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Dẫn Nhập &amp; Bối Cảnh</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Giới thiệu hoàn cảnh lịch sử, địa lý, các nhân vật và vấn đề thần học được đặt ra.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 3</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Luận Điểm &amp; Chú Giải</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Chia nhỏ bằng các đề mục H2, H3. Dẫn chứng nguyên ngữ, Kinh Thánh và giáo phụ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500">PHẦN 4</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)]">Chú Thích &amp; Tài Liệu</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif">
                    Khối chú thích chân trang số tự động và danh mục tài liệu tham khảo (Bibliography).
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
                    Bấm &ldquo;Sao Chép Mã Mẫu&rdquo; để dán vào trình soạn thảo hoặc file HTML của bạn.
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
                        <pre className="p-3 rounded-xl bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-40">
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
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
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
                <span>Checklist 6 Tiêu Chí Tự Kiểm Tra</span>
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
                href="/dang-bai"
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Vào Phòng Soạn Thảo</span>
              </Link>

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
