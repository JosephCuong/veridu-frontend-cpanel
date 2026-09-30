import React from 'react';
import HomeClientSections from '@/components/HomeClientSections';
import { fetchCourses, fetchHomepageData } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch live courses & homepage data from Supabase
  const courses = await fetchCourses();
  const homepageData = await fetchHomepageData();

  const youtubeUrl = homepageData?.settings?.youtube_url;
  let embedUrl = null;
  if (youtubeUrl) {
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    } else {
      embedUrl = youtubeUrl; // Fallback
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300">
      <HomeClientSections 
        courses={courses}
        homepageData={homepageData}
        embedUrl={embedUrl}
      />
    </div>
  );
}
