import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // 1. Pending Posts
    const { data: pendingPosts } = await supabase
      .from('posts')
      .select('id, slug, title, category, author_id, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // 2. Pending Library Resources
    const { data: pendingResources } = await supabase
      .from('library_items')
      .select('id, slug, title, author, category, format, file_url, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // 3. Pending Author Applications
    const { data: pendingApplications } = await supabase
      .from('author_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // 4. Pending Courses
    const { data: pendingCourses } = await supabase
      .from('courses')
      .select('id, slug, title, category, level, instructor_name, author_id, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      posts: pendingPosts || [],
      resources: pendingResources || [],
      applications: pendingApplications || [],
      courses: pendingCourses || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_type, target_id, action, admin_id } = body; // action: 'approve' | 'reject'

    if (!target_type || !target_id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'published' : 'rejected';

    if (target_type === 'post') {
      await supabase.from('posts').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', target_id);
    } else if (target_type === 'resource') {
      await supabase.from('library_items').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', target_id);
    } else if (target_type === 'course') {
      const courseStatus = action === 'approve' ? 'published' : 'draft';
      await supabase.from('courses').update({ 
        status: courseStatus, 
        published: action === 'approve' 
      }).eq('id', target_id);
    } else if (target_type === 'application') {
      const appStatus = action === 'approve' ? 'approved' : 'rejected';
      const { data: app } = await supabase.from('author_applications').update({ 
        status: appStatus, 
        reviewed_by: admin_id || null, 
        updated_at: new Date().toISOString() 
      }).eq('id', target_id).select().single();

      // If approved, upgrade profile role & sync with user_roles table
      if (action === 'approve' && app && app.user_id) {
        const rawRole = (app.role_applied || '').toLowerCase();
        let roleId = 'author';
        let roleDisplayName = 'Tác Giả / Học Giả';

        if (rawRole.includes('giảng') || rawRole.includes('instructor')) {
          roleId = 'instructor';
          roleDisplayName = 'Giảng Viên Thần Học';
        } else if (rawRole.includes('giáo lý') || rawRole.includes('catechist')) {
          roleId = 'catechist';
          roleDisplayName = 'Giáo Lý Viên';
        }

        await supabase.from('profiles').update({
          role: roleDisplayName,
          is_verified_author: true,
          bio: app.bio,
          specialty: app.specialty,
          parish: app.parish || undefined,
          diocese: app.diocese || undefined
        }).eq('id', app.user_id);

        await supabase.from('user_roles').upsert({
          user_id: app.user_id,
          role_id: roleId,
          is_primary: true,
          granted_at: new Date().toISOString(),
          granted_by: admin_id || null
        }, { onConflict: 'user_id,role_id' });
      }
    }

    return NextResponse.json({ success: true, message: `Thao tác ${action} thành công!` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
