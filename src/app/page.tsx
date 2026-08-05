import React from 'react';
import Link from 'next/link';

import SocialFeed from '@/components/SocialFeed';
import ArticleCarousel from '@/components/ArticleCarousel';
import { fetchCourses, fetchHomepageData } from '@/lib/api';
import { 
  BookOpen, Gamepad2, Flame, ChevronRight, 
  PlayCircle, Sparkles, MapPin, Clock, ShieldCheck 
} from 'lucide-react';

export default async function Home() {
  // Fetch live courses from WordPress — falls back to mock if unreachable
  const courses = await fetchCourses();
  const homepageData = await fetchHomepageData();

  const heroBg = homepageData?.settings?.hero_image 
    ? { backgroundImage: `url(${homepageData.settings.hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : {};

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
        
        {/* RADIANT ANIMATED HERO BANNER SECTION (Inspired by Howkteam) */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden" style={heroBg}>
          
          {/* Overlay to ensure text readability if background is set */}
          {homepageData?.settings?.hero_image && (
            <div className="absolute inset-0 bg-[var(--bg-main)]/50 z-0"></div>
          )}

          {/* Glowing Animated Background Radial Lights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse z-0"></div>

          <div className="max-w-5xl mx-auto space-y-8 relative z-10">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-amber-500/10 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>NỀN TẢNG CÔNG GIÁO & HỌC TẬP KINH THÁNH 3D</span>
            </div>

            {/* Main Sacred Heading with Lora Font */}
            <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[var(--text-main)] leading-tight">
              Học Kinh Thánh <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600">Trực Quan</span> & Sống Chân Lý
            </h1>

            {/* Subtitle */}
            <p className="text-[var(--text-muted)] text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
              Hệ thống học tập LMS hiện đại kết hợp Đấu trường Quiz Giáo lý Real-time, Trình đọc Kinh Thánh 73 Sách, Bản đồ 3D & Dòng thời gian Lịch sử Cứu độ.
            </p>

            <p className="font-serif text-sm tracking-widest text-amber-500/90 font-bold uppercase">
              VIA &nbsp;·&nbsp; VITA &nbsp;·&nbsp; VERITAS
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link 
                href="/courses/nhap-mon-kinh-thanh-cuu-uoc-va-lich-su-cuu-do"
                className="px-7 py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
              >
                <PlayCircle className="w-5 h-5 fill-current" /> Bắt Đầu Học LMS
              </Link>
              
              <Link 
                href="/quiz"
                className="px-7 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/25 hover:scale-105"
              >
                <Gamepad2 className="w-5 h-5 text-amber-300" /> Đấu Trường Quiz 6 Số
              </Link>
            </div>

            {/* Feature Highlights Quick Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto text-left">
              
              <Link href="/doc-kinh-thanh" className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 transition-all backdrop-blur-md group shadow-sm">
                <BookOpen className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Kinh Thánh 73 Sách</h4>
                <p className="text-[11px] text-[var(--text-muted)]">Bản dịch LM. Nguyễn Thế Thuấn</p>
              </Link>

              <Link href="/ban-do-kinh-thanh" className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-emerald-500/40 transition-all backdrop-blur-md group shadow-sm">
                <MapPin className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Bản Đồ 3D</h4>
                <p className="text-[11px] text-[var(--text-muted)]">Khám phá Vùng Đất Thánh</p>
              </Link>

              <Link href="/dong-thoi-gian" className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-purple-500/40 transition-all backdrop-blur-md group shadow-sm">
                <Clock className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Dòng Thời Gian</h4>
                <p className="text-[11px] text-[var(--text-muted)]">Lịch sử Cứu Độ 4000 năm</p>
              </Link>

              <Link href="/thu-vien" className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-indigo-500/40 transition-all backdrop-blur-md group shadow-sm">
                <ShieldCheck className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">Thư Viện Bài Viết</h4>
                <p className="text-[11px] text-[var(--text-muted)]">Suy niệm & Bài Tương Tác</p>
              </Link>

            </div>

          </div>
        </section>

        {/* SECTION: CONTINUE LEARNING BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--bg-card)] border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                <span>Khóa Học Đang Tiến Hành</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                Nhập Môn Kinh Thánh Cựu Ước & Lịch Sử Cứu Độ
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Bài 2: Giao Ước Với Áp-ra-ham — Cha Các Dân Tộc (Tiến trình: 33%)</p>
            </div>

            <Link 
              href="/courses/nhap-mon-kinh-thanh-cuu-uoc-va-lich-su-cuu-do"
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
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider inline-block bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-3">
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
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Thư Viện Bài Viết</span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">Mới Cập Nhật</h2>
              </div>
              <Link href="/thu-vien" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1">
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
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Khóa Học Nổi Bật</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">Lộ Trình Học Tập LMS</h2>
            </div>
            <Link href="/courses" className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl">
                <div>
                  <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
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
                    href={`/courses/${course.slug}`}
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
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider inline-block">Cộng Đồng VERIDU</span>
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
