# 📖 SỔ TAY QUY CHUẨN SOẠN THẢO HTML BÀI VIẾT — NỀN TẢNG VERIDU
> **Dành cho**: Ban Biên Tập, Tác Giả, Cộng Tác Viên & Kỹ Sư Nhập Liệu HTML  
> **Phiên bản**: 2.0 (Hệ Thống Stained-Glass Design System & Bộ Xử Lý Tự Động)  
> **Nền tảng**: VERIDU (https://www.thapgia.com)

---

## 🎯 1. NGUYÊN TẮC CỐT LÕI (GOLDEN RULES)

1. **Chuẩn ngữ nghĩa (Semantic HTML)**: Chỉ cần sử dụng cấu trúc HTML rõ ràng. Tránh gán các thuộc tính style dán cứng (`style="background: white; color: black; max-width: 800px"`), hệ thống VERIDU sẽ tự động làm sạch và đồng bộ màu sắc theo chế độ **Sáng / Tối (Light/Dark Mode)** và phông chữ Phụng vụ **Lora Serif**.
2. **Tự động hóa thông minh (Smart Normalization)**:
   - Hệ thống tự động bóc tách thẻ `<h1>` đầu tiên làm Tiêu Đề Bài Viết.
   - Hệ thống tự động bóc tách ảnh đầu tiên làm Ảnh Bìa Đại Diện (Featured Image).
   - Hệ thống tự động loại bỏ các khối Mục Lục cũ nhúng trong file HTML để thay bằng thanh **Mục Lục Tự Động Trượt Bám Dính (Sticky TOC)** thông minh của VERIDU.
3. **Ảnh Google Drive & Lightbox**: Mọi đường link ảnh Google Drive (dạng `drive.google.com/file/d/...`) đều được tự động tối ưu hóa sang CDN tải tức thì và tích hợp tính năng **Nhấp Phóng To (Lightbox)**.

---

## 🏛️ 2. DANH SÁCH 8 KHỐI PHỤNG VỤ & HỌC THUẬT CHUẨN TẮC

---

### 1. Khối Lời Chúa Soi Đường (Sacred Scripture Callout)
*Dùng để làm nổi bật Lời Chúa. Có viền vàng hổ phách, icon Sách Thánh, chữ in nghiêng Lora và badge tra cứu Kinh Thánh.*

#### Cách 1: Sử dụng cấu trúc Class chuẩn
```html
<div class="sacred-scripture veridu-scripture-quote">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “Ngài phải nổi bật lên, còn tôi phải lu mờ đi.”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="/kinh-thanh/ga/3" target="_blank" title="Tra cứu Lời Chúa trong Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>Ga 3:30</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>
```

#### Cách 2: Tự động hóa qua cú pháp ngắn gọn
*Hệ thống tự động phát hiện và chuyển hóa thành khối nghệ thuật:*
```html
<p>"Ngài phải nổi bật lên, còn tôi phải lu mờ đi." (Ga 3:30)</p>
```
*hoặc:*
```html
<div class="poetry-block">
  <div class="poetry-verse">"Ngài phải nổi bật lên, còn tôi phải lu mờ đi." (Ga 3:30)</div>
</div>
```

---

### 2. Khối Thơ Phụng Vụ & Lời Nguyện Kính (Prayer & Poetry Blocks)

#### A. Khối Thơ Phụng Vụ (`.poetry-block`)
```html
<div class="poetry-block">
  <div class="poetry-verse">
    Lạy Chúa Từ Nhân, xin làm cho con thành khí cụ bình an của Chúa.<br>
    Để con đem yêu thương vào nơi oán thù, đem thứ tha vào nơi lăng nhục...
  </div>
</div>
```

#### B. Khối Lời Nguyện Kính (`.prayer-block`)
```html
<div class="prayer-block">
  <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif mb-3">
    <span>🕊️</span> LỜI NGUYỆN KÍNH PHỤNG VỤ
  </div>
  <p class="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed m-0">
    “Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...”
  </p>
  <div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">Amen.</div>
</div>
```

---

### 3. Bản Tóm Tắt Nghiên Cứu Thần Học (Abstract Research Card)
*Đặt ngay sau lời mở đầu để tóm tắt các luận điểm thần học và từ khóa.*

```html
<div class="abstract-research">
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
</div>
```

---

### 4. Bảng Danh Mục Bằng Chứng Thánh Kinh (Scripture Meta Claims & Refs)
*Dành cho các bài đối chiếu Thánh Kinh, hộ giáo hoặc thần học tín lý.*

```html
<div class="scripture-meta">
  <div class="scripture-item">
    <div class="scripture-claim">1. Thiên Chúa Hằng Hữu và Khởi Đầu của Mọi Loài Thụ Tạo:</div>
    <div class="scripture-refs">
      <span class="verse-badge">St 1:1</span>
      <span class="verse-badge">Ga 1:1-3</span>
      <span class="verse-badge">Tv 90:2</span>
      <span class="verse-badge">Cl 1:16</span>
    </div>
  </div>
  <div class="scripture-item">
    <div class="scripture-claim">2. Lời Hứa Ban Đấng Cứu Thế Cứu Độ Nhân Loại:</div>
    <div class="scripture-refs">
      <span class="verse-badge">St 3:15</span>
      <span class="verse-badge">Is 7:14</span>
      <span class="verse-badge">Is 53:5</span>
      <span class="verse-badge">Mt 1:21</span>
    </div>
  </div>
</div>
```

---

### 5. Khối Tra Cứu Thuật Ngữ Giáo Lý & Tín Lý (Theological Dictionary Block)
*Định nghĩa các từ ngữ gốc Hy Lạp, Do Thái, Latinh hoặc thuật ngữ giáo luật.*

```html
<div class="dictionary-meta">
  <div class="dictionary-title">TRA CỨU THUẬT NGỮ THẦN HỌC & TÍN LÝ</div>
  <div class="veridu-term">
    <span class="term-keyword">Theotokos</span> 
    <span class="term-lang">(tiếng Hy Lạp: Θεοτόκος)</span>: 
    <span class="term-definition">
      Đấng Cưu Mang Thiên Chúa / Mẹ Thiên Chúa. Tước hiệu được định tín tại Công đồng Êphêsô (năm 431) nhằm khẳng định Chúa Giêsu Kitô là Thiên Chúa thật và Người thật.
    </span>
  </div>
  <div class="veridu-term">
    <span class="term-keyword">Hypostatic Union</span> 
    <span class="term-lang">(tiếng Latinh: Unio Hypostatica)</span>: 
    <span class="term-definition">
      Sự hiệp nhất ngôi vị – mầu nhiệm kết hợp hoàn hảo giữa Thiên tính và Nhân tính trong duy nhất một Ngôi Lời Nhập Thể.
    </span>
  </div>
</div>
```

---

### 6. Khối Hình Ảnh Nghệ Thuật Kèm Chú Thích & Phóng To (Image & Lightbox)
*Hỗ trợ ảnh trực tiếp, ảnh Google Drive, tự động bo góc, bóng đổ và nhấp để phóng to toàn màn hình.*

```html
<figure class="veridu-image-block">
  <img 
    src="https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=1200" 
    alt="Bức Bích Họa Phụng Vụ Thánh Đường" 
    data-lightbox="true"
  />
  <figcaption>Hình 1: Ánh sáng Phục Sinh chiếu rọi qua các ô kính màu Thánh Đường Phụng Vụ.</figcaption>
</figure>
```
> **Mẹo link Google Drive**: Bạn có thể dán thẳng link Google Drive:  
> `src="https://drive.google.com/file/d/1A2B3C4D.../view"`  
> Hệ thống sẽ tự động chuyển hóa thành ảnh siêu tốc CDN!

---

### 7. Khung Video & Âm Thanh Nhúng 16:9 (Responsive Video & Audio Embed)
*Tự động căn chuẩn tỉ lệ 16:9 responsive, không bị méo hình hoặc tràn lề di động.*

#### A. Video Nhúng (YouTube / Vimeo / Google Drive Video)
```html
<div class="veridu-embed-video">
  <iframe 
    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
    title="Video Khảo Luận Thần Học" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
  ></iframe>
</div>
```

#### B. Âm Thanh / Bài Giảng Audio
```html
<div class="veridu-embed-audio">
  <audio controls class="w-full">
    <source src="https://example.com/audio/bai-giang-suy-niem.mp3" type="audio/mpeg">
    Trình duyệt của bạn không hỗ trợ phát âm thanh.
  </audio>
</div>
```

---

### 8. Hộp Cảnh Báo & Lưu Ý Giáo Lý (Catechetical Callout)
*Gồm 4 tông màu phụng vụ rõ ràng cho các lưu ý, thực hành và cảnh báo tín lý:*

#### A. Lưu Ý Giáo Lý (`.callout-note` - Màu xanh Chàm)
```html
<div class="catechetical-callout callout-note">
  <div class="callout-header">
    <span class="callout-icon">ℹ️</span>
    <span class="callout-title">LƯU Ý GIÁO LÝ HỘI THÁNH</span>
  </div>
  <div class="callout-body">
    Theo Giáo lý Hội Thánh Công Giáo (GLHTCG số 464), mầu nhiệm Nhập Thể không có nghĩa là Đức Giêsu chỉ mang hình dáng bên ngoài của một con người, nhưng Ngài thực sự đã trở nên một phàm nhân trọn vẹn.
  </div>
</div>
```

#### B. Mẹo & Thực Hành Đức Tin (`.callout-tip` - Màu Ngọc Lục Bảo)
```html
<div class="catechetical-callout callout-tip">
  <div class="callout-header">
    <span class="callout-icon">💡</span>
    <span class="callout-title">GỢI Ý THỰC HÀNH TÂM LINH</span>
  </div>
  <div class="callout-body">
    Trước khi bước vào giờ suy niệm Lời Chúa (Lectio Divina), hãy dành ít phút thinh lặng, hít thở sâu và cầu xin Chúa Thánh Thần soi sáng tâm trí.
  </div>
</div>
```

#### C. Điểm Tín Lý Trọng Yếu (`.callout-important` - Màu Vàng Hổ Phách)
```html
<div class="catechetical-callout callout-important">
  <div class="callout-header">
    <span class="callout-icon">⭐</span>
    <span class="callout-title">ĐIỂM TÍN LÝ TRỌNG TÂM</span>
  </div>
  <div class="callout-body">
    Tín điều Đức Maria Hồn Xác Lên Trời được Đức Thánh Cha Piô XII long trọng định tín qua Tông hiến Munificentissimus Deus ngày 1 tháng 11 năm 1950.
  </div>
</div>
```

#### D. Cảnh Báo Sai Lạc Tín Lý (`.callout-warning` - Màu Đỏ Thắm)
```html
<div class="catechetical-callout callout-warning">
  <div class="callout-header">
    <span class="callout-icon">⚠️</span>
    <span class="callout-title">CẢNH BÁO SAI LẠC TÍN LÝ</span>
  </div>
  <div class="callout-body">
    Cần phân biệt rõ giữa Lạc giáo Arius (phủ nhận thần tính của Chúa Con) và giáo lý chính thống về Ba Ngôi Thiên Chúa đồng bản thể được khẳng định tại Công đồng Nicea (325).
  </div>
</div>
```

---

## 📑 3. QUY TẮC TYPOGRAPHY & ĐỊNH DẠNG VĂN BẢN THƯỜNG

| Thẻ HTML | Mục Đích | Cách Hiển Thị Trên VERIDU |
|:---|:---|:---|
| `<h2>Tiêu đề mục lớn</h2>` | Phân mục chính của bài viết | Tự động sinh mục trong **Mục Lục TOC**, viền gạch dưới, font Lora Serif to đậm. |
| `<h3>Tiêu đề mục nhỏ</h3>` | Phân mục con | Tự động thụt đầu dòng trong Mục Lục TOC, font Lora vàng hổ phách. |
| `<h4>Tiêu đề tiểu mục</h4>` | Ý phụ | Chữ màu hổ phách đậm, thanh nhã. |
| `<p>Nội dung đoạn văn</p>` | Thân bài | Khoảng cách dòng `leading-relaxed`, chữ xám sáng trên nền tối, tương phản cao. |
| `<blockquote>Trích dẫn</blockquote>` | Trích đoạn tác giả | Viền trái vàng hổ phách, nền mờ, chữ nghiêng. |
| `<ul><li>Mục 1</li></ul>` | Danh sách không thứ tự | Dấu chấm tròn màu hổ phách, giãn dòng thông thoáng. |
| `<ol><li>Bước 1</li></ol>` | Danh sách có thứ tự | Số thứ tự rõ ràng, căn đều lề. |
| `<table>...</table>` | Bảng biểu tra cứu | Nền thẻ kính mờ, tiêu đề cột màu vàng hổ phách, tự động cuộn ngang trên điện thoại. |

---

## ⚡ 4. QUY TRÌNH BIÊN TẬP TRỰC QUAN (LIVE CANVAS WYSIWYG)

1. **Nhập liệu**:
   - Truy cập: [`https://www.thapgia.com/dang-bai`](https://www.thapgia.com/dang-bai)
   - Chọn kéo thả tệp `.html` hoặc dán trực tiếp mã HTML vào khung.
2. **Chỉnh sửa trực quan ("Nhìn sao thấy vậy")**:
   - Nhấp chuột trực tiếp vào bất kỳ tiêu đề hoặc đoạn văn trên bài để gõ sửa chữ.
   - Bôi đen chữ để hiện **Thanh công cụ nổi (Floating Format Toolbar)**: In đậm, in nghiêng, chèn link đối chiếu Kinh Thánh (`Ga 3:30 ↗`), v.v.
   - Nhấp nút **"📖 Sổ Tay Khối Chuẩn"** trên thanh công cụ để mở danh sách mẫu và bấm **"Chèn Khối Này"** 1-click.
3. **Lưu & Đăng**:
   - Bấm **"Lưu Thay Đổi / Đăng Bài"**.
   - Dữ liệu được đồng bộ ngay vào Supabase và hệ thống tự động xóa bộ nhớ đệm (Cache Revalidation) giúp bài viết cập nhật ngay lập tức!
