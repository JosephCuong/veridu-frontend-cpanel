# 📖 CẨM NANG HƯỚNG DẪN BIÊN SOẠN & ĐĂNG BÀI CHUẨN VERIDU (THAPGIA.COM)

Cẩm nang này hướng dẫn chi tiết quy trình đăng bài và bộ quy chuẩn thiết kế tệp `.html` cho 2 định dạng bài viết trên hệ thống VERIDU: **Bài Trực Quan (Interactive HTML 3D)** và **Bài Viết Thường (Tĩnh)**.

---

## 📌 PHẦN 1: QUY TRÌNH ĐĂNG BÀI TRÊN NỀN TẢNG VERIDU

Hệ thống cung cấp 2 công cụ đăng bài chính tùy theo vai trò tài khoản:

### 1. Trang Đóng Góp Bài Viết (`/thu-vien/dang-bai`)
- **Đối tượng:** Tác giả, Giáo lý viên, Học giả và Quản trị viên.
- **Quy trình:**
  1. Kéo & thả tệp `.html` bài viết vào ô **"Kéo & thả file bài viết (.html)"**.
  2. Hệ thống tự động trích xuất tiêu đề (từ thẻ `<title>` hoặc `<h1>`) và tự động chọn Template phù hợp:
     - Nếu tệp có cấu trúc `<!DOCTYPE html>`, `<html>`, `<script>`, hệ thống tự chuyển sang **Bài Tương Tác (Interactive)**.
     - Nếu tệp là đoạn văn bản tĩnh, hệ thống sẽ giữ dạng **Tiêu chuẩn (Standard)**.
  3. Nhập đoạn **Tóm tắt ngắn (Excerpt)** và bấm **Gửi Bài Viết**. (Bài viết từ cộng tác viên sẽ ở trạng thái `draft` chờ Admin duyệt).

### 2. Trang Quản Trị Admin (`/admin`)
- **Đối tượng:** Quản trị viên hệ thống (Superadmin).
- **Quy trình:**
  1. Mở Tab **Trình Soạn Thảo Bài Viết & Bài Tương Tác HTML 3D**.
  2. Bấm nút **Import File .HTML 3D Từ Máy Tính** để nạp trực tiếp file.
  3. Chọn Giao diện / Template tương ứng (`Standard`, `Magazine`, `Meditation`, `Theological`, hoặc `Interactive`).
  4. Bấm **Xuất Bản Bài Viết Này** (Bài viết được xuất bản trực tiếp `status = 'published'`).

---

## 🎨 PHẦN 2: QUY CHUẨN THIẾT KẾ FILE `.html` TRỰC QUAN (INTERACTIVE 3D)

> **Mục đích:** Dùng cho các bài thuyết trình sinh động, bản đồ 3D, dòng thời gian tương tác, bài trắc nghiệm lật thẻ (ví dụ: `hanh-trinh-mose-va-israel.html`).
> **Cách hệ thống xử lý:** Render ở chế độ **Fullscreen Sandbox Iframe (`/api/raw-html/[slug]`)** chiếm toàn màn hình 100vh, có nút kính mờ *"Thoát Toàn Màn Hình"* nổi ở góc trái.

### 📐 Quy tắc thiết kế file HTML Trực quan:
1. **Tự chứa (Self-contained):** Viết đầy đủ thẻ `<!DOCTYPE html>`, `<head>`, `<body>`, có thể nhúng thư viện CDN tùy thích (Tailwind CSS, Alpine.js, Three.js, Leaflet.js, Chart.js...).
2. **Responsive 100%:** Luôn có thẻ `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
3. **Màu sắc đề xuất:** Nên chọn bảng màu Nền Tối (`#020617`, `#0f172a`) hoặc màu Giấy Kinh Thánh cổ (`#faf8f5`, `#e8e3d9`) kết hợp với sắc Vàng Hoàng Gia (`#f59e0b`, `#8b3a3a`) để chuẩn phong cách Công Giáo VERIDU.
4. **Không lo xung đột CSS:** Vì chạy trong Iframe Sandbox riêng biệt, bạn hoàn toàn thoải mái viết CSS/JS mà không sợ làm hỏng Header/Footer của website chính.

### 📄 Khung Mã Nguồn Mẫu (Interactive HTML Template):

```html
<!DOCTYPE html>
<html lang="vi" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiêu Đề Bài Viết Tương Tác</title>
  
  <!-- Phông chữ & Thư viện CDN -->
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer></script>

  <style>
    body { font-family: 'Lora', serif; background-color: #020617; color: #e2e8f0; }
    .glass-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(245, 158, 11, 0.2); }
  </style>
</head>
<body>

  <!-- Hero Header -->
  <header class="h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
    <span class="text-amber-400 font-bold uppercase tracking-widest text-xs mb-2">Chuyên Đề Tương Tác 3D</span>
    <h1 class="text-4xl md:text-6xl font-black text-amber-400 mb-4">Hành Trình Đắc Sủng</h1>
    <p class="text-slate-300 italic max-w-2xl">Khám phá qua bản đồ và dòng thời gian tương tác</p>
  </header>

  <!-- Nội dung tương tác (Alpine.js / Canvas 3D) -->
  <main class="max-w-5xl mx-auto p-6 space-y-12" x-data="{ activeTab: 'map' }">
    <div class="flex justify-center gap-4">
      <button @click="activeTab = 'map'" :class="activeTab === 'map' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white'" class="px-6 py-2 rounded-xl font-bold transition">Bản Đồ 3D</button>
      <button @click="activeTab = 'timeline'" :class="activeTab === 'timeline' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white'" class="px-6 py-2 rounded-xl font-bold transition">Dòng Thời Gian</button>
    </div>

    <!-- Nội dung Tab -->
    <div x-show="activeTab === 'map'" class="glass-card p-8 rounded-3xl">
      <!-- Vẽ SVG / Map 3D ở đây -->
      <p class="text-center text-amber-300">Khung hiển thị Bản đồ tương tác...</p>
    </div>
  </main>

</body>
</html>
```

