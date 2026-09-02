'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Heart, 
  FileText, 
  ListChecks, 
  HelpCircle, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  AlertTriangle, 
  Check, 
  Copy, 
  PlusCircle, 
  Search, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  Lightbulb, 
  Star,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

export interface CatholicBlockTemplate {
  id: string;
  name: string;
  category: 'scripture_prayer' | 'research_theology' | 'media' | 'callout';
  categoryLabel: string;
  icon: React.ReactNode;
  badge: string;
  description: string;
  guidance: string;
  htmlSnippet: string;
  previewType?: string;
  variants?: Array<{
    name: string;
    description: string;
    snippet: string;
  }>;
}

export const CATHOLIC_BLOCK_TEMPLATES: CatholicBlockTemplate[] = [
  // ─── 1. KHỐI LỜI CHÚA SOI ĐƯỜNG ──────────────────────────────────────────
  {
    id: 'sacred-scripture',
    name: '1. Lời Chúa Soi Đường (Sacred Scripture)',
    category: 'scripture_prayer',
    categoryLabel: 'Kinh Thánh & Cầu Nguyện',
    icon: <BookOpen className="w-5 h-5 text-amber-500" />,
    badge: 'Phụng Vụ Lời Chúa',
    description: 'Trích dẫn Lời Chúa nổi bật với viền vàng Thánh Linh, biểu tượng Lời Chúa và nút tra cứu Kinh Thánh trực tiếp trên VERIDU.',
    guidance: 'Dùng để làm nổi bật Lời Chúa trong các bài khảo luận, suy niệm hoặc bài giảng. Luôn gắn kèm mã tra cứu sách-chương-câu (VD: Ga 3:30) để độc giả có thể nhấp và đối chiếu trực tiếp với bản dịch phụng vụ.',
    htmlSnippet: `<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “Ngài phải nổi bật lên, còn tôi phải lu mờ đi.”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="/kinh-thanh/ga/3" target="_blank" rel="noopener noreferrer" title="Tra cứu Lời Chúa trong Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>Ga 3:30</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>`
  },

  // ─── 2. KHỐI THƠ & LỜI NGUYỆN KÍNH ───────────────────────────────────────
  {
    id: 'poetry-prayer',
    name: '2. Thơ Phụng Vụ & Lời Nguyện Kính (Prayer & Poetry)',
    category: 'scripture_prayer',
    categoryLabel: 'Kinh Thánh & Cầu Nguyện',
    icon: <Heart className="w-5 h-5 text-indigo-500" />,
    badge: 'Tâm Tình Phụng Vụ',
    description: 'Khung thơ phụng vụ và lời cầu nguyện sốt mến với sắc tím Đức Mẹ, chữ nghiêng Lora và chữ Amen kết thúc trang trọng.',
    guidance: 'Thích hợp đặt ở cuối bài viết để độc giả cùng hiệp ý cầu nguyện, hoặc dùng cho các bài thánh thi, thơ linh hướng.',
    htmlSnippet: `<div class="prayer-block my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 shadow-xl backdrop-blur-md not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif mb-3">
    <span>🕊️</span> LỜI NGUYỆN KÍNH PHỤNG VỤ
  </div>
  <p class="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed m-0">
    “Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...”
  </p>
  <div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">Amen.</div>
</div>`,
    variants: [
      {
        name: 'Thơ Phụng Vụ (.poetry-block)',
        description: 'Định dạng câu thơ thụt lề trang trọng',
        snippet: `<div class="poetry-block not-prose">
  <div class="poetry-verse">
    Lạy Chúa Từ Nhân, xin làm cho con thành khí cụ bình an của Chúa.<br>
    Để con đem yêu thương vào nơi oán thù, đem thứ tha vào nơi lăng nhục...
  </div>
</div>`
      },
      {
        name: 'Lời Nguyện Kính (.prayer-block)',
        description: 'Lời nguyện sốt mến với sắc tím Stained-Glass & Amen',
        snippet: `<div class="prayer-block my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 shadow-xl backdrop-blur-md not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif mb-3">
    <span>🕊️</span> LỜI NGUYỆN KÍNH PHỤNG VỤ
  </div>
  <p class="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed m-0">
    “Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...”
  </p>
  <div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">Amen.</div>
</div>`
      }
    ]
  },

  // ─── 3. BẢN TÓM TẮT NGHIÊN CỨU THẦN HỌC ─────────────────────────────────
  {
    id: 'abstract-research',
    name: '3. Bản Tóm Tắt Nghiên Cứu Thần Học (Abstract Research Card)',
    category: 'research_theology',
    categoryLabel: 'Khảo Cứu & Thuật Ngữ',
    icon: <FileText className="w-5 h-5 text-indigo-500" />,
    badge: 'Học Thuật VERIDU RESEARCH',
    description: 'Thẻ tóm tắt học thuật cao cấp với huy hiệu VERIDU RESEARCH, nền kính mờ Stained-Glass và danh mục từ khóa chủ đề (#Theotokos).',
    guidance: 'Dành cho bài khảo luận chuyên sâu, bài viết nghiên cứu Giáo luật hoặc Thần học tín lý. Đặt ngay sau phần dẫn nhập (Introduction) để độc giả nắm bắt luận điểm chính.',
    htmlSnippet: `<div class="abstract-research my-8 p-6 sm:p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 shadow-xl backdrop-blur-md space-y-4 not-prose">
  <div class="abstract-header flex items-center justify-between border-b border-indigo-500/20 pb-3">
    <span class="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif">
      <span>📖</span> TÓM TẮT NGHIÊN CỨU THẦN HỌC
    </span>
    <span class="abstract-badge text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold font-mono">
      VERIDU RESEARCH
    </span>
  </div>
  <p class="font-serif text-sm sm:text-base leading-relaxed text-[var(--text-main)] m-0">
    Khảo luận chuyên sâu về nền tảng tín lý và bối cảnh lịch sử của Tín Điều Theotokos tại Công đồng Êphêsô (431), làm rõ sự hiệp nhất hai bản tính trong duy nhất một Ngôi Vị Thiên Chúa.
  </p>
  <div class="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/10">
    <span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#Theotokos</span>
    <span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#Epheso431</span>
    <span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#KitoHoc</span>
  </div>
</div>`
  },

  // ─── 4. BẢNG DANH MỤC BẰNG CHỨNG THÁNH KINH ─────────────────────────────
  {
    id: 'scripture-meta',
    name: '4. Bảng Danh Mục Bằng Chứng Thánh Kinh (Scripture Meta Claims)',
    category: 'research_theology',
    categoryLabel: 'Khảo Cứu & Thuật Ngữ',
    icon: <ListChecks className="w-5 h-5 text-amber-500" />,
    badge: 'Chứng Cứ Kinh Thánh',
    description: 'Bảng tổng hợp luận điểm tín lý kèm các chỉ dẫn câu Kinh Thánh đối chiếu song song rõ ràng, rành mạch.',
    guidance: 'Hữu ích trong các bài hộ giáo, so sánh đối chiếu Cựu Ước - Tân Ước, hoặc chứng minh tín lý Hội Thánh bằng Lời Chúa.',
    htmlSnippet: `<div class="scripture-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose">
  <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3">
    <span>📜</span> DANH MỤC BẰNG CHỨNG THÁNH KINH
  </div>
  <div class="space-y-3">
    <div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60">
      <span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Hòm Bia Giao Ước Mới:</span>
      <span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">Xh 40,34-35; Lc 1,35; Kh 11,19</span>
    </div>
    <div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60">
      <span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Đấng Trung Gian Duy Nhất:</span>
      <span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">1Tm 2,5; Dt 9,15</span>
    </div>
    <div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60">
      <span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Thẩm Quyền Chìa Khóa Nước Trời:</span>
      <span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">Is 22,22; Mt 16,19</span>
    </div>
  </div>
</div>`
  },

  // ─── 5. KHỐI THUẬT NGỮ GIÁO LÝ & THẦN HỌC ────────────────────────────────
  {
    id: 'dictionary-meta',
    name: '5. Khối Thuật Ngữ Giáo Lý & Thần Học (Theological Dictionary)',
    category: 'research_theology',
    categoryLabel: 'Khảo Cứu & Thuật Ngữ',
    icon: <HelpCircle className="w-5 h-5 text-indigo-500" />,
    badge: 'Từ Điển Tín Lý',
    description: 'Khối giải nghĩa thuật ngữ chuyên ngành có từ nguyên Hy Lạp/Latin và định nghĩa tín lý chuẩn xác.',
    guidance: 'Dùng khi bài viết xuất hiện các thuật ngữ chuyên sâu (Theotokos, Transubstantiatio, Hypostatic Union...) giúp giáo dân dễ dàng hiểu đúng nghĩa tín lý.',
    htmlSnippet: `<div class="dictionary-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose">
  <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3">
    <span>📚</span> THUẬT NGỮ GIÁO LÝ & THẦN HỌC
  </div>
  <div class="space-y-3">
    <div class="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
      <div class="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <span>Theotokos</span>
        <span class="text-[10px] font-mono text-[var(--text-muted)] font-normal">(Hy Lạp: Θεοτόκος)</span>
      </div>
      <p class="text-xs text-[var(--text-main)] leading-relaxed m-0">
        Tước hiệu Mẹ Thiên Chúa, được tuyên tín tại Công đồng Êphêsô (431) nhằm khẳng định Đức Kitô là Thiên Chúa thật và con người thật.
      </p>
    </div>
    <div class="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
      <div class="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <span>Hypostatic Union</span>
        <span class="text-[10px] font-mono text-[var(--text-muted)] font-normal">(Latin: Unio Hypostatica)</span>
      </div>
      <p class="text-xs text-[var(--text-main)] leading-relaxed m-0">
        Hiệp nhất Ngôi vị: Hai bản tính thần tính và nhân tính kết hợp trọn vẹn trong duy nhất Ngôi Hai Thiên Chúa.
      </p>
    </div>
  </div>
</div>`,
    variants: [
      {
        name: 'Hộp Từ Điển (.dictionary-meta)',
        description: 'Thẻ danh mục thuật ngữ kèm từ nguyên',
        snippet: `<div class="dictionary-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose">
  <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3">
    <span>📚</span> THUẬT NGỮ GIÁO LÝ & THẦN HỌC
  </div>
  <div class="space-y-3">
    <div class="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1">
      <div class="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <span>Theotokos</span>
        <span class="text-[10px] font-mono text-[var(--text-muted)] font-normal">(Hy Lạp: Θεοτόκος)</span>
      </div>
      <p class="text-xs text-[var(--text-main)] leading-relaxed m-0">
        Tước hiệu Mẹ Thiên Chúa, được tuyên tín tại Công đồng Êphêsô (431) nhằm khẳng định Đức Kitô là Thiên Chúa thật.
      </p>
    </div>
  </div>
</div>`
      },
      {
        name: 'Thuật ngữ lồng trong dòng (.veridu-term)',
        description: 'Thẻ chú thích lồng trong đoạn văn có gạch chân nét đứt',
        snippet: `<dfn class="veridu-term" title="Mẹ Thiên Chúa (Theotokos) - Tín điều Công đồng Êphêsô 431">Theotokos</dfn>`
      }
    ]
  },

  // ─── 6. HÌNH ẢNH PHỤNG VỤ KÈM CHÚ THÍCH & LIGHTBOX ──────────────────────
  {
    id: 'liturgical-image',
    name: '6. Hình Ảnh Phụng Vụ Kèm Chú Thích (Image & Lightbox)',
    category: 'media',
    categoryLabel: 'Hình Ảnh & Media',
    icon: <ImageIcon className="w-5 h-5 text-emerald-500" />,
    badge: 'Nghệ Thuật Thánh',
    description: 'Khung hiển thị hình ảnh nghệ thuật thánh với viền kính mờ, hỗ trợ nhấp chuột phóng to (Lightbox) và chú thích nguồn tác phẩm.',
    guidance: 'Hỗ trợ link ảnh trực tiếp hoặc link Google Drive (hệ thống tự động chuyển đổi). Khi có thuộc tính data-lightbox="true", độc giả nhấp vào sẽ mở màn hình phóng to toàn cảnh.',
    htmlSnippet: `<figure class="veridu-image-block my-8 mx-auto text-center not-prose">
  <img 
    src="https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80" 
    alt="Bích họa Nghệ Thuật Thánh Đường Công Giáo" 
    data-lightbox="true"
    referrerpolicy="no-referrer"
    class="max-w-full h-auto rounded-3xl shadow-2xl mx-auto block cursor-zoom-in hover:scale-[1.01] transition-transform duration-300 border border-[var(--border-card)]"
  />
  <figcaption class="mt-3 text-xs italic text-[var(--text-muted)] font-serif max-w-xl mx-auto">
    Bích họa Nghệ Thuật Thánh Đường Công Giáo — Kiệt tác nghệ thuật phụng vụ Kitô giáo thế kỷ XVI.
  </figcaption>
</figure>`
  },

  // ─── 7. KHUNG VIDEO / ÂM THANH NHÚNG 16:9 ────────────────────────────────
  {
    id: 'media-embed',
    name: '7. Khung Video & Âm Thanh Nhúng 16:9 (Media Embed)',
    category: 'media',
    categoryLabel: 'Hình Ảnh & Media',
    icon: <VideoIcon className="w-5 h-5 text-red-500" />,
    badge: 'Đa Phương Tiện',
    description: 'Khung nhúng video YouTube/Vimeo hoặc file âm thanh Thánh Ca tỷ lệ vàng 16:9 bo góc mượt mà.',
    guidance: 'Dùng để nhúng bài thánh ca, video bài giảng, phim tài liệu thánh tích hoặc phóng sự Hội Thánh. Thay ID video vào đường link src="https://www.youtube.com/embed/VIDEO_ID".',
    htmlSnippet: `<div class="veridu-embed-video w-full aspect-video rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-8 bg-black relative z-10 not-prose">
  <iframe 
    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
    class="w-full h-full border-none" 
    title="Video Phụng Vụ VERIDU"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>`,
    variants: [
      {
        name: 'Video Nhúng 16:9 (.veridu-embed-video)',
        description: 'Tự co giãn chuẩn 16:9 cho YouTube / Vimeo',
        snippet: `<div class="veridu-embed-video w-full aspect-video rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-8 bg-black relative z-10 not-prose">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    class="w-full h-full border-none" 
    title="Video Phụng Vụ VERIDU"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>`
      },
      {
        name: 'Trình Phát Âm Thanh (.veridu-embed-audio)',
        description: 'Khung nghe Thánh Ca / Bài Giảng Audio',
        snippet: `<div class="veridu-embed-audio my-8 p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg not-prose">
  <div class="text-xs font-bold text-amber-600 dark:text-amber-400 font-serif mb-2 flex items-center gap-1.5">
    <span>🎵</span> THÁNH CA SUY NIỆM
  </div>
  <audio controls class="w-full">
    <source src="https://example.com/audio.mp3" type="audio/mpeg">
    Trình duyệt không hỗ trợ phát âm thanh.
  </audio>
</div>`
      }
    ]
  },

  // ─── 8. HỘP LƯU Ý & CẢNH BÁO GIÁO LÝ (4 MỨC ĐỘ) ──────────────────────────
  {
    id: 'catechetical-callout',
    name: '8. Hộp Lưu Ý & Cảnh Báo Giáo Lý (Catechetical Callouts - 4 Mức Độ)',
    category: 'callout',
    categoryLabel: 'Lưu Ý & Cảnh Báo',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    badge: '4 Cấp Phụng Vụ',
    description: 'Hộp nhấn mạnh thông điệp với 4 phân cấp phụng vụ: Lưu Ý Thần Học (Xanh dương), Mẹo Suy Niệm (Xanh lá), Quan Trọng Tín Lý (Vàng kim), Cảnh Báo Tín Lý (Đỏ).',
    guidance: 'Dùng để nhấn mạnh những điểm lưu ý thần học trọng yếu, tránh các ngộ nhận giáo lý hoặc cảnh báo các quan điểm sai lệch.',
    htmlSnippet: `<!-- Mức 1: Lưu Ý Thần Học (Blue Note) -->
<div class="catechetical-callout callout-note my-6 p-5 sm:p-6 border-l-4 border-blue-500 rounded-r-2xl bg-blue-500/10 text-blue-900 dark:text-blue-200 backdrop-blur-md shadow-md space-y-1.5 not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
    <span>ℹ️</span> LƯU Ý THẦN HỌC
  </div>
  <div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">
    Các văn kiện Huấn Quyền cần được đọc trong sự liên tục của Thánh Truyền và sự hướng dẫn của Thánh Thần.
  </div>
</div>`,
    variants: [
      {
        name: 'Mức 1: Lưu Ý Thần Học (Blue Note)',
        description: 'Thông tin chú giải, bổ túc kiến thức thần học',
        snippet: `<div class="catechetical-callout callout-note my-6 p-5 sm:p-6 border-l-4 border-blue-500 rounded-r-2xl bg-blue-500/10 text-blue-900 dark:text-blue-200 backdrop-blur-md shadow-md space-y-1.5 not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
    <span>ℹ️</span> LƯU Ý THẦN HỌC
  </div>
  <div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">
    Các văn kiện Huấn Quyền cần được đọc trong sự liên tục của Thánh Truyền và sự hướng dẫn của Thánh Thần.
  </div>
</div>`
      },
      {
        name: 'Mức 2: Mẹo Suy Niệm (Emerald Tip)',
        description: 'Gợi ý cầu nguyện, chuẩn bị tâm hồn sốt sắng',
        snippet: `<div class="catechetical-callout callout-tip my-6 p-5 sm:p-6 border-l-4 border-emerald-500 rounded-r-2xl bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow-md space-y-1.5 not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
    <span>🌱</span> MẸO SUY NIỆM PHỤNG VỤ
  </div>
  <div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">
    Hãy dành 5 phút tĩnh lặng trước Thánh Thể để đón nhận ơn soi sáng trước khi khởi đầu phần suy niệm.
  </div>
</div>`
      },
      {
        name: 'Mức 3: Quan Trọng: Tín Lý (Amber Important)',
        description: 'Điểm giáo lý cốt lõi buộc phải ghi nhớ',
        snippet: `<div class="catechetical-callout callout-important my-6 p-5 sm:p-6 border-l-4 border-amber-500 rounded-r-2xl bg-amber-500/10 text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-md space-y-1.5 not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
    <span>⭐</span> QUAN TRỌNG: TÍN LÝ HỘI THÁNH
  </div>
  <div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">
    Tín điều về Bí tích Thánh Thể là trung tâm và tột đỉnh của toàn bộ đời sống Kitô hữu (Lumen Gentium, 11).
  </div>
</div>`
      },
      {
        name: 'Mức 4: Cảnh Báo Tín Lý (Red Warning)',
        description: 'Cảnh báo lạc giáo, sai lầm thần học nghiêm trọng',
        snippet: `<div class="catechetical-callout callout-warning my-6 p-5 sm:p-6 border-l-4 border-red-500 rounded-r-2xl bg-red-500/10 text-red-900 dark:text-red-200 backdrop-blur-md shadow-md space-y-1.5 not-prose">
  <div class="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
    <span>⚠️</span> CẢNH BÁO TÍN LÝ
  </div>
  <div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">
    Tránh nhầm lẫn giữa Tước hiệu Mẹ Thiên Chúa (Theotokos) với các quan niệm thần thoại coi Đức Maria là một Nữ Thần.
  </div>
</div>`
      }
    ]
  }
];

