'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Quote, 
  BookOpen, 
  List, 
  Minus, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  GripVertical,
  Type,
  FileText,
  HelpCircle,
  X,
  Check,
  Sparkles
} from 'lucide-react';

export interface VeriduBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'pullquote' | 'scripture' | 'dictionary' | 'divider';
  level?: 'h2' | 'h3' | 'h4';
  content?: string;
  url?: string;
  caption?: string;
  align?: 'center' | 'left' | 'right';
  quoteText?: string;
  quoteAuthor?: string;
  items?: Array<{ claim: string; refs: string }>;
  terms?: Array<{ term: string; definition: string }>;
}

interface VeriduBlockEditorProps {
  blocks: VeriduBlock[];
  onChange: (blocks: VeriduBlock[]) => void;
}

function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

function convertGoogleDriveVideoUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return trimmed;
}

export function compileBlocksToHtml(blocks: VeriduBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks.map(block => {
    switch (block.type) {
      case 'heading': {
        const lvl = block.level || 'h2';
        const text = block.content || '';
        const idAttr = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
        return `<${lvl} id="${idAttr}">${text}</${lvl}>`;
      }
      case 'paragraph': {
        return `<p>${block.content || ''}</p>`;
      }
      case 'image': {
        const finalUrl = convertGoogleDriveUrl(block.url || '');
        if (!finalUrl) return '';
        let alignClass = 'mx-auto block text-center';
        if (block.align === 'left') alignClass = 'float-left mr-6 mb-4 max-w-sm';
        if (block.align === 'right') alignClass = 'float-right ml-6 mb-4 max-w-sm';
        const captionHtml = block.caption ? `<figcaption class="text-center text-xs italic text-[var(--text-muted)] mt-2">${block.caption}</figcaption>` : '';
        return `<figure class="my-6 ${alignClass}"><img src="${finalUrl}" alt="${block.caption || 'Hình ảnh'}" referrerpolicy="no-referrer" data-lightbox="true" class="max-w-full h-auto rounded-2xl shadow-2xl my-2 block cursor-zoom-in hover:scale-[1.01] transition-all">${captionHtml}</figure>`;
      }
      case 'video': {
        let embedUrl = block.url || '';
        if (embedUrl.includes('youtube.com/watch')) {
          embedUrl = embedUrl.replace('watch?v=', 'embed/');
        } else if (embedUrl.includes('youtu.be/')) {
          embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
        } else if (embedUrl.includes('drive.google.com')) {
          embedUrl = convertGoogleDriveVideoUrl(embedUrl);
        }
        if (!embedUrl) return '';
        return `<div class="w-full aspect-video rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-6 bg-black relative z-10"><iframe src="${embedUrl}" class="w-full h-full border-none rounded-2xl" allowfullscreen></iframe></div>`;
      }
      case 'pullquote': {
        const text = block.quoteText || '';
        const author = block.quoteAuthor ? ` (${block.quoteAuthor})` : '';
        return `<aside class="veridu-pull-quote my-6 p-6 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-2xl italic font-serif text-lg text-[var(--text-main)] shadow-lg">"${text}"${author}</aside>`;
      }
      case 'scripture': {
        const items = block.items || [];
        const itemsHtml = items.map(it => `<div class="scripture-item mb-2 text-xs"><div class="scripture-claim font-bold">${it.claim}</div><div class="scripture-refs text-[var(--text-muted)]">${it.refs}</div></div>`).join('');
        return `<div class="scripture-meta bg-[var(--bg-card)] border border-[var(--border-card)] p-6 rounded-2xl my-6"><h3 class="text-base font-bold mb-3 text-amber-500">Tham Chiếu Kinh Thánh</h3>${itemsHtml}</div>`;
      }
      case 'dictionary': {
        const terms = block.terms || [];
        const termsHtml = terms.map(t => `<div class="mb-2 text-xs leading-relaxed"><strong>${t.term}:</strong> ${t.definition}</div>`).join('');
        return `<div class="dictionary-meta bg-[var(--bg-card)] border border-[var(--border-card)] p-6 rounded-2xl my-6"><h3 class="text-base font-bold mb-3 text-amber-500">Bảng Thuật Ngữ Cốt Lõi</h3>${termsHtml}</div>`;
      }
      case 'divider': {
        return `<hr class="my-8 border-t border-[var(--border-card)]">`;
      }
      default:
        return '';
    }
  }).join('\n\n');
}

