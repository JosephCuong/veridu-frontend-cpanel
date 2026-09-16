/**
 * videoHelper.ts
 * Bộ tiện ích nhận diện, phân tích và nhúng video đa nền tảng cho VERIDU
 * Hỗ trợ: YouTube (watch, youtu.be, shorts), Facebook Video / Reels, Google Drive, Vimeo, MP4
 */

export interface ParsedVideo {
  platform: 'youtube' | 'facebook' | 'drive' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  isShorts?: boolean;
}

export interface VideoBlockOptions {
  url: string;
  caption?: string;
  aspectRatio?: '16:9' | '9:16';
  author?: string;
  sourceUrl?: string;
  license?: string;
  licenseUrl?: string;
}

/**
 * Phân tích URL và trả về embed URL phù hợp
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo {
  if (!rawUrl) {
    return { platform: 'unknown', embedUrl: '', originalUrl: '' };
  }

  const trimmed = rawUrl.trim();

  // 1. YouTube Shorts: https://www.youtube.com/shorts/XYZ
  const ytShortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShortsMatch && ytShortsMatch[1]) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytShortsMatch[1]}`,
      originalUrl: trimmed,
      isShorts: true
    };
  }

  // 2. YouTube Standard: watch?v=XYZ or embed/XYZ
  const ytWatchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytWatchMatch[1]}`,
      originalUrl: trimmed,
      isShorts: false
    };
  }

  // 3. Facebook Video / Reels: facebook.com/.../videos/..., fb.watch/..., facebook.com/reel/...
  const isFacebook = /facebook\.com|fb\.watch/i.test(trimmed);
  if (isFacebook) {
    const isFbReel = /facebook\.com\/reel\//i.test(trimmed);
    const encoded = encodeURIComponent(trimmed);
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=1280`,
      originalUrl: trimmed,
      isShorts: isFbReel
    };
  }

  // 4. Google Drive Video: drive.google.com/file/d/XYZ/...
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) || trimmed.match(/id=([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1] && /drive\.google\.com/i.test(trimmed)) {
    return {
      platform: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      originalUrl: trimmed
    };
  }

  // 5. Vimeo: vimeo.com/123456
  const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: trimmed
    };
  }

  // 6. Direct MP4 / WebM / OGG
  if (/\.(mp4|webm|ogg)($|\?)/i.test(trimmed)) {
    return {
      platform: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed
    };
  }

  // Fallback: nếu đã là iframe src sẵn
  return {
    platform: 'unknown',
    embedUrl: trimmed,
    originalUrl: trimmed
  };
}

/**
 * Sinh mã HTML chuẩn Stained-Glass của VERIDU cho khối Video
 */
export function generateVideoBlockHtml(options: VideoBlockOptions): string {
  const { url, caption = '', aspectRatio = '16:9', author = '', sourceUrl = '', license = '', licenseUrl = '' } = options;
  const parsed = parseVideoUrl(url);

  if (!parsed.embedUrl) {
    return '';
  }

  const isVertical = aspectRatio === '9:16' || parsed.isShorts;
  const containerAspectClass = isVertical ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video w-full';

  let innerMedia = '';
  if (parsed.platform === 'direct') {
    innerMedia = `<video src="${parsed.embedUrl}" controls playsinline class="w-full h-full object-cover rounded-3xl" preload="metadata"></video>`;
  } else {
    innerMedia = `<iframe src="${parsed.embedUrl}" class="w-full h-full border-none rounded-3xl" title="${caption || 'Video Phụng Vụ VERIDU'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  }

  const hasAttribution = Boolean(author.trim() || sourceUrl.trim() || license.trim());
  let captionHtml = '';

  if (caption.trim() || hasAttribution) {
    captionHtml = `<figcaption class="mt-3 text-center text-xs font-serif text-[var(--text-muted)] space-y-1.5 max-w-xl mx-auto">
    ${caption.trim() ? `<span class="block text-slate-300 font-medium italic">${caption.trim()}</span>` : ''}
    ${hasAttribution ? `<span class="inline-flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)] opacity-85">
      ${author.trim() ? `<span>Nguồn/Kênh: <strong class="text-amber-500/90 font-semibold">${author.trim()}</strong></span>` : ''}
      ${author.trim() && (license.trim() || sourceUrl.trim()) ? `<span>•</span>` : ''}
      ${license.trim() ? `<a href="${licenseUrl.trim() || '#'}" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">${license.trim()}</a>` : ''}
      ${license.trim() && sourceUrl.trim() ? `<span>•</span>` : ''}
      ${sourceUrl.trim() ? `<a href="${sourceUrl.trim()}" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 inline-flex items-center gap-0.5 text-slate-400 hover:underline"><span>Nguồn gốc</span><span class="text-[10px]">↗</span></a>` : ''}
    </span>` : ''}
  </figcaption>`;
  }

  return `<div class="veridu-embed-video my-8 not-prose" data-veridu-block="video" data-video-url="${encodeURIComponent(url)}" data-aspect-ratio="${isVertical ? '9:16' : '16:9'}" data-caption="${encodeURIComponent(caption)}"${author ? ` data-author="${encodeURIComponent(author)}"` : ''}${sourceUrl ? ` data-source-url="${encodeURIComponent(sourceUrl)}"` : ''}${license ? ` data-license="${encodeURIComponent(license)}"` : ''}${licenseUrl ? ` data-license-url="${encodeURIComponent(licenseUrl)}"` : ''}>
  <div class="${containerAspectClass} rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] bg-black relative z-10 transition-all">
    ${innerMedia}
  </div>
  ${captionHtml}
</div>`;
}
