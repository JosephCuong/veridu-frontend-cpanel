import { getLibraryArticleBySlug } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return new NextResponse('Article Not Found', { status: 404 });
  }

  let processedHtml = article.interactiveHtml || article.contentHtml || '';

  // 1. Tự động chuyển đổi các màu tối (đen, xám đậm) thành màu sáng để đọc được trên nền đen
  processedHtml = processedHtml.replace(/color:\s*(black|#000000|#000|#111111|#111|#222222|#222|#333333|#333|#444444|#444)\b/gi, 'color: #e2e8f0');
  processedHtml = processedHtml.replace(/color:\s*rgb\(\s*[0-6]?\d\s*,\s*[0-6]?\d\s*,\s*[0-6]?\d\s*\)/gi, 'color: #e2e8f0');

  // 2. Chuyển đổi các nền trắng thành trong suốt để không bị chói
  processedHtml = processedHtml.replace(/background(-color)?:\s*(white|#ffffff|#fff)\b/gi, 'background-color: transparent');

  // 3. Tiêm CSS đặc chế (Font Lora, Giao diện tối cho Mục lục, v.v.)
  const customStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      
      :root {
        color-scheme: dark;
      }
      
      body, p, h1, h2, h3, h4, h5, h6, li, blockquote {
        font-family: 'Lora', Georgia, serif;
      }
      
      body {
        color: #e2e8f0;
      }

      /* Ép kiểu cho Mục Lục (TOC) được tạo từ các công cụ ngoài */
      .toc, #toc, [class*="toc-"], [id*="toc-"], [class*="TableOfContents"] {
        background: rgba(15, 23, 42, 0.8) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(245, 158, 11, 0.3) !important;
        border-radius: 1rem !important;
        color: #f8fafc !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
      }
      
      /* Links trong TOC */
      .toc a, #toc a, [class*="toc-"] a {
        color: #fbbf24 !important;
        text-decoration: none !important;
        transition: all 0.3s ease;
      }
      .toc a:hover, #toc a:hover {
        color: #fcd34d !important;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
      }
    </style>
  `;

  // Chèn CSS vào trước thẻ </head>, hoặc ở đầu trang nếu không có
  if (processedHtml.includes('</head>')) {
    processedHtml = processedHtml.replace('</head>', `${customStyles}</head>`);
  } else {
    processedHtml = customStyles + processedHtml;
  }

  // Trả về Raw HTML để render vào Iframe
  return new NextResponse(processedHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
      // Giới hạn nguồn script/style cho bài tương tác trong iframe
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https:",
        "frame-ancestors 'self'"
      ].join('; ')
    },
  });
}
