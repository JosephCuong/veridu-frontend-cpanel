import React from 'react';
import { Metadata } from 'next';
import HomeClientSections from '@/components/HomeClientSections';
import { fetchCourses, fetchHomepageData } from '@/lib/api';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';

export const metadata: Metadata = {
  title: 'CRUX VERITATIS — Catholic Biblical Studies & Sacred Theology',
  description: 'An international academic portal dedicated to Catholic Scripture studies, Patristics, Dogmatic Theology, and Church History.',
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      'vi-VN': SITE_URL,
      'en-US': `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: 'CRUX VERITATIS — Catholic Biblical Studies & Sacred Theology',
    description: 'An international academic portal dedicated to Catholic Scripture studies, Patristics, Dogmatic Theology, and Church History.',
    url: `${SITE_URL}/en`,
    siteName: 'CRUX VERITATIS',
    type: 'website',
  },
};

export default async function EnglishLandingPage() {
  const courses = await fetchCourses();
  const homepageData = await fetchHomepageData();

  const youtubeUrl = homepageData?.settings?.youtube_url;
  let embedUrl = null;
  if (youtubeUrl) {
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    } else {
      embedUrl = youtubeUrl;
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
