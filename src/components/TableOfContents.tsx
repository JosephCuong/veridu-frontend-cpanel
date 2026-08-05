'use client';

import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Phân tích các thẻ h2, h3 bên trong nội dung bài viết (article)
    const elements = Array.from(document.querySelectorAll('.article-content h2, .article-content h3'));
    
    const parsed = elements.map((el, index) => {
      // Đảm bảo mỗi heading có một id để anchor link
      if (!el.id) {
        // Tạo slug từ text
        const text = el.textContent || '';
        const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        el.id = slug || `heading-${index}`;
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: el.tagName.toLowerCase() === 'h2' ? 2 : 3
      };
    });

    setHeadings(parsed);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 p-6 glass-panel rounded-2xl hidden xl:block text-sm border border-[var(--border-card)] shadow-xl max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-amber-500 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
        Mục Lục Bài Viết
      </h3>
      <ul className="space-y-3">
        {headings.map(h => (
          <li key={h.id} className={`${h.level === 3 ? 'ml-4 text-xs' : 'font-medium'}`}>
            <a 
              href={`#${h.id}`} 
              className="text-[var(--text-muted)] hover:text-amber-500 transition-colors block leading-relaxed"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
