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
  Minus, 
  Type, 
  FileText, 
  X, 
  AlertTriangle, 
  Grid, 
  HelpCircle, 
  Table as TableIcon,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Info,
  CheckCircle,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';

export interface VeriduBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'pullquote' | 'scripture' | 'dictionary' | 'divider' | 'alert' | 'gallery' | 'quiz' | 'table';
  level?: 'h2' | 'h3' | 'h4';
  content?: string;
  url?: string;
  caption?: string;
  align?: 'center' | 'left' | 'right';
  quoteText?: string;
  quoteAuthor?: string;
  alertType?: 'note' | 'tip' | 'important' | 'warning';
  images?: Array<{ url: string; caption: string }>;
  quizQuestion?: string;
  quizOptions?: string[];
  quizAnswer?: number;
  tableHeaders?: string[];
  tableRows?: string[][];
  items?: Array<{ claim: string; refs: string }>;
  terms?: Array<{ term: string; definition: string }>;
}

interface VeriduBlockEditorProps {
  blocks: VeriduBlock[];
  onChange: (blocks: VeriduBlock[]) => void;
  onSelectBlock?: (blockId: string | null) => void;
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
      case 'alert': {
        const atype = block.alertType || 'note';
        let bgClass = 'bg-blue-500/10 border-blue-500 text-blue-300';
        let titleText = 'LƯU Ý THẦN HỌC';
        if (atype === 'tip') { bgClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-300'; titleText = 'MẸO SUY NIỆM'; }
        if (atype === 'important') { bgClass = 'bg-amber-500/10 border-amber-500 text-amber-300'; titleText = 'QUAN TRỌNG'; }
        if (atype === 'warning') { bgClass = 'bg-red-500/10 border-red-500 text-red-300'; titleText = 'CẢNH BÁO TÍN LÝ'; }
        return `<div class="my-6 p-6 border-l-4 rounded-r-2xl ${bgClass} space-y-2 backdrop-blur-md shadow-lg"><div class="text-xs font-bold uppercase tracking-wider">${titleText}</div><div class="text-sm leading-relaxed">${block.content || ''}</div></div>`;
      }
      case 'gallery': {
        const imgs = block.images || [];
        const imgsHtml = imgs.map(img => {
          const driveUrl = convertGoogleDriveUrl(img.url);
          if (!driveUrl) return '';
          return `<div class="space-y-1"><img src="${driveUrl}" alt="${img.caption || ''}" referrerpolicy="no-referrer" data-lightbox="true" class="w-full h-48 object-cover rounded-2xl shadow-md cursor-zoom-in hover:scale-105 transition-all"><p class="text-[11px] text-center italic text-[var(--text-muted)]">${img.caption || ''}</p></div>`;
        }).join('');
        return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">${imgsHtml}</div>`;
      }
      case 'quiz': {
        const qText = block.quizQuestion || '';
        const opts = block.quizOptions || [];
        const optsHtml = opts.map((opt, i) => `<div class="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl text-xs flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">${String.fromCharCode(65 + i)}</span><span>${opt}</span></div>`).join('');
        return `<div class="my-6 p-6 bg-[var(--bg-card)] border border-amber-500/30 rounded-3xl space-y-4 shadow-xl"><div class="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Câu Hỏi Ôn Tập Nhanh</div><div class="font-serif font-bold text-base text-[var(--text-main)]">${qText}</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${optsHtml}</div></div>`;
      }
      case 'table': {
        const headers = block.tableHeaders || ['Thuộc Tính', 'Ý Nghĩa', 'Kinh Thánh'];
        const rows = block.tableRows || [['Tháp Đavít', 'Pháo đài bảo vệ', 'Diễm Ca 4,4']];
        const thHtml = headers.map(h => `<th class="p-3 border border-[var(--border-card)] bg-amber-500/10 font-bold text-amber-500 text-xs text-left">${h}</th>`).join('');
        const trHtml = rows.map(r => `<tr>${r.map(cell => `<td class="p-3 border border-[var(--border-card)] text-xs">${cell}</td>`).join('')}</tr>`).join('');
        return `<div class="my-6 overflow-x-auto rounded-2xl border border-[var(--border-card)] shadow-lg"><table class="w-full border-collapse"><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`;
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
      { id: 'b-init-2', type: 'paragraph', content: 'Bắt đầu nhập nội dung bài viết hoặc chọn khối bên thanh trái...' }
    ];
  }