export function parseHtmlToBlocks(html: string): VeriduBlock[] {
  if (!html || !html.trim()) {
    return [
      { id: 'b-init-1', type: 'heading', level: 'h2', content: 'Giới Thiệu Bài Viết' },
      { id: 'b-init-2', type: 'paragraph', content: 'Nhập nội dung bài viết tại đây...' }
    ];
  }

  const blocks: VeriduBlock[] = [];
  let idCounter = 1;

  // Split content by major tags
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (tempDiv) {
    tempDiv.innerHTML = html;
    const children = Array.from(tempDiv.children);

    if (children.length > 0) {
      children.forEach((el) => {
        const tag = el.tagName.toLowerCase();

        if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
          blocks.push({
            id: `b-${idCounter++}`,
            type: 'heading',
            level: tag as 'h2' | 'h3' | 'h4',
            content: el.textContent || ''
          });
        } else if (tag === 'p') {
          blocks.push({
            id: `b-${idCounter++}`,
            type: 'paragraph',
            content: el.innerHTML || ''
          });
        } else if (tag === 'figure' || tag === 'img') {
          const img = tag === 'img' ? (el as HTMLImageElement) : el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          if (img) {
            blocks.push({
              id: `b-${idCounter++}`,
              type: 'image',
              url: img.getAttribute('src') || '',
              caption: figcaption ? figcaption.textContent || '' : '',
              align: 'center'
            });
          }
        } else if (tag === 'aside' || el.classList.contains('veridu-pull-quote')) {
          blocks.push({
            id: `b-${idCounter++}`,
            type: 'pullquote',
            quoteText: el.textContent?.replace(/^"/, '').replace(/"$/, '') || ''
          });
        } else if (tag === 'iframe' || el.querySelector('iframe')) {
          const iframe = tag === 'iframe' ? (el as HTMLIFrameElement) : el.querySelector('iframe');
          blocks.push({
            id: `b-${idCounter++}`,
            type: 'video',
            url: iframe ? iframe.getAttribute('src') || '' : ''
          });
        } else if (tag === 'hr') {
          blocks.push({
            id: `b-${idCounter++}`,
            type: 'divider'
          });
        } else {
          blocks.push({
            id: `b-${idCounter++}`,
            type: 'paragraph',
            content: el.outerHTML
          });
        }
      });

      if (blocks.length > 0) return blocks;
    }
  }

  // Fallback if parsing didn't create blocks
  return [
    { id: `b-${idCounter++}`, type: 'paragraph', content: html }
  ];
}

