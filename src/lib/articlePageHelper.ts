import { 
  getLibraryArticleBySlug, 
  fetchArticleGeoAndTimeline, 
  fetchArticleAuthorProfile, 
  fetchRelatedContent 
} from '@/lib/api';
import { formatImageUrl } from '@/lib/htmlProcessor';
import { extractQuotesAndImagesFromHtml } from '@/lib/quoteExtractor';

export async function prepareArticlePageData(slug: string) {
  const [article, geoTimeline] = await Promise.all([
    getLibraryArticleBySlug(slug),
    fetchArticleGeoAndTimeline(slug)
  ]);

  if (!article) {
    return null;
  }

  const [authorProfile, relatedItems] = await Promise.all([
    fetchArticleAuthorProfile(article.author_id, article.author_name || article.author),
    fetchRelatedContent(article, geoTimeline || undefined)
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cruxveritatis.org';
  const coverImage = formatImageUrl(article.featured_image || article.thumbnail);

  const titleText = typeof article.title === 'string' ? article.title : 'Bài Viết VERIDU';
  const cleanTitle = titleText.replace(/<[^>]+>/g, '');
  const titleEnText = article.title_en || article.title || 'Scholarly Treatise';
  const cleanTitleEn = typeof titleEnText === 'string' ? titleEnText.replace(/<[^>]+>/g, '') : cleanTitle;

  const defaultDesc = article.excerpt ? article.excerpt.replace(/<[^>]+>/g, '').substring(0, 160) : 'Khám phá thư viện tài liệu Công giáo trên VERIDU.';
  const ogDynamicUrl = `${siteUrl}/api/og?title=${encodeURIComponent(cleanTitle)}&category=${encodeURIComponent(article.category || 'Thần Học & Thánh Kinh')}&author=${encodeURIComponent(article.author_name || article.author || 'Ban Học Vụ VERIDU')}`;
  const defaultImage = (article.thumbnail && !article.thumbnail.includes('default-og-image')) ? article.thumbnail : ((article.featured_image && !article.featured_image.includes('default-og-image')) ? article.featured_image : ogDynamicUrl);

  const htmlContentVi = article.interactiveHtml || article.contentHtml || '';
  const htmlContentEn = article.content_en || '';

  // Effective Locations & Timeline with Self-Contained Fallback
  let effectiveLocations = geoTimeline?.locations || [];
  let effectiveTimelineEvents = geoTimeline?.timelineEvents || [];

  if (article && (effectiveLocations.length === 0 || effectiveTimelineEvents.length === 0)) {
    const rawContent = htmlContentVi;
    const scriptMatch = rawContent.match(/<script\s+type="application\/json"\s+id="veridu-article-geo-timeline"[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      try {
        const parsed = JSON.parse(scriptMatch[1]);
        if (effectiveLocations.length === 0 && Array.isArray(parsed.locations) && parsed.locations.length > 0) {
          effectiveLocations = parsed.locations.map((item: any, idx: number) => ({
            id: item.id || `loc-${idx}`,
            slug: item.slug || `loc-${idx}`,
            name: item.name || item.title || '',
            name_en: item.name_en || '',
            name_original: item.ancient_name || item.name_original || '',
            meaning: item.meaning || '',
            region: item.region || 'Thánh Địa (Holy Land)',
            testament: item.testament || 'cuu-uoc',
            era: item.era || item.historical_period || 'Kinh Thánh',
            latitude: Number(item.latitude ?? item.lat),
            longitude: Number(item.longitude ?? item.lng ?? item.lon),
            importance_level: item.importance_level || 2,
            image_url: item.image_url || '',
            summary: item.summary || item.description || '',
            description: item.description || item.summary || '',
            events: item.events || [],
            scriptures: item.scriptures || item.biblical_references || item.bible_references || [],
            theology: item.theology || '',
            ancient_name: item.ancient_name || item.name_original || '',
            historical_period: item.historical_period || '',
            archaeological_evidence: item.archaeological_evidence || '',
            bible_references: Array.isArray(item.biblical_references) ? item.biblical_references : (Array.isArray(item.bible_references) ? item.bible_references : (item.biblical_references ? [item.biblical_references] : [])),
            article_slugs: [slug]
          }));
        }
        if (effectiveTimelineEvents.length === 0 && (Array.isArray(parsed.timeline_events) || Array.isArray(parsed.events))) {
          const rawEvents = parsed.timeline_events || parsed.events;
          effectiveTimelineEvents = rawEvents.map((ev: any, idx: number) => {
            const yr = typeof ev.year_bce_ce === 'number' ? ev.year_bce_ce : (typeof ev.order_year === 'number' ? ev.order_year : (typeof ev.year === 'number' ? ev.year : 0));
            return {
              id: ev.id || `evt-${idx}`,
              slug: ev.slug || ev.id || `evt-${idx}`,
              order_year: yr,
              year_label: ev.display_date || ev.year_label || (yr < 0 ? `${Math.abs(yr)} TCN` : `${yr} SCN`),
              title: ev.event_title || ev.title || 'Sự kiện',
              subtitle: ev.subtitle || ev.biblical_anchor || '',
              biblical_anchor: ev.biblical_anchor || ev.scripture || '',
              archaeological_anchor: ev.archaeological_anchor || ev.archaeology || '',
              significance: ev.significance || ev.theology || ev.summary || '',
              summary: ev.summary || ev.significance || '',
              description: ev.description || ev.content || '',
              content: ev.content || ev.description || '',
              theology: ev.theology || ev.significance || '',
              article_slug: slug,
              article_slugs: [slug],
              bible_references: ev.biblical_anchor ? [ev.biblical_anchor] : [],
              era_id: ev.era_id || 'era-cuu-uoc',
              era_name: ev.era_name || ev.period || '',
              category: ev.category || 'cuu-uoc'
            };
          }).sort((a: any, b: any) => a.order_year - b.order_year);
        }
      } catch (err) {
        console.error('Failed to parse inline geo-timeline JSON:', err);
      }
    }
  }

  const hasGeoTimelineData = effectiveLocations.length > 0 || effectiveTimelineEvents.length > 0;

  // Jump banner placeholders for Vietnamese
  const timelineBannerHtmlVi = hasGeoTimelineData ? `
<div class="article-geo-callout not-prose my-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 shadow-sm flex items-center justify-between gap-4 transition-all hover:bg-amber-500/15">
  <div class="flex items-center gap-2.5 text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
    <span class="text-base">⏳</span>
    <span>Trục Niên Biểu Lịch Sử Cứu Độ</span>
  </div>
  <a href="#geo-timeline-section" class="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer">
    <span>Xem mốc thời gian</span>
    <span>↓</span>
  </a>
</div>` : '';

  const mapBannerHtmlVi = hasGeoTimelineData ? `
<div class="article-geo-callout not-prose my-6 p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border-l-4 border-indigo-500 shadow-sm flex items-center justify-between gap-4 transition-all hover:bg-indigo-500/15">
  <div class="flex items-center gap-2.5 text-xs font-serif font-bold text-indigo-700 dark:text-indigo-400">
    <span class="text-base">🗺️</span>
    <span>Bản Đồ Tọa Độ Khảo Cổ Cận Đông</span>
  </div>
  <a href="#geo-timeline-section" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
    <span>Mở bản đồ tương tác</span>
    <span>↓</span>
  </a>
</div>` : '';

  // Jump banner placeholders for English
  const timelineBannerHtmlEn = hasGeoTimelineData ? `
<div class="article-geo-callout not-prose my-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 shadow-sm flex items-center justify-between gap-4 transition-all hover:bg-amber-500/15">
  <div class="flex items-center gap-2.5 text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
    <span class="text-base">⏳</span>
    <span>Biblical Salvation History Timeline</span>
  </div>
  <a href="#geo-timeline-section" class="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer">
    <span>View timeline anchors</span>
    <span>↓</span>
  </a>
</div>` : '';

  const mapBannerHtmlEn = hasGeoTimelineData ? `
<div class="article-geo-callout not-prose my-6 p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border-l-4 border-indigo-500 shadow-sm flex items-center justify-between gap-4 transition-all hover:bg-indigo-500/15">
  <div class="flex items-center gap-2.5 text-xs font-serif font-bold text-indigo-700 dark:text-indigo-400">
    <span class="text-base">🗺️</span>
    <span>Biblical & Archaeological Near East Map</span>
  </div>
  <a href="#geo-timeline-section" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
    <span>Open interactive map</span>
    <span>↓</span>
  </a>
</div>` : '';

  const cleanHtmlContentVi = htmlContentVi
    .replace(/<veridu-timeline-placeholder\b[^>]*>(?:<\/veridu-timeline-placeholder>)?/gi, timelineBannerHtmlVi)
    .replace(/<veridu-map-placeholder\b[^>]*>(?:<\/veridu-map-placeholder>)?/gi, mapBannerHtmlVi);

  const cleanHtmlContentEn = htmlContentEn ? htmlContentEn
    .replace(/<veridu-timeline-placeholder\b[^>]*>(?:<\/veridu-timeline-placeholder>)?/gi, timelineBannerHtmlEn)
    .replace(/<veridu-map-placeholder\b[^>]*>(?:<\/veridu-map-placeholder>)?/gi, mapBannerHtmlEn) : cleanHtmlContentVi;

  // Extract sacred scripture block and content images
  const { sacredScripture, images: extractedImages } = extractQuotesAndImagesFromHtml(htmlContentVi, {
    title: cleanTitle,
    featured_image: coverImage || defaultImage,
    thumbnail: article.thumbnail,
    excerpt: article.excerpt,
  });

  const articleUrl = `${siteUrl}/${slug}`;

  // Structured Data (JSON-LD) for Article & Breadcrumb
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        "isPartOf": { "@id": `${siteUrl}/#website` },
        "headline": cleanTitle,
        "description": (article.excerpt || defaultDesc).replace(/<[^>]+>/g, '').substring(0, 200),
        "image": [coverImage || defaultImage],
        "datePublished": article.created_at || new Date().toISOString(),
        "dateModified": article.updated_at || article.created_at || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": article.author || "Ban Biên Tập VERIDU"
        },
        "publisher": {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          "name": "VERIDU",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/favicon.ico`
          }
        },
        "mainEntityOfPage": articleUrl
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang Chủ",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Thư Viện",
            "item": `${siteUrl}/thu-vien`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": cleanTitle,
            "item": articleUrl
          }
        ]
      }
    ]
  };

  return {
    article,
    geoTimeline: {
      locations: effectiveLocations,
      timelineEvents: effectiveTimelineEvents,
    },
    authorProfile,
    relatedItems,
    cleanHtmlContentVi,
    cleanHtmlContentEn,
    sacredScripture,
    extractedImages,
    coverImage,
    defaultImage,
    siteUrl,
    articleJsonLd,
    cleanTitle,
    cleanTitleEn,
  };
}