  const blocks: VeriduBlock[] = [];
  let idCounter = 1;

  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const children = Array.from(tempDiv.children);

    if (children.length > 0) {
      children.forEach((el) => {
        const tag = el.tagName.toLowerCase();

        if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
          blocks.push({ id: `b-${idCounter++}`, type: 'heading', level: tag as 'h2' | 'h3' | 'h4', content: el.textContent || '' });
        } else if (tag === 'p') {
          blocks.push({ id: `b-${idCounter++}`, type: 'paragraph', content: el.innerHTML || '' });
        } else if (tag === 'figure' || tag === 'img') {
          const img = tag === 'img' ? (el as HTMLImageElement) : el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          if (img) {
            blocks.push({ id: `b-${idCounter++}`, type: 'image', url: img.getAttribute('src') || '', caption: figcaption ? figcaption.textContent || '' : '', align: 'center' });
          }
        } else if (tag === 'aside' || el.classList.contains('veridu-pull-quote')) {
          blocks.push({ id: `b-${idCounter++}`, type: 'pullquote', quoteText: el.textContent?.replace(/^"/, '').replace(/"$/, '') || '' });
        } else if (tag === 'iframe' || el.querySelector('iframe')) {
          const iframe = tag === 'iframe' ? (el as HTMLIFrameElement) : el.querySelector('iframe');
          blocks.push({ id: `b-${idCounter++}`, type: 'video', url: iframe ? iframe.getAttribute('src') || '' : '' });
        } else if (tag === 'hr') {
          blocks.push({ id: `b-${idCounter++}`, type: 'divider' });
        } else {
          blocks.push({ id: `b-${idCounter++}`, type: 'paragraph', content: el.outerHTML });
        }
      });
      if (blocks.length > 0) return blocks;
    }
  }

  return [{ id: `b-${idCounter++}`, type: 'paragraph', content: html }];
}

