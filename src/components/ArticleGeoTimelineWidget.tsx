'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapLocation, TimelineEventData } from '@/lib/api';
import { 
  MapPin, 
  Clock, 
  Compass, 
  ExternalLink, 
  BookOpen, 
  Layers, 
  Sparkles, 
  Search, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  Landmark,
  Quote
} from 'lucide-react';

interface ArticleGeoTimelineWidgetProps {
  locations?: MapLocation[];
  timelineEvents?: TimelineEventData[];
  articleTitle?: string;
}

// Leaflet map component (rendered only in browser)
function MiniMap({ locations }: { locations: MapLocation[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(locations[0] || null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || locations.length === 0) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
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

      // OpenStreetMap Terrain / CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create custom pulse marker icon
      const createCustomIcon = (name: string, isSelected: boolean) => {
        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
              <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-amber-500 text-slate-950 scale-125 ring-4 ring-amber-500/40' : 'bg-slate-900 text-amber-400 border-2 border-amber-500'} flex items-center justify-center shadow-2xl transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-950/90 text-amber-300 text-[10px] font-bold border border-amber-500/40 shadow-lg pointer-events-none">
                ${name}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
      };

      const markersGroup = L.featureGroup();

      locations.forEach((loc) => {
        const marker = L.marker([loc.latitude, loc.longitude], {
          icon: createCustomIcon(loc.name.split('(')[0].trim(), false),
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; max-width: 240px; padding: 4px;">
            <div style="font-weight: 800; font-size: 13px; color: #b45309; margin-bottom: 2px;">${loc.name}</div>
            ${loc.ancient_name ? `<div style="font-style: italic; color: #64748b; margin-bottom: 4px;">Tên cổ: ${loc.ancient_name}</div>` : ''}
            <p style="margin: 4px 0 6px; line-height: 1.4; color: #334155;">${loc.description || loc.summary || ''}</p>
            ${loc.bible_references && loc.bible_references.length > 0 ? `
              <div style="margin-top: 4px; font-weight: bold; color: #0369a1;">
                📖 Kinh Thánh: ${loc.bible_references.join(', ')}
              </div>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedLoc(loc));
        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);

      // Fit map bounds to show all markers with padding
      if (locations.length > 1) {
        map.fitBounds(markersGroup.getBounds(), { padding: [40, 40], maxZoom: 10 });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations]);

  // Function to pan to a specific location
  const handleSelectLocation = (loc: MapLocation) => {
    setSelectedLoc(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 10, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Leaflet CSS Link */}
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
        crossOrigin="" 
      />

      {/* Map Display Frame */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Action */}
        <div className="absolute top-3 right-3 z-20">
          <Link
            href="/ban-do"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-amber-400 text-xs font-serif font-bold border border-amber-500/40 shadow-lg backdrop-blur transition hover:scale-105"
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
          return (
            <button
              key={loc.id}
              onClick={() => handleSelectLocation(loc)}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/50'
              }`}
            >
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
                <div className="flex flex-wrap gap-1">
                  {loc.bible_references.map((ref, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ArticleGeoTimelineWidget({
  locations = [],
  timelineEvents = [],
  articleTitle = 'bài viết'
}: ArticleGeoTimelineWidgetProps) {
  const hasLocations = locations.length > 0;
  const hasTimeline = timelineEvents.length > 0;
  const [activeTab, setActiveTab] = useState<'map' | 'timeline'>(hasLocations ? 'map' : 'timeline');

  // If article has neither geo nor timeline data, do not render
  if (!hasLocations && !hasTimeline) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-card)] space-y-6">
      
      {/* Widget Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[var(--bg-card)] to-indigo-500/5 border border-amber-500/30 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-serif font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Tư Liệu Trực Quan Bổ Trợ</span>
          </div>
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
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>Vị Trí Các Điểm Địa Lý Trong Bài Nghiên Cứu</span>
            </span>
          </div>

          <MiniMap locations={locations} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: TIẾN TRÌNH DÒNG THỜI GIAN LỊCH SỬ CỨU ĐỘ
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && hasTimeline && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-card)]">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Trục Thời Gian Lịch Sử Cứu Độ Qua Các Thời Kỳ</span>
            </span>

            <Link
              href="/lich-su"
              className="inline-flex items-center gap-1 text-xs font-serif font-bold text-amber-500 hover:underline"
            >
              <span>Xem Dòng Thời Gian Lịch Sử Đầy Đủ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Chronological Timeline List */}
          <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-amber-500/30 ml-2">
            {timelineEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="relative group">
                
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-[var(--bg-card)] shadow-md group-hover:scale-125 transition-transform" />

                <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-xs space-y-2.5 transition-all">
                  
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
                      ⏳ {evt.year_label}
                    </span>

                    {evt.biblical_anchor && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{evt.biblical_anchor}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
                    {evt.title}
                  </h4>

                  {/* Archaeological Anchor */}
                  {evt.archaeological_anchor && (
                    <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] font-serif">
                      <Landmark className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Bằng chứng khảo cổ:</strong> {evt.archaeological_anchor}</span>
                    </div>
                  )}

                  {/* Theological Significance */}
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
      )}

    </section>
  );
}
