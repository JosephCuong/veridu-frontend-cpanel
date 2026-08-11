import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.thapgia.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/ho-so', '/cai-dat'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
