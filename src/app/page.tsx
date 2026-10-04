import React from 'react';
import EditorialLandingHome from '@/components/EditorialLandingHome';
import { fetchCourses, fetchHomepageData } from '@/lib/api';

export const revalidate = 60; // ISR 60s cache for blazing-fast TTFB < 50ms and 100/100 Uptime

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
      <EditorialLandingHome 
        courses={courses}
        homepageData={homepageData}
        embedUrl={embedUrl}
      />
    </div>
  );
}