export default function VeriduBlockEditor({ blocks, onChange, onSelectBlock }: VeriduBlockEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockDrawer, setShowBlockDrawer] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!blocks || blocks.length === 0) {
      onChange([
        { id: `b-${Date.now()}-1`, type: 'heading', level: 'h2', content: 'Giới Thiệu Bài Viết' },
        { id: `b-${Date.now()}-2`, type: 'paragraph', content: 'Nội dung bài viết Công giáo...' }
      ]);
    }
  }, [blocks, onChange]);

  const handleBlockSelect = (id: string) => {
    setActiveBlockId(id);
    if (onSelectBlock) onSelectBlock(id);
  };

  const updateBlock = (id: string, updatedFields: Partial<VeriduBlock>) => {
    const updated = blocks.map(b => b.id === id ? { ...b, ...updatedFields } : b);
    onChange(updated);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
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
      content: type === 'paragraph' ? 'Nội dung đoạn văn mới...' : type === 'heading' ? 'Tiêu đề phân đoạn' : type === 'alert' ? 'Thông tin lưu ý quan trọng...' : '',
      quoteText: type === 'pullquote' ? 'Trích dẫn Kinh Thánh Công giáo...' : undefined,
      align: 'center',
      alertType: type === 'alert' ? 'note' : undefined,
      images: type === 'gallery' ? [{ url: '', caption: 'Ảnh 1' }, { url: '', caption: 'Ảnh 2' }] : undefined,
      quizQuestion: type === 'quiz' ? 'Câu hỏi trắc nghiệm ôn tập?' : undefined,
      quizOptions: type === 'quiz' ? ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'] : undefined,
      quizAnswer: 0,
      tableHeaders: type === 'table' ? ['Thuộc Tính', 'Ý Nghĩa', 'Tham Chiếu'] : undefined,
      tableRows: type === 'table' ? [['Tháp Đavít', 'Bảo vệ thành', 'Dc 4,4']] : undefined,
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

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...blocks];
    const [dragged] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, dragged);
    onChange(updated);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4 relative">
      
      {/* CANVAS BLOCKS CONTAINER */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <React.Fragment key={block.id}>
            
            {/* INSERT BAR */}
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

            {/* BLOCK CARD */}
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onClick={() => handleBlockSelect(block.id)}
              className={`relative group rounded-3xl border transition-all duration-200 bg-[var(--bg-main)] p-4 sm:p-6 ${
                activeBlockId === block.id
                  ? 'border-amber-500 shadow-xl shadow-amber-500/5 ring-2 ring-amber-500/30'
                  : 'border-[var(--border-card)] hover:border-amber-500/40 shadow-sm'
              }`}
            >
              {/* FLOATING ACTION TOOLBAR */}
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

              {/* DRAG HANDLE & BADGE */}
              <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <div className="cursor-grab active:cursor-grabbing p-1 hover:text-amber-500 transition">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  {block.type === 'heading' && `Tiêu đề ${block.level?.toUpperCase()}`}
                  {block.type === 'paragraph' && 'Đoạn văn bản'}
                  {block.type === 'image' && 'Hình ảnh Google Drive'}
                  {block.type === 'video' && 'Video Embed 16:9'}
                  {block.type === 'pullquote' && 'Trích dẫn Kinh Thánh'}
                  {block.type === 'alert' && 'Hộp Cảnh Báo / Lưu Ý'}
                  {block.type === 'gallery' && 'Thư Viện Ảnh Gallery Grid'}
                  {block.type === 'quiz' && 'Trắc Nghiệm Fast-Quiz'}
                  {block.type === 'table' && 'Bảng Dữ Liệu So Sánh'}
                  {block.type === 'scripture' && 'Tham chiếu Kinh Thánh'}
                  {block.type === 'dictionary' && 'Thuật ngữ Thần học'}
                  {block.type === 'divider' && 'Đường kẻ ngang'}
                </span>
              </div>

              {/* INPUT CONTROLS BY TYPE */}
              {block.type === 'heading' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateBlock(block.id, { level: 'h2' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.level === 'h2' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>H2</button>
                    <button type="button" onClick={() => updateBlock(block.id, { level: 'h3' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.level === 'h3' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>H3</button>
                  </div>
                  <input type="text" value={block.content || ''} onChange={(e) => updateBlock(block.id, { content: e.target.value })} placeholder="Nhập tiêu đề..." className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-serif font-bold text-xl text-amber-500 outline-none focus:border-amber-500" />
                </div>
              )}

              {block.type === 'paragraph' && (
                <textarea value={block.content || ''} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={4} placeholder="Bắt đầu nhập đoạn văn..." className="w-full p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-serif text-base text-[var(--text-main)] outline-none focus:border-amber-500 leading-relaxed resize-y" />
              )}

              {block.type === 'image' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Link Ảnh (Google Drive / Direct URL)</label>
                      <input type="url" value={block.url || ''} onChange={(e) => updateBlock(block.id, { url: e.target.value })} onBlur={(e) => updateBlock(block.id, { url: convertGoogleDriveUrl(e.target.value) })} placeholder="https://drive.google.com/file/d/..." className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Chú thích (Caption)</label>
                      <input type="text" value={block.caption || ''} onChange={(e) => updateBlock(block.id, { caption: e.target.value })} placeholder="Chú thích hình ảnh..." className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-muted)] mr-2">Vị trí:</span>
                    <button type="button" onClick={() => updateBlock(block.id, { align: 'center' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.align === 'center' || !block.align ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Căn Giữa</button>
                    <button type="button" onClick={() => updateBlock(block.id, { align: 'left' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.align === 'left' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Trái (Chữ bọc)</button>
                    <button type="button" onClick={() => updateBlock(block.id, { align: 'right' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.align === 'right' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Phải (Chữ bọc)</button>
                  </div>
                  {block.url && (
                    <div className="text-center p-3 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={convertGoogleDriveUrl(block.url)} alt="Preview" referrerPolicy="no-referrer" className="max-h-48 mx-auto rounded-xl shadow-lg object-contain" />
                    </div>
                  )}
                </div>
              )}

              {block.type === 'alert' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateBlock(block.id, { alertType: 'note' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.alertType === 'note' || !block.alertType ? 'bg-blue-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Lưu Ý (Blue)</button>
                    <button type="button" onClick={() => updateBlock(block.id, { alertType: 'tip' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.alertType === 'tip' ? 'bg-emerald-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Mẹo (Green)</button>
                    <button type="button" onClick={() => updateBlock(block.id, { alertType: 'important' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.alertType === 'important' ? 'bg-amber-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Quan Trọng (Gold)</button>
                    <button type="button" onClick={() => updateBlock(block.id, { alertType: 'warning' })} className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${block.alertType === 'warning' ? 'bg-red-500 text-slate-950' : 'bg-[var(--bg-card)] border border-[var(--border-card)]'}`}>Cảnh Báo (Red)</button>
                  </div>
                  <textarea value={block.content || ''} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={3} placeholder="Nội dung thông báo / cảnh báo tín lý..." className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-sm outline-none focus:border-amber-500" />
                </div>
              )}

              {block.type === 'video' && (
                <div className="space-y-3">
                  <input type="url" value={block.url || ''} onChange={(e) => updateBlock(block.id, { url: e.target.value })} placeholder="Link YouTube / Google Drive Video..." className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-rose-500" />
                </div>
              )}

              {block.type === 'pullquote' && (
                <div className="space-y-3">
                  <textarea value={block.quoteText || ''} onChange={(e) => updateBlock(block.id, { quoteText: e.target.value })} rows={3} placeholder="Trích dẫn Kinh Thánh Công giáo..." className="w-full p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 font-serif italic text-base outline-none" />
                  <input type="text" value={block.quoteAuthor || ''} onChange={(e) => updateBlock(block.id, { quoteAuthor: e.target.value })} placeholder="Nguồn trích dẫn (Lumen Gentium, 66)..." className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none" />
                </div>
              )}

              {block.type === 'gallery' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-500 block">Danh Sách Link Ảnh Google Drive (Gallery Grid):</span>
                  {(block.images || []).map((img, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)]">
                      <input type="url" value={img.url} onChange={(e) => {
                        const newImgs = [...(block.images || [])];
                        newImgs[idx].url = convertGoogleDriveUrl(e.target.value);
                        updateBlock(block.id, { images: newImgs });
                      }} placeholder="Link ảnh Drive..." className="p-2 rounded-lg bg-[var(--bg-main)] text-xs font-mono outline-none" />
                      <input type="text" value={img.caption} onChange={(e) => {
                        const newImgs = [...(block.images || [])];
                        newImgs[idx].caption = e.target.value;
                        updateBlock(block.id, { images: newImgs });
                      }} placeholder="Chú thích ngắn..." className="p-2 rounded-lg bg-[var(--bg-main)] text-xs outline-none" />
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const newImgs = [...(block.images || []), { url: '', caption: 'Ảnh mới' }];
                    updateBlock(block.id, { images: newImgs });
                  }} className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Thêm ảnh vào bộ sưu tập</button>
                </div>
              )}

              {block.type === 'quiz' && (
                <div className="space-y-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)]">
                  <input type="text" value={block.quizQuestion || ''} onChange={(e) => updateBlock(block.id, { quizQuestion: e.target.value })} placeholder="Câu hỏi trắc nghiệm ôn tập..." className="w-full p-3 rounded-xl bg-[var(--bg-main)] text-xs font-bold outline-none" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(block.quizOptions || []).map((opt, idx) => (
                      <input key={idx} type="text" value={opt} onChange={(e) => {
                        const newOpts = [...(block.quizOptions || [])];
                        newOpts[idx] = e.target.value;
                        updateBlock(block.id, { quizOptions: newOpts });
                      }} placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}...`} className="p-2 rounded-lg bg-[var(--bg-main)] text-xs outline-none" />
                    ))}
                  </div>
                </div>
              )}

              {block.type === 'table' && (
                <div className="space-y-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-card)]">
                  <span className="text-xs font-bold text-amber-500 block">Bảng Dữ Liệu So Sánh (3 Cột):</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(block.tableHeaders || ['Cột 1', 'Cột 2', 'Cột 3']).map((h, idx) => (
                      <input key={idx} type="text" value={h} onChange={(e) => {
                        const newH = [...(block.tableHeaders || [])];
                        newH[idx] = e.target.value;
                        updateBlock(block.id, { tableHeaders: newH });
                      }} className="p-2 rounded-lg bg-amber-500/10 text-xs font-bold text-amber-400 outline-none" />
                    ))}
                  </div>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-2 text-center">
                  <div className="w-full border-t border-[var(--border-card)] my-2" />
                </div>
              )}

            </div>
          </React.Fragment>
        ))}

        {/* BOTTOM ADD BLOCK BUTTON */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => { setInsertIndex(null); setShowBlockDrawer(true); }}
            className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mx-auto shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-500" /> Thêm Khối Nội Dung Mới
          </button>
        </div>

      </div>

      {/* BLOCK LIBRARY DRAWER */}
      {showBlockDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
              <h3 className="font-bold text-lg text-amber-500 flex items-center gap-2 font-serif">
                <LayoutGrid className="w-5 h-5 text-amber-500" /> Thư Viện 12 Khối Trình Bày VERIDU
              </h3>
              <button onClick={() => setShowBlockDrawer(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button type="button" onClick={() => addBlock('heading', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">H2</div>
                <div className="font-bold text-xs">Tiêu Đề</div>
              </button>
              <button type="button" onClick={() => addBlock('paragraph', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Type className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Đoạn Văn</div>
              </button>
              <button type="button" onClick={() => addBlock('image', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Ảnh Drive</div>
              </button>
              <button type="button" onClick={() => addBlock('alert', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-blue-500 hover:bg-blue-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Hộp Cảnh Báo</div>
              </button>
              <button type="button" onClick={() => addBlock('gallery', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-emerald-500 hover:bg-emerald-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Grid className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Gallery Grid</div>
              </button>
              <button type="button" onClick={() => addBlock('quiz', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><HelpCircle className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Fast-Quiz</div>
              </button>
              <button type="button" onClick={() => addBlock('table', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500 hover:bg-indigo-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center"><TableIcon className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Bảng Dữ Liệu</div>
              </button>
              <button type="button" onClick={() => addBlock('pullquote', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Quote className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Trích Kinh Thánh</div>
              </button>
              <button type="button" onClick={() => addBlock('video', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-rose-500 hover:bg-rose-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center"><VideoIcon className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Video Embed</div>
              </button>
              <button type="button" onClick={() => addBlock('scripture', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500 hover:bg-amber-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Tham Chiếu</div>
              </button>
              <button type="button" onClick={() => addBlock('dictionary', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-indigo-500 hover:bg-indigo-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Thuật Ngữ</div>
              </button>
              <button type="button" onClick={() => addBlock('divider', insertIndex)} className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-slate-500 hover:bg-slate-500/10 transition text-left space-y-1.5 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center"><Minus className="w-4 h-4" /></div>
                <div className="font-bold text-xs">Kẻ Ngang</div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
