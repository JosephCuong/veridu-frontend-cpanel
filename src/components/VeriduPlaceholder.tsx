'use client';

import React from 'react';
import {
  VeriduPlaceholderVariant,
  VERIDU_PLACEHOLDER_MAP,
  resolveVeriduPlaceholderVariant,
} from '@/lib/placeholderHelper';

interface VeriduPlaceholderProps {
  variant?: VeriduPlaceholderVariant;
  categoryHint?: string | null;
  alt?: string;
  className?: string;
}

/**
 * Branded VERIDU fallback artwork for articles, courses, and sacred music items
 * that do not yet have a custom cover image or whose remote image fails to load.
 */
export default function VeriduPlaceholder({
  variant,
  categoryHint,
  alt = 'VERIDU — Không Gian Tri Thức Công Giáo',
  className = 'w-full h-full object-cover',
}: VeriduPlaceholderProps) {
  const resolvedVariant = variant || resolveVeriduPlaceholderVariant(categoryHint);
  const src = VERIDU_PLACEHOLDER_MAP[resolvedVariant];

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
    />
  );
}
