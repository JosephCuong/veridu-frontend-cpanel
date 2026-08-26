'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapLocation } from '@/lib/api';
import { 
  MapPin, 
  Compass, 
  Layers, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Cross, 
  Scroll, 
  Calendar, 
  Navigation, 
  Maximize2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Map as MapIcon,
  Sun,
  Globe
} from 'lucide-react';

interface BibleMapInteractiveProps {
  initialLocations: MapLocation[];
}

type TileProvider = 'topo' | 'satellite' | 'street';

export default function BibleMapInteractive({ initialLocations }: BibleMapInteractiveProps) {
  const [locations] = useState<MapLocation[]>(initialLocations);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(initialLocations[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'cuu-uoc' | 'tan-uoc' | 'ca-hai'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [tileMode, setTileMode] = useState<TileProvider>('topo');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const tileLayerRef = useRef<any>(null);

  // Extract unique regions for filter
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    locations.forEach(l => {
      if (l.region) set.add(l.region);
    });
    return Array.from(set);
  }, [locations]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = loc.name.toLowerCase().includes(q);
        const matchEn = loc.name_en?.toLowerCase().includes(q);
        const matchOrig = loc.name_original?.toLowerCase().includes(q);
        const matchMeaning = loc.meaning?.toLowerCase().includes(q);
        const matchRegion = loc.region.toLowerCase().includes(q);
        const matchEra = loc.era.toLowerCase().includes(q);
        if (!matchName && !matchEn && !matchOrig && !matchMeaning && !matchRegion && !matchEra) {
          return false;
        }
      }

      // 2. Testament
      if (testamentFilter !== 'all') {
        if (loc.testament !== testamentFilter && loc.testament !== 'ca-hai') return false;
      }

      // 3. Region
      if (regionFilter !== 'all') {
        if (loc.region !== regionFilter) return false;
      }

      return true;
    });
  }, [locations, searchQuery, testamentFilter, regionFilter]);

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      // Avoid double initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const defaultCenter: [number, number] = selectedLocation 
        ? [selectedLocation.latitude, selectedLocation.longitude] 
        : [31.7767, 35.2345]; // Jerusalem center

      const map = L.map(mapContainerRef.current!, {
        center: defaultCenter,
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      const tileConfig = getTileUrl(tileMode);
      const tileLayer = L.tileLayer(tileConfig.url, {
        maxZoom: 18,
        attribution: tileConfig.attribution,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Render markers
      renderMarkers(L, map, locations);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
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
      }).addTo(mapInstanceRef.current);
    }

    updateTile();
  }, [tileMode]);

  // Helper to render golden markers
  const renderMarkers = async (L: any, map: any, locList: MapLocation[]) => {
    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    locList.forEach((loc) => {
      const isOld = loc.testament === 'cuu-uoc';
      const isNew = loc.testament === 'tan-uoc';

      const pinColor = isOld ? '#d97706' : isNew ? '#059669' : '#b45309';
      const glowColor = isOld ? 'rgba(217,119,6,0.5)' : isNew ? 'rgba(5,150,105,0.5)' : 'rgba(180,83,9,0.5)';

      const customIcon = L.divIcon({
        className: 'custom-bible-pin',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${glowColor};
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${pinColor};
              border: 2px solid #ffffff;
              box-shadow: 0 0 12px ${pinColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              ✝
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const popupHtml = `
        <div style="font-family: serif; min-width: 180px; text-align: left; padding: 4px;">
          <strong style="font-size: 14px; color: #1e293b; display: block; font-weight: bold;">${loc.name}</strong>
          <span style="font-size: 11px; color: #64748b; display: block; margin-top: 2px;">${loc.era}</span>
          ${loc.meaning ? `<span style="font-size: 11px; color: #d97706; font-style: italic; display: block; margin-top: 2px;">"${loc.meaning}"</span>` : ''}
          <div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: #0284c7;">Nhấp để xem hồ sơ chi tiết &rarr;</div>
        </div>
      `;

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon })
        .bindPopup(popupHtml)
        .addTo(map);

      marker.on('click', () => {
        handleSelectLocation(loc, false);
      });

      markersRef.current[loc.slug] = marker;
    });
  };

  // Update visible markers on map when filters change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      renderMarkers(L, mapInstanceRef.current, filteredLocations);
    }

    updateMarkers();
  }, [filteredLocations]);

  // Handle selecting a location (FlyTo + Popup)
  const handleSelectLocation = (loc: MapLocation, shouldFly = true) => {
    setSelectedLocation(loc);

    if (mapInstanceRef.current && shouldFly) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 12, {
        animate: true,
        duration: 1.2,
      });

      const marker = markersRef.current[loc.slug];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ── Top Filter & Control Panel ── */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
        
        {/* Row 1: Search Box & Map Mode Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm địa danh Kinh Thánh (Giê-ru-sa-lem, Bê-lem, Sinai, Nadarét...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-amber-500 px-2 py-1"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Map Tile Layer Toggle Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] self-start md:self-auto overflow-x-auto scrollbar-none">
            
            <button
              onClick={() => setTileMode('topo')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tileMode === 'topo'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Địa Hình Cổ Điển</span>
            </button>

            <button
              onClick={() => setTileMode('satellite')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tileMode === 'satellite'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Vệ Tinh Không Gian</span>
            </button>

            <button
              onClick={() => setTileMode('street')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tileMode === 'street'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
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
          
          {/* Testament Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setTestamentFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                testamentFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              Tất Cả Địa Danh ({locations.length})
            </button>

            <button
              onClick={() => setTestamentFilter('cuu-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                testamentFilter === 'cuu-uoc'
                  ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              📜 Cựu Ước ({locations.filter(l => l.testament === 'cuu-uoc' || l.testament === 'ca-hai').length})
            </button>

            <button
              onClick={() => setTestamentFilter('tan-uoc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                testamentFilter === 'tan-uoc'
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-card)]'
              }`}
            >
              ✝️ Tân Ước ({locations.filter(l => l.testament === 'tan-uoc' || l.testament === 'ca-hai').length})
            </button>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-semibold">Phân vùng:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label="Lọc theo phân vùng địa lý"
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-amber-500/50"
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
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-stone-950 h-[420px] sm:h-[500px] w-full z-10">
            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '420px' }}></div>
            
            {/* Overlay Map Help Badge */}
            <div className="absolute top-4 right-4 z-[400] bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Chạm hoặc nhấp vào ghim để định vị</span>
            </div>
          </div>

          {/* Location Quick List Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Danh Sách Địa Danh ({filteredLocations.length})</span>
              </h3>
              <span className="text-xs text-[var(--text-muted)]">Nhấp để bay tới vị trí</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                const isOld = loc.testament === 'cuu-uoc';

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc, true)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 scale-[1.02]'
                        : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-serif font-bold text-sm truncate ${
                          isSelected ? 'text-amber-500' : 'text-[var(--text-main)]'
                        }`}>
                          {loc.name}
                        </h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isOld
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {loc.region}
                        </span>
                      </div>

                      {loc.name_original && (
                        <p className="text-xs text-[var(--text-muted)] italic font-serif truncate">
                          {loc.name_original}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <span>Định vị trên bản đồ</span>
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
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-md">
                      {selectedLocation.era}
                    </span>
                    <span className="text-xs text-stone-200 font-mono bg-stone-950/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {selectedLocation.latitude.toFixed(4)}° N, {selectedLocation.longitude.toFixed(4)}° E
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Names */}
              <div className="space-y-1 border-b border-[var(--border-card)] pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedLocation.region}</span>
                </div>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                  {selectedLocation.name}
                </h2>
                {selectedLocation.name_original && (
                  <p className="font-serif text-sm text-[var(--text-muted)] italic">
                    {selectedLocation.name_original}
                  </p>
                )}
                {selectedLocation.meaning && (
                  <p className="text-xs text-[var(--text-main)] pt-1">
                    <strong className="text-amber-500">Ý nghĩa danh xưng:</strong> {selectedLocation.meaning}
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
                      <li key={idx} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{evt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scripture Treasury Quotes */}
              {selectedLocation.scriptures && selectedLocation.scriptures.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[var(--border-card)]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Trích Đoạn Kinh Thánh</span>
                    </h4>
                  </div>

                  <div className="space-y-3">
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
                </div>
              )}

              {/* Theology Meaning Box */}
              {selectedLocation.theology && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-main)] to-amber-500/5 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Cross className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ý Nghĩa Thần Học &amp; Biểu Tượng Cứu Độ</span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                    {selectedLocation.theology}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)]">
              <Compass className="w-8 h-8 text-amber-500 opacity-50 mx-auto mb-2 animate-spin" />
              <p className="text-xs text-[var(--text-muted)]">Chọn một địa danh trên bản đồ để khám phá hồ sơ chi tiết.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
