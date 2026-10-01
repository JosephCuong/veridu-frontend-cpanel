# CẨM NANG QUY CHUẨN SOẠN THẢO BÀI VIẾT VERIDU
## (VERIDU CANONICAL ARTICLE SPECIFICATION & AGENT AUTHORING GUIDE)

> **Dành cho**: Trợ lý AI (Writing Agents), Ban Học Vụ, Giảng Viên & Tác Giả Nghiên Cứu.  
> **Bài viết hình mẫu kim cương tham chiếu**: [Danh Xưng YHWH Và Căn Tính Độc Thần Của Đức Chúa](https://www.cruxveritatis.org/danh-xung-yhwh-va-can-tinh-doc-than-cua-duc-chua) & [Vương Quốc Israel Cổ Đại — ID #48](https://www.cruxveritatis.org/vuong-quoc-israel-co-dai-khao-co-hoc-can-dong-buoc-ngoat-lich-su-va-hanh-trinh-duc-tin-doc-than)  
> **Định dạng chuẩn tắc**: Tệp HTML Đầy Đủ (Standalone Previewable HTML) có thẻ `<head>`, biến CSS `:root`, typography Lora/Inter và cổ ngữ Hebrew `.hebrew-inline`.  
> **Bản dịch Kinh Thánh chuẩn**: Cố Lm. Nguyễn Thế Thuấn, CSsR (NTT) kèm chú dẫn nguồn bắt buộc.  

---

## 1. NGUYÊN TẮC PHÂN ĐỊNH KIẾN TRÚC: CỐ ĐỊNH VS LINH HOẠT

Khi Agent tạo hoặc xuất bản bài viết trên VERIDU, hệ thống Frontend Next.js đã tự động bọc ngoài một **Khung Cố Định (System Shell)**. Agent **TUYỆT ĐỐI KHÔNG** lặp lại các phần cố định này trong mã HTML của thân bài:

### A. Các phần CỐ ĐỊNH (Hệ thống tự động render — KHÔNG viết trong HTML):
1. **Header & Thanh điều hướng phụng vụ**: Logo, Menu 73 Sách Kinh Thánh, Thư Viện, Đóng Góp, Ngôn Ngữ, Dark/Light Mode.
2. **Nút Quay lại & Breadcrumb**: `Quay Lại Thư Viện`.
3. **Ảnh Bìa Hero Banner**: Lấy từ trường `featured_image` trong database, hiển thị tràn viền với gradient chuyển tiếp.
4. **Tiêu Đề Lớn H1**: Lấy từ trường `title` trong database.
5. **Dòng Thông Tin Tác Giả & Xuất Bản (MetaDataRow)**: Tên tác giả có huy hiệu xác thực, ngày đăng, thời lượng đọc, chuyên mục, biểu tượng Podcast/Video.
6. **Thanh Thông Báo & Chuyển Đổi Bản Dịch (`ArticleLanguageBanner`)**: Quản lý song ngữ, nút Quick Translate cho Admin, nút Đóng góp bản dịch cho học giả.
7. **Thanh Mục Lục Tự Động Trượt (Sticky Table of Contents - TOC)**: Tự động quét các thẻ `<h2>`, `<h3>` trong bài để sinh mục lục mượt mà bên phải màn hình.
8. **Khối Khảo Cổ & Dòng Thời Gian (`ArticleGeoTimelineWidget`)**: Tự động hiển thị bản đồ tọa độ và dòng thời gian ANE ở cuối bài.
9. **Thẻ Tác Giả Chuyên Sâu (`ArticleAuthorCard`)**: Avatar, Giáo phận, Giáo xứ, Bút danh, Tiểu sử học thuật.
10. **Chia Sẻ & Trích Dẫn Chuẩn Mực (`ShareButtons`, `ArticleCitationAndLicense`)**: Mã trích dẫn học thuật APA/Chicago và giấy phép Creative Commons CC BY-NC-SA 4.0.

### B. Phần LINH HOẠT (Thân bài do Agent biên soạn trong trường `content`):
Toàn bộ mã HTML do Agent sinh ra phải nằm trọn trong thẻ bọc duy nhất:
```html
<article class="veridu-scholarly-article">
  <!-- Toàn bộ nội dung bài viết và các khối chuẩn nằm tại đây -->
</article>
```

---

## 2. BẢNG DANH MỤC 8 KHỐI NỘI DUNG PHỤNG VỤ & KHẢO CỔ

| STT | Tên Khối | Thẻ & Class CSS Bắt Buộc | Mục Đích Sử Dụng |
| :---: | :--- | :--- | :--- |
| **1** | **Bản Tóm Tắt Nghiên Cứu** | `<div class="abstract-research">` | Mở đầu bài viết, đặt câu hỏi nghịch lý hiện sinh, tóm tắt phát hiện và gắn `#tags`. |
| **2** | **Lời Chúa Soi Đường** | `<div class="sacred-scripture veridu-scripture-quote">` | Trích dẫn câu Lời Chúa cốt lõi kèm liên kết tra cứu Kinh Thánh trực tiếp (`/kinh-thanh/... ↗`). |
| **3** | **Điểm Giáo Lý Trọng Tâm** | `<div class="catechetical-callout callout-important">` | Nêu bật mầu nhiệm tín lý, trích dẫn Giáo Lý Hội Thánh Công Giáo (CCC) hoặc Công Đồng. |
| **4** | **Lưu Ý Học Vụ** | `<div class="catechetical-callout callout-note">` | Lưu ý bối cảnh văn hóa, ngôn ngữ nguyên ngữ (Do Thái, Hy Lạp, Latinh, Aramaic). |
| **5** | **Hình Ảnh Khảo Cổ / Nghệ Thuật** | `<figure class="wp-block-image veridu-image-block">` | Hình ảnh di vật khảo cổ, bản đồ, tranh thánh kèm chú thích và tính năng phóng to (Lightbox). |
| **6** | **Trích Dẫn Điểm Nhấn (Pull Quote)** | `<aside class="veridu-pull-quote">` | Trích đoạn tư tưởng triết học / thần học đắt giá nhất của phân đoạn. |
| **7** | **Lời Nguyện Kính Phụng Vụ** | `<div class="prayer-block">` | Kết đọng tâm tình cầu nguyện phụng vụ trước khi bước vào các bảng tra cứu cuối bài. |
| **8** | **Khung Audio / Podcast Học Thuật** | `<div class="veridu-embed-audio">` | Nhúng file ghi âm bài giảng, suy niệm hoặc đối thoại chuyên đề (nếu có file MP3). |

---

## 3. BẢNG DANH MỤC 4 KHỐI KẾT THÚC HỌC THUẬT BẮT BUỘC (SCHOLARLY CLOSING QUADRANT)

Bất kỳ bài viết tiêu chuẩn nào trên VERIDU đều **BẮT BUỘC** phải kết thúc bằng 4 khối theo đúng thứ tự sau:

1. **Khối I: Chú Thích Học Thuật 2 Chiều (`.veridu-footnotes`)**:
   Danh sách chú giải nguồn gốc, số trang, bảo tàng lưu trữ hiện vật, liên kết đối chiếu 2 chiều (`<sup class="veridu-footnote"><a href="#fn1" id="ref1">1</a></sup>` ↔ `<li id="fn1">... <a href="#ref1" class="footnote-backref">↩︎</a></li>`).
2. **Khối II: Tham Chiếu Bản Văn Thánh Kinh Trọng Tâm (`.scripture-meta`)**:
   Hệ thống các câu Kinh Thánh làm nền tảng cho luận điểm, chia theo từng luận cứ với các badge tra cứu (`<span class="verse-badge">St 12:1–3</span>`).
3. **Khối III: Tra Cứu Thuật Ngữ Thần Học & Khảo Cổ Học (`.dictionary-meta`)**:
   Bảng thuật ngữ chuyên sâu giải nghĩa từ ngữ gốc (Hebrew, Greek, Latin, ANE) phục vụ độc giả tra cứu nhanh.
4. **Khối IV: Thư Mục Tài Liệu Tham Khảo Chuẩn Mực (`.bibliography`)**:
   Danh mục các văn kiện Giáo hội (Vaticano II, Giáo Hoàng), giáo trình Đại Chủng Viện và công trình khảo cổ học quốc tế uy tín theo chuẩn Chicago/Turabian.

---

## 4. CÚ PHÁP CHI TIẾT TỪNG KHỐI (COPY & PASTE MẪU)

### 1. Bản Tóm Tắt Nghiên Cứu Thần Học (`.abstract-research`)
```html
<div class="abstract-research">
  <div class="abstract-header">
    <span class="abstract-title">
      <svg class="w-4 h-4 text-amber-500 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      TÓM TẮT NGHIÊN CỨU THẦN HỌC
    </span>
    <span class="abstract-badge">VERIDU RESEARCH</span>
  </div>
  <p class="abstract-body leading-relaxed my-4 text-[var(--text-main)] text-base sm:text-lg">
    [Đoạn văn mở đầu bằng câu hỏi nghịch lý hiện sinh sâu sắc, tóm lược trục sử liệu ANE và chiều kích thần học cứu độ của bài viết...]
  </p>
  <div class="abstract-tags">
    <span class="tag-badge">#KinhThanh</span>
    <span class="tag-badge">#KhaoCoHocANE</span>
    <span class="tag-badge">#GiaoPhuHoc</span>
    <span class="tag-badge">#QuyKito</span>
  </div>
</div>
```

---

### 2. Tiêu Đề Phân Đoạn La Mã (H2 Heading) & Đoạn Văn Chuẩn
```html
<h2 class="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)] mt-10 mb-4 leading-tight border-b border-[var(--border-card)] pb-2">
  I. Tiêu Đề Phân Đoạn La Mã Viết Hoa Từng Từ
</h2>

<p class="leading-relaxed my-4 text-[var(--text-main)] text-base sm:text-lg">
  Văn bản nội dung phân tích sâu sắc, sử dụng thể văn Công giáo trang nhã. Khi nhắc đến các thuật ngữ chuyên sâu, dùng thẻ <dfn class="veridu-term" title="Giải thích ngắn gọn xuất hiện khi rê chuột hoặc bấm trên điện thoại" data-base="TuGoc">Thuật Ngữ Hiển Thị</dfn>. Khi dẫn nguồn, gắn chú thích đánh số ở cuối câu<sup class="veridu-footnote"><a href="#fn1" id="ref1" class="footnote-ref" title="Xem chú thích 1">1</a></sup>.
</p>
```

---

### 3. Khối Lời Chúa Soi Đường (`.sacred-scripture`)
```html
<div class="sacred-scripture veridu-scripture-quote">
  <div class="flex items-start gap-4">
    <div class="icon-box w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2 flex-1">
      <blockquote class="border-l-4 border-amber-500/80 bg-amber-500/5 p-4 rounded-r-2xl italic text-[var(--text-main)] my-2">
        “Lời trích dẫn Kinh Thánh theo bản dịch chuẩn Cố Lm. Nguyễn Thế Thuấn...”
      </blockquote>
      <div>
        <a href="/kinh-thanh/1-sm/8" target="_blank" title="Tra cứu trong Kinh Thánh VERIDU" class="scripture-link-badge text-amber-600 dark:text-amber-400 font-bold hover:underline transition-colors text-xs inline-flex items-center gap-1">
          <span>1 Sm 8:7 (NTT)</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  </div>
</div>
```

---

### 4. Hộp Giáo Lý Trọng Tâm (`.catechetical-callout`)
```html
<div class="catechetical-callout callout-important">
  <div class="callout-header font-serif font-bold text-amber-500 flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    ĐIỂM TÍN LÝ TRỌNG TÂM: MẦU NHIỆM GIAO ƯỚC
  </div>
  <div class="callout-body text-sm leading-relaxed text-slate-200">
    Theo Giáo lý Hội Thánh Công Giáo (GLHTCG số 108–109) và Hiến chế Dei Verbum số 13...
  </div>
</div>
```

---

### 5. Hình Ảnh Khảo Cổ / Nghệ Thuật Kèm Lightbox (`.veridu-image-block`)
```html
<figure class="wp-block-image veridu-image-block my-8">
  <img 
    src="https://lh3.googleusercontent.com/d/MA_ANH_GOOGLE_DRIVE_HOAC_URL" 
    alt="Mô tả chính xác hiện vật hoặc bản đồ khảo cổ" 
    data-lightbox="true" 
    referrerpolicy="no-referrer" 
    class="max-w-full h-auto rounded-2xl shadow-2xl my-4 cursor-zoom-in hover:scale-[1.01] transition-all duration-300 mx-auto block border border-white/10"
  />
  <figcaption class="text-center text-xs text-[var(--text-muted)] italic mt-2 font-serif">
    Bia đá Tel Dan (thế kỷ IX TCN) với dòng chữ khắc 'Nhà Đavít' (BYTDWD), chứng cứ khảo cổ học vững chắc về vương triều Đavít.
  </figcaption>
</figure>
```

---

### 6. Trích Dẫn Điểm Nhấn (`.veridu-pull-quote`)
```html
<aside class="veridu-pull-quote my-8 p-6 sm:p-8 rounded-2xl border-l-4 border-amber-500 bg-amber-500/5 font-serif italic text-lg sm:text-xl text-[var(--text-main)] leading-relaxed text-center sm:text-left">
  "Mọi vương quyền trần thế dẫu uy nghi đến đâu rồi cũng sẽ qua đi, duy chỉ có Lời Thiên Chúa và Vương Quốc Tình Yêu của Đức Kitô là tồn tại đến muôn thuở muôn đời."
</aside>
```

---

### 7. Khối Lời Nguyện Kính Phụng Vụ (`.prayer-block`)
```html
<div class="prayer-block my-10 p-6 sm:p-8 rounded-3xl bg-amber-500/5 border border-amber-500/25 text-center space-y-4">
  <div class="prayer-title font-serif font-bold text-amber-500 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
    LỜI NGUYỆN KÍNH PHỤNG VỤ
  </div>
  <p class="prayer-text font-serif italic text-base sm:text-lg text-[var(--text-main)] leading-relaxed max-w-2xl mx-auto">
    “Lạy Đức Chúa là Thiên Chúa của Giao Ước, Đấng hằng trung tín qua muôn thế hệ. Xin cho chúng con luôn biết tựa nương vào Lời Hằng Sống, thanh luyện tâm hồn khỏi mọi thần tượng hư ảo, để bước đi trong ánh sáng Vương Quốc Vĩnh Cửu của Đức Giêsu Kitô...”
  </p>
  <div class="prayer-amen font-serif font-bold text-amber-500 text-base tracking-widest">
    Amen.
  </div>
</div>
```

---

### 8. Bốn Khối Kết Thúc Học Thuật Chuẩn VERIDU (Cuối Bài)
```html
<!-- I. CHÚ THÍCH HỌC THUẬT (2 CHIỀU) -->
<div class="veridu-footnotes mt-12 pt-8 border-t border-[var(--border-card)]">
  <h4 id="chu-thich" class="font-serif font-bold text-lg text-amber-600 dark:text-amber-400 mb-4">
    Chú Thích Học Thuật
  </h4>
  <ol class="list-decimal list-inside space-y-2.5 text-xs text-[var(--text-muted)] font-sans">
    <li id="fn1">
      Tên Tác Giả, <em>Tên Tác Phẩm Học Thuật</em> (Nơi Xuất Bản: Nhà Xuất Bản, Năm), tr. 100–105. 
      <a href="#ref1" class="footnote-backref text-amber-500 hover:underline" title="Quay lại vị trí đọc">↩︎</a>
    </li>
    <li id="fn2">
      Bảo tàng Ai Cập tại Cairo, mã số hiện vật JE 31408; James B. Pritchard (Ed.), <em>ANET</em> (Princeton, 1969), tr. 376–378. 
      <a href="#ref2" class="footnote-backref text-amber-500 hover:underline" title="Quay lại vị trí đọc">↩︎</a>
    </li>
  </ol>
</div>

<!-- II. DANH MỤC THAM CHIẾU THÁNH KINH -->
<div class="scripture-meta mt-10 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
  <h3 id="tham-chieu" class="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
    Tham Chiếu Bản Văn Thánh Kinh Trọng Tâm
  </h3>
  <div class="scripture-item space-y-1.5">
    <div class="scripture-claim text-xs font-bold text-[var(--text-main)]">
      1. Nguồn gốc Giao Ước và Dân Tuyển Chọn:
    </div>
    <div class="scripture-refs flex flex-wrap gap-2 pt-1">
      <span class="verse-badge px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">St 12:1–3</span>
      <span class="verse-badge px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">Xh 19:3–8</span>
      <span class="verse-badge px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">Đnl 7:6–8</span>
    </div>
  </div>
  <div class="scripture-item space-y-1.5 pt-2">
    <div class="scripture-claim text-xs font-bold text-[var(--text-main)]">
      2. Sự thành toàn tối hậu nơi Vương Quốc Đức Kitô:
    </div>
    <div class="scripture-refs flex flex-wrap gap-2 pt-1">
      <span class="verse-badge px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">Lc 1:31–33</span>
      <span class="verse-badge px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">Ga 18:36–37</span>
      <span class="verse-badge px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">Kh 21:1–5</span>
    </div>
  </div>
</div>

<!-- III. TRA CỨU THUẬT NGỮ THẦN HỌC & KHẢO CỔ HỌC -->
<div class="dictionary-meta mt-10 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
  <div class="dictionary-title font-serif font-bold text-xs uppercase tracking-wider text-amber-500 border-b border-[var(--border-card)] pb-2" id="bang-thuat-ngu">
    TRA CỨU THUẬT NGỮ THẦN HỌC &amp; KHẢO CỔ HỌC
  </div>
  <div class="dictionary-entry text-xs leading-relaxed">
    <span class="term-keyword font-bold text-amber-400">Synkatabasis</span> 
    <span class="term-lang text-slate-400">(Tự Hạ Thần Linh - Tiếng Hy Lạp / Giáo Phụ Học)</span>: 
    <span class="term-definition text-slate-300">
      Khái niệm thần học diễn tả sự tự hạ đầy lòng từ ái của Thiên Chúa, khi Ngài chấp nhận thích nghi với ngôn ngữ và giới hạn con người để truyền đạt mầu nhiệm mạc khải (Hiến chế <em>Dei Verbum</em> số 13).
    </span>
  </div>
  <div class="dictionary-entry text-xs leading-relaxed pt-2 border-t border-white/5">
    <span class="term-keyword font-bold text-amber-400">BYTDWD</span> 
    <span class="term-lang">(Nhà Đavít - Tiếng Aram Cổ)</span>: 
    <span class="term-definition text-slate-300">
      Cụm từ khắc trên Bia đá Tel Dan thế kỷ IX TCN; chứng cứ khảo cổ học vật lý xác nhận tính lịch sử của vương triều Vua Đavít.
    </span>
  </div>
</div>

<!-- IV. THƯ MỤC TÀI LIỆU THAM KHẢO CHUẨN MỰC -->
<div class="bibliography mt-10 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
  <h3 id="thu-muc-tai-lieu" class="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
    Thư Mục Tài Liệu Tham Khảo Chuẩn Mực
  </h3>
  <p class="text-xs text-[var(--text-muted)] leading-relaxed">
    Công Đồng Chung Vaticanô II. <em>Hiến chế Tín lý về Mạc Khải Thần Linh (Dei Verbum)</em>, 1965.
  </p>
  <p class="text-xs text-[var(--text-muted)] leading-relaxed">
    Giáo Hoàng Bênêđíctô XVI. <em>Tông huấn Lời Chúa (Verbum Domini)</em>. Vatican, 2010.
  </p>
  <p class="text-xs text-[var(--text-muted)] leading-relaxed">
    Lm. Nguyễn Thế Thuấn, CSsR. <em>Kinh Thánh</em>. Sài Gòn: Dòng Chúa Cứu Thế Việt Nam, 1976.
  </p>
  <p class="text-xs text-[var(--text-muted)] leading-relaxed">
    Lm. Giuse Phạm Quốc Tuấn. <em>Giáo Trình Thánh Kinh Nhập Môn</em>; <em>Giao Ước Trong Kinh Thánh</em>. ĐCV Thánh Giuse Xuân Lộc, 2023.
  </p>
  <p class="text-xs text-[var(--text-muted)] leading-relaxed">
    Bergsma, John, &amp; Brant Pitre. <em>A Catholic Introduction to the Bible: The Old Testament</em>. San Francisco: Ignatius Press, 2018.
  </p>
</div>
```

---

## 5. NGUYÊN TẮC VĂN PHONG & CHUẨN MỰC THẦN HỌC

1. **Văn phong Công giáo Việt Nam trang nhã:**
   * Tuyệt đối tránh từ ngữ dịch máy thô cứng (dịch word-by-word) hoặc từ ngữ văn hóa thế tục hiện đại áp vào bối cảnh thiêng liêng.
   * Sử dụng thuật ngữ phụng vụ chuẩn Hội đồng Giám mục Việt Nam: *Đức Chúa, Thiên Chúa, Giao Ước, Mạc Khải, Đấng Tự Hữu, Thánh Điện, Tiền Trưng, Quy-Kitô*.
2. **Quy chuẩn trích dẫn Kinh Thánh:**
   * Ưu tiên tuyệt đối bản dịch của **Cố Lm. Nguyễn Thế Thuấn, CSsR (NTT)**.
   * Định dạng chuẩn tên sách viết tắt (St, Xh, Lv, Ds, Đnl, 1 Sm, 2 Sm, 1 V, 2 V, Is, Gr, Ed, Tv, Mt, Mc, Lc, Ga, Rm, 1 Cr...).
   * Có dấu chỉ mở rộng (`/kinh-thanh/[bookSlug]/[chapter] ↗`) để liên kết vào bộ đọc 73 Sách của VERIDU.
3. **Liêm chính học thuật (Academic Integrity):**
   * Tuyệt đối không bịa đặt nguồn khảo cổ hoặc số hiệu hiện vật bảo tàng.
   * Ghi rõ mã số hiện vật bảo tàng quốc tế (như Bảo tàng Cairo, Bảo tàng Anh, Bảo tàng Israel) và giấy phép bản quyền hình ảnh (CC BY-NC-SA 4.0).
4. **Quy tắc Iconography:**
   * CẤM TUYỆT ĐỐI các icon AI (`Sparkles`, `Bot`, `Wand`, `Cpu`) và KHÔNG dùng emoji làm icon chính của nút giao diện. Chỉ dùng SVG vector biểu tượng Công giáo & Khảo cổ học.

---

## 6. CHECKLIST 10 ĐIỂM TRƯỚC KHI XUẤT BẢN

- [ ] 1. Toàn bộ thân bài được bọc kín trong `<article class="veridu-scholarly-article">`.
- [ ] 2. Mở đầu bằng Khối Tóm Tắt Nghiên Cứu Thần Học (`.abstract-research`) có thẻ `#tags` và badge `VERIDU RESEARCH`.
- [ ] 3. Có ít nhất một Khối Lời Chúa Soi Đường (`.sacred-scripture`) trích dẫn bản dịch NTT có link tra cứu.
- [ ] 4. Các tiêu đề phân đoạn đều dùng thẻ `<h2>` định dạng số La Mã (I., II., III., IV., V...).
- [ ] 5. Mọi hình ảnh khảo cổ đều nằm trong `<figure class="wp-block-image veridu-image-block">` có `data-lightbox="true"` và `<figcaption>` rõ ràng.
- [ ] 6. Có ít nhất một Khối Điểm Nhấn (`.veridu-pull-quote`) và một Hộp Giáo Lý Trọng Tâm (`.catechetical-callout`).
- [ ] 7. Có Khối Lời Nguyện Kính Phụng Vụ (`.prayer-block`) kết đọng tâm tình thiêng liêng và chữ "Amen.".
- [ ] 8. Có đầy đủ Chú Thích Học Thuật 2 chiều (`.veridu-footnotes`) với liên kết đánh số quay lại (`↩︎`).
- [ ] 9. Có Danh Mục Tham Chiếu Thánh Kinh (`.scripture-meta`) với các `<span class="verse-badge">`.
- [ ] 10. Có Bảng Tra Cứu Thuật Ngữ (`.dictionary-meta`) và Thư Mục Tham Khảo (`.bibliography`) chuẩn Chicago.
