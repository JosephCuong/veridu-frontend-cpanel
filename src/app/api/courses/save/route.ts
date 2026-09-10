import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { course } = body;

    if (!course || !course.title) {
      return NextResponse.json({ success: false, error: 'Tiêu đề khóa học là bắt buộc' }, { status: 400 });
    }

    let courseId = course.id ? Number(course.id) : null;
    const slug = course.slug || course.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const courseData: any = {
      title: course.title,
      slug: slug,
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      category: course.category || 'Kinh Thánh Cựu Ước',
      level: course.level || 'Cơ Bản',
      published: course.published !== undefined ? Boolean(course.published) : true,
      instructor_name: course.instructor_name || 'VERIDU Team',
      instructor_title: course.instructor_title || 'Hội Đồng Khảo Cứu Thần Học',
      instructor_avatar: course.instructor_avatar || 'https://lh3.googleusercontent.com/d/1iRz6nIRhfEoV_fbxVTCwW0ApQ87IqHK5',
      total_duration: course.total_duration || `${course.lessons?.length || 0} Bài Học`,
      certificate_enabled: course.certificate_enabled !== undefined ? Boolean(course.certificate_enabled) : true,
    };

    if (courseId && courseId > 0) {
      const { error: updateError } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId);

      if (updateError) {
        return NextResponse.json({ success: false, error: 'Lỗi cập nhật khóa học: ' + updateError.message }, { status: 500 });
      }
    } else {
      const { data: newCourse, error: insertError } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError || !newCourse) {
        return NextResponse.json({ success: false, error: 'Lỗi tạo khóa học mới: ' + insertError?.message }, { status: 500 });
      }
      courseId = newCourse.id;
    }

    // Process Lessons & Sections if provided
    if (Array.isArray(course.lessons) && courseId) {
      // 1. Fetch current existing lessons in DB for this course
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);

      const existingLessonIds = (existingLessons || []).map((l: any) => l.id);
      const incomingLessonIds = course.lessons
        .map((l: any) => typeof l.id === 'number' && l.id > 0 ? l.id : null)
        .filter(Boolean) as number[];

      // Delete lessons that were removed
      const lessonsToDelete = existingLessonIds.filter((id: number) => !incomingLessonIds.includes(id));
      if (lessonsToDelete.length > 0) {
        await supabase.from('lessons').delete().in('id', lessonsToDelete);
      }

      // Upsert each lesson
      for (let lIdx = 0; lIdx < course.lessons.length; lIdx++) {
        const lesson = course.lessons[lIdx];
        const isExistingLesson = typeof lesson.id === 'number' && lesson.id > 0 && existingLessonIds.includes(lesson.id);

        let currentLessonId: number;

        const lessonPayload: any = {
          course_id: courseId,
          title: lesson.title || `Bài học ${lIdx + 1}`,
          order_index: lIdx + 1,
          duration_minutes: Number(lesson.duration_minutes) || 15,
          slug: lesson.slug || `bai-${lIdx + 1}`,
          description: lesson.description || '',
        };

        if (isExistingLesson) {
          await supabase
            .from('lessons')
            .update(lessonPayload)
            .eq('id', lesson.id);
          currentLessonId = lesson.id;
        } else {
          const { data: newLesson, error: newLessonErr } = await supabase
            .from('lessons')
            .insert({
              ...lessonPayload,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (newLessonErr || !newLesson) {
            console.error('Error inserting lesson:', newLessonErr);
            continue;
          }
          currentLessonId = newLesson.id;
        }

        // Process Sections for this lesson
        if (Array.isArray(lesson.sections) && currentLessonId) {
          const { data: existingSections } = await supabase
            .from('lesson_sections')
            .select('id')
            .eq('lesson_id', currentLessonId);

          const existingSectionIds = (existingSections || []).map((s: any) => s.id);
          const incomingSectionIds = lesson.sections
            .map((s: any) => typeof s.id === 'number' && s.id > 0 ? s.id : null)
            .filter(Boolean) as number[];

          // Delete removed sections
          const sectionsToDelete = existingSectionIds.filter((id: number) => !incomingSectionIds.includes(id));
          if (sectionsToDelete.length > 0) {
            await supabase.from('lesson_sections').delete().in('id', sectionsToDelete);
          }

          // Upsert each section
          for (let sIdx = 0; sIdx < lesson.sections.length; sIdx++) {
            const section = lesson.sections[sIdx];
            const isExistingSection = typeof section.id === 'number' && section.id > 0 && existingSectionIds.includes(section.id);

            const sectionPayload: any = {
              lesson_id: currentLessonId,
              title: section.title || `Phần ${sIdx + 1}`,
              section_type: section.section_type || 'text',
              order_index: sIdx + 1,
              media_url: section.media_url || '',
              content_html: section.content_html || '',
              quiz_data: Array.isArray(section.quiz_data) ? section.quiz_data : null,
              duration_minutes: Number(section.duration_minutes) || 10,
            };

            if (isExistingSection) {
              await supabase
                .from('lesson_sections')
                .update(sectionPayload)
                .eq('id', section.id);
            } else {
              await supabase
                .from('lesson_sections')
                .insert({
                  ...sectionPayload,
                  created_at: new Date().toISOString()
                });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      courseId,
      slug,
      message: 'Khóa học và giáo trình đã được lưu thành công vào Supabase!'
    });
  } catch (err: any) {
    console.error('Error saving course:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
