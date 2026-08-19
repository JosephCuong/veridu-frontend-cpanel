import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Hero3DSection from '@/components/Hero3DSection';
import SocialFeed from '@/components/SocialFeed';
import ArticleCarousel from '@/components/ArticleCarousel';
import { fetchCourses, fetchHomepageData } from '@/lib/api';
import { 
  BookOpen, ChevronRight, PlayCircle, Sparkles, MapPin, Clock, ShieldCheck, Cross, Quote
} from 'lucide-react';

export default async function Home() {
  // Fetch live courses & homepage data from Supabase
  const courses = await fetchCourses();
  const homepageData = await fetchHomepageData();

  const youtubeUrl = homepageData?.settings?.youtube_url;
  let embedUrl = null;
  if (youtubeUrl) {
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    } else {
      embedUrl = youtubeUrl; // Fallback
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      <main className="flex-1 space-y-20 pb-24">
        
        {/* ⛪ 1. SACRED 3D CATHOLIC HERO SECTION */}
        <Hero3DSection />

        {/* 🕊️ 2. LỜI CHÚA HÔM NAY / DAILY SCRIPTURE BANNER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--bg-card)] border border-amber-500/30 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center space-y-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              <span>✦</span>
              <span>LỜI CHÚA LÀ KIM CHỈ NAM</span>
              <span>✦</span>
            </div>

            <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-[var(--text-main)] max-w-4xl mx-auto leading-relaxed">
              &ldquo;Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.&rdquo;
            </p>

            <p className="font-serif text-sm font-bold text-amber-600 dark:text-amber-400 tracking-wider">
              — Thánh Vịnh 119, 105
            </p>

            <div className="pt-2">
              <Link
                href="/kinh-thanh"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
              >
                <span>Mở Trọn Bộ 73 Sách Kinh Thánh</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 📖 3. THƯ VIỆN BÀI VIẾT & SUY NIỆM MỚI NHẤT */}
        {homepageData?.articles && homepageData.articles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tracking-wider uppercase">Suy Niệm & Thần Học</span>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">Bài Viết Mới Cập Nhật</h2>
              </div>
              <Link href="/thu-vien" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                Xem toàn bộ thư viện &rarr;
              </Link>
            </div>
            <ArticleCarousel articles={homepageData.articles} />
          </section>
        )}

        {/* 🎓 4. CÁC LỚP HỌC GIÁO LÝ & THẦN HỌC */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tracking-wider uppercase">Học Hỏi Đức Tin</span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">Các Khóa Học Giáo Lý</h2>
            </div>
            <Link href="/khoa-hoc" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              Xem tất cả khóa học &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl">
                <div>
                  <div className="relative w-full aspect-video">
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                      {course.category}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link 
                    href={`/khoa-hoc/${course.slug}`}
                    className="w-full py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text-main)] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Tham Gia Học &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🎥 5. VIDEO SUY NIỆM & GIỚI THIỆU */}
        {embedUrl && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tracking-wider uppercase">Góc Nhìn Linh Đạo</span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)] mt-1">
                Giới Thiệu Nền Tảng VERIDU
              </h2>
            </div>
            <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-card)] bg-black">
              <div className="relative pt-[56.25%] w-full">
                <iframe
                  src={embedUrl}
                  title="Video Giới Thiệu Nền Tảng VERIDU"
                  style={{ width: '100%', height: '100%', border: 0 }}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* 🤝 6. CỘNG ĐỒNG & HIỆP THÔNG ĐỨC TIN */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider inline-block">Cộng Đoàn Hiệp Thông</span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] leading-tight">
                Kết Nối Cùng Chúng Tôi Trên <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Facebook</span>
              </h2>
              <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl leading-relaxed">
                Đồng hành cùng VERIDU để đón nhận các bài viết thần học chuyên sâu, thông báo các lớp học Thánh Kinh và tin tức phụng vụ từ trang chính thức.
              </p>
              <div className="pt-2">
                <a 
                  href="https://www.facebook.com/veridu.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-7 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
                >
                  Gia Nhập Cộng Đồng &rarr;
                </a>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <SocialFeed />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
