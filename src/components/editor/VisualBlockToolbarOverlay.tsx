'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Settings, 
  Trash2, 
  Video, 
  Image as ImageIcon, 
  BookOpen, 
  Headphones, 
  AlertTriangle, 
  Heart, 
  FileText, 
  ListChecks, 
  HelpCircle, 
  Table as TableIcon,
  Sparkles
} from 'lucide-react';
import { ConfigurableBlockType } from './CatholicBlockConfigModal';

interface VisualBlockToolbarOverlayProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onEditBlock: (targetEl: HTMLElement, type: ConfigurableBlockType, data: Record<string, any>) => void;
  onDeleteBlock: (targetEl: HTMLElement, label: string) => void;
}

interface HoveredBlockInfo {
  element: HTMLElement;
  label: string;
  icon: React.ReactNode;
  type: ConfigurableBlockType | 'generic';
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

const BLOCK_SELECTOR = [
  '.veridu-embed-video',
  '.veridu-image-block',
  'figure',
  '.sacred-scripture',
  '.veridu-scripture-quote',
  '.veridu-embed-audio',
  '.catechetical-callout',
  '.prayer-block',
  '.poetry-block',
  '.abstract-research',
  '.scripture-meta',
  '.dictionary-meta',
  'table',
  '[data-veridu-block]'
].join(', ');

export default function VisualBlockToolbarOverlay({
  editorRef,
  containerRef,
  onEditBlock,
  onDeleteBlock
}: VisualBlockToolbarOverlayProps) {
  const [activeBlock, setActiveBlock] = useState<HoveredBlockInfo | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Identify block type and label from DOM element
  const identifyBlock = useCallback((el: HTMLElement): { label: string; icon: React.ReactNode; type: ConfigurableBlockType | 'generic' } => {
    // 1. Video Block
    if (el.classList.contains('veridu-embed-video') || el.hasAttribute('data-video-url') || el.querySelector('iframe, video') || el.getAttribute('data-veridu-block') === 'video') {
      return { label: 'Khối Video', icon: <Video className="w-3.5 h-3.5 text-rose-500" />, type: 'video' };
    }

    // 2. Image Block / Figure
    if (el.classList.contains('veridu-image-block') || el.tagName.toLowerCase() === 'figure' || el.getAttribute('data-veridu-block') === 'image') {
      return { label: 'Khối Hình Ảnh', icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />, type: 'image' };
    }

    // 3. Sacred Scripture Callout
    if (el.classList.contains('sacred-scripture') || el.classList.contains('veridu-scripture-quote') || el.getAttribute('data-veridu-block') === 'scripture') {
      return { label: 'Lời Chúa Soi Đường', icon: <BookOpen className="w-3.5 h-3.5 text-amber-500" />, type: 'scripture' };
    }

    // 4. Audio Podcast
    if (el.classList.contains('veridu-embed-audio') || el.querySelector('audio') || el.getAttribute('data-veridu-block') === 'audio') {
      return { label: 'Audio Podcast', icon: <Headphones className="w-3.5 h-3.5 text-indigo-500" />, type: 'audio' };
    }

    // 5. Catechetical Callout
    if (el.classList.contains('catechetical-callout') || el.getAttribute('data-veridu-block') === 'callout') {
      return { label: 'Hộp Lưu Ý / Cảnh Báo', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, type: 'callout' };
    }

    // 6. Prayer / Poetry
    if (el.classList.contains('prayer-block') || el.classList.contains('poetry-block') || el.getAttribute('data-veridu-block') === 'prayer') {
      return { label: 'Thơ / Lời Nguyện', icon: <Heart className="w-3.5 h-3.5 text-purple-500" />, type: 'prayer' };
    }

    // 7. Academic Abstracts & Dictionary & Meta
    if (el.classList.contains('abstract-research')) {
      return { label: 'Tóm Tắt Nghiên Cứu', icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />, type: 'generic' };
    }
    if (el.classList.contains('scripture-meta')) {
      return { label: 'Bằng Chứng Thánh Kinh', icon: <ListChecks className="w-3.5 h-3.5 text-amber-400" />, type: 'generic' };
    }
    if (el.classList.contains('dictionary-meta')) {
      return { label: 'Thuật Ngữ Thần Học', icon: <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />, type: 'generic' };
    }
    if (el.tagName.toLowerCase() === 'table' || el.querySelector('table')) {
      return { label: 'Bảng Dữ Liệu', icon: <TableIcon className="w-3.5 h-3.5 text-indigo-400" />, type: 'generic' };
    }

    return { label: 'Khối Khảo Luận', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />, type: 'generic' };
  }, []);

  // Extract initial parameters for editing
  const extractDataFromElement = useCallback((el: HTMLElement, type: ConfigurableBlockType | 'generic'): Record<string, any> => {
    const data: Record<string, any> = {};

    if (type === 'video') {
      const rawUrlAttr = el.getAttribute('data-video-url');
      if (rawUrlAttr) {
        data.videoUrl = decodeURIComponent(rawUrlAttr);
      } else {
        const iframe = el.querySelector('iframe');
        const videoEl = el.querySelector('video');
        data.videoUrl = iframe?.getAttribute('src') || videoEl?.getAttribute('src') || '';
      }
      const rawCaptionAttr = el.getAttribute('data-caption');
      if (rawCaptionAttr) {
        data.videoCaption = decodeURIComponent(rawCaptionAttr);
      } else {
        const figcaption = el.querySelector('figcaption');
        data.videoCaption = figcaption?.textContent || '';
      }
      const aspectAttr = el.getAttribute('data-aspect-ratio');
      if (aspectAttr) {
        data.aspectRatio = aspectAttr;
      }
    } else if (type === 'image') {
      const img = el.querySelector('img');
      const rawUrlAttr = el.getAttribute('data-image-url');
      data.imageUrl = rawUrlAttr ? decodeURIComponent(rawUrlAttr) : img?.getAttribute('src') || '';
      const rawCapAttr = el.getAttribute('data-caption');
      const figcaption = el.querySelector('figcaption');
      data.caption = rawCapAttr ? decodeURIComponent(rawCapAttr) : figcaption?.textContent || img?.getAttribute('alt') || '';
      data.align = el.getAttribute('data-align') || (el.classList.contains('float-left') ? 'left' : el.classList.contains('float-right') ? 'right' : 'center');
    } else if (type === 'scripture') {
      const quoteAttr = el.getAttribute('data-quote');
      const bquote = el.querySelector('blockquote');
      data.quote = quoteAttr ? decodeURIComponent(quoteAttr) : bquote?.textContent?.replace(/^[“"\s]+|[”"\s]+$/g, '') || '';
      const refAttr = el.getAttribute('data-ref');
      const superlink = el.querySelector('.scripture-superlink');
      data.rawRef = refAttr ? decodeURIComponent(refAttr) : superlink?.textContent?.replace(/[↗\s]+/g, '') || '';
    } else if (type === 'audio') {
      const audio = el.querySelector('audio source') || el.querySelector('audio');
      data.audioUrl = el.getAttribute('data-audio-url') ? decodeURIComponent(el.getAttribute('data-audio-url')!) : audio?.getAttribute('src') || '';
      data.playerType = el.getAttribute('data-audio-type') || (el.classList.contains('mini') ? 'audio_mini' : 'audio_full');
      data.title = el.getAttribute('data-audio-title') ? decodeURIComponent(el.getAttribute('data-audio-title')!) : el.querySelector('.audio-label')?.textContent || '';
      data.badge = el.getAttribute('data-audio-badge') ? decodeURIComponent(el.getAttribute('data-audio-badge')!) : el.querySelector('.audio-badge')?.textContent || '';
      data.desc = el.getAttribute('data-audio-desc') ? decodeURIComponent(el.getAttribute('data-audio-desc')!) : el.querySelector('p')?.textContent || '';
    } else if (type === 'callout') {
      data.level = el.getAttribute('data-callout-level') || (el.classList.contains('callout-note') ? 'note' : el.classList.contains('callout-tip') ? 'tip' : el.classList.contains('callout-warning') ? 'warning' : 'important');
      data.title = el.getAttribute('data-callout-title') ? decodeURIComponent(el.getAttribute('data-callout-title')!) : el.querySelector('.uppercase')?.textContent || '';
      data.content = el.getAttribute('data-callout-content') ? decodeURIComponent(el.getAttribute('data-callout-content')!) : el.querySelector('div:last-child')?.textContent || '';
    } else if (type === 'prayer') {
      data.style = el.getAttribute('data-style') || (el.classList.contains('poetry-block') ? 'poetry' : 'prayer');
      data.title = el.getAttribute('data-title') ? decodeURIComponent(el.getAttribute('data-title')!) : el.querySelector('.uppercase')?.textContent || '';
      data.text = el.getAttribute('data-text') ? decodeURIComponent(el.getAttribute('data-text')!) : el.querySelector('p, .poetry-content')?.textContent || '';
      data.amen = el.getAttribute('data-amen') ? decodeURIComponent(el.getAttribute('data-amen')!) : el.querySelector('.prayer-amen')?.textContent || 'Amen.';
    }

    return data;
  }, []);

  // Update overlay position based on hovered element
  const updateOverlayPosition = useCallback((targetEl: HTMLElement) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const { label, icon, type } = identifyBlock(targetEl);

    setActiveBlock({
      element: targetEl,
      label,
      icon,
      type,
      rect: {
        top: targetRect.top - containerRect.top + containerRef.current.scrollTop,
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        height: targetRect.height
      }
    });
  }, [containerRef, identifyBlock]);

