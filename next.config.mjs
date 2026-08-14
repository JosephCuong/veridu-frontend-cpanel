/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.thapgia.com',
      },
      {
        protocol: 'http',
        hostname: 'media.thapgia.com',
      },
      {
        protocol: 'https',
        hostname: 'thapgia.com',
      },
      {
        protocol: 'https',
        hostname: 'www.thapgia.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.usercontent.google.com',
      }
    ],
  },
};



export default nextConfig;
