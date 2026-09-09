---
title: "Quy Chuẩn Khoảng Cách Header Toàn Cục & Bố Cục Toàn Màn Hình"
scope: "veridu-frontend-cpanel"
trigger: "layout, header, full-screen, lms, canvas, ui-spacing"
---

# Quy Chuẩn Khoảng Cách Header Toàn Cục (Fixed LiturgicalHeader Rule)

## 1. Nguyên Tắc An Toàn Header Cố Định (Fixed Header Clearance)
Header toàn cục của VERIDU (`LiturgicalHeader`) có vị trí cố định `fixed top-0 left-0 right-0 z-40` với chiều cao thay đổi theo màn hình:
- **Desktop XL (`>= 1280px`)**: Gồm 2 tầng (Tier 1: 64px + Tier 2: 48px = **112px**). Nếu trang giữ Header toàn cục, bắt buộc phải có khoảng đệm tối thiểu `pt-28` (112px) hoặc `pt-32` (128px) để không bị che khuất nội dung đầu trang.
- **Tablet & Laptop (`768px - 1279px`)**: Cao **64px** (`h-16`). Khoảng đệm an toàn là `pt-20`.
- **Mobile (`< 768px`)**: Cao **64px** (`h-16`). Khoảng đệm an toàn là `pt-20`.

## 2. Quy Trình Xác Nhận Trước Với Người Dùng (Proactive Clarification)
Trước khi dựng layout cho các trang có tính chất "Ứng dụng / Bảng điều khiển / Trình học tập trung" (như `/khoa-hoc/[slug]`, `/dang-bai`, `/quiz`, `/admin`, `/game`):
- **LUÔN HỎI NGƯỜI DÙNG**: Trang này sẽ dùng chế độ **Toàn màn hình tập trung (Distraction-Free Focus Mode)** — tức ẩn Header toàn cục của website để thanh công cụ LMS lên sát mép trên cùng (`top-0`), hay **Giữ Header toàn cục** với khoảng đệm `xl:pt-32`?

## 3. Quy Cách Focus Mode (Toàn Màn Hình Tập Trung)
Khi một trang được cấu hình Focus Mode:
- Ẩn `LiturgicalHeader` trong `src/components/LiturgicalHeader.tsx` dựa trên tiền tố pathname (ví dụ `isCoursePlayer = pathname !== '/khoa-hoc' && pathname?.startsWith('/khoa-hoc/')`).
- Thanh công cụ riêng của trang đặt ở `sticky top-0 z-30` với `top: 0`.
- Footer toàn cục (`Footer` trong `src/app/layout.tsx`) vẫn được giữ nguyên ở cuối trang để người dùng cuộn xuống chân trang vẫn truy cập được các liên kết và bản quyền.
