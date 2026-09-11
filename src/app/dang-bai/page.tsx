'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, 
  FileCode, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  LayoutGrid, 
  Settings, 
  Edit3, 
  Save, 
  ArrowLeft,
  Layers,
  FileText,
  HelpCircle,
  Plus,
  Heading,
  Type,
  ImageIcon,
  Quote,
  AlertTriangle,
  Grid,
  Video,
  Table,
  ExternalLink,
  RefreshCw,
  Trash2,
  FileUp,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders,
  SlidersHorizontal,
  Code,
  Palette,
  Heart,
  ListChecks,
  Bookmark,
  Share2,
  Compass,
  MapPin,
  Clock,
  X,
  Headphones,
  Radio,
  Volume2
} from 'lucide-react';
import { getStoredUser, UserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { fetchArticleGeoAndTimeline, calculateReadingTime } from '@/lib/api';
import { 
  extractTitleFromHtml, 
  extractExcerptFromHtml, 
  extractFeaturedImageFromHtml, 
  formatImageUrl,
  normalizeAndSyncHtml,
  extractAudioUrlFromHtml,
  extractVideoUrlFromHtml,
  replaceAudioSrcInHtml
} from '@/lib/htmlProcessor';
import VisualArticleRenderer from '@/components/VisualArticleRenderer';
import FloatingFormatToolbar from '@/components/editor/FloatingFormatToolbar';
import CatholicBlockInserterModal from '@/components/editor/CatholicBlockInserterModal';
import ResourceSubmissionModal from '@/components/ResourceSubmissionModal';

function slugifyVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Initial template for new articles
const DEFAULT_INITIAL_CONTENT = `<p class="lead font-serif text-lg leading-relaxed text-[var(--text-main)]">
  Nhấp trực tiếp vào đây để bắt đầu soạn thảo bài viết. Bạn có thể bôi đen bất kỳ đoạn chữ nào để sử dụng <strong>Thanh Định Dạng Nổi</strong> hoặc mở <strong>Sổ Tay 8 Khối Chuẩn</strong> để chèn các khối phụng vụ.
</p>

<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="/kinh-thanh/tv/119" target="_blank" rel="noopener noreferrer" title="Tra cứu Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>Tv 119:105</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div>

<h2 id="dan-nhap-than-hoc" class="font-serif text-2xl font-bold text-amber-500 mt-8 mb-4">1. Dẫn Nhập Thần Học</h2>
<p class="font-serif text-base leading-relaxed text-[var(--text-main)] mb-4">
  Viết nội dung phân tích, luận giải tín lý hoặc suy niệm phụng vụ tại đây...
</p>`;

function DangBaiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [user, setUser] = useState<UserProfile | null>(null);

  // Post State
  const [postId, setPostId] = useState<number | null>(editId ? parseInt(editId, 10) : null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Thần Học');
  const [articleType, setArticleType] = useState('standard');
  const [featuredImage, setFeaturedImage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [readingTime, setReadingTime] = useState('5 phút');
  const [publishedDate, setPublishedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isReadingTimeManual, setIsReadingTimeManual] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>(editId ? '' : DEFAULT_INITIAL_CONTENT);
  const [existingStatus, setExistingStatus] = useState<string>('published');

  // Media (Audio Podcast & Video Embed) State
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [detectedLocalAudioPath, setDetectedLocalAudioPath] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'audio_mini' | 'audio_full' | 'video'>('audio_mini');
  const [mediaModalUrl, setMediaModalUrl] = useState('');
  const [mediaModalTitle, setMediaModalTitle] = useState('');
  const [mediaModalBadge, setMediaModalBadge] = useState('Thời lượng: 12 phút');
  const [mediaModalDesc, setMediaModalDesc] = useState('');

  // File Upload & Diagnostics Metadata State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [detectedFeatures, setDetectedFeatures] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // UI Studio Controls: 'visual' (Live Visual Canvas WYSIWYG) | 'code' (HTML Code Editor) | 'preview' (Reader View)
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  // Seamless Bi-directional Sync between Visual Canvas and Code Editor
  const switchTab = (newTab: 'visual' | 'code' | 'preview') => {
    if (activeTab === 'visual' && visualCanvasRef.current) {
      const currentCanvasHtml = visualCanvasRef.current.innerHTML;
      setContentHtml(currentCanvasHtml);
    } else if (activeTab === 'code' && visualCanvasRef.current) {
      visualCanvasRef.current.innerHTML = contentHtml;
    }
    setActiveTab(newTab);
  };

  // Studio 3-Column Panels State
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'blocks' | 'outline' | 'tools'>('blocks');
  const [mobileDrawer, setMobileDrawer] = useState<'left' | 'right' | null>(null);
  const [canvasDevice, setCanvasDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);

  // Dynamic Document Outline (Headings Extractor for Column 3)
  const documentHeadings = useMemo(() => {
    if (!contentHtml) return [];
    try {
      if (typeof window !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, 'text/html');
        const nodes = doc.querySelectorAll('h1, h2, h3, h4');
        const list: { level: number; text: string; id: string }[] = [];
        nodes.forEach((n, idx) => {
          const text = n.textContent?.trim() || '';
          if (text) {
            list.push({
              level: parseInt(n.tagName.substring(1), 10),
              text,
              id: n.id || `heading-node-${idx}`
            });
          }
        });
        return list;
      }
      return [];
    } catch {
      return [];
    }
  }, [contentHtml]);

  const scrollToHeading = (text: string) => {
    if (!visualCanvasRef.current) return;
    const all = visualCanvasRef.current.querySelectorAll('h1, h2, h3, h4');
    for (let i = 0; i < all.length; i++) {
      if (all[i].textContent?.trim() === text) {
        all[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        all[i].classList.add('ring-2', 'ring-amber-500', 'rounded-lg');
        setTimeout(() => {
          all[i].classList.remove('ring-2', 'ring-amber-500', 'rounded-lg');
        }, 1500);
        break;
      }
    }
  };
  
  // Submission & Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Modals
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualCanvasRef = useRef<HTMLDivElement>(null);
  const isUpdatingDomFromState = useRef(false);

  // Geo & Timeline Attachment State
  const [showGeoTimelineSection, setShowGeoTimelineSection] = useState(false);
  const [geoTimelineJson, setGeoTimelineJson] = useState('');
  const [geoTimelineStatus, setGeoTimelineStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const locFileInputRef = useRef<HTMLInputElement>(null);
  const timelineFileInputRef = useRef<HTMLInputElement>(null);
  const [geoViewMode, setGeoViewMode] = useState<'cards' | 'json'>('cards');
  const [isGeoDragging, setIsGeoDragging] = useState(false);

  // Check auth
  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    if (!editId && u) {
      const defaultName = u.fullName || u.displayName || (u.christianName ? `${u.christianName} ${u.displayName}` : '') || '';
      if (defaultName) {
        setAuthorName(defaultName);
      }
    }
  }, [editId]);

  // Live auto-calculate reading time from content if not manually overridden
  useEffect(() => {
    if (!isReadingTimeManual && contentHtml) {
      setReadingTime(calculateReadingTime(contentHtml));
    }
  }, [contentHtml, isReadingTimeManual]);

  // Fetch post for edit mode if editId exists
  useEffect(() => {
    if (!editId) return;
    setIsLoadingPost(true);
    fetch(`/api/posts/get?id=${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          const p = data.post;
          setPostId(p.id);
          setTitle(p.title || '');
          setSlug(p.slug || '');
          setExcerpt(p.excerpt || '');
          setCategory(p.category || 'Thần Học');
          setArticleType(p.article_type === 'interactive' ? 'interactive' : 'standard');
          setFeaturedImage(p.featured_image || '');
          setAuthorName(p.author_name || 'Ban Biên Tập VERIDU');
          const html = p.content || '';
          setContentHtml(html);
          setExistingStatus(p.status || 'published');
          setAudioUrl(p.audio_url || '');
          setVideoUrl(p.video_url || '');

          // Check if article content has local audio path
          const localAudioMatch = html.match(/<(?:source|audio)\s+[^>]*?src=["'](audio\/[^"']+)["']/i);
          if (localAudioMatch && localAudioMatch[1]) {
            setDetectedLocalAudioPath(localAudioMatch[1]);
          }

          const rTime = p.reading_time || calculateReadingTime(html);
          setReadingTime(rTime);
          setIsReadingTimeManual(!!p.reading_time);
          if (p.published_at || p.created_at) {
            const d = new Date(p.published_at || p.created_at);
            if (!isNaN(d.getTime())) {
              setPublishedDate(d.toISOString().split('T')[0]);
            }
          }

          // Sync into DOM if visual editor is mounted
          if (visualCanvasRef.current) {
            visualCanvasRef.current.innerHTML = html;
          }

          // Fetch existing attached geo & timeline if slug exists
          if (p.slug) {
            fetchArticleGeoAndTimeline(p.slug).then((res) => {
              if (res && (res.locations.length > 0 || res.timelineEvents.length > 0)) {
                const existingData = {
                  locations: res.locations,
                  timeline_events: res.timelineEvents
                };
                const jsonStr = JSON.stringify(existingData, null, 2);
                setGeoTimelineJson(jsonStr);
                setShowGeoTimelineSection(true);
                setGeoTimelineStatus({ 
                  valid: true, 
                  message: `Đã nạp ${res.locations.length} địa danh và ${res.timelineEvents.length} mốc thời gian đã gắn với bài viết này.` 
                });
              }
            }).catch(() => {});
          }

          setMessage({ type: 'success', text: `Đang chỉnh sửa bài viết #${p.id}: "${p.title}"` });
        } else {
          setMessage({ type: 'error', text: 'Không tìm thấy bài viết cần chỉnh sửa.' });
        }
      })
      .catch((err) => {
        console.error('Error fetching post for edit:', err);
        setMessage({ type: 'error', text: 'Không thể nạp bài viết để chỉnh sửa.' });
      })
      .finally(() => setIsLoadingPost(false));
  }, [editId]);

  // Sync contentHtml to visual canvas when switching tabs or when contentHtml changes externally
  useEffect(() => {
    if (activeTab === 'visual' && visualCanvasRef.current) {
      if (visualCanvasRef.current.innerHTML !== contentHtml && !isUpdatingDomFromState.current) {
        visualCanvasRef.current.innerHTML = contentHtml || '';
      }
    }
  }, [activeTab, contentHtml]);

  // Sync DOM changes back to contentHtml state
  const handleCanvasInput = useCallback(() => {
    if (visualCanvasRef.current) {
      isUpdatingDomFromState.current = true;
      const currentInnerHtml = visualCanvasRef.current.innerHTML;
      setContentHtml(currentInnerHtml);
      setTimeout(() => {
        isUpdatingDomFromState.current = false;
      }, 50);
    }
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugifyVietnamese(title)) {
      setSlug(slugifyVietnamese(val));
    }
  };

  // Geo & Timeline Helpers - Smart Normalizer & Additive Merger
  const smartNormalizeAndMergeGeoTimeline = (
    newPayload: any,
    currentJsonStr: string = '',
    forceType?: 'locations' | 'timeline'
  ): { normalizedJson: string; status: { valid: boolean; message: string } } => {
    let existingLocs: any[] = [];
    let existingEvts: any[] = [];

    if (currentJsonStr && currentJsonStr.trim()) {
      try {
        const cur = JSON.parse(currentJsonStr);
        if (Array.isArray(cur)) {
          if (cur.some(i => i && (i.latitude !== undefined || i.lat !== undefined))) {
            existingLocs = cur;
          } else {
            existingEvts = cur;
          }
        } else if (typeof cur === 'object' && cur !== null) {
          if (Array.isArray(cur.locations)) existingLocs = cur.locations;
          if (Array.isArray(cur.timeline_events)) existingEvts = cur.timeline_events;
          else if (Array.isArray(cur.events)) existingEvts = cur.events;
        }
      } catch {}
    }

    let incomingLocs: any[] = [];
    let incomingEvts: any[] = [];

    let parsed = newPayload;
    if (typeof newPayload === 'string') {
      const trimmed = newPayload.trim();
      if (!trimmed) {
        return {
          normalizedJson: '',
          status: { valid: true, message: 'Dữ liệu trống.' }
        };
      }
      try {
        parsed = JSON.parse(trimmed);
      } catch (err: any) {
        // Attempt fixing accidental concatenation of two JSONs e.g. [...] \n [...]
        const fixedStr = trimmed.replace(/\]\s*\[/g, '],[');
        try {
          const wrap = JSON.parse(`[${fixedStr}]`);
          if (Array.isArray(wrap) && wrap.length >= 2) {
            parsed = wrap;
          }
        } catch {
          return {
            normalizedJson: trimmed,
            status: { valid: false, message: `Lỗi cú pháp JSON: ${err.message}` }
          };
        }
      }
    }

    if (Array.isArray(parsed)) {
      if (forceType === 'locations') {
        incomingLocs = parsed;
      } else if (forceType === 'timeline') {
        incomingEvts = parsed;
      } else if (parsed.length > 0 && Array.isArray(parsed[0])) {
        for (const sub of parsed) {
          if (Array.isArray(sub) && sub.length > 0) {
            if (sub.some((i: any) => i && (i.latitude !== undefined || i.lat !== undefined))) {
              incomingLocs.push(...sub);
            } else {
              incomingEvts.push(...sub);
            }
          }
        }
      } else {
        const isLoc = parsed.some((i: any) => i && (i.latitude !== undefined || i.lat !== undefined));
        const isEvt = parsed.some((i: any) => i && (i.year_bce_ce !== undefined || i.order_year !== undefined || i.event_title !== undefined || i.period !== undefined));
        if (isLoc && !isEvt) {
          incomingLocs = parsed;
        } else if (isEvt) {
          incomingEvts = parsed;
        } else {
          incomingLocs = parsed;
        }
      }
    } else if (parsed && typeof parsed === 'object') {
      // Support standard GeoJSON FeatureCollection
      if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
        incomingLocs = parsed.features.map((f: any) => {
          const coords = f.geometry?.coordinates;
          const lng = Array.isArray(coords) ? coords[0] : (f.longitude ?? f.lng);
          const lat = Array.isArray(coords) ? coords[1] : (f.latitude ?? f.lat);
          const props = f.properties || {};
          return {
            name: props.name || props.title || 'Địa danh khảo cổ',
            ancient_name: props.ancient_name || props.name_original || '',
            latitude: Number(lat),
            longitude: Number(lng),
            description: props.description || props.summary || '',
            scripture_or_history: props.scripture_or_history || props.biblical_references || props.bible_references || '',
            historical_period: props.historical_period || props.period || props.era || ''
          };
        }).filter((l: any) => !isNaN(l.latitude) && !isNaN(l.longitude));
      } else {
        if (Array.isArray(parsed.locations)) incomingLocs = parsed.locations;
        else if (Array.isArray(parsed.places)) incomingLocs = parsed.places;
        else if (Array.isArray(parsed.map_locations)) incomingLocs = parsed.map_locations;

        if (Array.isArray(parsed.timeline_events)) incomingEvts = parsed.timeline_events;
        else if (Array.isArray(parsed.events)) incomingEvts = parsed.events;
        else if (Array.isArray(parsed.timeline)) incomingEvts = parsed.timeline;
      }
    }

    // Merge locations
    const sourceLocs = incomingLocs.length > 0 ? incomingLocs : existingLocs;
    const finalLocsMap = new Map<string, any>();
    if (incomingLocs.length > 0 && existingLocs.length > 0) {
      existingLocs.forEach(l => {
        const key = (l.name || l.title || '').trim().toLowerCase();
        if (key) finalLocsMap.set(key, l);
      });
    }
    sourceLocs.forEach(raw => {
      if (!raw) return;
      const lat = Number(raw.latitude ?? raw.lat);
      const lng = Number(raw.longitude ?? raw.lng ?? raw.lon);
      if (isNaN(lat) || isNaN(lng)) return;
      const name = (raw.name || raw.title || 'Địa danh').trim();
      const normLoc = {
        name,
        latitude: lat,
        longitude: lng,
        description: raw.description || raw.summary || '',
        scripture_or_history: raw.scripture_or_history || (Array.isArray(raw.biblical_references) ? raw.biblical_references.join(', ') : (raw.biblical_references || '')),
        ancient_name: raw.ancient_name || raw.name_original || '',
        historical_period: raw.historical_period || raw.period || raw.era || ''
      };
      finalLocsMap.set(name.toLowerCase(), normLoc);
    });
    const finalLocs = Array.from(finalLocsMap.values());

    // Merge timeline events
    const sourceEvts = incomingEvts.length > 0 ? incomingEvts : existingEvts;
    const finalEvtsMap = new Map<string, any>();
    if (incomingEvts.length > 0 && existingEvts.length > 0) {
      existingEvts.forEach(e => {
        const key = `${e.year_bce_ce ?? e.order_year}_${(e.event_title || e.title || '').trim().toLowerCase()}`;
        finalEvtsMap.set(key, e);
      });
    }
    sourceEvts.forEach(raw => {
      if (!raw) return;
      const yr = typeof raw.year_bce_ce === 'number' ? raw.year_bce_ce : typeof raw.order_year === 'number' ? raw.order_year : typeof raw.year === 'number' ? raw.year : 0;
      const title = (raw.event_title || raw.title || 'Sự kiện').trim();
      const normEvt = {
        year_bce_ce: yr,
        event_title: title,
        period: raw.period || raw.era_name || '',
        display_date: raw.display_date || raw.year_label || (yr < 0 ? `${Math.abs(yr)} TCN` : `${yr} SCN`),
        description: raw.description || raw.archaeological_anchor || '',
        significance: raw.significance || raw.theology || raw.summary || ''
      };
      const key = `${yr}_${title.toLowerCase()}`;
      finalEvtsMap.set(key, normEvt);
    });
    const finalEvts = Array.from(finalEvtsMap.values()).sort((a, b) => a.year_bce_ce - b.year_bce_ce);

    const mergedObj = {
      locations: finalLocs,
      timeline_events: finalEvts
    };

    const locCount = finalLocs.length;
    const evtCount = finalEvts.length;

    if (locCount === 0 && evtCount === 0) {
      return {
        normalizedJson: JSON.stringify(mergedObj, null, 2),
        status: { valid: false, message: 'JSON không chứa dữ liệu tọa độ hoặc mốc thời gian nào hợp lệ.' }
      };
    }

    return {
      normalizedJson: JSON.stringify(mergedObj, null, 2),
      status: { valid: true, message: `Hợp lệ: ${locCount} tọa độ địa danh • ${evtCount} mốc thời gian cứu độ.` }
    };
  };

  const validateGeoTimelineJson = (jsonStr: string) => {
    if (!jsonStr.trim()) {
      setGeoTimelineStatus(null);
      return null;
    }
    const res = smartNormalizeAndMergeGeoTimeline(jsonStr);
    setGeoTimelineStatus(res.status);
    return res.status.valid ? JSON.parse(res.normalizedJson) : null;
  };

  const handleUploadGeoFile = (e: React.ChangeEvent<HTMLInputElement>, forceType?: 'locations' | 'timeline') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = smartNormalizeAndMergeGeoTimeline(content, geoTimelineJson, forceType);
      setGeoTimelineJson(res.normalizedJson);
      setGeoTimelineStatus(res.status);
      setShowGeoTimelineSection(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parsedGeoTimeline = useMemo(() => {
    if (!geoTimelineJson.trim()) return { locations: [], timeline_events: [] };
    try {
      const obj = JSON.parse(geoTimelineJson);
      return {
        locations: Array.isArray(obj.locations) ? obj.locations : [],
        timeline_events: Array.isArray(obj.timeline_events) ? obj.timeline_events : Array.isArray(obj.events) ? obj.events : []
      };
    } catch {
      return { locations: [], timeline_events: [] };
    }
  }, [geoTimelineJson]);

  const handleRemoveLocation = (indexToRemove: number) => {
    try {
      const obj = JSON.parse(geoTimelineJson);
      const locs = Array.isArray(obj.locations) ? obj.locations : [];
      const evts = Array.isArray(obj.timeline_events) ? obj.timeline_events : Array.isArray(obj.events) ? obj.events : [];
      const newLocs = locs.filter((_: any, idx: number) => idx !== indexToRemove);
      const newObj = { locations: newLocs, timeline_events: evts };
      const jsonStr = JSON.stringify(newObj, null, 2);
      setGeoTimelineJson(jsonStr);
      validateGeoTimelineJson(jsonStr);
      setMessage({ type: 'success', text: 'Đã xóa địa danh khỏi danh sách đính kèm.' });
      setTimeout(() => setMessage(null), 2500);
    } catch {}
  };

  const handleRemoveTimelineEvent = (indexToRemove: number) => {
    try {
      const obj = JSON.parse(geoTimelineJson);
      const locs = Array.isArray(obj.locations) ? obj.locations : [];
      const evts = Array.isArray(obj.timeline_events) ? obj.timeline_events : Array.isArray(obj.events) ? obj.events : [];
      const newEvts = evts.filter((_: any, idx: number) => idx !== indexToRemove);
      const newObj = { locations: locs, timeline_events: newEvts };
      const jsonStr = JSON.stringify(newObj, null, 2);
      setGeoTimelineJson(jsonStr);
      validateGeoTimelineJson(jsonStr);
      setMessage({ type: 'success', text: 'Đã xóa mốc thời gian khỏi danh sách đính kèm.' });
      setTimeout(() => setMessage(null), 2500);
    } catch {}
  };

  const handleInsertMapCalloutBlock = () => {
    const locCount = parsedGeoTimeline.locations.length;
    const evtCount = parsedGeoTimeline.timeline_events.length;
    const calloutHtml = `<div class="article-geo-callout my-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-xl backdrop-blur-md not-prose">
  <div class="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5 mb-3">
    <span class="text-xs font-serif font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
      <span>📍</span> TỌA ĐỘ KHẢO CỔ &amp; DÒNG THỜI GIAN ĐỐI CHIẾU
    </span>
    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
      ${locCount} Địa Danh • ${evtCount} Mốc Cứu Độ
    </span>
  </div>
  <p class="font-serif text-sm leading-relaxed text-[var(--text-main)] m-0">
    Bài viết này đã được định vị trên <strong>Bản Đồ Thánh Địa 3D</strong> và <strong>Dòng Thời Gian Lịch Sử Cứu Độ</strong> của VERIDU. Kéo xuống cuối trang để trải nghiệm bản đồ tương tác Leaflet và các di chỉ liên quan.
  </p>
</div>`;
    handleInsertCatholicBlock(calloutHtml);
  };

  const handleClearGeoTimeline = () => {
    setGeoTimelineJson('');
    setGeoTimelineStatus(null);
  };

  const handleLoadSampleJson = () => {
    const sample = {
      locations: [
        {
          name: "Núi Sinai (Horeb)",
          ancient_name: "Gebel Musa / Horeb",
          latitude: 28.5397,
          longitude: 33.9750,
          description: "Ngọn núi thánh nơi Thiên Chúa ban hành Thập Giới và ký kết Giao ước Sinai.",
          scripture_or_history: "Xuất Hành 19–24; Đnl 5",
          historical_period: "Thời Xuất Hành (Thế kỷ 15 - 13 TCN)"
        }
      ],
      timeline_events: [
        {
          year_bce_ce: -1440,
          event_title: "Ban hành Luật Năm Sa-bát và Năm Toàn Xá tại Núi Sinai",
          period: "Thời kỳ Xuất Hành & Sa Mạc",
          display_date: "k. 1440 TCN",
          description: "Nơi Thiên Chúa ban bố luật Năm Toàn Xá Yovel và tái thiết công lý.",
          significance: "Thiết lập nền tảng công lý kinh tế và giải phóng nô lệ Dân Chúa."
        }
      ]
    };
    const str = JSON.stringify(sample, null, 2);
    setGeoTimelineJson(str);
    setGeoTimelineStatus({ valid: true, message: 'Đã nạp mẫu JSON: 1 tọa độ địa danh • 1 mốc thời gian.' });
  };

  // 1-Click Catholic Block Insertion Handler
  const handleInsertCatholicBlock = (htmlSnippet: string) => {
    if (activeTab === 'visual' && visualCanvasRef.current) {
      visualCanvasRef.current.focus();
      
      const selection = window.getSelection();
      let inserted = false;

      if (selection && selection.rangeCount > 0 && visualCanvasRef.current.contains(selection.anchorNode)) {
        try {
          document.execCommand('insertHTML', false, htmlSnippet + '<p><br></p>');
          inserted = true;
        } catch {
          inserted = false;
        }
      }

      if (!inserted) {
        // Append cleanly to end of canvas
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlSnippet;
        visualCanvasRef.current.appendChild(wrapper.firstChild || wrapper);
        
        const spacer = document.createElement('p');
        spacer.innerHTML = '<br>';
        visualCanvasRef.current.appendChild(spacer);
      }

      handleCanvasInput();
    } else {
      // In code mode or preview mode: append or update state directly
      const newHtml = contentHtml ? `${contentHtml}\n\n${htmlSnippet}` : htmlSnippet;
      setContentHtml(newHtml);
      if (visualCanvasRef.current) {
        visualCanvasRef.current.innerHTML = newHtml;
      }
    }

    setMessage({ type: 'success', text: 'Đã chèn khối Công giáo chuẩn tắc vào bài viết!' });
    setTimeout(() => setMessage(null), 3000);
  };

  // Open Interactive Media Inserter Modal
  const handleOpenMediaModal = (type: 'audio_mini' | 'audio_full' | 'video' = 'audio_mini') => {
    setMediaModalType(type);
    if (type === 'video') {
      setMediaModalUrl(videoUrl || '');
      setMediaModalTitle('Video Phụng Vụ & Chuyên Đề VERIDU');
      setMediaModalBadge('16:9 • HD');
    } else if (type === 'audio_mini') {
      setMediaModalUrl(audioUrl || '');
      setMediaModalTitle('BẢN NGHE AUDIO PODCAST HỌC THUẬT');
      setMediaModalBadge(readingTime ? `Thời lượng: ${readingTime}` : 'Thời lượng: 12 phút');
    } else {
      setMediaModalUrl(audioUrl || '');
      setMediaModalTitle(title ? `PODCAST HỌC THUẬT: ${title}` : 'PODCAST HỌC THUẬT VERIDU');
      setMediaModalBadge('Ep #01 • 15:00 • VERIDU Audio');
      setMediaModalDesc('Lắng nghe bản đọc diễn cảm học thuật và đối thoại sâu sắc về chủ đề này cùng Ban Biên Tập VERIDU.');
    }
    setShowMediaModal(true);
  };

  const handleExecuteInsertMedia = () => {
    let finalUrl = mediaModalUrl.trim();
    if (!finalUrl) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đường dẫn URL cho tệp Media!' });
      return;
    }

    // Auto-transform Google Drive link if applicable
    if (finalUrl.includes('drive.google.com') || finalUrl.includes('docs.google.com')) {
      const match = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                    finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                    finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        if (mediaModalType === 'video') {
          finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
        } else {
          finalUrl = `https://docs.google.com/uc?export=download&id=${match[1]}`;
        }
      }
    }

    // Auto-transform YouTube link to embed format
    if (mediaModalType === 'video') {
      if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
        const ytMatch = finalUrl.match(/(?:watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch && ytMatch[1]) {
          finalUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
        }
      }
      if (!videoUrl) setVideoUrl(finalUrl);
    } else {
      if (!audioUrl) setAudioUrl(finalUrl);
    }

    let snippet = '';
    if (mediaModalType === 'video') {
      snippet = `<div class="veridu-embed-video w-full aspect-video rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-8 bg-black relative z-10 not-prose">
  <iframe 
    src="${finalUrl}" 
    class="w-full h-full border-none" 
    title="${mediaModalTitle || 'Video Phụng Vụ VERIDU'}" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>`;
    } else if (mediaModalType === 'audio_mini') {
      snippet = `<div class="veridu-embed-audio mini my-6 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--gold-border)] shadow-md not-prose">
  <div class="audio-header flex justify-between items-center mb-2 font-sans">
    <span class="audio-label text-xs font-bold text-amber-500 uppercase flex items-center gap-1.5">
      <span>🎧</span> ${mediaModalTitle || 'BẢN NGHE AUDIO PODCAST HỌC THUẬT'}
    </span>
    <span class="audio-badge text-xs font-mono text-[var(--text-muted)] border border-[var(--border-card)] px-2.5 py-0.5 rounded-full">${mediaModalBadge || 'Thời lượng: 12 phút'}</span>
  </div>
  <audio controls class="w-full h-10 rounded-lg">
    <source src="${finalUrl}" type="audio/mpeg">
    Trình duyệt không hỗ trợ phát âm thanh trực tiếp.
  </audio>
</div>`;
    } else {
      snippet = `<div class="veridu-embed-audio my-8 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl not-prose">
  <div class="audio-header flex justify-between items-center mb-3 font-sans">
    <div class="audio-label text-xs sm:text-sm font-bold text-amber-500 flex items-center gap-2 uppercase">
      <span>🎙️</span> ${mediaModalTitle || 'PODCAST HỌC THUẬT: CHUYÊN ĐỀ PHỤNG VỤ'}
    </div>
    <span class="audio-badge text-xs font-mono text-[var(--text-muted)] border border-[var(--border-card)] px-3 py-1 rounded-full">${mediaModalBadge || 'Ep #01 • 15:00 • VERIDU Audio'}</span>
  </div>
  ${mediaModalDesc ? `<p class="text-xs sm:text-sm text-[var(--text-muted)] mb-3 leading-relaxed">${mediaModalDesc}</p>` : ''}
  <audio controls class="w-full h-11 rounded-lg">
    <source src="${finalUrl}" type="audio/mpeg">
    Trình duyệt không hỗ trợ phát âm thanh trực tiếp.
  </audio>
</div>`;
    }

    handleInsertCatholicBlock(snippet);
    setShowMediaModal(false);
  };

  // Process Uploaded HTML File with Full Clean Ingestion
  const processHtmlFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText || !rawText.trim()) {
        setMessage({ type: 'error', text: 'Tệp tải lên rỗng hoặc không hợp lệ.' });
        return;
      }

      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

      // Detect Features
      const features: string[] = [];
      if (/<!DOCTYPE\s+html/i.test(rawText) || /<html[\s>]/i.test(rawText)) features.push('Tài liệu HTML');
      if (/sacred-scripture|veridu-scripture-quote/i.test(rawText)) features.push('Khối Lời Chúa');
      if (/prayer-block|poetry-block/i.test(rawText)) features.push('Thơ & Lời Nguyện');
      if (/abstract-research/i.test(rawText)) features.push('Tóm Tắt Nghiên Cứu');
      if (/scripture-meta/i.test(rawText)) features.push('Bằng Chứng Kinh Thánh');
      if (/dictionary-meta/i.test(rawText)) features.push('Thuật Ngữ Tín Lý');
      if (/catechetical-callout/i.test(rawText)) features.push('Hộp Lưu Ý Giáo Lý');
      if (/footnotes-section|footnote-ref|footnote-item|<sup/i.test(rawText)) features.push('Chú Thích Chân Trang');
      if (/<img/i.test(rawText)) features.push('Hình Ảnh');
      if (/<iframe|<video/i.test(rawText)) features.push('Media Nhúng');
      if (/<audio|veridu-embed-audio|\.mp3|\.wav|\.m4a/i.test(rawText)) features.push('🎧 Audio Podcast');
      if (/<iframe|veridu-embed-video|youtube\.com|youtu\.be|<video/i.test(rawText)) features.push('🎬 Video Nhúng');

      // Detect 3D Interactive application vs Standard article
      const is3DInteractive = 
        /<canvas[\s>]/i.test(rawText) ||
        /three\.js|three\.min\.js|babylon|webgl/i.test(rawText) ||
        (rawText.toLowerCase().includes('requestanimationframe') && rawText.toLowerCase().includes('<script')) ||
        /tuong-tac|3d|interactive/i.test(file.name);

      if (is3DInteractive) {
        features.push('🚀 Ứng dụng Tương Tác 3D');
        setArticleType('interactive');
        setCategory('Bài Tương Tác HTML 3D');
      } else {
        setArticleType('standard');
      }

      setDetectedFeatures(features);

      // 1. Auto-extract Title
      const extractedTitle = extractTitleFromHtml(rawText);
      if (extractedTitle) {
        setTitle(extractedTitle);
        setSlug(slugifyVietnamese(extractedTitle));
      }

      // 2. Auto-extract Excerpt
      const extractedDesc = extractExcerptFromHtml(rawText);
      if (extractedDesc && !excerpt) {
        setExcerpt(extractedDesc);
      }

      // 3. Auto-extract Image
      const extractedImg = extractFeaturedImageFromHtml(rawText);
      if (extractedImg && !featuredImage) {
        setFeaturedImage(extractedImg);
      }

      // 4. Auto-extract Audio & Video
      const extractedAudio = extractAudioUrlFromHtml(rawText);
      if (extractedAudio) {
        setAudioUrl(extractedAudio);
        if (!extractedAudio.startsWith('http://') && !extractedAudio.startsWith('https://') && !extractedAudio.startsWith('//')) {
          setDetectedLocalAudioPath(extractedAudio);
        } else {
          setDetectedLocalAudioPath(null);
        }
      } else {
        const localAudio = rawText.match(/<(?:source|audio)\s+[^>]*?src=["'](audio\/[^"']+)["']/i);
        if (localAudio && localAudio[1]) {
          setDetectedLocalAudioPath(localAudio[1]);
          setAudioUrl(localAudio[1]);
        }
      }

      const extractedVideo = extractVideoUrlFromHtml(rawText);
      if (extractedVideo) {
        setVideoUrl(extractedVideo);
      }

      // 5. Clean HTML & Load into Canvas
      const cleanHtml = normalizeAndSyncHtml(rawText);
      setContentHtml(cleanHtml);
      if (visualCanvasRef.current) {
        visualCanvasRef.current.innerHTML = cleanHtml;
      }

      setAnalysisNotice(`Đã nạp file "${file.name}" (${(file.size / 1024).toFixed(1)} KB): Trích xuất tiêu đề, âm thanh, chuẩn hóa mã HTML và áp dụng phong cách Stained-Glass của VERIDU.`);
      setMessage({ type: 'success', text: `Nạp thành công tệp: ${file.name}` });
    };

    reader.readAsText(file);
  };

  // 1-Click Replacer for local audio paths (e.g. audio/podcast.mp3 -> cloud stream URL)
  const handleReplaceLocalAudioPath = () => {
    if (!detectedLocalAudioPath) return;
    const targetUrl = audioUrl.trim();
    if (!targetUrl || targetUrl === detectedLocalAudioPath) {
      setMessage({ 
        type: 'error', 
        text: 'Vui lòng nhập đường dẫn URL âm thanh mới (MP3 hoặc Google Drive) vào ô Audio URL trước khi thay thế!' 
      });
      return;
    }

    let finalResolvedUrl = targetUrl;
    // Resolve Google Drive link if applicable
    if (finalResolvedUrl.includes('drive.google.com') || finalResolvedUrl.includes('docs.google.com')) {
      const match = finalResolvedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                    finalResolvedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                    finalResolvedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        finalResolvedUrl = `https://docs.google.com/uc?export=download&id=${match[1]}`;
        setAudioUrl(finalResolvedUrl);
      }
    }

    // Replace in state contentHtml
    const updatedHtml = replaceAudioSrcInHtml(contentHtml, detectedLocalAudioPath, finalResolvedUrl);
    setContentHtml(updatedHtml);

    // Replace in visual canvas DOM
    if (visualCanvasRef.current) {
      visualCanvasRef.current.innerHTML = replaceAudioSrcInHtml(
        visualCanvasRef.current.innerHTML, 
        detectedLocalAudioPath, 
        finalResolvedUrl
      );
    }

    const replacedPath = detectedLocalAudioPath;
    setDetectedLocalAudioPath(null);
    setMessage({ 
      type: 'success', 
      text: `Đã thay thế "${replacedPath}" bằng URL âm thanh trực tuyến thành công trên toàn bộ bài viết!` 
    });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processHtmlFile(file);
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm') || file.name.endsWith('.txt'))) {
      processHtmlFile(file);
    } else {
      setMessage({ type: 'error', text: 'Vui lòng kéo thả file có định dạng .html hoặc .htm' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết!' });
      return;
    }

    // Get current HTML from canvas with strict priority
    let finalHtml = contentHtml;
    if (activeTab === 'visual' && visualCanvasRef.current) {
      finalHtml = visualCanvasRef.current.innerHTML;
      setContentHtml(finalHtml);
    } else if (!finalHtml.trim() && visualCanvasRef.current?.innerHTML) {
      finalHtml = visualCanvasRef.current.innerHTML;
      setContentHtml(finalHtml);
    }

    if (!finalHtml.trim()) {
      setMessage({ type: 'error', text: 'Nội dung bài viết không được để trống!' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const finalSlug = slug.trim() || slugifyVietnamese(title);
      const isEdit = !!postId;
      const endpoint = isEdit ? '/api/posts/update' : '/api/posts/create';

      const isPrivileged = user?.role === 'admin' || user?.role === 'scholar' || user?.role === 'Quản Trị Viên' || user?.role === 'Học Giả VERIDU';

      // Ensure status 'published' is preserved when editing already published articles
      const postStatus = isEdit ? (existingStatus || 'published') : (isPrivileged ? 'published' : 'pending');

      const payload: Record<string, any> = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        category,
        article_type: articleType,
        featured_image: formatImageUrl(featuredImage.trim()),
        content: finalHtml,
        status: postStatus,
        author_name: authorName.trim() || user?.fullName || user?.displayName || 'Ban Biên Tập VERIDU',
        reading_time: readingTime.trim() || calculateReadingTime(finalHtml),
        published_at: publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString(),
        audio_url: audioUrl ? audioUrl.trim() : null,
        video_url: videoUrl ? videoUrl.trim() : null
      };

      if (isEdit) {
        payload.id = postId;
      } else {
        payload.author_id = user?.id || 'eef94645-01fb-471f-9b10-cdd3fea35143';
      }

      let authToken: string | undefined;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        authToken = sessionData?.session?.access_token;
      } catch (e) {}

      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        reqHeaders['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài viết vào CSDL Supabase');

      const savedSlug = data.slug || data.post?.slug || finalSlug;
      setPublishedSlug(savedSlug);

      // Attach Geo & Timeline data if provided
      if (geoTimelineJson.trim()) {
        try {
          const parsed = JSON.parse(geoTimelineJson);
          const locs = Array.isArray(parsed.locations) ? parsed.locations : [];
          const evts = Array.isArray(parsed.timeline_events) ? parsed.timeline_events : Array.isArray(parsed.events) ? parsed.events : [];
          
          if (locs.length > 0 || evts.length > 0) {
            await fetch('/api/posts/attach-geo-timeline', {
              method: 'POST',
              headers: reqHeaders,
              body: JSON.stringify({
                article_slug: savedSlug,
                locations: locs,
                timeline_events: evts
              })
            });
          }
        } catch (geoErr) {
          console.error('Lỗi khi đính kèm dữ liệu bản đồ / dòng thời gian:', geoErr);
        }
      }

      setShowSuccessModal(true);
      setMessage({ 
        type: 'success', 
        text: isEdit 
          ? 'Đã cập nhật bài viết thành công!' 
          : postStatus === 'published' 
            ? 'Đã xuất bản bài viết thành công!' 
            : 'Bài viết đã được gửi và đang chờ Ban Quản Trị phê duyệt!' 
      });

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi kết nối Supabase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Device Frame Width for Preview
  const getDeviceWidthClass = () => {
    if (canvasDevice === 'mobile') return 'max-w-[375px]';
    if (canvasDevice === 'tablet') return 'max-w-[768px]';
    return 'w-full max-w-4xl';
  };

  // ── LEFT PANEL CONTENT (SETTINGS & SEO & GEO/TIMELINE) ──
  const renderLeftPanelContent = () => (
    <div className="p-4 space-y-4 text-xs">
      <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> Thông Tin Xuất Bản &amp; SEO
      </div>

      <div className="space-y-3.5 text-xs">
        <div>
          <label className="font-bold text-[var(--text-muted)] block mb-1">
            Tiêu Đề Bài Viết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="font-bold text-[var(--text-muted)] block mb-1">
            Đường Dẫn Định Danh (Slug)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="tai-sao-gioan-tay-gia-bi-tram-quyet"
            className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] text-[var(--text-muted)] outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-[var(--text-muted)] block mb-1">Chuyên Mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500 text-xs"
            >
              <option value="Thần Học">Thần Học &amp; Tín Lý</option>
              <option value="Kinh Thánh">Kinh Thánh &amp; Chú Giải</option>
              <option value="Suy Niệm">Suy Niệm Lời Chúa</option>
              <option value="Các Thánh">Các Thánh &amp; Phụng Vụ</option>
              <option value="Lịch Sử">Lịch Sử Giáo Hội</option>
              <option value="Giáo Lý">Giáo Lý Công Giáo</option>
              <option value="Bài Tương Tác HTML 3D">Bài Tương Tác HTML 3D</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[var(--text-muted)] block mb-1">Giao Diện</label>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-bold text-[var(--text-main)] outline-none focus:border-amber-500 text-xs"
            >
              <option value="standard">📖 Tiêu Chuẩn</option>
              <option value="interactive">🚀 Tương Tác 3D</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-[var(--text-muted)] block mb-1">
            Tác Giả / Người Viết
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Ban Biên Tập VERIDU, Lm. Giuse, Học giả..."
            className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[var(--text-muted)] block text-xs">
                Thời Gian Đọc
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsReadingTimeManual(false);
                  setReadingTime(calculateReadingTime(contentHtml));
                }}
                className="text-[10px] text-amber-500 hover:underline cursor-pointer"
                title="Tính lại tự động theo số từ"
              >
                ⚡ Tự tính
              </button>
            </div>
            <input
              type="text"
              value={readingTime}
              onChange={(e) => {
                setIsReadingTimeManual(true);
                setReadingTime(e.target.value);
              }}
              placeholder="ví dụ: 12 phút"
              className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-[var(--text-muted)] block mb-1 text-xs">
              Ngày Đăng
            </label>
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[var(--text-muted)] block mb-1">
            Ảnh Bìa Đại Diện (Google Drive / URL)
          </label>
          <input
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://images.unsplash.com/... hoặc Drive"
            className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-[11px] outline-none focus:border-amber-500"
          />
          {featuredImage && (
            <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border-card)] aspect-video relative max-h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={featuredImage} 
                alt="Preview Ảnh Bìa" 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        <div>
          <label className="font-bold text-[var(--text-muted)] block mb-1">
            Tóm Tắt Ngắn (Excerpt SEO)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Tóm tắt ngắn gọn nội dung cốt lõi của bài viết để hiển thị trên thẻ bài và kết quả tìm kiếm..."
            className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500 resize-y"
          />
        </div>

        {/* MEDIA SECTION: PODCAST AUDIO & VIDEO */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5 text-xs">
              <Headphones className="w-3.5 h-3.5 text-amber-500" />
              <span>Audio Podcast &amp; Video</span>
            </span>
            {(audioUrl || videoUrl) && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                Đã gán
              </span>
            )}
          </div>

          <div>
            <label className="font-bold text-[var(--text-muted)] block mb-1 text-[11px]">
              Link Audio Podcast (MP3 / Google Drive)
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://... hoặc link Google Drive âm thanh"
              className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-[11px] outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Hỗ trợ link MP3 trực tiếp, Google Drive (hệ thống tự động chuyển thành stream URL).
            </p>
          </div>

          {/* Alert for relative/local audio path */}
          {detectedLocalAudioPath && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2 text-[11px]">
              <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>Phát hiện đường dẫn audio cục bộ:</span>
              </div>
              <code className="block p-1.5 rounded-lg bg-amber-950/40 text-amber-300 font-mono text-[10px] break-all border border-amber-500/30">
                {detectedLocalAudioPath}
              </code>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                Đường dẫn nội bộ này sẽ không phát được khi xem trên web. Nhập link MP3 hoặc Google Drive công khai vào ô ở trên và bấm nút bên dưới:
              </p>
              <button
                type="button"
                onClick={handleReplaceLocalAudioPath}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>⚡ Thay Thế Link Nhanh Cho Toàn Bài</span>
              </button>
            </div>
          )}

          <div>
            <label className="font-bold text-[var(--text-muted)] block mb-1 text-[11px]">
              Link Video Phụ Đề (YouTube / Vimeo)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-[11px] outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* EXPANDABLE: BẢN ĐỒ & DÒNG THỜI GIAN BỔ TRỢ */}
        <div className="pt-2 border-t border-[var(--border-card)]">
          <button
            type="button"
            onClick={() => setShowGeoTimelineSection(!showGeoTimelineSection)}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>📍 Bản Đồ &amp; ⏳ Dòng Thời Gian</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20">
              {showGeoTimelineSection ? '▲ Thu gọn' : '▼ Đính kèm'}
            </span>
          </button>

          {showGeoTimelineSection && (
            <div className="mt-3 space-y-3 p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] shadow-xs animate-fadeIn">
              
              {/* HIDDEN FILE INPUTS FOR DIRECT PC UPLOAD */}
              <input
                type="file"
                ref={locFileInputRef}
                accept=".json,.geojson"
                onChange={(e) => handleUploadGeoFile(e, 'locations')}
                className="hidden"
              />
              <input
                type="file"
                ref={timelineFileInputRef}
                accept=".json"
                onChange={(e) => handleUploadGeoFile(e, 'timeline')}
                className="hidden"
              />
              <input
                type="file"
                ref={jsonFileInputRef}
                accept=".json,.geojson"
                onChange={(e) => handleUploadGeoFile(e)}
                className="hidden"
              />

              {/* DRAG & DROP ZONE */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsGeoDragging(true); }}
                onDragLeave={() => setIsGeoDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsGeoDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const fileContent = event.target?.result as string;
                      const res = smartNormalizeAndMergeGeoTimeline(fileContent, geoTimelineJson);
                      setGeoTimelineJson(res.normalizedJson);
                      setGeoTimelineStatus(res.status);
                      setShowGeoTimelineSection(true);
                      setMessage({ type: 'success', text: `Đã nạp tệp "${file.name}" từ máy tính thành công!` });
                      setTimeout(() => setMessage(null), 3500);
                    };
                    reader.readAsText(file);
                  }
                }}
                onClick={() => jsonFileInputRef.current?.click()}
                className={`p-3 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                  isGeoDragging
                    ? 'border-amber-500 bg-amber-500/20 scale-[1.01]'
                    : 'border-[var(--border-card)] hover:border-amber-500/50 bg-[var(--bg-card)]'
                }`}
                title="Bấm để chọn tệp hoặc kéo thả tệp .json / .geojson vào đây"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-serif font-bold text-amber-600 dark:text-amber-400">
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kéo Thả Hoặc Bấm Để Nạp Tệp Từ Máy Tính</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-serif mt-0.5">
                  Hỗ trợ .json (tọa độ, mốc sự kiện) hoặc .geojson (FeatureCollection)
                </p>
              </div>

              {/* Upload Actions Toolbar */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => locFileInputRef.current?.click()}
                    className="py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500 text-amber-900 dark:text-amber-300 hover:text-slate-950 font-bold rounded-lg text-[10px] transition border border-amber-500/40 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Nạp tệp JSON chứa danh sách các địa danh tọa độ"
                  >
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span>📍 Nạp Tọa Độ (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => timelineFileInputRef.current?.click()}
                    className="py-1.5 px-2 bg-indigo-500/15 hover:bg-indigo-500 text-indigo-700 dark:text-indigo-300 hover:text-white font-bold rounded-lg text-[10px] transition border border-indigo-500/40 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Nạp tệp JSON chứa danh sách các mốc thời gian cứu độ"
                  >
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span>⏳ Nạp Thời Gian (.json)</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={handleLoadSampleJson}
                    className="flex-1 py-1 px-1.5 bg-[var(--bg-card)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 font-bold rounded-md transition border border-[var(--border-card)] cursor-pointer text-center"
                    title="Nạp mẫu dữ liệu chuẩn Núi Sinai & Năm Toàn Xá"
                  >
                    + Mẫu Chuẩn
                  </button>

                  {geoTimelineJson && (
                    <>
                      <button
                        type="button"
                        onClick={handleInsertMapCalloutBlock}
                        className="flex-1 py-1 px-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-md transition border border-amber-500/30 cursor-pointer text-center"
                        title="Chèn khung thông báo bản đồ đối chiếu vào nội dung bài viết"
                      >
                        📌 Chèn Khung Bài
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(geoTimelineJson);
                          setMessage({ type: 'success', text: 'Đã sao chép mã JSON vào clipboard!' });
                          setTimeout(() => setMessage(null), 2500);
                        }}
                        className="py-1 px-2 bg-[var(--bg-card)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 font-bold rounded-md transition border border-[var(--border-card)] cursor-pointer"
                        title="Sao chép JSON"
                      >
                        <Bookmark className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={handleClearGeoTimeline}
                        className="py-1 px-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold rounded-md transition border border-rose-500/30 cursor-pointer"
                        title="Xóa toàn bộ dữ liệu tọa độ & dòng thời gian"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* VIEW MODE TOGGLE (Cards vs Raw JSON) */}
              <div className="flex items-center justify-between border-t border-[var(--border-card)] pt-2">
                <div className="flex items-center gap-1 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-card)]">
                  <button
                    type="button"
                    onClick={() => setGeoViewMode('cards')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-serif font-bold transition cursor-pointer ${
                      geoViewMode === 'cards'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    👁️ Thẻ Trực Quan ({parsedGeoTimeline.locations.length + parsedGeoTimeline.timeline_events.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoViewMode('json')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-serif font-bold transition cursor-pointer ${
                      geoViewMode === 'json'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {'{ }'} Mã JSON
                  </button>
                </div>

                <span className="text-[10px] font-mono text-amber-500 font-bold">
                  {parsedGeoTimeline.locations.length} địa danh • {parsedGeoTimeline.timeline_events.length} mốc
                </span>
              </div>

              {/* VIEW MODE: CARDS PREVIEW */}
              {geoViewMode === 'cards' ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {parsedGeoTimeline.locations.length === 0 && parsedGeoTimeline.timeline_events.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-dashed border-[var(--border-card)] text-center space-y-1">
                      <p className="text-[11px] text-[var(--text-muted)] font-serif">
                        Chưa có dữ liệu bản đồ hoặc mốc thời gian.
                      </p>
                      <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-serif">
                        Kéo thả tệp JSON từ máy tính hoặc bấm &quot;+ Mẫu Chuẩn&quot; để nạp.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Locations List */}
                      {parsedGeoTimeline.locations.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Địa Danh Bản Đồ ({parsedGeoTimeline.locations.length})</span>
                          </div>
                          {parsedGeoTimeline.locations.map((loc: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 transition flex items-start justify-between gap-2"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-[11px] text-[var(--text-main)] truncate">
                                  {loc.name}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                                    {Number(loc.latitude).toFixed(3)}°, {Number(loc.longitude).toFixed(3)}°
                                  </span>
                                  {loc.historical_period && (
                                    <span className="text-[9px] text-[var(--text-muted)] truncate max-w-[120px]">
                                      {loc.historical_period}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLocation(idx)}
                                className="p-1 text-[var(--text-muted)] hover:text-rose-500 rounded transition cursor-pointer shrink-0"
                                title="Xóa địa danh này"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timeline Events List */}
                      {parsedGeoTimeline.timeline_events.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Mốc Lịch Sử Cứu Độ ({parsedGeoTimeline.timeline_events.length})</span>
                          </div>
                          {parsedGeoTimeline.timeline_events.map((evt: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-indigo-500/40 transition flex items-start justify-between gap-2"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                                    {evt.display_date || `${evt.year_bce_ce} TCN`}
                                  </span>
                                  <span className="font-bold text-[11px] text-[var(--text-main)] truncate">
                                    {evt.event_title}
                                  </span>
                                </div>
                                {evt.period && (
                                  <div className="text-[9px] text-[var(--text-muted)] truncate">
                                    {evt.period}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTimelineEvent(idx)}
                                className="p-1 text-[var(--text-muted)] hover:text-rose-500 rounded transition cursor-pointer shrink-0"
                                title="Xóa mốc thời gian này"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* VIEW MODE: RAW JSON CODE */
                <div>
                  <textarea
                    value={geoTimelineJson}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGeoTimelineJson(val);
                      validateGeoTimelineJson(val);
                    }}
                    rows={6}
                    placeholder="Dán mã JSON mảng tọa độ [ ... ] hoặc mốc thời gian [ ... ] tại đây..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] font-mono text-[10px] text-amber-500 dark:text-amber-400 outline-none focus:border-amber-500 resize-y leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Status Alert Banner */}
              {geoTimelineStatus && (
                <div className={`p-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 ${
                  geoTimelineStatus.valid 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  {geoTimelineStatus.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  )}
                  <span>{geoTimelineStatus.message}</span>
                </div>
              )}

              <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[10px] font-serif text-[var(--text-muted)] leading-relaxed">
                ℹ️ Dữ liệu này sẽ tự động sinh <strong>Widget Bản Đồ Leaflet &amp; Dòng Thời Gian Tương Tác</strong> ở chân bài viết sau khi xuất bản.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── RIGHT PANEL CONTENT (8 CATHOLIC BLOCKS & OUTLINE & HTML FILE) ──
  const renderRightPanelContent = () => (
    <div className="p-4 space-y-4 text-xs">
      {/* Tab 1: 8 Khối Chuẩn Công Giáo */}
      {rightPanelTab === 'blocks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> 8 Khối Chuẩn Công Giáo
            </span>
            <button
              type="button"
              onClick={() => setShowBlockModal(true)}
              className="text-[10px] text-amber-500 hover:underline font-bold cursor-pointer"
            >
              Xem Sổ Tay ↗
            </button>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Nhấp vào bất kỳ khối nào bên dưới để chèn mẫu chuẩn vào vị trí con trỏ:
          </p>

          {/* Quick Custom Media Inserter Trigger */}
          <button
            type="button"
            onClick={() => handleOpenMediaModal('audio_mini')}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-indigo-500/10 hover:from-amber-500/30 hover:to-indigo-500/20 border border-amber-500/40 flex items-center justify-between text-xs font-bold text-[var(--text-main)] transition shadow-sm cursor-pointer group"
          >
            <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Headphones className="w-4 h-4" />
              <span>🎵 Tùy Chỉnh Chèn Audio / Video...</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono">
              Mở Hộp Thoại
            </span>
          </button>

          <div className="space-y-2">
            {[
              {
                name: '1. Lời Chúa Soi Đường',
                desc: 'Trích dẫn Lời Chúa viền vàng & tra cứu Kinh Thánh',
                icon: <BookOpen className="w-4 h-4 text-amber-500" />,
                action: () => handleInsertCatholicBlock(`<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose"><div class="flex items-start gap-4"><div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div><div class="space-y-2.5 flex-1"><blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">“Ngài phải nổi bật lên, còn tôi phải lu mờ đi.”</blockquote><div class="flex items-center gap-2 pt-1"><a href="/kinh-thanh/ga/3" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group"><span>Ga 3:30</span><span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span></a></div></div></div></div>`)
              },
              {
                name: '2. Thơ & Lời Nguyện Kính',
                desc: 'Lời cầu nguyện sốt mến sắc tím & Amen',
                icon: <Heart className="w-4 h-4 text-indigo-500" />,
                action: () => handleInsertCatholicBlock(`<div class="prayer-block my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 shadow-xl backdrop-blur-md not-prose"><div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif mb-3"><span>🕊️</span> LỜI NGUYỆN KÍNH PHỤNG VỤ</div><p class="font-serif italic text-indigo-950 dark:text-indigo-100 text-base sm:text-lg leading-relaxed m-0">“Lạy Chúa Giêsu Thánh Thể, xin ngự vào tâm hồn chúng con, ban cho chúng con ơn bình an, đức tin kiên vững và lòng nhiệt thành phụng sự Hội Thánh...”</p><div class="prayer-amen text-right font-serif font-bold text-amber-600 dark:text-amber-400 text-sm mt-3">Amen.</div></div>`)
              },
              {
                name: '3. Tóm Tắt Nghiên Cứu Thần Học',
                desc: 'Thẻ tóm tắt học thuật VERIDU RESEARCH',
                icon: <FileText className="w-4 h-4 text-indigo-500" />,
                action: () => handleInsertCatholicBlock(`<div class="abstract-research my-8 p-6 sm:p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 shadow-xl backdrop-blur-md space-y-4 not-prose"><div class="abstract-header flex items-center justify-between border-b border-indigo-500/20 pb-3"><span class="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-serif"><span>📖</span> TÓM TẮT NGHIÊN CỨU THẦN HỌC</span><span class="abstract-badge text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold font-mono">VERIDU RESEARCH</span></div><p class="font-serif text-sm sm:text-base leading-relaxed text-[var(--text-main)] m-0">Khảo luận chuyên sâu về nền tảng tín lý và bối cảnh lịch sử của Tín Điều Theotokos tại Công đồng Êphêsô (431), làm rõ sự hiệp nhất hai bản tính trong duy nhất một Ngôi Vị Thiên Chúa.</p><div class="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/10"><span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#Theotokos</span><span class="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/20">#Epheso431</span></div></div>`)
              },
              {
                name: '4. Bằng Chứng Thánh Kinh',
                desc: 'Bảng danh mục luận điểm & câu đối chiếu',
                icon: <ListChecks className="w-4 h-4 text-amber-500" />,
                action: () => handleInsertCatholicBlock(`<div class="scripture-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose"><div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3"><span>📜</span> DANH MỤC BẰNG CHỨNG THÁNH KINH</div><div class="space-y-3"><div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60"><span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Hòm Bia Giao Ước Mới:</span><span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">Xh 40,34-35; Lc 1,35; Kh 11,19</span></div><div class="scripture-item flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)]/60"><span class="scripture-claim font-bold text-xs text-[var(--text-main)]">Đấng Trung Gian Duy Nhất:</span><span class="scripture-refs font-mono text-xs font-bold text-amber-600 dark:text-amber-400">1Tm 2,5; Dt 9,15</span></div></div></div>`)
              },
              {
                name: '5. Thuật Ngữ Thần Học',
                desc: 'Giải nghĩa thuật ngữ kèm từ nguyên Hy Lạp/Latin',
                icon: <HelpCircle className="w-4 h-4 text-indigo-500" />,
                action: () => handleInsertCatholicBlock(`<div class="dictionary-meta my-8 p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose"><div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-black text-sm uppercase tracking-wider border-b border-[var(--border-card)] pb-3"><span>📚</span> THUẬT NGỮ GIÁO LÝ & THẦN HỌC</div><div class="space-y-3"><div class="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1"><div class="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2"><span>Theotokos</span><span class="text-[10px] font-mono text-[var(--text-muted)] font-normal">(Hy Lạp: Θεοτόκος)</span></div><p class="text-xs text-[var(--text-main)] leading-relaxed m-0">Tước hiệu Mẹ Thiên Chúa, được tuyên tín tại Công đồng Êphêsô (431) nhằm khẳng định Đức Kitô là Thiên Chúa thật và con người thật.</p></div></div></div>`)
              },
              {
                name: '6. Hình Ảnh Nghệ Thuật Thánh',
                desc: 'Ảnh kèm chú thích & hỗ trợ Lightbox phóng to',
                icon: <ImageIcon className="w-4 h-4 text-emerald-500" />,
                action: () => handleInsertCatholicBlock(`<figure class="veridu-image-block my-8 mx-auto text-center not-prose"><img src="https://images.unsplash.com/photo-1548625361-1959728b4e87?auto=format&fit=crop&w=1200&q=80" alt="Nghệ Thuật Thánh Đường" data-lightbox="true" referrerpolicy="no-referrer" class="max-w-full h-auto rounded-3xl shadow-2xl mx-auto block cursor-zoom-in hover:scale-[1.01] transition-transform duration-300 border border-[var(--border-card)]" /><figcaption class="mt-3 text-xs italic text-[var(--text-muted)] font-serif max-w-xl mx-auto">Bích họa Nghệ Thuật Thánh Đường Công Giáo — Kiệt tác nghệ thuật phụng vụ.</figcaption></figure>`)
              },
              {
                name: '7a. Video Nhúng 16:9',
                desc: 'Khung video YouTube/Vimeo tỷ lệ vàng 16:9',
                icon: <Video className="w-4 h-4 text-rose-500" />,
                action: () => handleInsertCatholicBlock(`<div class="veridu-embed-video w-full aspect-video rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-card)] my-8 bg-black relative z-10 not-prose"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" class="w-full h-full border-none" title="Video Phụng Vụ VERIDU" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`)
              },
              {
                name: '7b. Podcast Mini-Player',
                desc: 'Khung nghe âm thanh nhỏ gọn mở đầu bài viết',
                icon: <Headphones className="w-4 h-4 text-amber-500" />,
                action: () => handleInsertCatholicBlock(`<div class="veridu-embed-audio mini my-6 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--gold-border)] shadow-md not-prose"><div class="audio-header flex justify-between items-center mb-2 font-sans"><span class="audio-label text-xs font-bold text-amber-500 uppercase flex items-center gap-1.5"><span>🎧</span> BẢN NGHE AUDIO PODCAST HỌC THUẬT</span><span class="audio-badge text-xs font-mono text-[var(--text-muted)] border border-[var(--border-card)] px-2.5 py-0.5 rounded-full">Thời lượng: 12 phút</span></div><audio controls class="w-full h-10 rounded-lg"><source src="${audioUrl || 'https://example.com/podcast.mp3'}" type="audio/mpeg">Trình duyệt không hỗ trợ phát âm thanh trực tiếp.</audio></div>`)
              },
              {
                name: '7c. Podcast Full-Player',
                desc: 'Khung nghe Podcast học thuật chi tiết kèm mô tả & số tập',
                icon: <Radio className="w-4 h-4 text-indigo-500" />,
                action: () => handleInsertCatholicBlock(`<div class="veridu-embed-audio my-8 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl not-prose"><div class="audio-header flex justify-between items-center mb-3 font-sans"><div class="audio-label text-xs sm:text-sm font-bold text-amber-500 flex items-center gap-2 uppercase"><span>🎙️</span> PODCAST HỌC THUẬT: CHUYÊN ĐỀ PHỤNG VỤ</div><span class="audio-badge text-xs font-mono text-[var(--text-muted)] border border-[var(--border-card)] px-3 py-1 rounded-full">Ep #01 • 15:00 • VERIDU Audio</span></div><p class="text-xs sm:text-sm text-[var(--text-muted)] mb-3 leading-relaxed">Lắng nghe bản đọc diễn cảm học thuật và đối thoại sâu sắc về chủ đề này cùng Ban Biên Tập VERIDU.</p><audio controls class="w-full h-11 rounded-lg"><source src="${audioUrl || 'https://example.com/podcast.mp3'}" type="audio/mpeg">Trình duyệt không hỗ trợ phát âm thanh trực tiếp.</audio></div>`)
              },
              {
                name: '8. Hộp Lưu Ý & Cảnh Báo',
                desc: 'Hộp nhấn mạnh giáo lý 4 cấp phụng vụ',
                icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                action: () => handleInsertCatholicBlock(`<div class="catechetical-callout callout-important my-6 p-5 sm:p-6 border-l-4 border-amber-500 rounded-r-2xl bg-amber-500/10 text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-md space-y-1.5 not-prose"><div class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><span>⭐</span> QUAN TRỌNG: TÍN LÝ HỘI THÁNH</div><div class="text-xs sm:text-sm leading-relaxed font-serif text-[var(--text-main)]">Tín điều về Bí tích Thánh Thể là trung tâm và tột đỉnh của toàn bộ đời sống Kitô hữu (Lumen Gentium, 11).</div></div>`)
              }
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={item.action}
                className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/40 transition-all flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] group-hover:border-amber-500/30 shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[var(--text-main)] group-hover:text-amber-500 transition">
                    {item.name}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Document Outline (Mục Lục Tự Động) */}
      {rightPanelTab === 'outline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" /> Mục Lục Bài Viết
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
              {documentHeadings.length} Đề Mục
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Nhấp vào bất kỳ đề mục nào để cuộn nhanh đến vị trí đó trên bài viết:
          </p>

          {documentHeadings.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-dashed border-[var(--border-card)] text-center space-y-2">
              <ListChecks className="w-6 h-6 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">Chưa có đề mục nào</p>
              <p className="text-[10px] text-[var(--text-muted)]/70">
                Thêm thẻ tiêu đề H1, H2, H3 trong bài viết để mục lục tự động hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {documentHeadings.map((h, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToHeading(h.text)}
                  style={{ paddingLeft: `${Math.max(8, (h.level - 1) * 12 + 8)}px` }}
                  className="w-full text-left py-2 pr-2.5 rounded-xl hover:bg-amber-500/15 hover:text-amber-500 text-[var(--text-main)] transition-all text-xs font-serif flex items-center gap-2 group cursor-pointer border border-transparent hover:border-amber-500/20"
                >
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-card)] text-amber-600 dark:text-amber-400 font-bold shrink-0">
                    H{h.level}
                  </span>
                  <span className="truncate group-hover:translate-x-0.5 transition-transform flex-1">
                    {h.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: HTML File Importer & Styleguide */}
      {rightPanelTab === 'tools' && (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Nạp &amp; Chuyển Hóa Tệp .HTML
          </div>

          {uploadedFileName ? (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-300">
                <span className="truncate flex items-center gap-1">
                  <FileCode className="w-4 h-4 shrink-0" /> {uploadedFileName}
                </span>
                <span className="text-[10px] opacity-80 shrink-0">{uploadedFileSize}</span>
              </div>

              {detectedFeatures.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {detectedFeatures.map((f, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-200 border border-indigo-500/20">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Nạp tệp khác
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-dashed border-[var(--border-card)] text-center space-y-3">
              <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Kéo thả hoặc tải lên tệp <code className="px-1 py-0.5 rounded bg-[var(--bg-card)] font-mono text-[10px]">.html</code> để tự động trích xuất tiêu đề, hình ảnh và chuyển hóa thành định dạng Stained-Glass.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Chọn Tệp .HTML Từ Máy Tính
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border-card)]">
            <Link
              href="/huong-dan-viet-bai"
              target="_blank"
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 border border-[var(--border-card)] hover:border-amber-500/30 flex items-center justify-between text-xs font-serif font-bold text-[var(--text-main)] hover:text-amber-500 transition group"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Quy Chuẩn Viết Bài VERIDU</span>
              </span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-300 ${
        isDragging ? 'ring-4 ring-amber-500 ring-inset bg-amber-500/5' : ''
      }`}
    >
      
      {/* Hidden Global File Input for .HTML Files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".html,.htm,.txt" 
        className="hidden" 
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-dashed border-amber-400 max-w-md w-full space-y-4 shadow-2xl">
            <Upload className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-2xl text-white">Thả Tệp .HTML Vào Đây</h3>
            <p className="text-sm text-amber-200/80">
              Hệ thống sẽ tự động phân tích tiêu đề, bố cục và chuyển hóa thành định dạng Stained-Glass của VERIDU.
            </p>
          </div>
        </div>
      )}

      {/* 🌟 1. ELEMENTOR STUDIO TOP BAR (HEIGHT: 52px, FIXED AT TOP) */}
      <header className="h-[52px] min-h-[52px] w-full bg-[var(--bg-card)] border-b border-[var(--border-card)] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30 shadow-xs">
        
        {/* Left: Back button + Left Panel Toggle + Title + Status */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/thu-vien')}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-amber-500/15 text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer shrink-0"
            title="Quay về Thư Viện"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Left Panel Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setMobileDrawer(mobileDrawer === 'left' ? null : 'left');
              } else {
                setLeftPanelOpen(!leftPanelOpen);
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              (leftPanelOpen || mobileDrawer === 'left')
                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/30'
            }`}
            title={leftPanelOpen ? "Thu gọn Cài Đặt Bài" : "Mở Cài Đặt Bài"}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cài Đặt</span>
            {geoTimelineStatus?.valid && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã có tọa độ & dòng thời gian" />
            )}
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-card)] hidden md:block" />

          {/* Post Title & Status */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs lg:max-w-sm">
              {title || 'Biên Tập Bài Viết VERIDU'}
            </h1>
            {postId && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                #{postId}
              </span>
            )}
          </div>
        </div>

        {/* Center: TAB SWITCHER (Trực Quan | Mã Nguồn | Xem Trước) + DEVICE SWITCHER */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
            <button
              type="button"
              onClick={() => switchTab('visual')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
              title="Chế độ Soạn Thảo Trực Quan (Live Canvas)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Trực Quan</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('code')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
              title="Chế độ Mã Nguồn (HTML Code Editor)"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mã Nguồn</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('preview')}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
              title="Chế độ Xem Trước Độc Giả"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xem Trước</span>
            </button>
          </div>

          {/* Device Switcher (Desktop / Tablet / Mobile) */}
          <div className="hidden lg:flex items-center gap-0.5 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-card)]">
            <button
              type="button"
              onClick={() => setCanvasDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                canvasDevice === 'desktop' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
              title="Màn hình Máy tính (Desktop)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCanvasDevice('tablet')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                canvasDevice === 'tablet' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
              title="Máy tính bảng (Tablet 768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCanvasDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                canvasDevice === 'mobile' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold' : 'text-[var(--text-muted)] hover:text-amber-500'
              }`}
              title="Điện thoại (Mobile 375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right: Right Panel Toggle + Block Modal + Publish Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Right Panel Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setMobileDrawer(mobileDrawer === 'right' ? null : 'right');
              } else {
                setRightPanelOpen(!rightPanelOpen);
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              (rightPanelOpen || mobileDrawer === 'right')
                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/30'
            }`}
            title={rightPanelOpen ? "Thu gọn 8 Khối & Mục Lục" : "Mở Thư Viện 8 Khối & Mục Lục"}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khối &amp; Mục Lục</span>
            {documentHeadings.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">
                {documentHeadings.length}
              </span>
            )}
          </button>

          {/* Sổ Tay 8 Khối Chuẩn Modal Button */}
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 border border-[var(--border-card)] text-xs font-serif font-bold transition hidden xl:flex items-center gap-1 cursor-pointer"
            title="Mở Sổ Tay Hướng Dẫn 8 Khối Chuẩn"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Sổ Tay</span>
          </button>

          {/* Publish / Save Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-3.5 sm:px-5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 border border-amber-400/50 shrink-0"
          >
            {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? 'Đang Lưu...' : postId ? 'Lưu Thay Đổi' : 'Xuất Bản'}</span>
          </button>

        </div>
      </header>

      {/* NOTIFICATION BANNER */}
      {message && (
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shrink-0 ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-b border-emerald-500/30' 
            : 'bg-red-500/20 text-red-500 dark:text-red-300 border-b border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🌟 2. THREE-COLUMN WORKBENCH (FULL SCREEN HEIGHT, NO OVERALL WINDOW SCROLL) */}
      <div className="flex-1 flex w-full overflow-hidden relative">

        {/* ⬅️ COLUMN 1: LEFT PANEL (SETTINGS & SEO & GEO/TIMELINE) - DESKTOP */}
        <aside className={`shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-card)] flex flex-col h-full transition-all duration-300 z-20 ${
          leftPanelOpen ? 'w-80 xl:w-96' : 'w-0 overflow-hidden border-r-0'
        } hidden lg:flex`}>
          <div className="p-3 border-b border-[var(--border-card)] bg-[var(--bg-main)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Settings className="w-3.5 h-3.5" />
              <span>Thiết Lập Bài Viết &amp; SEO</span>
            </div>
            <button
              type="button"
              onClick={() => setLeftPanelOpen(false)}
              className="p-1 rounded-lg hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer"
              title="Thu gọn Cột Trái (◀)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {renderLeftPanelContent()}
          </div>
        </aside>

        {/* Mobile / Tablet Left Slide-Over Drawer */}
        {mobileDrawer === 'left' && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setMobileDrawer(null)} />
            <div className="relative w-80 max-w-[85vw] bg-[var(--bg-card)] h-full z-50 flex flex-col shadow-2xl border-r border-[var(--border-card)] animate-in slide-in-from-left duration-200">
              <div className="p-3 border-b border-[var(--border-card)] bg-[var(--bg-main)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Thiết Lập Bài Viết</span>
                </div>
                <button type="button" onClick={() => setMobileDrawer(null)} className="p-1 text-[var(--text-muted)] hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {renderLeftPanelContent()}
              </div>
            </div>
          </div>
        )}

        {/* Floating Left Expand Button (When Left Panel is Collapsed on Desktop) */}
        {!leftPanelOpen && (
          <button
            type="button"
            onClick={() => setLeftPanelOpen(true)}
            className="absolute left-3 top-4 z-20 p-2 rounded-xl bg-[var(--bg-card)] hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-[var(--border-card)] shadow-lg transition-all hidden lg:flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:scale-105 group"
            title="Mở Bảng Cài Đặt Bài Viết"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Cài Đặt</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* 🎯 COLUMN 2: CENTER CANVAS (INDEPENDENT WORKSPACE SCROLL, NO TOOLBAR OVERLAP) */}
        <main className="flex-1 h-full overflow-y-auto bg-slate-950/40 p-3 sm:p-6 lg:p-8 flex flex-col items-center relative">
          <div className={`w-full ${activeTab === 'preview' ? getDeviceWidthClass() : canvasDevice === 'mobile' ? 'max-w-[375px]' : canvasDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-4xl'} transition-all duration-300 space-y-4 pb-16`}>

            {/* Diagnostics Banner */}
            {analysisNotice && (
              <div className="w-full p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4 text-xs text-indigo-600 dark:text-indigo-300 font-medium animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{analysisNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalysisNotice(null)}
                  className="text-indigo-500 hover:text-indigo-700 dark:hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════
                MODE 1: 🎨 LIVE VISUAL CANVAS (DIRECT WYSIWYG IN-PLACE EDITING)
                ══════════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'visual' && (
              <div className="relative space-y-4">
                
                {/* Visual Canvas Info Bar */}
                <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-serif font-bold text-amber-500">Live Visual Canvas</span>
                    <span className="hidden sm:inline">— Nhấp trực tiếp vào chữ để sửa, bôi đen để định dạng.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(true)}
                    className="text-amber-500 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Chèn Khối Công Giáo</span>
                  </button>
                </div>

                {/* Stained-Glass Visual Editor Container */}
                <div className="relative rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl overflow-hidden p-6 sm:p-10 md:p-12 transition-all">
                  
                  {/* Article Category & Title Header in Canvas */}
                  <div className="border-b border-[var(--border-card)] pb-6 mb-8 text-center space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-serif text-xs font-black uppercase tracking-wider border border-amber-500/20">
                      {category}
                    </span>
                    <h1 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setTitle(e.currentTarget.textContent || '')}
                      className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-main)] leading-tight outline-none focus:ring-2 focus:ring-amber-500/40 rounded-xl px-2 py-1 transition cursor-text"
                    >
                      {title || 'Tiêu Đề Bài Viết...'}
                    </h1>
                  </div>

                  {/* 🌟 FLOATING FORMAT TOOLBAR */}
                  <FloatingFormatToolbar editorRef={visualCanvasRef} onContentChange={handleCanvasInput} />

                  {/* 🌟 WYSIWYG CONTENTEDITABLE CANVAS */}
                  <div
                    ref={visualCanvasRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleCanvasInput}
                    className="prose dark:prose-invert prose-amber max-w-none font-serif text-base sm:text-lg leading-relaxed text-[var(--text-main)] outline-none min-h-[500px] focus:ring-0 selection:bg-amber-500/30 cursor-text space-y-4"
                  />

                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════
                MODE 2: 💻 HTML CODE EDITOR
                ══════════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono text-indigo-400 font-bold">Mã Nguồn HTML</span>
                    <span>— Tự do chỉnh sửa mã nguồn HTML và các lớp CSS Stained-Glass.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchTab('visual')}
                    className="text-amber-500 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Quay lại Trực Quan ↗</span>
                  </button>
                </div>

                <div className="rounded-3xl border border-[var(--border-card)] bg-slate-950 p-4 sm:p-6 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-mono text-slate-400">article_content.html</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {contentHtml.length.toLocaleString('vi-VN')} ký tự
                    </span>
                  </div>

                  <textarea
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    rows={26}
                    className="w-full bg-transparent text-amber-200 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-y border-none p-0 focus:ring-0 selection:bg-indigo-500/40"
                    placeholder="<p>Dán mã HTML bài viết tại đây...</p>"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════════
                MODE 3: 👁️ READER VIEW PREVIEW (FULL RENDERER)
                ══════════════════════════════════════════════════════ */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="font-serif font-bold text-emerald-400">Xem Trước Độc Giả</span>
                    <span>— Bài viết hiển thị thực tế trên website sau khi xuất bản.</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl p-6 sm:p-10 md:p-12 overflow-hidden">
                  <div className="border-b border-[var(--border-card)] pb-6 mb-8 text-center space-y-3">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-serif font-black uppercase tracking-wider">
                      {category}
                    </span>
                    <h1 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[var(--text-main)] leading-tight">
                      {title || 'Tiêu Đề Bài Viết Xem Trước'}
                    </h1>
                    {excerpt && (
                      <p className="font-serif italic text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed pt-2">
                        {excerpt}
                      </p>
                    )}
                  </div>

                  <VisualArticleRenderer contentHtml={contentHtml} />
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Floating Right Expand Button (When Right Panel is Collapsed on Desktop) */}
        {!rightPanelOpen && (
          <button
            type="button"
            onClick={() => setRightPanelOpen(true)}
            className="absolute right-3 top-4 z-20 p-2 rounded-xl bg-[var(--bg-card)] hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-[var(--border-card)] shadow-lg transition-all hidden lg:flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:scale-105 group"
            title="Mở Thư Viện 8 Khối & Mục Lục"
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden xl:inline text-[11px]">8 Khối &amp; Mục Lục</span>
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}

        {/* ➡️ COLUMN 3: RIGHT PANEL (8 BLOCKS LIBRARY, OUTLINE, HTML FILE) - DESKTOP */}
        <aside className={`shrink-0 bg-[var(--bg-card)] border-l border-[var(--border-card)] flex flex-col h-full transition-all duration-300 z-20 ${
          rightPanelOpen ? 'w-80 xl:w-96' : 'w-0 overflow-hidden border-l-0'
        } hidden lg:flex`}>
          
          {/* Tabs Header */}
          <div className="border-b border-[var(--border-card)] bg-[var(--bg-main)] p-2 flex items-center justify-between shrink-0 gap-1">
            <div className="flex items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => setRightPanelTab('blocks')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  rightPanelTab === 'blocks' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
                title="8 Khối Chuẩn Công Giáo"
              >
                <BookOpen className="w-3 h-3" />
                <span>8 Khối</span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab('outline')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  rightPanelTab === 'outline' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
                title="Mục Lục Tự Động"
              >
                <ListChecks className="w-3 h-3" />
                <span>Mục Lục ({documentHeadings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab('tools')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  rightPanelTab === 'tools' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-[var(--text-muted)] hover:text-amber-500'
                }`}
                title="Nạp Tệp .HTML"
              >
                <Upload className="w-3 h-3" />
                <span>Nạp File</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRightPanelOpen(false)}
              className="p-1 rounded-lg hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 transition cursor-pointer shrink-0"
              title="Thu gọn Cột Phải (▶)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="overflow-y-auto flex-1">
            {renderRightPanelContent()}
          </div>
        </aside>

        {/* Mobile / Tablet Right Slide-Over Drawer */}
        {mobileDrawer === 'right' && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setMobileDrawer(null)} />
            <div className="relative w-80 max-w-[85vw] bg-[var(--bg-card)] h-full z-50 flex flex-col shadow-2xl border-l border-[var(--border-card)] animate-in slide-in-from-right duration-200">
              <div className="p-3 border-b border-[var(--border-card)] bg-[var(--bg-main)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>8 Khối &amp; Mục Lục</span>
                </div>
                <button type="button" onClick={() => setMobileDrawer(null)} className="p-1 text-[var(--text-muted)] hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="p-2 border-b border-[var(--border-card)] bg-[var(--bg-card)] flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('blocks')}
                  className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition ${
                    rightPanelTab === 'blocks' ? 'bg-amber-500 text-slate-950' : 'text-[var(--text-muted)]'
                  }`}
                >
                  8 Khối
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('outline')}
                  className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition ${
                    rightPanelTab === 'outline' ? 'bg-amber-500 text-slate-950' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Mục Lục ({documentHeadings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('tools')}
                  className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition ${
                    rightPanelTab === 'tools' ? 'bg-amber-500 text-slate-950' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Nạp File
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {renderRightPanelContent()}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🌟 CATHOLIC BLOCK INSERTER MODAL */}
      <CatholicBlockInserterModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onInsertHtml={handleInsertCatholicBlock}
      />

      {/* 🌟 INTERACTIVE CUSTOM MEDIA INSERTER MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-amber-500/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  {mediaModalType === 'video' ? <Video className="w-5 h-5 text-rose-500" /> : <Headphones className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[var(--text-main)]">
                    Chèn Khối Media Trực Quan
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Tùy biến URL, tiêu đề và số tập trước khi chèn vào bài viết
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOpenMediaModal('audio_mini')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  mediaModalType === 'audio_mini'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500/40'
                }`}
              >
                <Headphones className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs">Podcast Mini</span>
                <span className="text-[9px] opacity-75">Mở đầu bài</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenMediaModal('audio_full')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  mediaModalType === 'audio_full'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-indigo-500/40'
                }`}
              >
                <Radio className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-xs">Podcast Đầy Đủ</span>
                <span className="text-[9px] opacity-75">Cuối bài • Kèm Ep</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenMediaModal('video')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                  mediaModalType === 'video'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'bg-[var(--bg-main)] border-[var(--border-card)] text-[var(--text-muted)] hover:border-rose-500/40'
                }`}
              >
                <Video className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-xs">Video 16:9</span>
                <span className="text-[9px] opacity-75">YouTube / Vimeo</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--text-muted)] block mb-1">
                  {mediaModalType === 'video' ? 'Đường Dẫn Video (YouTube / Vimeo / URL)' : 'Đường Dẫn Audio (MP3 / Google Drive / URL)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={mediaModalUrl}
                  onChange={(e) => setMediaModalUrl(e.target.value)}
                  placeholder={mediaModalType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://.../podcast.mp3 hoặc link Drive'}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Tiêu Đề Khối
                  </label>
                  <input
                    type="text"
                    value={mediaModalTitle}
                    onChange={(e) => setMediaModalTitle(e.target.value)}
                    placeholder="Tiêu đề hiển thị..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Huy Hiệu / Thời Lượng
                  </label>
                  <input
                    type="text"
                    value={mediaModalBadge}
                    onChange={(e) => setMediaModalBadge(e.target.value)}
                    placeholder="Thời lượng: 12 phút / Ep #01"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {mediaModalType === 'audio_full' && (
                <div>
                  <label className="font-bold text-[var(--text-muted)] block mb-1">
                    Đoạn Giới Thiệu Ngắn (Description)
                  </label>
                  <textarea
                    value={mediaModalDesc}
                    onChange={(e) => setMediaModalDesc(e.target.value)}
                    rows={2}
                    placeholder="Mô tả tóm lược nội dung podcast..."
                    className="w-full p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-card)]">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-muted)] text-xs font-bold transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteInsertMedia}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Chèn Vào Bài Viết</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 SUCCESS PUBLISH / UPDATE MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-lg w-full p-8 border border-amber-500/40 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl text-[var(--text-main)]">
                {postId ? 'Đã Cập Nhật Bài Viết Thành Công!' : 'Đã Xuất Bản Bài Viết Thành Công!'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                Bài viết &quot;<strong className="text-amber-500">{title}</strong>&quot; đã được lưu trữ an toàn vào CSDL Supabase với trạng thái <span className="font-bold text-emerald-500">Đã xuất bản (Published)</span>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono text-amber-600 dark:text-amber-400 truncate">
              https://www.thapgia.com/{publishedSlug}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/${publishedSlug}`}
                target="_blank"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Xem Bài Viết Trực Tuyến
              </Link>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-5 py-3 bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-main)] font-bold text-xs rounded-xl border border-[var(--border-card)] transition-all cursor-pointer"
              >
                Tiếp Tục Biên Tập
              </button>

              <Link
                href="/thu-vien"
                className="w-full sm:w-auto px-5 py-3 bg-[var(--bg-main)] hover:bg-[var(--border-card)] text-[var(--text-main)] font-bold text-xs rounded-xl border border-[var(--border-card)] transition-all"
              >
                Về Thư Viện
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RESOURCE SUBMISSION MODAL */}
      <ResourceSubmissionModal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
      />

    </div>
  );
}

export default function DangBaiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-36 text-center text-amber-500 font-bold">Đang tải Trình Soạn Thảo VERIDU...</div>}>
      <DangBaiContent />
    </Suspense>
  );
}
