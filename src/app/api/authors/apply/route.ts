import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendAdminNewApplicationAlert } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      full_name, 
      christian_name, 
      email, 
      phone, 
      diocese, 
      parish, 
      role_applied, 
      bio, 
      specialty, 
      sample_work_url 
    } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Vui lòng điền họ tên và email!' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('author_applications')
      .insert([{
        user_id: user_id || null,
        full_name: full_name.trim(),
        christian_name: christian_name?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        diocese: diocese?.trim() || null,
        parish: parish?.trim() || null,
        role_applied: role_applied || 'author',
        bio: bio?.trim() || null,
        specialty: specialty?.trim() || null,
        sample_work_url: sample_work_url?.trim() || null,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Lỗi khi nộp đơn tác giả:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Gửi email thông báo cho Quản Trị Viên (non-blocking)
    sendAdminNewApplicationAlert({
      id: data?.id,
      full_name: data?.full_name || full_name,
      christian_name: data?.christian_name || christian_name,
      email: data?.email || email,
      phone: data?.phone || phone,
      diocese: data?.diocese || diocese,
      parish: data?.parish || parish,
      role_applied: data?.role_applied || role_applied,
      bio: data?.bio || bio,
      specialty: data?.specialty || specialty,
      sample_work_url: data?.sample_work_url || sample_work_url
    }).catch(err => console.error('[API apply] Lỗi gửi email cảnh báo cho Admin:', err));

    return NextResponse.json({ 
      success: true, 
      message: 'Đơn đăng ký của bạn đã được gửi thành công! Ban Quản Trị VERIDU sẽ liên hệ sớm nhất.',
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
