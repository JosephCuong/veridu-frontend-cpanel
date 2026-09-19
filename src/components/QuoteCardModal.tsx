'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface QuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuote?: string;
  initialTitle?: string;
  initialAuthor?: string;
  category?: string;
}

type AspectRatio = '1:1' | '9:16' | '16:9';
type ThemeMode = 'gold' | 'emerald' | 'purple' | 'ruby';

interface ThemeDef {
  name: string;
  bg1: string;
  bg2: string;
  accent: string;
  border: string;
}

const THEMES: Record<ThemeMode, ThemeDef> = {
  gold: {
    name: 'Vàng Kim Phục Sinh',
    bg1: '#070a12',
    bg2: '#1a1306',
    accent: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.4)',
  },
  emerald: {
    name: 'Lục Bảo Thường Niên',
    bg1: '#05110d',
    bg2: '#0b2319',
    accent: '#10b981',
    border: 'rgba(168, 85, 247, 0.4)',
  },
  purple: {
    name: 'Tím Mùa Vọng & Chay',
    bg1: '#0e0717',
    bg2: '#200d33',
    accent: '#a855f7',
    border: 'rgba(168, 85, 247, 0.4)',
  },
  ruby: {
    name: 'Đỏ Thánh Thần Tử Đạo',
    bg1: '#140507',
    bg2: '#2b090f',
    accent: '#ef4444',
    border: 'rgba(239, 68, 68, 0.4)',
  },
};

