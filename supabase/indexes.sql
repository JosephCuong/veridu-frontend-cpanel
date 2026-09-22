-- ============================================================================
-- VERIDU CATHOLIC EDTECH PLATFORM (thapgia.com)
-- Comprehensive PostgreSQL Performance Indexes for Supabase
-- Target Database: cljglzhuwdniynfkzkxc
-- ============================================================================
-- All statements use "CREATE INDEX IF NOT EXISTS" for 100% idempotent execution.
-- You can run this entire script safely in the Supabase SQL Editor.
-- ============================================================================

-- ============================================================================
-- 1. BÀI VIẾT, TÀI LIỆU & THƯ VIỆN HỌC THUẬT (POSTS & LIBRARY)
-- ============================================================================

-- Tìm kiếm bài viết theo slug (truy vấn cốt lõi của /[slug] và /thu-vien/[slug])
CREATE INDEX IF NOT EXISTS idx_posts_slug 
ON public.posts (slug);

-- Lọc danh sách bài viết đã xuất bản theo thời gian giảm dần (Trang chủ & Thư viện)
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at 
ON public.posts (status, published_at DESC);

-- Lọc bài viết theo tác giả (Bảng điều khiển tác giả /tac-gia/dashboard)
CREATE INDEX IF NOT EXISTS idx_posts_author_id 
ON public.posts (author_id);

-- Lọc bài viết theo danh mục (category)
CREATE INDEX IF NOT EXISTS idx_posts_category 
ON public.posts (category);

-- Lọc bài viết theo định dạng bài (standard, wide, meditation, theological, interactive)
CREATE INDEX IF NOT EXISTS idx_posts_type 
ON public.posts (type);

-- Thư mục tài liệu, sách & file tải về (library_items)
CREATE INDEX IF NOT EXISTS idx_library_items_slug 
ON public.library_items (slug);

CREATE INDEX IF NOT EXISTS idx_library_items_type_category 
ON public.library_items (type, category);

-- Lịch sử tải tài liệu (download_logs)
CREATE INDEX IF NOT EXISTS idx_download_logs_item_id 
ON public.download_logs (item_id);

CREATE INDEX IF NOT EXISTS idx_download_logs_user_id 
ON public.download_logs (user_id);


-- ============================================================================
-- 2. KINH THÁNH CÔNG GIÁO 73 CUỐN (HOLY SCRIPTURE SYSTEM)
-- ============================================================================

-- CHỈ MỤC QUAN TRỌNG NHẤT: Truy xuất toàn bộ câu của một chương Kinh Thánh
-- Giúp đọc câu Kinh Thánh tức thì (Time-to-First-Byte < 20ms)
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter 
ON public.bible_verses (book_id, chapter);

-- Định vị chính xác từng câu cụ thể (book, chapter, verse)
CREATE INDEX IF NOT EXISTS idx_bible_verses_lookup 
ON public.bible_verses (book_id, chapter, verse_number);

-- Lọc theo bản dịch Kinh Thánh (translation_id)
CREATE INDEX IF NOT EXISTS idx_bible_verses_translation 
ON public.bible_verses (translation_id);

-- Danh mục 73 sách Kinh Thánh (bible_books)
CREATE INDEX IF NOT EXISTS idx_bible_books_slug 
ON public.bible_books (slug);

CREATE INDEX IF NOT EXISTS idx_bible_books_order_num 
ON public.bible_books (order_num);

-- Bản dịch Kinh Thánh (bible_translations)
CREATE INDEX IF NOT EXISTS idx_bible_translations_slug 
ON public.bible_translations (slug);

CREATE INDEX IF NOT EXISTS idx_bible_translations_code 
ON public.bible_translations (code);

-- Chú giải câu Kinh Thánh (bible_commentary)
CREATE INDEX IF NOT EXISTS idx_bible_commentary_book_chapter 
ON public.bible_commentary (book_id, chapter);


-- ============================================================================
-- 3. GIÁO LÝ HỘI THÁNH CÔNG GIÁO (CATECHISM CCC 1 - 2865)
-- ============================================================================

-- Tra cứu điều khoản theo số đoạn CCC (ví dụ: CCC 1, CCC 1962, CCC 2865)
CREATE INDEX IF NOT EXISTS idx_catechism_paragraphs_num 
ON public.catechism_paragraphs (paragraph_number);

-- Lọc đoạn giáo lý theo 4 phần / 4 Trụ cột đức tin
CREATE INDEX IF NOT EXISTS idx_catechism_paragraphs_part_slug 
ON public.catechism_paragraphs (part_slug);

-- Tra cứu mục giáo lý theo slug (catechism_entries)
CREATE INDEX IF NOT EXISTS idx_catechism_entries_slug 
ON public.catechism_entries (slug);

CREATE INDEX IF NOT EXISTS idx_catechism_entries_part 
ON public.catechism_entries (part);


-- ============================================================================
-- 4. KHÓA HỌC & TIẾN TRÌNH HỌC TẬP (COURSES & LMS PROGRESS)
-- ============================================================================

-- Tìm khóa học theo slug (trang /khoa-hoc/[slug])
CREATE INDEX IF NOT EXISTS idx_courses_slug 
ON public.courses (slug);

-- Lọc khóa học theo trạng thái và danh mục (Cựu Ước, Tân Ước, Phụng Vụ, Giáo Lý)
CREATE INDEX IF NOT EXISTS idx_courses_status_category 
ON public.courses (status, category);

-- Tiến trình hoàn thành khóa học của từng học viên
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id 
ON public.user_course_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course 
ON public.user_course_progress (user_id, course_id);


-- ============================================================================
-- 5. NHÂN VẬT, NIÊN BIỂU LỊCH SỬ & BẢN ĐỒ KINH THÁNH
-- ============================================================================

-- Nhân vật Kinh Thánh (characters)
CREATE INDEX IF NOT EXISTS idx_characters_slug 
ON public.characters (slug);

CREATE INDEX IF NOT EXISTS idx_characters_era 
ON public.characters (era);

-- Sự kiện dòng thời gian / Lịch sử Cứu Độ (timeline_events)
CREATE INDEX IF NOT EXISTS idx_timeline_events_year 
ON public.timeline_events (year);

CREATE INDEX IF NOT EXISTS idx_timeline_events_era 
ON public.timeline_events (era);

-- Địa danh bản đồ Kinh Thánh (map_locations)
CREATE INDEX IF NOT EXISTS idx_map_locations_slug 
ON public.map_locations (slug);

CREATE INDEX IF NOT EXISTS idx_map_locations_category 
ON public.map_locations (category);


-- ============================================================================
-- 6. ĐẤU TRƯỜNG QUIZ, TRIỆU PHÚ ĐỨC TIN & SÁCH TRANH THIẾU NHI
-- ============================================================================

-- Lịch sử thi đấu & điểm số Quiz của học viên
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created 
ON public.quiz_attempts (user_id, created_at DESC);

-- Studio Sách Tranh Thiếu Nhi 3D
CREATE INDEX IF NOT EXISTS idx_storybooks_slug 
ON public.storybooks (slug);

CREATE INDEX IF NOT EXISTS idx_storybooks_status 
ON public.storybooks (status);


-- ============================================================================
-- 7. TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN (PROFILES & RBAC)
-- ============================================================================

-- Tra cứu người dùng theo username
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles (username);

-- Lọc người dùng theo vai trò (Quản Trị Viên, Giảng Viên, Học Viên, v.v.)
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles (role);

-- Tra cứu theo email
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles (email);