  // Listen to mouseover inside editor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if target is inside a block
      const blockEl = target.closest(BLOCK_SELECTOR) as HTMLElement;
      if (blockEl && editor.contains(blockEl)) {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        updateOverlayPosition(blockEl);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Small debounce to avoid flicker when moving into the toolbar itself
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveBlock(null);
      }, 350);
    };

    const handleScroll = () => {
      if (activeBlock?.element && document.body.contains(activeBlock.element)) {
        updateOverlayPosition(activeBlock.element);
      }
    };

    editor.addEventListener('mouseover', handleMouseOver);
    editor.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      editor.removeEventListener('mouseover', handleMouseOver);
      editor.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll, true);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [editorRef, activeBlock, updateOverlayPosition]);

  if (!activeBlock || !document.body.contains(activeBlock.element)) {
    return null;
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeBlock.type !== 'generic') {
      const extractedData = extractDataFromElement(activeBlock.element, activeBlock.type);
      onEditBlock(activeBlock.element, activeBlock.type, extractedData);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = activeBlock.element;
    const label = activeBlock.label;
    setActiveBlock(null);
    onDeleteBlock(el, label);
  };

  return (
    <div
      contentEditable={false}
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      }}
      onMouseLeave={() => {
        hoverTimeoutRef.current = setTimeout(() => setActiveBlock(null), 300);
      }}
      style={{
        position: 'absolute',
        top: `${activeBlock.rect.top}px`,
        left: `${activeBlock.rect.left}px`,
        width: `${activeBlock.rect.width}px`,
        height: `${activeBlock.rect.height}px`,
        pointerEvents: 'none',
        zIndex: 35
      }}
      className="border-2 border-amber-500/40 rounded-3xl transition-all duration-150 animate-fadeIn"
    >
      {/* FLOATING ACTION TOOLBAR AT TOP-RIGHT */}
      <div 
        style={{ pointerEvents: 'auto' }}
        className="absolute -top-3 right-4 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md text-xs animate-in zoom-in-90 duration-150 select-none z-40"
      >
        {/* Block Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-500 font-bold text-[11px] font-serif border border-amber-500/30">
          {activeBlock.icon}
          <span>{activeBlock.label}</span>
        </div>

        <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

        {/* ⚙️ Sửa thông số khối */}
        {activeBlock.type !== 'generic' && (
          <button
            type="button"
            onClick={handleEditClick}
            className="p-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
            title="Chỉnh sửa thông số khối này"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sửa</span>
          </button>
        )}

        {/* ✕ Xóa nguyên khối (Dấu 'X' nổi bật màu đỏ) */}
        <button
          type="button"
          onClick={handleDeleteClick}
          className="p-1.5 px-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer active:scale-95 group/del"
          title="Xóa nguyên khối này khỏi bài viết"
        >
          <X className="w-3.5 h-3.5 group-hover/del:rotate-90 transition-transform" />
          <span className="font-bold">Xóa Khối</span>
        </button>
      </div>
    </div>
  );
}
