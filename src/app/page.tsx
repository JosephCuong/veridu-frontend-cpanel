import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Hero3DSection from '@/components/Hero3DSection';
import SocialFeed from '@/components/SocialFeed';
import ArticleCarousel from '@/components/ArticleCarousel';
import { fetchCourses, fetchHomepageData } from '@/lib/api';
import { 
  BookOpen, Gamepad2, Flame, ChevronRight, 
  PlayCircle, Sparkles, MapPin, Clock, ShieldCheck 
} from 'lucide-react';

export default async function Home() {
  // Fetch live courses from Supabase — falls back to mock if unreachable
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
      
      <main className="flex-1 space-y-16 pb-20">
        
        {/* ⛪ SACRED 3D CATHOLIC HERO SHOWCASE SECTION */}
        <Hero3DSection />

        {/* SECTION: CONTINUE LEARNING BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--bg-card)] border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500 animate-bounce" />
                <span>Khóa Học Đang Tiến Hành</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                Nhập Môn Kinh Thánh Cựu Ước & Lịch Sử Cứu Độ
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Bài 2: Giao Ước Với Áp-ra-ham — Cha Các Dân Tộc (Tiến trình: 33%)</p>
            </div>

            <Link 
              href="/khoa-hoc/nhap-mon-kinh-thanh-cuu-uoc-va-lich-su-cuu-do"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 hover:bg-amber-400 transition-colors shadow-lg"
            >
              <span>Học Tiếp Bài 2</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SECTION: YOUTUBE VIDEO HIGHLIGHT */}
        {embedUrl && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider inline-block bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-3">
                Video Nổi Bật
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
                Giới Thiệu VERIDU
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
                ></iframe>
              </div>
            </div>
          </section>
        )}

        {/* SECTION: ARTICLE CAROUSEL */}
        {homepageData?.articles && homepageData.articles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Thư Viện Bài Viết</span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">Mới Cập Nhật</h2>
              </div>
              <Link href="/thu-vien" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Xem tất cả &rarr;
              </Link>
            </div>
            <ArticleCarousel articles={homepageData.articles} />
          </section>
        )}

        {/* SECTION: FEATURED LMS COURSES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Khóa Học Nổi Bật</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">Lộ Trình Học Tập LMS</h2>
            </div>
            <Link href="/khoa-hoc" className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1">
              Xem tất cả &rarr;
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
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
                    Vào Học Khóa Này &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: VERIDU SOCIAL FEED */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider inline-block">Cộng Đồng VERIDU</span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-main)] leading-tight">
                Kết Nối & Cập Nhật Từ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Facebook</span>
              </h2>
              <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl">
                Cập nhật những thông tin mới nhất, các bài viết thần học chuyên sâu, thông báo khóa học và lịch học trực tiếp từ Fanpage chính thức của chúng tôi. Hãy theo dõi để không bỏ lỡ bất kỳ kiến thức hữu ích nào.
              </p>
              <div className="pt-4">
                <a 
                  href="https://www.facebook.com/veridu.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
                >
                  Tham Gia Cộng Đồng &rarr;
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
