import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import BackToTop from "@/components/BackToTop";
import LiturgicalHeader from "@/components/LiturgicalHeader";
import Footer from "@/components/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thapgia.com"),
  title: {
    default: "VERIDU — Nền Tảng Học Tập, Giáo Lý & Kinh Thánh Công Giáo",
    template: "%s | VERIDU",
  },
  description: "VERIDU — Hệ sinh thái học tập và nghiên cứu Công giáo, Kinh Thánh, Đấu trường Quiz Giáo Lý, Webgame Chinh Phục Chân Lý, Bản đồ 3D Thánh Kinh và Thư viện Bài Viết Suy Niệm.",
  keywords: [
    "VERIDU", "Thập Giá", "Kinh Thánh", "Giáo Lý Hội Thánh Công Giáo",
    "Đấu Trường Quiz", "Chinh Phục Chân Lý", "Hành Trình Đất Hứa", "Sách Tranh Công Giáo",
    "Bản Đồ Kinh Thánh", "Suy Niệm Lời Chúa", "Thiếu Nhi Thánh Thể"
  ],
  authors: [{ name: "VERIDU Editorial & Tech Team", url: "https://www.thapgia.com" }],
  creator: "VERIDU",
  publisher: "VERIDU Catholic Knowledge Platform",
  alternates: {
    canonical: "https://www.thapgia.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  } : undefined,
  openGraph: {
    title: "VERIDU — Nền Tảng Học Tập, Giáo Lý & Kinh Thánh Công Giáo",
    description: "Hệ sinh thái học tập và nghiên cứu Công giáo, Kinh Thánh, Đấu trường Quiz Giáo Lý, Webgame Chinh Phục Chân Lý, Bản đồ 3D Thánh Kinh và Thư viện Bài Viết.",
    url: "https://www.thapgia.com",
    siteName: "VERIDU",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "https://www.thapgia.com/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "VERIDU — Nền Tảng Học Tập, Giáo Lý & Kinh Thánh Công Giáo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VERIDU — Nền Tảng Học Tập, Giáo Lý & Kinh Thánh Công Giáo",
    description: "Hệ sinh thái học tập Công giáo, Đấu trường Quiz, Webgame 2D và Thư viện Suy niệm.",
    images: ["https://www.thapgia.com/images/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for Google Search Console & Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.thapgia.com/#organization",
        "name": "VERIDU",
        "url": "https://www.thapgia.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.thapgia.com/favicon.ico"
        },
        "description": "Nền tảng học tập, nghiên cứu Kinh Thánh và Giáo Lý Công Giáo."
      },
      {
        "@type": "WebSite",
        "@id": "https://www.thapgia.com/#website",
        "url": "https://www.thapgia.com",
        "name": "VERIDU",
        "publisher": { "@id": "https://www.thapgia.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.thapgia.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} antialiased dark`}
    >
      <head>
        {/* ── GOOGLE TAG (gtag.js) - STRICTLY IN HEAD FOR GOOGLE SEARCH CONSOLE VERIFICATION ── */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DDK6K002MD" />
        <script
          id="google-tag-init"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DDK6K002MD');`,
          }}
        />

        {/* ── GOOGLE ADSENSE ── */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5209827375568934"
          crossOrigin="anonymous"
        />

        {/* Performance Preconnects & DNS-Prefetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://cljglzhuwdniynfkzkxc.supabase.co" />

        {/* RSS Auto-Discovery Feed for Google Discover & Readers */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="VERIDU — Dòng Tin & Bài Viết Mới"
          href="https://www.thapgia.com/feed.xml"
        />

        {/* Preload 3D Sacred Scripture Model & Model-Viewer Library for Instant Rendering */}
        <link rel="preload" href="/models/bible_3d_model.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/vendor/model-viewer.min.js" as="script" />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Theme Initializer Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var d=document.documentElement,c=d.classList;c.remove('light','dark');var e=localStorage.getItem('veridu-theme');if(e==='light'){c.add('light')}else{c.add('dark')}}catch(e){}}();`,
          }}
        />
      </head>
      <body className="w-full min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
        <ToastProvider>
          <LiturgicalHeader />
          
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
          
          <Footer />
          <CookieConsentBanner />
          <BackToTop />
        </ToastProvider>
      </body>
    </html>
  );
}
