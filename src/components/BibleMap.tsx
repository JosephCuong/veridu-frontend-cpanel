'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation2, Compass, AlertCircle, Maximize2, BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export interface BibleLocation {
  id: string;
  nameVi: string;
  nameEn: string;
  era: 'Cựu Ước' | 'Tân Ước' | 'Truyền Giáo' | string;
  coords: [number, number]; // lat, lng
  description: string;
  scripture: string;
  verseText: string;
  imageUrl?: string;
}

export const BIBLE_LOCATIONS: BibleLocation[] = [
  {
    id: 'loc-1',
    nameVi: 'Giê-ru-sa-lem (Jerusalem)',
    nameEn: 'Jerusalem',
    era: 'Tân Ước',
    coords: [31.7683, 35.2137],
    description: 'Thánh đô Giê-ru-sa-lem — Nơi Đức Giêsu chịu Khổ Nạn, Tử Nạn và Phục Sinh huy hoàng. Trung tâm tôn giáo của Cựu Ước và Tân Ước.',
    scripture: 'Lc 24, 46-48',
    verseText: 'Đấng Ki-tô phải chịu khổ hình, rồi ngày thứ ba từ cõi chết sống lại.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc-2',
    nameVi: 'Bê-lem (Bethlehem)',
    nameEn: 'Bethlehem',
    era: 'Tân Ước',
    coords: [31.7054, 35.2024],
    description: 'Nơi Ngôi Hai Thiên Chúa Giáng Sinh làm người trong máng cỏ khiêm nhường. Thành phố quê hương của Vua Đa-vít.',
    scripture: 'Mt 2, 1-2',
    verseText: 'Khi Đức Giê-su ra đời tại Bê-lem, miền Giu-đê, thời vua Hê-rô-đê trị vì...',
    imageUrl: 'https://images.unsplash.com/photo-1549471013-3364d7220b75?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc-3',
    nameVi: 'Na-da-rét (Nazareth)',
    nameEn: 'Nazareth',
    era: 'Tân Ước',
    coords: [32.7019, 35.3033],
    description: 'Nơi Sứ thần Truyền tin cho Đức Maria và là quê hương Thánh Gia Thất nơi Đức Giêsu lớn lên.',
    scripture: 'Lc 1, 26-28',
    verseText: 'Sứ thần Giai-bri-en được Thiên Chúa sai đến một thành miền Ga-li-lê, gọi là Na-da-rét.',
    imageUrl: 'https://images.unsplash.com/photo-1616174780562-b91a78e72322?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc-4',
    nameVi: 'Biển Hồ Ga-li-lê (Sea of Galilee)',
    nameEn: 'Sea of Galilee',
    era: 'Tân Ước',
    coords: [32.8333, 35.5833],
    description: 'Nơi Đức Giêsu kêu gọi các Tông đồ đầu tiên (Phê-rô, An-rê, Gia-cô-bê, Gio-an) và thực hiện nhiều phép lạ biến đổi cuộc đời.',
    scripture: 'Mt 4, 18-20',
    verseText: 'Người đi dọc theo biển hồ Ga-li-lê, thấy hai anh em... Người bảo các ông: "Hãy theo tôi."'
  },
  {
    id: 'loc-5',
    nameVi: 'Núi Si-nai (Mount Sinai)',
    nameEn: 'Mount Sinai',
    era: 'Cựu Ước',
    coords: [28.5394, 33.9753],
    description: 'Nơi Thiên Chúa ban Mười Điều Rút (Thập Giới) cho ông Mô-sê và lập Giao ước với Dân Chúa trong sa mạc.',
    scripture: 'Xn 19, 16-19',
    verseText: 'Sáng ngày thứ ba, có sấm sét và mây mù bao phủ trên núi, cùng với tiếng tù và thổi rất mạnh.'
  },
  {
    id: 'loc-6',
    nameVi: 'Ai Cập (Egypt - Goshen)',
    nameEn: 'Egypt',
    era: 'Cựu Ước',
    coords: [29.9792, 31.1342],
    description: 'Nơi dân Is-ra-en cư ngụ thời Tổ phụ Giu-se và sau đó chịu kiếp nô lệ trước khi được Mô-sê dẫn dắt Xuất Hành.',
    scripture: 'St 46, 1-4',
    verseText: 'Đừng sợ xuống Ai Cập, vì tại đó Ta sẽ làm cho ngươi thành một dân tộc lớn.'
  },
  {
    id: 'loc-7',
    nameVi: 'Ba-by-lon (Babylon)',
    nameEn: 'Babylon',
    era: 'Cựu Ước',
    coords: [32.5363, 44.4208],
    description: 'Nơi Dân Is-ra-en bị lưu tày sau khi Giê-ru-sa-lem thất thủ. Thời kỳ thử thách niềm tin và khơi nguồn niềm hy vọng Đấng Cứu Thế.',
    scripture: 'Tv 137, 1-2',
    verseText: 'Bên bờ sông Ba-by-lon, ta ngồi ta khóc khi nhớ xiết bao Kỷ niệm Si-on.'
  },
  {
    id: 'loc-8',
    nameVi: 'Rô-ma (Rome)',
    nameEn: 'Rome',
    era: 'Truyền Giáo',
    coords: [41.9028, 12.4964],
    description: 'Trung tâm truyền giáo thời Hội Thánh Sơ Khai — Nơi Thánh Phê-rô và Thánh Pha-olô làm chứng nhân tử đạo cho Tin Mừng.',
    scripture: 'Cv 28, 30-31',
    verseText: 'Suốt hai năm tròn, ông Pha-olô ở lại... giảng dạy về Nước Thiên Chúa một cách tự do.'
  }
];

