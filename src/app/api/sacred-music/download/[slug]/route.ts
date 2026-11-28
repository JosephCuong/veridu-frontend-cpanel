import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { verifyApiAuth, applyRefreshedAuthCookies } from '@/lib/apiAuth';
import { extractGoogleDriveId } from '@/lib/sacredMusic';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Thiếu mã bài Thánh Ca.' }, { status: 400 });
    }

    // Strict login requirement for PDF sheet music access & download
    const auth = await verifyApiAuth(request, 'any');
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          error: 'Vui lòng đăng nhập tài khoản VERIDU để xem trước và tải về bản nhạc PDF.',
        },
        { status: 401 }
      );
    }

    const db = getSupabaseServerClient();
    const { data: item, error } = await db
      .from('sacred_music')
      .select('id, slug, title, pdf_url, pdf_drive_id, downloads, status')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !item || (item.status !== 'published' && !auth.user.isAdmin)) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bản nhạc này.' }, { status: 404 });
    }

    const driveId = extractGoogleDriveId(item.pdf_drive_id || item.pdf_url);
    const rawPdfUrl = (item.pdf_url || '').trim();

    if (!driveId && !rawPdfUrl) {
      return NextResponse.json(
        { success: false, error: 'Bài Thánh Ca này hiện chưa có tệp PDF đính kèm.' },
        { status: 404 }
      );
    }

    const mode = request.nextUrl.searchParams.get('mode') || 'download';

    // Increment downloads counter only when user triggers download (not mere preview)
    if (mode === 'download') {
      await db
        .from('sacred_music')
        .update({ downloads: Number(item.downloads || 0) + 1 })
        .eq('id', item.id);
    }

    const downloadUrl = driveId
      ? `https://drive.google.com/uc?export=download&id=${driveId}`
      : rawPdfUrl;

    const previewUrl = driveId
      ? `https://drive.google.com/file/d/${driveId}/preview`
      : rawPdfUrl;

    const res = NextResponse.json({
      success: true,
      title: item.title,
      fileName: `${item.slug}.pdf`,
      downloadUrl,
      previewUrl,
      downloads: mode === 'download' ? Number(item.downloads || 0) + 1 : Number(item.downloads || 0),
    });

    return applyRefreshedAuthCookies(res, auth.refreshedSession);
  } catch (err: any) {
    console.error('API /api/sacred-music/download error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi hệ thống khi xử lý tải PDF.' }, { status: 500 });
  }
}
