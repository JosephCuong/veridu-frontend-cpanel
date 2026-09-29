# HƯỚNG DẪN HOÀN TẤT CHUYỂN ĐỔI DOMAIN CRUXVERITATIS.ORG & ĐA NGÔN NGỮ

> **Trạng thái hiện tại:**
> - ✅ Mã nguồn Frontend đã hoàn tất khử 100% hardcode `thapgia.com` và chuyển toàn bộ sang `cruxveritatis.org` / `process.env.NEXT_PUBLIC_SITE_URL`.
> - ✅ Vercel Project đã nạp và xác minh thành công cả 2 domain: `www.cruxveritatis.org` và `cruxveritatis.org` (redirect 308 về www).
> - ✅ Đã tích hợp bộ chuyển đổi đa ngôn ngữ **LanguageSwitcher** chuẩn Stained-Glass trên Header (VI 🇻🇳, EN 🇬🇧, LA 🇻🇦).
> - ✅ Đã xây dựng trang quốc tế `/en` và trình đọc bài song ngữ `/en/[slug]` chuẩn Google hreflang SEO.

---

## 1. THIẾT ĐẶT 2 BẢN GHI DNS TRÊN CLOUDFLARE (30 Giây)

Vì bạn đã quản lý tên miền `cruxveritatis.org` trên **Cloudflare Dashboard**, bạn chỉ cần vào mục DNS và thêm 2 bản ghi sau để kết nối với cụm máy chủ Vercel:

### Bước 1: Đăng nhập Cloudflare
1. Vào [dash.cloudflare.com](https://dash.cloudflare.com) &rarr; Chọn tên miền **`cruxveritatis.org`**.
2. Ở thanh menu bên trái, nhấp vào **DNS** &rarr; **Records**.

### Bước 2: Thêm 2 bản ghi sau:

| Loại (Type) | Tên (Name) | Mục tiêu (Target / IPv4) | Proxy status | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `www` | `cname.vercel-dns.com` | **Proxied** (Đám mây cam) | Auto |
| **A** | `@` | `76.76.21.21` | **Proxied** (Đám mây cam) | Auto |

*(Ghi chú: Nếu Cloudflare hỗ trợ CNAME Flattening cho Apex, bạn cũng có thể để Type CNAME với Name là `@` trỏ về `cname.vercel-dns.com`).*

### Bước 3: Cấu hình SSL/TLS trên Cloudflare
- Ở menu trái &rarr; Chọn **SSL/TLS**.
- Tại phần **SSL/TLS encryption mode**, chọn **Full** hoặc **Full (strict)**. (Điều này bảo đảm Vercel cấp chứng chỉ SSL Let's Encrypt không bị lỗi vòng lặp chuyển hướng *Too many redirects*).

---

## 2. KÍCH HOẠT CÁC CỘT ĐA NGÔN NGỮ TRÊN SUPABASE (1 Click)

Để hệ thống lưu trữ được bản dịch tiếng Anh của các bài viết học thuật, bạn chỉ cần mở **Supabase Dashboard**:

1. Vào [supabase.com/dashboard](https://supabase.com/dashboard) &rarr; Chọn Project của bạn.
2. Nhấp vào biểu tượng **SQL Editor** ở thanh công cụ bên trái.
3. Nhấp **New Query**, dán đoạn mã sau và bấm **RUN**:

```sql
-- Bổ sung các cột lưu trữ bản dịch đa ngôn ngữ cho bảng posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT,
ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['vi'];

-- Tạo chỉ mục tìm kiếm nhanh cho bài viết đa ngôn ngữ
CREATE INDEX IF NOT EXISTS idx_posts_available_languages ON public.posts USING GIN (available_languages);
```

---

## 3. GỠ BỎ TÊN MIỀN CŨ THAPGIA.COM TRÊN VERCEL (Tùy chọn)

Sau khi kiểm tra `https://www.cruxveritatis.org` truy cập mượt mà trên trình duyệt:
1. Vào **Vercel Dashboard** &rarr; Dự án **`veridu-frontend-cpanel`**.
2. Vào **Settings** &rarr; **Domains**.
3. Tại dòng `thapgia.com` và `www.thapgia.com`, bấm vào dấu 3 chấm `...` &rarr; Chọn **Remove** (Xóa) để hệ thống hoàn toàn chỉ định danh dưới thương hiệu quốc tế mới `cruxveritatis.org`.
