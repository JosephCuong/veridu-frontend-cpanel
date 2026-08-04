import { supabase } from './supabaseClient';

// --- POSTS / TH� VI?N & B�I H?C HTML 3D ---
export async function getAdminPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPost(postData: any) {
  const { data, error } = await supabase.from('posts').insert([postData]).select();
  if (error) throw error;
  return data[0];
}

export async function updatePost(id: number | string, postData: any) {
  const { data, error } = await supabase.from('posts').update(postData).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function deletePost(id: number | string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

// --- COURSES & LESSONS (LMS) ---
export async function getAdminCourses() {
  const { data, error } = await supabase.from('courses').select('*, lessons(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCourse(courseData: any) {
  const { data, error } = await supabase.from('courses').insert([courseData]).select();
  if (error) throw error;
  return data[0];
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

// --- B?N �? 3D (MAP LOCATIONS) ---
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

// --- D?NG TH?I GIAN (TIMELINE) ---
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

// --- NG�N H�NG QUIZ ---
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

// --- PROFILES / T�I KHO?N NG�?I D�NG ---
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
