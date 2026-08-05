# Original User Request

## 2026-08-05T14:20:00Z

Thực hiện kiểm toán toàn diện hệ thống CSS/JS toàn cục, tái cấu trúc toàn bộ layout hiển thị bài viết và các template (Standard, Wide/Magazine, Meditation, Theological, Interactive HTML) về chuẩn CSS Flexbox đồng nhất, đồng thời hoàn thiện hệ thống Mục Lục Tự Động (TOC) và bộ xử lý hiển thị chuẩn màu/font cho các bài viết HTML tương tác trên toàn hệ thống VERIDU.

Working directory: `C:\Users\josbu\Desktop\veridu-frontend-cpanel`
Integrity mode: demo

## Requirements

### R1. Kiểm Toán & Chuẩn Hóa CSS/UI/UX Toàn Cục (Global CSS & Design System)
Rà soát toàn bộ `src/app/globals.css`, `src/app/layout.tsx` và hệ thống design tokens (Stained-Glass / Glassmorphism) để loại bỏ mọi class CSS xung đột, trùng lặp hoặc dư thừa. Đảm bảo tính nhất quán trên 100% các trang và thiết bị (Responsive).

### R2. Tái Cấu Trúc Layout Bài Viết & Mục Lục Tự Động (Flexbox & Sticky TOC)
Chuyển đổi tất cả các template bài viết trong `src/app/thu-vien/[slug]` sang kiến trúc CSS Flexbox hoàn toàn mượt mà. Đảm bảo thanh Mục Lục Tự Động (Table of Contents - TOC) trượt đồng bộ (Sticky) khi cuộn trang, tự động thu gọn/mở rộng, và không bao giờ bị đè hoặc trôi mất trên cả Desktop và Mobile.

### R3. Xử Lý Tối Ưu Hóa Bài Viết HTML Tương Tác (Interactive & Custom HTML Rendering)
Tối ưu hóa bộ xử lý HTML (`htmlProcessor.ts`, `VisualArticleRenderer.tsx`, `/api/raw-html/[slug]`) để tự động loại bỏ các thuộc tính màu dán cứng (màu tối trên nền tối, nền trắng chói), khử các khối Mục Lục cũ trùng lặp nhúng trong file HTML tải lên, và áp dụng chuẩn font chữ Serif (Lora) & màu chữ Glassmorphic đồng nhất.

## Acceptance Criteria

### Giao Diện Bài Viết & Mục Lục (TOC)
- [ ] 100% các loại template bài viết (`standard`, `magazine`, `meditation`, `theological`) sử dụng layout CSS Flexbox chuẩn, thanh Mục Lục trượt đồng bộ khi cuộn xuống mà không bị đè hay kẹt.
- [ ] Không còn tình trạng Mục Lục bị lặp lại (1 mục lục cũ từ file HTML + 1 mục lục mới của VERIDU).

### Hiển Thị Bài Viết HTML Tương Tác
- [ ] Tất cả bài viết HTML tải lên (dù là bài tương tác iframe hay bài tiêu chuẩn) đều hiển thị rõ ràng, chữ xám sáng (`#e2e8f0`) trên nền tối, không bị dịnh màu đen/xám tối từ CSS nhúng.
- [ ] Font chữ bài đọc đồng nhất theo chuẩn Lora/Serif Công Giáo.

### Kiểm Thử & Tương Thích
- [ ] Dự án `npx next build` thành công 100% không báo lỗi TypeScript hay JSX syntax.
