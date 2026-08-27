import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      author,
      author_id,
      category,
      item_type,
      format,
      pages_count,
      file_size_label,
      file_url,
      drive_file_id,
      cover_image_url,
      description,
      full_summary_html,
      allow_read_online,
      user_role
    } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Vui lòng điền tên tài liệu và chuyên mục!' }, { status: 400 });
    }

    const slug = slugify(title) + '-' + Math.floor(1000 + Math.random() * 9000);
    
    // Auto-status based on role
    const isPrivileged = user_role === 'admin' || user_role === 'scholar' || user_role === 'Quản Trị Viên' || user_role === 'Học Giả VERIDU';
    const status = isPrivileged ? 'published' : 'pending';

    const { data, error } = await supabase
      .from('library_items')
      .insert([{
        title: title.trim(),
        slug,
        author: author?.trim() || 'VERIDU Contributor',
        author_id: author_id || null,
        category,
        item_type: item_type || 'tai-lieu',
        format: format || 'PDF',
        pages_count: pages_count ? parseInt(pages_count) : null,
        file_size_label: file_size_label || null,
        file_url: file_url || null,
        drive_file_id: drive_file_id || null,
        cover_image_url: cover_image_url || null,
        description: description?.trim() || null,
        full_summary_html: full_summary_html || null,
        allow_read_online: allow_read_online ?? true,
        download_permission_level: 'free',
        view_count: 0,
        download_count: 0,
        status
      }])
      .select()
      .single();

    if (error) {
      console.error('Lỗi khi gửi tài liệu:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'published' 
        ? 'Tài liệu đã được xuất bản thành công vào Thư Viện!' 
        : 'Tài liệu đã được gửi và đang chờ Ban Quản Trị phê duyệt!',
      data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
