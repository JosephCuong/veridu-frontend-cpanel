import { supabase } from './supabaseClient';

// --- SUPABASE STORAGE MEDIA UPLOAD ---
export async function uploadMediaFile(file: File, folder = 'posts'): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  let bucket = 'media';
  let { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.warn(`Upload to bucket '${bucket}' failed, trying 'post-images'...`, error);
    bucket = 'post-images';
    const retryResult = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (retryResult.error) {
      throw new Error(`Supabase Storage upload error: ${retryResult.error.message || error.message}`);
    }
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Không thể lấy public URL từ Supabase Storage.');
  }

  return publicUrlData.publicUrl;
}

export async function uploadBase64Image(dataUrl: string, folder = 'posts'): Promise<string> {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const ext = mime.split('/')[1] || 'png';
  const file = new File([u8arr], `upload_${Date.now()}.${ext}`, { type: mime });
  return uploadMediaFile(file, folder);
}

// --- POSTS / THƯ VIỆN & BÀI HỌC HTML 3D ---
export async function getAdminPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPost(postData: any) {
  let featuredImageUrl = postData.featured_image;

  if (featuredImageUrl && typeof featuredImageUrl === 'string' && featuredImageUrl.startsWith('data:')) {
    featuredImageUrl = await uploadBase64Image(featuredImageUrl, 'posts');
  } else if (featuredImageUrl && typeof featuredImageUrl === 'object' && featuredImageUrl instanceof File) {
    featuredImageUrl = await uploadMediaFile(featuredImageUrl, 'posts');
  }

  const finalPostData: any = {
    ...postData,
    featured_image: featuredImageUrl
  };

  const { data, error } = await supabase.from('posts').insert([finalPostData]).select();
  if (error) throw error;
  return data[0];
}

export async function updatePost(id: number | string, postData: any) {
  let featuredImageUrl = postData.featured_image;

  if (featuredImageUrl && typeof featuredImageUrl === 'string' && featuredImageUrl.startsWith('data:')) {
    featuredImageUrl = await uploadBase64Image(featuredImageUrl, 'posts');
  } else if (featuredImageUrl && typeof featuredImageUrl === 'object' && featuredImageUrl instanceof File) {
    featuredImageUrl = await uploadMediaFile(featuredImageUrl, 'posts');
  }

  const finalPostData: any = {
    ...postData,
    ...(featuredImageUrl ? { featured_image: featuredImageUrl } : {})
  };

  const { data, error } = await supabase.from('posts').update(finalPostData).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function deletePost(id: number | string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

// --- COURSES & LESSONS (LMS) ---
export async function getAdminCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_modules(*, lessons(*))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  // Sort modules and lessons by order_index
  return data?.map(course => ({
    ...course,
    course_modules: (course.course_modules || [])
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      .map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      }))
  })) || [];
}

export async function createCourse(courseData: any) {
  const { data, error } = await supabase.from('courses').insert([courseData]).select();
  if (error) throw error;
  return data[0];
}

export async function updateCourse(id: number | string, courseData: any) {
  const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function saveCourseStructure(courseId: number | string, modules: any[]) {
  // First, get existing modules to handle deletions if needed (for simplicity, we can upsert)
  for (let mIndex = 0; mIndex < modules.length; mIndex++) {
    const mod = modules[mIndex];
    let moduleId = mod.id;

    const moduleData = {
      course_id: courseId,
      title: mod.title,
      description: mod.description,
      order_index: mIndex
    };

    if (String(moduleId).startsWith('temp-')) {
      // Create new module
      const { data: newMod, error: errMod } = await supabase.from('course_modules').insert([moduleData]).select();
      if (errMod) throw errMod;
      moduleId = newMod[0].id;
    } else {
      // Update existing
      const { error: errMod } = await supabase.from('course_modules').update(moduleData).eq('id', moduleId);
      if (errMod) throw errMod;
    }

    // Now upsert lessons
    const lessons = mod.lessons || [];
    for (let lIndex = 0; lIndex < lessons.length; lIndex++) {
      const les = lessons[lIndex];
      const lessonData = {
        course_id: courseId,
        module_id: moduleId,
        title: les.title,
        content: les.content || '',
        order_index: lIndex,
        type: les.type || 'text',
        video_url: les.video_url || null,
        interactive_html: les.interactive_html || null,
        document_url: les.document_url || null,
        is_free_preview: les.is_free_preview || false
      };

      if (String(les.id).startsWith('temp-')) {
        const { error: errLes } = await supabase.from('lessons').insert([lessonData]);
        if (errLes) throw errLes;
      } else {
        const { error: errLes } = await supabase.from('lessons').update(lessonData).eq('id', les.id);
        if (errLes) throw errLes;
      }
    }
  }
}

export async function deleteCourseModule(id: number | string) {
  const { error } = await supabase.from('course_modules').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteLesson(id: number | string) {
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
}

export async function createLesson(lessonData: any) {
  const { data, error } = await supabase.from('lessons').insert([lessonData]).select();
  if (error) throw error;
  return data[0];
}

export async function deleteCourse(id: number | string) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

// --- BẢN ĐỒ 3D (MAP LOCATIONS) ---
export async function getAdminMapLocations() {
  const { data, error } = await supabase.from('map_locations').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createMapLocation(locationData: any) {
  const { data, error } = await supabase.from('map_locations').insert([locationData]).select();
  if (error) throw error;
  return data[0];
}

export async function deleteMapLocation(id: number | string) {
  const { error } = await supabase.from('map_locations').delete().eq('id', id);
  if (error) throw error;
}

// --- DÒNG THỜI GIAN (TIMELINE) ---
export async function getAdminTimelineEvents() {
  const { data, error } = await supabase.from('timeline_events').select('*').order('order_year', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTimelineEvent(eventData: any) {
  const { data, error } = await supabase.from('timeline_events').insert([eventData]).select();
  if (error) throw error;
  return data[0];
}

export async function deleteTimelineEvent(id: number | string) {
  const { error } = await supabase.from('timeline_events').delete().eq('id', id);
  if (error) throw error;
}

// --- NGÂN HÀNG QUIZ ---
export async function getAdminQuizQuestions() {
  const { data, error } = await supabase.from('quiz_questions').select('*').order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createQuizQuestion(questionData: any) {
  const { data, error } = await supabase.from('quiz_questions').insert([questionData]).select();
  if (error) throw error;
  return data[0];
}

export async function deleteQuizQuestion(id: number | string) {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
  if (error) throw error;
}

// --- PROFILES / TÀI KHOẢN NGƯỜI DÙNG ---
export async function getAdminProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateProfileRole(id: string, role: string) {
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select();
  if (error) throw error;
  return data[0];
}
