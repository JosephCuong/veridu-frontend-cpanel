import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thapgia.com';

  // 1. Static Core Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/thu-vien`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/thu-vien/sach`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/thu-vien/tai-lieu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kinh-thanh`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/giao-ly`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/giao-ly/doc/loi-mo-dau`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/giao-ly/the-lat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/khoa-hoc`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ban-do`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/lich-su`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/nhan-vat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/game`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/game/hanh-trinh-dat-hua`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/game/trieu-phu-duc-tin`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/sach-tranh`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tac-gia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dieu-khoan-su-dung`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/chinh-sach-bao-mat`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // 2. Dynamic Articles (Short SEO URLs)
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published');

    if (posts) {
      posts.forEach((post) => {
        dynamicRoutes.push({
          url: `${baseUrl}/${post.slug}`,
          lastModified: new Date(post.updated_at || post.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    // 3. Dynamic Storybooks
    const { data: storybooks } = await supabase
      .from('storybooks')
      .select('slug, updated_at, created_at')
      .eq('status', 'published');

    if (storybooks) {
      storybooks.forEach((sb) => {
        dynamicRoutes.push({
          url: `${baseUrl}/sach-tranh/${sb.slug}`,
          lastModified: new Date(sb.updated_at || sb.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    // 4. Dynamic Characters
    const { data: characters } = await supabase
      .from('characters')
      .select('slug, updated_at, created_at');

    if (characters) {
      characters.forEach((char) => {
        dynamicRoutes.push({
          url: `${baseUrl}/nhan-vat/${char.slug}`,
          lastModified: new Date(char.updated_at || char.created_at || Date.now()),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      });
    }

    // 5. Dynamic Courses
    const { data: courses } = await supabase
      .from('courses')
      .select('slug, updated_at, created_at');

    if (courses) {
      courses.forEach((c) => {
        dynamicRoutes.push({
          url: `${baseUrl}/khoa-hoc/${c.slug}`,
          lastModified: new Date(c.updated_at || c.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      });
    }

    // 6. Dynamic Library Items (Books & Docs)
    const { data: libraryItems } = await supabase
      .from('library_items')
      .select('slug, item_type, updated_at, created_at');

    if (libraryItems) {
      libraryItems.forEach((item) => {
        const pathPrefix = item.item_type === 'sach' ? 'sach' : 'tai-lieu';
        dynamicRoutes.push({
          url: `${baseUrl}/thu-vien/${pathPrefix}/${item.slug}`,
          lastModified: new Date(item.updated_at || item.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      });
    }

    // 7. Dynamic Catholic Bible Books (73 Sách Kinh Thánh)
    const { data: bibleBooks } = await supabase
      .from('bible_books')
      .select('code, name, chapters_count')
      .order('order_index', { ascending: true });

    if (bibleBooks) {
      bibleBooks.forEach((b) => {
        const bookSlug = b.code.toLowerCase();
        dynamicRoutes.push({
          url: `${baseUrl}/kinh-thanh/${bookSlug}/1`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.85,
        });
      });
    }

  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