export default function BibleMap() {
  const [locations, setLocations] = useState<BibleLocation[]>(BIBLE_LOCATIONS);
  const [selectedLoc, setSelectedLoc] = useState<BibleLocation>(BIBLE_LOCATIONS[0]);
  const [filterEra, setFilterEra] = useState<string>('Tất cả');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase.from('map_locations').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setLocations(data);
          setSelectedLoc(data[0]);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu Bản đồ:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, []);

  const filteredLocations = filterEra === 'Tất cả' 
    ? locations 
    : locations.filter(l => l.era === filterEra);

  return (
    <div className="w-full space-y-6">
      
      {/* Era Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Bản Đồ Địa Danh Lịch Sử Cứu Độ</span>
        </div>

        <div className="flex items-center gap-2">
          {['Tất cả', 'Cựu Ước', 'Tân Ước', 'Truyền Giáo'].map((era) => (
            <button
              key={era}
              onClick={() => setFilterEra(era)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterEra === era
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Location Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List of Locations */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)]">
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-32 bg-[var(--border-card)] rounded"></div>
                    <div className="h-4 w-12 bg-[var(--border-card)] rounded"></div>
                  </div>
                  <div className="h-3 w-full bg-[var(--border-card)] rounded mb-1"></div>
                  <div className="h-3 w-4/5 bg-[var(--border-card)] rounded"></div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filteredLocations.map((loc) => {
            const isSelected = loc.id === selectedLoc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 shadow-lg shadow-amber-500/5 font-bold' 
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-main)] hover:border-amber-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif font-bold text-sm text-[var(--text-main)]">{loc.nameVi}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    {loc.era}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{loc.description}</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                  <MapPin className="w-3 h-3" /> Xem chi tiết địa danh &rarr;
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Location Card / Interactive Map Canvas */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{selectedLoc.era}</span>
                <h2 className="font-serif font-black text-2xl text-[var(--text-main)] mt-1">{selectedLoc.nameVi}</h2>
                <span className="text-xs text-[var(--text-muted)]">Tọa độ: {selectedLoc.coords[0]}° N, {selectedLoc.coords[1]}° E</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            {selectedLoc.imageUrl && (
              <div className="w-full h-64 rounded-xl overflow-hidden border border-[var(--border-card)] shadow-inner">
                <img src={selectedLoc.imageUrl} alt={selectedLoc.nameVi} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            )}

            <p className="text-[var(--text-main)] text-sm leading-relaxed">{selectedLoc.description}</p>

            {/* Scripture Verse Quote Card */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <BookOpen className="w-4 h-4" /> Trích Đoạn Kinh Thánh Liên Quan: <strong>{selectedLoc.scripture}</strong>
              </div>
              <p className="font-serif italic text-[var(--text-main)] text-sm leading-relaxed">
                "{selectedLoc.verseText}"
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Hệ Thống Trực Quan Hóa Địa Danh Kinh Thánh VERIDU</span>
            <a 
              href={`https://thapgia.com/doc-kinh-thanh/`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-md"
            >
              <span>Đọc Đoạn Kinh Thánh Này</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
