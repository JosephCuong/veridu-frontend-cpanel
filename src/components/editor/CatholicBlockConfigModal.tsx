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
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Smartphone,
  Columns,
  Grid,
  ShieldCheck,
  Globe,
  FileCheck,
  HelpCircle,
  MapPin,
  Clock,
  Compass,
  Library
} from 'lucide-react';
import { parseVideoUrl, generateVideoBlockHtml } from '@/lib/videoHelper';
import { 
  FlexboxLayout, 
  FlexboxBgStyle, 
  FlexboxGap, 
  compileFlexboxContainerHtml, 
  getBgStyleClass, 
  getLayoutGridClass 
} from './VeriduFlexboxContainer';

export type ConfigurableBlockType = 'video' | 'image' | 'scripture' | 'audio' | 'callout' | 'prayer' | 'container' | 'term' | 'placeholders' | 'scholarly_end';

export interface CatholicBlockConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockType: ConfigurableBlockType;
  initialData?: Record<string, any>;
  mode?: 'insert' | 'edit';
  onConfirm: (htmlSnippet: string) => void;
  onInsertDefault?: () => void;
}

export const LICENSE_PRESETS = [
  { label: 'Phạm vi công cộng (Public Domain / Hết bản quyền)', value: 'Public Domain', url: 'https://creativecommons.org/publicdomain/mark/1.0/' },
  { label: 'CC0 1.0 (Hiến tặng cộng đồng)', value: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { label: 'CC BY 4.0 (Ghi nhận công tác giả)', value: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  { label: 'CC BY-SA 4.0 (Ghi công - Chia sẻ tương tự)', value: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { label: 'CC BY-NC 4.0 (Ghi công - Phi thương mại)', value: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { label: 'CC BY-NC-SA 4.0 (Phi thương mại - Chia sẻ tương tự)', value: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
  { label: 'Bản quyền tác giả / Có phép sử dụng', value: 'Copyrighted / Có phép', url: '' },
  { label: 'Tùy chỉnh khác...', value: 'custom', url: '' },
];

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
  const [videoAuthor, setVideoAuthor] = useState('');
  const [videoSourceUrl, setVideoSourceUrl] = useState('');
  const [videoLicense, setVideoLicense] = useState('');
  const [videoLicenseUrl, setVideoLicenseUrl] = useState('');

  // ─── 2. IMAGE STATE ──────────────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageLightbox, setImageLightbox] = useState(true);
  const [imageAuthor, setImageAuthor] = useState('');
  const [imageSourceUrl, setImageSourceUrl] = useState('');
  const [imageLicense, setImageLicense] = useState('Public Domain');
  const [imageLicenseUrl, setImageLicenseUrl] = useState('https://creativecommons.org/publicdomain/mark/1.0/');

  // ─── 3. SCRIPTURE STATE ──────────────────────────────────────────────────────
  const [scriptureQuote, setScriptureQuote] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');

  // ─── 4. AUDIO STATE ──────────────────────────────────────────────────────────
  const [audioPlayerType, setAudioPlayerType] = useState<'audio_mini' | 'audio_full'>('audio_mini');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioBadge, setAudioBadge] = useState('');
  const [audioDesc, setAudioDesc] = useState('');
  const [audioAuthor, setAudioAuthor] = useState('');
  const [audioSourceUrl, setAudioSourceUrl] = useState('');
  const [audioLicense, setAudioLicense] = useState('');

  // ─── 5. CALLOUT STATE ────────────────────────────────────────────────────────
  const [calloutLevel, setCalloutLevel] = useState<'note' | 'tip' | 'important' | 'warning'>('important');
  const [calloutTitle, setCalloutTitle] = useState('');
  const [calloutContent, setCalloutContent] = useState('');

  // ─── 6. PRAYER STATE ─────────────────────────────────────────────────────────
  const [prayerStyle, setPrayerStyle] = useState<'prayer' | 'poetry'>('prayer');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [prayerAmen, setPrayerAmen] = useState('Amen.');

  // ─── 7. CONTAINER (FLEXBOX / SECTION) STATE ──────────────────────────────────
  const [containerLayout, setContainerLayout] = useState<FlexboxLayout>('2-col-equal');
  const [containerBgStyle, setContainerBgStyle] = useState<FlexboxBgStyle>('amber-glass');
  const [containerGap, setContainerGap] = useState<FlexboxGap>('md');
  const [containerTitle, setContainerTitle] = useState('');

  // ─── 8. TERM STATE ───────────────────────────────────────────────────────────
  const [termWord, setTermWord] = useState('Shekinah');
  const [termBase, setTermBase] = useState('Shekinah');
  const [termDefinition, setTermDefinition] = useState('Vinh quang Thiên Chúa ngự giữa dân Người dưới dạng đám mây phát sáng.');

  // ─── 9. PLACEHOLDERS STATE ───────────────────────────────────────────────────
  const [placeholderKind, setPlaceholderKind] = useState<'timeline' | 'map'>('timeline');

  // ─── 10. SCHOLARLY END BLOCKS STATE ──────────────────────────────────────────
  const [scholarlyEndKind, setScholarlyEndKind] = useState<'all_four' | 'footnotes' | 'scripture_meta' | 'dictionary_meta' | 'bibliography'>('all_four');

  // Initialize or prefill state whenever modal opens or blockType changes
  useEffect(() => {
    if (!isOpen) return;

    if (blockType === 'video') {
      setVideoUrl(initialData?.videoUrl || initialData?.url || '');
      setVideoCaption(initialData?.caption || initialData?.videoCaption || '');
      setVideoAspectRatio(initialData?.aspectRatio || '16:9');
      setVideoAuthor(initialData?.author || '');
      setVideoSourceUrl(initialData?.sourceUrl || '');
      setVideoLicense(initialData?.license || '');
      setVideoLicenseUrl(initialData?.licenseUrl || '');
    } else if (blockType === 'image') {
      setImageUrl(initialData?.imageUrl || initialData?.url || 'https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80');
      setImageCaption(initialData?.caption || 'Bích họa Nghệ Thuật Thánh Đường Công Giáo — Kiệt tác nghệ thuật phụng vụ.');
      setImageAlign(initialData?.align || 'center');
      setImageLightbox(initialData?.lightbox !== false);
      setImageAuthor(initialData?.author || '');
      setImageSourceUrl(initialData?.sourceUrl || '');
      setImageLicense(initialData?.license || 'Public Domain');
      setImageLicenseUrl(initialData?.licenseUrl || 'https://creativecommons.org/publicdomain/mark/1.0/');
    } else if (blockType === 'scripture') {
      setScriptureQuote(initialData?.quote || initialData?.scriptureQuote || 'Ngài phải nổi bật lên, còn tôi phải lu mờ đi.');
      setScriptureRef(initialData?.rawRef || initialData?.scriptureRef || 'Ga 3:30');
    } else if (blockType === 'audio') {
      setAudioPlayerType(initialData?.playerType || 'audio_mini');
      setAudioUrl(initialData?.audioUrl || initialData?.url || '');
      setAudioTitle(initialData?.title || (initialData?.playerType === 'audio_full' ? 'PODCAST HỌC THUẬT: CHUYÊN ĐỀ PHỤNG VỤ' : 'BẢN NGHE AUDIO PODCAST HỌC THUẬT'));
      setAudioBadge(initialData?.badge || (initialData?.playerType === 'audio_full' ? 'Ep #01 • 15:00 • VERIDU Audio' : 'Thời lượng: 12 phút'));
      setAudioDesc(initialData?.desc || 'Lắng nghe bản đọc diễn cảm học thuật và đối thoại sâu sắc về chủ đề này cùng Ban Biên Tập VERIDU.');
      setAudioAuthor(initialData?.author || '');
      setAudioSourceUrl(initialData?.sourceUrl || '');
      setAudioLicense(initialData?.license || '');
    } else if (blockType === 'callout') {
      setCalloutLevel(initialData?.level || 'important');
      setCalloutTitle(initialData?.title || '⭐ QUAN TRỌNG: TÍN LÝ HỘI THÁNH');
      setCalloutContent(initialData?.content || 'Tín điều về Bí tích Thánh Thể là trung tâm và tột đỉnh của toàn bộ đời sống Kitô hữu (Lumen Gentium, 11).');
    } else if (blockType === 'prayer') {
      setPrayerStyle(initialData?.style || 'prayer');
      setPrayerTitle(initialData?.title || '🕊️ LỜI NGUYỆN KÍNH PHỤNG VỤ');
      setPrayerText(initialData?.text || 'Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...');
      setPrayerAmen(initialData?.amen || 'Amen.');
    } else if (blockType === 'container') {
      setContainerLayout(initialData?.layout || '2-col-equal');
      setContainerBgStyle(initialData?.bgStyle || 'amber-glass');
      setContainerGap(initialData?.gap || 'md');
      setContainerTitle(initialData?.title || '');
    } else if (blockType === 'term') {
      setTermWord(initialData?.term || initialData?.word || 'Shekinah');
      setTermBase(initialData?.base || 'Shekinah');
      setTermDefinition(initialData?.title || initialData?.definition || 'Vinh quang Thiên Chúa ngự giữa dân Người dưới dạng đám mây phát sáng.');
    } else if (blockType === 'placeholders') {
      setPlaceholderKind(initialData?.kind || 'timeline');
    } else if (blockType === 'scholarly_end') {
      setScholarlyEndKind(initialData?.kind || 'all_four');
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
          aspectRatio: videoAspectRatio,
          author: videoAuthor.trim(),
          sourceUrl: videoSourceUrl.trim(),
          license: videoLicense.trim(),
          licenseUrl: videoLicenseUrl.trim()
        });
      }

      case 'image': {
        const finalUrl = resolvedImageUrl || 'https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80';
        let alignClass = 'mx-auto block text-center';
        if (imageAlign === 'left') alignClass = 'float-left mr-6 mb-4 max-w-sm';
        if (imageAlign === 'right') alignClass = 'float-right ml-6 mb-4 max-w-sm';

        const hasAttribution = Boolean(imageAuthor.trim() || imageSourceUrl.trim() || (imageLicense.trim() && imageLicense !== 'none'));
        let captionHtml = '';

        if (imageCaption.trim() || hasAttribution) {
          captionHtml = `<figcaption class="mt-3 text-center text-xs font-serif text-[var(--text-muted)] space-y-1.5 max-w-xl mx-auto">
  ${imageCaption.trim() ? `<span class="block text-slate-300 font-medium italic">${imageCaption.trim()}</span>` : ''}
  ${hasAttribution ? `<span class="inline-flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)] opacity-85">
    ${imageAuthor.trim() ? `<span>Tác giả / Nghệ sĩ: <strong class="text-amber-500/90 font-semibold">${imageAuthor.trim()}</strong></span>` : ''}
    ${imageAuthor.trim() && ((imageLicense.trim() && imageLicense !== 'none') || imageSourceUrl.trim()) ? `<span>•</span>` : ''}
    ${imageLicense.trim() && imageLicense !== 'none' ? `<a href="${imageLicenseUrl.trim() || '#'}" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">${imageLicense.trim()}</a>` : ''}
    ${(imageLicense.trim() && imageLicense !== 'none') && imageSourceUrl.trim() ? `<span>•</span>` : ''}
    ${imageSourceUrl.trim() ? `<a href="${imageSourceUrl.trim()}" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 inline-flex items-center gap-0.5 text-slate-400 hover:underline"><span>Nguồn gốc ảnh</span><span class="text-[10px]">↗</span></a>` : ''}
  </span>` : ''}
</figcaption>`;
        }

        return `<figure class="veridu-image-block my-8 ${alignClass} not-prose" data-veridu-block="image" data-image-url="${encodeURIComponent(imageUrl)}" data-align="${imageAlign}" data-caption="${encodeURIComponent(imageCaption)}"${imageAuthor.trim() ? ` data-author="${encodeURIComponent(imageAuthor.trim())}"` : ''}${imageSourceUrl.trim() ? ` data-source-url="${encodeURIComponent(imageSourceUrl.trim())}"` : ''}${imageLicense.trim() ? ` data-license="${encodeURIComponent(imageLicense.trim())}"` : ''}${imageLicenseUrl.trim() ? ` data-license-url="${encodeURIComponent(imageLicenseUrl.trim())}"` : ''}>
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

      case 'container': {
        return compileFlexboxContainerHtml({
          layout: containerLayout,
          bgStyle: containerBgStyle,
          gap: containerGap,
          title: containerTitle.trim() || undefined
        });
      }

      case 'term': {
        const word = termWord.trim() || 'Thuật ngữ';
        const base = termBase.trim() || word;
        const def = termDefinition.trim();
        return `<dfn class="veridu-term" title="${def}" data-base="${base}">${word}</dfn>`;
      }

      case 'placeholders': {
        if (placeholderKind === 'timeline') {
          return `\n<veridu-timeline-placeholder></veridu-timeline-placeholder>\n`;
        }
        return `\n<veridu-map-placeholder></veridu-map-placeholder>\n`;
      }

      case 'scholarly_end': {
        const footnotesHtml = `<div class="veridu-footnotes not-prose my-12 pt-6 border-t-2 border-[var(--border-color)]" id="chu-thich">
  <h4 id="chu-thich" class="text-sm font-bold uppercase tracking-wider text-amber-500 font-serif mb-4 flex items-center gap-2">
    <span>📜</span> Chú Thích Học Thuật
  </h4>
  <ol class="space-y-3 font-serif text-sm list-none p-0 m-0">
    <li id="fn1" class="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-start justify-between gap-3">
      <div class="flex-1 leading-relaxed text-[var(--text-main)]">
        <span class="footnote-num font-mono font-bold text-amber-500 mr-2">[1]</span>
        <span>Flavius Josephus, <em>Jewish Antiquities</em>, VIII, 2-5 (Khảo cứu niên biểu các triều vua Israel).</span>
      </div>
      <a href="#ref1" class="footnote-backref text-amber-500 font-bold" title="Quay lại bài viết">↩</a>
    </li>
  </ol>
</div>`;

        const scriptureMetaHtml = `<div class="scripture-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose" id="tham-chieu">
  <h3 id="tham-chieu" class="text-sm font-bold uppercase tracking-wider text-amber-500 font-serif border-b border-[var(--border-card)] pb-3 flex items-center gap-2">
    <span>📖</span> Tham Chiếu Bản Văn Thánh Kinh Trọng Tâm
  </h3>
  <div class="space-y-3">
    <div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
      <span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Hòm Bia Giao Ước Mới:</span>
      <span class="verse-badge font-mono text-xs font-bold text-amber-500">Xh 40:34-35; Lc 1:35; Kh 11:19</span>
    </div>
    <div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
      <span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Đấng Trung Gian Duy Nhất:</span>
      <span class="verse-badge font-mono text-xs font-bold text-amber-500">1Tm 2:5; Dt 9:15</span>
    </div>
  </div>
</div>`;

        const dictionaryMetaHtml = `<div class="dictionary-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-2 not-prose" id="bang-thuat-ngu">
  <div class="dictionary-title text-sm font-bold uppercase tracking-wider text-indigo-400 font-serif border-b border-[var(--border-card)] pb-3 flex items-center gap-2" id="bang-thuat-ngu">
    <span>📚</span> TRA CỨU THUẬT NGỮ THẦN HỌC &amp; KHẢO CỔ HỌC
  </div>
  <div class="space-y-1">
    <div class="dictionary-entry py-3 border-b border-dashed border-[var(--border-card)]">
      <span class="term-keyword font-bold text-amber-500">Shekinah</span>
      <span class="term-lang italic text-[var(--text-muted)] text-xs">(Híp-ri: שכינה)</span>:
      <span class="term-definition text-[var(--text-main)] text-xs sm:text-sm leading-relaxed">
        Vinh quang Thiên Chúa ngự giữa dân Người dưới dạng đám mây phát sáng.
      </span>
    </div>
  </div>
</div>`;

        const bibliographyHtml = `<div class="bibliography my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-3 not-prose" id="thu-muc-tai-lieu">
  <h3 id="thu-muc-tai-lieu" class="text-sm font-bold uppercase tracking-wider text-amber-500 font-serif border-b border-[var(--border-card)] pb-3 flex items-center gap-2">
    <span>📚</span> Thư Mục Tài Liệu Tham Khảo Chuẩn Mực
  </h3>
  <div class="space-y-2 text-xs sm:text-sm font-serif leading-relaxed text-[var(--text-main)]">
    <p>Flavius Josephus. <em>Jewish Antiquities</em>. Translated by H. St. J. Thackeray. Loeb Classical Library. Cambridge: Harvard University Press, 1930.</p>
    <p>Lm. Nguyễn Thế Thuấn, C.Ss.R. <em>Kinh Thánh</em>. Dòng Chúa Cứu Thế Việt Nam, 1976.</p>
  </div>
</div>`;

        if (scholarlyEndKind === 'footnotes') return footnotesHtml;
        if (scholarlyEndKind === 'scripture_meta') return scriptureMetaHtml;
        if (scholarlyEndKind === 'dictionary_meta') return dictionaryMetaHtml;
        if (scholarlyEndKind === 'bibliography') return bibliographyHtml;

        return `\n${footnotesHtml}\n\n${scriptureMetaHtml}\n\n${dictionaryMetaHtml}\n\n${bibliographyHtml}\n`;
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
              {blockType === 'container' && <Columns className="w-5 h-5 text-cyan-400" />}
              {blockType === 'term' && <HelpCircle className="w-5 h-5 text-amber-500" />}
              {blockType === 'placeholders' && <Layers className="w-5 h-5 text-indigo-500" />}
              {blockType === 'scholarly_end' && <BookOpen className="w-5 h-5 text-amber-500" />}
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
                    Chú Thích Chân Video (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    placeholder="Ví dụ: Lễ Nghi Phụng Vụ tại Vương Cung Thánh Đường..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* 🛡️ Bản Quyền & Nguồn Gốc Video */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                    Bản Quyền & Kênh Phát Hành (Tùy chọn)
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Attribution & Source
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Kênh / Đạo Diễn / Nguồn Video
                    </label>
                    <input
                      type="text"
                      value={videoAuthor}
                      onChange={(e) => setVideoAuthor(e.target.value)}
                      placeholder="Ví dụ: Vatican News, HĐGM Việt Nam..."
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Link Nguồn Gốc Video (Trang chủ / Kênh)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={videoSourceUrl}
                        onChange={(e) => setVideoSourceUrl(e.target.value)}
                        placeholder="https://vaticannews.va/..."
                        className="w-full p-2.5 pr-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono outline-none focus:border-rose-500"
                      />
                      {videoSourceUrl && (
                        <a
                          href={videoSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                          title="Mở link nguồn"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Giấy Phép Bản Quyền Video
                    </label>
                    <select
                      value={LICENSE_PRESETS.some(p => p.value === videoLicense) ? videoLicense : (videoLicense ? 'custom' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setVideoLicense('Tùy chỉnh');
                        } else {
                          setVideoLicense(val);
                          const preset = LICENSE_PRESETS.find(p => p.value === val);
                          if (preset && preset.url) {
                            setVideoLicenseUrl(preset.url);
                          } else if (preset && !preset.url) {
                            setVideoLicenseUrl('');
                          }
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none focus:border-rose-500 text-[var(--text-main)] cursor-pointer"
                    >
                      <option value="">-- Không ghi giấy phép --</option>
                      {LICENSE_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Link Giấy Phép
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={videoLicenseUrl}
                        onChange={(e) => setVideoLicenseUrl(e.target.value)}
                        placeholder="https://creativecommons.org/..."
                        className="w-full p-2.5 pr-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono outline-none focus:border-rose-500"
                      />
                      {videoLicenseUrl && (
                        <a
                          href={videoLicenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                          title="Mở link giấy phép"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
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
                {(videoCaption || videoAuthor || videoLicense || videoSourceUrl) && (
                  <div className="text-[11px] text-center text-[var(--text-muted)] font-serif pt-1 space-y-1">
                    {videoCaption && <p className="italic text-slate-300 font-medium">{videoCaption}</p>}
                    {(videoAuthor || videoLicense || videoSourceUrl) && (
                      <div className="inline-flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)] opacity-85">
                        {videoAuthor && <span>Nguồn/Kênh: <strong className="text-amber-500 font-semibold">{videoAuthor}</strong></span>}
                        {videoAuthor && (videoLicense || videoSourceUrl) && <span>•</span>}
                        {videoLicense && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">{videoLicense}</span>
                        )}
                        {videoLicense && videoSourceUrl && <span>•</span>}
                        {videoSourceUrl && (
                          <span className="text-amber-500/80 underline inline-flex items-center gap-0.5">
                            <span>Nguồn gốc</span><span className="text-[10px]">↗</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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

              {/* 🛡️ Bản Quyền & Nguồn Gốc Ảnh */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    Bản Quyền & Nguồn Gốc Ảnh (Tùy chọn)
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Creative Commons / Nguồn mở
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Tác Giả / Nghệ Sĩ / Nhiếp Ảnh Gia
                    </label>
                    <input
                      type="text"
                      value={imageAuthor}
                      onChange={(e) => setImageAuthor(e.target.value)}
                      placeholder="Ví dụ: Fra Angelico, Leonardo da Vinci, Unsplash..."
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Link Trang Nguồn Gốc Ảnh
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={imageSourceUrl}
                        onChange={(e) => setImageSourceUrl(e.target.value)}
                        placeholder="https://commons.wikimedia.org/... hoặc Unsplash"
                        className="w-full p-2.5 pr-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono outline-none focus:border-amber-500"
                      />
                      {imageSourceUrl && (
                        <a
                          href={imageSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500"
                          title="Mở link nguồn"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Giấy Phép Bản Quyền (License)
                    </label>
                    <select
                      value={LICENSE_PRESETS.some(p => p.value === imageLicense) ? imageLicense : (imageLicense ? 'custom' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setImageLicense('Tùy chỉnh');
                        } else {
                          setImageLicense(val);
                          const preset = LICENSE_PRESETS.find(p => p.value === val);
                          if (preset && preset.url) {
                            setImageLicenseUrl(preset.url);
                          } else if (preset && !preset.url) {
                            setImageLicenseUrl('');
                          }
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500 text-[var(--text-main)] cursor-pointer"
                    >
                      <option value="">-- Không ghi giấy phép --</option>
                      {LICENSE_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Link Giấy Phép / Quy Định Sử Dụng
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={imageLicenseUrl}
                        onChange={(e) => setImageLicenseUrl(e.target.value)}
                        placeholder="https://creativecommons.org/..."
                        className="w-full p-2.5 pr-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-mono outline-none focus:border-amber-500"
                      />
                      {imageLicenseUrl && (
                        <a
                          href={imageLicenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500"
                          title="Mở link giấy phép"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              {resolvedImageUrl && (
                <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl text-center space-y-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block text-left">
                    Xem Trước Khối Ảnh:
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedImageUrl}
                    alt={imageCaption || 'Xem trước'}
                    referrerPolicy="no-referrer"
                    className="max-h-48 mx-auto rounded-2xl shadow-lg object-contain border border-[var(--border-card)]"
                  />
                  {(imageCaption || imageAuthor || imageLicense || imageSourceUrl) && (
                    <div className="pt-2 text-xs font-serif text-[var(--text-muted)] space-y-1 max-w-lg mx-auto">
                      {imageCaption && (
                        <p className="italic text-[var(--text-main)] font-medium">
                          {imageCaption}
                        </p>
                      )}
                      {(imageAuthor || imageLicense || imageSourceUrl) && (
                        <div className="inline-flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)] opacity-85">
                          {imageAuthor && (
                            <span>Tác giả / Nghệ sĩ: <strong className="text-amber-500 font-semibold">{imageAuthor}</strong></span>
                          )}
                          {imageAuthor && (imageLicense || imageSourceUrl) && <span>•</span>}
                          {imageLicense && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">
                              {imageLicense}
                            </span>
                          )}
                          {imageLicense && imageSourceUrl && <span>•</span>}
                          {imageSourceUrl && (
                            <span className="text-amber-500/80 underline inline-flex items-center gap-0.5">
                              <span>Nguồn gốc ảnh</span><span className="text-[10px]">↗</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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

          {/* 🔲 7. CONTAINER (FLEXBOX / SECTION) CONFIGURATION */}
          {blockType === 'container' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Bố Cục Phân Cột (Responsive Multi-Column Layout)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: '1-col', name: '1 Cột (Full Section)', desc: 'Khung đơn 1 cột' },
                    { id: '2-col-equal', name: '2 Cột Cân Đối (50 - 50)', desc: 'Đối chiếu song song' },
                    { id: '2-col-left-wide', name: '2 Cột (60 - 40)', desc: 'Nội dung + Cột phụ' },
                    { id: '2-col-right-wide', name: '2 Cột (40 - 60)', desc: 'Ảnh/Trích dẫn + Nội dung' },
                    { id: '3-col-equal', name: '3 Cột Đều (33 - 33 - 33)', desc: 'Bộ ba tín lý / 3 đức tin' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContainerLayout(item.id as FlexboxLayout)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        containerLayout === item.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Columns className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Phong Cách Nền Stained-Glass
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'amber-glass', name: 'Kính Hổ Phách', color: 'text-amber-400' },
                      { id: 'indigo-glass', name: 'Kính Lam Sẫm', color: 'text-indigo-400' },
                      { id: 'gold-card', name: 'Thẻ Viền Vàng', color: 'text-amber-300' },
                      { id: 'transparent', name: 'Trong Suốt', color: 'text-slate-300' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setContainerBgStyle(theme.id as FlexboxBgStyle)}
                        className={`p-2 rounded-xl border text-xs text-left transition cursor-pointer ${
                          containerBgStyle === theme.id
                            ? 'bg-amber-500/20 border-amber-500 font-bold text-[var(--text-main)]'
                            : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                        }`}
                      >
                        <span className={`block truncate ${theme.color}`}>{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Khoảng Cách Giữa Các Cột (Gap)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sm', name: 'Gọn (16px)' },
                      { id: 'md', name: 'Chuẩn (24px)' },
                      { id: 'lg', name: 'Rộng (32px)' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setContainerGap(g.id as FlexboxGap)}
                        className={`p-2 rounded-xl border text-xs text-center transition cursor-pointer ${
                          containerGap === g.id
                            ? 'bg-cyan-500/20 border-cyan-500 font-bold text-cyan-300'
                            : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)]'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  Tiêu Đề Vùng Chứa (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={containerTitle}
                  onChange={(e) => setContainerTitle(e.target.value)}
                  placeholder="Ví dụ: TỌA ĐỘ LỊCH SỬ & ĐỐI CHIẾU THẦN HỌC..."
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-cyan-500"
                />
              </div>

              {/* Wireframe Live Preview */}
              <div className="p-3.5 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Mô Hình Khung Cột Xem Trước (Wireframe):
                </span>
                <div className={`p-4 rounded-2xl border ${getBgStyleClass(containerBgStyle)}`}>
                  {containerTitle && (
                    <div className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider mb-3">
                      {containerTitle}
                    </div>
                  )}
                  <div className={`grid gap-2 ${getLayoutGridClass(containerLayout)}`}>
                    {containerLayout === '1-col' && (
                      <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                        Cột 1: Toàn Chiều Rộng (100%)
                      </div>
                    )}
                    {containerLayout === '2-col-equal' && (
                      <>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột 1 (50%)
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột 2 (50%)
                        </div>
                      </>
                    )}
                    {containerLayout === '2-col-left-wide' && (
                      <>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột Chính (60%)
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột Phụ (40%)
                        </div>
                      </>
                    )}
                    {containerLayout === '2-col-right-wide' && (
                      <>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột Phụ (40%)
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột Chính (60%)
                        </div>
                      </>
                    )}
                    {containerLayout === '3-col-equal' && (
                      <>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột 1 (33%)
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột 2 (33%)
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-cyan-500/40 text-center text-[10px] text-cyan-300 font-mono">
                          Cột 3 (33%)
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] italic">
                  * Trên điện thoại di động, các cột sẽ tự động xếp chồng (stacking) mượt mà để tránh tràn lề ngang.
                </p>
              </div>
            </div>
          )}

          {/* BLOCK TYPE: TERM */}
          {blockType === 'term' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold block mb-0.5">Thuật Ngữ Nội Dòng Chuẩn Bách Khoa (Inline Term Lookup)</strong>
                  Chèn thẻ <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-mono text-[11px]">&lt;dfn class="veridu-term"&gt;</code>. Khi độc giả trỏ chuột hoặc chạm vào từ, thẻ nổi Popover Glassmorphic viền vàng hổ phách sẽ hiện ra kèm định nghĩa và nút cuộn đến <code className="px-1 py-0.5 rounded bg-black/40 font-mono">#bang-thuat-ngu</code>.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-main)] mb-1 block">
                    Từ hiển thị trong bài viết <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={termWord}
                    onChange={(e) => setTermWord(e.target.value)}
                    placeholder="Ví dụ: Logos, Kerygma, Giao Ước Sinai..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-main)] mb-1 block">
                    Từ nguyên / Ngôn ngữ gốc (data-base)
                  </label>
                  <input
                    type="text"
                    value={termBase}
                    onChange={(e) => setTermBase(e.target.value)}
                    placeholder="Ví dụ: Hy Lạp: λόγος (Logos), Do Thái: בְּרִית (Berit)..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-main)] mb-1 block">
                    Định nghĩa học thuật / Ý nghĩa thần học (title) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={termDefinition}
                    onChange={(e) => setTermDefinition(e.target.value)}
                    placeholder="Nhập định nghĩa cô đọng, khúc chiết về mặt thần học và từ nguyên học..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500 transition resize-none"
                  />
                </div>

                {/* Preview Box */}
                <div className="pt-2 border-t border-[var(--border-card)]">
                  <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Xem trước hiển thị:
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                    <p className="text-sm leading-relaxed text-[var(--text-main)]">
                      Theo truyền thống Giáo Phụ, thần học về{' '}
                      <dfn
                        className="veridu-term font-semibold cursor-help"
                        title={termDefinition || 'Định nghĩa thuật ngữ...'}
                        data-base={termBase || 'Từ nguyên...'}
                      >
                        {termWord || 'Từ khóa'}
                      </dfn>{' '}
                      là chìa khóa nền tảng để thấu hiểu công cuộc Nhập Thể và Cứu Độ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK TYPE: PLACEHOLDERS */}
          {blockType === 'placeholders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300/90 leading-relaxed flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-300 font-semibold block mb-0.5">Điểm Neo Giữ Chỗ Tương Tác (Mounting Placeholders)</strong>
                  Các thẻ giữ chỗ đặc biệt cho hệ thống tự động render biểu đồ D3 Timeline hoặc Bản đồ Khảo cổ tương tác Leaflet tại đúng vị trí quy chuẩn học thuật.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlaceholderKind('timeline')}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    placeholderKind === 'timeline'
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-sm text-[var(--text-main)]">Trục Niên Biểu (Timeline)</span>
                    </div>
                    <code className="text-[11px] font-mono text-amber-300/90 block mb-2">&lt;veridu-timeline-placeholder&gt;</code>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Vị trí quy chuẩn: <strong>Ngay sau Audio Mini ở đầu bài</strong>, trước khi đi vào nội dung khảo cứu chi tiết.
                    </p>
                  </div>
                  {placeholderKind === 'timeline' && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                      <Check className="w-3.5 h-3.5" /> Đã chọn
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPlaceholderKind('map')}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    placeholderKind === 'map'
                      ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-cyan-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-sm text-[var(--text-main)]">Bản Đồ Khảo Cổ (Map)</span>
                    </div>
                    <code className="text-[11px] font-mono text-cyan-300/90 block mb-2">&lt;veridu-map-placeholder&gt;</code>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Vị trí quy chuẩn: <strong>Ở cuối bài viết</strong>, ngay trước 4 Khối Kết Thúc để độc giả tổng quan toàn cảnh địa lý.
                    </p>
                  </div>
                  {placeholderKind === 'map' && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                      <Check className="w-3.5 h-3.5" /> Đã chọn
                    </div>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-muted)]">
                💡 <span className="font-medium text-[var(--text-main)]">Lưu ý:</span> Khi hệ thống phát hiện các thẻ này trong bài viết, nó sẽ tự động lấy dữ liệu tọa độ hoặc các mốc lịch sử đã thiết lập trong tab <strong>Dữ Liệu Khảo Cổ & Niên Biểu</strong> để dựng bản đồ và trục thời gian trực quan.
              </div>
            </div>
          )}

          {/* BLOCK TYPE: SCHOLARLY END */}
          {blockType === 'scholarly_end' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                <Library className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold block mb-0.5">Bộ 4 Khối Kết Thúc Chuẩn Bách Khoa VERIDU</strong>
                  Được thiết kế theo cấu trúc chuyên san học thuật quốc tế với các định danh cố định để hỗ trợ điều hướng nội dòng mượt mà.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-main)] block">
                  Chọn phần kết thúc cần chèn:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'all_four', name: '🏛️ Trọn Bộ 4 Khối Học Thuật', desc: 'Chèn đầy đủ cả 4 phần kết thúc chuẩn quy cách' },
                    { id: 'footnotes', name: '1. Chú Thích Học Thuật', desc: 'Định danh neo #chu-thich (.veridu-footnotes)' },
                    { id: 'scripture_meta', name: '2. Tham Chiếu Thánh Kinh', desc: 'Định danh neo #tham-chieu (.scripture-meta)' },
                    { id: 'dictionary_meta', name: '3. Bảng Thuật Ngữ', desc: 'Định danh neo #bang-thuat-ngu (.dictionary-meta)' },
                    { id: 'bibliography', name: '4. Thư Mục Tài Liệu', desc: 'Định danh neo #thu-muc-tai-lieu (.bibliography)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setScholarlyEndKind(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        scholarlyEndKind === item.id
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                          : 'bg-[var(--bg-main)] border-[var(--border-card)] hover:border-amber-500/30'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[var(--text-main)] mb-0.5">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-[var(--border-card)] text-xs text-[var(--text-muted)] space-y-1">
                <div className="font-semibold text-[var(--text-main)]">📌 Các Anchor ID chuẩn mực được hỗ trợ:</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[11px] text-amber-300/80">
                  <div>• <code className="text-amber-200">#chu-thich</code></div>
                  <div>• <code className="text-amber-200">#tham-chieu</code></div>
                  <div>• <code className="text-amber-200">#bang-thuat-ngu</code></div>
                  <div>• <code className="text-amber-200">#thu-muc-tai-lieu</code></div>
                </div>
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
              <Layers className="w-3.5 h-3.5 text-amber-500" />
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
