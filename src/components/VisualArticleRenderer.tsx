'use client';

import React, { useEffect, useRef } from 'react';
import { normalizeAndSyncHtml } from '@/lib/htmlProcessor';

interface VisualArticleRendererProps {
  contentHtml: string;
  className?: string;
}

export default function VisualArticleRenderer({ contentHtml, className = '' }: VisualArticleRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-process HTML to normalize inline styles, remove embedded TOCs, and strip full-page tags.
  const safeHtml = normalizeAndSyncHtml(contentHtml || '');

  useEffect(() => {
    // 1. Dynamic Script Loader for Mermaid.js (CDN-based for maximum compatibility & zero bundle bloat)
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

            const mermaidNodes = containerRef.current.querySelectorAll('.mermaid, pre:has(code)');
            mermaidNodes.forEach((node, idx) => {
              const text = node.textContent || '';
              if (text.includes('graph TD') || text.includes('graph LR') || text.includes('sequenceDiagram')) {
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

    // 2. Parse & Render Interactive Charts (Recharts data-chart wrapper)
    if (containerRef.current) {
      const chartContainers = containerRef.current.querySelectorAll('.recharts-wrapper[data-chart]');
      chartContainers.forEach((container) => {
        const rawJson = container.getAttribute('data-chart');
        if (rawJson) {
          try {
            const chartData = JSON.parse(rawJson);
            if (chartData && chartData.data && Array.isArray(chartData.data)) {
              // Custom SVG Bar Chart Renderer
              const items = chartData.data;
              const series = chartData.series || [
                { key: 'LM_PT', name: 'Linh mục / Phó tế', color: '#fbbf24' },
                { key: 'CS_GD', name: 'Chủng sinh / Giáo dân', color: '#6366f1' }
              ];

              let chartHtml = `
                <div class="p-6 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 space-y-4 my-6 shadow-2xl">
                  <div class="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                    <span class="text-xs font-bold uppercase tracking-wider text-amber-400">📊 Biểu Đồ Thống Kê Phụng Vụ</span>
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
                          <span class="text-amber-400 font-mono">${item.LM_PT}% / ${item.CS_GD}%</span>
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

      // 3. Ensure responsive table wrappers & dark mode contrast class overrides
      const tables = containerRef.current.querySelectorAll('table');
      tables.forEach((table) => {
        if (!table.parentElement?.classList.contains('table-responsive-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-responsive-wrapper w-full overflow-x-auto my-6 scrollbar-thin';
          table.parentNode?.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
        table.style.display = 'block';
        table.style.overflowX = 'auto';
        table.style.width = '100%';
      });

      const inlineElements = containerRef.current.querySelectorAll('[style]');
      inlineElements.forEach((el) => {
        const styleAttr = el.getAttribute('style') || '';
        if (/color:\s*(black|#000000|#000|#111111|#111|#222222|#222|#333333|#333)\b/i.test(styleAttr)) {
          el.classList.add('dark-mode-color-override');
        }
        if (/background(-color)?:\s*(white|#ffffff|#fff)\b/i.test(styleAttr)) {
          el.classList.add('dark-mode-bg-override');
        }
      });
    }

  }, [safeHtml]);

  return (
    <div 
      ref={containerRef}
      className={`prose dark:prose-invert prose-amber prose-veridu-sanitized max-w-none font-serif text-[var(--text-main)] leading-relaxed text-base sm:text-lg has-drop-cap ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
