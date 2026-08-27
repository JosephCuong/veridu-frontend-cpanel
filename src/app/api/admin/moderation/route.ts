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

    return NextResponse.json({
      posts: pendingPosts || [],
      resources: pendingResources || [],
      applications: pendingApplications || []
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
    } else if (target_type === 'application') {
      const appStatus = action === 'approve' ? 'approved' : 'rejected';
      const { data: app } = await supabase.from('author_applications').update({ 
        status: appStatus, 
        reviewed_by: admin_id || null, 
        updated_at: new Date().toISOString() 
      }).eq('id', target_id).select().single();

      // If approved, upgrade profile role
      if (action === 'approve' && app && app.user_id) {
        await supabase.from('profiles').update({
          role: app.role_applied || 'author',
          is_verified_author: true,
          bio: app.bio,
          specialty: app.specialty,
          parish: app.parish || undefined,
          diocese: app.diocese || undefined
        }).eq('id', app.user_id);
      }
    }

    return NextResponse.json({ success: true, message: `Thao tác ${action} thành công!` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
