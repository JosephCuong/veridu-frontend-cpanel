/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'media.thapgia.com',
      },
      {
        protocol: 'https',
        hostname: 'data.thapgia.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
