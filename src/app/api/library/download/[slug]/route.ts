import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { checkUserDownloadQuota, recordDownloadItem } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole') || 'Học Viên';

    if (!slug) {
      return NextResponse.json({ error: 'Thiếu slug tác phẩm' }, { status: 400 });
    }

    // 1. Lấy thông tin tệp từ Supabase
    const { data: item, error: itemError } = await supabase
      .from('library_items')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Không tìm thấy tài liệu trong thư viện' }, { status: 404 });
    }

    // 2. Kiểm tra quyền hạn & hạn mức tải nếu yêu cầu đăng nhập
    if (item.download_permission_level !== 'public') {
      if (!userId) {
        return NextResponse.json(
          { error: 'Vui lòng đăng nhập tài khoản để tải tài liệu này' },
          { status: 401 }
        );
      }

      const quota = await checkUserDownloadQuota(userId, userRole);
      if (!quota.canDownload) {
        return NextResponse.json(
          { 
            error: 'Bạn đã sử dụng hết 5 lượt tải miễn phí trong hôm nay. Hạn mức sẽ tự động đặt lại sau 24h.',
            remainingQuota: 0,
            maxQuota: quota.maxQuota
          },
          { status: 429 }
        );
      }
    }

    // 3. Ghi nhận lượt tải
    await recordDownloadItem(item.id, item.slug, userId || undefined);

    // 4. Trả về link tải tệp (hoặc direct file url / drive download url)
    let downloadTarget = item.file_url || '';
    if (item.drive_file_id && (!downloadTarget || downloadTarget.includes('raw.githubusercontent.com'))) {
      downloadTarget = `https://drive.google.com/uc?export=download&id=${item.drive_file_id}`;
    }

    return NextResponse.json({
      success: true,
      downloadUrl: downloadTarget,
      title: item.title,
      format: item.format,
      fileName: `${item.slug}.${item.format.toLowerCase().includes('pdf') ? 'pdf' : item.format.toLowerCase().includes('docx') ? 'docx' : 'pdf'}`
    });
  } catch (err: any) {
    console.error('Lỗi khi xử lý tải tài liệu:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