---

## ✍️ PHẦN 3: QUY CHUẨN BIÊN SOẠN FILE `.html` THƯỜNG (BÀI VIẾT TĨNH)

> **Mục đích:** Dành cho các bài nghiên cứu, suy niệm, bài đọc thần học (ví dụ: `kham-pha-cong-doan-qumrran.html`).
> **Cách hệ thống xử lý:** Hệ thống tự động bóc tách nội dung, ghép vào **Template chuẩn VERIDU** có Sidebar Mục Lục tự động cuộn (Sticky TOC), hỗ trợ đổi chế độ Tối/Sáng (Dark/Light mode), tích hợp chân trang và khung bình luận.

### 📐 Quy tắc thiết kế file HTML Thường:
1. **Không cần thẻ `<html>` hay `<body>` phức tạp:** Chỉ cần thẻ bao quanh `<div class="veridu-post-content">` hoặc các thẻ tiêu đề `<h2>`, `<h3>`.
2. **Dùng Tiêu đề H2 (`<h2>`) cho các mục lớn:** Hệ thống dựa vào các thẻ `<h2 id="...">` để tự động tạo Mục Lục bên thanh tay phải.
3. **Các thẻ hỗ trợ đặc biệt của VERIDU:**
   - **Chú thích thuật ngữ:** `<dfn class="veridu-term" title="Giải thích ý nghĩa" data-base="Từ gốc">Thuật ngữ</dfn>`
   - **Trích dẫn nổi bật:** `<aside class="veridu-pull-quote">Lời trích dẫn Kinh Thánh...</aside>`
   - **Ghi chú chân trang:** `<sup class="veridu-footnote"><a href="#fn1">[1]</a></sup>`

### 📄 Khung Mã Nguồn Mẫu (Standard Article Template):

```html
<div class="veridu-post-content">
  <!-- Đoạn Tóm Tắt Nghiên Cứu -->
  <div class="abstract-research">
    Đây là đoạn văn bản tóm tắt nội dung nghiên cứu thần học hoặc bài đọc suy niệm...
  </div>

  <h2 id="i-boidoi-lich-su">I. Bối Cảnh Lịch Sử</h2>
  <p>Nội dung phân tích lịch sử với các trích dẫn...</p>

  <aside class="veridu-pull-quote">
    "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi." (Thánh Vịnh 119:105)
  </aside>

  <h2 id="ii-y-nghia-than-hoc">II. Ý Nghĩa Thần Học</h2>
  <p>Nội dung thần học sử dụng thuật ngữ <dfn class="veridu-term" title="Nghi thức dâng lễ Do Thái" data-base="Toda">Toda</dfn>...</p>

  <figure class="veridu-image-block">
    <img src="https://media.thapgia.com/sample-image.jpg" alt="Mô tả hình ảnh">
    <figcaption>Chú thích ảnh hiển thị bên dưới</figcaption>
  </figure>
</div>
```

---

## 📊 PHẦN 4: BẢNG SO SÁNH NHANH 2 LOẠI BÀI ĐĂNG

| Tiêu chí | Bài Trực Quan (Interactive HTML 3D) | Bài Viết Thường (Standard / Magazine) |
| :--- | :--- | :--- |
| **Tệp mẫu của bạn** | `hanh-trinh-mose-va-israel.html` | `kham-pha-cong-doan-qumrran.html` |
| **Giao diện hiển thị** | Iframe Sandbox toàn màn hình 100vh | Layout chuẩn VERIDU (Có Sticky TOC + Header/Footer) |
| **Mục lục (TOC)** | Tự thiết kế bên trong file HTML | Hệ thống tự động quét thẻ `<h2>` để tạo TOC |
| **Hỗ trợ Script/CSS** | Tự do dùng Tailwind CDN, AlpineJS, Canvas 3D | Hệ thống tự áp dụng CSS Tailwind & Font Lora chuẩn |
| **Chế độ khi Đăng bài** | Chọn Template **Tương tác (Interactive)** | Chọn Template **Standard**, **Magazine**, hoặc **Theological** |
| **Tùy chọn Xóa Class rác** | **BỎ CHỌN** (Để giữ nguyên Class/Style của file) | **NÊN CHỌN** (Để chuẩn hóa về màu sắc toàn cục VERIDU) |
