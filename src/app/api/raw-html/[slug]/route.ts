import { getLibraryArticleBySlug } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getLibraryArticleBySlug(resolvedParams.slug);

  if (!article) {
    return new NextResponse('Article Not Found', { status: 404 });
  }

  const htmlContent = article.interactiveHtml || article.contentHtml || '';

  // Trả về Raw HTML để render vào Iframe
  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60'
    },
  });
}
