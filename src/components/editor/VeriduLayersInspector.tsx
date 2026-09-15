'use client';

import React, { useState, useEffect } from 'react';
import { 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Copy, 
  Eye, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  BookOpen, 
  Headphones, 
  AlertTriangle, 
  Heart, 
  Type, 
  Columns, 
  Table as TableIcon,
  HelpCircle,
  FileText,
  Minus,
  Sparkles
} from 'lucide-react';

export interface LayerItem {
  id: string;
  type: string;
  label?: string;
  snippet?: string;
  level?: string;
}

export interface VeriduLayersInspectorProps {
  layers?: LayerItem[];
  activeLayerId?: string | null;
  onSelectLayer?: (id: string) => void;
  onReorderLayers?: (startIndex: number, endIndex: number) => void;
  onDeleteLayer?: (id: string) => void;
  onDuplicateLayer?: (id: string) => void;
  // Canvas DOM Integrated Mode:
  editorRef?: React.RefObject<HTMLDivElement | null>;
  onContentChange?: () => void;
  onEditBlock?: (el: HTMLElement, type: string, data: Record<string, any>) => void;
}

export default function VeriduLayersInspector({
  layers: externalLayers,
  activeLayerId: externalActiveId,
  onSelectLayer,
  onReorderLayers,
  onDeleteLayer,
  onDuplicateLayer,
  editorRef,
  onContentChange,
  onEditBlock
}: VeriduLayersInspectorProps) {
  const [internalLayers, setInternalLayers] = useState<LayerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropOverIndex, setDropOverIndex] = useState<number | null>(null);

  // Scan and synchronize DOM nodes from editorRef into LayerItem[]
  useEffect(() => {
    if (!editorRef?.current) return;

    const extractFromDom = () => {
      const container = editorRef.current;
      if (!container) return;

      const items: LayerItem[] = [];
      Array.from(container.children).forEach((child, idx) => {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        let type = 'paragraph';
        let label = 'Đoạn văn';
        let level: string | undefined = undefined;
        let snippet = el.textContent?.trim().slice(0, 50) || '';

        const blockTypeAttr = el.getAttribute('data-veridu-block');
        if (blockTypeAttr) {
          type = blockTypeAttr;
          if (type === 'scripture') label = 'Lời Chúa Soi Đường';
          else if (type === 'container') label = 'Vùng Chứa (Section)';
          else if (type === 'video') label = 'Video Nhúng';
          else if (type === 'image') label = 'Hình Ảnh';
          else if (type === 'audio') label = 'Khung Audio';
          else if (type === 'callout') label = 'Lưu Ý & Cảnh Báo';
          else if (type === 'prayer') label = 'Lời Nguyện Kính';
          else label = blockTypeAttr.toUpperCase();
        } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
          type = 'heading';
          level = tag;
          label = `Tiêu đề ${tag.toUpperCase()}`;
        } else if (tag === 'figure' || el.classList.contains('veridu-image-block') || el.querySelector('img')) {
          type = 'image';
          label = 'Hình Ảnh';
        } else if (el.classList.contains('sacred-scripture') || el.classList.contains('veridu-scripture-quote')) {
          type = 'scripture';
          label = 'Lời Chúa Soi Đường';
        } else if (el.classList.contains('veridu-section-container') || el.classList.contains('veridu-container-block')) {
          type = 'container';
          label = 'Vùng Chứa (Section)';
        } else if (el.classList.contains('veridu-embed-audio')) {
          type = 'audio';
          label = 'Khung Audio';
        } else if (el.classList.contains('veridu-video-block') || el.querySelector('iframe')) {
          type = 'video';
          label = 'Video Nhúng';
        } else if (el.classList.contains('catechetical-callout')) {
          type = 'callout';
          label = 'Lưu Ý & Cảnh Báo';
        } else if (el.classList.contains('prayer-block') || el.classList.contains('poetry-block')) {
          type = 'prayer';
          label = 'Lời Nguyện Kính';
        } else if (el.classList.contains('abstract-research')) {
          type = 'abstract';
          label = 'Tóm Tắt Nghiên Cứu';
        } else if (el.classList.contains('scripture-meta')) {
          type = 'meta';
          label = 'Bằng Chứng Thánh Kinh';
        } else if (el.classList.contains('dictionary-meta')) {
          type = 'dictionary';
          label = 'Thuật Ngữ Thần Học';
        }

        const id = el.id || `layer-node-${idx}`;
        if (!el.id) el.id = id;
        items.push({ id, type, label, snippet, level });
      });

      setInternalLayers(items);
    };

    extractFromDom();

    const observer = new MutationObserver(() => {
      extractFromDom();
    });

    observer.observe(editorRef.current, { childList: true, subtree: false });
    return () => observer.disconnect();
  }, [editorRef]);

  const layers = externalLayers || internalLayers;
  const activeLayerId = externalActiveId !== undefined ? externalActiveId : selectedId;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onSelectLayer) {
      onSelectLayer(id);
    } else if (editorRef?.current) {
      const target = editorRef.current.querySelector(`#${id}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ring-2', 'ring-amber-500', 'rounded-xl');
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-amber-500', 'rounded-xl');
        }, 1500);
      }
    }
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    if (onReorderLayers) {
      onReorderLayers(startIndex, endIndex);
    } else if (editorRef?.current) {
      const container = editorRef.current;
      const children = Array.from(container.children);
      const itemToMove = children[startIndex];
      if (!itemToMove) return;

      if (endIndex >= children.length - 1) {
        container.appendChild(itemToMove);
      } else {
        const referenceNode = children[endIndex > startIndex ? endIndex + 1 : endIndex];
        container.insertBefore(itemToMove, referenceNode);
      }
      onContentChange?.();
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteLayer) {
      onDeleteLayer(id);
    } else if (editorRef?.current) {
      const target = editorRef.current.querySelector(`#${id}`);
      if (target) {
        target.remove();
        onContentChange?.();
      }
    }
  };

  const handleDuplicate = (id: string) => {
    if (onDuplicateLayer) {
      onDuplicateLayer(id);
    } else if (editorRef?.current) {
      const target = editorRef.current.querySelector(`#${id}`);
      if (target) {
        const clone = target.cloneNode(true) as HTMLElement;
        clone.id = `layer-node-${Date.now()}`;
        target.after(clone);
        onContentChange?.();
      }
    }
  };

  const getLayerIcon = (type: string, level?: string) => {
    switch (type) {
      case 'heading':
        return <span className="font-mono font-bold text-[10px] text-amber-500 bg-amber-500/15 px-1 py-0.5 rounded">{level?.toUpperCase() || 'H2'}</span>;
      case 'paragraph':
        return <Type className="w-3.5 h-3.5 text-slate-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'scripture':
      case 'pullquote':
        return <BookOpen className="w-3.5 h-3.5 text-amber-500" />;
      case 'container':
        return <Columns className="w-3.5 h-3.5 text-cyan-400" />;
      case 'audio':
        return <Headphones className="w-3.5 h-3.5 text-indigo-400" />;
      case 'callout':
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'prayer':
        return <Heart className="w-3.5 h-3.5 text-purple-400" />;
      case 'table':
        return <TableIcon className="w-3.5 h-3.5 text-blue-400" />;
      case 'quiz':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'divider':
        return <Minus className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropOverIndex !== index) {
      setDropOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDropOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-serif">
          <Layers className="w-3.5 h-3.5" />
          <span>Danh Sách Lớp ({layers.length} Khối)</span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">
          Kéo thả để đổi thứ tự
        </span>
      </div>

      {layers.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)] border-dashed">
          Chưa có khối nào trong tài liệu.
        </div>
      ) : (
        <div className="space-y-1.5">
          {layers.map((layer, index) => {
            const isActive = activeLayerId === layer.id;
            const isDropTarget = dropOverIndex === index;

            return (
              <div key={layer.id} className="relative">
                {/* Visual Drop Indicator Line */}
                {isDropTarget && draggedIndex !== null && draggedIndex !== index && (
                  <div className="absolute -top-1 left-0 right-0 h-0.5 bg-amber-500 rounded-full shadow-md shadow-amber-500/50 z-20 animate-pulse" />
                )}

                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleSelect(layer.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer group select-none ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40 hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Drag Grip Handle */}
                    <div 
                      className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-amber-500 p-0.5 transition shrink-0"
                      title="Kéo để đổi thứ tự khối"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Block Icon */}
                    <div className="p-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shrink-0">
                      {getLayerIcon(layer.type, layer.level)}
                    </div>

                    {/* Block Label & Snippet */}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[var(--text-main)] truncate">
                        {layer.label || (layer.type === 'heading' ? `Tiêu đề ${layer.level?.toUpperCase() || 'H2'}` : layer.type)}
                      </div>
                      {layer.snippet && (
                        <p className="text-[10px] text-[var(--text-muted)] truncate font-serif italic">
                          {layer.snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons on Hover */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(index, index - 1);
                      }}
                      className="p-1 rounded-lg hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 disabled:opacity-20 transition cursor-pointer"
                      title="Di chuyển lên trên"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === layers.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(index, index + 1);
                      }}
                      className="p-1 rounded-lg hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 disabled:opacity-20 transition cursor-pointer"
                      title="Di chuyển xuống dưới"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(layer.id);
                      }}
                      className="p-1 rounded-lg hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-400 transition cursor-pointer"
                      title="Nhân bản khối này"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(layer.id);
                      }}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition cursor-pointer"
                      title="Xóa khối"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
