/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.thapgia.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'media.thapgia.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thapgia.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thapgia.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cljglzhuwdniynfkzkxc.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.usercontent.google.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/vendor/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/to-phu-ap-ra-ham-hanh-trinh-bo-xu-di-theo-tieng-chua-lekh-lekha-5867',
        destination: '/to-phu-ap-ra-ham-hanh-trinh-bo-xu-di-theo-tieng-chua-lekh-lekha',
        permanent: true,
      },
      {
        source: '/thu-vien/to-phu-ap-ra-ham-hanh-trinh-bo-xu-di-theo-tieng-chua-lekh-lekha-5867',
        destination: '/to-phu-ap-ra-ham-hanh-trinh-bo-xu-di-theo-tieng-chua-lekh-lekha',
        permanent: true,
      },
      {
        source: '/ban-do-kinh-thanh',
        destination: '/ban-do',
        permanent: true,
      },
      {
        source: '/dong-thoi-gian',
        destination: '/lich-su',
        permanent: true,
      },
      {
        source: '/courses',
        destination: '/khoa-hoc',
        permanent: true,
      },
      {
        source: '/courses/:path*',
        destination: '/khoa-hoc/:path*',
        permanent: true,
      },
      {
        source: '/doc-kinh-thanh',
        destination: '/kinh-thanh',
        permanent: true,
      },
      {
        source: '/doc-kinh-thanh/:path*',
        destination: '/kinh-thanh/:path*',
        permanent: true,
      },
      {
        source: '/dang-bai',
        destination: '/soan-bai',
        permanent: true,
      },
      {
        source: '/dang-bai/:path*',
        destination: '/soan-bai/:path*',
        permanent: true,
      },
      {
        source: '/thu-vien/dang-bai',
        destination: '/soan-bai',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
