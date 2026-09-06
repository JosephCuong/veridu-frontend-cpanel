'use client';

import React, { useState, useEffect, useRef } from 'react';
import { normalizeAndSyncHtml } from '@/lib/htmlProcessor';
import { X } from 'lucide-react';

interface VisualArticleRendererProps {
  contentHtml: string;
  className?: string;
}

export default function VisualArticleRenderer({ 
  contentHtml, 
  className = ''
}: VisualArticleRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  // Sanitize and clean HTML to seamlessly blend into the VERIDU design system
  const safeHtml = normalizeAndSyncHtml(contentHtml || '');

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Dynamic Script Loader for Mermaid.js diagrams
    const loadMermaid = () => {
      const renderMermaidDiagrams = () => {
        if ((window as any).mermaid && containerRef.current) {
          try {
            (window as any).mermaid.initialize({
              startOnLoad: false,
              theme: 'dark',
              themeVariables: {
                primaryColor: '#1e293b',
                primaryTextColor: '#fbbf24',
                primaryBorderColor: '#f59e0b',
                lineColor: '#fbbf24',
                secondaryColor: '#0f172a',
                tertiaryColor: '#020617'
              }
            });

            const mermaidNodes = containerRef.current.querySelectorAll('.mermaid, pre.mermaid, div.mermaid, pre:has(code)');
            mermaidNodes.forEach((node, idx) => {
              const text = node.textContent || '';
              if (text.includes('graph TD') || text.includes('graph LR') || text.includes('sequenceDiagram') || text.includes('gantt') || text.includes('classDiagram')) {
                const id = `mermaid-svg-${idx}-${Date.now()}`;
                (window as any).mermaid.render(id, text.trim()).then(({ svg }: any) => {
                  node.innerHTML = svg;
                }).catch((err: any) => {
                  console.warn('Mermaid render warning:', err);
                });
              }
            });
          } catch (e) {
            console.warn('Mermaid init error:', e);
          }
        }
      };

      if ((window as any).mermaid) {
        renderMermaidDiagrams();
      } else {
        const existingScript = document.getElementById('mermaid-cdn-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'mermaid-cdn-script';
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
          script.onload = () => renderMermaidDiagrams();
          document.body.appendChild(script);
        } else {
          existingScript.addEventListener('load', renderMermaidDiagrams);
        }
      }
    };

    loadMermaid();

    // 2. Parse & Render Interactive Charts
    const chartContainers = containerRef.current.querySelectorAll('.recharts-wrapper[data-chart]');
    chartContainers.forEach((container) => {
      const rawJson = container.getAttribute('data-chart');
      if (rawJson) {
        try {
          const chartData = JSON.parse(rawJson);
          if (chartData && chartData.data && Array.isArray(chartData.data)) {
            const items = chartData.data;
            const series = chartData.series || [
              { key: 'LM_PT', name: 'Linh mục / Phó tế', color: '#fbbf24' },
              { key: 'CS_GD', name: 'Chủng sinh / Giáo dân', color: '#6366f1' }
            ];

            let chartHtml = `
              <div class="p-6 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 space-y-4 my-6 shadow-2xl">
                <div class="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-500">📊 Biểu Đồ Thống Kê Phụng Vụ</span>
                  <div class="flex gap-4 text-xs font-medium">
                    ${series.map((s: any) => `
                      <span class="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <span class="w-3 h-3 rounded-full inline-block" style="background-color: ${s.color === '#8B0000' ? '#f43f5e' : s.color === '#C5A059' ? '#fbbf24' : s.color}"></span>
                        ${s.name}
                      </span>
                    `).join('')}
                  </div>
                </div>
                <div class="space-y-3 pt-2">
                  ${items.map((item: any) => `
                    <div class="space-y-1">
                      <div class="flex justify-between text-xs text-[var(--text-main)] font-semibold">
                        <span>${item.name}</span>
                        <span class="text-amber-500 font-mono">${item.LM_PT}% / ${item.CS_GD}%</span>
                      </div>
                      <div class="w-full h-3 bg-[var(--bg-main)] rounded-full overflow-hidden flex">
                        <div style="width: ${item.LM_PT}%; background-color: #fbbf24;" title="Linh mục/Phó tế: ${item.LM_PT}%"></div>
                        <div style="width: ${item.CS_GD}%; background-color: #f43f5e;" title="Chủng sinh/Giáo dân: ${item.CS_GD}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            container.innerHTML = chartHtml;
          }
        } catch (err) {
          console.warn('Chart JSON parse error:', err);
        }
      }
    });

    // 3. Wrap Tables for Responsive Mobile Scrolling
    const tables = containerRef.current.querySelectorAll('table');
    tables.forEach((table) => {
      if (!table.parentElement?.classList.contains('table-responsive-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive-wrapper w-full overflow-x-auto my-6 scrollbar-thin';
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
      table.style.display = 'table';
      table.style.width = '100%';
    });

    // 4. Image Lightbox Click Listener
    const images = containerRef.current.querySelectorAll('img');
    const handleImageClick = (e: Event) => {
      const target = e.currentTarget as HTMLImageElement;
      if (target && target.src) {
        setLightboxSrc(target.src);
        setLightboxAlt(target.alt || 'Ảnh bài viết');
      }
    };
    images.forEach((img) => {
      img.addEventListener('click', handleImageClick);
    });

    // 5. Footnote Normalization & Bidirectional Return Links (Vòng đỏ & Nút quay lại ↩)
    const footnoteLinks = containerRef.current.querySelectorAll<HTMLAnchorElement>(
      'a[href*="#fn"], a[href*="#footnote"], a.footnote-ref, sup.veridu-footnote a'
    );
    
    footnoteLinks.forEach((fnLink) => {
      const href = fnLink.getAttribute('href') || '';
      if (!/#(?:fn|footnote)(?!ref)/i.test(href) && !fnLink.classList.contains('footnote-ref')) return;

      const rawText = fnLink.textContent || '';
      const match = rawText.match(/\d+/) || href.match(/#(?:fn|footnote)[-_:]?(\d+)/i);
      const num = match ? match[1] || match[0] : '';

      if (num) {
        fnLink.classList.add('footnote-ref');
        fnLink.classList.remove('text-amber-600', 'text-amber-500', 'text-amber-400', 'dark:text-amber-400', 'hover:underline');
        // Strip square brackets: "[7]" -> "7"
        fnLink.textContent = num;
        fnLink.setAttribute('title', `Xem chú thích ${num}`);
        fnLink.setAttribute('aria-label', `Xem chú thích ${num}`);

        // Ensure the reference has an ID so the back-link can return here
        if (!fnLink.id) {
          fnLink.id = `fnref-${num}`;
        }
      }
    });

    // Footnote definitions in footer (p or li with id="fn...", or inside .footnotes-section, etc.)
    const footnoteItems = containerRef.current.querySelectorAll<HTMLElement>(
      '[id^="fn"]:not([id^="fnref"]):not(a), [id^="footnote"]:not([id^="footnoteref"]):not(a), .footnotes-section p, .footnotes-section li, .veridu-footnotes p, .veridu-footnotes li, section.footnotes p, section.footnotes li, .footnote-item'
    );

    footnoteItems.forEach((item) => {
      // Ignore headings or anchors
      if (/^H[1-6]$/i.test(item.tagName) || item.tagName === 'A') return;

      const id = item.id || '';
      const matchId = id.match(/(?:fn|footnote)[-_:]?(\d+)/i);
      const matchText = (item.textContent || '').match(/^\s*\[?(\d+)\]?[\.\:\s]/);
      const num = matchId ? matchId[1] : (matchText ? matchText[1] : '');

      if (!num) return;

      // Ensure item has an id so in-text link can jump here
      if (!item.id) {
        item.id = `fn${num}`;
      }

      // Check if item already has a backref
      const existingBackref = item.querySelector('.footnote-backref, a[href*="#fnref"]');
      if (!existingBackref) {
        const backref = document.createElement('a');
        backref.href = `#fnref-${num}`;
        backref.className = 'footnote-backref';
        backref.setAttribute('role', 'button');
        backref.setAttribute('title', `Quay lại vị trí vừa đọc [${num}]`);
        backref.setAttribute('aria-label', `Quay lại vị trí vừa đọc [${num}]`);
        backref.innerHTML = '<span class="footnote-backref-icon" aria-hidden="true">&#x21A9;&#xFE0E;</span><span class="footnote-backref-text">Quay lại</span>';
        item.appendChild(document.createTextNode(' '));
        item.appendChild(backref);
      }
    });

    // 6. Smooth Scroll & Target Glow Click Handler
    const handleContainerClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';

      // A. In-text reference clicked -> smooth scroll to footnote definition
      if (/#(?:fn|footnote)(?!ref)[-_:]?(\d+)/i.test(href) || link.classList.contains('footnote-ref')) {
        const match = href.match(/#(?:fn|footnote)[-_:]?(\d+)/i);
        const num = match ? match[1] : '';
        if (num) {
          const dest = document.getElementById(`fn${num}`)
            || document.getElementById(`fn-${num}`)
            || document.getElementById(`footnote-${num}`)
            || document.getElementById(`footnote${num}`)
            || containerRef.current?.querySelector(`[id="fn${num}"], [id="fn-${num}"]`);

          if (dest) {
            e.preventDefault();
            if (!link.id) {
              link.id = `fnref-${num}`;
            }
            dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dest.classList.add('footnote-target-glow-active');
            window.history.pushState(null, '', href);
            setTimeout(() => {
              dest.classList.remove('footnote-target-glow-active');
            }, 2500);
          }
        }
      }

      // B. Footnote backref clicked (↩) -> smooth scroll back to in-text reference
      if (/#fnref[-_:]?(\d+)/i.test(href) || link.classList.contains('footnote-backref')) {
        const match = href.match(/#fnref[-_:]?(\d+)/i);
        const num = match ? match[1] : '';
        if (num) {
          const dest = document.getElementById(`fnref-${num}`)
            || document.getElementById(`fnref${num}`)
            || containerRef.current?.querySelector(`a[href="#fn${num}"], a[href="#fn-${num}"]`);

          if (dest) {
            e.preventDefault();
            dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dest.classList.add('footnote-ref-glow-active');
            window.history.pushState(null, '', `#fnref-${num}`);
            setTimeout(() => {
              dest.classList.remove('footnote-ref-glow-active');
            }, 2500);
          }
        }
      }
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('click', handleContainerClick);

    return () => {
      images.forEach((img) => {
        img.removeEventListener('click', handleImageClick);
      });
      containerEl.removeEventListener('click', handleContainerClick);
    };
  }, [safeHtml]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxSrc(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div 
        ref={containerRef}
        className={`prose dark:prose-invert prose-amber prose-veridu-sanitized max-w-none font-serif text-[var(--text-main)] leading-relaxed text-base sm:text-lg has-drop-cap ${className}`}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* 🖼️ GLASSMORPHIC IMAGE LIGHTBOX MODAL */}
      {lightboxSrc && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setLightboxSrc(null)}
        >
          <button 
            onClick={() => setLightboxSrc(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20 shadow-2xl cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-5xl max-h-[90vh] relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/50 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightboxSrc} 
              alt={lightboxAlt} 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl mx-auto shadow-2xl"
            />
            {lightboxAlt && (
              <p className="text-center text-xs font-sans italic text-amber-400 mt-3 mb-1 tracking-wide px-4">
                {lightboxAlt}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
