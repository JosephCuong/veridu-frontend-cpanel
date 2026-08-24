'use client';

import React, { useState, useEffect, useRef } from 'react';
import { normalizeAndSyncHtml } from '@/lib/htmlProcessor';
import { X, Maximize2, RefreshCw } from 'lucide-react';

interface VisualArticleRendererProps {
  contentHtml: string;
  className?: string;
  forceSandbox?: boolean;
}

export default function VisualArticleRenderer({ 
  contentHtml, 
  className = '',
  forceSandbox = false 
}: VisualArticleRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if content is a full standalone HTML document with doctype/html/head/style tags
  const isFullDocument = forceSandbox || (
    typeof contentHtml === 'string' && (
      /<!DOCTYPE\s+html/i.test(contentHtml) ||
      /<html[\s>]/i.test(contentHtml) ||
      /<head[\s>]/i.test(contentHtml) ||
      /<style[\s>]/i.test(contentHtml) ||
      /<script[\s>]/i.test(contentHtml) ||
      /canvas|three\.js|recharts-wrapper|mermaid/i.test(contentHtml)
    )
  );

  // Pre-process HTML to normalize inline styles, remove embedded TOCs, and strip full-page tags for inline rendering.
  const safeHtml = normalizeAndSyncHtml(contentHtml || '');

  useEffect(() => {
    if (isFullDocument) return;

    // 1. Dynamic Script Loader for Mermaid.js for inline fragments
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

    // 2. Parse & Render Interactive Charts (Recharts data-chart wrapper)
    if (containerRef.current) {
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

      return () => {
        images.forEach((img) => {
          img.removeEventListener('click', handleImageClick);
        });
      };
    }
  }, [safeHtml, isFullDocument]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxSrc(null);
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 🌟 CASE 1: FULL STANDALONE HTML OR INTERACTIVE DOCUMENT (ISOLATED SANDBOX IFRAME)
  if (isFullDocument) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-2xl bg-slate-950 ${className}`}>
        {/* Sandbox Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-300">Khung Xem Cách Ly Tuyệt Đối (Sandbox)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              title="Làm mới khung xem"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              title="Mở toàn màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sandboxed Iframe (100% style and script isolated) */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          srcDoc={contentHtml}
          title="Nội dung bài viết HTML"
          className={`w-full border-none transition-all duration-300 bg-white dark:bg-slate-950 ${
            isFullscreen ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none' : 'min-h-[600px] h-[75vh]'
          }`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Fullscreen Close Overlay */}
        {isFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="fixed top-6 right-6 z-[100000] px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-white/20 shadow-2xl backdrop-blur flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" /> Đóng Toàn Màn Hình (Esc)
          </button>
        )}
      </div>
    );
  }

  // 🌟 CASE 2: NORMAL PROSE HTML FRAGMENT (RENDERED SAFELY INSIDE VERIDU DOM)
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
