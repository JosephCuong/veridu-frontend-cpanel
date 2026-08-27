/**
 * Helper to normalize and resolve Google Drive and multi-format media URLs
 * Supports: .png, .jpg, .jpeg, .webp, .avif, .mp3, .wav, .m4a, .ogg, .aac
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
      // High-res direct preview for images (.png, .webp, .jpg, ...)
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
    } else {
      // Direct stream for audio (.mp3, .wav, .m4a, .ogg)
      return `https://docs.google.com/uc?export=download&id=${driveId}`;
    }
  }

  return trimmed;
}
