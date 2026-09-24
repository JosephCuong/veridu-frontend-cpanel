'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapLocation } from '@/lib/api';
import { parseScriptureReferences } from '@/lib/bibleReferenceParser';
import { matchesSearch } from '@/lib/vietnameseSearch';
import { 
  MapPin, 
  Compass, 
  Layers, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Cross, 
  Scroll, 
  Navigation, 
  Maximize2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Map as MapIcon,
  Globe,
  ZoomIn,
  ZoomOut,
  Sparkles,
  RotateCcw,
  X
} from 'lucide-react';

interface BibleMapInteractiveProps {
  initialLocations: MapLocation[];
}

type TileProvider = 'topo' | 'satellite' | 'street';

export function getTestamentMeta(testament: string) {
  if (testament === 'cuu-uoc') {
    return {
      key: 'cuu-uoc',
      label: 'Cựu Ước',
      pinColor: '#d97706',
      glowColor: 'rgba(217, 119, 6, 0.45)',
      badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      pillBg: 'border-amber-500/40 text-amber-500 bg-amber-500/10',
      symbolIcon: '📜',
      description: 'Thời kỳ Giao ước Sinai, các Ngôn sứ và Đất Hứa Canaan',
    };
  }
  if (testament === 'tan-uoc') {
    return {
      key: 'tan-uoc',
      label: 'Tân Ước',
      pinColor: '#059669',
      glowColor: 'rgba(5, 150, 105, 0.45)',
      badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      pillBg: 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10',
      symbolIcon: '✝',
      description: 'Thời kỳ Đức Kitô giáng trần, Phục Sinh và Hội Thánh Tông Đồ',
    };
  }
  return {
    key: 'ca-hai',
    label: 'Cả Hai Giao Ước',
    pinColor: '#7c3aed',
    glowColor: 'rgba(124, 58, 237, 0.45)',
    badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    pillBg: 'border-purple-500/40 text-purple-500 bg-purple-500/10',
    symbolIcon: '🌟',
    description: 'Địa danh kinh điển chuyển tiếp trung tâm (như Thánh đô Giê-ru-sa-lem)',
  };
}

