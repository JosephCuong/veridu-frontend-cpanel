/**
 * Helper to normalize and resolve Google Drive, YouTube and multi-format media URLs
 * Supports: .png, .jpg, .jpeg, .webp, .avif, .mp3, .wav, .m4a, .ogg, .aac, YouTube
 */

export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];

  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];

  if (/^[a-zA-Z0-9_-]{25,50}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. If 11-char ID directly: e.g. dQw4w9WgXcQ
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. https://www.youtube.com/watch?v=VIDEO_ID
  const matchWatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (matchWatch && matchWatch[1]) return matchWatch[1];

  // 3. https://youtu.be/VIDEO_ID
  const matchShort = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (matchShort && matchShort[1]) return matchShort[1];

  // 4. https://www.youtube.com/embed/VIDEO_ID
  const matchEmbed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (matchEmbed && matchEmbed[1]) return matchEmbed[1];

  // 5. https://www.youtube.com/shorts/VIDEO_ID
  const matchShorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (matchShorts && matchShorts[1]) return matchShorts[1];

  return null;
}

export function resolveMediaUrl(url: string, type: 'image' | 'audio' = 'image'): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If local static path or data URL
  if (trimmed.startsWith('/') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Check if Google Drive link
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    if (type === 'image') {
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
    } else {
      return `https://docs.google.com/uc?export=download&id=${driveId}`;
    }
  }

  return trimmed;
}
