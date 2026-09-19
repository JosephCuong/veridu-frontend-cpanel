'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, Copy, Check, BookOpen, Cross, Image as ImageIcon, Eye } from 'lucide-react';

interface QuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuote?: string;
  initialTitle?: string;
  initialAuthor?: string;
  category?: string;
  imageUrl?: string;
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
    bg2: '#1c1407',
    accent: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.45)',
  },
  emerald: {
    name: 'Lục Bảo Thường Niên',
    bg1: '#05110d',
    bg2: '#0b261a',
    accent: '#10b981',
    border: 'rgba(16, 185, 129, 0.45)',
  },
  purple: {
    name: 'Tím Mùa Vọng & Chay',
    bg1: '#0e0717',
    bg2: '#230e36',
    accent: '#a855f7',
    border: 'rgba(168, 85, 247, 0.45)',
  },
  ruby: {
    name: 'Đỏ Thánh Thần Tử Đạo',
    bg1: '#140507',
    bg2: '#2e0a10',
    accent: '#ef4444',
    border: 'rgba(239, 68, 68, 0.45)',
  },
};

export default function QuoteCardModal({
  isOpen,
  onClose,
  initialQuote = '„Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”',
  initialTitle = 'Thánh Vịnh 119, 105',
  initialAuthor = 'Học Viện Thần Học VERIDU',
  category = 'Thánh Kinh & Thần Học',
  imageUrl
}: QuoteCardModalProps) {
  const [quote, setQuote] = useState(initialQuote);
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<ThemeMode>('gold');
  const [useBgImage, setUseBgImage] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedBgImageRef = useRef<HTMLImageElement | null>(null);
  const loadedLogoImageRef = useRef<HTMLImageElement | null>(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setQuote(initialQuote);
      setTitle(initialTitle);
      setAuthor(initialAuthor);
      setUseBgImage(!!imageUrl);
    }
  }, [isOpen, initialQuote, initialTitle, initialAuthor, imageUrl]);

  // Preload logo image
  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/images/veridu_logo_light.png';
    logo.onload = () => {
      loadedLogoImageRef.current = logo;
      if (isOpen) renderCard();
    };
  }, [isOpen]);

  // Preload background image if available
  useEffect(() => {
    if (!imageUrl) {
      loadedBgImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      loadedBgImageRef.current = img;
      if (isOpen) renderCard();
    };
    img.onerror = () => {
      loadedBgImageRef.current = null;
    };
  }, [imageUrl, isOpen]);

  // Wrap text helper
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = (text || '').trim().split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? (currentLine + ' ' + word) : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const renderCard = useCallback(() => {
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

    // ── 1. BACKGROUND RENDERING ──
    const bgImg = loadedBgImageRef.current;
    if (useBgImage && bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      // Draw image cover
      const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawW = height * imgRatio;
        offsetX = -(drawW - width) / 2;
      } else {
        drawH = width / imgRatio;
        offsetY = -(drawH - height) / 2;
      }

      ctx.save();
      ctx.filter = 'blur(16px) brightness(0.45)';
      ctx.drawImage(bgImg, offsetX - 20, offsetY - 20, drawW + 40, drawH + 40);
      ctx.restore();

      // Dark liturgical radial vignette overlay
      const overlayGrad = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, Math.max(width, height) / 1.15);
      overlayGrad.addColorStop(0, 'rgba(6, 10, 20, 0.72)');
      overlayGrad.addColorStop(1, 'rgba(14, 9, 5, 0.94)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Pure liturgical radial gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, Math.max(width, height) / 1.15);
      bgGrad.addColorStop(0, currentTheme.bg2);
      bgGrad.addColorStop(1, currentTheme.bg1);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Fine sacred parchment texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      for (let x = 0; x < width; x += 36) {
        ctx.fillRect(x, 0, 1, height);
      }
      for (let y = 0; y < height; y += 36) {
        ctx.fillRect(0, y, width, 1);
      }
    }

    // ── 2. SACRED CHI-RHO WATERMARK (CENTER BACKGROUND) ──
    ctx.save();
    ctx.font = 'bold 360px "Times New Roman", serif';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.055)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☧', width / 2, height / 2 + 10);
    ctx.restore();

    // ── 3. DOUBLE PHỤNG VỤ BORDER & ORNATE CORNERS ──
    // Outer border
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 12;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Inner hairline border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    // Ornate Corners
    const cornerSize = 44;
    ctx.strokeStyle = currentTheme.accent;
    ctx.lineWidth = 3.5;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(34, 34 + cornerSize);
    ctx.lineTo(34, 34);
    ctx.lineTo(34 + cornerSize, 34);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 34 - cornerSize, 34);
    ctx.lineTo(width - 34, 34);
    ctx.lineTo(width - 34, 34 + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(34, height - 34 - cornerSize);
    ctx.lineTo(34, height - 34);
    ctx.lineTo(34 + cornerSize, height - 34);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 34 - cornerSize, height - 34);
    ctx.lineTo(width - 34, height - 34);
    ctx.lineTo(width - 34, height - 34 - cornerSize);
    ctx.stroke();

    // ── 4. HEADER: OFFICIAL WEBSITE LOGO & CATEGORY PILL ──
    const topY = aspectRatio === '9:16' ? 160 : (aspectRatio === '16:9' ? 90 : 110);
    const logoImg = loadedLogoImageRef.current;

    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      // Draw official logo image
      const logoW = 200;
      const logoH = (logoW / logoImg.naturalWidth) * logoImg.naturalHeight;
      ctx.drawImage(logoImg, width / 2 - logoW / 2, topY - 35, logoW, logoH);
    } else {
      // Sacred Cross Insignia Fallback
      ctx.font = 'bold 36px serif';
      ctx.fillStyle = currentTheme.accent;
      ctx.textAlign = 'center';
      ctx.fillText('☩', width / 2, topY - 20);

      ctx.font = 'bold 24px serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('VERIDU', width / 2, topY + 14);
    }

    // Category Pill
    const catY = topY + 45;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = currentTheme.accent;
    ctx.textAlign = 'center';
    ctx.fillText((category || 'THÁNH KINH & LINH ĐẠO').toUpperCase(), width / 2, catY);

    // Header Divider Line
    ctx.beginPath();
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 1.5;
    ctx.moveTo(width / 2 - 140, catY + 18);
    ctx.lineTo(width / 2 + 140, catY + 18);
    ctx.stroke();

    // ── 5. CENTER QUOTE TEXT (ELEGANT SERIF & PROPORTIONAL) ──
    const maxTextWidth = width - 240;
    const quoteFontSize = aspectRatio === '16:9' ? 34 : (aspectRatio === '9:16' ? 42 : 38);
    ctx.font = 'italic ' + quoteFontSize + 'px "Lora", "Merriweather", "Times New Roman", serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';

    let quoteLines = wrapText(ctx, quote, maxTextWidth);
    if (quoteLines.length > 7) {
      quoteLines = quoteLines.slice(0, 6);
      quoteLines[5] += '...';
    }

    const quoteLineHeight = quoteFontSize * 1.55;
    const totalQuoteH = quoteLines.length * quoteLineHeight;
    const centerY = height / 2 - 20;
    const startQuoteY = centerY - (totalQuoteH / 2);

    quoteLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startQuoteY + (index * quoteLineHeight));
    });

    // ── 6. REFERENCE / TITLE AUTO-WRAPPED (PREVENT OVERFLOW) ──
    const maxTitleWidth = width - 260;
    let titleFontSize = 24;
    ctx.font = 'bold ' + titleFontSize + 'px "Lora", "Merriweather", serif';
    let titleLines = wrapText(ctx, title, maxTitleWidth);

    // Auto-scale if title is long
    if (titleLines.length > 2) {
      titleFontSize = 20;
      ctx.font = 'bold ' + titleFontSize + 'px "Lora", "Merriweather", serif';
      titleLines = wrapText(ctx, title, maxTitleWidth);
    }

    const titleLineHeight = titleFontSize * 1.45;
    const startTitleY = startQuoteY + totalQuoteH + 45;

    ctx.fillStyle = currentTheme.accent;
    ctx.textAlign = 'center';

    if (titleLines.length === 1) {
      ctx.fillText('— ' + titleLines[0] + ' —', width / 2, startTitleY);
    } else {
      titleLines.slice(0, 3).forEach((line, idx) => {
        const textToDraw = idx === 0 ? ('— ' + line) : (idx === titleLines.length - 1 ? (line + ' —') : line);
        ctx.fillText(textToDraw, width / 2, startTitleY + (idx * titleLineHeight));
      });
    }

    // Author
    const finalAuthorY = startTitleY + (Math.min(titleLines.length, 3) * titleLineHeight) + 14;
    if (author && author !== title) {
      ctx.font = '500 15px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(author, width / 2, finalAuthorY);
    }

    // ── 7. FOOTER: THAPGIA.COM & SACRED COPYRIGHT ──
    const botY = height - (aspectRatio === '9:16' ? 140 : 80);

    // Thin footer divider
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.moveTo(width / 2 - 180, botY - 32);
    ctx.lineTo(width / 2 + 180, botY - 32);
    ctx.stroke();

    // Brand Link & Website
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = currentTheme.accent;
    ctx.letterSpacing = '2px';
    ctx.fillText('✦ THAPGIA.COM • VERIDU.NET ✦', width / 2, botY - 8);

    // Subtitle
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('Nền Tảng Thần Học & Văn Hóa Công Giáo', width / 2, botY + 16);
  }, [aspectRatio, author, category, quote, theme, title, useBgImage]);

  useEffect(() => {
    if (isOpen) {
      renderCard();
    }
  }, [isOpen, quote, title, author, aspectRatio, theme, useBgImage, renderCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'VERIDU_TheLoiChua_' + Date.now() + '.png';
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
              className="max-w-full max-h-[460px] object-contain rounded-xl shadow-2xl border border-amber-500/25"
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 font-serif">
            Ảnh xuất bản độ nét cao (HD 1080p) • Nền watermark Chi-Rho ☧
          </p>
        </div>

        {/* Right: Controls & Actions */}
        <div className="w-full md:w-80 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-serif font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Trích Xuất Thẻ Lời Chúa & Châm Ngôn</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Chia sẻ Lời Chúa & tri thức lên mạng xã hội với phong cách Công giáo
              </p>
            </div>

            {/* Background Image Toggle (if article image available) */}
            {imageUrl && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-[var(--text-main)]">Nền mờ ảnh bài viết</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseBgImage(!useBgImage)}
                  className={'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ' + (
                    useBgImage ? 'bg-amber-500' : 'bg-slate-700'
                  )}
                >
                  <span
                    className={'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ' + (
                      useBgImage ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            )}

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
                Nguồn / Tiêu Đề Bài Viết
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-serif"
                placeholder="VD: Ga 8, 32 hoặc Tiêu đề bài viết..."
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