export default function BibleMapInteractive({ initialLocations }: BibleMapInteractiveProps) {
  const searchParams = useSearchParams();
  const targetLocSlug = searchParams.get('loc');
  const fromArticleTitle = searchParams.get('from');
  const fromArticleSlug = searchParams.get('article');

  const [locations] = useState<MapLocation[]>(initialLocations);

  // Initial selection: prefer location specified by URL param, fallback to first
  const initialSelected = useMemo(() => {
    if (targetLocSlug) {
      const found = initialLocations.find(l => l.slug === targetLocSlug || l.id === targetLocSlug);
      if (found) return found;
    }
    return initialLocations[0] || null;
  }, [initialLocations, targetLocSlug]);

  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(initialSelected);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'cuu-uoc' | 'tan-uoc' | 'ca-hai'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [tileMode, setTileMode] = useState<TileProvider>('topo');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const tileLayerRef = useRef<any>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Extract unique regions for filter
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(l => {
      if (l.region) set.add(l.region);
    });
    return Array.from(set);
  }, [locations]);

  // Enhanced Vietnamese-tolerant Search & Filters
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // 1. Search Query using matchesSearch (Vietnamese tone & unspaced tolerant)
      if (searchQuery.trim()) {
        const searchableFields = [
          loc.name,
          loc.name_en,
          loc.name_original,
          loc.ancient_name,
          loc.meaning,
          loc.region,
          loc.era,
          ...(loc.aliases || []),
          ...(loc.bible_references || []),
        ];
        if (!matchesSearch(searchableFields, searchQuery)) {
          return false;
        }
      }

      // 2. Testament filter
      if (testamentFilter !== 'all') {
        if (loc.testament !== testamentFilter && loc.testament !== 'ca-hai') return false;
      }

      // 3. Region filter
      if (regionFilter !== 'all') {
        if (loc.region !== regionFilter) return false;
      }

      return true;
    });
  }, [locations, searchQuery, testamentFilter, regionFilter]);

  // Live Autocomplete Suggestions (top 6 matches)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    return locations
      .filter(loc => {
        const searchableFields = [
          loc.name,
          loc.name_en,
          loc.name_original,
          loc.ancient_name,
          loc.meaning,
          loc.region,
          ...(loc.aliases || []),
        ];
        return matchesSearch(searchableFields, searchQuery);
      })
      .slice(0, 6);
  }, [locations, searchQuery]);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tile layer URLs
  const getTileUrl = (provider: TileProvider) => {
    switch (provider) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri &mdash; Earthstar Geographics'
        };
      case 'street':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap & CartoDB'
        };
      case 'topo':
      default:
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri & National Geographic'
        };
    }
  };

  // Helper to render Stained-Glass markers with 3-era distinction
  const renderMarkers = useCallback((L: any, map: any, locList: MapLocation[]) => {
    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    locList.forEach((loc) => {
      const meta = getTestamentMeta(loc.testament);

      const customIcon = L.divIcon({
        className: 'custom-bible-pin',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: ${meta.glowColor};
              animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: ${meta.pinColor};
              border: 2px solid #ffffff;
              box-shadow: 0 0 14px ${meta.glowColor}, 0 4px 6px -1px rgba(0, 0, 0, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: 13px;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
              ${meta.symbolIcon}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const hasArticles = loc.article_slugs && loc.article_slugs.length > 0;
      const popupHtml = `
        <div style="font-family: serif; min-width: 210px; max-width: 270px; text-align: left; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 11px; padding: 1px 6px; border-radius: 4px; font-weight: bold; background: ${meta.pinColor}; color: #ffffff;">
              ${meta.symbolIcon} ${meta.label}
            </span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">${loc.region}</span>
          </div>
          <strong style="font-size: 15px; color: #0f172a; display: block; font-weight: 800; line-height: 1.2;">
            ${loc.name}
          </strong>
          ${loc.ancient_name ? `<span style="font-size: 11px; color: #92400e; display: block; font-style: italic; margin-top: 2px;">Cổ danh: ${loc.ancient_name}</span>` : ''}
          ${loc.meaning ? `<span style="font-size: 11px; color: #475569; font-style: italic; display: block; margin-top: 2px;">"${loc.meaning}"</span>` : ''}
          ${hasArticles ? `<div style="margin-top: 6px; display: inline-block; background: #fef3c7; color: #92400e; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #fde68a;">📜 Có ${loc.article_slugs?.length} chuyên khảo nghiên cứu</div>` : ''}
          <div style="margin-top: 8px; font-size: 11px; font-weight: bold; color: #0284c7; border-top: 1px dashed #cbd5e1; pt: 4px;">
            Nhấp để phóng to & xem hồ sơ &rarr;
          </div>
        </div>
      `;

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon })
        .bindPopup(popupHtml)
        .addTo(map);

      // On marker click: Smooth flyTo zoom in (zoom 13) and select
      marker.on('click', () => {
        handleSelectLocation(loc, true, 13);
      });

      markersRef.current[loc.slug || loc.id] = marker;
    });
  }, [selectedLocation]);

  // Handle selecting a location (FlyTo + Popup + smooth zoom)
  const handleSelectLocation = useCallback((loc: MapLocation, shouldFly = true, zoomLevel = 13) => {
    setSelectedLocation(loc);

    if (mapInstanceRef.current && shouldFly) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], zoomLevel, {
        animate: true,
        duration: 1.2,
      });

      const markerKey = loc.slug || loc.id;
      const marker = markersRef.current[markerKey];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 500);
      }
    }
  }, []);

  // Custom Zoom Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetBounds = () => {
    if (!mapInstanceRef.current || !leafletModuleRef.current) return;
    const L = leafletModuleRef.current;
    const markers = Object.values(markersRef.current);
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      mapInstanceRef.current.flyToBounds(group.getBounds(), {
        padding: [50, 50],
        duration: 1.2,
      });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;
      leafletModuleRef.current = L;

      // Avoid double initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center
      const defaultCenter: [number, number] = initialSelected 
        ? [initialSelected.latitude, initialSelected.longitude] 
        : [31.7767, 35.2345]; // Jerusalem center

      const initialZoom = targetLocSlug && initialSelected ? 13 : 9;

      const map = L.map(mapContainerRef.current!, {
        center: defaultCenter,
        zoom: initialZoom,
        zoomControl: false, // We provide custom Stained-Glass controls
        scrollWheelZoom: false, // Prevent wheel trapping on page scroll
        touchZoom: true, // Allow 2-finger zoom on mobile
      });

      const tileConfig = getTileUrl(tileMode);
      const tileLayer = L.tileLayer(tileConfig.url, {
        maxZoom: 18,
        attribution: tileConfig.attribution,
        crossOrigin: true,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Render markers
      renderMarkers(L, map, locations);

      // Multi-stage layout invalidations
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 250);
      setTimeout(() => map.invalidateSize(), 600);

      // Auto-open target location popup if requested by URL
      if (targetLocSlug && initialSelected) {
        setTimeout(() => {
          const markerKey = initialSelected.slug || initialSelected.id;
          const targetMarker = markersRef.current[markerKey];
          if (targetMarker) {
            targetMarker.openPopup();
          }
        }, 700);
      }

      // ResizeObserver
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        const resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMove: true });
          }
        });
        resizeObserver.observe(mapContainerRef.current);
        (map as any)._resizeObserver = resizeObserver;
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        const obs = (mapInstanceRef.current as any)._resizeObserver;
        if (obs) obs.disconnect();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when tileMode changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    async function updateTile() {
      const L = (await import('leaflet')).default;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const tileConfig = getTileUrl(tileMode);
      tileLayerRef.current = L.tileLayer(tileConfig.url, {
        maxZoom: 18,
        attribution: tileConfig.attribution,
        crossOrigin: true,
      }).addTo(mapInstanceRef.current);
    }

    updateTile();
  }, [tileMode]);

  // Update visible markers on map when filters change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined' || !leafletModuleRef.current) return;
    renderMarkers(leafletModuleRef.current, mapInstanceRef.current, filteredLocations);
  }, [filteredLocations, renderMarkers]);

  // Counts for each testament
  const cuuUocCount = useMemo(() => locations.filter(l => l.testament === 'cuu-uoc').length, [locations]);
  const tanUocCount = useMemo(() => locations.filter(l => l.testament === 'tan-uoc').length, [locations]);
  const caHaiCount = useMemo(() => locations.filter(l => l.testament === 'ca-hai').length, [locations]);

  return (
    <div className="space-y-6">
      
      {/* ── Breadcrumb from Article Deep-Link ── */}
      {fromArticleTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[var(--bg-card)] to-amber-500/5 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs sm:text-sm font-serif backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-500 shadow-inner">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold block">
                Khảo sát tọa độ từ chuyên khảo nghiên cứu
              </span>
              <span className="font-bold text-sm sm:text-base text-[var(--text-main)] truncate block">
                &ldquo;{decodeURIComponent(fromArticleTitle)}&rdquo;
              </span>
            </div>
          </div>
          {fromArticleSlug && (
            <Link
              href={`/${fromArticleSlug}`}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-serif transition-all shadow-md hover:scale-105 cursor-pointer"
            >
              <span>← Quay Lại Bài Viết</span>
            </Link>
          )}
        </div>
      )}

      {/* ── Top Filter & Control Panel ── */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
        
        {/* Row 1: Search Box with Live Autocomplete & Map Mode Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box with Autocomplete Dropdown */}
          <div ref={searchBoxRef} className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Tìm kiếm địa danh (gõ có dấu hoặc không dấu: gierusalem, belem, sinai, khepron...)"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all font-serif"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-amber-500 p-1 rounded-full transition"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--bg-card)]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden py-2 space-y-1 divide-y divide-[var(--border-card)]/40 max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>Gợi ý địa danh phù hợp ({searchSuggestions.length})</span>
                  <span className="text-[10px] font-normal text-[var(--text-muted)]">Nhấp để bay tới và phóng to</span>
                </div>
                {searchSuggestions.map((item) => {
                  const meta = getTestamentMeta(item.testament);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSelectLocation(item, true, 13);
                        setSearchQuery(item.name);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-amber-500/10 flex items-center justify-between gap-3 transition cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-xs text-[var(--text-main)] truncate">
                            {item.name}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${meta.badgeBg}`}>
                            {meta.symbolIcon} {meta.label}
                          </span>
                        </div>
                        {item.ancient_name && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-serif italic truncate">
                            Cổ danh: {item.ancient_name}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] block">
                          {item.region}
                        </span>
                        <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1 justify-end">
                          <span>Phóng to</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map Tile Layer Toggle Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] self-start md:self-auto overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => setTileMode('topo')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer ${
                tileMode === 'topo'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100 font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Địa Hình Cổ Điển</span>
            </button>

            <button
              onClick={() => setTileMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer ${
                tileMode === 'satellite'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100 font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Vệ Tinh Không Gian</span>
            </button>

            <button
              onClick={() => setTileMode('street')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer ${
                tileMode === 'street'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100 font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Địa Lý Tiêu Chuẩn</span>
            </button>
          </div>

        </div>

        {/* Row 2: Filter Tabs (Testaments & Regions) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-card)]">
          
          {/* Testament Tabs with Stained-Glass Era Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setTestamentFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer ${
                testamentFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 shadow-sm font-black'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              Tất Cả Địa Danh ({locations.length})
            </button>

            <button
              onClick={() => setTestamentFilter('cuu-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                testamentFilter === 'cuu-uoc'
                  ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50 shadow-sm font-black'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              <span>📜 Cựu Ước</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/10">
                {cuuUocCount + caHaiCount}
              </span>
            </button>

            <button
              onClick={() => setTestamentFilter('tan-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                testamentFilter === 'tan-uoc'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 shadow-sm font-black'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              <span>✝️ Tân Ước</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10">
                {tanUocCount + caHaiCount}
              </span>
            </button>

            <button
              onClick={() => setTestamentFilter('ca-hai')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                testamentFilter === 'ca-hai'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-sm font-black'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              <span>🌟 Cả Hai Giao Ước</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/10">
                {caHaiCount}
              </span>
            </button>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-serif font-semibold">Phân vùng:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label="Lọc theo phân vùng địa lý"
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif font-semibold text-[var(--text-main)] focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Mọi phân vùng Thánh Địa</option>
              {availableRegions.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* ── Main Map Canvas & Interactive Inspector Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Map Canvas + Location Selector List (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Map Canvas Wrapper */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-stone-950 h-[460px] sm:h-[540px] w-full z-10 group">
            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '460px' }}></div>
            
            {/* Top-Right: Custom Stained-Glass Zoom & Bounds Controls */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-xl backdrop-blur-md transition hover:scale-110 cursor-pointer"
                title="Phóng to bản đồ"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-xl backdrop-blur-md transition hover:scale-110 cursor-pointer"
                title="Thu nhỏ bản đồ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetBounds}
                className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl font-bold transition hover:scale-110 cursor-pointer"
                title="Toàn cảnh Thánh Địa (Khung nhìn bao quát)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-Left: Floating Map Legend (Chú Giải Thời Kỳ) */}
            <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-amber-500/40 p-2 sm:p-2.5 rounded-2xl shadow-2xl space-y-1.5 max-w-[280px]">
              <div className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Chú Giải Thời Kỳ Thánh Địa</span>
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-serif">
                <button
                  type="button"
                  onClick={() => setTestamentFilter('cuu-uoc')}
                  className="flex items-center gap-2 hover:bg-white/10 px-1.5 py-0.5 rounded-md transition text-left cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shadow-[0_0_8px_#d97706]"></span>
                  <span className="text-amber-200">📜 Cựu Ước ({cuuUocCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestamentFilter('tan-uoc')}
                  className="flex items-center gap-2 hover:bg-white/10 px-1.5 py-0.5 rounded-md transition text-left cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669] shadow-[0_0_8px_#059669]"></span>
                  <span className="text-emerald-200">✝️ Tân Ước ({tanUocCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestamentFilter('ca-hai')}
                  className="flex items-center gap-2 hover:bg-white/10 px-1.5 py-0.5 rounded-md transition text-left cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]"></span>
                  <span className="text-purple-200">🌟 Cả Hai Giao Ước ({caHaiCount})</span>
                </button>
              </div>
            </div>

            {/* Bottom-Right: Mobile Help Badge */}
            <div className="absolute bottom-4 right-4 z-[400] hidden sm:flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-serif font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Chạm ghim để phóng to chi tiết</span>
            </div>
          </div>

          {/* Location Quick List Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Danh Sách Địa Danh Hiển Thị ({filteredLocations.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleResetBounds}
                className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-serif cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Về góc nhìn toàn cảnh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                const meta = getTestamentMeta(loc.testament);

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc, true, 13)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 scale-[1.02] ring-1 ring-amber-500/40'
                        : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/40'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-serif font-bold text-sm leading-snug ${
                          isSelected ? 'text-amber-500' : 'text-[var(--text-main)]'
                        }`}>
                          {loc.name}
                        </h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${meta.badgeBg}`}>
                          {meta.symbolIcon} {meta.label}
                        </span>
                      </div>

                      {loc.ancient_name && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-serif italic truncate">
                          Cổ danh: {loc.ancient_name}
                        </p>
                      )}

                      {loc.summary && (
                        <p className="text-xs text-[var(--text-muted)] font-serif line-clamp-2 leading-relaxed">
                          {loc.summary}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 font-serif">
                      <span>Phóng to &amp; Định vị</span>
                      <Navigation className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Detailed Location Wiki Card (5 Columns) */}
        <div className="lg:col-span-5">
          {selectedLocation ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6 relative overflow-hidden sticky top-24">
              
              {/* Decorative Corner Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

              {/* Location Image */}
              {selectedLocation.image_url && (
                <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg">
                  <Image
                    src={selectedLocation.image_url}
                    alt={selectedLocation.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    {(() => {
                      const meta = getTestamentMeta(selectedLocation.testament);
                      return (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-md">
                          {meta.symbolIcon} {selectedLocation.era || meta.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-stone-200 font-mono bg-stone-950/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {selectedLocation.latitude.toFixed(4)}° N, {selectedLocation.longitude.toFixed(4)}° E
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Names */}
              <div className="space-y-1.5 border-b border-[var(--border-card)] pb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider font-serif">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedLocation.region}</span>
                  </div>
                  {(() => {
                    const meta = getTestamentMeta(selectedLocation.testament);
                    return (
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${meta.badgeBg}`}>
                        {meta.symbolIcon} {meta.label}
                      </span>
                    );
                  })()}
                </div>

                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                  {selectedLocation.name}
                </h2>

                {selectedLocation.name_original && (
                  <p className="font-serif text-sm text-[var(--text-muted)] italic">
                    Nguyên ngữ: {selectedLocation.name_original}
                  </p>
                )}

                {selectedLocation.ancient_name && (
                  <p className="font-serif text-xs text-amber-700 dark:text-amber-300">
                    <strong className="font-sans font-bold">Cổ danh / Khảo cổ:</strong> {selectedLocation.ancient_name}
                  </p>
                )}

                {selectedLocation.aliases && selectedLocation.aliases.length > 0 && (
                  <p className="font-serif text-xs text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap pt-0.5">
                    <strong className="font-sans font-semibold text-amber-600 dark:text-amber-400">Tên gọi khác:</strong>
                    <span>{selectedLocation.aliases.join(' • ')}</span>
                  </p>
                )}

                {selectedLocation.meaning && (
                  <p className="text-xs text-[var(--text-main)] pt-1 font-serif">
                    <strong className="text-amber-500 font-sans">Ý nghĩa danh xưng:</strong> &ldquo;{selectedLocation.meaning}&rdquo;
                  </p>
                )}
              </div>

              {/* Summary / Description */}
              <div className="space-y-2 text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-serif">
                {selectedLocation.summary && (
                  <p className="font-bold text-amber-600 dark:text-amber-400 italic">
                    &ldquo;{selectedLocation.summary}&rdquo;
                  </p>
                )}
                <div 
                  className="space-y-3 prose dark:prose-invert text-xs sm:text-sm max-w-none font-sans"
                  dangerouslySetInnerHTML={{ __html: selectedLocation.description || '' }}
                />
              </div>

              {/* Key Salvation Events */}
              {selectedLocation.events && selectedLocation.events.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
                  <h4 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Biến Cố Cứu Độ Then Chốt</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedLocation.events.map((evt, idx) => (
                      <li key={idx} className="text-xs text-[var(--text-muted)] flex items-start gap-2 font-serif">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{evt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scripture References & Citations */}
              {((selectedLocation.scriptures && selectedLocation.scriptures.length > 0) || 
                (selectedLocation.bible_references && selectedLocation.bible_references.length > 0)) && (
                <div className="space-y-3 pt-3 border-t border-[var(--border-card)]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Căn Cứ &amp; Trích Đoạn Kinh Thánh</span>
                    </h4>
                  </div>

                  {/* Dynamic Clickable Badges from bible_references */}
                  {selectedLocation.bible_references && selectedLocation.bible_references.length > 0 && (() => {
                    const parsedList = parseScriptureReferences(selectedLocation.bible_references);
                    if (parsedList.length === 0) return null;
                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {parsedList.map((ps, pIdx) => (
                            <Link
                              key={pIdx}
                              href={ps.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 border border-amber-500/25 hover:border-amber-500 font-mono text-[11px] font-bold transition-all shadow-sm"
                              title={`Đọc ${ps.label} trong Kinh Thánh`}
                            >
                              <span>📖 {ps.label}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                        {parsedList.filter(p => p.note).map((p, nIdx) => (
                          <p key={nIdx} className="text-[11px] text-[var(--text-muted)] font-serif italic pl-2 border-l border-amber-500/40">
                            <strong className="text-amber-600 dark:text-amber-400">{p.label}:</strong> {p.note}
                          </p>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Quoted Scriptures */}
                  {selectedLocation.scriptures && selectedLocation.scriptures.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {selectedLocation.scriptures.map((sc, index) => {
                        const readerUrl = `/doc-kinh-thanh/${sc.book_slug}/${sc.chapter}`;
                        return (
                          <div key={index} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
                                {sc.reference}
                              </span>
                              <Link
                                href={readerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline flex items-center gap-1 transition"
                              >
                                <span>Đọc Kinh Thánh</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <p className="font-serif italic text-xs text-[var(--text-main)] leading-relaxed">
                              &ldquo;{sc.text}&rdquo;
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Theology Meaning Box */}
              {selectedLocation.theology && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-main)] to-amber-500/5 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 font-serif">
                    <Cross className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ý Nghĩa Thần Học &amp; Biểu Tượng Cứu Độ</span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                    {selectedLocation.theology}
                  </p>
                </div>
              )}

              {/* Archaeological Evidence */}
              {selectedLocation.archaeological_evidence && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 font-serif">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dấu Tích &amp; Bằng Chứng Khảo Cổ Học</span>
                  </div>
                  <p className="font-serif text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                    {selectedLocation.archaeological_evidence}
                  </p>
                </div>
              )}

              {/* Related Theological Articles & Monographs */}
              {selectedLocation.article_slugs && selectedLocation.article_slugs.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[var(--border-card)]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <Scroll className="w-4 h-4 text-amber-500" />
                      <span>Chuyên Khảo Nghiên Cứu Tại Đây ({selectedLocation.article_slugs.length})</span>
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedLocation.article_slugs.map((slug, idx) => (
                      <Link
                        key={idx}
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <span className="text-xs font-serif font-bold text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                              {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5 truncate">
                              /{slug}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all font-serif">
                          <span>Đọc Bài</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)]">
              <Compass className="w-8 h-8 text-amber-500 opacity-50 mx-auto mb-2 animate-spin" />
              <p className="text-xs text-[var(--text-muted)] font-serif">Chọn một địa danh trên bản đồ để khám phá hồ sơ chi tiết.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
