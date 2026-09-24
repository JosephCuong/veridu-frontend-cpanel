'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapLocation, TimelineEventData } from '@/lib/api';
import { parseScriptureReferences } from '@/lib/bibleReferenceParser';
import { 
  MapPin, 
  Clock, 
  Compass, 
  ExternalLink, 
  BookOpen, 
  Layers, 
  Search, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  Landmark,
  Quote
} from 'lucide-react';
import { getTestamentMeta } from '@/components/BibleMapInteractive';

interface ArticleGeoTimelineWidgetProps {
  locations?: MapLocation[];
  timelineEvents?: TimelineEventData[];
  articleTitle?: string;
  articleSlug?: string;
}

// Leaflet map component (rendered only in browser)
function MiniMap({ 
  locations,
  articleTitle,
  articleSlug
}: { 
  locations: MapLocation[];
  articleTitle?: string;
  articleSlug?: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string | number, any>>(new Map());
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(locations[0] || null);
  const [tileMode, setTileMode] = useState<'topo' | 'satellite'>('topo');

  // Helper for deep-linking
  const buildMapUrl = (locSlug?: string | number) => {
    const params = new URLSearchParams();
    if (locSlug !== undefined && locSlug !== null && locSlug !== '') {
      params.set('loc', String(locSlug));
    }
    if (articleTitle) params.set('from', articleTitle);
    if (articleSlug) params.set('article', articleSlug);
    return `/ban-do?${params.toString()}`;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || locations.length === 0) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletRef.current = L;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersMapRef.current.clear();
      }

      // Fix default marker icon issues in Leaflet with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Default center: average of locations
      const avgLat = locations.reduce((sum, l) => sum + l.latitude, 0) / locations.length;
      const avgLng = locations.reduce((sum, l) => sum + l.longitude, 0) / locations.length;

      const map = L.map(mapContainerRef.current, {
        center: [avgLat, avgLng],
        zoom: 7,
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;

      // Initial Tile Layer: Esri World Topo Map
      const initialLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &mdash; National Geographic',
        maxZoom: 18,
        crossOrigin: true,
      }).addTo(map);
      tileLayerRef.current = initialLayer;

      // Create custom pulse marker icon with 3-era distinction
      const createCustomIcon = (loc: MapLocation, isSelected: boolean) => {
        const meta = getTestamentMeta(loc.testament);
        const displayName = loc.name.split('(')[0].trim();
        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
              <div style="background: ${meta.pinColor}; box-shadow: 0 0 12px ${meta.glowColor}; border: 2px solid #ffffff;" class="w-8 h-8 rounded-full ${isSelected ? 'scale-125 ring-4 ring-amber-500/50' : ''} flex items-center justify-center text-white font-bold text-xs shadow-2xl transition-all duration-300">
                ${meta.symbolIcon}
              </div>
              <div class="absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-950/90 text-amber-300 text-[10px] font-bold border border-amber-500/40 shadow-lg pointer-events-none">
                ${displayName}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
      };

      const markersGroup = L.featureGroup();
      markersMapRef.current.clear();

      locations.forEach((loc) => {
        const meta = getTestamentMeta(loc.testament);
        const marker = L.marker([loc.latitude, loc.longitude], {
          icon: createCustomIcon(loc, false),
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; max-width: 250px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
              <span style="font-size: 10px; padding: 1px 5px; border-radius: 4px; font-weight: bold; background: ${meta.pinColor}; color: #ffffff;">
                ${meta.symbolIcon} ${meta.label}
              </span>
              <span style="font-size: 10px; color: #64748b; font-weight: 600;">${loc.region}</span>
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #b45309; margin-bottom: 2px;">${loc.name}</div>
            ${loc.ancient_name ? `<div style="font-style: italic; color: #64748b; margin-bottom: 4px;">Tên cổ: ${loc.ancient_name}</div>` : ''}
            <p style="margin: 4px 0 6px; line-height: 1.4; color: #334155;">${loc.description || loc.summary || ''}</p>
            ${loc.bible_references && loc.bible_references.length > 0 ? `
              <div style="margin-top: 4px; font-weight: bold; color: #0369a1;">
                📖 Kinh Thánh: ${loc.bible_references.join(', ')}
              </div>` : ''}
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
              <a href="${buildMapUrl(loc.slug || loc.id)}" style="color: #0284c7; font-weight: bold; font-size: 11px; text-decoration: none;">
                Mở trên Bản Đồ Lớn 3D &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedLoc(loc);
          map.flyTo([loc.latitude, loc.longitude], 10, { duration: 1 });
        });
        markersGroup.addLayer(marker);
        markersMapRef.current.set(loc.id, marker);
      });

      markersGroup.addTo(map);

      // Fit map bounds to show all markers with padding
      if (locations.length > 1) {
        map.fitBounds(markersGroup.getBounds(), { padding: [40, 40], maxZoom: 10 });
      } else if (locations.length === 1) {
        map.setView([locations[0].latitude, locations[0].longitude], 8);
      }

      // Robust multi-stage layout invalidation to guarantee full container coverage
      const t1 = setTimeout(() => map.invalidateSize(), 50);
      const t2 = setTimeout(() => map.invalidateSize(), 250);
      const t3 = setTimeout(() => map.invalidateSize(), 600);

      // Auto-adapt on any container resize or viewport change
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMove: true });
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      (map as any)._cleanupTimers = [t1, t2, t3];
      (map as any)._resizeObserver = resizeObserver;
    });

    const markersMap = markersMapRef.current;
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        const obs = (mapInstanceRef.current as any)._resizeObserver;
        if (obs) obs.disconnect();
        const timers = (mapInstanceRef.current as any)._cleanupTimers;
        if (Array.isArray(timers)) timers.forEach(clearTimeout);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersMap.clear();
      }
    };
  }, [locations]);

  // Switch Tile Layer: Topo vs Satellite
  const handleToggleTileMode = (newMode: 'topo' | 'satellite') => {
    if (newMode === tileMode || !mapInstanceRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (newMode === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 18,
        crossOrigin: true,
      }).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &mdash; National Geographic',
        maxZoom: 18,
        crossOrigin: true,
      }).addTo(map);
    }

    setTileMode(newMode);
    setTimeout(() => map.invalidateSize(), 50);
  };

  // Function to pan to a specific location and open popup
  const handleSelectLocation = (loc: MapLocation) => {
    setSelectedLoc(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 10, { duration: 1.2 });
      const marker = markersMapRef.current.get(loc.id);
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Display Frame */}
      <div className="relative w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-inner bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Top-Left: Tile Mode Switcher (Topo / Satellite) */}
        <div className="absolute top-3 left-3 z-20 flex items-center p-1 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleToggleTileMode('topo')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer ${
              tileMode === 'topo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Địa Hình Cổ</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleTileMode('satellite')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer ${
              tileMode === 'satellite'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🛰️ Vệ Tinh</span>
          </button>
        </div>

        {/* Top-Right: Quick Action Link to Main Map */}
        <div className="absolute top-3 right-3 z-20">
          <Link
            href={buildMapUrl(selectedLoc?.slug || selectedLoc?.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-amber-400 text-xs font-serif font-bold border border-amber-500/40 shadow-xl backdrop-blur transition hover:scale-105"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mở Trên Bản Đồ Lớn 3D</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Location Cards Carousel / Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {locations.map((loc) => {
          const isSelected = selectedLoc?.id === loc.id;
          const meta = getTestamentMeta(loc.testament);

          return (
            <div
              key={loc.id}
              onClick={() => handleSelectLocation(loc)}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[var(--text-main)] line-clamp-1">
                    {loc.name}
                  </span>
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-500' : 'text-[var(--text-muted)]'}`} />
                </div>

                {loc.ancient_name && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-serif italic mb-1">
                    Tên cổ: {loc.ancient_name}
                  </div>
                )}

                <p className="text-[11px] text-[var(--text-muted)] font-serif line-clamp-2 leading-relaxed mb-2">
                  {loc.description || loc.summary || ''}
                </p>

                {loc.bible_references && loc.bible_references.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {loc.bible_references.map((ref, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Era Badge + Direct Link to Large Map */}
              <div className="pt-2 mt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[11px]">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                  {meta.symbolIcon} {meta.label}
                </span>

                <Link
                  href={buildMapUrl(loc.slug || loc.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-serif font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline transition"
                >
                  <span>Bản Đồ 3D</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArticleGeoTimelineWidget({
  locations = [],
  timelineEvents = [],
  articleTitle = 'bài viết',
  articleSlug = ''
}: ArticleGeoTimelineWidgetProps) {
  const hasLocations = locations.length > 0;
  const hasTimeline = timelineEvents.length > 0;
  const [activeTab, setActiveTab] = useState<'map' | 'timeline'>(hasLocations ? 'map' : 'timeline');

  // Trigger Leaflet invalidateSize when switching back to map tab
  useEffect(() => {
    if (activeTab === 'map') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // If article has neither geo nor timeline data, do not render
  if (!hasLocations && !hasTimeline) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-card)] space-y-6">
      
      {/* Widget Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[var(--bg-card)] to-indigo-500/5 border border-amber-500/30 shadow-md">
        <div className="space-y-1">
          <h3 className="font-serif font-black text-lg sm:text-xl text-[var(--text-main)]">
            Không Gian Địa Lý &amp; Tiến Trình Lịch Sử Cứu Độ
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-serif">
            Khám phá tọa độ Thánh Địa và các mốc thời gian liên quan trực tiếp đến nội dung nghiên cứu.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] shrink-0 self-start sm:self-auto">
          {hasLocations && (
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Địa Danh ({locations.length})</span>
            </button>
          )}

          {hasTimeline && (
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Dòng Thời Gian ({timelineEvents.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: BẢN ĐỒ ĐỊA DANH THÁNH ĐỊA
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'map' && hasLocations && (
        <ArticleMapSection 
          locations={locations} 
          articleTitle={articleTitle} 
          articleSlug={articleSlug} 
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: TIẾN TRÌNH DÒNG THỜI GIAN LỊCH SỬ CỨU ĐỘ
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && hasTimeline && (
        <ArticleTimelineSection timelineEvents={timelineEvents} />
      )}

    </section>
  );
}

// ─── STANDALONE SECTION EXPORTS (FOR VERIDU SCHOLARLY PLACEHOLDERS) ───────────
export function ArticleMapSection({ 
  locations,
  articleTitle,
  articleSlug
}: { 
  locations: MapLocation[];
  articleTitle?: string;
  articleSlug?: string;
}) {
  if (!locations || locations.length === 0) return null;
  return (
    <div className="veridu-map-mounted my-8 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 not-prose">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
        <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
          <Compass className="w-4 h-4" />
          <span>Bản Đồ Tọa Độ Khảo Cổ &amp; Địa Danh Thánh Địa ({locations.length})</span>
        </span>
      </div>
      <MiniMap 
        locations={locations} 
        articleTitle={articleTitle} 
        articleSlug={articleSlug} 
      />
    </div>
  );
}

export function ArticleTimelineSection({ timelineEvents }: { timelineEvents: TimelineEventData[] }) {
  if (!timelineEvents || timelineEvents.length === 0) return null;
  return (
    <div className="veridu-timeline-mounted my-8 p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6 not-prose">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-card)]">
        <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Trục Thời Gian Lịch Sử Cứu Độ ({timelineEvents.length} mốc thời gian)</span>
        </span>

        <Link
          href="/lich-su"
          className="inline-flex items-center gap-1 text-xs font-serif font-bold text-amber-500 hover:underline"
        >
          <span>Xem Dòng Thời Gian Lịch Sử Đầy Đủ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-amber-500/30 ml-2">
        {timelineEvents.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-[var(--bg-card)] shadow-md group-hover:scale-125 transition-transform" />

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-xs space-y-2.5 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
                  ⏳ {evt.year_label}
                </span>

                {evt.biblical_anchor && (() => {
                  const parsed = parseScriptureReferences(evt.biblical_anchor);
                  if (parsed.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-1">
                        {parsed.map((p, pIdx) => (
                          <Link
                            key={pIdx}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500 text-indigo-400 hover:text-slate-950 border border-indigo-500/30 font-mono font-bold text-xs flex items-center gap-1 transition-all"
                            title={`Đọc ${p.label} trong Kinh Thánh`}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>{p.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </Link>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{evt.biblical_anchor}</span>
                    </span>
                  );
                })()}
              </div>

              <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
                {evt.title}
              </h4>

              {evt.archaeological_anchor && (
                <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] font-serif">
                  <Landmark className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Bằng chứng khảo cổ:</strong> {evt.archaeological_anchor}</span>
                </div>
              )}

              {evt.significance && (
                <div className="pt-2 border-t border-[var(--border-card)] flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300/90 font-serif italic leading-relaxed">
                  <Quote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{evt.significance}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
