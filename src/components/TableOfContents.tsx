'use client';

import React, { useEffect, useState, useRef } from 'react';
import { List, ChevronRight } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Parse only h2 (highest level headings) from article content as requested
    const elements = Array.from(document.querySelectorAll('.article-content h2'));
    
    const parsed = elements.map((el, index) => {
      if (!el.id) {
        const text = el.textContent || '';
        const slug = text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        el.id = slug || `heading-${index}`;
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: 2
      };
    });

    setHeadings(parsed);

    // Set up IntersectionObserver to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        // Find all intersecting entries
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top offset to find the highest visible heading
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  // Auto-collapse logic
  const resetCollapseTimer = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    // Don't auto-collapse if manually interacted recently, but we'll re-arm it
    collapseTimerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 5000);
  };

  useEffect(() => {
    // Start initial timer
    resetCollapseTimer();
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav 
      ref={containerRef}
      onMouseEnter={() => {
        setIsCollapsed(false);
        if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      }}
      onMouseLeave={resetCollapseTimer}
      className={`transition-all duration-500 ease-in-out z-40 hidden lg:block relative ${
        isCollapsed ? 'w-14' : 'w-full'
      }`}
    >
      <div 
        className={`glass-panel rounded-2xl border transition-all duration-500 overflow-hidden shadow-2xl ${
          isCollapsed 
            ? 'p-3.5 bg-[var(--bg-card)]/80 border-amber-500/30 cursor-pointer hover:bg-[var(--bg-card)]' 
            : 'p-6 bg-[var(--bg-card)]/90 border-amber-500/40 backdrop-blur-xl'
        }`}
        onClick={() => {
          if (isCollapsed) {
            setIsCollapsed(false);
            resetCollapseTimer();
          }
        }}
      >
        {isCollapsed ? (
          <div className="flex justify-center items-center h-7" title="Mở rộng Mục Lục">
            <List className="w-6 h-6 text-amber-500 hover:scale-110 transition-transform" />
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent pr-2">
            <div className="flex items-center justify-between mb-6 border-b border-amber-500/20 pb-4">
              <h3 className="font-serif font-bold text-amber-500 uppercase tracking-widest text-[0.8rem] flex items-center gap-2">
                <List className="w-4 h-4" /> Mục Lục
              </h3>
            </div>
            <ul className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-[var(--border-card)]">
              {headings.map(h => {
                const isActive = activeId === h.id;
                return (
                  <li 
                    key={h.id} 
                    className="relative ml-2 text-sm font-medium"
                  >
                    {/* Active Indicator Line */}
                    {isActive && (
                      <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-0.5 h-full bg-amber-500 rounded-full" />
                    )}
                    <a 
                      href={`#${h.id}`} 
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(h.id);
                        if (target) {
                          const y = target.getBoundingClientRect().top + window.scrollY - 100;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                      className={`group flex items-start gap-2 py-0.5 transition-all duration-300 ${
                        isActive 
                          ? 'text-amber-500 font-bold translate-x-1' 
                          : 'text-[var(--text-muted)] hover:text-amber-400 hover:translate-x-1'
                      }`}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-[3px] transition-transform ${isActive ? 'text-amber-500 scale-110' : 'text-[var(--border-card)] group-hover:text-amber-400'}`} />
                      <span className="leading-snug">{h.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