export default function QuoteCardModal({
  isOpen,
  onClose,
  initialQuote = '„Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”',
  initialTitle = 'Thánh Vịnh 119, 105',
  initialAuthor = 'Lời Chúa Hằng Ngày',
  category = 'Thánh Vịnh & Linh Đạo'
}: QuoteCardModalProps) {
  const [quote, setQuote] = useState(initialQuote);
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<ThemeMode>('gold');
  const [copied, setCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuote(initialQuote);
      setTitle(initialTitle);
      setAuthor(initialAuthor);
    }
  }, [isOpen, initialQuote, initialTitle, initialAuthor]);

  useEffect(() => {
    if (isOpen) {
      renderCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, quote, title, author, aspectRatio, theme]);

  const renderCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1080;
    let height = 1080;

    if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === '16:9') {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    const currentTheme = THEMES[theme];

    // Background gradient
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) / 1.2);
    bgGrad.addColorStop(0, currentTheme.bg2);
    bgGrad.addColorStop(1, currentTheme.bg1);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle texture grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let x = 0; x < width; x += 40) {
      ctx.fillRect(x, 0, 1, height);
    }
    for (let y = 0; y < height; y += 40) {
      ctx.fillRect(0, y, width, 1);
    }

    // Outer double border
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Ornate Corners
    const cornerSize = 40;
    ctx.strokeStyle = currentTheme.accent;
    ctx.lineWidth = 4;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(35, 35 + cornerSize);
    ctx.lineTo(35, 35);
    ctx.lineTo(35 + cornerSize, 35);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 35 - cornerSize, 35);
    ctx.lineTo(width - 35, 35);
    ctx.lineTo(width - 35, 35 + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(35, height - 35 - cornerSize);
    ctx.lineTo(35, height - 35);
    ctx.lineTo(35 + cornerSize, height - 35);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 35 - cornerSize, height - 35);
    ctx.lineTo(width - 35, height - 35);
    ctx.lineTo(width - 35, height - 35 - cornerSize);
    ctx.stroke();

    // Top Brand & Category Header
    const topY = aspectRatio === '9:16' ? 180 : 120;
    ctx.textAlign = 'center';

    // Cross icon
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = currentTheme.accent;
    ctx.fillText('☩', width / 2, topY - 30);

    // Brand Name
    ctx.font = 'bold 26px serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '4px';
    ctx.fillText('VERIDU', width / 2, topY + 10);

    // Category Tag
    ctx.font = '500 16px sans-serif';
    ctx.fillStyle = currentTheme.accent;
    ctx.fillText((category || 'THÁNH KINH & THẦN HỌC').toUpperCase(), width / 2, topY + 42);

    // Header Divider Line
    ctx.beginPath();
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 2;
    ctx.moveTo(width / 2 - 120, topY + 65);
    ctx.lineTo(width / 2 + 120, topY + 65);
    ctx.stroke();

    // Center Quote Text
    const centerY = height / 2;
    const maxTextWidth = width - 220;
    const fontSize = aspectRatio === '16:9' ? 36 : (aspectRatio === '9:16' ? 44 : 40);
    ctx.font = 'italic ' + fontSize + 'px "Lora", "Merriweather", "Times New Roman", serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';

    // Word wrapping function
    const words = quote.split(' ');
    let lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? (currentLine + ' ' + word) : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length > 7) {
      lines = lines.slice(0, 6);
      lines[5] += '...';
    }

    const lineHeight = fontSize * 1.5;
    const startQuoteY = centerY - ((lines.length * lineHeight) / 2) + 20;

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startQuoteY + (index * lineHeight));
    });

    // Reference Title & Author
    const refY = startQuoteY + (lines.length * lineHeight) + 40;
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = currentTheme.accent;
    ctx.fillText('— ' + title + ' —', width / 2, refY);

    if (author && author !== title) {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(author, width / 2, refY + 30);
    }

    // Bottom Footer
    const botY = height - (aspectRatio === '9:16' ? 140 : 80);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Nền tảng Thần học & Văn hóa Công giáo • thapgia.com', width / 2, botY);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'VERIDU_TheAnh_' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setIsRendering(true);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (e) {
          console.error('Clipboard copy failed, fallback to download', e);
          handleDownload();
        } finally {
          setIsRendering(false);
        }
      });
    } catch (err) {
      console.error(err);
      setIsRendering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto flex flex-col md:flex-row gap-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Canvas Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/60 rounded-2xl p-3 border border-slate-800 min-h-[320px] max-h-[520px] overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[460px] object-contain rounded-xl shadow-2xl border border-amber-500/20"
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 font-serif">
            Xem trước ảnh xuất bản HD (1080p)
          </p>
        </div>

        {/* Right: Controls & Actions */}
        <div className="w-full md:w-80 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-serif font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Tạo Thẻ Ảnh Lời Chúa</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Chia sẻ Lời Chúa & Châm ngôn lên mạng xã hội
              </p>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Định Dạng Ảnh
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1:1', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={'py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ' + (
                      aspectRatio === ratio
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-card)] hover:text-[var(--text-main)]'
                    )}
                  >
                    {ratio === '1:1' ? 'Vuông (1:1)' : ratio === '9:16' ? 'Dọc (Story)' : 'Ngang (16:9)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Liturgical Theme Selector */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Màu Sắc Phụng Vụ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemeMode[]).map((tKey) => {
                  const t = THEMES[tKey];
                  return (
                    <button
                      key={tKey}
                      onClick={() => setTheme(tKey)}
                      className={'p-2 rounded-xl text-left text-xs font-semibold border flex items-center gap-2 transition-all ' + (
                        theme === tKey
                          ? 'border-amber-400 bg-amber-500/10 text-[var(--text-main)] shadow-sm'
                          : 'border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.accent }}
                      />
                      <span className="truncate text-[11px]">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quote input */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Nội Dung Trích Dẫn
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={3}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 resize-none font-serif leading-relaxed"
                placeholder="Nhập câu Kinh Thánh hoặc châm ngôn..."
              />
            </div>

            {/* Reference Title */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Nguồn / Xuất Xứ
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-serif"
                placeholder="VD: Ga 8, 32"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
            <button
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Về Máy (HD PNG)</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={isRendering}
              className={'w-full py-2.5 px-4 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ' + (
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-[var(--bg-main)] hover:bg-[var(--bg-main)]/80 text-[var(--text-main)] border-[var(--border-card)]'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã Sao Chép Ảnh Vào Bộ Nhớ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Ảnh (Dán Vào Zalo / FB)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
