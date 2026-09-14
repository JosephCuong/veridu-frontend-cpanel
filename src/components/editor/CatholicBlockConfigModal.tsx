'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Video, 
  Image as ImageIcon, 
  BookOpen, 
  Headphones, 
  Radio, 
  AlertTriangle, 
  Heart, 
  Check, 
  ExternalLink, 
  Layers, 
  Sparkles,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Smartphone
} from 'lucide-react';
import { parseVideoUrl, generateVideoBlockHtml } from '@/lib/videoHelper';

export type ConfigurableBlockType = 'video' | 'image' | 'scripture' | 'audio' | 'callout' | 'prayer';

export interface CatholicBlockConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockType: ConfigurableBlockType;
  initialData?: Record<string, any>;
  mode?: 'insert' | 'edit';
  onConfirm: (htmlSnippet: string) => void;
  onInsertDefault?: () => void;
}

function convertGoogleDriveImgUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1] && /drive\.google\.com/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

export default function CatholicBlockConfigModal({
  isOpen,
  onClose,
  blockType,
  initialData,
  mode = 'insert',
  onConfirm,
  onInsertDefault
}: CatholicBlockConfigModalProps) {
  // ─── 1. VIDEO STATE ──────────────────────────────────────────────────────────
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  // ─── 2. IMAGE STATE ──────────────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageLightbox, setImageLightbox] = useState(true);

  // ─── 3. SCRIPTURE STATE ──────────────────────────────────────────────────────
  const [scriptureQuote, setScriptureQuote] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');

  // ─── 4. AUDIO STATE ──────────────────────────────────────────────────────────
  const [audioPlayerType, setAudioPlayerType] = useState<'audio_mini' | 'audio_full'>('audio_mini');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioBadge, setAudioBadge] = useState('');
  const [audioDesc, setAudioDesc] = useState('');

  // ─── 5. CALLOUT STATE ────────────────────────────────────────────────────────
  const [calloutLevel, setCalloutLevel] = useState<'note' | 'tip' | 'important' | 'warning'>('important');
  const [calloutTitle, setCalloutTitle] = useState('');
  const [calloutContent, setCalloutContent] = useState('');

  // ─── 6. PRAYER STATE ─────────────────────────────────────────────────────────
  const [prayerStyle, setPrayerStyle] = useState<'prayer' | 'poetry'>('prayer');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [prayerAmen, setPrayerAmen] = useState('Amen.');

  // Initialize or prefill state whenever modal opens or blockType changes
  useEffect(() => {
    if (!isOpen) return;

    if (blockType === 'video') {
      setVideoUrl(initialData?.videoUrl || initialData?.url || '');
      setVideoCaption(initialData?.caption || initialData?.videoCaption || '');
      setVideoAspectRatio(initialData?.aspectRatio || '16:9');
    } else if (blockType === 'image') {
      setImageUrl(initialData?.imageUrl || initialData?.url || 'https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80');
      setImageCaption(initialData?.caption || 'Bích họa Nghệ Thuật Thánh Đường Công Giáo — Kiệt tác nghệ thuật phụng vụ.');
      setImageAlign(initialData?.align || 'center');
      setImageLightbox(initialData?.lightbox !== false);
    } else if (blockType === 'scripture') {
      setScriptureQuote(initialData?.quote || initialData?.scriptureQuote || 'Ngài phải nổi bật lên, còn tôi phải lu mờ đi.');
      setScriptureRef(initialData?.rawRef || initialData?.scriptureRef || 'Ga 3:30');
    } else if (blockType === 'audio') {
      setAudioPlayerType(initialData?.playerType || 'audio_mini');
      setAudioUrl(initialData?.audioUrl || initialData?.url || '');
      setAudioTitle(initialData?.title || (initialData?.playerType === 'audio_full' ? 'PODCAST HỌC THUẬT: CHUYÊN ĐỀ PHỤNG VỤ' : 'BẢN NGHE AUDIO PODCAST HỌC THUẬT'));
      setAudioBadge(initialData?.badge || (initialData?.playerType === 'audio_full' ? 'Ep #01 • 15:00 • VERIDU Audio' : 'Thời lượng: 12 phút'));
      setAudioDesc(initialData?.desc || 'Lắng nghe bản đọc diễn cảm học thuật và đối thoại sâu sắc về chủ đề này cùng Ban Biên Tập VERIDU.');
    } else if (blockType === 'callout') {
      setCalloutLevel(initialData?.level || 'important');
      setCalloutTitle(initialData?.title || '⭐ QUAN TRỌNG: TÍN LÝ HỘI THÁNH');
      setCalloutContent(initialData?.content || 'Tín điều về Bí tích Thánh Thể là trung tâm và tột đỉnh của toàn bộ đời sống Kitô hữu (Lumen Gentium, 11).');
    } else if (blockType === 'prayer') {
      setPrayerStyle(initialData?.style || 'prayer');
      setPrayerTitle(initialData?.title || '🕊️ LỜI NGUYỆN KÍNH PHỤNG VỤ');
      setPrayerText(initialData?.text || 'Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...');
      setPrayerAmen(initialData?.amen || 'Amen.');
    }
  }, [isOpen, blockType, initialData]);

  // Video parsing & detection
  const parsedVideo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

  // Formatted image
  const resolvedImageUrl = useMemo(() => convertGoogleDriveImgUrl(imageUrl), [imageUrl]);

  if (!isOpen) return null;

  // ─── GENERATE FINAL HTML ───────────────────────────────────────────────────
  const generateSnippet = (): string => {
    switch (blockType) {
      case 'video': {
        const urlToUse = videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        return generateVideoBlockHtml({
          url: urlToUse,
          caption: videoCaption.trim(),
          aspectRatio: videoAspectRatio
        });
      }

      case 'image': {
        const finalUrl = resolvedImageUrl || 'https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80';
        let alignClass = 'mx-auto block text-center';
        if (imageAlign === 'left') alignClass = 'float-left mr-6 mb-4 max-w-sm';
        if (imageAlign === 'right') alignClass = 'float-right ml-6 mb-4 max-w-sm';

        const captionHtml = imageCaption.trim()
          ? `<figcaption class="mt-3 text-center text-xs italic text-[var(--text-muted)] font-serif max-w-xl mx-auto">${imageCaption.trim()}</figcaption>`
          : '';

        return `<figure class="veridu-image-block my-8 ${alignClass} not-prose" data-veridu-block="image" data-image-url="${encodeURIComponent(imageUrl)}" data-align="${imageAlign}" data-caption="${encodeURIComponent(imageCaption)}">
  <img src="${finalUrl}" alt="${imageCaption.trim() || 'Nghệ Thuật Thánh Đường'}" ${imageLightbox ? 'data-lightbox="true"' : ''} referrerpolicy="no-referrer" class="max-w-full h-auto rounded-3xl shadow-2xl mx-auto block cursor-zoom-in hover:scale-[1.01] transition-transform duration-300 border border-[var(--border-card)]" />
  ${captionHtml}
</figure>`;
      }

      case 'scripture': {
        const quote = scriptureQuote.trim() || 'Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.';
        const ref = scriptureRef.trim() || 'Tv 119:105';
        
        // Link resolution sample
        const cleanRef = ref.replace(/[\s:]+/g, '-').toLowerCase();
        const superlink = `<a href="/kinh-thanh?ref=${encodeURIComponent(ref)}" target="_blank" rel="noopener noreferrer" data-raw-ref="${ref}" title="Tra cứu Lời Chúa: ${ref}" class="scripture-superlink scripture-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group cursor-pointer"><span>${ref}</span><span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span></a>`;

        return `<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose" data-veridu-block="scripture" data-quote="${encodeURIComponent(quote)}" data-ref="${encodeURIComponent(ref)}">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “${quote}”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        ${superlink}
      </div>
    </div>
  </div>
</div>`;
      }

      case 'audio': {
        const finalAudioUrl = audioUrl.trim() || 'https://example.com/podcast.mp3';
        const title = audioTitle.trim() || 'AUDIO PODCAST HỌC THUẬT';
        const badge = audioBadge.trim() || 'Thời lượng: 12 phút';
        const desc = audioDesc.trim();

        if (audioPlayerType === 'audio_mini') {
          return `<div class="veridu-embed-audio mini my-6 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--gold-border)] shadow-md not-prose" data-veridu-block="audio" data-audio-type="mini" data-audio-url="${encodeURIComponent(audioUrl)}" data-audio-title="${encodeURIComponent(title)}" data-audio-badge="${encodeURIComponent(badge)}">
  <div class="audio-header flex justify-between items-center mb-2 font-sans">
    <span class="audio-label text-xs font-bold text-amber-500 uppercase flex items-center gap-1.5">
      <span>🎧</span> ${title}
    </span>
    <span class="audio-badge text-xs font-mono text-[var(--text-muted)] border border-[var(--border-card)] px-2.5 py-0.5 rounded-full">
      ${badge}
    </span>
  </div>
  <audio controls class="w-full h-10 rounded-lg">
    <source src="${finalAudioUrl}" type="audio/mpeg">
    Trình duyệt không hỗ trợ phát âm thanh trực tiếp.
  </audio>
</div>`;
        }

        return `<div class="veridu-embed-audio my-8 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl not-prose" data-veridu-block="audio" data-audio-type="full" data-audio-url="${encodeURIComponent(audioUrl)}" data-audio-title="${encodeURIComponent(title)}" data-audio-badge="${encodeURIComponent(badge)}" data-audio-desc="${encodeURIComponent(desc)}">
  <div class="audio-header flex justify-between items-center mb-3 font-sans">
    <div class="audio-label text-xs sm:text-sm font-bold text-amber-500 flex items-center gap-2 uppercase">
      <span>🎙️</span> ${title}
    </div>
    <span class="audio-badge text-xs font-mono text-[var(--text-muted)] border border-[var(--border-card)] px-3 py-1 rounded-full">
      ${badge}
    </span>
  </div>
  ${desc ? `<p class="text-xs sm:text-sm text-[var(--text-muted)] mb-3 leading-relaxed font-serif">${desc}</p>` : ''}
  <audio controls class="w-full h-11 rounded-lg">
    <source src="${finalAudioUrl}" type="audio/mpeg">
    Trình duyệt không hỗ trợ phát âm thanh trực tiếp.
  </audio>
</div>`;
      }

      case 'callout': {
        const title = calloutTitle.trim() || 'THÔNG BÁO TÍN LÝ';
        const content = calloutContent.trim() || 'Nội dung thông điệp quan trọng...';

        let borderClass = 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200';
        let textTitleClass = 'text-amber-600 dark:text-amber-400';
        let icon = '⭐';

        if (calloutLevel === 'note') {
          borderClass = 'border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-200';
          textTitleClass = 'text-blue-600 dark:text-blue-400';
          icon = 'ℹ️';
        } else if (calloutLevel === 'tip') {
          borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200';
          textTitleClass = 'text-emerald-600 dark:text-emerald-400';
          icon = '💡';
        } else if (calloutLevel === 'warning') {
          borderClass = 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200';
          textTitleClass = 'text-rose-600 dark:text-rose-400';
          icon = '⚠️';
        }

        return `<div class="catechetical-callout callout-${calloutLevel} my-6 p-5 sm:p-6 border-l-4 ${borderClass} rounded-r-2xl backdrop-blur-md shadow-md space-y-1.5 not-prose" data-veridu-block="callout" data-callout-level="${calloutLevel}" data-callout-title="${encodeURIComponent(title)}" data-callout-content="${encodeURIComponent(content)}">
  <div class="text-xs font-bold uppercase tracking-wider ${textTitleClass} flex items-center gap-1.5">
    <span>${icon}</span> ${title}
  </div>
  <div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">
    ${content}
  </div>
</div>`;
      }

      case 'prayer': {
        const title = prayerTitle.trim() || '🕊️ LỜI NGUYỆN KÍNH PHỤNG VỤ';
        const text = prayerText.trim() || 'Lạy Chúa, xin thương xót và chúc lành cho chúng con...';
        const amen = prayerAmen.trim() || 'Amen.';

        if (prayerStyle === 'poetry') {
          const verses = text.split('\n').filter(v => v.trim()).map(v => `<div class="poetry-verse py-0.5">${v}</div>`).join('');
          return `<div class="poetry-block my-8 p-6 sm:p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/30 shadow-xl backdrop-blur-md not-prose font-serif" data-veridu-block="prayer" data-style="poetry" data-title="${encodeURIComponent(title)}" data-text="${encodeURIComponent(text)}" data-amen="${encodeURIComponent(amen)}">
  <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-4 font-serif">
    ${title}
  </div>
  <div class="poetry-content italic text-base sm:text-lg leading-relaxed text-indigo-950 dark:text-indigo-100 pl-4 border-l-2 border-indigo-500/40 space-y-1">
    ${verses}
  </div>
  <div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">${amen}</div>
</div>`;
        }

        return `<div class="prayer-block my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 shadow-xl backdrop-blur-md not-prose" data-veridu-block="prayer" data-style="prayer" data-title="${encodeURIComponent(title)}" data-text="${encodeURIComponent(text)}" data-amen="${encodeURIComponent(amen)}">
  <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif mb-3">
    ${title}
  </div>
  <p class="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed m-0">
    “${text}”
  </p>
  <div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">${amen}</div>
</div>`;
      }
    }
  };

  const handleSaveAndConfirm = () => {
    const snippet = generateSnippet();
    onConfirm(snippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[var(--bg-card)] rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-amber-500/40 shadow-2xl space-y-5 my-auto animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              {blockType === 'video' && <Video className="w-5 h-5 text-rose-500" />}
              {blockType === 'image' && <ImageIcon className="w-5 h-5 text-emerald-500" />}
              {blockType === 'scripture' && <BookOpen className="w-5 h-5 text-amber-500" />}
              {blockType === 'audio' && <Headphones className="w-5 h-5 text-indigo-500" />}
              {blockType === 'callout' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {blockType === 'prayer' && <Heart className="w-5 h-5 text-purple-500" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                <span>
                  {mode === 'edit' ? 'Chỉnh Sửa Thông Số Khối' : 'Cấu Hình & Chèn Khối Riêng'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold uppercase">
                  {blockType.toUpperCase()}
                </span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Tùy chỉnh thông số nguồn, chú thích và xem trước trước khi chèn vào bài viết
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY BY BLOCK TYPE */}
        <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">

          {/* 🎬 1. VIDEO CONFIGURATION */}
          {blockType === 'video' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[var(--text-muted)]">
                    Link Nguồn Video <span className="text-red-500">*</span>
                  </label>
                  {parsedVideo.platform !== 'unknown' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      ✓ Đã nhận diện: {parsedVideo.platform.toUpperCase()} {parsedVideo.isShorts ? '(Shorts/Reels)' : ''}
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... hoặc Facebook, Google Drive, Vimeo..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-rose-500 text-[var(--text-main)] transition"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Hỗ trợ: YouTube (thường + Shorts), Facebook Video / Reels, Google Drive Video, Vimeo, hoặc file .mp4.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Tỷ Lệ Khung Hình Video
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoAspectRatio('16:9')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        videoAspectRatio === '16:9'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                          : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-rose-500/40'
                      }`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Ngang 16:9</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoAspectRatio('9:16')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        videoAspectRatio === '9:16'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                          : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-rose-500/40'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Dọc 9:16</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Chú Thích / Nguồn Video (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    placeholder="Ví dụ: Nguồn: Vatican News / Kênh Phụng Vụ..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Live Video Preview Box */}
              <div className="p-3.5 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                  Xem Trước Khung Video:
                </span>
                {parsedVideo.embedUrl ? (
                  <div className={`${videoAspectRatio === '9:16' || parsedVideo.isShorts ? 'aspect-[9/16] max-w-[200px] mx-auto' : 'aspect-video w-full'} rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800`}>
                    {parsedVideo.platform === 'direct' ? (
                      <video src={parsedVideo.embedUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <iframe src={parsedVideo.embedUrl} className="w-full h-full border-none" title="Live Preview" allowFullScreen />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-[var(--text-muted)] gap-1">
                    <Video className="w-6 h-6 opacity-40" />
                    <span>Dán link video ở trên để xem trước trực tiếp</span>
                  </div>
                )}
                {videoCaption && (
                  <p className="text-[11px] italic text-center text-[var(--text-muted)] font-serif pt-1">
                    {videoCaption}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 🖼️ 2. IMAGE CONFIGURATION */}
          {blockType === 'image' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Đường Dẫn Hình Ảnh (Google Drive / Direct URL / Unsplash) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... hoặc link ảnh bất kỳ"
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-emerald-500 text-[var(--text-main)]"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                  Link Google Drive sẽ tự động được hệ thống chuyển đổi thành link ảnh tốc độ cao <code className="text-emerald-500 font-mono">lh3.googleusercontent.com</code>.
                </p>
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Chú Thích Chân Ảnh (Caption)
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Ví dụ: Bích họa Thánh Gioan Tẩy Giả trong sa mạc..."
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Căn Chỉnh Vị Trí
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageAlign('center')}
                      className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        imageAlign === 'center' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                      }`}
                    >
                      <AlignCenter className="w-3 h-3" /> Giữa
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageAlign('left')}
                      className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        imageAlign === 'left' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                      }`}
                    >
                      <AlignLeft className="w-3 h-3" /> Trái
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageAlign('right')}
                      className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        imageAlign === 'right' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                      }`}
                    >
                      <AlignRight className="w-3 h-3" /> Phải
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="lightboxCheck"
                    checked={imageLightbox}
                    onChange={(e) => setImageLightbox(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="lightboxCheck" className="text-xs text-[var(--text-main)] cursor-pointer select-none">
                    Kích hoạt Lightbox (Nhấp vào ảnh để phóng to toàn màn hình)
                  </label>
                </div>
              </div>

              {/* Live Preview */}
              {resolvedImageUrl && (
                <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-2 text-left">
                    Xem Trước Ảnh:
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedImageUrl}
                    alt={imageCaption || 'Xem trước'}
                    referrerPolicy="no-referrer"
                    className="max-h-44 mx-auto rounded-xl shadow-lg object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* 📖 3. SCRIPTURE CONFIGURATION */}
          {blockType === 'scripture' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-amber-500 block mb-1">
                  Câu Lời Chúa Trích Dẫn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={scriptureQuote}
                  onChange={(e) => setScriptureQuote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Thưa Thầy, bỏ Thầy thì chúng con biết đến với ai? Thầy mới có những lời đem lại sự sống đời đời..."
                  className="w-full p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif italic text-base leading-relaxed outline-none focus:border-amber-500 text-[var(--text-main)] resize-y"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Tọa Độ Kinh Thánh (Sách Chương:Câu) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  placeholder="Ví dụ: Ga 6:68 hoặc Tv 119:105 hoặc Mt 5:3-12..."
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs font-bold text-amber-600 dark:text-amber-400 outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Hệ thống sẽ tự động gắn huy hiệu đối chiếu và liên kết trực tiếp vào Bản Dịch Phụng Vụ VERIDU.
                </p>
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                  Xem Trước Khối Lời Chúa:
                </span>
                <blockquote className="font-serif italic text-sm sm:text-base text-amber-950 dark:text-amber-100 m-0 leading-relaxed">
                  “{scriptureQuote || 'Câu trích Lời Chúa...'}”
                </blockquote>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                    <span>{scriptureRef || 'Tọa độ'}</span>
                    <span className="text-[10px] text-amber-500">↗</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 🎧 4. AUDIO PODCAST CONFIGURATION */}
          {blockType === 'audio' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Chọn Kiểu Khung Nghe Podcast
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAudioPlayerType('audio_mini')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      audioPlayerType === 'audio_mini'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                        : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Headphones className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-bold">Mini Player</div>
                      <div className="text-[10px] opacity-75">Thanh gọn ở đầu bài</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioPlayerType('audio_full')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      audioPlayerType === 'audio_full'
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400'
                        : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-bold">Full Podcast Player</div>
                      <div className="text-[10px] opacity-75">Khung lớn kèm mô tả & số tập</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Đường Dẫn File Âm Thanh (MP3 / Google Drive / URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://.../podcast.mp3 hoặc link Google Drive..."
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-amber-500 text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Tiêu Đề Khung Audio
                  </label>
                  <input
                    type="text"
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    placeholder="BẢN NGHE AUDIO PODCAST HỌC THUẬT"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Huy Hiệu / Thời Lượng
                  </label>
                  <input
                    type="text"
                    value={audioBadge}
                    onChange={(e) => setAudioBadge(e.target.value)}
                    placeholder="Thời lượng: 12 phút hoặc Ep #01"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {audioPlayerType === 'audio_full' && (
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Mô Tả Chuyên Đề Podcast
                  </label>
                  <textarea
                    value={audioDesc}
                    onChange={(e) => setAudioDesc(e.target.value)}
                    rows={2}
                    placeholder="Lắng nghe bản đọc diễn cảm học thuật và đối thoại sâu sắc về chủ đề này..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-indigo-500 resize-y"
                  />
                </div>
              )}
            </div>
          )}

          {/* ⭐ 5. CALLOUT CONFIGURATION */}
          {blockType === 'callout' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Cấp Độ &amp; Sắc Màu Khối Lưu Ý
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCalloutLevel('note');
                      setCalloutTitle('ℹ️ LƯU Ý THẦN HỌC');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      calloutLevel === 'note' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    Lưu Ý (Lam)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalloutLevel('tip');
                      setCalloutTitle('💡 MẸO SUY NIỆM');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      calloutLevel === 'tip' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    Mẹo (Lục)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalloutLevel('important');
                      setCalloutTitle('⭐ QUAN TRỌNG: TÍN LÝ HỘI THÁNH');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      calloutLevel === 'important' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    Quan Trọng (Vàng)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalloutLevel('warning');
                      setCalloutTitle('⚠️ CẢNH BÁO TÍN LÝ');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      calloutLevel === 'warning' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    Cảnh Báo (Đỏ)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Tiêu Đề Hộp Nhấn Mạnh
                </label>
                <input
                  type="text"
                  value={calloutTitle}
                  onChange={(e) => setCalloutTitle(e.target.value)}
                  placeholder="Tiêu đề hộp lưu ý..."
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Nội Dung Chi Tiết
                </label>
                <textarea
                  value={calloutContent}
                  onChange={(e) => setCalloutContent(e.target.value)}
                  rows={3}
                  placeholder="Nhập nội dung lưu ý hoặc trích đoạn văn kiện Công đồng..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif leading-relaxed outline-none focus:border-amber-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* 🕊️ 6. PRAYER & POETRY CONFIGURATION */}
          {blockType === 'prayer' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Hình Thức
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrayerStyle('prayer')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      prayerStyle === 'prayer' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>🕊️ Lời Nguyện Kính</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrayerStyle('poetry')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      prayerStyle === 'poetry' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>📜 Thơ Phụng Vụ (Nhiều Câu)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Tiêu Đề Khối
                </label>
                <input
                  type="text"
                  value={prayerTitle}
                  onChange={(e) => setPrayerTitle(e.target.value)}
                  placeholder="🕊️ LỜI NGUYỆN KÍNH PHỤNG VỤ"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  {prayerStyle === 'poetry' ? 'Các Câu Thơ (Mỗi dòng một câu thơ)' : 'Lời Cầu Nguyện Sốt Mến'}
                </label>
                <textarea
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  rows={4}
                  placeholder={prayerStyle === 'poetry' ? "Về đây bên Mẹ La Vang\nNghe câu kinh nguyện dịu dàng trong sương..." : "Lạy Chúa Giêsu, xin lắng nghe lời chúng con nguyện cầu..."}
                  className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif italic text-sm leading-relaxed outline-none focus:border-purple-500 resize-y text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Lời Đáp Kết Thúc
                </label>
                <input
                  type="text"
                  value={prayerAmen}
                  onChange={(e) => setPrayerAmen(e.target.value)}
                  placeholder="Amen."
                  className="w-32 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-serif font-bold text-xs text-amber-500 outline-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* ACTIONS FOOTER */}
        <div className="flex items-center justify-between border-t border-[var(--border-card)] pt-3">
          {onInsertDefault && mode === 'insert' ? (
            <button
              type="button"
              onClick={() => {
                onInsertDefault();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 border border-[var(--border-card)] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chèn Mẫu Mặc Định</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-bold transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveAndConfirm}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{mode === 'edit' ? 'Cập Nhật Khối' : 'Lưu & Chèn Khối'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