export default function VeriduBlockEditor({ blocks, onChange }: VeriduBlockEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockDrawer, setShowBlockDrawer] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize with at least one block if empty
  useEffect(() => {
    if (!blocks || blocks.length === 0) {
      onChange([
        { id: `b-${Date.now()}-1`, type: 'heading', level: 'h2', content: 'Giới Thiệu Bài Viết' },
        { id: `b-${Date.now()}-2`, type: 'paragraph', content: 'Bắt đầu gõ nội dung bài viết hoặc thêm các khối tại đây...' }
      ]);
    }
  }, [blocks, onChange]);

  const updateBlock = (id: string, updatedFields: Partial<VeriduBlock>) => {
    const updated = blocks.map(b => b.id === id ? { ...b, ...updatedFields } : b);
    onChange(updated);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return; // Keep at least one block
    const updated = blocks.filter(b => b.id !== id);
    onChange(updated);
  };

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    const target = blocks[index];
    const newBlock: VeriduBlock = { ...JSON.parse(JSON.stringify(target)), id: `b-${Date.now()}` };
    const updated = [...blocks];
    updated.splice(index + 1, 0, newBlock);
    onChange(updated);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  const addBlock = (type: VeriduBlock['type'], index: number | null = null) => {
    const newBlock: VeriduBlock = {
      id: `b-${Date.now()}`,
      type,
      level: type === 'heading' ? 'h2' : undefined,
      content: type === 'paragraph' ? 'Nội dung đoạn văn mới...' : type === 'heading' ? 'Tiêu đề phân đoạn mới' : '',
      quoteText: type === 'pullquote' ? 'Trích dẫn Kinh Thánh Công giáo...' : undefined,
      align: 'center',
      items: type === 'scripture' ? [{ claim: 'Nền tảng Kinh Thánh:', refs: 'Xuất Hành 40,34-35; Luca 1,35' }] : undefined,
      terms: type === 'dictionary' ? [{ term: 'Typology', definition: 'Biểu tượng học Kinh Thánh...' }] : undefined
    };

    const updated = [...blocks];
    if (index !== null) {
      updated.splice(index, 0, newBlock);
    } else {
      updated.push(newBlock);
    }
    onChange(updated);
    setShowBlockDrawer(false);
    setInsertIndex(null);
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...blocks];
    const [dragged] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, dragged);
    onChange(updated);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      
      {/* CANVAS EDITOR AREA */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <React.Fragment key={block.id}>
            
            {/* SMART "+ THÊM KHỐI" INSERT BAR BETWEEN BLOCKS */}
            <div className="relative group/insert py-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-dashed border-[var(--border-card)] group-hover/insert:border-amber-500/50 transition-colors" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setInsertIndex(index);
                  setShowBlockDrawer(true);
                }}
                className="relative z-10 px-3 py-1 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full text-[11px] font-bold text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all flex items-center gap-1 shadow-sm opacity-0 group-hover/insert:opacity-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm khối tại đây
              </button>
            </div>

            {/* BLOCK ITEM CARD */}
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onClick={() => setActiveBlockId(block.id)}
              className={`relative group rounded-3xl border transition-all duration-200 bg-[var(--bg-main)] p-4 sm:p-6 ${
                activeBlockId === block.id
                  ? 'border-amber-500/80 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'border-[var(--border-card)] hover:border-amber-500/40 shadow-sm'
              }`}
            >
              {/* BLOCK FLOATING TOOLBAR */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  title="Di chuyển lên"
                  className="p-1.5 rounded-xl hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 disabled:opacity-30 transition cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  title="Di chuyển xuống"
                  className="p-1.5 rounded-xl hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 disabled:opacity-30 transition cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-[var(--border-card)] mx-0.5" />

                <button
                  type="button"
                  onClick={() => duplicateBlock(block.id)}
                  title="Nhân bản khối"
                  className="p-1.5 rounded-xl hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  title="Xóa khối"
                  className="p-1.5 rounded-xl hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* BLOCK TYPE BADGE & DRAG HANDLE */}
              <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <div title="Kéo thả di chuyển" className="cursor-grab active:cursor-grabbing p-1 hover:text-amber-500 transition">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {block.type === 'heading' && `Tiêu đề ${block.level?.toUpperCase()}`}
                  {block.type === 'paragraph' && 'Đoạn văn bản'}
                  {block.type === 'image' && 'Hình ảnh Google Drive'}
                  {block.type === 'video' && 'Video Embed 16:9'}
                  {block.type === 'pullquote' && 'Trích dẫn Kinh Thánh'}
                  {block.type === 'scripture' && 'Tham chiếu Kinh Thánh'}
                  {block.type === 'dictionary' && 'Bảng Thuật ngữ Thần học'}
                  {block.type === 'divider' && 'Đường kẻ ngang'}
                </span>
              </div>

              {/* BLOCK CONTENT INPUT BY TYPE */}
              {block.type === 'heading' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateBlock(block.id, { level: 'h2' })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${block.level === 'h2' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}
                    >
                      H2 (Chính)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock(block.id, { level: 'h3' })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${block.level === 'h3' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}
                    >
                      H3 (Phụ)
                    </button>
                  </div>
                  <input
                    type="text"
                    value={block.content || ''}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Nhập tiêu đề phân đoạn tại đây..."
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-serif font-bold text-xl text-amber-500 outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {block.type === 'paragraph' && (
                <textarea
                  value={block.content || ''}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  rows={4}
                  placeholder="Bắt đầu nhập nội dung đoạn văn tại đây..."
                  className="w-full p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-serif text-base text-[var(--text-main)] outline-none focus:border-amber-500 leading-relaxed resize-y"
                />
              )}

              {block.type === 'image' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Link Ảnh (Google Drive / Direct URL)</label>
                      <input
                        type="url"
                        value={block.url || ''}
                        onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                        onBlur={(e) => updateBlock(block.id, { url: convertGoogleDriveUrl(e.target.value) })}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Chú thích ảnh (Caption)</label>
                      <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                        placeholder="Ví dụ: Bản thảo cổ Kinh Cầu Loreto..."
                        className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Alignment Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-muted)] mr-2">Vị trí ảnh:</span>
                    <button
                      type="button"
                      onClick={() => updateBlock(block.id, { align: 'center' })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${block.align === 'center' || !block.align ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}
                    >
                      Căn Giữa (Lớn)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock(block.id, { align: 'left' })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${block.align === 'left' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}
                    >
                      Trái (Văn bản bọc)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock(block.id, { align: 'right' })}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${block.align === 'right' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}
                    >
                      Phải (Văn bản bọc)
                    </button>
                  </div>

                  {/* Image Preview */}
                  {block.url && (
                    <div className="mt-2 text-center p-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={convertGoogleDriveUrl(block.url)}
                        alt={block.caption || 'Preview'}
                        referrerPolicy="no-referrer"
                        className="max-h-56 mx-auto rounded-xl shadow-lg object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      {block.caption && (
                        <p className="text-xs italic text-[var(--text-muted)] mt-2">{block.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {block.type === 'video' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--text-muted)] block">Link Video (YouTube / Google Drive Video)</label>
                  <input
                    type="url"
                    value={block.url || ''}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... hoặc Google Drive Video"
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-rose-500"
                  />
                  {block.url && (
                    <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl text-xs text-rose-400 font-bold flex items-center gap-2">
                      <VideoIcon className="w-4 h-4" /> Đã sẵn sàng nhúng khung video 16:9 Glassmorphic.
                    </div>
                  )}
                </div>
              )}

              {block.type === 'pullquote' && (
                <div className="space-y-3">
                  <textarea
                    value={block.quoteText || ''}
                    onChange={(e) => updateBlock(block.id, { quoteText: e.target.value })}
                    rows={3}
                    placeholder="Nhập câu trích dẫn Kinh Thánh Công giáo hoặc Huấn quyền..."
                    className="w-full p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 font-serif italic text-base text-[var(--text-main)] outline-none leading-relaxed resize-y"
                  />
                  <input
                    type="text"
                    value={block.quoteAuthor || ''}
                    onChange={(e) => updateBlock(block.id, { quoteAuthor: e.target.value })}
                    placeholder="Nguồn trích dẫn (Ví dụ: Hiến chế Lumen Gentium, 66)"
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none font-sans"
                  />
                </div>
              )}

              {block.type === 'scripture' && (
                <div className="space-y-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)]">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Khối Tham Chiếu Kinh Thánh
                  </h4>
                  {(block.items || []).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border-card)]">
                      <input
                        type="text"
                        value={item.claim}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx].claim = e.target.value;
                          updateBlock(block.id, { items: newItems });
                        }}
                        placeholder="Nội dung tuyên xưng..."
                        className="p-2 rounded-lg bg-[var(--bg-card)] text-xs outline-none font-bold"
                      />
                      <input
                        type="text"
                        value={item.refs}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx].refs = e.target.value;
                          updateBlock(block.id, { items: newItems });
                        }}
                        placeholder="Đoạn Kinh Thánh (Lc 1,35; Xh 40,34)"
                        className="p-2 rounded-lg bg-[var(--bg-card)] text-xs outline-none text-[var(--text-muted)]"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...(block.items || []), { claim: 'Nội dung mới:', refs: 'Đoạn Kinh Thánh' }];
                      updateBlock(block.id, { items: newItems });
                    }}
                    className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm đoạn tham chiếu
                  </button>
                </div>
              )}

              {block.type === 'dictionary' && (
                <div className="space-y-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)]">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Khối Bảng Thuật Ngữ Thần Học
                  </h4>
                  {(block.terms || []).map((term, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border-card)]">
                      <input
                        type="text"
                        value={term.term}
                        onChange={(e) => {
                          const newTerms = [...(block.terms || [])];
                          newTerms[idx].term = e.target.value;
                          updateBlock(block.id, { terms: newTerms });
                        }}
                        placeholder="Tên thuật ngữ (Typology)..."
                        className="p-2 rounded-lg bg-[var(--bg-card)] text-xs outline-none font-bold"
                      />
                      <input
                        type="text"
                        value={term.definition}
                        onChange={(e) => {
                          const newTerms = [...(block.terms || [])];
                          newTerms[idx].definition = e.target.value;
                          updateBlock(block.id, { terms: newTerms });
                        }}
                        placeholder="Giải thích định nghĩa..."
                        className="p-2 rounded-lg bg-[var(--bg-card)] text-xs outline-none text-[var(--text-muted)]"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newTerms = [...(block.terms || []), { term: 'Thuật ngữ mới', definition: 'Định nghĩa...' }];
                      updateBlock(block.id, { terms: newTerms });
                    }}
                    className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm thuật ngữ
                  </button>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-4 text-center">
                  <div className="w-full border-t border-[var(--border-card)] my-2" />
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Đường kẻ phân đoạn</span>
                </div>
              )}

            </div>

          </React.Fragment>
        ))}

        {/* BOTTOM "+ THÊM KHỐI MỚI" BUTTON */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setInsertIndex(null);
              setShowBlockDrawer(true);
            }}
            className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mx-auto shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-500" /> Thêm Khối Nội Dung Mới (Add Block)
          </button>
        </div>

      </div>

      {/* 🧩 BLOCK LIBRARY DRAWER / MODAL POPUP */}
      {showBlockDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
              <h3 className="font-bold text-lg text-amber-500 flex items-center gap-2 font-serif">
                <Sparkles className="w-5 h-5 text-amber-500" /> Thư Viện Khối Nội Dung VERIDU
              </h3>
              <button onClick={() => setShowBlockDrawer(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => addBlock('heading', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">H2</div>
                <div className="font-bold text-xs">Tiêu Đề</div>
                <div className="text-[10px] text-[var(--text-muted)]">H2, H3 phân đoạn bài</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('paragraph', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Type className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Đoạn Văn</div>
                <div className="text-[10px] text-[var(--text-muted)]">Văn bản bài viết thường</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('image', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Ảnh Google Drive</div>
                <div className="text-[10px] text-[var(--text-muted)]">Căn trái/giữa/phải + Caption</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('video', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-rose-500 hover:bg-rose-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center"><VideoIcon className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Video Embed</div>
                <div className="text-[10px] text-[var(--text-muted)]">YouTube & Drive Video 16:9</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('pullquote', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Quote className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Trích Kinh Thánh</div>
                <div className="text-[10px] text-[var(--text-muted)]">Khối viền vàng Công giáo</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('scripture', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Tham Chiếu Kinh Thánh</div>
                <div className="text-[10px] text-[var(--text-muted)]">Bảng trích Xuất Hành/Luca</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('dictionary', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500 hover:bg-indigo-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Thuật Ngữ Thần Học</div>
                <div className="text-[10px] text-[var(--text-muted)]">Bảng định nghĩa từ vựng</div>
              </button>

              <button
                type="button"
                onClick={() => addBlock('divider', insertIndex)}
                className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-slate-500 hover:bg-slate-500/10 transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center"><Minus className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Đường Kẻ Ngang</div>
                <div className="text-[10px] text-[var(--text-muted)]">Phân cách các đoạn</div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
