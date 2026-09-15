'use client';

import React from 'react';
import { 
  Columns, 
  Grid, 
  Layers, 
  Layout, 
  Plus, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export type FlexboxLayout = 
  | '1-col' 
  | '2-col-equal' 
  | '2-col-60-40' 
  | '2-col-40-60' 
  | '3-col'
  | '2-col-left-wide'
  | '2-col-right-wide'
  | '3-col-equal';

export type FlexboxBgStyle = 'amber-glass' | 'indigo-glass' | 'gold-card' | 'transparent';
export type FlexboxGap = 'sm' | 'md' | 'lg';

export interface FlexboxContainerOptions {
  layout: FlexboxLayout;
  bgStyle: FlexboxBgStyle;
  gap?: FlexboxGap;
  title?: string;
  columnsHtml?: string[];
}

/**
 * Returns Tailwind grid/flex classes for a given layout
 */
export function getLayoutGridClass(layout: FlexboxLayout, gap: FlexboxGap = 'md'): string {
  const gapClass = gap === 'sm' ? 'gap-3 sm:gap-4' : gap === 'lg' ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-6';

  switch (layout) {
    case '1-col':
      return `grid grid-cols-1 ${gapClass} items-start`;
    case '2-col-equal':
      return `grid grid-cols-1 md:grid-cols-2 ${gapClass} items-start`;
    case '2-col-60-40':
    case '2-col-left-wide':
      return `grid grid-cols-1 md:grid-cols-12 ${gapClass} items-start`;
    case '2-col-40-60':
    case '2-col-right-wide':
      return `grid grid-cols-1 md:grid-cols-12 ${gapClass} items-start`;
    case '3-col':
    case '3-col-equal':
      return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${gapClass} items-start`;
    default:
      return `grid grid-cols-1 md:grid-cols-2 ${gapClass} items-start`;
  }
}

/**
 * Returns Tailwind class for child column depending on layout
 */
export function getColumnSpanClass(layout: FlexboxLayout, colIndex: number): string {
  if (layout === '2-col-60-40' || layout === '2-col-left-wide') {
    return colIndex === 0 ? 'md:col-span-7' : 'md:col-span-5';
  }
  if (layout === '2-col-40-60' || layout === '2-col-right-wide') {
    return colIndex === 0 ? 'md:col-span-5' : 'md:col-span-7';
  }
  return '';
}

/**
 * Returns background style classes
 */
export function getBgStyleClass(style: FlexboxBgStyle): string {
  switch (style) {
    case 'amber-glass':
      return 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-xl backdrop-blur-md text-[var(--text-main)]';
    case 'indigo-glass':
      return 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 shadow-xl backdrop-blur-md text-[var(--text-main)]';
    case 'gold-card':
      return 'bg-[var(--bg-card)] border-2 border-amber-500/40 shadow-2xl rounded-3xl text-[var(--text-main)]';
    case 'transparent':
    default:
      return 'bg-transparent border border-dashed border-[var(--border-card)] hover:border-amber-500/40 transition-colors text-[var(--text-main)]';
  }
}

/**
 * Compiles a Flexbox Section Container into standard Stained-Glass HTML
 */
export function compileFlexboxContainerHtml(options: FlexboxContainerOptions): string {
  const { 
    layout = '2-col-equal', 
    bgStyle = 'amber-glass', 
    gap = 'md',
    title = '',
    columnsHtml = [] 
  } = options;

  const bgClass = getBgStyleClass(bgStyle);
  const gridClass = getLayoutGridClass(layout, gap);

  const numCols = layout === '1-col' ? 1 : (layout === '3-col' || layout === '3-col-equal') ? 3 : 2;

  const renderedColumns = Array.from({ length: numCols }).map((_, i) => {
    const colSpan = getColumnSpanClass(layout, i);
    const content = columnsHtml[i] || `<p class="font-serif text-base leading-relaxed text-[var(--text-main)] m-0">Nội dung cột ${i + 1}...</p>`;
    return `<div class="veridu-col space-y-4 ${colSpan}">
      ${content}
    </div>`;
  }).join('\n');

  const titleHtml = title
    ? `<div class="veridu-section-header pb-3 mb-4 border-b border-[var(--border-card)] flex items-center justify-between">
        <h3 class="font-serif font-bold text-base text-amber-500 flex items-center gap-2 m-0">
          <span>✨</span> ${title}
        </h3>
        <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20">
          SECTION ${layout.toUpperCase()}
        </span>
      </div>`
    : '';

  return `<section class="veridu-section-container my-8 p-5 sm:p-7 md:p-8 rounded-3xl ${bgClass} not-prose transition-all" data-veridu-block="container" data-layout="${layout}" data-bg-style="${bgStyle}" data-gap="${gap}" data-title="${encodeURIComponent(title)}">
  ${titleHtml}
  <div class="${gridClass}">
    ${renderedColumns}
  </div>
</section>`;
}

export interface ParsedFlexboxContainer {
  layout: FlexboxLayout;
  bgStyle: FlexboxBgStyle;
  gap: FlexboxGap;
  title: string;
  columnsHtml: string[];
}

export function parseFlexboxContainerHtml(html: string): ParsedFlexboxContainer {
  let layout: FlexboxLayout = '2-col-equal';
  let bgStyle: FlexboxBgStyle = 'amber-glass';
  let gap: FlexboxGap = 'md';
  let title = '';
  const columnsHtml: string[] = [];

  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    const section = temp.firstElementChild;
    if (section) {
      layout = (section.getAttribute('data-layout') as FlexboxLayout) || '2-col-equal';
      bgStyle = (section.getAttribute('data-bg-style') as FlexboxBgStyle) || 'amber-glass';
      gap = (section.getAttribute('data-gap') as FlexboxGap) || 'md';
      title = decodeURIComponent(section.getAttribute('data-title') || '');

      const colElements = section.querySelectorAll('.veridu-col');
      if (colElements.length > 0) {
        colElements.forEach((c) => {
          columnsHtml.push(c.innerHTML.trim());
        });
      }
    }
  }

  return {
    layout,
    bgStyle,
    gap,
    title,
    columnsHtml
  };
}
