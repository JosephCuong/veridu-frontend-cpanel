'use client';

import React, { useState, useEffect, useRef } from 'react';
import { normalizeAndSyncHtml } from '@/lib/htmlProcessor';
import { X } from 'lucide-react';
import ScriptureQuickPeekModal, { ScripturePeekTarget } from '@/components/ScriptureQuickPeekModal';

interface VisualArticleRendererProps {
  contentHtml: string;
  className?: string;
}

interface TermPopoverState {
  term: string;
  base: string;
  definition: string;
  top: number;
  left: number;
}

export default function VisualArticleRenderer({ 
  contentHtml, 
  className = ''
}: VisualArticleRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  const [lightboxCaption, setLightboxCaption] = useState<string>('');
  const [termPopover, setTermPopover] = useState<TermPopoverState | null>(null);
  const popoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [scriptureTarget, setScriptureTarget] = useState<ScripturePeekTarget | null>(null);
  const [isScriptureModalOpen, setIsScriptureModalOpen] = useState(false);

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

    // 4. Image Lightbox Click Listener & Auto Error Fallback
    const images = containerRef.current.querySelectorAll('img');
    const handleImageClick = (e: Event) => {
      const target = e.currentTarget as HTMLImageElement;
      if (target && target.src) {
        setLightboxSrc(target.src);
        const figure = target.closest('figure');
        const figcaption = figure?.querySelector('figcaption');
        const captionText = figcaption?.textContent?.trim() || '';
        setLightboxCaption(captionText);
        setLightboxAlt(target.alt || captionText || 'Ảnh bài viết');
      }
    };
    const handleImageError = (e: Event) => {
      const target = e.currentTarget as HTMLImageElement;
      if (!target || !target.src) return;

      const currentSrc = target.src;
      // If it failed with lh3 direct link, attempt Google Drive thumbnail API as fallback
      const fileIdMatch = currentSrc.match(/\/d\/([a-zA-Z0-9_-]+)/) || currentSrc.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        const fallbackUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
        if (currentSrc !== fallbackUrl && !target.dataset.hasFailedFallback) {
          target.dataset.hasFailedFallback = 'true';
          target.src = fallbackUrl;
          return;
        }
      }

      // If still fails or not Google Drive, soften styling gracefully
      target.classList.add('opacity-50', 'grayscale');
      target.title = 'Không thể tải ảnh từ nguồn này';
    };

    images.forEach((img) => {
      img.addEventListener('click', handleImageClick);
      img.addEventListener('error', handleImageError);
    });

    // 4b. Audio Playback Optimization & Fallback
    const audioElements = containerRef.current.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      audio.addEventListener('error', () => {
        const source = audio.querySelector('source');
        const src = source?.getAttribute('src') || audio.getAttribute('src') || '';
        if (src && !src.startsWith('http')) {
          const parent = audio.closest('.veridu-embed-audio');
          if (parent && !parent.querySelector('.audio-error-notice')) {
            const notice = document.createElement('div');
            notice.className = 'audio-error-notice p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-sans flex items-center gap-2';
            notice.innerHTML = `<span>⚠️</span> <span>Tệp âm thanh (${src}) chưa được liên kết với nguồn phát trực tuyến. Vui lòng cập nhật URL âm thanh đám mây trong bài viết.</span>`;
            parent.appendChild(notice);
          }
        }
      });
    });

    // 4c. Inline Scholarly Term Interaction (<dfn class="veridu-term">)
    const termElements = containerRef.current.querySelectorAll<HTMLElement>('dfn.veridu-term, dfn[data-base]');
    
    const showTermPopover = (el: HTMLElement) => {
      if (popoverTimerRef.current) clearTimeout(popoverTimerRef.current);
      const rect = el.getBoundingClientRect();
      const rawTitle = el.getAttribute('title') || el.dataset.termTitle || '';
      if (el.getAttribute('title')) {
        el.dataset.termTitle = el.getAttribute('title') || '';
        el.removeAttribute('title'); // Prevent native browser tooltip overlap
      }
      const base = el.getAttribute('data-base') || '';
      const term = el.textContent?.trim() || '';

      const popoverWidth = 320;
      let left = rect.left;
      if (typeof window !== 'undefined') {
        if (left + popoverWidth > window.innerWidth - 16) {
          left = window.innerWidth - popoverWidth - 16;
        }
        if (left < 16) left = 16;
      }

      let top = rect.bottom + 8;
      if (typeof window !== 'undefined' && top + 180 > window.innerHeight) {
        top = Math.max(16, rect.top - 190);
      }

      setTermPopover({
        term,
        base,
        definition: rawTitle || el.dataset.termTitle || '',
        top,
        left
      });
    };

    const handleTermEnter = (e: Event) => {
      showTermPopover(e.currentTarget as HTMLElement);
    };

    const handleTermLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.dataset.termTitle) {
        el.setAttribute('title', el.dataset.termTitle);
      }
      popoverTimerRef.current = setTimeout(() => {
        setTermPopover(null);
      }, 300);
    };

    const handleTermClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      showTermPopover(e.currentTarget as HTMLElement);
    };

    termElements.forEach((termEl) => {
      termEl.addEventListener('mouseenter', handleTermEnter);
      termEl.addEventListener('mouseleave', handleTermLeave);
      termEl.addEventListener('focus', handleTermEnter);
      termEl.addEventListener('blur', handleTermLeave);
      termEl.addEventListener('click', handleTermClick);
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
      const existingBackref = item.querySelector<HTMLAnchorElement>('.footnote-backref, a[href*="#fnref"]');
      const labelText = `Quay lại vị trí vừa đọc [${num}]`;
      if (existingBackref) {
        existingBackref.removeAttribute('aria-label');
        existingBackref.className = 'footnote-backref';
        existingBackref.setAttribute('title', labelText);
        existingBackref.innerHTML = `<span aria-hidden="true">&#x21A9;&#xFE0E;</span><span class="sr-only">${labelText}</span>`;
      } else {
        const backref = document.createElement('a');
        backref.href = `#fnref-${num}`;
        backref.className = 'footnote-backref';
        backref.setAttribute('role', 'button');
        backref.setAttribute('title', labelText);
        backref.innerHTML = `<span aria-hidden="true">&#x21A9;&#xFE0E;</span><span class="sr-only">${labelText}</span>`;
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

      // C. Holy Scripture superlink or quote badge clicked -> Open Stained-Glass Quick Peek Modal
      const scriptureLink = link.classList.contains('scripture-superlink')
        ? link
        : (link.closest('.scripture-superlink, a[data-book]') as HTMLAnchorElement | null);

      if (scriptureLink) {
        const book = scriptureLink.getAttribute('data-book');
        const chapter = parseInt(scriptureLink.getAttribute('data-chapter') || '1', 10);
        const verse = parseInt(scriptureLink.getAttribute('data-verse') || '1', 10);
        const verseEnd = parseInt(scriptureLink.getAttribute('data-verse-end') || `${verse}`, 10);
        const bookName = scriptureLink.getAttribute('data-book-name') || undefined;
        const rawRef = scriptureLink.getAttribute('data-raw-ref') || scriptureLink.textContent || '';

        if (book && !isNaN(chapter)) {
          e.preventDefault();
          setScriptureTarget({
            bookSlug: book,
            bookName,
            chapter,
            verseStart: verse,
            verseEnd,
            rawRef
          });
          setIsScriptureModalOpen(true);
          return;
        }
      }

      // D. Any /kinh-thanh/[book]/[chapter] link clicked -> Open Quick Peek Modal
      const bibleHrefMatch = href.match(/^\/kinh-thanh\/([a-z0-9\-_]+)\/(\d+)/i);
      if (bibleHrefMatch) {
        e.preventDefault();
        const bookSlug = bibleHrefMatch[1];
        const chapter = parseInt(bibleHrefMatch[2], 10);
        const hashMatch = href.match(/#v(?:erse-?)?(\d+)/i);
        const verse = hashMatch ? parseInt(hashMatch[1], 10) : 1;
        setScriptureTarget({
          bookSlug,
          chapter,
          verseStart: verse,
          rawRef: link.textContent?.trim() || `${bookSlug} ${chapter}`
        });
        setIsScriptureModalOpen(true);
        return;
      }

      // E. Scholarly Anchors (#chu-thich, #tham-chieu, #bang-thuat-ngu, #thu-muc-tai-lieu)
      const scholarlyDestMatch = href.match(/^#(chu-thich|tham-chieu|bang-thuat-ngu|thu-muc-tai-lieu)$/i);
      if (scholarlyDestMatch) {
        const targetId = scholarlyDestMatch[1].toLowerCase();
        const dest = document.getElementById(targetId) || containerRef.current?.querySelector(`[id="${targetId}"]`);
        if (dest) {
          e.preventDefault();
          dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
          dest.classList.add('footnote-target-glow-active');
          window.history.pushState(null, '', href);
          setTimeout(() => {
            dest.classList.remove('footnote-target-glow-active');
          }, 2500);
          return;
        }
      }
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('click', handleContainerClick);

    return () => {
      images.forEach((img) => {
        img.removeEventListener('click', handleImageClick);
        img.removeEventListener('error', handleImageError);
      });
      termElements.forEach((termEl) => {
        termEl.removeEventListener('mouseenter', handleTermEnter);
        termEl.removeEventListener('mouseleave', handleTermLeave);
        termEl.removeEventListener('focus', handleTermEnter);
        termEl.removeEventListener('blur', handleTermLeave);
        termEl.removeEventListener('click', handleTermClick);
      });
      containerEl.removeEventListener('click', handleContainerClick);
    };
  }, [safeHtml]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxSrc(null);
        setTermPopover(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (termPopover) {
        const target = e.target as HTMLElement;
        if (!target.closest('.veridu-term') && !target.closest('.term-popover-card')) {
          setTermPopover(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [termPopover]);

  return (
    <>
      <div 
        ref={containerRef}
        className={`prose dark:prose-invert prose-amber prose-veridu-sanitized max-w-none font-serif text-[var(--text-main)] leading-relaxed text-base sm:text-lg has-drop-cap ${className}`}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* 🌟 INLINE SCHOLARLY TERM POPOVER CARD (<dfn class="veridu-term">) */}
      {termPopover && (
        <div 
          style={{
            top: `${termPopover.top}px`,
            left: `${termPopover.left}px`,
          }}
          className="term-popover-card fixed z-[9998] w-80 max-w-[calc(100vw-32px)] p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl text-slate-100 animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={() => {
            if (popoverTimerRef.current) clearTimeout(popoverTimerRef.current);
          }}
          onMouseLeave={() => {
            popoverTimerRef.current = setTimeout(() => setTermPopover(null), 300);
          }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-bold text-amber-400 text-sm sm:text-base">
                {termPopover.term}
              </span>
              {termPopover.base && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                  {termPopover.base}
                </span>
              )}
            </div>
            <button
              onClick={() => setTermPopover(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {termPopover.definition && (
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-serif mb-3">
              {termPopover.definition}
            </p>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Thuật ngữ VERIDU
            </span>
            <a
              href="#bang-thuat-ngu"
              onClick={(e) => {
                e.preventDefault();
                setTermPopover(null);
                const target = document.getElementById('bang-thuat-ngu');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  target.classList.add('footnote-target-glow-active');
                  setTimeout(() => target.classList.remove('footnote-target-glow-active'), 2500);
                }
              }}
              className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              <span>Xem Bảng Thuật Ngữ</span>
              <span>↘</span>
            </a>
          </div>
        </div>
      )}

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
            className="max-w-5xl max-h-[90vh] relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/50 p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={lightboxSrc} 
              alt={lightboxAlt} 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl mx-auto shadow-2xl"
            />
            {lightboxCaption ? (
              <div className="mt-3 mb-1 px-4 text-center">
                <p className="text-xs sm:text-sm font-serif italic text-amber-200/90 leading-relaxed max-w-3xl mx-auto">
                  {lightboxCaption}
                </p>
              </div>
            ) : lightboxAlt ? (
              <p className="text-center text-xs font-sans italic text-amber-400 mt-3 mb-1 tracking-wide px-4">
                {lightboxAlt}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* 📖 STAINED-GLASS SCRIPTURE QUICK PEEK MODAL */}
      <ScriptureQuickPeekModal
        target={scriptureTarget}
        isOpen={isScriptureModalOpen}
        onClose={() => setIsScriptureModalOpen(false)}
      />
    </>
  );
}