interface CatholicBlockInserterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (htmlSnippet: string) => void;
}

export default function CatholicBlockInserterModal({
  isOpen,
  onClose,
  onInsertHtml
}: CatholicBlockInserterModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(CATHOLIC_BLOCK_TEMPLATES[0].id);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [showCode, setShowCode] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter templates
  const filteredTemplates = CATHOLIC_BLOCK_TEMPLATES.filter((block) => {
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    const matchesSearch = 
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.guidance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentBlock = CATHOLIC_BLOCK_TEMPLATES.find((b) => b.id === selectedBlockId) || filteredTemplates[0] || CATHOLIC_BLOCK_TEMPLATES[0];

  const currentSnippet = (currentBlock.variants && currentBlock.variants[selectedVariantIdx]) 
    ? currentBlock.variants[selectedVariantIdx].snippet 
    : currentBlock.htmlSnippet;

  const handleCopy = (snippet: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  const handleInsert = (snippet: string) => {
    onInsertHtml(snippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="catholic-modal-title"
        className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900/95 text-slate-100 rounded-3xl border border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden z-10 backdrop-blur-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="catholic-modal-title" className="text-lg sm:text-xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-white flex items-center gap-2">
                Sổ Tay 8 Khối Chuẩn Công Giáo VERIDU
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Quy chuẩn thiết kế Stained-Glass & công cụ chèn khối 1-click cho người soạn thảo
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Đóng bảng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar & Search */}
        <div className="px-6 py-3 border-b border-white/10 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide text-xs font-semibold">
            {[
              { id: 'all', label: 'Tất Cả (8 Khối)' },
              { id: 'scripture_prayer', label: '📖 Kinh Thánh & Cầu Nguyện' },
              { id: 'research_theology', label: '🎓 Khảo Cứu & Thuật Ngữ' },
              { id: 'media', label: '🎨 Hình Ảnh & Media' },
              { id: 'callout', label: '⚠️ Lưu Ý & Cảnh Báo' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm khối mẫu..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
        </div>

        {/* Modal Main Body: Left Master List (35%) + Right Detail & Live Preview (65%) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT LIST OF BLOCKS */}
          <div className="w-full md:w-[340px] lg:w-[360px] border-r border-white/10 bg-slate-950/40 overflow-y-auto p-3 space-y-2 shrink-0 custom-scrollbar">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy khối mẫu phù hợp với từ khóa.
              </div>
            ) : (
              filteredTemplates.map((block) => {
                const isSelected = block.id === currentBlock.id;
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setSelectedVariantIdx(0);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl border ${
                        isSelected 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-amber-400'
                      }`}>
                        {block.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-xs font-bold truncate ${
                            isSelected ? 'text-amber-300 font-serif' : 'text-slate-200'
                          }`}>
                            {block.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {block.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-400">
                            {block.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT DETAIL & LIVE PREVIEW CANVAS */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
            
            {/* Action Bar & Theme Toggle */}
            <div className="px-6 py-3 border-b border-white/10 bg-slate-950/30 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold text-amber-400">
                  {currentBlock.name}
                </span>

                {/* Sub-variant tabs if available */}
                {currentBlock.variants && currentBlock.variants.length > 0 && (
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 ml-2">
                    {currentBlock.variants.map((v, vIdx) => (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => setSelectedVariantIdx(vIdx)}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                          selectedVariantIdx === vIdx
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Switch between Preview and Code view */}
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                    showCode 
                      ? 'bg-indigo-600 text-white border-indigo-400' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="Chuyển đổi giữa xem Visual Preview và xem mã HTML thô"
                >
                  {showCode ? '👁️ Xem Trực Quan' : '💻 Mã HTML'}
                </button>

                {/* Theme Mode Selector for Preview */}
                <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('dark')}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      previewTheme === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Xem thử giao diện Dark Mode (Mặc định)"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('light')}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      previewTheme === 'light' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Xem thử giao diện Light Mode (Nền sáng)"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Box & Guidance Section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Guidance / Catechetical Handbook Note */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed text-amber-200/90 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 uppercase tracking-wide font-mono text-[10px]">
                    Sổ Tay Biên Tập Phụng Vụ:
                  </span>
                  <p className="m-0 font-serif">
                    {currentBlock.guidance}
                  </p>
                </div>
              </div>

              {/* LIVE VISUAL PREVIEW CANVAS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                    {showCode ? 'Mã Nguồn HTML Chuẩn Tắc:' : `Hiển Thị Trực Quan (${previewTheme.toUpperCase()} MODE):`}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Class: {currentBlock.id}
                  </span>
                </div>

                {showCode ? (
                  /* RAW HTML VIEW */
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-4">
                    <pre className="text-xs font-mono text-amber-300 whitespace-pre-wrap overflow-x-auto selection:bg-amber-500 selection:text-slate-950 leading-relaxed">
                      {currentSnippet}
                    </pre>
                  </div>
                ) : (
                  /* LIVE RENDER CANVAS */
                  <div 
                    className={`rounded-2xl p-6 sm:p-8 border transition-all duration-300 overflow-hidden shadow-2xl ${
                      previewTheme === 'dark' 
                        ? 'bg-slate-950 text-slate-100 border-white/10 dark' 
                        : 'bg-[#fcfbfa] text-slate-900 border-slate-200 light'
                    }`}
                  >
                    <div 
                      className="preview-block-container"
                      dangerouslySetInnerHTML={{ __html: currentSnippet }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Footer Actions: Insert & Copy */}
            <div className="px-6 py-4 border-t border-white/10 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400 font-sans hidden sm:block">
                ✨ Nhấn <strong className="text-amber-300">Chèn Khối Này</strong> để đưa mẫu chuẩn vào bài viết ngay tức thì.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* 1-Click Copy HTML Code */}
                <button
                  type="button"
                  onClick={() => handleCopy(currentSnippet, currentBlock.id)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:border-white/20 active:scale-95"
                >
                  {copiedId === currentBlock.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Đã Sao Chép HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" />
                      <span>Sao Chép Mã HTML</span>
                    </>
                  )}
                </button>

                {/* 1-Click Insert into Live Editor */}
                <button
                  type="button"
                  onClick={() => handleInsert(currentSnippet)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 border border-amber-400/50"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>Chèn Khối Này</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
