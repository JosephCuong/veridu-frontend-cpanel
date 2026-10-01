---
description: Quy chuẩn kiến trúc HTML, bố cục và hệ thống class bài viết học thuật VERIDU (Crux Veritatis)
globs: ["src/app/**", "src/lib/**", "*.md", "scratch/**"]
---

# VERIDU Scholarly Article Standard Rule

Mọi tác vụ soạn thảo, chuẩn hóa, biên tập bài viết hoặc sinh mã HTML bài đọc trên VERIDU (Crux Veritatis) BẮT BUỘC phải tuân thủ chuẩn mực đúc kết từ bài mẫu ID #48:

## 1. Phân định Khung Hệ Thống vs Thân Bài HTML
- **KHÔNG ĐƯỢC CHÈN VÀO HTML:** Tiêu đề H1, Ảnh bìa (Cover Image), Tác giả, Ngày đăng, Thời gian đọc, Thẻ mục lục (TOC), Nút chia sẻ mạng xã hội. Tất cả các thành phần này do Next.js Template (`src/app/[slug]/page.tsx`) tự động kết xuất.
- **THẺ BỌC DUY NHẤT:** Toàn bộ nội dung thân bài bắt buộc phải nằm trong thẻ:
  ```html
  <article class="veridu-scholarly-article">
    <!-- Nội dung thân bài -->
  </article>
  ```

## 2. Các Khối Cốt Lõi (8 Khối Thân Bài)
1. **Abstract Research Card (`.abstract-research`):** Tóm tắt học thuật, đặt ngay sau mở đầu.
2. **Đề mục La Mã (`h2.veridu-heading-roman`):** Phân đoạn bài viết (`I.`, `II.`, `III.`), font serif, viền chân vàng nhạt.
3. **Đoạn văn học thuật (`p.veridu-p`):** Canh đều 2 bên (`text-justify`), dòng thoáng, nghiêm trang.
4. **Chú thích học thuật 2 chiều (`sup.veridu-footnote` ↔ `ol > li`):** Liên kết mỏ neo `href="#fn-X"` và `href="#fnref-X"`.
5. **Khối Lời Chúa NTT (`.sacred-scripture`):** Trích dẫn Kinh Thánh theo bản dịch Cố Lm. Nguyễn Thế Thuấn, CSsR.
6. **Hộp Lưu Ý Giáo Lý & Huấn Quyền (`.catechetical-callout`):** 4 cấp độ (Ghi chú, Mẹo, Quan trọng, Cảnh báo).
7. **Hình Ảnh Khảo Cổ / Bản Đồ (`figure.wp-block-image.veridu-image-block`):** Bắt buộc có `data-lightbox="true"` và chú thích nguồn gốc.
8. **Khối Lời Nguyện / Chiêm Niệm (`.prayer-block`):** Trầm lắng, đúc kết hiện sinh cho đức tin.

## 3. Bộ 4 Khối Kết Thúc Học Thuật Bắt Buộc (Cuối Bài)
Mọi bài viết nghiên cứu/thần học/khảo cổ tiêu chuẩn phải kết thúc bằng 4 khối theo thứ tự:
1. `<div class="veridu-footnotes">`
2. `<div class="scripture-meta">`
3. `<div class="dictionary-meta">`
4. `<div class="bibliography">`

Chi tiết đầy đủ xem tại file cẩm nang: `VERIDU_CANONICAL_ARTICLE_SPEC.md` và cẩm nang phẫu thuật chuyển đổi file thô: `VERIDU_AGENT_ARTICLE_TRANSFORMATION_GUIDE.md`.

