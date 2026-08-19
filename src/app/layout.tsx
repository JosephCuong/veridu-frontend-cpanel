import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import BackToTop from "@/components/BackToTop";
import LiturgicalHeader from "@/components/LiturgicalHeader";
import Footer from "@/components/Footer";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thapgia.com"),
  title: "VERIDU — Nền Tảng Học Tập & Nghiên Cứu Công Giáo, Kinh Thánh",
  description: "VERIDU — Nền tảng học tập và nghiên cứu Công giáo, Kinh Thánh, Đấu trường Quiz Giáo lý, Bản đồ 3D Kinh Thánh và Thư viện Suy niệm.",
  openGraph: {
    title: "VERIDU — Nền Tảng Học Tập & Nghiên Cứu Công Giáo, Kinh Thánh",
    description: "VERIDU — Nền tảng học tập và nghiên cứu Công giáo, Kinh Thánh, Đấu trường Quiz Giáo lý, Bản đồ 3D Kinh Thánh và Thư viện Suy niệm.",
    url: "https://www.thapgia.com",
    siteName: "VERIDU",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} antialiased dark`}
    >
      
      <head>
        <script dangerouslySetInnerHTML={{ __html: `!function(){try{var d=document.documentElement,c=d.classList;c.remove('light','dark');var e=localStorage.getItem('veridu-theme');if(e==='dark'){c.add('dark')}else{c.add('light')}}catch(e){}}();` }} />
      </head>
      <body className="w-full min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
        <ToastProvider>
          <LiturgicalHeader />
          
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
          
          <Footer />
          <BackToTop />
        </ToastProvider>
      </body>
    </html>
  );
}
